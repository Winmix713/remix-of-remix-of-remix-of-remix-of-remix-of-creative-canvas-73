import { ChevronDown, ShieldCheck, TriangleAlert } from 'lucide-react';
import type { StrategyReadout } from '../../../utils/slip';
import { cn } from '../../../lib/utils';

export interface GateDot {
  label: string;
  tone: 'positive' | 'warning' | 'negative' | 'neutral';
}

interface CoreStatusStripProps {
  readout: StrategyReadout | null;
  /** Number of fixtures carrying a shadow blowout-profile warning. */
  warningCount: number;
  /** Stability values of every ranked pattern — drives the mini histogram. */
  stabilities: number[];
  open: boolean;
  onToggle: () => void;
}

const DOT_CLASS: Record<GateDot['tone'], string> = {
  positive: 'bg-emerald-400',
  warning: 'bg-amber-400',
  negative: 'bg-red-400',
  neutral: 'bg-neutral-600'
};

/** Six equal-width buckets of the 0–1 stability range. */
function histogram(values: number[]): number[] {
  const buckets = [0, 0, 0, 0, 0, 0];
  values.forEach((v) => {
    const i = Math.min(5, Math.max(0, Math.floor(v * 6)));
    buckets[i] += 1;
  });
  return buckets;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * One-line Core status. Replaces the seven equal-weight diagnostic panels that
 * used to sit between the round and the fixture list: strategy, gate dots,
 * candidate counts and a stability sparkline, with everything else one click
 * away inside the diagnostics panel.
 */
export function CoreStatusStrip({
  readout,
  warningCount,
  stabilities,
  open,
  onToggle
}: CoreStatusStripProps) {
  const dots: GateDot[] = readout
    ? [
        {
          label: `Kalibrált jelölt: ${readout.totalCalibratedCandidates}`,
          tone: readout.totalCalibratedCandidates > 0 ? 'positive' : 'neutral'
        },
        {
          label: `Feltételes jelölt: ${readout.totalConditionalCandidates}`,
          tone: readout.totalConditionalCandidates > 0 ? 'warning' : 'neutral'
        },
        {
          label: `Kizárt jelölt: ${readout.totalExcludedCandidates}`,
          tone: readout.totalExcludedCandidates > 0 ? 'negative' : 'neutral'
        },
        {
          label: `Minőségi kapun átment: ${readout.qualityPassedCandidates}`,
          tone: readout.qualityPassedCandidates > 0 ? 'positive' : 'negative'
        }
      ]
    : [];

  const bars = histogram(stabilities);
  const peak = Math.max(1, ...bars);
  const med = median(stabilities);

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className={cn(
        'flex w-full min-w-0 flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border px-3.5 py-2.5 text-left transition-colors',
        'border-white/[0.07] bg-white/[0.015] hover:bg-white/[0.035]'
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <ShieldCheck className="h-4 w-4 shrink-0 text-blue-400" aria-hidden={true} />
        <span className="truncate text-ui-xs font-medium text-foreground">
          {readout?.label ?? 'Core stratégia — még nincs futás'}
        </span>
      </span>

      {dots.length > 0 ? (
        <span className="flex shrink-0 items-center gap-1.5">
          {dots.map((dot) => (
            <span
              key={dot.label}
              title={dot.label}
              className={cn('h-2 w-2 rounded-full', DOT_CLASS[dot.tone])}
            />
          ))}
        </span>
      ) : null}

      {readout ? (
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-neutral-500">
          {readout.totalCandidates} vizsgált jelölt · {readout.analysedFixtures} mérkőzés
        </span>
      ) : null}

      {stabilities.length > 0 ? (
        <span className="flex shrink-0 items-end gap-0.5" title="Stabilitás-eloszlás">
          {bars.map((count, i) => (
            <span
              key={i}
              className="w-1 rounded-sm bg-blue-500/50"
              style={{ height: `${4 + (count / peak) * 14}px` }}
            />
          ))}
          <span className="ml-1.5 font-mono text-[10px] tabular-nums text-neutral-500">
            {stabilities.length} minta{med !== null ? ` · medián ${med.toFixed(2)}` : ''}
          </span>
        </span>
      ) : null}

      {warningCount > 0 ? (
        <span className="flex shrink-0 items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-amber-400">
          <TriangleAlert className="h-3 w-3" aria-hidden={true} />
          {warningCount} profil-figyelmeztetés
        </span>
      ) : null}

      <span className="ml-auto flex shrink-0 items-center gap-1 font-mono text-[10px] uppercase tracking-wide text-neutral-500">
        {open ? 'Részletek elrejtése' : 'Részletek'}
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')}
          aria-hidden={true}
        />
      </span>
    </button>
  );
}
