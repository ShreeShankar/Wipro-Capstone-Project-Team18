import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Policy } from '../models/policy.model';
import { Observable } from 'rxjs';
import { API } from '../constants/api';

@Injectable({ providedIn: 'root' })
export class PolicyService {
  constructor(private http: HttpClient) {}

  create(policy: Policy): Observable<Policy> {
    return this.http.post<Policy>(API.policies, policy);
  }

  getAll(): Observable<Policy[]> {
    return this.http.get<Policy[]>(API.policies);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${API.policies}/${id}`, { responseType: 'text' });
  }
}
