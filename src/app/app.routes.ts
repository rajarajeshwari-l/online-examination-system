import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';
import { unsavedExamGuard } from './core/guards/unsaved-exam.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },

  {
    path: 'auth',
    canActivate: [guestGuard],
    loadComponent: () => import('./layouts/auth-layout/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login-page/login-page.component').then((m) => m.LoginPageComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register-page/register-page.component').then((m) => m.RegisterPageComponent)
      }
    ]
  },

  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent)
      },
      {
        path: 'exams',
        loadComponent: () =>
          import('./features/admin/exam-list/exam-list.component').then((m) => m.ExamListComponent)
      },
      {
        path: 'exams/new',
        loadComponent: () =>
          import('./features/admin/exam-editor/exam-editor.component').then((m) => m.ExamEditorComponent)
      },
      {
        path: 'exams/:examId/edit',
        loadComponent: () =>
          import('./features/admin/exam-editor/exam-editor.component').then((m) => m.ExamEditorComponent)
      },
      {
        path: 'exams/:examId/questions',
        loadComponent: () =>
          import('./features/admin/question-manager/question-manager.component').then((m) => m.QuestionManagerComponent)
      },
      {
        path: 'exams/:examId/results',
        loadComponent: () =>
          import('./features/admin/exam-results/exam-results.component').then((m) => m.ExamResultsComponent)
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./features/admin/student-management/student-management.component').then((m) => m.StudentManagementComponent)
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./features/admin/analytics/admin-analytics.component').then((m) => m.AdminAnalyticsComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/admin/admin-profile/admin-profile.component').then((m) => m.AdminProfileComponent)
      }
    ]
  },

  {
    path: 'student',
    canActivate: [authGuard, roleGuard],
    data: { role: 'student' },
    loadComponent: () => import('./layouts/student-layout/student-layout.component').then((m) => m.StudentLayoutComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/student/dashboard/student-dashboard.component').then((m) => m.StudentDashboardComponent)
      },
      {
        path: 'exams',
        loadComponent: () =>
          import('./features/student/available-exams/available-exams.component').then((m) => m.AvailableExamsComponent)
      },
      {
        path: 'exams/:examId/instructions',
        loadComponent: () =>
          import('./features/student/exam-instructions/exam-instructions.component').then((m) => m.ExamInstructionsComponent)
      },
      {
        path: 'exams/:examId/attempt/:attemptId',
        canDeactivate: [unsavedExamGuard],
        loadComponent: () =>
          import('./features/student/take-exam/take-exam.component').then((m) => m.TakeExamComponent)
      },
      {
        path: 'attempts',
        loadComponent: () =>
          import('./features/student/previous-attempts/previous-attempts.component').then((m) => m.PreviousAttemptsComponent)
      },
      {
        path: 'attempts/:attemptId/result',
        loadComponent: () =>
          import('./features/student/result-analysis/result-analysis.component').then((m) => m.ResultAnalysisComponent)
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/student/student-profile/student-profile.component').then((m) => m.StudentProfileComponent)
      }
    ]
  },

  {
    path: 'not-found',
    loadComponent: () => import('./features/errors/not-found/not-found.component').then((m) => m.NotFoundComponent)
  },
  { path: '**', redirectTo: 'not-found' }
];
