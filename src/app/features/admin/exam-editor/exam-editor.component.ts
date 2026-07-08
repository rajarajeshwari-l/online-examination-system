import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { ExamService } from '../../../core/services/exam.service';
import { AuthService, ToastService } from '../../../core/services';
import { PageHeaderComponent } from '../../../shared/components';
import { ExamFormValue } from '../../../core/models';

const ICON_PALETTE = [
  { icon: 'code', color: '#f59e0b' },
  { icon: 'view_in_ar', color: '#dc2626' },
  { icon: 'account_tree', color: '#6366f1' },
  { icon: 'science', color: '#059669' },
  { icon: 'calculate', color: '#0891b2' },
  { icon: 'language', color: '#8b5cf6' },
  { icon: 'psychology', color: '#ec4899' },
  { icon: 'public', color: '#10b981' }
];

@Component({
  selector: 'oes-exam-editor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    PageHeaderComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exam-editor.component.html',
  styleUrl: './exam-editor.component.css'
})
export class ExamEditorComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly examService = inject(ExamService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly iconPalette = ICON_PALETTE;
  readonly examId = signal<string | null>(this.route.snapshot.paramMap.get('examId'));
  readonly isEditMode = computed(() => this.examId() !== null);

  private readonly existingExam = computed(() => {
    const id = this.examId();
    return id ? this.examService.getById(id) : undefined;
  });

  readonly selectedIcon = signal(ICON_PALETTE[0]);

  readonly form = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    subject: ['', [Validators.required]],
    durationMinutes: [30, [Validators.required, Validators.min(1), Validators.max(300)]],
    passingMarks: [50, [Validators.required, Validators.min(0)]],
    questionsToShow: [10, [Validators.required, Validators.min(1)]],
    randomizeQuestions: [true],
    randomizeOptions: [true],
    status: ['draft' as 'draft' | 'published' | 'archived', [Validators.required]]
  });

  constructor() {
    const exam = this.existingExam();
    if (exam) {
      this.form.patchValue({
        title: exam.title,
        description: exam.description,
        subject: exam.subject,
        durationMinutes: exam.durationMinutes,
        passingMarks: exam.passingMarks,
        questionsToShow: exam.questionsToShow,
        randomizeQuestions: exam.randomizeQuestions,
        randomizeOptions: exam.randomizeOptions,
        status: exam.status
      });
      const matchedIcon = ICON_PALETTE.find((p) => p.icon === exam.thumbnailIcon);
      if (matchedIcon) this.selectedIcon.set(matchedIcon);
    }
  }

  selectIcon(choice: { icon: string; color: string }): void {
    this.selectedIcon.set(choice);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const value: ExamFormValue = {
      ...raw,
      startWindow: null,
      endWindow: null,
      thumbnailIcon: this.selectedIcon().icon,
      thumbnailColor: this.selectedIcon().color
    };

    const existing = this.existingExam();
    if (existing) {
      this.examService.update(existing.id, value);
      this.toastService.success('Exam updated', `"${value.title}" has been saved.`);
      this.router.navigateByUrl('/admin/exams');
    } else {
      const currentUserId = this.authService.session()?.userId ?? '';
      const created = this.examService.create(value, currentUserId);
      this.toastService.success('Exam created', 'Now add some questions to bring it to life.');
      this.router.navigate(['/admin/exams', created.id, 'questions']);
    }
  }

  cancel(): void {
    this.router.navigateByUrl('/admin/exams');
  }
}
