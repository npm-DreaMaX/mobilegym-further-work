// apps/Telegram/pages/ChatInfo.tsx
// Telegram 聊天信息页面 — 置顶/静音/归档/标记未读/修改群名

import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useTelegramStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import { useTelegramGestures } from '../hooks/useTelegramGestures';
import { IcChevronLeft, IcBellOff, IcPin, IcArchive, IcMessageSquare, IcEdit, IcUsers, IcCheck } from '../res/icons';

export default function ChatInfo() {
  const { chatId } = useParams<{ chatId: string }>();
  const { back, bindBack } = useTelegramGestures();
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');

  const {
    chat,
    pinChat,
    unpinChat,
    muteChat,
    unmuteChat,
    archiveChat,
    markChatAsUnread,
    updateGroupName,
  } = useTelegramStore(
    useShallow((s) => ({
      chat: s.chats.find((c) => c.id === chatId) || s.archivedChats.find((c) => c.id === chatId),
      pinChat: s.pinChat,
      unpinChat: s.unpinChat,
      muteChat: s.muteChat,
      unmuteChat: s.unmuteChat,
      archiveChat: s.archiveChat,
      markChatAsUnread: s.markChatAsUnread,
      updateGroupName: s.updateGroupName,
    })),
  );

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <p className="text-gray-500">Chat not found</p>
      </div>
    );
  }

  const handleToggleMute = () => {
    if (chat.muted) unmuteChat(chat.id);
    else muteChat(chat.id);
  };

  const handleTogglePin = () => {
    if (chat.pinned) unpinChat(chat.id);
    else pinChat(chat.id);
  };

  const handleArchive = () => {
    archiveChat(chat.id);
    back();
  };

  const handleMarkUnread = () => {
    markChatAsUnread(chat.id);
    back();
  };

  const handleSaveGroupName = () => {
    if (newName.trim() && chatId) {
      updateGroupName(chatId, newName.trim());
      setEditingName(false);
      setNewName('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white" data-page="chat-info">
      {/* Header */}
      <div className="flex items-center px-3 py-3 border-b border-gray-200">
        <button onClick={() => back()} className="p-1.5 mr-2 rounded-full hover:bg-gray-100" {...bindBack()}>
          <IcChevronLeft size={24} className="text-[#2AABEE]" />
        </button>
        <h1 className="text-[18px] font-semibold flex-1">Chat Info</h1>
      </div>

      <div className="flex-1 overflow-y-auto" data-scroll-container="main" data-scroll-direction="vertical">
        {/* Chat header */}
        <div className="flex flex-col items-center py-6 border-b border-gray-100">
          <img src={chat.avatar} alt="" className="w-20 h-20 rounded-full mb-3 object-cover bg-gray-200" />
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={chat.title}
                className="text-[17px] font-semibold text-center outline-none border-b border-[#2AABEE] px-2 py-1"
                autoFocus
                data-action="chatInfo.action.groupName"
                data-action-type="input"
                data-action-params={JSON.stringify({ newName })}
              />
              <button onClick={handleSaveGroupName} className="text-[#2AABEE]">
                <IcCheck size={20} />
              </button>
            </div>
          ) : (
            <h2 className="text-[20px] font-bold">{chat.title}</h2>
          )}
          {chat.type === 'group' && (
            <p className="text-[13px] text-gray-500 mt-1">{chat.members?.length || 0} members</p>
          )}
          {chat.muted && <p className="text-[12px] text-gray-400 mt-1">🔇 Muted</p>}
          {chat.pinned && <p className="text-[12px] text-[#2AABEE] mt-1">📌 Pinned</p>}
        </div>

        {/* Actions */}
        <div className="py-2">
          {/* Pin/Unpin */}
          <button
            className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
            onClick={handleTogglePin}
            data-action="chatInfo.action.pin"
            data-action-type="toggle"
            data-action-params={JSON.stringify({ chatId: chat.id })}
          >
            <IcPin size={22} className={`mr-3 ${chat.pinned ? 'text-[#2AABEE]' : 'text-gray-600'}`} />
            <span className="text-[15px] flex-1 text-left">{chat.pinned ? 'Unpin Chat' : 'Pin Chat'}</span>
            {chat.pinned && <span className="text-[12px] text-[#2AABEE]">ON</span>}
          </button>

          {/* Mute/Unmute */}
          <button
            className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
            onClick={handleToggleMute}
            data-action="chatInfo.action.mute"
            data-action-type="toggle"
            data-action-params={JSON.stringify({ chatId: chat.id })}
          >
            <IcBellOff size={22} className={`mr-3 ${chat.muted ? 'text-[#2AABEE]' : 'text-gray-600'}`} />
            <span className="text-[15px] flex-1 text-left">{chat.muted ? 'Unmute' : 'Mute Notifications'}</span>
            {chat.muted && <span className="text-[12px] text-[#2AABEE]">ON</span>}
          </button>

          {/* Archive */}
          <button
            className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
            onClick={handleArchive}
            data-action="chatInfo.action.archive"
            data-action-type="tap"
            data-action-params={JSON.stringify({ chatId: chat.id })}
          >
            <IcArchive size={22} className="mr-3 text-gray-600" />
            <span className="text-[15px]">Archive Chat</span>
          </button>

          {/* Mark as Unread */}
          <button
            className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
            onClick={handleMarkUnread}
            data-action="chatInfo.action.markUnread"
            data-action-type="tap"
            data-action-params={JSON.stringify({ chatId: chat.id })}
          >
            <IcMessageSquare size={22} className="mr-3 text-gray-600" />
            <span className="text-[15px]">Mark as Unread</span>
          </button>

          {/* Edit Group Name (only for groups) */}
          {chat.type === 'group' && (
            <button
              className="flex items-center w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100"
              onClick={() => {
                setEditingName(true);
                setNewName(chat.title);
              }}
              data-action="chatInfo.action.groupName"
              data-action-type="tap"
              data-action-params={JSON.stringify({ chatId: chat.id })}
            >
              <IcEdit size={22} className="mr-3 text-gray-600" />
              <span className="text-[15px]">Edit Group Name</span>
            </button>
          )}
        </div>

        {/* Group members */}
        {chat.type === 'group' && chat.members && (
          <div className="border-t border-gray-100 py-4">
            <h3 className="px-4 text-[13px] text-gray-500 font-medium mb-2 uppercase tracking-wider">Members</h3>
            {chat.members.map((member) => (
              <div key={member.id} className="flex items-center px-4 py-2.5">
                <img src={member.avatar} alt="" className="w-10 h-10 rounded-full mr-3 object-cover bg-gray-200" />
                <div className="flex-1">
                  <span className="text-[15px] font-medium">{member.name}</span>
                  {member.role !== 'member' && (
                    <span className="ml-2 text-[11px] text-[#2AABEE] bg-blue-50 px-1.5 py-0.5 rounded">
                      {member.role}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
