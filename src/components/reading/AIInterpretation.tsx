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
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.primary,
    marginBottom: spacing.md,
  },
  contentContainer: {
    position: 'relative',
  },
  content: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: typography.fontSize.md * 1.6,
  },
  streamingIndicator: {
    marginTop: spacing.sm,
    alignItems: 'flex-start',
  },
  streamingDot: {
    fontSize: typography.fontSize.lg,
    color: colors.accent.primary,
    opacity: 0.7,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  errorContainer: {
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#ff4444',
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.md * 1.4,
  },
});
