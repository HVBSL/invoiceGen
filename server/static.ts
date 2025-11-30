import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the correct directory path for both CommonJS and ESM
const getDirname = () => {
  if (typeof __dirname !== "undefined") {
    return __dirname;
  }
  const __filename = fileURLToPath(import.meta.url);
  return path.dirname(__filename);
};

export function serveStatic(app: Express) {
  // In Vercel, the dist/public folder is relative to the project root
  // In local builds, it's relative to the server directory
  // Try multiple possible locations
  const possibleRoots = [
    process.cwd(), // Vercel serverless function root
    path.resolve(getDirname(), ".."), // Local build (from server directory)
    path.resolve(process.cwd(), ".."), // Alternative Vercel location
  ];
  
  let distPath: string | null = null;
  for (const root of possibleRoots) {
    const testPath = path.resolve(root, "dist", "public");
    if (fs.existsSync(testPath)) {
      distPath = testPath;
      break;
    }
  }
  
  if (!distPath) {
    // Fallback: use process.cwd() and hope for the best
    distPath = path.resolve(process.cwd(), "dist", "public");
  }
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
