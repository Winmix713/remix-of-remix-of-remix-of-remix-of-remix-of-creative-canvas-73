import { ChevronUp, Sigma, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import { cn } from '../../../lib/utils';

interface MobileSlipSheetProps {
  combinedProb: number;
  filled: number;
  total: number;
  invalid: boolean;
  children: ReactNode;
  /** Optional controlled open state. When omitted the sheet manages itself. */
  open?: boolean;
  /** Optional controlled callback. */
  onOpenChange?: (open: boolean) => void;
  /** Extra classes for the sticky trigger bar, e.g. to clear a bottom tab bar. */
  triggerClassName?: string;
}

/**
 * The slip as a real pull-up sheet on narrow screens: the collapsed bar still
 * shows the combined probability, but the whole Top 3+3 can now be edited
 * without leaving the fixture list.
 */
export function MobileSlipSheet({
  combinedProb,
  filled,
  total,
  invalid,
  children,
  open: controlledOpen,
  onOpenChange,
  triggerClassName
}: MobileSlipSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (controlledOpen !== undefined) setInternalOpen(controlledOpen);
  }, [controlledOpen]);

  return (
    <>
      {open ? (
        <div className="fixed inset-0 z-40 flex flex-col justify-end xl:hidden">
          <button
            type="button"
            aria-label="Szelvény bezárása"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
          />
          <div className="relative max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-white/[0.08] bg-[#0a0a0a] p-3 pb-6">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="mx-auto h-1 w-10 rounded-full bg-white/15" aria-hidden={true} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn--ghost btn--sm tap shrink-0"
                aria-label="Bezárás"
              >
                <X className="h-3.5 w-3.5" aria-hidden={true} />
              </button>
            </div>
            {children}
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          'pointer-events-none sticky bottom-0 z-30 -mx-4 mt-2 px-4 pb-2 xl:hidden',
          triggerClassName
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'pointer-events-auto flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-2.5 backdrop-blur-md',
            invalid ? 'border-red-500/30 bg-red-500/10' : 'border-blue-500/25 bg-[#0a0a0a]/90'
          )}
        >
          <span className="flex items-center gap-2 text-ui-xs text-muted-foreground">
            <Sigma className="h-3.5 w-3.5 text-blue-400" aria-hidden={true} />
            {filled} / {total} szerepkör
          </span>
          <span className="flex items-center gap-2">
            <span
              className={cn(
                'text-ui-base font-medium tabular-nums',
                invalid ? 'text-negative' : 'text-foreground'
              )}
            >
              {invalid ? 'érvénytelen' : filled > 0 ? `${(combinedProb * 100).toFixed(1)}%` : '—'}
            </span>
            <ChevronUp className="h-4 w-4 text-neutral-500" aria-hidden={true} />
          </span>
        </button>
      </div>
    </>
  );
}
