// apps/Telegram/constants.ts
// 结构性配置：tab 定义、功能标志

import { IcMessageCircle, IcUsers, IcSettings } from './res/icons';

// ── 主 Tab ─────────────────────────────────────────────────────────
export const TELEGRAM_TABS = [
  { id: 'chats', label: 'Chats', icon: IcMessageCircle, route: '/' },
  { id: 'contacts', label: 'Contacts', icon: IcUsers, route: '/contacts' },
  { id: 'settings', label: 'Settings', icon: IcSettings, route: '/settings' },
] as const;

// ── Reaction 选项 ──────────────────────────────────────────────────
export const REACTION_OPTIONS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😂', label: 'Haha' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '🙏', label: 'Thanks' },
] as const;

// ── 布局参数 ───────────────────────────────────────────────────────
export const TELEGRAM_LAYOUT = {
  MESSAGE_BUBBLE_MAX_WIDTH: 280,
  AVATAR_SIZE: 48,
  MESSAGE_GAP: 8,
} as const;

export type TelegramTab = (typeof TELEGRAM_TABS)[number]['id'];
