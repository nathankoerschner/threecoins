import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme';

interface CoinProps {
  isHeads: boolean;
  size?: number;
}

export const Coin: React.FC<CoinProps> = ({ isHeads, size = 60 }) => {
  const coinSize = size;
  const holeSize = size * 0.35;
  const borderWidth = size * 0.06;
  const fontSize = size * 0.20; // Larger to fill space between border and hole

  return (
    <View
      style={[
        styles.coinContainer,
        {
          width: coinSize,
          height: coinSize,
          borderRadius: coinSize / 2,
          backgroundColor: colors.accent.primary, // Base gold color
          borderWidth: borderWidth,
          borderColor: colors.accent.dark,
        },
      ]}
    >
      {/* Enhanced radial gradient effect with depth */}
      <View
        style={[
          styles.radialGradient,
          {
            width: coinSize - borderWidth * 2,
            height: coinSize - borderWidth * 2,
            borderRadius: (coinSize - borderWidth * 2) / 2,
          },
        ]}
      />

      {/* Premium metallic shine highlight (top-left) */}
      <View
        style={[
          styles.highlight,
          {
            width: coinSize * 0.45,
            height: coinSize * 0.45,
            borderRadius: coinSize * 0.225,
            top: coinSize * 0.12,
            left: coinSize * 0.12,
          },
        ]}
      />

      {/* Secondary highlight (bottom-right, softer) */}
      <View
        style={[
          styles.secondaryHighlight,
          {
            width: coinSize * 0.35,
            height: coinSize * 0.35,
            borderRadius: coinSize * 0.175,
            bottom: coinSize * 0.12,
            right: coinSize * 0.12,
          },
        ]}
      />

      {/* Tertiary shimmer for extra dimension */}
      <View
        style={[
          styles.tertiaryHighlight,
          {
            width: coinSize * 0.25,
            height: coinSize * 0.25,
            borderRadius: coinSize * 0.125,
            top: coinSize * 0.45,
            right: coinSize * 0.2,
          },
        ]}
      />

      {/* Refined brushed metal texture */}
      <View style={[styles.textureOverlay, {
        width: coinSize - borderWidth * 2,
        height: coinSize - borderWidth * 2,
        borderRadius: (coinSize - borderWidth * 2) / 2,
      }]} />

      {/* Square hole in the middle (traditional Chinese coin design) */}
      <View
        style={[
          styles.hole,
          {
            width: holeSize,
            height: holeSize,
            backgroundColor: colors.background.primary,
            borderWidth: holeSize * 0.04,
            borderColor: 'rgba(0, 0, 0, 0.4)',
          },
        ]}
      />

      {/* Hole inner shadow for depth */}
      <View
        style={[
          styles.holeInnerShadow,
          {
            width: holeSize - holeSize * 0.08,
            height: holeSize - holeSize * 0.08,
          },
        ]}
      />

      {/* Inscriptions - Yang side has 4 Chinese characters, Yin side has Manchu script */}
      <View style={styles.inscriptionContainer}>
        {isHeads ? (
          // YANG SIDE: Four Chinese characters around the square hole
          <>
            {/* Top: 乾 - positioned between top border and hole */}
            <Text style={[styles.inscription, { fontSize, top: size * 0.03 }]}>
              乾
            </Text>
            {/* Right: 隆 - positioned between right border and hole */}
            <Text style={[styles.inscription, { fontSize, right: size * 0.05 }]}>
              隆
            </Text>
            {/* Bottom: 通 - positioned between bottom border and hole */}
            <Text style={[styles.inscription, { fontSize, bottom: size * 0.03 }]}>
              通
            </Text>
            {/* Left: 寶 - positioned between left border and hole */}
            <Text style={[styles.inscription, { fontSize, left: size * 0.05 }]}>
              寶
            </Text>
          </>
        ) : (
          // YIN SIDE: Manchu script (rotated 90 degrees clockwise)
          <>
            {/* Left of hole: ᠪᠣᠣ (Boo) - rotated clockwise */}
            <Text style={[
              styles.manchuScript,
              {
                fontSize: fontSize * 0.9,
                left: size * 0.03,
                transform: [{ rotate: '90deg' }],
              }
            ]}>
              ᠪᠣᠣ
            </Text>
            {/* Right of hole: ᠴᡳᠣᠸᠠᠨ (Ciowan) - rotated clockwise */}
            <Text style={[
              styles.manchuScript,
              {
                fontSize: fontSize * 0.8,
                right: size * -0.1,
                transform: [{ rotate: '90deg' }],
              }
            ]}>
              ᠴᡳᠣᠸᠠᠨ
            </Text>
          </>
        )}
      </View>

      {/* Inner shadow effect for depth */}
      <View
        style={[
          styles.innerShadow,
          {
            width: coinSize - borderWidth * 2,
            height: coinSize - borderWidth * 2,
            borderRadius: (coinSize - borderWidth * 2) / 2,
            borderWidth: 1.5,
            borderColor: 'rgba(0, 0, 0, 0.25)',
          },
        ]}
      />

      {/* Edge highlight for beveled effect */}
      <View
        style={[
          styles.edgeHighlight,
          {
            width: coinSize - borderWidth * 2,
            height: coinSize - borderWidth * 2,
            borderRadius: (coinSize - borderWidth * 2) / 2,
            borderWidth: 1,
            borderTopColor: 'rgba(255, 255, 255, 0.4)',
            borderLeftColor: 'rgba(255, 255, 255, 0.3)',
            borderBottomColor: 'rgba(0, 0, 0, 0.1)',
            borderRightColor: 'rgba(0, 0, 0, 0.1)',
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  coinContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    // Premium multi-layered shadow for depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
  radialGradient: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.18)', // Slightly deeper for more dimension
    zIndex: 0,
  },
  highlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.32)', // Brighter, more luxurious
    zIndex: 1,
  },
  secondaryHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // Enhanced secondary shine
    zIndex: 1,
  },
  tertiaryHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Subtle shimmer
    zIndex: 1,
  },
  textureOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.04)', // Refined texture
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)', // More visible texture lines
    zIndex: 1,
  },
  hole: {
    position: 'absolute',
    zIndex: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  holeInnerShadow: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 5,
  },
  inscriptionContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 6,
  },
  inscription: {
    position: 'absolute',
    color: '#6B5D3F', // Dark gold for raised embossed look
    fontWeight: 'bold',
    opacity: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.3)', // Light highlight for raised effect
    textShadowOffset: { width: -0.5, height: -0.5 },
    textShadowRadius: 0.5,
  },
  manchuScript: {
    position: 'absolute',
    color: '#6B5D3F', // Dark gold for raised embossed look
    fontWeight: '600',
    opacity: 1,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.3)', // Light highlight for raised effect
    textShadowOffset: { width: -0.5, height: -0.5 },
    textShadowRadius: 0.5,
    writingDirection: 'ltr', // Manchu is vertical but rendered as is
  },
  innerShadow: {
    position: 'absolute',
    zIndex: 2,
  },
  edgeHighlight: {
    position: 'absolute',
    zIndex: 3,
  },
});
