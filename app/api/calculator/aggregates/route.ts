import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categoriesFor, InclusionKey, getStateFullName } from "@/lib/costMapping";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const state = searchParams.get("state");
    
    if (!state) {
      return NextResponse.json(
        { error: "state is required" }, 
        { status: 400 }
      );
    }

    // Convert state abbreviation to full name for database query
    const stateFullName = getStateFullName(state);
    
    // Pull all rows for the selected state once
    const rows = await prisma.employerCostData.findMany({ 
      where: { state: stateFullName } 
    });

    const sumFor = (cats: string[]) =>
      rows
        .filter(r => cats.includes(r.category))
        .reduce((acc, r) => acc + (r.ratePercent ?? 0), 0);

    const keys: InclusionKey[] = [
      "payrollTaxes",
      "customaryBenefits",
      "administrativeOverhead",
      "itInfrastructure",
      "realEstate",
      "workforceManagement",
    ];

    const aggregates = Object.fromEntries(
      keys.map(k => [k, sumFor(categoriesFor(k, stateFullName))])
    ) as Record<InclusionKey, number>; // whole percents, e.g., 7.65

    return NextResponse.json({ state, aggregates });
  } catch (e: any) {
    console.error("Error in aggregates API:", e);
    return NextResponse.json(
      { error: e?.message || "server error" }, 
      { status: 500 }
    );
  }
}
