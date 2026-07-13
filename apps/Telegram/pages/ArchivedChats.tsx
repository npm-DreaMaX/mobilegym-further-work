// apps/Telegram/pages/ArchivedChats.tsx
// Telegram 已归档聊天页面

import React, { useCallback } from 'react';
import { useTelegramStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import { useTelegramGestures } from '../hooks/useTelegramGestures';
import { IcChevronLeft, IcArchive } from '../res/icons';
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

export default function ArchivedChats() {
  const { back, bindBack, go } = useTelegramGestures();
  const { archivedChats, unarchiveChat } = useTelegramStore(
    useShallow((s) => ({
      archivedChats: s.archivedChats,
      unarchiveChat: s.unarchiveChat,
    })),
  );

  const handleOpenChat = useCallback(
    (chatId: string) => {
      unarchiveChat(chatId);
      go('chat.open', { chatId });
    },
    [unarchiveChat, go],
  );

  return (
    <div className="flex flex-col h-full bg-white" data-page="archived-chats">
      {/* Header */}
      <div className="flex items-center px-3 py-3 border-b border-gray-200">
        <button onClick={() => back()} className="p-1.5 mr-2 rounded-full hover:bg-gray-100" {...bindBack()}>
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
          </div>
        ) : (
          archivedChats.map((chat) => {
            const lastMsg = chat.lastMessage || chat.messages[chat.messages.length - 1];
            return (
              <div
                key={chat.id}
                className="flex items-center px-4 py-3 border-b border-gray-100 active:bg-gray-50 cursor-pointer"
                onClick={() => handleOpenChat(chat.id)}
                data-chat-id={chat.id}
              >
                <img
                  src={chat.avatar}
                  alt={chat.title}
                  className="w-[48px] h-[48px] rounded-full mr-3 object-cover bg-gray-200"
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
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
