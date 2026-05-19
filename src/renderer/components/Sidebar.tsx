import { LayoutDashboard, Orbit, Coins, ScrollText, ListChecks, Settings, ExternalLink } from 'lucide-react';
import { useUI, type Screen } from '@/store/ui';
import { cn } from '@/lib/utils';

const nav: { id: Screen; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'dashboard', label: 'World State', icon: LayoutDashboard },
  { id: 'fissures', label: 'Fissures', icon: Orbit },
  { id: 'market', label: 'Market', icon: Coins },
  { id: 'logfeed', label: 'Log Feed', icon: ScrollText },
  { id: 'notes', label: 'Notes', icon: ListChecks },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { screen, setScreen } = useUI();

  return (
    <aside className="w-56 shrink-0 border-r border-border bg-bg-1/60 backdrop-blur-md flex flex-col">
      <nav className="flex-1 px-2 py-4 space-y-1">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = item.id === screen;
          return (
            <button
              key={item.id}
              onClick={() => setScreen(item.id)}
              className={cn(
                'group w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                'text-fg-mute hover:text-fg hover:bg-bg-3',
                active && 'bg-bg-3 text-fg shadow-[inset_2px_0_0_var(--color-accent)]',
              )}
            >
              <Icon size={16} />
              <span className="font-medium tracking-wide">{item.label}</span>
              {active && <span className="ml-auto live-dot" />}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border space-y-2 text-[11px] text-fg-dim">
        <button
          className="no-drag w-full flex items-center justify-between hover:text-accent transition-colors"
          onClick={() => window.praedos.shell.openExternal('https://warframe.market')}
        >
          <span>warframe.market</span>
          <ExternalLink size={11} />
        </button>
        <button
          className="no-drag w-full flex items-center justify-between hover:text-accent transition-colors"
          onClick={() => window.praedos.shell.openExternal('https://wiki.warframe.com')}
        >
          <span>wiki.warframe.com</span>
          <ExternalLink size={11} />
        </button>
      </div>
    </aside>
  );
}
