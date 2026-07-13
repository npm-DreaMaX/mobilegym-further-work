// apps/Telegram/pages/GlobalSearch.tsx
// 全局搜索页面 — 搜索聊天、联系人和消息

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import { IcSearch, IcX, IcChevronLeft } from '../res/icons';
import { fromTimestamp } from '@/os/TimeService';
import type { Chat, Contact, Message } from '../types';

interface SearchResult {
  type: 'chat' | 'contact' | 'message';
  chatId?: string;
  contactId?: string;
  messageId?: string;
  title: string;
  subtitle: string;
  avatar: string;
}

export default function GlobalSearch() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  const { chats, contacts, user, addSearchHistory, setSearchQuery } = useTelegramStore(
    useShallow((s) => ({
      chats: s.chats,
      contacts: s.contacts,
      user: s.user,
      addSearchHistory: s.addSearchHistory,
      setSearchQuery: s.setSearchQuery,
    })),
  );

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Search results from real state
  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const out: SearchResult[] = [];

    // Search chats
    for (const chat of chats) {
      if (chat.title.toLowerCase().includes(q)) {
        const lastMsg = chat.lastMessage || chat.messages[chat.messages.length - 1];
        out.push({
          type: 'chat',
          chatId: chat.id,
          title: chat.title,
          subtitle: lastMsg?.content || 'No messages',
          avatar: chat.avatar,
        });
      }
      // Search messages within chats
      for (const msg of chat.messages) {
        if (msg.type === 'text' && msg.content.toLowerCase().includes(q)) {
          out.push({
            type: 'message',
            chatId: chat.id,
            messageId: msg.id,
            title: chat.title,
            subtitle: msg.content,
            avatar: chat.avatar,
          });
        }
      }
    }

    // Search contacts
    for (const contact of contacts) {
      if (
        contact.name.toLowerCase().includes(q) ||
        (contact.username && contact.username.toLowerCase().includes(q))
      ) {
        out.push({
          type: 'contact',
          contactId: contact.id,
          title: contact.name,
          subtitle: contact.username || contact.phone || '',
          avatar: contact.avatar,
        });
      }
    }

    // Deduplicate: prefer chat results over contact results for same person
    const seenTitles = new Set<string>();
    return out.filter((r) => {
      const key = r.title;
      if (seenTitles.has(key)) return false;
      seenTitles.add(key);
      return true;
    });
  }, [query, chats, contacts]);

  const handleClear = useCallback(() => {
    setQuery('');
    inputRef.current?.focus();
  }, []);

  const handleCancel = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (query.trim()) {
      addSearchHistory(query.trim());
    }
    navigate('/', { replace: true });
  }, [query, navigate, addSearchHistory]);

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      if (query.trim()) {
        // Save to history and store search state for benchmark tracking
        setSearchHistory((prev) => {
          const next = [query.trim(), ...prev.filter((h) => h !== query.trim())].slice(0, 20);
          return next;
        });
        addSearchHistory(query.trim());
        setSearchQuery(query.trim(), [result.title]);
      }

      if (result.type === 'chat' || result.type === 'message') {
        navigate(`/chat/${result.chatId}`, { replace: false });
      } else if (result.type === 'contact') {
        // Find or navigate to contact — for now open chat if exists
        const existingChat = chats.find((c) => c.title === result.title && c.type === 'private');
        if (existingChat) {
          navigate(`/chat/${existingChat.id}`, { replace: false });
        }
      }
    },
    [query, navigate, chats, addSearchHistory, setSearchQuery],
  );

  const handleHistoryClick = useCallback((historyQuery: string) => {
    setQuery(historyQuery);
    inputRef.current?.focus();
  }, []);

  return (
    <div className="flex flex-col h-full bg-white" data-page="global-search" data-status-bar-foreground="dark">
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
            placeholder="Search chats, contacts and messages..."
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

      {/* Results or history */}
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {query.trim() ? (
          // Search results
          results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <IcSearch size={48} className="mb-4 opacity-50" />
              <p className="text-[15px]">No results found</p>
              <p className="text-[13px] mt-1">Try different keywords</p>
            </div>
          ) : (
            <div>
              {results.map((result, idx) => (
                <button
                  key={`${result.type}-${result.chatId || result.contactId}-${result.messageId || idx}`}
                  className="flex items-center w-full px-4 py-3 border-b border-gray-100 active:bg-gray-50 text-left"
                  onClick={() => handleResultClick(result)}
                >
                  <img
                    src={result.avatar}
                    alt=""
                    className="w-[44px] h-[44px] rounded-full mr-3 object-cover bg-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[15px] truncate">{result.title}</span>
                      {result.type === 'message' && (
                        <span className="text-[11px] text-[#2AABEE] bg-blue-50 px-1.5 py-0.5 rounded flex-shrink-0">message</span>
                      )}
                      {result.type === 'contact' && (
                        <span className="text-[11px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex-shrink-0">contact</span>
                      )}
                    </div>
                    <p className="text-[13px] text-gray-500 truncate">{result.subtitle}</p>
                  </div>
                </button>
              ))}
            </div>
          )
        ) : (
          // Search history
          <div className="px-4 py-4">
            <p className="text-[13px] text-gray-500 font-medium mb-3 uppercase tracking-wider">Recent Searches</p>
            {searchHistory.length === 0 ? (
              <p className="text-[13px] text-gray-400">No recent searches</p>
            ) : (
              <div className="space-y-1">
                {searchHistory.map((h, idx) => (
                  <button
                    key={idx}
                    className="flex items-center w-full px-3 py-2 rounded-lg active:bg-gray-100 text-left"
                    onClick={() => handleHistoryClick(h)}
                  >
                    <IcSearch size={16} className="text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-[15px]">{h}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
