// apps/Telegram/types.ts
// Telegram App 核心类型定义

// ── 消息类型 ──────────────────────────────────────────────────────
export type MessageType = 'text' | 'time' | 'system' | 'forwarded';

export interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  senderId: string;
  senderName?: string;
  timestamp: number;
  replyToMessageId?: string;
  forwardedFrom?: {
    messageId: string;
    senderId: string;
    senderName: string;
    chatId: string;
    originalContent: string;
  };
  reactions: Reaction[];
  isPinned?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
}

// ── 聊天类型 ──────────────────────────────────────────────────────
export type ChatType = 'private' | 'group' | 'channel';

export interface Chat {
  id: string;
  type: ChatType;
  title: string;
  avatar: string;
  pinned: boolean;
  muted: boolean;
  archived: boolean;
  unreadCount: number;
  isMarkedUnread?: boolean;
  pinnedMessageId?: string;
  members?: GroupMember[];
  messages: Message[];
  lastMessage?: Message;
  lastActivity: number;
  createdBy?: string;
}

// ── 联系人 / 成员 ────────────────────────────────────────────────
export interface Contact {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  username?: string;
  bio?: string;
  online: boolean;
  lastSeen?: number;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member';
}

// ── 用户设置 ─────────────────────────────────────────────────────
export interface TelegramSettings {
  notifications: {
    messageAlert: boolean;
    sound: boolean;
    previewMessages: boolean;
  };
  privacy: {
    lastSeen: 'everyone' | 'contacts' | 'nobody';
    profilePhoto: 'everyone' | 'contacts' | 'nobody';
    phoneNumber: 'everyone' | 'contacts' | 'nobody';
  };
  appearance: {
    themeId: 'light' | 'dark';
    fontSize: number;
  };
  data: {
    autoDownloadPhotos: boolean;
    autoDownloadVideos: boolean;
  };
}

// ── 当前用户 ─────────────────────────────────────────────────────
export interface TelegramUser {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  username: string;
  bio: string;
}

// ── 搜索 ─────────────────────────────────────────────────────────
export interface TelegramSearch {
  current: {
    query: string;
    results: string[];
  };
  history: string[];
}

// ── 整体数据 ─────────────────────────────────────────────────────
export interface AppData {
  user: TelegramUser;
  contacts: Contact[];
  chats: Chat[];
  settings: TelegramSettings;
  search: TelegramSearch;
  archivedChats: Chat[];
}
