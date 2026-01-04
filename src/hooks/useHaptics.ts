import { useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export type HapticFeedbackType =
  | 'throw'           // When coins are thrown
  | 'coinLand'        // When a coin lands
  | 'lineComplete'    // When a line is completed
  | 'castingComplete' // When all 6 lines are done
  | 'buttonPress';    // Generic button press

export const useHaptics = () => {
  // Track pending haptic timeouts so they can be cancelled
  const pendingTimeouts = useRef<NodeJS.Timeout[]>([]);

  const clearPendingHaptics = useCallback(() => {
    pendingTimeouts.current.forEach((timeout) => clearTimeout(timeout));
    pendingTimeouts.current = [];
  }, []);

  const triggerHaptic = async (type: HapticFeedbackType) => {
    try {
      switch (type) {
        case 'throw':
          // Medium impact for coin throw
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;

        case 'coinLand':
          // Light impact for coin landing
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;

        case 'lineComplete':
          // Notification success for completing a line
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;

        case 'castingComplete':
          // Strong notification for completing all lines
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Double tap for emphasis
          setTimeout(async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }, 150);
          break;

        case 'buttonPress':
          // Selection feedback for button presses
          await Haptics.selectionAsync();
          break;

        default:
          break;
      }
    } catch (error) {
      // Haptics might not be available on all devices/simulators
      // Fail silently
      console.log('Haptic feedback not available:', error);
    }
  };

  const triggerStaggeredCoinLandings = useCallback((count: number = 3, delay: number = 150) => {
    // Trigger haptics for multiple coins landing with stagger
    for (let i = 0; i < count; i++) {
      const timeout = setTimeout(() => {
        triggerHaptic('coinLand');
      }, i * delay);
      pendingTimeouts.current.push(timeout);
    }
  }, []);

  return {
    triggerHaptic,
    triggerStaggeredCoinLandings,
    clearPendingHaptics,
  };
};
