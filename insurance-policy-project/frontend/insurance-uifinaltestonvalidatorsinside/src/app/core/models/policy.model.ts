export interface Policy {
  id?: number;
  policyName: string;
  policyType: string;
  premiumAmount: number;
  durationMonths: number;
  coverageAmount: number;      
  created_at?: Date;
}

//Creating a separate interface for Policy form data
export interface PolicyFormData {
  policyName: string;
  policyType: string;
  premiumAmount: number;
  durationMonths: number;
  coverageAmount: number;
  description: string;
  startDate: string;
  endDate: string;
}

