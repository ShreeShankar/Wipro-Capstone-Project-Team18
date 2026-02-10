import { Customer } from './customer.model';
import { Policy } from './policy.model';

export interface CustomerPolicy {
  id?: number;
  customer: Customer;
  policy: Policy;
  startDate: string; // yyyy-mm-dd
  endDate: string;   // yyyy-mm-dd
  status: string;    // ACTIVE/PENDING/EXPIRED
  premiumAmount: number;
}
