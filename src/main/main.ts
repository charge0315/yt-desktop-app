import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { config } from 'dotenv';
import { AuthService } from './services/AuthService';
import { YouTubeService } from './services/YouTubeService';
import { CacheService } from './services/CacheService';

// Load environment variables from .env file
config({ path: path.join(__dirname, '../../.env') });

let mainWindow: BrowserWindow | null = null;
let authService: AuthService;
let youtubeService: YouTubeService;
let cacheService: CacheService;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function initializeServices() {
  // Initialize services
  authService = new AuthService();
  cacheService = new CacheService();
  await cacheService.connect();
  youtubeService = new YouTubeService(authService, cacheService);
}

app.whenReady().then(async () => {
  await initializeServices();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.handle('auth:login', async () => {
  try {
    const tokens = await authService.authenticate();
    return { success: true, tokens };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('auth:getStatus', async () => {
  return authService.isAuthenticated();
});

ipcMain.handle('auth:logout', async () => {
  authService.logout();
  return { success: true };
});

ipcMain.handle('youtube:getSubscriptions', async () => {
  try {
    const subscriptions = await youtubeService.getSubscriptions();
    return { success: true, data: subscriptions };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('youtube:getLatestVideos', async () => {
  try {
    const videos = await youtubeService.getLatestVideos();
    return { success: true, data: videos };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('youtube:getPlaylists', async () => {
  try {
    const playlists = await youtubeService.getPlaylists();
    return { success: true, data: playlists };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('youtube:getArtists', async () => {
  try {
    const artists = await youtubeService.getArtists();
    return { success: true, data: artists };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('youtube:getMusicPlaylists', async () => {
  try {
    const playlists = await youtubeService.getMusicPlaylists();
    return { success: true, data: playlists };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('youtube:getShorts', async () => {
  try {
    const shorts = await youtubeService.getShorts();
    return { success: true, data: shorts };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('cache:forceSync', async () => {
  try {
    await youtubeService.forceSyncAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});

ipcMain.handle('cache:clearCache', async () => {
  try {
    await cacheService.clearAll();
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
});
