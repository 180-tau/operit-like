import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Modal } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius } from '../theme';

export type DrawerItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
};

export default function Drawer({
  visible,
  username,
  items,
  active,
  onClose,
  onSelect,
  onLogout,
}: {
  visible: boolean;
  username: string;
  items: DrawerItem[];
  active: string;
  onClose: () => void;
  onSelect: (key: string) => void;
  onLogout: () => void;
}) {
  const { width } = Dimensions.get('window');
  const drawerW = Math.min(width * 0.78, 320);
  const anim = useRef(new Animated.Value(-drawerW)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 0 : -drawerW,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [visible, drawerW, anim]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <BlurView intensity={8} tint="light" style={StyleSheet.absoluteFill} />
        </TouchableOpacity>
        <Animated.View style={[styles.panel, { width: drawerW, transform: [{ translateX: anim }] }]}>
          <BlurView intensity={42} tint="light" style={styles.blur}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Ionicons name="sparkles" size={22} color="#fff" />
              </View>
              <Text style={styles.name}>{username || '旅人'}</Text>
              <Text style={styles.sub}>Operit-like · 治愈空间</Text>
            </View>

            <View style={styles.menu}>
              {items.map((it) => {
                const isActive = it.key === active;
                return (
                  <TouchableOpacity
                    key={it.key}
                    style={[styles.item, isActive && styles.itemActive]}
                    onPress={() => {
                      onSelect(it.key);
                      onClose();
                    }}
                  >
                    <Ionicons name={it.icon} size={20} color={isActive ? '#fff' : colors.inkSoft} />
                    <Text style={[styles.itemText, isActive && styles.itemTextActive]}>{it.label}</Text>
                    {isActive ? <View style={styles.dot} /> : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.logout} onPress={onLogout}>
              <Ionicons name="log-out-outline" size={19} color={colors.inkFaint} />
              <Text style={styles.logoutText}>退出登录</Text>
            </TouchableOpacity>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  overlay: { flex: 1 },
  panel: { height: '100%', overflow: 'hidden', borderTopRightRadius: 32, borderBottomRightRadius: 32 },
  blur: {
    flex: 1,
    paddingTop: 70,
    paddingHorizontal: 22,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.8)',
  },
  header: { marginBottom: 34, alignItems: 'center' },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lilac,
    marginBottom: 12,
    ...({
      shadowColor: colors.lilac,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 6,
    } as object),
  },
  name: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink, fontWeight: '600' },
  sub: { fontSize: 12, color: colors.inkFaint, marginTop: 4 },
  menu: { flex: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    marginBottom: 8,
  },
  itemActive: { backgroundColor: colors.mist },
  itemText: { marginLeft: 14, fontSize: 15, color: colors.inkSoft },
  itemTextActive: { color: '#fff', fontWeight: '600' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', marginLeft: 'auto' },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 30,
    borderTopWidth: 1,
    borderTopColor: 'rgba(160,154,154,0.2)',
  },
  logoutText: { marginLeft: 8, fontSize: 14, color: colors.inkFaint },
});