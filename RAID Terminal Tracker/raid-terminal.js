/*
 * Raid Terminal Tracker
 * Version: 0.2.0
 * Terminal-style raid activity feed with live tracking
 * Shows raid info and all subsequent activities in ASCII tree format
 */

/* Configuration */
const RAID_CONFIG = {
    showDelay: 17 * 1000,           // 17 seconds delay after raid (after raid alert)
    displayDuration: 180 * 1000,    // Show terminal for 4 minutes
    maxActivities: 30,              // Max activities to show before scrolling
    typingSpeed: 50,                // Typing animation speed (ms per character)
    deletingSpeed: 30,              // Deleting animation speed (ms per character)
    enabled: true,                  // Enable/disable the widget
    autoHide: true                  // Auto-hide after duration
};

// Filtering config: show only activities from raiders
const RAID_FILTER = {
    onlyRaiders: true,                     // if true, we filter to raiders only
    detectionWindowMs: null,               // null => use displayDuration; else specific ms
    requireMessageToQualify: true          // if true, a user becomes a raider only after sending a message post-raid
};

// Accept silent events (follow/sub/dono etc.) as qualification without message (set via fields)
let ACCEPT_SILENT_EVENTS = false;

/* Apply Field Data Overrides */
function applyFieldData(fieldData) {
    if (!fieldData) return;
    try {
        // Numeric conversions (seconds -> ms)
        if (isFinite(fieldData.showDelaySeconds)) {
            RAID_CONFIG.showDelay = Number(fieldData.showDelaySeconds) * 1000;
        }
        if (isFinite(fieldData.displayDurationSeconds)) {
            RAID_CONFIG.displayDuration = Number(fieldData.displayDurationSeconds) * 1000;
        }
        if (isFinite(fieldData.maxActivities)) {
            RAID_CONFIG.maxActivities = Number(fieldData.maxActivities);
        }
        if (typeof fieldData.onlyRaiders === 'boolean') {
            RAID_FILTER.onlyRaiders = fieldData.onlyRaiders;
        }
        if (typeof fieldData.requireMessageToQualify === 'boolean') {
            RAID_FILTER.requireMessageToQualify = fieldData.requireMessageToQualify;
        }
        if (typeof fieldData.acceptSilentEvents === 'boolean') {
            ACCEPT_SILENT_EVENTS = fieldData.acceptSilentEvents;
            // If we accept silent events, we can relax message requirement if user disabled it
        }
        if (typeof fieldData.autoHide === 'boolean') {
            RAID_CONFIG.autoHide = fieldData.autoHide;
        }
        if (typeof fieldData.debugMode === 'boolean') {
            window.RAID_DEBUG = fieldData.debugMode;
        }
        if (typeof fieldData.testMode === 'boolean') {
            window.RAID_TEST_MODE = fieldData.testMode;
        }
        if (isFinite(fieldData.fontSize)) {
            document.documentElement.style.setProperty('--raid-font-size', `${fieldData.fontSize}px`);
        }
        if (fieldData.accentColor) {
            document.documentElement.style.setProperty('--accent-color', fieldData.accentColor);
        }
        if (fieldData.backgroundColor) {
            document.documentElement.style.setProperty('--terminal-bg', fieldData.backgroundColor);
        }
        if (window.RAID_DEBUG) {
            console.log('[RaidTerminal] Field overrides applied:', { RAID_CONFIG, RAID_FILTER, ACCEPT_SILENT_EVENTS });
        }
    } catch (e) {
        console.error('Failed to apply field data', e);
    }
}

/* Typewriter Effect */
let activeTypewriterInterval = null;

function typewriterEffect(element, newText, callback = () => {}) {
    if (!element) return;
    
    // Clear any existing typewriter animation
    if (activeTypewriterInterval) {
        clearInterval(activeTypewriterInterval);
        activeTypewriterInterval = null;
    }
    
    element.classList.add('typing-cursor');
    let currentText = element.textContent || '';
    
    // Delete existing text
    const deleteInterval = setInterval(() => {
        if (currentText.length > 0) {
            currentText = currentText.slice(0, -1);
            element.textContent = currentText;
        } else {
            clearInterval(deleteInterval);
            
            // Type new text
            let charIndex = 0;
            const typeInterval = setInterval(() => {
                if (charIndex < newText.length) {
                    currentText += newText.charAt(charIndex);
                    element.textContent = currentText;
                    charIndex++;
                } else {
                    clearInterval(typeInterval);
                    activeTypewriterInterval = null;
                    element.classList.remove('typing-cursor');
                    callback();
                }
            }, RAID_CONFIG.typingSpeed);
            activeTypewriterInterval = typeInterval;
        }
    }, RAID_CONFIG.deletingSpeed);
}

