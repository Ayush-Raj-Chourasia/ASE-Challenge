// src/controllers/quizController.ts

import { Request, Response, NextFunction } from 'express';
import { QuizService } from '../services/quizService';
import { scoreQuiz, validateSelectedOptions, validateTextAnswerLength } from '../utils/scoring';
import { 
  CreateQuizRequest, 
  AddQuestionRequest, 
  SubmitQuizRequest, 
  Answer,
  GetQuestionsResponse,
  ID 
} from '../models/types';
import { notFoundError, badRequestError } from '../middleware/errorHandler';

export class QuizController {
  // POST /quizzes
  static async createQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request: CreateQuizRequest = req.body;
      const quiz = QuizService.createQuiz(request);
      
      res.status(201).json({
        id: quiz.id,
        title: quiz.title
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /quizzes
  static async getAllQuizzes(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const summaries = QuizService.getAllQuizSummaries();
      
      res.status(200).json(summaries);
    } catch (error) {
      next(error);
    }
  }

  // GET /quizzes/:quizId
  static async getQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quizId: ID = req.params.quizId;
      const quiz = QuizService.getQuiz(quizId);
      
      if (!quiz) {
        throw notFoundError('Quiz');
      }
      
      res.status(200).json({
        id: quiz.id,
        title: quiz.title,
        questionCount: quiz.questions.length,
        createdAt: quiz.createdAt,
        updatedAt: quiz.updatedAt
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /quizzes/:quizId/questions
  static async addQuestion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quizId: ID = req.params.quizId;
      const request: AddQuestionRequest = req.body;
      
      // Check if quiz exists
      const quiz = QuizService.getQuiz(quizId);
      if (!quiz) {
        throw notFoundError('Quiz');
      }
      
      const question = QuizService.addQuestionToQuiz(quizId, request);
      
      if (!question) {
        throw badRequestError('Failed to add question to quiz');
      }
      
      res.status(201).json({
        id: question.id,
        text: question.text,
        type: question.type,
        options: question.options,
        maxWords: question.maxWords
      });
    } catch (error) {
      next(error);
    }
  }

  // GET /quizzes/:quizId/questions
  static async getQuestions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quizId: ID = req.params.quizId;
      
      // Check if quiz exists
      const quiz = QuizService.getQuiz(quizId);
      if (!quiz) {
        throw notFoundError('Quiz');
      }
      
      const questions = QuizService.getQuestionsForQuiz(quizId);
      
      // Remove isCorrect flags from options for security
      const sanitizedQuestions: GetQuestionsResponse[] = questions.map(question => ({
        id: question.id,
        text: question.text,
        type: question.type,
        options: question.options?.map(option => ({
          id: option.id,
          text: option.text
        })),
        maxWords: question.maxWords
      }));
      
      res.status(200).json(sanitizedQuestions);
    } catch (error) {
      next(error);
    }
  }

  // POST /quizzes/:quizId/submit
  static async submitQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quizId: ID = req.params.quizId;
      const request: SubmitQuizRequest = req.body;
      
      // Check if quiz exists
      const quiz = QuizService.getQuiz(quizId);
      if (!quiz) {
        throw notFoundError('Quiz');
      }
      
      // Validate answers against quiz questions
      await this.validateAnswers(quiz.questions, request.answers);
      
      // Score the quiz
      const result = scoreQuiz(quiz.questions, request.answers);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /quizzes/:quizId
  static async deleteQuiz(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const quizId: ID = req.params.quizId;
      
      const deleted = QuizService.deleteQuiz(quizId);
      if (!deleted) {
        throw notFoundError('Quiz');
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Helper method to validate answers
  private static async validateAnswers(questions: any[], answers: Answer[]): Promise<void> {
    const questionMap = new Map(questions.map(q => [q.id, q]));
    
    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) {
        throw badRequestError(`Question with ID ${answer.questionId} not found`);
      }
      
      // Validate based on question type
      if (question.type === 'single' || question.type === 'multiple') {
        if (!answer.selectedOptionIds || answer.selectedOptionIds.length === 0) {
          throw badRequestError(`Selected options required for question ${answer.questionId}`);
        }
        
        if (!validateSelectedOptions(question, answer.selectedOptionIds)) {
          throw badRequestError(`Invalid option IDs for question ${answer.questionId}`);
        }
        
        if (question.type === 'single' && answer.selectedOptionIds.length !== 1) {
          throw badRequestError(`Single choice question ${answer.questionId} requires exactly one option`);
        }
      } else if (question.type === 'text') {
        if (!answer.textAnswer || answer.textAnswer.trim().length === 0) {
          throw badRequestError(`Text answer required for question ${answer.questionId}`);
        }
        
        if (question.maxWords && !validateTextAnswerLength(answer.textAnswer, question.maxWords)) {
          throw badRequestError(`Text answer for question ${answer.questionId} exceeds ${question.maxWords} words`);
        }
      }
    }
  }
}
