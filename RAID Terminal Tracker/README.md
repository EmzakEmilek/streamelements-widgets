# 🎯 Raid Terminal Tracker (v0.2.0)

Terminal-style raid activity feed widget for StreamElements with raider-only filtering, configurable delay, and live activity tree.

---
## ENGLISH VERSION

### ✅ Feature Highlights
| Category | Features |
|----------|----------|
| Timing & Visibility | Configurable delay after raid (default 17s), auto-hide duration (default 180s), test mode flag |
| Activity Tracking | Follows, subs (tier), donations, bits, hosts, extra raids, welcome messages |
| Raider Qualification | By post-raid chat message (default) or optionally via silent events (follow/sub/dono) |
| Filtering | Raider-only mode (toggle), message requirement (toggle), silent event qualification (toggle) |
| Display | ASCII-style tree connectors (├─ / └─), sequential animated line typing, scrollable feed |
| Stats | Follows counter, message counter, live elapsed timer |
| Theming | Accent / background color + font size via fields, CSS variables, retro terminal aesthetic |
| Testing | Exposed global functions for manual triggering |

### 🧾 Field Configuration (Overlay UI)
Field JSON skeleton is embedded in `raid-terminal.html`. Summary below:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| showDelaySeconds | number | 17 | Delay after raid before showing terminal |
| displayDurationSeconds | number | 180 | Visible duration before auto-hide |
| maxActivities | number | 30 | Max activity lines kept before pruning |
| onlyRaiders | checkbox | true | If true, show only actions from qualifying raiders |
| requireMessageToQualify | checkbox | true | Raider must speak in chat to count |
| acceptSilentEvents | checkbox | false | Allow follow/sub/dono to qualify without message |
| autoHide | checkbox | true | Auto-hide after duration passes |
| accentColor | color | #ff7500 | Highlight + cursor color |
| backgroundColor | color | #2d2d2d | Terminal background |
| fontSize | number | 14 | Base font size (px) |
| debugMode | checkbox | false | Verbose console logging |
| testMode | checkbox | false | Auto-spawn test raid after load |

### ⚙️ Runtime Behavior
1. Raid detected (`raid-latest`).
2. Snapshot of pre-raid chatters stored (for qualification logic).
3. After delay, terminal slides in and seeds initial welcome line.
4. Activities stream in with fast type animation; connectors adjust.
5. Stats (follows/messages) update in real time.
6. Auto-prunes oldest lines when above `maxActivities`.
7. Auto-hides after configured duration (if enabled).

### 🧮 Raider Qualification Logic
Default: A user becomes a raider when they send first post‑raid chat message AND were not in pre‑raid snapshot.
Optional: If `acceptSilentEvents` is true, a follow/sub/donation/bits/host event can also qualify them (still within detection window which equals displayDuration by default).

### 📦 Installation
1. Create a Custom Widget in StreamElements overlay.
2. Paste `raid-terminal.html`, `raid-terminal.css`, `raid-terminal.js` into HTML/CSS/JS tabs.
3. Adjust fields in the overlay UI instead of editing code (preferred).
4. Save overlay and test via console helpers.

### 🧪 Testing Helpers (Console)
```javascript
forceShowRaidTerminal();                 // Spawn test raid terminal
addTestActivity('follow', 'test_user');   // Add a fake follow
addTestActivity('sub', 'subscriber1');    // Add a fake sub
addTestActivity('donation', 'donor1');    // Add a fake donation
addTestActivity('bits', 'cheerer1');      // Add fake bits
forceHideRaidTerminal();                  // Hide terminal early
```

### 🎨 Color System (Unified)
| Token | Value | Purpose |
|-------|-------|---------|
| Accent | #ff7500 | Highlights, cursor, usernames |
| Background | #2d2d2d | Retro terminal panel |
| Text | #ffffff | Primary text |
| Scrollbar | #555 / #666 | Minimal scrollbar styling |

### 🔧 Global Functions
| Function | Description |
|----------|-------------|
| forceShowRaidTerminal(data?) | Manually start a raid session |
| forceHideRaidTerminal() | Hide and reset terminal |
| addTestActivity(type, user) | Append synthetic activity line |
| raidState | Live state object (inspect in console) |

### 📡 Required StreamElements Events
`raid-latest`, `follower-latest`, `subscriber-latest`, `tip-latest`, `cheer-latest`, `host-latest`, `message`.

### 🧠 Performance & Limits
- Fast typing effect uses short fixed intervals for minimal overhead.
- Pruning ensures DOM node count remains stable (<= maxActivities).
- No mutation observers or heavy loops; event-driven only.

