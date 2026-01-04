import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme';
import { StarfieldBackground } from './StarfieldBackground';

interface BackgroundTextureProps {
  children: ReactNode;
  style?: ViewStyle;
  showStarfield?: boolean;
}

/**
 * Container with starfield background
 */
export const BackgroundTexture: React.FC<BackgroundTextureProps> = ({
  children,
  style,
  showStarfield = true,
}) => {
  return (
    <View style={[styles.container, style]}>
      {showStarfield && (
        <StarfieldBackground
          starCount={80}
          showGoldStars
          distributionVariance={0.75}
          maxCellOverflow={0.5}
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});
