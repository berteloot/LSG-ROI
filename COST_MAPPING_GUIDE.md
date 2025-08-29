# Cost Mapping System Guide

This guide explains how the cost mapping system works in the Investment Analysis Suite, specifically how it feeds into B11 calculations for employer costs.

## 🏗️ **System Architecture**

### **Components Overview**
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cost Mapping  │    │   Aggregates API │    │  B11 Calculator │
│   (lib/costMapping.ts) │    │   (/api/calculator/aggregates) │    │   (components/B11Calculator.tsx) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                        │
│              ┌─────────────────────────────────┐                │
│              │        EmployerCostData         │                │
│              │  - state, category, ratePercent │                │
│              │  - employerCostUSD, notes, etc. │                │
│              └─────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

## 📊 **Cost Mapping System**

### **Inclusion Keys**
The system defines 6 main cost categories that can be toggled on/off:

1. **`payrollTaxes`** - Federal and state payroll taxes
2. **`customaryBenefits`** - Standard employee benefits
3. **`administrativeOverhead`** - HR, legal, compliance costs
4. **`itInfrastructure`** - Computer equipment, software, IT support
5. **`realEstate`** - Office space, utilities, maintenance
6. **`workforceManagement`** - Training, recruitment, performance management

### **State-Specific Mappings**
Each inclusion key maps to different cost categories based on the selected state:

```typescript
// Example: payrollTaxes for California
payrollTaxes: {
  "federal": ["Federal Income Tax", "FICA", "Medicare", "Social Security"],
  "CA": ["State Disability Insurance", "State Unemployment Insurance", "Employment Training Tax"],
  "default": ["State Unemployment Insurance"]
}
```

### **Category Mapping Function**
```typescript
export function categoriesFor(key: InclusionKey, state: string): string[] {
  // Get state-specific categories
  const stateCategories = mappings[key][state] || mappings[key]["default"];
  
  // Always include federal categories
  const federalCategories = mappings[key]["federal"] || [];
  
  // Combine and remove duplicates
  return [...new Set([...federalCategories, ...stateCategories])];
}
```

## 🔌 **API Endpoints**

### **1. Aggregates API (`/api/calculator/aggregates`)**
This endpoint sums raw cost data by inclusion group:

```typescript
// Request: GET /api/calculator/aggregates?state=CA
// Response:
{
  "state": "CA",
  "aggregates": {
    "payrollTaxes": 12.45,
    "customaryBenefits": 25.30,
    "administrativeOverhead": 8.75,
    "itInfrastructure": 5.20,
    "realEstate": 12.80,
    "workforceManagement": 4.50
  }
}
```

**How it works:**
1. Fetches all cost rows for the selected state
2. For each inclusion key, gets the relevant categories
3. Sums the `ratePercent` values for those categories
4. Returns aggregated percentages

### **2. Costs API (`/api/costs`)**
Similar to aggregates but with more detailed breakdowns.

## 🧮 **B11 Calculation Process**

### **Step 1: Fetch Aggregates**
```typescript
const response = await fetch(`/api/calculator/aggregates?state=${selectedState}`)
const { aggregates } = await response.json()
```

### **Step 2: Calculate Total Costs**
```typescript
const calculateB11 = () => {
  let totalCostPercentage = 0
  const breakdown = {}

  includedKeys.forEach(key => {
    const percentage = aggregates[key] || 0
    totalCostPercentage += percentage
    breakdown[key] = {
      percentage,
      amount: (baseSalary * percentage) / 100
    }
  })

  const totalCostAmount = (baseSalary * totalCostPercentage) / 100
}
```

### **Step 3: Display Results**
- Base salary
- Total cost percentage
- Total cost amount
- Breakdown by category
- Total employee cost (salary + costs)

## 🎯 **Usage Examples**

