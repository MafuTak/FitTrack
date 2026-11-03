/**
 * Design system do FitTrack.
 * Paleta quente (laranja), superfícies translúcidas e tipografia consistente.
 * Use estes tokens em todas as telas para manter o app padronizado.
 */

export const Palette = {
  // Marca
  orange: '#FF7A18',
  orangeLight: '#FFA45C',
  orangeDeep: '#E85D04',
  ember: '#FF4D00',

  // Fundo
  backgroundTop: '#1F0B03',
  backgroundMid: '#5C1F05',
  backgroundBottom: '#120601',
  tabBar: '#160A04',

  // Superfícies
  surface: 'rgba(255,255,255,0.055)',
  surfaceAlt: 'rgba(255,255,255,0.09)',
  surfaceSolid: '#1E0E06',
  input: 'rgba(255,255,255,0.06)',

  // Bordas
  border: 'rgba(255,164,92,0.22)',
  borderSoft: 'rgba(255,255,255,0.10)',

  // Texto
  text: '#FFF3E9',
  textMuted: '#D9B8A3',
  textFaint: '#A98774',

  // Estados
  success: '#3DDC97',
  danger: '#FF5C5C',
  warning: '#FFC46B',
} as const;

export const Gradients = {
  screen: ['#1F0B03', '#5C1F05', '#120601'] as const,
  primary: ['#FF9A4D', '#F25C05'] as const,
  glow: ['rgba(255,122,24,0.26)', 'rgba(255,122,24,0)'] as const,
};

export const Radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
} as const;
