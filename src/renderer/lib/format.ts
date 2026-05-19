export function msToCountdown(ms: number): string {
  if (ms <= 0) return '00:00';
  const s = Math.floor(ms / 1000);
  const days = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (days > 0) return `${days}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec.toString().padStart(2, '0')}s`;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

export function expiryToMs(expiry: string): number {
  if (!expiry) return 0;
  return new Date(expiry).getTime() - Date.now();
}

export function tierColor(tier: string): string {
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

export function tierBorder(tier: string): string {
  switch (tier.toLowerCase()) {
    case 'lith': return 'border-tier-lith/40';
    case 'meso': return 'border-tier-meso/40';
    case 'neo': return 'border-tier-neo/40';
    case 'axi': return 'border-tier-axi/40';
    case 'requiem': return 'border-tier-requiem/40';
    case 'omnia': return 'border-tier-omnia/40';
    default: return 'border-border';
  }
}
