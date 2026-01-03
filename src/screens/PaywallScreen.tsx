import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { colors, typography, spacing } from '@/theme';
import { useAuth } from '@/context/AuthContext';
import {
  getAvailablePackages,
  purchaseSubscription,
  purchaseCreditPack,
  restorePurchases,
} from '@/services/revenuecat';
import { SUBSCRIPTION_DETAILS, CREDIT_PACK_DETAILS } from '@/constants/products';
import type { PurchasesPackage } from 'react-native-purchases';

type PaywallScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface PaywallScreenProps {
  nextFreeReadingTime?: number; // Timestamp when next free reading is available
}

const PaywallScreen: React.FC<PaywallScreenProps> = ({ nextFreeReadingTime }) => {
  const navigation = useNavigation<PaywallScreenNavigationProp>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [subscriptionPackage, setSubscriptionPackage] = useState<PurchasesPackage | null>(null);
  const [creditPackage, setCreditPackage] = useState<PurchasesPackage | null>(null);
  const [timeUntilFree, setTimeUntilFree] = useState('');

  // Load available packages
  useEffect(() => {
    loadPackages();
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!nextFreeReadingTime) return;

    const updateTimer = () => {
      const now = Date.now();
      const diff = nextFreeReadingTime - now;

      if (diff <= 0) {
        setTimeUntilFree('Available now!');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeUntilFree(`${hours}h ${minutes}m`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [nextFreeReadingTime]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const { subscription, creditPack } = await getAvailablePackages();
      setSubscriptionPackage(subscription);
      setCreditPackage(creditPack);
    } catch (error) {
      console.error('Failed to load packages:', error);
      Alert.alert('Error', 'Failed to load purchase options');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseSubscription = async () => {
    if (!subscriptionPackage) {
      Alert.alert('Error', 'Subscription not available');
      return;
    }

    try {
      setPurchasing(true);
      await purchaseSubscription();
      Alert.alert(
        'Success!',
        'You now have unlimited access to AI readings!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      if (error.message !== 'Purchase cancelled') {
        Alert.alert('Purchase Failed', error.message || 'Please try again');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handlePurchaseCreditPack = async () => {
    if (!creditPackage) {
      Alert.alert('Error', 'Credit pack not available');
      return;
    }

    try {
      setPurchasing(true);
      await purchaseCreditPack();
      Alert.alert(
        'Success!',
        `You now have ${CREDIT_PACK_DETAILS.AMOUNT} credits!`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      if (error.message !== 'Purchase cancelled') {
        Alert.alert('Purchase Failed', error.message || 'Please try again');
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      setPurchasing(true);
      await restorePurchases();
      Alert.alert('Success', 'Purchases restored successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
        <Text style={styles.loadingText}>Loading options...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Unlock AI Readings</Text>
          <Text style={styles.subtitle}>
            You've used your free daily reading
          </Text>
          {nextFreeReadingTime && (
            <View style={styles.freeReadingCard}>
              <Text style={styles.freeReadingLabel}>Next free reading in:</Text>
              <Text style={styles.freeReadingTime}>{timeUntilFree}</Text>
            </View>
          )}
        </View>

        {/* Subscription Option */}
        {subscriptionPackage && (
          <TouchableOpacity
            style={[styles.optionCard, styles.recommendedCard]}
            onPress={handlePurchaseSubscription}
            disabled={purchasing}
          >
            <View style={styles.recommendedBadge}>
              <Text style={styles.recommendedText}>RECOMMENDED</Text>
            </View>
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Premium Monthly</Text>
              <Text style={styles.optionPrice}>
                {subscriptionPackage.product.priceString}/{SUBSCRIPTION_DETAILS.PERIOD}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.benefitsList}>
              <Text style={styles.benefitItem}>✓ {SUBSCRIPTION_DETAILS.MONTHLY_READINGS} readings per month</Text>
              <Text style={styles.benefitItem}>✓ Unlimited follow-up questions</Text>
              <Text style={styles.benefitItem}>✓ Cancel anytime</Text>
            </View>
            <View style={styles.ctaContainer}>
              <Text style={styles.ctaText}>
                {purchasing ? 'Processing...' : 'Subscribe Now'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Credit Pack Option */}
        {creditPackage && (
          <TouchableOpacity
            style={styles.optionCard}
            onPress={handlePurchaseCreditPack}
            disabled={purchasing}
          >
            <View style={styles.optionHeader}>
              <Text style={styles.optionTitle}>Credit Pack</Text>
              <Text style={styles.optionPrice}>{creditPackage.product.priceString}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.benefitsList}>
              <Text style={styles.benefitItem}>✓ {CREDIT_PACK_DETAILS.AMOUNT} readings</Text>
              <Text style={styles.benefitItem}>✓ Never expire</Text>
              <Text style={styles.benefitItem}>✓ One-time purchase</Text>
            </View>
            <View style={[styles.ctaContainer, styles.secondaryCta]}>
              <Text style={[styles.ctaText, styles.secondaryCtaText]}>
                {purchasing ? 'Processing...' : 'Buy Credits'}
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Restore Purchases */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchases}
          disabled={purchasing}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>
          Purchases are processed through your App Store account.{'\n'}
          Subscriptions auto-renew unless cancelled.
        </Text>
      </ScrollView>

      {/* Loading overlay */}
      {purchasing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.accent.primary} />
        </View>
      )}
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
    paddingTop: 100,
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  freeReadingCard: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  freeReadingLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  freeReadingTime: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent.primary,
  },
  optionCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  recommendedCard: {
    borderColor: colors.accent.primary,
    position: 'relative',
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: spacing.lg,
    backgroundColor: colors.accent.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.background.primary,
    letterSpacing: 1,
  },
  optionHeader: {
    marginBottom: spacing.md,
  },
  optionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  optionPrice: {
    fontSize: typography.fontSize.lg,
    color: colors.accent.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line.yin,
    marginVertical: spacing.md,
  },
  benefitsList: {
    marginBottom: spacing.md,
  },
  benefitItem: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: typography.fontSize.md * 1.5,
  },
  ctaContainer: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryCta: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.accent.primary,
  },
  ctaText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.background.primary,
  },
  secondaryCtaText: {
    color: colors.accent.primary,
  },
  restoreButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  restoreButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    textDecorationLine: 'underline',
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
    textAlign: 'center',
    marginTop: spacing.xl,
    lineHeight: typography.fontSize.xs * 1.6,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PaywallScreen;
