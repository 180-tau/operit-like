import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useApp } from './src/store';
import LoginScreen from './src/screens/LoginScreen';
import ConversationsScreen from './src/screens/ConversationsScreen';
import ChatScreen from './src/screens/ChatScreen';
import CharactersScreen from './src/screens/CharactersScreen';
import WallpaperScreen from './src/screens/WallpaperScreen';
import AuroraBackground from './src/components/AuroraBackground';
import Drawer, { DrawerItem } from './src/components/Drawer';
import { PaletteKey } from './src/theme';

type Screen = 'chats' | 'characters' | 'wallpaper';

const drawerItems: DrawerItem[] = [
  { key: 'chats', label: '会话', icon: 'chatbubbles-outline' },
  { key: 'characters', label: '角色卡', icon: 'heart-outline' },
  { key: 'wallpaper', label: '壁纸工坊', icon: 'image-outline' },
];

const accents: Record<Screen, PaletteKey> = {
  chats: 'mist',
  characters: 'blush',
  wallpaper: 'sage',
};

export default function App() {
  const { token, username, logout } = useApp();
  const [screen, setScreen] = useState<Screen>('chats');
  const [chatCid, setChatCid] = useState<string | null>(null);
  const [chatChar, setChatChar] = useState<string>('');
  const [drawer, setDrawer] = useState(false);

  if (!token) {
    return (
      <>
        <LoginScreen />
        <StatusBar style="dark" />
      </>
    );
  }

  if (chatCid) {
    return (
      <>
        <ChatScreen
          cid={chatCid}
          charName={chatChar}
          onBack={() => {
            setChatCid(null);
            setChatChar('');
          }}
        />
        <StatusBar style="dark" />
      </>
    );
  }

  const openChat = (cid: string, char: { name: string } | null) => {
    setChatCid(cid);
    setChatChar(char?.name ?? '');
  };

  return (
    <>
      <AuroraBackground accent={accents[screen]}>
        {screen === 'chats' && <ConversationsScreen onOpenChat={openChat} onMenu={() => setDrawer(true)} />}
        {screen === 'characters' && <CharactersScreen onMenu={() => setDrawer(true)} />}
        {screen === 'wallpaper' && <WallpaperScreen onMenu={() => setDrawer(true)} />}
      </AuroraBackground>
      <Drawer
        visible={drawer}
        username={username ?? ''}
        items={drawerItems}
        active={screen}
        onClose={() => setDrawer(false)}
        onSelect={(k) => setScreen(k as Screen)}
        onLogout={logout}
      />
      <StatusBar style="dark" />
    </>
  );
}