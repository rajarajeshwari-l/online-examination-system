import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AttemptReport } from '../models';

@Injectable({ providedIn: 'root' })
export class PdfExportService {
  exportAttemptReport(report: AttemptReport): void {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const { attempt, examTitle, studentName, questionResults } = report;

    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229);
    doc.text('ExamPro — Result Report', 40, 48);

    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text(`Exam: ${examTitle}`, 40, 76);
    doc.text(`Student: ${studentName}`, 40, 94);
    doc.text(`Submitted: ${attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString() : 'N/A'}`, 40, 112);
    doc.text(`Score: ${attempt.score} / ${attempt.totalMarks} (${attempt.percentage}%)`, 40, 130);
    doc.text(`Result: ${attempt.passed ? 'PASSED' : 'FAILED'}`, 40, 148);

    autoTable(doc, {
      startY: 168,
      head: [['#', 'Question', 'Your Answer', 'Correct Answer', 'Marks']],
      styles: { fontSize: 9, cellPadding: 6, overflow: 'linebreak' },
      headStyles: { fillColor: [79, 70, 229] },
      columnStyles: {
        0: { cellWidth: 24 },
        1: { cellWidth: 200 },
        4: { cellWidth: 48 }
      },
      body: questionResults.map((q, index) => [
        index + 1,
        q.questionText,
        q.options.filter((o) => q.selectedOptionIds.includes(o.id)).map((o) => o.text).join(', ') || '—',
        q.options.filter((o) => q.correctOptionIds.includes(o.id)).map((o) => o.text).join(', '),
        q.marksAwarded
      ])
    });

    doc.save(`${examTitle.replace(/\s+/g, '_')}_Result_${studentName.replace(/\s+/g, '_')}.pdf`);
  }

  exportResultsTable(examTitle: string, rows: { student: string; score: number; total: number; percentage: number; status: string }[]): void {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    doc.setFontSize(18);
    doc.setTextColor(79, 70, 229);
    doc.text(`ExamPro — ${examTitle} Results`, 40, 48);

    autoTable(doc, {
      startY: 72,
      head: [['Student', 'Score', 'Total', 'Percentage', 'Status']],
      headStyles: { fillColor: [79, 70, 229] },
      body: rows.map((r) => [r.student, r.score, r.total, `${r.percentage}%`, r.status])
    });

    doc.save(`${examTitle.replace(/\s+/g, '_')}_All_Results.pdf`);
  }
}
