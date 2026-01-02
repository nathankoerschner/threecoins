import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HexagramDisplay } from '@/components/hexagram/HexagramDisplay';
import { Hexagram, CastLine } from '@/types';
import { colors, typography, spacing } from '@/theme';

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
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  hexagramCard: {
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  stabilityMessage: {
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: 8,
    marginTop: spacing.lg,
  },
  stabilityText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
});
