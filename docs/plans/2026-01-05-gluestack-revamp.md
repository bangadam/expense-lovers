# UI Revamp Plan (Gluestack Edition)

> **Status:** Proposed
> **Based on:** `design-system.md` and user-provided screenshots
> **Goal:** Modernize the UI to a "soft, minimal finance" aesthetic using the existing Gluestack framework.

## 1. Overview
We will refactor the existing Gluestack UI implementation to match the new Design System. This avoids a costly rewrite to UI Kitten while achieving the same visual result.

## 2. Design Tokens (The Foundation)
We will update `config/gluestack-ui.config.ts` (or create a custom theme) with:

- **Typography:** `Montserrat` (400, 600, 700).
- **Colors:**
  - Primary: `#345AFA` (Blue)
  - Secondary: `#313131` (Ink/Dark)
  - Background: `#FFFFFF` (with warm overlay via layout)
  - Surface: `#F9F9F9` (Subtle cards)
- **Radii:**
  - `xs`: 8px
  - `sm`: 12px
  - `md`: 16px
  - `lg`: 24px
  - `pill`: 999px

## 3. Core Components
We will build/refactor these specifically for the app:

### 3.1 WalletCard
- **Style:** Dark (`#313131`) card with rounded corners (`lg`).
- **Content:** Masked number (top right), Balance (center, bold), "PAY" pill button (white bg, black text).

### 3.2 TransactionItem
- **Style:** Clean row, no heavy dividers.
- **Layout:** IconBox (left) -> Title/Date (middle) -> Amount (right).
- **Typography:** Amount is bold. Income = Green/Blue, Expense = Black/Red.

### 3.3 Dashboard (Home)
- **Header:** "Hey George!" (Bold) + Avatar.
- **Hero:** Horizontal scroll of `WalletCard`s.
- **Fab:** Floating Action Button for "Add Transaction" (Primary Blue).

## 4. Navigation & Layout
- **Tab Bar:** Clean, label-less or minimal labels. Active state = Primary Blue.
- **Bottom Sheet:** Use `@gorhom/bottom-sheet` for the "Add Transaction" flow (already installed).

## 5. Implementation Steps
1.  **Setup:** Configure Gluestack tokens (`gluestack-ui.config.ts`).
2.  **Assets:** Ensure `Montserrat` font is loaded.
3.  **Components:** Build `WalletCard`, `TransactionItem`.
4.  **Screens:** Refactor `app/(tabs)/index.tsx` (Dashboard).
5.  **Feature:** Implement `AddTransactionSheet` using `@gorhom/bottom-sheet`.
6.  **Polish:** Apply global background styles and micro-interactions.

## 6. Migration from Old Plan
- **Discard:** `2026-01-05-ui-redesign.md` (UI Kitten plan).
- **Keep:** The architecture and features, just swap the UI library implementation details to Gluestack.
