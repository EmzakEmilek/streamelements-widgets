# Donation & Subgoal Bar Widget (v0.9.3)

English | [Slovensky](#slovensky)

Unified multi-level donation goal + subscriber milestone display with merged glow engine, dual confetti groups, ambient idle shine, smart auto contrast, and performance-aware visual FX.

---

## 1. Resolution / Layout
Fixed-width 1920px (Full HD). Other widths are not yet adaptive and may misalign. Responsive / fluid width is planned (see Roadmap). Height auto-extends slightly with larger font sizes (dynamic bar height formula in code).

## 2. Quick Start
1. Create a new Custom Widget in StreamElements; paste contents of: `streamelements.html`, `.css`, `.js`, `.fields.json`.
2. Open Fields → define levels (title + goal). They auto-sort ascending by numeric goal value.
3. Set donation/sub glow + goal complete glow. (Subs reuse donation glow settings.)
4. Configure progress bar, percent, text animation, labels, fonts, icons, colors.
5. Pick confetti presets (micro vs goal) if desired.
6. (Optional) Set ambient shine interval (>=5s) & enable/disable Smart Auto Contrast.
7. Send Test Tip + Test Sub events in StreamElements to verify glow, confetti, percent, scrolling donor line, and goal advancement.
8. Toggle Debug Logging while testing (Console output `[DonationBar]`).

## 3. High‑Level Feature List
- Up to 10 auto‑sorted donation levels (multi-level progression)
- Subscriber count with optional milestone formatting (current / next milestone)
- Latest donation display with conditional horizontal scroll (only if overflow)
- Animated goal text (typewriter, fade, or off)
- Unified Donation & Subscription glow config + dedicated Goal Complete glow (boosted intensity)
- Two confetti groups: micro (every donation/sub) and goal (celebratory burst)
- Thin global progress bar with intensity (height + glow) presets & dynamic color shift during events
- Optional inline percent relative to active level (non-resetting absolute accumulation logic)
- Ambient idle shine after configurable inactivity window
- Smart Auto Contrast (per-segment adaptive readability assistance)
- Automatic duplicate tip event filtering (Set of processed IDs)
- Performance guards (confetti throttle 250ms, piece cap 300, glow cancellation, % write throttle 0.25%)
- Temporary progress bar color sync with active glow color (reverts automatically)
- Google Font preset loader + custom font fallback detection heuristic

## 4. File Roles
| File | Purpose |
|------|---------|
| `streamelements.html` | Structural markup (goal line, subs, donor, icon cluster, progress, confetti layer) |
| `streamelements.css`  | Layout, progress bar gradient/glow, ambient shine, confetti animations, contrast helper classes |
| `streamelements.js`   | Core logic: field ingestion, level management, glow engine, percent & progress updates, confetti spawner, ambient shine, smart contrast, event handlers |
| `streamelements.fields.json` | Field definitions powering the StreamElements configuration UI |

## 5. Field Summary (Key Groups)
Only principal / user-facing fields documented below – see the JSON for full labels.

### 5.1 Levels
`levelsCount` + repeating `levelNTitle` / `levelNGoal`. Valid entries must have both Title and Goal (number). Empty or partial lines are skipped. After loading, levels are numerically re-sorted ascending to prevent accidental disorder.

### 5.2 Subscribers
`enableSubGoalMilestones` switches between:
- ON: `current / nextMilestone` where `nextMilestone = ceil(current / milestoneStep) * milestoneStep`.
- OFF: raw numeric subscriber count.
`milestoneStep`: selectable (1,3,5,10,20,50,100).

### 5.3 Goal Completion Messaging
- `goalCompleteDisplayMode`: replace | flash | none
	- replace: temporarily replaces the goal line with `COMPLETED: <Goal Title>` for `goalCompleteSeconds`.
	- flash: shows completion then restores original line (both animated if animation mode active).
	- none: no textual change (visual glow/confetti only).
- `goalCompleteLabel`, `goalCompleteSeconds`, `allGoalsCompleteMessage` (shown once final level threshold reached).
Multiple level jumps trigger only the FIRST newly completed level’s celebration (prevents multi-spam).

### 5.4 Text & Labels
- `textAnimationMode`: typewriter | fade | off
- `textCaseMode`: lower | upper | normal (applied via CSS text-transform)
- `subsLabel`, `latestDonationLabel` (auto ensure trailing space so punctuation aligns)

### 5.5 Glow Engine
Merged donation & subscription glow fields:
- `enableGlowDonation`, `glowDonationColor`, `glowDonationMs`, `glowDonationRange` (Soft→Extreme 1–5), `glowDonationPulses` (1–5)
Goal complete glow has parallel fields (`enableGlowGoalComplete`, color, duration, style, pulses) and gains an internal +20% intensity multiplier. Range (style) maps to intensity scale: 1→1, 2→1.4, 3→2, 4→3, 5→4.
New glow cancels previous pulses (no stacking). Automatic gap ≈10% of duration (min 80ms) between pulses. Progress bar color temporarily syncs to active glow color (donation/sub/goal) then reverts using a timed token guard.

### 5.6 Progress & Percent
- `showDonationPercent`: appends (NN%) to goal line if active (calculated as accumulatedAmount / activeLevelGoal * 100; clamped 0–100). Percent does NOT reset to 0 after completing a level; accumulated donation total continues, producing an immediate recalculation relative to the next level’s goal.
- `showDonationProgressBar`: toggles the thin bar element (`global-progress`).
- `progressBarIntensity`: low (1px) | medium (2px) | strong (3px) – adjusts bar height & glow strength via CSS classes.
- `progressBarColor`, `progressBarGlowColor`, `progressBarEmptyColor` – color triplet; glow color falls back logically if omitted.
Width writes are throttled unless change ≥0.25% (reduces layout churn while still smooth).

### 5.7 Confetti FX
Two independently configurable groups:
| Group | Trigger | Typical Size |
|-------|---------|--------------|
| Micro | Each donation OR subscription | Light burst |
| Goal  | Level completion             | Larger celebratory |
Preset dropdowns (Few/Medium/Many etc.) map to numeric constants (count, fall distance, fade duration, speed). Palettes: classic / warm / cool. Internal throttle: 250ms between spawns; hard concurrency cap: 300 active pieces (excess pieces skipped). Pieces start at bar bottom and fall beyond bounds with randomized 3D rotation.

### 5.8 Colors / Icons / Fonts
Independent color fields for goal text, subs label/value, donation label/value, background, icon color. Icon mode: system(all) | twitch (single) | heart (single) | hidden. Single-icon modes enlarge icon & apply ambient idle pulse. Font selection: curated presets or custom Google Font name (with runtime fallback detection; reverts to Space Mono if suspiciously identical metrics).

### 5.9 Accessibility (Smart Auto Contrast)
`enableSmartAutoContrast` (default ON) evaluates contrast between each configured foreground and the bar background. Threshold ≈3.8:1 (slightly below WCAG AA 4.5:1 for design flexibility). If below threshold a subtle multi-layer text-shadow class is applied (goal / subs / donation groups separately) to lift readability without forcibly changing chosen colors.

### 5.10 Ambient Shine
`ambientShineInterval` (seconds, 0 = off). Minimum effective interval is 5s (values <5 are ignored). After continuous inactivity ≥ interval: a brief diagonal sheen traverses the bar and (in single-icon modes) the lone icon performs a gentle elastic pulse/rotation. Any event or session sync marks activity and resets the timer.

### 5.11 Debug / Dev
`debugMode` = verbose console logging (field data dump, glow/confetti triggers, autocontrast decisions). Also exposes `window.__DONO_BAR_UTILS` helpers (percent getters, confetti trigger, contrast recompute) for manual testing.

## 6. Behavioral Notes
| Topic | Implementation Detail |
|-------|-----------------------|
| Level Completion | Detects index change; only the first newly crossed level celebrated if multiple thresholds passed in one large tip. |
| Duplicate Tips | Internal `processedTipIds` Set prevents double-count of rapid session + event duplicates. |
| Goal Text Lock | In replace mode the completion message locks the line; updates resume after timeout. |
| Percent Formula | Absolute accumulated / active goal (non-reset). Clamped 0–100 for display & bar width. |
| Progress Writes | Width DOM update skipped unless change ≥0.25%. |
| Font Fallback | Heuristic width comparison vs monospace to detect failed custom font load and revert. |
| Ambient Safety | Skips if recent glow still holding box-shadow (prevents visual collision). |
| Auto Contrast | Adds per-target low-contrast classes; purely additive text-shadows. |

## 7. Performance & Safety
- Confetti spawn throttle: 250ms.
- Active confetti piece cap: 300 (skips spawning beyond cap – avoids runaway DOM nodes).
- Glow pulses cancellable (memory-safe timeout cleanup).
- Percent / bar updates throttled (≥0.25% delta) to reduce layout thrash.
- Donation accumulation resilient to missing `tip-goal` session object (tracks locally from events + session latest tip fallback).
- Large donations crossing multiple levels: single celebration.

## 8. Customization Playbook
| Goal | Suggested Settings |
|------|--------------------|
| Subtle baseline | Donation Style=Soft/Medium, Pulses=1, Intensity=low |
| High energy | Donation Style=Intense+, Pulses=2–3, Goal Complete Style=Very/Extreme, Pulses=3–5 |
| Lightweight confetti | Micro: Few + Short fall + Fast speed |
| Long celebration | Goal: Many + Long fall + Long fade |
| Calm ambient | Ambient interval 90–180s |
| High readability | Leave Smart Auto Contrast ON, choose medium/strong bar intensity |

## 9. Troubleshooting (Quick Table)
| Issue | Likely Cause | Resolution |
|-------|--------------|-----------|
| No glow on donation | Glow disabled | Enable `enableGlowDonation` |
| Only 1 pulse | Pulses=1 | Increase `glowDonationPulses` |
| Percent hidden | Disabled OR replace message active | Enable field / wait timeout |
| Goal text “stuck” | In replace display window | Wait `goalCompleteSeconds` or switch mode to flash |
| Bar invisible | Progress bar disabled OR colors similar | Enable bar / adjust empty & glow colors |
| Confetti absent | Group disabled or preset low | Enable & raise presets |
| Font not applied | Wrong custom name | Copy exact Google Fonts name (case sensitive) |
| Performance dip | Excessive high presets | Lower counts, pulses, or disable micro |
| Milestone looks wrong | Wrong step size | Adjust `milestoneStep` or disable milestones |

## 10. License & Attribution (Summary)
Short Form: Personal channel use (including monetized streams) and private modifications allowed. Redistribution / resale / bundling (paid or free) of original or modified source in packs, marketplaces, SaaS, or template libraries requires prior written permission. No warranty.

Extended Outline:
1. Grant: Non-exclusive, non-transferable for overlays on owned/managed channels.
2. Allowed: Local edits, private forks, styling, internal team use (same brand).
3. Restricted: Resale, public repost, bundling, automated hosting, inclusion in commercial template packs without permission.
4. Attribution: Future optional attribution toggle may appear; leaving it enabled appreciated but not mandatory unless separate terms.
5. Liability: Provided “as is”.
6. Updates: Pre-1.0 may introduce breaking changes; pin version for tournaments or marathon reliability.
7. Termination: Breach of restrictions voids license; distribution must cease.

Commercial licensing / bundling inquiries: add contact channel here.


## 11. Author Notes
0.9.1-pre: merged sub glow, dual confetti grouping, milestone toggle, perf guards.
0.9.2-pre: ambient shine + heart icon mode, refined glow visuals.
0.9.3-pre: Smart Auto Contrast, clarified docs, minor font fallback heuristics, strengthened progress throttling.
1.0.0: first commercial-ready target (stability, adaptive width, packaging improvements).

## 12. FAQ
Q: Why no separate subscription glow settings?  
A: Simplifies tuning & visual consistency; subs reuse donation glow config.

Q: Why can percent look “high” after a level change?  
A: It’s absolute accumulated progress divided by the new active level goal; progress doesn’t reset.

Q: Why does the bar color shift briefly during events?  
A: Temporary sync to glow color for visual linkage; auto-reverts after pulse timing window.

Q: What happens if two levels are skipped in one giant donation?  
A: Only the first newly completed level fires celebrations; remaining progress applies silently.

Q: Can I disable the completion message entirely?  
A: Set `goalCompleteDisplayMode` to `none`.

Q: Confetti performance risks?  
A: Throttle + cap ensures predictable ceiling; lower presets if overlay runs in a resource-constrained scene.

Q: Custom font fails silently?  
A: Fallback heuristic reverts to Space Mono and logs a warning in debug mode.

Q: Replace vs flash?  
A: Replace locks line for duration; flash returns sooner while still signalling completion.

---

# Slovensky (v0.9.3-pre)

Zjednotený multi-level donation goal + sub milestone panel so zlúčeným glow engine-om, dvoma skupinami konfiet, ambient idle efektom, smart auto kontrastom a výkonnostne bezpečnými vizuálnymi efektmi.

## 1. Rozlíšenie / Layout
Fixná šírka 1920px (Full HD). Iné šírky zatiaľ nie sú adaptívne. Budúca responzivita je v Roadmape. Výška sa mierne zväčší pri väčšom písme (dynamický výpočet v kóde).

## 2. Rýchly Štart
1. Vytvor Custom Widget v StreamElements a vlož `streamelements.html`, `.css`, `.js`, `.fields.json`.
2. Vo Fields nastav levely (title + goal). Automaticky sa zoradia vzostupne.
3. Nastav Donation/Sub glow + Goal Complete glow (Sub používa rovnaké hodnoty ako Donation).
4. Nakonfiguruj progress bar, percento, animáciu textu, labely, fonty, ikony, farby.
5. Vyber konfety presety (micro vs goal) podľa preferencie.
6. (Voliteľné) Nastav ambient interval (>=5s) & Smart Auto Contrast.
7. Pošli Test Tip + Test Sub (Glow, konfety, percento, scroll donor, posun levelu).
8. Zapni Debug pre logy (Console `[DonationBar]`).

## 3. Hlavné Funkcie
- Až 10 levelov (automatické zoradenie)
- Subscriberi s voliteľnými milestone formátmi
- Posledná donácia s podmieneným horizontálnym scrollom
- Animovaný goal text (typewriter / fade / off)
- Zlúčený Donation & Subscription glow + samostatný Goal Complete glow (vyššia intenzita)
- Dve konfeti skupiny (micro každá donácia/sub, goal pri dokončení)
- Tenký progress bar (intenzita = hrúbka + žiara) + dočasná zmena farby pri evente
- Percento voči aktívnemu levelu (akumulácia sa neresetuje)
- Ambient shine po neaktivite
- Smart Auto Contrast pre čitateľnosť
- Filtrovanie duplicitných tip eventov (Set ID) 
- Ochrany výkonu (throttle 250ms, limit 300, zrušenie glow, % throttle 0.25%)
- Dočasné zosúladenie farby progress baru s glow farbou
- Google Font preset + vlastný font s fallback detekciou

## 4. Súbory
| Súbor | Účel |
|-------|------|
| `streamelements.html` | Štruktúra panelu |
| `streamelements.css`  | Štýly, gradient, ambient, konfety, kontrast triedy |
| `streamelements.js`   | Logika: polia, levely, glow, percento, konfety, ambient, kontrast, eventy |
| `streamelements.fields.json` | Definície polí pre UI |

## 5. Polia (Prehľad)

### 5.1 Levely
`levelsCount` + `levelNTitle` / `levelNGoal`. Neúplné riadky sa preskočia. Po načítaní sa zoradia numericky.

### 5.2 Subscriberi
`enableSubGoalMilestones`:
- ON: `aktuálne / ďalšíMilestone` (ceil(current / step) * step)
- OFF: iba číslo
`milestoneStep`: 1,3,5,10,20,50,100.

### 5.3 Dokončenie Levelu
- `goalCompleteDisplayMode`: replace | flash | none
	- replace: dočasne nahradí riadok `COMPLETED: názov`.
	- flash: krátko zobrazí a vráti pôvodný.
	- none: žiadna textová zmena.
- `goalCompleteLabel`, `goalCompleteSeconds`, `allGoalsCompleteMessage`.
Viacnásobný skok oslaví iba prvý novo-dosiahnutý level.

### 5.4 Text & Labely
`textAnimationMode`, `textCaseMode`, `subsLabel`, `latestDonationLabel` (automaticky medzera na konci).

### 5.5 Glow Engine
Donation & Sub zdieľajú nastavenia: povolenie, farba, dĺžka, štýl (1–5), pulzy (1–5). Goal Complete má vlastný set + 1.2× boost. Mapovanie štýlu: 1→1, 2→1.4, 3→2, 4→3, 5→4. Nový event ruší predchádzajúce pulzy (medzera ~10% trvania, min 80ms). Progress bar dočasne preberie farbu glow a potom sa vráti.

### 5.6 Progres & Percento
`showDonationPercent`: pripojí (NN%). Výpočet = kumulatívnyProgres / goalAktívnehoLevelu * 100 (clamp 0–100). Kumulácia sa pri level up neresetuje. `showDonationProgressBar` zapína tenkú čiaru. `progressBarIntensity` = low/medium/strong (hrúbka + sila žiary). Farby: fill / glow / empty. Zápis šírky prahovaný ≥0.25% zmena.

### 5.7 Konfety
| Skupina | Spúšťač | Veľkosť |
|---------|---------|---------|
| Micro | každá donácia/sub | ľahký burst |
| Goal  | dokončenie levelu | väčšia oslava |
Presety mapujú na čísla (count, fall, fade, speed). Palety: classic / warm / cool. Throttle 250ms, limit 300 aktívnych kusov.

### 5.8 Farby / Ikony / Fonty
Samostatné farby pre goal, subs label/value, donation label/value, pozadie, ikony. Ikony: system | twitch | heart | hidden. Single režimy = väčší symbol + ambient pulz. Font preset alebo vlastný Google Font s fallback heuristikou.

### 5.9 Prístupnosť (Smart Auto Contrast)
Prahová hodnota ~3.8:1; ak nižšia → pridá tieň cez špecifické triedy (goal/subs/donation). Farby sa nenahrádzajú, iba opticky zvýraznia.

### 5.10 Ambient Shine
`ambientShineInterval` (s, 0=off). Hodnoty <5 ignorované. Po neaktivite ≥ interval: diagonálny „sheen“ + jemný pulz hlavnej ikony (pri single módoch). Event = reset časovača.

### 5.11 Debug / Vývoj
`debugMode` loguje aplikované polia + triggre. `window.__DONO_BAR_UTILS` = pomocné funkcie (percentá, konfety, kontrast).

## 6. Správanie
| Oblasť | Detail |
|--------|--------|
| Dokončenie levelu | Kontrola zmeny indexu, oslavuje iba prvý novo-dosiahnutý pri veľkom donate |
| Duplicitné tipy | Set ID blokuje dvojité spracovanie |
| Lock goal textu | replace mód drží riadok po dobu trvania |
| Percento | Absolútny progres / cieľ aktívneho levelu (clamp) |
| Zápis progress | Throttle pri zmene <0.25% |
| Fallback font | Heuristika šírky reťazca → Space Mono ak zlyhá načítanie |
| Ambient | Neprekryje aktívny glow (kontrola box-shadow) |
| Auto kontrast | Pridáva tieň cez low-contrast triedy |

## 7. Výkon & Bezpečnosť
- Throttle konfiet 250ms
- Limit 300 aktívnych kusov
- Zrušenie glow pri novom evente
- Throttle šírky progressu (≥0.25%)
- Odolné voči chýbajúcemu `tip-goal` objektu (lokálna akumulácia)
- Viacnásobný skok = iba jedna oslava

## 8. Nastavenia – Príklady
| Cieľ | Odporúčané |
|------|------------|
| Jemné | Style Soft/Medium, Pulses 1 |
| Silná oslava | Style Intense+, Pulses 2–3; Goal Complete Extreme 3–5 |
| Ľahké konfety | Micro Few + Short + Fast |
| Dlhá oslava | Goal Many + Long + Long |
| Pokojný ambient | Interval 90–180s |
| Čitateľnosť | Smart Auto Contrast ON, intensity medium/strong |

## 9. Riešenie Problémov (Tabuľka)
| Problém | Príčina | Riešenie |
|---------|--------|----------|
| Žiadny glow | Vypnutý toggle | Zapni `enableGlowDonation` |
| 1 pulz | Pulses=1 | Zvýš `glowDonationPulses` |
| Percento chýba | Vypnuté / replace aktívne | Zapni / počkaj timeout |
| Text "zamrznutý" | Replace módu beží časovač | Zmeň na flash alebo čakaj |
| Nevidno bar | Vypnutý / farby splývajú | Zapni bar / uprav farby |
| Žiadne konfety | Disabled / nízky preset | Enable + zvoľ vyšší preset |
| Font nefunguje | Nesprávny názov | Skopíruj presný názov z Google Fonts |
| FPS drop | Veľa kusov / pulzov | Zníž count/pulses |
| Divný milestone | Nesprávny step | Uprav `milestoneStep` |

## 10. Licencia (Súhrn)
Krátko: Osobné použitie na vlastných streamoch + úpravy OK. Re-distribúcia / predaj / bundle (zdrojový alebo modifikovaný kód) bez súhlasu zakázané. Bez záruky.

Rozšírené: 1) Ne-exkluzívne, neprenosné. 2) Lokálne úpravy, súkromné forky povolené. 3) Zakázané: resale, verejné reposty, bundling, SaaS generátory bez povolenia. 4) Prípadné budúce atribučné prepínače dobrovoľné (ak neexistujú iné dohody). 5) "As is". 6) Pre-1.0 možné breaking zmeny. 7) Porušenie = ukončenie licencie.

