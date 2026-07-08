import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

import { QuestionService } from '../../../core/services/question.service';
import { ExamService } from '../../../core/services/exam.service';
import { ToastService } from '../../../core/services';
import { ConfirmDialogService, PageHeaderComponent, EmptyStateComponent, SearchInputComponent } from '../../../shared/components';
import { Question, QuestionDifficulty, QuestionFormValue, QuestionType } from '../../../core/models';

@Component({
  selector: 'oes-question-manager',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDialogModule,
    PageHeaderComponent,
    EmptyStateComponent,
    SearchInputComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './question-manager.component.html',
  styleUrl: './question-manager.component.css'
})
export class QuestionManagerComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly questionService = inject(QuestionService);
  private readonly examService = inject(ExamService);
  private readonly toastService = inject(ToastService);
  private readonly confirmDialog = inject(ConfirmDialogService);
  private readonly route = inject(ActivatedRoute);

  readonly examId = this.route.snapshot.paramMap.get('examId') as string;
  readonly exam = computed(() => this.examService.getById(this.examId));

  readonly searchTerm = signal('');
  readonly isFormOpen = signal(false);
  readonly editingQuestionId = signal<string | null>(null);

  readonly questions = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const all = this.questionService.getByExam(this.examId);
    if (!term) return all;
    return all.filter((q) => q.text.toLowerCase().includes(term) || q.topic.toLowerCase().includes(term));
  });

  readonly form = this.formBuilder.nonNullable.group({
    text: ['', [Validators.required, Validators.minLength(5)]],
    type: ['single' as QuestionType, [Validators.required]],
    topic: ['', [Validators.required]],
    difficulty: ['medium' as QuestionDifficulty, [Validators.required]],
    marks: [5, [Validators.required, Validators.min(1)]],
    negativeMarks: [0, [Validators.required, Validators.min(0)]],
    options: this.formBuilder.array(
      [this.buildOptionGroup(), this.buildOptionGroup(), this.buildOptionGroup(), this.buildOptionGroup()]
    ),
    correctOptionIndex: [0, [Validators.required]]
  });

  get optionsArray(): FormArray {
    return this.form.get('options') as FormArray;
  }

  private buildOptionGroup(text = ''): FormGroup {
    return this.formBuilder.nonNullable.group({
      text: [text, [Validators.required]]
    });
  }

  openCreateForm(): void {
    this.editingQuestionId.set(null);
    this.form.reset({
      text: '',
      type: 'single',
      topic: this.exam()?.subject ?? '',
      difficulty: 'medium',
      marks: 5,
      negativeMarks: 0,
      correctOptionIndex: 0
    });
    this.resetOptionsArray(['', '', '', '']);
    this.isFormOpen.set(true);
  }

  openEditForm(question: Question): void {
    this.editingQuestionId.set(question.id);
    this.form.reset({
      text: question.text,
      type: question.type,
      topic: question.topic,
      difficulty: question.difficulty,
      marks: question.marks,
      negativeMarks: question.negativeMarks,
      correctOptionIndex: question.options.findIndex((o) => question.correctOptionIds.includes(o.id))
    });
    this.resetOptionsArray(question.options.map((o) => o.text));
    this.isFormOpen.set(true);
  }

  private resetOptionsArray(texts: string[]): void {
    this.optionsArray.clear();
    texts.forEach((text) => this.optionsArray.push(this.buildOptionGroup(text)));
  }

  addOption(): void {
    if (this.optionsArray.length >= 6) return;
    this.optionsArray.push(this.buildOptionGroup());
  }

  removeOption(index: number): void {
    if (this.optionsArray.length <= 2) return;
    this.optionsArray.removeAt(index);
    const correctIndex = this.form.controls.correctOptionIndex.value;
    if (correctIndex >= this.optionsArray.length) {
      this.form.controls.correctOptionIndex.setValue(0);
    }
  }

  closeForm(): void {
    this.isFormOpen.set(false);
  }

  saveQuestion(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const optionTexts: string[] = raw.options.map((o) => o['text']);
    const options = optionTexts.map((text, index) => ({
      id: `opt_${index}_${Date.now()}`,
      text
    }));
    const correctOptionIds = [options[raw.correctOptionIndex].id];

    const value: QuestionFormValue = {
      text: raw.text,
      type: raw.type,
      options,
      correctOptionIds,
      marks: raw.marks,
      negativeMarks: raw.negativeMarks,
      difficulty: raw.difficulty,
      topic: raw.topic
    };

    const editingId = this.editingQuestionId();
    if (editingId) {
      const previous = this.questionService.getById(editingId);
      this.questionService.update(editingId, value);
      if (previous) {
        this.examService.detachQuestion(this.examId, editingId, previous.marks);
        this.examService.attachQuestion(this.examId, editingId, value.marks);
      }
      this.toastService.success('Question updated');
    } else {
      const created = this.questionService.create(this.examId, value);
      this.examService.attachQuestion(this.examId, created.id, created.marks);
      this.toastService.success('Question added', 'It has been added to the exam.');
    }

    this.isFormOpen.set(false);
  }

  async deleteQuestion(question: Question): Promise<void> {
    const confirmed = await this.confirmDialog.confirmDelete('Question');
    if (!confirmed) return;

    this.questionService.delete(question.id);
    this.examService.detachQuestion(this.examId, question.id, question.marks);
    this.toastService.success('Question deleted');
  }

  difficultyColor(difficulty: QuestionDifficulty): string {
    return difficulty === 'easy' ? 'var(--oes-success-600)' : difficulty === 'medium' ? 'var(--oes-warning-600)' : 'var(--oes-danger-600)';
  }
}
