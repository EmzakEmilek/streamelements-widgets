# Multi-CTA Popup Widget Changelog

## 0.8.2 (theming + polish)
### Added
- Per-type default gradients applied via `--btn-bg` CSS variable
- Expanded default icon set (instagram, discord, donate, merch, patreon, kofi, tiktok, youtube, x, threads, steam, newsletter, website, custom1, custom2)
- Larger button icon sizing (20px base, responsive 18px)
- Subtle icon pulse animation (`iconPulse` keyframes)

### Changed
- Unified former `extended` animation under new smooth bounce (legacy `extended` remapped to `bounce` class)
- Button text forced lowercase for consistent retro style
- Minimum banner width standardized (375px across breakpoints)

### Removed
- Redundant responsive min-width shrink (300px variant) to preserve layout consistency

### Pending (moved forward)
- Auto-contrast system (text / highlight luminance adjustment)
- Optional shuffle / soft-random rotation mode

### Notes
Patch focuses on visual differentiation & brand readiness; internal API (fields) unchanged (backward compatible). Existing `animationStyle: "extended"` values still work via remap.

## 0.8.1 (cleanup release)
### Added
- Formal removal of legacy `WIDGET_CONFIGS` system (slot engine is authoritative)
- Versioned header comment inside `popup.js`
- Documentation scaffolding tasks (README bilingual rewrite, style guide doc placeholder)

### Changed
- Internal JS simplified: dropped unused legacy rotation helpers (`getNextWidget`, `renderWidget`, etc.)

### Removed
- All remaining references to legacy predefined widget objects

### Pending (not part of 0.8.1 final scope but referenced)
- Auto-contrast heuristic for text & highlight (will target 0.8.2+ if approved)

## 0.7.0-dev (internal / unreleased)
### Added
- Slot-based architecture (up to 6 CTAs) with per-slot fields (text, type, colors, icon controls)
- New animation class system (`anim-extended`, `anim-bounce`, `anim-move`, `anim-fade`, `anim-slide`, `anim-pop`)
- Idle shine effect trigger mid-display
- External `fields.json` replacing inline field metadata in HTML
- Debug helper: `window.multiPopupDebug()` plus manual controls (`forceShowPopup`, `forceHidePopup`, `togglePopupEnabled`)

### Changed
- Unified stylesheet (`popup.css`) merging prior separate guide styles
- HTML structure reduced to generic container with ARIA attributes

### Removed
- Direct seasonal / promo weighting logic (seasonal examples kept only as legacy objects before full removal in 0.8.1)

## 0.6.0 (baseline legacy)
### Characteristics
- Single predefined CTA configuration inline in JS
- Simpler animation & styling (pre-refactor)
- No external field schema; limited customization

---

Release numbering policy: Minor increments denote structural or configurability changes; patch increments denote cleanups / non-breaking internal refactors. `-dev` suffix is used only for intermediate untagged development states.
