import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppComponent } from './app/app';
import { routes } from './app/app-routing-module';
import { MockBackendInterceptor } from './app/core/services/mock-backend.interceptor';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // Use mock backend interceptor for demo/development
    { provide: HTTP_INTERCEPTORS, useClass: MockBackendInterceptor, multi: true }
  ]
}).catch(err => console.error(err));


