// tests/scoring.test.ts

import { scoreQuiz, validateSelectedOptions, validateTextAnswerLength } from '../src/utils/scoring';
import { Question, Answer } from '../src/models/types';

describe('Scoring Logic', () => {
  describe('scoreQuiz', () => {
    it('should return correct score for single choice questions', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          text: 'What is 2+2?',
          type: 'single',
          options: [
            { id: 'o1', text: '3', isCorrect: false },
            { id: 'o2', text: '4', isCorrect: true },
            { id: 'o3', text: '5', isCorrect: false }
          ]
        }
      ];

      const answers: Answer[] = [
        { questionId: 'q1', selectedOptionIds: ['o2'] }
      ];

      const result = scoreQuiz(questions, answers);
      expect(result.score).toBe(1);
      expect(result.total).toBe(1);
    });

    it('should return 0 for incorrect single choice answers', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          text: 'What is 2+2?',
          type: 'single',
          options: [
            { id: 'o1', text: '3', isCorrect: false },
            { id: 'o2', text: '4', isCorrect: true },
            { id: 'o3', text: '5', isCorrect: false }
          ]
        }
      ];

      const answers: Answer[] = [
        { questionId: 'q1', selectedOptionIds: ['o1'] }
      ];

      const result = scoreQuiz(questions, answers);
      expect(result.score).toBe(0);
      expect(result.total).toBe(1);
    });

    it('should return 0 for multiple selections in single choice', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          text: 'What is 2+2?',
          type: 'single',
          options: [
            { id: 'o1', text: '3', isCorrect: false },
            { id: 'o2', text: '4', isCorrect: true },
            { id: 'o3', text: '5', isCorrect: false }
          ]
        }
      ];

      const answers: Answer[] = [
        { questionId: 'q1', selectedOptionIds: ['o1', 'o2'] }
      ];

      const result = scoreQuiz(questions, answers);
      expect(result.score).toBe(0);
      expect(result.total).toBe(1);
    });

    it('should return correct score for multiple choice questions', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          text: 'Which are prime numbers?',
          type: 'multiple',
          options: [
            { id: 'o1', text: '2', isCorrect: true },
            { id: 'o2', text: '3', isCorrect: true },
            { id: 'o3', text: '4', isCorrect: false },
            { id: 'o4', text: '5', isCorrect: true }
          ]
        }
      ];

      const answers: Answer[] = [
        { questionId: 'q1', selectedOptionIds: ['o1', 'o2', 'o4'] }
      ];

      const result = scoreQuiz(questions, answers);
      expect(result.score).toBe(1);
      expect(result.total).toBe(1);
    });

    it('should return 0 for partial multiple choice answers', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          text: 'Which are prime numbers?',
          type: 'multiple',
          options: [
            { id: 'o1', text: '2', isCorrect: true },
            { id: 'o2', text: '3', isCorrect: true },
            { id: 'o3', text: '4', isCorrect: false },
            { id: 'o4', text: '5', isCorrect: true }
          ]
        }
      ];

      const answers: Answer[] = [
        { questionId: 'q1', selectedOptionIds: ['o1', 'o2'] } // Missing o4
      ];

      const result = scoreQuiz(questions, answers);
      expect(result.score).toBe(0);
      expect(result.total).toBe(1);
    });

    it('should return 0 for extra selections in multiple choice', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          text: 'Which are prime numbers?',
          type: 'multiple',
          options: [
            { id: 'o1', text: '2', isCorrect: true },
            { id: 'o2', text: '3', isCorrect: true },
            { id: 'o3', text: '4', isCorrect: false },
            { id: 'o4', text: '5', isCorrect: true }
          ]
        }
      ];

      const answers: Answer[] = [
        { questionId: 'q1', selectedOptionIds: ['o1', 'o2', 'o3', 'o4'] } // Includes incorrect o3
      ];

      const result = scoreQuiz(questions, answers);
      expect(result.score).toBe(0);
      expect(result.total).toBe(1);
    });

    it('should return correct score for text questions', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          text: 'What is the capital of France?',
          type: 'text',
          options: [
            { id: 'o1', text: 'Paris', isCorrect: true }
          ],
          maxWords: 10
        }
      ];

      const answers: Answer[] = [
        { questionId: 'q1', textAnswer: 'Paris' }
      ];

      const result = scoreQuiz(questions, answers);
      expect(result.score).toBe(1);
      expect(result.total).toBe(1);
    });

    it('should handle case-insensitive text answers', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          text: 'What is the capital of France?',
          type: 'text',
          options: [
            { id: 'o1', text: 'Paris', isCorrect: true }
          ],
          maxWords: 10
        }
      ];

      const answers: Answer[] = [
        { questionId: 'q1', textAnswer: 'paris' }
      ];

      const result = scoreQuiz(questions, answers);
      expect(result.score).toBe(1);
      expect(result.total).toBe(1);
    });

    it('should handle whitespace in text answers', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          text: 'What is the capital of France?',
          type: 'text',
          options: [
            { id: 'o1', text: 'Paris', isCorrect: true }
          ],
          maxWords: 10
        }
      ];

      const answers: Answer[] = [
        { questionId: 'q1', textAnswer: '  Paris  ' }
      ];

      const result = scoreQuiz(questions, answers);
      expect(result.score).toBe(1);
      expect(result.total).toBe(1);
    });

    it('should return 0 for incorrect text answers', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          text: 'What is the capital of France?',
          type: 'text',
          options: [
            { id: 'o1', text: 'Paris', isCorrect: true }
          ],
          maxWords: 10
        }
      ];

      const answers: Answer[] = [
        { questionId: 'q1', textAnswer: 'London' }
      ];

      const result = scoreQuiz(questions, answers);
      expect(result.score).toBe(0);
      expect(result.total).toBe(1);
    });

    it('should handle unanswered questions', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          text: 'What is 2+2?',
          type: 'single',
          options: [
            { id: 'o1', text: '3', isCorrect: false },
            { id: 'o2', text: '4', isCorrect: true }
          ]
        },
        {
          id: 'q2',
          text: 'What is 3+3?',
          type: 'single',
          options: [
            { id: 'o3', text: '5', isCorrect: false },
            { id: 'o4', text: '6', isCorrect: true }
          ]
        }
      ];

      const answers: Answer[] = [
        { questionId: 'q1', selectedOptionIds: ['o2'] }
        // q2 is unanswered
      ];

      const result = scoreQuiz(questions, answers);
      expect(result.score).toBe(1);
      expect(result.total).toBe(2);
    });

    it('should handle mixed question types', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          text: 'What is 2+2?',
          type: 'single',
          options: [
            { id: 'o1', text: '3', isCorrect: false },
            { id: 'o2', text: '4', isCorrect: true }
          ]
        },
        {
          id: 'q2',
          text: 'Which are prime?',
          type: 'multiple',
          options: [
            { id: 'o3', text: '2', isCorrect: true },
            { id: 'o4', text: '3', isCorrect: true },
            { id: 'o5', text: '4', isCorrect: false }
          ]
        },
        {
          id: 'q3',
          text: 'Capital of France?',
          type: 'text',
          options: [
            { id: 'o6', text: 'Paris', isCorrect: true }
          ],
          maxWords: 10
        }
      ];

      const answers: Answer[] = [
        { questionId: 'q1', selectedOptionIds: ['o2'] },
        { questionId: 'q2', selectedOptionIds: ['o3', 'o4'] },
        { questionId: 'q3', textAnswer: 'Paris' }
      ];

      const result = scoreQuiz(questions, answers);
      expect(result.score).toBe(3);
      expect(result.total).toBe(3);
    });

    it('should handle empty answers array', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          text: 'What is 2+2?',
          type: 'single',
          options: [
            { id: 'o1', text: '3', isCorrect: false },
            { id: 'o2', text: '4', isCorrect: true }
          ]
        }
      ];

      const answers: Answer[] = [];

      const result = scoreQuiz(questions, answers);
      expect(result.score).toBe(0);
      expect(result.total).toBe(1);
    });

    it('should handle answers for non-existent questions', () => {
      const questions: Question[] = [
        {
          id: 'q1',
          text: 'What is 2+2?',
          type: 'single',
          options: [
            { id: 'o1', text: '3', isCorrect: false },
            { id: 'o2', text: '4', isCorrect: true }
          ]
        }
      ];

      const answers: Answer[] = [
        { questionId: 'q1', selectedOptionIds: ['o2'] },
        { questionId: 'q999', selectedOptionIds: ['o1'] } // Non-existent question
      ];

      const result = scoreQuiz(questions, answers);
      expect(result.score).toBe(1);
      expect(result.total).toBe(1);
    });
  });

  describe('validateSelectedOptions', () => {
    it('should return true for valid option IDs', () => {
      const question: Question = {
        id: 'q1',
        text: 'Test question',
        type: 'single',
        options: [
          { id: 'o1', text: 'Option 1' },
          { id: 'o2', text: 'Option 2' }
        ]
      };

      expect(validateSelectedOptions(question, ['o1'])).toBe(true);
      expect(validateSelectedOptions(question, ['o1', 'o2'])).toBe(true);
    });

    it('should return false for invalid option IDs', () => {
      const question: Question = {
        id: 'q1',
        text: 'Test question',
        type: 'single',
        options: [
          { id: 'o1', text: 'Option 1' },
          { id: 'o2', text: 'Option 2' }
        ]
      };

      expect(validateSelectedOptions(question, ['o3'])).toBe(false);
      expect(validateSelectedOptions(question, ['o1', 'o3'])).toBe(false);
    });

    it('should return false for questions without options', () => {
      const question: Question = {
        id: 'q1',
        text: 'Test question',
        type: 'text'
      };

      expect(validateSelectedOptions(question, ['o1'])).toBe(false);
    });
  });

  describe('validateTextAnswerLength', () => {
    it('should return true for answers within word limit', () => {
      expect(validateTextAnswerLength('This is a short answer', 10)).toBe(true);
      expect(validateTextAnswerLength('Short', 5)).toBe(true);
      expect(validateTextAnswerLength('', 5)).toBe(true);
    });

    it('should return false for answers exceeding word limit', () => {
      expect(validateTextAnswerLength('This is a very long answer that exceeds the word limit', 5)).toBe(false);
      expect(validateTextAnswerLength('One two three four five six', 5)).toBe(false);
    });

    it('should handle whitespace correctly', () => {
      expect(validateTextAnswerLength('  Short answer  ', 2)).toBe(true);
      expect(validateTextAnswerLength('   Multiple   spaces   between   words   ', 4)).toBe(true);
    });
  });
});
