/*
 * Multi-CTA Popup System v0.8.2
 *  - Theming & polish: per-type gradients, expanded icon set, icon pulse
 *  - Unified bounce animation (legacy 'extended' remapped)
 *  - External field schema (popup.fields.json) defines all runtime configuration
 *  - Use window.multiPopupDebug() for diagnostics
 */

/* Global Configuration (defaults aligned to popup.fields.json) */
const POPUP_CONFIG = {
  showInterval: 210 * 1000,
  displayDuration: 16 * 1000,
  animationStyle: 'extended',
  positionVertical: 'bottom',
  positionVerticalOffset: 'mid-offset',
  positionHorizontal: 'center',
  widgetBorderEnabled: true,
  widgetShadowEnabled: true,
  widgetRoundedCorners: false,
  buttonRoundedCorners: false,
  idleShineEnabled: true,
  baseBackgroundColor: '#2d2d2d',
  baseTextColor: '#ffffff',
  baseHighlightColor: '#ff7500',
  autoContrast: false,
  enabled: true,
  debugMode: false
};

// Slot collection each slot: {id, enabled, type, text, buttonText, useDefaultIcon, iconOverride, buttonShowIcon, primaryColor}
let slots = [];
let activeSlotIndex = -1;

/* Field Overrides */
function applyFieldData(fieldData) {
  if (!fieldData) return;
  try {
    const mapNum = (keySrc, keyDst, mult=1000) => { if (isFinite(fieldData[keySrc])) POPUP_CONFIG[keyDst] = Number(fieldData[keySrc]) * mult; };
    mapNum('rotationIntervalSeconds','showInterval');
    mapNum('showDurationSeconds','displayDuration');
  ['animationStyle','positionVertical','positionVerticalOffset','positionHorizontal'].forEach(k=>{ if (fieldData[k]) POPUP_CONFIG[k]=fieldData[k]; });
  if (POPUP_CONFIG.animationStyle === 'extended') POPUP_CONFIG.animationStyle = 'bounce'; // legacy remap
    ['widgetBorderEnabled','widgetShadowEnabled','widgetRoundedCorners','buttonRoundedCorners','idleShineEnabled','autoContrast','debugMode'].forEach(k=>{ if (typeof fieldData[k] === 'boolean') POPUP_CONFIG[k]=fieldData[k]; });
    ['baseBackgroundColor','baseTextColor','baseHighlightColor'].forEach(k=>{ if (fieldData[k]) POPUP_CONFIG[k]=fieldData[k]; });
    window.IG_DEBUG = POPUP_CONFIG.debugMode;
    slots = [];
    for (let i=1;i<=6;i++) {
      const enabled = !!fieldData[`slot${i}Enabled`];
      const type = fieldData[`slot${i}Type`] || '';
      if (!enabled || !type) { slots.push({id:i, enabled:false}); continue; }
      const slot = {
        id:i,
        enabled:true,
        type,
        useDefaultIcon: fieldData[`slot${i}UseDefaultIcon`] !== false,
        iconOverride: fieldData[`slot${i}IconOverride`] || '',
        buttonShowIcon: fieldData[`slot${i}ButtonShowIcon`] !== false,
        text: fieldData[`slot${i}Text`] || '',
        buttonText: fieldData[`slot${i}ButtonText`] || '',
        primaryColor: fieldData[`slot${i}PrimaryColor`] || ''
      };
      slots.push(slot);
    }
    if (window.IG_DEBUG) console.log('[Multi-CTA] applied field data', { POPUP_CONFIG, slots });
  } catch(err) {
    console.error('Failed applying multi-cta field data', err);
  }
}

/* State management */
let popupTimer = null;
let isPopupVisible = false;
let lastShowTime = 0;
let isInitialized = false;

/* DOM elements */
let popupRoot = null; // #multi-popup
let popupTextEl = null; // #popup-text
let popupButton = null; // #popup-button
let popupButtonIcon = null; // #popup-button-icon
let popupButtonLabel = null; // #popup-button-label

