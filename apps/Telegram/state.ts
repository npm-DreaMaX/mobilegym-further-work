// apps/Telegram/state.ts
// Telegram App 状态管理

import { createAppStoreWithActions } from '@/os/createAppStore';
import { now as timeNow } from '@/os/TimeService';
import { TELEGRAM_CONFIG } from './data';
import type { AppData, TelegramSettings, Chat, Message, Contact, GroupMember, Reaction, TelegramSearch } from './types';

// ── 初始状态 ────────────────────────────────────────────────────────
const initialState: AppData & { _temp: { replyingToMessageId: string | null; editingMessageId: string | null; forwardingMessageId: string | null; forwardTargetChatId: string | null; selectedContacts: string[]; newGroupName: string; contextMenuMessageId: string | null } } = {
  user: TELEGRAM_CONFIG.user,
  contacts: TELEGRAM_CONFIG.contacts,
  chats: TELEGRAM_CONFIG.chats,
  archivedChats: TELEGRAM_CONFIG.archivedChats || [],
  settings: TELEGRAM_CONFIG.settings,
  search: TELEGRAM_CONFIG.search,
  _temp: {
    replyingToMessageId: null,
    editingMessageId: null,
    forwardingMessageId: null,
    forwardTargetChatId: null,
    selectedContacts: [],
    newGroupName: '',
    contextMenuMessageId: null,
  },
};

type TelegramState = typeof initialState;
type TelegramActions = {
  // 消息操作
  sendMessage: (chatId: string, content: string) => void;
  editMessage: (chatId: string, messageId: string, newContent: string) => void;
  deleteMessage: (chatId: string, messageId: string) => void;
  replyToMessage: (chatId: string, replyToMessageId: string, content: string) => void;
  forwardMessage: (fromChatId: string, messageId: string, toChatId: string) => void;
  addReaction: (chatId: string, messageId: string, emoji: string) => void;
  removeReaction: (chatId: string, messageId: string, emoji: string) => void;
  pinMessage: (chatId: string, messageId: string) => void;
  unpinMessage: (chatId: string) => void;

  // 聊天操作
  pinChat: (chatId: string) => void;
  unpinChat: (chatId: string) => void;
  muteChat: (chatId: string) => void;
  unmuteChat: (chatId: string) => void;
  archiveChat: (chatId: string) => void;
  unarchiveChat: (chatId: string) => void;
  markChatAsRead: (chatId: string) => void;
  markChatAsUnread: (chatId: string) => void;

  // 群组操作
  createGroup: (name: string, memberIds: string[]) => void;
  updateGroupName: (chatId: string, newName: string) => void;
  addGroupMember: (chatId: string, memberId: string) => void;
  removeGroupMember: (chatId: string, memberId: string) => void;

  // 设置操作
  updateSettings: (patch: Partial<TelegramSettings>) => void;

  // 搜索操作
  setSearchQuery: (query: string, results: string[]) => void;
  clearSearch: () => void;
  addSearchHistory: (query: string) => void;

  // 临时状态
  setReplyingTo: (messageId: string | null) => void;
  setEditingMessage: (messageId: string | null) => void;
  setForwardingMessage: (messageId: string | null, targetChatId?: string | null) => void;
  setContextMenuMessage: (messageId: string | null) => void;
  setSelectedContacts: (contactIds: string[]) => void;
  setNewGroupName: (name: string) => void;
};