/* Fast Typewriter Effect for Activities */
function fastTypewriterEffect(element, newText, callback = () => {}) {
    if (!element) return;
    
    element.classList.add('typing-cursor');
    element.textContent = '';
    
    let charIndex = 0;
    const fastTypeInterval = setInterval(() => {
        if (charIndex < newText.length) {
            element.textContent += newText.charAt(charIndex);
            charIndex++;
        } else {
            clearInterval(fastTypeInterval);
            element.classList.remove('typing-cursor');
            callback();
        }
    }, 25); // Fixed fast speed for activities
}

/* Activity Types and Icons - beautiful colored emoji */
const ACTIVITY_TYPES = {
    welcome: { icon: '👋', text: 'vitaj raider' },
    follow: { icon: '⭐', text: 'nový follow od raidera' },
    sub: { icon: '💎', text: 'nový sub od raidera' },
    donation: { icon: '🎁', text: 'dono od raidera' },
    bits: { icon: '💜', text: 'bits' },
    host: { icon: '📺', text: 'host' },
    raid: { icon: '⚡', text: 'raid' }
};

/* State Management */
let raidState = {
    active: false,
    raidInfo: null,
    activities: [],
    timers: {},
    stats: {
        follows: 0,
        messages: 0
    },
    startTime: null,
    seenChatters: new Set(),      // welcomed users (to avoid duplicate welcomes)
    preRaidChatters: new Set(),   // snapshot of chatters before raid
    raiders: new Set()            // detected raider nicknames
};

// Global set of all chatters observed since widget load
const allChatters = new Set();

/* DOM Elements */
let terminalContainer = null;
let raidInfo = null;
let activityFeed = null;
let statsElements = {};

/* Initialize Widget */
function initializeRaidTerminal() {
    console.log('🎯 Raid Terminal Tracker initialized');
    
    // Get DOM elements
    terminalContainer = document.getElementById('raid-terminal-container');
    raidInfo = document.getElementById('raid-info');
    activityFeed = document.getElementById('activity-feed');
    
    // Get stats elements
    statsElements = {
        follows: document.getElementById('follow-count'),
        messages: document.getElementById('message-count'),
        timer: document.getElementById('activity-timer')
    };
    
    // Validate elements
    if (!terminalContainer || !raidInfo || !activityFeed) {
        console.error('❌ Required DOM elements not found');
        return;
    }
    
    console.log('✅ Raid Terminal ready for action');
}

/* Handle Raid Event */
function onRaidReceived(raidData) {
    if (!RAID_CONFIG.enabled || raidState.active) return;
    
    console.log('⚔️ Raid detected:', raidData);
    
    // Helper to extract game/category from various possible fields
    const getRaidGame = (data) => {
        const candidates = [
            data.game,
            data.category,
            data.meta?.game,
            data.metadata?.game,
            data.data?.game,
            data.twitch?.game,
            data.channel?.game,
            data?.raid?.game
        ];
        const found = candidates.find(v => typeof v === 'string' && v.trim().length > 0);
        return found || 'Unknown Game';
    };

    // Store raid info
    raidState.raidInfo = {
        raider: raidData.username || raidData.name || 'Unknown Raider',
        game: getRaidGame(raidData),
        viewerCount: raidData.amount || raidData.viewers || 0,
        message: raidData.message || ''
    };
    
    // Set raid as active
    raidState.active = true;
    raidState.startTime = Date.now();
    raidState.activities = [];
    
    // Reset stats
    raidState.stats = {
        follows: 0,
        messages: 0
    };
    raidState.seenChatters = new Set();
    raidState.preRaidChatters = new Set(allChatters); // snapshot existing chatters
    raidState.raiders = new Set();
    // Seed raiders with the raider leader (always considered a raider)
    if (raidState.raidInfo.raider) {
        raidState.raiders.add(String(raidState.raidInfo.raider).toLowerCase());
    }
    
    // Show terminal after delay
    setTimeout(() => {
        showRaidTerminal();
    }, RAID_CONFIG.showDelay);
    
    // Auto-hide after duration
    if (RAID_CONFIG.autoHide) {
        raidState.timers.autoHide = setTimeout(() => {
            hideRaidTerminal();
        }, RAID_CONFIG.showDelay + RAID_CONFIG.displayDuration);
    }
}

