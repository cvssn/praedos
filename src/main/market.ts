import type { MarketItemSummary, MarketOrder } from '@shared/types';

const BASE = 'https://api.warframe.market/v1';

type MarketItemsResponse = {
  payload: {
    items: { url_name: string; item_name: string; thumb: string }[];
  };
};

type MarketOrdersResponse = {
  payload: {
    orders: MarketOrder[];
  };
};

let itemsCache: MarketItemSummary[] | null = null;
let itemsCachedAt = 0;
const ITEM_TTL_MS = 1000 * 60 * 60 * 12;

async function loadAllItems(): Promise<MarketItemSummary[]> {
  if (itemsCache && Date.now() - itemsCachedAt < ITEM_TTL_MS) return itemsCache;
  const res = await fetch(`${BASE}/items`, {
    headers: { Accept: 'application/json', Language: 'en' },
  });
  if (!res.ok) throw new Error(`Market items fetch failed: ${res.status}`);
  const json = (await res.json()) as MarketItemsResponse;
  itemsCache = json.payload.items;
  itemsCachedAt = Date.now();
  return itemsCache;
}

export async function searchItems(query: string): Promise<MarketItemSummary[]> {
  const items = await loadAllItems();
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return items
    .filter((i) => i.item_name.toLowerCase().includes(q))
    .slice(0, 40);
}

export async function fetchOrders(urlName: string): Promise<MarketOrder[]> {
  const res = await fetch(`${BASE}/items/${encodeURIComponent(urlName)}/orders`, {
    headers: { Accept: 'application/json', Platform: 'pc', Language: 'en' },
  });
  if (!res.ok) throw new Error(`Market orders fetch failed: ${res.status}`);
  const json = (await res.json()) as MarketOrdersResponse;
  return json.payload.orders
    .filter((o) => o.visible)
    .sort((a, b) => a.platinum - b.platinum);
}
