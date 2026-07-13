// apps/Telegram/navigation.declaration.ts
// Telegram 导航声明

import type { NavigationDeclaration } from './navigation.types';

const MAIN_SCROLL: Readonly<{ name: string; direction: 'vertical'; description: string }> = {
  name: 'main',
  direction: 'vertical',
  description: '主滚动容器',
};

export const NAVIGATION_DECLARATION = {
  app: 'telegram',
  capabilities: { historyBack: true },

  routes: [
    // ── 聊天列表（首页/根页面）───────────────────────────────
    {
      path: '/',
      component: 'ChatList',
      params: {},
      entryPoint: 'home',
      scrollContainers: [MAIN_SCROLL],
      description: '聊天列表 — 显示所有活跃的聊天会话',
      queryParams: {},
      uiStates: [
        {
          id: 'home.base',
          search: {},
          description: '默认视图 — 聊天列表',
          actions: [
            { id: 'home.action.search', label: '全局搜索', behavior: 'other' },
            { id: 'home.action.group', label: '创建群组', behavior: 'other' },
          ],
        },
      ],
    },

    // ── 全局搜索 ────────────────────────────────
    {
      path: '/search',
      component: 'GlobalSearch',
      params: {},
      entryPoint: 'none',
      scrollContainers: [MAIN_SCROLL],
      description: '全局搜索 — 搜索聊天、联系人和消息',
      queryParams: {},
      uiStates: [
        {
          id: 'search.base',
          search: {},
          description: '搜索输入和结果视图',
          actions: [
            { id: 'search.action.submit', label: '提交搜索', behavior: 'submit' },
            { id: 'search.action.clear', label: '清除搜索', behavior: 'other' },
          ],
        },
      ],
    },

    // ── 联系人列表 ────────────────────────────────
    {
      path: '/contacts',
      component: 'Contacts',
      params: {},
      entryPoint: 'none',
      scrollContainers: [MAIN_SCROLL],
      description: '联系人列表',
      queryParams: {},
      uiStates: [
        {
          id: 'contacts.base',
          search: {},
          description: '联系人列表默认视图',
          actions: [
            { id: 'contacts.action.search', label: '搜索联系人', behavior: 'other' },
          ],
        },
      ],
    },

    // ── 聊天详情 ────────────────────────────────
    {
      path: '/chat/:chatId',
      component: 'ChatDetail',
      params: { chatId: 'string' },
      entryPoint: 'none',
      scrollContainers: [MAIN_SCROLL],
      description: '聊天消息列表和输入',
      queryParams: {},
      uiStates: [
        {
          id: 'chat.base',
          search: {},
          description: '聊天详情默认视图',
          actions: [
            { id: 'chat.message.send', label: '发送消息', behavior: 'submit' },
            { id: 'chat.action.reply', label: '回复消息', behavior: 'other', scope: 'item', paramsSchema: { messageId: 'string' } },
            { id: 'chat.action.edit', label: '编辑消息', behavior: 'other', scope: 'item', paramsSchema: { messageId: 'string' } },
            { id: 'chat.action.delete', label: '删除消息', behavior: 'other', scope: 'item', paramsSchema: { messageId: 'string' } },
            { id: 'chat.action.forward', label: '转发消息', behavior: 'other', scope: 'item', paramsSchema: { messageId: 'string' } },
            { id: 'chat.action.react', label: '表情回应', behavior: 'other', scope: 'item', paramsSchema: { messageId: 'string', emoji: 'string' } },
            { id: 'chat.action.pin', label: '置顶消息', behavior: 'other', scope: 'item', paramsSchema: { messageId: 'string' } },
            { id: 'chat.search.open', label: '聊天内搜索', behavior: 'other' },
          ],
        },
        {
          id: 'chat.reply',
          search: { action: 'reply' },
          description: '回复消息输入状态',
        },
        {
          id: 'chat.edit',
          search: { action: 'edit' },
          description: '编辑消息输入状态',
        },
      ],
    },

    // ── 聊天内搜索 ────────────────────────────────
    {
      path: '/chat/:chatId/search',
      component: 'ChatSearch',
      params: { chatId: 'string' },
      entryPoint: 'none',
      scrollContainers: [MAIN_SCROLL],
      description: '聊天内搜索 — 在当前聊天中搜索消息',
      queryParams: {},
      uiStates: [
        {
          id: 'chatSearch.base',
          search: {},
          description: '聊天内搜索视图',
          actions: [
            { id: 'chatSearch.action.submit', label: '提交搜索', behavior: 'submit' },
            { id: 'chatSearch.action.clear', label: '清除搜索', behavior: 'other' },
          ],
        },
      ],
    },

    // ── 聊天信息 ────────────────────────────────
    {
      path: '/chat/:chatId/info',
      component: 'ChatInfo',
      params: { chatId: 'string' },
      entryPoint: 'none',
      scrollContainers: [MAIN_SCROLL],
      description: '聊天信息页面 — 静音、置顶、归档等操作',
      queryParams: {},
      uiStates: [
        {
          id: 'chatInfo.base',
          search: {},
          description: '聊天信息默认视图',
          actions: [
            { id: 'chatInfo.action.mute', label: '静音/取消静音', behavior: 'toggle' },
            { id: 'chatInfo.action.pin', label: '置顶/取消置顶', behavior: 'toggle' },
            { id: 'chatInfo.action.archive', label: '归档/取消归档', behavior: 'toggle' },
            { id: 'chatInfo.action.markUnread', label: '标记为未读', behavior: 'other' },
            { id: 'chatInfo.action.groupName', label: '修改群组名称', behavior: 'other', paramsSchema: { newName: 'string' } },
          ],
        },
      ],
    },

    // ── 创建群组 ────────────────────────────────
    {
      path: '/group/create',
      component: 'GroupCreate',
      params: {},
      entryPoint: 'none',
      scrollContainers: [MAIN_SCROLL],
      description: '创建新群组 — 选择成员并设置名称',
      queryParams: {},
      uiStates: [
        {
          id: 'groupCreate.base',
          search: {},
          description: '创建群组 — 成员选择',
          actions: [
            { id: 'groupCreate.action.submit', label: '创建群组', behavior: 'submit' },
          ],
        },
        {
          id: 'groupCreate.name',
          search: { step: 'name' },
          description: '输入群组名称步骤',
        },
      ],
    },

    // ── 设置 ────────────────────────────────
    {
      path: '/settings',
      component: 'Settings',
      params: {},
      entryPoint: 'none',
      scrollContainers: [MAIN_SCROLL],
      description: 'Telegram 设置',
      queryParams: {},
      uiStates: [
        {
          id: 'settings.base',
          search: {},
          description: '设置默认视图',
          actions: [
            { id: 'settings.action.notifications', label: '通知设置', behavior: 'toggle' },
            { id: 'settings.action.privacy', label: '隐私设置', behavior: 'other' },
            { id: 'settings.action.data', label: '数据设置', behavior: 'other' },
            { id: 'settings.action.appearance', label: '外观设置', behavior: 'toggle' },
          ],
        },
      ],
    },

    // ── 已归档聊天 ────────────────────────────────
    {
      path: '/archived',
      component: 'ArchivedChats',
      params: {},
      entryPoint: 'none',
      scrollContainers: [MAIN_SCROLL],
      description: '已归档聊天列表',
      queryParams: {},
      uiStates: [
        {
          id: 'archived.base',
          search: {},
          description: '已归档聊天列表默认视图',
          actions: [],
        },
      ],
    },
  ],

  transitions: [
    // ── Tab 切换（底部标签栏）───────────────────────────
    {
      id: 'tab.chats',
      from: '*',
      to: '/',
      search: {},
      searchParams: {},
      mode: 'replace',
      params: {},
      label: '切换到聊天列表',
      ui: { placement: 'tabbar', icon: 'message-circle', gesture: 'tap' },
    },
    {
      id: 'tab.contacts',
      from: '*',
      to: '/contacts',
      search: {},
      searchParams: {},
      mode: 'replace',
      params: {},
      label: '切换到联系人',
      ui: { placement: 'tabbar', icon: 'users', gesture: 'tap' },
    },
    {
      id: 'tab.settings',
      from: '*',
      to: '/settings',
      search: {},
      searchParams: {},
      mode: 'replace',
      params: {},
      label: '切换到设置',
      ui: { placement: 'tabbar', icon: 'settings', gesture: 'tap' },
    },

    // ── 全局搜索 ────────────────────────────────
    {
      id: 'search.open',
      from: '*',
      to: '/search',
      search: {},
      searchParams: {},
      mode: 'push',
      params: {},
      label: '打开全局搜索',
      ui: { placement: 'topbar', icon: 'search', gesture: 'tap' },
    },

    // ── 聊天详情 ────────────────────────────────
    {
      id: 'chat.open',
      from: '*',
      to: '/chat/:chatId',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { chatId: 'string' },
      label: '打开聊天',
      ui: { placement: 'content', icon: 'message-circle', gesture: 'tap' },
      dataSource: {
        ref: 'chats',
        paramMapping: { chatId: 'id' },
        labelField: 'title',
      },
    },

    // ── 聊天内搜索 ────────────────────────────────
    {
      id: 'chat.search.open',
      from: '*',
      to: '/chat/:chatId/search',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { chatId: 'string' },
      label: '打开聊天内搜索',
      ui: { placement: 'topbar', icon: 'search', gesture: 'tap' },
    },

    // ── 聊天信息 ────────────────────────────────
    {
      id: 'chatInfo.open',
      from: '*',
      to: '/chat/:chatId/info',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { chatId: 'string' },
      label: '打开聊天信息',
      ui: { placement: 'topbar', icon: 'info', gesture: 'tap' },
    },

    // ── 创建群组 ────────────────────────────────
    {
      id: 'groupCreate.open',
      from: '*',
      to: '/group/create',
      search: {},
      searchParams: {},
      mode: 'push',
      params: {},
      label: '创建群组',
      ui: { placement: 'topbar', icon: 'users', gesture: 'tap' },
    },

    // ── 归档 ────────────────────────────────
    {
      id: 'archived.open',
      from: '*',
      to: '/archived',
      search: {},
      searchParams: {},
      mode: 'push',
      params: {},
      label: '打开已归档聊天',
      ui: { placement: 'content', icon: 'archive', gesture: 'tap' },
    },
  ],
} as const satisfies NavigationDeclaration;

// ── 类型导出 ───────────────────────────────────────────────────────
export type TransitionId = (typeof NAVIGATION_DECLARATION.transitions)[number]['id'];
export type RoutePath = Extract<(typeof NAVIGATION_DECLARATION.routes)[number]['path'], string>;
