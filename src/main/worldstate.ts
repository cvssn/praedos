import type { Platform, Worldstate } from '@shared/types';

const BASE = 'https://api.warframestat.us';

async function fetchOnce(platform: Platform): Promise<Worldstate> {
  const res = await fetch(`${BASE}/${platform}?language=en`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Worldstate fetch failed: ${res.status}`);
  const text = await res.text();
  if (!text) throw new Error('Worldstate fetch returned empty body');
  try {
    return JSON.parse(text) as Worldstate;
  } catch (e) {
    throw new Error(`Worldstate JSON parse failed: ${(e as Error).message}`);
  }
}

export async function fetchWorldstate(platform: Platform = 'pc'): Promise<Worldstate> {
  try {
    return await fetchOnce(platform);
  } catch {
    await new Promise((r) => setTimeout(r, 750));
    return fetchOnce(platform);
  }
}
