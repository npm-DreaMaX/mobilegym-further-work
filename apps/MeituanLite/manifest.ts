import { IcLauncher } from './res/icons';
import type { AppManifest } from '@/os/types/manifest';

export const manifest: AppManifest = {
  id: 'meituan-lite',
  packageName: 'com.meituan.lite.sim',
  displayName: '美团',
  displayNameEn: 'Meituan Lite',
  aliases: ['美团', '美团外卖', '外卖'],
  version: '1.0.0',
  versionCode: 1,
  type: 'plugin',
  icon: IcLauncher,
  iconBackground: 'linear-gradient(135deg, #FFD161 0%, #FFB800 100%)',
  iconForeground: '#ffffff',
  designViewportWidth: 360,
  theme: {
    colors: {
      primary: '#FFC300',
      primaryDark: '#FFB000',
      onPrimary: '#ffffff',
      accent: '#FF5339',
      background: '#f5f5f5',
      surface: '#ffffff',
      onSurface: '#1a1a1a',
      textPrimary: '#1a1a1a',
      textSecondary: '#999999',
      border: '#f0f0f0',
      tabBarBg: '#ffffff',
      statusBarForeground: 'dark',
      navigationBarForeground: 'dark',
    },
  },
};
