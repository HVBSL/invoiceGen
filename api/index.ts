import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import serverless from 'serverless-http';
import { registerRoutes } from '../server/routes';
import { createServer } from 'http';
import fs from 'fs';
import path from 'path';

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

// Get the path to static files in Vercel
const getStaticPath = () => {
  // In Vercel, files are in the same directory structure
  // The API function is at /api/index.ts, static files should be at /dist/public
  // Try multiple possible locations
  const possiblePaths = [
    path.join(process.cwd(), 'dist', 'public'), // Standard location
    path.join(process.cwd(), '..', 'dist', 'public'), // If cwd is in api/
    path.join(__dirname, '..', 'dist', 'public'), // Relative to bundled file
    path.join(__dirname, '..', '..', 'dist', 'public'), // If __dirname is in api/
    path.resolve('/', 'var', 'task', 'dist', 'public'), // Vercel's task directory
    path.resolve('/', 'tmp', 'dist', 'public'), // Alternative Vercel location
  ];
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      console.log(`[Vercel] Found static files at: ${testPath}`);
      return testPath;
    }
  }
  
  // Fallback
  const fallbackPath = path.join(process.cwd(), 'dist', 'public');
  console.warn(`[Vercel] Static files not found, using fallback: ${fallbackPath}`);
  console.log(`[Vercel] Current working directory: ${process.cwd()}`);
  console.log(`[Vercel] __dirname: ${typeof __dirname !== 'undefined' ? __dirname : 'undefined'}`);
  return fallbackPath;
};

// Initialize app (only once, not per request)
let appInitialized = false;
let serverlessHandler: ReturnType<typeof serverless> | null = null;
let staticPath: string | null = null;

async function initializeApp() {
  if (appInitialized) return;
  
  // Find static files path
  staticPath = getStaticPath();
  
  // Create a dummy HTTP server for registerRoutes (it doesn't actually use it)
  const httpServer = createServer(app);
  
  // Register routes
  await registerRoutes(httpServer, app);

  // Serve static files
  if (fs.existsSync(staticPath)) {
    app.use(express.static(staticPath, {
      setHeaders: (res, filePath) => {
        // Ensure HTML files have correct Content-Type
        if (filePath.endsWith('.html')) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
      }
    }));
  }

  // SPA fallback - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api')) {
      return next();
    }
    
    // Skip static asset requests (should be handled by Vercel)
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|map)$/)) {
      return next();
    }
    
    // Serve index.html for SPA routing
    const indexPath = path.join(staticPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      // Explicitly set Content-Type header to prevent download
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Read file and send with explicit Content-Type
      // This is more reliable in serverless environments
      try {
        const htmlContent = fs.readFileSync(indexPath, 'utf-8');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Length', Buffer.byteLength(htmlContent, 'utf-8').toString());
        res.end(htmlContent, 'utf-8');
      } catch (err) {
        console.error(`[Vercel] Error reading index.html:`, err);
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      // If index.html doesn't exist, return 404
      console.error(`[Vercel] index.html not found at: ${indexPath}`);
      console.error(`[Vercel] Static path: ${staticPath}`);
      res.status(404).json({ 
        error: 'Not found',
        path: indexPath,
        staticPath: staticPath,
        cwd: process.cwd()
      });
    }
  });

  // Error handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
  });
  
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

