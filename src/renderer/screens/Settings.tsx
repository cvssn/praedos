import { useEffect, useState } from 'react';
import { FolderSearch, RefreshCw, Palette, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { applyTheme } from '@/lib/theme';
import { THEMES } from '@shared/themes';
import type { AppSettings, Platform } from '@shared/types';
import { useQueryClient } from '@tanstack/react-query';

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'pc', label: 'PC' },
  { id: 'ps4', label: 'PlayStation' },
  { id: 'xb1', label: 'Xbox' },
  { id: 'swi', label: 'Switch' },
];

export function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    window.praedos.settings.get().then(setSettings);
  }, []);

  async function update(patch: Partial<AppSettings>) {
    const next = await window.praedos.settings.set(patch);
    setSettings(next);
    if (patch.theme) applyTheme(patch.theme);
    qc.invalidateQueries({ queryKey: ['worldstate'] });
  }

  if (!settings) return <div className="text-fg-mute text-sm">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Section title="Platform">
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map((p) => (
            <button
              key={p.id}
              onClick={() => update({ platform: p.id })}
              className={cn(
                'px-3 py-1.5 rounded-md text-sm border transition-colors',
                settings.platform === p.id
                  ? 'bg-accent/15 border-accent/40 text-accent'
                  : 'border-border bg-bg-2 text-fg-mute hover:border-border-bright hover:text-fg',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Theme">
        <div className="flex items-center gap-2 mb-2 text-xs text-fg-mute">
          <Palette size={13} />
          <span>Warframe-inspired color schemes</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {THEMES.map((t) => {
            const active = settings.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => update({ theme: t.id })}
                className={cn(
                  'group relative rounded-lg border p-2 text-left transition-all overflow-hidden',
                  active
                    ? 'border-accent/60 shadow-[0_0_0_1px_var(--color-accent)]'
                    : 'border-border hover:border-border-bright',
                )}
                style={{ background: t.colors.bg1 }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span
                    className="w-3 h-3 rounded-full border border-black/40"
                    style={{ background: t.colors.accent }}
                  />
                  <span
                    className="w-3 h-3 rounded-full border border-black/40"
                    style={{ background: t.colors.accent2 }}
                  />
                  <span
                    className="w-3 h-3 rounded-full border border-black/40"
                    style={{ background: t.colors.bg3 }}
                  />
                  {active && <Check size={12} className="ml-auto" style={{ color: t.colors.accent }} />}
                </div>
                <div className="text-sm font-medium" style={{ color: t.colors.fg }}>
                  {t.name}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: t.colors.fgMute }}>
                  {t.description}
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="EE.log path">
        <div className="surface px-3 py-2 flex items-center gap-2">
          <FolderSearch size={14} className="text-fg-dim" />
          <span className="font-mono text-xs text-fg-mute truncate flex-1">{settings.eeLogPath || '— not set —'}</span>
          <button
            onClick={async () => {
              const p = await window.praedos.log.pickFile();
              if (p) setSettings({ ...settings, eeLogPath: p });
            }}
            className="chip hover:text-accent transition-colors"
          >
            Browse
          </button>
        </div>
        <p className="text-xs text-fg-dim mt-2">
          Default: <span className="font-mono">%LOCALAPPDATA%\Warframe\EE.log</span>
        </p>
      </Section>

      <Section title="Refresh">
        <div className="flex items-center gap-3">
          <RefreshCw size={14} className="text-fg-dim" />
          <input
            type="number"
            min={15}
            max={600}
            value={settings.refreshIntervalSec}
            onChange={(e) => update({ refreshIntervalSec: Math.max(15, Number(e.target.value) || 60) })}
            className="surface-2 px-3 py-1.5 w-28 outline-none text-sm font-mono text-fg"
          />
          <span className="text-xs text-fg-mute">seconds between world-state polls</span>
        </div>
      </Section>

      <Section title="Behavior">
        <Toggle
          label="Start minimized to tray"
          checked={settings.startMinimized}
          onChange={(v) => update({ startMinimized: v })}
        />
        <Toggle
          label="Close to tray (X hides instead of quitting)"
          checked={settings.closeToTray}
          onChange={(v) => update({ closeToTray: v })}
        />
        <Toggle
          label="Notify on rare fissure"
          checked={settings.notifyOnFissure}
          onChange={(v) => update({ notifyOnFissure: v })}
        />
        <Toggle
          label="Notify on arbitration"
          checked={settings.notifyOnArbitration}
          onChange={(v) => update({ notifyOnArbitration: v })}
        />
      </Section>

      <div className="text-xs text-fg-dim">
        Data: <a className="text-accent hover:underline cursor-pointer" onClick={() => window.praedos.shell.openExternal('https://docs.warframestat.us')}>warframestat.us</a>
        {' · '}
        <a className="text-accent hover:underline cursor-pointer" onClick={() => window.praedos.shell.openExternal('https://warframe.market')}>warframe.market</a>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="surface px-4 py-3 space-y-3">
      <h3 className="font-display text-[11px] tracking-[0.25em] uppercase text-fg-mute">{title}</h3>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm text-fg">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          'w-10 h-6 rounded-full relative transition-colors',
          checked ? 'bg-accent' : 'bg-bg-3',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform',
            checked && 'translate-x-4',
          )}
        />
      </button>
    </label>
  );
}
