# Multi-CTA Popup Widget (v0.8.2)

Languages: [English](#english) | [Slovensky](#slovensky)

---
## English

### Overview
A lightweight, configurable rotating Call-To-Action (CTA) widget for StreamElements overlays. Define up to 6 slots (follow, join, donate, subscribe, promo, custom) and let them rotate at a fixed interval with selectable animation styles and theming.

### Key Use Cases
- Promote multiple social destinations without clutter
- Periodically remind viewers of a support action (donate / subscribe)
- Rotate limited‑time campaign or sponsor highlight
- Present localized or thematic CTAs uniformly

### Feature Matrix
| Capability | Status |
|------------|--------|
| Up to 6 slot rotation (sequential) | ✅ |
| Per-slot: type, text, button label, primary color | ✅ |
| Per-slot: default or custom icon + toggle | ✅ |
| Animation style variants (6) | ✅ ("extended" now alias of bounce) |
| Idle mid-cycle shine effect | ✅ (toggle) |
| Position presets + offset tiers | ✅ |
| Border / shadow / rounding toggles | ✅ |
| External field schema (`fields.json`) | ✅ |
| Debug helper (`multiPopupDebug`) | ✅ |
| Auto-contrast / highlight adjustment | 🚧 (planned – 0.8.x) |
| Weighted / random rotation | ❌ (roadmap candidate) |
| Scheduling by time-of-day | ❌ (roadmap candidate) |
| Analytics / tracking | ❌ (out of scope) |

### Field Reference
Fields are defined externally (upload `fields.json` into the widget editor if not auto-imported). Pattern-based naming avoids duplication.

Global Settings (subset):
- `rotationIntervalSeconds`: Seconds between popup starts
- `showDurationSeconds`: Seconds each popup remains visible
- `animationStyle`: One of `extended|bounce|move|fade|slide|pop` (extended remaps to bounce)
- `positionVertical`: `top|bottom`
- `positionVerticalOffset`: `near-edge|mid-offset|deep-offset`
- `positionHorizontal`: `left|center|right`
- `widgetBorderEnabled`, `widgetShadowEnabled`, `widgetRoundedCorners`, `buttonRoundedCorners`
- `idleShineEnabled`
- `baseBackgroundColor`, `baseTextColor`, `baseHighlightColor`
- `autoContrast` (planned effect; currently no-op)
- `debugMode`

Per Slot (repeat for 1..6 using index N):
- `slotNEnabled`
- `slotNType` (e.g. `instagram`, `discord`, `donate`, `promo`, `custom`)
- `slotNText` (HTML allowed; use `<span class="hl">` for highlight)
- `slotNButtonText`
- `slotNPrimaryColor`
- `slotNUseDefaultIcon` (bool)
- `slotNIconOverride` (raw inline SVG or empty)
- `slotNButtonShowIcon` (bool)

### Animation Styles
| Key | Behavior |
|-----|----------|
| extended | (legacy) alias of bounce |
| bounce | Smooth elastic bounce (unified) |
| move | Subtle slide upward |
| fade | Pure opacity fade-in |
| slide | Longer travel from off-screen space |
| pop | Quick scale from 0.7 → 1 |

Exit uses a unified `hideOut` animation.

### Accessibility
- Container `role="status"` + `aria-live="polite"` prevents interrupting screen reader context.
- Hidden state toggled via `aria-hidden` when off-screen.
- Planned: optional contrast assist (.low-contrast class) when auto-contrast is enabled.

### Debug & Testing
Open browser dev tools console:
- `multiPopupDebug()` → returns timing + slot state
- `forceShowPopup(index?)` → immediately show next (or specific) enabled slot (0-based among enabled)
- `forceHidePopup()` → hide early
- `togglePopupEnabled()` → enable/disable cycle
- `listWidgets()` → console table of slot definitions

### Limitations / Exclusions
- No persistence or weighting (keeps mental model simple)
- No analytics or tracking pixels
- No automatic seasonal theming logic
- No time-of-day schedule (design simplicity)

### Roadmap Snapshot
See `ROADMAP.md` for detailed table. Near term: contrast, lightweight shuffle mode, action hooks.

### Installation
1. Create a new StreamElements Custom Widget.
2. Paste `popup.html`, `popup.css`, and `popup.js` into the widget tabs.
3. Import / map fields using contents of `popup.fields.json`.
4. Adjust global + slot fields; enable desired slots.
5. Position overlay source above main scene items.

### Versioning
- Semantic-lite: Minor for feature sets / Patch for cleanup.
| Current: 0.8.2 (theming & polish: gradients, icon expansion, pulse, unified bounce).

### License
See `EULA.txt` for tiered licensing (Personal / Creator+ / Commercial). Attribution appreciated but not required for Personal tier.

---
## Slovensky

### Prehľad
Ľahký a flexibilný widget pre rotujúce CTA (výzvy k akcii) v StreamElements. Môžeš definovať až 6 slotov (follow, join, donate, subscribe, promo, custom) a nechať ich rotovať v pevnom intervale s výberom animácie a témovania.

### Hlavné Použitia
- Propagácia viacerých sociálnych sietí bez zahltenia overlay-u
- Pravidelné pripomenutie podpory (donate / subscribe)
- Rotácia kampane alebo krátkodobého promo
- Konzistentné CTA pre rôzne jazyky alebo témy

### Funkčný Prehľad
| Funkcia | Stav |
|---------|------|
| Rotácia až 6 slotov | ✅ |
| Per-slot typ, text, farba, label tlačidla | ✅ |
| Per-slot ikona (default/custom + toggle) | ✅ |
| Varianty animácie (6) | ✅ |
| Idle shine efekt | ✅ |
| Pozícia (kombinácie + offset) | ✅ |
| Border / shadow / zaoblenia | ✅ |
| Externá schéma polí (`fields.json`) | ✅ |
| Debug helper (`multiPopupDebug`) | ✅ |
| Auto-kontrast | 🚧 (plánované) |
| Váhovaná / náhodná rotácia | ❌ |
| Časové plánovanie | ❌ |
| Analytika / tracking | ❌ |

### Polia (Fields)
Globálne kľúčové premenné (anglické názvy v schéme):
- `rotationIntervalSeconds`, `showDurationSeconds`
- `animationStyle`
- `positionVertical`, `positionVerticalOffset`, `positionHorizontal`
- `widgetBorderEnabled`, `widgetShadowEnabled`, `widgetRoundedCorners`, `buttonRoundedCorners`
- `idleShineEnabled`
- `baseBackgroundColor`, `baseTextColor`, `baseHighlightColor`
- `autoContrast`, `debugMode`

Per-slot (1..6):
- `slotNEnabled`, `slotNType`, `slotNText`, `slotNButtonText`, `slotNPrimaryColor`
- `slotNUseDefaultIcon`, `slotNIconOverride`, `slotNButtonShowIcon`

### Animácie
Rovnaké kľúče ako v EN sekcii (`extended`, `bounce`, `move`, `fade`, `slide`, `pop`). `hideOut` pri skrytí.

### Prístupnosť
- `role="status"` + `aria-live="polite"` pre neintruzívne oznamy.
- `aria-hidden` = true keď je widget skrytý.
- Budúce: auto-kontrast.

### Debugovanie
- `multiPopupDebug()` – stav a časovanie
- `forceShowPopup(index?)` – okamžité zobrazenie
- `forceHidePopup()` – schovanie
- `togglePopupEnabled()` – zap / vyp rotácie
- `listWidgets()` – prehľad slotov

### Obmedzenia
- Bez váh, analytiky a sezónnej logiky
- Žiadne plánovanie podľa času

### Roadmap
Pozri `ROADMAP.md`.

### Inštalácia
1. Nový Custom Widget v StreamElements.
2. Vložiť `popup.html`, `popup.css`, `popup.js`.
3. Načítať definíciu polí (`popup.fields.json`).
4. Nakonfigurovať globálne a slotové polia.

### Licencia
Pozri `EULA.txt`. Osobné použitie voľné (dodrž podmienky). Komerčné použitie vyžaduje správny tier.

---
Updated for version 0.8.2