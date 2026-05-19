import { contextBridge, ipcRenderer } from 'electron';
import { IPC } from '@shared/channels';
import type { PraedosApi, LogEvent } from '@shared/types';

const api: PraedosApi = {
  worldstate: {
    get: () => ipcRenderer.invoke(IPC.worldstate.get),
  },
  market: {
    search: (query) => ipcRenderer.invoke(IPC.market.search, query),
    orders: (urlName) => ipcRenderer.invoke(IPC.market.orders, urlName),
  },
  settings: {
    get: () => ipcRenderer.invoke(IPC.settings.get),
    set: (patch) => ipcRenderer.invoke(IPC.settings.set, patch),
  },
  notes: {
    list: () => ipcRenderer.invoke(IPC.notes.list),
    add: (text) => ipcRenderer.invoke(IPC.notes.add, text),
    toggle: (id) => ipcRenderer.invoke(IPC.notes.toggle, id),
    remove: (id) => ipcRenderer.invoke(IPC.notes.remove, id),
  },
  log: {
    onEvent: (cb) => {
      const listener = (_e: Electron.IpcRendererEvent, event: LogEvent) => cb(event);
      ipcRenderer.on(IPC.log.event, listener);
      return () => ipcRenderer.off(IPC.log.event, listener);
    },
    setPath: (p) => ipcRenderer.invoke(IPC.log.setPath, p),
    pickFile: () => ipcRenderer.invoke(IPC.log.pickFile),
    recent: () => ipcRenderer.invoke(IPC.log.recent),
  },
  window: {
    minimize: () => ipcRenderer.send(IPC.window.minimize),
    maximize: () => ipcRenderer.send(IPC.window.maximize),
    close: () => ipcRenderer.send(IPC.window.close),
    isMaximized: () => ipcRenderer.invoke(IPC.window.isMaximized),
  },
  shell: {
    openExternal: (url) => ipcRenderer.invoke(IPC.shell.openExternal, url),
  },
};

contextBridge.exposeInMainWorld('praedos', api);
