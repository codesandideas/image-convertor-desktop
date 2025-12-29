import { existsSync, statSync } from 'fs';
import { extname, normalize } from 'path';

const SUPPORTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.tiff', '.tif'];

/**
 * Parses command-line arguments to extract valid image file paths
 * @returns {string[]} Array of validated absolute file paths
 */
export function parseCommandLineArgs() {
  // Skip first 2 args (electron executable and app path)
  // In production: ['electron.exe', 'app.asar', 'file.jpg']
  // In development: ['electron.exe', '.', 'file.jpg', '--remote-debugging-port=...']
  const args = process.argv.slice(2);

  console.log('Raw command line args:', args);

  // Filter out Electron/Chromium flags
  const filePaths = args.filter(arg => {
    // Skip flags
    if (arg.startsWith('--') || arg.startsWith('-')) {
      console.log('Skipping flag:', arg);
      return false;
    }
    // Skip current directory marker
    if (arg === '.') {
      console.log('Skipping current directory marker');
      return false;
    }
    return true;
  });

  console.log('Filtered file paths:', filePaths);

  // Validate and normalize file paths
  const validPaths = filePaths
    .map(path => {
      try {
        // Normalize path (handles \ and / differences)
        return normalize(path);
      } catch (error) {
        console.error(`Error normalizing path: ${path}`, error);
        return null;
      }
    })
    .filter(path => path !== null)
    .filter(path => {
      try {
        // Check if file exists
        if (!existsSync(path)) {
          console.warn(`File not found: ${path}`);
          return false;
        }

        // Check if it's a file (not a directory)
        const stats = statSync(path);
        if (!stats.isFile()) {
          console.warn(`Not a file: ${path}`);
          return false;
        }

        // Check if extension is supported
        const ext = extname(path).toLowerCase();
        if (!SUPPORTED_EXTENSIONS.includes(ext)) {
          console.warn(`Unsupported format (${ext}): ${path}`);
          return false;
        }

        return true;
      } catch (error) {
        console.error(`Error validating path: ${path}`, error);
        return false;
      }
    });

  console.log('Valid image paths:', validPaths);
  return validPaths;
}

/**
 * Logs detailed argument information for debugging
 */
export function logArgs() {
  console.log('=== Command Line Arguments Debug ===');
  console.log('Full process.argv:', process.argv);
  console.log('Process CWD:', process.cwd());
  console.log('Parsed file paths:', parseCommandLineArgs());
  console.log('====================================');
}
