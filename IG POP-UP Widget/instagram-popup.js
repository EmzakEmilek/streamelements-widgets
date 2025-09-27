/*
 * Multi-Widget Popup System
 * IG Multi-Popup Widget Version: 0.6.0
 * StreamElements compatible popup with rotating widgets
 */

/* Widget Configurations */
const WIDGET_CONFIGS = {
  instagram: {
    id: 'instagram',
    type: 'social',
    title: 'Instagram Follow',
    content: {
      icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
      </svg>`,
      text: 'Daj follow na môj IG <span class="username">emzo_gg</span>! ďakujem!🧡',
      buttonText: 'Follow',
      buttonIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke-width="2"/>
        <circle cx="12" cy="12" r="3" stroke-width="2"/>
        <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/>
      </svg>`
    },
    theme: {
      primaryColor: '#E4405F',
      buttonGradient: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)'
    },
    enabled: true
  },
  
  donate: {
    id: 'donate',
    type: 'thanks',
    title: 'Donation Thanks',
    content: {
      icon: `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>`,
      text: 'Ďakujem za <span class="username">vašu podporu</span>! veľmi si to vážim!🧡',
      buttonText: 'Donate',
      buttonIcon: `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>`
    },
    theme: {
      primaryColor: '#ff4757',
      buttonGradient: 'linear-gradient(45deg, #ff4757 0%, #ff3838 50%, #ff2f2f 100%)'
    },
    enabled: true
  },
  
  discord: {
    id: 'discord',
    type: 'social',
    title: 'Discord Join',
    content: {
      icon: `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.246.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.963a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.438a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
      </svg>`,
      text: 'Pripoj sa k nám na <span class="username">discord server</span>!',
      buttonText: 'Join',
      buttonIcon: `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026 13.83 13.83 0 0 0 1.226-1.963.074.074 0 0 0-.041-.104 13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.246.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.963a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.438a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
      </svg>`
    },
    theme: {
      primaryColor: '#5865F2',
      buttonGradient: 'linear-gradient(45deg, #5865F2 0%, #4752C4 50%, #3C45A5 100%)'
    },
    enabled: true
  },
  
  subtember: {
    id: 'subtember',
    type: 'promo',
    title: 'Subtember Promo',
    content: {
      icon: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
      </svg>`,
      text: '<span class="username">SUBTEMBER</span> je v plnom prúde! využi <span class="username">zľavu</span>!',
      buttonText: 'Subscribe',
      buttonIcon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 12l2 2 4-4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="12" cy="12" r="9" stroke-width="2"/>
      </svg>`
    },
    theme: {
      primaryColor: '#9c88ff',
      buttonGradient: 'linear-gradient(45deg, #9c88ff 0%, #8c7ae6 50%, #7bed9f 100%)'
    },
    enabled: true // Activated for demo
  },
  
  christmas: {
    id: 'christmas',
    type: 'seasonal',
    title: 'Christmas Wishes',
    content: {
      icon: `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>`,
      text: '<span class="username">Šťastné a veselé Vianoce!</span> ❄️🎄✨',
      buttonText: '🎁 Gift',
      buttonIcon: `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>`
    },
    theme: {
      primaryColor: '#2ed573',
      buttonGradient: 'linear-gradient(45deg, #ff4757 0%, #2ed573 50%, #ffa502 100%)'
    },
    enabled: false, // Enable when needed
    seasonal: { months: [11, 12, 1] } // Nov, Dec, Jan
  }
};

/* Global Configuration */
/* Global Configuration */
const POPUP_CONFIG = {
  showInterval: 15 * 60 * 1000,    // 15 minutes in milliseconds
  displayDuration: 10 * 1000,      // 10 seconds visible
  buttonAnimationDelay: 3000,      // Button animation starts after 3s
  enabled: true,                   // Set to false to disable popup
  rotateWidgets: true,             // Enable widget rotation
  randomOrder: false               // Set to true for random widget selection
};

