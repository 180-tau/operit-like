import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, Message, StreamEvent } from '../api';
import { useApp } from '../store';

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
  const { memories, refreshMemories, refreshConversations } = useApp();
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
          // segments are independent chunks of the full reply -> append them
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
        <TouchableOpacity onPress={onBack} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={26} color="#eee" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{charName || 'AI 对话'}</Text>
        <TouchableOpacity onPress={load} style={{ padding: 4 }}>
          <Ionicons name="refresh" size={20} color="#7dd3fc" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={listRef}
        style={{ flex: 1 }}
        data={msgs}
        keyExtractor={(m) => m.id}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.msg, item.role === 'user' ? styles.msgUser : styles.msgAI]}>
            <Text style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAI]}>{item.content}</Text>
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
          placeholderTextColor="#8b8bb3"
          multiline
          editable={!busy}
        />
        <TouchableOpacity style={[styles.sendBtn, busy && styles.sendBtnDisabled]} onPress={send} disabled={busy}>
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, borderBottomColor: '#2a2a4e', borderBottomWidth: 1 },
  headerTitle: { flex: 1, textAlign: 'center', color: '#eee', fontSize: 17, fontWeight: '600' },
  msg: { paddingHorizontal: 14, marginVertical: 4 },
  msgUser: { alignItems: 'flex-end' },
  msgAI: { alignItems: 'flex-start' },
  bubble: { maxWidth: '82%', padding: 12, borderRadius: 14, fontSize: 15, lineHeight: 21 },
  bubbleUser: { backgroundColor: '#4f46e5', color: '#fff' },
  bubbleAI: { backgroundColor: '#2d2d55', color: '#eee' },
  status: { color: '#7dd3fc', fontSize: 12, paddingHorizontal: 14, minHeight: 18 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, borderTopColor: '#2a2a4e', borderTopWidth: 1 },
  input: { flex: 1, backgroundColor: '#232343', borderRadius: 14, padding: 12, color: '#eee', fontSize: 15, maxHeight: 100 },
  sendBtn: { backgroundColor: '#4f46e5', borderRadius: 14, padding: 14, marginLeft: 8 },
  sendBtnDisabled: { opacity: 0.5 },
});