export const colors = {
  // Primary - Vivid burnt orange (from palette #C44900)
  primary: {
    50: '#FEF2E6',
    100: '#FDE0C0',
    200: '#FAC088',
    300: '#F59B50',
    400: '#E07020',
    500: '#C44900', // Main primary
    600: '#A53D00',
    700: '#883200',
    800: '#6E2800',
    900: '#5A2100',
  },

  // Secondary - Deep teal-green (from palette #183A37)
  secondary: {
    50: '#EDF7F6',
    100: '#D2ECEB',
    200: '#A5D8D6',
    300: '#6EBFBC',
    400: '#3EA19D',
    500: '#1E6F6A', // Main secondary — derived from palette teal
    600: '#195C58',
    700: '#144A47',
    800: '#103B38',
    900: '#0C302D',
  },

  // Accent - Honey gold (celebrations)
  accent: {
    50: '#FFFDF5',
    100: '#FFFAEB',
    200: '#FFF3CC',
    300: '#FFECAD',
    400: '#FFE58F',
    500: '#FFD93D', // Main accent
    600: '#E5C235',
    700: '#CCAC2E',
    800: '#B29526',
    900: '#997F1F',
  },

  // Backgrounds
  background: {
    light: '#FFF8EF', // Warm cream (tinted by palette sand #EFD6AC)
    dark: '#04151F', // Near-black navy (palette color)
    card: {
      light: '#FFFBF6',
      dark: '#0F2B2E',
    },
    elevated: {
      light: '#FFFBF6',
      dark: '#183A37', // Palette color
    },
  },

  // Text
  text: {
    primary: {
      light: '#2A1F18', // Warm near-black
      dark: '#F0E8DF', // Warm cream
    },
    secondary: {
      light: '#594E45', // ~7.9:1 on card
      dark: '#B8AFA5', // ~7:1 on card
    },
    muted: {
      light: '#766B61', // ~5.1:1 on card
      dark: '#9D948B', // ~5.3:1 on card
    },
  },

  // Semantic colors
  semantic: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },

  // Trait states
  trait: {
    unknown: {
      background: { light: '#F0E9E0', dark: '#183A37' },
      text: { light: '#766B61', dark: '#9D948B' },
    },
    yes: {
      background: { light: '#E8F5E9', dark: '#1B3D1F' },
      text: { light: '#2E7D32', dark: '#81C784' },
    },
    no: {
      background: { light: '#FFEBEE', dark: '#3D1B2A' },
      text: { light: '#C62828', dark: '#EF9A9A' },
    },
  },

  // Warm sand for subtle backgrounds (palette color #EFD6AC)
  peach: '#EFD6AC',
};
