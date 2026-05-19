import { cn } from '@/lib/utils';
import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('surface relative overflow-hidden', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  icon,
  meta,
  className,
}: {
  title: string;
  icon?: ReactNode;
  meta?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-b border-border', className)}>
      <div className="flex items-center gap-2 text-fg-mute">
        {icon}
        <h3 className="text-[11px] font-semibold tracking-[0.18em] uppercase">{title}</h3>
      </div>
      {meta && <div className="text-[11px] text-fg-dim font-mono">{meta}</div>}
    </div>
  );
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn('p-4', className)}>{children}</div>;
}
