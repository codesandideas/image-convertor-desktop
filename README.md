# Image Converter - Desktop Application

A powerful cross-platform desktop application built with Electron.js for converting images between multiple formats with batch processing capabilities.

## Features

- **Multiple Format Support**: Convert between JPG, PNG, WebP, AVIF, and TIFF
- **Batch Processing**: Process multiple images simultaneously with queue management
- **Drag & Drop**: Intuitive drag-and-drop interface for adding images
- **Quality Control**: Adjustable quality/compression settings (0-100%)
- **Image Resizing**: Optional width/height resizing with aspect ratio preservation
- **Metadata Control**: Choose to preserve or strip EXIF metadata
- **Progress Tracking**: Real-time progress updates for batch conversions
- **Error Handling**: User-friendly error messages and status indicators
- **Cross-Platform**: Works on Windows, macOS, and Linux

## Tech Stack

- **Framework**: Electron.js
- **UI**: React with Tailwind CSS
- **Image Processing**: Sharp library
- **Build Tool**: Vite
- **Packaging**: electron-builder

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or pnpm

### Steps

1. Clone or download this repository:
```bash
git clone <repository-url>
cd image-converter
```

2. Install dependencies:
```bash
npm install
```

## Development

Run the application in development mode with hot reload:

```bash
npm run electron:dev
```

This will:
- Start the Vite dev server on port 5173
- Launch the Electron application
- Enable hot module replacement for React components

## Building

### Build for Production

```bash
npm run build
```

This creates optimized production files in the `dist` and `dist-electron` directories.

### Create Installers

Build installers for your platform:

```bash
npm run electron:build
```

The installers will be created in the `release` directory:
- **Windows**: `.exe` installer
- **macOS**: `.dmg` installer
- **Linux**: `.AppImage` and `.deb` packages

## Usage

### Adding Images

1. **Drag & Drop**: Drag image files directly onto the drop zone
2. **File Browser**: Click "Select Images" button to browse and select files

Supported input formats: JPG, JPEG, PNG, WebP, AVIF, TIFF

### Conversion Settings

- **Output Format**: Select target format from dropdown (JPG, PNG, WebP, AVIF, TIFF)
- **Quality**: Adjust slider (1-100%) for compression/quality tradeoff
- **Resize**: Optionally specify width and/or height in pixels
- **Metadata**: Toggle to preserve or strip EXIF data
- **Output Folder**: Choose custom output location (defaults to source folder)

### Processing

1. Add images to the queue
2. Configure conversion settings
3. Click "Convert X Images" button
4. Monitor progress in real-time
5. Review completed conversions in the queue

### Queue Management

- **Remove**: Click the X icon to remove individual images
- **Clear All**: Remove all images from the queue
- **Status Indicators**:
  - **Pending**: Waiting to be processed
  - **Processing**: Currently converting
  - **Completed**: Successfully converted
  - **Error**: Conversion failed (with error message)

## Project Structure

```
image-converter/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── main.js              # Main process entry point
│   │   ├── preload.js           # Preload script for IPC
│   │   └── imageProcessor.js    # Sharp conversion logic
│   └── renderer/                # React renderer process
│       ├── src/
│       │   ├── components/      # React components
│       │   │   ├── DropZone.jsx
│       │   │   ├── ImageQueue.jsx
│       │   │   ├── ConversionSettings.jsx
│       │   │   └── ProgressBar.jsx
│       │   ├── utils/
│       │   │   └── helpers.js   # Utility functions
│       │   ├── App.jsx          # Main React component
│       │   └── main.jsx         # React entry point
│       ├── styles/
│       │   └── app.css          # Tailwind CSS
│       └── index.html           # HTML entry point
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Architecture

### Electron Multi-Process Architecture

- **Main Process**: Handles window management, file system operations, and image processing
- **Renderer Process**: React-based UI running in browser context
- **Preload Script**: Secure IPC bridge between main and renderer processes

### Security

- Context isolation enabled
- Node integration disabled in renderer
- Sandboxed preload script
- Validated file paths and formats
- Sanitized user input

## Format-Specific Notes

### Quality Settings

- **JPG/JPEG**: Uses MozJPEG for optimized compression
- **PNG**: Quality affects compression level (inverse relationship)
- **WebP**: Supports both lossy and lossless compression
- **AVIF**: Modern format with excellent compression
- **TIFF**: Professional format with minimal compression

### Metadata

When "Preserve metadata" is enabled, EXIF data (camera settings, GPS, etc.) is retained in the output file. Disable this to reduce file size and remove sensitive information.

### Resizing

- Aspect ratio is always preserved
- Images are never enlarged (withoutEnlargement option)
- Specify width, height, or both for proportional scaling

## Troubleshooting

### Sharp Installation Issues

If Sharp fails to install, try:
```bash
npm install --platform=win32 --arch=x64 sharp
```

### Permission Errors

Ensure you have write permissions for the output directory.

### Unsupported Format Error

Verify the input file is a valid image and not corrupted.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
