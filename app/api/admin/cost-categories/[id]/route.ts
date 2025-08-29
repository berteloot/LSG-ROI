import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Update role category
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, description, monthlyCost } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.role_categories.findUnique({
      where: { category_id: parseInt(id) }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Role category not found" },
        { status: 404 }
      );
    }

    // Check if another category with same name already exists (excluding current one)
    const duplicateCategory = await prisma.role_categories.findFirst({
      where: {
        category_name: name.trim(),
        category_id: { not: parseInt(id) }
      }
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    const updatedCategory = await prisma.role_categories.update({
      where: { category_id: parseInt(id) },
      data: {
        category_name: name.trim(),
        description: description?.trim() || '',
        monthly_cost: monthlyCost !== undefined ? monthlyCost : existingCategory.monthly_cost
      },
      select: {
        category_id: true,
        category_name: true,
        description: true,
        monthly_cost: true
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedCategory.category_id.toString(),
        name: updatedCategory.category_name,
        description: updatedCategory.description || '',
        monthlyCost: updatedCategory.monthly_cost ? parseFloat(updatedCategory.monthly_cost.toString()) : 0,
        isActive: true
      },
      message: "Role category updated successfully"
    });
  } catch (error) {
    console.error('Failed to update role category:', error);
    return NextResponse.json(
      { error: "Failed to update role category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete role category
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // Check if category exists
    const existingCategory = await prisma.role_categories.findUnique({
      where: { category_id: parseInt(id) }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Role category not found" },
        { status: 404 }
      );
    }

    // Roles table has been removed, so no need to check for role dependencies

    await prisma.role_categories.delete({
      where: { category_id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: `Role category "${existingCategory.category_name}" deleted successfully`
    });
  } catch (error) {
    console.error('Failed to delete role category:', error);
    return NextResponse.json(
      { error: "Failed to delete role category" },
      { status: 500 }
    );
  }
}
