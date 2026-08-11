import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, PaletteKey, palettes } from '../theme';

export default function AuroraBackground({ accent = 'mist' as PaletteKey, children }: { accent?: PaletteKey; children: React.ReactNode }) {
  const p = palettes[accent];
  return (
    <View style={styles.root}>
      <LinearGradient colors={[colors.bg, p.to, colors.bgDeep]} style={StyleSheet.absoluteFill} />
      <View style={[styles.glow, styles.glowA, { backgroundColor: p.glow }]} />
      <View style={[styles.glow, styles.glowB, { backgroundColor: p.from }]} />
      <View style={[styles.glow, styles.glowC, { backgroundColor: colors.blush }]} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  glow: { position: 'absolute', borderRadius: 999, opacity: 0.55 },
  glowA: { width: 260, height: 260, top: -70, right: -80 },
  glowB: { width: 220, height: 220, top: '38%', left: -90 },
  glowC: { width: 180, height: 180, bottom: -40, right: 30, opacity: 0.4 },
  content: { flex: 1 },
});