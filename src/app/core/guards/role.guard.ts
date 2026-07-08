import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services';
import { UserRole } from '../models';

/**
 * Reads `data: { role: 'admin' | 'student' }` from the matched route and
 * ensures the current session's role matches. Redirects mismatched users
 * to their own dashboard instead of a dead end.
 */
export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data['role'] as UserRole | undefined;
  const currentRole = authService.currentRole();

  if (!currentRole) {
    return router.createUrlTree(['/auth/login']);
  }

  if (requiredRole && currentRole !== requiredRole) {
    return router.createUrlTree([currentRole === 'admin' ? '/admin/dashboard' : '/student/dashboard']);
  }

  return true;
};
