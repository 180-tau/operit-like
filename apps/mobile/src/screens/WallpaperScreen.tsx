import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import GlassCard from '../components/GlassCard';
import { colors, fonts, radius, spacing, PaletteKey, paletteOrder, palettes } from '../theme';

export default function WallpaperScreen({ onMenu }: { onMenu: () => void }) {
  const [pick, setPick] = useState<PaletteKey>('mist');
  const [saving, setSaving] = useState(false);

  const p = palettes[pick];

  const save = async () => {
    setSaving(true);
    try {
      const perm = await MediaLibrary.requestPermissionsAsync(true);
      if (!perm.granted) {
        Alert.alert('需要权限', '请在系统设置中允许访问相册，才能保存壁纸');
        setSaving(false);
        return;
      }
      Alert.alert('功能升级中', '高清壁纸渲染管线即将上线，先体验配色预览 ✨');
    } catch (e) {
      Alert.alert('保存失败', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={onMenu}>
          <Ionicons name="menu" size={24} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>壁纸工坊</Text>
          <Text style={styles.sub}>为你的屏幕调一杯治愈色</Text>
        </View>
        <View style={styles.menuBtn} />
      </View>

      <GlassCard style={styles.previewCard}>
        <View style={styles.preview}>
          <LinearGradient colors={[p.from, p.to]} style={StyleSheet.absoluteFill} />
          <View style={[styles.previewGlow, { backgroundColor: p.glow }]} />
          <View style={[styles.previewGlow2, { backgroundColor: '#ffffff' }]} />
          <Text style={styles.previewText}>{p.name}</Text>
          <Text style={styles.previewSub}>治愈系 · 极简</Text>
        </View>
      </GlassCard>

      <Text style={styles.sectionLabel}>选择配色</Text>
      <View style={styles.swatches}>
        {paletteOrder.map((k) => {
          const it = palettes[k];
          const active = k === pick;
          return (
            <TouchableOpacity key={k} style={styles.swatchWrap} onPress={() => setPick(k)}>
              <LinearGradient colors={[it.from, it.to]} style={[styles.swatch, active && styles.swatchActive]}>
                {active ? <Ionicons name="checkmark" size={18} color="#fff" /> : null}
              </LinearGradient>
              <Text style={[styles.swatchName, active && styles.swatchNameActive]}>{it.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <GlassCard style={styles.tipCard}>
        <View style={styles.tipRow}>
          <Ionicons name="sparkles-outline" size={18} color={colors.lilac} />
          <View style={styles.tipBody}>
            <Text style={styles.tipTitle}>动态壁纸（规划中）</Text>
            <Text style={styles.tipText}>后续将支持：呼吸光晕动画、跟随时间的晨昏渐变、手机上的治愈系动态壁纸。</Text>
          </View>
        </View>
      </GlassCard>

      <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={save} disabled={saving}>
        <Ionicons name="download-outline" size={19} color="#fff" />
        <Text style={styles.saveBtnText}>{saving ? '保存中…' : '保存到相册'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingTop: 64, paddingHorizontal: spacing.page, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  title: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink, fontWeight: '600', letterSpacing: 2 },
  sub: { fontSize: 12, color: colors.inkFaint, marginTop: 3 },
  previewCard: { padding: 10, marginBottom: 22 },
  preview: { height: 340, borderRadius: radius.card - 8, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  previewGlow: { position: 'absolute', width: 240, height: 240, borderRadius: 120, top: -40, right: -40, opacity: 0.6 },
  previewGlow2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, bottom: -50, left: -30, opacity: 0.35 },
  previewText: { fontFamily: fonts.serif, fontSize: 28, color: '#fff', letterSpacing: 4, fontWeight: '600' },
  previewSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 8, letterSpacing: 3 },
  sectionLabel: { fontSize: 13, color: colors.inkSoft, marginBottom: 12, letterSpacing: 1 },
  swatches: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  swatchWrap: { alignItems: 'center' },
  swatch: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchActive: { borderColor: colors.ink, borderWidth: 2.5 },
  swatchName: { fontSize: 11, color: colors.inkFaint, marginTop: 6 },
  swatchNameActive: { color: colors.ink, fontWeight: '600' },
  tipCard: { padding: 16, marginBottom: 20 },
  tipRow: { flexDirection: 'row' },
  tipBody: { flex: 1, marginLeft: 12 },
  tipTitle: { fontFamily: fonts.serif, fontSize: 15, color: colors.ink, fontWeight: '600' },
  tipText: { fontSize: 12, color: colors.inkSoft, marginTop: 5, lineHeight: 18 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.sage,
    borderRadius: radius.pill,
    paddingVertical: 16,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
});