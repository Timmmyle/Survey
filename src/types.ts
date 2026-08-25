export interface CandidateInfo {
  firstName: string;
  lastName: string;
  position: string;
  phone: string;
  email: string;
  interviewDate: string;
}

export interface Question {
  id: string;
  text: string;
}

export interface PositionQuestions {
  position: string;
  questions: Question[];
}

export type EvaluationStatus = 'Đang được xét duyệt' | 'Đã tuyển' | 'Không tuyển';

export interface EvaluationResult {
  id: string;
  candidate: CandidateInfo;
  scores: Record<string, number>; // maps question.id to rating (1-5)
  audioUrl: string | null;
  transcript: string;
  completedAt: string;
  status: EvaluationStatus;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  status: 'Draft' | 'Published';
  createdAt: string;
  updatedAt: string;
}

export type QuestionType =
  | 'Short Text'
  | 'Long Text'
  | 'Single Choice'
  | 'Multiple Choice'
  | 'Rating / Scale'
  | 'Yes / No'
  | 'Voice Answer';

export interface SurveyQuestion {
  id: string;
  surveyId: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  options?: string[]; // Options list for Single/Multiple choice questions
  order: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  submittedAt: string;
  answers: Record<string, any>; // maps questionId to answered value (string | string[] | number)
}

// ==========================================
// LÂN SƯ RỒNG SURVEY SCHEMAS (DATABASE READY)
// ==========================================

export interface Participant {
  id: string;
  code: string; // e.g. QT-LĐ-1
  groupCode: string; // e.g. QT-LĐ
  fullName?: string;
  titleUnit?: string;
  participationForm: 'Bảng hỏi khảo sát' | 'Phỏng vấn' | 'Cả hai hình thức';
  consentAgreed: boolean;
  consentRecord: boolean | null; // null for non-interview groups
  createdAt: string;
}

export interface BrandSurveySubmission {
  id: string;
  participant: Participant;
  likertAnswers: Record<string, any>; // maps questionId to score (1-5), checkboxes (string[]), or open texts
  interviewAnswers: Record<string, { text: string; audioUrl: string | null }>; // maps questionId to text & audio
  submittedAt: string;
}
