import React from 'react';
import { OUTPUT_FORMATS } from '../utils/helpers';

export default function ConversionSettings({
  format,
  quality,
  width,
  height,
  preserveMetadata,
  outputFolder,
  onFormatChange,
  onQualityChange,
  onWidthChange,
  onHeightChange,
  onMetadataToggle,
  onOutputFolderSelect,
}) {
  const handleSelectFolder = async () => {
    try {
      if (!window.electronAPI || !window.electronAPI.selectFolder) {
        console.error('electronAPI not available');
        return;
      }

      const result = await window.electronAPI.selectFolder();
      if (!result || result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return;
      }

      onOutputFolderSelect(result.filePaths[0]);
    } catch (error) {
      console.error('Error opening folder dialog:', error);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Conversion Settings</h2>

      <div className="space-y-4">
        {/* Output Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output Format
          </label>
          <select
            value={format}
            onChange={(e) => onFormatChange(e.target.value)}
            className="input-field"
          >
            {OUTPUT_FORMATS.map((fmt) => (
              <option key={fmt.value} value={fmt.value}>
                {fmt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quality Slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quality: {quality}%
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={quality}
            onChange={(e) => onQualityChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Lower size</span>
            <span>Higher quality</span>
          </div>
        </div>

        {/* Resize Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resize (optional)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Width (px)"
                value={width || ''}
                onChange={(e) => onWidthChange(e.target.value ? parseInt(e.target.value) : null)}
                className="input-field"
                min="1"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Height (px)"
                value={height || ''}
                onChange={(e) => onHeightChange(e.target.value ? parseInt(e.target.value) : null)}
                className="input-field"
                min="1"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to keep original size. Aspect ratio will be preserved.
          </p>
        </div>

        {/* Metadata Preservation */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="preserveMetadata"
            checked={preserveMetadata}
            onChange={(e) => onMetadataToggle(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="preserveMetadata" className="ml-2 text-sm text-gray-700">
            Preserve metadata (EXIF)
          </label>
        </div>

        {/* Output Folder */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Output Folder
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={outputFolder || 'Same as source'}
              readOnly
              className="input-field flex-1 bg-gray-50"
            />
            <button
              onClick={handleSelectFolder}
              className="btn-secondary whitespace-nowrap"
            >
              Browse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
