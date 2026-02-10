import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { PolicyService } from '../../core/services/policy.service';
import { Policy } from '../../core/models/policy.model';
import { CustomValidators } from '../../core/validators/custom.validators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PoliciesComponent implements OnInit {
  private policiesSubject = new BehaviorSubject<Policy[]>([]);
  policies$ = this.policiesSubject.asObservable();
  error = '';
  loading = false;
  form!: FormGroup;
  submitted = false;
  successMessage = '';

  // Policy types for dropdown
  policyTypes = [
    'Life Insurance',
    'Health Insurance',
    'Motor Insurance',
    'Home Insurance',
    'Travel Insurance',
    'Term Insurance',
    'Accident Insurance',
    'Fire Insurance',
    'Marine Insurance',
    'Cyber Insurance',
  ];

  constructor(
    private fb: FormBuilder,
    private policyService: PolicyService,
  ) {
    this.form = this.fb.group({
      policyName: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
          CustomValidators.policyName,
        ],
      ],
      policyType: ['', Validators.required],
      premiumAmount: [
        0,
        [
          Validators.required,
          Validators.min(1),
          CustomValidators.positiveNumber,
          CustomValidators.amountRange(500, 1000000), // ₹500 to ₹10,00,000
        ],
      ],
      durationMonths: [
        1,
        [
          Validators.required,
          Validators.min(1),
          Validators.max(360), // Max 30 years (360 months)
        ],
      ],
      coverageAmount: [
        0,
        [
          Validators.required,
          Validators.min(1),
          CustomValidators.positiveNumber,
          CustomValidators.amountRange(10000, 100000000), // ₹10,000 to ₹10,00,00,000
        ],
      ],
      // Removed: startDate, endDate, description
    });
    // Removed date validators and date calculations
  }

  ngOnInit(): void {
    this.load();
  }

  get f() {
    return this.form.controls;
  }

  load() {
    this.loading = true;
    this.error = '';
    this.policyService
      .getAll()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (r) => this.policiesSubject.next(r || []),
        error: (e) => {
          console.error('Failed to load policies', e);
          this.error = 'Failed to load policies';
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

    const payload = this.form.value as Policy;

    this.policyService.create(payload).subscribe({
      next: (created) => {
        this.successMessage = 'Policy created successfully!';
        this.form.reset({
          policyName: '',
          policyType: '',
          premiumAmount: 0,
          durationMonths: 1,
          coverageAmount: 0,
        });
        this.submitted = false;

        if (created) {
          const current = this.policiesSubject.getValue() || [];
          this.policiesSubject.next([...current, created]);
        } else {
          this.load();
        }

        setTimeout(() => (this.successMessage = ''), 3000);
      },
      error: (e) => {
        console.error('Create policy failed', e);
        this.error = 'Create policy failed';
      },
    });
  }

  delete(id?: number) {
    if (!id) return;

    if (confirm('Are you sure you want to delete this policy?')) {
      this.policyService.delete(id).subscribe({
        next: () => {
          this.successMessage = 'Policy deleted successfully!';
          const current = this.policiesSubject.getValue() || [];
          this.policiesSubject.next(current.filter((p) => p.id !== id));
          setTimeout(() => (this.successMessage = ''), 3000);
        },
        error: (e) => {
          console.error('Delete policy failed', e);
          this.error = 'Delete policy failed';
        },
      });
    }
  }

  // Calculate monthly premium
  calculateMonthlyPremium(): number {
    const premium = this.f['premiumAmount'].value || 0;
    const duration = this.f['durationMonths'].value || 1;
    return duration > 0 ? premium / duration : 0;
  }

  // Calculate coverage ratio (coverage per premium)
  calculateCoverageRatio(): number {
    const premium = this.f['premiumAmount'].value || 0;
    const coverage = this.f['coverageAmount'].value || 0;
    return premium > 0 ? coverage / premium : 0;
  }

  // Reset form
  resetForm(): void {
    this.form.reset({
      policyName: '',
      policyType: '',
      premiumAmount: 0,
      durationMonths: 1,
      coverageAmount: 0,
    });
    this.submitted = false;
    this.error = '';
    this.successMessage = '';
  }

  trackById(index: number, item: any) {
    return item?.id;
  }
}