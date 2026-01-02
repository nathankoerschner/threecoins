// Dark theme color palette with gold accents

export const colors = {
  // Dark backgrounds
  background: {
    primary: '#0A0A0A',     // Deep black
    secondary: '#1A1A1A',   // Slightly lighter for cards/sections
    tertiary: '#2A2A2A',    // Subtle elevation
  },

  // Gold/amber accent colors
  accent: {
    primary: '#D4AF37',     // Classic gold
    light: '#F5D678',       // Lighter gold for highlights
    dark: '#B8941F',        // Darker gold for pressed states
    glow: 'rgba(212, 175, 55, 0.5)', // Brighter glow (was 0.3)
    subtle: 'rgba(212, 175, 55, 0.1)', // Subtle tint
  },

  // Hexagram line colors
  line: {
    yang: '#D4AF37',        // Gold for yang lines (unbroken)
    yin: '#8A8A8A',         // Muted gray for yin lines (broken)
    changing: '#F5D678',    // Brighter gold for changing lines
    stable: '#606060',      // Darker for stable lines
  },

  // Text colors
  text: {
    primary: '#FFFFFF',     // White for main text
    secondary: '#A0A0A0',   // Gray for secondary text
    muted: '#606060',       // Darker gray for less important text
    accent: '#D4AF37',      // Gold for accent text
  },

  // UI element states
  state: {
    disabled: '#404040',
    error: '#E74C3C',
    success: '#2ECC71',
  },

  // Overlays and transparency
  overlay: {
    dark: 'rgba(0, 0, 0, 0.7)',
    light: 'rgba(0, 0, 0, 0.3)',
  },
} as const;

export type Colors = typeof colors;
