import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateROI, ROIData } from '@/lib/roi-calculations'

export async function POST(request: NextRequest) {
  try {
    const body: ROIData = await request.json()
    
    // Validate required fields
    if (!body.project_name || !body.initial_investment || !body.annual_revenue || !body.annual_expenses || !body.project_duration) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Calculate ROI using utility function
    const roiResults = calculateROI(body)
    
    if (!roiResults.success) {
      return NextResponse.json(
        { success: false, error: roiResults.error },
        { status: 400 }
      )
    }

    // Save to database using Prisma
    // Note: Since we don't have a ROI calculations table in the current schema,
    // we'll store this in a temporary way or you can add a new model
    // For now, we'll return the calculated results without saving
    
    // TODO: Add ROI calculation model to Prisma schema if you want to save calculations
    // const savedCalculation = await prisma.roiCalculation.create({
    //   data: {
    //     project_name: body.project_name,
    //     initial_investment: body.initial_investment,
    //     annual_revenue: body.annual_revenue,
    //     annual_expenses: body.annual_expenses,
    //     project_duration: body.project_duration,
    //     calculated_roi: roiResults.roi_percentage,
    //   }
    // })

    return NextResponse.json({
      success: true,
      roi_percentage: roiResults.roi_percentage,
      total_revenue: roiResults.total_revenue,
      total_expenses: roiResults.total_expenses,
      net_profit: roiResults.net_profit,
      payback_period: roiResults.payback_period,
      // calculation_id: savedCalculation.id // Uncomment when you add the model
    })

  } catch (error) {
    console.error('Error in calculate API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
