import { IcLauncher } from './res/icons';
import type { AppManifest } from '@/os/types/manifest';

export const manifest: AppManifest = {
  id: 'taobao',
  packageName: 'com.taobao.taobao',
  displayName: '淘宝',
  displayNameEn: 'Taobao',
  aliases: ['淘宝', '手机淘宝', 'taobao'],
  version: '10.45.0',
  versionCode: 1,
  type: 'plugin',
  icon: IcLauncher,
  iconBackground: '#ff5000',
  iconForeground: '#ffffff',
  designViewportWidth: 412,
  theme: {
    colors: {
      primary: '#ff5000',
      primaryDark: '#e04800',
      background: '#f5f5f5',
      surface: '#ffffff',
      textPrimary: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      statusBarForeground: 'dark',
      navigationBarForeground: 'dark',
    },
  },
};
