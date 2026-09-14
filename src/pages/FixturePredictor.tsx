import { useCallback, useMemo, useState } from 'react';
import { Play, RotateCcw, Target, X } from 'lucide-react';
import { toast } from 'sonner';
import { LEAGUES } from '../data/leagues';
import { useWinmix } from '../contexts/WinmixContext';
import { buildTeamPool, fixturesOf, usedTeamKeys } from '../utils/fixtures';
import {
  combinedProbability,
  draftToSlip,
  duplicateFixtures,
  hasLines,
  rankedPatterns,
  swapSlot,
  type ActiveSlipRole
} from '../utils/slip';
import { useRoundAnalysis } from '../hooks/useRoundAnalysis';
import { defaultSlipMarkets } from '../utils/marketCatalog';
import { QUICK_STRATEGY, defaultCoreStrategy } from '../utils/coreStrategy';
import type { CoreStrategySettings, FixtureAnalysis, League, SlipMarketPreferences } from '../types/winmix';
import { Chip, Panel, PanelActions, PanelHeader, PanelTitle } from '../components/winmix/Panel';
import {
  StateEmptyPanel,
  StateError,
  StateNotice,
  StateProgress
} from '../components/winmix/PanelState';
import { RoundBuilder } from '../components/winmix/RoundBuilder';
import { CoreStrategySelector } from '../components/winmix/CoreStrategySelector';

import { SlipPanel } from '../components/winmix/SlipPanel';
import { CoreStatusStrip } from '../components/winmix/predictor/CoreStatusStrip';
import { CoreDiagnosticsPanel } from '../components/winmix/predictor/CoreDiagnosticsPanel';
import {
  FixtureRowList,
  type FixtureRowMeta
} from '../components/winmix/predictor/FixtureRowList';
import { FixtureDetailDrawer } from '../components/winmix/predictor/FixtureDetailDrawer';
import {
  PredictorMobileTabs,
  PredictorStepNav,
  type PredictorStep
} from '../components/winmix/predictor/PredictorStepNav';
import { StickyRunHeader } from '../components/winmix/predictor/StickyRunHeader';
import { MobileSlipSheet } from '../components/winmix/predictor/MobileSlipSheet';
import { FixtureFilterBar } from '../components/winmix/predictor/FixtureFilterBar';
import { useIsMobile } from '../hooks/use-mobile';

const INTRO =
  'Állítsd össze a hét 8 angol és 8 spanyol mérkőzését, majd futtasd az ' +
  'elemzést: a rendszer a teljes kumulatív H2H adatbázisból kibányássza a ' +
  'mintákat, és hat slotra osztja őket — három core és három joker sor.';

