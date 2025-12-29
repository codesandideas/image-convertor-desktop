import React from 'react';
import { formatFileSize, getFileExtension, FILE_STATUS } from '../utils/helpers';

export default function ImageQueue({ images, onRemove, onClearAll }) {
  if (images.length === 0) {
    return null;
  }

  const getStatusBadge = (status) => {
    const badges = {
      [FILE_STATUS.PENDING]: (
        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
          Pending
        </span>
      ),
      [FILE_STATUS.PROCESSING]: (
        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded flex items-center gap-1">
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
          </svg>
          Processing
        </span>
      ),
      [FILE_STATUS.COMPLETED]: (
        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
          Completed
        </span>
      ),
      [FILE_STATUS.ERROR]: (
        <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded">
          Error
        </span>
      ),
    };
    return badges[status] || badges[FILE_STATUS.PENDING];
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Image Queue ({images.length})
        </h2>
        <button
          onClick={onClearAll}
          className="btn-secondary text-sm"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {images.map((image) => (
          <div
            key={image.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* File Icon */}
              <div className="flex-shrink-0">
                <svg
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {image.name}
                </p>
                <p className="text-xs text-gray-500">
                  {getFileExtension(image.name).toUpperCase()} • {formatFileSize(image.size)}
                </p>
                {image.error && (
                  <p className="text-xs text-red-600 mt-1">{image.error}</p>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex-shrink-0">
                {getStatusBadge(image.status)}
              </div>

              {/* Remove Button */}
              {image.status !== FILE_STATUS.PROCESSING && (
                <button
                  onClick={() => onRemove(image.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                  title="Remove"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
