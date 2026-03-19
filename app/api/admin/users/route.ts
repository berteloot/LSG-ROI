import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const allRecords = await prisma.lSGCalculatorLead.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        email: true,
        createdAt: true,
        state: true,
        baseSalary: true,
        fteCount: true,
        roleCategoryName: true,
        emailSent: true,
        emailSentAt: true,
      }
    });

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
        acc[record.email].assessmentCount += 1;
        if (new Date(record.createdAt) > new Date(acc[record.email].createdAt)) {
          acc[record.email].createdAt = record.createdAt;
        }
      }
      return acc;
    }, {} as Record<string, any>);

    const uniqueUsersArray = Object.values(uniqueUsers).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      data: allRecords,
      uniqueUsers: uniqueUsersArray,
      count: allRecords.length,
      uniqueCount: uniqueUsersArray.length,
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
