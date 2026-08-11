import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store';
import GlassCard from '../components/GlassCard';
import { C, F, R, SP } from '../theme';

interface Props {
  onBack: () => void;
}

export default function CharactersScreen({ onBack }: Props) {
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
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>角色卡</Text>
        <TouchableOpacity onPress={() => refreshCharacters()} style={{ padding: 6 }}>
          <Ionicons name="refresh" size={19} color={C.textSub} />
        </TouchableOpacity>
      </View>

      {!showForm ? (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.addBtnText}>创建虚拟恋人</Text>
        </TouchableOpacity>
      ) : (
        <GlassCard style={{ marginBottom: 16 }}>
          <TextInput style={styles.input} placeholder="角色名" placeholderTextColor={C.textFaint} value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="性格（如：温柔可爱、爱撒娇）" placeholderTextColor={C.textFaint} value={personality} onChangeText={setPersonality} />
          <TextInput style={[styles.input, styles.textArea]} placeholder="角色设定（如：18岁少女，我的青梅竹马）" placeholderTextColor={C.textFaint} value={description} onChangeText={setDescription} multiline />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={submit}>
              <Text style={styles.btnText}>创建</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setShowForm(false)}>
              <Text style={styles.btnGhostText}>取消</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      )}

      {characters.map((c) => (
        <GlassCard key={c.id} style={{ marginBottom: 10 }}>
          <View style={styles.cardHeader}>
            <View style={styles.cardAvatar}>
              <Ionicons name="heart" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.cardName}>{c.name}</Text>
              {c.relationship ? (
                <Text style={styles.intimacy}>亲密 {c.relationship.intimacy}/100 · {c.relationship.interactionCount} 次互动</Text>
              ) : null}
            </View>
          </View>
          {c.personality ? <Text style={styles.cardText}>性格：{c.personality}</Text> : null}
          {c.description ? <Text style={styles.cardText}>{c.description}</Text> : null}
        </GlassCard>
      ))}
      {characters.length === 0 ? <Text style={styles.empty}>还没有角色卡，点上方创建</Text> : null}

      <Text style={styles.sectionTitle}>记忆 · AI 记住的关于你</Text>
      {memories.slice(0, 10).map((m) => (
        <GlassCard key={m.id} style={styles.memCard} intense>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="bookmark" size={14} color={C.lavender} />
            <Text style={styles.memText}>{m.content}</Text>
          </View>
        </GlassCard>
      ))}
      {memories.length === 0 ? <Text style={styles.empty}>对话中告诉我你的信息，我会记住</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: SP.page },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: { width: 38, height: 38, borderRadius: R.pill, backgroundColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.glassBorder, marginRight: 10 },
  pageTitle: { flex: 1, fontFamily: F.serif, fontSize: 22, fontWeight: '700', color: C.text },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: C.pink, borderRadius: R.pill, padding: 14, marginBottom: 16, shadowColor: C.pink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 2 },
  addBtnText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: R.sm, padding: 12, color: C.text, fontSize: F.sub, marginBottom: 8 },
  textArea: { minHeight: 60 },
  btn: { flex: 1, borderRadius: R.pill, padding: 12, alignItems: 'center' },
  btnPrimary: { backgroundColor: C.pink },
  btnGhost: { backgroundColor: 'rgba(255,255,255,0.5)' },
  btnText: { color: '#fff', fontWeight: '600' },
  btnGhostText: { color: C.textSub },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardAvatar: { width: 44, height: 44, borderRadius: R.pill, backgroundColor: C.pink, alignItems: 'center', justifyContent: 'center' },
  cardName: { color: C.text, fontSize: 17, fontWeight: '700' },
  intimacy: { color: C.pink, fontSize: F.small, marginTop: 2 },
  cardText: { color: C.textSub, fontSize: F.sub, marginTop: 2, lineHeight: 20 },
  sectionTitle: { color: C.lavender, fontSize: F.sub, fontWeight: '600', marginTop: 18, marginBottom: 8 },
  memCard: { marginBottom: 6, padding: 0 },
  memText: { color: C.text, fontSize: F.sub, marginLeft: 8, flex: 1 },
  empty: { color: C.textFaint, textAlign: 'center', marginVertical: 20 },
});