function resolveTypeDefaults(type) {
  const map = {
    instagram: { button:'follow', primary:'#E4405F', gradient:'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>` },
  discord: { button:'join', primary:'#5865F2', gradient:'linear-gradient(45deg,#8990ff,#5865F2)', icon:`<svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'><path d='M20.317 4.369a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037 13.276 13.276 0 00-.608 1.249 19.48 19.48 0 00-5.486 0 12.64 12.64 0 00-.631-1.249.077.077 0 00-.079-.037 19.736 19.736 0 00-4.885 1.515.07.07 0 00-.032.027C2.18 9.045 1.557 13.58 2.046 18.059a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.077.077 0 00.084-.027 13.3 13.3 0 001.226-1.994.076.076 0 00-.041-.105 12.3 12.3 0 01-1.872-.892.077.077 0 01-.008-.127c.125-.094.25-.192.369-.291a.074.074 0 01.077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.009c.119.099.244.197.369.292a.077.077 0 01-.006.127 12.246 12.246 0 01-1.873.891.076.076 0 00-.04.106c.36.698.772 1.363 1.225 1.993a.076.076 0 00.084.028 19.876 19.876 0 005.994-3.03.077.077 0 00.031-.055c.5-5.177-.838-9.674-3.548-13.663a.061.061 0 00-.031-.028zM9.68 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.334-.955 2.419-2.157 2.419zm4.64 0c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.419 0 1.334-.947 2.419-2.157 2.419z'/></svg>` },
  donate: { button:'donate', primary:'#ff4757', gradient:'linear-gradient(45deg,#ff7d6a,#ff4757,#d81b42)', icon:`<svg viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'><path d='M12.001 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41 1.01 4.22 2.44h.56C12.59 5.01 14.26 4 16 4 18.51 4 20.5 6 20.5 8.5c0 3.78-3.4 6.86-8.05 11.54l-1.45 1.31z'/></svg>` },
    merch: { button:'shop', primary:'#ffb400', gradient:'linear-gradient(45deg,#ffdd55,#ffb400,#ff9100)', icon:`<svg viewBox='0 0 24 24' fill='currentColor'><path d='M6 2l2 2h8l2-2h2v2h-1l-2 15H7L5 4H4V2h2zm3 7h2v7H9V9zm4 0h2v7h-2V9z'/></svg>` },
    patreon: { button:'support', primary:'#ff424d', gradient:'linear-gradient(45deg,#ff757d,#ff424d,#d81d2a)', icon:`<svg viewBox='0 0 24 24' fill='currentColor'><circle cx='14' cy='8' r='6'/><rect x='2' y='4' width='4' height='16' rx='2'/></svg>` },
    kofi: { button:'tip', primary:'#29abe0', gradient:'linear-gradient(45deg,#6fd3ff,#29abe0,#1173aa)', icon:`<svg viewBox='0 0 24 24' fill='currentColor'><path d='M5 3h13a4 4 0 010 8h-1v8H5a2 2 0 01-2-2V5a2 2 0 012-2zm11 6h1a2 2 0 100-4h-1v4z'/></svg>` },
    tiktok: { button:'view', primary:'#ff0050', gradient:'linear-gradient(45deg,#25F4EE,#000,#ff0050)', icon:`<svg viewBox='0 0 24 24' fill='currentColor'><path d='M16 8.04a6.5 6.5 0 01-1-.34v5.17a4.87 4.87 0 11-4.87-4.87c.17 0 .34.01.5.03v2.2a2.67 2.67 0 102.37 2.65V2h3a4.9 4.9 0 001 3.05A4.96 4.96 0 0020 6.9a6.96 6.96 0 01-4-1.53z'/></svg>` },
    youtube: { button:'subscribe', primary:'#ff0000', gradient:'linear-gradient(45deg,#ff7b7b,#ff0000,#b30000)', icon:`<svg viewBox='0 0 24 24' fill='currentColor'><path d='M21.8 8s-.2-1.4-.8-2c-.7-.8-1.5-.8-1.9-.9C16.9 5 12 5 12 5h0s-4.9 0-7.1.1c-.4 0-1.2.1-1.9.9-.6.6-.8 2-.8 2S2 9.6 2 11.3v1.3C2 14.4 2.2 16 2.2 16s.2 1.4.8 2c.7.8 1.6.8 2 .9 1.4.1 7 .1 7 .1s4.9 0 7.1-.1c.4-.1 1.2-.1 1.9-.9.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1.3C22 9.6 21.8 8 21.8 8zM10 14.6V9.4l5.2 2.6L10 14.6z'/></svg>` },
    x: { button:'follow', primary:'#fff', gradient:'linear-gradient(45deg,#666,#111)', icon:`<svg viewBox='0 0 24 24' fill='currentColor'><path d='M18 2h4l-9 9 9 11h-7l-5-6-6 6H0l10-10L0 2h7l5 6 6-6z'/></svg>` },
    threads: { button:'follow', primary:'#000', gradient:'linear-gradient(45deg,#333,#000)', icon:`<svg viewBox='0 0 24 24' fill='currentColor'><path d='M12 2c5.52 0 10 4.48 10 10s-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm1.2 14.9c2.3-.3 3.9-1.9 4.2-4.2.1-.9-.1-2.2-2-2.6.5-.4.8-1 .8-1.7 0-1.6-1.3-2.6-3.3-2.6H8.9v10.8h2.2v-3.7h.7l2.3 3.7h2.6l-2.7-4.1c.7-.3 1.3-.9 1.4-1.9.2 0 .8.2.7 1.2-.2 1.8-1.3 2.8-3.1 3-.8.1-1.5 0-2.1-.2v1.9c.6.1 1.3.2 2 .1z'/></svg>` },
    steam: { button:'view', primary:'#1b2838', gradient:'linear-gradient(45deg,#3a688f,#1b2838,#0f151b)', icon:`<svg viewBox='0 0 24 24' fill='currentColor'><path d='M21 3a3 3 0 00-3-3H6a3 3 0 00-3 3l-.01 9.72 5.13 2.18A3.99 3.99 0 0012 20a4 4 0 003.78-2.67l4.73-2.01L21 3zM7.5 17.1l-2.89-1.23.9-2.13 2.88 1.23a3.98 3.98 0 00-.89 2.13zM14 18a2 2 0 11.001-3.999A2 2 0 0114 18zm5-9h-4V5h4v4z'/></svg>` },
    newsletter: { button:'join', primary:'#009f6b', gradient:'linear-gradient(45deg,#40c999,#009f6b,#026649)', icon:`<svg viewBox='0 0 24 24' fill='currentColor'><path d='M4 4h16a2 2 0 012 2v1l-10 6L2 7V6a2 2 0 012-2zm0 6.75V18h16v-7.25l-8 4.8-8-4.8z'/></svg>` },
    website: { button:'open', primary:'#5c6ac4', gradient:'linear-gradient(45deg,#9fa8ff,#5c6ac4,#39408a)', icon:`<svg viewBox='0 0 24 24' fill='currentColor'><path d='M12 2a10 10 0 100 20 10 10 0 000-20zm1 17.9V13h4.9A8.01 8.01 0 0113 19.9zM6.1 11H11V6.1A8.01 8.01 0 016.1 11zM11 13H6.1A8.01 8.01 0 0111 19.9V13zm2-1h4.9A8.01 8.01 0 0013 6.1V12zm-1-9.9V11H6.1A8.01 8.01 0 0012 2.1z'/></svg>` },
    custom1: { button:'open', primary:'#888', gradient:'linear-gradient(45deg,#bbb,#888,#555)', icon:`<svg viewBox='0 0 24 24' fill='currentColor'><path d='M5 4h14v2H5v14H3V6a2 2 0 012-2zm4 4h12v10a2 2 0 01-2 2H9V8zm8 4H11v2h6v-2z'/></svg>` },
    custom2: { button:'open', primary:'#555', gradient:'linear-gradient(45deg,#777,#555,#333)', icon:`<svg viewBox='0 0 24 24' fill='currentColor'><path d='M4 4h10v2H4v10H2V6a2 2 0 012-2zm6 6h10v10a2 2 0 01-2 2H10V10zm8 4h-6v2h6v-2z'/></svg>` }
  };
  return map[type] || { button:'Open', primary: POPUP_CONFIG.baseHighlightColor, icon:'' };
}

function getNextSlot() {
  const enabled = slots.filter(s=>s.enabled);
  if (!enabled.length) return null;
  activeSlotIndex = (activeSlotIndex + 1) % enabled.length;
  return enabled[activeSlotIndex];
}

function renderSlot(slot) {
  if (!slot || !popupRoot) return;
  const defs = resolveTypeDefaults(slot.type);
  const text = slot.text || 'Check it out!';
  const buttonText = slot.buttonText || defs.button;
  const primaryColor = slot.primaryColor || defs.primary;
  popupTextEl.innerHTML = text;
  popupButtonLabel.textContent = (buttonText || '').toLowerCase();
  if (slot.buttonShowIcon && (slot.useDefaultIcon || slot.iconOverride)) {
    popupButtonIcon.innerHTML = slot.useDefaultIcon ? defs.icon : slot.iconOverride;
    popupButtonIcon.style.display='';
  } else { popupButtonIcon.innerHTML=''; popupButtonIcon.style.display='none'; }
  const root = document.documentElement;
  root.style.setProperty('--widget-primary-color', primaryColor);
  if (defs.gradient) root.style.setProperty('--btn-bg', defs.gradient); else root.style.removeProperty('--btn-bg');
  root.style.setProperty('--popup-bg', POPUP_CONFIG.baseBackgroundColor);
  root.style.setProperty('--popup-text-color', POPUP_CONFIG.baseTextColor);
  root.style.setProperty('--popup-hl-color', POPUP_CONFIG.baseHighlightColor);
  // Compose classes so field toggles work again (animation+position+offset)
  popupRoot.className = `popup-container anim-${POPUP_CONFIG.animationStyle} pos-${POPUP_CONFIG.positionVertical}-${POPUP_CONFIG.positionHorizontal} offset-${POPUP_CONFIG.positionVerticalOffset}`;
  if (POPUP_CONFIG.widgetBorderEnabled) popupRoot.classList.add('has-border');
  if (POPUP_CONFIG.widgetShadowEnabled) popupRoot.classList.add('has-shadow');
  if (POPUP_CONFIG.widgetRoundedCorners) popupRoot.classList.add('rounded-widget');
  if (POPUP_CONFIG.buttonRoundedCorners) popupButton.classList.add('rounded-button'); else popupButton.classList.remove('rounded-button');
  popupRoot.setAttribute('aria-hidden','false');
  popupRoot.setAttribute('aria-label', `CTA: ${slot.type}`);
}

function initializeWidget() {
  if (isInitialized) return;
  popupRoot = document.getElementById('multi-popup');
  popupTextEl = document.getElementById('popup-text');
  popupButton = document.getElementById('popup-button');
  popupButtonIcon = document.getElementById('popup-button-icon');
  popupButtonLabel = document.getElementById('popup-button-label');
  if (!popupRoot) { console.error('Multi-popup root not found'); return; }
  if (POPUP_CONFIG.enabled) startPopupCycle();
  isInitialized = true;
}

function startPopupCycle() {
  if (popupTimer) clearTimeout(popupTimer);
  scheduleNextPopup();
}

function scheduleNextPopup() {
  if (!POPUP_CONFIG.enabled || isPopupVisible) return;
  const enabledSlots = slots.filter(s=>s.enabled);
  if (!enabledSlots.length) { if (window.IG_DEBUG) console.warn('[Multi-CTA] No enabled slots'); return; }
  const now = Date.now();
  let delay = POPUP_CONFIG.showInterval;
  if (lastShowTime>0) {
    const elapsed = now - lastShowTime;
    delay = Math.max(0, POPUP_CONFIG.showInterval - elapsed);
  }
  if (popupTimer) clearTimeout(popupTimer);
  popupTimer = setTimeout(()=>{ if (!isPopupVisible) showPopup(); }, delay);
  if (window.IG_DEBUG) console.log(`[Multi-CTA] next in ${Math.round(delay/1000)}s`);
}

function showPopup() {
  if (isPopupVisible || !popupRoot) return;
  const slot = getNextSlot();
  if (!slot) { if (window.IG_DEBUG) console.warn('[Multi-CTA] no slot to show'); return; }
  renderSlot(slot);
  isPopupVisible = true;
  lastShowTime = Date.now();
  popupRoot.classList.add('show');
  popupRoot.classList.remove('hide');
  if (POPUP_CONFIG.idleShineEnabled) {
    setTimeout(()=> {
      popupRoot.classList.add('idle-shine');
      const hlEls = popupRoot.querySelectorAll('.username, .hl');
      hlEls.forEach(el=>{ el.classList.add('glow'); setTimeout(()=> el.classList.remove('glow'), 1200); });
      setTimeout(()=> popupRoot.classList.remove('idle-shine'), 1400);
    }, POPUP_CONFIG.displayDuration/2);
  }
  setTimeout(()=> hidePopup(), POPUP_CONFIG.displayDuration);
}

function hidePopup() {
  if (!isPopupVisible || !popupRoot) return;
  // add style-specific hide class so fade/pop can use custom exit
  const anim = POPUP_CONFIG.animationStyle;
  popupRoot.classList.add('hide');
  popupRoot.classList.add(`anim-${anim}`);
  popupRoot.classList.remove('show','idle-shine');
  // hide duration tuned to longest enter (~900ms) + displayDuration; exit anim shorter (.4-.75s)
  setTimeout(()=>{ isPopupVisible=false; scheduleNextPopup(); popupRoot.setAttribute('aria-hidden','true'); },500);
}

function forceShowPopup(slotIndex = null) {
  if (!isPopupVisible) {
    if (slotIndex != null) {
      const enabled = slots.filter(s=>s.enabled);
      const target = enabled[slotIndex];
      if (target) {
        renderSlot(target);
        isPopupVisible = true;
        lastShowTime = Date.now();
        popupRoot.classList.add('show');
        popupRoot.classList.remove('hide');
        popupButton.classList.add('clicked');
        setTimeout(()=> hidePopup(), POPUP_CONFIG.displayDuration);
        return;
      }
    }
    showPopup();
  }
}

function forceHidePopup() { if (isPopupVisible) hidePopup(); }

function togglePopupEnabled() {
  POPUP_CONFIG.enabled = !POPUP_CONFIG.enabled;
  if (POPUP_CONFIG.enabled) startPopupCycle(); else { if (popupTimer) clearTimeout(popupTimer); if (isPopupVisible) hidePopup(); }
  return POPUP_CONFIG.enabled;
}

function listWidgets() { console.table(slots); }

function multiPopupDebug() {
  return {
    now: Date.now(),
    showInterval: POPUP_CONFIG.showInterval,
    displayDuration: POPUP_CONFIG.displayDuration,
    lastShowTime,
    nextInMs: lastShowTime? Math.max(0, POPUP_CONFIG.showInterval - (Date.now()-lastShowTime)) : 0,
    isPopupVisible,
    activeSlotIndex,
    enabledSlots: slots.filter(s=>s.enabled).map(s=>s.id),
    config: POPUP_CONFIG
  };
}

window.addEventListener('onWidgetLoad', (e) => {
  const fieldData = e?.detail?.fieldData || e?.detail?.data?.fieldData;
  applyFieldData(fieldData);
  initializeWidget();
  if (POPUP_CONFIG.debugMode) console.log('[Multi-CTA] widget loaded');
  forceShowPopup();
});

document.addEventListener('DOMContentLoaded', () => { initializeWidget(); });

window.forceShowPopup = forceShowPopup;
window.forceHidePopup = forceHidePopup;
window.togglePopupEnabled = togglePopupEnabled;
window.listWidgets = listWidgets;
window.multiPopupDebug = multiPopupDebug;

console.log('🎮 Multi-Widget Popup System loaded');
console.log('📋 Available functions:');
console.log('  • forceShowPopup(slotIndex?) - Show popup immediately');
console.log('  • forceHidePopup() - Hide current popup');
console.log('  • togglePopupEnabled() - Enable/disable system');
console.log('  • listWidgets() - Show all slot configurations');
console.log(`⏰ Popups will show every ${POPUP_CONFIG.showInterval / 60000} minutes for ${POPUP_CONFIG.displayDuration / 1000} seconds`);
