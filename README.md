# ExamPro — Online Exam System

A premium, production-quality **Online Exam System** built with **Angular 20**, standalone components, and Signals. No backend required — the entire app runs on LocalStorage, making it perfect for demos, portfolios, and interviews.

![Angular](https://img.shields.io/badge/Angular-20-DD0031?logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Material](https://img.shields.io/badge/Angular%20Material-20-757575?logo=angular)

## ✨ Features

### Admin
- Dashboard with live stats, score distribution, pass/fail donut chart, exam performance, and recent activity
- Full exam CRUD (create, edit, duplicate, delete, publish/draft/archive)
- Question bank manager with single/multiple-choice support, difficulty, marks & negative marking
- Per-exam results table with sorting, search, and PDF export (single result or full class export)
- Student management with search, pagination, and suspend/reactivate
- Deep analytics: performance tiers, exam-wise averages, leaderboard of top performers
- Editable profile

### Student
- Self-registration and login
- Dashboard with recommended exams and recent results
- Browse available exams with search & pagination
- Instructions screen with exam rules and agreement checkbox
- Full exam-taking experience: countdown timer with auto-submit, question palette (answered / marked / visited / unvisited), mark-for-review, clear response, previous/next navigation
- Random question and option ordering per attempt
- Auto-scoring engine with configurable negative marking
- Previous attempts history and detailed question-by-question result analysis
- PDF export of individual results
- Editable profile

### Platform-wide
- Light & dark mode with persisted preference
- Toast notifications, confirm dialogs, skeleton loaders, empty states
- Route guards: auth guard, role guard, guest guard, and a can-deactivate guard that protects in-progress exams
- Fully lazy-loaded routes per feature area
- Responsive design (mobile, tablet, desktop)
- Seeded demo data on first run (1 admin, 4 students, 3 exams, 24 questions)

## 🚀 Getting Started

```bash
npm install
npm start
```

The app will open at `http://localhost:4200`.

To build for production:

```bash
npm run build
```

Output is written to `dist/online-exam-system`.

## 🔑 Demo Accounts

| Role    | Email                              | Password     |
|---------|-------------------------------------|--------------|
| Admin   | admin@exampro.io                    | Admin@123    |
| Student | liam.carter@student.exampro.io      | Student@123  |

Both are pre-filled as one-click "quick demo access" chips on the login screen. You can also register a brand-new student account from the login page.

## 🏗️ Architecture

```
src/app/
├── core/               # Singletons: services, guards, models, error handling
│   ├── guards/          # authGuard, roleGuard, guestGuard, unsavedExamGuard
│   ├── models/          # Domain types (User, Exam, Question, Attempt, UI)
│   └── services/        # Auth, Exam, Question, Attempt, Analytics, PDF export,
│                         # Storage, Toast, Theme, Loading, Seed data
├── shared/
│   └── components/      # Reusable UI kit: stat cards, charts, avatar, search,
│                         # paginator, countdown timer, confirm dialog, toasts, etc.
├── layouts/              # AdminLayout, StudentLayout, AuthLayout shells
└── features/
    ├── auth/             # Login, Register
    ├── admin/             # Dashboard, Exams, Questions, Results, Students, Analytics, Profile
    ├── student/           # Dashboard, Exams, Instructions, Take Exam, Attempts, Result, Profile
    └── errors/            # 404
```

All data access flows through core services backed by a namespaced `StorageService` wrapper around `localStorage` — no backend, no API keys, works entirely offline.

## 🎨 Design System

The visual language lives in `src/styles.css` as CSS custom properties: a brand gradient, light/dark surface tokens, glassmorphism panels, skeleton shimmer, and consistent radii/shadows/transitions — giving every screen a cohesive, modern SaaS feel.

## 📝 Notes

- This is a client-only demo app. Passwords are hashed with a simple deterministic hash for realism (see `PasswordHasherService`) — it is **not** cryptographically secure and should never be used in a real backend-connected product.
- PDF export uses `jsPDF` + `jspdf-autotable`.
- Clearing your browser's LocalStorage will reset the app back to its seeded demo state.
