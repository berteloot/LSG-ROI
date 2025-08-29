import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Fetch all state cost data
    const data = await prisma.employerCostData.findMany({
      orderBy: [
        { state: 'asc' },
        { category: 'asc' },
        { item: 'asc' }
      ]
    });

    return NextResponse.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (error) {
    console.error("Error fetching state cost data:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch state cost data" 
      }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { state, category, item, ratePercent, employerCostUSD, notes, source } = body;

    // Validate required fields
    if (!state || !category || !item || ratePercent === undefined) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required fields: state, category, item, and ratePercent are required" 
        }, 
        { status: 400 }
      );
    }

    // Create new record
    const newRecord = await prisma.employerCostData.create({
      data: {
        id: `${state}-${category}-${item}-${Date.now()}`, // Generate unique ID
        state,
        category,
        item,
        ratePercent: parseFloat(ratePercent),
        employerCostUSD: parseFloat(employerCostUSD || 0),
        notes: notes || null,
        source: source || null,
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: newRecord 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating state cost data:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create state cost data" 
      }, 
      { status: 500 }
    );
  }
}
