// apps/Telegram/pages/ChatList.tsx
// Telegram 聊天列表页面 — 根页面，无返回按钮

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import { IcSearch, IcEdit, IcArchive, IcBellOff, IcPin } from '../res/icons';
import type { Chat } from '../types';
import { fromTimestamp, now as timeNow } from '@/os/TimeService';

function formatLastActivity(timestamp: number): string {
  const date = fromTimestamp(timestamp);
  const nowDate = fromTimestamp(timeNow());
  const diffMs = nowDate.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function ChatListItem({ chat, onClick }: { chat: Chat; onClick: () => void }) {
  const lastMsg = chat.lastMessage || chat.messages[chat.messages.length - 1];
  const lastText = lastMsg?.content || '';
  const lastTime = lastMsg?.timestamp || chat.lastActivity;

  return (
    <div
      className="flex items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50 cursor-pointer"
      onClick={onClick}
      data-chat-id={chat.id}
    >
      {/* Avatar */}
      <img
        src={chat.avatar}
        alt={chat.title}
        className="w-[52px] h-[52px] rounded-full mr-3 flex-shrink-0 object-cover bg-gray-200"
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center min-w-0">
            {chat.muted && <IcBellOff size={14} className="mr-1 text-gray-400 flex-shrink-0" />}
            <span className={`font-semibold text-[15px] truncate ${chat.pinned ? 'font-bold' : ''}`}>
              {chat.title}
            </span>
            {chat.type === 'group' && (
              <span className="ml-1 text-[11px] text-gray-500 bg-gray-100 px-1.5 rounded flex-shrink-0">group</span>
            )}
          </div>
          <span className="text-[12px] text-gray-500 flex-shrink-0 ml-2">
            {formatLastActivity(lastTime)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[14px] text-gray-600 truncate flex-1 mr-2">
            {lastText || 'No messages yet'}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {chat.pinned && <IcPin size={12} className="text-gray-400" />}
            {(chat.unreadCount > 0 || chat.isMarkedUnread) && (
              <span className="bg-[#2AABEE] text-white text-[11px] font-medium rounded-full min-w-[20px] h-[20px] px-1.5 flex items-center justify-center">
                {chat.unreadCount > 0 ? chat.unreadCount : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatList() {
  const navigate = useNavigate();
  const { chats, archivedChats } = useTelegramStore(
    useShallow((s) => ({
      chats: s.chats,
      archivedChats: s.archivedChats,
    })),
  );

  // Sort: pinned first, then by lastActivity
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.lastActivity - a.lastActivity;
    });
  }, [chats]);

  return (
    <div className="flex flex-col h-full bg-white" data-page="chat-list" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-10 pb-3 border-b border-gray-100 flex-shrink-0">
        <h1 className="text-[22px] font-bold text-black">Chats</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/search', { replace: false }); }}
            className="p-2.5 rounded-full hover:bg-gray-100 active:bg-gray-200"
            aria-label="Search"
          >
            <IcSearch size={22} className="text-[#2AABEE]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate('/group/create', { replace: false }); }}
            className="p-2.5 rounded-full hover:bg-gray-100 active:bg-gray-200"
            aria-label="New group"
          >
            <IcEdit size={20} className="text-[#2AABEE]" />
          </button>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {/* Archived chats entry */}
        {archivedChats.length > 0 && (
          <div
            className="flex items-center px-4 py-3 border-b border-gray-100 bg-gray-50 active:bg-gray-100 cursor-pointer"
            onClick={() => navigate('/archived', { replace: false })}
          >
            <div className="w-[52px] h-[52px] rounded-full bg-gray-200 mr-3 flex items-center justify-center flex-shrink-0">
              <IcArchive size={22} className="text-gray-600" />
            </div>
            <div>
              <span className="font-semibold text-[15px]">Archived Chats</span>
              <p className="text-[13px] text-gray-500">
                {archivedChats.length} chat{archivedChats.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Chat items */}
        {sortedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <IcSearch size={48} className="mb-4 opacity-50" />
            <p className="text-[15px]">No chats yet</p>
          </div>
        ) : (
          sortedChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              onClick={() => navigate(`/chat/${chat.id}`, { replace: false })}
            />
          ))
        )}
      </div>
    </div>
  );
}
