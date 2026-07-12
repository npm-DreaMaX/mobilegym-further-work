/**
 * Cainiao 导航声明
 */

import type { NavigationDeclaration } from './navigation.types';

export type TransitionId =
  // main tabs
  | 'tab.home'
  | 'tab.send'
  | 'tab.me'
  // home filter (within /)
  | 'home.filter.all'
  | 'home.filter.in_transit'
  | 'home.filter.arrived'
  | 'home.filter.picked'
  // home entries
  | 'home.search.open'
  | 'home.package.open'
  | 'home.notifications.open'
  // send tab entries
  | 'send.create.open'
  | 'send.records.open'
  // send records
  | 'send.record.open'
  // me entries
  | 'me.profile.edit.open'
  | 'me.address.open'
  | 'me.sendRecords.open'
  | 'me.notifications.open'
  | 'me.settings.open'
  // address
  | 'address.add.open'
  | 'address.edit.open'
  | 'address.delete.dialog.open'
  // notifications
  | 'notification.open';

export type ActionId =
  | 'package.pickup.confirm'
  | 'search.query.submit'
  | 'search.query.clear'
  | 'send.form.submit'
  | 'address.record.save'
  | 'address.record.update'
  | 'address.record.delete'
  | 'address.record.setDefault'
  | 'notification.item.markRead'
  | 'notification.detail.markRead'
  | 'notification.item.archive'
  | 'profile.record.save'
  | 'settings.alert.pickup.toggle'
  | 'settings.alert.transit.toggle'
  | 'settings.alert.arrival.toggle'
  | 'settings.theme.toggle';

const MAIN_SCROLL = [{ name: 'main', direction: 'vertical' as const, description: '页面主滚动容器' }];

