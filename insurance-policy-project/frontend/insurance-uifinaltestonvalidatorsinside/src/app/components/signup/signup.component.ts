import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CustomerService } from '../../core/services/customer.service';
import { CustomValidators } from '../../core/validators/custom.validators';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  signupForm: FormGroup;

  loading = false;
  submitted = false;
  success = false;
  error = '';

  today = new Date().toISOString().split('T')[0];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private customerService: CustomerService
  ) {
    const authPhoneValidator = (control: AbstractControl) => {
      if (!control.value) return of(null);
      return this.authService.checkPhoneExists(control.value).pipe(
        map((exists: boolean) => (exists ? { phoneExists: { value: control.value } } : null)),
        catchError(() => of(null))
      );
    };
    const authEmailValidator = (control: AbstractControl) => {
      if (!control.value) return of(null);
      return this.authService.checkEmailExists(control.value).pipe(
        map((exists: boolean) => (exists ? { emailExists: { value: control.value } } : null)),
        catchError(() => of(null))
      );
    };
    this.signupForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
        email: [
          '',
          [Validators.required, Validators.email, Validators.maxLength(100)],
          [CustomValidators.emailExists(this.customerService), authEmailValidator]
        ],
        phone: [
          '',
          [Validators.required, Validators.pattern('^[0-9]{10}$')],
          [CustomValidators.phoneExists(this.customerService), authPhoneValidator]
        ],
        dateOfBirth: ['', [Validators.required]],
        address: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
        password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        // ✅ FIX: use validators (not "validator") in Angular reactive forms
        validators: [this.mustMatch('password', 'confirmPassword')],
      }
    );
  }

  get f() {
    return this.signupForm.controls;
  }

  // ✅ FIX: Proper validator fn signature
  mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const formGroup = control as FormGroup;
      const main = formGroup.get(controlName);
      const match = formGroup.get(matchingControlName);

      if (!main || !match) return null;

      // keep other errors
      if (match.errors && !match.errors['mustMatch']) {
        return null;
      }

      if (main.value !== match.value) {
        match.setErrors({ mustMatch: true });
        return { mustMatch: true };
      } else {
        match.setErrors(null);
        return null;
      }
    };
  }

  private calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';
    this.success = false;

    if (this.signupForm.invalid) {
      return;
    }

    const age = this.calculateAge(this.f['dateOfBirth'].value);
    if (age < 18) {
      this.error = 'You must be at least 18 years old to create an account';
      return;
    }

    this.loading = true;

    const signupData = {
      email: this.f['email'].value,
      password: this.f['password'].value,
      firstName: this.f['firstName'].value,
      lastName: this.f['lastName'].value,
      phone: this.f['phone'].value,
      dateOfBirth: this.f['dateOfBirth'].value,
      address: this.f['address'].value,
    };

    // Call signup and wait for response
    this.authService.signup(signupData).subscribe({
      next: (response) => {
        console.log('Signup successful:', response);
        this.success = true;
        this.error = '';
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: {
              email: signupData.email,
              registered: true
            }
          });
        }, 2000);
      },
      error: (error) => {
        console.error('Signup error:', error);
        this.loading = false;
        this.error = error.error?.message || error.message || 'Registration failed. Please try again.';
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}