<div align="center">

# StreamElements Widgets Bundle (Private Monorepo)

Unified premium StreamElements custom widgets with consistent theming, performance safeguards, accessibility helpers, bilingual (EN/SK) docs, and scripted packaging.

</div>

## Widget Matrix
| Widget | Version | Folder | Core Highlights | Docs |
|--------|---------|--------|-----------------|------|
| Donation & Subgoal Bar | 0.9.3-pre | `donogoal subgoal bar/` | Multi-level goals, merged glow engine, per-event confetti, ambient shine, Smart Auto Contrast | [README](donogoal%20subgoal%20bar/README.md) |
| Raid Terminal Tracker | 0.2.0 | `RAID Terminal Tracker/` | Raider qualification logic, delayed reveal, ASCII tree, activity stats | [README](RAID%20Terminal%20Tracker/README.md) |
| IG Multi-Popup | 0.6.0 | `IG POP-UP Widget/` | Rotating social / CTA set, stable interval scheduling, random/sequence modes | [README](IG%20POP-UP%20Widget/README.md) |

Accent + background design language: default accent `#ff7500`, background `#2d2d2d` (per-widget overrides via fields).

## Quick Usage
1. In StreamElements Overlay → Create Custom Widget.
2. Paste the widget's `*.html / *.css / *.js / *.fields.json` (if fields file present) contents.
3. Configure via Fields (avoid code edits for production overlays).
4. Use console helpers (see individual widget README docs) to simulate events.

## Packaging (Release Zips)
PowerShell script `package-widgets.ps1` (current state: single global version, root-level files only) can bundle triads (`*.html / *.css / *.js`) that sit directly in the repository root into `dist/<version>/<widget>-v<version>.zip`.

Current limitation: our widgets now live inside subdirectories, so the script will NOT find them yet. Two temporary options until refactor:
- Manual: Copy a widget's three files to the repo root, run the script, then discard the copies.
- Manual Zip: Use built‑in OS compression on each widget folder (keep original filenames) and rename to `<kebab-name>-v<version>.zip`.

Planned refactor (soon):
- Scan subdirectories recursively.
- Detect per‑widget versions from JS header comment (`/* Version: X */`).
- Produce individual zips with their own versions (no global version arg required).

Example (once refactored will look like):
```
dist/raid-terminal-tracker/raid-terminal-tracker-v0.2.0.zip
dist/donation-subgoal-bar/donation-subgoal-bar-v0.9.3-pre.zip
dist/ig-multi-popup/ig-multi-popup-v0.6.0.zip
```

## Accessibility
- Smart Auto Contrast (Donation/Subgoal Bar): runtime luminance check adds subtle text shadows under ~3.8:1 contrast.
- Clear motion & throttled animation (no continuous layout thrash).

## Performance Safeguards
- Confetti throttle (250ms) & active cap (300 pieces) to prevent overload.
- Glow engine cancellable pulses (prevents flicker stacking).
- Pruning in Raid Terminal to keep DOM nodes <= maxActivities.

## Roadmap Snapshot (Internal)
- Adaptive widths (non‑1920px) for donation bar.
- Event intensity auto scaling.
- JSON-driven CTA definitions for popup.
- Optional minimal HUD mode.

## Versioning Strategy
Pre-1.0 semantic versions per widget (independent). Tag pattern examples:
```
git tag donationbar-v0.9.3-pre
git tag raidterminal-v0.2.0
git tag igpopup-v0.6.0
```
Push tags for release packaging automation.

## Licensing / Distribution
Private proprietary source. Each widget ships with an `EULA.txt` (Donation & Subgoal Bar already present). No unauthorized redistribution of raw or modified source. Commercial bundles require explicit written permission.

## Contributing (Internal Team)
- Keep feature commits scoped with prefix: `dono:`, `raid:`, `ig:`.
- Avoid cross-widget coupling except for shared patterns documented in INTERNAL_NOTES (to add).
- Run packaging script before tagging to verify triads.

## Testing Shortcuts
Each widget README lists any console helpers (e.g. event simulators). No central testing doc is kept—avoid duplication.

## Slovenský Súhrn
Balík vlastných StreamElements widgetov (dono/sub bar, raid terminál, IG rotačný popup) so zjednotenou témou, výkonovými ochranami a A11Y (auto kontrast). Každý widget má vlastný README v EN/SK.

## Legal
© 2025 All Rights Reserved. Internal private monorepo – not for public redistribution.
