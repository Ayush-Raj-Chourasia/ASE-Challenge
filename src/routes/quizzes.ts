// src/routes/quizzes.ts

import { Router } from 'express';
import { QuizController } from '../controllers/quizController';
import { 
  validateCreateQuiz, 
  validateAddQuestion, 
  validateSubmitQuiz,
  validateQuizIdParam 
} from '../middleware/validation';

const router = Router();

// Quiz management routes
router.post('/', validateCreateQuiz, QuizController.createQuiz);
router.get('/', QuizController.getAllQuizzes);
router.get('/:quizId', validateQuizIdParam, QuizController.getQuiz);
router.delete('/:quizId', validateQuizIdParam, QuizController.deleteQuiz);

// Question management routes
router.post('/:quizId/questions', validateQuizIdParam, validateAddQuestion, QuizController.addQuestion);
router.get('/:quizId/questions', validateQuizIdParam, QuizController.getQuestions);

// Quiz taking routes
router.post('/:quizId/submit', validateQuizIdParam, validateSubmitQuiz, QuizController.submitQuiz);

export default router;