Obchodné otázky / bundling: doplň kontakt.

## 11. Poznámky Autora
0.9.1-pre: zlúčený sub glow, dual konfety, milestone toggle, výkon.  
0.9.2-pre: ambient shine, heart mód, zlepšené glow.  
0.9.3: FINAL auto contrast + event odolnosť (fallback pre suby bez snapshotu, robustné parsovanie darov, trimming duplicitných tip ID, ignorovanie nulových donátov).
0.9.3-pre: Smart Auto Contrast, dokumentácia, font fallback heuristika, throttle percent.
1.0.0: cieľ – komerčne pripravená verzia.

## 12. FAQ
Otázka: Prečo nie samostatné nastavenia pre sub glow?  
Odpoveď: Jednoduchšie ladenie, konzistentný vzhľad.

Otázka: Percento po level up je stále vysoké?  
Odpoveď: Je absolútne voči cieľu aktuálneho levelu, neresetuje sa.

Otázka: Prečo bar zmení farbu pri evente?  
Odpoveď: Dočasné vizuálne prepojenie s glow, potom návrat.

Otázka: Veľký donate preskočil viac levelov?  
Odpoveď: Oslaví sa iba prvý novo-dosiahnutý level.

Otázka: Vypnúť správu o dokončení?  
Odpoveď: `goalCompleteDisplayMode` = none.

Otázka: Výkon a konfety?  
Odpoveď: Throttle + limit držia strop; zníž preset ak treba.

Otázka: Custom font nefunguje?  
Odpoveď: Fallback heuristika prepne na Space Mono a v debug móde zaloguje varovanie.

Otázka: Replace vs flash?  
Odpoveď: Replace drží riadok počas celého času; flash sa rýchlejšie vráti.

---
*Prepared for dual-language streaming setups – focus on fields, not manual code edits.*

---

End of README.