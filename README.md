# Online Quiz Application API

A RESTful backend API for creating and taking quizzes with automatic scoring. Built with Node.js, TypeScript, and Express.js.

## 🚀 Features

### Core Features
- **Quiz Management**: Create quizzes with titles and add questions
- **Question Types**: Support for single choice, multiple choice, and text-based questions
- **Quiz Taking**: Fetch questions (without answers) and submit answers for scoring
- **Automatic Scoring**: Intelligent scoring system based on question types
- **Validation**: Comprehensive input validation and error handling

### Bonus Features
- **Quiz Listing**: Get all available quizzes with summaries
- **Enhanced Validation**: Question type-specific validation rules
- **Comprehensive Testing**: Unit tests and integration tests
- **Error Handling**: Detailed error responses with proper HTTP status codes
- **Security**: Input sanitization and CORS protection

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- TypeScript knowledge (optional but recommended)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd online-quiz-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with hot reload on `http://localhost:3000`

### Production Mode
```bash
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Endpoints

#### 1. Create Quiz
**POST** `/quizzes`

Creates a new quiz with a title.

**Request Body:**
```json
{
  "title": "Math Quiz"
}
```

**Response (201):**
```json
{
  "id": "quiz-uuid",
  "title": "Math Quiz"
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{"title": "Math Quiz"}'
```

#### 2. Get All Quizzes
**GET** `/quizzes`

Returns a list of all available quizzes.

**Response (200):**
```json
[
  {
    "id": "quiz-uuid",
    "title": "Math Quiz",
    "questionCount": 3,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### 3. Get Quiz Details
**GET** `/quizzes/:quizId`

Returns detailed information about a specific quiz.

**Response (200):**
```json
{
  "id": "quiz-uuid",
  "title": "Math Quiz",
  "questionCount": 3,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 4. Add Question to Quiz
**POST** `/quizzes/:quizId/questions`

Adds a question to an existing quiz.

**Request Body (Single Choice):**
```json
{
  "text": "What is 2+2?",
  "type": "single",
  "options": [
    { "text": "3", "isCorrect": false },
    { "text": "4", "isCorrect": true },
    { "text": "5", "isCorrect": false }
  ]
}
```

**Request Body (Multiple Choice):**
```json
{
  "text": "Which are prime numbers?",
  "type": "multiple",
  "options": [
    { "text": "2", "isCorrect": true },
    { "text": "3", "isCorrect": true },
    { "text": "4", "isCorrect": false },
    { "text": "5", "isCorrect": true }
  ]
}
```

**Request Body (Text Question):**
```json
{
  "text": "What is the capital of France?",
  "type": "text",
  "maxWords": 10
}
```

**Response (201):**
```json
{
  "id": "question-uuid",
  "text": "What is 2+2?",
  "type": "single",
  "options": [
    { "id": "option-uuid", "text": "3", "isCorrect": false },
    { "id": "option-uuid", "text": "4", "isCorrect": true },
    { "id": "option-uuid", "text": "5", "isCorrect": false }
  ]
}
```

#### 5. Get Quiz Questions
**GET** `/quizzes/:quizId/questions`

Returns all questions for a quiz without correct answers (for security).

**Response (200):**
```json
[
  {
    "id": "question-uuid",
    "text": "What is 2+2?",
    "type": "single",
    "options": [
      { "id": "option-uuid", "text": "3" },
      { "id": "option-uuid", "text": "4" },
      { "id": "option-uuid", "text": "5" }
    ]
  }
]
```

#### 6. Submit Quiz Answers
**POST** `/quizzes/:quizId/submit`

Submits answers for a quiz and returns the score.

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "question-uuid",
      "selectedOptionIds": ["option-uuid"]
    },
    {
      "questionId": "question-uuid",
      "selectedOptionIds": ["option-uuid", "option-uuid"]
    },
    {
      "questionId": "question-uuid",
      "textAnswer": "Paris"
    }
  ]
}
```

**Response (200):**
```json
{
  "score": 2,
  "total": 3
}
```

#### 7. Delete Quiz
**DELETE** `/quizzes/:quizId`

Deletes a quiz and all its questions.

**Response (204):** No content

### Health Check
**GET** `/health`

Returns the health status of the API.

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

## 🎯 Scoring System

### Single Choice Questions
- **1 point** if exactly the correct option is selected
- **0 points** for incorrect answers or multiple selections

### Multiple Choice Questions
- **1 point** if the exact set of correct options is selected
- **0 points** for partial matches or extra selections (no partial credit)

### Text Questions
- **1 point** for exact match (case-insensitive, whitespace-normalized)
- **0 points** for incorrect answers or answers exceeding word limit

## ✅ Validation Rules

### Quiz Creation
- Title must be non-empty and ≤ 100 characters

### Question Creation
- **Single Choice**: Exactly one option must be marked as correct
- **Multiple Choice**: At least one option must be marked as correct
- **Text Questions**: Must specify `maxWords` (1-1000 words)
- Question text must be ≤ 500 characters
- Option text must be ≤ 200 characters

### Answer Submission
- Selected option IDs must exist in the question
- Text answers must not exceed the word limit
- Either `selectedOptionIds` or `textAnswer` must be provided (not both)

## 🧪 Testing

The project includes comprehensive test coverage:

### Unit Tests
- Scoring logic for all question types
- Edge cases and error conditions
- Validation functions

### Integration Tests
- Complete API workflow testing
- Error handling scenarios
- End-to-end quiz creation and submission

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## 🏗️ Project Structure

```
quiz-api/
├── src/
│   ├── app.ts                 # Express app configuration
│   ├── server.ts              # Server entry point
│   ├── routes/
│   │   └── quizzes.ts          # Quiz routes
│   ├── controllers/
│   │   └── quizController.ts  # Request handlers
│   ├── services/
│   │   └── quizService.ts     # Business logic
│   ├── models/
│   │   ├── types.ts           # TypeScript interfaces
│   │   └── validation.ts      # Zod schemas
│   ├── utils/
│   │   └── scoring.ts         # Scoring algorithms
│   └── middleware/
│       ├── validation.ts      # Request validation
│       └── errorHandler.ts    # Error handling
├── tests/
│   ├── scoring.test.ts        # Unit tests for scoring
│   └── api.test.ts            # Integration tests
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `HOST`: Server host (default: 0.0.0.0)
- `NODE_ENV`: Environment (development/production)

### TypeScript Configuration
- Strict mode enabled
- ES2020 target
- CommonJS modules
- Source maps for debugging

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

This project is licensed under the ISC License.

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Change port in .env file
   PORT=3001 npm run dev
   ```

2. **TypeScript compilation errors**
   ```bash
   # Clean and rebuild
   rm -rf dist
   npm run build
   ```

3. **Test failures**
   ```bash
   # Run tests with verbose output
   npm test -- --verbose
   ```

## 📞 Support

For questions or issues, please create an issue in the repository or contact the development team.

---

**Built with ❤️ using Node.js, TypeScript, and Express.js**
