import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';
import { convertImage } from './imageProcessor.js';
import { getSettings, saveSettings, getSettingsPath } from './settingsManager.js';
import { parseCommandLineArgs, logArgs } from './argumentParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;
let pendingFilesToLoad = [];

function createWindow() {
  const preloadPath = join(__dirname, 'preload.cjs');
  console.log('Preload script path:', preloadPath);
  console.log('__dirname:', __dirname);

  // Verify preload script exists
  if (!existsSync(preloadPath)) {
    console.error('Preload script not found at:', preloadPath);
  } else {
    console.log('Preload script exists at:', preloadPath);
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: true,
    },
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Page finished loading');
  });

  mainWindow.on('ready-to-show', () => {
    console.log('Window ready to show');
    mainWindow.show();

    // Send pending files to renderer after a short delay
    if (pendingFilesToLoad.length > 0) {
      console.log('Preparing to send pending files:', pendingFilesToLoad);
      setTimeout(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
          console.log('Sending pending files to renderer');
          mainWindow.webContents.send('files:open', pendingFilesToLoad);
          pendingFilesToLoad = [];
        }
      }, 500); // 500ms delay ensures React is fully mounted
    }
  });
}

// Request single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Another instance is running, quit this one
  console.log('Another instance is already running. Quitting...');
  app.quit();
} else {
  // This is the primary instance

  // Handle second instance events (when user opens files while app is running)
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    console.log('Second instance detected');
    console.log('Command line:', commandLine);
    console.log('Working directory:', workingDirectory);

    // Temporarily set process.argv to parse from second instance
    const originalArgv = process.argv;
    process.argv = commandLine;
    const filePaths = parseCommandLineArgs();
    process.argv = originalArgv;

    if (mainWindow) {
      // Focus the existing window
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      // Send files to renderer
      if (filePaths.length > 0) {
        console.log('Sending files from second instance:', filePaths);
        mainWindow.webContents.send('files:open', filePaths);
      }
    }
  });

  // Parse initial command line args
  logArgs(); // Debug logging
  pendingFilesToLoad = parseCommandLineArgs();
  if (pendingFilesToLoad.length > 0) {
    console.log('Files to load on startup:', pendingFilesToLoad);
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('dialog:openFiles', async () => {
  try {
    if (!mainWindow) {
      console.error('Main window not available');
      return { canceled: true, filePaths: [] };
    }

    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'tif'] },
      ],
    });
    console.log('File dialog result:', result);
    return result;
  } catch (error) {
    console.error('Error showing file dialog:', error);
    return { canceled: true, filePaths: [] };
  }
});

ipcMain.handle('dialog:selectFolder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  return result;
});

ipcMain.handle('convert:image', async (event, { inputPath, outputPath, format, options }) => {
  try {
    await convertImage(inputPath, outputPath, format, options);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get:imageInfo', async (event, filePath) => {
  try {
    const { readFileSync, statSync } = await import('fs');
    const stats = statSync(filePath);
    return {
      size: stats.size,
      path: filePath,
    };
  } catch (error) {
    return { error: error.message };
  }
});

ipcMain.handle('settings:get', async () => {
  try {
    const settings = getSettings();
    console.log('Settings retrieved:', settings);
    return settings;
  } catch (error) {
    console.error('Error getting settings:', error);
    return null;
  }
});

ipcMain.handle('settings:save', async (event, settings) => {
  try {
    saveSettings(settings);
    console.log('Settings saved via IPC');
    return { success: true };
  } catch (error) {
    console.error('Error saving settings:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('settings:getPath', async () => {
  return getSettingsPath();
});
