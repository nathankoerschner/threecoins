# I Ching App

A beautiful I Ching divination app with an interactive coin-toss casting mechanic and traditional hexagram readings.

## Features

- Interactive coin-toss casting with pull-down gesture
- Dark luxury design with gold accents
- Traditional hexagram readings with changing lines
- Firebase authentication and cloud storage
- Full offline capability with local data
- Haptic feedback and ambient sounds
- State persistence across sessions

## Tech Stack

- React Native with TypeScript
- Expo (Development Build)
- React Native Reanimated
- Firebase (Auth & Firestore)
- AsyncStorage for local persistence

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Firebase:
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration
   - See `FIREBASE_SETUP.md` for detailed instructions

3. Run the app:
   ```bash
   npm start
   npm run ios  # For iOS simulator
   ```

## Development

- `npm start` - Start Expo development server
- `npm run ios` - Run on iOS simulator
- `npm run android` - Run on Android emulator

## Documentation

- `spec.md` - Complete V1 specification
- `FIREBASE_SETUP.md` - Firebase configuration guide
- `QUICKSTART.md` - Quick start guide
- `REVENUECAT_SETUP.md` - RevenueCat integration guide

## Project Structure

```
/src
  /components   # Reusable UI components
  /context      # React Context providers
  /data         # Hexagram and trigram data
  /hooks        # Custom React hooks
  /navigation   # Navigation configuration
  /screens      # Main app screens
  /services     # Firebase and external services
  /types        # TypeScript type definitions
  /utils        # Helper functions
```

## License

Private
