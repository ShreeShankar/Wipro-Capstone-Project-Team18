
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { finalize, timeout } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true, // Add this for Angular 17+
  imports: [CommonModule, ReactiveFormsModule, RouterModule], // Add this
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  returnUrl: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (this.authService.isLoggedIn()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.error = '';

    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    console.log('Starting login process...');
    
    this.authService
      .login({
        email: this.f['email'].value,
        password: this.f['password'].value,
      })
      .pipe(
        timeout(30000), // 30 second timeout
        finalize(() => {
          this.loading = false;
          console.log('Login process completed');
        }),
      )
      .subscribe({
        next: () => {
          console.log('Login successful, navigating to:', this.returnUrl);
          this.router.navigate([this.returnUrl]);
        },
        error: (error) => {
          console.error('Login error:', error);
          if (error.name === 'TimeoutError') {
            this.error = 'Login request timed out. Please check your connection and try again.';
          } else if (error.status === 0) {
            this.error = 'Cannot connect to server. Please check your internet connection.';
          } else if (error.status === 401 || error.status === 400) {
            this.error = 'Invalid email or password. Please try again.';
          } else {
            this.error = error.error?.message || error.message || 'Login failed. Please try again.';
          }
        },
      });
  }
} 