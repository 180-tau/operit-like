import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../store';
import AuroraBackground from '../components/AuroraBackground';
import GlassCard from '../components/GlassCard';
import { colors, fonts, radius, spacing } from '../theme';

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
    <AuroraBackground accent="mist">
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <View style={styles.hero}>
            <View style={styles.logo}>
              <Ionicons name="sparkles" size={30} color="#fff" />
            </View>
            <Text style={styles.title}>Operit-like</Text>
            <Text style={styles.subtitle}>一个安静的 AI 陪伴空间 · 治愈系毛玻璃</Text>
          </View>

          <GlassCard strong style={styles.card}>
            <Text style={styles.label}>用户名</Text>
            <TextInput style={styles.input} placeholder="你的名字" placeholderTextColor={colors.inkFaint} value={username} onChangeText={setUsername} autoCapitalize="none" />
            <Text style={[styles.label, { marginTop: 14 }]}>密码</Text>
            <TextInput style={styles.input} placeholder="秘密口令" placeholderTextColor={colors.inkFaint} value={password} onChangeText={setPassword} secureTextEntry />

            {err ? <Text style={styles.err}>{err}</Text> : null}

            <TouchableOpacity style={styles.btnPrimary} onPress={() => run(() => login(username, password))} disabled={busy}>
              {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>进 入</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnGhost} onPress={() => run(() => register(username, password))} disabled={busy}>
              <Text style={styles.btnGhostText}>没有账号？注册一个</Text>
            </TouchableOpacity>
          </GlassCard>

          <Text style={styles.foot}>Design · 极简治愈 × Glassmorphism</Text>
        </View>
      </KeyboardAvoidingView>
    </AuroraBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: spacing.page },
  hero: { alignItems: 'center', marginBottom: 40 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.mist,
    marginBottom: 18,
    ...({
      shadowColor: colors.mist,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 18,
      elevation: 8,
    } as object),
  },
  title: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink, letterSpacing: 2, fontWeight: '600' },
  subtitle: { fontSize: 13, color: colors.inkFaint, marginTop: 8, letterSpacing: 1 },
  card: { padding: 26 },
  label: { fontSize: 13, color: colors.inkSoft, marginBottom: 8, letterSpacing: 1 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: radius.input,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.ink,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  err: { color: '#C98A8A', fontSize: 13, marginTop: 12 },
  btnPrimary: {
    backgroundColor: colors.lilac,
    borderRadius: radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 22,
    ...({
      shadowColor: colors.lilac,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
      elevation: 6,
    } as object),
  },
  btnPrimaryText: { color: '#fff', fontSize: 17, fontWeight: '600', letterSpacing: 6 },
  btnGhost: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  btnGhostText: { color: colors.inkFaint, fontSize: 14 },
  foot: { textAlign: 'center', color: colors.inkFaint, fontSize: 11, marginTop: 28, letterSpacing: 1 },
});