// src/models/types.ts

export type ID = string;

export interface Option {
  id: ID;
  text: string;
  isCorrect?: boolean; // Server-only flag (not returned to client when fetching questions)
}

export type QuestionType = 'single' | 'multiple' | 'text';

export interface Question {
  id: ID;
  text: string;
  type: QuestionType;
  options?: Option[]; // Optional for text questions
  maxWords?: number;  // For text questions (e.g., 300)
}

export interface Quiz {
  id: ID;
  title: string;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

// Request/Response DTOs
export interface CreateQuizRequest {
  title: string;
}

export interface CreateQuizResponse {
  id: ID;
  title: string;
}

export interface AddQuestionRequest {
  text: string;
  type: QuestionType;
  options?: Array<{
    text: string;
    isCorrect?: boolean;
  }>;
  maxWords?: number;
}

export interface AddQuestionResponse {
  id: ID;
  text: string;
  type: QuestionType;
  options?: Option[];
  maxWords?: number;
}

export interface GetQuestionsResponse {
  id: ID;
  text: string;
  type: QuestionType;
  options?: Array<{
    id: ID;
    text: string;
  }>;
  maxWords?: number;
}

export interface Answer {
  questionId: ID;
  selectedOptionIds?: ID[]; // For single/multiple choice questions
  textAnswer?: string;      // For text questions
}

export interface SubmitQuizRequest {
  answers: Answer[];
}

export interface SubmitQuizResponse {
  score: number;
  total: number;
}

export interface QuizSummary {
  id: ID;
  title: string;
  questionCount: number;
  createdAt: Date;
}

// Error types
export interface ApiError {
  error: string;
  details?: string;
  code?: string;
}

// Validation schemas will be defined separately using Zod
