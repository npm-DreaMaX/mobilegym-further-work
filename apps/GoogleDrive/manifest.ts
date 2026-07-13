import { IcLauncher } from './res/icons';
import type { AppManifest } from '@/os/types/manifest';

export const manifest: AppManifest = {
  id: 'googledrive',
  packageName: 'com.google.android.apps.docs',
  displayName: 'Google Drive',
  displayNameEn: 'Google Drive',
  aliases: ['Drive', '云盘', 'Google云盘'],
  version: '2.25.272.00',
  versionCode: 1,
  type: 'plugin',
  icon: IcLauncher,
  iconBackground: '#1A73E8',
  iconForeground: '#ffffff',
  designViewportWidth: 412,
  theme: {
    colors: {
      primary: '#1A73E8',
      primaryDark: '#1557B0',
      accent: '#34A853',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      textPrimary: '#202124',
      textSecondary: '#5F6368',
      border: '#DADCE0',
      statusBarForeground: 'dark',
      navigationBarForeground: 'dark',
    },
    colorsDark: {
      primary: '#8AB4F8',
      primaryDark: '#AECBFA',
      background: '#1E1E1E',
      surface: '#2D2D2D',
      textPrimary: '#E8EAED',
      textSecondary: '#9AA0A6',
      border: '#3C4043',
      statusBarForeground: 'light',
      navigationBarForeground: 'light',
    },
  },
};
