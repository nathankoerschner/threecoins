import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme';

interface BackgroundTextureProps {
  children: ReactNode;
  style?: ViewStyle;
}

/**
 * Container with subtle texture overlay
 * Future enhancement: Add actual texture image overlay
 */
export const BackgroundTexture: React.FC<BackgroundTextureProps> = ({ children, style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Future: Add texture overlay image here */}
      <View style={styles.textureOverlay} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  textureOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    // Future: Add texture via background image
    // opacity: 0.05,
  },
});
