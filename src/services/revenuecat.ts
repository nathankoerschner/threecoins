import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import { PRODUCTS, ENTITLEMENTS } from '@/constants/products';

// Initialize RevenueCat
export const initializeRevenueCat = async (userId: string): Promise<void> => {
  const apiKey = Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY,
  });

  if (!apiKey) {
    console.warn('RevenueCat API key not configured');
    return;
  }

  try {
    // Configure SDK
    Purchases.setLogLevel(LOG_LEVEL.DEBUG); // Change to INFO or ERROR in production

    // Initialize with API key
    await Purchases.configure({ apiKey });

    // Set user ID (anonymous or permanent)
    await Purchases.logIn(userId);

    console.log('RevenueCat initialized successfully');
  } catch (error) {
    console.error('Failed to initialize RevenueCat:', error);
    throw error;
  }
};

// Get current offerings
export const getOfferings = async (): Promise<PurchasesOffering | null> => {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch (error) {
    console.error('Failed to get offerings:', error);
    return null;
  }
};

// Get customer info (subscription status, entitlements, etc.)
export const getCustomerInfo = async (): Promise<CustomerInfo> => {
  try {
    const customerInfo = await Purchases.getCustomerInfo();
    return customerInfo;
  } catch (error) {
    console.error('Failed to get customer info:', error);
    throw error;
  }
};

// Check if user has active subscription
export const hasActiveSubscription = async (): Promise<boolean> => {
  try {
    const customerInfo = await getCustomerInfo();
    const entitlement = customerInfo.entitlements.active[ENTITLEMENTS.PREMIUM];
    return entitlement !== undefined;
  } catch (error) {
    console.error('Failed to check subscription status:', error);
    return false;
  }
};

// Purchase subscription
export const purchaseSubscription = async (): Promise<CustomerInfo> => {
  try {
    const offerings = await getOfferings();

    if (!offerings) {
      throw new Error('No offerings available');
    }

    // Get the monthly package
    const packageToPurchase = offerings.availablePackages.find(
      (pkg) => pkg.identifier === '$rc_monthly' || pkg.product.identifier === PRODUCTS.SUBSCRIPTION
    );

    if (!packageToPurchase) {
      throw new Error('Subscription package not found');
    }

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error: any) {
    // Handle user cancellation
    if (error.userCancelled) {
      throw new Error('Purchase cancelled');
    }
    console.error('Failed to purchase subscription:', error);
    throw error;
  }
};

// Purchase credit pack
export const purchaseCreditPack = async (): Promise<CustomerInfo> => {
  try {
    const offerings = await getOfferings();

    if (!offerings) {
      throw new Error('No offerings available');
    }

    // Get the credit pack package
    const packageToPurchase = offerings.availablePackages.find(
      (pkg) => pkg.product.identifier === PRODUCTS.CREDITS_300
    );

    if (!packageToPurchase) {
      throw new Error('Credit pack not found');
    }

    const { customerInfo } = await Purchases.purchasePackage(packageToPurchase);
    return customerInfo;
  } catch (error: any) {
    // Handle user cancellation
    if (error.userCancelled) {
      throw new Error('Purchase cancelled');
    }
    console.error('Failed to purchase credit pack:', error);
    throw error;
  }
};

// Restore purchases
export const restorePurchases = async (): Promise<CustomerInfo> => {
  try {
    const customerInfo = await Purchases.restorePurchases();
    return customerInfo;
  } catch (error) {
    console.error('Failed to restore purchases:', error);
    throw error;
  }
};

// Sync purchases with backend
// This is called after successful purchase to ensure Firestore is updated
export const syncPurchasesWithBackend = async (): Promise<void> => {
  try {
    // RevenueCat webhook will handle the actual sync to Firestore
    // This just forces a refresh of customer info
    await getCustomerInfo();
    console.log('Purchases synced with backend');
  } catch (error) {
    console.error('Failed to sync purchases:', error);
  }
};

// Log out (when converting anonymous to permanent account)
export const logoutRevenueCat = async (): Promise<void> => {
  try {
    await Purchases.logOut();
    console.log('Logged out of RevenueCat');
  } catch (error) {
    console.error('Failed to logout from RevenueCat:', error);
  }
};

// Switch user (after account conversion)
export const switchRevenueCatUser = async (newUserId: string): Promise<void> => {
  try {
    await Purchases.logIn(newUserId);
    console.log('Switched RevenueCat user to:', newUserId);
  } catch (error) {
    console.error('Failed to switch RevenueCat user:', error);
    throw error;
  }
};

// Get available packages for display
export const getAvailablePackages = async (): Promise<{
  subscription: PurchasesPackage | null;
  creditPack: PurchasesPackage | null;
}> => {
  try {
    const offerings = await getOfferings();

    if (!offerings) {
      return { subscription: null, creditPack: null };
    }

    const subscription = offerings.availablePackages.find(
      (pkg) => pkg.identifier === '$rc_monthly' || pkg.product.identifier === PRODUCTS.SUBSCRIPTION
    ) || null;

    const creditPack = offerings.availablePackages.find(
      (pkg) => pkg.product.identifier === PRODUCTS.CREDITS_300
    ) || null;

    return { subscription, creditPack };
  } catch (error) {
    console.error('Failed to get available packages:', error);
    return { subscription: null, creditPack: null };
  }
};
