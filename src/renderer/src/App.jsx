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

  const handleFilesAdded = async (files) => {
    const newImages = await Promise.all(
      files.map(async (file) => {
        const filePath = file.path || file;
        const fileName = file.name || filePath.split('\\').pop().split('/').pop();

        let fileSize = file.size;
        if (!fileSize) {
          try {
            const info = await window.electronAPI.getImageInfo(filePath);
            fileSize = info.size;
          } catch (error) {
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
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
