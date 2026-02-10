import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpResponse,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';

interface DemoCustomer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
}

interface DemoPolicy {
  id: number;
  policyName: string;
  policyType: string;
  premiumAmount: number;
  coverageAmount: number;
}

interface CustomerPolicy {
  id: number;
  customerId: number;
  policyId: number;
  startDate: string;
  endDate: string;
  status: string;
  premiumAmount: number;
  customer?: DemoCustomer;
  policy?: DemoPolicy;
}

interface Payment {
  id: number;
  customerPolicyId: number;
  amount: number;
  paymentDate: string;
  paymentMode: string;
  paymentStatus: string;
  customerPolicy?: CustomerPolicy;
}

interface Claim {
  id: number;
  customerPolicyId: number;
  claimAmount: number;
  claimDate: string;
  claimStatus: string;
  description: string;
  customerPolicy?: CustomerPolicy;
}

@Injectable()
export class MockBackendInterceptor implements HttpInterceptor {
  // Mock data storage
  private customers: DemoCustomer[] = [
    {
      id: 1,
      firstName: 'Shaik',
      lastName: 'Haasif',
      email: 'haasiffire@gmail.com',
      phone: '9959075632',
      address: 'Kadapa'
    },
    {
      id: 2,
      firstName: 'Nani',
      lastName: 'Shaik',
      email: 'sz1803@gmail.com',
      phone: '9502943179',
      address: 'Nellore'
    },
    {
      id: 3,
      firstName: 'Khaki',
      lastName: 'Nani',
      email: 'nani@gmail.com',
      phone: '8985833246',
      address: 'Allur'
    }
  ];

  private policies: DemoPolicy[] = [
    {
      id: 1,
      policyName: 'Term Life Insurance',
      policyType: 'Life',
      premiumAmount: 5000,
      coverageAmount: 1000000
    },
    {
      id: 2,
      policyName: 'Health Insurance',
      policyType: 'Health',
      premiumAmount: 3000,
      coverageAmount: 500000
    },
    {
      id: 3,
      policyName: 'Motor Insurance',
      policyType: 'Auto',
      premiumAmount: 2000,
      coverageAmount: 200000
    }
  ];

  private customerPolicies: CustomerPolicy[] = [];
  private payments: Payment[] = [];
  private claims: Claim[] = [];
  
  private nextCustomerId = 4;
  private nextCustomerPolicyId = 1;
  private nextPaymentId = 1;
  private nextClaimId = 1;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    // Load customers
    const storedCustomers = localStorage.getItem('customers');
    if (storedCustomers) {
      try {
        const stored = JSON.parse(storedCustomers);
        this.customers = stored;
        if (stored.length > 0) {
          this.nextCustomerId = Math.max(...stored.map((c: DemoCustomer) => c.id)) + 1;
        }
      } catch (e) {
        console.warn('Failed to load customers from localStorage');
      }
    }

    // Load customer policies
    const storedPolicies = localStorage.getItem('customerPolicies');
    if (storedPolicies) {
      try {
        const stored = JSON.parse(storedPolicies);
        this.customerPolicies = stored;
        if (stored.length > 0) {
          this.nextCustomerPolicyId = Math.max(...stored.map((c: CustomerPolicy) => c.id)) + 1;
        }
      } catch (e) {
        console.warn('Failed to load customer policies from localStorage');
      }
    }

    // Load payments
    const storedPayments = localStorage.getItem('payments');
    if (storedPayments) {
      try {
        const stored = JSON.parse(storedPayments);
        this.payments = stored;
        if (stored.length > 0) {
          this.nextPaymentId = Math.max(...stored.map((p: Payment) => p.id)) + 1;
        }
      } catch (e) {
        console.warn('Failed to load payments from localStorage');
      }
    }

