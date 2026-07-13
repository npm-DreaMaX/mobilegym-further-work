// apps/Telegram/pages/Contacts.tsx
// Telegram 联系人列表页面

import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTelegramStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import { IcSearch, IcChevronLeft } from '../res/icons';

export default function Contacts() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { contacts, chats } = useTelegramStore(
    useShallow((s) => ({
      contacts: s.contacts,
      chats: s.chats,
    })),
  );

  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts;
    const q = searchQuery.toLowerCase();
    return contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.username && c.username.toLowerCase().includes(q)),
    );
  }, [contacts, searchQuery]);

  // Sort: online first, then alphabetically
  const sortedContacts = useMemo(() => {
    return [...filteredContacts].sort((a, b) => {
      if (a.online && !b.online) return -1;
      if (!a.online && b.online) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [filteredContacts]);

  // Open chat with contact (find existing private chat or note that there isn't one)
  const handleContactClick = useCallback(
    (contactId: string) => {
      // Look for existing private chat with this contact
      const existingChat = chats.find(
        (c) => c.type === 'private' && c.title === contacts.find((co) => co.id === contactId)?.name,
      );
      if (existingChat) {
        navigate(`/chat/${existingChat.id}`, { replace: false });
      }
    },
    [navigate, chats, contacts],
  );

  // Back to chat list (explicit, replace mode)
  const handleBack = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/', { replace: true });
  }, [navigate]);

  return (
    <div className="flex flex-col h-full bg-white" data-page="contacts" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="flex items-center px-3 pt-10 pb-3 border-b border-gray-200 flex-shrink-0">
        <button
          onClick={handleBack}
          className="p-2.5 mr-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
          aria-label="Back to chats"
        >
          <IcChevronLeft size={24} className="text-[#2AABEE]" />
        </button>
        <h1 className="text-[18px] font-semibold flex-1">Contacts</h1>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
          <IcSearch size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-[15px] bg-transparent"
            data-keep-keyboard="true"
          />
        </div>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {sortedContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <IcSearch size={48} className="mb-4 opacity-50" />
            <p className="text-[15px]">{searchQuery ? 'No contacts found' : 'No contacts'}</p>
          </div>
        ) : (
          sortedContacts.map((contact) => {
            const hasChat = chats.find(
              (c) => c.type === 'private' && c.title === contact.name,
            );
            return (
              <div
                key={contact.id}
                className={`flex items-center px-4 py-3 border-b border-gray-100 ${hasChat ? 'active:bg-gray-50 cursor-pointer' : 'opacity-60'}`}
                onClick={() => hasChat && handleContactClick(contact.id)}
                data-contact-id={contact.id}
              >
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-[48px] h-[48px] rounded-full mr-3 object-cover bg-gray-200 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[15px] truncate">{contact.name}</span>
                    <span className="text-[12px] text-gray-500 flex-shrink-0 ml-2">
                      {contact.online ? (
                        <span className="text-[#2AABEE]">online</span>
                      ) : (
                        'last seen recently'
                      )}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500 truncate">
                    {contact.bio || contact.username || ''}
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
