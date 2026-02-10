import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, delay } from 'rxjs/operators';
import { User, LoginRequest, SignupRequest } from '../models/user.model';

interface DemoUser {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;
  private apiUrl = '/api/auth';
  
  // Demo credentials for testing (this gets updated when users sign up)
  private demoUsers: DemoUser[] = [
    { id: 1, email: 'admin@test.com', password: 'admin123', firstName: 'Admin', lastName: 'User' },
    { id: 2, email: 'user@test.com', password: 'user123', firstName: 'Test', lastName: 'User' }
  ];
  private nextUserId = 3;

  constructor(private http: HttpClient) {
    // Load registered users from localStorage
    const storedUsers = localStorage.getItem('registeredUsers');
    if (storedUsers) {
      try {
        const users = JSON.parse(storedUsers);
        this.demoUsers = [...this.demoUsers, ...users];
        if (users.length > 0) {
          this.nextUserId = Math.max(...users.map((u: DemoUser) => u.id)) + 1;
        }
      } catch (e) {
        console.warn('Failed to load registered users from localStorage');
      }
    }

    const storedUser = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(loginRequest: LoginRequest): Observable<User> {
    console.log('Login attempt:', loginRequest);
    
    // Demo/Mock login - check against demo users (includes newly registered users)
    const demoUser = this.demoUsers.find(
      u => u.email === loginRequest.email && u.password === loginRequest.password
    );
    
    if (demoUser) {
      const user: User = {
        id: demoUser.id,
        email: demoUser.email,
        password: '', // Don't store actual password
        firstName: demoUser.firstName,
        lastName: demoUser.lastName,
        phone: demoUser.phone,
        role: 'user'
      };
      console.log('Demo login successful:', user);
      
      // Simulate network delay
      return of(user).pipe(
        delay(500),
        tap(u => {
          localStorage.setItem('currentUser', JSON.stringify(u));
          this.currentUserSubject.next(u);
        })
      );
    } else {
      console.log('Demo login failed - invalid credentials');
      return throwError(() => ({
        status: 401,
        error: { message: 'Invalid email or password' }
      }));
    }
  }

  signup(signupRequest: SignupRequest): Observable<string> {
    console.log('Signup attempt:', signupRequest.email);
    
    // Check if email already exists
    const emailExists = this.demoUsers.some(u => u.email === signupRequest.email);
    if (emailExists) {
      return throwError(() => ({
        status: 400,
        error: { message: 'Email already registered' }
      }));
    }

    // Create new demo user
    const newUser: DemoUser = {
      id: this.nextUserId,
      email: signupRequest.email,
      password: signupRequest.password,
      firstName: signupRequest.firstName,
      lastName: signupRequest.lastName,
      phone: (signupRequest as any).phone,
      dateOfBirth: (signupRequest as any).dateOfBirth,
      address: (signupRequest as any).address
    };

    // Add to demo users list
    this.demoUsers.push(newUser);
    
    // Save registered users to localStorage
    const registeredUsers = this.demoUsers.filter(u => u.id >= 3); // Only save newly registered users
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    this.nextUserId++;
    
    console.log('Demo signup successful:', newUser);
    
    // Simulate network delay
    return of('Registration successful. You can now login with your credentials.').pipe(
      delay(500)
    );
  }

  // Check if a phone number already exists among demo/registered users
  checkPhoneExists(phone: string) {
    try {
      const exists = this.demoUsers.some(u => u.phone === phone);
      return of(exists).pipe(delay(200));
    } catch (e) {
      return of(false).pipe(delay(200));
    }
  }

  // Check if an email already exists among demo/registered users
  checkEmailExists(email: string) {
    try {
      const exists = this.demoUsers.some(u => u.email.toLowerCase() === (email || '').toLowerCase());
      return of(exists).pipe(delay(200));
    } catch (e) {
      return of(false).pipe(delay(200));
    }
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue;
  }
}