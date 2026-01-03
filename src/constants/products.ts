// RevenueCat Product IDs
// These must match the product IDs in App Store Connect, Google Play Console, and RevenueCat

export const PRODUCTS = {
  SUBSCRIPTION: 'premium_monthly',
  CREDITS_300: 'credits_300',
} as const;

export const ENTITLEMENTS = {
  PREMIUM: 'premium',
} as const;

// Subscription details
export const SUBSCRIPTION_DETAILS = {
  MONTHLY_READINGS: 1000,
  PRICE: '$9.99',
  PERIOD: 'month',
};

// Credit pack details
export const CREDIT_PACK_DETAILS = {
  AMOUNT: 300,
  PRICE: '$10',
};
