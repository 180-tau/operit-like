import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store';
import GlassCard from '../components/GlassCard';
import { colors, fonts, radius, spacing } from '../theme';

export default function CharactersScreen({ onMenu }: { onMenu: () => void }) {
  const { characters, createChar, memories } = useApp();
  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [description, setDescription] = useState('');
  const [showForm, setShowForm] = useState(false);

  const submit = async () => {
    if (!name.trim()) return;
    try {
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
    } catch {
      // ignore
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={onMenu}>
          <Ionicons name="menu" size={24} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>角色卡</Text>
          <Text style={styles.sub}>遇见特别的 TA</Text>
        </View>
        <View style={styles.menuBtn} />
      </View>

      {!showForm ? (
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBtnText}>创建虚拟恋人</Text>
        </TouchableOpacity>
      ) : (
        <GlassCard strong style={styles.form}>
          <Text style={styles.sectionLabel}>描述你想遇见的 TA</Text>
          <TextInput style={styles.input} placeholder="名字" placeholderTextColor={colors.inkFaint} value={name} onChangeText={setName} />
          <TextInput style={styles.input} placeholder="性格（温柔可爱、爱撒娇…）" placeholderTextColor={colors.inkFaint} value={personality} onChangeText={setPersonality} />
          <TextInput style={[styles.input, styles.textArea]} placeholder="设定（18岁少女，我的青梅竹马…）" placeholderTextColor={colors.inkFaint} value={description} onChangeText={setDescription} multiline />
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={submit}>
              <Text style={styles.btnText}>遇见</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setShowForm(false)}>
              <Text style={styles.btnGhostText}>取消</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      )}

      {characters.map((c) => (
        <GlassCard key={c.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.cardAvatar, { backgroundColor: colors.blush }]}>
              <Ionicons name="heart" size={20} color="#fff" />
            </View>
            <View style={styles.cardTitleBox}>
              <Text style={styles.cardName}>{c.name}</Text>
              <Text style={styles.cardMood}>
                {c.relationship ? `亲密 ${c.relationship.intimacy}/100 · ${c.relationship.interactionCount} 次互动` : '初次见面'}
              </Text>
            </View>
          </View>
          {c.personality ? <Text style={styles.cardText}>性格 · {c.personality}</Text> : null}
          {c.description ? <Text style={styles.cardDesc}>{c.description}</Text> : null}
        </GlassCard>
      ))}
      {characters.length === 0 ? (
        <View style={styles.emptyBox}>
          <Ionicons name="heart-outline" size={42} color={colors.inkFaint} />
          <Text style={styles.empty}>还没有角色卡</Text>
        </View>
      ) : null}

      <Text style={styles.sectionTitle}>记忆 · AI 记得的关于你</Text>
      {memories.slice(0, 8).map((m) => (
        <GlassCard key={m.id} style={styles.memCard}>
          <View style={styles.memRow}>
            <Ionicons name="leaf-outline" size={15} color={colors.sage} />
            <Text style={styles.memText}>{m.content}</Text>
          </View>
        </GlassCard>
      ))}
      {memories.length === 0 ? <Text style={styles.emptySmall}>对话中告诉我你的信息，我会记住</Text> : null}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blush,
    borderRadius: radius.pill,
    paddingVertical: 15,
    marginBottom: 18,
  },
  addBtnText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  form: { padding: 18, marginBottom: 18 },
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
  textArea: { minHeight: 64 },
  btnRow: { flexDirection: 'row', gap: 10 },
  btn: { flex: 1, borderRadius: radius.pill, paddingVertical: 13, alignItems: 'center' },
  btnPrimary: { backgroundColor: colors.blush },
  btnGhost: { backgroundColor: 'rgba(255,255,255,0.5)' },
  btnText: { color: '#fff', fontWeight: '600' },
  btnGhostText: { color: colors.inkFaint },
  card: { padding: 18, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  cardAvatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  cardTitleBox: { flex: 1, marginLeft: 12 },
  cardName: { fontFamily: fonts.serif, fontSize: 18, color: colors.ink, fontWeight: '600' },
  cardMood: { fontSize: 12, color: colors.inkFaint, marginTop: 3 },
  cardText: { color: colors.inkSoft, fontSize: 13, marginTop: 4 },
  cardDesc: { color: colors.inkSoft, fontSize: 13, marginTop: 2, lineHeight: 20 },
  sectionTitle: { fontFamily: fonts.serif, fontSize: 16, color: colors.ink, marginTop: 22, marginBottom: 10 },
  memCard: { padding: 14, marginBottom: 8 },
  memRow: { flexDirection: 'row', alignItems: 'center' },
  memText: { color: colors.inkSoft, fontSize: 13, marginLeft: 10, flex: 1, lineHeight: 19 },
  emptyBox: { alignItems: 'center', marginTop: 30 },
  empty: { color: colors.inkFaint, fontSize: 13, marginTop: 12 },
  emptySmall: { color: colors.inkFaint, fontSize: 12, marginTop: 6 },
});