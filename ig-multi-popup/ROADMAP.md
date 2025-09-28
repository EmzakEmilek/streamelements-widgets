# Multi-CTA Popup Widget Roadmap

## Vision
Provide a flexible, low-overhead rotating Call-To-Action (CTA) surface for stream overlays that is:
- Fast to understand & configure
- Visually consistent with modern broadcast aesthetics
- Accessible (ARIA polite updates, planned contrast utilities)
- Extensible without code edits (field-driven)

## Current (0.8.2)
- 6-slot sequential rotation
- Animation style variants (legacy extended -> bounce alias)
- Idle shine mid-cycle effect
- Base theming + per-type gradients & icon set
- Icon pulse micro-animation
- Debug API (`multiPopupDebug`) for timing/state insight

## Near-Term (0.8.x)
| Candidate | Status | Notes |
|-----------|--------|-------|
| Auto text & highlight contrast heuristic | Planned | Compute luminance ratio; apply `.low-contrast` class or adjust colors |
| Optional skip of empty / disabled slots without delay | Planned | Minor timing refinement |
| Button action hooks (custom URL / command placeholders) | Investigating | Exposed via fields cleanly |
| Soft randomization mode (shuffle once per full cycle) | Considering | Avoid repetition bias |

## Mid-Term (0.9.x)
| Candidate | Status | Notes |
|-----------|--------|-------|
| Weighted slot rotation | Considering | Only if demand; complexity vs. clarity tradeoff |
| Time-of-day schedule windows | Considering | Guard against overlay clutter at certain hours |
| Grouped theming presets | Considering | Quick style switching (light/dark/neon) |
| Localization field group | Considering | Multi-language per slot text variations |

## Longer-Term / Experimental
| Idea | Status | Rationale |
|------|--------|-----------|
| Trigger-based display (chat command / donation event) | Exploring | Would require event bridge beyond passive rotation |
| Adaptive frequency (reduce when no interaction) | Exploring | Needs viewership / interaction metrics—out of scope now |

## Explicitly Out of Scope / Won't Add (for clarity)
| Feature | Reason |
|---------|--------|
| Full analytics tracking | Privacy & complexity overhead |
| A/B testing harness | Out of scope for lightweight overlay widget |
| Deep seasonal theming engine | Encourages code bloat; keep styling user-driven |
| Heavy 3D / WebGL animation | Performance risk for browser sources |
| Persistent local storage weighting | Unnecessary for simple rotation |

## Quality / Technical Notes
- Maintain < 25KB combined (HTML+CSS+JS) uncompressed target (currently well under)
- Avoid layout thrash: use transform/opacity for animations only
- Provide deterministic cycle timing (no drift across hours)

## Contribution Guidance
Pull requests should:
1. Include rationale & before/after summary
2. Avoid adding external runtime dependencies
3. Include docs update (README + CHANGELOG entry placeholder)
4. Not break existing field names (treat as external API)

---
Last updated for version 0.8.2
