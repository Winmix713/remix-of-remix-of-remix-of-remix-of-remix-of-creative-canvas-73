import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { FixtureAnalysis } from '../../../types/winmix';
import { FixtureCard } from '../FixtureCard';

interface FixtureDetailDrawerProps {
  analysis: FixtureAnalysis | null;
  onClose: () => void;
}

/**
 * The full fixture card, moved off the main column: it slides in from the side
 * on desktop and covers the lower part of the screen on narrow ones, so the
 * list itself stays short. Hand-rolled rather than Radix-based — the dialog
 * primitive is not part of this project's dependency set.
 */
export function FixtureDetailDrawer({ analysis, onClose }: FixtureDetailDrawerProps) {
  useEffect(() => {
    if (!analysis) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [analysis, onClose]);

  if (!analysis) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        aria-label="Bezárás"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
      />
      <aside className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-white/[0.08] bg-[#0a0a0a] p-4 shadow-[0_0_60px_rgba(0,0,0,0.6)] sm:p-5">
        <header className="mb-3 flex items-center justify-between gap-3">
          <h2 className="min-w-0 truncate text-sm font-semibold tracking-tight text-neutral-100">
            {analysis.label}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn--ghost btn--sm tap shrink-0"
            aria-label="Részletek bezárása"
          >
            <X className="h-3.5 w-3.5" aria-hidden={true} />
          </button>
        </header>
        <FixtureCard analysis={analysis} />
      </aside>
    </div>
  );
}
