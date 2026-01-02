import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HexagramStack } from './HexagramStack';
import { Hexagram, CastLine } from '@/types';
import { colors, typography, spacing } from '@/theme';

interface HexagramDisplayProps {
  hexagram: Hexagram;
  lines?: CastLine[]; // Optional: for showing changing lines
  animated?: boolean;
  showMetadata?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const HexagramDisplay: React.FC<HexagramDisplayProps> = ({
  hexagram,
  lines,
  animated = false,
  showMetadata = true,
  size = 'medium',
}) => {
  const sizeStyles = SIZE_STYLES[size];

  return (
    <View style={styles.container}>
      {/* Hexagram number badge */}
      {showMetadata && (
        <View style={styles.numberBadge}>
          <Text style={[styles.numberText, sizeStyles.numberText]}>
            {hexagram.number}
          </Text>
        </View>
      )}

      {/* Hexagram visual */}
      <View style={styles.hexagramContainer}>
        <HexagramStack
          hexagram={hexagram}
          lines={lines}
          animated={animated}
          showChangingIndicators={!!lines}
        />
      </View>

      {/* Hexagram metadata */}
      {showMetadata && (
        <View style={styles.metadataContainer}>
          <Text style={[styles.englishName, sizeStyles.englishName]}>
            {hexagram.englishName}
          </Text>
          <Text style={[styles.chineseName, sizeStyles.chineseName]}>
            {hexagram.chineseName} ({hexagram.chineseCharacter})
          </Text>
        </View>
      )}
    </View>
  );
};

const SIZE_STYLES = {
  small: {
    numberText: { fontSize: typography.fontSize.md },
    englishName: { fontSize: typography.fontSize.md },
    chineseName: { fontSize: typography.fontSize.sm },
  },
  medium: {
    numberText: { fontSize: typography.fontSize.lg },
    englishName: { fontSize: typography.fontSize.xl },
    chineseName: { fontSize: typography.fontSize.md },
  },
  large: {
    numberText: { fontSize: typography.fontSize.xl },
    englishName: { fontSize: typography.fontSize.xxl },
    chineseName: { fontSize: typography.fontSize.lg },
  },
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  numberBadge: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    marginBottom: spacing.md,
  },
  numberText: {
    color: colors.accent.primary,
    fontWeight: typography.fontWeight.bold,
  },
  hexagramContainer: {
    marginVertical: spacing.md,
  },
  metadataContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  englishName: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  chineseName: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