/* Field Overrides */
function applyFieldData(fieldData) {
  if (!fieldData) return;
  try {
    if (isFinite(fieldData.intervalSeconds)) {
      POPUP_CONFIG.showInterval = Number(fieldData.intervalSeconds) * 1000;
    }
    if (isFinite(fieldData.showDurationSeconds)) {
      POPUP_CONFIG.displayDuration = Number(fieldData.showDurationSeconds) * 1000;
    }
    if (isFinite(fieldData.initialDelaySeconds)) {
      // schedule first popup after initial delay by adjusting lastShowTime
      lastShowTime = Date.now() - (POPUP_CONFIG.showInterval - Number(fieldData.initialDelaySeconds) * 1000);
    }
    if (fieldData.rotationMode) {
      POPUP_CONFIG.randomOrder = fieldData.rotationMode === 'random';
    }
    if (typeof fieldData.debugMode === 'boolean') {
      window.IG_DEBUG = fieldData.debugMode;
    }
    if (typeof fieldData.testMode === 'boolean') {
      window.IG_TEST_MODE = fieldData.testMode;
    }
    if (fieldData.accentColor) {
      document.documentElement.style.setProperty('--accent-color', fieldData.accentColor);
    }
    if (fieldData.backgroundColor) {
      document.documentElement.style.setProperty('--popup-bg', fieldData.backgroundColor);
    }
    if (isFinite(fieldData.fontSize)) {
      document.documentElement.style.setProperty('--popup-font-size', fieldData.fontSize + 'px');
    }
    // Override popup texts if provided
    if (fieldData.popup1Text) {
      WIDGET_CONFIGS.instagram.content.text = fieldData.popup1Text;
    }
    if (fieldData.popup2Text) {
      WIDGET_CONFIGS.discord.content.text = fieldData.popup2Text;
    }
    if (fieldData.popup3Text) {
      // pick a third: donate or subtember depending on content
      WIDGET_CONFIGS.donate.content.text = fieldData.popup3Text;
    }
    if (window.IG_DEBUG) {
      console.log('[IG Popup] Field overrides applied', { POPUP_CONFIG, fieldData });
    }
  } catch (e) {
    console.error('Failed to apply IG popup field data', e);
  }
}

/* State management */
let popupTimer = null;
let isPopupVisible = false;
let lastShowTime = 0;
let currentWidgetIndex = 0;
let availableWidgets = [];
let isInitialized = false; // guard to prevent double init from multiple events

/* DOM elements */
let popupContainer = null;
let popupBanner = null;
let contentContainer = null;
let followButton = null;
let usernameElement = null;

/* Widget Management Functions */
function getAvailableWidgets() {
  const currentMonth = new Date().getMonth() + 1; // 1-12
  
  return Object.values(WIDGET_CONFIGS).filter(widget => {
    if (!widget.enabled) return false;
    
    // Check seasonal availability
    if (widget.seasonal) {
      if (widget.seasonal.month && widget.seasonal.month !== currentMonth) return false;
      if (widget.seasonal.months && !widget.seasonal.months.includes(currentMonth)) return false;
    }
    
    return true;
  });
}

function getNextWidget() {
  if (availableWidgets.length === 0) return null;
  
  if (POPUP_CONFIG.randomOrder) {
    return availableWidgets[Math.floor(Math.random() * availableWidgets.length)];
  }
  
  // Sequential rotation
  const widget = availableWidgets[currentWidgetIndex];
  currentWidgetIndex = (currentWidgetIndex + 1) % availableWidgets.length;
  return widget;
}

function renderWidget(widget) {
  if (!widget || !popupBanner || !followButton) return;
  
  console.log(`Rendering widget: ${widget.title}`);
  
  // Update content
  contentContainer.innerHTML = `
    <div class="text-container">
      ${widget.content.text}
    </div>
  `;
  
  // Extract SVG content properly - preserve all attributes
  const buttonIconSVG = widget.content.buttonIcon;
  let viewBoxMatch = buttonIconSVG.match(/viewBox="([^"]+)"/);
  let viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24';
  
  // Preserve all SVG attributes by extracting them
  let fillMatch = buttonIconSVG.match(/fill="([^"]+)"/);
  let strokeMatch = buttonIconSVG.match(/stroke="([^"]+)"/);
  
  let fillAttr = fillMatch ? `fill="${fillMatch[1]}"` : '';
  let strokeAttr = strokeMatch ? `stroke="${strokeMatch[1]}"` : '';
  
  let svgContent = buttonIconSVG.replace(/<svg[^>]*>|<\/svg>/g, '');
  
  // Update button with proper SVG structure preserving attributes
  followButton.innerHTML = `
    <svg class="button-icon" viewBox="${viewBox}" ${fillAttr} ${strokeAttr} xmlns="http://www.w3.org/2000/svg">
      ${svgContent}
    </svg>
    <span>${widget.content.buttonText}</span>
  `;
  
  // Apply theme
  const root = document.documentElement;
  root.style.setProperty('--widget-primary-color', widget.theme.primaryColor);
  followButton.style.background = widget.theme.buttonGradient;
  
  // Update username elements for animations
  usernameElement = contentContainer.querySelector('.username');
}

