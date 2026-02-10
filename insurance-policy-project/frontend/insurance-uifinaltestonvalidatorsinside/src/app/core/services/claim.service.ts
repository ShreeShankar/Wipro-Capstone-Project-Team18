import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API } from '../constants/api';
import { Claim } from '../models/claim.model';

export interface ClaimRequest {
  customerPolicyId: number;
  claimAmount: number;
  claimDate: string;
  claimStatus: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class ClaimService {
  constructor(private http: HttpClient) {}

  raise(req: ClaimRequest): Observable<Claim> {
    return this.http.post<Claim>(API.claims, req);
  }

  getAll(): Observable<Claim[]> {
    return this.http.get<Claim[]>(API.claims);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${API.claims}/${id}`);
  }
}
