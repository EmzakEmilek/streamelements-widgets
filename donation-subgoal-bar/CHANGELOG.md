# Changelog

## 0.9.3 (Stability & Event Resilience)
Finalized Smart Auto Contrast release plus production hardening for subscription & donation event handling.

### Added
- Fallback subscriber increment logic when `subscriber-total` snapshot absent in event payload (derives from last known count + gift quantity).
- Unified debug logging helper `LOG()` with consistent prefix.
- LRU-style trimming of processed tip IDs Set (prevents unbounded memory growth on very long streams).

### Changed
- Promoted version from `-pre` to stable minor 0.9.3 after validation of auto-contrast + ambient shine stack.
- Merged dual `onWidgetLoad` listeners into one (simpler lifecycle ordering for ambient shine scheduling).
- Donation parsing now routed through robust `parseAmount()` normalizer (handles €, spaces, commas, mixed locales).

### Fixed
- Cases where subscription events without accompanying session snapshot produced no visual update.
- Potential duplicate tip processing on rapid session+event race (extra guard + periodic Set trimming).
- Ignored non-positive donation payloads (edge anomalies / refunds) to avoid false celebratory FX.

### Internal
- Helper `getSessionSubscriberCount(detail)` centralizes extraction of subscriber totals.
- Added guard to skip FX & accumulation when parsed increment <= 0.
- Ambient setup moved directly into primary widget load path.

### Notes
- 0.9.4 scope (tentative): optional bits-to-goal inclusion, adaptive width groundwork, advanced error telemetry toggle.

---

## 0.9.3-pre (Smart Auto Contrast)
Added accessibility-oriented automatic contrast assist.

### Added
- Smart Auto Contrast (`enableSmartAutoContrast`, default ON): computes contrast ratio of each primary text color (goal, subs label/value, donation label/value) against background; if < ~3.8:1 applies a subtle layered text-shadow via per-role classes to lift readability while keeping your chosen color.

### Documentation
- README & Quick Start updated with Accessibility section / bullet.
- Formalized Full HD (1920px width) limitation note (already present in prior versions) as an explicit pre-1.0 constraint.

### Internal
- Helper utilities: `parseColor`, `relLuminance`, `contrastRatio`, `applySmartAutoContrast` exposed via debug util `recomputeAutoContrast`.
- Defensive try/catch around auto-contrast (fails silent if invalid color values).

### Notes
- Threshold set slightly below WCAG AA small-text 4.5 to avoid over-styling vibrant accent choices; may raise in future if adaptive layouts introduce larger text.
- Disable only if pursuing intentional stylistic low contrast.

### Next (candidates)
- Adaptive width support (non-1920 layouts).
- Event intensity auto-scaling.
- Optional minimal mode (reduced info density).

## 0.9.2-pre (Ambient Shine & Heart Icon)
Added low-impact idle visual polish.

### Added
- New field: `[FX] Ambient Shine Interval (s, 0=off)` triggers a subtle light sweep across the bar after a period with no donation/sub events (ignored if <5s or set to 0).
- Heart icon mode (`Icons Mode: Heart`) replacing system buttons with a single animated heart.
- Idle ambient animation briefly pulses/rotates the single icon (Twitch or Heart) only when using single-icon modes.

### Behavior
- Idle timer resets on any donation, subscription, goal-complete glow, or session update.
- Ambient effect is skipped while a glow pulse is actively styling the bar (simple heuristic: existing boxShadow present).

### Internal
- Hooked activity tracking into existing update helpers instead of adding extra DOM observers.
- Safeguard for small intervals (<5s) to avoid excessive animations.
- Heart icon drawn with lightweight path (no external assets).
 - Refined icon ambient animation for stronger motion while removing filter/drop-shadow blur to keep text crisp.

### Next (planned)
- Smart auto-contrast & adaptive intensity scaling (see `TODO_ROADMAP`).

## 0.9.1-pre (License & Pre-Release Housekeeping)
Added
- License & Attribution section with short + extended (EULA-style) terms.
- Separate `EULA.txt` file.
- Full HD resolution support notice (explicit 1920px tuning) in README.
- Roadmap link and explanation of pre-1.0 semantic versioning path.

