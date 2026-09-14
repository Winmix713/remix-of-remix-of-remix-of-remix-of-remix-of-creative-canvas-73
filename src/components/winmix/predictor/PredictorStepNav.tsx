import { ClipboardList, LayoutGrid, Microscope } from 'lucide-react';
import { cn } from '../../../lib/utils';

export type PredictorStep = 'round' | 'analysis' | 'slip';

const STEPS: Array<{ key: PredictorStep; label: string; icon: typeof LayoutGrid }> = [
  { key: 'round', label: 'Forduló', icon: LayoutGrid },
  { key: 'analysis', label: 'Elemzés', icon: Microscope },
  { key: 'slip', label: 'Szelvény', icon: ClipboardList }
];

interface PredictorStepNavProps {
  value: PredictorStep;
  onChange: (next: PredictorStep) => void;
  expert: boolean;
  onExpertChange: (next: boolean) => void;
  /** Small counter badges, e.g. "6/8" on the round step. */
  badges?: Partial<Record<PredictorStep, string>>;
}

/** Desktop segmented switcher for the three work phases, plus the view mode. */
export function PredictorStepNav({
  value,
  onChange,
  expert,
  onExpertChange,
  badges
}: PredictorStepNavProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div
        role="tablist"
        aria-label="Munkafázisok"
        className="flex min-w-0 gap-1 rounded-xl border border-white/[0.07] bg-white/[0.015] p-1"
      >
        {STEPS.map((step) => {
          const Icon = step.icon;
          const active = value === step.key;
          return (
            <button
              key={step.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(step.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-ui-xs font-medium transition-colors',
                active
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300'
              )}
            >
              <Icon className="h-3.5 w-3.5" aria-hidden={true} />
              {step.label}
              {badges?.[step.key] ? (
                <span className="font-mono text-[10px] tabular-nums text-neutral-500">
                  {badges[step.key]}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="flex gap-1 rounded-xl border border-white/[0.07] bg-white/[0.015] p-1">
        {[
          { key: false, label: 'Egyszerű' },
          { key: true, label: 'Szakértő' }
        ].map((mode) => (
          <button
            key={String(mode.key)}
            type="button"
            aria-pressed={expert === mode.key}
            onClick={() => onExpertChange(mode.key)}
            className={cn(
              'rounded-lg px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors',
              expert === mode.key
                ? 'bg-white/[0.06] text-neutral-100'
                : 'text-neutral-500 hover:text-neutral-300'
            )}
          >
            {mode.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Bottom tab bar — the same state machine, thumb-reachable on phones. */
export function PredictorMobileTabs({
  value,
  onChange
}: {
  value: PredictorStep;
  onChange: (next: PredictorStep) => void;
}) {
  return (
    <nav className="sticky bottom-0 z-30 -mx-4 mt-2 flex gap-1 border-t border-white/[0.07] bg-[#0a0a0a]/95 px-4 py-2 backdrop-blur-md lg:hidden">
      {STEPS.map((step) => {
        const Icon = step.icon;
        const active = value === step.key;
        return (
          <button
            key={step.key}
            type="button"
            onClick={() => onChange(step.key)}
            className={cn(
              'flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors',
              active ? 'bg-blue-500/10 text-blue-400' : 'text-neutral-500'
            )}
          >
            <Icon className="h-4 w-4" aria-hidden={true} />
            {step.label}
          </button>
        );
      })}
    </nav>
  );
}
