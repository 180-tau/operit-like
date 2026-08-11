import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { C } from '../theme';

const { width, height } = Dimensions.get('window');

export default function GlowBg() {
  return (
    <View style={styles.root} pointerEvents="none">
      <LinearGradient colors={[C.bgWarm, C.bg, C.bgDeep]} style={StyleSheet.absoluteFill} />
      <View style={[styles.halo, { top: -height * 0.12, left: -width * 0.25, width: width * 0.75, height: width * 0.75 }]}>
        <LinearGradient colors={[C.haloBlue, 'transparent']} style={StyleSheet.absoluteFill} />
      </View>
      <View style={[styles.halo, { top: height * 0.32, right: -width * 0.28, width: width * 0.8, height: width * 0.8 }]}>
        <LinearGradient colors={[C.haloPink, 'transparent']} style={StyleSheet.absoluteFill} />
      </View>
      <View style={[styles.halo, { bottom: -height * 0.1, left: width * 0.15, width: width * 0.7, height: width * 0.7 }]}>
        <LinearGradient colors={[C.haloGreen, 'transparent']} style={StyleSheet.absoluteFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  halo: { position: 'absolute', borderRadius: 999, opacity: 0.9 },
});