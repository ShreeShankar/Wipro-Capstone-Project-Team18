import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { CustomerPolicyService } from '../../core/services/customer-policy.service';
import { ClaimService } from '../../core/services/claim.service';

import { CustomerPolicy } from '../../core/models/customer-policy.model';
import { Claim } from '../../core/models/claim.model';
import { CustomValidators } from '../../core/validators/custom.validators';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { BehaviorSubject, forkJoin } from 'rxjs';

@Component({
  selector: 'app-claims',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './claims.component.html',
  styleUrls: ['./claims.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClaimsComponent implements OnInit {
  private assignmentsSubject = new BehaviorSubject<CustomerPolicy[]>([]);
  assignments$ = this.assignmentsSubject.asObservable();

  private claimsSubject = new BehaviorSubject<Claim[]>([]);
  claims$ = this.claimsSubject.asObservable();

  error = '';
  successMessage = '';
  loading = false;
  submitted = false;
  today = new Date().toISOString().split('T')[0];

  // Claim statuses for dropdown
  claimStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'UNDER_REVIEW', 'SETTLED'];

  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private customerPolicyService: CustomerPolicyService,
    private claimService: ClaimService,
  ) {
    this.form = this.fb.group({
      customerPolicyId: ['', Validators.required],
      claimAmount: [
        0,
        [
          Validators.required,
          Validators.min(1),
          CustomValidators.positiveNumber,
          CustomValidators.amountRange(1000, 10000000), // ₹1,000 to ₹1,00,00,000
        ],
      ],
      claimDate: [
        '',
        [
          Validators.required,
          CustomValidators.pastDate, // Claim date should not be in future
        ],
      ],
      claimStatus: ['PENDING', Validators.required],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
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
      claims: this.claimService.getAll(),
    })
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: ({ assignments, claims }) => {
          this.assignmentsSubject.next(assignments || []);
          this.claimsSubject.next(claims || []);
        },
        error: (e) => {
          console.error('Failed to load claims data', e);
          this.error = 'Failed to load claims';
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
      claimAmount: Number(this.form.value.claimAmount),
    };

    this.claimService.raise(payload as any).subscribe({
      next: (created) => {
        this.successMessage = 'Claim raised successfully!';
        this.form.reset({
          customerPolicyId: '',
          claimAmount: 0,
          claimDate: this.today, // Reset to today's date
          claimStatus: 'PENDING',
          description: '',
        });
        this.submitted = false;

        if (created) {
          const current = this.claimsSubject.getValue() || [];
          this.claimsSubject.next([...current, created]);
        } else {
          this.loadData();
        }

        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (e) => {
        console.error('Claim failed', e);
        this.error = 'Claim failed';
      },
    });
  }

  resetForm(): void {
    this.form.reset({
      customerPolicyId: '',
      claimAmount: 0,
      claimDate: this.today,
      claimStatus: 'PENDING',
      description: '',
    });
    this.submitted = false;
    this.error = '';
    this.successMessage = '';
  }

  delete(id?: number) {
    if (id == null) return;
    if (!confirm('Are you sure?')) return;

    this.claimService.delete(id).subscribe({
      next: () => {
        this.successMessage = 'Deleted successfully!';
        const current = this.claimsSubject.getValue() || [];
        this.claimsSubject.next(current.filter(item => item.id !== id));
        setTimeout(() => { this.successMessage = ''; }, 3000);
      },
      error: (e: any) => {
        console.error('Delete error:', e);
        this.error = e?.error?.message || e?.errorMessage || 'Delete failed';
      }
    });
  }

  // Calculate total claim amounts by status
  calculateClaimAmounts(status: string): number {
    const claims = this.claimsSubject.getValue() || [];
    return claims
      .filter((c) => c.claimStatus === status)
      .reduce((sum, claim) => sum + claim.claimAmount, 0);
  }

  // Count claims by status
  countClaimsByStatus(status: string): number {
    const claims = this.claimsSubject.getValue() || [];
    return claims.filter((c) => c.claimStatus === status).length;
  }

  trackById(index: number, item: any) {
    return item?.id;
  }
}