import { ipcMain, dialog, shell, BrowserWindow } from 'electron';
import { IPC } from '@shared/channels';
import { fetchWorldstate } from './worldstate';
import { searchItems, fetchOrders } from './market';
import { addNote, getSettings, listNotes, removeNote, setSettings, toggleNote } from './store';
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
