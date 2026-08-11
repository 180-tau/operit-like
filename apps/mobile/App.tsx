import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from './src/store';
import LoginScreen from './src/screens/LoginScreen';
import ConversationsScreen from './src/screens/ConversationsScreen';
import ChatScreen from './src/screens/ChatScreen';
import CharactersScreen from './src/screens/CharactersScreen';

type Tab = 'chats' | 'characters';

export default function App() {
  const { token } = useApp();
  const [tab, setTab] = useState<Tab>('chats');
  const [chatCid, setChatCid] = useState<string | null>(null);
  const [chatChar, setChatChar] = useState<string>('');

  if (!token) {
    return (
      <SafeAreaProvider>
        <LoginScreen />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  if (chatCid) {
    return (
      <SafeAreaProvider>
        <ChatScreen cid={chatCid} charName={chatChar} onBack={() => { setChatCid(null); setChatChar(''); }} />
        <StatusBar style="light" />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {tab === 'chats' ? (
          <ConversationsScreen
            onOpenChat={(cid, char) => { setChatCid(cid); setChatChar(char?.name ?? ''); }}
            onOpenCharacters={() => setTab('characters')}
          />
        ) : (
          <CharactersScreen />
        )}
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => setTab('chats')}>
            <Ionicons name={tab === 'chats' ? 'chatbubbles' : 'chatbubbles-outline'} size={24} color={tab === 'chats' ? '#7dd3fc' : '#666'} />
            <Text style={[styles.tabLabel, tab === 'chats' && styles.tabLabelActive]}>会话</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabItem} onPress={() => setTab('characters')}>
            <Ionicons name={tab === 'characters' ? 'heart' : 'heart-outline'} size={24} color={tab === 'characters' ? '#f0abfc' : '#666'} />
            <Text style={[styles.tabLabel, tab === 'characters' && styles.tabLabelActive]}>角色</Text>
          </TouchableOpacity>
        </View>
      </View>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  tabBar: { flexDirection: 'row', borderTopColor: '#2a2a4e', borderTopWidth: 1, backgroundColor: '#1f1f36' },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  tabLabel: { color: '#666', fontSize: 11, marginTop: 2 },
  tabLabelActive: { color: '#7dd3fc' },
});