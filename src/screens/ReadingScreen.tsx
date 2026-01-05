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
      {/* Close button - positioned with equal spacing from top and right */}
      <TouchableOpacity
        style={[styles.closeButton, { top: insets.top + spacing.md }]}
        onPress={handleDismiss}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
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
  closeButton: {
    position: 'absolute',
    right: spacing.md,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.background.primary,
    fontWeight: typography.fontWeight.bold,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});

export default ReadingScreen;
