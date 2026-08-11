import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store';
import { Character } from '../api';
import GlassCard from '../components/GlassCard';
import { colors, fonts, radius, spacing } from '../theme';

interface Props {
  onOpenChat: (cid: string, char: Character | null) => void;
  onMenu: () => void;
}

export default function ConversationsScreen({ onOpenChat, onMenu }: Props) {
  const { conversations, characters, setActive, createConv, refreshCharacters, username } = useApp();
  const [title, setTitle] = useState('新对话');
  const [charId, setCharId] = useState('');

  const newChat = async () => {
    try {
      await createConv(title || '新对话', charId || undefined);
      setTitle('新对话');
      setCharId('');
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={onMenu}>
          <Ionicons name="menu" size={24} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>会话</Text>
          <Text style={styles.sub}>午后的一杯茶 · {username}</Text>
        </View>
        <TouchableOpacity style={styles.menuBtn} onPress={() => refreshCharacters()}>
          <Ionicons name="refresh" size={20} color={colors.inkFaint} />
        </TouchableOpacity>
      </View>

      <GlassCard strong style={styles.newCard}>
        <Text style={styles.sectionLabel}>开始一段新的对话</Text>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="给它起个名字" placeholderTextColor={colors.inkFaint} />
        <View style={styles.charRow}>
          <Ionicons name="heart-outline" size={16} color={colors.blush} />
          <TextInput style={[styles.input, { flex: 1, marginLeft: 8 }]} value={charId} onChangeText={setCharId} placeholder="绑定角色 ID（可选）" placeholderTextColor={colors.inkFaint} />
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={newChat}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newBtnText}>新建会话</Text>
        </TouchableOpacity>
      </GlassCard>

      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const ch = characters.find((c) => c.id === item.characterCardId);
          return (
            <GlassCard style={styles.itemCard}>
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  setActive(item.id, ch ?? null);
                  onOpenChat(item.id, ch ?? null);
                }}
              >
                <View style={[styles.avatar, { backgroundColor: item.characterCardId ? colors.blush : colors.mist }]}>
                  <Ionicons name={item.characterCardId ? 'heart' : 'chatbubble-ellipses'} size={18} color="#fff" />
                </View>
                <View style={styles.itemBody}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {ch ? <Text style={styles.itemChar}>与 {ch.name} 的对话</Text> : <Text style={styles.itemChar}>与 AI 的对话</Text>}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.inkFaint} />
              </TouchableOpacity>
            </GlassCard>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="chatbubbles-outline" size={42} color={colors.inkFaint} />
            <Text style={styles.empty}>还没有会话，新建一个吧</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 64 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.page, marginBottom: 20 },
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
  newCard: { marginHorizontal: spacing.page, padding: 18, marginBottom: 16 },
  sectionLabel: { fontSize: 12, color: colors.inkSoft, marginBottom: 10, letterSpacing: 1 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: radius.input,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.ink,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },
  charRow: { flexDirection: 'row', alignItems: 'center' },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mist,
    borderRadius: radius.pill,
    paddingVertical: 13,
    marginTop: 4,
  },
  newBtnText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  list: { paddingHorizontal: spacing.page, paddingBottom: 30 },
  itemCard: { marginBottom: 10 },
  item: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  itemBody: { flex: 1, marginLeft: 14 },
  itemTitle: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink, fontWeight: '600' },
  itemChar: { fontSize: 12, color: colors.inkFaint, marginTop: 3 },
  emptyBox: { alignItems: 'center', marginTop: 70 },
  empty: { color: colors.inkFaint, fontSize: 13, marginTop: 14 },
});