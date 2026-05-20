import type { StarChartNode } from '@shared/types';
import { damageFor } from '@shared/damageTips';

const SOL_NODES_URL = 'https://api.warframestat.us/solNodes?language=en';
const EXPORT_REGIONS_URL =
  'https://raw.githubusercontent.com/calamity-inc/warframe-public-export-plus/HEAD/ExportRegions.json';
const TTL_MS = 24 * 60 * 60 * 1000;

const FACTION_MAP: Record<string, string> = {
  FC_GRINEER: 'Grineer',
  FC_CORPUS: 'Corpus',
  FC_INFESTATION: 'Infested',
  FC_OROKIN: 'Corrupted',
  FC_SENTIENT: 'Sentient',
  FC_NARMER: 'Narmer',
  FC_CRESCENT: 'Murmur',
  FC_TENNO: 'Tenno',
  FC_CROSSFIRE: 'Crossfire',
};

interface SolNodeEntry {
  value?: string;
  enemy?: string;
  type?: string;
}

interface RegionEntry {
  minEnemyLevel?: number;
  maxEnemyLevel?: number;
  faction?: string;
  missionType?: string;
}

interface Cache {
  nodes: StarChartNode[];
  byDisplayName: Map<string, StarChartNode>;
  fetchedAt: number;
}

let cache: Cache | null = null;
let inFlight: Promise<Cache> | null = null;

function parsePlanet(displayName: string): { node: string; planet: string } {
  const m = displayName.match(/^(.+?)\s*\((.+)\)\s*$/);
  if (!m) return { node: displayName, planet: '' };
  return { node: m[1].trim(), planet: m[2].trim() };
}

async function build(): Promise<Cache> {
  const [solRes, regRes] = await Promise.all([
    fetch(SOL_NODES_URL, { headers: { Accept: 'application/json' } }),
    fetch(EXPORT_REGIONS_URL, { headers: { Accept: 'application/json' } }),
  ]);
  if (!solRes.ok) throw new Error(`solNodes ${solRes.status}`);
  if (!regRes.ok) throw new Error(`regions ${regRes.status}`);
  const solNodes = (await solRes.json()) as Record<string, SolNodeEntry>;
  const regions = (await regRes.json()) as Record<string, RegionEntry>;

  const nodes: StarChartNode[] = [];
  const byDisplayName = new Map<string, StarChartNode>();

  for (const [key, sol] of Object.entries(solNodes)) {
    const name = sol?.value;
    if (!name) continue;
    const reg = regions[key];
    if (!reg) continue;
    const min = reg.minEnemyLevel;
    const max = reg.maxEnemyLevel;
    if (typeof min !== 'number' || typeof max !== 'number') continue;

    const faction = (reg.faction && FACTION_MAP[reg.faction]) || sol.enemy || 'Unknown';
    const missionType = sol.type ?? '';
    const { planet } = parsePlanet(name);
    if (!planet) continue;

    const node: StarChartNode = {
      key,
      name,
      planet,
      missionType,
      faction,
      enemyLevels: [min, max],
      suggestedDamage: damageFor(faction),
    };
    nodes.push(node);
    byDisplayName.set(name, node);
  }

  nodes.sort((a, b) => a.planet.localeCompare(b.planet) || a.enemyLevels[0] - b.enemyLevels[0]);
  return { nodes, byDisplayName, fetchedAt: Date.now() };
}

async function ensure(): Promise<Cache> {
  if (cache && Date.now() - cache.fetchedAt < TTL_MS) return cache;
  if (inFlight) return inFlight;
  inFlight = build()
    .then((c) => {
      cache = c;
      return c;
    })
    .catch((err) => {
      console.error('[starChart] build failed', err);
      if (cache) return cache;
      throw err;
    })
    .finally(() => {
      inFlight = null;
    });
  return inFlight;
}

export async function listStarChart(): Promise<StarChartNode[]> {
  try {
    const c = await ensure();
    return c.nodes;
  } catch {
    return [];
  }
}

export async function findStarChartByName(name: string): Promise<StarChartNode | undefined> {
  try {
    const c = await ensure();
    return c.byDisplayName.get(name);
  } catch {
    return undefined;
  }
}
