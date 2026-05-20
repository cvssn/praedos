import { app, BrowserWindow, nativeTheme, Tray, Menu, nativeImage } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { LogWatcher, attachLogWatcher } from './main/logWatcher';
import { registerIpc } from './main/ipc';
import { getSettings } from './main/store';

if (started) app.quit();

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;
const watcher = new LogWatcher();

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

function assetPath(...p: string[]): string {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'assets', ...p)
    : path.join(app.getAppPath(), 'assets', ...p);
}

function createWindow(): BrowserWindow {
  nativeTheme.themeSource = 'dark';

  const win = new BrowserWindow({
    title: 'praedos',
    icon: assetPath('icon.png'),
    width: 1320,
    height: 840,
    minWidth: 960,
    minHeight: 600,
    show: false,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0a0a0b',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      spellcheck: false,
    },
  });

  win.setTitle('praedos');
  win.on('page-title-updated', (e) => e.preventDefault());

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  win.once('ready-to-show', () => {
    const settings = getSettings();
    if (settings.startMinimized) win.minimize();
    win.show();
  });

  win.on('close', (e) => {
    if (isQuitting) return;
    const settings = getSettings();
    if (settings.closeToTray) {
      e.preventDefault();
      win.hide();
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) {
      import('electron').then(({ shell }) => shell.openExternal(url));
    }
    return { action: 'deny' };
  });

  return win;
}

function setupTray() {
  const icon = nativeImage.createFromPath(assetPath('tray.png'));
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip('praedos · warframe helper');
  const menu = Menu.buildFromTemplate([
    {
      label: 'show praedos',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'quit',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);
  tray.setContextMenu(menu);
  tray.on('click', () => {
    if (!mainWindow) return;
    if (mainWindow.isVisible()) mainWindow.hide();
    else mainWindow.show();
  });
}

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.show();
    mainWindow.focus();
  }
});

app.whenReady().then(() => {
  registerIpc(() => mainWindow, watcher);
  mainWindow = createWindow();
  attachLogWatcher(mainWindow, watcher);
  const settings = getSettings();
  if (settings.eeLogPath) watcher.setPath(settings.eeLogPath);
  setupTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      mainWindow = createWindow();
      attachLogWatcher(mainWindow, watcher);
    }
  });
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  watcher.stop();
  if (process.platform !== 'darwin') app.quit();
});
