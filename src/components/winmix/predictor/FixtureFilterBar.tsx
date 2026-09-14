import { ArrowDownUp, Filter } from 'lucide-react';
import { cn } from '../../../lib/utils';

export type FixtureSortKey = 'stability' | 'probability';

interface FixtureFilterBarProps {
  onlyCore: boolean;
  onOnlyCoreChange: (value: boolean) => void;
  onlyWarnings: boolean;
  onOnlyWarningsChange: (value: boolean) => void;
  sortBy: FixtureSortKey;
  onSortChange: (value: FixtureSortKey) => void;
  resultCount: number;
}

/**
 * Compact filter/sort bar above the fixture row list. Two toggle filters and
 * a sort switch — all state is lifted so the parent can combine it with the
 * expert/simple mode and the active step.
 */
export function FixtureFilterBar({
  onlyCore,
  onOnlyCoreChange,
  onlyWarnings,
  onOnlyWarningsChange,
  sortBy,
  onSortChange,
  resultCount
}: FixtureFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-white/[0.012] px-2.5 py-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 px-1 font-mono text-[10px] uppercase tracking-wide text-neutral-500">
          <Filter className="h-3.5 w-3.5" aria-hidden={true} />
          Szűrők
        </span>

        <button
          type="button"
          aria-pressed={onlyCore}
          onClick={() => onOnlyCoreChange(!onlyCore)}
          className={cn(
            'rounded-lg px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors',
            onlyCore
              ? 'bg-blue-500/10 text-blue-400'
              : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300'
          )}
        >
          Csak core-jelöltek
        </button>

        <button
          type="button"
          aria-pressed={onlyWarnings}
          onClick={() => onOnlyWarningsChange(!onlyWarnings)}
          className={cn(
            'rounded-lg px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors',
            onlyWarnings
              ? 'bg-amber-500/10 text-amber-400'
              : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300'
          )}
        >
          Csak figyelmeztetéssel
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wide text-neutral-500">
          <ArrowDownUp className="h-3.5 w-3.5" aria-hidden={true} />
          Rendezés
        </span>

        {[
          { key: 'stability' as FixtureSortKey, label: 'Stabilitás' },
          { key: 'probability' as FixtureSortKey, label: 'Valószínűség' }
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            aria-pressed={sortBy === option.key}
            onClick={() => onSortChange(option.key)}
            className={cn(
              'rounded-lg px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors',
              sortBy === option.key
                ? 'bg-white/[0.06] text-neutral-100'
                : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300'
            )}
          >
            {option.label}
          </button>
        ))}

        <span className="ml-1 font-mono text-[10px] tabular-nums text-neutral-600">
          {resultCount} mérkőzés
        </span>
      </div>
    </div>
  );
}
