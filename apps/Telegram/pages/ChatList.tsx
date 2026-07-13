// apps/Telegram/pages/ChatList.tsx
// Telegram 聊天列表页面

import React, { useState, useCallback, useMemo } from 'react';
import { useTelegramStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import { useTelegramGestures } from '../hooks/useTelegramGestures';
import { IcSearch, IcEdit, IcArchive, IcMoreVertical, IcBellOff, IcPin } from '../res/icons';
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

function ChatListItem({ chat, onOpen, onLongPress }: { chat: Chat; onOpen: () => void; onLongPress: () => void }) {
  const lastMsg = chat.lastMessage || chat.messages[chat.messages.length - 1];
  const lastText = lastMsg?.content || '';
  const lastTime = lastMsg?.timestamp || chat.lastActivity;

  return (
    <div
      className="flex items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50 cursor-pointer"
      onClick={onOpen}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress();
      }}
      data-chat-id={chat.id}
      data-trigger="chat.open"
      data-trigger-type="tap"
      data-trigger-params={JSON.stringify({ chatId: chat.id })}
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
          <div className="flex items-center">
            {chat.muted && <IcBellOff size={14} className="mr-1 text-gray-400" />}
            <span className={`font-semibold text-[15px] ${chat.pinned ? 'font-bold' : ''}`}>
              {chat.title}
            </span>
            {chat.type === 'group' && (
              <span className="ml-1 text-[11px] text-gray-500 bg-gray-100 px-1.5 rounded">group</span>
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
  const { go, bindTap, bindBack } = useTelegramGestures();
  const { chats, archivedChats, user, search } = useTelegramStore(
    useShallow((s) => ({
      chats: s.chats,
      archivedChats: s.archivedChats,
      user: s.user,
      search: s.search,
    })),
  );
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sort chats: pinned first, then by lastActivity
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return b.lastActivity - a.lastActivity;
    });
  }, [chats]);

  // Filter by search
  const filteredChats = useMemo(() => {
    if (!searchQuery) return sortedChats;
    const q = searchQuery.toLowerCase();
    return sortedChats.filter(
      (chat) =>
        chat.title.toLowerCase().includes(q) ||
        chat.messages.some((m) => m.content.toLowerCase().includes(q)),
    );
  }, [sortedChats, searchQuery]);

  const handleOpenChat = useCallback(
    (chatId: string) => {
      go('chat.open', { chatId });
    },
    [go],
  );

  const toggleSearch = useCallback(() => {
    setSearchMode((prev) => !prev);
    if (searchMode) setSearchQuery('');
  }, [searchMode]);

  return (
    <div className="flex flex-col h-full bg-white" data-page="chat-list">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h1 className="text-[22px] font-bold text-black">Chats</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSearch}
            className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
            data-action="home.menu.search"
            data-action-type="tap"
          >
            <IcSearch size={22} className="text-[#2AABEE]" />
          </button>
          <button
            onClick={() => go('groupCreate.open', {})}
            className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
            data-action="home.menu.group"
            data-action-type="tap"
          >
            <IcEdit size={20} className="text-[#2AABEE]" />
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchMode && (
        <div className="px-4 py-2 border-b border-gray-100 bg-gray-50">
          <div className="flex items-center gap-2 bg-white rounded-full px-4 py-2 border border-gray-200">
            <IcSearch size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search chats and contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-[15px] bg-transparent"
              data-keep-keyboard="true"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-gray-400">
                <IcSearch size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {/* Archived chats entry */}
        {archivedChats.length > 0 && (
          <div
            className="flex items-center px-4 py-3 border-b border-gray-100 bg-gray-50 active:bg-gray-100 cursor-pointer"
            onClick={() => go('archived.open', {})}
            data-trigger="archived.open"
            data-trigger-type="tap"
          >
            <div className="w-[52px] h-[52px] rounded-full bg-gray-200 mr-3 flex items-center justify-center">
              <IcArchive size={22} className="text-gray-600" />
            </div>
            <div>
              <span className="font-semibold text-[15px]">Archived Chats</span>
              <p className="text-[13px] text-gray-500">{archivedChats.length} chat{archivedChats.length > 1 ? 's' : ''}</p>
            </div>
          </div>
        )}

        {/* Chat items */}
        {filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <IcSearch size={48} className="mb-4 opacity-50" />
            <p className="text-[15px]">{searchQuery ? 'No chats found' : 'No chats yet'}</p>
          </div>
        ) : (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat.id}
              chat={chat}
              onOpen={() => handleOpenChat(chat.id)}
              onLongPress={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
}
