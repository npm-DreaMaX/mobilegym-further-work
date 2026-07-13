import type { AppManifest } from '@/os/types/manifest';
import { IcLauncher } from './res/icons';

export const manifest: AppManifest = {
  id: 'baicizhan',
  packageName: 'com.baicizhan.vocab',
  displayName: '百词斩',
  displayNameEn: 'Baicizhan',
  version: '1.0.0',
  versionCode: 1,
  type: 'plugin',
  icon: IcLauncher,
  iconBackground: '#4F46E5',
  iconForeground: '#ffffff',
  designViewportWidth: 412,
  theme: {
    colors: {
      primary: '#4F46E5',
      primaryDark: '#3730A3',
      background: '#F9FAFB',
      surface: '#ffffff',
      textPrimary: '#111827',
      textSecondary: '#6B7280',
      border: '#E5E7EB',
      statusBarForeground: 'dark',
      navigationBarForeground: 'dark',
    },
  },
  aliases: ['baicizhan', '背单词', '英语学习'],
};
