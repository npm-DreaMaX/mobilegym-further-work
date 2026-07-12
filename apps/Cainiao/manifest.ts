import { IcLauncher } from './res/icons';
import type { AppManifest } from '@/os/types/manifest';

export const manifest: AppManifest = {
  id: 'cainiao',
  packageName: 'com.cainiao.app',
  displayName: '菜鸟',
  displayNameEn: 'Cainiao',
  aliases: ['菜鸟裹裹', '裹裹'],
  version: '9.4.0',
  versionCode: 1,
  type: 'plugin',
  icon: IcLauncher,
  iconBackground: '#FF6A00',
  iconForeground: '#ffffff',
  designViewportWidth: 412,
  theme: {
    colors: {
      primary: '#FF6A00',
      primaryDark: '#E55F00',
      accent: '#1A73E8',
      background: '#F5F6F8',
      surface: '#FFFFFF',
      textPrimary: '#1A1A1A',
      textSecondary: '#8A8F99',
      border: '#EEF0F2',
      statusBarForeground: 'dark',
      navigationBarForeground: 'dark',
    },
  },
};
