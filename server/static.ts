import express, { type Express } from "express";
import fs from "fs";
import path from "path";

// Get the correct directory path for both CommonJS and ESM
// In CJS builds (production), __dirname is available
// In ESM (development), we'll use process.cwd() as fallback
const getProjectRoot = () => {
  // In CommonJS builds, __dirname will be available
  if (typeof __dirname !== "undefined") {
    // When bundled, __dirname points to the bundled file location
    // We need to go up to find the project root
    // The bundled file is at dist/index.cjs, so we go up to dist, then up to project root
    return path.resolve(__dirname, "..");
  }
  // In ESM/development, use process.cwd()
  return process.cwd();
};

export function serveStatic(app: Express) {
  // In Vercel, the dist/public folder is relative to the project root
  // In local builds, it's relative to the server directory
  // Try multiple possible locations
  const projectRoot = getProjectRoot();
  const possibleRoots = [
    process.cwd(), // Vercel serverless function root
    projectRoot, // Project root (from server directory or bundled location)
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
