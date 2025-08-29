'use client'

import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, DollarSign, MapPin, Settings, BarChart3, Users, ArrowRight, CheckCircle, Building2 } from 'lucide-react'
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

type Step = 'state' | 'salary' | 'fte' | 'categories' | 'results'

export default function B11Calculator() {
  const [currentStep, setCurrentStep] = useState<Step>('state')
  const [selectedState, setSelectedState] = useState<string>('CA')
  const [baseSalary, setBaseSalary] = useState<number>(100000)
  const [fteCount, setFteCount] = useState<number>(1)
  const [includedKeys, setIncludedKeys] = useState<InclusionKey[]>([
    'payrollTaxes',
    'customaryBenefits',
    'administrativeOverhead'
  ])
  const [aggregates, setAggregates] = useState<Record<InclusionKey, number> | null>(null)
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
        setAggregates(data.aggregates) // Fix: extract aggregates from response
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
    const monthlyTotals = computeTotals(baseMonthlySalary, fteCount, aggregates, inclusions)

    let totalCostPercentage = 0
    const breakdown: Record<InclusionKey, { percentage: number; amount: number }> = {} as Record<InclusionKey, { percentage: number; amount: number }>

    // Calculate breakdown for included keys
    includedKeys.forEach((key: InclusionKey) => {
      const percentage = aggregates[key] || 0
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

  const nextStep = () => {
    const steps: Step[] = ['state', 'salary', 'fte', 'categories', 'results']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const prevStep = () => {
    const steps: Step[] = ['state', 'salary', 'fte', 'categories', 'results']
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    }
  }

  const getStepProgress = () => {
    const steps: Step[] = ['state', 'salary', 'fte', 'categories', 'results']
    const currentIndex = steps.indexOf(currentStep)
    return ((currentIndex + 1) / steps.length) * 100
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'state':
        return (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Building2 className="w-16 h-16 mx-auto text-blue-500" />
              <h2 className="text-3xl font-bold text-gray-900">Where is your business located?</h2>
              <p className="text-lg text-gray-600">Select your state to get accurate cost calculations</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
              >
                {availableStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <button
              onClick={nextStep}
              disabled={!selectedState}
              className="btn-primary text-lg px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </div>
        )

      case 'salary':
        return (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <DollarSign className="w-16 h-16 mx-auto text-green-500" />
              <h2 className="text-3xl font-bold text-gray-900">What's the annual base salary?</h2>
              <p className="text-lg text-gray-600">Enter the base salary for one full-time employee</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
                  className="w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white"
                  placeholder="100000"
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={prevStep}
                className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={baseSalary <= 0}
                className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )

      case 'fte':
        return (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Users className="w-16 h-16 mx-auto text-purple-500" />
              <h2 className="text-3xl font-bold text-gray-900">How many employees?</h2>
              <p className="text-lg text-gray-600">Enter the number of full-time equivalent employees</p>
            </div>
            
            <div className="max-w-md mx-auto">
              <input
                type="number"
                value={fteCount}
                onChange={(e) => setFteCount(parseFloat(e.target.value) || 1)}
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white text-center"
                placeholder="1"
                min="0.1"
                step="0.1"
              />
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={prevStep}
                className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={fteCount <= 0}
                className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )

      case 'categories':
        return (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Settings className="w-16 h-16 mx-auto text-orange-500" />
              <h2 className="text-3xl font-bold text-gray-900">Select cost categories</h2>
              <p className="text-lg text-gray-600">Choose which employer costs to include in your calculation</p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-4">
              {allKeys.map(key => (
                <div key={key} className="flex items-center justify-between p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={key}
                        checked={includedKeys.includes(key)}
                        onChange={() => toggleInclusionKey(key)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={key} className="text-lg font-semibold text-gray-900 cursor-pointer">
                        {getInclusionKeyDisplayName(key)}
                      </label>
                    </div>
                    <p className="text-gray-600 mt-2 ml-8">
                      {getInclusionKeyDescription(key)}
                    </p>
                    {aggregates && (
                      <div className="text-sm text-blue-600 mt-2 ml-8 font-medium">
                        Rate: {formatPercentage(aggregates[key] || 0)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={prevStep}
                className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                Back
              </button>
              <button
                onClick={nextStep}
                disabled={includedKeys.length === 0}
                className="btn-primary text-lg px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Calculate Results <Calculator className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        )

      case 'results':
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <h2 className="text-3xl font-bold text-gray-900">Your B11 Calculation Results</h2>
              <p className="text-lg text-gray-600">Here's your complete employer cost breakdown</p>
            </div>

            {calculation ? (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 text-center">
                    <div className="text-sm font-medium text-blue-600 mb-2">Base Salary</div>
                    <div className="text-2xl font-bold text-blue-800">{formatCurrency(calculation.baseSalary)}</div>
                    <div className="text-sm text-blue-500 mt-1">Monthly: {formatCurrency(calculation.baseSalary / 12)}</div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 text-center">
                    <div className="text-sm font-medium text-purple-600 mb-2">Total Cost %</div>
                    <div className="text-3xl font-bold text-purple-800">{formatPercentage(calculation.totalCostPercentage)}</div>
                    <TrendingUp className="w-8 h-8 mx-auto mt-2 text-purple-600" />
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 text-center">
                    <div className="text-sm font-medium text-green-600 mb-2">Annual Cost</div>
                    <div className="text-2xl font-bold text-green-800">{formatCurrency(calculation.totalCostAmount)}</div>
                    <div className="text-sm text-green-500 mt-1">Monthly: {formatCurrency(calculation.totalCostAmount / 12)}</div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl border border-orange-200 text-center">
                    <div className="text-sm font-medium text-orange-600 mb-2">Team Size</div>
                    <div className="text-2xl font-bold text-orange-800">{formatFTE(calculation.fteCount)}</div>
                  </div>
                </div>

                {/* Monthly Totals */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-8">
                  <h4 className="font-bold text-xl text-gray-800 mb-6 text-center">Monthly Totals (All FTEs)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">B11: Employer Load %</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatPercentage(calculation.monthlyTotals.totalEmployerLoadPct)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">B12: Employer Extras</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(calculation.monthlyTotals.employerExtrasMonthlyAllFTEs)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">B13: Total Monthly Cost</div>
                      <div className="text-3xl font-bold text-gray-900">
                        {formatCurrency(calculation.monthlyTotals.inHouseMonthlyAllFTEs)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Breakdown by Category */}
                <div className="space-y-4">
                  <h4 className="font-bold text-xl text-gray-800 text-center">Cost Breakdown by Category</h4>
                  {includedKeys.map(key => (
                    <div key={key} className="flex items-center justify-between p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
                      <div>
                        <div className="font-semibold text-lg text-gray-900">
                          {getInclusionKeyDisplayName(key)}
                        </div>
                        <div className="text-gray-600">
                          {getInclusionKeyDescription(key)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {formatCurrency(calculation.breakdown[key].amount)}
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          {formatPercentage(calculation.breakdown[key].percentage)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total Employee Cost */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 text-center">
                  <div className="text-xl font-semibold text-blue-800 mb-3">Total Annual Employee Cost</div>
                  <div className="text-4xl font-bold text-blue-900 mb-2">
                    {formatCurrency(calculation.baseSalary + calculation.totalCostAmount)}
                  </div>
                  <div className="text-blue-600">
                    Base Salary + Employer Costs
                  </div>
                  <div className="text-blue-600 mt-1">
                    Monthly: {formatCurrency((calculation.baseSalary + calculation.totalCostAmount) / 12)}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Calculating your results...</p>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={prevStep}
                className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:border-gray-400 transition-colors"
              >
                Back to Categories
              </button>
              <button
                onClick={() => setCurrentStep('state')}
                className="btn-primary text-lg px-8 py-3"
              >
                Start New Calculation
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Step {['state', 'salary', 'fte', 'categories', 'results'].indexOf(currentStep) + 1} of 5</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(getStepProgress())}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getStepProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[600px]">
        {renderStepContent()}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading cost data...</p>
          </div>
        </div>
      )}
    </div>
  )
}
