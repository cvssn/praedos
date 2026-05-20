import { ipcMain, dialog, shell, BrowserWindow } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { IPC } from '@shared/channels';
import { fetchWorldstate } from './worldstate';
import { searchItems, fetchOrders } from './market';
import {
  addBuild,
  addNote,
  buildsImagesDir,
  getSettings,
  listBuilds,
  listNotes,
  removeBuild,
  removeNote,
  setSettings,
  toggleNote,
  updateBuild,
} from './store';
import type { BuildInput, BuildPatch } from '@shared/types';
import { LogWatcher } from './logWatcher';

export function registerIpc(getWindow: () => BrowserWindow | null, watcher: LogWatcher) {
  ipcMain.handle(IPC.worldstate.get, async () => {
    const s = getSettings();
    return fetchWorldstate(s.platform);
  });

  ipcMain.handle(IPC.market.search, async (_e, query: string) => searchItems(query));
  ipcMain.handle(IPC.market.orders, async (_e, urlName: string) => fetchOrders(urlName));

  ipcMain.handle(IPC.settings.get, async () => getSettings());
  ipcMain.handle(IPC.settings.set, async (_e, patch) => {
    const next = setSettings(patch);
    if (patch?.eeLogPath) watcher.setPath(next.eeLogPath);
    return next;
  });

  ipcMain.handle(IPC.notes.list, async () => listNotes());
  ipcMain.handle(IPC.notes.add, async (_e, text: string) => addNote(text));
  ipcMain.handle(IPC.notes.toggle, async (_e, id: string) => toggleNote(id));
  ipcMain.handle(IPC.notes.remove, async (_e, id: string) => removeNote(id));

  ipcMain.handle(IPC.builds.list, async () => listBuilds());
  ipcMain.handle(IPC.builds.add, async (_e, input: BuildInput) => addBuild(input));
  ipcMain.handle(IPC.builds.update, async (_e, id: string, patch: BuildPatch) =>
    updateBuild(id, patch),
  );
  ipcMain.handle(IPC.builds.remove, async (_e, id: string) => removeBuild(id));
  ipcMain.handle(IPC.builds.pickImage, async () => {
    const win = getWindow();
    if (!win) return null;
    const res = await dialog.showOpenDialog(win, {
      title: 'Select build image',
      filters: [{ name: 'Image', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }],
      properties: ['openFile'],
    });
    if (res.canceled || res.filePaths.length === 0) return null;
    const src = res.filePaths[0];
    const dir = buildsImagesDir();
    const ext = path.extname(src) || '.png';
    const dest = path.join(dir, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
    fs.copyFileSync(src, dest);
    return dest;
  });
  ipcMain.handle(IPC.builds.readImage, async (_e, p: string) => {
    try {
      const dir = buildsImagesDir();
      const resolved = path.resolve(p);
      if (!resolved.startsWith(path.resolve(dir))) return null;
      const buf = fs.readFileSync(resolved);
      const ext = path.extname(resolved).slice(1).toLowerCase() || 'png';
      const mime = ext === 'jpg' ? 'jpeg' : ext;
      return `data:image/${mime};base64,${buf.toString('base64')}`;
    } catch {
      return null;
    }
  });

  ipcMain.handle(IPC.log.setPath, async (_e, p: string) => {
    setSettings({ eeLogPath: p });
    watcher.setPath(p);
  });
  ipcMain.handle(IPC.log.pickFile, async () => {
    const win = getWindow();
    if (!win) return null;
    const res = await dialog.showOpenDialog(win, {
      title: 'Select Warframe EE.log',
      filters: [{ name: 'Log', extensions: ['log', 'txt'] }],
      properties: ['openFile'],
    });
    if (res.canceled || res.filePaths.length === 0) return null;
    const p = res.filePaths[0];
    setSettings({ eeLogPath: p });
    watcher.setPath(p);
    return p;
  });
  ipcMain.handle(IPC.log.recent, async () => watcher.recent());

  ipcMain.on(IPC.window.minimize, () => getWindow()?.minimize());
  ipcMain.on(IPC.window.maximize, () => {
    const w = getWindow();
    if (!w) return;
    if (w.isMaximized()) w.unmaximize();
    else w.maximize();
  });
  ipcMain.on(IPC.window.close, () => getWindow()?.close());
  ipcMain.handle(IPC.window.isMaximized, async () => getWindow()?.isMaximized() ?? false);

  ipcMain.handle(IPC.shell.openExternal, async (_e, url: string) => {
    if (!/^https?:\/\//.test(url)) return;
    await shell.openExternal(url);
  });
}
