import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Customer } from '../models/customer.model';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, delay } from 'rxjs/operators';
import { API } from '../constants/api';

interface StoredCustomer extends Customer {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class CustomerService {
  // Toggle this to true to force using localStorage mock fallback
  private useLocalMock = true;

  constructor(private http: HttpClient) {}

  private loadFromStorage(): StoredCustomer[] {
    const raw = localStorage.getItem('customers');
    if (!raw) return [];
    try {
      return JSON.parse(raw) as StoredCustomer[];
    } catch (e) {
      console.warn('Failed to parse customers from storage', e);
      return [];
    }
  }

  private saveToStorage(customers: StoredCustomer[]) {
    localStorage.setItem('customers', JSON.stringify(customers));
  }

  private nextIdFromStorage(): number {
    const customers = this.loadFromStorage();
    if (customers.length === 0) return 1;
    return Math.max(...customers.map((c) => c.id)) + 1;
  }

  create(customer: Customer): Observable<Customer> {
    if (this.useLocalMock) {
      const customers = this.loadFromStorage();
      const id = this.nextIdFromStorage();
      const created: StoredCustomer = { id, ...customer } as StoredCustomer;
      customers.push(created);
      this.saveToStorage(customers);
      return of(created).pipe(delay(300));
    }

    return this.http.post<Customer>(API.customers, customer).pipe(
      catchError((err) => {
        // fallback to localStorage if network/backend fails
        console.warn('Create failed, falling back to localStorage', err);
        const customers = this.loadFromStorage();
        const id = this.nextIdFromStorage();
        const created: StoredCustomer = { id, ...customer } as StoredCustomer;
        customers.push(created);
        this.saveToStorage(customers);
        return of(created).pipe(delay(300));
      })
    );
  }

  getAll(): Observable<Customer[]> {
    if (this.useLocalMock) {
      return of(this.loadFromStorage()).pipe(delay(200));
    }

    return this.http.get<Customer[]>(API.customers).pipe(
      catchError((err) => {
        console.warn('Get all failed, falling back to localStorage', err);
        return of(this.loadFromStorage()).pipe(delay(200));
      })
    );
  }

  delete(id: number): Observable<string> {
    if (this.useLocalMock) {
      const customers = this.loadFromStorage();
      const idx = customers.findIndex((c) => c.id === id);
      if (idx === -1) return throwError(() => ({ status: 404, error: { message: 'Customer not found' } }));
      customers.splice(idx, 1);
      this.saveToStorage(customers);
      return of(`Customer ${id} deleted`).pipe(delay(200));
    }

    return this.http.delete(`${API.customers}/${id}`, { responseType: 'text' }).pipe(
      catchError((err) => {
        console.warn('Delete failed, falling back to localStorage', err);
        const customers = this.loadFromStorage();
        const idx = customers.findIndex((c) => c.id === id);
        if (idx === -1) return throwError(() => ({ status: 404, error: { message: 'Customer not found' } }));
        customers.splice(idx, 1);
        this.saveToStorage(customers);
        return of(`Customer ${id} deleted (local fallback)`).pipe(delay(200));
      })
    );
  }
}