/* Initialize widget */
function initializeWidget() {
  if (isInitialized) {
    console.log('Popup system already initialized – skipping');
    return;
  }
  // Get DOM elements
  popupContainer = document.getElementById('popup-container');
  popupBanner = document.getElementById('popup-banner');
  contentContainer = document.getElementById('content-container');
  followButton = document.getElementById('follow-button');
  usernameElement = document.querySelector('.username');
  
  if (!popupContainer || !contentContainer || !followButton) {
    console.error('Required popup elements not found');
    return;
  }
  
  // Initialize available widgets
  availableWidgets = getAvailableWidgets();
  console.log(`Multi-Widget Popup System initialized with ${availableWidgets.length} widgets`);
  console.log('Available widgets:', availableWidgets.map(w => w.title));
  
  // Start the popup cycle
  if (POPUP_CONFIG.enabled && availableWidgets.length > 0) {
    startPopupCycle();
  }
  isInitialized = true;
}

/* Start the popup display cycle */
function startPopupCycle() {
  // Clear any existing timer
  if (popupTimer) {
    clearTimeout(popupTimer);
  }
  
  // Schedule first popup
  scheduleNextPopup();
}

/* Schedule the next popup appearance */
function scheduleNextPopup() {
  if (!POPUP_CONFIG.enabled || isPopupVisible) return;
  // keep a stable cadence: next show starts exactly showInterval after lastShowTime
  const now = Date.now();
  let delay = POPUP_CONFIG.showInterval;
  if (lastShowTime > 0) {
    const elapsedSinceLastShow = now - lastShowTime;
    delay = Math.max(0, POPUP_CONFIG.showInterval - elapsedSinceLastShow);
  }

  if (popupTimer) clearTimeout(popupTimer);
  popupTimer = setTimeout(() => {
    if (!isPopupVisible) {
      showPopup();
    }
  }, delay);
  
  console.log(`Next popup scheduled in ${Math.round(delay / 1000)}s`);
}

/* Show the popup with animations */
function showPopup() {
  if (isPopupVisible || !popupContainer) return;
  
  // Get next widget to display
  const currentWidget = getNextWidget();
  if (!currentWidget) {
    console.log('No available widgets to display');
    return;
  }
  
  // Render the selected widget
  renderWidget(currentWidget);
  
  isPopupVisible = true;
  lastShowTime = Date.now();
  
  console.log(`Showing ${currentWidget.title} popup`);
  
  // Show popup with slide-in animation
  popupContainer.classList.add('show');
  popupContainer.classList.remove('hide');
  
  // Schedule button click animation
  setTimeout(() => {
    if (isPopupVisible) {
      simulateButtonClick();
    }
  }, POPUP_CONFIG.buttonAnimationDelay);
  
  // Schedule popup hide
  setTimeout(() => {
    hidePopup();
  }, POPUP_CONFIG.displayDuration);
}

/* Hide the popup with animations */
function hidePopup() {
  if (!isPopupVisible || !popupContainer) return;
  
  console.log('Hiding Instagram popup');
  
  // Hide popup with slide-out animation
  popupContainer.classList.add('hide');
  popupContainer.classList.remove('show');
  
  // Reset button state
  if (followButton) {
    followButton.classList.remove('clicked');
  }
  
  // Reset text animations
  if (usernameElement) {
    usernameElement.classList.remove('glow');
  }
  
  // Update state after animation completes
  setTimeout(() => {
    isPopupVisible = false;
    // Schedule next popup keeping cadence from lastShowTime
    scheduleNextPopup();
  }, 700); // Wait for faster hide animation to complete
}

