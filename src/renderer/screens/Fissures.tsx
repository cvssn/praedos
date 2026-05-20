import { useMemo, useState } from 'react';
import { useWorldstate } from '@/hooks/useWorldstate';
import { Empty } from '@/components/Empty';
import { Orbit, Zap, Star } from 'lucide-react';
import { msToCountdown, expiryToMs } from '@/lib/format';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/utils';

const TIERS = ['Lith', 'Meso', 'Neo', 'Axi', 'Requiem', 'Omnia'] as const;
type TierKey = (typeof TIERS)[number];

export function FissuresScreen() {
  const { data } = useWorldstate();
  useNow(1000);
  const [tierFilter, setTierFilter] = useState<TierKey | 'All'>('All');
  const [steelOnly, setSteelOnly] = useState(false);
  const [stormOnly, setStormOnly] = useState(false);

  const fissures = useMemo(() => {
    if (!data) return [];
    return data.fissures
      .filter((f) => !f.expired)
      .filter((f) => (tierFilter === 'All' ? true : f.tier === tierFilter))
      .filter((f) => (steelOnly ? f.isHard : true))
      .filter((f) => (stormOnly ? f.isStorm : true))
      .sort((a, b) => a.tierNum - b.tierNum);
  }, [data, tierFilter, steelOnly, stormOnly]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill active={tierFilter === 'All'} onClick={() => setTierFilter('All')}>All</FilterPill>
        {TIERS.map((t) => (
          <FilterPill key={t} active={tierFilter === t} onClick={() => setTierFilter(t)} tier={t}>{t}</FilterPill>
        ))}
        <div className="w-px h-5 bg-border-bright mx-1" />
        <FilterPill active={steelOnly} onClick={() => setSteelOnly((v) => !v)} icon={<Star size={12} />}>Steel Path</FilterPill>
        <FilterPill active={stormOnly} onClick={() => setStormOnly((v) => !v)} icon={<Zap size={12} />}>Void Storm</FilterPill>
      </div>

      {fissures.length === 0 ? (
        <Empty title="No fissures match" hint="Adjust filters or wait a moment." icon={<Orbit size={28} />} />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {fissures.map((f) => {
            const levels =
              Array.isArray(f.enemyLevels) && f.enemyLevels.length >= 2
                ? `(${f.enemyLevels[0]}-${f.enemyLevels[1]})`
                : null;
            return (
              <li
                key={f.id}
                className={cn(
                  'surface-2 px-4 py-3 flex flex-col gap-1 hover:border-border-bright transition-colors',
                  tierBorderClass(f.tier),
                )}
              >
                <div className="text-sm text-fg">
                  <span className="font-medium">{f.missionType}</span>
                  {levels && <span className="text-fg-mute"> {levels}</span>}
                  <span className="text-fg-dim"> — </span>
                  <span className="text-fg-mute">{f.enemy}</span>
                </div>
                <div className={cn('stat-num text-sm font-semibold', tierClass(f.tier))}>
                  {f.tier} fissure
                </div>
                <div className="text-xs text-fg-mute">{f.node}</div>
                <div className="font-mono text-xs text-fg-dim">
                  {msToCountdown(expiryToMs(f.expiry))}
                </div>
                {(f.isHard || f.isStorm) && (
                  <div className="flex gap-2 mt-1">
                    {f.isHard && (
                      <span className="chip text-warn">
                        <Star size={10} /> Steel Path
                      </span>
                    )}
                    {f.isStorm && (
                      <span className="chip text-accent">
                        <Zap size={10} /> Storm
                      </span>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
  icon,
  tier,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  tier?: TierKey;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all',
        active
          ? 'bg-accent/15 border-accent/40 text-accent shadow-[0_0_12px_rgba(0,224,255,0.15)]'
          : 'border-border bg-bg-2 text-fg-mute hover:border-border-bright hover:text-fg',
        tier && active && tierClass(tier),
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function tierClass(tier: string): string {
  switch (tier.toLowerCase()) {
    case 'lith': return 'text-tier-lith';
    case 'meso': return 'text-tier-meso';
    case 'neo': return 'text-tier-neo';
    case 'axi': return 'text-tier-axi';
    case 'requiem': return 'text-tier-requiem';
    case 'omnia': return 'text-tier-omnia';
    default: return 'text-fg';
  }
}

function tierBorderClass(tier: string): string {
  switch (tier.toLowerCase()) {
    case 'lith': return 'border-l-2 border-l-tier-lith/60';
    case 'meso': return 'border-l-2 border-l-tier-meso/60';
    case 'neo': return 'border-l-2 border-l-tier-neo/60';
    case 'axi': return 'border-l-2 border-l-tier-axi/60';
    case 'requiem': return 'border-l-2 border-l-tier-requiem/60';
    case 'omnia': return 'border-l-2 border-l-tier-omnia/60';
    default: return '';
  }
}
