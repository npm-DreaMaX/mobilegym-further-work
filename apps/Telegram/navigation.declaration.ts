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
    // ── 首页：聊天列表 ────────────────────────────────
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
            { id: 'home.menu.search', label: '搜索', behavior: 'other', ui: { placement: 'topbar', icon: 'search' } },
            { id: 'home.menu.group', label: '创建群组', behavior: 'other', ui: { placement: 'topbar', icon: 'users' } },
          ],
        },
        {
          id: 'home.search',
          search: { search: 'open' },
          description: '全局搜索栏 — 搜索联系人和聊天',
        },
        {
          id: 'home.menu.more',
          search: { menu: 'more' },
          description: '更多菜单',
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
          actions: [],
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
            { id: 'chat.message.send', label: '发送消息', behavior: 'submit', ui: { placement: 'content', icon: 'send' } },
            { id: 'chat.action.reply', label: '回复消息', behavior: 'other', scope: 'item', paramsSchema: { messageId: 'string' }, ui: { placement: 'content', icon: 'reply' } },
            { id: 'chat.action.edit', label: '编辑消息', behavior: 'other', scope: 'item', paramsSchema: { messageId: 'string', newText: 'string' }, ui: { placement: 'content', icon: 'edit' } },
            { id: 'chat.action.delete', label: '删除消息', behavior: 'other', scope: 'item', paramsSchema: { messageId: 'string' }, ui: { placement: 'content', icon: 'trash' } },
            { id: 'chat.action.forward', label: '转发消息', behavior: 'other', scope: 'item', paramsSchema: { messageId: 'string' }, ui: { placement: 'content', icon: 'share' } },
            { id: 'chat.action.react', label: '表情回应', behavior: 'other', scope: 'item', paramsSchema: { messageId: 'string', emoji: 'string' }, ui: { placement: 'content', icon: 'smile' } },
            { id: 'chat.action.pin', label: '置顶消息', behavior: 'other', scope: 'item', paramsSchema: { messageId: 'string' }, ui: { placement: 'content', icon: 'pin' } },
            { id: 'chat.message.longpress', label: '长按消息菜单', behavior: 'other', scope: 'item', paramsSchema: { messageId: 'string' }, ui: { placement: 'content', icon: 'menu' } },
            { id: 'chat.search.open', label: '聊天内搜索', behavior: 'other', ui: { placement: 'topbar', icon: 'search' } },
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
        {
          id: 'chat.forward',
          search: { action: 'forward' },
          description: '转发消息选择目标',
        },
        {
          id: 'chat.search',
          search: { view: 'search' },
          description: '聊天内搜索',
        },
      ],
    },

    // ── 聊天设置/信息 ────────────────────────────────
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
            { id: 'chatInfo.action.mute', label: '静音/取消静音', behavior: 'toggle', ui: { placement: 'content', icon: 'bell-off' } },
            { id: 'chatInfo.action.pin', label: '置顶/取消置顶', behavior: 'toggle', ui: { placement: 'content', icon: 'pin' } },
            { id: 'chatInfo.action.archive', label: '归档/取消归档', behavior: 'toggle', ui: { placement: 'content', icon: 'archive' } },
            { id: 'chatInfo.action.markUnread', label: '标记为未读', behavior: 'other', ui: { placement: 'content', icon: 'message-square' } },
            { id: 'chatInfo.action.groupName', label: '修改群组名称', behavior: 'other', paramsSchema: { newName: 'string' }, ui: { placement: 'content', icon: 'edit' } },
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
            { id: 'groupCreate.action.submit', label: '创建群组', behavior: 'submit', ui: { placement: 'topbar', icon: 'check' } },
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
          actions: [],
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
    // ── Tab 切换 ────────────────────────────────
    {
      id: 'tab.chats',
      from: ['/contacts', '/settings'],
      to: '/',
      search: {},
      searchParams: {},
      mode: 'replace',
      params: {},
      label: '切换到聊天列表',
      ui: { placement: 'topbar', icon: 'message-circle', gesture: 'tap' },
    },
    {
      id: 'tab.contacts',
      from: ['/', '/chat/:chatId'],
      to: '/contacts',
      search: {},
      searchParams: {},
      mode: 'replace',
      params: {},
      label: '切换到联系人',
      ui: { placement: 'topbar', icon: 'users', gesture: 'tap' },
    },
    {
      id: 'tab.settings',
      from: ['/contacts', '/'],
      to: '/settings',
      search: {},
      searchParams: {},
      mode: 'replace',
      params: {},
      label: '切换到设置',
      ui: { placement: 'topbar', icon: 'settings', gesture: 'tap' },
    },

    // ── 从首页到聊天详情 ────────────────────────────────
    {
      id: 'chat.open',
      from: ['/', '/archived', '/chat/:chatId'],
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

    // ── 搜索 ────────────────────────────────
    {
      id: 'home.search.open',
      from: '/',
      to: '/',
      search: { search: 'open' },
      searchParams: {},
      mode: 'replace',
      params: {},
      label: '打开全局搜索',
      ui: { placement: 'topbar', icon: 'search', gesture: 'tap' },
    },
    {
      id: 'home.search.close',
      from: { path: '/', search: { search: 'open' } },
      to: '/',
      search: {},
      searchParams: {},
      mode: 'replace',
      params: {},
      label: '关闭搜索',
      ui: { placement: 'topbar', icon: 'x', gesture: 'tap' },
    },
    {
      id: 'chat.search.open',
      from: '/chat/:chatId',
      to: '/chat/:chatId',
      search: { view: 'search' },
      searchParams: {},
      mode: 'replace',
      params: { chatId: 'string' },
      label: '打开聊天内搜索',
      ui: { placement: 'topbar', icon: 'search', gesture: 'tap' },
    },
    {
      id: 'chat.search.close',
      from: { path: '/chat/:chatId', search: { view: 'search' } },
      to: '/chat/:chatId',
      search: {},
      searchParams: {},
      mode: 'replace',
      params: { chatId: 'string' },
      label: '关闭聊天内搜索',
      ui: { placement: 'topbar', icon: 'x', gesture: 'tap' },
    },

    // ── 聊天信息/设置 ────────────────────────────────
    {
      id: 'chatInfo.open',
      from: '/chat/:chatId',
      to: '/chat/:chatId/info',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { chatId: 'string' },
      label: '打开聊天信息',
      ui: { placement: 'content', icon: 'info', gesture: 'tap' },
    },

    // ── 创建群组 ────────────────────────────────
    {
      id: 'groupCreate.open',
      from: '/',
      to: '/group/create',
      search: {},
      searchParams: {},
      mode: 'push',
      params: {},
      label: '创建群组',
      ui: { placement: 'topbar', icon: 'users', gesture: 'tap' },
    },
    {
      id: 'groupCreate.name.submit',
      from: { path: '/group/create', search: { step: 'name' } },
      to: '/',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { chatId: 'string' },
      label: '提交群组名称并打开新群组',
      ui: { placement: 'topbar', icon: 'check', gesture: 'tap' },
    },

    // ── 归档 ────────────────────────────────
    {
      id: 'archived.open',
      from: '/',
      to: '/archived',
      search: {},
      searchParams: {},
      mode: 'push',
      params: {},
      label: '打开已归档聊天',
      ui: { placement: 'content', icon: 'archive', gesture: 'tap' },
    },

    // ── Forward 选择目标 ────────────────────────────────
    {
      id: 'forward.target.open',
      from: { path: '/chat/:chatId', search: { action: 'forward' } },
      to: '/contacts',
      search: { action: 'forward' },
      searchParams: { chatId: 'string' },
      mode: 'push',
      params: { chatId: 'string' },
      label: '选择转发目标',
      ui: { placement: 'content', icon: 'share', gesture: 'tap' },
    },

    // ── Reply 到聊天 ────────────────────────────────
    {
      id: 'chat.reply.open',
      from: '/chat/:chatId',
      to: '/chat/:chatId',
      search: { action: 'reply' },
      searchParams: { messageId: 'string' },
      mode: 'replace',
      params: { chatId: 'string' },
      label: '打开回复输入框',
      ui: { placement: 'content', icon: 'reply', gesture: 'tap' },
    },
  ],
} as const satisfies NavigationDeclaration;

// ── 类型导出 ───────────────────────────────────────────────────────
export type TransitionId = (typeof NAVIGATION_DECLARATION.transitions)[number]['id'];
export type RoutePath = Extract<(typeof NAVIGATION_DECLARATION.routes)[number]['path'], string>;
