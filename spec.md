# I Ching Mobile App - V1 Specification

## Overview
A beautiful I Ching divination app with award-winning dark design, featuring an interactive coin-toss casting mechanic and traditional hexagram readings.

## Tech Stack
- **Framework**: React Native with TypeScript
- **Build System**: Expo (Development Build for full native access)
- **Animation**: React Native Reanimated
- **State Management**: React Context
- **Persistence**: AsyncStorage
- **Target Platform**: iOS first (Xcode simulator development)

---

## Design Language

### Visual Theme
- **Style**: Dark theme with modern luxury aesthetic
- **Primary Accent**: Gold/amber tones
- **Background**: Dark with subtle texture overlay (paper or fabric)
- **Typography**: Clean, modern fonts

### Hexagram Lines
- **Style**: Clean geometric (sharp edges, minimal, modern)
- **Changing Lines**: Subtle glow/pulse animation to distinguish from stable lines
- **Line Reveal**: Draw-in animation (lines animate drawing from one side to other)

### Coins
- **Design**: Traditional Chinese coins (round with square hole, ancient characters)
- **Rendering**: Stylized to match app aesthetic

---

## Core Screens

### 1. Casting Screen (Main)
The primary interaction screen where users cast their hexagram.

#### Pull-to-Cast Mechanic
- **Gesture**: Pull-down gesture similar to pull-to-refresh
- **Threshold**: ~150px drag distance before throw is "armed"
- **Release**: Upon release, coins flip and tumble with physics-based animation

#### Coin Animation
- **Physics**: Staggered landing times (each coin has slight variance in flip speed)
- **Independence**: Coins flip independently, not in perfect unison

#### Probability
- **Model**: Fair coin simulation (50/50 for each coin)
- **Outcome**: Standard three-coin method determining line type

#### Hexagram Building
- **Order**: Bottom-to-top (traditional I Ching order, line 1 at bottom)
- **Display**: Accumulating view - all cast lines remain visible as user progresses
- **Progress**: Six total throws to complete hexagram

#### Queue Behavior
- **Multiple Pulls**: Throws queue sequentially if user pulls rapidly
- **Animation Speed**: Queued throws animate at faster speed
- **During Animation**: Additional pulls are accepted and queued

#### Feedback
- **Haptics**:
  - Feedback on pull (resistance feel)
  - Feedback on release (throw initiated)
  - Feedback on each coin landing
- **Sound**: Subtle ambient tones on key moments (not literal coin sounds)

### 2. Reading Screen
Displays the hexagram result after all six lines are cast.

#### Layout
- **Hexagram Display**: Side-by-side layout for primary and transformed hexagrams
- **Arrow/Indicator**: Visual connection showing transformation direction
- **No Changing Lines**: When hexagrams are identical (no changing lines), show single hexagram only with note about stability

#### Hexagram Information (V1)
- Hexagram number (1-64)
- Chinese name (pinyin)
- English translation/name
- Visual hexagram representation

#### Analysis Section
- Skipped for V1 (text content to be added later)

#### Navigation
- **Dismiss**: Swipe down/away gesture returns to casting screen
- **Transition In**: Slide-up animation from casting completion

---

## User Experience Details

### First Launch
- **Onboarding**: Visual hint only - subtle animation demonstrating pull gesture
- **No Tutorial**: No step-by-step walkthrough

### State Persistence
- **Mid-Casting Save**: Partial casting progress saved automatically
- **Resume**: App resumes casting where user left off after close/background

### Reading History
- Not included in V1

### Settings
- No settings screen in V1 (pure single-flow experience)

### Question Input
- None - users hold question in mind (no text input field)

---

## Technical Architecture

### Project Structure
```
/src
  /components
    /coins         # Coin components and animations
    /hexagram      # Hexagram display components
    /casting       # Casting screen components
    /reading       # Reading screen components
  /context
    CastingContext.tsx    # Casting state management
  /hooks
    useCasting.ts         # Casting logic hook
    useHaptics.ts         # Haptic feedback hook
    useAnimations.ts      # Reanimated animation hooks
  /data
    hexagrams.ts          # All 64 hexagram definitions
    trigrams.ts           # 8 trigram definitions
  /utils
    coinToss.ts           # Random coin logic
    hexagramCalculator.ts # Line to hexagram conversion
  /screens
    CastingScreen.tsx
    ReadingScreen.tsx
  /types
    index.ts              # TypeScript type definitions
```

### Data Models

```typescript
type LineType = 'old_yin' | 'young_yang' | 'young_yin' | 'old_yang';

interface CastLine {
  coins: [boolean, boolean, boolean]; // true = heads (yang side)
  lineType: LineType;
  isChanging: boolean;
}

interface CastingState {
  lines: CastLine[];       // 0-6 lines, bottom to top
  isComplete: boolean;
  queuedThrows: number;
}

interface Hexagram {
  number: number;          // 1-64
  chineseName: string;     // Pinyin
  englishName: string;     // Translation
  binary: string;          // 6-digit binary representation
  upperTrigram: number;    // 1-8
  lowerTrigram: number;    // 1-8
}

interface Reading {
  primary: Hexagram;
  transformed: Hexagram | null;  // null if no changing lines
  changingLines: number[];       // line positions (1-6) that are changing
}
```

### Coin Toss Logic
```typescript
// Fair coin: 50/50 probability
const tossCoin = (): boolean => Math.random() >= 0.5;

// Three coins determine line type
// Heads (yang) = 3, Tails (yin) = 2
// Sum: 6 = old yin (changing), 7 = young yang, 8 = young yin, 9 = old yang (changing)
const calculateLineType = (coins: [boolean, boolean, boolean]): LineType => {
  const sum = coins.reduce((acc, isHeads) => acc + (isHeads ? 3 : 2), 0);
  switch (sum) {
    case 6: return 'old_yin';      // changing yin
    case 7: return 'young_yang';   // stable yang
    case 8: return 'young_yin';    // stable yin
    case 9: return 'old_yang';     // changing yang
  }
};
```

### Animation Specifications

#### Coin Flip
- Duration: ~1.5s per coin (staggered by ~100-200ms)
- Rotation: Multiple 360° rotations with easing
- Bounce: Slight bounce on landing
- Queued throws: ~0.8s duration (faster)

#### Line Draw-in
- Duration: ~400ms
- Easing: ease-out
- Direction: Left to right

#### Screen Transitions
- Casting → Reading: Slide up, ~300ms, ease-in-out
- Reading → Casting: Slide down (swipe dismiss)

---

## Offline Capability
- **Fully Offline**: All hexagram data bundled with app
- **No Network Required**: App functions completely without connectivity

---

## V1 Scope Summary

### Included
- Coin-toss casting mechanic with pull gesture
- Full haptic feedback suite
- Staggered coin physics animation
- Six-line hexagram building (bottom-to-top, accumulating view)
- Changing line visual indication (subtle glow/pulse)
- Reading page with side-by-side hexagram display
- Hexagram number, Chinese name, and English name
- Swipe-to-dismiss navigation
- Casting state persistence
- Subtle ambient sounds
- Visual onboarding hint
- Queue system for rapid throws
- Traditional Chinese coin design
- Dark theme with gold accents and subtle texture

### Excluded (Future Versions)
- Reading history/saved readings
- Hexagram text interpretations and verdicts
- Settings screen
- Question/intention input field
- Android optimization

---

## Development Environment
- **Machine**: macOS with Xcode simulator
- **Expo**: Development build (not Expo Go)
- **Testing**: iOS Simulator via Xcode
