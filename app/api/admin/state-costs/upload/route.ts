import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a CSV file." },
        { status: 400 }
      );
    }

    // Read and parse CSV
    const csvText = await file.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json(
        { error: "CSV file must contain at least a header row and one data row." },
        { status: 400 }
      );
    }

    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Validate required headers
    const requiredHeaders = ['State', 'Category', 'Item', 'Rate % of Wage'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required headers: ${missingHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    // Parse data rows
    const dataRows = lines.slice(1)
      .filter(line => line.trim())
      .map((line, index) => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const row: any = {};
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        row._rowNumber = index + 2; // For error reporting
        return row;
      })
      .filter(row => row.State && row.Category && row.Item); // Filter out empty rows

    if (dataRows.length === 0) {
      return NextResponse.json(
        { error: "No valid data rows found in CSV." },
        { status: 400 }
      );
    }

    // Validate data and prepare for database
    const validRows: Array<{
      state: string;
      category: string;
      item: string;
      ratePercent: number;
      employerCostUSD: number;
      notes: string | null;
      source: string | null;
    }> = [];
    const errors: string[] = [];

    for (const row of dataRows) {
      try {
        // Validate required fields
        if (!row.State || !row.Category || !row.Item || !row['Rate % of Wage']) {
          errors.push(`Row ${row._rowNumber}: Missing required fields`);
          continue;
        }

        // Validate rate percentage
        const ratePercent = parseFloat(row['Rate % of Wage']);
        if (isNaN(ratePercent) || ratePercent < 0 || ratePercent > 100) {
          errors.push(`Row ${row._rowNumber}: Invalid rate percentage (must be 0-100)`);
          continue;
        }

        // Validate optional fields
        const employerCostUSD = row['Cost (USD) (Optional)'] ? parseFloat(row['Cost (USD) (Optional)']) : 0;
        if (row['Cost (USD) (Optional)'] && (isNaN(employerCostUSD) || employerCostUSD < 0)) {
          errors.push(`Row ${row._rowNumber}: Invalid cost amount`);
          continue;
        }

        validRows.push({
          state: row.State,
          category: row.Category,
          item: row.Item,
          ratePercent,
          employerCostUSD: employerCostUSD || 0,
          notes: row['Notes (Optional)'] || null,
          source: row['Source (Optional)'] || null,
        });
      } catch (error) {
        errors.push(`Row ${row._rowNumber}: Data validation error`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { 
          error: "CSV validation failed", 
          details: errors.slice(0, 10) // Limit error details
        },
        { status: 400 }
      );
    }

    // Begin transaction for bulk update
    const result = await prisma.$transaction(async (tx) => {
      let created = 0;
      let updated = 0;
      let errors = [];

      for (const row of validRows) {
        try {
          // Check if record exists
          const existing = await tx.employerCostData.findFirst({
            where: {
              state: row.state,
              category: row.category,
              item: row.item,
            }
          });

          if (existing) {
            // Update existing record
            await tx.employerCostData.update({
              where: { id: existing.id },
              data: {
                ratePercent: row.ratePercent,
                employerCostUSD: row.employerCostUSD,
                notes: row.notes,
                source: row.source,
              }
            });
            updated++;
          } else {
            // Create new record
            await tx.employerCostData.create({
              data: {
                id: `${row.state}-${row.category}-${row.item}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                state: row.state,
                category: row.category,
                item: row.item,
                ratePercent: row.ratePercent,
                employerCostUSD: row.employerCostUSD,
                notes: row.notes,
                source: row.source,
              }
            });
            created++;
          }
        } catch (error) {
          errors.push(`Failed to process row: ${row.state} - ${row.category} - ${row.item}`);
        }
      }

      return { created, updated, errors };
    });

    return NextResponse.json({
      success: true,
      message: `CSV processed successfully`,
      summary: {
        totalRows: validRows.length,
        created: result.created,
        updated: result.updated,
        errors: result.errors.length,
      },
      details: result.errors.length > 0 ? result.errors : undefined,
    });

  } catch (error) {
    console.error("Error processing CSV upload:", error);
    return NextResponse.json(
      { 
        error: "Failed to process CSV upload",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
