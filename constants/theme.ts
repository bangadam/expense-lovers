import { Platform } from 'react-native';

export const DesignTokens = {
  colors: {
    white: '#FFFFFF',
    primary: '#345AFA',
    ink: '#313131',
    textPrimary: '#313131',
    textSecondary: 'rgba(49,49,49,0.65)',
    textTertiary: 'rgba(49,49,49,0.45)',
    border: 'rgba(49,49,49,0.12)',
    surfaceSubtle: 'rgba(49,49,49,0.04)',
    primaryTint: 'rgba(52,90,250,0.10)',
    primaryPressed: 'rgba(52,90,250,0.85)',
    success: '#22C55E',
    error: '#EF4444',
  },
  radii: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    full: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
  },
  fonts: {
    regular: 'Montserrat_400Regular',
    semibold: 'Montserrat_600SemiBold',
    bold: 'Montserrat_700Bold',
  },
  typography: {
    display: { fontSize: 36, lineHeight: 44, fontFamily: 'Montserrat_700Bold' },
    h1: { fontSize: 24, lineHeight: 32, fontFamily: 'Montserrat_700Bold' },
    h2: { fontSize: 20, lineHeight: 28, fontFamily: 'Montserrat_600SemiBold' },
    sectionTitle: { fontSize: 16, lineHeight: 24, fontFamily: 'Montserrat_700Bold' },
    body: { fontSize: 14, lineHeight: 20, fontFamily: 'Montserrat_400Regular' },
    caption: { fontSize: 12, lineHeight: 16, fontFamily: 'Montserrat_400Regular' },
    micro: { fontSize: 10, lineHeight: 14, fontFamily: 'Montserrat_400Regular' },
  },
  elevation: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 18,
      elevation: 2,
    },
    floating: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 28,
      elevation: 4,
    },
  },
};

export const Colors = {
  light: {
    text: DesignTokens.colors.ink,
    background: DesignTokens.colors.white,
    tint: DesignTokens.colors.primary,
    icon: DesignTokens.colors.textTertiary,
    tabIconDefault: DesignTokens.colors.textTertiary,
    tabIconSelected: DesignTokens.colors.primary,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#fff',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#fff',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'Montserrat_400Regular',
    semibold: 'Montserrat_600SemiBold',
    bold: 'Montserrat_700Bold',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Montserrat_400Regular',
    semibold: 'Montserrat_600SemiBold',
    bold: 'Montserrat_700Bold',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "Montserrat, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    semibold: 'Montserrat',
    bold: 'Montserrat',
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
