'use strict';
/* Version: 0.9.3-pre */
/* Donation & Subgoal Bar (StreamElements Custom Widget)
  Core features: multi-level donation goals, subscriber milestones, latest donation scroll, glow pulses, progress bar,
  per-event confetti (micro vs goal), percent display, font & color customization, duplicate tip protection. */

 /* Constants & state */
let goalProgress = 0;              // accumulated donation amount (€)
let lastSubCount = null;           // previous subscriber count
let lastDonatorId = null;          // last donation id to avoid duplicate session processing
let isGoalCompleteMessageActive = false; // lock while showing replace completion text
const processedTipIds = new Set(); // de-duplicate tip events


/* Animation config */
const ANIMATION_CONFIG = {
  deletingSpeed: 30,
  typingSpeed: 80
};
/* Levels populated from fieldData */
const LEVELS = [];

/* Field overrides (populated from StreamElements Fields UI) */
const GLOW_MIN_RANGE = 1; // validation clamp min
const GLOW_MAX_RANGE = 5;
const STYLE_INTENSITY_MAP = {
  1: 1,      // Soft
  2: 1.4,    // Medium
  3: 2,      // Intense
  4: 3,      // Very Intense
  5: 4       // Extreme
};
const DEFAULT_GOAL_OBJ = { title: 'Stream Goal', goal: 500 };
let FIELD_OVERRIDES = {
  // multi-level handled separately
  milestoneStep: 10,
  currencySymbol: '€',
  textAnimationMode: 'typewriter',
  goalCompleteDisplayMode: 'replace',
  goalCompleteLabel: 'COMPLETED',
  goalCompleteSeconds: 10,
  allGoalsCompleteMessage: 'All goals complete',
  enableGlowDonation: true,
  glowDonationColor: '#ff7500',
  glowDonationMs: 1500,
  // pulses use a fixed small gap
  glowDonationPulses: 1,
  glowDonationRange: 1, // now treated as style level
  // subscription glow merged into donation glow settings
  enableGlowGoalComplete: true,
  glowGoalCompleteColor: '',
  glowGoalCompleteMs: 1500,
  // legacy removed
  glowGoalCompletePulses: 3,
  glowGoalCompleteRange: 2,
  // ease/transition removed
  backgroundColor: '#2d2d2d',
  fontSize: 14,
  fontWeight: '400',
  iconsSize: 'medium',
  debugMode: false,
  ambientShineInterval: 0,
  enableSmartAutoContrast: true
};

/* Confetti configuration (supports legacy flat + grouped micro/goal) */
const CONFETTI_COLORS = ['#ff3b30','#ffcc00','#34c759','#007aff','#af52de'];
let CONFETTI_SETTINGS = {
  // legacy flat (kept for backward compatibility mapping to micro)
  enableConfettiMicro: true,
  enableConfettiGoalComplete: true,
  confettiStyle: 'classic',
  confettiCount: 100,
  confettiMaxFall: 100,
  confettiFadeMs: 4000,
  confettiSpeed: 40,
  // new grouped settings
  micro: {
    style: 'classic',
    count: 100,
    maxFall: 100,
    fadeMs: 3000,
    speed: 40
  },
  goal: {
    style: 'classic',
    count: 180, // bigger default for celebration
    maxFall: 160,
    fadeMs: 4500,
    speed: 40
  }
};
// Confetti preset mapping tables
const CONFETTI_PRESETS = {
  count: { low: 40, medium: 100, high: 180 },
  fall: { low: 40, medium: 100, high: 160 },
  duration: { low: 1200, medium: 3000, high: 4500 }, // ms
  speed: { low: 20, medium: 40, high: 60 }
};
let __confettiLastSpawn = 0; // throttle
let __confettiActivePieces = 0; // simple concurrency guard
const CONFETTI_LIMIT = 300; // max simultaneous pieces (raised for high count requests; be cautious with performance)
const CONFETTI_THROTTLE_MS = 250; // min gap between spawns (per trigger call)

/* Progress bar state */
let lastPercentRendered = -1; // to avoid redundant DOM writes


// Map presets to Google font names
const FONT_PRESETS = {
  'space-mono': 'Space Mono',
  'roboto': 'Roboto',
  'inter': 'Inter',
  'poppins': 'Poppins',
  'montserrat': 'Montserrat',
  'jetbrains-mono': 'JetBrains Mono',
  'press-start-2p': 'Press Start 2P'
};

/** Apply selected (or custom) Google Font and set CSS variable with fallback detection */
function applyFont() {
  const preset = FIELD_OVERRIDES.fontFamilyPreset;
  let fontName = FONT_PRESETS[preset] || 'Space Mono';
  const useCustom = FIELD_OVERRIDES.useCustomGoogleFont;
  const customName = (FIELD_OVERRIDES.customGoogleFontName || '').trim();
  if (useCustom && customName) fontName = customName;

  const googleParam = fontName.trim().replace(/\s+/g, '+');
  const baseHref = `https://fonts.googleapis.com/css2?family=${googleParam}&display=swap`;
  const id = 'dynamic-google-font';
  let link = document.getElementById(id);
  if (!link) {
    link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  // Force reload to allow switching back/forth
  const cacheBustHref = baseHref + `&v=${Date.now()}`;
  link.setAttribute('href', cacheBustHref);
  document.documentElement.style.setProperty('--bar-font-family', `'${fontName}'`);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      // heuristic width check
      const sample = 'WMQxyz 1234567890';
      const span = document.createElement('span');
      span.textContent = sample;
      span.style.visibility = 'hidden';
      span.style.position = 'absolute';
      span.style.whiteSpace = 'nowrap';
      span.style.fontFamily = `'${fontName}', monospace`;
      document.body.appendChild(span);
      const wCustom = span.getBoundingClientRect().width;
      span.style.fontFamily = 'monospace';
      const wMono = span.getBoundingClientRect().width;
      document.body.removeChild(span);
      if (Math.abs(wCustom - wMono) < 0.5) {
        if (FIELD_OVERRIDES.debugMode) console.warn('[DonationBar] Font likely failed to load, fallback Space Mono:', fontName);
        document.documentElement.style.setProperty('--bar-font-family', `'Space Mono'`);
      }
    });
  }
}

