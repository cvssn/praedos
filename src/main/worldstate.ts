import type { Platform, Worldstate } from '@shared/types';

const BASE = 'https://api.warframestat.us';

export async function fetchWorldstate(platform: Platform = 'pc'): Promise<Worldstate> {
  const res = await fetch(`${BASE}/${platform}?language=en`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Worldstate fetch failed: ${res.status}`);
  return (await res.json()) as Worldstate;
}
