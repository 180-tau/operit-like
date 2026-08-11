import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store';
import { Character } from '../api';
import GlassCard from '../components/GlassCard';
import { C, F, R, SP } from '../theme';

interface Props {
  onOpenDrawer: () => void;
  onOpenChat: (cid: string, char: Character | null) => void;
}

export default function ConversationsScreen({ onOpenDrawer, onOpenChat }: Props) {
  const { conversations, characters, activeCid, setActive, createConv, refreshCharacters, username } = useApp();
  const [title, setTitle] = useState('新对话');
  const [charId, setCharId] = useState('');

  const charName = (id?: string | null) => (id ? characters.find((c) => c.id === id)?.name ?? '' : '');

  const newChat = async () => {
    await createConv(title || '新对话', charId || undefined);
    setTitle('新对话');
    setCharId('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onOpenDrawer} style={styles.menuBtn}>
          <Ionicons name="menu" size={24} color={C.text} />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.title}>会话</Text>
          <Text style={styles.subtitle}>{username} · 午后好</Text>
        </View>
        <TouchableOpacity onPress={() => refreshCharacters()} style={styles.iconBtn}>
          <Ionicons name="refresh" size={20} color={C.textSub} />
        </TouchableOpacity>
      </View>

      <GlassCard style={styles.newCard}>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="会话标题" placeholderTextColor={C.textFaint} />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="person" size={15} color={C.pink} style={{ marginRight: 6 }} />
          <TextInput style={[styles.input, { flex: 1 }]} value={charId} onChangeText={setCharId} placeholder="绑定角色 ID（可选）" placeholderTextColor={C.textFaint} />
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={newChat}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newBtnText}>新建会话</Text>
        </TouchableOpacity>
      </GlassCard>

      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ paddingHorizontal: SP.page, paddingBottom: 30 }}
        renderItem={({ item }) => (
          <GlassCard style={[styles.item, item.id === activeCid && styles.itemActive]} intense={item.id === activeCid}>
            <TouchableOpacity
              style={styles.itemTouch}
              onPress={() => {
                setActive(item.id, characters.find((c) => c.id === item.characterCardId) ?? null);
                onOpenChat(item.id, characters.find((c) => c.id === item.characterCardId) ?? null);
              }}
            >
              <View style={styles.itemLeft}>
                <View style={[styles.itemIcon, { backgroundColor: item.characterCardId ? C.pink : C.blue }]}>
                  <Ionicons name={item.characterCardId ? 'heart' : 'chatbubble'} size={18} color="#fff" />
                </View>
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  {charName(item.characterCardId) ? <Text style={styles.itemChar}>{charName(item.characterCardId)}</Text> : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.textFaint} />
              </View>
            </TouchableOpacity>
          </GlassCard>
        )}
        ListEmptyComponent={<Text style={styles.empty}>还没有会话，点上方新建</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 64 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SP.page, marginBottom: 18 },
  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: R.pill,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  title: { fontFamily: F.serif, fontSize: 26, fontWeight: '700', color: C.text },
  subtitle: { fontSize: F.small, color: C.textSub, marginTop: 1 },
  iconBtn: { padding: 8 },
  newCard: { marginHorizontal: SP.page, marginBottom: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: R.sm, padding: 10, color: C.text, fontSize: F.sub, marginBottom: 8 },
  newBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.blue, borderRadius: R.pill, padding: 12, marginTop: 2 },
  newBtnText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  item: { marginBottom: 10 },
  itemActive: { borderColor: C.blue },
  itemTouch: { padding: 0 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemIcon: { width: 40, height: 40, borderRadius: R.pill, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { color: C.text, fontSize: F.body, fontWeight: '600' },
  itemChar: { color: C.pink, fontSize: F.small, marginTop: 2 },
  empty: { color: C.textFaint, textAlign: 'center', marginTop: 50 },
});