/* Show Raid Terminal */
function showRaidTerminal() {
    if (!raidState.active || !raidState.raidInfo) return;
    
    console.log('📺 Showing raid terminal');
    
    // Update raid info
    updateRaidInfo();
    
    // Show terminal with animation
    terminalContainer.classList.remove('hidden');
    setTimeout(() => {
        terminalContainer.classList.add('show', 'active');
    }, 100);
    
    // Start activity timer
    startActivityTimer();
    
    // Add initial welcome message for the raider
    setTimeout(() => {
        addActivity('welcome', raidState.raidInfo.raider.toLowerCase(), {
            message: `ďakujem za raid s ${raidState.raidInfo.viewerCount} divákmi!`
        });
    }, 1000);
}

/* Hide Raid Terminal */
function hideRaidTerminal() {
    if (!raidState.active) return;
    
    console.log('📺 Hiding raid terminal');
    
    // Hide with animation
    terminalContainer.classList.remove('show', 'active');
    
    setTimeout(() => {
        terminalContainer.classList.add('hidden');
        raidState.active = false;
        raidState.raidInfo = null;
        raidState.activities = [];
        raidState.seenChatters = new Set();
        
        // Clear timers
        Object.values(raidState.timers).forEach(timer => {
            if (timer) clearTimeout(timer);
        });
        raidState.timers = {};
        
    }, 500);
}

/* Update Raid Info Display */
function updateRaidInfo() {
    const { raider, game, viewerCount } = raidState.raidInfo;
    // Directly assign static raid info to avoid typewriter cursor issues
    const raiderElement = document.getElementById('raider-name');
    if (raiderElement) {
        raiderElement.textContent = raider.toLowerCase();
        raiderElement.classList.remove('typing-cursor');
    }
    const gameElement = document.getElementById('raid-game');
    if (gameElement) {
        gameElement.textContent = game.toLowerCase();
        gameElement.classList.remove('typing-cursor');
    }
    const countElement = document.getElementById('raid-count');
    if (countElement) {
        countElement.textContent = viewerCount.toString();
        countElement.classList.remove('typing-cursor');
    }
}

/* Type Text Effect - Legacy function kept for compatibility */
function typeText(elementId, text, delay = 0) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    setTimeout(() => {
        typewriterEffect(element, text);
    }, delay);
}

/* Add Activity to Feed */
function addActivity(type, username, data = {}) {
    if (!raidState.active) return;
    
    const activity = {
        type,
        username,
        data,
        timestamp: Date.now(),
        id: Date.now() + Math.random()
    };
    
    raidState.activities.push(activity);
    
    // Update stats
    if (type === 'follow') {
        raidState.stats.follows++;
    }
    
    // Render activity
    renderActivity(activity);
    
    // Update stats display
    updateStatsDisplay();
    
    // Limit activities
    if (raidState.activities.length > RAID_CONFIG.maxActivities) {
        removeOldestActivity();
    }
    
    console.log(`📝 Activity added: ${type} - ${username}`);
}

/* Render Activity in Terminal */
function renderActivity(activity) {
    const activityType = ACTIVITY_TYPES[activity.type];
    if (!activityType) return;
    
    const activityElement = document.createElement('div');
    activityElement.className = `terminal-line activity-line ${activity.type}`;
    activityElement.dataset.activityId = activity.id;
    
    // Create tree connector
    const isLast = raidState.activities.length === 1;
    const connector = isLast ? '└─' : '├─';
    
    // Build activity text
    let activityText = '';
    
    switch (activity.type) {
        case 'welcome':
            activityText = `${activityType.text} <span class="username">${activity.username}</span>`;
            if (activity.data.message) {
                activityText += ` - ${activity.data.message}`;
            }
            break;
            
        case 'follow':
            activityText = `${activityType.text}: <span class="username">${activity.username}</span>`;
            break;
            
        case 'sub':
            const tier = activity.data.tier ? ` (tier ${activity.data.tier})` : '';
            activityText = `${activityType.text}: <span class="username">${activity.username}</span>${tier}`;
            break;
            
        case 'donation':
            const amount = activity.data.amount ? `$${activity.data.amount}` : '';
            activityText = `${activityType.text}: ${amount} from <span class="username">${activity.username}</span>`;
            break;
            
        case 'bits':
            const bitAmount = activity.data.amount ? `${activity.data.amount} bits` : '';
            activityText = `${activityType.text}: ${bitAmount} from <span class="username">${activity.username}</span>`;
            break;
            
        default:
            activityText = `${activityType.text}: <span class="username">${activity.username}</span>`;
    }
    
    activityElement.innerHTML = `
        <span class="tree-connector">${connector}</span>
        <span class="activity-icon">${activityType.icon}</span>
        <span class="activity-text"></span>
    `;
    
    // Add to feed
    activityFeed.appendChild(activityElement);
    
    // Animate the activity text with typewriter effect (faster for activities)
    const activityTextElement = activityElement.querySelector('.activity-text');
    if (activityTextElement) {
        // Create temporary div to get plain text without HTML
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = activityText;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        
        setTimeout(() => {
            // Use faster typing for activities with custom function
            fastTypewriterEffect(activityTextElement, plainText, () => {
                // After typing animation, set the full HTML content
                activityTextElement.innerHTML = activityText;
            });
        }, 100);
    }
    
    // Update previous last connector
    updateTreeConnectors();
    
    // Auto-scroll to bottom of activity container
    const activityContainer = document.querySelector('.activity-container');
    if (activityContainer) {
        setTimeout(() => {
            activityContainer.scrollTop = activityContainer.scrollHeight;
        }, 500); // Longer delay to account for typing animation
    }
}

