import React from 'react';
import { View, StyleSheet } from 'react-native';
import { HexagramLine } from './HexagramLine';
import { CastLine, Hexagram } from '@/types';
import { lineToBinary } from '@/utils/lineCalculator';

interface HexagramStackProps {
  // Either pass cast lines (for casting screen) or hexagram (for reading screen)
  lines?: CastLine[];
  hexagram?: Hexagram;
  animated?: boolean;
  showChangingIndicators?: boolean;
}

export const HexagramStack: React.FC<HexagramStackProps> = ({
  lines,
  hexagram,
  animated = true,
  showChangingIndicators = true,
}) => {
  // If hexagram is provided, convert to line types for display
  const displayLines = lines || (hexagram ? hexagramToLines(hexagram) : []);

  // Lines are displayed bottom-to-top (traditional I Ching order)
  // But we need to reverse the array since line 1 is at bottom
  const reversedLines = [...displayLines].reverse();

  return (
    <View style={styles.container}>
      {reversedLines.map((line, index) => {
        const actualLineNumber = displayLines.length - index; // 6, 5, 4, 3, 2, 1
        // Only animate the newest line (the one just added)
        const isNewestLine = actualLineNumber === displayLines.length;
        const shouldAnimate = animated && isNewestLine;
        // No delay - start drawing immediately when visible
        const animationDelay = 0;

        return (
          <View key={actualLineNumber} style={styles.lineWrapper}>
            <HexagramLine
              lineType={line.lineType}
              isChanging={line.isChanging}
              animated={shouldAnimate}
              delay={animationDelay}
              showChangingIndicators={showChangingIndicators}
            />
          </View>
        );
      })}
    </View>
  );
};

// Helper function to convert hexagram binary to cast lines for display
function hexagramToLines(hexagram: Hexagram): CastLine[] {
  const lines: CastLine[] = [];

  // Binary is top-to-bottom, but we want to create lines bottom-to-top
  const binaryArray = hexagram.binary.split('').reverse();

  for (let i = 0; i < 6; i++) {
    const isYang = binaryArray[i] === '1';
    const lineType = isYang ? 'young_yang' : 'young_yin';

    lines.push({
      coins: [isYang, isYang, !isYang], // Dummy coin values
      lineType,
      isChanging: false, // Static hexagrams don't have changing lines
      value: isYang ? 7 : 8,
    });
  }

  return lines;
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-end', // Lines anchor to bottom, new lines appear above
    minHeight: 288, // 6 lines × 48px (24px line + 24px spacing)
  },
  lineWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
