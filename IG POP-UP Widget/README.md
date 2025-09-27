# IG Multi-Popup Widget (Instagram / Social CTA) v0.6.0

Rotating social call-to-action popup for StreamElements with interval scheduling, multi-message rotation, and field-driven customization.

---
## ENGLISH VERSION

### 🎯 Key Features
| Category | Details |
|----------|---------|
| Rotation | Sequence or random order across enabled widgets |
| Widgets Included | Instagram, Discord, Donate, Subtember, Christmas (seasonal off by default) |
| Timing | Stable cadence based on last show timestamp (no drift) |
| Appearance | Slide-in / slide-out animations, button click simulation, username glow |
| Custom Text | Up to three popup text overrides via fields (popup1/2/3) |
| Theming | Accent + background + font size fields |
| Debug | Debug + test mode flags for quick iteration |

### 🧾 Field Configuration (from HTML skeleton)
| Field | Type | Default | Description |
|-------|------|---------|-------------|
| rotationMode | select | sequence | sequence or random widget order |
| intervalSeconds | number | 210 | Seconds between shows (cadence maintained) |
| showDurationSeconds | number | 16 | Visible time per popup |
| initialDelaySeconds | number | 15 | Delay before first popup (independent of interval) |
| accentColor | color | #ff7500 | Username highlight / accent |
| backgroundColor | color | #2d2d2d | Panel background |
| fontSize | number | 16 | Base text size (px) |
| debugMode | checkbox | false | Verbose logging |
| testMode | checkbox | false | Auto-show after load for preview |
| popup1Text | text | IG CTA default | Override Instagram text |
| popup2Text | text | Discord CTA | Override Discord text |
| popup3Text | text | Donate/Tertiary CTA | Override Donate text |

### 🔄 Scheduling Logic
The next popup delay = `intervalSeconds - (now - lastShowTime)` ensuring consistent spacing even if a previous popup was delayed. First popup timing can be shifted using `initialDelaySeconds` without affecting future cadence.

### 🧪 Testing Helpers (Console)
```javascript
forceShowPopup();            // Show next widget (rotation)
forceShowPopup('instagram'); // Force a specific widget id
forceHidePopup();            // Hide immediately
togglePopupEnabled();        // Enable/disable rotation
enableWidget('discord', false); // Disable one widget
listWidgets();               // Log all widget definitions
```

### 🛠 Common Adjustments
| Goal | Change |
|------|--------|
| Faster rotation | Lower intervalSeconds (e.g. 120) |
| Longer presence | Raise showDurationSeconds (e.g. 25) |
| Random variety | Set rotationMode = random |
| Disable seasonal | Ensure `christmas.enabled = false` (default) |

### 🎨 Theming Notes
CSS variables: `--accent-color`, background var applied via fields, plus internal widget theme colors (each widget supplies button gradient & primary color). Field accent overrides highlight username regardless of widget.

### ⚙️ Resilience
- Guard against double initialization with `isInitialized` flag.
- Timers cleared before rescheduling to prevent stacking.
- Rotation safe if some widgets disabled at runtime.

### 💡 Extension Ideas
- Add Twitch / TikTok widget objects.
- Add JSON textarea field for an arbitrary list of CTAs.
- Add per-widget enable/disable fields (current version relies on code changes for base set).

---
## 🇸🇰 SLOVENSKÁ VERZIA

### 🎯 Kľúčové Funkcie
| Kategória | Detaily |
|-----------|---------|
| Rotácia | Sekvenčná alebo náhodná |
| Zahrnuté Widgety | Instagram, Discord, Donate, Subtember, Christmas (sezónny) |
| Časovanie | Stabilný interval podľa lastShowTime (bez driftu) |
| Vzhľad | Slide-in / slide-out, simulovaný klik, glow používateľa |
| Vlastný Text | 3 override fieldy (popup1/2/3) |
| Téma | Accent, pozadie, veľkosť písma cez fields |
| Debug | Debug a test mód prepínače |

### 🧾 Konfigurácia Fieldov
| Field | Typ | Default | Popis |
|-------|-----|---------|-------|
| rotationMode | select | sequence | Poradie widgetov |
| intervalSeconds | number | 210 | Interval medzi zobrazeniami |
| showDurationSeconds | number | 16 | Dĺžka zobrazenia jedného popupu |
| initialDelaySeconds | number | 15 | Prvé oneskorenie po načítaní |
| accentColor | color | #ff7500 | Zvýraznenie mena |
| backgroundColor | color | #2d2d2d | Pozadie panelu |
| fontSize | number | 16 | Veľkosť textu (px) |
| debugMode | checkbox | false | Logovanie detailov |
| testMode | checkbox | false | Auto zobrazenie na začiatku |
| popup1Text | text | IG text | Vlastný text pre IG |
| popup2Text | text | Discord text | Vlastný text pre Discord |
| popup3Text | text | Donate text | Tretí CTA text |

### 🔄 Logika Intervalu
Ďalší popup sa naplánuje s ohľadom na čas od posledného zobrazenia: konzistentné rozostupy aj pri menších oneskoreniach.

### 🧪 Testovanie (Konzola)
```javascript
forceShowPopup();
forceShowPopup('discord');
forceHidePopup();
togglePopupEnabled();
listWidgets();
```

### 🛠 Bežné Úpravy
| Cieľ | Úprava |
|------|--------|
| Rýchlejšia rotácia | Zníž intervalSeconds |
| Dlhšie zobrazenie | Zvýš showDurationSeconds |
| Náhodné poradie | Nastav rotationMode = 'random' |
| Test pri štarte | Povoliť testMode |

### 🎨 Téma
Accent farba cez field; každý widget má vlastný gradient pre button. Font veľkosť cez `fontSize` field.

### 🧠 Robustnosť
- Žiadne dvojité inicializácie.
- Timer vždy resetovaný pred novým plánovaním.
- Bez memory leakov – iba jeden aktívny timeout.

### 💡 Nápady na Rozšírenie
- TikTok / YouTube CTA.
- Per-widget enable fieldy.
- Parameter pre minimálny počet chat správ pred zobrazením.

---
*Consistent CTA rotation to drive conversions without spamming the overlay.*