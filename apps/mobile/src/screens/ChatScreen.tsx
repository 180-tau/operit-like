import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, Message, StreamEvent } from '../api';
import { useApp } from '../store';
import { colors, fonts, radius, spacing } from '../theme';

interface Props {
  cid: string;
  charName: string;
  onBack: () => void;
}

interface ViewMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatScreen({ cid, charName, onBack }: Props) {
  const { refreshMemories, refreshConversations } = useApp();
  const [msgs, setMsgs] = useState<ViewMsg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const listRef = useRef<FlatList>(null);

  const load = async () => {
    try {
      const list = await api.messages(cid);
      setMsgs(list.filter((m) => m.role !== 'system').map((m) => ({ id: m.id, role: m.role as 'user' | 'assistant', content: m.content })));
    } catch (e) {
      setStatus('加载失败: ' + (e as Error).message);
    }
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cid]);

  const append = (m: ViewMsg) => setMsgs((p) => [...p, m]);

  const send = async () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput('');
    append({ id: 'u' + Date.now(), role: 'user', content: text });
    setBusy(true);
    setStatus('思考中…');
    const aid = 'a' + Date.now();
    append({ id: aid, role: 'assistant', content: '' });
    let acc = '';
    try {
      await api.streamChat(cid, text, (ev: StreamEvent) => {
        if (ev.type === 'token') {
          acc += ev.delta;
          setMsgs((p) => p.map((m) => (m.id === aid ? { ...m, content: acc } : m)));
        } else if (ev.type === 'segment') {
          acc += ev.text;
          setMsgs((p) => p.map((m) => (m.id === aid ? { ...m, content: acc } : m)));
        } else if (ev.type === 'typing') {
          setStatus(ev.state === 'start' ? '输入中…' : '完成');
        } else if (ev.type === 'tool_call') {
          setStatus('调用工具: ' + (ev.name || ''));
        } else if (ev.type === 'done') {
          setStatus('完成');
        } else if (ev.type === 'error') {
          setStatus('出错: ' + ev.message);
        }
      });
    } catch (e) {
      setStatus('出错: ' + (e as Error).message);
    } finally {
      setBusy(false);
      refreshMemories();
      refreshConversations();
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.wrap}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerBtn} onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color={colors.ink} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{charName || 'AI 对话'}</Text>
            <Text style={styles.headerSub}>{busy ? status : '离线已就绪'}</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} onPress={load}>
            <Ionicons name="refresh" size={19} color={colors.inkFaint} />
          </TouchableOpacity>
        </View>

        <FlatList
          ref={listRef}
          style={styles.list}
          data={msgs}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => (
            <View style={[styles.row, item.role === 'user' ? styles.rowUser : styles.rowAI]}>
              <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
                <Text style={item.role === 'user' ? styles.textUser : styles.textAI}>{item.content || '…'}</Text>
              </View>
            </View>
          )}
        />

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={busy ? '安静等待…' : '说点什么…'}
            placeholderTextColor={colors.inkFaint}
            multiline
            editable={!busy}
          />
          <TouchableOpacity style={[styles.sendBtn, busy && styles.sendBtnDisabled]} onPress={send} disabled={busy}>
            <Ionicons name="send" size={19} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  wrap: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 64, paddingHorizontal: spacing.page, paddingBottom: 14 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontFamily: fonts.serif, fontSize: 18, color: colors.ink, fontWeight: '600' },
  headerSub: { fontSize: 11, color: colors.inkFaint, marginTop: 2 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: spacing.page, paddingVertical: 10 },
  row: { marginVertical: 5 },
  rowUser: { alignItems: 'flex-end' },
  rowAI: { alignItems: 'flex-start' },
  bubble: { maxWidth: '80%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 22, borderWidth: 1 },
  bubbleUser: { backgroundColor: colors.mist, borderColor: 'rgba(255,255,255,0.6)', borderBottomRightRadius: 6 },
  bubbleAI: { backgroundColor: 'rgba(255,255,255,0.68)', borderColor: 'rgba(255,255,255,0.85)', borderBottomLeftRadius: 6 },
  textUser: { color: '#fff', fontSize: 15, lineHeight: 22 },
  textAI: { color: colors.ink, fontSize: 15, lineHeight: 22 },
  composer: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: 24 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: radius.input,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.ink,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.lilac,
    marginLeft: 10,
  },
  sendBtnDisabled: { opacity: 0.5 },
});