    // Load claims
    const storedClaims = localStorage.getItem('claims');
    if (storedClaims) {
      try {
        const stored = JSON.parse(storedClaims);
        this.claims = stored;
        if (stored.length > 0) {
          this.nextClaimId = Math.max(...stored.map((c: Claim) => c.id)) + 1;
        }
      } catch (e) {
        console.warn('Failed to load claims from localStorage');
      }
    }
  }

  private getCustomerById(id: number): DemoCustomer | undefined {
    return this.customers.find(c => c.id === id);
  }

  private getPolicyById(id: number): DemoPolicy | undefined {
    return this.policies.find(p => p.id === id);
  }

  private enrichCustomerPolicy(cp: CustomerPolicy): CustomerPolicy {
    return {
      ...cp,
      customer: this.getCustomerById(cp.customerId),
      policy: this.getPolicyById(cp.policyId)
    };
  }

  private enrichPayment(p: Payment): Payment {
    const cp = this.customerPolicies.find(cp => cp.id === p.customerPolicyId);
    return {
      ...p,
      customerPolicy: cp ? this.enrichCustomerPolicy(cp) : undefined
    };
  }

  private enrichClaim(c: Claim): Claim {
    const cp = this.customerPolicies.find(cp => cp.id === c.customerPolicyId);
    return {
      ...c,
      customerPolicy: cp ? this.enrichCustomerPolicy(cp) : undefined
    };
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const { url, method, body } = request;

    // Load fresh data from storage for each request
    this.loadFromStorage();

    // Handle customer operations
    if (url.includes('/api/customers')) {
      if (method === 'GET') {
        return of(new HttpResponse({ status: 200, body: [...this.customers] })).pipe(delay(300));
      }

      if (method === 'POST') {
        const newCustomer: DemoCustomer = {
          id: this.nextCustomerId,
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phone: body.phone,
          address: body.address
        };

        const emailExists = this.customers.some(c => c.email.toLowerCase() === newCustomer.email.toLowerCase());
        const phoneExists = this.customers.some(c => c.phone === newCustomer.phone);

        if (emailExists) {
          return throwError(() => new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: { message: 'Email already exists' }
          })).pipe(delay(300));
        }

        if (phoneExists) {
          return throwError(() => new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: { message: 'Phone number already exists' }
          })).pipe(delay(300));
        }

        this.customers.push(newCustomer);
        this.nextCustomerId++;
        localStorage.setItem('customers', JSON.stringify(this.customers));
        return of(new HttpResponse({ status: 201, body: newCustomer })).pipe(delay(500));
      }

      if (method === 'DELETE') {
        const match = url.match(/\/api\/customers\/(\d+)(?:\/|$)/);
        const id = match ? parseInt(match[1], 10) : NaN;

        if (!isFinite(id) || isNaN(id) || id <= 0) {
          return throwError(() => new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: { message: 'Invalid customer ID' }
          })).pipe(delay(200));
        }

        const index = this.customers.findIndex(c => c.id === id);
        if (index !== -1) {
          this.customers.splice(index, 1);
          localStorage.setItem('customers', JSON.stringify(this.customers));
          return of(new HttpResponse({ status: 200, body: `Customer ${id} deleted successfully` })).pipe(delay(300));
        } else {
          return throwError(() => new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: `Customer with ID ${id} not found` }
          })).pipe(delay(300));
        }
      }
    }

    // Handle policy operations
    if (url.includes('/api/policies')) {
      if (method === 'GET') {
        return of(new HttpResponse({ status: 200, body: [...this.policies] })).pipe(delay(300));
      }
    }

    // Handle customer-policies operations
    if (url.includes('/api/customer-policies')) {
      if (method === 'GET') {
        const enriched = this.customerPolicies.map(cp => this.enrichCustomerPolicy(cp));
        return of(new HttpResponse({ status: 200, body: enriched })).pipe(delay(300));
      }

      if (method === 'POST' && url.includes('/assign')) {
        const newPolicy: CustomerPolicy = {
          id: this.nextCustomerPolicyId,
          customerId: body.customerId,
          policyId: body.policyId,
          startDate: body.startDate,
          endDate: body.endDate,
          status: body.status,
          premiumAmount: body.premiumAmount
        };

        this.customerPolicies.push(newPolicy);
        this.nextCustomerPolicyId++;
        localStorage.setItem('customerPolicies', JSON.stringify(this.customerPolicies));
        return of(new HttpResponse({ status: 201, body: this.enrichCustomerPolicy(newPolicy) })).pipe(delay(500));
      }

      if (method === 'DELETE') {
        const match = url.match(/\/api\/customer-policies\/(\d+)(?:\/|$)/);
        const id = match ? parseInt(match[1], 10) : NaN;

        if (!isFinite(id) || isNaN(id) || id <= 0) {
          return throwError(() => new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: { message: 'Invalid policy ID' }
          })).pipe(delay(200));
        }

        const index = this.customerPolicies.findIndex(c => c.id === id);
        if (index !== -1) {
          this.customerPolicies.splice(index, 1);
          localStorage.setItem('customerPolicies', JSON.stringify(this.customerPolicies));
          return of(new HttpResponse({ status: 200, body: `Policy ${id} deleted successfully` })).pipe(delay(300));
        } else {
          return throwError(() => new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: `Policy with ID ${id} not found` }
          })).pipe(delay(300));
        }
      }
    }

    // Handle payment operations
    if (url.includes('/api/payments')) {
      if (method === 'GET') {
        const enriched = this.payments.map(p => this.enrichPayment(p));
        return of(new HttpResponse({ status: 200, body: enriched })).pipe(delay(300));
      }

      if (method === 'POST') {
        const newPayment: Payment = {
          id: this.nextPaymentId,
          customerPolicyId: body.customerPolicyId,
          amount: body.amount,
          paymentDate: body.paymentDate,
          paymentMode: body.paymentMode,
          paymentStatus: body.paymentStatus
        };

        this.payments.push(newPayment);
        this.nextPaymentId++;
        localStorage.setItem('payments', JSON.stringify(this.payments));
        return of(new HttpResponse({ status: 201, body: this.enrichPayment(newPayment) })).pipe(delay(500));
      }

      if (method === 'DELETE') {
        const match = url.match(/\/api\/payments\/(\d+)(?:\/|$)/);
        const id = match ? parseInt(match[1], 10) : NaN;

        if (!isFinite(id) || isNaN(id) || id <= 0) {
          return throwError(() => new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: { message: 'Invalid payment ID' }
          })).pipe(delay(200));
        }

        const index = this.payments.findIndex(p => p.id === id);
        if (index !== -1) {
          this.payments.splice(index, 1);
          localStorage.setItem('payments', JSON.stringify(this.payments));
          return of(new HttpResponse({ status: 200, body: `Payment ${id} deleted successfully` })).pipe(delay(300));
        } else {
          return throwError(() => new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: `Payment with ID ${id} not found` }
          })).pipe(delay(300));
        }
      }
    }

    // Handle claim operations
    if (url.includes('/api/claims')) {
      if (method === 'GET') {
        const enriched = this.claims.map(c => this.enrichClaim(c));
        return of(new HttpResponse({ status: 200, body: enriched })).pipe(delay(300));
      }

      if (method === 'POST') {
        const newClaim: Claim = {
          id: this.nextClaimId,
          customerPolicyId: body.customerPolicyId,
          claimAmount: body.claimAmount,
          claimDate: body.claimDate,
          claimStatus: body.claimStatus,
          description: body.description
        };

        this.claims.push(newClaim);
        this.nextClaimId++;
        localStorage.setItem('claims', JSON.stringify(this.claims));
        return of(new HttpResponse({ status: 201, body: this.enrichClaim(newClaim) })).pipe(delay(500));
      }

      if (method === 'DELETE') {
        const match = url.match(/\/api\/claims\/(\d+)(?:\/|$)/);
        const id = match ? parseInt(match[1], 10) : NaN;

        if (!isFinite(id) || isNaN(id) || id <= 0) {
          return throwError(() => new HttpErrorResponse({
            status: 400,
            statusText: 'Bad Request',
            error: { message: 'Invalid claim ID' }
          })).pipe(delay(200));
        }

        const index = this.claims.findIndex(c => c.id === id);
        if (index !== -1) {
          this.claims.splice(index, 1);
          localStorage.setItem('claims', JSON.stringify(this.claims));
          return of(new HttpResponse({ status: 200, body: `Claim ${id} deleted successfully` })).pipe(delay(300));
        } else {
          return throwError(() => new HttpErrorResponse({
            status: 404,
            statusText: 'Not Found',
            error: { message: `Claim with ID ${id} not found` }
          })).pipe(delay(300));
        }
      }
    }

    // Pass through other requests
    return next.handle(request);
  }
}


