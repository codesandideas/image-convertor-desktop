import React from 'react';

export default function ProgressBar({ total, completed, current, isProcessing }) {
  if (total === 0) return null;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="card p-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">
            {isProcessing ? 'Converting Images...' : 'Conversion Complete'}
          </h3>
          <span className="text-sm font-medium text-gray-600">
            {completed} / {total} completed
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              isProcessing ? 'bg-blue-600' : 'bg-green-600'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Current File */}
        {current && isProcessing && (
          <p className="text-sm text-gray-600">
            Currently processing: <span className="font-medium">{current}</span>
          </p>
        )}

        {/* Completion Message */}
        {!isProcessing && completed === total && total > 0 && (
          <div className="flex items-center gap-2 text-green-700">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-medium">All images converted successfully!</span>
          </div>
        )}
      </div>
    </div>
  );
}
