import { useState } from 'react';
import { cn } from '../../../lib/utils';
import type {
  CoreStrategySettings,
  FixtureAnalysis,
  PatternHit,
  SlipMarketPreferences
} from '../../../types/winmix';
import type { SlipDraft } from '../../../utils/slip';
import { CoreDecisionTracePanel } from '../CoreDecisionTracePanel';
import { CoreGateStatus } from '../CoreGateStatus';
import { CoreStrategySelector } from '../CoreStrategySelector';
import { EmptyCoreReasons } from '../EmptyCoreReasons';
import { MarketPoolSelector } from '../MarketPoolSelector';
import { PatternConfidenceSummary } from '../PatternConfidenceSummary';
import { ProductionGatesPanel } from '../ProductionGatesPanel';
import { ZeroCoreNotice } from '../ZeroCoreNotice';

type TabKey = 'summary' | 'gates' | 'trace' | 'distribution' | 'exclusions' | 'advanced';

interface CoreDiagnosticsPanelProps {
  strategy: CoreStrategySettings;
  draft: SlipDraft | null;
  analyses: FixtureAnalysis[];
  allPatterns: PatternHit[];
  markets: SlipMarketPreferences;
  familyCodes: string[];
  profileVeto: boolean;
  running: boolean;
  auditedMatches: number;
  totalMatches: number;
  expert: boolean;
  onStrategyChange: (next: CoreStrategySettings) => void;
  onMarketsChange: (next: SlipMarketPreferences) => void;
}

/**
 * Every Core diagnostic surface behind one secondary-weight panel with internal
 * tabs, instead of seven stacked top-level panels that each repeated a slice of
 * the same question: why did this become the core, and how much can it be
 * trusted?
 */
export function CoreDiagnosticsPanel({
  strategy,
  draft,
  analyses,
  allPatterns,
  markets,
  familyCodes,
  profileVeto,
  running,
  auditedMatches,
  totalMatches,
  expert,
  onStrategyChange,
  onMarketsChange
}: CoreDiagnosticsPanelProps) {
  const [tab, setTab] = useState<TabKey>('summary');

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'summary', label: 'Összegzés' },
    { key: 'gates', label: 'Kapuk' },
    ...(expert
      ? ([
          { key: 'trace', label: 'Levezetés' },
          { key: 'distribution', label: 'Eloszlás' }
        ] as Array<{ key: TabKey; label: string }>)
      : []),
    { key: 'exclusions', label: 'Kizárások' },
    { key: 'advanced', label: 'Haladó' }
  ];

  const active = tabs.some((t) => t.key === tab) ? tab : 'summary';

  return (
    <div className="min-w-0 rounded-xl border border-white/[0.06] bg-white/[0.012]">
      <div
        role="tablist"
        aria-label="Core diagnosztika"
        className="flex min-w-0 flex-wrap gap-1 border-b border-white/[0.05] p-1.5"
      >
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-md px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wide transition-colors',
              active === t.key
                ? 'bg-blue-500/10 text-blue-400'
                : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex min-w-0 flex-col gap-3 p-3">
        {active === 'summary' ? (
          <>
            <CoreStrategySelector
              value={strategy}
              readout={draft?.strategy ?? null}
              running={running}
              onChange={onStrategyChange}
            />
            <CoreGateStatus
              readout={draft?.strategy ?? null}
              auditedMatches={auditedMatches}
              totalMatches={totalMatches}
            />
          </>
        ) : null}

        {active === 'gates' ? <ProductionGatesPanel /> : null}

        {active === 'trace' ? (
          <CoreDecisionTracePanel
            analyses={analyses}
            readout={draft?.strategy ?? null}
            familyCodes={familyCodes}
            profileVeto={profileVeto}
          />
        ) : null}

        {active === 'distribution' ? <PatternConfidenceSummary patterns={allPatterns} /> : null}

        {active === 'exclusions' ? (
          <>
            <ZeroCoreNotice draft={draft} />
            <EmptyCoreReasons draft={draft} />
          </>
        ) : null}

        {active === 'advanced' ? (
          <MarketPoolSelector value={markets} running={running} onChange={onMarketsChange} />
        ) : null}
      </div>
    </div>
  );
}
