import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import { RootStackParamList } from '@/navigation/types';
import { BackgroundTexture } from '@/components/layout/BackgroundTexture';
import { useAppState } from '@/context/AppStateContext';
import { colors, typography, spacing } from '@/theme';
import { layout } from '@/theme/spacing';

type IntroductionScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const IntroductionScreen: React.FC = () => {
  const navigation = useNavigation<IntroductionScreenNavigationProp>();
  const { markIntroAsSeen } = useAppState();

  const handleGetStarted = async () => {
    await markIntroAsSeen();
    // Reset navigation to Casting screen so user can't go back to intro
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Casting' }],
      })
    );
  };

  return (
    <BackgroundTexture>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative Trigram Symbol */}
        <Animated.View
          entering={FadeIn.delay(200).duration(800)}
          style={styles.symbolContainer}
        >
          <Text style={styles.trigramSymbol}>☰</Text>
          <Text style={styles.trigramSymbolSecond}>☷</Text>
        </Animated.View>

        {/* Welcome Header */}
        <Animated.View
          entering={FadeInDown.delay(400).duration(600)}
          style={styles.header}
        >
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.title}>I Ching</Text>
          <Text style={styles.subtitle}>The Book of Changes</Text>
        </Animated.View>

        {/* Decorative Divider */}
        <Animated.View
          entering={FadeIn.delay(600).duration(500)}
          style={styles.dividerContainer}
        >
          <View style={styles.dividerLine} />
          <Text style={styles.dividerSymbol}>&#x2726;</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        {/* I Ching Description */}
        <Animated.View
          entering={FadeInUp.delay(800).duration(600)}
          style={styles.descriptionCard}
        >
          <Text style={styles.cardTitle}>Ancient Wisdom</Text>
          <Text style={styles.descriptionText}>
            The I Ching is one of humanity's oldest texts, dating back over 3,000 years.
            It offers profound insights through 64 hexagrams, each a unique combination
            of yin and yang energies that reflect the patterns of change in life.
          </Text>
          <Text style={styles.descriptionText}>
            More than fortune-telling, the I Ching serves as a mirror for self-reflection,
            helping you gain clarity on life's questions through timeless wisdom.
          </Text>
        </Animated.View>

        {/* How to Use Section */}
        <Animated.View
          entering={FadeInUp.delay(1000).duration(600)}
          style={styles.instructionsCard}
        >
          <Text style={styles.cardTitle}>How to Consult</Text>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>1</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionTitle}>Formulate Your Question</Text>
              <Text style={styles.instructionText}>
                Focus on an open-ended question about a situation in your life.
              </Text>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>2</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionTitle}>Cast the Coins</Text>
              <Text style={styles.instructionText}>
                Tap to toss three coins six times. Each toss creates one line of your hexagram.
              </Text>
            </View>
          </View>

          <View style={styles.instructionItem}>
            <View style={styles.instructionNumber}>
              <Text style={styles.instructionNumberText}>3</Text>
            </View>
            <View style={styles.instructionContent}>
              <Text style={styles.instructionTitle}>Receive Your Reading</Text>
              <Text style={styles.instructionText}>
                Explore your hexagram's meaning and receive AI-powered insights tailored to your question.
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Get Started Button */}
        <Animated.View
          entering={FadeInUp.delay(1200).duration(600)}
          style={styles.ctaContainer}
        >
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleGetStarted}
            activeOpacity={0.8}
            testID="intro-get-started-button"
          >
            <Text style={styles.ctaButtonText}>Begin Your Journey</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Footer Quote */}
        <Animated.View
          entering={FadeIn.delay(1400).duration(600)}
          style={styles.footer}
        >
          <Text style={styles.quoteText}>
            "The only constant in life is change."
          </Text>
          <Text style={styles.quoteAuthor}>— Heraclitus</Text>
        </Animated.View>
      </ScrollView>
    </BackgroundTexture>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingTop: 80,
    paddingBottom: spacing.huge,
    alignItems: 'center',
  },
  symbolContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  trigramSymbol: {
    fontSize: 48,
    color: colors.accent.primary,
    opacity: 0.8,
    ...typography.textShadow.gold,
  },
  trigramSymbolSecond: {
    fontSize: 48,
    color: colors.accent.light,
    opacity: 0.6,
    ...typography.textShadow.gold,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  welcomeText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
    letterSpacing: typography.letterSpacing.wider,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize.huge,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.xs,
    ...typography.textShadow.medium,
  },
  subtitle: {
    fontSize: typography.fontSize.lg,
    color: colors.accent.primary,
    fontWeight: typography.fontWeight.light,
    letterSpacing: typography.letterSpacing.wide,
    ...typography.textShadow.gold,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    width: SCREEN_WIDTH * 0.6,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.accent.primary,
    opacity: 0.3,
  },
  dividerSymbol: {
    fontSize: 16,
    color: colors.accent.primary,
    marginHorizontal: spacing.md,
  },
  descriptionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: layout.borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.accent.subtle,
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.accent.primary,
    marginBottom: spacing.md,
    letterSpacing: typography.letterSpacing.tight,
  },
  descriptionText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    marginBottom: spacing.md,
  },
  instructionsCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: layout.borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xxl,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.accent.subtle,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: spacing.xxs,
  },
  instructionNumberText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.background.primary,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  instructionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  ctaContainer: {
    width: '100%',
    marginBottom: spacing.xxl,
  },
  ctaButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.lg,
    borderRadius: layout.borderRadius.md,
    alignItems: 'center',
    ...layout.shadow.md,
  },
  ctaButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.background.primary,
    letterSpacing: typography.letterSpacing.wide,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  quoteText: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  quoteAuthor: {
    fontSize: typography.fontSize.sm,
    color: colors.text.muted,
  },
});

export default IntroductionScreen;
