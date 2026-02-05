import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Unauthorized error - token might be invalid or expired
        console.warn('Session expired or unauthorized. Redirecting to login.');
        authService.logout(); // Cleanup localstorage y signals
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};