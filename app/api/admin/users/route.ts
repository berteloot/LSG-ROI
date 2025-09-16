import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Get all records to group by email
    const allRecords = await prisma.lSGCalculatorLead.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        email: true,
        createdAt: true,
      }
    });

    // Group by email to get unique users
    const uniqueUsers = allRecords.reduce((acc, record) => {
      if (!acc[record.email]) {
        acc[record.email] = {
          id: record.id,
          companyName: record.companyName,
          email: record.email,
          createdAt: record.createdAt,
          assessmentCount: 1
        };
      } else {
        // Update assessment count and keep the most recent creation date
        acc[record.email].assessmentCount += 1;
        if (new Date(record.createdAt) > new Date(acc[record.email].createdAt)) {
          acc[record.email].createdAt = record.createdAt;
        }
      }
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by most recent
    const users = Object.values(uniqueUsers).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ 
      success: true, 
      data: users,
      count: users.length,
      totalAssessments: allRecords.length
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}
