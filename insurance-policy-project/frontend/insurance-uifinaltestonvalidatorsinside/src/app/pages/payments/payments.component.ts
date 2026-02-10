import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { CustomerPolicyService } from '../../core/services/customer-policy.service';
import { PaymentService } from '../../core/services/payment.service';

import { CustomerPolicy } from '../../core/models/customer-policy.model';
import { Payment } from '../../core/models/payment.model';
import { CustomValidators } from '../../core/validators/custom.validators';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentsComponent implements OnInit {
  private assignmentsSubject = new BehaviorSubject<CustomerPolicy[]>([]);
  assignments$ = this.assignmentsSubject.asObservable();

  private paymentsSubject = new BehaviorSubject<Payment[]>([]);
  payments$ = this.paymentsSubject.asObservable();

  error = '';
  successMessage = '';
  loading = false;
  submitted = false;
  today = new Date().toISOString().split('T')[0];

  // Payment modes for dropdown
  paymentModes = ['UPI', 'CARD', 'NETBANKING', 'CASH', 'CHEQUE'];
  paymentStatuses = ['PAID', 'PENDING', 'FAILED', 'REFUNDED'];

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerPolicyService: CustomerPolicyService,
    private paymentService: PaymentService,
  ) {
    this.form = this.fb.group({
      customerPolicyId: ['', Validators.required],
      amount: [
        0,
        [
          Validators.required,
          Validators.min(1),
          CustomValidators.positiveNumber,
          CustomValidators.amountRange(100, 1000000), // ₹100 to ₹10,00,000
        ],
      ],
      paymentDate: [
        '',
        [
          Validators.required,
          CustomValidators.pastDate, // Payment date should not be in future
        ],
      ],
      paymentMode: ['UPI', Validators.required],
      paymentStatus: ['PAID', Validators.required],
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
      assignments: this.customerPolicyService.getAll(),
      payments: this.paymentService.getAll(),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ assignments, payments }) => {
          this.assignmentsSubject.next(assignments || []);
          this.paymentsSubject.next(payments || []);
        },
        error: (e) => {
          console.error('Failed to load payments data', e);
          this.error = 'Failed to load payments';
        },
      });
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

    const payload = {
      ...this.form.value,
      customerPolicyId: Number(this.form.value.customerPolicyId),
      amount: Number(this.form.value.amount),
    };

    this.paymentService.pay(payload as any).subscribe({
      next: (created) => {
        this.successMessage = 'Payment recorded successfully!';
        this.form.reset({
          customerPolicyId: '',
          amount: 0,
          paymentDate: this.today, // Reset to today's date
          paymentMode: 'UPI',
          paymentStatus: 'PAID',
        });
        this.submitted = false;

        if (created) {
          const current = this.paymentsSubject.getValue() || [];
          this.paymentsSubject.next([...current, created]);
        } else {
          this.loadData();
        }

        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (e) => {
        console.error('Payment failed', e);
        this.error = 'Payment failed';
      },
    });
  }

  resetForm(): void {
    this.form.reset({
      customerPolicyId: '',
      amount: 0,
      paymentDate: this.today,
      paymentMode: 'UPI',
      paymentStatus: 'PAID',
    });
    this.submitted = false;
    this.error = '';
    this.successMessage = '';
  }

  delete(id?: number) {
    if (id == null) return;
    if (!confirm('Are you sure?')) return;

    this.paymentService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Deleted successfully!';
        const current = this.paymentsSubject.getValue() || [];
        this.paymentsSubject.next(current.filter(item => item.id !== id));
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (e: any) => {
        console.error('Delete error:', e);
        this.error = e?.error?.message || e?.errorMessage || 'Delete failed';
      }
    });
  }

  // Calculate total payments
  calculateTotalPayments(): number {
    const payments = this.paymentsSubject.getValue() || [];
    return payments
      .filter((p) => p.paymentStatus === 'PAID')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  // Calculate pending payments
  calculatePendingPayments(): number {
    const payments = this.paymentsSubject.getValue() || [];
    return payments
      .filter((p) => p.paymentStatus === 'PENDING')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  trackById(index: number, item: any) {
    return item?.id;
  }
}