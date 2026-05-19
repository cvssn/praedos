import { Sun, Moon, Cloud, CloudFog, Flame, Snowflake } from 'lucide-react';
import type { CycleState } from '@shared/types';
import { Card, CardBody, CardHeader } from './Card';
import { msToCountdown, expiryToMs } from '@/lib/format';
import { useNow } from '@/hooks/useNow';

type Cfg = {
  label: string;
  states: Record<string, { label: string; icon: React.ReactNode; tint: string }>;
};

const CYCLE_CFG: Record<string, Cfg> = {
  cetus: {
    label: 'Cetus / Plains',
    states: {
      day: { label: 'Day', icon: <Sun size={14} />, tint: 'text-warn' },
      night: { label: 'Night', icon: <Moon size={14} />, tint: 'text-accent-2' },
    },
  },
  vallis: {
    label: 'Orb Vallis',
    states: {
      warm: { label: 'Warm', icon: <Sun size={14} />, tint: 'text-warn' },
      cold: { label: 'Cold', icon: <Snowflake size={14} />, tint: 'text-accent' },
    },
  },
  cambion: {
    label: 'Cambion Drift',
    states: {
      fass: { label: 'Fass', icon: <Flame size={14} />, tint: 'text-warn' },
      vome: { label: 'Vome', icon: <Cloud size={14} />, tint: 'text-accent-2' },
    },
  },
  zariman: {
    label: 'Zariman',
    states: {
      grineer: { label: 'Grineer', icon: <Flame size={14} />, tint: 'text-bad' },
      corpus: { label: 'Corpus', icon: <Cloud size={14} />, tint: 'text-accent' },
    },
  },
  earth: {
    label: 'Earth',
    states: {
      day: { label: 'Day', icon: <Sun size={14} />, tint: 'text-warn' },
      night: { label: 'Night', icon: <Moon size={14} />, tint: 'text-accent-2' },
    },
  },
  duviri: {
    label: 'Duviri',
    states: {
      joy: { label: 'Joy', icon: <Sun size={14} />, tint: 'text-warn' },
      anger: { label: 'Anger', icon: <Flame size={14} />, tint: 'text-bad' },
      envy: { label: 'Envy', icon: <Cloud size={14} />, tint: 'text-good' },
      sorrow: { label: 'Sorrow', icon: <CloudFog size={14} />, tint: 'text-accent-2' },
      fear: { label: 'Fear', icon: <Moon size={14} />, tint: 'text-fg-mute' },
    },
  },
};

export function CycleCard({ id, cycle }: { id: keyof typeof CYCLE_CFG; cycle?: CycleState }) {
  useNow(1000);
  const cfg = CYCLE_CFG[id];
  if (!cycle) {
    return (
      <Card>
        <CardHeader title={cfg.label} />
        <CardBody className="text-fg-dim text-sm">No data</CardBody>
      </Card>
    );
  }
  const stateKey = (cycle.state || '').toLowerCase();
  const meta = cfg.states[stateKey] ?? {
    label: cycle.state,
    icon: <Cloud size={14} />,
    tint: 'text-fg',
  };
  const ms = expiryToMs(cycle.expiry);

  return (
    <Card className="hover:border-border-bright transition-colors">
      <CardHeader title={cfg.label} icon={meta.icon} />
      <CardBody className="flex items-baseline justify-between">
        <div>
          <div className={`stat-num text-2xl ${meta.tint}`}>{meta.label}</div>
          <div className="text-[11px] text-fg-dim mt-1">switches in</div>
        </div>
        <div className="stat-num text-xl text-fg">{msToCountdown(ms)}</div>
      </CardBody>
    </Card>
  );
}