export function FixturePredictor() {
  const {
    seasons,
    round,
    teamAliasMap,
    setFixtureTeam,
    clearFixture,
    renameRound,
    resetRound,
    saveSlip,
    settings,
    updateSettings
  } = useWinmix();

  const isMobile = useIsMobile();
  const expert = settings.viewMode === 'expert';

  const [step, setStep] = useState<PredictorStep>('round');
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [selectedFixture, setSelectedFixture] = useState<FixtureAnalysis | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [onlyCore, setOnlyCore] = useState(false);
  const [onlyWarnings, setOnlyWarnings] = useState(false);
  const [sortBy, setSortBy] = useState<'stability' | 'probability'>('stability');

  const markets = settings.slipMarkets ?? defaultSlipMarkets();
  const strategy = settings.coreStrategy ?? defaultCoreStrategy();
  /** The spec that actually drove this run's core selection. */
  const activeSpec = QUICK_STRATEGY[strategy.quickStrategy];

  const {
    analyses,
    draft,
    setDraft,
    ready,
    running,
    stale,
    progress,
    error,
    dismissError,
    run,
    cancel
  } = useRoundAnalysis(markets, strategy);

  const pools = useMemo(
    () =>
      Object.fromEntries(
        LEAGUES.map((league) => [
          league,
          buildTeamPool(seasons, league, teamAliasMap[league] ?? {})
        ])
      ) as Record<League, ReturnType<typeof buildTeamPool>>,
    [seasons, teamAliasMap]
  );

  const allPatterns = useMemo(() => rankedPatterns(analyses), [analyses]);

  const patternCounts = useMemo(
    () =>
      analyses.reduce<Record<string, number>>((acc, a) => {
        acc[a.fixtureId] = a.patterns.length;
        return acc;
      }, {}),
    [analyses]
  );

  const auditCoverage = useMemo(() => {
    let audited = 0;
    let total = 0;
    seasons.forEach((season) =>
      season.matches.forEach((match) => {
        total++;
        if (match.pipeline) audited++;
      })
    );
    return { audited, total };
  }, [seasons]);

  const combined = useMemo(() => (draft ? combinedProbability(draft) : 0), [draft]);
  const duplicates = useMemo(() => (draft ? duplicateFixtures(draft) : []), [draft]);
  const filledSlots = useMemo(
    () => draft?.slots.filter((s) => s.pattern).length ?? 0,
    [draft]
  );

  const fixtureMeta = useMemo<Record<string, FixtureRowMeta>>(() => {
    const coreIds = new Set<string>();
    draft?.slots.forEach((slot) => {
      if (slot.pattern && ['btts_top', 'btts_second', 'over25'].includes(slot.role)) {
        coreIds.add(slot.pattern.fixtureId);
      }
    });
    return analyses.reduce<Record<string, FixtureRowMeta>>((acc, a) => {
      acc[a.fixtureId] = {
        coreCandidate: coreIds.has(a.fixtureId),
        warning: a.bttsRisk?.wouldVeto ?? false
      };
      return acc;
    }, {});
  }, [analyses, draft]);

  const warningCount = useMemo(
    () => analyses.filter((a) => a.bttsRisk?.wouldVeto).length,
    [analyses]
  );

  const stabilities = useMemo(
    () => allPatterns.map((p) => p.stability / 100),
    [allPatterns]
  );

  const filteredAnalyses = useMemo(() => {
    let list = [...analyses];
    if (onlyCore) {
      list = list.filter((a) => fixtureMeta[a.fixtureId]?.coreCandidate);
    }
    if (onlyWarnings) {
      list = list.filter((a) => fixtureMeta[a.fixtureId]?.warning);
    }
    list.sort((a, b) => {
      if (sortBy === 'stability') {
        const sa = a.patterns[0]?.stability ?? 0;
        const sb = b.patterns[0]?.stability ?? 0;
        return sb - sa;
      }
      const pa =
        a.patterns[0]?.modelProb ?? Math.max(a.probs.home, a.probs.draw, a.probs.away);
      const pb =
        b.patterns[0]?.modelProb ?? Math.max(b.probs.home, b.probs.draw, b.probs.away);
      return pb - pa;
    });
    return list;
  }, [analyses, fixtureMeta, onlyCore, onlyWarnings, sortBy]);

  const handleSwap = useCallback(
    (role: ActiveSlipRole) => {
      setDraft((current) => {
        if (!current) return current;
        const next = swapSlot(current, role, allPatterns, markets, strategy);
        if (!next) {
          toast.error(
            'Nincs másik szabad jelölt ebben a készletben — a többi sor ' +
            'mérkőzései és a kapun kívüli jelöltek ki vannak zárva.'
          );
          return current;
        }
        return next;
      });
    },
    [allPatterns, markets, setDraft, strategy]
  );

  const handleStrategyChange = useCallback(
    (next: CoreStrategySettings) => {
      void updateSettings({ coreStrategy: next });
    },
    [updateSettings]
  );

  const handleMarketsChange = useCallback(
    (next: SlipMarketPreferences) => {
      void updateSettings({ slipMarkets: next });
    },
    [updateSettings]
  );

  const handleExpertChange = useCallback(
    (next: boolean) => {
      void updateSettings({ viewMode: next ? 'expert' : 'simple' });
    },
    [updateSettings]
  );

  const handleStepChange = useCallback(
    (next: PredictorStep) => {
      setStep(next);
      if (next === 'slip' && isMobile) {
        setSheetOpen(true);
      }
    },
    [isMobile]
  );

  const handleSheetOpenChange = useCallback(
    (open: boolean) => {
      setSheetOpen(open);
      if (!open && step === 'slip') {
        setStep('analysis');
      }
    },
    [step]
  );

  const handleSave = useCallback(() => {
    if (!draft) return;
    if (duplicateFixtures(draft).length > 0) {
      toast.error(
        'Ugyanaz a mérkőzés több soron szerepel — a kombinált valószínűség ' +
        'érvénytelen, a szelvény nem menthető.'
      );
      return;
    }
    const slip = draftToSlip(draft, round.name, strategy);
    if (slip.lines.length === 0) {
      toast.error('A szelvény üres — nincs mit menteni.');
      return;
    }
    saveSlip(slip);
  }, [draft, round.name, saveSlip, strategy]);

  const noData = seasons.length === 0;
  const totalFixtures = round.fixtures.length;
  const roundComplete = ready.length === totalFixtures && totalFixtures > 0;

  const slipNode = draft ? (
    <SlipPanel
      draft={draft}
      combinedProb={combined}
      duplicates={duplicates}
      roundName={round.name}
      canSave={hasLines(draft) && duplicates.length === 0}
      onRoundNameChange={renameRound}
      onSwap={handleSwap}
      onSave={handleSave}
    />
  ) : null;

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      {/* --- Page header --------------------------------------------------- */}
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-5 sm:py-5">
          <div className="flex items-center gap-3.5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
              <Target className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <div className="mb-1 text-[10px] font-mono uppercase tracking-[0.18em] text-neutral-600">
                Predikciós motor
              </div>
              <PanelTitle className="text-[clamp(1.125rem,1rem_+_0.6vw,1.375rem)]">
                Forduló Prediktor — Top 3+3
              </PanelTitle>
            </div>
          </div>
          <Chip tone="signal">Top 3+3</Chip>
        </div>
        <p className="border-t border-white/[0.06] px-4 py-4 text-xs leading-relaxed text-neutral-500 sm:px-5">
          {INTRO}
        </p>
      </Panel>

      {/* --- Sticky operation bar ------------------------------------------ */}
      <StickyRunHeader
        roundName={round.name}
        ready={ready.length}
        total={totalFixtures}
        running={running}
        stale={stale}
        canRun={!noData && ready.length > 0}
        progress={progress}
        onRun={run}
        onCancel={cancel}
      />

      {/* --- Step navigation ----------------------------------------------- */}
      <PredictorStepNav
        value={step}
        onChange={handleStepChange}
        expert={expert}
        onExpertChange={handleExpertChange}
        badges={{
          round: `${ready.length}/${totalFixtures}`,
          analysis: analyses.length > 0 ? String(analyses.length) : undefined,
          slip: draft ? `${filledSlots}/${draft.slots.length}` : undefined
        }}
      />

      {noData ? (
        <StateEmptyPanel
          title="Nincs betöltött adat"
          message="A prediktor a betöltött szezonok csapataiból és H2H előzményeiből dolgozik. Töltsd fel a szezon CSV-ket a Taktikai Stúdióban, utána itt összeállítható a forduló."
          action={
            <a
              href="?mp_screen=dashboard"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-1 px-3 py-1.5 text-ui-xs font-medium text-foreground transition-colors hover:bg-elevated"
            >
              <Target className="h-3.5 w-3.5" aria-hidden={true} />
              Taktikai Stúdió megnyitása
            </a>
          }
        />
      ) : null}

      {/* --- Round step ---------------------------------------------------- */}
      {step === 'round' && !noData ? (
        <Panel>
          <PanelHeader>
            <PanelTitle>{round.name}</PanelTitle>
            <PanelActions>
              <Chip tone={roundComplete ? 'signal' : 'neutral'}>
                {ready.length} / {totalFixtures} pár kész
              </Chip>

              <button
                type="button"
                className="btn btn--ghost btn--sm tap"
                disabled={running}
                onClick={() => void resetRound()}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden={true} />
                Forduló ürítése
              </button>

              {running ? (
                <button type="button" className="btn btn--danger btn--sm tap" onClick={cancel}>
                  <X className="h-3.5 w-3.5" aria-hidden={true} />
                  Elemzés megszakítása
                </button>
              ) : null}

              <button
                type="button"
                className="btn btn--signal btn--sm tap"
                disabled={running || ready.length === 0}
                onClick={() => {
                  void run();
                  setStep('analysis');
                }}
              >
                <Play className="h-3.5 w-3.5" aria-hidden={true} />
                {running ? 'Elemzés fut…' : 'Forduló elemzése'}
              </button>
            </PanelActions>
          </PanelHeader>

          <div className="flex flex-col gap-4 p-4 sm:p-5">
            {progress ? (
              <StateProgress
                label="Mintakeresés…"
                detail={`${progress.done} / ${progress.total}`}
                ratio={progress.total > 0 ? progress.done / progress.total : undefined}
              />
            ) : null}

            {error ? (
              <StateError
                title="Az elemzés megszakadt egy hiba miatt."
                message={error}
                onDismiss={dismissError}
              />
            ) : null}

            {stale && !running ? (
              <StateNotice>
                A forduló módosult az utolsó elemzés óta — futtasd újra, hogy a minták és a szelvény
                szinkronban legyenek.
              </StateNotice>
            ) : null}

            <CoreStrategySelector
              value={strategy}
              readout={draft?.strategy ?? null}
              running={running}
              onChange={handleStrategyChange}
            />

            <div

              className="grid grid-cols-1 gap-4 [@container(min-width:40rem)]:grid-cols-2"
              style={{ containerType: 'inline-size' }}
            >
              {LEAGUES.map((league) => (
                <RoundBuilder
                  key={league}
                  league={league}
                  fixtures={fixturesOf(round, league)}
                  pool={pools[league]}
                  used={usedTeamKeys(round, league)}
                  patternCounts={patternCounts}
                  onSelect={setFixtureTeam}
                  onClear={clearFixture}
                />
              ))}
            </div>
          </div>
        </Panel>
      ) : null}

      {/* --- Analysis step ------------------------------------------------- */}
      {step === 'analysis' && !noData ? (
        <div className="flex flex-col gap-3">
          {analyses.length > 0 ? (
            <>
              <CoreStatusStrip
                readout={draft?.strategy ?? null}
                warningCount={warningCount}
                stabilities={stabilities}
                open={diagnosticsOpen}
                onToggle={() => setDiagnosticsOpen((v) => !v)}
              />

              {diagnosticsOpen ? (
                <CoreDiagnosticsPanel
                  strategy={strategy}
                  draft={draft ?? null}
                  analyses={analyses}
                  allPatterns={allPatterns}
                  markets={markets}
                  familyCodes={activeSpec.codes}
                  profileVeto={activeSpec.profileVeto}
                  running={running}
                  auditedMatches={auditCoverage.audited}
                  totalMatches={auditCoverage.total}
                  expert={expert}
                  onStrategyChange={handleStrategyChange}
                  onMarketsChange={handleMarketsChange}
                />
              ) : null}

              <FixtureFilterBar
                onlyCore={onlyCore}
                onOnlyCoreChange={setOnlyCore}
                onlyWarnings={onlyWarnings}
                onOnlyWarningsChange={setOnlyWarnings}
                sortBy={sortBy}
                onSortChange={setSortBy}
                resultCount={filteredAnalyses.length}
              />

              <FixtureRowList
                analyses={filteredAnalyses}
                meta={fixtureMeta}
                onOpen={setSelectedFixture}
              />

              <FixtureDetailDrawer
                analysis={selectedFixture}
                onClose={() => setSelectedFixture(null)}
              />
            </>
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.012] px-4 py-8 text-center text-ui-xs text-muted-foreground">
              Még nincs elemzés — futtasd a forduló elemzését a fenti gombbal.
            </div>
          )}
        </div>
      ) : null}

      {/* --- Slip step (desktop inline; mobile uses the pull-up sheet) ------- */}
      {step === 'slip' && !noData ? (
        <div className="hidden xl:block">
          {draft ? (
            slipNode
          ) : (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.012] px-4 py-8 text-center text-ui-xs text-muted-foreground">
              Még nincs szelvény — futtasd az elemzést előbb.
            </div>
          )}
        </div>
      ) : null}

      {/* --- Mobile slip sheet --------------------------------------------- */}
      {draft ? (
        <MobileSlipSheet
          combinedProb={combined}
          filled={filledSlots}
          total={draft.slots.length}
          invalid={duplicates.length > 0}
          open={sheetOpen}
          onOpenChange={handleSheetOpenChange}
          triggerClassName="bottom-16 lg:bottom-0"
        >
          {slipNode}
        </MobileSlipSheet>
      ) : null}

      {/* --- Mobile step tabs ---------------------------------------------- */}
      <PredictorMobileTabs value={step} onChange={handleStepChange} />
    </div>
  );
}