export const NAVIGATION_DECLARATION: NavigationDeclaration = {
  app: 'cainiao',
  routes: [
    {
      path: '/',
      component: 'HomePage',
      params: {},
      entryPoint: 'home',
      uiStates: [
        { id: 'home.base', search: {}, description: '首页：全部包裹列表', actions: [] },
        { id: 'home.filter.in_transit', search: { filter: 'in_transit' }, description: '首页筛选：运输中', actions: [] },
        { id: 'home.filter.arrived', search: { filter: 'arrived_station' }, description: '首页筛选：待取件', actions: [] },
        { id: 'home.filter.picked', search: { filter: 'picked_up' }, description: '首页筛选：已签收', actions: [] },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '首页（包裹列表 + 搜索 + 筛选）',
    },
    {
      path: '/search',
      component: 'SearchPage',
      params: {},
      entryPoint: 'none',
      uiStates: [
        {
          id: 'search.base',
          search: {},
          description: '查件页（运单号搜索）',
          actions: [
            { id: 'search.query.submit', label: '提交搜索', behavior: 'submit' },
            { id: 'search.query.clear', label: '清空搜索', behavior: 'other' },
          ],
        },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '运单号搜索页',
    },
    {
      path: '/package/:id',
      component: 'PackageDetailPage',
      params: { id: 'string' },
      entryPoint: 'none',
      uiStates: [
        {
          id: 'package.base',
          search: {},
          description: '包裹物流详情',
          actions: [
            { id: 'package.pickup.confirm', label: '确认取件', behavior: 'other', scope: 'item', paramsSchema: { packageId: 'string' } },
          ],
        },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '包裹详情（物流时间线 + 取件信息）',
    },
    {
      path: '/send',
      component: 'SendPage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'send.base', search: {}, description: '寄件 tab 首页', actions: [] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '寄件入口页',
    },
    {
      path: '/send/create',
      component: 'SendCreatePage',
      params: {},
      entryPoint: 'none',
      uiStates: [
        {
          id: 'sendcreate.base',
          search: {},
          description: '寄快递表单页',
          actions: [
            { id: 'send.form.submit', label: '提交寄件订单', behavior: 'submit' },
          ],
        },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '寄快递表单',
    },
    {
      path: '/send/records',
      component: 'SendRecordsPage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'records.base', search: {}, description: '寄件记录列表', actions: [] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '寄件记录页',
    },
    {
      path: '/send/record/:id',
      component: 'SendRecordDetailPage',
      params: { id: 'string' },
      entryPoint: 'none',
      uiStates: [{ id: 'srecord.base', search: {}, description: '寄件订单详情', actions: [] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '寄件订单详情',
    },
    {
      path: '/me',
      component: 'MePage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'me.base', search: {}, description: '我的页', actions: [] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '我的（个人中心入口）',
    },
    {
      path: '/address',
      component: 'AddressBookPage',
      params: {},
      entryPoint: 'none',
      uiStates: [
        {
          id: 'address.base',
          search: {},
          description: '地址簿列表',
          actions: [
            { id: 'address.record.setDefault', label: '设为默认地址', behavior: 'other', scope: 'item', paramsSchema: { addressId: 'string' } },
          ],
        },
        {
          id: 'address.dialog.delete',
          search: { dialog: 'deleteAddr' },
          description: '删除地址确认弹窗',
          actions: [
            { id: 'address.record.delete', label: '确认删除地址', behavior: 'other', scope: 'item', paramsSchema: { addressId: 'string' } },
          ],
        },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '地址簿',
    },
    {
      path: '/address/edit',
      component: 'AddressEditPage',
      params: {},
      entryPoint: 'none',
      uiStates: [
        {
          id: 'addresscreate.base',
          search: {},
          description: '新增地址表单',
          actions: [
            { id: 'address.record.save', label: '保存地址', behavior: 'submit' },
          ],
        },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '新增地址页',
    },
    {
      path: '/address/edit/:id',
      component: 'AddressEditPage',
      params: { id: 'string' },
      entryPoint: 'none',
      uiStates: [
        {
          id: 'addressedit.base',
          search: {},
          description: '编辑地址表单',
          actions: [
            { id: 'address.record.update', label: '保存地址修改', behavior: 'submit' },
          ],
        },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '编辑地址页',
    },
    {
      path: '/notifications',
      component: 'NotificationsPage',
      params: {},
      entryPoint: 'none',
      uiStates: [
        {
          id: 'notifications.base',
          search: {},
          description: '消息通知列表',
          actions: [
            { id: 'notification.item.markRead', label: '标记通知已读', behavior: 'other', scope: 'item', paramsSchema: { notificationId: 'string' } },
            { id: 'notification.item.archive', label: '归档通知', behavior: 'other', scope: 'item', paramsSchema: { notificationId: 'string' } },
          ],
        },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '消息通知页',
    },
    {
      path: '/notification/:id',
      component: 'NotificationDetailPage',
      params: { id: 'string' },
      entryPoint: 'none',
      uiStates: [
        {
          id: 'ndetail.base',
          search: {},
          description: '通知详情',
          actions: [
            { id: 'notification.detail.markRead', label: '标记通知已读', behavior: 'other', scope: 'item', paramsSchema: { notificationId: 'string' } },
          ],
        },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '通知详情页',
    },
    {
      path: '/profile/edit',
      component: 'ProfileEditPage',
      params: {},
      entryPoint: 'none',
      uiStates: [
        {
          id: 'profileedit.base',
          search: {},
          description: '编辑个人资料',
          actions: [
            { id: 'profile.record.save', label: '保存资料', behavior: 'submit' },
          ],
        },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '编辑资料页',
    },
    {
      path: '/settings',
      component: 'SettingsPage',
      params: {},
      entryPoint: 'none',
      uiStates: [
        {
          id: 'settings.base',
          search: {},
          description: '设置页',
          actions: [
            { id: 'settings.alert.pickup.toggle', label: '切换取件提醒', behavior: 'toggle' },
            { id: 'settings.alert.transit.toggle', label: '切换运输提醒', behavior: 'toggle' },
            { id: 'settings.alert.arrival.toggle', label: '切换到达提醒', behavior: 'toggle' },
            { id: 'settings.theme.toggle', label: '切换深色模式', behavior: 'toggle' },
          ],
        },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '设置页',
    },
  ],
  transitions: [
    // ── main tabs ──
    { id: 'tab.home', from: ['/send', '/me'], to: '/', search: {}, searchParams: {}, mode: 'replace', params: {}, label: '首页', ui: { placement: 'tabbar', icon: 'home', gesture: 'tap' } },
    { id: 'tab.send', from: ['/', '/me'], to: '/send', search: {}, searchParams: {}, mode: 'replace', params: {}, label: '寄件', ui: { placement: 'tabbar', icon: 'send', gesture: 'tap' } },
    { id: 'tab.me', from: ['/', '/send'], to: '/me', search: {}, searchParams: {}, mode: 'replace', params: {}, label: '我的', ui: { placement: 'tabbar', icon: 'me', gesture: 'tap' } },

    // ── home filter ──
    { id: 'home.filter.all', from: [{ path: '/', search: { filter: 'in_transit' } }, { path: '/', search: { filter: 'arrived_station' } }, { path: '/', search: { filter: 'picked_up' } }], to: '/', search: {}, searchParams: {}, mode: 'replace', params: {}, label: '筛选：全部', ui: { placement: 'content', icon: '', gesture: 'tap' } },
    { id: 'home.filter.in_transit', from: '/', to: '/', search: { filter: 'in_transit' }, searchParams: {}, mode: 'replace', params: {}, label: '筛选：运输中', ui: { placement: 'content', icon: '', gesture: 'tap' } },
    { id: 'home.filter.arrived', from: '/', to: '/', search: { filter: 'arrived_station' }, searchParams: {}, mode: 'replace', params: {}, label: '筛选：待取件', ui: { placement: 'content', icon: '', gesture: 'tap' } },
    { id: 'home.filter.picked', from: '/', to: '/', search: { filter: 'picked_up' }, searchParams: {}, mode: 'replace', params: {}, label: '筛选：已签收', ui: { placement: 'content', icon: '', gesture: 'tap' } },

    // ── home entries ──
    { id: 'home.search.open', from: '/', to: '/search', search: {}, searchParams: {}, mode: 'push', params: {}, label: '查件', ui: { placement: 'content', icon: 'search', gesture: 'tap' } },
    { id: 'home.package.open', from: ['/', '/search'], to: '/package/:id', search: {}, searchParams: { id: 'string' }, mode: 'push', params: {}, label: '包裹详情', ui: { placement: 'content', icon: '', gesture: 'tap' } },
    { id: 'home.notifications.open', from: '/', to: '/notifications', search: {}, searchParams: {}, mode: 'push', params: {}, label: '消息通知', ui: { placement: 'content', icon: 'bell', gesture: 'tap' } },

    // ── send tab entries ──
    { id: 'send.create.open', from: '/send', to: '/send/create', search: {}, searchParams: {}, mode: 'push', params: {}, label: '寄快递', ui: { placement: 'content', icon: 'plus', gesture: 'tap' } },
    { id: 'send.records.open', from: '/send', to: '/send/records', search: {}, searchParams: {}, mode: 'push', params: {}, label: '寄件记录', ui: { placement: 'content', icon: 'file', gesture: 'tap' } },

    // ── send records ──
    { id: 'send.record.open', from: '/send/records', to: '/send/record/:id', search: {}, searchParams: { id: 'string' }, mode: 'push', params: {}, label: '寄件订单详情', ui: { placement: 'content', icon: '', gesture: 'tap' } },

    // ── me entries ──
    { id: 'me.profile.edit.open', from: '/me', to: '/profile/edit', search: {}, searchParams: {}, mode: 'push', params: {}, label: '编辑资料', ui: { placement: 'content', icon: 'edit', gesture: 'tap' } },
    { id: 'me.address.open', from: '/me', to: '/address', search: {}, searchParams: {}, mode: 'push', params: {}, label: '地址簿', ui: { placement: 'content', icon: 'map', gesture: 'tap' } },
    { id: 'me.sendRecords.open', from: '/me', to: '/send/records', search: {}, searchParams: {}, mode: 'push', params: {}, label: '我的寄件', ui: { placement: 'content', icon: 'file', gesture: 'tap' } },
    { id: 'me.notifications.open', from: '/me', to: '/notifications', search: {}, searchParams: {}, mode: 'push', params: {}, label: '消息通知', ui: { placement: 'content', icon: 'bell', gesture: 'tap' } },
    { id: 'me.settings.open', from: '/me', to: '/settings', search: {}, searchParams: {}, mode: 'push', params: {}, label: '设置', ui: { placement: 'content', icon: 'settings', gesture: 'tap' } },

    // ── address ──
    { id: 'address.add.open', from: '/address', to: '/address/edit', search: {}, searchParams: {}, mode: 'push', params: {}, label: '新增地址', ui: { placement: 'content', icon: 'plus', gesture: 'tap' } },
    { id: 'address.edit.open', from: '/address', to: '/address/edit/:id', search: {}, searchParams: { id: 'string' }, mode: 'push', params: {}, label: '编辑地址', ui: { placement: 'content', icon: 'edit', gesture: 'tap' } },
    { id: 'address.delete.dialog.open', from: '/address', to: '/address', search: { dialog: 'deleteAddr' }, searchParams: { id: 'string' }, mode: 'push', params: {}, label: '删除地址确认', ui: { placement: 'content', icon: '', gesture: 'tap' } },

    // ── notifications ──
    { id: 'notification.open', from: '/notifications', to: '/notification/:id', search: {}, searchParams: { id: 'string' }, mode: 'push', params: {}, label: '通知详情', ui: { placement: 'content', icon: '', gesture: 'tap' } },
  ],
  capabilities: { historyBack: true },
};
