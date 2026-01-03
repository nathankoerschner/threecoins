// Award-winning dark theme with sophisticated gold accents and depth

export const colors = {
  // Rich layered backgrounds with depth
  background: {
    primary: '#0A0A0A',     // Deep black foundation
    secondary: '#141414',   // Elevated surface with subtle warmth
    tertiary: '#1C1C1E',    // Card level with more presence
    elevated: '#252527',    // Highest elevation
    gradient: {
      primary: 'linear-gradient(180deg, #0A0A0A 0%, #141414 100%)',
      card: 'linear-gradient(135deg, #1C1C1E 0%, #141414 100%)',
      subtle: 'linear-gradient(180deg, rgba(212, 175, 55, 0.03) 0%, rgba(10, 10, 10, 0) 100%)',
    },
  },

  // Refined gold palette with luminosity and depth
  accent: {
    primary: '#D4AF37',     // Classic gold - main brand color
    light: '#F5D678',       // Sunlit gold for highlights
    lighter: '#FFF4D4',     // Barely there gold for subtle touches
    dark: '#B8941F',        // Rich antique gold for pressed states
    darker: '#8B6914',      // Deep bronze for shadows
    glow: 'rgba(212, 175, 55, 0.6)', // Luminous glow
    glowStrong: 'rgba(245, 214, 120, 0.4)', // Intense highlight glow
    subtle: 'rgba(212, 175, 55, 0.08)', // Whisper tint
    overlay: 'rgba(212, 175, 55, 0.15)', // Gentle overlay
  },

  // Sophisticated hexagram colors with dimension
  line: {
    yang: '#D4AF37',        // Gold for yang lines (unbroken)
    yangGlow: 'rgba(212, 175, 55, 0.5)', // Ambient glow
    yin: '#9A9A9A',         // Refined gray for yin lines (broken)
    yinGlow: 'rgba(154, 154, 154, 0.2)', // Subtle glow
    changing: '#F5D678',    // Luminous gold for changing lines
    changingGlow: 'rgba(245, 214, 120, 0.6)', // Strong transformation glow
    stable: '#6A6A6C',      // Elegant muted for stable lines
  },

  // Refined text hierarchy
  text: {
    primary: '#FAFAFA',     // Soft white for primary text (less harsh)
    secondary: '#B4B4B4',   // Refined gray for secondary
    tertiary: '#8A8A8A',    // Subtle gray for tertiary
    muted: '#666666',       // Whisper gray for hints
    accent: '#D4AF37',      // Gold for emphasis
    accentLight: '#F5D678', // Bright gold for strong emphasis
  },

  // Enhanced UI states with personality
  state: {
    disabled: '#404040',
    disabledText: '#5A5A5A',
    error: '#FF6B6B',       // Softer, more sophisticated red
    errorGlow: 'rgba(255, 107, 107, 0.2)',
    success: '#4ECDC4',     // Modern teal success
    successGlow: 'rgba(78, 205, 196, 0.2)',
    warning: '#FFB84D',     // Warm amber warning
    warningGlow: 'rgba(255, 184, 77, 0.2)',
  },

  // Sophisticated overlays and glassmorphism
  overlay: {
    dark: 'rgba(0, 0, 0, 0.75)',
    medium: 'rgba(0, 0, 0, 0.5)',
    light: 'rgba(0, 0, 0, 0.25)',
    glass: 'rgba(28, 28, 30, 0.7)', // Frosted glass effect
    shimmer: 'rgba(255, 255, 255, 0.05)', // Subtle shimmer
  },

  // Premium shadows for depth
  shadow: {
    sm: 'rgba(0, 0, 0, 0.4)',
    md: 'rgba(0, 0, 0, 0.5)',
    lg: 'rgba(0, 0, 0, 0.6)',
    gold: 'rgba(212, 175, 55, 0.3)', // Gold shadow for emphasis
    goldStrong: 'rgba(212, 175, 55, 0.5)', // Strong gold shadow
  },
} as const;

export type Colors = typeof colors;
