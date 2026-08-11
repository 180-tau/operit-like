import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { C, F, R, SP } from '../theme';

const { width } = Dimensions.get('window');
const DRAWER_W = width * 0.72;

export type Route = 'home' | 'characters' | 'wallpaper';

interface Props {
  visible: boolean;
  route: Route;
  username: string;
  onClose: () => void;
  onNavigate: (r: Route) => void;
  onLogout: () => void;
}

const MENU: { key: Route; icon: keyof typeof Ionicons.glyphMap; label: string; color: string }[] = [
  { key: 'home', icon: 'chatbubbles-outline', label: '会话', color: C.blue },
  { key: 'characters', icon: 'heart-outline', label: '角色卡', color: C.pink },
  { key: 'wallpaper', icon: 'image-outline', label: '壁纸工坊', color: C.green },
];

export default function Drawer({ visible, route, username, onClose, onNavigate, onLogout }: Props) {
  const tx = useRef(new Animated.Value(-DRAWER_W)).current;
  const mask = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(tx, { toValue: visible ? 0 : -DRAWER_W, useNativeDriver: true, damping: 22, stiffness: 200 }),
      Animated.timing(mask, { toValue: visible ? 1 : 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [visible, tx, mask]);

  return (
    <>
      <Animated.View pointerEvents={visible ? 'auto' : 'none'} style={[styles.mask, { opacity: mask }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      <Animated.View style={[styles.drawer, { transform: [{ translateX: tx }] }]}>
        <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.brand}>
          <View style={styles.brandIcon}>
            <Ionicons name="sparkles" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.brandName}>Operit</Text>
            <Text style={styles.brandSub}>{username || '治愈系 AI 伙伴'}</Text>
          </View>
        </View>

        <View style={styles.menu}>
          {MENU.map((m) => {
            const active = route === m.key;
            return (
              <TouchableOpacity key={m.key} style={[styles.menuItem, active && styles.menuItemActive]} onPress={() => { onNavigate(m.key); onClose(); }}>
                <View style={[styles.menuIcon, { backgroundColor: active ? m.color : 'transparent' }]}>
                  <Ionicons name={m.icon} size={20} color={active ? '#fff' : m.color} />
                </View>
                <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>{m.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.logout} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={18} color={C.textSub} />
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  mask: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(74,68,64,0.25)' },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_W,
    paddingHorizontal: SP.page,
    paddingTop: 76,
    paddingBottom: 32,
    overflow: 'hidden',
    borderTopRightRadius: R.lg,
    borderBottomRightRadius: R.lg,
    shadowColor: C.shadow,
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  brand: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  brandIcon: {
    width: 46,
    height: 46,
    borderRadius: R.pill,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 3,
  },
  brandName: { fontFamily: F.serif, fontSize: 24, fontWeight: '700', color: C.text },
  brandSub: { fontSize: F.small, color: C.textSub, marginTop: 2 },
  menu: { flex: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderRadius: R.md, marginBottom: 6 },
  menuItemActive: { backgroundColor: 'rgba(255,255,255,0.6)' },
  menuIcon: { width: 38, height: 38, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuLabel: { fontSize: F.sub, color: C.text, fontWeight: '500' },
  menuLabelActive: { fontWeight: '700' },
  footer: { borderTopWidth: 1, borderTopColor: C.glassBorderSoft, paddingTop: 12 },
  logout: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  logoutText: { color: C.textSub, fontSize: F.sub, marginLeft: 8 },
});