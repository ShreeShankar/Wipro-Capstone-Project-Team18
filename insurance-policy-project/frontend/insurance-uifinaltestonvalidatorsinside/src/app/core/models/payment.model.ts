import { CustomerPolicy } from './customer-policy.model';

export interface Payment {
  id?: number;
  customerPolicy: CustomerPolicy;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  paymentStatus: string;
}
