import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/static';
import { createServer } from 'http';

// Create Express app instance
const app = express();

// Middleware
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

// Initialize app (only once, not per request)
let appInitialized = false;
let serverlessHandler: ReturnType<typeof serverless> | null = null;

async function initializeApp() {
  if (appInitialized) return;
  
  // Create a dummy HTTP server for registerRoutes (it doesn't actually use it)
  const httpServer = createServer(app);
  
  // Register routes
  await registerRoutes(httpServer, app);

  // Error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
  });

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    serveStatic(app);
  }
  
  // Wrap Express app with serverless-http
  serverlessHandler = serverless(app);
  appInitialized = true;
}

// Vercel serverless function handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize app on first request
  await initializeApp();
  
  // Use serverless-http to handle the request
  if (!serverlessHandler) {
    throw new Error('App not initialized');
  }
  
  return serverlessHandler(req, res);
}

