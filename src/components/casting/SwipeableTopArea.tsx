import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  withTiming,
  runOnJS,
  Easing,
  SharedValue,
} from 'react-native-reanimated';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 50; // Pixels to swipe before triggering

interface SwipeableTopAreaProps {
  children: React.ReactNode;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isDisabled?: boolean;
  currentTranslateX: SharedValue<number>; // Controlled externally
}

export const SwipeableTopArea: React.FC<SwipeableTopAreaProps> = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  isDisabled = false,
  currentTranslateX,
}) => {
  const startTranslateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .enabled(!isDisabled)
    .onStart(() => {
      startTranslateX.value = currentTranslateX.value;
    })
    .onUpdate((event) => {
      // Apply gesture delta to current position, clamped to valid range
      const newTranslateX = startTranslateX.value + event.translationX;
      // Clamp to valid positions (0 to -screenWidth, no overscroll)
      currentTranslateX.value = Math.max(-SCREEN_WIDTH, Math.min(0, newTranslateX));
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const translation = event.translationX;

      // Determine the current screen based on start position (snap to nearest valid position)
      const currentScreen = startTranslateX.value < -SCREEN_WIDTH / 2 ? -SCREEN_WIDTH : 0;

      // Determine which screen to snap to
      let targetX = currentScreen;

      // Check if swipe threshold met
      if (translation < -SWIPE_THRESHOLD || velocity < -500) {
        // Swiped left with sufficient distance or velocity
        targetX = -SCREEN_WIDTH;
        if (currentScreen !== -SCREEN_WIDTH) {
          runOnJS(onSwipeRight)(); // Swipe left shows right screen (hexagram)
        }
      } else if (translation > SWIPE_THRESHOLD || velocity > 500) {
        // Swiped right with sufficient distance or velocity
        targetX = 0;
        if (currentScreen !== 0) {
          runOnJS(onSwipeLeft)();
        }
      }
      // If neither threshold met, targetX stays at currentScreen (already snapped to valid position)

      // Animate to target position
      currentTranslateX.value = withTiming(targetX, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        {children}
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
