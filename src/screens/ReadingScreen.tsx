import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '@/navigation/types';
import { ReadingHeader } from '@/components/reading/ReadingHeader';
import { TransformationIndicator } from '@/components/reading/TransformationIndicator';
import { HexagramPair } from '@/components/reading/HexagramPair';
import { AIInterpretation } from '@/components/reading/AIInterpretation';
import { ReadingChat } from '@/components/reading/ReadingChat';
import { BackgroundTexture } from '@/components/layout/BackgroundTexture';
import { colors, typography, spacing } from '@/theme';

type ReadingScreenRouteProp = RouteProp<RootStackParamList, 'Reading'>;
type ReadingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reading'>;

const ReadingScreen: React.FC = () => {
  const navigation = useNavigation<ReadingScreenNavigationProp>();
  const route = useRoute<ReadingScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const { reading, question } = route.params;

  const hasChangingLines = reading.changingLines.length > 0;

  // State for chat feature
  const [interpretationComplete, setInterpretationComplete] = useState(false);
  const [interpretationContent, setInterpretationContent] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleInterpretationComplete = useCallback((content: string) => {
    setInterpretationContent(content);
    setInterpretationComplete(true);
  }, []);

  // Scroll to bottom when keyboard opens
  useEffect(() => {
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return () => {
      keyboardDidShow.remove();
    };
  }, []);

  const handleDismiss = () => {
    navigation.goBack();
  };

  const handleNewReading = () => {
    // Reset navigation stack to a fresh CastingScreen with reset flag
    navigation.reset({
      index: 0,
      routes: [{ name: 'Casting', params: { shouldReset: true } }],
    });
  };

  return (
    <BackgroundTexture>
      {/* New Reading button in top left */}
      <TouchableOpacity style={[styles.newReadingButton, { top: insets.top - 50 }]} onPress={handleNewReading}>
        <Text style={styles.newReadingButtonText}>New Reading</Text>
      </TouchableOpacity>

      {/* Close button in top right */}
      <TouchableOpacity style={[styles.closeButton, { top: insets.top - 50 }]} onPress={handleDismiss}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top + 44 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ReadingHeader title="Your Reading" />

          <HexagramPair
            primary={reading.primary}
            primaryLines={reading.castLines}
            transformed={reading.transformed}
            hasChangingLines={hasChangingLines}
          />

          {/* Transformation indicator */}
          {hasChangingLines && reading.transformed && (
            <TransformationIndicator />
          )}

          {/* AI Interpretation */}
          <AIInterpretation
            primaryHexagram={reading.primary}
            relatingHexagram={reading.transformed}
            changingLines={reading.changingLines}
            question={question}
            onComplete={handleInterpretationComplete}
          />

          {/* Chat for follow-up questions */}
          {interpretationComplete && (
            <ReadingChat
              primaryHexagram={reading.primary}
              relatingHexagram={reading.transformed}
              changingLines={reading.changingLines}
              question={question}
              interpretation={interpretationContent}
            />
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundTexture>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    right: spacing.lg,
    zIndex: 100,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // Premium shadow with gold glow
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    // Refined border
    borderWidth: 1,
    borderColor: colors.accent.light,
  },
  closeButtonText: {
    fontSize: 22,
    color: colors.background.primary,
    fontWeight: typography.fontWeight.heavy,
    lineHeight: 22,
    // Subtle embossed effect
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  newReadingButton: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 100,
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    // Premium gold shadow with glow
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    // Refined border
    borderWidth: 1,
    borderColor: colors.accent.light,
  },
  newReadingButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.display,
    fontWeight: typography.fontWeight.bold,
    color: colors.background.primary,
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.wide,
    // Subtle embossed effect
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default ReadingScreen;
