// Vercel serverless function entry point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { handler } from '../backend/lambda.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app for local development
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint for local development
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Vercel serverless function handler
export default async function (req, res) {
  // If running locally, use Express directly
  if (process.env.NODE_ENV !== 'production') {
    return app(req, res);
  }

  // In production, use the Lambda handler which includes all routes from server.js
  try {
    // Create a mock event object that Vercel can understand
    const event = {
      body: req.body,
      headers: req.headers,
      httpMethod: req.method,
      path: req.url,
      queryStringParameters: req.query,
      // Add raw body for webhooks that need it
      rawBody: req.rawBody
    };

    // Create a mock context object
    const context = {
      callbackWaitsForEmptyEventLoop: true
    };

    // Call our Lambda handler (this will use all routes defined in server.js)
    const response = await handler(event, context);
    
    // Set the status code
    res.status(response.statusCode);

    // Set the headers
    if (response.headers) {
      Object.keys(response.headers).forEach(header => {
        res.setHeader(header, response.headers[header]);
      });
    }

    // Send the response
    if (response.body) {
      // Check if the body is already stringified
      if (typeof response.body === 'string') {
        try {
          // Try to parse it to see if it's JSON
          JSON.parse(response.body);
          res.setHeader('Content-Type', 'application/json');
        } catch (e) {
          // If it's not JSON, send as plain text
          res.setHeader('Content-Type', 'text/plain');
        }
        res.send(response.body);
      } else {
        // If it's not a string, send as JSON
        res.json(response.body);
      }
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Lambda handler error:', error);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message
    });
  }
}
