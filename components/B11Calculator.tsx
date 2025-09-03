'use client'

import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, DollarSign, MapPin, Toggle, BarChart3, Users } from 'lucide-react'
import { 
  InclusionKey, 
  getInclusionKeyDisplayName, 
  getInclusionKeyDescription,
  getAvailableStates
} from '@/lib/costMapping'
import { computeTotals, formatCurrency, formatPercentage, formatFTE } from '@/lib/roi'

interface CostAggregates {
  state: string
  aggregates: Record<InclusionKey, number>
}

interface B11Calculation {
  baseSalary: number
  fteCount: number
  totalCostPercentage: number
  totalCostAmount: number
  breakdown: Record<InclusionKey, { percentage: number; amount: number }>
  monthlyTotals: {
    totalEmployerLoadPct: number
    employerExtrasMonthlyAllFTEs: number
    inHouseMonthlyAllFTEs: number
  }
}

export default function B11Calculator() {
  const [selectedState, setSelectedState] = useState<string>('CA')
  const [baseSalary, setBaseSalary] = useState<number>(100000)
  const [fteCount, setFteCount] = useState<number>(1)
  const [includedKeys, setIncludedKeys] = useState<InclusionKey[]>([
    'payrollTaxes',
    'customaryBenefits',
    'administrativeOverhead'
  ])
  const [aggregates, setAggregates] = useState<CostAggregates | null>(null)
  const [calculation, setCalculation] = useState<B11Calculation | null>(null)
  const [loading, setLoading] = useState(false)

  const availableStates = getAvailableStates()
  const allKeys: InclusionKey[] = [
    'payrollTaxes',
    'customaryBenefits',
    'administrativeOverhead',
    'itInfrastructure',
    'realEstate',
    'workforceManagement'
  ]

  useEffect(() => {
    fetchAggregates()
  }, [selectedState])

  useEffect(() => {
    if (aggregates) {
      calculateB11()
    }
  }, [aggregates, includedKeys, baseSalary, fteCount])

  const fetchAggregates = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/calculator/aggregates?state=${selectedState}`)
      if (response.ok) {
        const data = await response.json()
        setAggregates(data)
      }
    } catch (error) {
      console.error('Error fetching aggregates:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleInclusionKey = (key: InclusionKey) => {
    setIncludedKeys((prev: InclusionKey[]) => 
      prev.includes(key) 
        ? prev.filter((k: InclusionKey) => k !== key)
        : [...prev, key]
    )
  }

  const calculateB11 = () => {
    if (!aggregates) return

    // Convert annual salary to monthly
    const baseMonthlySalary = baseSalary / 12

    // Create inclusions object
    const inclusions: Record<InclusionKey, boolean> = {
      payrollTaxes: includedKeys.includes('payrollTaxes'),
      customaryBenefits: includedKeys.includes('customaryBenefits'),
      administrativeOverhead: includedKeys.includes('administrativeOverhead'),
      itInfrastructure: includedKeys.includes('itInfrastructure'),
      realEstate: includedKeys.includes('realEstate'),
      workforceManagement: includedKeys.includes('workforceManagement')
    }

    // Use the shared math library
    const monthlyTotals = computeTotals(baseMonthlySalary, fteCount, aggregates.aggregates, inclusions)

    let totalCostPercentage = 0
    const breakdown: Record<InclusionKey, { percentage: number; amount: number }> = {} as Record<InclusionKey, { percentage: number; amount: number }>

    // Calculate breakdown for included keys
    includedKeys.forEach((key: InclusionKey) => {
      const percentage = aggregates.aggregates[key] || 0
      totalCostPercentage += percentage
      breakdown[key] = {
        percentage,
        amount: (baseSalary * percentage) / 100
      }
    })

    const totalCostAmount = (baseSalary * totalCostPercentage) / 100

    setCalculation({
      baseSalary,
      fteCount,
      totalCostPercentage,
      totalCostAmount,
      breakdown,
      monthlyTotals
    })
  }

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          B11 Calculator Inputs
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* State Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              State
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="input-field"
            >
              {availableStates.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {/* Base Salary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Annual Base Salary
            </label>
            <input
              type="number"
              value={baseSalary}
              onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
              className="input-field"
              placeholder="100000"
              min="0"
              step="1000"
            />
          </div>

          {/* FTE Count */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              FTE Count
            </label>
            <input
              type="number"
              value={fteCount}
              onChange={(e) => setFteCount(parseFloat(e.target.value) || 1)}
              className="input-field"
              placeholder="1"
              min="0.1"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Cost Category Toggles */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Toggle className="w-5 h-5" />
          Cost Categories
        </h3>
        <p className="text-gray-600 mb-6">
          Select which cost categories to include in your B11 calculation
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allKeys.map(key => (
            <div key={key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={key}
                    checked={includedKeys.includes(key)}
                    onChange={() => toggleInclusionKey(key)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={key} className="font-medium text-gray-900">
                    {getInclusionKeyDisplayName(key)}
                  </label>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {getInclusionKeyDescription(key)}
                </p>
                {aggregates && (
                  <div className="text-sm text-gray-500 mt-2">
                    Rate: {formatPercentage(aggregates.aggregates[key] || 0)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* B11 Calculation Results */}
      {calculation && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            B11 Calculation Results
          </h3>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {/* Base Salary */}
            <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Annual Base Salary</div>
              <div className="text-2xl font-bold text-gray-800">{formatCurrency(calculation.baseSalary)}</div>
              <div className="text-sm text-gray-500 mt-1">Monthly: {formatCurrency(calculation.baseSalary / 12)}</div>
            </div>

            {/* Total Cost Percentage */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 rounded-xl text-center">
              <div className="text-sm font-medium opacity-90 mb-2">Total Cost %</div>
              <div className="text-3xl font-bold">{formatPercentage(calculation.totalCostPercentage)}</div>
              <TrendingUp className="w-8 h-8 mx-auto mt-2 opacity-80" />
            </div>

            {/* Total Cost Amount */}
            <div className="bg-green-50 p-6 rounded-xl text-center border border-green-200">
              <div className="text-sm font-medium text-green-600 mb-2">Annual Cost</div>
              <div className="text-2xl font-bold text-green-800">{formatCurrency(calculation.totalCostAmount)}</div>
              <div className="text-sm text-green-500 mt-1">Monthly: {formatCurrency(calculation.totalCostAmount / 12)}</div>
            </div>

            {/* FTE Count */}
            <div className="bg-blue-50 p-6 rounded-xl text-center border border-blue-200">
              <div className="text-sm font-medium text-blue-600 mb-2">Team Size</div>
              <div className="text-2xl font-bold text-blue-800">{formatFTE(calculation.fteCount)}</div>
            </div>
          </div>

          {/* Monthly Totals (B11, B12, B13) */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-6">
            <h4 className="font-semibold text-gray-800 mb-4">Monthly Totals (All FTEs)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">B11: Employer Load %</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatPercentage(calculation.monthlyTotals.totalEmployerLoadPct)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">B12: Employer Extras</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(calculation.monthlyTotals.employerExtrasMonthlyAllFTEs)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">B13: Total Monthly Cost</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(calculation.monthlyTotals.inHouseMonthlyAllFTEs)}
                </div>
              </div>
            </div>
          </div>

          {/* Breakdown by Category */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Cost Breakdown by Category</h4>
            {includedKeys.map(key => (
              <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">
                    {getInclusionKeyDisplayName(key)}
                  </div>
                  <div className="text-sm text-gray-600">
                    {getInclusionKeyDescription(key)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">
                    {formatCurrency(calculation.breakdown[key].amount)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatPercentage(calculation.breakdown[key].percentage)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Employee Cost */}
          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="text-center">
              <div className="text-lg font-medium text-blue-800 mb-2">Total Annual Employee Cost</div>
              <div className="text-3xl font-bold text-blue-900">
                {formatCurrency(calculation.baseSalary + calculation.totalCostAmount)}
              </div>
              <div className="text-sm text-blue-600 mt-1">
                Base Salary + Employer Costs
              </div>
              <div className="text-sm text-blue-600 mt-1">
                Monthly: {formatCurrency((calculation.baseSalary + calculation.totalCostAmount) / 12)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading cost data...</p>
        </div>
      )}
    </div>
  )
}
