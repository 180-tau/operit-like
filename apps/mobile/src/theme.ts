// 治愈系 · 极简毛玻璃主题
export const colors = {
  bg: '#F7F4EF',
  bgDeep: '#EFE9E1',
  ink: '#4A4545',
  inkSoft: '#6B6565',
  inkFaint: '#A09A9A',
  mist: '#A8C3D1',
  blush: '#E8CFD0',
  sage: '#C9D6C3',
  lilac: '#B8A9C9',
  cream: '#F3E9DC',
  glass: 'rgba(255,255,255,0.55)',
  glassBorder: 'rgba(255,255,255,0.75)',
  glassStrong: 'rgba(255,255,255,0.72)',
  overlay: 'rgba(58,54,54,0.18)',
  shadow: '#D8CFC4',
};

export const fonts = {
  serif: 'serif',
  serifBold: 'serif',
  body: undefined as string | undefined,
};

export const radius = {
  card: 28,
  pill: 999,
  input: 20,
};

export const spacing = {
  page: 24,
  card: 20,
  gutter: 16,
};

export const glass = {
  background: colors.glass,
  borderColor: colors.glassBorder,
  borderRadius: radius.card,
  borderWidth: 1,
  shadowColor: colors.shadow,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.35,
  shadowRadius: 20,
  elevation: 6,
};

export type PaletteKey = 'mist' | 'blush' | 'sage' | 'lilac' | 'cream';

export const palettes: Record<PaletteKey, { name: string; from: string; to: string; glow: string }> = {
  mist: { name: '雾蓝晨光', from: '#A8C3D1', to: '#DCE6EC', glow: '#C9DCE6' },
  blush: { name: '藕粉晚霞', from: '#E8CFD0', to: '#F7E8E4', glow: '#F2DCDA' },
  sage: { name: '鼠尾草语', from: '#C9D6C3', to: '#E4EBDE', glow: '#D6E2CE' },
  lilac: { name: '藤紫薄雾', from: '#B8A9C9', to: '#E5DEF0', glow: '#D5CBE3' },
  cream: { name: '奶油月光', from: '#F3E9DC', to: '#FBF6EE', glow: '#EFE3D2' },
};

export const paletteOrder: PaletteKey[] = ['mist', 'blush', 'sage', 'lilac', 'cream'];