import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { requestInterpretationWithRetry, subscribeToInterpretation } from '@/services/ai';
import { Hexagram } from '@/types';
import { colors, typography, spacing } from '@/theme';

interface AIInterpretationProps {
  primaryHexagram: Hexagram;
  relatingHexagram: Hexagram | null;
  changingLines: number[];
  question?: string;
}

export const AIInterpretation: React.FC<AIInterpretationProps> = ({
  primaryHexagram,
  relatingHexagram,
  changingLines,
  question,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'streaming' | 'complete' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!user) {
      setError('User not authenticated');
      setStatus('error');
      return;
    }

    const startInterpretation = async () => {
      try {
        setStatus('loading');
        setError(null);

        // Request interpretation with retry
        const readingId = await requestInterpretationWithRetry(
          primaryHexagram,
          relatingHexagram,
          changingLines,
          question,
          user.uid
        );

        // Subscribe to streaming updates
        const unsubscribe = subscribeToInterpretation(
          user.uid,
          readingId,
          (newContent, newStatus) => {
            setContent(newContent);
            setStatus(newStatus === 'complete' ? 'complete' : 'streaming');
          },
          (errorMessage) => {
            setError(errorMessage);
            setStatus('error');
          }
        );

        unsubscribeRef.current = unsubscribe;
      } catch (err: any) {
        console.error('Failed to start interpretation:', err);
        setError(err.message || 'Failed to generate interpretation');
        setStatus('error');
      }
    };

    startInterpretation();

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user, primaryHexagram, relatingHexagram, changingLines, question]);

  // Render loading state
  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
          <Text style={styles.loadingText}>Consulting the oracle...</Text>
        </View>
      </View>
    );
  }

  // Render error state
  if (status === 'error') {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Unable to Generate Interpretation</Text>
          <Text style={styles.errorMessage}>
            {error || 'An unexpected error occurred. Please try again.'}
          </Text>
        </View>
      </View>
    );
  }

  // Render streaming/complete content
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Interpretation</Text>
      <View style={styles.contentContainer}>
        <Text style={styles.content}>{content}</Text>
        {status === 'streaming' && (
          <View style={styles.streamingIndicator}>
            <Text style={styles.streamingDot}>●</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.display,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.primary,
    marginBottom: spacing.base,
    letterSpacing: typography.letterSpacing.wide,
    ...typography.textShadow.gold,
  },
  contentContainer: {
    position: 'relative',
    backgroundColor: colors.background.tertiary,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.accent.subtle,
    // Premium shadow for depth
    shadowColor: colors.shadow.sm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  content: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.text,
    fontWeight: typography.fontWeight.regular,
    color: colors.text.primary,
    lineHeight: typography.fontSize.md * 1.7,
    letterSpacing: typography.letterSpacing.normal,
  },
  streamingIndicator: {
    marginTop: spacing.md,
    alignItems: 'flex-start',
  },
  streamingDot: {
    fontSize: typography.fontSize.xl,
    color: colors.accent.light,
    opacity: 0.8,
    // Subtle glow on streaming indicator
    textShadowColor: colors.accent.glow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.text,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    letterSpacing: typography.letterSpacing.wide,
  },
  errorContainer: {
    backgroundColor: colors.background.tertiary,
    padding: spacing.lg,
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.state.error,
    // Premium shadow
    shadowColor: colors.state.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.display,
    fontWeight: typography.fontWeight.semibold,
    color: colors.state.error,
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.tight,
  },
  errorMessage: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.text,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
    letterSpacing: typography.letterSpacing.normal,
  },
});
