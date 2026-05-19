import { Minus, Square, X, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWorldstate } from '@/hooks/useWorldstate';

export function TitleBar() {
  const [maximized, setMaximized] = useState(false);
  const { data, isFetching, isError } = useWorldstate();

  useEffect(() => {
    let mounted = true;
    const poll = setInterval(async () => {
      const m = await window.praedos.window.isMaximized();
      if (mounted) setMaximized(m);
    }, 500);
    return () => {
      mounted = false;
      clearInterval(poll);
    };
  }, []);

  const status = isError ? 'bad' : isFetching ? 'warn' : data ? '' : 'warn';
  const statusText = isError ? 'offline' : isFetching ? 'syncing' : data ? 'live' : 'idle';

  return (
    <header className="drag relative h-10 select-none flex items-center justify-between px-3 border-b border-border bg-bg-1/60 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-accent" />
          <span className="font-display font-semibold tracking-[0.2em] text-sm text-fg">
            PRAEDOS
          </span>
          <span className="text-[10px] text-fg-dim font-mono">v1.0</span>
        </div>
        <div className="chip no-drag">
          <span className={`live-dot ${status}`} />
          {statusText}
        </div>
      </div>
      <div className="no-drag flex items-center">
        <WindowButton onClick={() => window.praedos.window.minimize()}>
          <Minus size={14} />
        </WindowButton>
        <WindowButton onClick={() => window.praedos.window.maximize()}>
          <Square size={12} />
        </WindowButton>
        <WindowButton onClick={() => window.praedos.window.close()} danger>
          <X size={14} />
        </WindowButton>
      </div>
    </header>
  );
}

function WindowButton({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={
        'h-10 w-12 flex items-center justify-center text-fg-mute transition-colors ' +
        (danger ? 'hover:bg-bad/80 hover:text-white' : 'hover:bg-bg-3 hover:text-fg')
      }
    >
      {children}
    </button>
  );
}
