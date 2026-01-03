# Firebase Setup Guide

This guide will walk you through setting up Firebase for the I Ching app.

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Enter project name (e.g., "iching-app")
4. **Disable Google Analytics** (optional but simplifies setup)
5. Click "Create project"

## 2. Register Your App

### For iOS:
1. In Firebase Console, click the iOS icon
2. Enter iOS bundle ID: `com.ichingapp.mobile` (from app.json)
3. Download `GoogleService-Info.plist`
4. **DO NOT add the .plist file to your project** - we'll use environment variables instead

### For Android:
1. In Firebase Console, click the Android icon
2. Enter Android package name: `com.ichingapp.mobile` (from app.json)
3. Download `google-services.json`
4. **DO NOT add the .json file to your project** - we'll use environment variables instead

### For Web (Testing):
1. Click the Web icon (</>) in Firebase Console
2. Register app with a nickname (e.g., "I Ching Web")
3. Copy the config object

## 3. Get Firebase Configuration

From the Firebase Console:
1. Go to **Project Settings** (gear icon) > **General**
2. Scroll down to **Your apps**
3. Copy the configuration values

## 4. Configure Environment Variables

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Fill in the values from your Firebase config:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=AIza...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   EXPO_PUBLIC_FIREBASE_APP_ID=1:123456:web:abc123
   EXPO_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com
   ```

## 5. Enable Authentication

1. In Firebase Console, go to **Build > Authentication**
2. Click "Get started"
3. Enable **Anonymous** sign-in:
   - Click "Anonymous" provider
   - Toggle "Enable"
   - Click "Save"
4. Enable **Google** sign-in:
   - Click "Google" provider
   - Toggle "Enable"
   - Enter project support email
   - Click "Save"
5. Enable **Apple** sign-in (for iOS):
   - Click "Apple" provider
   - Toggle "Enable"
   - Click "Save"

## 6. Set Up Firestore Database

1. In Firebase Console, go to **Build > Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll add security rules later)
4. Select a location (choose closest to your users, e.g., `us-central1` for global)
5. Click "Enable"

### Add Security Rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User documents - users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Allow reading user subscription status for client-side verification
    match /users/{userId}/subscription {
      allow read: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 7. Set Up Realtime Database

1. In Firebase Console, go to **Build > Realtime Database**
2. Click "Create Database"
3. Choose same location as Firestore
4. Start in **locked mode** (we'll add rules)
5. Click "Enable"

### Add Security Rules:
```json
{
  "rules": {
    "readings": {
      "$userId": {
        "$readingId": {
          ".read": "auth != null && auth.uid == $userId",
          ".write": "auth != null && auth.uid == $userId"
        }
      }
    }
  }
}
```

## 8. Set Up Cloud Functions

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Functions in your project:
   ```bash
   firebase init functions
   ```
   - Select your Firebase project
   - Choose **TypeScript**
   - Yes to ESLint
   - Yes to install dependencies

4. This will create a `functions/` directory

## 9. Add OpenAI API Key

1. Get your OpenAI API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Add to `.env`:
   ```
   OPENAI_API_KEY=sk-...
   ```

3. Set as Firebase Functions environment variable:
   ```bash
   firebase functions:config:set openai.key="sk-..."
   ```

## 10. Deploy Cloud Functions

After implementing the Cloud Functions (next step), deploy with:
```bash
cd functions
npm run deploy
```

## 11. Configure App Check (Optional but Recommended)

1. Go to **Build > App Check** in Firebase Console
2. Click "Get started"
3. Register your app(s) with App Check
4. Enable enforcement after testing

## Verification

To verify your setup:
1. Start the Expo dev server: `npm start`
2. Open the app - it should automatically sign in anonymously
3. Check Firebase Console > Authentication - you should see an anonymous user

## Next Steps

- Implement Cloud Functions for AI interpretation
- Set up RevenueCat for payments
- Configure production security rules
- Set up monitoring and alerts
