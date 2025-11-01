# 🔔 Notification System Guide

## Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│                    Live Market Simulator                     │
│  ┌──────────────────────────────────────┐   ┌──────┐       │
│  │ Title & Description                  │   │ 🔔 5 │       │
│  └──────────────────────────────────────┘   └──────┘       │
└─────────────────────────────────────────────────────────────┘
```

## Components Breakdown

### 1. **Notification Bell** (Always Visible)
```
┌──────┐
│ 🔔 5 │  ← Badge shows unread count
└──────┘
```
- **Location:** Top-right of simulator
- **Badge:** Red circle with white number
- **Hover:** Shadow increases, border darkens
- **Click:** Opens dropdown panel

---

### 2. **Pop-up Notifications** (Auto-dismiss in 5s)

```
┌────────────────────────────────────┐
│ 📈 BUY Signal Detected!         ✕ │  ← Green header for BUY
├────────────────────────────────────┤
│ Strategy:  MACD                    │
│ Symbol:    AAPL                    │
│ Price:     $150.25                 │
│                                    │
│ ┌──────────────────────────────┐  │
│ │    ℹ️  More Info              │  ← Button
│ └──────────────────────────────┘  │
├────────────────────────────────────┤
│ ▓▓▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Progress bar
└────────────────────────────────────┘
```

**For SELL signals:**
- 📉 Red header
- "SELL Signal Detected!"
- Same layout

**Behavior:**
- Appears in top-right corner
- Auto-dismisses after 5 seconds
- Progress bar shows remaining time
- Can be manually closed with ✕
- "More Info" opens detail modal
- Multiple notifications stack vertically

---

### 3. **Notification Dropdown** (Click bell to open)

```
┌────────────────────────────────────────┐
│ 🔔 Signal Notifications             ✕ │  ← Purple gradient header
├────────────────────────────────────────┤
│ 3 notifications        🗑️ Clear All   │  ← Control bar
├────────────────────────────────────────┤
│ ┌────────────────────────────────────┐│
│ │ 📈  BUY Signal                   ✕ ││  ← Green left border
│ │     MACD • AAPL                    ││
│ │     $150.25                        ││
│ │     2:15:30 PM                     ││
│ └────────────────────────────────────┘│
│ ┌────────────────────────────────────┐│
│ │ 📉  SELL Signal                  ✕ ││  ← Red left border
│ │     RSI • TSLA                     ││
│ │     $245.80                        ││
│ │     2:14:15 PM                     ││
│ └────────────────────────────────────┘│
│ ┌────────────────────────────────────┐│
│ │ 📈  BUY Signal                   ✕ ││
│ │     SuperTrend • GOOGL             ││
│ │     $142.50                        ││
│ │     2:12:45 PM                     ││
│ └────────────────────────────────────┘│
└────────────────────────────────────────┘
```

**Features:**
- Max height: 500px (scrollable)
- Width: 384px
- Click notification → Opens detail modal
- Click ✕ → Removes that notification
- Click "Clear All" → Removes everything
- Click outside → Closes dropdown

**Empty State:**
```
┌────────────────────────────────────────┐
│ 🔔 Signal Notifications             ✕ │
├────────────────────────────────────────┤
│                                        │
│            🔕 (faded)                  │
│                                        │
│       No notifications yet             │
│   Signals will appear here when        │
│            detected                    │
│                                        │
└────────────────────────────────────────┘
```

---

### 4. **Detail Modal** (Click "More Info" or notification in history)

```
┌──────────────────────────────────────────────────────────┐
│ 📈 ✅ Consider Buying    MACD Strategy              ✕   │  ← Green header
├──────────────────────────────────────────────────────────┤
│  Stock Symbol            Price                           │
│  AAPL                    $150.25                         │
├──────────────────────────────────────────────────────────┤
│ ℹ️ For Beginners:                                        │
│ Like a rocket getting ready to launch - the momentum is  │
│ building upward!                                         │
├──────────────────────────────────────────────────────────┤
│ ✔️ What's Happening?                                     │
│ The MACD line crossed above the signal line, showing     │
│ increasing bullish momentum.                             │
├──────────────────────────────────────────────────────────┤
│ 💡 Recommended Action:                                   │
│ Strong BUY signal - momentum is building in the upward   │
│ direction.                                               │
├──────────────────────────────────────────────────────────┤
│ ⚠️ Risk Level:                                           │
│ Medium Risk - Confirm with price action                  │
├──────────────────────────────────────────────────────────┤
│ ⚠️ Disclaimer: This is educational information only...   │
├──────────────────────────────────────────────────────────┤
│                    [ Got It! ]                           │
└──────────────────────────────────────────────────────────┘
```

---

## Notification Flow

```
Signal Detected
     │
     ├─── 1. Add to activeNotifications (pop-up)
     │         │
     │         ├─── Show pop-up (5 seconds)
     │         ├─── Play sound (if enabled)
     │         └─── Browser notification (if permitted)
     │
     ├─── 2. Add to notificationHistory (persistent)
     │         │
     │         └─── Update bell badge count
     │
     └─── 3. Auto-dismiss pop-up after 5 seconds
               │
               └─── Remove from activeNotifications
                    (stays in history)
