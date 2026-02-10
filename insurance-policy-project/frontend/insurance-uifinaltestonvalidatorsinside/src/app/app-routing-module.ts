import { Routes } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CustomersComponent } from './pages/customers/customers.component';
import { PoliciesComponent } from './pages/policies/policies.component';
import { AssignPolicyComponent } from './pages/assign-policy/assign-policy.component';
import { PaymentsComponent } from './pages/payments/payments.component';
import { ClaimsComponent } from './pages/claims/claims.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { AuthGuard } from './core/services/auth.guard'; // Updated path

export const routes: Routes = [
  // Public routes (no authentication required)
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  
  // Protected routes (require authentication)
  { 
    path: '', 
    component: DashboardComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'customers', 
    component: CustomersComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'policies', 
    component: PoliciesComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'assign', 
    component: AssignPolicyComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'payments', 
    component: PaymentsComponent, 
    canActivate: [AuthGuard] 
  },
  { 
    path: 'claims', 
    component: ClaimsComponent, 
    canActivate: [AuthGuard] 
  },
  
  // Redirect to login for unknown routes
  { path: '**', redirectTo: '/login' }
];