// Helper apply style vars
/** Apply color, icon, label & size overrides to DOM */
function applyVisualOverrides() {
  const root = document.documentElement;
  root.style.setProperty('--goal-text-color', FIELD_OVERRIDES.colorGoalText || '');
  root.style.setProperty('--subs-label-color', FIELD_OVERRIDES.colorSubsLabel || '');
  root.style.setProperty('--subs-value-color', FIELD_OVERRIDES.colorSubsValue || '');
  root.style.setProperty('--dono-label-color', FIELD_OVERRIDES.colorDonationLabel || '');
  root.style.setProperty('--dono-value-color', FIELD_OVERRIDES.colorDonationValue || '');
  root.style.setProperty('--icons-color', FIELD_OVERRIDES.iconsColor || '');

    // Icon size mapping now applies to all modes.
    // System(all) icons: compact scale; Twitch single logo: bigger scale.
    const modeForSize = FIELD_OVERRIDES.iconsMode;
  const sizeMapSystem = { small: 16, medium: 20, large: 24 };
  const sizeMapSingle = { small: 22, medium: 26, large: 32 }; // twitch / heart single-icon modes
  const activeMap = (modeForSize === 'twitch' || modeForSize === 'heart') ? sizeMapSingle : sizeMapSystem;
    const chosen = activeMap[FIELD_OVERRIDES.iconsSize] || activeMap.medium;
    root.style.setProperty('--icons-size', chosen + 'px');

  // labels
  const subsLabelEl = document.querySelector('#subs-info .label');
  if (subsLabelEl && FIELD_OVERRIDES.subsLabel) subsLabelEl.textContent = ensureTrailingSpace(FIELD_OVERRIDES.subsLabel);
  const donoLabelEl = document.querySelector('#dono-info .label');
  if (donoLabelEl && FIELD_OVERRIDES.latestDonationLabel) donoLabelEl.textContent = ensureTrailingSpace(FIELD_OVERRIDES.latestDonationLabel);

  // icons mode
  const iconsWrap = document.querySelector('.window-controls');
  if (iconsWrap) {
    const mode = FIELD_OVERRIDES.iconsMode;
    const svgs = iconsWrap.querySelectorAll('svg');
    if (mode === 'hidden') {
      iconsWrap.style.display = 'none';
    } else if (mode === 'twitch') {
      iconsWrap.style.display = 'flex';
      svgs.forEach((svg, idx) => {
        if (idx === 0) {
          svg.style.display = '';
          const p = svg.querySelector('path');
          if (p) p.setAttribute('d', 'M2 2v14h4v4l4-4h4l6-6V2H2zm14 8h-2V6h2v4zm-4 0h-2V6h2v4z');
        } else {
          svg.style.display = 'none';
        }
      });
    } else if (mode === 'heart') {
      // Single heart icon (using first svg). Others hidden.
      iconsWrap.style.display = 'flex';
      svgs.forEach((svg, idx) => {
        if (idx === 0) {
          svg.style.display = '';
          const p = svg.querySelector('path');
          if (p) p.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09A6.37 6.37 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
        } else {
          svg.style.display = 'none';
        }
      });
    } else { // system (all)
      iconsWrap.style.display = 'flex';
      svgs.forEach(svg => svg.style.display = '');
    }
    svgs.forEach(svg => svg.style.fill = (FIELD_OVERRIDES.iconsColor || ''));
  }

  // text case
  const caseMode = FIELD_OVERRIDES.textCaseMode;
  const applyCase = (el) => {
    if (!el) return;
    if (caseMode === 'upper') el.style.textTransform = 'uppercase';
    else if (caseMode === 'lower') el.style.textTransform = 'lowercase';
    else el.style.textTransform = 'none';
  };
  ['#goal-text','#subs-info .label','#subs-info .value','#dono-info .label','#dono-info .value']
    .forEach(sel => applyCase(document.querySelector(sel)));

  // progress bar colors
  root.style.setProperty('--progress-bar-color', FIELD_OVERRIDES.progressBarColor || FIELD_OVERRIDES.glowDonationColor || '#ff7500');
  root.style.setProperty('--progress-bar-glow', FIELD_OVERRIDES.progressBarGlowColor || FIELD_OVERRIDES.progressBarColor || FIELD_OVERRIDES.glowDonationColor || '#ff7500');
  root.style.setProperty('--progress-bar-empty', FIELD_OVERRIDES.progressBarEmptyColor || '#4a4a4a');

  if (FIELD_OVERRIDES.enableSmartAutoContrast) {
    try { applySmartAutoContrast(); } catch(e){ if (FIELD_OVERRIDES.debugMode) console.warn('[DonationBar] AutoContrast failed', e); }
  } else {
    document.documentElement.classList.remove('low-contrast-goal','low-contrast-subs','low-contrast-dono');
  }
}

function ensureTrailingSpace(txt){
  return /\s$/.test(txt) ? txt : (txt + ' ');
}

