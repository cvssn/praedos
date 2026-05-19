import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, ExternalLink, ShieldCheck, Wifi } from 'lucide-react';
import { Empty } from '@/components/Empty';
import { cn } from '@/lib/utils';
import type { MarketItemSummary, MarketOrder } from '@shared/types';

export function MarketScreen() {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [selected, setSelected] = useState<MarketItemSummary | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const search = useQuery({
    queryKey: ['market-search', debounced],
    queryFn: () => window.praedos.market.search(debounced),
    enabled: debounced.length >= 2,
    staleTime: 60_000,
  });

  const orders = useQuery({
    queryKey: ['market-orders', selected?.url_name],
    queryFn: () => window.praedos.market.orders(selected!.url_name),
    enabled: !!selected,
    refetchInterval: 30_000,
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-4 h-full">
      <div className="space-y-3">
        <div className="surface px-3 py-2 flex items-center gap-2">
          <Search size={14} className="text-fg-dim" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items (prime, riven, mod…)"
            className="flex-1 bg-transparent outline-none placeholder:text-fg-dim text-sm"
          />
        </div>

        <div className="surface min-h-[300px] max-h-[calc(100vh-220px)] overflow-auto">
          {debounced.length < 2 ? (
            <Empty title="Search Warframe.Market" hint="Type at least 2 chars." />
          ) : search.isLoading ? (
            <Empty title="Searching" icon={<Loader2 className="animate-spin" size={20} />} />
          ) : search.data && search.data.length > 0 ? (
            <ul className="divide-y divide-border">
              {search.data.map((item) => (
                <li key={item.url_name}>
                  <button
                    onClick={() => setSelected(item)}
                    className={cn(
                      'w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-bg-3 transition-colors',
                      selected?.url_name === item.url_name && 'bg-bg-3',
                    )}
                  >
                    <img
                      src={`https://warframe.market/static/assets/${item.thumb}`}
                      alt=""
                      className="w-8 h-8 object-contain bg-bg-3 rounded"
                      loading="lazy"
                      onError={(e) => ((e.currentTarget as HTMLImageElement).style.visibility = 'hidden')}
                    />
                    <span className="text-sm text-fg flex-1 truncate">{item.item_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="No matches" hint="Try a shorter / different query." />
          )}
        </div>
      </div>

      <OrdersPanel selected={selected} orders={orders.data} loading={orders.isLoading} />
    </div>
  );
}

function OrdersPanel({
  selected,
  orders,
  loading,
}: {
  selected: MarketItemSummary | null;
  orders?: MarketOrder[];
  loading: boolean;
}) {
  const sellInGame = useMemo(
    () => (orders ?? []).filter((o) => o.order_type === 'sell' && o.user.status === 'ingame').slice(0, 8),
    [orders],
  );
  const buyInGame = useMemo(
    () => (orders ?? []).filter((o) => o.order_type === 'buy' && o.user.status === 'ingame').sort((a, b) => b.platinum - a.platinum).slice(0, 8),
    [orders],
  );
  const allSell = useMemo(() => (orders ?? []).filter((o) => o.order_type === 'sell'), [orders]);
  const lowest = allSell[0]?.platinum;
  const median = allSell.length ? allSell[Math.floor(allSell.length / 2)].platinum : null;

  if (!selected) return <Empty title="Select an item" hint="Search and pick an item to see live orders." />;
  if (loading) return <Empty title="Loading orders" icon={<Loader2 className="animate-spin" size={20} />} />;
  if (!orders) return <Empty title="No orders" />;

  return (
    <div className="space-y-3 overflow-auto pr-1">
      <div className="surface px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={`https://warframe.market/static/assets/${selected.thumb}`}
            alt=""
            className="w-12 h-12 object-contain bg-bg-3 rounded"
          />
          <div>
            <div className="font-display text-lg text-fg">{selected.item_name}</div>
            <button
              onClick={() => window.praedos.shell.openExternal(`https://warframe.market/items/${selected.url_name}`)}
              className="text-xs text-accent hover:underline flex items-center gap-1"
            >
              warframe.market <ExternalLink size={11} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-right">
          <Stat label="Lowest sell" value={lowest != null ? `${lowest}p` : '—'} tone="good" />
          <Stat label="Median sell" value={median != null ? `${median}p` : '—'} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <OrderList title="Sellers (in-game)" icon={<Wifi size={14} className="text-good" />} orders={sellInGame} tone="good" />
        <OrderList title="Buyers (in-game)" icon={<ShieldCheck size={14} className="text-accent" />} orders={buyInGame} tone="accent" />
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: 'good' | 'bad' }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-fg-dim">{label}</div>
      <div className={cn('stat-num text-xl', tone === 'good' && 'text-good', tone === 'bad' && 'text-bad')}>{value}</div>
    </div>
  );
}

function OrderList({
  title,
  icon,
  orders,
  tone,
}: {
  title: string;
  icon: React.ReactNode;
  orders: MarketOrder[];
  tone: 'good' | 'accent';
}) {
  return (
    <div className="surface">
      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        {icon}
        <span className="text-[11px] tracking-[0.18em] uppercase text-fg-mute">{title}</span>
      </div>
      <ul className="divide-y divide-border max-h-[420px] overflow-auto">
        {orders.length === 0 ? (
          <li className="px-3 py-6 text-center text-xs text-fg-dim">No active orders</li>
        ) : (
          orders.map((o, i) => (
            <li key={`${o.user.ingame_name}-${i}`} className="px-3 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="live-dot" />
                <span className="text-sm text-fg">{o.user.ingame_name}</span>
              </div>
              <div className="text-right">
                <div className={cn('font-mono text-sm', tone === 'good' ? 'text-good' : 'text-accent')}>
                  {o.platinum}p {o.quantity > 1 && <span className="text-fg-dim text-xs">×{o.quantity}</span>}
                </div>
                <div className="text-[10px] text-fg-dim">rep {o.user.reputation}</div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
