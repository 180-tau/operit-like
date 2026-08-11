import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store';
import { Character } from '../api';

interface Props {
  onOpenChat: (cid: string, char: Character | null) => void;
  onOpenCharacters: () => void;
}

export default function ConversationsScreen({ onOpenChat, onOpenCharacters }: Props) {
  const { conversations, characters, activeCid, setActive, createConv, logout, refreshCharacters, username } = useApp();
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
        <View>
          <Text style={styles.title}>Operit-like</Text>
          <Text style={styles.user}>{username}</Text>
        </View>
        <View style={styles.headerBtns}>
          <TouchableOpacity onPress={onOpenCharacters} style={styles.iconBtn}>
            <Ionicons name="heart" size={22} color="#f0abfc" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { refreshCharacters(); }} style={styles.iconBtn}>
            <Ionicons name="refresh" size={22} color="#7dd3fc" />
          </TouchableOpacity>
          <TouchableOpacity onPress={logout} style={styles.iconBtn}>
            <Ionicons name="log-out" size={22} color="#f87171" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.newCard}>
        <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="会话标题" placeholderTextColor="#8b8bb3" />
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="person" size={16} color="#f0abfc" style={{ marginRight: 6 }} />
          <TextInput style={[styles.input, { flex: 1 }]} value={charId} onChangeText={setCharId} placeholder="绑定角色ID（可选）" placeholderTextColor="#8b8bb3" />
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={newChat}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.newBtnText}>新建会话</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.item, item.id === activeCid && styles.itemActive]}
            onPress={() => {
              setActive(item.id, characters.find((c) => c.id === item.characterCardId) ?? null);
              onOpenChat(item.id, characters.find((c) => c.id === item.characterCardId) ?? null);
            }}
          >
            <View style={styles.itemLeft}>
              <Ionicons name={item.characterCardId ? 'heart-circle' : 'chatbubble-ellipses'} size={20} color={item.characterCardId ? '#f0abfc' : '#7dd3fc'} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {charName(item.characterCardId) ? (
                  <Text style={styles.itemChar}>{charName(item.characterCardId)}</Text>
                ) : null}
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#555" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>还没有会话，点上方新建</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  user: { fontSize: 13, color: '#9ca3af' },
  headerBtns: { flexDirection: 'row' },
  iconBtn: { padding: 8, marginLeft: 4 },
  newCard: { backgroundColor: '#232343', borderRadius: 16, padding: 16, marginHorizontal: 20, marginBottom: 12 },
  input: { backgroundColor: '#1f1f3a', borderRadius: 10, padding: 10, color: '#eee', fontSize: 14, marginBottom: 8 },
  newBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#4f46e5', borderRadius: 10, padding: 12 },
  newBtnText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  item: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#232343', borderRadius: 12, padding: 14, marginHorizontal: 20, marginBottom: 8 },
  itemActive: { borderColor: '#4f46e5', borderWidth: 1.5 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  itemTitle: { color: '#eee', fontSize: 16 },
  itemChar: { color: '#f0abfc', fontSize: 12, marginTop: 2 },
  empty: { color: '#555', textAlign: 'center', marginTop: 40 },
});