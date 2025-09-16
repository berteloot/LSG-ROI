import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch all role categories
export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.roleCategories.findMany({
      orderBy: { category_name: 'asc' },
      select: {
        category_id: true,
        category_name: true,
        description: true,
        monthly_cost: true
      }
    });

    return NextResponse.json({
      success: true,
      data: categories.map(cat => ({
        id: cat.category_id.toString(),
        name: cat.category_name,
        description: cat.description || '',
        monthlyCost: cat.monthly_cost ? parseFloat(cat.monthly_cost.toString()) : 0,
        isActive: true // role_categories doesn't have an active field, so we'll default to true
      })),
      count: categories.length
    });
  } catch (error) {
    console.error('Failed to fetch role categories:', error);
    return NextResponse.json(
      { error: "Failed to fetch role categories" },
      { status: 500 }
    );
  }
}

// POST - Create new role category
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description, monthlyCost = 0 } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if category with same name already exists
    const existingCategory = await prisma.roleCategories.findFirst({
      where: { category_name: name.trim() }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "A category with this name already exists" },
        { status: 409 }
      );
    }

    const category = await prisma.roleCategories.create({
      data: {
        category_name: name.trim(),
        description: description?.trim() || '',
        monthly_cost: monthlyCost > 0 ? monthlyCost : 0
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
        id: category.category_id.toString(),
        name: category.category_name,
        description: category.description || '',
        monthlyCost: category.monthly_cost ? parseFloat(category.monthly_cost.toString()) : 0,
        isActive: true
      },
      message: "Role category created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create role category:', error);
    return NextResponse.json(
      { error: "Failed to create role category" },
      { status: 500 }
    );
  }
}
