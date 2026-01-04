import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HexagramDisplay } from '@/components/hexagram/HexagramDisplay';
import { HexagramDetailsDrawer } from '@/components/hexagram/HexagramDetailsDrawer';
import { Hexagram, CastLine } from '@/types';
import { colors, typography, spacing } from '@/theme';

const getChangingLineNumbers = (lines: CastLine[]): number[] =>
  lines
    .map((line, index) => (line.isChanging ? index + 1 : null))
    .filter((n): n is number => n !== null);

interface HexagramPairProps {
  primary: Hexagram;
  primaryLines: CastLine[];
  transformed?: Hexagram | null;
  hasChangingLines: boolean;
}

export const HexagramPair: React.FC<HexagramPairProps> = ({
  primary,
  primaryLines,
  transformed,
  hasChangingLines,
}) => {
  return (
    <View style={styles.container}>
      {/* Primary Hexagram */}
      <View style={styles.hexagramSection}>
        <Text style={styles.sectionLabel}>
          {hasChangingLines ? 'Present Situation' : 'Your Hexagram'}
        </Text>
        <View style={styles.hexagramCard}>
          <HexagramDisplay
            hexagram={primary}
            lines={primaryLines}
            animated={false}
            showMetadata={true}
            size="large"
          />
          <HexagramDetailsDrawer
            hexagramNumber={primary.number}
            changingLines={getChangingLineNumbers(primaryLines)}
          />
        </View>
      </View>

      {/* Transformed Hexagram */}
      {hasChangingLines && transformed && (
        <View style={styles.hexagramSection}>
          <Text style={styles.sectionLabel}>Future Outcome</Text>
          <View style={styles.hexagramCard}>
            <HexagramDisplay
              hexagram={transformed}
              animated={false}
              showMetadata={true}
              size="large"
            />
            <HexagramDetailsDrawer hexagramNumber={transformed.number} />
          </View>
        </View>
      )}

      {/* No changing lines message */}
      {!hasChangingLines && (
        <View style={styles.stabilityMessage}>
          <Text style={styles.stabilityText}>
            No changing lines - This hexagram represents a stable situation
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  hexagramSection: {
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.text,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.widest,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  hexagramCard: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.xl,
    borderRadius: 20,
    alignItems: 'center',
    // Premium layered shadow
    shadowColor: colors.shadow.md,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    // Refined border with subtle gold tint
    borderWidth: 1,
    borderColor: colors.accent.subtle,
  },
  stabilityMessage: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.lg,
    borderRadius: 14,
    marginTop: spacing.lg,
    // Subtle shadow
    shadowColor: colors.shadow.sm,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
    // Refined border
    borderWidth: 1,
    borderColor: colors.accent.subtle,
  },
  stabilityText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.text,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    letterSpacing: typography.letterSpacing.normal,
    opacity: 0.95,
  },
});
