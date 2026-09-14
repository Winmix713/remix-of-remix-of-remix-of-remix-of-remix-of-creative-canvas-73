import React from 'react';
import { cn } from '../../lib/utils';

type MetricTone = 'neutral' | 'signal' | 'positive' | 'negative' | 'warning';

const toneClass: Record<MetricTone, string> = {
  neutral: 'border border-white/[0.08] bg-white/[0.03] text-muted-foreground',
  signal: 'border border-signal/20 bg-signal-soft text-signal',
  positive: 'border border-positive/20 bg-positive-soft text-positive',
  negative: 'border border-negative/20 bg-negative-soft text-negative',
  warning: 'border border-warning/20 bg-warning-soft text-warning'
};

const iconToneClass: Record<MetricTone, string> = {
  neutral: 'border border-white/[0.07] bg-white/[0.025] text-muted-foreground',
  signal: 'border border-signal/20 bg-signal-soft text-signal',
  positive: 'border border-positive/20 bg-positive-soft text-positive',
  negative: 'border border-negative/20 bg-negative-soft text-negative',
  warning: 'border border-warning/20 bg-warning-soft text-warning'
};

const accentBarClass: Record<MetricTone, string> = {
  neutral: 'bg-gradient-to-r from-white/[0.12] to-transparent',
  signal: 'bg-gradient-to-r from-signal to-cyan-400',
  positive: 'bg-gradient-to-r from-positive to-emerald-300',
  negative: 'bg-gradient-to-r from-negative to-orange-400',
  warning: 'bg-gradient-to-r from-warning to-amber-300'
};

interface MetricCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  sub?: React.ReactNode;
  /**
   * The metric's error bar. Every skill / Brier / LogLoss / ECE figure on the
   * surface must supply one — a point estimate on a 240-match season without an
   * interval is exactly the false confidence this build exists to remove.
   */
  interval?: React.ReactNode;
  /** Optional lucide icon shown top-right, mirroring the KPI card spec. */
  icon?: React.ComponentType<any>;
  /** Colour of the `sub` pill. */
  tone?: MetricTone;
  valueClassName?: string;
  subClassName?: string;
  intervalClassName?: string;
}

/**
 * KPI card: quiet sheen surface, small secondary label, one large tracked
 * figure, and a tonal pill for the delta / context line.
 */
export function MetricCard({
  label,
  value,
  sub,
  interval,
  icon: Icon,
  tone = 'neutral',
  valueClassName,
  subClassName,
  intervalClassName
}: MetricCardProps) {
  return (
    <div className="cq relative flex min-h-[104px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#101010] to-[#090909] p-4 shadow-panel sm:p-5">
      <span className={cn('absolute inset-x-0 top-0 h-px', accentBarClass[tone])} aria-hidden="true" />
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-neutral-500">{label}</span>
        {Icon ?
        <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-lg', iconToneClass[tone])}>
          <Icon className="h-[15px] w-[15px]" aria-hidden={true} />
        </span> :
        null}
      </div>
      <div
        className={cn(
          'mt-3 text-data-lg font-semibold tabular-nums text-foreground',
          valueClassName
        )}>
        
        {value}
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 pt-3">
        {sub ?
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide tabular-nums',
            toneClass[tone],
            subClassName
          )}>

          
            {sub}
          </span> :
        null}
        {interval ?
        <span
          className={cn(
            'text-ui-xs tabular-nums text-muted-foreground',
            intervalClassName
          )}>
          
            {interval}
          </span> :
        null}
      </div>
    </div>);

}

export function MetricGrid({
  children,
  cols = 4



}: {children: React.ReactNode;cols?: 3 | 4 | 5;}) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4',
        cols === 3 && 'lg:grid-cols-3',
        cols === 4 && 'lg:grid-cols-3 xl:grid-cols-4',
        cols === 5 && 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
      )}>
      
      {children}
    </div>);

}