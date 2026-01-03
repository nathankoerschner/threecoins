// Premium spacing scale with refined rhythm and proportion

export const spacing = {
  xxs: 2,    // Hairline spacing
  xs: 4,     // Minimal breathing room
  sm: 8,     // Tight but comfortable
  md: 12,    // Comfortable default
  base: 16,  // Base unit (4px grid)
  lg: 20,    // Generous spacing
  xl: 28,    // Section spacing
  xxl: 40,   // Major section breaks
  xxxl: 56,  // Dramatic spacing
  huge: 80,  // Maximum spacing
} as const;

export type Spacing = typeof spacing;

// Sophisticated layout values for award-winning design
export const layout = {
  // Refined border radius for modern, friendly feel
  borderRadius: {
    xs: 4,     // Subtle rounding
    sm: 6,     // Gentle corners
    md: 10,    // Friendly rounding
    lg: 14,    // Prominent curves
    xl: 20,    // Bold rounding
    xxl: 28,   // Extra bold
    round: 9999, // Perfect circles
  },

  // Icon sizes with optical refinement
  iconSize: {
    xs: 14,
    sm: 18,
    md: 24,
    lg: 32,
    xl: 48,
    xxl: 64,
  },

  // Touch targets (iOS HIG recommends 44pt minimum)
  hitSlop: {
    sm: { top: 8, bottom: 8, left: 8, right: 8 },
    md: { top: 12, bottom: 12, left: 12, right: 12 },
    lg: { top: 16, bottom: 16, left: 16, right: 16 },
    xl: { top: 22, bottom: 22, left: 22, right: 22 },
  },

  // Refined shadow definitions for depth
  shadow: {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 1.0,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.30,
      shadowRadius: 4.65,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.35,
      shadowRadius: 6.27,
      elevation: 12,
    },
  },

  // Animation timing for smooth, natural motion
  animation: {
    fastest: 150,
    fast: 200,
    normal: 300,
    slow: 400,
    slowest: 600,
  },
} as const;

export type Layout = typeof layout;
