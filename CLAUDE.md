# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build and Development Commands

```bash
npm start          # Start Expo development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run web version
npm run lint       # Run ESLint
```

## Architecture

This is an Expo/React Native cross-platform app (iOS, Android, Web) using TypeScript.

### Routing (Expo Router - File-Based)

- `app/` - Route definitions using file-based routing
- `app/_layout.tsx` - Root layout with ThemeProvider and Stack navigator
- `app/(tabs)/` - Tab group with bottom navigation (Home, Explore)
- `app/modal.tsx` - Modal presentation screen

### Theming System

- `constants/theme.ts` - Color palette (`Colors.light`/`Colors.dark`) and platform-specific fonts (`Fonts`)
- `hooks/use-color-scheme.ts` - System color scheme detection (with `.web.ts` variant)
- `hooks/use-theme-color.ts` - Returns appropriate color for current theme
- `components/themed-text.tsx` and `components/themed-view.tsx` - Theme-aware base components

### Key Patterns

- **Platform-specific files**: Use `.ios.tsx`, `.android.tsx`, `.web.ts` suffixes for platform variants
- **Path alias**: `@/*` resolves to project root (configured in tsconfig.json)
- **Typed routes**: Expo Router generates type-safe route names (`experiments.typedRoutes` enabled)