### **Example 1: California Employee**
```typescript
// State: CA
// Base Salary: $100,000
// Included Categories: payrollTaxes, customaryBenefits, administrativeOverhead

// Results:
// - Payroll Taxes: 12.45% = $12,450
// - Customary Benefits: 25.30% = $25,300
// - Administrative Overhead: 8.75% = $8,750
// - Total Cost: 46.50% = $46,500
// - Total Employee Cost: $146,500
```

### **Example 2: Texas Employee**
```typescript
// State: TX
// Base Salary: $80,000
// Included Categories: payrollTaxes, customaryBenefits

// Results:
// - Payroll Taxes: 7.65% = $6,120
// - Customary Benefits: 25.30% = $20,240
// - Total Cost: 32.95% = $26,360
// - Total Employee Cost: $106,360
```

## 🔧 **Customization Options**

### **Adding New States**
1. Update the `categoriesFor` function in `lib/costMapping.ts`
2. Add state-specific categories for each inclusion key
3. Update `getAvailableStates()` function

### **Adding New Cost Categories**
1. Add new inclusion key to the `InclusionKey` type
2. Add mapping for the new key in `categoriesFor`
3. Update display names and descriptions
4. Add to the API endpoints

### **Modifying Category Mappings**
Edit the category arrays in the `categoriesFor` function to match your database structure.

## 📱 **User Interface**

### **Cost Calculator (`/costs`)**
- State selection dropdown
- Interactive toggle switches for each cost category
- Real-time cost calculations
- Visual breakdown of costs

### **B11 Calculator (`/b11`)**
- State and base salary inputs
- Category selection toggles
- Comprehensive cost breakdown
- Total employee cost calculation

### **Main Dashboard (`/`)**
- Navigation to all calculators
- Recent calculation history
- Quick access to different tools

## 🚀 **Integration with ROI Calculator**

The cost mapping system can be integrated with the ROI calculator to:

1. **Calculate Project Costs**: Use B11 calculations to determine actual employee costs
2. **Compare Locations**: Analyze costs across different states
3. **Optimize Investments**: Factor in location-specific costs for project planning
4. **Budget Planning**: Use accurate cost data for project budgeting

## 🔍 **Debugging and Testing**

### **Check API Responses**
```bash
# Test aggregates API
curl "http://localhost:3000/api/calculator/aggregates?state=CA"

# Test costs API
curl "http://localhost:3000/api/costs?state=CA"
```

### **Verify Category Mappings**
```typescript
import { categoriesFor } from '@/lib/costMapping'

// Check what categories are included for a specific key and state
console.log(categoriesFor('payrollTaxes', 'CA'))
// Output: ["Federal Income Tax", "FICA", "Medicare", "Social Security", "State Disability Insurance", "State Unemployment Insurance", "Employment Training Tax"]
```

### **Database Verification**
```sql
-- Check available states
SELECT DISTINCT state FROM "EmployerCostData";

-- Check categories for a specific state
SELECT category, ratePercent FROM "EmployerCostData" WHERE state = 'CA';

-- Check total cost for a category
SELECT SUM(ratePercent) FROM "EmployerCostData" 
WHERE state = 'CA' AND category IN ('Federal Income Tax', 'FICA', 'Medicare');
```

## 📚 **Best Practices**

1. **State Validation**: Always validate state parameters before querying
2. **Error Handling**: Implement proper error handling for database queries
3. **Caching**: Consider caching aggregate results for frequently accessed states
4. **Data Consistency**: Ensure category names match exactly between code and database
5. **Performance**: Use database indexes on state and category columns

## 🔮 **Future Enhancements**

- **Multi-state Comparison**: Compare costs across multiple states
- **Industry-specific Categories**: Add industry-specific cost mappings
- **Historical Data**: Track cost changes over time
- **Export Functionality**: Export calculations to Excel/PDF
- **API Rate Limiting**: Implement rate limiting for production use
- **User Authentication**: Add user accounts and saved calculations

---

This cost mapping system provides a flexible, scalable foundation for employer cost calculations that can be easily extended and customized for different business needs.
