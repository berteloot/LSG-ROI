"use client";

import React, { useEffect, useMemo, useState } from "react";
import { computeTotals, type Aggregates } from "@/lib/roi";
import { type InclusionKey } from "@/lib/costMapping";
import { Building2, Briefcase, DollarSign, Users, Lightbulb, TrendingUp, Calculator, Target, Lock, Mail, Building, CheckCircle } from "lucide-react";

const STATES = [
  "District of Columbia", "Alabama","Alaska","Arizona","Arkansas","California","Colorado",
  "Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois",
  "Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
  "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana",
  "Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York",
  "North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah",
  "Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

// Role categories will be fetched from the database
interface RoleCategory {
  id: string;
  name: string;
  description: string;
  monthlyCost: number;
  isActive: boolean;
}

type Inclusions = Record<InclusionKey, boolean>;

// Use all available cost categories from the database (excluding real estate)
const ALL_CATEGORIES: Inclusions = {
  payrollTaxes: true,
  customaryBenefits: true,
  administrativeOverhead: true,
  itInfrastructure: true,
  realEstate: false,
  workforceManagement: true,
};

// Business email validation
const blockedDomains = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
  "icloud.com", "aol.com", "protonmail.com", "gmx.com", "zoho.com"
];

function isBusinessEmail(email: string): boolean {
  if (!email.includes("@")) return false;
  const domain = email.split("@").pop()?.toLowerCase() || "";
  return !blockedDomains.includes(domain);
}

interface LeadData {
  companyName: string;
  email: string;
}

