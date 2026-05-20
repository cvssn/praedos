import type { Platform, Worldstate } from '@shared/types';
import { listStarChart } from './starChart';

const BASE = 'https://api.warframestat.us';

async function enrichFissures(world: Worldstate): Promise<Worldstate> {
  if (!Array.isArray(world.fissures) || world.fissures.length === 0) return world;
  const nodes = await listStarChart();
  if (nodes.length === 0) return world;
  const byName = new Map(nodes.map((n) => [n.name, n] as const));
  world.fissures = world.fissures.map((f) => {
    const meta = byName.get(f.node);
    if (!meta) return f;
    return {
      ...f,
      enemyLevels: meta.enemyLevels,
      enemy: meta.faction ?? f.enemy,
    };
  });
  return world;
}

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
  let world: Worldstate;
  try {
    world = await fetchOnce(platform);
  } catch {
    await new Promise((r) => setTimeout(r, 750));
    world = await fetchOnce(platform);
  }
  return enrichFissures(world);
}
