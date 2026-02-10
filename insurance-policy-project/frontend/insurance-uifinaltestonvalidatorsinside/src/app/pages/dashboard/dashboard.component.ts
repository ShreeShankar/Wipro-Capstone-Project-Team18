import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { forkJoin, of } from 'rxjs';
import { finalize, catchError } from 'rxjs/operators';

import { CustomerService } from '../../core/services/customer.service';
import { PolicyService } from '../../core/services/policy.service';
import { CustomerPolicyService } from '../../core/services/customer-policy.service';
import { PaymentService } from '../../core/services/payment.service';
import { ClaimService } from '../../core/services/claim.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  counts: {
    customers: number | null;
    policies: number | null;
    assignments: number | null;
    payments: number | null;
    claims: number | null;
  } = {
    customers: null,
    policies: null,
    assignments: null,
    payments: null,
    claims: null,
  };

  loading = false;

  constructor(
    private customers: CustomerService,
    private policies: PolicyService,
    private assigns: CustomerPolicyService,
    private payments: PaymentService,
    private claims: ClaimService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loading = true;

    forkJoin({
      customers: this.customers.getAll().pipe(
        catchError((e) => {
          console.error('customers.getAll failed', e);
          return of([]);
        }),
      ),
      policies: this.policies.getAll().pipe(
        catchError((e) => {
          console.error('policies.getAll failed', e);
          return of([]);
        }),
      ),
      assignments: this.assigns.getAll().pipe(
        catchError((e) => {
          console.error('assigns.getAll failed', e);
          return of([]);
        }),
      ),
      payments: this.payments.getAll().pipe(
        catchError((e) => {
          console.error('payments.getAll failed', e);
          return of([]);
        }),
      ),
      claims: this.claims.getAll().pipe(
        catchError((e) => {
          console.error('claims.getAll failed', e);
          return of([]);
        }),
      ),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (res) => {
          // assign counts from responses
          const { customers, policies, assignments, payments, claims } = res as any;
          this.counts.customers = (customers || []).length;
          this.counts.policies = (policies || []).length;
          this.counts.assignments = (assignments || []).length;
          this.counts.payments = (payments || []).length;
          this.counts.claims = (claims || []).length;

          // ensure view updates immediately if subscription ran outside zone
          try {
            this.cdr.detectChanges();
          } catch (e) {
            // ignore detect errors
            console.debug('cdr.detectChanges failed', e);
          }

          // no client cache — update UI immediately
        },
        error: (e) => {
          // should not be reached because each stream catches errors, but keep defensive logging
          console.error('Failed to load dashboard counts', e);
        },
      });
  }
}