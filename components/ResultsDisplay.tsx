'use client'

import { TrendingUp, DollarSign, Clock, BarChart3, Info } from 'lucide-react'
import { ROIResults, getROIInterpretation, formatCurrency } from '@/lib/roi-calculations'

interface ResultsDisplayProps {
  results: ROIResults
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const { roi_percentage, total_revenue, total_expenses, net_profit, payback_period } = results

  return (
    <div className="space-y-6">
      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* ROI Percentage - Primary */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 rounded-xl text-center">
          <div className="text-sm font-medium opacity-90 mb-2">ROI Percentage</div>
          <div className="text-3xl font-bold">{roi_percentage}%</div>
          <TrendingUp className="w-8 h-8 mx-auto mt-2 opacity-80" />
        </div>

        {/* Net Profit */}
        <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-2">Net Profit</div>
          <div className={`text-2xl font-bold ${net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(net_profit)}
          </div>
          <DollarSign className="w-6 h-6 mx-auto mt-2 text-gray-400" />
        </div>

        {/* Total Revenue */}
        <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-2">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-800">{formatCurrency(total_revenue)}</div>
          <TrendingUp className="w-6 h-6 mx-auto mt-2 text-gray-400" />
        </div>

        {/* Total Expenses */}
        <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-2">Total Expenses</div>
          <div className="text-2xl font-bold text-gray-800">{formatCurrency(total_expenses)}</div>
          <DollarSign className="w-6 h-6 mx-auto mt-2 text-gray-400" />
        </div>

        {/* Payback Period */}
        <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-2">Payback Period</div>
          <div className="text-2xl font-bold text-gray-800">
            {typeof payback_period === 'number' ? `${payback_period} years` : payback_period}
          </div>
          <Clock className="w-6 h-6 mx-auto mt-2 text-gray-400" />
        </div>

        {/* ROI Status */}
        <div className="bg-gray-50 p-6 rounded-xl text-center border border-gray-200">
          <div className="text-sm font-medium text-gray-600 mb-2">ROI Status</div>
          <div className={`text-lg font-semibold ${
            roi_percentage >= 20 ? 'text-green-600' :
            roi_percentage >= 10 ? 'text-blue-600' :
            roi_percentage >= 0 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {roi_percentage >= 20 ? 'Excellent' :
             roi_percentage >= 10 ? 'Good' :
             roi_percentage >= 0 ? 'Positive' : 'Poor'}
          </div>
          <BarChart3 className="w-6 h-6 mx-auto mt-2 text-gray-400" />
        </div>
      </div>

      {/* ROI Interpretation */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Info className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-800 mb-2">ROI Analysis</h3>
            <p className="text-blue-700 leading-relaxed">
              {getROIInterpretation(roi_percentage)}
            </p>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Key Insights</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              net_profit >= 0 ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-700">
              {net_profit >= 0 
                ? `This investment will generate a profit of ${formatCurrency(net_profit)} over the project duration.`
                : `This investment will result in a loss of ${formatCurrency(Math.abs(net_profit))} over the project duration.`
              }
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              roi_percentage >= 10 ? 'bg-green-500' : roi_percentage >= 0 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-700">
              {roi_percentage >= 10 
                ? 'This represents a strong return on investment.'
                : roi_percentage >= 0 
                ? 'This provides a modest return on investment.'
                : 'This investment may not be financially viable.'
              }
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-gray-700">
              {typeof payback_period === 'number' && payback_period > 0
                ? `The initial investment will be recovered in approximately ${payback_period} years.`
                : 'The payback period calculation indicates this investment may not generate positive cash flow.'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
