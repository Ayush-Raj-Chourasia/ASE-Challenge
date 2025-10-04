// src/app.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import quizRoutes from './routes/quizzes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Security middleware
app.use(helmet());

// CORS middleware
app.use(cors({
  origin: process.env['NODE_ENV'] === 'production' 
    ? ['https://yourdomain.com'] // Replace with your frontend domain
    : true, // Allow all origins in development
  credentials: true
}));

// Logging middleware
app.use(morgan(process.env['NODE_ENV'] === 'production' ? 'combined' : 'dev'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env['NODE_ENV'] || 'development'
  });
});

// API routes
app.use('/api/quizzes', quizRoutes);

// Root endpoint
app.get('/', (_req, res) => {
  res.status(200).json({
    message: 'Online Quiz API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      quizzes: '/api/quizzes'
    },
    documentation: 'See README.md for API documentation'
  });
});

// 404 handler for undefined routes
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

export default app;
