'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, MapPin, Calculator } from 'lucide-react'
import { 
  InclusionKey, 
  categoriesFor, 
  getInclusionKeyDisplayName, 
  getInclusionKeyDescription,
  getAvailableStates,
  calculateTotalCost
} from '@/lib/costMapping'

interface CostData {
  category: string
  ratePercent: number
}

interface CostAggregates {
  state: string
  aggregates: Record<InclusionKey, number>
}

export default function CostCalculator() {
  const [selectedState, setSelectedState] = useState<string>('CA')
  const [includedKeys, setIncludedKeys] = useState<InclusionKey[]>([
    'payrollTaxes',
    'customaryBenefits'
  ])
  const [costData, setCostData] = useState<CostData[]>([])
  const [aggregates, setAggregates] = useState<CostAggregates | null>(null)
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
    fetchCostData()
  }, [selectedState])

  const fetchCostData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/costs?state=${selectedState}`)
      if (response.ok) {
        const data = await response.json()
        setAggregates(data)
      }
    } catch (error) {
      console.error('Error fetching cost data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleInclusionKey = (key: InclusionKey) => {
    setIncludedKeys(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }

  const calculateTotalPercentage = (): number => {
    if (!aggregates) return 0
    return includedKeys.reduce((total, key) => total + (aggregates.aggregates[key] || 0), 0)
  }

  const getCategoryDetails = (key: InclusionKey) => {
    if (!aggregates) return []
    const categories = categoriesFor(key, selectedState)
    return categories.map(category => ({
      name: category,
      percentage: costData.find(item => item.category === category)?.ratePercent || 0
    }))
  }

  return (
    <div className="space-y-6">
      {/* State Selection */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Select State
        </h3>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="input-field max-w-xs"
        >
          {availableStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      {/* Cost Category Toggles */}
      <div className="card">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Cost Categories
        </h3>
        <p className="text-gray-600 mb-6">
          Toggle different cost categories to see their impact on total employer costs
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
                    Current: {aggregates.aggregates[key]?.toFixed(2)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      {aggregates && (
        <div className="card">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Cost Summary
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Percentage */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 rounded-xl text-center">
              <div className="text-sm font-medium opacity-90 mb-2">Total Cost</div>
              <div className="text-3xl font-bold">{calculateTotalPercentage().toFixed(2)}%</div>
              <TrendingUp className="w-8 h-8 mx-auto mt-2 opacity-80" />
            </div>

            {/* Selected Categories */}
            <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">Categories Selected</div>
              <div className="text-2xl font-bold text-gray-800">{includedKeys.length}</div>
              <div className="text-sm text-gray-500">of {allKeys.length}</div>
            </div>

            {/* State */}
            <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
              <div className="text-sm font-medium text-gray-600 mb-2">State</div>
              <div className="text-2xl font-bold text-gray-800">{selectedState}</div>
            </div>
          </div>

          {/* Breakdown by Category */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800">Breakdown by Category</h4>
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
                    {aggregates.aggregates[key]?.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    {categoriesFor(key, selectedState).length} items
                  </div>
                </div>
              </div>
            ))}
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
