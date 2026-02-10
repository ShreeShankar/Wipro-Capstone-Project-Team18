import { CustomerPolicy } from './customer-policy.model';

export interface Claim {
  id?: number;
  customerPolicy: CustomerPolicy;
  claimAmount: number;
  claimDate: string;
  claimStatus: string;
  description: string;
}
