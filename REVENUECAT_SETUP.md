# RevenueCat Setup Guide

Complete guide to set up RevenueCat for the I Ching app's monetization.

## 1. Create RevenueCat Account

1. Go to [RevenueCat](https://www.revenuecat.com/)
2. Sign up for a free account
3. Create a new project: "I Ching App"

## 2. Configure App Store Connect (iOS)

### Create In-App Purchase Products in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select your app
3. Go to **Features** → **In-App Purchases**
4. Click **+** to create new products

**Subscription Product:**
- **Type**: Auto-Renewable Subscription
- **Reference Name**: Premium Monthly Subscription
- **Product ID**: `iching_premium_monthly`
- **Subscription Group**: Create new group "Premium"
- **Subscription Duration**: 1 Month
- **Price**: $9.99 (Tier 10)
- **Localization**:
  - **Display Name**: Premium Monthly
  - **Description**: Unlimited AI readings, 1000 interpretations per month

**Non-Consumable Product (Credit Pack):**
- **Type**: Non-Consumable
- **Reference Name**: Credit Pack 300
- **Product ID**: `iching_credits_300`
- **Price**: $9.99 (Tier 10)
- **Localization**:
  - **Display Name**: 300 Credits
  - **Description**: 300 AI reading credits, never expire

### Get App Store Connect API Key

1. Go to **Users and Access** → **Keys** → **In-App Purchase**
2. Click **Generate API Key**
3. Download the `.p8` key file
4. Note the **Issuer ID** and **Key ID**

## 3. Configure Google Play Console (Android)

### Create In-App Products in Google Play Console

1. Go to [Google Play Console](https://play.google.com/console/)
2. Select your app
3. Go to **Monetize** → **Products** → **Subscriptions**

**Subscription Product:**
- **Product ID**: `iching_premium_monthly`
- **Name**: Premium Monthly Subscription
- **Description**: Unlimited AI readings, 1000 interpretations per month
- **Billing Period**: 1 Month
- **Price**: $9.99

**One-Time Product (Credit Pack):**
- Go to **Monetize** → **Products** → **In-app products**
- **Product ID**: `iching_credits_300`
- **Name**: 300 Credits
- **Description**: 300 AI reading credits, never expire
- **Price**: $9.99

### Get Google Play Service Account

1. Go to **Setup** → **API access**
2. Link a Google Cloud project
3. Create a service account
4. Download the JSON key file
5. Grant **Finance** permissions

## 4. Configure RevenueCat

### Add iOS App

1. In RevenueCat dashboard, go to **Apps**
2. Click **+ New**
3. Select **iOS**
4. Enter:
   - **App name**: I Ching iOS
   - **Bundle ID**: `com.ichingapp.mobile` (from app.json)
   - **App Store Connect API Key**: Upload .p8 file
   - **Issuer ID**: From App Store Connect
   - **Key ID**: From App Store Connect

### Add Android App

1. Click **+ New** again
2. Select **Android**
3. Enter:
   - **App name**: I Ching Android
   - **Package name**: `com.ichingapp.mobile` (from app.json)
   - **Service Account JSON**: Upload from Google Play

### Create Entitlements

1. Go to **Entitlements**
2. Click **+ New**
3. Create entitlement: `premium`
   - This represents access to premium features

### Create Products

1. Go to **Products**
2. Click **+ New**

**Product 1: Monthly Subscription**
- **Identifier**: `premium_monthly`
- **Type**: Subscription
- **Apple Product ID**: `iching_premium_monthly`
- **Google Product ID**: `iching_premium_monthly`
- **Attach to Entitlement**: `premium`

**Product 2: Credit Pack**
- **Identifier**: `credits_300`
- **Type**: Non-Consumable (iOS) / Non-Subscription (Android)
- **Apple Product ID**: `iching_credits_300`
- **Google Product ID**: `iching_credits_300`
- **Note**: This won't use entitlements, we'll track credits in Firestore

### Create Offerings (Optional but Recommended)

1. Go to **Offerings**
2. Click **+ New**
3. Create offering: `default`
4. Add packages:
   - **Package 1**: `$rc_monthly` → `premium_monthly`
   - **Package 2**: `credits_300` → `credits_300`

## 5. Get API Keys

1. In RevenueCat dashboard, go to **API Keys**
2. Copy **Public API Key** for your app(s)
3. You'll need:
   - iOS Public Key (starts with `appl_`)
   - Android Public Key (starts with `goog_`)
   - OR use the same key for both platforms

## 6. Configure Webhooks

1. In RevenueCat dashboard, go to **Integrations** → **Webhooks**
2. Click **+ Add**
3. **Webhook URL**: `https://us-central1-threecoinsapp.cloudfunctions.net/revenuecatWebhook`
   - (We'll create this Cloud Function next)
4. **Authorization Header**: Generate a secure token
   ```bash
   openssl rand -hex 32
   ```
   - Save this token, you'll need it to verify webhook requests
5. Select events:
   - ✅ Initial Purchase
   - ✅ Renewal
   - ✅ Cancellation
   - ✅ Non Renewing Purchase
   - ✅ Expiration

## 7. Add to Environment Variables

Add to `.env`:

```bash
# RevenueCat
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_xxxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=goog_xxxxxxxxxxxxx
REVENUECAT_WEBHOOK_SECRET=your_webhook_secret_from_step_6
```

## 8. Product IDs Summary

Use these IDs in your code:

```typescript
export const PRODUCTS = {
  SUBSCRIPTION: 'premium_monthly',
  CREDITS_300: 'credits_300',
} as const;

export const ENTITLEMENTS = {
  PREMIUM: 'premium',
} as const;
```

## 9. Testing

### iOS Sandbox Testing

1. In App Store Connect, create **Sandbox Testers**
2. On your iOS device:
   - Settings → App Store → Sandbox Account
   - Sign in with sandbox tester
3. Run the app and make test purchases

### Android Testing

1. In Google Play Console, add **License Testers**
2. Add your Google account email
3. Install the app via internal testing track
4. Make test purchases (they won't charge real money)

## 10. Verification Checklist

Before going live:

- [ ] Products created in App Store Connect
- [ ] Products created in Google Play Console
- [ ] Products configured in RevenueCat
- [ ] Entitlements set up
- [ ] Webhook configured with Cloud Function URL
- [ ] API keys added to `.env`
- [ ] Test subscription purchase on iOS
- [ ] Test subscription purchase on Android
- [ ] Test credit pack purchase on iOS
- [ ] Test credit pack purchase on Android
- [ ] Verify webhook fires and updates Firestore
- [ ] Test subscription renewal
- [ ] Test subscription cancellation

## Troubleshooting

### "Product not found" errors
- Ensure product IDs match exactly in App Store/Play Console and RevenueCat
- Wait 24 hours after creating products (they can take time to propagate)
- Try clearing RevenueCat cache: `Purchases.invalidateCustomerInfoCache()`

### Webhook not firing
- Check webhook URL is correct and accessible
- Verify Cloud Function is deployed
- Check RevenueCat webhook logs
- Verify authorization header matches

### Test purchases not working
- Ensure using sandbox/test account, not production
- Clear app data and reinstall
- Check RevenueCat debug logs

## Next Steps

After setup is complete:
1. Install RevenueCat SDK in the app
2. Implement paywall UI
3. Create webhook Cloud Function
4. Test purchase flow end-to-end
