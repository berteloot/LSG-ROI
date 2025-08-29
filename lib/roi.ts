import type { InclusionKey } from "./costMapping";

export type Inclusions = Record<InclusionKey, boolean>;
export type Aggregates = Record<InclusionKey, number>; // whole percents

export function computeTotals(
  baseMonthlySalary: number,
  fteCount: number,
  aggregates: Aggregates,
  inclusions: Inclusions
) {
  // B11: Total Employer Load % (sum of selected groups)
  const pct =
    (inclusions.payrollTaxes ? aggregates.payrollTaxes : 0) +
    (inclusions.customaryBenefits ? aggregates.customaryBenefits : 0) +
    (inclusions.administrativeOverhead ? aggregates.administrativeOverhead : 0) +
    (inclusions.itInfrastructure ? aggregates.itInfrastructure : 0) +
    (inclusions.realEstate ? aggregates.realEstate : 0) +
    (inclusions.workforceManagement ? aggregates.workforceManagement : 0);

  const rate = pct / 100; // to decimal

  // B12: Employer Extras ($) = base × rate × FTEs (monthly, all FTEs)
  const employerExtrasMonthlyAllFTEs = baseMonthlySalary * rate * fteCount;

  // B13: In-House Total Cost ($) = (base + extrasPerFTE) × FTEs (monthly)
  const inHouseMonthlyAllFTEs = (baseMonthlySalary + baseMonthlySalary * rate) * fteCount;

  return {
    totalEmployerLoadPct: pct,                 // show as percent
    employerExtrasMonthlyAllFTEs,              // $
    inHouseMonthlyAllFTEs,                     // $
  };
}

/**
 * Calculate ROI for a project using the computed totals
 */
export function calculateProjectROI(
  initialInvestment: number,
  monthlyRevenue: number,
  monthlyExpenses: number,
  projectDuration: number,
  baseMonthlySalary: number,
  fteCount: number,
  aggregates: Aggregates,
  inclusions: Inclusions
) {
  // Get the computed totals
  const totals = computeTotals(baseMonthlySalary, fteCount, aggregates, inclusions);
  
  // Calculate total project costs
  const totalProjectCosts = (monthlyExpenses + totals.inHouseMonthlyAllFTEs) * projectDuration;
  
  // Calculate total revenue
  const totalRevenue = monthlyRevenue * projectDuration;
  
  // Calculate net profit
  const netProfit = totalRevenue - totalProjectCosts - initialInvestment;
  
  // Calculate ROI percentage
  const roiPercentage = initialInvestment > 0 ? (netProfit / initialInvestment) * 100 : 0;
  
  // Calculate payback period
  const monthlyNetCashFlow = monthlyRevenue - monthlyExpenses - totals.inHouseMonthlyAllFTEs;
  const paybackPeriod = monthlyNetCashFlow > 0 ? initialInvestment / monthlyNetCashFlow : 'Never';
  
  return {
    // ROI Results
    roiPercentage: Math.round(roiPercentage * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalProjectCosts: Math.round(totalProjectCosts * 100) / 100,
    paybackPeriod: typeof paybackPeriod === 'number' ? Math.round(paybackPeriod * 100) / 100 : paybackPeriod,
    
    // Cost Breakdown
    monthlyEmployeeCosts: totals.inHouseMonthlyAllFTEs,
    totalEmployeeCosts: totals.inHouseMonthlyAllFTEs * projectDuration,
    employerLoadPercentage: totals.totalEmployerLoadPct,
    
    // Project Details
    initialInvestment,
    projectDuration,
    fteCount
  };
}

/**
 * Calculate cost comparison between in-house and outsourcing
 */
export function calculateCostComparison(
  baseMonthlySalary: number,
  fteCount: number,
  aggregates: Aggregates,
  inclusions: Inclusions,
  outsourcingRate: number // hourly rate for outsourcing
) {
  const totals = computeTotals(baseMonthlySalary, fteCount, aggregates, inclusions);
  
  // In-house costs (monthly)
  const inHouseMonthly = totals.inHouseMonthlyAllFTEs;
  
  // Outsourcing costs (assuming 160 hours per month per FTE)
  const hoursPerFTE = 160;
  const outsourcingMonthly = outsourcingRate * hoursPerFTE * fteCount;
  
  // Monthly savings/cost difference
  const monthlyDifference = inHouseMonthly - outsourcingMonthly;
  const annualDifference = monthlyDifference * 12;
  
  // Break-even analysis
  const breakEvenRate = totals.inHouseMonthlyAllFTEs / (hoursPerFTE * fteCount);
  
  return {
    inHouseMonthly,
    outsourcingMonthly,
    monthlyDifference,
    annualDifference,
    breakEvenRate,
    isOutsourcingCheaper: monthlyDifference > 0,
    savingsPercentage: inHouseMonthly > 0 ? (monthlyDifference / inHouseMonthly) * 100 : 0
  };
}

/**
 * Calculate scaling costs for different team sizes
 */
export function calculateScalingCosts(
  baseMonthlySalary: number,
  baseFteCount: number,
  aggregates: Aggregates,
  inclusions: Inclusions,
  scalingFactors: number[] // e.g., [1, 1.5, 2, 3, 5, 10]
) {
  return scalingFactors.map(factor => {
    const fteCount = baseFteCount * factor;
    const totals = computeTotals(baseMonthlySalary, fteCount, aggregates, inclusions);
    
    return {
      fteCount: Math.round(fteCount * 100) / 100,
      totalMonthlyCost: totals.inHouseMonthlyAllFTEs,
      costPerFTE: totals.inHouseMonthlyAllFTEs / fteCount,
      employerLoadAmount: totals.employerExtrasMonthlyAllFTEs,
      employerLoadPercentage: totals.totalEmployerLoadPct
    };
  });
}

/**
 * Calculate ROI sensitivity analysis
 */
export function calculateROISensitivity(
  initialInvestment: number,
  monthlyRevenue: number,
  monthlyExpenses: number,
  projectDuration: number,
  baseMonthlySalary: number,
  fteCount: number,
  aggregates: Aggregates,
  inclusions: Inclusions,
  revenueVariations: number[] = [-20, -10, 0, 10, 20], // percentage variations
  costVariations: number[] = [-20, -10, 0, 10, 20]     // percentage variations
) {
  const results: Array<{
    revenueVariation: number;
    costVariation: number;
    roi: number;
    netProfit: number;
  }> = [];

  revenueVariations.forEach(revenueVar => {
    costVariations.forEach(costVar => {
      const adjustedRevenue = monthlyRevenue * (1 + revenueVar / 100);
      const adjustedExpenses = monthlyExpenses * (1 + costVar / 100);
      
      const roi = calculateProjectROI(
        initialInvestment,
        adjustedRevenue,
        adjustedExpenses,
        projectDuration,
        baseMonthlySalary,
        fteCount,
        aggregates,
        inclusions
      );

      results.push({
        revenueVariation: revenueVar,
        costVariation: costVar,
        roi: roi.roiPercentage,
        netProfit: roi.netProfit
      });
    });
  });

  return results;
}

/**
 * Utility function to format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Utility function to format percentage
 */
export function formatPercentage(percentage: number): string {
  return `${percentage.toFixed(2)}%`;
}

/**
 * Utility function to format FTE count
 */
export function formatFTE(fte: number): string {
  return fte === 1 ? '1 FTE' : `${fte.toFixed(2)} FTEs`;
}
