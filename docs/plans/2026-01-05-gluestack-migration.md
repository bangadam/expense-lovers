# Gluestack UI Migration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate the entire application from UI Kitten to Gluestack UI to improve aesthetics and maintainability.

**Architecture:** Replace `@ui-kitten/components` with `@gluestack-ui/themed`. Keep `@gorhom/bottom-sheet` for the complex transaction sheet but style its contents with Gluestack.

**Tech Stack:** 
- `gluestack-ui` (Components & Styling)
- `lucide-react-native` (Icons)
- `@gorhom/bottom-sheet` (Retained for sheets)

---

### Task 1: Clean up UI Kitten & Install Gluestack

**Files:**
- Modify: `package.json`
- Modify: `app/_layout.tsx`
- Modify: `metro.config.js` (if needed for Gluestack)

**Step 1: Remove UI Kitten dependencies**

```bash
npm uninstall @ui-kitten/components @ui-kitten/eva-icons @eva-design/eva
```

**Step 2: Install Gluestack UI & Dependencies**

```bash
npm install @gluestack-ui/themed @gluestack-style/react @gluestack-ui/config lucide-react-native react-native-svg
```

**Step 3: Setup Gluestack Provider**

Update `app/_layout.tsx`:
- Remove `ApplicationProvider` (UI Kitten)
- Add `GluestackUIProvider` wrapping the app

**Step 4: Verify App Runs**

Run: `npx expo start`
Expected: App runs (might look broken/unstyled where components were removed, but should not crash on startup)

**Step 5: Commit**

```bash
git add .
git commit -m "chore: switch from ui-kitten to gluestack-ui"
```

### Task 2: Migrate Dashboard (Home)

**Files:**
- Modify: `app/(tabs)/index.tsx`
- Modify: `components/add-transaction-sheet.tsx` (Trigger button)

**Step 1: Replace Layout/Card/Text**

Update `app/(tabs)/index.tsx`:
- Import `Box`, `VStack`, `HStack`, `Text`, `Heading`, `Fab`, `FabIcon` from `@gluestack-ui/themed`
- Replace UI Kitten `Layout` with `Box` (bg="$backgroundLight0")
- Replace Balance `Card` with `Box` or `Card` styled container
- Replace ListItems with Gluestack `HStack` + `Text`

**Step 2: Replace FAB**

- Use Gluestack `Fab` component for the "+" button.

**Step 3: Verify Visuals**

Run: `npx expo start`
Expected: Dashboard displays with new Gluestack components.

**Step 4: Commit**

```bash
git add app/(tabs)/index.tsx
git commit -m "refactor(dashboard): migrate to gluestack-ui"
```

### Task 3: Migrate Wallets & History

**Files:**
- Modify: `app/wallet/create.tsx`
- Modify: `app/wallet/[id].tsx`
- Modify: `app/(tabs)/history.tsx`

**Step 1: Migrate Wallet Create**

- Replace Input/Button with Gluestack `Input`, `InputField`, `Button`, `ButtonText`.

**Step 2: Migrate Wallet Detail**

- Update styling using `VStack`/`HStack`.

**Step 3: Migrate History**

- Update list items to use Gluestack layout components.

**Step 4: Commit**

```bash
git add app/wallet/ app/(tabs)/history.tsx
git commit -m "refactor(screens): migrate wallet and history to gluestack"
```

### Task 4: Migrate Settings & Transaction Sheet

**Files:**
- Modify: `app/(tabs)/settings.tsx`
- Modify: `components/add-transaction-sheet.tsx`

**Step 1: Migrate Settings**

- Use Gluestack `Switch`, `Pressable`, `Icon`.

**Step 2: Migrate Transaction Sheet Content**

- Inside the BottomSheet, use Gluestack `Button`, `Input`, `Select` (or Actionsheet if preferred, but likely stick to Select for categories).

**Step 3: Commit**

```bash
git add app/(tabs)/settings.tsx components/add-transaction-sheet.tsx
git commit -m "refactor(forms): migrate settings and transaction sheet"
```
