import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/theme';

interface ReadingHeaderProps {
  title?: string;
  subtitle?: string;
}

export const ReadingHeader: React.FC<ReadingHeaderProps> = ({
  title = 'Your Reading',
  subtitle,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingVertical: spacing.base,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontFamily: typography.fontFamily.display,
    fontWeight: typography.fontWeight.heavy,
    color: colors.accent.primary,
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.tighter,
    // Dramatic gold glow
    ...typography.textShadow.gold,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.text,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    letterSpacing: typography.letterSpacing.wide,
    opacity: 0.9,
  },
});
