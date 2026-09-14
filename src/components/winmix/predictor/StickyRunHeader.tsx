import { Play, X } from 'lucide-react';
import { cn } from '../../../lib/utils';

interface StickyRunHeaderProps {
  roundName: string;
  ready: number;
  total: number;
  running: boolean;
  stale: boolean;
  canRun: boolean;
  progress: { done: number; total: number } | null;
  onRun: () => void;
  onCancel: () => void;
}

/**
 * Thin always-visible operation row: the round, its completeness, run state and
 * the run button — so starting an analysis never requires scrolling back up.
 */
export function StickyRunHeader({
  roundName,
  ready,
  total,
  running,
  stale,
  canRun,
  progress,
  onRun,
  onCancel
}: StickyRunHeaderProps) {
  return (
    <div className="sticky top-0 z-30 -mx-4 border-b border-white/[0.07] bg-[#0a0a0a]/95 px-4 py-2 backdrop-blur-md">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="truncate text-ui-xs font-medium text-foreground">{roundName}</span>
          <span
            className={cn(
              'shrink-0 font-mono text-[10px] uppercase tracking-wide',
              ready === total && total > 0 ? 'text-emerald-400' : 'text-neutral-500'
            )}
          >
            {ready}/{total} pár kész
          </span>
          {running && progress ? (
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-blue-400">
              fut · {progress.done}/{progress.total}
            </span>
          ) : stale ? (
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-amber-400">
              elavult
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {running ? (
            <button type="button" className="btn btn--danger btn--sm tap" onClick={onCancel}>
              <X className="h-3.5 w-3.5" aria-hidden={true} />
              <span className="hidden sm:inline">Megszakítás</span>
            </button>
          ) : null}
          <button
            type="button"
            className="btn btn--signal btn--sm tap"
            disabled={!canRun || running}
            onClick={onRun}
          >
            <Play className="h-3.5 w-3.5" aria-hidden={true} />
            {running ? 'Elemzés fut…' : 'Forduló elemzése'}
          </button>
        </div>
      </div>
    </div>
  );
}
