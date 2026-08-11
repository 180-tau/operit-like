import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';
import { useFonts, NotoSerifSC_400Regular, NotoSerifSC_700Bold } from '@expo-google-fonts/noto-serif-sc';
import { useApp } from './src/store';
import LoginScreen from './src/screens/LoginScreen';
import ConversationsScreen from './src/screens/ConversationsScreen';
import ChatScreen from './src/screens/ChatScreen';
import CharactersScreen from './src/screens/CharactersScreen';
import WallpaperScreen from './src/screens/WallpaperScreen';
import Drawer, { DrawerItem } from './src/components/Drawer';
import GlowBg from './src/components/GlowBg';
import { colors } from './src/theme';

type Page = 'home' | 'characters' | 'wallpaper';

export default function App() {
  const { token, username, logout } = useApp();
  const [page, setPage] = useState<Page>('home');
  const [drawer, setDrawer] = useState(false);
  const [chatCid, setChatCid] = useState<string | null>(null);
  const [chatChar, setChatChar] = useState<string>('');

  const [fontsLoaded] = useFonts({ NotoSerifSC_400Regular, NotoSerifSC_700Bold });
  if (!fontsLoaded) {
    return <View style={styles.root} />;
  }

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

  const drawerItems: DrawerItem[] = [
    { key: 'home', label: '会话', icon: 'chatbubbles-outline', color: colors.blue },
    { key: 'characters', label: '角色卡', icon: 'heart-outline', color: colors.pink },
    { key: 'wallpaper', label: '壁纸工坊', icon: 'image-outline', color: colors.sage },
  ];

  return (
    <SafeAreaProvider>
      <View style={styles.root}>
        <GlowBg />
        {page === 'home' && (
          <ConversationsScreen
            onOpenChat={(cid, char) => { setChatCid(cid); setChatChar(char?.name ?? ''); }}
            onMenu={() => setDrawer(true)}
          />
        )}
        {page === 'characters' && <CharactersScreen onMenu={() => setDrawer(true)} />}
        {page === 'wallpaper' && <WallpaperScreen onMenu={() => setDrawer(true)} />}

        <Drawer
          visible={drawer}
          username={username ?? ''}
          items={drawerItems}
          active={page}
          onClose={() => setDrawer(false)}
          onSelect={(k) => setPage(k as Page)}
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