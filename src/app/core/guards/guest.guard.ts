import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services';

/** Prevents already-authenticated users from seeing the login/register screens. */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  const role = authService.currentRole();
  return router.createUrlTree([role === 'admin' ? '/admin/dashboard' : '/student/dashboard']);
};
