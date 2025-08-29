'use client'

import { useState } from 'react'
import { Calculator, DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react'
import { ROIData } from '@/lib/roi-calculations'

interface ROICalculatorProps {
  onSubmit: (data: ROIData) => void
  isCalculating: boolean
}

export default function ROICalculator({ onSubmit, isCalculating }: ROICalculatorProps) {
  const [formData, setFormData] = useState<ROIData>({
    project_name: '',
    initial_investment: 0,
    annual_revenue: 0,
    annual_expenses: 0,
    project_duration: 5
  })

  const [errors, setErrors] = useState<Record<keyof ROIData, string | undefined>>({} as Record<keyof ROIData, string | undefined>)

  const handleInputChange = (field: keyof ROIData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<keyof ROIData, string | undefined> = {} as Record<keyof ROIData, string | undefined>

    if (!formData.project_name.trim()) {
      newErrors.project_name = 'Project name is required'
    }

    if (formData.initial_investment <= 0) {
      newErrors.initial_investment = 'Initial investment must be greater than 0'
    }

    if (formData.annual_revenue < 0) {
      newErrors.annual_revenue = 'Annual revenue cannot be negative'
    }

    if (formData.annual_expenses < 0) {
      newErrors.annual_expenses = 'Annual expenses cannot be negative'
    }

    if (formData.project_duration < 1 || formData.project_duration > 50) {
      newErrors.project_duration = 'Project duration must be between 1 and 50 years'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).filter(key => newErrors[key as keyof ROIData]).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Project Name */}
      <div>
        <label htmlFor="project_name" className="block text-sm font-medium text-gray-700 mb-2">
          Project Name
        </label>
        <input
          type="text"
          id="project_name"
          value={formData.project_name}
          onChange={(e) => handleInputChange('project_name', e.target.value)}
          className={`input-field ${errors.project_name ? 'border-red-500' : ''}`}
          placeholder="Enter project name"
          required
        />
        {errors.project_name && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {errors.project_name}
          </p>
        )}
      </div>

      {/* Investment and Duration Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="initial_investment" className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Initial Investment
          </label>
          <input
            type="number"
            id="initial_investment"
            value={formData.initial_investment || ''}
            onChange={(e) => handleInputChange('initial_investment', parseFloat(e.target.value) || 0)}
            className={`input-field ${errors.initial_investment ? 'border-red-500' : ''}`}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
          {errors.initial_investment && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.initial_investment}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="project_duration" className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Project Duration (Years)
          </label>
          <input
            type="number"
            id="project_duration"
            value={formData.project_duration || ''}
            onChange={(e) => handleInputChange('project_duration', parseInt(e.target.value) || 0)}
            className={`input-field ${errors.project_duration ? 'border-red-500' : ''}`}
            placeholder="5"
            min="1"
            max="50"
            required
          />
          {errors.project_duration && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.project_duration}
            </p>
          )}
        </div>
      </div>

      {/* Revenue and Expenses Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="annual_revenue" className="block text-sm font-medium text-gray-700 mb-2">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Annual Revenue
          </label>
          <input
            type="number"
            id="annual_revenue"
            value={formData.annual_revenue || ''}
            onChange={(e) => handleInputChange('annual_revenue', parseFloat(e.target.value) || 0)}
            className={`input-field ${errors.annual_revenue ? 'border-red-500' : ''}`}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
          {errors.annual_revenue && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.annual_revenue}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="annual_expenses" className="block text-sm font-medium text-gray-700 mb-2">
            <DollarSign className="w-4 h-4 inline mr-1" />
            Annual Expenses
          </label>
          <input
            type="number"
            id="annual_expenses"
            value={formData.annual_expenses || ''}
            onChange={(e) => handleInputChange('annual_expenses', parseFloat(e.target.value) || 0)}
            className={`input-field ${errors.annual_expenses ? 'border-red-500' : ''}`}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
          {errors.annual_expenses && (
            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.annual_expenses}
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isCalculating}
        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <Calculator className="w-5 h-5" />
        {isCalculating ? 'Calculating...' : 'Calculate ROI'}
      </button>
    </form>
  )
}
