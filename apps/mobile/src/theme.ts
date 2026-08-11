// ─── 日系极简 · 治愈系毛玻璃 设计系统（合并版）───
export const colors = {
  bg: '#F6F3EE',
  bgDeep: '#EFEAE3',
  bgWarm: '#FAF7F2',
  glass: 'rgba(255,255,255,0.55)',
  glassStrong: 'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(255,255,255,0.7)',
  glassBorderSoft: 'rgba(255,255,255,0.45)',
  ink: '#4A4440',
  inkSoft: '#9C948C',
  inkFaint: '#C4BCB2',
  blue: '#A6C1CE',
  pink: '#E5C7C9',
  green: '#B9C8B5',
  sand: '#D9C7A7',
  lilac: '#C4BFD9',
  mist: '#A6C1CE',
  sage: '#B9C8B5',
  blush: '#E5C7C9',
  haloBlue: 'rgba(166,193,206,0.35)',
  haloPink: 'rgba(229,199,201,0.32)',
  haloGreen: 'rgba(185,200,181,0.30)',
  shadow: 'rgba(120,105,95,0.12)',
  bubbleAI: 'rgba(255,255,255,0.65)',
  bubbleUser: 'rgba(166,193,206,0.55)',
};

export const fonts = {
  serif: 'NotoSerifSC_400Regular',
  serifBold: 'NotoSerifSC_700Bold',
};

export const radius = { card: 24, input: 16, pill: 999, sm: 12, md: 16, lg: 24 };

export const spacing = { page: 20, section: 14 };

export type PaletteKey = 'mist' | 'blossom' | 'sage' | 'sand' | 'lavender';
export interface Palette {
  from: string;
  to: string;
  glow: string;
  accent: string;
  quote: string;
  name: string;
}
export const palettes: Record<PaletteKey, Palette> = {
  mist: { from: '#EAF2F5', to: '#B9D3DC', glow: 'rgba(143,175,190,0.35)', accent: '#8FAFBE', quote: '清晨的雾，慢慢散开', name: '雾蓝晨光' },
  blossom: { from: '#F9EFF0', to: '#E8CDD0', glow: 'rgba(217,172,178,0.32)', accent: '#D9ACB2', quote: '花瓣落下的声音', name: '樱粉午后' },
  sage: { from: '#EEF3EC', to: '#C9D8C4', glow: 'rgba(163,184,157,0.30)', accent: '#A3B89D', quote: '风从林间穿过', name: '鼠尾草' },
  sand: { from: '#F7F1E6', to: '#E2D0B4', glow: 'rgba(201,174,133,0.30)', accent: '#C9AE85', quote: '光落在窗台上', name: '暖沙' },
  lavender: { from: '#F2F0F7', to: '#D3CCE3', glow: 'rgba(179,167,206,0.32)', accent: '#B3A7CE', quote: '黄昏时的梦', name: '暮紫' },
};
export const paletteOrder: PaletteKey[] = ['mist', 'blossom', 'sage', 'sand', 'lavender'];

// ─── 兼容旧导出（GlowBg 等使用 C/F/R/SP）───
export const C = { ...colors };
export const F = fonts;
export const R = radius;
export const SP = spacing;
export const glass = colors.glass;