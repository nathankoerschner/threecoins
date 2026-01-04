import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useAuth } from '@/context/AuthContext';
import { useCastingContext } from '@/context/CastingContext';
import { startInterpretationStreaming, subscribeToInterpretation } from '@/services/ai';
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
  const { cachedInterpretation, setCachedInterpretation } = useCastingContext();
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Use cached interpretation if available, otherwise use default states
  const content = cachedInterpretation?.content ?? '';
  const status = cachedInterpretation?.status ?? 'loading';
  const error = cachedInterpretation?.error ?? null;

  useEffect(() => {
    if (!user) {
      if (!cachedInterpretation) {
        setCachedInterpretation({
          content: '',
          status: 'error',
          readingId: '',
          error: 'User not authenticated',
        });
      }
      return;
    }

    // If interpretation is complete or errored, nothing to do
    if (cachedInterpretation?.status === 'complete' || cachedInterpretation?.status === 'error') {
      return;
    }

    // If we're streaming and have a readingId, resubscribe to continue receiving updates
    if (cachedInterpretation?.status === 'streaming' && cachedInterpretation.readingId) {
      const unsubscribe = subscribeToInterpretation(
        user.uid,
        cachedInterpretation.readingId,
        (newContent, newStatus) => {
          setCachedInterpretation({
            content: newContent,
            status: newStatus === 'complete' ? 'complete' : 'streaming',
            readingId: cachedInterpretation.readingId,
          });
        },
        (errorMessage) => {
          setCachedInterpretation({
            content: cachedInterpretation.content,
            status: 'error',
            readingId: cachedInterpretation.readingId,
            error: errorMessage,
          });
        }
      );

      unsubscribeRef.current = unsubscribe;

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    }

    // If we're loading with a readingId (e.g., StrictMode remount), resubscribe
    if (cachedInterpretation?.status === 'loading' && cachedInterpretation.readingId) {
      const unsubscribe = subscribeToInterpretation(
        user.uid,
        cachedInterpretation.readingId,
        (newContent, newStatus) => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setCachedInterpretation({
            content: newContent,
            status: newStatus === 'complete' ? 'complete' : 'streaming',
            readingId: cachedInterpretation.readingId,
          });
        },
        (errorMessage) => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
          setCachedInterpretation({
            content: '',
            status: 'error',
            readingId: cachedInterpretation.readingId,
            error: errorMessage,
          });
        }
      );

      unsubscribeRef.current = unsubscribe;

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      };
    }

    // No cached interpretation - start fresh
    const readingId = startInterpretationStreaming(
      primaryHexagram,
      relatingHexagram,
      changingLines,
      question,
      user.uid
    );

    // Set initial loading state
    setCachedInterpretation({
      content: '',
      status: 'loading',
      readingId,
    });

    // Set timeout fallback - if no updates within 10 seconds, show error
    timeoutRef.current = setTimeout(() => {
      setCachedInterpretation({
        content: '',
        status: 'error',
        readingId,
        error: 'Request timed out. Please try again.',
      });
    }, 10000);

    // Subscribe to streaming updates IMMEDIATELY (before Cloud Function writes)
    const unsubscribe = subscribeToInterpretation(
      user.uid,
      readingId,
      (newContent, newStatus) => {
        // Clear timeout on first successful update
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setCachedInterpretation({
          content: newContent,
          status: newStatus === 'complete' ? 'complete' : 'streaming',
          readingId,
        });
      },
      (errorMessage) => {
        // Clear timeout on error
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setCachedInterpretation({
          content: '',
          status: 'error',
          readingId,
          error: errorMessage,
        });
      }
    );

    unsubscribeRef.current = unsubscribe;

    // Cleanup subscription and timeout on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [user, cachedInterpretation?.status, cachedInterpretation?.readingId]); // Re-run when status changes to handle resubscription

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
        <Markdown style={markdownStyles}>{content}</Markdown>
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

const markdownStyles = {
  body: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.text,
    color: colors.text.primary,
    lineHeight: typography.fontSize.md * 1.7,
  },
  heading1: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.display,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.primary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  heading2: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.display,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent.light,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  heading3: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.display,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  paragraph: {
    marginBottom: spacing.md,
  },
  strong: {
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.light,
  },
  em: {
    fontStyle: 'italic' as const,
  },
  bullet_list: {
    marginBottom: spacing.md,
  },
  ordered_list: {
    marginBottom: spacing.md,
  },
  list_item: {
    marginBottom: spacing.xs,
  },
  blockquote: {
    backgroundColor: colors.background.secondary,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent.primary,
    paddingLeft: spacing.md,
    paddingVertical: spacing.sm,
    marginVertical: spacing.sm,
    fontStyle: 'italic' as const,
  },
  code_inline: {
    backgroundColor: colors.background.secondary,
    fontFamily: 'monospace',
    paddingHorizontal: spacing.xs,
    borderRadius: 4,
  },
  hr: {
    backgroundColor: colors.accent.subtle,
    height: 1,
    marginVertical: spacing.md,
  },
};