/* Simulate follow button click with effects */
function simulateButtonClick() {
  if (!followButton || !isPopupVisible) return;
  
  console.log('Simulating follow button click');
  
  // Button click effect
  followButton.classList.add('clicked');
  
  // Username glow effect
  if (usernameElement) {
    usernameElement.classList.add('glow');
  }
}

/* Manual controls for testing */
function forceShowPopup(widgetId = null) {
  if (!isPopupVisible) {
    if (widgetId) {
      // Force show specific widget
      const widget = WIDGET_CONFIGS[widgetId];
      if (widget && widget.enabled) {
        renderWidget(widget);
        isPopupVisible = true;
        popupContainer.classList.add('show');
        popupContainer.classList.remove('hide');
        setTimeout(() => simulateButtonClick(), POPUP_CONFIG.buttonAnimationDelay);
        setTimeout(() => hidePopup(), POPUP_CONFIG.displayDuration);
        return;
      } else {
        console.log(`Widget "${widgetId}" not found or not enabled`);
      }
    }
    showPopup();
  }
}

function forceHidePopup() {
  if (isPopupVisible) {
    hidePopup();
  }
}

function togglePopupEnabled() {
  POPUP_CONFIG.enabled = !POPUP_CONFIG.enabled;
  console.log(`Multi-Widget Popup ${POPUP_CONFIG.enabled ? 'enabled' : 'disabled'}`);
  
  if (POPUP_CONFIG.enabled) {
    availableWidgets = getAvailableWidgets();
    startPopupCycle();
  } else {
    if (popupTimer) {
      clearTimeout(popupTimer);
    }
    if (isPopupVisible) {
      hidePopup();
    }
  }
  
  return POPUP_CONFIG.enabled;
}

/* Widget Management Functions */
function enableWidget(widgetId, enable = true) {
  if (WIDGET_CONFIGS[widgetId]) {
    WIDGET_CONFIGS[widgetId].enabled = enable;
    availableWidgets = getAvailableWidgets();
    console.log(`Widget "${widgetId}" ${enable ? 'enabled' : 'disabled'}`);
    console.log(`Available widgets: ${availableWidgets.length}`);
    return true;
  }
  console.log(`Widget "${widgetId}" not found`);
  return false;
}

function listWidgets() {
  console.log('=== WIDGET CONFIGURATIONS ===');
  Object.values(WIDGET_CONFIGS).forEach(widget => {
    const status = widget.enabled ? '✅ ENABLED' : '❌ DISABLED';
    const seasonal = widget.seasonal ? ` (Seasonal: ${JSON.stringify(widget.seasonal)})` : '';
    console.log(`${widget.id}: ${widget.title} - ${status}${seasonal}`);
  });
  console.log(`\nCurrently available: ${availableWidgets.length} widgets`);
}

/* StreamElements compatibility */
window.addEventListener('onWidgetLoad', (e) => {
  console.log('StreamElements widget loaded');
  const fieldData = e?.detail?.fieldData || e?.detail?.data?.fieldData;
  applyFieldData(fieldData);
  initializeWidget();
  if (window.IG_TEST_MODE) {
    setTimeout(() => forceShowPopup('instagram'), 1500);
  }
});

/* Initialize on page load */
document.addEventListener('DOMContentLoaded', () => {
  initializeWidget();
});

/* Global functions for testing */
window.forceShowPopup = forceShowPopup;
window.forceHidePopup = forceHidePopup;
window.togglePopupEnabled = togglePopupEnabled;
window.enableWidget = enableWidget;
window.listWidgets = listWidgets;
window.WIDGET_CONFIGS = WIDGET_CONFIGS;

/* Debug info */
console.log('🎮 Multi-Widget Popup System loaded');
console.log('📋 Available functions:');
console.log('  • forceShowPopup(widgetId?) - Show popup immediately');
console.log('  • forceHidePopup() - Hide current popup');
console.log('  • togglePopupEnabled() - Enable/disable system');
console.log('  • enableWidget(id, true/false) - Enable/disable specific widget');
console.log('  • listWidgets() - Show all widget configurations');
console.log(`⏰ Popups will show every ${POPUP_CONFIG.showInterval / 60000} minutes for ${POPUP_CONFIG.displayDuration / 1000} seconds`);