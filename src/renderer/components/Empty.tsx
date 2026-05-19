import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function Empty({
  title,
  hint,
  icon,
  className,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 text-fg-dim', className)}>
      {icon && <div className="mb-3 opacity-60">{icon}</div>}
      <div className="font-display tracking-wide text-fg-mute">{title}</div>
      {hint && <div className="text-xs mt-1 max-w-xs">{hint}</div>}
    </div>
  );
}
