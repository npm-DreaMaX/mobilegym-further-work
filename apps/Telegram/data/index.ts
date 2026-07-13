/**
 * Telegram App 数据入口（默认数据 + 运行时派生）
 *
 * 时间戳解析：defaults.json 中的 timestamp 字段通过 resolveDataTimestamp 解析。
 * 支持相对偏移格式："-1h", "-2d30m" 等，以及绝对时间戳。
 */

import { resolveDataTimestamp, now } from '@/os/TimeService';
import type { AppData } from '../types';
import defaults from './defaults.json';

const ts = (v: unknown) => resolveDataTimestamp(v as string | number);

const withResolvedTimestamps = (data: AppData): AppData => {
  const chats = Array.isArray(data.chats)
    ? data.chats.map((chat) => ({
        ...chat,
        messages: Array.isArray(chat.messages)
          ? chat.messages.map((msg) => ({
              ...msg,
              timestamp: ts(msg?.timestamp),
            }))
          : [],
        lastActivity: ts((chat as any).lastActivity),
      }))
    : [];

  const archivedChats = Array.isArray((data as any).archivedChats)
    ? (data as any).archivedChats.map((chat: any) => ({
        ...chat,
        messages: Array.isArray(chat.messages)
          ? chat.messages.map((msg: any) => ({
              ...msg,
              timestamp: ts(msg?.timestamp),
            }))
          : [],
        lastActivity: ts(chat.lastActivity),
      }))
    : [];

  return {
    ...data,
    chats,
    archivedChats,
  } as AppData;
};

export const TELEGRAM_CONFIG: AppData = withResolvedTimestamps(defaults as unknown as AppData);
export default TELEGRAM_CONFIG;
