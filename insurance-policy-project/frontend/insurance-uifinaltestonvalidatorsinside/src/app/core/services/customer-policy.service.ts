import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api';
import { CustomerPolicy } from '../models/customer-policy.model';

export interface AssignPolicyRequest {
  customerId: number;
  policyId: number;
  startDate: string;
  endDate: string;
  status: string;
  premiumAmount: number;
}

@Injectable({ providedIn: 'root' })
export class CustomerPolicyService {
  constructor(private http: HttpClient) {}

  assign(req: AssignPolicyRequest): Observable<CustomerPolicy> {
    return this.http.post<CustomerPolicy>(`${API.customerPolicies}/assign`, req);
  }

  getAll(): Observable<CustomerPolicy[]> {
    return this.http.get<CustomerPolicy[]>(API.customerPolicies);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API.customerPolicies}/${id}`);
  }
}
