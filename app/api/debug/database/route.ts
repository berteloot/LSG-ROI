import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test basic database connection
    await prisma.$connect()
    
    // Test role_categories table specifically
    const roleCategoriesCount = await prisma.role_categories.count()
    const roleCategories = await prisma.role_categories.findMany({
      take: 5,
      select: {
        category_id: true,
        category_name: true,
        description: true,
        monthly_cost: true
      }
    })

    // Test the exact query used by the API
    const apiQueryResult = await prisma.role_categories.findMany({
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
    const lsgBaseSeatCount = await prisma.lSGBaseSeat.count()
    const userCount = await prisma.user.count()

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
        lSGBaseSeat: {
          count: lsgBaseSeatCount
        },
        user: {
          count: userCount
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
