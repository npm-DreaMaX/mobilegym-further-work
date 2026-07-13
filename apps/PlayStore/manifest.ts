import { IcLauncher } from './res/icons';
import type { AppManifest } from '@/os/types/manifest';

export const manifest: AppManifest = {
  id: 'playstore',
  packageName: 'com.android.vending',
  displayName: 'Play 商店',
  displayNameEn: 'Play Store',
  version: '42.0.18',
  versionCode: 1,
  aliases: ['PlayStore', 'playstore', '应用商店', 'Play商店'],
  type: 'plugin',
  icon: IcLauncher,
  iconBackground: '#ffffff',
  iconForeground: '#01875f',
  designViewportWidth: 412,
  theme: {
    colors: {
      primary: '#01875f',
      primaryDark: '#016848',
      background: '#f8fafc',
      surface: '#ffffff',
      textPrimary: '#111827',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      statusBarForeground: 'dark',
      navigationBarForeground: 'dark',
    },
  },
};