/* Update Tree Connectors */
function updateTreeConnectors() {
    const activities = activityFeed.querySelectorAll('.activity-line');
    activities.forEach((activity, index) => {
        const connector = activity.querySelector('.tree-connector');
        if (connector) {
            const isLast = index === activities.length - 1;
            connector.textContent = isLast ? '└─' : '├─';
        }
    });
}

/* Remove Oldest Activity */
function removeOldestActivity() {
    const oldestActivity = activityFeed.querySelector('.activity-line');
    if (oldestActivity) {
        oldestActivity.style.opacity = '0';
        setTimeout(() => {
            oldestActivity.remove();
            updateTreeConnectors();
        }, 300);
    }
}

/* Update Stats Display */
function updateStatsDisplay() {
    if (statsElements.follows) {
        statsElements.follows.textContent = raidState.stats.follows;
    }
    if (statsElements.messages) {
        statsElements.messages.textContent = raidState.stats.messages;
    }
}

/* Start Activity Timer */
function startActivityTimer() {
    if (raidState.timers.activityTimer) {
        clearInterval(raidState.timers.activityTimer);
    }
    
    raidState.timers.activityTimer = setInterval(() => {
        if (!raidState.active || !raidState.startTime) return;
        
        const elapsed = Date.now() - raidState.startTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        if (statsElements.timer) {
            statsElements.timer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }, 1000);
}

/* Event Handlers for StreamElements */
function onFollowerLatest(follower) {
    if (!raidState.active) return;
    const uname = (follower.name || follower.username || '').toLowerCase();
    maybeQualifySilentRaider(uname);
    if (!RAID_FILTER.onlyRaiders || raidState.raiders.has(uname)) {
        addActivity('follow', uname);
    }
}

function onSubscriberLatest(subscriber) {
    if (!raidState.active) return;
    const uname = (subscriber.name || subscriber.username || '').toLowerCase();
    maybeQualifySilentRaider(uname);
    if (!RAID_FILTER.onlyRaiders || raidState.raiders.has(uname)) {
        addActivity('sub', uname, {
            tier: subscriber.tier || subscriber.sub_plan || 1,
            message: subscriber.message
        });
    }
}

function onTipLatest(tip) {
    if (!raidState.active) return;
    const uname = (tip.name || tip.username || '').toLowerCase();
    maybeQualifySilentRaider(uname);
    if (!RAID_FILTER.onlyRaiders || raidState.raiders.has(uname)) {
        addActivity('donation', uname, {
            amount: tip.amount,
            message: tip.message
        });
    }
}

function onCheerLatest(cheer) {
    if (!raidState.active) return;
    const uname = (cheer.name || cheer.username || '').toLowerCase();
    maybeQualifySilentRaider(uname);
    if (!RAID_FILTER.onlyRaiders || raidState.raiders.has(uname)) {
        addActivity('bits', uname, {
            amount: cheer.amount
        });
    }
}

function onHostLatest(host) {
    if (!raidState.active) return;
    const uname = (host.name || host.username || '').toLowerCase();
    maybeQualifySilentRaider(uname);
    if (!RAID_FILTER.onlyRaiders || raidState.raiders.has(uname)) {
        addActivity('host', uname, {
            viewers: host.amount
        });
    }
}

function onMessage(message) {
    // Track all chatters globally
    if (message?.nick) {
        allChatters.add(message.nick.toLowerCase());
    }

    if (!raidState.active) return;

    const now = Date.now();
    const windowMs = RAID_FILTER.detectionWindowMs || RAID_CONFIG.displayDuration;
    const uname = (message?.nick || '').toLowerCase();
    if (!uname) return;

    // Determine if this chatter qualifies as raider
    let isRaider = raidState.raiders.has(uname);
    if (!isRaider && RAID_FILTER.requireMessageToQualify) {
        const isNewSinceRaid = !raidState.preRaidChatters.has(uname);
        const withinWindow = now - raidState.startTime <= windowMs;
        if (isNewSinceRaid && withinWindow) {
            raidState.raiders.add(uname);
            isRaider = true;
        }
    }

    // Update message stats only for raiders when filtering is enabled
    if (!RAID_FILTER.onlyRaiders || isRaider) {
        raidState.stats.messages++;
        updateStatsDisplay();
    }

    // Welcome only raiders, and only once per user
    if (isRaider && !raidState.seenChatters.has(uname)) {
        raidState.seenChatters.add(uname);
        setTimeout(() => {
            addActivity('welcome', uname);
        }, Math.random() * 2000);
    }
}

/* Qualify Raider via Silent Event (follow/sub/dono/bits/host) */
function maybeQualifySilentRaider(uname) {
    if (!raidState.active) return;
    if (!ACCEPT_SILENT_EVENTS) return;
    if (raidState.raiders.has(uname)) return;
    const now = Date.now();
    const windowMs = RAID_FILTER.detectionWindowMs || RAID_CONFIG.displayDuration;
    const withinWindow = now - raidState.startTime <= windowMs;
    const isNewSinceRaid = !raidState.preRaidChatters.has(uname);
    if (withinWindow && isNewSinceRaid) {
        raidState.raiders.add(uname);
        if (window.RAID_DEBUG) console.log('[RaidTerminal] Silent raider qualified:', uname);
    }
}

/* Manual Controls for Testing */
function forceShowRaidTerminal(testData = null) {
    const defaultTestData = {
        username: 'test_raider',
        game: 'Just Chatting',
        amount: 42,
        message: 'Test raid message!'
    };
    
    onRaidReceived(testData || defaultTestData);
}

function forceHideRaidTerminal() {
    hideRaidTerminal();
}

function addTestActivity(type = 'follow', username = 'test_user') {
    const testData = {
        follow: { },
        sub: { tier: 1 },
        donation: { amount: 5.00 },
        bits: { amount: 100 }
    };
    
    addActivity(type, username, testData[type] || {});
}

/* StreamElements Events */
window.addEventListener('onWidgetLoad', function(obj) {
    console.log('🎯 Raid Terminal Widget loaded');
    // Apply field overrides early
    const fieldData = obj?.detail?.fieldData || obj?.detail?.data?.fieldData;
    applyFieldData(fieldData);
    initializeRaidTerminal();
    // Optional test mode
    if (window.RAID_TEST_MODE) {
        setTimeout(() => {
            forceShowRaidTerminal();
        }, 1500);
    }
});

window.addEventListener('onEventReceived', function(obj) {
    if (!obj.detail || !obj.detail.event) return;
    
    const event = obj.detail.event;
    const listener = obj.detail.listener;
    
    console.log('📡 Event received:', listener, event);
    
    switch (listener) {
        case 'raid-latest':
            onRaidReceived(event);
            break;
        case 'follower-latest':
            onFollowerLatest(event);
            break;
        case 'subscriber-latest':
            onSubscriberLatest(event);
            break;
        case 'tip-latest':
            onTipLatest(event);
            break;
        case 'cheer-latest':
            onCheerLatest(event);
            break;
        case 'host-latest':
            onHostLatest(event);
            break;
        case 'message':
            onMessage(event.data);
            break;
    }
});

/* Initialize on page load */
document.addEventListener('DOMContentLoaded', function() {
    initializeRaidTerminal();
});

/* Global functions for testing */
window.forceShowRaidTerminal = forceShowRaidTerminal;
window.forceHideRaidTerminal = forceHideRaidTerminal;
window.addTestActivity = addTestActivity;
window.raidState = raidState;

/* Debug info */
console.log('⚔️ Raid Terminal Tracker loaded');
console.log('📋 Available functions:');
console.log('  • forceShowRaidTerminal(data?) - Show terminal with test data');
console.log('  • forceHideRaidTerminal() - Hide terminal');
console.log('  • addTestActivity(type, username) - Add test activity');
console.log(`⏰ Raid delay: ${RAID_CONFIG.showDelay / 1000}s, Duration: ${RAID_CONFIG.displayDuration / 1000}s (4 minutes)`);
// (Removed) Auto-show testing block – production build should not auto-spawn test raid.