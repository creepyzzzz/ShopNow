import React, { useCallback } from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Radii, Shadows, Typography } from '@/constants/theme';

// ─────────────────────────────────────────────────────────────────────────────
// AnimatedBubble — Reanimated message bubble wrapper
// Used by the chat screen to give each message a spring entrance + press feedback.
// ─────────────────────────────────────────────────────────────────────────────

interface AnimatedBubbleProps {
  isMine: boolean;
  index: number;
  children: React.ReactNode;
  timestamp: string;
  isRead?: boolean;
  onLongPress?: () => void;
}

const SPRING_ENTER = { damping: 18, stiffness: 220, mass: 0.6 };
const SPRING_PRESS = { damping: 12, stiffness: 400 };

export default function AnimatedBubble({
  isMine,
  index,
  children,
  timestamp,
  isRead,
  onLongPress,
}: AnimatedBubbleProps) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.95, SPRING_PRESS);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_PRESS);
  }, [scale]);

  // Stagger entrance: later bubbles enter slightly delayed
  const enterDelay = Math.min(index * 30, 300);

  return (
    <Animated.View
      entering={FadeInUp.delay(enterDelay).springify().damping(18).stiffness(220).mass(0.7)}
      style={[
        styles.row,
        isMine ? styles.rowRight : styles.rowLeft,
      ]}
    >
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={onLongPress}
        delayLongPress={350}
      >
        <Animated.View
          style={[
            animStyle,
            styles.bubble,
            isMine ? styles.bubbleMine : styles.bubbleTheirs,
          ]}
        >
          {children}
          <Text style={[styles.timeText, isMine && styles.timeTextMine]}>
            {timestamp}
            {isMine && <Text>{'  '}{isRead ? '✓✓' : '✓'}</Text>}
          </Text>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginVertical: 3,
  },
  rowRight: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  rowLeft: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: Radii.bubble,
    padding: 10,
    maxWidth: '100%',
    ...Shadows.sm,
  },
  bubbleMine: {
    backgroundColor: Colors.bubbleOutgoing,
    borderBottomRightRadius: Radii.bubbleTail,
  },
  bubbleTheirs: {
    backgroundColor: Colors.bubbleIncoming,
    borderBottomLeftRadius: Radii.bubbleTail,
  },
  timeText: {
    ...Typography.caption2,
    color: 'rgba(0,0,0,0.4)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timeTextMine: {
    color: 'rgba(255,255,255,0.6)',
  },
});
