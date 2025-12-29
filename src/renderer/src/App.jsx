import React, { useState } from 'react';
import DropZone from './components/DropZone';
import ImageQueue from './components/ImageQueue';
import ConversionSettings from './components/ConversionSettings';
import ProgressBar from './components/ProgressBar';
import { FILE_STATUS, generateOutputFilename } from './utils/helpers';

export default function App() {
  const [images, setImages] = useState([]);
  const [format, setFormat] = useState('jpg');
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState(null);
  const [height, setHeight] = useState(null);
  const [preserveMetadata, setPreserveMetadata] = useState(true);
  const [outputFolder, setOutputFolder] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

  // Check if Electron API is available
  React.useEffect(() => {
    if (!window.electronAPI) {
      console.error('electronAPI is not available! Check preload script.');
    } else {
      console.log('electronAPI is available:', Object.keys(window.electronAPI));
    }
  }, []);

  // Load settings on mount
  React.useEffect(() => {
    const loadSettings = async () => {
      if (window.electronAPI && window.electronAPI.getSettings) {
        try {
          const savedSettings = await window.electronAPI.getSettings();
          if (savedSettings) {
            setFormat(savedSettings.format || 'jpg');
            setQuality(savedSettings.quality || 80);
            setWidth(savedSettings.width);
            setHeight(savedSettings.height);
            setPreserveMetadata(savedSettings.preserveMetadata ?? true);
            setOutputFolder(savedSettings.outputFolder);
            console.log('Settings loaded:', savedSettings);
          }
        } catch (error) {
          console.error('Failed to load settings:', error);
        }
      }
    };
    loadSettings();
  }, []);

  // Save settings when they change
  React.useEffect(() => {
    const saveCurrentSettings = async () => {
      if (window.electronAPI && window.electronAPI.saveSettings) {
        await window.electronAPI.saveSettings({
          format,
          quality,
          width,
          height,
          preserveMetadata,
          outputFolder
        });
      }
    };
    saveCurrentSettings();
  }, [format, quality, width, height, preserveMetadata, outputFolder]);

  // Listen for files from command line
  React.useEffect(() => {
    if (window.electronAPI && window.electronAPI.onFilesOpen) {
      window.electronAPI.onFilesOpen((filePaths) => {
        console.log('Received files from main process:', filePaths);
        // Use existing handleFilesAdded function
        // It already handles string paths (line 41-46)
        handleFilesAdded(filePaths);
      });

      // Cleanup on unmount
      return () => {
        if (window.electronAPI.removeFilesOpenListener) {
          window.electronAPI.removeFilesOpenListener();
        }
      };
    }
  }, []);

  const handleFilesAdded = async (files) => {
    if (!window.electronAPI) {
      alert('Error: Electron API not available. Please reload the application.');
      return;
    }

    const newImages = await Promise.all(
      files.map(async (file) => {
        // Handle both File objects (drag-and-drop) and path objects (file dialog)
        let filePath;
        let fileName;
        let fileSize;

        if (typeof file === 'string') {
          // File is just a path string
          filePath = file;
          const normalizedPath = file.replace(/\\/g, '/');
          fileName = normalizedPath.split('/').pop();
          fileSize = 0;
        } else if (file.path) {
          // File has a path property (from file dialog or Electron File object)
          filePath = String(file.path);
          fileName = file.name || filePath.replace(/\\/g, '/').split('/').pop();
          fileSize = file.size || 0;
        } else {
          // Fallback for standard File object without path
          fileName = file.name;
          filePath = file.name; // Will need to be handled differently
          fileSize = file.size || 0;
        }

        // Get file size from main process if not available
        if (!fileSize && filePath && window.electronAPI) {
          try {
            const info = await window.electronAPI.getImageInfo(filePath);
            fileSize = info.size;
          } catch (error) {
            console.error('Error getting image info:', error);
            fileSize = 0;
          }
        }

        return {
          id: `${Date.now()}-${Math.random()}`,
          name: fileName,
          path: filePath,
          size: fileSize,
          status: FILE_STATUS.PENDING,
          error: null,
        };
      })
    );

    setImages((prev) => [...prev, ...newImages]);
  };

  const handleRemove = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleClearAll = () => {
    setImages([]);
    setCurrentFile(null);
  };

  const getOutputPath = (inputPath) => {
    const pathParts = inputPath.split(/[\\/]/);
    const fileName = pathParts.pop();
    const dirPath = pathParts.join('\\');

    const outputDir = outputFolder || dirPath;
    const outputFileName = generateOutputFilename(fileName, format);

    return `${outputDir}\\${outputFileName}`;
  };

  const handleConvert = async () => {
    if (images.length === 0 || isProcessing) return;

    if (!window.electronAPI) {
      alert('Error: Electron API not available. Please reload the application.');
      return;
    }

    setIsProcessing(true);
    const imagesToProcess = images.filter(
      (img) => img.status === FILE_STATUS.PENDING || img.status === FILE_STATUS.ERROR
    );

    for (const image of imagesToProcess) {
      setCurrentFile(image.name);

      // Update status to processing
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, status: FILE_STATUS.PROCESSING, error: null } : img
        )
      );

      try {
        const outputPath = getOutputPath(image.path);
        const options = {
          quality,
          width,
          height,
          preserveMetadata,
        };

        const result = await window.electronAPI.convertImage({
          inputPath: image.path,
          outputPath,
          format,
          options,
        });

        if (result.success) {
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id ? { ...img, status: FILE_STATUS.COMPLETED } : img
            )
          );
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        setImages((prev) =>
          prev.map((img) =>
            img.id === image.id
              ? { ...img, status: FILE_STATUS.ERROR, error: error.message }
              : img
          )
        );
      }
    }

    setIsProcessing(false);
    setCurrentFile(null);
  };

  const completedCount = images.filter((img) => img.status === FILE_STATUS.COMPLETED).length;
  const canConvert = images.length > 0 && !isProcessing;
  const [apiAvailable, setApiAvailable] = React.useState(!!window.electronAPI);
  const apiWasAvailableRef = React.useRef(!!window.electronAPI);

  // Monitor API availability and auto-reload if it disappears (HMR issue)
  React.useEffect(() => {
    const interval = setInterval(() => {
      const isAvailable = !!window.electronAPI;
      setApiAvailable(isAvailable);

      // If API was available and now it's not, auto-reload after a short delay
      if (apiWasAvailableRef.current && !isAvailable) {
        console.warn('Electron API lost, auto-reloading in 1 second...');
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
      apiWasAvailableRef.current = isAvailable;
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* API Warning Banner */}
        {!apiAvailable && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">
              Electron API not available. This can happen after hot-reload.
            </span>
            <button
              onClick={() => window.location.reload()}
              className="ml-4 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        )}

        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Image Converter</h1>
          <p className="text-gray-600">
            Convert images between JPG, PNG, WebP, AVIF, and TIFF formats
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Upload & Queue */}
          <div className="lg:col-span-2 space-y-6">
            <DropZone onFilesAdded={handleFilesAdded} />
            <ImageQueue
              images={images}
              onRemove={handleRemove}
              onClearAll={handleClearAll}
            />
          </div>

          {/* Right Column - Settings */}
          <div className="space-y-6">
            <ConversionSettings
              format={format}
              quality={quality}
              width={width}
              height={height}
              preserveMetadata={preserveMetadata}
              outputFolder={outputFolder}
              onFormatChange={setFormat}
              onQualityChange={setQuality}
              onWidthChange={setWidth}
              onHeightChange={setHeight}
              onMetadataToggle={setPreserveMetadata}
              onOutputFolderSelect={setOutputFolder}
            />

            {/* Convert Button */}
            <button
              onClick={handleConvert}
              disabled={!canConvert}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
                canConvert
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isProcessing ? 'Converting...' : `Convert ${images.length} Image${images.length !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        {images.length > 0 && (
          <ProgressBar
            total={images.length}
            completed={completedCount}
            current={currentFile}
            isProcessing={isProcessing}
          />
        )}
      </div>
    </div>
  );
}
