export interface ROIData {
  project_name: string
  initial_investment: number
  annual_revenue: number
  annual_expenses: number
  project_duration: number
}

export interface ROIResults {
  success: boolean
  roi_percentage: number
  total_revenue: number
  total_expenses: number
  net_profit: number
  payback_period: number | string
  calculation_id?: string
  error?: string
}

export function calculateROI(data: ROIData): ROIResults {
  try {
    const { initial_investment, annual_revenue, annual_expenses, project_duration } = data
    
    // Validate inputs
    if (initial_investment < 0 || annual_revenue < 0 || annual_expenses < 0 || project_duration < 1) {
      return {
        success: false,
        roi_percentage: 0,
        total_revenue: 0,
        total_expenses: 0,
        net_profit: 0,
        payback_period: 0,
        error: 'All values must be positive and project duration must be at least 1 year'
      }
    }

    // Calculate totals
    const total_revenue = annual_revenue * project_duration
    const total_expenses = annual_expenses * project_duration
    const net_profit = total_revenue - total_expenses - initial_investment
    
    // Calculate ROI
    let roi_percentage = 0
    if (initial_investment > 0) {
      roi_percentage = (net_profit / initial_investment) * 100
    }
    
    // Calculate payback period
    let payback_period: number | string = 0
    const annual_net_cash_flow = annual_revenue - annual_expenses
    if (annual_net_cash_flow > 0) {
      payback_period = initial_investment / annual_net_cash_flow
    } else {
      payback_period = 'Never'
    }

    return {
      success: true,
      roi_percentage: Math.round(roi_percentage * 100) / 100,
      total_revenue: Math.round(total_revenue * 100) / 100,
      total_expenses: Math.round(total_expenses * 100) / 100,
      net_profit: Math.round(net_profit * 100) / 100,
      payback_period: typeof payback_period === 'number' ? Math.round(payback_period * 100) / 100 : payback_period
    }
  } catch (error) {
    return {
      success: false,
      roi_percentage: 0,
      total_revenue: 0,
      total_expenses: 0,
      net_profit: 0,
      payback_period: 0,
      error: 'An error occurred during calculation'
    }
  }
}

export function getROIInterpretation(roi: number): string {
  if (roi >= 20) {
    return 'Excellent ROI! This is a highly profitable investment.'
  } else if (roi >= 10) {
    return 'Good ROI! This investment shows positive returns.'
  } else if (roi >= 0) {
    return 'Positive ROI! The investment will generate returns.'
  } else if (roi >= -10) {
    return 'Low ROI. Consider if this investment aligns with your goals.'
  } else {
    return 'Negative ROI. This investment may not be profitable.'
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