export default function LSGCalculator() {
  console.log('LSGCalculator component rendering...');
  
  const [state, setState] = useState("Arizona");
  const [baseMonthlySalary, setBase] = useState<number>(5000);
  const [fteCount, setFtes] = useState<number>(10);
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<string>("");
  const [aggregates, setAggregates] = useState<Aggregates | null>(null);
  const [inclusions, setInclusions] = useState<Inclusions>(ALL_CATEGORIES);

  
  // Role categories state
  const [roleCategories, setRoleCategories] = useState<RoleCategory[]>([]);
  const [roleCategoriesLoading, setRoleCategoriesLoading] = useState(true);
  
  // Lead generation state
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [leadData, setLeadData] = useState<LeadData>({ companyName: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(false);
  const [showSavings, setShowSavings] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Fetch role categories on component mount
  useEffect(() => {
    console.log('useEffect for role categories is running!');
    
    const fetchRoleCategories = async () => {
      console.log('Fetching role categories...');
      try {
        const response = await fetch('/api/admin/cost-categories');
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (response.ok) {
          const result = await response.json();
          console.log('Role categories result:', result);
          // Add shape check for safety
          const arr = Array.isArray(result.data) ? result.data : [];
          setRoleCategories(arr);
          console.log('Role categories set:', arr.length, 'categories');
          // Set the first category as default if available
          if (arr.length > 0 && !selectedRoleCategory) {
            console.log('Setting default category:', arr[0].id);
            setSelectedRoleCategory(arr[0].id);
          }
        } else {
          console.error('Response not ok:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Failed to fetch role categories:', error);
      } finally {
        setRoleCategoriesLoading(false);
        console.log('Role categories loading finished');
      }
    };

    fetchRoleCategories();
  }, []); // Empty dependency array - runs once on mount

  useEffect(() => {
    console.log('Fetching data for state:', state);
    fetch(`/api/calculator/aggregates?state=${encodeURIComponent(state)}`)
      .then(r => r.json())
      .then(data => {
        console.log('API response:', data);
        setAggregates(data.aggregates);
      })
      .catch((error) => {
        console.error('API error:', error);
        setAggregates(null);
      });
  }, [state]);

  const results = useMemo(() => {
    console.log('Computing results with:', { baseMonthlySalary, fteCount, aggregates, inclusions });
    if (!aggregates) {
      console.log('Missing data for calculation:', { aggregates });
      return null;
    }
    const computed = computeTotals(baseMonthlySalary, fteCount, aggregates, inclusions);
    console.log('Computed results:', computed);
    return computed;
  }, [baseMonthlySalary, fteCount, aggregates, inclusions]);

  const selectedRole = roleCategories.find(r => r.id === selectedRoleCategory);
  const inHouseTotalMonthlyCost = results ? results.inHouseMonthlyAllFTEs : 0;
  
  // Use the selected role category's monthly cost if available, otherwise fall back to 60% of base salary
  const roleCategoryCost = Number.isFinite(selectedRole?.monthlyCost) ? (selectedRole?.monthlyCost as number) : 0;
  const lsgEstimatedCost = roleCategoryCost > 0 
    ? roleCategoryCost * fteCount 
    : baseMonthlySalary * 0.6 * fteCount;
  
  const monthlySavings = inHouseTotalMonthlyCost - lsgEstimatedCost;
  const annualSavings = monthlySavings * 12;
  const savingsPercentage = inHouseTotalMonthlyCost > 0 ? (monthlySavings / inHouseTotalMonthlyCost) * 100 : 0;

  // Safe division for per-FTE extras
  const perFteExtras = results && fteCount > 0 ? results.employerExtrasMonthlyAllFTEs / fteCount : 0;


  const money = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const pct = (n: number) => `${n.toFixed(1)}%`;

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData.companyName.trim() || !leadData.email.trim()) return;

    // Validate business email
    if (!isBusinessEmail(leadData.email)) {
      setEmailError("Please use your work email address (no personal email domains like Gmail, Yahoo, etc.)");
      return;
    }

    setIsSubmitting(true);
    setEmailError("");

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: leadData.companyName.trim(),
          email: leadData.email.trim(),
          state,
          baseMonthlySalary,
          fteCount,
          selectedRoleCategory,
          inclusions,
          calculatedSavings: savingsPercentage,
          calculatedCosts: inHouseTotalMonthlyCost
        }),
      });

      if (response.ok) {
        setLeadSubmitted(true);
        setShowSavings(true);
        setShowLeadForm(false);
      } else {
        throw new Error('Failed to submit lead');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlockSavings = () => {
    setShowLeadForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


        {/* Enhanced Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            LSG vs In-House Cost Calculator
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Compare your current in-house costs with our managed services. See exactly how much you can save by switching to LSG.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Left Section: Company Information */}
          <div className="space-y-8">
            {/* Section Header */}
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center lg:justify-start gap-3">
                <Target className="w-8 h-8 text-blue-600" />
                Company Information
              </h2>
              <p className="text-gray-600 text-lg">Tell us about your business to get accurate cost comparisons</p>
            </div>
            
            {/* Quick Start Guide */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Quick Start Guide</h3>
                  <p className="text-blue-700 leading-relaxed">
                    Fill out these details to see your personalized cost comparison. The more accurate your information, the better we can estimate your potential savings!
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-8">
              {/* State Selection */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <span className="text-lg">Where is your business located?</span>
                  </div>
                </label>
                <select 
                  className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 bg-white text-gray-700 transition-all duration-200 hover:border-gray-300"
                  value={state} 
                  onChange={e => setState(e.target.value)}
                >
                  <option value="">Select your state to see region-specific cost calculations.</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Role Category */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="text-lg">What type of work do you need done?</span>
                  </div>
                </label>
                <select 
                  className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 focus:ring-4 focus:ring-purple-100 focus:border-purple-500 bg-white text-gray-700 transition-all duration-200 hover:border-gray-300"
                  value={selectedRoleCategory} 
                  onChange={e => setSelectedRoleCategory(e.target.value)}
                >
                  <option value="">Select the category that best matches your business needs.</option>
                  {roleCategoriesLoading ? (
                    <option value="">Loading role categories...</option>
                  ) : roleCategories.length === 0 ? (
                    <option value="">No role categories available</option>
                  ) : (
                    roleCategories.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))
                  )}
                </select>
                {selectedRole && (
                  <p className="text-sm text-gray-500 mt-3 px-4 py-2 bg-gray-50 rounded-lg">{selectedRole.description}</p>
                )}

              </div>

              {/* Base Salary */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <span className="text-lg">What's your typical monthly salary for this role?</span>
                  </div>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-medium">$</span>
                  <input 
                    className="w-full border-2 border-gray-200 rounded-xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-green-100 focus:border-green-500 bg-white text-gray-700 transition-all duration-200 hover:border-gray-300" 
                    type="number" 
                    min={0} 
                    placeholder="Enter the base monthly salary per employee (before taxes and benefits)."
                    value={baseMonthlySalary} 
                    onChange={e => setBase(parseFloat(e.target.value || "0"))} 
                  />
                </div>
              </div>

              {/* FTE Count */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-lg">How many employees do you need?</span>
                  </div>
                </label>
                <input 
                  className="w-full border-2 border-gray-200 rounded-xl px-5 py-4 focus:ring-4 focus:ring-orange-100 focus:border-orange-500 bg-white text-gray-700 transition-all duration-200 hover:border-gray-300 text-center" 
                  type="number" 
                  min={1} 
                  placeholder="Enter the number of full-time employees (FTEs) for this role."
                  value={fteCount} 
                  onChange={e => setFtes(parseInt(e.target.value || "1", 10))} 
                />
              </div>
            </div>


          </div>

          {/* Right Section: Enhanced Calculation Results */}
          <div className="space-y-8">
            {/* Section Header */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full mb-4">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">Key Calculation Results</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Cost Analysis</h2>
              <p className="text-gray-600 text-lg">See exactly how much you can save with LSG</p>
            </div>

            <div className="space-y-6">
              {/* Total Employer Load */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-blue-900">
                    Total Employer Load (% of Wage)
                  </h3>
                  <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-blue-700" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-blue-800 mb-2">
                  {results ? pct(results.totalEmployerLoadPct) : "—"}
                </div>
                <p className="text-blue-700 font-medium">Calculation includes: payroll taxes, employee benefits, administrative overhead, IT infrastructure, workforce management, and the monthly cost of your selected role</p>
              </div>

              {/* Monthly Employer Extras per FTE */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-900">
                    Monthly Employer Extras per FTE
                  </h3>
                  <div className="w-12 h-12 bg-purple-200 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-700" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-purple-800 mb-2">
                  {results ? money(perFteExtras) : "—"}
                </div>
                <p className="text-purple-700 font-medium">Monthly employer extras per full-time employee</p>
              </div>

              {/* Monthly In-House Total Cost for All FTEs */}
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-indigo-900">
                    Monthly In-House Total Cost for All FTEs
                  </h3>
                  <div className="w-12 h-12 bg-indigo-200 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-indigo-700" />
                  </div>
                </div>
                <div className="text-4xl font-bold text-indigo-800 mb-2">
                  {results ? money(results.inHouseMonthlyAllFTEs) : "—"}
                </div>
                <p className="text-indigo-700 font-medium">Monthly base salary + employer extras for all FTEs</p>
              </div>



              {/* Gated Savings with LSG */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-8 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-900">
                    Projected LSG Savings
                  </h3>
                  <div className="w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-700" />
                  </div>
                </div>
                
                {!showSavings ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock className="w-8 h-8 text-green-700" />
                    </div>
                    <h4 className="text-xl font-semibold text-green-800 mb-2">Unlock Your Savings</h4>
                    <p className="text-green-700 mb-4">Get your personalized savings percentage by providing your company details</p>
                    <button
                      onClick={handleUnlockSavings}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      Unlock Savings
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl font-bold text-green-800 mb-2">
                      {savingsPercentage > 0 ? pct(savingsPercentage) : "—"}
                    </div>
                    <p className="text-green-700 font-medium">Expected savings vs in-house operations</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lead Generation Modal */}
        {showLeadForm && !leadSubmitted && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Your Savings Report</h3>
                <p className="text-gray-600">Enter your details to see exactly how much you can save with LSG</p>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Please use your work email address for business inquiries
                  </p>
                </div>
              </div>

              <form onSubmit={handleLeadSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      Company Name
                    </div>
                  </label>
                  <input
                    type="text"
                    required
                    value={leadData.companyName}
                    onChange={(e) => setLeadData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200"
                    placeholder="Enter your company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      Business Email
                    </div>
                  </label>
                  <input
                    type="email"
                    required
                    value={leadData.email}
                    onChange={(e) => {
                      setLeadData(prev => ({ ...prev, email: e.target.value }));
                      if (emailError) setEmailError(""); // Clear error when user types
                    }}
                    className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-4 focus:ring-green-100 focus:border-green-500 transition-all duration-200 ${
                      emailError ? 'border-red-300 focus:ring-red-100 focus:border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Enter your work email (e.g., you@company.com)"
                  />
                  {emailError && (
                    <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
                      <span className="w-4 h-4 text-red-500">⚠️</span>
                      {emailError}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowLeadForm(false)}
                    className="flex-1 px-4 py-3 text-gray-600 border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !leadData.companyName.trim() || !leadData.email.trim() || !!emailError}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Get My Savings'}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  By submitting this form, you agree to receive communications from LSG about our services.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Success Message Modal */}
        {leadSubmitted && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email! 📧</h3>
                <p className="text-gray-600 mb-6">
                  Your personalized LSG cost analysis has been sent to <strong>{leadData.email}</strong>. 
                  The email includes your complete calculation results and cost breakdown.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-green-800">
                    <strong>What's in your email:</strong>
                  </p>
                  <ul className="text-sm text-green-700 mt-2 space-y-1">
                    <li>• Your projected savings percentage</li>
                    <li>• Detailed cost breakdown</li>
                    <li>• Business profile summary</li>
                    <li>• Next steps to get started</li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    setLeadSubmitted(false);
                    setShowLeadForm(false);
                    setShowSavings(true);
                  }}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200"
                >
                  Got It!
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
