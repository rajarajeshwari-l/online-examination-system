import { ApplicationConfig, ErrorHandler, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideNativeDateAdapter } from '@angular/material/core';

import { routes } from './app.routes';
import { GlobalErrorHandler } from './core/error-handling/global-error-handler';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideAnimations(),
    provideNativeDateAdapter(),
    { provide: ErrorHandler, useClass: GlobalErrorHandler }
  ]
};
