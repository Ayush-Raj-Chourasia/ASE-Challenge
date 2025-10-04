// src/utils/scoring.ts

import { Question, Answer, ID } from '../models/types';

/**
 * Scores a quiz based on the provided questions and answers
 * @param questions Array of questions from the quiz
 * @param answers Array of answers submitted by the user
 * @returns Object containing score and total
 */
export function scoreQuiz(questions: Question[], answers: Answer[]): { score: number; total: number } {
  const total = questions.length;
  const answerMap = new Map(answers.map(a => [a.questionId, a]));
  let score = 0;

  for (const question of questions) {
    const answer = answerMap.get(question.id);
    if (!answer) {
      // Unanswered question - 0 points
      continue;
    }

    const questionScore = scoreQuestion(question, answer);
    score += questionScore;
  }

  return { score, total };
}

/**
 * Scores a single question based on its type and the provided answer
 * @param question The question to score
 * @param answer The answer provided by the user
 * @returns 1 if correct, 0 if incorrect or unanswered
 */
function scoreQuestion(question: Question, answer: Answer): number {
  switch (question.type) {
    case 'single':
      return scoreSingleChoiceQuestion(question, answer);
    case 'multiple':
      return scoreMultipleChoiceQuestion(question, answer);
    case 'text':
      return scoreTextQuestion(question, answer);
    default:
      return 0;
  }
}

/**
 * Scores a single choice question
 * @param question The single choice question
 * @param answer The answer provided
 * @returns 1 if exactly the correct option is selected, 0 otherwise
 */
function scoreSingleChoiceQuestion(question: Question, answer: Answer): number {
  if (!answer.selectedOptionIds || answer.selectedOptionIds.length !== 1) {
    return 0;
  }

  const correctOption = question.options?.find(opt => opt.isCorrect);
  if (!correctOption) {
    return 0;
  }

  return answer.selectedOptionIds[0] === correctOption.id ? 1 : 0;
}

/**
 * Scores a multiple choice question
 * @param question The multiple choice question
 * @param answer The answer provided
 * @returns 1 if the exact set of correct options is selected, 0 otherwise
 */
function scoreMultipleChoiceQuestion(question: Question, answer: Answer): number {
  if (!answer.selectedOptionIds || !question.options) {
    return 0;
  }

  const correctOptionIds = new Set(
    question.options
      .filter(opt => opt.isCorrect)
      .map(opt => opt.id)
  );

  const selectedOptionIds = new Set(answer.selectedOptionIds);

  // Check if the sets are exactly equal
  if (correctOptionIds.size !== selectedOptionIds.size) {
    return 0;
  }

  for (const id of correctOptionIds) {
    if (!selectedOptionIds.has(id)) {
      return 0;
    }
  }

  return 1;
}

/**
 * Scores a text question
 * @param question The text question
 * @param answer The answer provided
 * @returns 1 if the text matches exactly (normalized), 0 otherwise
 */
function scoreTextQuestion(question: Question, answer: Answer): number {
  if (!answer.textAnswer || !question.options || question.options.length === 0) {
    return 0;
  }

  // Normalize both the answer and the correct answer
  const normalizedAnswer = answer.textAnswer.trim().toLowerCase();
  const normalizedCorrectAnswer = question.options[0].text.trim().toLowerCase();

  return normalizedAnswer === normalizedCorrectAnswer ? 1 : 0;
}

/**
 * Validates that selected option IDs exist in the question
 * @param question The question to validate against
 * @param selectedOptionIds The option IDs selected by the user
 * @returns true if all selected options exist in the question
 */
export function validateSelectedOptions(question: Question, selectedOptionIds: ID[]): boolean {
  if (!question.options) {
    return false;
  }

  const validOptionIds = new Set(question.options.map(opt => opt.id));
  return selectedOptionIds.every(id => validOptionIds.has(id));
}

/**
 * Validates that a text answer doesn't exceed the word limit
 * @param textAnswer The text answer to validate
 * @param maxWords The maximum number of words allowed
 * @returns true if the answer is within the word limit
 */
export function validateTextAnswerLength(textAnswer: string, maxWords: number): boolean {
  const wordCount = textAnswer.trim().split(/\s+/).filter(word => word.length > 0).length;
  return wordCount <= maxWords;
}