/** Parse and apply fieldData from widget load (handles legacy + new grouped confetti) */
function applyFieldData(fieldData) {
  if (!fieldData || typeof fieldData !== 'object') return;
  try {
    const map = fieldData;
    const assign = (key, transform = v => v) => {
      if (map[key] !== undefined && map[key] !== null && map[key] !== '') {
        FIELD_OVERRIDES[key] = transform(map[key]);
      }
    };
    // Multi-level extraction
  const levelsCount = Math.min(10, Math.max(1, Number(map.levelsCount || 1)));
    const tempLevels = [];
    for (let i = 1; i <= levelsCount; i++) {
      const tKey = `level${i}Title`;
      const gKey = `level${i}Goal`;
      const title = map[tKey];
      const goal = Number(map[gKey]);
      if (title && Number.isFinite(goal)) {
        tempLevels.push({ title: String(title), goal });
      }
    }
    // Sort by numeric goal ascending to ensure proper order even if user shuffles
    tempLevels.sort((a,b) => a.goal - b.goal);
    if (tempLevels.length) {
      LEVELS.length = 0;
      tempLevels.forEach(l => LEVELS.push(l));
    }

    [
      'milestoneStep','currencySymbol','textAnimationMode','goalCompleteDisplayMode','goalCompleteLabel','allGoalsCompleteMessage',
  'glowDonationColor','glowGoalCompleteColor','backgroundColor',
      'subsLabel','latestDonationLabel','textCaseMode','colorGoalText','colorSubsLabel','colorSubsValue','colorDonationLabel','colorDonationValue','iconsMode','iconsColor','iconsSize'
      ,'fontFamilyPreset','customGoogleFontName'
    ].forEach(k => assign(k, v => v));
  ['goalCompleteSeconds','glowDonationMs','glowDonationPulses','glowDonationRange','glowGoalCompleteMs','glowGoalCompletePulses','glowGoalCompleteRange','fontSize','milestoneStep']
      .forEach(k => assign(k, v => Number(v)));
  assign('ambientShineInterval', v => Number(v));
  assign('enableSmartAutoContrast', v => Boolean(v));
  // new intensity + empty color
  assign('progressBarIntensity', v => String(v));
  assign('progressBarEmptyColor', v => String(v));
    assign('fontWeight', v => String(v));
    [
      'enableGlowDonation','enableGlowGoalComplete','debugMode','useCustomGoogleFont','showDonationPercent','showDonationProgressBar','enableSubGoalMilestones'
    ].forEach(k => assign(k, v => Boolean(v)));
    // Confetti toggles
    ['enableConfettiMicro','enableConfettiGoalComplete'].forEach(k => assign(k, v => {
      CONFETTI_SETTINGS[k] = Boolean(v);
      return Boolean(v);
    }));
    // Advanced confetti per-event settings
    const presetVal = (group, key, v) => {
      if (typeof v === 'string' && CONFETTI_PRESETS[key] && CONFETTI_PRESETS[key][v]) return CONFETTI_PRESETS[key][v];
      if (typeof v === 'number') return v;
      return CONFETTI_PRESETS[key].medium;
    };
    // legacy mapping to micro if old flat fields present
    assign('confettiStyle', v => {
      const val = String(v||'classic').toLowerCase();
      CONFETTI_SETTINGS.micro.style = val;
      return val;
    });
    assign('confettiCount', v => { CONFETTI_SETTINGS.micro.count = presetVal('micro','count', v); return CONFETTI_SETTINGS.micro.count; });
    assign('confettiMaxFall', v => { CONFETTI_SETTINGS.micro.maxFall = presetVal('micro','fall', v); return CONFETTI_SETTINGS.micro.maxFall; });
    assign('confettiFadeMs', v => { CONFETTI_SETTINGS.micro.fadeMs = presetVal('micro','duration', v); return CONFETTI_SETTINGS.micro.fadeMs; });
    assign('confettiSpeed', v => { CONFETTI_SETTINGS.micro.speed = presetVal('micro','speed', v); return CONFETTI_SETTINGS.micro.speed; });
    // new micro group specific fields
    assign('confettiMicroStyle', v => { CONFETTI_SETTINGS.micro.style = String(v||'classic').toLowerCase(); return v; });
    assign('confettiMicroCount', v => { CONFETTI_SETTINGS.micro.count = presetVal('micro','count', v); return v; });
    assign('confettiMicroMaxFall', v => { CONFETTI_SETTINGS.micro.maxFall = presetVal('micro','fall', v); return v; });
    assign('confettiMicroFadeMs', v => { CONFETTI_SETTINGS.micro.fadeMs = presetVal('micro','duration', v); return v; });
    assign('confettiMicroSpeed', v => { CONFETTI_SETTINGS.micro.speed = presetVal('micro','speed', v); return v; });
    // goal group
    assign('confettiGoalStyle', v => { CONFETTI_SETTINGS.goal.style = String(v||'classic').toLowerCase(); return v; });
    assign('confettiGoalCount', v => { CONFETTI_SETTINGS.goal.count = presetVal('goal','count', v); return v; });
    assign('confettiGoalMaxFall', v => { CONFETTI_SETTINGS.goal.maxFall = presetVal('goal','fall', v); return v; });
    assign('confettiGoalFadeMs', v => { CONFETTI_SETTINGS.goal.fadeMs = presetVal('goal','duration', v); return v; });
    assign('confettiGoalSpeed', v => { CONFETTI_SETTINGS.goal.speed = presetVal('goal','speed', v); return v; });
    ['progressBarColor','progressBarGlowColor'].forEach(k => assign(k, v => v));

  // accentColor removed; using per-element colors instead
    document.documentElement.style.setProperty('--bar-bg-color', FIELD_OVERRIDES.backgroundColor);
    document.documentElement.style.setProperty('--bar-font-size', FIELD_OVERRIDES.fontSize + 'px');
    // Dynamic bar height scaling: keep 42px up to 14px, then grow ~+1.8px per extra font px
    const baseHeight = 42; // matches CSS default
    const baseFont = 20;
    const f = Number(FIELD_OVERRIDES.fontSize) || baseFont;
    let newHeight = baseHeight;
    if (f > baseFont) {
      newHeight = Math.round(baseHeight + (f - baseFont) * 1.8);
    }
    document.documentElement.style.setProperty('--bar-height', newHeight + 'px');
    document.documentElement.style.setProperty('--bar-font-weight', FIELD_OVERRIDES.fontWeight);
      // intensity class will handle height/glow; no direct height var from field now

    if (FIELD_OVERRIDES.debugMode) {
      console.log('[DonationBar] Applied fieldData', FIELD_OVERRIDES, 'LEVELS', LEVELS);
  window.__DONO_DEBUG = { FIELD_OVERRIDES, LEVELS, goalProgress };
    }

    // apply new visual bits after field load
    applyVisualOverrides();
    applyFont();
  } catch (e) {
    console.error('[DonationBar] Failed applying field data', e, fieldData);
  }
}

// Theme system removed (background color comes from field overrides)

