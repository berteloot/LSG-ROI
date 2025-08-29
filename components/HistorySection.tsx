'use client'

import { useState, useEffect } from 'react'
import { Clock, TrendingUp, DollarSign, Calendar, Inbox } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/roi-calculations'

interface CalculationHistory {
  id: string
  project_name: string
  initial_investment: number
  annual_revenue: number
  annual_expenses: number
  project_duration: number
  calculated_roi: number
  created_at: string
}

export default function HistorySection() {
  const [calculations, setCalculations] = useState<CalculationHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/history')
      const data = await response.json()
      setCalculations(data)
    } catch (error) {
      console.error('Error loading history:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading calculation history...</p>
      </div>
    )
  }

  if (calculations.length === 0) {
    return (
      <div className="text-center py-12">
        <Inbox className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No calculations yet</h3>
        <p className="text-gray-600 mb-6">Start by calculating your first ROI to see it here!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Recent Calculations */}
      <div className="grid gap-4">
        {calculations.slice(0, 5).map((calc) => (
          <div
            key={calc.id}
            className="bg-gray-50 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">{calc.project_name}</h3>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                calc.calculated_roi >= 20 ? 'bg-green-100 text-green-800' :
                calc.calculated_roi >= 10 ? 'bg-blue-100 text-blue-800' :
                calc.calculated_roi >= 0 ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {calc.calculated_roi}% ROI
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Investment</div>
                <div className="font-medium text-gray-900">{formatCurrency(calc.initial_investment)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Revenue/Year</div>
                <div className="font-medium text-gray-900">{formatCurrency(calc.annual_revenue)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Expenses/Year</div>
                <div className="font-medium text-gray-900">{formatCurrency(calc.annual_expenses)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Duration</div>
                <div className="font-medium text-gray-900">{calc.project_duration} years</div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatDate(calc.created_at)}
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {calc.calculated_roi >= 0 ? 'Profitable' : 'Loss-making'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      {calculations.length > 5 && (
        <div className="text-center pt-4">
          <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
            View All Calculations ({calculations.length})
          </button>
        </div>
      )}
    </div>
  )
}
