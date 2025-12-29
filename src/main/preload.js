import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  openFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  convertImage: (data) => ipcRenderer.invoke('convert:image', data),
  getImageInfo: (filePath) => ipcRenderer.invoke('get:imageInfo', filePath),
});
