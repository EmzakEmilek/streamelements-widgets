# Root Changelog (Aggregate Overview)

High-level multi-widget timeline. Each widget maintains its own detailed `CHANGELOG.md` (where present).

## 2025-09-27
| Widget | Version | Summary |
|--------|---------|---------|
| Donation & Subgoal Bar | 0.9.3-pre | Smart Auto Contrast, ambient idle shine, merged donation/sub glow, per-event confetti groups |
| Raid Terminal Tracker | 0.2.0 | Raider qualification (message / silent event), delayed reveal, ASCII activity tree, pruning & stats |
| IG Multi-Popup | 0.6.0 | Stable rotation cadence, random/sequence modes, seasonal widget framework, text override fields |

## Version Tag Pattern
```
donationbar-v<ver>
raidterminal-v<ver>
igpopup-v<ver>
```

## Release Packaging
`package-widgets.ps1 -Version <ver>` creates triad zips under `dist/<ver>/`.

## Roadmap (Next Candidates)
- Adaptive widths (donation bar)
- JSON-driven widget registry for popup
- Intensity auto scaling
- Minimal HUD layout variant

---
### Archive (Historical Pre-Monorepo Notes)
The following section consolidates earlier internal version notes prior to per-widget semantic alignment.

#### Legacy Bundle 1.2.0 (2025-09-27)
Added: field skeletons, bilingual docs, testing helpers, silent raider qualification, glow toggles, popup rotation & overrides.
Changed: unified accent color (#ff7500), standardized raid terminal maxActivities=30, stable popup scheduling.
Removed: legacy auto-test blocks.
Internal: donation goal accumulation safety, duplicate donation ID filtering.

#### Legacy 1.1.x (Untracked)
Misc fixes & aesthetic adjustments pre-field system stabilization.

#### Legacy 1.0.0
Initial internal draft of three widgets.

---
Semantic versioning per widget (pre-1.0 may include breaking changes).
