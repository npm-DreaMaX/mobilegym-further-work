import type { AppManifest } from '@/os/types/manifest';
import { IcLauncher } from './res/icons';

export const manifest: AppManifest = {
  id: 'wallet',
  packageName: 'com.mobilegym.wallet',
  displayName: '卡包',
  displayNameEn: 'Wallet',
  version: '1.0.0',
  versionCode: 1,
  type: 'plugin',
  icon: IcLauncher,
  iconBackground: '#2B7DE9',
  iconForeground: '#ffffff',
  designViewportWidth: 360,
  theme: {
    colors: {
      primary: '#2B7DE9',
      secondary: '#34C759',
      background: '#F2F3F7',
      surface: '#FFFFFF',
      textPrimary: '#1C1C1E',
      textSecondary: '#8E8E93',
      border: '#E5E5EA',
      statusBarForeground: 'dark',
      navigationBarForeground: 'dark',
    },
  },
  intentFilters: [
    {
      action: 'ACTION_PAY',
      scheme: 'wallet',
      route: '/pay/cashier',
      params: [
        { name: 'amount', type: 'number', description: '支付金额（元）' },
        { name: 'orderId', type: 'string', description: '商户订单号' },
        { name: 'merchantName', type: 'string', description: '商户名称' },
        { name: 'subject', type: 'string', description: '商品描述' },
      ],
      description: 'Wallet 收银台 — 接收外部支付请求',
    },
  ],
};