### � Debug / Test Modes
Enable `debugMode` to log all field overrides & event payloads.
Enable `testMode` to auto-fire a synthetic raid ~1.5s after load.

### 💼 Monetization Guidance
Differentiators: raider qualification logic, silent event gating, ASCII tree styling, field-driven config.
Suggested price band: €250–400 (custom + branding + localization).

### 🧩 Common Adjustments
| Goal | Change |
|------|--------|
| Show faster | Reduce showDelaySeconds (e.g. 10) |
| Keep longer | Increase displayDurationSeconds (e.g. 300) |
| Show all chat | Set onlyRaiders = false |
| Qualify instantly | Set requireMessageToQualify = false & acceptSilentEvents = true |
| Reduce clutter | Lower maxActivities (e.g. 15) |

### 🔐 Edge Cases Handled
- Duplicate welcomes prevented via `seenChatters` set.
- Unknown game fallback to 'Unknown Game'.
- Multiple raid events ignored while one active (simple guard).
- Activity pruning with graceful fade.

---
## 🇸🇰 SLOVENSKÁ VERZIA

### ✅ Hlavné Funkcie
| Kategória | Funkcie |
|-----------|---------|
| Načasovanie | Konfigurovateľné oneskorenie po raide (17s), dĺžka zobrazenia (180s), test mód |
| Aktivity | Follow, sub (tier), donaty, bits, host, ďalšie raidy, privítania |
| Detekcia Raiderov | Podľa správy v chate (default) alebo tiché eventy |
| Filtrovanie | Iba raideri (prepínač), požiadavka správy, tiché kvalifikácie |
| Zobrazenie | ASCII strom (├─ / └─), animované riadky, scrollovateľné okno |
| Štatistiky | Počet followov, počet správ, živý čas |
| Téma | Accent / pozadie / veľkosť písma cez fields, retro terminal štýl |
| Testovanie | Globálne funkcie pre manuálne spustenie |

### 🧾 Konfigurácia Fieldov
| Field | Typ | Default | Popis |
|-------|-----|---------|-------|
| showDelaySeconds | number | 17 | Oneskorenie po raide pred zobrazením |
| displayDurationSeconds | number | 180 | Ako dlho ostane terminál |
| maxActivities | number | 30 | Max počet riadkov v zozname |
| onlyRaiders | checkbox | true | Zobraziť len akcie raiderov |
| requireMessageToQualify | checkbox | true | Raider musí poslať správu |
| acceptSilentEvents | checkbox | false | Povoliť kvalifikáciu follow/sub/dono bez správy |
| autoHide | checkbox | true | Automaticky skryť po čase |
| accentColor | color | #ff7500 | Farba zvýraznenia |
| backgroundColor | color | #2d2d2d | Pozadie terminálu |
| fontSize | number | 14 | Veľkosť písma (px) |
| debugMode | checkbox | false | Verbózne logy do konzoly |
| testMode | checkbox | false | Auto test raid po načítaní |

### 🔄 Princíp Fungovania
1. Príde raid event.
2. Uloží sa zoznam pôvodných chatterov.
3. Po oneskorení sa zobrazí terminál.
4. Nové aktivity sa animovane pridávajú.
5. Štatistiky sa priebežne aktualizujú.
6. Pri prekročení limitu sa najstaršie riadky odstraňujú.
7. Po čase sa terminál skryje.

### 🧮 Logika Raiderov
Štandard: Raider = nový chatter po raide, ktorý napíše správu.
Voliteľne: Tiché eventy (ak povolené) tiež kvalifikujú.

### 🧪 Testovacie Funkcie
```javascript
forceShowRaidTerminal();
addTestActivity('follow', 'tester');
addTestActivity('sub', 'subko');
addTestActivity('donation', 'darcaa');
forceHideRaidTerminal();
```

### 🎨 Farby
Accent: #ff7500 | Pozadie: #2d2d2d | Text: #ffffff

### 🔧 Riešenie Problémov
- Terminál sa nezobrazí? Over event `raid-latest` a či prebieha iba jeden aktívny raid.
- Nič nepribúda? Skontroluj filtre (onlyRaiders / requireMessage...).
- Chýbajú followy? Over či follower-latest je povolený v Datasources.

### 💼 Hodnota
Prémiový widget s logikou raider kvalifikácie, animáciami a konfigurovateľnými fieldami.

---
**Enjoy & customize — built for smooth raid hype!**

---
*If you need additional language packs or full multi-goal editing, open an issue or request an enhancement.*