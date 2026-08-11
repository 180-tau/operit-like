import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store';

export default function LoginScreen() {
  const { login, register } = useApp();
  const [username, setUsername] = useState('tester');
  const [password, setPassword] = useState('test1234');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setErr('');
    try {
      await fn();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <View style={styles.logo}>
          <Ionicons name="sparkles" size={56} color="#7dd3fc" />
        </View>
        <Text style={styles.title}>Operit-like</Text>
        <Text style={styles.subtitle}>AI 助手 · 虚拟恋人</Text>

        <TextInput style={styles.input} placeholder="用户名" placeholderTextColor="#8b8bb3" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="密码" placeholderTextColor="#8b8bb3" value={password} onChangeText={setPassword} secureTextEntry />

        {err ? <Text style={styles.err}>{err}</Text> : null}

        <TouchableOpacity style={styles.btnPrimary} onPress={() => run(() => login(username, password))} disabled={busy}>
          {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>登 录</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnGhost} onPress={() => run(() => register(username, password))} disabled={busy}>
          <Text style={styles.btnGhostText}>注册新账号</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },
  logo: { alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 30, fontWeight: '700', color: '#fff', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#9ca3af', textAlign: 'center', marginBottom: 32 },
  input: { backgroundColor: '#232343', borderRadius: 12, padding: 14, color: '#eee', fontSize: 16, marginBottom: 12 },
  err: { color: '#f87171', fontSize: 13, marginBottom: 10 },
  btnPrimary: { backgroundColor: '#4f46e5', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  btnGhost: { padding: 14, alignItems: 'center', marginTop: 6 },
  btnGhostText: { color: '#a5b4fc', fontSize: 15 },
});