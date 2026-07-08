import { CanDeactivateFn } from '@angular/router';

export interface DeactivatableExamComponent {
  canLeavePage(): boolean;
}

/**
 * Applied to the "Take Exam" route so navigating away (back button,
 * direct URL change, etc.) triggers a native confirmation instead of
 * silently discarding an in-progress attempt.
 */
export const unsavedExamGuard: CanDeactivateFn<DeactivatableExamComponent> = (component) => {
  if (component.canLeavePage()) {
    return true;
  }
  return window.confirm('Your exam is still in progress. Leaving now will auto-submit your answers. Continue?');
};
