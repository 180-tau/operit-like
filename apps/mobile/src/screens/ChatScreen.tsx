import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, Message, StreamEvent } from '../api';
import { useApp } from '../store';
import { C, F, R, SP } from '../theme';

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
    setStatus('AI 正在思考…');
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
          setStatus(ev.state === 'start' ? 'AI 正在输入…' : '完成');
        } else if (ev.type === 'tool_call') {
          setStatus('正在调用工具: ' + (ev.name || ''));
        } else if (ev.type === 'done') {
          setStatus('完成');
        } else if (ev.type === 'error') {
          setStatus('错误: ' + ev.message);
        }
      });
    } catch (e) {
      setStatus('错误: ' + (e as Error).message);
    } finally {
      setBusy(false);
      refreshMemories();
      refreshConversations();
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{charName || 'AI 对话'}</Text>
        <TouchableOpacity onPress={load} style={{ padding: 6 }}>
          <Ionicons name="refresh" size={19} color={C.textSub} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        data={msgs}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingHorizontal: SP.page, paddingVertical: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.msg, item.role === 'user' ? styles.msgUser : styles.msgAI]}>
            <View style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>
              <Text style={item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAI}>{item.content}</Text>
            </View>
          </View>
        )}
      />

      <Text style={styles.status}>{status}</Text>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={busy ? 'AI 思考中…' : '输入消息…'}
          placeholderTextColor={C.textFaint}
          multiline
          editable={!busy}
        />
        <TouchableOpacity style={[styles.sendBtn, busy && styles.sendBtnDisabled]} onPress={send} disabled={busy}>
          <Ionicons name="send" size={19} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SP.page, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: C.glassBorderSoft },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: R.pill,
    backgroundColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontFamily: F.serif, fontSize: 18, fontWeight: '700', color: C.text },
  msg: { marginVertical: 5 },
  msgUser: { alignItems: 'flex-end' },
  msgAI: { alignItems: 'flex-start' },
  bubble: { maxWidth: '78%', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 22, fontSize: F.body, lineHeight: 22, borderWidth: 1 },
  bubbleUser: { backgroundColor: C.bubbleUser, borderColor: 'rgba(166,193,206,0.4)', borderBottomRightRadius: 6 },
  bubbleAI: { backgroundColor: C.bubbleAI, borderColor: C.glassBorderSoft, borderBottomLeftRadius: 6 },
  bubbleTextUser: { color: C.text, fontSize: F.body, lineHeight: 22 },
  bubbleTextAI: { color: C.text, fontSize: F.body, lineHeight: 22 },
  status: { color: C.textSub, fontSize: F.small, paddingHorizontal: SP.page, minHeight: 18, textAlign: 'center' },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, borderTopWidth: 1, borderTopColor: C.glassBorderSoft },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: R.pill,
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    color: C.text,
    fontSize: F.body,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: C.glassBorder,
  },
  sendBtn: { backgroundColor: C.blue, borderRadius: R.pill, padding: 13, marginLeft: 8 },
  sendBtnDisabled: { opacity: 0.5 },
});