import { contextBridge, ipcRenderer, shell } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Auth APIs
  login: () => ipcRenderer.invoke('auth:login'),
  getAuthStatus: () => ipcRenderer.invoke('auth:getStatus'),
  logout: () => ipcRenderer.invoke('auth:logout'),
  
  // YouTube APIs
  getSubscriptions: () => ipcRenderer.invoke('youtube:getSubscriptions'),
  getLatestVideos: () => ipcRenderer.invoke('youtube:getLatestVideos'),
  getPlaylists: () => ipcRenderer.invoke('youtube:getPlaylists'),
  getArtists: () => ipcRenderer.invoke('youtube:getArtists'),
  getMusicPlaylists: () => ipcRenderer.invoke('youtube:getMusicPlaylists'),
  
  // Cache APIs
  forceSync: () => ipcRenderer.invoke('cache:forceSync'),
  clearCache: () => ipcRenderer.invoke('cache:clearCache'),
  
  // Shell API
  openExternal: (url: string) => shell.openExternal(url)
});
