# Forduló Prediktor — átláthatósági átalakítás

A cél: az oldal hossza feleződjön, és elsőre az látszódjon, amire a felhasználó kíváncsi (Top 3+3), a levezetés pedig egy kattintásra legyen elérhető.

## Új felépítés

```text
[ ragadós fejléc: forduló neve · 6/8 pár kész · futás állapota · Elemzés gomb ]
[ lépéssáv:  Forduló  ·  Elemzés  ·  Szelvény          Egyszerű | Szakértő ]

Forduló:   forduló összeállítása (angol + spanyol oszlop)
Elemzés:   Core-státusz csík (1 sor) → részletek lenyitva
           figyelmeztetés-sávok (csak ha van mondanivaló)
           kompakt mérkőzéssorok + szűrő/rendezés
Szelvény:  Top 3+3 nagyban, cserékkel
```

Mobilon egyszerre csak az aktív nézet látszik, alul lapváltó sávval; a szelvény felhúzható alsó lapként bárhonnan elérhető.

## Mit csinálunk lépésenként

### 1. szakasz — Core diagnosztika összevonása (3., 2., 4. pont)
- A hét külön doboz (Core stratégia, Core kapu, Termelési kapuk, Decision trace, Megbízhatósági eloszlás, Üres sorok indoklása, Haladó beállítás) helyére **egyetlen egysoros státusz csík** kerül: stratégia neve, kapuk zöld/sárga/piros pontjai, jelöltszám, „7 vizsgált jelölt".
- A csíkra kattintva nyílik a részletes panel belső fülekkel: Összegzés / Kapuk / Levezetés / Eloszlás / Kizárások / Haladó.
- A Decision trace és az eloszlás alapból csukva, csak fejléc-összefoglalóval („69 minta · medián 0.62"). Az eloszlás a csíkon mini-hisztogramként is megjelenik.
- Egyik meglévő panel tartalma sem vész el, csak fülek alá kerül.

### 2. szakasz — Mérkőzések sűrű listája (6., 7., 5. pont)
- A 8 nagy kártya helyett kompakt sorok: párosítás, top minta, stabilitás, státusz jelzés.
- Kattintásra oldalról becsúszó részletpanel (mobilon alsó lap) mutatja a teljes mintalistát — a mostani kártya tartalmát.
- A sorok felett szűrő/rendező sáv: „Csak core-jelöltek", „Csak figyelmeztetéssel", rendezés stabilitás vagy valószínűség szerint.
- A profil-figyelmeztetések (ÁRNYÉK MÓD) borostyán jelzésként az érintett soron és a szelvénysoron jelennek meg, plusz összesítő szám a státusz csíkban; külön panelt nem kapnak.

### 3. szakasz — Három munkafázis és ragadós fejléc (1., 10., 8., 9. pont)
- Lépéssáv: Forduló összeállítása → Elemzés → Szelvény. Desktopon szegmentált váltó, mobilon alsó tab-sáv; csak az aktív nézet renderelődik.
- Ragadós vékony fejléc görgetés közben: forduló neve, kész párok, futás állapota, „Forduló elemzése" gomb.
- Mobilon a jelenlegi szelvény-sáv felhúzható lappá válik, amelyben a teljes Top 3+3 szerkeszthető.
- Két vizuális súlyszint: elsődleges felületek (forduló, szelvény, mérkőzések) világosabb kerettel, a diagnosztika halványabb, keskenyebb.

### 4. szakasz — Egyszerű / Szakértő kapcsoló (9. pont)
- A beállításokba mentett nézetmód. Egyszerűben csak a szelvény, a státusz-összegzés és a mérkőzéslista látszik; Szakértőben jön elő a levezetés, eloszlás és core-eredmény. A választás újratöltés után is megmarad.

## Technikai megjegyzések
- Új komponensek: `CoreStatusStrip`, `CoreDiagnosticsPanel` (fülekkel, a meglévő `CoreGateStatus`, `ProductionGatesPanel`, `CoreDecisionTracePanel`, `PatternConfidenceSummary`, `EmptyCoreReasons`, `MarketPoolSelector` újrahasznosításával), `FixtureRowList` + `FixtureDetailDrawer` (a `FixtureCard` tartalmát használja), `PredictorStepNav`, `StickyRunHeader`, `MobileSlipSheet`.
- A `FixturePredictor.tsx` orchestrátorrá válik: nézetállapot + szűrőállapot, a paneleket a fázisok alá rendezi. A számítási logika (`useRoundAnalysis`, `utils/slip`, `forecastCore`) változatlan.
- A nézetmód és a szűrőbeállítások a `WinmixContext` settings rétegébe kerülnek (`viewMode: 'simple' | 'expert'`).
- Drawer/bottom sheet a meglévő shadcn primitívekkel; nincs új függőség.
