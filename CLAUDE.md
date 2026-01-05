# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Expense Lovers is an offline-first personal finance mobile app for Android & iOS built with Expo and React Native. The app focuses on quick expense/income tracking with wallet management and transaction history.

## Commands

```bash
# Development
npm install              # Install dependencies
npx expo start           # Start development server (opens options for iOS/Android/web)
npx expo start --ios     # Start on iOS simulator
npx expo start --android # Start on Android emulator
npx expo start --web     # Start web version

# Quality
npm run lint             # Run ESLint

# Project management
npm run reset-project    # Move starter code to app-example, create blank app directory
```

## Issue Tracking

This project uses **bd** (beads) for issue tracking:
```bash
bd ready                              # Find available work
bd show <id>                          # View issue details
bd update <id> --status in_progress   # Claim work
bd close <id>                         # Complete work
bd sync                               # Sync with git
```

## Architecture

### Expo Router (File-Based Routing)
- `app/` - Routes and screens using Expo Router with typed routes enabled
- `app/_layout.tsx` - Root layout with ThemeProvider and Stack navigator
- `app/(tabs)/` - Tab-based navigation group with bottom tabs
- `app/modal.tsx` - Modal screen example

### Component Patterns
- **Themed components** (`ThemedText`, `ThemedView`) - Use `useThemeColor` hook for automatic light/dark mode styling
- **Platform-specific files** - Use `.ios.tsx` / `.tsx` extensions (e.g., `icon-symbol.ios.tsx`)
- **UI components** live in `components/ui/`

### Theming
- `constants/theme.ts` - Contains `Colors` (light/dark palettes) and `Fonts` (platform-specific font stacks)
- `hooks/use-color-scheme.ts` - Re-exports React Native's useColorScheme (with web override in `.web.ts`)
- `hooks/use-theme-color.ts` - Returns theme-aware colors with optional overrides

### Path Aliases
Use `@/` for absolute imports from project root:
```typescript
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
```

## Technical Notes

- **New Architecture enabled** - React Native's new architecture is active
- **React Compiler enabled** - Experimental React compiler is turned on
- **Strict TypeScript** - `strict: true` in tsconfig
- **Offline-first** - App is designed for 100% offline operation (local storage only)

## MVP Features (Per PRD)
The app targets: wallet management, quick transaction input, custom categories, and transaction history. Database will use local storage (SQLite or Isar).
