import { ChevronRight, TriangleAlert } from 'lucide-react';
import { LEAGUE_FLAG } from '../../../data/leagues';
import { cn } from '../../../lib/utils';
import type { FixtureAnalysis } from '../../../types/winmix';

export interface FixtureRowMeta {
  /** True when this fixture supplied at least one Core candidate. */
  coreCandidate: boolean;
  /** True when the pair carries a shadow blowout-profile warning. */
  warning: boolean;
}

interface FixtureRowListProps {
  analyses: FixtureAnalysis[];
  meta: Record<string, FixtureRowMeta>;
  onOpen: (analysis: FixtureAnalysis) => void;
}

/**
 * Dense fixture rows instead of eight full cards: pairing, top pattern,
 * stability and status in one line, with the full card content moved into a
 * side drawer.
 */
export function FixtureRowList({ analyses, meta, onOpen }: FixtureRowListProps) {
  if (analyses.length === 0) {
    return (
      <p className="rounded-xl border border-white/[0.06] bg-white/[0.012] px-4 py-6 text-center text-ui-xs text-muted-foreground">
        Nincs a szűrőnek megfelelő mérkőzés.
      </p>
    );
  }

  return (
    <ul className="min-w-0 divide-y divide-white/[0.05] overflow-hidden rounded-xl border border-white/[0.08] bg-[#0a0a0a]">
      {analyses.map((analysis) => {
        const top = analysis.patterns[0];
        const rowMeta = meta[analysis.fixtureId];
        return (
          <li key={analysis.fixtureId} className="min-w-0">
            <button
              type="button"
              onClick={() => onOpen(analysis)}
              className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3.5 py-3 text-left transition-colors hover:bg-white/[0.03] sm:px-4"
            >
              <span className="flex min-w-0 flex-col gap-1">
                <span className="flex min-w-0 items-center gap-2">
                  <span aria-hidden={true}>{LEAGUE_FLAG[analysis.league]}</span>
                  <span className="truncate text-ui-xs font-medium text-foreground">
                    {analysis.label}
                  </span>
                  {rowMeta?.warning ? (
                    <TriangleAlert
                      className="h-3.5 w-3.5 shrink-0 text-amber-400"
                      aria-label="Egyoldalú kiütés-profil"
                    />
                  ) : null}
                </span>
                <span className="truncate font-mono text-[10px] uppercase tracking-wide text-neutral-500">
                  {top ? top.label : 'nincs minta'} · {analysis.patterns.length} minta
                </span>
              </span>

              <span className="flex shrink-0 items-center gap-2.5">
                {rowMeta?.coreCandidate ? (
                  <span className="hidden rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-blue-400 sm:inline">
                    core
                  </span>
                ) : null}
                <span
                  className={cn(
                    'font-mono text-[13px] font-semibold tabular-nums',
                    top && top.stability >= 70
                      ? 'text-emerald-400'
                      : top && top.stability >= 50
                        ? 'text-amber-400'
                        : 'text-neutral-400'
                  )}
                >
                  {top ? top.stability : '—'}
                </span>
                <ChevronRight className="h-4 w-4 text-neutral-600" aria-hidden={true} />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
