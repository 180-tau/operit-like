import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '../theme';

export default function GlassCard({
  children,
  style,
  blur = 16,
  strong = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  blur?: number;
  strong?: boolean;
}) {
  return (
    <View style={[styles.shadowWrap, style]}>
      <BlurView intensity={blur} tint="light" style={styles.blur}>
        <LinearGradient
          colors={[strong ? colors.glassStrong : 'rgba(255,255,255,0.65)', 'rgba(255,255,255,0.42)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.grad}
        >
          <View style={[styles.border]}>{children}</View>
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    borderRadius: radius.card,
    ...({
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 5,
    } as object),
  },
  blur: { borderRadius: radius.card, overflow: 'hidden' },
  grad: { borderRadius: radius.card },
  border: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.glassBorder },
});