Changed
- Version bump from 0.9.0-pre to 0.9.1-pre (documentation-only refinement, no functional logic changes).

Notes
- This is still a pre-commercial build. 1.0.0 remains reserved for first commercialization-ready release.

## 0.9.0-pre (Per-Event Confetti & Cleanup)
Added
- Per-event confetti configuration: separate micro (donation/sub) vs goal-complete groups (palette, count, fall distance, fall time, speed).
- Sub goal milestone toggle (`enableSubGoalMilestones`) to optionally show only raw subscriber count.
- Field reordering for clearer grouping (Levels → Sub/Milestones → Goal Complete → Text → Glow → Progress → Confetti Micro → Confetti Goal → Colors → Icons → Font → Debug).
- Grouped confetti preset mapping with backward compatibility for legacy flat fields.
- Documentation improvements (README / Quick Start) and concise function doc comments in JS.

Changed
- Merged Donation + Subscription glow settings into a single configuration block (subscription now uses donation glow fields).
- Progress bar & glow temporary color handling simplified.
- Refactored `triggerGlowEffect` to decouple confetti from glow toggles (confetti still fires if glow disabled).
- Cleaned CSS comments (removed legacy removal notes) and JS excessive legacy commentary.

Performance / Safety
- Confetti active piece cap retained (300) with throttle (250ms) to prevent overload.
- Goal celebration confetti now uses dedicated goal config instead of multiplier on micro config.

Removed
- Subscription-specific glow fields (kept only informational merge note).
- Large help textarea field (`_sk_help`).

Internal
- Added doc comments for major functions.
- Consolidated font application logic + failure heuristic.
- Simplified milestone completion detection gating by new toggle.

## 0.8.2 (Refined Progress Design)
- Progress bar moved below main bar spanning full width with luminous core gradient + 1px sheen.
- Percent now only shows inline in goal text when enabled (no separate element).
- Removed internal percent wrapper markup; simplified DOM & CSS.
- Added version bump in JS header (1.1.1).
- Removed progress cap element & all cap animation styles (clean minimal line).
- Replaced pixel-based height field with `progressBarIntensity` (low / medium / strong) mapping to 1px / 2px / 3px + matching glow strength.
- Added configurable `progressBarEmptyColor` for unfilled track segment.
- JS updated to drop legacy fields (`progressBarCapGlow`, `progressBarHeight`).
- Progress percent model switched to absolute (amount / active level goal) instead of per-level reset.
- Progress bar temporarily adopts active glow color (donation / subscription / goal complete) with smooth transition and automatic revert.

## 0.8.0 (Progress Percent & Bar)
- Added per-level donation percent (optional separate element or inline fallback when disabled)
- Added ultra-thin 2px progress bar with animated cap styles (None / Soft / Pulse / Wave)
- Added new fields: showDonationPercent, showDonationProgressBar, progressBarColor, progressBarGlowColor, progressBarCapGlow
- Cap automatically hides at 0% and 100% for visual cleanliness
- Percent recalculates within current level scope; resets on level advancement
- Exposed debug helpers: getLevelPercentRaw, getLevelPercentString, updateProgressVisual
- Minor README additions (FAQ, troubleshooting), extended help text

## 0.7.0 (Initial Public Draft)
- Added version header to JS (1.0.0).
- Simplified glow engine (token-based sequential pulses).
- Introduced Glow Style presets (Soft, Medium, Intense, Very Intense, Extreme) mapping internally to intensity scaling.
- Replaced legacy Range terminology with Style across fields & docs.
- Multi-level goals (auto-sorted) up to 10.
- Subscriber milestone tracking with dynamic next milestone.
- Typewriter / fade / off text animation modes with goal-complete replace or flash.
- Duplicate tip event protection.
- Per-element color customization + custom Google Font support.
- Removed legacy dark/light theme system (background color from field only).
- Added Quick Start guide and FAQ section in README.
- Cleaned comments and removed unused CSS glow keyframes.
