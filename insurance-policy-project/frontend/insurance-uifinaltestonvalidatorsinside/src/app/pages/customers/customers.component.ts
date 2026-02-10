import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/models/customer.model';
import { CustomValidators } from '../../core/validators/custom.validators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomersComponent implements OnInit {
  private customersSubject = new BehaviorSubject<Customer[]>([]);
  customers$ = this.customersSubject.asObservable();
  loading = false;
  error = '';
  form!: FormGroup;
  submitted = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
  ) {
    this.form = this.fb.group({
      firstName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-Z\\s]*$'),
        ],
      ],
      lastName: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50),
          Validators.pattern('^[a-zA-Z\\s]*$'),
        ],
      ],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(100)],
        [CustomValidators.emailExists(this.customerService)]
      ],
      phone: [
        '',
        [Validators.required, CustomValidators.phoneNumber],
        [CustomValidators.phoneExists(this.customerService)]
      ],
      address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
    });
  }

  trackById(index: number, item: Customer) {
    return item.id;
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
    this.customerService
      .getAll()
      .pipe(
        // ensure loading flag is cleared regardless of outcome
        finalize(() => (this.loading = false)),
      )
      .subscribe({
        next: (r) => {
          this.customersSubject.next(r || []);
        },
        error: (e) => {
          console.error('Failed to load customers', e);
          this.error = 'Failed to load customers';
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

    this.customerService.create(this.form.value as Customer).subscribe({
      next: (created) => {
        this.successMessage = 'Customer added successfully!';
        this.form.reset();
        this.submitted = false;

        // Optimistically add the created customer to the list so the UI updates immediately
        if (created) {
          const current = this.customersSubject.getValue() || [];
          // append to preserve original ascending order (1,2,3,4,5)
          this.customersSubject.next([...current, created]);
        } else {
          // fallback to reloading if server didn't return the created entity
          this.load();
        }

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (e) => {
        console.error('Create customer failed', e);
        this.error = 'Create customer failed';
      },
    });
  }

  delete(id?: number) {
    if (id == null) return;

    if (!confirm('Are you sure you want to delete this customer?')) return;

    console.log('Deleting customer id:', id);

    this.customerService.delete(id).subscribe({
      next: (res) => {
        this.successMessage = 'Customer deleted successfully!';

        // remove locally to avoid an extra network call and immediate UI update
        const current = this.customersSubject.getValue() || [];
        this.customersSubject.next(current.filter((c) => c.id !== id));

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (e) => {
        console.error('Failed to delete customer', e);
        // Show backend message if available
        this.error = e?.error?.message || e?.message || 'Failed to delete customer';
      },
    });
  }

  resetForm(): void {
    this.form.reset();
    this.submitted = false;
    this.error = '';
    this.successMessage = '';
  }
}