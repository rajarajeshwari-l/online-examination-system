import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ExamService } from '../../../core/services/exam.service';
import { QuestionService } from '../../../core/services/question.service';
import { AttemptService } from '../../../core/services/attempt.service';
import { AuthService, ToastService, LoadingService } from '../../../core/services';
import { PageHeaderComponent } from '../../../shared/components';

@Component({
  selector: 'oes-exam-instructions',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, MatCheckboxModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exam-instructions.component.html',
  styleUrl: './exam-instructions.component.css'
})
export class ExamInstructionsComponent {
  private readonly examService = inject(ExamService);
  private readonly questionService = inject(QuestionService);
  private readonly attemptService = inject(AttemptService);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly loadingService = inject(LoadingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly examId = this.route.snapshot.paramMap.get('examId') as string;
  readonly exam = computed(() => this.examService.getById(this.examId));
  readonly questionCount = computed(() => this.questionService.getByExam(this.examId).length);

  readonly hasAgreed = signal(false);
  readonly isStarting = signal(false);

  readonly rules = [
    'The timer starts as soon as you begin and cannot be paused.',
    'Your exam will auto-submit when the timer reaches zero.',
    'Do not refresh or close this tab — your progress is saved automatically.',
    'Each question may award negative marks for incorrect answers, as noted per question.',
    'Once submitted, answers cannot be changed.'
  ];

  async startExam(): Promise<void> {
    if (!this.hasAgreed()) {
      this.toastService.warning('Please confirm', 'You must agree to the exam rules before starting.');
      return;
    }

    const exam = this.exam();
    if (!exam) return;

    this.isStarting.set(true);
    await this.loadingService.simulateDelay(500);

    const studentId = this.authService.session()?.userId ?? '';
    const attempt = this.attemptService.startAttempt(exam.id, studentId);
    this.isStarting.set(false);

    this.router.navigate(['/student/exams', exam.id, 'attempt', attempt.id]);
  }
}
