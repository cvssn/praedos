export const IPC = {
  worldstate: {
    get: 'worldstate:get',
  },
  market: {
    search: 'market:search',
    orders: 'market:orders',
  },
  settings: {
    get: 'settings:get',
    set: 'settings:set',
  },
  notes: {
    list: 'notes:list',
    add: 'notes:add',
    toggle: 'notes:toggle',
    remove: 'notes:remove',
  },
  builds: {
    list: 'builds:list',
    add: 'builds:add',
    update: 'builds:update',
    remove: 'builds:remove',
    pickImage: 'builds:pick-image',
    readImage: 'builds:read-image',
  },
  starChart: {
    list: 'starchart:list',
  },
  log: {
    setPath: 'log:set-path',
    pickFile: 'log:pick-file',
    recent: 'log:recent',
    event: 'log:event',
  },
  window: {
    minimize: 'window:minimize',
    maximize: 'window:maximize',
    close: 'window:close',
    isMaximized: 'window:is-maximized',
  },
  shell: {
    openExternal: 'shell:open-external',
  },
} as const;
