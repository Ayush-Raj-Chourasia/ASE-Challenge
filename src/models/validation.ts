// src/models/validation.ts

import { z } from 'zod';

// Base schemas
export const IDSchema = z.string().min(1, 'ID cannot be empty');

export const OptionSchema = z.object({
  text: z.string().min(1, 'Option text cannot be empty').max(200, 'Option text cannot exceed 200 characters'),
  isCorrect: z.boolean().optional()
});

export const QuestionTypeSchema = z.enum(['single', 'multiple', 'text']);

export const QuestionSchema = z.object({
  text: z.string().min(1, 'Question text cannot be empty').max(500, 'Question text cannot exceed 500 characters'),
  type: QuestionTypeSchema,
  options: z.array(OptionSchema).optional(),
  maxWords: z.number().int().min(1).max(1000).optional()
});

// Request validation schemas
export const CreateQuizRequestSchema = z.object({
  title: z.string().min(1, 'Quiz title cannot be empty').max(100, 'Quiz title cannot exceed 100 characters')
});

export const AddQuestionRequestSchema = z.object({
  text: z.string().min(1, 'Question text cannot be empty').max(500, 'Question text cannot exceed 500 characters'),
  type: QuestionTypeSchema,
  options: z.array(OptionSchema).optional(),
  maxWords: z.number().int().min(1).max(1000).optional()
}).refine((data) => {
  // Validation rules based on question type
  if (data.type === 'single') {
    if (!data.options || data.options.length < 2) {
      return false;
    }
    const correctOptions = data.options.filter(opt => opt.isCorrect);
    return correctOptions.length === 1;
  }
  
  if (data.type === 'multiple') {
    if (!data.options || data.options.length < 2) {
      return false;
    }
    const correctOptions = data.options.filter(opt => opt.isCorrect);
    return correctOptions.length >= 1;
  }
  
  if (data.type === 'text') {
    // Text questions don't need options, but maxWords should be provided
    return data.maxWords !== undefined && data.maxWords > 0;
  }
  
  return true;
}, {
  message: 'Invalid question configuration for the specified type'
});

export const AnswerSchema = z.object({
  questionId: IDSchema,
  selectedOptionIds: z.array(IDSchema).optional(),
  textAnswer: z.string().optional()
}).refine((data) => {
  // Either selectedOptionIds or textAnswer must be provided, but not both
  const hasSelectedOptions = data.selectedOptionIds && data.selectedOptionIds.length > 0;
  const hasTextAnswer = data.textAnswer && data.textAnswer.trim().length > 0;
  
  return hasSelectedOptions || hasTextAnswer;
}, {
  message: 'Either selectedOptionIds or textAnswer must be provided'
});

export const SubmitQuizRequestSchema = z.object({
  answers: z.array(AnswerSchema).min(1, 'At least one answer must be provided')
});

// Response validation schemas (for testing)
export const CreateQuizResponseSchema = z.object({
  id: IDSchema,
  title: z.string()
});

export const SubmitQuizResponseSchema = z.object({
  score: z.number().int().min(0),
  total: z.number().int().min(1)
});

// Utility functions for validation
export const validateCreateQuizRequest = (data: unknown) => {
  return CreateQuizRequestSchema.parse(data);
};

export const validateAddQuestionRequest = (data: unknown) => {
  return AddQuestionRequestSchema.parse(data);
};

export const validateSubmitQuizRequest = (data: unknown) => {
  return SubmitQuizRequestSchema.parse(data);
};

export const validateQuizId = (id: unknown) => {
  return IDSchema.parse(id);
};

export const validateQuestionId = (id: unknown) => {
  return IDSchema.parse(id);
};
