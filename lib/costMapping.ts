export type InclusionKey =
  | "payrollTaxes"
  | "customaryBenefits"
  | "administrativeOverhead"
  | "itInfrastructure"
  | "realEstate"
  | "workforceManagement";

export const DEFAULT_INCLUSIONS: Record<InclusionKey, boolean> = {
  payrollTaxes: true,              // C21
  customaryBenefits: true,         // C22
  administrativeOverhead: true,    // C23
  itInfrastructure: false,         // C24
  realEstate: false,               // C25
  workforceManagement: false,      // C26
};

export function categoriesFor(key: InclusionKey, state: string): string[] {
  const m: Record<InclusionKey, string[]> = {
    payrollTaxes: ["Federal Tax", `${state} Tax`],
    customaryBenefits: [
      "Healthcare",
      "Retirement",
      "Paid Time Off",
      "Insurance & Protection",
      "Other Benefits",
    ],
    administrativeOverhead: [
      "Administrative",
    ],
    itInfrastructure: [
      "IT Infrastructure",
      "Telecom & Connectivity",
      "Equipment & Supplies",
    ],
    realEstate: [
      "Real Estate & Infrastructure",
    ],
    workforceManagement: [
      "Workforce Management",
    ],
  };
  return m[key];
}

export function getInclusionKeyDisplayName(key: InclusionKey): string {
  const names: Record<InclusionKey, string> = {
    payrollTaxes: "Payroll Taxes",
    customaryBenefits: "Customary Benefits",
    administrativeOverhead: "Administrative Overhead",
    itInfrastructure: "IT Infrastructure",
    realEstate: "Real Estate",
    workforceManagement: "Workforce Management",
  };
  return names[key];
}

export function getInclusionKeyDescription(key: InclusionKey): string {
  const descriptions: Record<InclusionKey, string> = {
    payrollTaxes: "Federal and state taxes including Social Security, Medicare, FUTA, and SUTA",
    customaryBenefits: "Healthcare, retirement plans, paid time off, insurance, and other employee benefits",
    administrativeOverhead: "Recruitment, payroll processing, severance, legal compliance, and administrative costs",
    itInfrastructure: "Computers, monitors, software licenses, and telecommunications",
    realEstate: "Office space, utilities, cleaning, security, and facility maintenance",
    workforceManagement: "Training, quality assurance, workforce management tools, and supervisory costs",
  };
  return descriptions[key];
}

export function getAvailableStates(): string[] {
  return [
    "AL", "AK", "AZ", "AR", "CA", "CO",
    "CT", "DE", "DC", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY",
    "LA", "ME", "MD", "MA", "MI", "MN",
    "MS", "MO", "MT", "NE", "NV", "NH",
    "NJ", "NM", "NY", "NC", "ND",
    "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA",
    "WA", "WV", "WI", "WY"
  ];
}

export function getStateFullName(abbreviation: string): string {
  const stateMap: Record<string, string> = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas", "CA": "California", "CO": "Colorado",
    "CT": "Connecticut", "DE": "Delaware", "DC": "District of Columbia", "FL": "Florida", "GA": "Georgia",
    "HI": "Hawaii", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas", "KY": "Kentucky",
    "LA": "Louisiana", "ME": "Maine", "MD": "Maryland", "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota",
    "MS": "Mississippi", "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada", "NH": "New Hampshire",
    "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York", "NC": "North Carolina", "ND": "North Dakota",
    "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VT": "Vermont", "VA": "Virginia",
    "WA": "Washington", "WV": "West Virginia", "WI": "Wisconsin", "WY": "Wyoming"
  };
  return stateMap[abbreviation] || abbreviation;
}

export function calculateTotalCost(
  baseSalary: number,
  fteCount: number,
  aggregates: Record<InclusionKey, number>,
  inclusions: Record<InclusionKey, boolean>
): number {
  const totalPercentage = Object.entries(inclusions).reduce((total, [key, included]) => {
    if (included && aggregates[key as InclusionKey]) {
      return total + aggregates[key as InclusionKey];
    }
    return total;
  }, 0);

  return (baseSalary * totalPercentage / 100) * fteCount;
}
