import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import type { AppSettings, NoteItem } from '@shared/types';

type Schema = {
  settings: AppSettings;
  notes: NoteItem[];
};

function defaultEeLog(): string {
  const local = process.env.LOCALAPPDATA || path.join(app.getPath('home'), 'AppData', 'Local');
  return path.join(local, 'Warframe', 'EE.log');
}

const DEFAULTS: Schema = {
  settings: {
    platform: 'pc',
    eeLogPath: defaultEeLog(),
    refreshIntervalSec: 60,
    notifyOnFissure: true,
    notifyOnArbitration: true,
    startMinimized: false,
  },
  notes: [],
};

let state: Schema | null = null;
let filePath = '';

function load(): Schema {
  if (state) return state;
  filePath = path.join(app.getPath('userData'), 'praedos-store.json');
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<Schema>;
    state = {
      settings: { ...DEFAULTS.settings, ...(parsed.settings ?? {}) },
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    };
  } catch {
    state = structuredClone(DEFAULTS);
    persist();
  }
  return state;
}

function persist() {
  if (!state) return;
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Store persist failed', err);
  }
}

export function getSettings(): AppSettings {
  return load().settings;
}

export function setSettings(patch: Partial<AppSettings>): AppSettings {
  const s = load();
  s.settings = { ...s.settings, ...patch };
  persist();
  return s.settings;
}

export function listNotes(): NoteItem[] {
  return load().notes;
}

export function addNote(text: string): NoteItem[] {
  const s = load();
  const note: NoteItem = {
    id: randomId(),
    text: text.trim(),
    done: false,
    createdAt: Date.now(),
  };
  s.notes = [note, ...s.notes];
  persist();
  return s.notes;
}

export function toggleNote(id: string): NoteItem[] {
  const s = load();
  s.notes = s.notes.map((n) => (n.id === id ? { ...n, done: !n.done } : n));
  persist();
  return s.notes;
}

export function removeNote(id: string): NoteItem[] {
  const s = load();
  s.notes = s.notes.filter((n) => n.id !== id);
  persist();
  return s.notes;
}

function randomId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
