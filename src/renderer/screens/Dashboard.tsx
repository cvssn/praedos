import { useWorldstate } from '@/hooks/useWorldstate';
import { CycleCard } from '@/components/CycleCard';
import { Card, CardBody, CardHeader } from '@/components/Card';
import { Empty } from '@/components/Empty';
import { Skull, Crown, Swords, ShoppingBag, Newspaper, Loader2 } from 'lucide-react';
import { msToCountdown, expiryToMs } from '@/lib/format';
import { useNow } from '@/hooks/useNow';
import { useUI } from '@/store/ui';

export function DashboardScreen() {
  const { data, isLoading, isError, refetch } = useWorldstate();
  const setScreen = useUI((s) => s.setScreen);
  useNow(1000);

  if (isLoading) {
    return (
      <Empty
        title="Connecting to Origin System"
        hint="Fetching world state…"
        icon={<Loader2 className="animate-spin text-accent" size={28} />}
      />
    );
  }

  if (isError || !data) {
    return (
      <Empty
        title="Connection lost"
        hint="api.warframestat.us not reachable. Retry?"
        icon={<Skull className="text-bad" size={28} />}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <SectionLabel>Cycles</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <CycleCard id="cetus" cycle={data.cetusCycle} />
          <CycleCard id="vallis" cycle={data.vallisCycle} />
          <CycleCard id="cambion" cycle={data.cambionCycle} />
          <CycleCard id="zariman" cycle={data.zarimanCycle} />
          <CycleCard id="earth" cycle={data.earthCycle} />
          <CycleCard id="duviri" cycle={data.duviriCycle} />
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Card>
          <CardHeader title="Sortie" icon={<Swords size={14} />} meta={data.sortie?.eta && `${msToCountdown(expiryToMs(data.sortie.expiry))}`} />
          <CardBody>
            {data.sortie?.variants?.length ? (
              <>
                <div className="text-fg font-display text-lg leading-tight">{data.sortie.boss}</div>
                <div className="text-xs text-fg-dim mb-3">{data.sortie.faction}</div>
                <ul className="space-y-2">
                  {data.sortie.variants.map((v, i) => (
                    <li key={i} className="surface-2 px-3 py-2 text-sm">
                      <div className="text-fg">{v.missionType} · <span className="text-fg-mute">{v.node}</span></div>
                      <div className="text-xs text-warn mt-0.5">{v.modifier}</div>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="text-fg-dim text-sm">No active sortie</div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Archon Hunt"
            icon={<Crown size={14} />}
            meta={data.archonHunt?.eta && msToCountdown(expiryToMs(data.archonHunt.expiry))}
          />
          <CardBody>
            {data.archonHunt?.missions?.length ? (
              <>
                <div className="text-fg font-display text-lg leading-tight">{data.archonHunt.boss}</div>
                <div className="text-xs text-fg-dim mb-3">{data.archonHunt.faction}</div>
                <ul className="space-y-2">
                  {data.archonHunt.missions.map((m, i) => (
                    <li key={i} className="surface-2 px-3 py-2 text-sm flex justify-between">
                      <span className="text-fg">{m.type}</span>
                      <span className="text-fg-mute">{m.node}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="text-fg-dim text-sm">No active archon hunt</div>
            )}
          </CardBody>
        </Card>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <Card>
          <CardHeader
            title="Void Trader"
            icon={<ShoppingBag size={14} />}
            meta={data.voidTrader && (data.voidTrader.active ? `leaves ${msToCountdown(expiryToMs(data.voidTrader.expiry))}` : `arrives ${msToCountdown(expiryToMs(data.voidTrader.activation))}`)}
          />
          <CardBody>
            {data.voidTrader ? (
              <>
                <div className="text-fg font-display text-lg leading-tight">{data.voidTrader.character}</div>
                <div className="text-xs text-fg-dim">{data.voidTrader.location}</div>
                {data.voidTrader.active && data.voidTrader.inventory?.length > 0 && (
                  <ul className="mt-3 max-h-44 overflow-auto pr-1 text-sm space-y-1">
                    {data.voidTrader.inventory.slice(0, 12).map((it, i) => (
                      <li key={i} className="flex justify-between border-b border-border/40 py-1">
                        <span className="text-fg">{it.item}</span>
                        <span className="text-fg-mute font-mono text-xs">{it.ducats}d · {it.credits.toLocaleString()}cr</span>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <div className="text-fg-dim text-sm">No data</div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Nightwave"
            icon={<Newspaper size={14} />}
            meta={data.nightwave && `S${data.nightwave.season}`}
          />
          <CardBody>
            {data.nightwave?.activeChallenges?.length ? (
              <ul className="max-h-56 overflow-auto pr-1 space-y-2 text-sm">
                {data.nightwave.activeChallenges.map((c) => (
                  <li key={c.id} className="surface-2 px-3 py-2">
                    <div className="flex justify-between items-center">
                      <span className={c.isElite ? 'text-accent-2' : c.isDaily ? 'text-warn' : 'text-fg'}>{c.title}</span>
                      <span className="font-mono text-xs text-fg-mute">{c.reputation}</span>
                    </div>
                    <div className="text-xs text-fg-dim mt-0.5">{c.desc}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-fg-dim text-sm">No active challenges</div>
            )}
          </CardBody>
        </Card>
      </section>

      <section>
        <SectionLabel
          right={
            <button
              onClick={() => setScreen('fissures')}
              className="text-xs text-accent hover:text-fg transition-colors"
            >
              View all →
            </button>
          }
        >
          Active Fissures
        </SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2">
          {data.fissures?.filter((f) => !f.expired).slice(0, 6).map((f) => (
            <div key={f.id} className="surface-2 px-3 py-2 flex justify-between items-center">
              <div>
                <div className="text-sm text-fg">{f.missionType} · <span className="text-fg-mute">{f.node}</span></div>
                <div className="text-[10px] uppercase tracking-widest text-fg-dim">{f.enemy}</div>
              </div>
              <div className="text-right">
                <div className={`stat-num text-sm ${tierClass(f.tier)}`}>{f.tier}{f.isStorm ? ' ⚡' : ''}{f.isHard ? ' ⚝' : ''}</div>
                <div className="text-[10px] font-mono text-fg-dim">{msToCountdown(expiryToMs(f.expiry))}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <button
        onClick={() => refetch()}
        className="mx-auto block text-xs text-fg-dim hover:text-accent transition-colors"
      >
        Force refresh
      </button>
    </div>
  );
}

function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-2">
      <h2 className="font-display text-[11px] tracking-[0.3em] uppercase text-fg-mute">{children}</h2>
      {right}
    </div>
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