/* GlowEngine – simplified, cancellable, pulse-based */
/** Simple cancellable pulse glow engine (box-shadow + slight scale) */
class GlowEngine {
  constructor(el) {
    this.el = el;
    this.token = 0; // increment to cancel previous
    this.timeouts = [];
  }
  cancel() {
    this.timeouts.forEach(t => clearTimeout(t));
    this.timeouts = [];
  }
  trigger(config) {
    if (!this.el) return;
    this.cancel();
    const token = ++this.token;
    const {
      color, pulses, duration, intensityScale
    } = config;
    const el = this.el;
    const original = {
      boxShadow: el.style.boxShadow,
      transform: el.style.transform,
      transition: el.style.transition
    };
    const safePulses = Math.max(1, pulses || 1);
    const spread1 = Math.round(12 * intensityScale);
    const spread2 = Math.round(28 * intensityScale);

    const applyGlow = () => {
      el.style.boxShadow = `0 0 ${spread1}px 2px ${color}, 0 0 ${spread2}px 6px ${color}`;
      el.style.transform = 'scale(1.015)';
    };
    const clearGlow = () => {
      el.style.boxShadow = original.boxShadow || '';
      el.style.transform = original.transform || '';
    };

    const runPulse = (i) => {
      if (token !== this.token) return; // cancelled
      applyGlow();
      const revert = setTimeout(() => {
        clearGlow();
        if (token !== this.token) return;
        if (i < safePulses - 1) {
          // small consistent gap between pulses (10% of duration or min 80ms)
          const gap = Math.max(80, Math.round(duration * 0.1));
          const next = setTimeout(() => runPulse(i + 1), gap);
          this.timeouts.push(next);
        } else {
          const cleanup = setTimeout(() => { if (token === this.token) el.style.transform = original.transform || ''; }, 60);
          this.timeouts.push(cleanup);
        }
      }, duration);
      this.timeouts.push(revert);
    };
    runPulse(0);
  }
}

let __glowEngine = null;
let __progressColorShiftToken = 0; // control reverting color after glow

/** Temporarily override progress bar color during glow pulses */
function tempProgressBarColor(color, pulses, duration) {
  // pulses >=1, duration per pulse
  const root = document.documentElement;
  const token = ++__progressColorShiftToken;
  // capture original (resolved) colors from field overrides to avoid drift
  const origColor = FIELD_OVERRIDES.progressBarColor || FIELD_OVERRIDES.glowDonationColor || '#ff7500';
  const origGlow  = FIELD_OVERRIDES.progressBarGlowColor || FIELD_OVERRIDES.progressBarColor || FIELD_OVERRIDES.glowDonationColor || '#ff7500';
  // apply temporary
  root.style.setProperty('--progress-bar-color', color);
  root.style.setProperty('--progress-bar-glow', color);
  // approximate total glow window (include gaps + small tail)
  const gap = Math.max(80, Math.round(duration * 0.1));
  const total = (duration * pulses) + (gap * (pulses - 1)) + 400; // tail for fade
  setTimeout(() => {
    if (token === __progressColorShiftToken) {
      root.style.setProperty('--progress-bar-color', origColor);
      root.style.setProperty('--progress-bar-glow', origGlow);
    }
  }, total);
}

/** Trigger glow + confetti + (optional) goal complete message for event type */
function triggerGlowEffect(type, completedGoalTitle = null) {
  const topBar = document.querySelector('.top-bar');
  if (!topBar) return;
  const glowEnabled = !(
    (type === 'donation' && !FIELD_OVERRIDES.enableGlowDonation) ||
  // subscription shares donation glow settings (enableGlowDonation)
  (type === 'subscription' && !FIELD_OVERRIDES.enableGlowDonation) ||
    (type === 'goal-complete' && !FIELD_OVERRIDES.enableGlowGoalComplete)
  );
  let cfg = null;
  if (glowEnabled) {
    if (!__glowEngine) __glowEngine = new GlowEngine(topBar);
    cfg = getGlowConfig(type);
    __glowEngine.trigger(cfg);
    try { tempProgressBarColor(cfg.color, Math.max(1, cfg.pulses || 1), cfg.duration || 1200); } catch(e) { /* noop */ }
  }
  if (type === 'goal-complete' && completedGoalTitle) showSingleGoalComplete(completedGoalTitle);
  if (FIELD_OVERRIDES.debugMode) console.log('[DonationBar] FX trigger', { type, glowEnabled, cfg });
  // Confetti (micro) triggers independent of glow toggle
  try {
    if (type === 'goal-complete' && CONFETTI_SETTINGS.enableConfettiGoalComplete) {
      triggerConfetti('goal');
    } else if ((type === 'donation' || type === 'subscription') && CONFETTI_SETTINGS.enableConfettiMicro) {
      triggerConfetti('micro');
    }
  } catch(e){ if (FIELD_OVERRIDES.debugMode) console.warn('[DonationBar] Confetti error', e); }
}

function clampRange(v){
  const n = Number(v) || GLOW_MIN_RANGE;
  return Math.min(GLOW_MAX_RANGE, Math.max(GLOW_MIN_RANGE, n));
}
function styleToIntensity(styleLevel){
  const lvl = clampRange(styleLevel);
  return STYLE_INTENSITY_MAP[lvl] || 1;
}
/** Resolve glow configuration for event type */
function getGlowConfig(type){
  if (type === 'donation') {
    const range = clampRange(FIELD_OVERRIDES.glowDonationRange);
    const intensity = styleToIntensity(range);
    return {
      color: FIELD_OVERRIDES.glowDonationColor || FIELD_OVERRIDES.colorDonationValue || FIELD_OVERRIDES.colorDonationLabel || '#ff7500',
      duration: FIELD_OVERRIDES.glowDonationMs || 1500,
      pulses: Math.max(1, Number(FIELD_OVERRIDES.glowDonationPulses) || 1),
      intensityScale: intensity
    };
  }
  if (type === 'subscription') {
    // Use donation glow config values
    const range = clampRange(FIELD_OVERRIDES.glowDonationRange);
    const intensity = styleToIntensity(range);
    return {
      color: FIELD_OVERRIDES.glowDonationColor || FIELD_OVERRIDES.colorSubsValue || FIELD_OVERRIDES.colorSubsLabel || '#ff7500',
      duration: FIELD_OVERRIDES.glowDonationMs || 1500,
      pulses: Math.max(1, Number(FIELD_OVERRIDES.glowDonationPulses) || 1),
      intensityScale: intensity
    };
  }
  const range = clampRange(FIELD_OVERRIDES.glowGoalCompleteRange || 2);
  const intensity = styleToIntensity(range) * 1.2; // goal complete boost
  return {
    color: FIELD_OVERRIDES.glowGoalCompleteColor || FIELD_OVERRIDES.colorGoalText || '#00ff00',
    duration: FIELD_OVERRIDES.glowGoalCompleteMs || 1500,
    pulses: Math.max(1, Number(FIELD_OVERRIDES.glowGoalCompletePulses) || 3),
    intensityScale: intensity
  };
}

