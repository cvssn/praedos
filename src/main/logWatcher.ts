import fs from 'node:fs';
import path from 'node:path';
import { EventEmitter } from 'node:events';
import type { BrowserWindow } from 'electron';
import { IPC } from '@shared/channels';
import type { LogEvent } from '@shared/types';

const MAX_BUFFER = 500;

function categorize(line: string): string | null {
  if (/Sys \[Info\]: Logging in/.test(line)) return 'login';
  if (/Script \[Info\]: ChallengeProgress/.test(line)) return 'challenge';
  if (/Sys \[Diag\]: Mission Score/.test(line)) return 'mission-end';
  if (/Game \[Info\]: HOST_MIGRATION/.test(line)) return 'host-migration';
  if (/Script \[Info\]: EquinoxSwitchScript/.test(line)) return 'equinox';
  if (/Sys \[Info\]: Setting language/.test(line)) return 'startup';
  if (/Net \[Info\]: Logged in/.test(line)) return 'login';
  if (/Script \[Info\]: TutorialManagerStateChanged/.test(line)) return 'tutorial';
  if (/Game \[Info\]: AddItem/.test(line)) return 'inventory';
  if (/EE\.log/.test(line)) return 'meta';
  if (/Script \[Info\]: Loading existing profile/.test(line)) return 'profile';
  if (/Sys \[Warning\]/.test(line)) return 'warning';
  if (/Sys \[Error\]/.test(line)) return 'error';
  if (/Script \[Info\]: \w+/.test(line)) return 'script';
  return null;
}

export class LogWatcher extends EventEmitter {
  private path: string | null = null;
  private offset = 0;
  private interval: NodeJS.Timeout | null = null;
  private buffer: LogEvent[] = [];

  setPath(p: string) {
    if (this.path === p) return;
    this.stop();
    this.path = p;
    this.offset = 0;
    this.buffer = [];
    if (p && fs.existsSync(p)) {
      try {
        this.offset = fs.statSync(p).size;
      } catch {
        this.offset = 0;
      }
      this.start();
    }
  }

  recent(): LogEvent[] {
    return [...this.buffer];
  }

  private start() {
    if (this.interval) return;
    this.interval = setInterval(() => this.tick(), 1500);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private tick() {
    if (!this.path) return;
    fs.stat(this.path, (err, stat) => {
      if (err) return;
      if (stat.size < this.offset) {
        this.offset = 0;
        this.buffer = [];
      }
      if (stat.size === this.offset) return;
      const stream = fs.createReadStream(this.path!, {
        start: this.offset,
        end: stat.size,
        encoding: 'utf8',
      });
      let chunk = '';
      stream.on('data', (d) => (chunk += d));
      stream.on('end', () => {
        this.offset = stat.size;
        for (const raw of chunk.split(/\r?\n/)) {
          const line = raw.trim();
          if (!line) continue;
          const category = categorize(line);
          if (!category) continue;
          const event: LogEvent = { ts: Date.now(), category, message: line.slice(0, 400) };
          this.buffer.push(event);
          if (this.buffer.length > MAX_BUFFER) this.buffer.shift();
          this.emit('event', event);
        }
      });
    });
  }
}

export function attachLogWatcher(window: BrowserWindow, watcher: LogWatcher) {
  watcher.on('event', (event: LogEvent) => {
    if (!window.isDestroyed()) window.webContents.send(IPC.log.event, event);
  });
}

export function defaultEeLogPath(): string {
  const local = process.env.LOCALAPPDATA;
  if (!local) return '';
  return path.join(local, 'Warframe', 'EE.log');
}
