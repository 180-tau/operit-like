import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { C, F, R, SP } from '../theme';

interface Props {
  onBack: () => void;
}

const { width } = Dimensions.get('window');
const PREVIEW_H = width * 1.6;

const PALETTES: { key: string; name: string; colors: [string, string, string]; accent: string; quote: string }[] = [
  { key: 'mist', name: '雾蓝晨光', colors: ['#EAF2F5', '#D3E4EA', '#B9D3DC'], accent: '#8FAFBE', quote: '清晨的雾，慢慢散开' },
  { key: 'blossom', name: '樱粉午后', colors: ['#F9EFF0', '#F2DEE0', '#E8CDD0'], accent: '#D9ACB2', quote: '花瓣落下的声音' },
  { key: 'sage', name: '鼠尾草', colors: ['#EEF3EC', '#DDE7DA', '#C9D8C4'], accent: '#A3B89D', quote: '风从林间穿过' },
  { key: 'sand', name: '暖沙', colors: ['#F7F1E6', '#EFE3CF', '#E2D0B4'], accent: '#C9AE85', quote: '光落在窗台上' },
  { key: 'lavender', name: '暮紫', colors: ['#F2F0F7', '#E4E0EF', '#D3CCE3'], accent: '#B3A7CE', quote: '黄昏时的梦' },
];

export default function WallpaperScreen({ onBack }: Props) {
  const [palette, setPalette] = useState(PALETTES[0]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const previewRef = useRef<View>(null);

  const save = async () => {
    try {
      setSaving(true);
      setSaved(false);
      const uri = await captureRef(previewRef, { format: 'png', quality: 1 });
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('需要相册权限', '请在系统设置中允许 Operit 保存壁纸到相册');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(uri);
      setSaved(true);
      Alert.alert('已保存', '壁纸已保存到相册，可在系统设置中设为桌面壁纸');
    } catch (e) {
      Alert.alert('保存失败', (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>壁纸工坊</Text>
        <TouchableOpacity style={{ width: 38 }} />
      </View>

      <View ref={previewRef} collapsable={false} style={[styles.preview, { backgroundColor: palette.colors[0] }]}>
        <LinearGradient colors={palette.colors} style={StyleSheet.absoluteFill} />
        <View style={[styles.halo, { top: -60, left: -50, backgroundColor: palette.accent, opacity: 0.35 }]} />
        <View style={[styles.halo, { bottom: -80, right: -40, backgroundColor: '#FFFFFF', opacity: 0.4 }]} />
        <View style={styles.quoteBox}>
          <Text style={[styles.quote, { color: palette.accent }]}>{palette.quote}</Text>
          <Text style={[styles.watermark, { color: palette.accent }]}>Operit · 治愈系</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>选择配色</Text>
      <View style={styles.paletteRow}>
        {PALETTES.map((p) => (
          <TouchableOpacity key={p.key} style={[styles.swatch, palette.key === p.key && styles.swatchActive]} onPress={() => { setPalette(p); setSaved(false); }}>
            <LinearGradient colors={p.colors.slice(0, 2) as [string, string]} style={styles.swatchInner} />
            <Text style={[styles.swatchName, palette.key === p.key && { color: C.text, fontWeight: '700' }]}>{p.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: palette.accent }, saved && styles.saveBtnDone]} onPress={save} disabled={saving}>
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name={saved ? 'checkmark-circle' : 'download'} size={20} color="#fff" />
            <Text style={styles.saveBtnText}>{saved ? '已保存到相册' : '保存到相册'}</Text>
          </>
        )}
      </TouchableOpacity>
      <Text style={styles.tip}>保存后可在系统设置 → 壁纸中设为桌面壁纸（动态壁纸开发中）</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: SP.page },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: R.pill,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.glassBorder,
    marginRight: 10,
  },
  pageTitle: { flex: 1, fontFamily: F.serif, fontSize: 22, fontWeight: '700', color: C.text },
  preview: {
    width: '100%',
    height: PREVIEW_H,
    borderRadius: R.lg,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 4,
  },
  halo: { position: 'absolute', width: 200, height: 200, borderRadius: 999 },
  quoteBox: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  quote: { fontFamily: F.serif, fontSize: 24, fontWeight: '600', textAlign: 'center', lineHeight: 34 },
  watermark: { fontSize: F.small, marginTop: 14, opacity: 0.7 },
  sectionTitle: { color: C.textSub, fontSize: F.sub, fontWeight: '600', marginBottom: 10 },
  paletteRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  swatch: { alignItems: 'center', width: '18%' },
  swatchInner: { width: 52, height: 52, borderRadius: R.pill, borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)' },
  swatchActive: { transform: [{ scale: 1.08 }] },
  swatchName: { fontSize: 10, color: C.textSub, marginTop: 6 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: R.pill,
    padding: 15,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 2,
  },
  saveBtnDone: { opacity: 0.8 },
  saveBtnText: { color: '#fff', fontWeight: '600', marginLeft: 8 },
  tip: { color: C.textFaint, fontSize: F.small, textAlign: 'center', marginTop: 12 },
});