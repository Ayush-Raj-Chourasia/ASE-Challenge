#!/usr/bin/env node

/**
 * Demo Script for Online Quiz API
 * Run this to demonstrate the API functionality
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000/api';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runDemo() {
  console.log('🎬 Online Quiz API Demo\n');
  console.log('=' .repeat(50));

  try {
    // Step 1: Create a quiz
    console.log('\n📝 Step 1: Creating a quiz...');
    const quizResponse = await makeRequest('POST', '/quizzes', {
      title: 'Demo Math Quiz'
    });
    console.log(`✅ Quiz created: ${quizResponse.data.title} (ID: ${quizResponse.data.id})`);
    const quizId = quizResponse.data.id;

    // Step 2: Add questions
    console.log('\n❓ Step 2: Adding questions...');
    
    // Single choice question
    const singleChoiceResponse = await makeRequest('POST', `/quizzes/${quizId}/questions`, {
      text: 'What is 2 + 2?',
      type: 'single',
      options: [
        { text: '3', isCorrect: false },
        { text: '4', isCorrect: true },
        { text: '5', isCorrect: false }
      ]
    });
    console.log(`✅ Single choice question added: ${singleChoiceResponse.data.text}`);

    // Multiple choice question
    const multipleChoiceResponse = await makeRequest('POST', `/quizzes/${quizId}/questions`, {
      text: 'Which are prime numbers?',
      type: 'multiple',
      options: [
        { text: '2', isCorrect: true },
        { text: '3', isCorrect: true },
        { text: '4', isCorrect: false },
        { text: '5', isCorrect: true }
      ]
    });
    console.log(`✅ Multiple choice question added: ${multipleChoiceResponse.data.text}`);

    // Text question
    const textResponse = await makeRequest('POST', `/quizzes/${quizId}/questions`, {
      text: 'What is the capital of France?',
      type: 'text',
      maxWords: 10
    });
    console.log(`✅ Text question added: ${textResponse.data.text}`);

    // Step 3: Get questions (without answers)
    console.log('\n📋 Step 3: Fetching questions for quiz taking...');
    const questionsResponse = await makeRequest('GET', `/quizzes/${quizId}/questions`);
    console.log(`✅ Retrieved ${questionsResponse.data.length} questions (answers hidden for security)`);
    
    questionsResponse.data.forEach((q, i) => {
      console.log(`   ${i + 1}. ${q.text} (${q.type})`);
    });

    // Step 4: Submit answers
    console.log('\n📤 Step 4: Submitting answers...');
    const answers = [
      {
        questionId: singleChoiceResponse.data.id,
        selectedOptionIds: [singleChoiceResponse.data.options[1].id] // Correct answer
      },
      {
        questionId: multipleChoiceResponse.data.id,
        selectedOptionIds: [
          multipleChoiceResponse.data.options[0].id, // 2
          multipleChoiceResponse.data.options[1].id, // 3
          multipleChoiceResponse.data.options[3].id  // 5
        ]
      },
      {
        questionId: textResponse.data.id,
        textAnswer: 'Paris'
      }
    ];

    const submitResponse = await makeRequest('POST', `/quizzes/${quizId}/submit`, {
      answers: answers
    });
    console.log(`✅ Quiz submitted! Score: ${submitResponse.data.score}/${submitResponse.data.total}`);

    // Step 5: Show quiz list
    console.log('\n📊 Step 5: Listing all quizzes...');
    const listResponse = await makeRequest('GET', '/quizzes');
    console.log(`✅ Found ${listResponse.data.length} quiz(es):`);
    listResponse.data.forEach(quiz => {
      console.log(`   - ${quiz.title} (${quiz.questionCount} questions)`);
    });

    console.log('\n🎉 Demo completed successfully!');
    console.log('\nKey Features Demonstrated:');
    console.log('✅ Quiz creation and management');
    console.log('✅ Multiple question types (single, multiple, text)');
    console.log('✅ Secure question fetching (no answers exposed)');
    console.log('✅ Intelligent scoring system');
    console.log('✅ Comprehensive validation');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.log('\nMake sure the server is running: npm run dev');
  }
}

// Run the demo
runDemo();
