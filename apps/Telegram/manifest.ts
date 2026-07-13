import { IcLauncher } from './res/icons';
import type { AppManifest } from '@/os/types/manifest';
import { PERMISSIONS } from '@/os/permissions';

export const manifest: AppManifest = {
  id: 'telegram',
  packageName: 'org.telegram.messenger',
  displayName: 'Telegram',
  displayNameEn: 'Telegram',
  version: '10.10.0',
  versionCode: 1,
  type: 'plugin',
  icon: IcLauncher,
  iconBackground: '#2AABEE',
  iconForeground: '#ffffff',
  designViewportWidth: 412,
  theme: {
    colors: {
      primary: '#2AABEE',
      primaryDark: '#229ED9',
      background: '#ffffff',
      surface: '#ffffff',
      textPrimary: '#000000',
      textSecondary: '#8e8e93',
      border: '#e5e5ea',
      statusBarForeground: 'dark',
      navigationBarForeground: 'dark',
    },
  },
  permissions: [
    PERMISSIONS.CAMERA,
    PERMISSIONS.RECORD_AUDIO,
    PERMISSIONS.ACCESS_FINE_LOCATION,
    PERMISSIONS.READ_CONTACTS,
    PERMISSIONS.READ_EXTERNAL_STORAGE,
    PERMISSIONS.WRITE_EXTERNAL_STORAGE,
  ],
  intentFilters: [
    {
      action: 'ACTION_SEND',
      type: 'text/plain',
      route: '/',
      description: '接收文本分享',
    },
    {
      action: 'ACTION_VIEW',
      scheme: 'tg',
      route: '/',
      description: 'Telegram 深度链接',
    },
  ],
};