/* Show single goal complete message */
/** Display temporary single goal completion message (replace/flash modes) */
function showSingleGoalComplete(goalTitle) {
  const el = document.getElementById('goal-text');
  if (!el) return;
  if (FIELD_OVERRIDES.goalCompleteDisplayMode === 'none') return;
  clearTypewriter(); // prevent overlapping deletion animation
  const label = FIELD_OVERRIDES.goalCompleteLabel || 'COMPLETED';
  const secs = Number(FIELD_OVERRIDES.goalCompleteSeconds) || 10;
  const mode = FIELD_OVERRIDES.goalCompleteDisplayMode;
  let cleanTitle = String(goalTitle || '').trim();
  cleanTitle = cleanTitle.replace(/^[$€£]\s?\d+[\d\s,\.]*\s*/,'').trim();
  const completeText = `${label}: ${cleanTitle}`;
  isGoalCompleteMessageActive = true;
  const revert = () => {
    isGoalCompleteMessageActive = false;
    // animate the newly active goal line again after completion message ends
    updateGoalText(true);
  };
  if (mode === 'replace') {
    // Use configured animation mode
    animateText(el, completeText, true, () => setTimeout(revert, secs * 1000));
  } else if (mode === 'flash') {
    const original = el.textContent;
    animateText(el, completeText, true, () => setTimeout(() => animateText(el, original, true), secs * 1000));
  }
}



/* Check if goal was completed */
/** Determine if donation progress crossed into a higher goal level */
function checkGoalCompletion(oldProgress, newProgress) {
  const oldLevelIndex = getCurrentLevelIndexForAmount(oldProgress);
  const newLevelIndex = getCurrentLevelIndexForAmount(newProgress);
  
  // If we moved to a higher level, return FIRST completed goal only
  if (newLevelIndex > oldLevelIndex) {
    const firstCompletedIndex = oldLevelIndex + 1;
    const completedGoal = LEVELS[firstCompletedIndex];
    return completedGoal ? completedGoal.title : null;
  }
  
  return null;
}

/** Get level index for a raw amount (used for completion detection) */
function getCurrentLevelIndexForAmount(amount) {
  if (!LEVELS || LEVELS.length === 0) return 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (amount < LEVELS[i].goal) return i - 1;
  }
  return LEVELS.length - 1;
}

/* Check if sub goal was reached */
/** Check if subscriber count crossed a milestone boundary */
function checkSubGoalCompletion(oldCount, newCount) {
  const step = Number(FIELD_OVERRIDES.milestoneStep) || 10;
  const oldGoal = Math.ceil((oldCount || 0) / step) * step;
  const newGoal = Math.ceil((newCount || 0) / step) * step;
  return newGoal > oldGoal;
}

 /* Determine current level index based on goalProgress */
/** Current active (incomplete) level index */
function getCurrentLevelIndex() {
  if (!LEVELS || LEVELS.length === 0) return 0;
  
  for (let i = 0; i < LEVELS.length; i++) {
    if (goalProgress < LEVELS[i].goal) return i;
  }
  return LEVELS.length - 1;
}

 /* Render goal text */
/** Render goal text line (with percent if enabled) */
function updateGoalText (animate = false) {
  const el = document.getElementById('goal-text');
  if (!el) return;
  if (isGoalCompleteMessageActive && FIELD_OVERRIDES.goalCompleteDisplayMode !== 'flash') {
    // lock content until revert for 'replace' mode to avoid typewriter clashes
    return;
  }
  const current = Number(goalProgress) || 0;
  const levelIndex = getCurrentLevelIndex();
  const lvl = LEVELS[levelIndex] || DEFAULT_GOAL_OBJ;
  let newText;
  const lastIndex = LEVELS.length - 1;
  if (levelIndex === lastIndex && current >= lvl.goal) {
    // all goals done
    newText = FIELD_OVERRIDES.allGoalsCompleteMessage || 'All goals complete';
  } else {
    newText = `${lvl.title}: ${formatAmount(current)} / ${formatAmount(lvl.goal)}`;
    if (FIELD_OVERRIDES.showDonationPercent) {
      const percentStr = getLevelPercentString();
      if (percentStr) newText += ` (${percentStr})`;
    }
  }
  animateText(el, newText, animate);
  updateProgressVisual();
}

/* Progress helpers */
/** Absolute percent progress for active level (0..100 clamp) */
function getLevelPercentRaw() {
  // Absolute progress relative to the ACTIVE level's goal (does not reset to 0 on level change).
  if (!LEVELS.length) return 0;
  const idx = getCurrentLevelIndex();
  const currentLevel = LEVELS[idx] || DEFAULT_GOAL_OBJ;
  if (!currentLevel.goal || currentLevel.goal <= 0) return 0;
  const pct = (goalProgress / currentLevel.goal) * 100;
  return Math.max(0, Math.min(100, pct));
}
function getLevelPercentString() {
  const val = getLevelPercentRaw();
  if (!Number.isFinite(val)) return '';
  return `${Math.floor(val)}%`;
}
/** Update thin progress bar fill width + intensity class */
function updateProgressVisual(force = false) {
  const bar = document.getElementById('global-progress');
  if (!bar) return;
  const fill = bar.querySelector('.gp-fill');
  const showBar = Boolean(FIELD_OVERRIDES.showDonationProgressBar);
  bar.classList.toggle('hidden', !showBar);
  if (!showBar || !fill) return;
  // apply intensity class each update (cheap)
  const intensity = (FIELD_OVERRIDES.progressBarIntensity || 'medium').toLowerCase();
  bar.classList.remove('int-low','int-medium','int-strong');
  if (intensity === 'low') bar.classList.add('int-low');
  else if (intensity === 'strong') bar.classList.add('int-strong');
  else bar.classList.add('int-medium');
  const raw = getLevelPercentRaw();
  const clamped = Math.max(0, Math.min(100, raw));
  if (force || Math.abs(clamped - lastPercentRendered) >= 0.25) {
    lastPercentRendered = clamped;
    fill.style.width = clamped + '%';
  }
}

