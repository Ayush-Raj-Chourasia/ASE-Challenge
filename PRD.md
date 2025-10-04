# Online Quiz Application API - Product Requirements Document

## 1. Project Overview

### 1.1 Project Name
Online Quiz Application API

### 1.2 Project Description
A RESTful backend API for a simple quiz application that allows users to create quizzes, add questions, and take quizzes with automatic scoring.

### 1.3 Project Goals
- Build a clean, scalable backend API following RESTful principles
- Implement core quiz functionality with proper validation
- Demonstrate separation of concerns and clean code architecture
- Provide comprehensive testing coverage
- Showcase modern Node.js/TypeScript development practices

## 2. Core Features

### 2.1 Quiz Management
- **Create Quiz**: Endpoint to create a new quiz with a title
- **Add Questions**: Endpoint to add questions to existing quizzes
- **Question Types**: Support for single choice, multiple choice, and text-based questions
- **Validation**: Ensure questions have proper structure and correct answers

### 2.2 Quiz Taking
- **Fetch Questions**: Retrieve all questions for a specific quiz (without correct answers)
- **Submit Answers**: Submit answers and receive automatic scoring
- **Scoring System**: Calculate scores based on question types and selected answers

### 2.3 Data Models
- **Quiz**: Contains ID, title, and collection of questions
- **Question**: Contains ID, text, type, options (for choice questions), and word limits (for text questions)
- **Option**: Contains ID, text, and correctness flag
- **Answer**: Contains question ID and selected option IDs or text answer

## 3. Technical Requirements

### 3.1 Technology Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Testing**: Jest + Supertest
- **Validation**: Zod or express-validator
- **Data Storage**: In-memory (JSON) for MVP, SQLite for persistence

### 3.2 API Design Principles
- RESTful endpoints with proper HTTP methods
- Consistent response formats
- Proper error handling with meaningful status codes
- Input validation and sanitization
- Clear separation of concerns (routes, controllers, services, utilities)

### 3.3 Project Structure
```
quiz-api/
├── package.json
├── tsconfig.json
├── .gitignore
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── routes/
│   │   └── quizzes.ts
│   ├── controllers/
│   │   └── quizController.ts
│   ├── services/
│   │   └── quizService.ts
│   ├── models/
│   │   └── types.ts
│   ├── utils/
│   │   └── scoring.ts
│   └── middleware/
│       └── validation.ts
├── tests/
│   ├── scoring.test.ts
│   ├── api.test.ts
│   └── integration.test.ts
└── README.md
```

## 4. API Endpoints Specification

### 4.1 Core Endpoints

#### POST /quizzes
- **Purpose**: Create a new quiz
- **Request Body**: `{ "title": "Quiz Title" }`
- **Response**: `201 { "id": "quiz_1", "title": "Quiz Title" }`
- **Validation**: Title is required and non-empty

#### POST /quizzes/:quizId/questions
- **Purpose**: Add a question to a quiz
- **Request Body**:
  ```json
  {
    "text": "Question text",
    "type": "single|multiple|text",
    "options": [
      { "text": "Option 1", "isCorrect": true },
      { "text": "Option 2", "isCorrect": false }
    ],
    "maxWords": 300
  }
  ```
- **Response**: `201 { question object }`
- **Validation**: 
  - Single choice: exactly one correct option
  - Multiple choice: at least one correct option
  - Text questions: no options required, maxWords ≤ 300

#### GET /quizzes/:quizId/questions
- **Purpose**: Fetch all questions for a quiz (without correct answers)
- **Response**: Array of questions with options (isCorrect flags removed)
- **Security**: Ensure correct answers are never exposed

#### POST /quizzes/:quizId/submit
- **Purpose**: Submit answers and get score
- **Request Body**:
  ```json
  {
    "answers": [
      { "questionId": "q1", "selectedOptionIds": ["o1"] },
      { "questionId": "q2", "textAnswer": "Answer text" }
    ]
  }
  ```
- **Response**: `{ "score": 3, "total": 5 }`

### 4.2 Bonus Endpoints

#### GET /quizzes
- **Purpose**: List all available quizzes
- **Response**: Array of quiz summaries (id, title)

## 5. Scoring Algorithm

### 5.1 Scoring Rules
- **Single Choice**: 1 point if exactly the correct option is selected
- **Multiple Choice**: 1 point if the exact set of correct options is selected (no partial credit)
- **Text Questions**: 1 point for exact match (normalized: trim + lowercase)

### 5.2 Implementation Requirements
- Deterministic scoring logic
- Handle unanswered questions (0 points)
- Validate selected options exist in question
- Support for text answer validation (word limits)

## 6. Validation Requirements

### 6.1 Question Validation
- Single choice: exactly one option marked as correct
- Multiple choice: at least one correct option
- Text questions: maxWords limit enforcement
- Option text length limits (e.g., 200 characters)

### 6.2 Answer Validation
- Selected option IDs must exist in the question
- Text answers must not exceed word limits
- All required fields must be present

## 7. Testing Requirements

### 7.1 Unit Tests
- Scoring logic for all question types
- Edge cases (unanswered questions, invalid options)
- Validation functions

### 7.2 Integration Tests
- Complete quiz flow (create → add questions → fetch → submit)
- Error handling scenarios
- API endpoint functionality

### 7.3 Test Coverage
- Minimum 80% code coverage
- All critical paths tested
- Edge cases covered

## 8. Error Handling

### 8.1 HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request (validation errors)
- 404: Not Found (quiz/question not found)
- 500: Internal Server Error

### 8.2 Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional error details",
  "code": "ERROR_CODE"
}
```

## 9. Security Considerations

### 9.1 Data Protection
- Never expose correct answers in GET requests
- Validate all input data
- Sanitize text inputs
- Rate limiting on submit endpoints (bonus)

### 9.2 Input Validation
- Request body validation
- Type checking
- Length limits
- SQL injection prevention (if using database)

## 10. Performance Requirements

### 10.1 Response Times
- API endpoints should respond within 200ms for typical operations
- Scoring should be instantaneous
- Support for concurrent requests

### 10.2 Scalability
- In-memory storage for MVP
- Design for easy migration to persistent storage
- Stateless API design

## 11. Documentation Requirements

### 11.1 API Documentation
- Clear endpoint descriptions
- Request/response examples
- Error code documentation
- Setup and installation instructions

### 11.2 Code Documentation
- JSDoc comments for functions
- Clear variable and function names
- README with examples

## 12. Deployment Considerations

### 12.1 Development Environment
- Easy setup with npm install
- Hot reload for development
- Clear development scripts

### 12.2 Production Readiness
- Environment configuration
- Logging
- Error monitoring
- Health check endpoint (bonus)

## 13. Success Criteria

### 13.1 Functional Requirements
- All core endpoints working correctly
- Proper validation and error handling
- Accurate scoring system
- Comprehensive test coverage

### 13.2 Quality Requirements
- Clean, maintainable code
- Proper separation of concerns
- RESTful API design
- Good documentation

## 14. Future Enhancements

### 14.1 Potential Features
- User authentication and authorization
- Quiz analytics and reporting
- Question categories and tags
- Time limits for quizzes
- Question randomization
- Export/import functionality

### 14.2 Technical Improvements
- Database integration (PostgreSQL/MongoDB)
- Caching layer (Redis)
- API versioning
- OpenAPI/Swagger documentation
- Docker containerization
