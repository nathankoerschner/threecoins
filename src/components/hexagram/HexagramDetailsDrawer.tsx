import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CollapsibleDrawer } from '@/components/common/CollapsibleDrawer';
import { getHexagramDetails } from '@/data/hexagramDetails';
import { colors, typography, spacing } from '@/theme';

interface HexagramDetailsDrawerProps {
  hexagramNumber: number;
  changingLines?: number[];
}

export const HexagramDetailsDrawer: React.FC<HexagramDetailsDrawerProps> = ({
  hexagramNumber,
  changingLines,
}) => {
  const details = getHexagramDetails(hexagramNumber);

  if (!details) {
    return null;
  }

  const hasChangingLines = changingLines && changingLines.length > 0;

  return (
    <CollapsibleDrawer title="Details">
      <View style={styles.container}>
        {/* Image Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Image</Text>
          <Text style={styles.sectionContent}>{details.image}</Text>
        </View>

        {/* Judgment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Judgment</Text>
          <Text style={styles.sectionContent}>{details.judgment}</Text>
        </View>

        {/* Changing Lines Section */}
        {hasChangingLines && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changing Lines</Text>
            {changingLines.map((lineNumber) => (
              <View key={lineNumber} style={styles.lineItem}>
                <Text style={styles.lineNumber}>Line {lineNumber}</Text>
                <Text style={styles.lineContent}>
                  {details.lines[lineNumber]}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </CollapsibleDrawer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xs,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.display,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent.primary,
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  sectionContent: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.text,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.primary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    letterSpacing: typography.letterSpacing.normal,
  },
  lineItem: {
    marginBottom: spacing.md,
  },
  lineNumber: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.text,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent.light,
    marginBottom: spacing.xs,
  },
  lineContent: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.text,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    letterSpacing: typography.letterSpacing.normal,
  },
});
