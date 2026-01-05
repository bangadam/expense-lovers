# UI Redesign - Expense Lovers

## Overview
Complete UI overhaul using UI Kitten (Eva Design System) with focus on minimal/modern aesthetic and speed-optimized transaction input.

## Tech Stack Addition
- `@ui-kitten/components` + `@eva-design/eva` - Component library
- `@ui-kitten/eva-icons` + `react-native-svg` - Icon system
- `@gorhom/bottom-sheet` - Quick transaction input

## Visual System

**Theme:** Minimal & Modern (like Apple Wallet, Revolut)

**Color Palette:**
- Primary: Eva's default blue or custom brand color
- Success: `#22C55E` (income)
- Danger: `#EF4444` (expenses)
- Backgrounds: Eva light/dark themes

**Typography (UI Kitten categories):**
- `h1` - Balance display (40pt)
- `h6` - Section titles
- `s1` - Body text
- `c1` - Meta/labels

## Screen Designs

### Dashboard (Home)

```
┌─────────────────────────────────┐
│  Greeting + Settings icon       │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │   TOTAL BALANCE         │    │
│  │   $12,450.00            │    │
│  └─────────────────────────┘    │
├─────────────────────────────────┤
│  Wallets (horizontal scroll)    │
│  [Cash] [Bank] [Card] [+Add]    │
├─────────────────────────────────┤
│  Recent Transactions            │
│  - Food        -$25.00          │
│  - Salary      +$3,000          │
└─────────────────────────────────┘
         [+ FAB]
```

**Components:**
- `Layout` - Screen container
- `Text` - All typography
- `Card` - Balance card, wallet cards
- `List` + `ListItem` - Transactions
- `Button` size="giant" - FAB

### Quick Transaction Input (Bottom Sheet)

```
┌─────────────────────────────────┐
│  ━━━━━ (drag handle)            │
│  [EXPENSE] [INCOME]             │
│       $ 0.00                    │
│  Category: [dropdown]           │
│  Wallet:   [dropdown]           │
│  Note:     [input]              │
│  [    ADD EXPENSE    ]          │
└─────────────────────────────────┘
```

**Speed optimizations:**
- Amount auto-focused on open
- Wallet defaults to last-used
- Categories sorted by frequency
- Date hidden (defaults to today)
- Single tap to save

### Navigation

**Tab Bar (3 tabs):**
1. Home - Dashboard
2. History - All transactions
3. Settings - App preferences

**Removed:**
- Explore tab
- Unnecessary modals

### History Screen

- Grouped by date (Today, Yesterday, This Week)
- Search bar at top
- Tap transaction → detail modal
- Pull-to-refresh

### Wallet Detail

- Large balance header
- Filtered transaction list
- Edit/Delete in header actions

## Component Migration

| Current | UI Kitten |
|---------|-----------|
| ThemedView | Layout |
| ThemedText | Text (with category) |
| Custom cards | Card |
| Custom buttons | Button |
| Custom inputs | Input |
| Pressable lists | List + ListItem |

## Implementation Order

1. Install UI Kitten dependencies
2. Configure ApplicationProvider in _layout.tsx
3. Redesign Dashboard with new components
4. Add bottom sheet for transaction input
5. Update History screen
6. Update Wallet screens
7. Add Settings tab
8. Remove unused components

## Dependencies to Add

```bash
npm install @ui-kitten/components @eva-design/eva
npm install @ui-kitten/eva-icons react-native-svg
npm install @gorhom/bottom-sheet react-native-reanimated react-native-gesture-handler
```
