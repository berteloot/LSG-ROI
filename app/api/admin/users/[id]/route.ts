import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Use a transaction to ensure both user and assessment data are deleted atomically
    await prisma.$transaction(async (tx) => {
      // First, check if the user exists
      const user = await tx.lSGCalculatorLead.findUnique({
        where: { id },
        select: { id: true, companyName: true, email: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Delete the user (this will cascade to related data if foreign key constraints exist)
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
