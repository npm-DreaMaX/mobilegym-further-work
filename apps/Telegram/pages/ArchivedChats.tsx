// apps/Telegram/pages/ArchivedChats.tsx
// Telegram 已归档聊天页面

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import { IcChevronLeft, IcArchive, IcBellOff, IcPin } from '../res/icons';
import type { Chat } from '../types';
import { fromTimestamp, now as timeNow } from '@/os/TimeService';

function formatLastActivity(timestamp: number): string {
  const date = fromTimestamp(timestamp);
  const nowDate = fromTimestamp(timeNow());
  const diffDays = Math.floor((nowDate.getTime() - date.getTime()) / 86400000);
  if (diffDays < 1) return 'today';
  if (diffDays < 7) return `${diffDays}d`;
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function ArchivedChatItem({
  chat,
  onOpen,
  onRestore,
}: {
  chat: Chat;
  onOpen: () => void;
  onRestore: () => void;
}) {
  const lastMsg = chat.lastMessage || chat.messages[chat.messages.length - 1];

  return (
    <div
      className="flex items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50 cursor-pointer"
      onClick={onOpen}
      data-chat-id={chat.id}
    >
      <img
        src={chat.avatar}
        alt={chat.title}
        className="w-[48px] h-[48px] rounded-full mr-3 object-cover bg-gray-200 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-[15px] truncate">{chat.title}</span>
          <span className="text-[12px] text-gray-500 flex-shrink-0 ml-2">
            {formatLastActivity(lastMsg?.timestamp || chat.lastActivity)}
          </span>
        </div>
        <p className="text-[14px] text-gray-600 truncate">
          {lastMsg?.content || 'No messages'}
        </p>
      </div>
      {/* Restore button — brings chat back to main list */}
      <button
        className="ml-2 p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
          onRestore();
        }}
        aria-label="Unarchive chat"
      >
        <IcArchive size={18} className="text-[#2AABEE]" />
      </button>
    </div>
  );
}

export default function ArchivedChats() {
  const navigate = useNavigate();
  const { archivedChats, unarchiveChat } = useTelegramStore(
    useShallow((s) => ({
      archivedChats: s.archivedChats,
      unarchiveChat: s.unarchiveChat,
    })),
  );

  // Open chat WITHOUT unarchiving (user must explicitly restore via button)
  const handleOpenChat = useCallback(
    (chatId: string) => {
      navigate(`/chat/${chatId}`, { replace: false });
    },
    [navigate],
  );

  const handleRestore = useCallback(
    (chatId: string) => {
      unarchiveChat(chatId);
    },
    [unarchiveChat],
  );

  // Back to chat list (explicit)
  const handleBack = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="flex flex-col h-full bg-white" data-page="archived-chats" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="flex items-center px-3 pt-10 pb-3 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={handleBack}
          className="p-2.5 mr-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
          aria-label="Back to chats"
        >
          <IcChevronLeft size={24} className="text-[#2AABEE]" />
        </button>
        <h1 className="text-[18px] font-semibold flex-1">Archived Chats</h1>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {archivedChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <IcArchive size={48} className="mb-4 opacity-50" />
            <p className="text-[15px]">No archived chats</p>
            <p className="text-[13px] mt-1">Archived chats will appear here</p>
          </div>
        ) : (
          archivedChats.map((chat) => (
            <ArchivedChatItem
              key={chat.id}
              chat={chat}
              onOpen={() => handleOpenChat(chat.id)}
              onRestore={() => handleRestore(chat.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
