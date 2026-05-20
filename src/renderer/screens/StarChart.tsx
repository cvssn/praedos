import { useEffect, useMemo, useState } from 'react';
import { Globe, Search, Skull, Swords } from 'lucide-react';
import { Empty } from '@/components/Empty';
import { cn } from '@/lib/utils';
import type { StarChartNode } from '@shared/types';

const PLANET_ORDER = [
  'Mercury',
  'Venus',
  'Earth',
  'Lua',
  'Mars',
  'Phobos',
  'Deimos',
  'Ceres',
  'Jupiter',
  'Europa',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'Sedna',
  'Eris',
  'Kuva Fortress',
  'Zariman',
  'Void',
  'Höllvania',
  'Albrecht\'s Laboratories',
];

const FACTION_COLOR: Record<string, string> = {
  Grineer: 'text-tier-lith',
  Corpus: 'text-tier-meso',
  Infested: 'text-tier-neo',
  Corrupted: 'text-tier-axi',
  Sentient: 'text-accent-2',
  Narmer: 'text-warn',
  Murmur: 'text-tier-requiem',
  Crossfire: 'text-accent',
  Tenno: 'text-good',
};

export function StarChartScreen() {
  const [nodes, setNodes] = useState<StarChartNode[]>([]);
  const [selectedPlanet, setSelectedPlanet] = useState<string>('Earth');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.praedos.starChart.list().then((data) => {
      setNodes(data);
      setLoading(false);
    });
  }, []);

  const planets = useMemo(() => {
    const present = new Set(nodes.map((n) => n.planet));
    const ordered = PLANET_ORDER.filter((p) => present.has(p));
    for (const p of present) if (!ordered.includes(p)) ordered.push(p);
    return ordered;
  }, [nodes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const planetNodes = nodes.filter((n) => n.planet === selectedPlanet);
    if (!q) return planetNodes;
    return planetNodes.filter(
      (n) =>
        n.name.toLowerCase().includes(q) ||
        n.missionType.toLowerCase().includes(q) ||
        n.faction.toLowerCase().includes(q),
    );
  }, [nodes, selectedPlanet, search]);

  if (loading) {
    return <div className="text-fg-mute text-sm">Loading star chart…</div>;
  }

  if (nodes.length === 0) {
    return (
      <Empty
        title="Star chart unavailable"
        hint="Could not fetch node data. Check network and try again."
        icon={<Globe size={28} />}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {planets.map((p) => (
          <button
            key={p}
            onClick={() => setSelectedPlanet(p)}
            className={cn(
              'chip text-xs transition-colors',
              selectedPlanet === p
                ? 'text-accent border-accent/50 bg-accent/15'
                : 'text-fg-mute hover:text-fg',
            )}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="surface px-3 py-2 flex items-center gap-2">
        <Search size={14} className="text-fg-dim" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search node, mission or faction…"
          className="flex-1 bg-transparent outline-none text-sm placeholder:text-fg-dim"
        />
        <span className="text-xs text-fg-dim">{filtered.length} nodes</span>
      </div>

      {filtered.length === 0 ? (
        <Empty title="No matches" hint="Try another planet or query." icon={<Globe size={24} />} />
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {filtered.map((n) => (
            <li
              key={n.key}
              className="surface-2 px-4 py-3 flex flex-col gap-1.5 hover:border-border-bright transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-display tracking-wide text-fg truncate">{n.name}</div>
                <span className="font-mono text-[11px] text-fg-dim shrink-0">
                  lv {n.enemyLevels[0]}–{n.enemyLevels[1]}
                </span>
              </div>
              <div className="text-xs text-fg-mute flex items-center gap-2">
                <Swords size={11} />
                <span>{n.missionType || '—'}</span>
                <span className="text-fg-dim">·</span>
                <Skull size={11} />
                <span className={cn(FACTION_COLOR[n.faction] ?? 'text-fg-mute')}>{n.faction}</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {n.suggestedDamage.map((d) => (
                  <span
                    key={d}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-bg-1 border border-border text-fg-mute"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
