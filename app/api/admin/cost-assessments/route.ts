import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const assessments = await prisma.lSGCalculatorLead.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        email: true,
        baseSalary: true,
        fteCount: true,
        totalEmployerLoad: true,
        employerExtras: true,
        inHouseTotalCost: true,
        lsgCost: true,
        annualSavingsPercentage: true,
        inclusions: true,
        costBreakdown: true,
        createdAt: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: assessments,
      count: assessments.length 
    });
  } catch (error) {
    console.error("Error fetching cost assessments:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost assessments" },
      { status: 500 }
    );
  }
}
