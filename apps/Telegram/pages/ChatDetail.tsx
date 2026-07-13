// apps/Telegram/pages/ChatDetail.tsx
// Telegram 聊天详情页面

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTelegramStore } from '../state';
import { useShallow } from 'zustand/react/shallow';
import {
  IcSearch, IcSend, IcReply, IcEdit, IcTrash, IcShare,
  IcSmile, IcPin, IcChevronLeft, IcMoreVertical, IcX, IcCheck, IcMoreHorizontal,
} from '../res/icons';
import type { Message, Chat } from '../types';
import { fromTimestamp } from '@/os/TimeService';
import { REACTION_OPTIONS } from '../constants';

function formatMessageTime(timestamp: number): string {
  const date = fromTimestamp(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// ── Action Sheet (bottom sheet) ─────────────────────────────────────
function ActionSheet({
  msg,
  isMe,
  chatId,
  onClose,
  onReply,
  onEdit,
  onDelete,
  onForward,
  onReact,
  onPin,
}: {
  msg: Message;
  isMe: boolean;
  chatId: string;
  onClose: () => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onForward: () => void;
  onReact: () => void;
  onPin: () => void;
}) {
  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Sheet */}
      <div
        className="relative bg-white rounded-t-2xl pb-8 animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Message preview */}
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-[13px] text-gray-500 truncate">{msg.content}</p>
        </div>

        {/* Actions */}
        <div className="py-1">
          {isMe && (
            <>
              <button
                className="flex items-center gap-4 w-full px-5 py-3.5 text-left text-[16px] hover:bg-gray-50 active:bg-gray-100"
                onClick={() => { onClose(); onEdit(); }}
              >
                <IcEdit size={22} className="text-gray-600" />
                <span>Edit</span>
              </button>
              <button
                className="flex items-center gap-4 w-full px-5 py-3.5 text-left text-[16px] text-red-500 hover:bg-gray-50 active:bg-gray-100"
                onClick={() => { onClose(); onDelete(); }}
              >
                <IcTrash size={22} />
                <span>Delete</span>
              </button>
            </>
          )}
          <button
            className="flex items-center gap-4 w-full px-5 py-3.5 text-left text-[16px] hover:bg-gray-50 active:bg-gray-100"
            onClick={() => { onClose(); onReply(); }}
          >
            <IcReply size={22} className="text-gray-600" />
            <span>Reply</span>
          </button>
          <button
            className="flex items-center gap-4 w-full px-5 py-3.5 text-left text-[16px] hover:bg-gray-50 active:bg-gray-100"
            onClick={() => { onClose(); onForward(); }}
          >
            <IcShare size={22} className="text-gray-600" />
            <span>Forward</span>
          </button>
          <button
            className="flex items-center gap-4 w-full px-5 py-3.5 text-left text-[16px] hover:bg-gray-50 active:bg-gray-100"
            onClick={() => { onClose(); onReact(); }}
          >
            <IcSmile size={22} className="text-gray-600" />
            <span>React</span>
          </button>
          {!msg.isPinned && (
            <button
              className="flex items-center gap-4 w-full px-5 py-3.5 text-left text-[16px] hover:bg-gray-50 active:bg-gray-100"
              onClick={() => { onClose(); onPin(); }}
            >
              <IcPin size={22} className="text-gray-600" />
              <span>Pin</span>
            </button>
          )}
        </div>

        {/* Cancel */}
        <div className="border-t border-gray-100 pt-1">
          <button
            className="flex items-center justify-center w-full px-5 py-3.5 text-left text-[16px] font-medium text-gray-500 hover:bg-gray-50 active:bg-gray-100"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Forward Target Selector ─────────────────────────────────────────
function ForwardSelector({
  chats,
  currentChatId,
  onSelect,
  onCancel,
}: {
  chats: Chat[];
  currentChatId: string;
  onSelect: (chatId: string) => void;
  onCancel: () => void;
}) {
  const targets = chats.filter((c) => c.id !== currentChatId);
  return (
    <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 max-h-[200px] overflow-y-auto">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[13px] text-gray-600 font-medium">Forward to:</p>
        <button onClick={onCancel} className="text-[13px] text-[#2AABEE]">Cancel</button>
      </div>
      {targets.map((c) => (
        <button
          key={c.id}
          className="flex items-center w-full py-2 border-b border-gray-100 active:bg-gray-100 rounded"
          onClick={() => onSelect(c.id)}
        >
          <img src={c.avatar} alt="" className="w-8 h-8 rounded-full mr-3 object-cover" />
          <span className="text-[14px]">{c.title}</span>
        </button>
      ))}
    </div>
  );
}

// ── Reaction Picker ─────────────────────────────────────────────────
function ReactionPicker({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="border-t border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3 overflow-x-auto">
        {REACTION_OPTIONS.map((r) => (
          <button
            key={r.emoji}
            onClick={() => onSelect(r.emoji)}
            className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 min-w-[44px]"
          >
            <span className="text-[24px]">{r.emoji}</span>
            <span className="text-[10px] text-gray-500 mt-0.5">{r.label}</span>
          </button>
        ))}
      </div>
      <div className="text-center mt-2">
        <button onClick={onClose} className="text-[13px] text-gray-400">Cancel</button>
      </div>
    </div>
  );
}

// ── Message Bubble ──────────────────────────────────────────────────
function MessageBubble({
  msg,
  isMe,
  onOpenActionSheet,
}: {
  msg: Message;
  isMe: boolean;
  onOpenActionSheet: (msg: Message) => void;
}) {
  if (msg.type === 'time') {
    return (
      <div className="flex justify-center my-3">
        <span className="text-[11px] text-gray-500 bg-black/5 px-2 py-0.5 rounded">
          {msg.content}
        </span>
      </div>
    );
  }

  if (msg.isDeleted) {
    return (
      <div className="flex justify-center my-3">
        <span className="text-[12px] text-gray-400 italic">Message deleted</span>
      </div>
    );
  }

  return (
    <div
      className={`flex w-full mb-3 ${isMe ? 'justify-end' : 'justify-start'}`}
      data-message-id={msg.id}
    >
      <div className={`relative max-w-[75%] ${isMe ? 'flex-row-reverse' : ''} flex items-end gap-1`}>
        {/* Message content */}
        <div
          className={`relative rounded-2xl px-3 py-2 shadow-sm ${
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
            {msg.isEdited && (
              <span className={`text-[11px] ml-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>edited</span>
            )}
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
                  className={`text-[12px] px-1.5 py-0.5 rounded-full cursor-pointer ${
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
        </div>

        {/* Action button (⋮) — visible, clickable */}
        <button
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 active:bg-gray-300 opacity-60 hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onOpenActionSheet(msg);
          }}
          aria-label="Message actions"
        >
          <IcMoreHorizontal size={18} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}

// ── ChatDetail Component ────────────────────────────────────────────
export default function ChatDetail() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [activeActionMsg, setActiveActionMsg] = useState<Message | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionTargetMsg, setReactionTargetMsg] = useState<Message | null>(null);
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
    unpinMessage,
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
      unpinMessage: s.unpinMessage,
      setReplyingTo: s.setReplyingTo,
      setEditingMessage: s.setEditingMessage,
      setForwardingMessage: s.setForwardingMessage,
      replyingToMessageId: s._temp.replyingToMessageId,
      editingMessageId: s._temp.editingMessageId,
      forwardingMessageId: s._temp.forwardingMessageId,
      markChatAsRead: s.markChatAsRead,
    })),
  );

  // Mark as read when opening
  useEffect(() => {
    if (chatId && chat?.unreadCount) {
      markChatAsRead(chatId);
    }
  }, [chatId, chat?.unreadCount, markChatAsRead]);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages.length]);

  // Handle send
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
  }, [inputText, chatId, replyingToMessageId, editingMessageId, replyToMessage, editMessage, sendMessage, setReplyingTo, setEditingMessage]);

  // Action sheet handlers
  const handleOpenActionSheet = useCallback((msg: Message) => {
    setActiveActionMsg(msg);
  }, []);

  const handleCloseActionSheet = useCallback(() => {
    setActiveActionMsg(null);
  }, []);

  const handleReply = useCallback(() => {
    if (!activeActionMsg || !chatId) return;
    setReplyingTo(activeActionMsg.id);
  }, [activeActionMsg, chatId, setReplyingTo]);

  const handleEdit = useCallback(() => {
    if (!activeActionMsg || !chatId) return;
    setEditingMessage(activeActionMsg.id);
    setInputText(activeActionMsg.content);
  }, [activeActionMsg, chatId, setEditingMessage]);

  const handleDelete = useCallback(() => {
    if (!activeActionMsg || !chatId) return;
    setConfirmDelete(activeActionMsg.id);
  }, [activeActionMsg, chatId]);

  const handleConfirmDelete = useCallback(() => {
    if (confirmDelete && chatId) {
      deleteMessage(chatId, confirmDelete);
      setConfirmDelete(null);
    }
  }, [confirmDelete, chatId, deleteMessage]);

  const handleForward = useCallback(() => {
    if (!activeActionMsg || !chatId) return;
    setForwardingMessage(activeActionMsg.id);
  }, [activeActionMsg, chatId, setForwardingMessage]);

  const handleForwardSelect = useCallback(
    (targetChatId: string) => {
      if (forwardingMessageId && chatId) {
        forwardMessage(chatId, forwardingMessageId, targetChatId);
        setForwardingMessage(null);
        navigate(`/chat/${targetChatId}`, { replace: false });
      }
    },
    [forwardingMessageId, chatId, forwardMessage, navigate, setForwardingMessage],
  );

  const handleReact = useCallback(() => {
    if (!activeActionMsg || !chatId) return;
    setReactionTargetMsg(activeActionMsg);
    setShowReactionPicker(true);
  }, [activeActionMsg, chatId]);

  const handleReactionSelect = useCallback(
    (emoji: string) => {
      if (reactionTargetMsg && chatId) {
        addReaction(chatId, reactionTargetMsg.id, emoji);
      }
      setShowReactionPicker(false);
      setReactionTargetMsg(null);
    },
    [reactionTargetMsg, chatId, addReaction],
  );

  const handlePin = useCallback(() => {
    if (!activeActionMsg || !chatId) return;
    pinMessage(chatId, activeActionMsg.id);
  }, [activeActionMsg, chatId, pinMessage]);

  // Back to chat list (explicit parent)
  const handleBack = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/', { replace: true });
  }, [navigate]);

  if (!chat) {
    return (
      <div className="flex flex-col h-full bg-white" data-status-bar-foreground="dark">
        <div className="flex items-center px-3 pt-10 pb-2.5 border-b border-gray-200">
          <button onClick={handleBack} className="p-2.5 mr-2 rounded-full hover:bg-gray-100 active:bg-gray-200">
            <IcChevronLeft size={24} className="text-[#2AABEE]" />
          </button>
          <h1 className="text-[17px] font-semibold">Chat</h1>
        </div>
        <div className="flex items-center justify-center flex-1 text-gray-400">
          <p>Chat not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative" data-page="chat-detail" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="flex items-center px-3 pt-10 pb-2.5 border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={handleBack}
          className="p-2.5 mr-2 rounded-full hover:bg-gray-100 active:bg-gray-200 flex-shrink-0"
          aria-label="Back to chats"
        >
          <IcChevronLeft size={24} className="text-[#2AABEE]" />
        </button>
        <img
          src={chat.avatar}
          alt=""
          className="w-9 h-9 rounded-full mr-3 object-cover bg-gray-200 flex-shrink-0"
        />
        <button
          className="flex-1 min-w-0 text-left"
          onClick={() => navigate(`/chat/${chat.id}/info`, { replace: false })}
        >
          <h2 className="font-semibold text-[16px] truncate">{chat.title}</h2>
          <p className="text-[12px] text-gray-500 truncate">
            {chat.type === 'group'
              ? `${chat.members?.length || 0} members`
              : chat.muted
              ? 'Muted'
              : 'Online'}
          </p>
        </button>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/chat/${chat.id}/search`, { replace: false }); }}
            className="p-2.5 rounded-full hover:bg-gray-100 active:bg-gray-200"
            aria-label="Search in chat"
          >
            <IcSearch size={20} className="text-[#2AABEE]" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/chat/${chat.id}/info`, { replace: false }); }}
            className="p-2.5 rounded-full hover:bg-gray-100 active:bg-gray-200"
            aria-label="Chat info"
          >
            <IcMoreVertical size={20} className="text-[#2AABEE]" />
          </button>
        </div>
      </div>

      {/* Pinned message banner */}
      {chat.pinnedMessageId && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-[13px] text-[#2AABEE] truncate flex-shrink-0">
          📌 {chat.messages.find((m) => m.id === chat.pinnedMessageId)?.content || 'Pinned message'}
        </div>
      )}

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto px-4 py-3" data-scroll-container="main" data-scroll-direction="vertical">
        {chat.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p className="text-[15px]">No messages yet</p>
          </div>
        ) : (
          chat.messages.map((msg) => {
            const isMe = msg.senderId === user.id;
            return (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isMe={isMe}
                onOpenActionSheet={handleOpenActionSheet}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply/Edit indicator */}
      {(replyingToMessageId || editingMessageId) && (
        <div className="flex items-center justify-between px-4 py-2 bg-blue-50 border-t border-blue-100 flex-shrink-0">
          <div className="flex items-center min-w-0">
            {editingMessageId ? (
              <IcEdit size={16} className="text-[#2AABEE] mr-2 flex-shrink-0" />
            ) : (
              <IcReply size={16} className="text-[#2AABEE] mr-2 flex-shrink-0" />
            )}
            <span className="text-[13px] text-[#2AABEE] truncate">
              {editingMessageId
                ? 'Editing message'
                : `Reply to ${chat.messages.find((m) => m.id === replyingToMessageId)?.senderName || 'message'}`}
            </span>
          </div>
          <button
            onClick={() => {
              setReplyingTo(null);
              setEditingMessage(null);
              setInputText('');
            }}
            className="p-1 flex-shrink-0"
          >
            <IcX size={18} className="text-gray-500" />
          </button>
        </div>
      )}

      {/* Forward target selector */}
      {forwardingMessageId && (
        <ForwardSelector
          chats={chats}
          currentChatId={chat.id}
          onSelect={handleForwardSelect}
          onCancel={() => setForwardingMessage(null)}
        />
      )}

      {/* Reaction picker */}
      {showReactionPicker && (
        <ReactionPicker
          onSelect={handleReactionSelect}
          onClose={() => { setShowReactionPicker(false); setReactionTargetMsg(null); }}
        />
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
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!inputText.trim()}
          className={`ml-2 p-2 rounded-full flex-shrink-0 ${
            inputText.trim() ? 'bg-[#2AABEE] text-white' : 'bg-gray-200 text-gray-400'
          } transition-colors`}
          aria-label="Send message"
        >
          <IcSend size={20} />
        </button>
      </div>

      {/* Action sheet overlay */}
      {activeActionMsg && chatId && (
        <ActionSheet
          msg={activeActionMsg}
          isMe={activeActionMsg.senderId === user.id}
          chatId={chatId}
          onClose={handleCloseActionSheet}
          onReply={handleReply}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onForward={handleForward}
          onReact={handleReact}
          onPin={handlePin}
        />
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
                className="px-4 py-2 text-[15px] text-gray-600 hover:bg-gray-100 rounded-lg active:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-[15px] text-red-500 font-medium hover:bg-red-50 rounded-lg active:bg-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
