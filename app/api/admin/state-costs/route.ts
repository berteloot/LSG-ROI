import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
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
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { state, category, item, ratePercent, employerCostUSD, notes, source } = body;

    if (!state || !category || !item || ratePercent === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: state, category, item, and ratePercent are required"
        },
        { status: 400 }
      );
    }

    const newRecord = await prisma.employerCostData.create({
      data: {
        id: `${state}-${category}-${item}-${Date.now()}`,
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