// ── Store ──────────────────────────────────────────────────────────
export const useTelegramStore = createAppStoreWithActions<TelegramState, TelegramActions>(
  'telegram',
  initialState,
  (set, get) => ({
    // ── 消息操作 ─────────────────────────────────────────────────────
    sendMessage: (chatId, content) => {
      const now = timeNow();
      const newMessage: Message = {
        id: `msg_sent_${now}`,
        type: 'text',
        content,
        senderId: get().user.id,
        senderName: get().user.name,
        timestamp: now,
        reactions: [],
      };

      set((state) => {
        const chats = state.chats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: newMessage,
              lastActivity: now,
            };
          }
          return chat;
        });
        return { chats };
      });
    },

    editMessage: (chatId, messageId, newContent) => {
      set((state) => {
        const chats = state.chats.map((chat) => {
          if (chat.id === chatId) {
            const messages = chat.messages.map((msg) => {
              if (msg.id === messageId && msg.senderId === state.user.id) {
                return { ...msg, content: newContent, isEdited: true };
              }
              return msg;
            });
            return { ...chat, messages };
          }
          return chat;
        });
        return { chats };
      });
    },

    deleteMessage: (chatId, messageId) => {
      set((state) => {
        const chats = state.chats.map((chat) => {
          if (chat.id === chatId) {
            const messages = chat.messages.filter((msg) => msg.id !== messageId);
            const lastMessage = messages[messages.length - 1] || undefined;
            return { ...chat, messages, lastMessage };
          }
          return chat;
        });
        return { chats };
      });
    },

    replyToMessage: (chatId, replyToMessageId, content) => {
      const now = timeNow();
      const newMessage: Message = {
        id: `msg_reply_${now}`,
        type: 'text',
        content,
        senderId: get().user.id,
        senderName: get().user.name,
        timestamp: now,
        replyToMessageId,
        reactions: [],
      };

      set((state) => {
        const chats = state.chats.map((chat) => {
          if (chat.id === chatId) {
            return {
              ...chat,
              messages: [...chat.messages, newMessage],
              lastMessage: newMessage,
              lastActivity: now,
            };
          }
          return chat;
        });
        return { chats };
      });
    },

    forwardMessage: (fromChatId, messageId, toChatId) => {
      const now = timeNow();
      const state = get();

      // Find source message
      const fromChat = state.chats.find((c) => c.id === fromChatId);
      const sourceMessage = fromChat?.messages.find((m) => m.id === messageId);
      if (!sourceMessage) return;

      const forwardedMessage: Message = {
        id: `msg_forwarded_${now}`,
        type: 'forwarded',
        content: sourceMessage.content,
        senderId: state.user.id,
        senderName: state.user.name,
        timestamp: now,
        forwardedFrom: {
          messageId: sourceMessage.id,
          senderId: sourceMessage.senderId,
          senderName: sourceMessage.senderName || sourceMessage.senderId,
          chatId: fromChatId,
          originalContent: sourceMessage.content,
        },
        reactions: [],
      };

      set((s) => {
        const chats = s.chats.map((chat) => {
          if (chat.id === toChatId) {
            return {
              ...chat,
              messages: [...chat.messages, forwardedMessage],
              lastMessage: forwardedMessage,
              lastActivity: now,
            };
          }
          return chat;
        });
        return { chats };
      });
    },

    addReaction: (chatId, messageId, emoji) => {
      set((state) => {
        const chats = state.chats.map((chat) => {
          if (chat.id === chatId) {
            const messages = chat.messages.map((msg) => {
              if (msg.id === messageId) {
                const existingReaction = msg.reactions.find((r) => r.emoji === emoji);
                let newReactions: Reaction[];
                if (existingReaction) {
                  if (existingReaction.userReacted) {
                    // Remove user reaction
                    newReactions = msg.reactions.map((r) =>
                      r.emoji === emoji ? { ...r, count: r.count - 1, userReacted: false } : r,
                    ).filter((r) => r.count > 0);
                  } else {
                    // Add user reaction
                    newReactions = msg.reactions.map((r) =>
                      r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r,
                    );
                  }
                } else {
                  // New reaction
                  newReactions = [...msg.reactions, { emoji, count: 1, userReacted: true }];
                }
                return { ...msg, reactions: newReactions };
              }
              return msg;
            });
            return { ...chat, messages };
          }
          return chat;
        });
        return { chats };
      });
    },

    removeReaction: (chatId, messageId, emoji) => {
      set((state) => {
        const chats = state.chats.map((chat) => {
          if (chat.id === chatId) {
            const messages = chat.messages.map((msg) => {
              if (msg.id === messageId) {
                const newReactions = msg.reactions
                  .map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, userReacted: false } : r))
                  .filter((r) => r.count > 0);
                return { ...msg, reactions: newReactions };
              }
              return msg;
            });
            return { ...chat, messages };
          }
          return chat;
        });
        return { chats };
      });
    },

    pinMessage: (chatId, messageId) => {
      set((state) => {
        const chats = state.chats.map((chat) => {
          if (chat.id === chatId) {
            const messages = chat.messages.map((msg) => ({
              ...msg,
              isPinned: msg.id === messageId,
            }));
            return { ...chat, messages, pinnedMessageId: messageId };
          }
          return chat;
        });
        return { chats };
      });
    },

    unpinMessage: (chatId) => {
      set((state) => {
        const chats = state.chats.map((chat) => {
          if (chat.id === chatId) {
            const messages = chat.messages.map((msg) => ({
              ...msg,
              isPinned: false,
            }));
            return { ...chat, messages, pinnedMessageId: undefined };
          }
          return chat;
        });
        return { chats };
      });
    },

    // ── 聊天操作 ─────────────────────────────────────────────────────
    pinChat: (chatId) => {
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? { ...chat, pinned: true } : chat,
        ),
      }));
    },

    unpinChat: (chatId) => {
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? { ...chat, pinned: false } : chat,
        ),
      }));
    },

    muteChat: (chatId) => {
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? { ...chat, muted: true } : chat,
        ),
      }));
    },

    unmuteChat: (chatId) => {
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? { ...chat, muted: false } : chat,
        ),
      }));
    },

    archiveChat: (chatId) => {
      const state = get();
      const chatToArchive = state.chats.find((c) => c.id === chatId);
      if (!chatToArchive) return;

      set((s) => ({
        chats: s.chats.filter((c) => c.id !== chatId),
        archivedChats: [...s.archivedChats, { ...chatToArchive, archived: true }],
      }));
    },

    unarchiveChat: (chatId) => {
      const state = get();
      const chatToUnarchive = state.archivedChats.find((c) => c.id === chatId);
      if (!chatToUnarchive) return;

      set((s) => ({
        archivedChats: s.archivedChats.filter((c) => c.id !== chatId),
        chats: [...s.chats, { ...chatToUnarchive, archived: false }],
      }));
    },

    markChatAsRead: (chatId) => {
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? { ...chat, unreadCount: 0, isMarkedUnread: false } : chat,
        ),
      }));
    },

    markChatAsUnread: (chatId) => {
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? { ...chat, isMarkedUnread: true } : chat,
        ),
      }));
    },

    // ── 群组操作 ─────────────────────────────────────────────────────
    createGroup: (name, memberIds) => {
      const now = timeNow();
      const state = get();

      // Build members list including self
      const members: GroupMember[] = [
        { id: state.user.id, name: state.user.name, avatar: state.user.avatar, role: 'owner' },
        ...memberIds.map((id) => {
          const contact = state.contacts.find((c) => c.id === id);
          return {
            id,
            name: contact?.name || id,
            avatar: contact?.avatar || '',
            role: 'member' as const,
          };
        }),
      ];

      const newChat: Chat = {
        id: `chat_group_${now}`,
        type: 'group',
        title: name,
        avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name)}`,
        pinned: false,
        muted: false,
        archived: false,
        unreadCount: 0,
        members,
        createdBy: state.user.id,
        messages: [],
        lastActivity: now,
      };

      set((s) => ({
        chats: [...s.chats, newChat],
      }));

      // Return the new chat ID for navigation
      return newChat.id;
    },

    updateGroupName: (chatId, newName) => {
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId && chat.type === 'group' ? { ...chat, title: newName } : chat,
        ),
      }));
    },

    addGroupMember: (chatId, memberId) => {
      const state = get();
      const contact = state.contacts.find((c) => c.id === memberId);
      if (!contact) return;

      set((s) => ({
        chats: s.chats.map((chat) => {
          if (chat.id === chatId && chat.type === 'group' && chat.members) {
            const newMember: GroupMember = {
              id: contact.id,
              name: contact.name,
              avatar: contact.avatar,
              role: 'member',
            };
            return { ...chat, members: [...chat.members, newMember] };
          }
          return chat;
        }),
      }));
    },

    removeGroupMember: (chatId, memberId) => {
      set((state) => ({
        chats: state.chats.map((chat) => {
          if (chat.id === chatId && chat.type === 'group' && chat.members) {
            return { ...chat, members: chat.members.filter((m) => m.id !== memberId) };
          }
          return chat;
        }),
      }));
    },

    // ── 设置操作 ─────────────────────────────────────────────────────
    updateSettings: (patch) => {
      set((state) => ({
        settings: {
          ...state.settings,
          ...patch,
          notifications: patch.notifications
            ? { ...state.settings.notifications, ...patch.notifications }
            : state.settings.notifications,
          privacy: patch.privacy
            ? { ...state.settings.privacy, ...patch.privacy }
            : state.settings.privacy,
          appearance: patch.appearance
            ? { ...state.settings.appearance, ...patch.appearance }
            : state.settings.appearance,
          data: patch.data ? { ...state.settings.data, ...patch.data } : state.settings.data,
        },
      }));
    },

    // ── 搜索操作 ─────────────────────────────────────────────────────
    setSearchQuery: (query, results) => {
      set({ search: { current: { query, results }, history: get().search.history } });
    },

    clearSearch: () => {
      set({ search: { current: { query: '', results: [] }, history: get().search.history } });
    },

    addSearchHistory: (query) => {
      set((state) => ({
        search: {
          ...state.search,
          history: [query, ...state.search.history.filter((q) => q !== query)].slice(0, 20),
        },
      }));
    },

    // ── 临时状态 ─────────────────────────────────────────────────────
    setReplyingTo: (messageId) => {
      set((state) => ({ _temp: { ...state._temp, replyingToMessageId: messageId } }));
    },

    setEditingMessage: (messageId) => {
      set((state) => ({ _temp: { ...state._temp, editingMessageId: messageId } }));
    },

    setForwardingMessage: (messageId, targetChatId = null) => {
      set((state) => ({
        _temp: { ...state._temp, forwardingMessageId: messageId, forwardTargetChatId: targetChatId },
      }));
    },

    setContextMenuMessage: (messageId) => {
      set((state) => ({ _temp: { ...state._temp, contextMenuMessageId: messageId } }));
    },

    setSelectedContacts: (contactIds) => {
      set((state) => ({ _temp: { ...state._temp, selectedContacts: contactIds } }));
    },

    setNewGroupName: (name) => {
      set((state) => ({ _temp: { ...state._temp, newGroupName: name } }));
    },
  }),
  {
    partialize: (state) => {
      const result: Record<string, any> = {};
      for (const [k, v] of Object.entries(state)) {
        if (typeof v !== 'function' && k !== '_temp') {
          result[k] = v;
        }
      }
      return result;
    },
  },
);

export default useTelegramStore;
