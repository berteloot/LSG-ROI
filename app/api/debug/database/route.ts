import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test basic database connection
    await prisma.$connect()
    
    // Test role_categories table specifically
    const roleCategoriesCount = await prisma.roleCategories.count()
    const roleCategories = await prisma.roleCategories.findMany({
      take: 5,
      select: {
        category_id: true,
        category_name: true,
        description: true,
        monthly_cost: true
      }
    })

    // Test the exact query used by the API
    const apiQueryResult = await prisma.roleCategories.findMany({
      orderBy: { category_name: 'asc' },
      select: {
        category_id: true,
        category_name: true,
        description: true,
        monthly_cost: true
      }
    })

    // Test the mapped data
    const mappedData = apiQueryResult.map(cat => ({
      id: cat.category_id.toString(),
      name: cat.category_name,
      description: cat.description || '',
      monthlyCost: cat.monthly_cost ? parseFloat(cat.monthly_cost.toString()) : 0,
      isActive: true
    }))

    // Test other tables to see if they have data
    const employerCostCount = await prisma.employerCostData.count()
    const lsgCalculatorLeadCount = await prisma.lSGCalculatorLead.count()

    return NextResponse.json({
      status: 'success',
      database: 'connected',
      tables: {
        role_categories: {
          count: roleCategoriesCount,
          sample: roleCategories,
          apiQueryResult: apiQueryResult,
          mappedData: mappedData
        },
        employerCostData: {
          count: employerCostCount
        },
        LSGCalculatorLead: {
          count: lsgCalculatorLeadCount
        }
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database connection test failed:', error)
    return NextResponse.json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
