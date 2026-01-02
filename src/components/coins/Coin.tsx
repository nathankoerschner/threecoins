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
  const fontSize = size * 0.25; // Scale inscription with coin size

  return (
    <View
      style={[
        styles.coinContainer,
        {
          width: coinSize,
          height: coinSize,
          borderRadius: coinSize / 2,
          backgroundColor: colors.accent.primary, // Always gold
          borderWidth: borderWidth,
          borderColor: colors.accent.dark,
        },
      ]}
    >
      {/* Square hole in the middle (traditional Chinese coin design) */}
      <View
        style={[
          styles.hole,
          {
            width: holeSize,
            height: holeSize,
            backgroundColor: colors.background.primary,
          },
        ]}
      />

      {/* Inscriptions to differentiate heads/tails */}
      <View style={styles.inscriptionContainer}>
        {/* Top inscription */}
        <Text style={[styles.inscription, { fontSize, top: size * 0.12 }]}>
          {isHeads ? '陽' : '陰'}
        </Text>
        {/* Bottom inscription */}
        <Text style={[styles.inscription, { fontSize, bottom: size * 0.12 }]}>
          {isHeads ? '陽' : '陰'}
        </Text>
      </View>

      {/* Inner shadow effect for depth */}
      <View
        style={[
          styles.innerShadow,
          {
            width: coinSize - borderWidth * 2,
            height: coinSize - borderWidth * 2,
            borderRadius: (coinSize - borderWidth * 2) / 2,
            borderWidth: 1,
            borderColor: 'rgba(0, 0, 0, 0.2)',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  hole: {
    position: 'absolute',
    zIndex: 2,
  },
  inscriptionContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  inscription: {
    position: 'absolute',
    color: '#000000',
    fontWeight: 'bold',
    opacity: 0.6,
  },
  innerShadow: {
    position: 'absolute',
    zIndex: 1,
  },
});
