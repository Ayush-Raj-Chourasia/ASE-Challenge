// src/services/quizService.ts

import { Quiz, Question, ID, CreateQuizRequest, AddQuestionRequest } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage
class QuizStore {
  private quizzes: Map<ID, Quiz> = new Map();
  private questions: Map<ID, Question> = new Map();

  // Quiz operations
  createQuiz(request: CreateQuizRequest): Quiz {
    const id = uuidv4();
    const now = new Date();
    
    const quiz: Quiz = {
      id,
      title: request.title,
      questions: [],
      createdAt: now,
      updatedAt: now
    };

    this.quizzes.set(id, quiz);
    return quiz;
  }

  getQuiz(id: ID): Quiz | undefined {
    return this.quizzes.get(id);
  }

  getAllQuizzes(): Quiz[] {
    return Array.from(this.quizzes.values());
  }

  updateQuiz(id: ID, updates: Partial<Quiz>): Quiz | undefined {
    const quiz = this.quizzes.get(id);
    if (!quiz) {
      return undefined;
    }

    const updatedQuiz = {
      ...quiz,
      ...updates,
      updatedAt: new Date()
    };

    this.quizzes.set(id, updatedQuiz);
    return updatedQuiz;
  }

  deleteQuiz(id: ID): boolean {
    const quiz = this.quizzes.get(id);
    if (!quiz) {
      return false;
    }

    // Delete all questions for this quiz
    quiz.questions.forEach(question => {
      this.questions.delete(question.id);
    });

    return this.quizzes.delete(id);
  }

  // Question operations
  addQuestionToQuiz(quizId: ID, request: AddQuestionRequest): Question | undefined {
    const quiz = this.quizzes.get(quizId);
    if (!quiz) {
      return undefined;
    }

    const questionId = uuidv4();
    const optionIdGenerator = () => uuidv4();

    // Generate IDs for options
    const options = request.options?.map(opt => ({
      id: optionIdGenerator(),
      text: opt.text,
      isCorrect: opt.isCorrect
    }));

    const question: Question = {
      id: questionId,
      text: request.text,
      type: request.type,
      options,
      maxWords: request.maxWords
    };

    // Store the question
    this.questions.set(questionId, question);

    // Add to quiz
    quiz.questions.push(question);
    quiz.updatedAt = new Date();

    return question;
  }

  getQuestion(id: ID): Question | undefined {
    return this.questions.get(id);
  }

  getQuestionsForQuiz(quizId: ID): Question[] {
    const quiz = this.quizzes.get(quizId);
    if (!quiz) {
      return [];
    }

    return quiz.questions;
  }

  updateQuestion(id: ID, updates: Partial<Question>): Question | undefined {
    const question = this.questions.get(id);
    if (!question) {
      return undefined;
    }

    const updatedQuestion = {
      ...question,
      ...updates
    };

    this.questions.set(id, updatedQuestion);
    return updatedQuestion;
  }

  deleteQuestion(id: ID): boolean {
    return this.questions.delete(id);
  }

  // Utility methods
  getQuizSummary(id: ID) {
    const quiz = this.quizzes.get(id);
    if (!quiz) {
      return undefined;
    }

    return {
      id: quiz.id,
      title: quiz.title,
      questionCount: quiz.questions.length,
      createdAt: quiz.createdAt
    };
  }

  getAllQuizSummaries() {
    return Array.from(this.quizzes.values()).map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      questionCount: quiz.questions.length,
      createdAt: quiz.createdAt
    }));
  }
}

// Singleton instance
const quizStore = new QuizStore();

export class QuizService {
  // Quiz operations
  static createQuiz(request: CreateQuizRequest) {
    return quizStore.createQuiz(request);
  }

  static getQuiz(id: ID) {
    return quizStore.getQuiz(id);
  }

  static getAllQuizzes() {
    return quizStore.getAllQuizzes();
  }

  static updateQuiz(id: ID, updates: Partial<Quiz>) {
    return quizStore.updateQuiz(id, updates);
  }

  static deleteQuiz(id: ID) {
    return quizStore.deleteQuiz(id);
  }

  // Question operations
  static addQuestionToQuiz(quizId: ID, request: AddQuestionRequest) {
    return quizStore.addQuestionToQuiz(quizId, request);
  }

  static getQuestion(id: ID) {
    return quizStore.getQuestion(id);
  }

  static getQuestionsForQuiz(quizId: ID) {
    return quizStore.getQuestionsForQuiz(quizId);
  }

  static updateQuestion(id: ID, updates: Partial<Question>) {
    return quizStore.updateQuestion(id, updates);
  }

  static deleteQuestion(id: ID) {
    return quizStore.deleteQuestion(id);
  }

  // Utility methods
  static getQuizSummary(id: ID) {
    return quizStore.getQuizSummary(id);
  }

  static getAllQuizSummaries() {
    return quizStore.getAllQuizSummaries();
  }
}
