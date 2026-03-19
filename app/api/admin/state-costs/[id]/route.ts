import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const { id } = params;
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

    const updatedRecord = await prisma.employerCostData.update({
      where: { id },
      data: {
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
      data: updatedRecord
    });
  } catch (error) {
    console.error("Error updating state cost data:", error);

    if (error instanceof Error && error.message.includes('Record to update not found')) {
      return NextResponse.json(
        {
          success: false,
          error: "Record not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update state cost data"
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const { id } = params;

    await prisma.employerCostData.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: "Record deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting state cost data:", error);

    if (error instanceof Error && error.message.includes('Record to delete does not exist')) {
      return NextResponse.json(
        {
          success: false,
          error: "Record not found"
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete state cost data"
      },
      { status: 500 }
    );
  }
}
