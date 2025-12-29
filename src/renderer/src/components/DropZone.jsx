import React, { useState } from 'react';
import { isValidImageFile } from '../utils/helpers';

export default function DropZone({ onFilesAdded }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(isValidImageFile);
    if (files.length > 0) {
      onFilesAdded(files);
    }
  };

  const handleFileSelect = async () => {
    try {
      if (!window.electronAPI || !window.electronAPI.openFiles) {
        console.error('electronAPI not available');
        return;
      }

      const result = await window.electronAPI.openFiles();
      if (!result || result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return;
      }

      const files = result.filePaths.map(path => {
        // Extract filename from path (works with both forward and backward slashes)
        const normalizedPath = String(path).replace(/\\/g, '/');
        const name = normalizedPath.split('/').pop();
        return {
          path: String(path),
          name: name,
        };
      });
      onFilesAdded(files);
    } catch (error) {
      console.error('Error opening file dialog:', error);
    }
  };

  return (
    <div
      className={`card p-8 border-2 border-dashed transition-all duration-200 ${
        isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="text-center">
        <svg
          className={`mx-auto h-16 w-16 ${
            isDragging ? 'text-blue-500' : 'text-gray-400'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <h3 className="mt-4 text-lg font-semibold text-gray-900">
          Drop images here
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          or click the button below to browse
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Supports: JPG, PNG, WebP, AVIF, TIFF
        </p>
        <button
          onClick={handleFileSelect}
          className="btn-primary mt-6"
        >
          Select Images
        </button>
      </div>
    </div>
  );
}
