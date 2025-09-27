# Global Testing Snippets

Unified console helpers for all widgets. Open your browser dev console in the StreamElements overlay preview and paste/execute as needed.

## Raid Terminal Tracker
```javascript
// Force show a synthetic raid
forceShowRaidTerminal();

// Add synthetic activities
addTestActivity('follow', 'tester1');
addTestActivity('sub', 'subscriber1');
addTestActivity('donation', 'donorX');
addTestActivity('bits', 'bitUser');
addTestActivity('host', 'friendlyHost');

// Hide terminal
forceHideRaidTerminal();

// Inspect internal state
console.log(raidState);
```

## Donation & Subgoal Bar
```javascript
// Trigger glow effects manually
triggerGlowEffect('donation');
triggerGlowEffect('subscription');
triggerGlowEffect('goal-complete', 'Demo Goal');

// Re-render goal text with animation
updateGoalText(true);

// Simulate subscriber count change
updateSubCount(37, true);

// Typewriter test
const el = document.getElementById('goal-text');
if (el) typewriterEffect(el, 'Testing typewriter…');
```

## IG Multi-Popup
```javascript
// Force next scheduled popup
forceShowPopup();

// Force specific widget (ids: 'instagram','discord','donate','subtember','christmas')
forceShowPopup('instagram');

// Hide current popup
forceHidePopup();

// Toggle system
togglePopupEnabled();

// Enable / disable specific widget
enableWidget('discord', false); // disable discord
enableWidget('discord', true);  // re-enable

// List widgets + status
listWidgets();
```

## Tips
- Use testMode / debugMode fields for temporary verbose logging.
- Do not leave testMode enabled in production overlay.
- If functions are undefined, confirm the correct widget overlay is focused and fully loaded.
