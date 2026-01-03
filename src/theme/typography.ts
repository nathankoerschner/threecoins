// Award-winning typography system with refined hierarchy and rhythm

export const typography = {
  // Premium iOS font stack with SF Pro Display
  fontFamily: {
    display: 'SF Pro Display',  // For headings and emphasis
    text: 'SF Pro Text',        // For body text (optimal for smaller sizes)
    rounded: 'SF Pro Rounded',  // For playful elements
    mono: 'SF Mono',            // For technical text
    system: 'System',           // Fallback
  },

  // Refined type scale with golden ratio influence
  fontSize: {
    xs: 11,      // Fine print
    sm: 13,      // Secondary text, captions
    base: 15,    // Body text baseline
    md: 17,      // Comfortable reading size
    lg: 21,      // Section headers
    xl: 28,      // Page titles
    xxl: 36,     // Hero text
    xxxl: 48,    // Display headlines
    huge: 64,    // Dramatic moments
  },

  // Sophisticated font weights for visual hierarchy
  fontWeight: {
    light: '300' as const,      // Elegant, airy
    regular: '400' as const,    // Standard body text
    medium: '500' as const,     // Subtle emphasis
    semibold: '600' as const,   // Strong emphasis
    bold: '700' as const,       // Bold statements
    heavy: '800' as const,      // Maximum impact
  },

  // Refined line heights for optimal reading
  lineHeight: {
    compressed: 1.1,   // Tight, dramatic headings
    tight: 1.3,        // Compact UI elements
    snug: 1.4,         // Comfortable for short text
    normal: 1.5,       // Body text sweet spot
    relaxed: 1.6,      // Breathing room
    loose: 1.8,        // Luxurious spacing
  },

  // Sophisticated letter spacing for refinement
  letterSpacing: {
    tighter: -0.8,     // Compact, modern headings
    tight: -0.4,       // Refined headings
    normal: 0,         // Standard body text
    wide: 0.3,         // Slight breathing room
    wider: 0.8,        // Labels, uppercase
    widest: 1.2,       // Dramatic spacing
    luxury: 2,         // Ultra-premium feel
  },

  // Text shadows for depth and luxury
  textShadow: {
    subtle: {
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },
    medium: {
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    strong: {
      textShadowColor: 'rgba(0, 0, 0, 0.6)',
      textShadowOffset: { width: 0, height: 3 },
      textShadowRadius: 6,
    },
    gold: {
      textShadowColor: 'rgba(212, 175, 55, 0.5)',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    },
  },
} as const;

export type Typography = typeof typography;