```

---

## Color Coding

### BUY Signals
- 📈 **Icon:** Trending Up (green)
- 🟢 **Header:** Green gradient
- 🟢 **Border:** Green (left side in dropdown)
- 🟢 **Background:** Light green in dropdown

### SELL Signals
- 📉 **Icon:** Trending Down (red)
- 🔴 **Header:** Red gradient
- 🔴 **Border:** Red (left side in dropdown)
- 🔴 **Background:** Light red in dropdown

---

## Interaction Examples

### Example 1: New Signal Arrives
```
1. MACD detects BUY signal at $150.25
2. Pop-up appears in top-right ↗️
3. Sound plays: "ding-ding-ding" (ascending)
4. Bell badge updates: 🔔 4 → 🔔 5
5. After 5 seconds, pop-up disappears
6. Signal stays in bell dropdown history
```

### Example 2: Viewing History
```
1. User clicks bell icon 🔔
2. Dropdown opens showing all signals
3. User scrolls through list
4. Clicks on "RSI • TSLA • SELL" notification
5. Detail modal opens with full explanation
6. User reads beginner-friendly guide
7. Clicks "Got It!" to close
```

### Example 3: Clearing Notifications
```
Option A - Clear All:
1. Click bell icon
2. Click "Clear All" button
3. Confirm action
4. All notifications removed
5. Badge shows 🔔 0

Option B - Individual:
1. Click bell icon
2. Hover over notification → ✕ appears
3. Click ✕ on specific notification
4. That notification removed
5. Badge count decreases by 1
```

---

## Keyboard Shortcuts (Future Enhancement)

```
ESC              → Close dropdown/modal
SPACE            → Open/close dropdown (when bell focused)
↑ ↓              → Navigate notifications in dropdown
ENTER            → Open detail modal for selected notification
DELETE/BACKSPACE → Remove selected notification
CTRL + SHIFT + K → Clear all notifications
```

*Note: These are suggested for future implementation*

---

## Mobile Responsive Behavior

### Phone (< 640px)
- Bell icon: Smaller (w-5 h-5)
- Dropdown: Full width minus 16px padding
- Pop-ups: Full width, stack at top
- Modal: Full screen overlay

### Tablet (640-1024px)
- Bell icon: Standard size
- Dropdown: 320px width
- Pop-ups: 280px width
- Modal: 600px max width, centered

### Desktop (> 1024px)
- Bell icon: Standard size
- Dropdown: 384px width
- Pop-ups: 320px width
- Modal: 768px max width, centered

---

## Accessibility Features

✅ **ARIA Labels:**
- `aria-label="Notification bell"`
- `aria-label="Unread notifications count: 5"`
- `role="button"` on clickable elements

✅ **Keyboard Navigation:**
- Bell icon is focusable with Tab
- Enter/Space opens dropdown
- ESC closes dropdown/modal

✅ **Screen Readers:**
- Announces new notifications
- Reads signal type, strategy, and price
- Announces dismissal actions

✅ **Color Contrast:**
- All text meets WCAG AA standards
- Icons have sufficient contrast ratios

✅ **Focus Indicators:**
- Visible focus rings on all interactive elements
- Clear visual feedback on hover/active states

---

## Animation Timings

```javascript
Badge Appear:        0.3s scale + fade
Dropdown Open:       0.2s scale + fade
Dropdown Close:      0.2s scale + fade
Pop-up Appear:       0.3s slide from right
Pop-up Dismiss:      0.3s slide to right
Modal Open:          0.2s scale + fade
Modal Close:         0.2s scale + fade
Notification Card:   0.05s fade per item (staggered)
Progress Bar:        5s linear countdown
```

---

## Best Practices for Users

### 📊 Monitoring Signals
1. Keep bell dropdown closed during active trading
2. Check bell periodically for missed signals
3. Use "More Info" for signals you're unsure about
4. Clear old notifications to keep list manageable

### 🔊 Sound Settings
- Enable sound for active monitoring
- Mute during meetings or quiet times
- Different tones help identify BUY vs SELL quickly

### 📱 Browser Notifications
- Allow browser notifications for background monitoring
- Keep tab open for real-time alerts
- Check notification history if you miss any

### 🎯 Strategy Selection
- Start with familiar strategies (RSI, MACD)
- Compare different strategies on same stock
- Note which strategies work best for specific stocks
- Use beginner explanations to learn as you go

---

## Troubleshooting

### Bell Badge Not Updating?
- Check if signals are being detected
- Refresh the page
- Clear browser cache

### Pop-ups Not Appearing?
- Check if browser blocks pop-ups
- Verify sound is enabled (notifications piggyback on sound system)
- Check browser console for errors

### Dropdown Not Opening?
- Click directly on bell icon
- Check if another dropdown is open
- Try clicking outside first, then clicking bell

### Notifications Not Saving to History?
- Verify signals are being detected
- Check browser localStorage permissions
- Look for JavaScript errors in console

---

**Remember:** This notification system helps you never miss a signal while keeping your workspace clean and organized! 🎯📈