/* Numeric formatting helper */
/** Format number using European style grouping + 2 decimals + currency suffix */
function formatAmount(value) {
  const sym = FIELD_OVERRIDES.currencySymbol || '€';
  // fixed European style: space thousands, comma decimals
  const fixed = Number(value).toFixed(2);
  const [intPartRaw, decPart] = fixed.split('.');
  const intPart = intPartRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${intPart},${decPart} ${sym}`.trim();
}

/* Typewriter effect helper */
let activeTypewriterInterval = null;
function clearTypewriter() {
  if (activeTypewriterInterval) {
    clearInterval(activeTypewriterInterval);
    activeTypewriterInterval = null;
  }
}
/** Delete then type text content with configured speeds */
function typewriterEffect(el, newText, cb = () => {}) {
  if (!el) return;
  clearTypewriter();
  el.classList.add('typing');
  let txt = el.textContent;
  const del = setInterval(() => {
    if (txt.length) {
      txt = txt.slice(0, -1);
      el.textContent = txt;
    } else {
      clearInterval(del);
      let i = 0;
      const typ = setInterval(() => {
        if (i < newText.length) {
          txt += newText.charAt(i++);
          el.textContent = txt;
        } else {
          clearInterval(typ);
          activeTypewriterInterval = null;
          el.classList.remove('typing');
          cb();
        }
      }, ANIMATION_CONFIG.typingSpeed);
      activeTypewriterInterval = typ;
    }
  }, ANIMATION_CONFIG.deletingSpeed);
}
/** Simple fade-out/fade-in text swap */
function fadeEffect(el, newText, cb = () => {}) {
  if (!el) return;
  el.style.transition = 'opacity 0.3s ease';
  el.style.opacity = '0';
  setTimeout(() => {
    el.textContent = newText;
    el.style.opacity = '1';
    setTimeout(cb, 320);
  }, 320);
}
/** Animate text with selected mode (typewriter | fade | off) */
function animateText(el, newText, allowAnimation, cb) {
  const mode = FIELD_OVERRIDES.textAnimationMode;
  if (!allowAnimation || mode === 'off') {
    clearTypewriter();
    el.textContent = newText;
    if (cb) cb();
    return;
  }
  if (mode === 'typewriter') return typewriterEffect(el, newText, cb);
  if (mode === 'fade') return fadeEffect(el, newText, cb);
  el.textContent = newText;
  if (cb) cb();
}

 /* Update subscriber count */
/** Update subscriber line, optionally milestone logic + glow triggers */
function updateSubCount (count, animate) {
  const n = Number(count);
  if (!Number.isFinite(n)) return;
  
  const oldCount = lastSubCount;
  if (n === oldCount) return;

  lastSubCount = n;

  if (FIELD_OVERRIDES.enableSubGoalMilestones) {
    if (animate && oldCount !== null && checkSubGoalCompletion(oldCount, n)) {
      triggerGlowEffect('goal-complete');
    } else if (animate && n > (oldCount || 0)) {
      triggerGlowEffect('subscription');
    }
  } else {
    if (animate && n > (oldCount || 0)) triggerGlowEffect('subscription');
  }

  let text;
  if (FIELD_OVERRIDES.enableSubGoalMilestones) {
    const step = Number(FIELD_OVERRIDES.milestoneStep) || 10;
    const nextGoal = Math.ceil(n / step) * step || step;
    text = `${n} / ${nextGoal}`;
  } else {
    text = `${n}`;
  }
  const el = document.getElementById('sub-value');
  animateText(el, text, animate);
}

 /* Update donation text */
/** Enable marquee scrolling only if donor text overflows container */
function checkDonatorScroll () {
  const cont = document.getElementById('dono-container');
  const wrap = document.querySelector('.dono-scroll-wrapper');
  /* Small delay to allow DOM to calculate widths */
  setTimeout(() => {
    cont.classList.toggle('scrolling', cont.scrollWidth > wrap.clientWidth);
  }, 100);
}

/** Update latest donation text and conditionally animate */
function updateDonation (d, animate) {
  if (!d || !d.name || !d.tipId) return;
  if (d.tipId === lastDonatorId) return; 
  lastDonatorId = d.tipId;
  const text = `${d.name} – ${formatAmount(Number(d.amount)||0)}`;
  const el   = document.getElementById('dono-value');
  animateText(el, text, animate, checkDonatorScroll);
}

/* StreamElements event hooks */
window.addEventListener('onWidgetLoad', ({ detail }) => {
  const data = detail?.session?.data || {};
  const fieldData = detail?.fieldData || detail?.data?.fieldData;
  applyFieldData(fieldData);

  // Theme removed – background handled via field backgroundColor

  /* Load initial goal progress */
  if (data['tip-goal'] && Number.isFinite(Number(data['tip-goal'].amount))) {
    goalProgress = Number(data['tip-goal'].amount);
  }

  // startAmount removed – rely on session value or local accumulation

  updateGoalText();
  updateSubCount(data['subscriber-total']?.count, false);
  applyVisualOverrides();
  applyFont();
  // Initial progress visuals
  updateProgressVisual(true);

  updateDonation({
    tipId : data['tip-latest']?._id || 'init',
    name  : data['tip-latest']?.name,
    amount: data['tip-latest']?.amount || 0
  }, false);
});

/* Global session update handler */
window.addEventListener('onSessionUpdate', ({ detail }) => {
  console.log('Session update received:', detail);
  const data = detail?.session?.data || {};

  // IMPORTANT: Don't overwrite local accumulated progress from session 'tip-goal'.
  // Some setups don't maintain an SE tip-goal object, which could reset progress.
  // We'll manage accumulation locally from events/session tip-latest changes.

  /* Always use session data for accurate state */
  if (data['subscriber-total']?.count !== undefined) {
    // Avoid double glow: session update just syncs silently
    updateSubCount(data['subscriber-total'].count, false);
  }
  
  /* Handle new donation via session (in case live tip event didn't fire) */
  if (data['tip-latest']) {
    const tip = data['tip-latest'];
    const newTipId = tip._id || tip.id || tip.tipId;
    const amount = Number(tip.amount) || 0;
    // Session update only accumulates silently; event listener handles glow
    if (newTipId && newTipId !== lastDonatorId && amount > 0) {
      const oldProgress = Number(goalProgress) || 0;
      const newProgress = oldProgress + amount;
      const completedGoalTitle = checkGoalCompletion(oldProgress, newProgress);
      goalProgress = newProgress;
      if (!completedGoalTitle) updateGoalText(false);
    }

    // Always reflect latest donor text (no animation here to avoid double typewriter)
    updateDonation({
      tipId : newTipId || 'session-update',
      name  : tip.name || tip.username,
      amount: amount
    }, false);
  }
});

/* Live event listener */
window.addEventListener('onEventReceived', ({ detail }) => {
  console.log('Event received:', detail);
  
  const listener = detail?.listener;
  const event = detail?.event;
  
  if (!event) return;

  // subscriber events - update sub count immediately
  if (listener === 'subscription-latest' || listener === 'subscriber-latest'
      || event.type === 'subscription' || event.type === 'subscriber') {
    console.log('Subscriber event detected:', event);
    // use session data for accurate total
    const sessionData = detail.session?.data || {};
    const subCount = sessionData['subscriber-total']?.count;
    updateSubCount(subCount, true);
    return;
  }
  // tip events - animate tip and update goal immediately
  if (listener === 'tip-latest' || event.type === 'tip') {
    console.log('Tip event detected:', event);
    const eventId = event.id || event._id || event.tipId || `${Date.now()}-${Math.random()}`;
    if (processedTipIds.has(eventId)) {
      if (FIELD_OVERRIDES.debugMode) console.log('[DonationBar] Duplicate tip event ignored', eventId);
      return;
    }
    processedTipIds.add(eventId);

    const oldProgress = Number(goalProgress) || 0;
    const inc = Number(event.amount) || 0;
    const newProgress = oldProgress + inc;
    goalProgress = newProgress; // update first so decision reflects new state exactly once

    const completedGoalTitle = checkGoalCompletion(oldProgress, newProgress);
    if (completedGoalTitle) {
      triggerGlowEffect('goal-complete', completedGoalTitle);
    } else {
      triggerGlowEffect('donation');
    }

    updateDonation({
      tipId : eventId,
      name  : event.username || event.name,
      amount: inc
    }, true);

    if (!completedGoalTitle) {
      updateGoalText(true);
    }
    else {
      // On goal complete we force update progress visuals (will show 100% until revert)
      updateProgressVisual(true);
    }
    return;
  }
});

// public debug helpers (extended)
if (typeof window !== 'undefined') {
  window.__DONO_BAR_UTILS = Object.assign(window.__DONO_BAR_UTILS || {}, {
    getLevelPercentRaw,
    getLevelPercentString,
    updateProgressVisual,
    triggerConfetti: (mode='debug') => triggerConfetti(mode),
    getConfettiSettings: () => JSON.parse(JSON.stringify(CONFETTI_SETTINGS)),
    recomputeAutoContrast: () => { try { applySmartAutoContrast(); } catch(e){} }
  });
}

/* ====================== AMBIENT SHINE (IDLE FX) ====================== */
let __ambientTimer = null;
let __lastActivityTs = Date.now();
const AMBIENT_CLASS = 'ambient-shine';
function markActivity(){
  __lastActivityTs = Date.now();
  const top = document.querySelector('.top-bar');
  if (top) top.classList.remove(AMBIENT_CLASS);
}
function setupAmbientShine(){
  if (__ambientTimer) { clearInterval(__ambientTimer); __ambientTimer = null; }
  const intervalSec = Number(FIELD_OVERRIDES.ambientShineInterval) || 0;
  if (!intervalSec || intervalSec < 5) return; // ignore too small
  __ambientTimer = setInterval(() => {
    const idleFor = (Date.now() - __lastActivityTs) / 1000;
    if (idleFor >= intervalSec) {
      const top = document.querySelector('.top-bar');
      if (!top) return;
      // Don't disturb active glow pulses (heuristic: if boxShadow currently non-empty & engine near pulse)
      if (top.style.boxShadow && top.style.boxShadow.includes('rgb')) return;
      // Apply class briefly (CSS will animate)
      top.classList.add(AMBIENT_CLASS);
      setTimeout(() => top.classList.remove(AMBIENT_CLASS), 2200);
      __lastActivityTs = Date.now(); // reset so it fires again after another interval of quiet
    }
  }, 1500);
}

// Hook activity markers into existing high-level event functions
const __origTriggerGlowEffect = triggerGlowEffect;
triggerGlowEffect = function(type, title){
  markActivity();
  return __origTriggerGlowEffect(type, title);
};
const __origUpdateDonation = updateDonation;
updateDonation = function(d,a){ markActivity(); return __origUpdateDonation(d,a); };
const __origUpdateSubCount = updateSubCount;
updateSubCount = function(c,a){ markActivity(); return __origUpdateSubCount(c,a); };

// After widget load & field data apply we setup ambient if enabled
window.addEventListener('onWidgetLoad', () => { setTimeout(setupAmbientShine, 1000); });
window.addEventListener('onSessionUpdate', () => markActivity());
window.addEventListener('onEventReceived', () => markActivity());
/* ===================================================================== */

/* ====================== SMART AUTO CONTRAST ====================== */
function parseColor(col){
  if(!col) return null;
  let c = col.trim();
  if(/^#/.test(c)){
    if(c.length===4){
      const r=c[1],g=c[2],b=c[3];
      c = `#${r}${r}${g}${g}${b}${b}`;
    }
    const n = parseInt(c.slice(1),16);
    if(isNaN(n) || (c.length!==7)) return null;
    return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
  }
  const m = c.match(/rgba?\(([^)]+)\)/i);
  if(m){
    const parts = m[1].split(/\s*,\s*/).map(Number);
    if(parts.length>=3) return { r:parts[0], g:parts[1], b:parts[2] };
  }
  return null;
}
function relLuminance({r,g,b}){
  const srgb = [r,g,b].map(v=>{
    v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4);
  });
  return 0.2126*srgb[0]+0.7152*srgb[1]+0.0722*srgb[2];
}
function contrastRatio(c1,c2){
  if(!c1||!c2) return 21; // treat as high contrast if missing
  const L1=relLuminance(c1), L2=relLuminance(c2);
  const max=Math.max(L1,L2), min=Math.min(L1,L2);
  return (max+0.05)/(min+0.05);
}
function cssVar(name){
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
function applySmartAutoContrast(){
  const bgCol = parseColor(cssVar('--bar-bg-color') || '#2d2d2d');
  // Collect triples: [varName, className]
  const targets = [
    ['--goal-text-color','low-contrast-goal'],
    ['--subs-label-color','low-contrast-subs'],
    ['--subs-value-color','low-contrast-subs'],
    ['--dono-label-color','low-contrast-dono'],
    ['--dono-value-color','low-contrast-dono']
  ];
  const THRESHOLD = 3.8; // near WCAG AA for small text (4.5) but allow style flexibility
  const rootClasses = document.documentElement.classList;
  const classSets = {
    'low-contrast-goal':false,
    'low-contrast-subs':false,
    'low-contrast-dono':false
  };
  targets.forEach(([varName, cls]) => {
    const val = cssVar(varName) || cssVar('--text-color') || '#ffffff';
    const parsed = parseColor(val) || parseColor('#ffffff');
    const ratio = contrastRatio(parsed, bgCol);
    if (ratio < THRESHOLD) classSets[cls] = true;
  });
  Object.keys(classSets).forEach(cls => {
    if(classSets[cls]) rootClasses.add(cls); else rootClasses.remove(cls);
  });
  if (FIELD_OVERRIDES.debugMode) console.log('[DonationBar] AutoContrast applied', classSets);
}
/* =============================================================== */

/* ====================== CONFETTI MICRO SYSTEM ====================== */
/** Spawn a batch of confetti pieces using selected mode config (micro | goal) */
function triggerConfetti(mode='generic') {
  const now = Date.now();
  if (now - __confettiLastSpawn < CONFETTI_THROTTLE_MS) return; // throttle
  __confettiLastSpawn = now;
  const layer = document.getElementById('confetti-layer');
  if (!layer) return;
  let cfg = CONFETTI_SETTINGS.micro;
  if (mode === 'goal') cfg = CONFETTI_SETTINGS.goal;
  else if (mode === 'micro' || mode==='dono' || mode==='sub') cfg = CONFETTI_SETTINGS.micro;
  // backward compatibility for legacy generic
  if (!cfg) cfg = CONFETTI_SETTINGS.micro || { count: 60, maxFall: 80, fadeMs: 3000, speed: 40, style: 'classic' };
  const goalMult = (mode === 'goal') ? 1.0 : 1; // goal config already larger
  const baseCount = Math.round(cfg.count * goalMult);
  const batch = Math.max(4, Math.min(CONFETTI_LIMIT, baseCount));
  for (let i=0;i<batch;i++) {
    if (__confettiActivePieces >= CONFETTI_LIMIT) break;
    spawnConfettiPiece(layer, mode, i, batch, cfg);
  }
}
/** Create single confetti piece with randomized transforms */
function spawnConfettiPiece(layer, mode, index, batch, cfg) {
  const el = document.createElement('div');
  el.className = 'cf-piece';
  // size variant
  const r = Math.random();
  if (r < 0.25) el.classList.add('sm'); else if (r > 0.78) el.classList.add('lg');
  const styleForMode = (mode === 'goal') ? cfg.style : cfg.style;
  const color = pickConfettiColor(styleForMode);
  el.style.background = color;
  // horizontal spread across bar
  const x = Math.random() * 1880 + 10; // padding inside 1920 width
  el.style.left = x + 'px';
  // start at bottom of bar now
  el.style.top = 'auto';
  el.style.bottom = '0px';
  // drift and rotation randomness
  const drift = (Math.random()*40 - 20).toFixed(1); // -20..20px
  const rot = (Math.random()*220 + 80).toFixed(1); // 80..300deg
  const rx = (Math.random()*360).toFixed(1) + 'deg';
  const ry = (Math.random()*180).toFixed(1) + 'deg';
  el.style.setProperty('--drift', drift+'px');
  el.style.setProperty('--rot', rot+'deg');
  el.style.setProperty('--rx', rx);
  el.style.setProperty('--ry', ry);
  const fall = Math.random()* (cfg.maxFall * 0.4) + (cfg.maxFall * 0.6); // total extra fall distance
  el.style.setProperty('--fallY', fall.toFixed(1)+'px');
  // duration: if speed specified use distance / speed, else use override
  let dur;
  if (cfg.speed && cfg.speed > 0) {
    const pxPerSec = cfg.speed;
    dur = Math.max(50, (fall / pxPerSec) * 1000); // convert to ms; allow very fast speeds but min 50ms
  } else {
    dur = cfg.fadeMs;
  }
  el.style.setProperty('--cf-dur', dur+'ms');
  // slight stagger
  const delay = (index * (mode==='goal'?8:10));
  el.style.animationDelay = delay + 'ms';
  // lifespan (animation defined ~1100ms) remove after 1200 + delay
  __confettiActivePieces++;
  layer.appendChild(el);
  const cleanup = () => {
    if (!el.parentNode) return;
    el.parentNode.removeChild(el);
    __confettiActivePieces--;
  };
  el.addEventListener('animationend', cleanup);
  setTimeout(cleanup, dur + 300 + delay);
}
function pickConfettiColor(styleOverride) {
  const style = (styleOverride || CONFETTI_SETTINGS.micro?.style || 'classic').toLowerCase();
  if (style === 'warm') {
    const warm = ['#ff3b30','#ff6a13','#ff9500','#ffcc00','#ffd60a'];
    return warm[Math.floor(Math.random()*warm.length)];
  }
  if (style === 'cool') {
    const cool = ['#007aff','#0a84ff','#34c759','#30d158','#5e5ce6'];
    return cool[Math.floor(Math.random()*cool.length)];
  }
  // classic: blend of base palette + small chance of white highlight
  if (Math.random() < 0.06) return '#ffffff';
  return CONFETTI_COLORS[Math.floor(Math.random()*CONFETTI_COLORS.length)];
}
/* =================================================================== */
