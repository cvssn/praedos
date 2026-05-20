import fs from 'node:fs';
import path from 'node:path';
import { app } from 'electron';
import type { AppSettings, BuildInput, BuildItem, BuildPatch, NoteItem } from '@shared/types';
import { DEFAULT_THEME_ID } from '@shared/themes';

type Schema = {
  settings: AppSettings;
  notes: NoteItem[];
  builds: BuildItem[];
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
    closeToTray: true,
    theme: DEFAULT_THEME_ID,
  },
  notes: [],
  builds: [],
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
      builds: Array.isArray(parsed.builds) ? parsed.builds : [],
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

export function buildsImagesDir(): string {
  const dir = path.join(app.getPath('userData'), 'builds-images');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function listBuilds(): BuildItem[] {
  return load().builds;
}

export function addBuild(input: BuildInput): BuildItem[] {
  const s = load();
  const now = Date.now();
  const build: BuildItem = {
    id: randomId(),
    name: input.name.trim(),
    category: input.category,
    loadout: input.loadout.trim(),
    mods: input.mods,
    notes: input.notes,
    imagePath: input.imagePath,
    createdAt: now,
    updatedAt: now,
  };
  s.builds = [build, ...s.builds];
  persist();
  return s.builds;
}

export function updateBuild(id: string, patch: BuildPatch): BuildItem[] {
  const s = load();
  s.builds = s.builds.map((b) =>
    b.id === id ? { ...b, ...patch, updatedAt: Date.now() } : b,
  );
  persist();
  return s.builds;
}

export function removeBuild(id: string): BuildItem[] {
  const s = load();
  const target = s.builds.find((b) => b.id === id);
  if (target?.imagePath) {
    try {
      fs.unlinkSync(target.imagePath);
    } catch {
      // image already gone — ignore
    }
  }
  s.builds = s.builds.filter((b) => b.id !== id);
  persist();
  return s.builds;
}

function randomId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') return globalThis.crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
