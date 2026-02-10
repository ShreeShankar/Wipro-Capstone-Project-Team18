import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export class CustomValidators {
  // Positive number validator (for premium, coverage amounts)
  static positiveNumber(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = Number(value);
    return num > 0 ? null : { positiveNumber: { value: control.value } };
  }

  // Non-negative number validator (for amounts that can be zero)
  static nonNegativeNumber(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const num = Number(value);
    return num >= 0 ? null : { nonNegativeNumber: { value: control.value } };
  }

  // Future date validator
  static futureDate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate >= today ? null : { futureDate: true };
  }

  // Past date validator
  static pastDate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return selectedDate <= today ? null : { pastDate: true };
  }

  // Minimum age validator (e.g., 18 years)
  static minimumAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age >= minAge ? null : { minimumAge: { requiredAge: minAge, actualAge: age } };
    };
  }

  // Date comparison validator (end date after start date)
  static dateComparison(startDateField: string, endDateField: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const startDate = formGroup.get(startDateField)?.value;
      const endDate = formGroup.get(endDateField)?.value;
      
      if (!startDate || !endDate) return null;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      // Clear any existing errors on the fields
      formGroup.get(startDateField)?.setErrors(null);
      formGroup.get(endDateField)?.setErrors(null);
      
      if (end <= start) {
        // Set error on end date field
        formGroup.get(endDateField)?.setErrors({ 
          dateComparison: { 
            message: 'End date must be after start date',
            startDate: start,
            endDate: end
          } 
        });
        return { dateComparison: true };
      }
      
      return null;
    };
  }

  // Phone number validator (India format)
  static phoneNumber(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    // Indian phone number regex: 10 digits starting with 6,7,8,9
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(value) ? null : { phoneNumber: true };
  }

  // Email domain validator (optional)
  static emailDomain(allowedDomains: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email) return null;
      
      const domain = email.substring(email.lastIndexOf('@') + 1);
      return allowedDomains.includes(domain) ? null : { emailDomain: true };
    };
  }

  // Amount range validator
  static amountRange(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (value === null || value === undefined || value === '') {
        return null;
      }
      const num = Number(value);
      return num >= min && num <= max ? null : { amountRange: { min, max, actual: num } };
    };
  }

  // Policy name validator (no special characters)
  static policyName(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    const policyNameRegex = /^[a-zA-Z0-9\s\-_&]+$/;
    return policyNameRegex.test(value) ? null : { policyName: true };
  }

  // Async validator to check if email already exists
  static emailExists(customerService: any): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return customerService.getAll().pipe(
        map((customers: any[]) => {
          const emailExists = customers.some(
            (customer: any) => customer.email.toLowerCase() === control.value.toLowerCase()
          );
          return emailExists ? { emailExists: { value: control.value } } : null;
        }),
        catchError(() => of(null)) // If API fails, allow submission (don't block)
      );
    };
  }

  // Async validator to check if phone already exists
  static phoneExists(customerService: any): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null);
      }

      return customerService.getAll().pipe(
        map((customers: any[]) => {
          const phoneExists = customers.some(
            (customer: any) => customer.phone === control.value
          );
          return phoneExists ? { phoneExists: { value: control.value } } : null;
        }),
        catchError(() => of(null)) // If API fails, allow submission (don't block)
      );
    };
  }
}