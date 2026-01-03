# I Ching App - AI Feature Specification

## Overview

Enable the I Ching app with AI-powered interpretations. The Results screen will take the user's question and hexagrams, feed that context into an AI model, and generate a personalized reading/verdict.

---

## Core Features

### AI Interpretation Engine

- **Model**: GPT-3.5 (or equivalent cost-efficient model)
- **Response Length**: Medium (300-500 words)
- **Streaming**: Typewriter effect - text streams word-by-word as it generates
- **Context Sent to AI**: Question + hexagram names only (minimal tokens, relies on model's training knowledge)

### Interpretation Style

- **Tone**: Modern/accessible - plain language with relatable examples, approachable for newcomers
- **Structure**: Format-strict with explicit output sections:
  - Overview of the hexagram meaning
  - Interpretation of changing lines
  - Practical suggestions
  - Summary
- **Hexagram Handling**: Interpret both primary and relating hexagrams
  - Primary = current situation
  - Relating = where things are heading
- **Personalization**: Blend approach - general hexagram meaning first, then specific application to user's question
- **Advice Style**: Include gentle suggestions ("consider...", "you might...")

### Question Handling

- **No Question Required**: If user casts without a question, generate a general life reading without question context
- **Content Moderation**: AI pre-check on questions before main interpretation call (prevents inappropriate content, adds cost but improves safety)
- **Follow-up Questions**: Supported - each follow-up costs 1 credit
  - Full conversation context maintained (includes prior Q&A)
  - Token costs compound with conversation length

---

## Monetization

### Free Tier

- **Quota**: 1 free reading per day
- **Reset Logic**: Rolling 24 hours from last free cast (not calendar day)
- **Paywall UX**:
  - Allow casting but show generic "subscribe to unlock" message
  - No teaser/blurred content - clear paywall UI with benefits listed
  - Show countdown to next free reading

### Subscription Tier

- **Price**: $9.99/month
- **Included Readings**: 1,000 readings per month
- **Provider**: RevenueCat (in-app purchases via App Store/Play Store)

### Credit Packs

- **Single Tier**: 300 credits for $10
- **Use Case**: For users who exceed subscription quota or prefer pay-as-you-go

### Credit Deduction

- 1 credit = 1 AI interpretation
- 1 credit = 1 follow-up question
- Credits never expire

---

## Technical Architecture

### Backend: Firebase (Full Stack on Google Cloud)

- **Firebase Auth**: Anonymous authentication with conversion to permanent account
- **Firestore**: User data, credit balances, usage tracking
- **Cloud Functions**: AI API calls, webhook handlers
- **Regions**: Global deployment for optimal latency worldwide

### AI Streaming Implementation

**Recommended Approach**: Firebase Realtime Database for streaming

1. Client initiates reading request to Cloud Function
2. Cloud Function calls OpenAI API with streaming enabled
3. Cloud Function writes chunks to Firebase Realtime DB path: `readings/{userId}/{readingId}/content`
4. Client subscribes to that path, renders text as it arrives
5. On completion, function updates Firestore with final reading metadata

This approach provides:
- Native Firebase integration
- Reliable real-time updates in React Native
- No polyfill requirements
- Built-in reconnection handling

### Authentication Flow

1. User opens app → Firebase creates anonymous account automatically
2. User can cast and get free daily reading
3. When user hits paywall (wants to purchase), prompt account conversion
4. Offer Apple Sign-In and Google Sign-In options
5. Anonymous account data merges into permanent account

### Purchase Sync (RevenueCat ↔ Firebase)

**Dual approach for reliability:**

1. **Webhook (Source of Truth)**:
   - RevenueCat sends webhook to Cloud Function on purchase/renewal/cancellation
   - Cloud Function updates Firestore: `users/{userId}/subscription` and `users/{userId}/credits`

2. **Client-side (Immediate UX)**:
   - App checks RevenueCat SDK after purchase
   - Optimistically updates local state
   - Firestore sync confirms within seconds

### Database Schema (Firestore)

```
users/{userId}
├── createdAt: timestamp
├── lastFreeReading: timestamp (for 24h rolling check)
├── credits: number
├── subscription: {
│     status: 'active' | 'expired' | 'none',
│     expiresAt: timestamp,
│     monthlyReadingsUsed: number,
│     monthlyResetAt: timestamp
│   }
└── analytics: {
      totalCasts: number,
      paidConversions: number
    }
```

---

## Error Handling

### AI API Failures

- **Strategy**: Silent retry (2-3 attempts before showing error)
- **User Communication**: Only show error after retries exhausted
- **Credit Protection**: No credit deducted if AI call ultimately fails

### Offline Handling

- **Behavior**: Block completely - cannot cast without internet
- **Messaging**: Clear notification that connection required, confirm no credits spent
- **No Queue**: Don't queue requests for later (avoid confusion)

---

## Analytics (Firebase Analytics + Custom Events)

### Standard Tracking
- Screen views
- Purchase events
- User properties (subscription status, total casts)

### Custom Events

```
cast_initiated
├── has_question: boolean
├── user_type: 'free' | 'subscriber' | 'credit_holder'

cast_completed
├── hexagram_primary: number (1-64)
├── hexagram_relating: number (1-64)
├── changing_lines: array

interpretation_viewed
├── duration_seconds: number
├── scrolled_to_bottom: boolean

follow_up_asked
├── question_number: number (1, 2, 3...)
├── conversation_length: number

paywall_shown
├── trigger: 'daily_limit' | 'follow_up' | 'other'
├── credits_remaining: number

purchase_initiated
├── product_type: 'subscription' | 'credit_pack'
├── source_screen: string

purchase_completed
├── product_id: string
├── revenue: number
```

### Funnel Tracking

1. App Open → Cast Screen
2. Cast Screen → Cast Initiated
3. Cast Initiated → Cast Completed
4. Cast Completed → Interpretation Viewed (Full)
5. Interpretation Viewed → Follow-up Asked (optional)
6. Paywall Shown → Purchase Initiated
7. Purchase Initiated → Purchase Completed

---

## UI/UX Specifications

### Results Screen Flow

1. **Cast Complete**: Hexagram animation finishes
2. **Hexagram Display**: Show hexagram name, image, changing lines immediately
3. **AI Streaming**: Below hexagram, text streams in with typewriter effect
4. **Completion**: "Ask Follow-up" button appears when streaming finishes

### Paywall Screen

- **Trigger**: After free daily reading used
- **Content**:
  - Clear "Your free reading unlocks in X hours" countdown
  - Subscription benefits list
  - "$9.99/month - 1,000 readings" CTA
  - "300 credits for $10" secondary option
  - Link to restore purchases

### Share Feature

- **Type**: Share as branded image
- **Image Contents**:
  - Hexagram symbol/visualization
  - Hexagram name
  - 1-2 sentence highlight excerpt from interpretation
  - App branding/logo
  - Decorative I Ching themed elements
- **Implementation**: Use react-native-view-shot or similar to capture component as image

---

## System Prompt Template

```
You are a modern I Ching interpreter who makes ancient wisdom accessible to everyone.
Your tone is warm, insightful, and practical—never mystical or overly formal.

Structure your response in these sections:
1. **Overview**: Brief explanation of the hexagram's core meaning (2-3 sentences)
2. **Current Situation** (Primary Hexagram): What the querent is experiencing now
3. **The Transformation** (if changing lines exist): What the changing lines reveal
4. **Where Things Are Heading** (Relating Hexagram): The likely evolution of the situation
5. **Practical Guidance**: 2-3 gentle, actionable suggestions
6. **Summary**: One sentence capturing the essential message

Guidelines:
- Use everyday language, avoid jargon
- Give concrete examples when helpful
- Frame advice as suggestions, not commands
- If a question was asked, weave it naturally into your interpretation
- If no question was provided, offer a general life reading
- Keep total response between 300-500 words
```

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Set up Firebase project (Auth, Firestore, Functions)
- [ ] Implement anonymous auth flow
- [ ] Create basic Cloud Function for OpenAI calls
- [ ] Build Results screen with streaming display

### Phase 2: Monetization
- [ ] Integrate RevenueCat SDK
- [ ] Set up subscription and credit pack products
- [ ] Implement webhook handlers
- [ ] Build paywall screen
- [ ] Add credit deduction logic

### Phase 3: Polish
- [ ] Implement follow-up questions
- [ ] Add AI moderation pre-check
- [ ] Build share-as-image feature
- [ ] Set up analytics events and funnels
- [ ] Account conversion flow (anonymous → permanent)

### Phase 4: Launch Prep
- [ ] Global Cloud Functions deployment
- [ ] Load testing
- [ ] App Store / Play Store submission prep
- [ ] RevenueCat production configuration

---

## Open Questions / Future Considerations

1. **Interpretation Caching**: Should identical hexagram combinations share cached interpretations to reduce costs?
2. **Premium Models**: Offer GPT-4 interpretations for premium users at higher credit cost?
3. **Reading History**: Currently spec'd as no history - reconsider post-launch based on user feedback?
4. **Localization**: AI interpretations in multiple languages?
