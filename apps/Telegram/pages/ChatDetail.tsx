// apps/Telegram/pages/ChatDetail.tsx
// Telegram 聊天详情页面

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useTelegramStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import { useTelegramGestures } from '../hooks/useTelegramGestures';
import { IcSearch, IcSend, IcReply, IcEdit, IcTrash, IcShare, IcSmile, IcPin, IcChevronLeft, IcMoreVertical, IcX, IcCheck } from '../res/icons';
import type { Message, Chat } from '../types';
import { fromTimestamp } from '@/os/TimeService';
import { REACTION_OPTIONS } from '../constants';

function formatMessageTime(timestamp: number): string {
  const date = fromTimestamp(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function MessageBubble({
  msg,
  isMe,
  chat,
  onLongPress,
}: {
  msg: Message;
  isMe: boolean;
  chat: Chat;
  onLongPress: (msg: Message) => void;
}) {
  const [showContextMenu, setShowContextMenu] = useState(false);

  if (msg.type === 'time') {
    return (
      <div className="flex justify-center my-3">
        <span className="text-[11px] text-gray-500 bg-black/5 px-2 py-0.5 rounded">
          {msg.content}
        </span>
      </div>
    );
  }

  const handleLongPress = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setShowContextMenu(true);
    onLongPress(msg);
  };

  return (
    <div
      className={`flex w-full mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}
      data-message-id={msg.id}
      data-trigger="chat.message.longpress"
      data-trigger-type="longPress"
      data-trigger-params={JSON.stringify({ messageId: msg.id })}
      onContextMenu={handleLongPress}
    >
      <div
        className={`relative max-w-[75%] rounded-2xl px-3 py-2 shadow-sm ${
          isMe ? 'bg-[#2AABEE] text-white rounded-br-sm' : 'bg-gray-100 text-black rounded-bl-sm'
        }`}
      >
        {/* Forwarded header */}
        {msg.forwardedFrom && (
          <div className={`text-[12px] mb-1 ${isMe ? 'text-blue-100' : 'text-[#2AABEE]'} font-medium italic`}>
            ↳ Forwarded from {msg.forwardedFrom.senderName}
          </div>
        )}

        {/* Reply reference */}
        {msg.replyToMessageId && (
          <div className={`text-[12px] mb-1 border-l-2 pl-2 ${isMe ? 'border-blue-200 text-blue-100' : 'border-[#2AABEE] text-[#2AABEE]'}`}>
            ↩ Reply to message
          </div>
        )}

        {/* Message content */}
        <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
          {msg.content}
          {msg.isEdited && <span className={`text-[11px] ml-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>edited</span>}
        </p>

        {/* Time */}
        <div className={`text-[11px] mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'} text-right`}>
          {formatMessageTime(msg.timestamp)}
          {msg.isPinned && <span className="ml-1">📌</span>}
        </div>

        {/* Reactions */}
        {msg.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {msg.reactions.map((r) => (
              <span
                key={r.emoji}
                className={`text-[12px] px-1.5 py-0.5 rounded-full ${
                  r.userReacted
                    ? isMe ? 'bg-blue-400/30' : 'bg-[#2AABEE]/20'
                    : isMe ? 'bg-blue-300/20' : 'bg-gray-200'
                }`}
              >
                {r.emoji} {r.count}
              </span>
            ))}
          </div>
        )}

        {/* Context menu */}
        {showContextMenu && (
          <div
            className={`absolute z-50 ${isMe ? 'right-0' : 'left-0'} top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1 min-w-[160px]`}
          >
            {isMe && (
              <>
                <button
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-[15px] hover:bg-gray-50"
                  onClick={() => {
                    setShowContextMenu(false);
                    onLongPress(msg);
                  }}
                  data-action="chat.action.edit"
                  data-action-type="tap"
                  data-action-params={JSON.stringify({ messageId: msg.id, newText: '' })}
                >
                  <IcEdit size={18} className="text-gray-600" />
                  <span>Edit</span>
                </button>
                <button
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-[15px] text-red-500 hover:bg-gray-50"
                  onClick={() => {
                    setShowContextMenu(false);
                    onLongPress(msg);
                  }}
                  data-action="chat.action.delete"
                  data-action-type="tap"
                  data-action-params={JSON.stringify({ messageId: msg.id })}
                >
                  <IcTrash size={18} />
                  <span>Delete</span>
                </button>
              </>
            )}
            <button
              className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-[15px] hover:bg-gray-50"
              onClick={() => {
                setShowContextMenu(false);
                onLongPress(msg);
              }}
              data-action="chat.action.reply"
              data-action-type="tap"
              data-action-params={JSON.stringify({ messageId: msg.id })}
            >
              <IcReply size={18} className="text-gray-600" />
              <span>Reply</span>
            </button>
            <button
              className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-[15px] hover:bg-gray-50"
              onClick={() => {
                setShowContextMenu(false);
                onLongPress(msg);
              }}
              data-action="chat.action.forward"
              data-action-type="tap"
              data-action-params={JSON.stringify({ messageId: msg.id })}
            >
              <IcShare size={18} className="text-gray-600" />
              <span>Forward</span>
            </button>
            <button
              className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-[15px] hover:bg-gray-50"
              onClick={() => {
                setShowContextMenu(false);
                onLongPress(msg);
              }}
              data-action="chat.action.react"
              data-action-type="tap"
              data-action-params={JSON.stringify({ messageId: msg.id, emoji: '👍' })}
            >
              <IcSmile size={18} className="text-gray-600" />
              <span>React</span>
            </button>
            {!msg.isPinned && (
              <button
                className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-[15px] hover:bg-gray-50"
                onClick={() => {
                  setShowContextMenu(false);
                  onLongPress(msg);
                }}
                data-action="chat.action.pin"
                data-action-type="tap"
                data-action-params={JSON.stringify({ messageId: msg.id })}
              >
                <IcPin size={18} className="text-gray-600" />
                <span>Pin</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatDetail() {
  const { chatId } = useParams<{ chatId: string }>();
  const { bindBack, bindTap, go, back } = useTelegramGestures();
  const [searchParams] = useSearchParams();
  const [inputText, setInputText] = useState('');
  const [contextMenuMsg, setContextMenuMsg] = useState<Message | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionTargetMsg, setReactionTargetMsg] = useState<Message | null>(null);
  const [forwardTarget, setForwardTarget] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    chat,
    user,
    chats,
    sendMessage,
    editMessage,
    deleteMessage,
    replyToMessage,
    forwardMessage,
    addReaction,
    pinMessage,
    setReplyingTo,
    setEditingMessage,
    setForwardingMessage,
    replyingToMessageId,
    editingMessageId,
    forwardingMessageId,
    markChatAsRead,
  } = useTelegramStore(
    useShallow((s) => ({
      chat: s.chats.find((c) => c.id === chatId),
      user: s.user,
      chats: s.chats,
      sendMessage: s.sendMessage,
      editMessage: s.editMessage,
      deleteMessage: s.deleteMessage,
      replyToMessage: s.replyToMessage,
      forwardMessage: s.forwardMessage,
      addReaction: s.addReaction,
      pinMessage: s.pinMessage,
      setReplyingTo: s.setReplyingTo,
      setEditingMessage: s.setEditingMessage,
      setForwardingMessage: s.setForwardingMessage,
      replyingToMessageId: s._temp.replyingToMessageId,
      editingMessageId: s._temp.editingMessageId,
      forwardingMessageId: s._temp.forwardingMessageId,
      markChatAsRead: s.markChatAsRead,
    })),
  );

  const view = searchParams.get('view');
  const action = searchParams.get('action');
  const isSearchMode = view === 'search';
  const isReplyMode = action === 'reply';
  const isEditMode = action === 'edit';
  const isForwardMode = action === 'forward';
  const [searchQuery, setSearchQuery] = useState('');

  // Mark as read when opening
  useEffect(() => {
    if (chatId && chat?.unreadCount) {
      markChatAsRead(chatId);
    }
  }, [chatId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages.length]);

  const handleSend = useCallback(() => {
    if (!inputText.trim() || !chatId) return;

    if (replyingToMessageId) {
      replyToMessage(chatId, replyingToMessageId, inputText.trim());
      setReplyingTo(null);
    } else if (editingMessageId) {
      editMessage(chatId, editingMessageId, inputText.trim());
      setEditingMessage(null);
    } else {
      sendMessage(chatId, inputText.trim());
    }
    setInputText('');
  }, [inputText, chatId, replyingToMessageId, editingMessageId]);

  const handleLongPress = useCallback((msg: Message) => {
    setContextMenuMsg(msg);
  }, []);

  const handleAction = useCallback(
    (actionType: string, params: Record<string, any>) => {
      setContextMenuMsg(null);
      const msgId = params.messageId;

      switch (actionType) {
        case 'reply':
          setReplyingTo(msgId);
          break;
        case 'edit':
          setEditingMessage(msgId);
          const msg = chat?.messages.find((m) => m.id === msgId);
          if (msg) setInputText(msg.content);
          break;
        case 'delete':
          setConfirmDelete(msgId);
          break;
        case 'forward':
          setForwardingMessage(msgId);
          setForwardTarget(null);
          break;
        case 'react':
          setReactionTargetMsg(chat?.messages.find((m) => m.id === msgId) || null);
          setShowReactionPicker(true);
          break;
        case 'pin':
          if (chatId) pinMessage(chatId, msgId);
          break;
      }
    },
    [chat, chatId],
  );

  const handleReactionSelect = useCallback(
    (emoji: string) => {
      if (reactionTargetMsg && chatId) {
        addReaction(chatId, reactionTargetMsg.id, emoji);
      }
      setShowReactionPicker(false);
      setReactionTargetMsg(null);
    },
    [reactionTargetMsg, chatId],
  );

  const handleConfirmDelete = useCallback(() => {
    if (confirmDelete && chatId) {
      deleteMessage(chatId, confirmDelete);
      setConfirmDelete(null);
    }
  }, [confirmDelete, chatId]);

  const handleForwardToChat = useCallback(
    (targetChatId: string) => {
      if (forwardingMessageId && chatId) {
        forwardMessage(chatId, forwardingMessageId, targetChatId);
        setForwardingMessage(null);
        setForwardTarget(null);
        // Navigate to target chat
        go('chat.open', { chatId: targetChatId });
      }
    },
    [forwardingMessageId, chatId],
  );

  // Filter messages for search
  const displayMessages = useMemo(() => {
    if (!chat?.messages) return [];
    if (isSearchMode && searchQuery) {
      return chat.messages.filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return chat.messages;
  }, [chat?.messages, isSearchMode, searchQuery]);

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <p className="text-gray-500">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white" data-page="chat-detail" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="flex items-center px-3 py-2.5 border-b border-gray-200 bg-white">
        <button
          onClick={() => back()}
          className="p-1.5 mr-2 rounded-full hover:bg-gray-100"
          {...bindBack()}
        >
          <IcChevronLeft size={24} className="text-[#2AABEE]" />
        </button>
        <img src={chat.avatar} alt="" className="w-10 h-10 rounded-full mr-3 object-cover bg-gray-200" />
        <div className="flex-1 min-w-0" onClick={() => go('chatInfo.open', { chatId: chat.id })} data-trigger="chatInfo.open" data-trigger-type="tap">
          <h2 className="font-semibold text-[16px] truncate">{chat.title}</h2>
          <p className="text-[12px] text-gray-500 truncate">
            {chat.type === 'group'
              ? `${chat.members?.length || 0} members`
              : chat.muted
              ? 'Muted'
              : 'Online'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => go('chat.search.open', { chatId: chat.id })}
            className="p-2 rounded-full hover:bg-gray-100"
            data-action="chat.search.open"
            data-action-type="tap"
          >
            <IcSearch size={20} className="text-[#2AABEE]" />
          </button>
          <button
            onClick={() => go('chatInfo.open', { chatId: chat.id })}
            className="p-2 rounded-full hover:bg-gray-100"
            data-trigger="chatInfo.open"
            data-trigger-type="tap"
            data-trigger-params={JSON.stringify({ chatId: chat.id })}
          >
            <IcMoreVertical size={20} className="text-[#2AABEE]" />
          </button>
        </div>
      </div>

      {/* Pinned message banner */}
      {chat.pinnedMessageId && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-[13px] text-[#2AABEE] truncate">
          📌 {chat.messages.find((m) => m.id === chat.pinnedMessageId)?.content || 'Pinned message'}
        </div>
      )}

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-4 py-3" data-scroll-container="main" data-scroll-direction="vertical">
        {displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-[15px]">{isSearchMode ? 'No messages found' : 'No messages yet'}</p>
          </div>
        ) : (
          displayMessages.map((msg) => {
            const isMe = msg.senderId === user.id;
            return (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMe={isMe}
                chat={chat}
                onLongPress={handleLongPress}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Forward target selection */}
      {forwardingMessageId && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 max-h-[200px] overflow-y-auto">
          <p className="text-[13px] text-gray-600 mb-2 font-medium">Forward to:</p>
          {chats
            .filter((c) => c.id !== chatId)
            .map((c) => (
              <button
                key={c.id}
                className="flex items-center w-full py-2 border-b border-gray-100 active:bg-gray-100"
                onClick={() => handleForwardToChat(c.id)}
                data-action="chat.action.forward"
                data-action-type="tap"
                data-action-params={JSON.stringify({ messageId: forwardingMessageId, targetChatId: c.id })}
              >
                <img src={c.avatar} alt="" className="w-8 h-8 rounded-full mr-3 object-cover" />
                <span className="text-[14px]">{c.title}</span>
              </button>
            ))}
          <button
            onClick={() => setForwardingMessage(null)}
            className="text-[13px] text-[#2AABEE] py-2"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Reply/Edit indicator */}
      {(replyingToMessageId || editingMessageId) && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center">
            <IcReply size={16} className="text-[#2AABEE] mr-2" />
            <span className="text-[13px] text-[#2AABEE]">
              {editingMessageId ? 'Editing message' : `Reply to ${chat.messages.find((m) => m.id === replyingToMessageId)?.senderName || 'message'}`}
            </span>
          </div>
          <button
            onClick={() => {
              setReplyingTo(null);
              setEditingMessage(null);
              setInputText('');
            }}
          >
            <IcX size={18} className="text-gray-500" />
          </button>
        </div>
      )}

      {/* Reaction picker */}
      {showReactionPicker && reactionTargetMsg && (
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <div className="flex items-center gap-3 overflow-x-auto">
            {REACTION_OPTIONS.map((r) => (
              <button
                key={r.emoji}
                onClick={() => handleReactionSelect(r.emoji)}
                className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100"
                data-action="chat.action.react"
                data-action-type="tap"
                data-action-params={JSON.stringify({ messageId: reactionTargetMsg.id, emoji: r.emoji })}
              >
                <span className="text-[22px]">{r.emoji}</span>
                <span className="text-[11px] text-gray-500">{r.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {confirmDelete && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 mx-8 w-full max-w-[300px]">
            <h3 className="text-[17px] font-semibold mb-2">Delete Message?</h3>
            <p className="text-[14px] text-gray-600 mb-4">This message will be deleted for everyone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-[15px] text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-[15px] text-red-500 font-medium hover:bg-red-50 rounded-lg"
                data-action="chat.action.delete"
                data-action-type="tap"
                data-action-params={JSON.stringify({ messageId: confirmDelete })}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input bar */}
      <div className="flex items-center px-3 py-2 border-t border-gray-200 bg-white flex-shrink-0" data-keep-keyboard="true">
        <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
          <input
            type="text"
            placeholder={editingMessageId ? 'Edit message...' : replyingToMessageId ? 'Reply...' : 'Message...'}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputText.trim()) {
                e.preventDefault();
                handleSend();
              }
            }}
            className="flex-1 outline-none text-[15px] bg-transparent"
            data-keep-keyboard="true"
            data-action="chat.message.send"
            data-action-type="input"
            data-action-params={JSON.stringify({ text: inputText })}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className={`ml-2 p-2 rounded-full ${inputText.trim() ? 'bg-[#2AABEE] text-white' : 'bg-gray-200 text-gray-400'} transition-colors`}
          data-action="chat.message.send"
          data-action-type="submit"
        >
          <IcSend size={20} />
        </button>
      </div>
    </div>
  );
}
