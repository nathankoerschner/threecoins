import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { ReadingHeader } from '@/components/reading/ReadingHeader';
import { TransformationIndicator } from '@/components/reading/TransformationIndicator';
import { HexagramPair } from '@/components/reading/HexagramPair';
import { AIInterpretation } from '@/components/reading/AIInterpretation';
import { colors, typography, spacing } from '@/theme';

type ReadingScreenRouteProp = RouteProp<RootStackParamList, 'Reading'>;
type ReadingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Reading'>;

const ReadingScreen: React.FC = () => {
  const navigation = useNavigation<ReadingScreenNavigationProp>();
  const route = useRoute<ReadingScreenRouteProp>();
  const { reading, question } = route.params;

  const hasChangingLines = reading.changingLines.length > 0;

  const handleDismiss = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* Close button in top right */}
      <TouchableOpacity style={styles.closeButton} onPress={handleDismiss}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
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
            <TransformationIndicator changingLines={reading.changingLines} />
          )}

          {/* AI Interpretation */}
          <AIInterpretation
            primaryHexagram={reading.primary}
            relatingHexagram={reading.transformed}
            changingLines={reading.changingLines}
            question={question}
          />
        </ScrollView>
      </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
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
    paddingTop: 60,
    paddingBottom: spacing.xxxl,
  },
});

export default ReadingScreen;
