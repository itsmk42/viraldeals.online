import serverless from 'serverless-http';
import { app, connectDB } from './server.js';

// Initialize database connection outside the handler
let dbConnection = null;

// Lambda handler
export const handler = async (event, context) => {
  // Make sure to reuse the database connection
  if (!dbConnection) {
    console.log('Creating new database connection');
    dbConnection = await connectDB();
  } else {
    console.log('Reusing existing database connection');
  }

  // Turn off MongoDB connection waiting when the Lambda execution context is being shut down
  context.callbackWaitsForEmptyEventLoop = false;

  // Create handler
  const handler = serverless(app);
  
  // Handle the request
  return handler(event, context);
}; 