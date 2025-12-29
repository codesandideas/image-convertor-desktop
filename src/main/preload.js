const { contextBridge, ipcRenderer } = require('electron');

console.log('=== PRELOAD SCRIPT EXECUTING ===');
console.log('contextBridge available:', !!contextBridge);
console.log('ipcRenderer available:', !!ipcRenderer);

try {
  contextBridge.exposeInMainWorld('electronAPI', {
    openFiles: () => {
      console.log('openFiles called from renderer');
      return ipcRenderer.invoke('dialog:openFiles');
    },
    selectFolder: () => {
      console.log('selectFolder called from renderer');
      return ipcRenderer.invoke('dialog:selectFolder');
    },
    convertImage: (data) => {
      console.log('convertImage called from renderer');
      return ipcRenderer.invoke('convert:image', data);
    },
    getImageInfo: (filePath) => {
      console.log('getImageInfo called from renderer:', filePath);
      return ipcRenderer.invoke('get:imageInfo', filePath);
    },
    getSettings: () => {
      console.log('getSettings called from renderer');
      return ipcRenderer.invoke('settings:get');
    },
    saveSettings: (settings) => {
      console.log('saveSettings called from renderer:', settings);
      return ipcRenderer.invoke('settings:save', settings);
    },
    // Listener for files passed from main process
    onFilesOpen: (callback) => {
      console.log('onFilesOpen listener registered');
      ipcRenderer.on('files:open', (event, filePaths) => {
        console.log('files:open event received:', filePaths);
        callback(filePaths);
      });
    },
    // Remove listener (cleanup)
    removeFilesOpenListener: () => {
      console.log('Removing files:open listener');
      ipcRenderer.removeAllListeners('files:open');
    },
  });
  console.log('=== electronAPI SUCCESSFULLY EXPOSED ===');
  console.log('API methods:', Object.keys({
    openFiles: true,
    selectFolder: true,
    convertImage: true,
    getImageInfo: true,
    getSettings: true,
    saveSettings: true,
    onFilesOpen: true,
    removeFilesOpenListener: true,
  }));
} catch (error) {
  console.error('=== ERROR EXPOSING electronAPI ===', error);
  console.error('Error details:', error.message, error.stack);
}
