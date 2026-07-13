import { IcLauncher } from './res/icons';
import type { AppManifest } from '@/os/types/manifest';

export const manifest: AppManifest = {
  id: 'chinamobile',
  packageName: 'com.chinamobile.app',
  displayName: '中国移动',
  displayNameEn: 'China Mobile',
  aliases: ['移动', '中国移动营业厅', '10086'],
  version: '8.2.0',
  versionCode: 1,
  type: 'plugin',
  icon: IcLauncher,
  iconBackground: '#0066B3',
  iconForeground: '#ffffff',
  designViewportWidth: 412,
  theme: {
    colors: {
      primary: '#0066B3',
      primaryDark: '#00528F',
      onPrimary: '#ffffff',
      accent: '#FF6A00',
      background: '#F2F4F7',
      surface: '#FFFFFF',
      onSurface: '#1A1A1A',
      textPrimary: '#1A1A1A',
      textSecondary: '#8A8F99',
      border: '#EEF0F2',
      tabBarBg: '#FFFFFF',
      statusBarForeground: 'dark',
      navigationBarForeground: 'dark',
    },
  },
};
