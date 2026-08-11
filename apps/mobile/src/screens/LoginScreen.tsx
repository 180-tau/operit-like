import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store';
import GlassCard from '../components/GlassCard';
import { C, F, R, SP } from '../theme';

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
          <View style={styles.logoBadge}>
            <Ionicons name="sparkles" size={30} color="#fff" />
          </View>
        </View>
        <Text style={styles.title}>Operit</Text>
        <Text style={styles.subtitle}>治愈系 AI 伙伴 · 毛玻璃之境</Text>

        <GlassCard style={styles.card} intense>
          <TextInput style={styles.input} placeholder="用户名" placeholderTextColor={C.textFaint} value={username} onChangeText={setUsername} autoCapitalize="none" />
          <TextInput style={styles.input} placeholder="密码" placeholderTextColor={C.textFaint} value={password} onChangeText={setPassword} secureTextEntry />
          {err ? <Text style={styles.err}>{err}</Text> : null}
          <TouchableOpacity style={styles.btnPrimary} onPress={() => run(() => login(username, password))} disabled={busy}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>登 录</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnGhost} onPress={() => run(() => register(username, password))} disabled={busy}>
            <Text style={styles.btnGhostText}>注册新账号</Text>
          </TouchableOpacity>
        </GlassCard>

        <Text style={styles.footnote}>大量留白 · 低饱和 · 玻璃质感</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: SP.page },
  logo: { alignItems: 'center', marginBottom: 14 },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: R.pill,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 4,
  },
  title: { fontFamily: F.serif, fontSize: 34, fontWeight: '700', color: C.text, textAlign: 'center' },
  subtitle: { fontSize: F.sub, color: C.textSub, textAlign: 'center', marginTop: 6, marginBottom: 28 },
  card: { padding: 0, marginHorizontal: 4 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: R.md,
    padding: 14,
    color: C.text,
    fontSize: F.body,
    marginBottom: 12,
  },
  err: { color: '#C47B7B', fontSize: F.small, marginBottom: 8 },
  btnPrimary: {
    backgroundColor: C.blue,
    borderRadius: R.pill,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: C.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 2,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  btnGhost: { padding: 13, alignItems: 'center', marginTop: 2 },
  btnGhostText: { color: C.textSub, fontSize: F.sub },
  footnote: { color: C.textFaint, fontSize: F.small, textAlign: 'center', marginTop: 24 },
});