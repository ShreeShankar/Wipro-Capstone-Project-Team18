import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api';
import { Payment } from '../models/payment.model';

export interface PaymentRequest {
  customerPolicyId: number;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  paymentStatus: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentService {
  constructor(private http: HttpClient) {}

  pay(req: PaymentRequest): Observable<Payment> {
    return this.http.post<Payment>(API.payments, req);
  }

  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(API.payments);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API.payments}/${id}`);
  }
}
