# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Specification Document

**Before asking questions about design, features, or requirements**, read the specification file:

```
../flika-app-specification.md
```

This document contains all design requirements including colors, typography, spacing, component specs, and feature details. Only ask for clarification if the spec doesn't cover something.

## Build and Development Commands

```bash
npm start          # Start Expo development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run web version
npm run lint       # Run ESLint
```

## Architecture

This is an Expo/React Native cross-platform app (iOS, Android, Web) using TypeScript with a `src/` directory layout.

### Directory Structure

```
src/
├── app/                    # Expo Router file-based routes
│   ├── _layout.tsx         # Root layout with Stack navigator
│   ├── (tabs)/             # Tab group with bottom navigation
│   │   ├── _layout.tsx     # Tabs navigator config
│   │   ├── index.tsx       # Home tab
│   │   ├── archive.tsx     # Archive tab
│   │   └── settings.tsx    # Settings tab
│   ├── prospect/
│   │   ├── [id].tsx        # Prospect detail screen
│   │   ├── [id]/traits.tsx # Prospect traits screen
│   │   ├── [id]/dates.tsx  # Prospect dates screen
│   │   └── add.tsx         # Add prospect screen
│   └── onboarding/
│       ├── index.tsx       # Onboarding start
│       ├── attributes.tsx  # Attributes setup
│       └── security.tsx    # Security setup
├── components/
│   ├── ui/                 # Generic UI components
│   ├── prospects/          # Prospect-related components
│   ├── traits/             # Trait-related components
│   ├── dates/              # Date-related components
│   ├── mascot/             # Mascot components
│   └── common/             # Shared components
├── hooks/                  # Custom React hooks
├── context/                # React Context providers
├── services/
│   ├── firebase/           # Firebase integration
│   └── storage/            # Local storage
├── utils/                  # Utility functions
├── theme/                  # Theme configuration
├── constants/
│   └── translations/       # Translation strings
├── types/                  # TypeScript type definitions
└── i18n/
    └── locales/            # Locale files
```

### Key Patterns

- **Path alias**: `@/*` resolves to `src/*` (configured in tsconfig.json)
- **Platform-specific files**: Use `.ios.tsx`, `.android.tsx`, `.web.ts` suffixes for platform variants
- **Typed routes**: Expo Router generates type-safe route names
- **Barrel exports**: Each directory has an `index.ts` for clean imports
