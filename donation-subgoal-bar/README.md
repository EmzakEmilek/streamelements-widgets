# Donation & Subgoal Bar Widget (v0.9.3-pre)

English | [Slovensky](#slovensky)

Unified donation/sub glow, per-event confetti groups, milestone toggle, performance safeguards, and cleaned documentation.

## Resolution / Layout Note
This pre-release is tuned for Full HD width (1920px). Other widths are currently unsupported and may misalign. Adaptive layouts are on the roadmap (see Roadmap section).

## Quick Start
1. Create a new Custom Widget in StreamElements and paste the four files (`streamelements.html`, `.css`, `.js`, `.fields.json`).
2. In Fields: set Levels (titles + goals). They auto-sort ascending.
3. Configure Donation/Sub glow (merged), Goal Complete glow, and optional confetti (micro vs goal).
4. Adjust text animation, progress bar, colors, fonts, icons.
5. Send Test Events (Tip + Subscription) to verify glow, confetti, goal advancement, and scrolling latest donation.

Optional: Enable Debug Logging to view internal state in the browser console.

## Overview
A StreamElements custom widget combining:
- Multi-level donation goals (up to 10, auto-sorted)
- Subscriber milestone tracker (toggle milestone mode)
- Latest donation line with automatic scroll on overflow
- Animated text (typewriter / fade / off)
- Merged Donation & Subscription glow + separate Goal Complete glow
- Per-event confetti: micro burst (Donation/Sub) and larger goal-complete celebration
- Optional donation percent (relative to active level goal)
- Thin progress bar (low / medium / strong intensity) with layered gradient & glow
- Performance safeguards (confetti throttle + cap; glow cancellation)
- Duplicate tip protection & resilient event flow

## Files
| File | Purpose |
|------|---------|
| `streamelements.html` | Markup container used by StreamElements overlay engine |
| `streamelements.css`  | Styling, variables, animations |
| `streamelements.js`   | Core logic: events, rendering, glow & confetti engine |
| `streamelements.fields.json` | Field definitions (widget configuration UI) |

## Field Summary
(Only key interactive ones listed)

### Levels
`levelsCount` (1–10) + `levelNTitle` / `levelNGoal` – levels auto-sort ascending by goal.

### Subscribers
`enableSubGoalMilestones` toggles milestone formatting. When ON displays `current / nextMilestone` using `milestoneStep` (1,3,5,10,20,50,100). When OFF shows raw subscriber count.

### Goal Completion
- `goalCompleteDisplayMode`: Replace | Flash | None
- `goalCompleteLabel`: Prefix for completed level (default `COMPLETED`)
- `goalCompleteSeconds`: Display time (replace/flash)
- `allGoalsCompleteMessage`: Text when the last level is fully reached

### Text
- `textAnimationMode`: typewriter | fade | off
- `textCaseMode`: lower | UPPER | normal
- `subsLabel`, `latestDonationLabel`: Custom labels

### Glow ([GLOW])
- Donation & Subscription share one configuration (Donation/Sub) to reduce duplicate tweaking.
- Goal Complete has its own settings (often more intense).
- Color, Duration (ms), Style (Soft→Extreme), Pulses (1–5).
- Style intensity map: 1=1, 2=1.4, 3=2, 4=3, 5=4.
- Pulses fire sequentially with an automatic gap (~10% duration; min 80ms).
- Goal Complete glow internally gets a 1.2× amplitude multiplier.

### Progress
- `showDonationPercent` – append (NN%) inline after amount.
- `showDonationProgressBar` – toggles thin bar under main bar.
- `progressBarIntensity` – low (1px) | medium (2px) | strong (3px) thickness + glow.
- `progressBarColor` / `progressBarGlowColor` – fill + glow colors.
- `progressBarEmptyColor` – unfilled segment color.

Details: intensity presets map to thickness & glow strength. Bar uses layered gradient core + sheen. No end-cap (minimalist). Percent formula: (accumulated / activeLevelGoal) * 100 (clamped 0–100). Large single donations jumping levels recalc instantly.

### Confetti ([FX])
Two independent groups:
- Micro (Donation/Sub): light, frequent bursts.
- Goal Complete: larger celebratory burst.
Preset dropdowns (Few/Medium/Many etc.) map to numeric counts, fall distance, fade time, speed. Palettes: classic, warm, cool. Internal throttle (250ms) + active piece cap (300) prevent performance degradation.

### Colors / Style
Element color pickers, background, font preset or custom Google Font, font size & weight, icon mode (system/twitch/heart/hidden), icon size & color.
NEW 0.9.2-pre: Heart single-icon mode.

### Accessibility (NEW 0.9.3-pre)
`enableSmartAutoContrast` (on by default) analyzes each configured text color against the background (`--bar-bg-color`).
If the contrast ratio drops below ~3.8:1 (slightly relaxed from WCAG AA 4.5:1 for small text to preserve stylistic flexibility) a subtle layered text shadow is applied (per-target class: goal / subs / donation) to lift readability without fully overriding your chosen palette.
Disable only if you intentionally want ultra-low contrast aesthetics for design reasons.

### Debug
`debugMode` logs applied field data + glow triggers. Use browser dev tools (F12) → Console.

### Ambient (0.9.2-pre)
`ambientShineInterval` (seconds, 0=off). After idle silence >= interval a soft sweep + gentle icon pulse plays. Min effective 5s. Resets on any donation/sub/goal completion or session sync.

## Glow Engine Notes
- New event cancels in-progress pulses (prevents stacking flicker).
- Automatic gap (no interval field needed).
- Duplicate tip IDs filtered via internal Set.
- Subscription events reuse Donation/Sub glow configuration.

## Event Flow
1. onWidgetLoad – apply fields & initial session sync.
2. onSessionUpdate – silent sync (no duplicate animations).
3. onEventReceived – donation/sub triggers micro confetti + glow; goal completion triggers celebration (glow + large confetti).
4. Goal completion: compare previous vs new active level index.

## Typewriter Behavior
- When a goal completes in `replace` mode: completion line animates, locks, then original next-goal line re-animates after timeout.

## Customization Tips
- Subtle: Style Soft/Medium + Pulses 1
- Celebratory: Goal Complete Style Very/Extreme + Pulses 3–5
- Lightweight micro confetti: Few + Short fall + Fast speed
- Long celebration: Goal Complete Many + Long fall + Long fade

## Safety / Edge Cases
- Missing/invalid numbers are clamped or defaulted.
- Levels missing title OR goal are skipped.
- Confetti spawns skipped if cap reached.
- Large donations passing multiple levels: only first newly completed level triggers celebration (avoids stacked spam).

## Quick Troubleshooting
| Issue | Cause | Fix |
|-------|-------|-----|
| Only one glow pulse | Pulses set to 1 | Increase Pulses dropdown |
| No glow on donation | Glow disabled | Enable Donation/Sub glow |
| Wrong font | Custom font name typo | Match exact Google Fonts name |
| Goal line not updating | In replace window | Wait goalCompleteSeconds or set mode to flash |
| Percent missing | Disabled or replace message active | Enable field or wait replace timeout |
| Low visibility | Intensity = low | Increase to medium/strong |
| Empty bar hard to see | Empty color too close to background | Adjust `progressBarEmptyColor` |
| Micro confetti missing | Disabled or preset minimal | Enable / raise presets |
| Performance dip | Excess celebrations | Lower confetti presets or pulses |

---

---

# Slovensky (v0.9.3-pre)

## Prehľad
StreamElements widget spájajúci:
- Multi-level donation goal (max 10, auto zoradenie)
- Sub milestone tracker (prepínateľný formát)
- Posledná donácia s auto-scroll pri pretečení
- Animovaný text (typewriter / fade / off)
- Zlúčený Donation/Sub glow + samostatný Goal Complete glow
- Konfety micro (donation/sub) a veľké pri dokončení goalu
- Percento (voči aktívnemu levelu) + tenký progress bar (low/medium/strong)
- Ochrany výkonu (limit konfiet, throttle) a filtrovanie duplicitných tipov

## Polia – kľúčové
### Levely
`levelsCount` + `levelNTitle` / `levelNGoal` – automaticky sa zoradia.

### Subscriberi
`enableSubGoalMilestones` – ON: `aktuálne / ďalší milestone`, OFF: iba číslo. `milestoneStep` = veľkosť kroku.

### Dokončenie levelu
- `goalCompleteDisplayMode`: replace | flash | none
- `goalCompleteLabel`: Prefix (predvolený `COMPLETED`)
- `goalCompleteSeconds`: Čas zobrazenia
- `allGoalsCompleteMessage`: Text po poslednom leveli

### Text
`textAnimationMode`, `textCaseMode`, `subsLabel`, `latestDonationLabel`.

### Glow ([GLOW])
- Donation a Sub zdieľajú jednu konfiguráciu.
- Goal Complete má vlastnú intenzitu.
- Style (1–5) mapované na interné multiplikátory (1,1.4,2,3,4).
- Pulses sekvenčné, malá automatická medzera. Goal Complete bonus 1.2×.

### Konfety ([FX])
Micro (donation/sub) vs Goal Complete (väčšie). Presety -> čísla (Count/Fall/Fade/Speed). Throttle 250ms, limit 300.

### Progres
- `showDonationPercent` – pridá (NN%).
- `showDonationProgressBar` – zapne progress bar pod panelom.
- `progressBarIntensity` – low (1px) | medium (2px) | strong (3px) – ovplyvňuje hrúbku aj glow.
- `progressBarColor` / `progressBarGlowColor` – farba + žiara.
- `progressBarEmptyColor` – farba nevyplnenej časti.

Detaily: Intenzita = predvolené hrúbky + sila žiary. Žiadny cap – minimalistická čiara so sliding core gradientom.
Vzorec: (celkový nazbieraný progres / goal aktuálneho levelu) * 100 (clamp 0–100). Pri prechode vyšším levelom percento nepreráža nad 100%; vizuálne sa adaptuje na nový cieľ.

### Štýl / Farby
Farby prvkov, pozadie, font preset alebo vlastný, veľkosť a hrúbka písma, ikony (system/twitch/heart/skryté), veľkosť ikon.

### Prístupnosť (NEW 0.9.3-pre)
`enableSmartAutoContrast` (default ON) vyhodnotí kontrast farieb textu voči pozadiu. Pri pomere pod ~3.8 aplikuje jemný tieň (text-shadow) pre lepšiu čitateľnosť. Vypni iba ak zámerne chceš nízky kontrast.

### Debug
`debugMode` vypisuje dáta a glow parametre do konzoly.

## Glow Engine
- Nový event ruší pulzy.
- Medzera automatická.
- Duplicitné tip ID ignorované.
- Sub používa Donation nastavenia.

## Tok Udalostí
1. onWidgetLoad – aplikácia polí & sync
2. onSessionUpdate – tichá sync
3. onEventReceived – donation/sub → glow + micro konfety; goal complete → celebration konfety + glow
4. Kontrola dokončenia levelu

## Písací Stroj
Pri dokončení levelu (replace): najprv animácia dokončenia, potom animácia ďalšieho cieľa.

## Odporúčania
- Jemný efekt: Style Soft–Medium, Pulses 1
- Výrazná oslava: Goal Complete Style Very–Extreme, Pulses 3–5

## Riešenie Problémov
| Problém | Príčina | Riešenie |
|---------|--------|----------|
| Len jeden pulz | Pulses = 1 | Zvýš | 
| Žiadny glow | Disabled | Zapni Donation/Sub glow |
| Žiadne micro konfety | Disabled / nízke presety | Zapni alebo zvýš |
| Zlý font | Názov zle | Skontroluj presný názov |
| Goal text "zamrznutý" | Replace režim | Počkaj alebo flash |
| Percento chýba | Vypnuté / replace | Zapni alebo počkaj |
| Málo výrazné | Intensity = low | Medium / Strong |
| Nevidno prázdnu časť | Empty color podobná | Zmeň farbu |
| Lag / FPS drop | Veľa konfiet / pulzov | Zníž count/speed |

---

## License & Attribution
Short Form
You may use and modify this widget for your own live stream overlays (personal or commercial streaming). Redistribution of the raw or modified source (paid or free) as part of an overlay pack, marketplace listing, SaaS, or automated generator is NOT permitted without explicit written permission from the author. Do not remove included attribution notes if added later. No warranty; use at your own risk.

Extended (EULA‑style Summary)
1. Grant: Non‑exclusive, non‑transferable license for personal channel overlays (including monetized streams / sponsorships).
2. Allowed: Local modifications, private forks, styling changes, internal team use for the same channel brand.
3. Restricted: Resale, bundling, redistribution, public reposting of source, automated hosting, or including in commercial template libraries without permission.
4. Attribution: If an optional attribution toggle/logo is introduced in future versions, leaving it enabled is appreciated but not mandatory (unless separate commercial terms are agreed).
5. Liability: Provided “as is” without guarantees of fitness or uptime; you accept all risk.
6. Updates: Pre‑1.0 changes may introduce breaking adjustments; pin a version if stability is required.
7. Termination: Breach of restricted use voids the license; you must remove derivative distributions.

For licensing inquiries or commercial bundling rights: (add contact / link here).

Roadmap Link: See `TODO_ROADMAP.txt` in repository for planned features (Smart Auto Contrast, Event Intensity Scaling, Ambient Fallback Pulse, adaptive layouts).

## Author Notes
Refactored in 0.9.1-pre: merged sub glow, grouped confetti (micro vs goal), sub milestone toggle, tightened performance safeguards, cleaned docs. 0.9.2-pre adds subtle idle ambient shine + heart icon mode (now with stronger but crisp icon motion—filters removed to avoid bar blur). 1.0.0 reserved for first commercial-ready release.

## FAQ
Q: Why no separate subscription glow?  
A: It's intentionally merged with Donation/Sub to simplify tuning.

Q: Difference between micro and goal confetti?  
A: Micro = small burst for every donation/sub; Goal = larger celebration once per completed level.

Q: Percent high after advancing?  
A: Always relative to the active level's target; recalculates immediately when level changes.

Q: Can I hide milestone formatting?  
A: Turn off `enableSubGoalMilestones`.

Q: Performance safety?  
A: 250ms spawn throttle + 300 active piece cap; excess pieces skipped.

Q: Multiple levels completed at once?  
A: Only first newly completed level triggers celebration to avoid spam.

Q: Font fallback?  
A: If custom font fails to load a preset fallback (Space Mono) is applied.

Q: Confetti heavy?  
A: Lower presets (Few/Short/Short) or disable micro while keeping goal-complete.
Accent: #ff7500 | Pozadie: #2d2d2d | Text: #ffffff | Goal Complete: #00ff00

### 🛠 Robustnosť
- Filtrovanie duplicitných tipov podľa ID.
- Nenahrádza lokálny progres neúplnými session dátami.
- Bez memory leakov pri rýchlych zmenách.

### 💡 Tipy
| Cieľ | Úprava |
|------|--------|
| Rýchlejší text | Zníž `ANIMATION_CONFIG.typingSpeed` |
| Väčšie písmo | Zvýš field `fontSize` |
| Bez glow | Vypni príslušné glow toggly |

### 🐛 Riešenie Problémov
- Glow nejde? Over či je toggle povolený.
- Text neskroluje? Pravdepodobne sa zmestí – je to zámer.
- Sub milestone nesedí? Skontroluj field `subMilestone`.

---
*Prepared for dual-language streaming setups – edit fields, not code.*

## FAQ (Progress Additions)
Q: Prečo percento ostáva vysoké po prechode na nový level?
A: Percento je absolútne voči cieľu aktuálneho levelu – neresetuje sa. Pri zmene levelu sa prepočítava len menovateľ (goal).

Q: Can I show percent inline instead of separate?
A: Disable `showDonationPercent` and the system will append (NN%) to the goal line text automatically.

Q: Where did the end cap go?
A: Removed for a cleaner minimalist line. Width change alone indicates progress.

Q: Why does the bar briefly change color during events?
A: It temporarily adopts the active glow color (donation, subscription, goal complete) then smoothly reverts for visual linkage.

Q: The bar froze during goal-complete message.
A: In replace mode the textual line is locked but the percentage logic still tracks; visual width remains accurate for the active level.

Q: Performance impact?
A: Negligible. DOM writes are throttled unless percent changes by ≥0.25%.