import { useEffect, useState } from 'react';
import { FileSearch, Pause, Play, Trash2 } from 'lucide-react';
import { Empty } from '@/components/Empty';
import { cn } from '@/lib/utils';
import type { LogEvent } from '@shared/types';

const CATEGORY_COLOR: Record<string, string> = {
  'login': 'text-accent',
  'challenge': 'text-good',
  'mission-end': 'text-warn',
  'host-migration': 'text-bad',
  'inventory': 'text-accent-2',
  'warning': 'text-warn',
  'error': 'text-bad',
  'script': 'text-fg-mute',
  'startup': 'text-fg-mute',
  'profile': 'text-fg-mute',
  'meta': 'text-fg-dim',
  'tutorial': 'text-fg-dim',
  'equinox': 'text-accent-2',
};

export function LogFeedScreen() {
  const [events, setEvents] = useState<LogEvent[]>([]);
  const [paused, setPaused] = useState(false);
  const [path, setPath] = useState<string>('');

  useEffect(() => {
    window.praedos.log.recent().then(setEvents);
    window.praedos.settings.get().then((s) => setPath(s.eeLogPath));
    const off = window.praedos.log.onEvent((e) => {
      if (paused) return;
      setEvents((prev) => [...prev.slice(-499), e]);
    });
    return () => off();
  }, [paused]);

  async function pick() {
    const p = await window.praedos.log.pickFile();
    if (p) setPath(p);
  }

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="surface px-3 py-2 flex flex-wrap items-center gap-3">
        <FileSearch size={14} className="text-fg-mute" />
        <span className="text-xs text-fg-mute font-mono truncate flex-1">
          {path || 'No log file selected'}
        </span>
        <button onClick={pick} className="chip hover:text-accent transition-colors">Change</button>
        <button
          onClick={() => setPaused((p) => !p)}
          className={cn('chip transition-colors', paused ? 'text-warn' : 'text-good')}
        >
          {paused ? <><Play size={11} /> resume</> : <><Pause size={11} /> pause</>}
        </button>
        <button onClick={() => setEvents([])} className="chip hover:text-bad transition-colors">
          <Trash2 size={11} /> clear
        </button>
      </div>

      <div className="surface flex-1 overflow-auto font-mono text-xs">
        {events.length === 0 ? (
          <Empty
            title="Waiting for game events"
            hint="Launch Warframe — Praedos will tail EE.log for live events."
            icon={<FileSearch size={28} />}
          />
        ) : (
          <ul className="divide-y divide-border/40">
            {events.slice().reverse().map((e, i) => (
              <li key={`${e.ts}-${i}`} className="px-3 py-1.5 flex gap-3 items-baseline">
                <span className="text-fg-dim w-20 shrink-0">
                  {new Date(e.ts).toLocaleTimeString([], { hour12: false })}
                </span>
                <span className={cn('w-24 shrink-0 uppercase tracking-wider text-[10px]', CATEGORY_COLOR[e.category] ?? 'text-fg-mute')}>
                  {e.category}
                </span>
                <span className="text-fg flex-1 break-all">{e.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
