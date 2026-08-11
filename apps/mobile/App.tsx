import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { useApp } from './src/store';
import LoginScreen from './src/screens/LoginScreen';
import ConversationsScreen from './src/screens/ConversationsScreen';
import ChatScreen from './src/screens/ChatScreen';
import CharactersScreen from './src/screens/CharactersScreen';
import WallpaperScreen from './src/screens/WallpaperScreen';
import Drawer, { Route } from './src/components/Drawer';
import GlowBg from './src/components/GlowBg';

export default function App() {
  const { token, username, logout } = useApp();
  const [route, setRoute] = useState<Route>('home');
  const [drawer, setDrawer] = useState(false);
  const [chatCid, setChatCid] = useState<string | null>(null);
  const [chatChar, setChatChar] = useState<string>('');

  if (!token) {
    return (
      <SafeAreaProvider>
        <View style={styles.root}>
          <GlowBg />
          <LoginScreen />
          <StatusBar style="dark" />
        </View>
      </SafeAreaProvider>
    );
  }

  if (chatCid) {
    return (
      <SafeAreaProvider>
        <View style={styles.root}>
          <GlowBg />
          <ChatScreen cid={chatCid} charName={chatChar} onBack={() => { setChatCid(null); setChatChar(''); }} />
          <StatusBar style="dark" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <GlowBg />
        {route === 'home' && (
          <ConversationsScreen
            onOpenDrawer={() => setDrawer(true)}
            onOpenChat={(cid, char) => { setChatCid(cid); setChatChar(char?.name ?? ''); }}
          />
        )}
        {route === 'characters' && <CharactersScreen onBack={() => setRoute('home')} />}
        {route === 'wallpaper' && <WallpaperScreen onBack={() => setRoute('home')} />}

        <Drawer
          visible={drawer}
          route={route}
          username={username ?? ''}
          onClose={() => setDrawer(false)}
          onNavigate={setRoute}
          onLogout={() => { setDrawer(false); logout(); }}
        />
        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F6F3EE' },
});