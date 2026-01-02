import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Coin } from './Coin';
import { spacing } from '@/theme';

interface CoinSetProps {
  coins: [boolean, boolean, boolean]; // [coin1, coin2, coin3] - true = heads, false = tails
  size?: number;
}

export const CoinSet: React.FC<CoinSetProps> = ({ coins, size = 60 }) => {
  const gap = spacing.md;

  return (
    <View style={styles.container}>
      {/* Horizontal row - three coins */}
      <View style={[styles.row, { gap }]}>
        <Coin isHeads={coins[0]} size={size} />
        <Coin isHeads={coins[1]} size={size} />
        <Coin isHeads={coins[2]} size={size} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
