import { Injectable } from '@angular/core';
import { ExamService } from './exam.service';
import { AttemptService } from './attempt.service';
import { AuthService } from './auth.service';
import { QuestionService } from './question.service';

export interface AdminOverviewStats {
  totalExams: number;
  publishedExams: number;
  totalStudents: number;
  totalQuestions: number;
  totalAttempts: number;
  averageScorePercentage: number;
  passRatePercentage: number;
}

export interface ScoreDistributionBucket {
  label: string;
  count: number;
}

export interface ExamPerformancePoint {
  examTitle: string;
  averagePercentage: number;
  attemptCount: number;
}

export interface RecentActivityItem {
  studentName: string;
  examTitle: string;
  percentage: number;
  passed: boolean;
  submittedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(
    private readonly examService: ExamService,
    private readonly attemptService: AttemptService,
    private readonly authService: AuthService,
    private readonly questionService: QuestionService
  ) {}

  getOverviewStats(): AdminOverviewStats {
    const exams = this.examService.exams();
    const students = this.authService.getAllUsers().filter((u) => u.role === 'student');
    const attempts = this.attemptService.attempts().filter((a) => a.status !== 'in-progress');

    const averageScorePercentage =
      attempts.length > 0
        ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length)
        : 0;
    const passRatePercentage =
      attempts.length > 0
        ? Math.round((attempts.filter((a) => a.passed).length / attempts.length) * 100)
        : 0;

    return {
      totalExams: exams.length,
      publishedExams: exams.filter((e) => e.status === 'published').length,
      totalStudents: students.length,
      totalQuestions: this.questionService.totalCount(),
      totalAttempts: attempts.length,
      averageScorePercentage,
      passRatePercentage
    };
  }

  getScoreDistribution(): ScoreDistributionBucket[] {
    const attempts = this.attemptService.attempts().filter((a) => a.status !== 'in-progress');
    const buckets = [
      { label: '0-20%', min: 0, max: 20 },
      { label: '21-40%', min: 21, max: 40 },
      { label: '41-60%', min: 41, max: 60 },
      { label: '61-80%', min: 61, max: 80 },
      { label: '81-100%', min: 81, max: 100 }
    ];

    return buckets.map((bucket) => ({
      label: bucket.label,
      count: attempts.filter((a) => a.percentage >= bucket.min && a.percentage <= bucket.max).length
    }));
  }

  getExamPerformance(): ExamPerformancePoint[] {
    return this.examService.getSummaries().map((exam) => ({
      examTitle: exam.title,
      averagePercentage: exam.averageScore,
      attemptCount: exam.attemptCount
    }));
  }

  getRecentActivity(limit = 6): RecentActivityItem[] {
    const attempts = this.attemptService
      .attempts()
      .filter((a) => a.status !== 'in-progress' && a.submittedAt)
      .sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime())
      .slice(0, limit);

    return attempts.map((attempt) => {
      const student = this.authService.getUserById(attempt.studentId);
      const exam = this.examService.getById(attempt.examId);
      return {
        studentName: student?.fullName ?? 'Unknown Student',
        examTitle: exam?.title ?? 'Untitled Exam',
        percentage: attempt.percentage,
        passed: attempt.passed,
        submittedAt: attempt.submittedAt as string
      };
    });
  }
}
