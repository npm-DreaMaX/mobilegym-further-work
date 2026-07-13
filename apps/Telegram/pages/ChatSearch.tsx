// apps/Telegram/pages/ChatSearch.tsx
// 聊天内搜索页面 — 在当前聊天中搜索消息

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTelegramStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import { IcSearch, IcX, IcChevronLeft } from '../res/icons';
import { fromTimestamp } from '@/os/TimeService';
import type { Message } from '../types';

function formatMessageTime(timestamp: number): string {
  const date = fromTimestamp(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${m}/${d} ${hours}:${minutes}`;
}

export default function ChatSearch() {
  const navigate = useNavigate();
  const { chatId } = useParams<{ chatId: string }>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');

  const chat = useTelegramStore(
    useShallow((s) => s.chats.find((c) => c.id === chatId)),
  );

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Filter messages from current chat
  const results = useMemo(() => {
    if (!query.trim() || !chat) return [];
    const q = query.toLowerCase();
    return chat.messages
      .filter((m) => m.type === 'text' && m.content.toLowerCase().includes(q))
      .reverse(); // newest first
  }, [query, chat]);

  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  const handleCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/chat/${chatId}`, { replace: true });
  }, [navigate, chatId]);

  const handleResultClick = useCallback(
    (messageId: string) => {
      // Navigate back to chat detail — the message will be scrolled to
      navigate(`/chat/${chatId}`, { replace: true, state: { highlightMessageId: messageId } });
    },
    [navigate, chatId],
  );

  if (!chat) {
    return (
      <div className="flex flex-col h-full bg-white" data-status-bar-foreground="dark">
        <div className="flex items-center px-3 pt-10 pb-2.5 border-b border-gray-200">
          <button onClick={(e) => { e.stopPropagation(); navigate('/', { replace: true }); }} className="p-2.5 mr-2 rounded-full hover:bg-gray-100 active:bg-gray-200">
            <IcChevronLeft size={24} className="text-[#2AABEE]" />
          </button>
          <h1 className="text-[17px] font-semibold">Search Messages</h1>
        </div>
        <div className="flex items-center justify-center flex-1 text-gray-400">
          <p>Chat not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white" data-page="chat-search" data-status-bar-foreground="dark">
      {/* Header with search bar */}
      <div className="flex items-center px-3 pt-10 pb-2.5 border-b border-gray-200 gap-2">
        <button
          onClick={handleCancel}
          className="p-2.5 rounded-full hover:bg-gray-100 active:bg-gray-200 flex-shrink-0"
        >
          <IcChevronLeft size={24} className="text-[#2AABEE]" />
        </button>
        <div className="flex-1 flex items-center bg-gray-100 rounded-full px-3 py-2">
          <IcSearch size={18} className="text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder={`Search in ${chat.title}...`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 ml-2 outline-none text-[15px] bg-transparent"
            data-keep-keyboard="true"
          />
          {query && (
            <button onClick={handleClear} className="p-1 flex-shrink-0">
              <IcX size={16} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {query.trim() ? (
          results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <IcSearch size={48} className="mb-4 opacity-50" />
              <p className="text-[15px]">No messages found</p>
              <p className="text-[13px] mt-1">Try different keywords</p>
            </div>
          ) : (
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-[13px] text-gray-500">
                  {results.length} message{results.length !== 1 ? 's' : ''} found
                </p>
              </div>
              {results.map((msg) => {
                const isMe = msg.senderId === 'user_me_001'; // FIXME: use store user.id
                return (
                  <button
                    key={msg.id}
                    className="flex items-start w-full px-4 py-3 border-b border-gray-100 active:bg-gray-50 text-left"
                    onClick={() => handleResultClick(msg.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[13px] font-medium text-[#2AABEE]">
                          {isMe ? 'You' : (msg.senderName || msg.senderId)}
                        </span>
                        <span className="text-[12px] text-gray-400 flex-shrink-0 ml-2">
                          {formatMessageTime(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-[14px] text-gray-800 break-words">
                        {highlightMatch(msg.content, query)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <IcSearch size={48} className="mb-4 opacity-50" />
            <p className="text-[15px]">Search messages in {chat.title}</p>
            <p className="text-[13px] mt-1">Type a keyword to find messages</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper: highlight matching text in search results
function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const q = query.toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);

  return (
    <>
      {before}
      <mark className="bg-yellow-200 text-black rounded-sm px-0.5">{match}</mark>
      {after}
    </>
  );
}
