import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Since we don't have a ROI calculations table in the current schema,
    // we'll return an empty array for now
    // TODO: Add ROI calculation model to Prisma schema if you want to save calculations
    
    // const calculations = await prisma.roiCalculation.findMany({
    //   orderBy: {
    //     created_at: 'desc'
    //   },
    //   take: 20
    // })
    
    // For now, return empty array
    const calculations: any[] = []
    
    return NextResponse.json(calculations)
    
  } catch (error) {
    console.error('Error in history API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
