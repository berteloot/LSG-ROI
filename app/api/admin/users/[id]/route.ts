import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuth } from "@/lib/admin-auth";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const { id } = params;

    await prisma.$transaction(async (tx) => {
      const user = await tx.lSGCalculatorLead.findUnique({
        where: { id },
        select: { id: true, companyName: true, email: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      await tx.lSGCalculatorLead.delete({
        where: { id }
      });

      console.log(`Deleted user: ${user.companyName} (${user.email}) with ID: ${id}`);
    });

    return NextResponse.json({
      success: true,
      message: "User and associated assessment data deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);

    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete user and associated data" },
      { status: 500 }
    );
  }
}
