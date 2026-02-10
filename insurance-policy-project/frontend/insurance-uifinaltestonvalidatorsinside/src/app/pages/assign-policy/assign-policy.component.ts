import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { CustomerService } from '../../core/services/customer.service';
import { PolicyService } from '../../core/services/policy.service';
import { CustomerPolicyService } from '../../core/services/customer-policy.service';

import { Customer } from '../../core/models/customer.model';
import { Policy } from '../../core/models/policy.model';
import { CustomerPolicy } from '../../core/models/customer-policy.model';
import { CustomValidators } from '../../core/validators/custom.validators';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-assign-policy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assign-policy.component.html',
  styleUrls: ['./assign-policy.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssignPolicyComponent implements OnInit {
  private customersSubject = new BehaviorSubject<Customer[]>([]);
  customers$ = this.customersSubject.asObservable();

  private policiesSubject = new BehaviorSubject<Policy[]>([]);
  policies$ = this.policiesSubject.asObservable();

  private assignmentsSubject = new BehaviorSubject<CustomerPolicy[]>([]);
  assignments$ = this.assignmentsSubject.asObservable();

  error = '';
  successMessage = '';
  loading = false;
  submitted = false;
  today = new Date().toISOString().split('T')[0];

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private policyService: PolicyService,
    private customerPolicyService: CustomerPolicyService,
  ) {
    this.form = this.fb.group(
      {
        customerId: ['', Validators.required],
        policyId: ['', Validators.required],
        startDate: [
          '',
          [
            Validators.required,
            CustomValidators.futureDate, // Start date must be today or in future
          ],
        ],
        endDate: [
          '',
          [
            Validators.required,
            CustomValidators.futureDate, // End date must be today or in future
          ],
        ],
        status: ['ACTIVE', Validators.required],
        premiumAmount: [
          0,
          [
            Validators.required,
            Validators.min(1),
            CustomValidators.positiveNumber,
            CustomValidators.amountRange(500, 1000000), // Same range as policy premium
          ],
        ],
      },
      {
        validators: CustomValidators.dateComparison('startDate', 'endDate'),
      },
    );

    // Update end date when start date changes
    this.form.get('startDate')?.valueChanges.subscribe(() => {
      this.updateMinEndDate();
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  get f() {
    return this.form.controls;
  }

  loadData() {
    this.loading = true;
    forkJoin({
      customers: this.customerService.getAll(),
      policies: this.policyService.getAll(),
      assignments: this.customerPolicyService.getAll(),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ customers, policies, assignments }) => {
          this.customersSubject.next(customers || []);
          this.policiesSubject.next(policies || []);
          this.assignmentsSubject.next(assignments || []);
        },
        error: (e) => {
          console.error('Failed to load assign data', e);
          this.error = 'Failed to load data';
        },
      });
  }

  loadAssignments() {
    this.customerPolicyService.getAll().subscribe({
      next: (r) => this.assignmentsSubject.next(r || []),
      error: (e) => {
        console.error('Failed to load assignments', e);
        this.error = 'Failed to load assignments';
      },
    });
  }

  updateMinEndDate(): void {
    const startDate = this.f['startDate'].value;
    if (startDate) {
      const minDate = new Date(startDate);
      minDate.setDate(minDate.getDate() + 1); // End date must be at least 1 day after start
      this.today = minDate.toISOString().split('T')[0];
    }
  }

  submit() {
    this.error = '';
    this.successMessage = '';
    this.submitted = true;

    if (this.form.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.form.controls).forEach((key) => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      return;
    }

    // Convert select values to numbers
    const payload = {
      ...this.form.value,
      customerId: Number(this.form.value.customerId),
      policyId: Number(this.form.value.policyId),
      premiumAmount: Number(this.form.value.premiumAmount),
    };

    this.customerPolicyService.assign(payload as any).subscribe({
      next: (created) => {
        this.successMessage = 'Policy assigned successfully!';
        this.form.reset({
          customerId: '',
          policyId: '',
          startDate: '',
          endDate: '',
          status: 'ACTIVE',
          premiumAmount: 0,
        });
        this.submitted = false;

        if (created) {
          const current = this.assignmentsSubject.getValue() || [];
          this.assignmentsSubject.next([...current, created]);
        } else {
          this.loadAssignments();
        }

        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (e) => {
        console.error('Assignment failed', e);
        this.error = 'Assignment failed';
      },
    });
  }

  resetForm(): void {
    this.form.reset({
      customerId: '',
      policyId: '',
      startDate: '',
      endDate: '',
      status: 'ACTIVE',
      premiumAmount: 0,
    });
    this.submitted = false;
    this.error = '';
    this.successMessage = '';
  }

  delete(id?: number) {
    if (id == null) return;
    if (!confirm('Are you sure?')) return;

    this.customerPolicyService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Deleted successfully!';
        const current = this.assignmentsSubject.getValue() || [];
        this.assignmentsSubject.next(current.filter(item => item.id !== id));
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (e: any) => {
        console.error('Delete error:', e);
        this.error = e?.error?.message || e?.errorMessage || 'Delete failed';
      }
    });
  }

  trackById(index: number, item: any) {
    return item?.id;
  }
}