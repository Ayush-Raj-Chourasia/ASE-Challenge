// tests/api.test.ts

import request from 'supertest';
import app from '../src/app';

describe('Quiz API Integration Tests', () => {
  let quizId: string;

  describe('POST /api/quizzes', () => {
    it('should create a new quiz', async () => {
      const response = await request(app)
        .post('/api/quizzes')
        .send({ title: 'Math Quiz' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('title', 'Math Quiz');
      quizId = response.body.id;
    });

    it('should return 400 for invalid quiz data', async () => {
      const response = await request(app)
        .post('/api/quizzes')
        .send({ title: '' })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/quizzes')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/quizzes', () => {
    it('should return list of quizzes', async () => {
      const response = await request(app)
        .get('/api/quizzes')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('questionCount');
    });
  });

  describe('GET /api/quizzes/:quizId', () => {
    it('should return quiz details', async () => {
      const response = await request(app)
        .get(`/api/quizzes/${quizId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', quizId);
      expect(response.body).toHaveProperty('title', 'Math Quiz');
      expect(response.body).toHaveProperty('questionCount');
    });

    it('should return 404 for non-existent quiz', async () => {
      const response = await request(app)
        .get('/api/quizzes/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/quizzes/:quizId/questions', () => {
    it('should add a single choice question', async () => {
      const response = await request(app)
        .post(`/api/quizzes/${quizId}/questions`)
        .send({
          text: 'What is 2+2?',
          type: 'single',
          options: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: false }
          ]
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('text', 'What is 2+2?');
      expect(response.body).toHaveProperty('type', 'single');
      expect(response.body).toHaveProperty('options');
      expect(response.body.options).toHaveLength(3);
    });

    it('should add a multiple choice question', async () => {
      const response = await request(app)
        .post(`/api/quizzes/${quizId}/questions`)
        .send({
          text: 'Which are prime numbers?',
          type: 'multiple',
          options: [
            { text: '2', isCorrect: true },
            { text: '3', isCorrect: true },
            { text: '4', isCorrect: false },
            { text: '5', isCorrect: true }
          ]
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('text', 'Which are prime numbers?');
      expect(response.body).toHaveProperty('type', 'multiple');
      expect(response.body).toHaveProperty('options');
      expect(response.body.options).toHaveLength(4);
    });

    it('should add a text question', async () => {
      const response = await request(app)
        .post(`/api/quizzes/${quizId}/questions`)
        .send({
          text: 'What is the capital of France?',
          type: 'text',
          maxWords: 10
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('text', 'What is the capital of France?');
      expect(response.body).toHaveProperty('type', 'text');
      expect(response.body).toHaveProperty('maxWords', 10);
    });

    it('should return 400 for invalid single choice question', async () => {
      const response = await request(app)
        .post(`/api/quizzes/${quizId}/questions`)
        .send({
          text: 'What is 2+2?',
          type: 'single',
          options: [
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: true },
            { text: '5', isCorrect: true } // Multiple correct answers for single choice
          ]
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for multiple choice with no correct answers', async () => {
      const response = await request(app)
        .post(`/api/quizzes/${quizId}/questions`)
        .send({
          text: 'Which are prime numbers?',
          type: 'multiple',
          options: [
            { text: '2', isCorrect: false },
            { text: '3', isCorrect: false },
            { text: '4', isCorrect: false }
          ]
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for text question without maxWords', async () => {
      const response = await request(app)
        .post(`/api/quizzes/${quizId}/questions`)
        .send({
          text: 'What is the capital of France?',
          type: 'text'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/quizzes/:quizId/questions', () => {
    it('should return questions without correct answers', async () => {
      const response = await request(app)
        .get(`/api/quizzes/${quizId}/questions`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      // Check that isCorrect flags are not present
      response.body.forEach((question: any) => {
        if (question.options) {
          question.options.forEach((option: any) => {
            expect(option).not.toHaveProperty('isCorrect');
          });
        }
      });
    });

    it('should return 404 for non-existent quiz', async () => {
      const response = await request(app)
        .get('/api/quizzes/non-existent-id/questions')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/quizzes/:quizId/submit', () => {
    it('should submit answers and return score', async () => {
      // First, get the questions to get the correct option IDs
      const questionsResponse = await request(app)
        .get(`/api/quizzes/${quizId}/questions`)
        .expect(200);

      const questions = questionsResponse.body;
      const answers = questions.map((question: any) => {
        if (question.type === 'single') {
          // For single choice, select the first option
          return {
            questionId: question.id,
            selectedOptionIds: [question.options[0].id]
          };
        } else if (question.type === 'multiple') {
          // For multiple choice, select all options
          return {
            questionId: question.id,
            selectedOptionIds: question.options.map((opt: any) => opt.id)
          };
        } else if (question.type === 'text') {
          // For text, provide a simple answer
          return {
            questionId: question.id,
            textAnswer: 'Paris'
          };
        }
        return null;
      }).filter(Boolean);

      const response = await request(app)
        .post(`/api/quizzes/${quizId}/submit`)
        .send({ answers })
        .expect(200);

      expect(response.body).toHaveProperty('score');
      expect(response.body).toHaveProperty('total');
      expect(typeof response.body.score).toBe('number');
      expect(typeof response.body.total).toBe('number');
      expect(response.body.total).toBeGreaterThan(0);
    });

    it('should return 400 for invalid answer format', async () => {
      const response = await request(app)
        .post(`/api/quizzes/${quizId}/submit`)
        .send({
          answers: [
            {
              questionId: 'non-existent',
              selectedOptionIds: ['option1']
            }
          ]
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for empty answers', async () => {
      const response = await request(app)
        .post(`/api/quizzes/${quizId}/submit`)
        .send({ answers: [] })
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 404 for non-existent quiz', async () => {
      const response = await request(app)
        .post('/api/quizzes/non-existent-id/submit')
        .send({ answers: [] })
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('DELETE /api/quizzes/:quizId', () => {
    it('should delete a quiz', async () => {
      await request(app)
        .delete(`/api/quizzes/${quizId}`)
        .expect(204);
    });

    it('should return 404 for non-existent quiz', async () => {
      const response = await request(app)
        .delete('/api/quizzes/non-existent-id')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  describe('Root Endpoint', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Online Quiz API');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for undefined routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error');
    });
  });
});
