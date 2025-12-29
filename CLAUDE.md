# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Desktop image converter application built with Electron.js that converts images between multiple formats (JPG, PNG, WebP, AVIF, TIFF) with batch processing and drag-and-drop interface.

## Tech Stack

- **Framework**: Electron.js
- **Image Processing**: Sharp library
- **UI**: React with Tailwind CSS
- **Build Tool**: Vite
- **Packaging**: electron-builder

## Architecture

### Process Architecture

This is an Electron application with a multi-process architecture:

- **Main Process** (`src/main/main.js`): Handles window management, file system operations, and coordinates image processing
- **Renderer Process** (`src/renderer/`): React-based UI running in the browser context
- **Preload Script** (`src/main/preload.js`): Secure bridge for IPC communication between main and renderer processes
- **Image Processor** (`src/main/imageProcessor.js`): Sharp-based conversion logic running in main process

### IPC Communication Flow

File operations and image conversions must go through IPC:
1. Renderer requests operation via preload-exposed APIs
2. Main process handles file system access and Sharp processing
3. Progress updates sent back to renderer via IPC events

### Key Components

- **DropZone**: Drag-and-drop file upload with validation
- **ImageQueue**: Displays batch processing queue with status per file
- **ConversionSettings**: Format selection, quality, resize, metadata options
- **ProgressBar**: Overall batch progress tracking

## Development Commands

```bash
# Install dependencies
npm install

# Development mode (hot reload)
npm run dev

# Build for production
npm run build

# Package application
npm run package

# Create distributable installers
npm run dist
```

## Image Conversion Logic

All conversions handled by Sharp in `imageProcessor.js`:
- Each format has dedicated conversion function (e.g., `convertToJPG`, `convertToPNG`)
- Options include: quality (0-100), resize dimensions, metadata preservation
- Error handling must account for: corrupted files, unsupported formats, disk space issues

## Format Support

- **Input**: JPG, JPEG, PNG, WebP, AVIF, TIFF
- **Output**: JPG, PNG, WebP, AVIF, TIFF
- Quality settings are format-dependent (e.g., AVIF supports different compression than PNG)

## State Management

Application state managed in main React component:
- Image queue (array of file objects with status)
- Conversion settings (format, quality, resize, metadata)
- Processing status (idle, processing, complete)
- Output folder path

## File Naming Convention

Output files use pattern: `{original-name}.{new-format}`
Handle filename conflicts with auto-rename or overwrite based on user settings.

## Security Considerations

- Use contextIsolation and nodeIntegration:false in BrowserWindow
- Expose only necessary APIs through preload script
- Validate all file paths and formats before processing
- Sanitize user input for file operations
