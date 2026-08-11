import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { C, R } from '../theme';

interface Props {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  intense?: boolean;
}

export default function GlassCard({ style, children, intense }: Props) {
  return (
    <BlurView intensity={intense ? 60 : 36} tint="light" style={[styles.card, style]}>
      <View style={styles.inner}>{children}</View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.glassBorder,
    overflow: 'hidden',
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
  },
  inner: { padding: 16 },
});