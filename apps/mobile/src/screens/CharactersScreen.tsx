import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store';

export default function CharactersScreen() {
  const { characters, createChar, refreshCharacters, memories } = useApp();
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    await createChar({
      name: name.trim(),
      personality: personality.trim(),
      description: description.trim(),
      systemPrompt: `You are ${name.trim()}. Stay in character. Reply with short human-like sentences.`,
    });
    setName('');
    setPersonality('');
    setDescription('');
    setShowForm(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.pageTitle}>我的角色卡</Text>

      {!showForm ? (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addBtnText}>创建虚拟恋人</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="角色名" placeholderTextColor="#8b8bb3" value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="性格（如：温柔可爱、爱撒娇）" placeholderTextColor="#8b8bb3" value={personality} onChangeText={setPersonality} />
          <TextInput style={[styles.input, styles.textArea]} placeholder="角色设定（如：18岁少女，我的青梅竹马）" placeholderTextColor="#8b8bb3" value={description} onChangeText={setDescription} multiline />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={submit}>
              <Text style={styles.btnText}>创建</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setShowForm(false)}>
              <Text style={styles.btnGhostText}>取消</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {characters.map((c) => (
        <View key={c.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="heart" size={22} color="#f0abfc" />
            <Text style={styles.cardName}>{c.name}</Text>
            {c.relationship ? (
              <Text style={styles.intimacy}>亲密 {c.relationship.intimacy}/100 · {c.relationship.interactionCount} 次互动</Text>
            ) : null}
          </View>
          {c.personality ? <Text style={styles.cardText}>性格：{c.personality}</Text> : null}
          {c.description ? <Text style={styles.cardText}>{c.description}</Text> : null}
        </View>
      ))}
      {characters.length === 0 ? <Text style={styles.empty}>还没有角色卡，点上方创建</Text> : null}

      <Text style={styles.sectionTitle}>记忆（AI 记住的关于你）</Text>
      {memories.slice(0, 10).map((m) => (
        <View key={m.id} style={styles.memItem}>
          <Ionicons name="bookmark" size={14} color="#a5b4fc" />
          <Text style={styles.memText}>{m.content}</Text>
        </View>
      ))}
      {memories.length === 0 ? <Text style={styles.empty}>对话中告诉我你的信息，我会记住</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 60, paddingHorizontal: 20 },
  pageTitle: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 14 },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#db2777', borderRadius: 12, padding: 14, marginBottom: 16 },
  addBtnText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  form: { backgroundColor: '#232343', borderRadius: 14, padding: 14, marginBottom: 16 },
  input: { backgroundColor: '#1f1f3a', borderRadius: 10, padding: 12, color: '#eee', fontSize: 14, marginBottom: 8 },
  textArea: { minHeight: 60 },
  btn: { flex: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#4f46e5' },
  btnGhost: { backgroundColor: '#2d2d55' },
  btnText: { color: '#fff', fontWeight: '600' },
  btnGhostText: { color: '#a5b4fc' },
  card: { backgroundColor: '#232343', borderRadius: 14, padding: 14, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardName: { color: '#fff', fontSize: 17, fontWeight: '600', marginLeft: 8, flex: 1 },
  intimacy: { color: '#f0abfc', fontSize: 12 },
  cardText: { color: '#b0b0c8', fontSize: 13, marginTop: 2 },
  sectionTitle: { color: '#f0abfc', fontSize: 15, fontWeight: '600', marginTop: 18, marginBottom: 8 },
  memItem: { flexDirection: 'row', backgroundColor: '#1f1f3a', borderRadius: 10, padding: 10, marginBottom: 6 },
  memText: { color: '#a5b4fc', fontSize: 13, marginLeft: 8, flex: 1 },
  empty: { color: '#555', textAlign: 'center', marginVertical: 20 },
});