// src/middleware/validation.ts

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { 
  validateCreateQuizRequest, 
  validateAddQuestionRequest, 
  validateSubmitQuizRequest,
  validateQuizId,
  validateQuestionId 
} from '../models/validation';

export interface ValidationError {
  error: string;
  details: string | undefined;
  code: string;
}

export function createValidationError(message: string, details?: string, code?: string): ValidationError {
  return {
    error: message,
    details: details || '',
    code: code || 'VALIDATION_ERROR'
  };
}

export function handleValidationError(error: ZodError): ValidationError {
  const firstError = error.errors[0];
  if (!firstError) {
    return createValidationError('Validation error occurred');
  }
  
  return createValidationError(
    firstError.message,
    `Field: ${firstError.path.join('.')}`,
    'VALIDATION_ERROR'
  );
}

// Middleware for validating quiz creation
export function validateCreateQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    req.body = validateCreateQuizRequest(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = handleValidationError(error);
      res.status(400).json(validationError);
    } else {
      res.status(500).json(createValidationError('Internal validation error'));
    }
  }
}

// Middleware for validating question addition
export function validateAddQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    req.body = validateAddQuestionRequest(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = handleValidationError(error);
      res.status(400).json(validationError);
    } else {
      res.status(500).json(createValidationError('Internal validation error'));
    }
  }
}

// Middleware for validating quiz submission
export function validateSubmitQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    req.body = validateSubmitQuizRequest(req.body);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = handleValidationError(error);
      res.status(400).json(validationError);
    } else {
      res.status(500).json(createValidationError('Internal validation error'));
    }
  }
}

// Middleware for validating quiz ID parameter
export function validateQuizIdParam(req: Request, res: Response, next: NextFunction) {
  try {
    req.params['quizId'] = validateQuizId(req.params['quizId']);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = handleValidationError(error);
      res.status(400).json(validationError);
    } else {
      res.status(500).json(createValidationError('Invalid quiz ID'));
    }
  }
}

// Middleware for validating question ID parameter
export function validateQuestionIdParam(req: Request, res: Response, next: NextFunction) {
  try {
    req.params['questionId'] = validateQuestionId(req.params['questionId']);
    next();
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = handleValidationError(error);
      res.status(400).json(validationError);
    } else {
      res.status(500).json(createValidationError('Invalid question ID'));
    }
  }
}
