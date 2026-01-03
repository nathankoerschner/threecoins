# Quick Start Guide - Phase 1

Get your I Ching app running with AI interpretations in ~15 minutes.

## Prerequisites

- Node.js 20+ installed
- Firebase account ([console.firebase.google.com](https://console.firebase.google.com))
- OpenAI API key ([platform.openai.com](https://platform.openai.com))
- Expo development environment set up

## Step-by-Step Setup

### 1. Create Firebase Project (5 min)

```bash
# 1. Go to https://console.firebase.google.com
# 2. Click "Create a project"
# 3. Name it (e.g., "iching-app")
# 4. Disable Google Analytics (optional)
# 5. Click "Create project"
```

### 2. Enable Firebase Services (5 min)

**Authentication:**
1. Go to Build > Authentication
2. Click "Get started"
3. Enable "Anonymous" provider
4. Enable "Google" provider (enter support email)
5. Enable "Apple" provider

**Firestore:**
1. Go to Build > Firestore Database
2. Click "Create database"
3. Start in **production mode**
4. Choose location (e.g., us-central1)
5. Click "Enable"

**Realtime Database:**
1. Go to Build > Realtime Database
2. Click "Create Database"
3. Choose same location as Firestore
4. Start in **locked mode**
5. Click "Enable"

### 3. Get Firebase Config

1. Go to Project Settings (gear icon)
2. Scroll to "Your apps"
3. Click web icon (</>)
4. Copy the config object values

### 4. Configure Environment Variables (2 min)

```bash
# In your project directory
cp .env.example .env

# Edit .env with your values:
# - EXPO_PUBLIC_FIREBASE_API_KEY
# - EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
# - EXPO_PUBLIC_FIREBASE_PROJECT_ID
# - EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
# - EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
# - EXPO_PUBLIC_FIREBASE_APP_ID
# - EXPO_PUBLIC_FIREBASE_DATABASE_URL
# - OPENAI_API_KEY
```

### 5. Add Firebase Security Rules

**Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

**Realtime Database Rules:**
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

### 6. Deploy Cloud Functions (3 min)

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Install function dependencies
cd functions
npm install

# Set OpenAI API key
firebase functions:config:set openai.key="sk-your-openai-key"

# Build and deploy
npm run build
cd ..
firebase deploy --only functions
```

### 7. Run the App

```bash
# Install dependencies (if not already done)
npm install

# Start Expo
npm start

# Press 'i' for iOS simulator
# Press 'a' for Android emulator
# Or scan QR code with Expo Go app
```

## Verify It's Working

1. **App launches** → Should auto sign-in anonymously
2. **Firebase Console > Authentication** → Should see 1 anonymous user
3. **Enter a question** in the app (optional)
4. **Cast coins** by swiping
5. **Navigate to Results** after 6 lines cast
6. **AI interpretation streams in** with typewriter effect
7. **Check Firestore** → User document created with `lastFreeReading` timestamp

## Common Issues

### "Failed to generate interpretation"
- Check Cloud Functions are deployed: `firebase functions:list`
- Check logs: `firebase functions:log`
- Verify OpenAI API key: `firebase functions:config:get`

### "User not authenticated"
- Check Anonymous sign-in is enabled in Firebase Console
- Clear app data and restart

### Streaming not working
- Verify Realtime Database rules allow user read/write
- Check `.env` has correct `EXPO_PUBLIC_FIREBASE_DATABASE_URL`

### OpenAI API errors
- Verify API key is valid at platform.openai.com
- Check you have billing set up with OpenAI
- Verify key has access to GPT-3.5-turbo model

## What's Next?

Phase 1 is complete! You now have:
- ✅ Anonymous authentication
- ✅ AI-powered interpretations
- ✅ Streaming text display
- ✅ Free daily reading system

Ready for Phase 2? See `ai-feature-spec.md` for:
- RevenueCat subscriptions
- Credit packs
- Paywall UI
- Account conversion
- Follow-up questions

## Support

For detailed documentation:
- Full setup guide: `FIREBASE_SETUP.md`
- Implementation details: `PHASE1_COMPLETE.md`
- Feature specification: `ai-feature-spec.md`

Need help? Check:
- Firebase Console > Functions > Logs
- Expo dev tools for client-side errors
- `firebase functions:log --only generateInterpretation`
