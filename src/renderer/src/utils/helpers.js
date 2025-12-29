const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tiff', 'tif'];

export function isValidImageFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  return SUPPORTED_FORMATS.includes(ext);
}

export function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export function generateOutputFilename(originalName, newFormat) {
  const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
  return `${nameWithoutExt}.${newFormat}`;
}

export function handleFilenameConflict(filePath, fs) {
  // This will be handled in main process, but helper for generating unique names
  let counter = 1;
  let newPath = filePath;
  const ext = filePath.split('.').pop();
  const base = filePath.substring(0, filePath.lastIndexOf('.'));

  while (fs.existsSync(newPath)) {
    newPath = `${base} (${counter}).${ext}`;
    counter++;
  }

  return newPath;
}

export const OUTPUT_FORMATS = [
  { value: 'jpg', label: 'JPG' },
  { value: 'png', label: 'PNG' },
  { value: 'webp', label: 'WebP' },
  { value: 'avif', label: 'AVIF' },
  { value: 'tiff', label: 'TIFF' },
];

export const FILE_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
};
