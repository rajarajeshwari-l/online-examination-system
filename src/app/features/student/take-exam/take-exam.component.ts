import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ExamService } from '../../../core/services/exam.service';
import { QuestionService } from '../../../core/services/question.service';
import { AttemptService } from '../../../core/services/attempt.service';
import { ToastService } from '../../../core/services';
import { ConfirmDialogService, CountdownTimerComponent } from '../../../shared/components';
import { AttemptAnswer, Question } from '../../../core/models';
import { DeactivatableExamComponent } from '../../../core/guards/unsaved-exam.guard';

interface QuestionViewModel {
  question: Question;
  answer: AttemptAnswer;
  index: number;
}

@Component({
  selector: 'oes-take-exam',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, CountdownTimerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './take-exam.component.html',
  styleUrl: './take-exam.component.css'
})
export class TakeExamComponent implements DeactivatableExamComponent {
  private readonly examService = inject(ExamService);
  private readonly questionService = inject(QuestionService);
  private readonly attemptService = inject(AttemptService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly examId = this.route.snapshot.paramMap.get('examId') as string;
  readonly attemptId = this.route.snapshot.paramMap.get('attemptId') as string;

  readonly exam = computed(() => this.examService.getById(this.examId));

  private readonly _attempt = signal(this.attemptService.getById(this.attemptId));
  readonly attempt = this._attempt.asReadonly();

  private readonly _answers = signal<AttemptAnswer[]>(this._attempt()?.answers ?? []);
  readonly currentIndex = signal(0);
  private hasSubmitted = false;

  readonly questionVMs = computed<QuestionViewModel[]>(() => {
    const attempt = this._attempt();
    if (!attempt) return [];
    return attempt.questionOrder.map((questionId, index) => {
      const question = this.questionService.getById(questionId) as Question;
      const answer = this._answers().find((a) => a.questionId === questionId) as AttemptAnswer;
      return { question, answer, index };
    });
  });

  readonly currentQuestion = computed(() => this.questionVMs()[this.currentIndex()]);

  readonly answeredCount = computed(() => this._answers().filter((a) => a.selectedOptionIds.length > 0).length);
  readonly markedCount = computed(() => this._answers().filter((a) => a.markedForReview).length);

  canLeavePage(): boolean {
    return this.hasSubmitted;
  }

  goToQuestion(index: number): void {
    this.currentIndex.set(index);
    this.markVisited(index);
  }

  private markVisited(index: number): void {
    const vm = this.questionVMs()[index];
    if (!vm || vm.answer.isVisited) return;
    this.updateAnswer(vm.question.id, { isVisited: true });
  }

  selectOption(questionId: string, optionId: string, questionType: string): void {
    const current = this._answers().find((a) => a.questionId === questionId);
    if (!current) return;

    let selectedOptionIds: string[];
    if (questionType === 'multiple') {
      selectedOptionIds = current.selectedOptionIds.includes(optionId)
        ? current.selectedOptionIds.filter((id) => id !== optionId)
        : [...current.selectedOptionIds, optionId];
    } else {
      selectedOptionIds = [optionId];
    }

    this.updateAnswer(questionId, { selectedOptionIds });
  }

  toggleMarkForReview(questionId: string): void {
    const current = this._answers().find((a) => a.questionId === questionId);
    if (!current) return;
    this.updateAnswer(questionId, { markedForReview: !current.markedForReview });
  }

  clearResponse(questionId: string): void {
    this.updateAnswer(questionId, { selectedOptionIds: [] });
  }

  private updateAnswer(questionId: string, patch: Partial<AttemptAnswer>): void {
    const updated = this._answers().map((a) => (a.questionId === questionId ? { ...a, ...patch } : a));
    this._answers.set(updated);
    const attempt = this._attempt();
    if (attempt) {
      this.attemptService.saveProgress(attempt.id, updated, attempt.remainingSeconds);
    }
  }

  onTimerTick(remainingSeconds: number): void {
    const attempt = this._attempt();
    if (attempt) {
      this.attemptService.saveProgress(attempt.id, this._answers(), remainingSeconds);
    }
  }

  onTimerExpired(): void {
    this.toastService.warning('Time is up!', 'Your exam is being submitted automatically.');
    this.finalizeSubmission(true);
  }

  goPrevious(): void {
    if (this.currentIndex() > 0) this.goToQuestion(this.currentIndex() - 1);
  }

  goNext(): void {
    if (this.currentIndex() < this.questionVMs().length - 1) this.goToQuestion(this.currentIndex() + 1);
  }

  async submitExam(): Promise<void> {
    const unanswered = this._answers().filter((a) => a.selectedOptionIds.length === 0).length;
    const confirmed = await this.confirmDialog.open({
      title: 'Submit exam?',
      message:
        unanswered > 0
          ? `You have ${unanswered} unanswered question(s). Once submitted, you cannot make further changes. Continue?`
          : 'Once submitted, you cannot make further changes. Are you sure you want to submit?',
      confirmLabel: 'Submit',
      icon: 'assignment_turned_in'
    });
    if (!confirmed) return;

    this.finalizeSubmission(false);
  }

  private finalizeSubmission(autoSubmitted: boolean): void {
    this.hasSubmitted = true;
    const finalized = this.attemptService.submitAttempt(this.attemptId, autoSubmitted);
    this.toastService.success(
      autoSubmitted ? 'Auto-submitted' : 'Exam submitted',
      `You scored ${finalized.score} / ${finalized.totalMarks} (${finalized.percentage}%).`
    );
    this.router.navigate(['/student/attempts', finalized.id, 'result']);
  }

  questionStatusClass(vm: QuestionViewModel): string {
    if (vm.answer.markedForReview) return 'marked';
    if (vm.answer.selectedOptionIds.length > 0) return 'answered';
    if (vm.answer.isVisited) return 'visited';
    return 'unvisited';
  }
}
