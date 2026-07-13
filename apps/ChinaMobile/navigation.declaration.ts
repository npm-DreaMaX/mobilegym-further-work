/**
 * ChinaMobile (中国移动) 导航声明
 */

import type { NavigationDeclaration } from './navigation.types';

export type TransitionId =
  // main tabs
  | 'tab.home'
  | 'tab.mall'
  | 'tab.me'
  // home quick entries
  | 'home.balance.open'
  | 'home.data.open'
  | 'home.voice.open'
  | 'home.plan.open'
  | 'home.recharge.open'
  | 'home.datapack.open'
  | 'home.bill.open'
  | 'home.services.open'
  | 'home.family.open'
  | 'home.search.open'
  | 'home.orders.open'
  // me entries
  | 'me.profile.open'
  | 'me.orders.open'
  | 'me.bill.open'
  | 'me.family.open'
  | 'me.services.open'
  | 'me.autopay.open'
  | 'me.roaming.open'
  | 'me.settings.open'
  | 'me.recharge.open'
  // mall entries
  | 'mall.planchange.open'
  // plan
  | 'plan.change.open'
  // bill
  | 'bill.detail.open'
  // dialog-opening transitions (URL-driven via searchParams)
  | 'recharge.confirm.dialog.open'
  | 'datapack.confirm.dialog.open'
  | 'planchange.confirm.dialog.open'
  | 'bill.pay.dialog.open'
  | 'family.add.open'
  | 'family.delete.dialog.open';

export type ActionId =
  | 'recharge.amount.select'
  | 'recharge.method.select'
  | 'recharge.confirm.submit'
  | 'datapack.confirm.submit'
  | 'planchange.plan.select'
  | 'planchange.confirm.submit'
  | 'bill.pay.confirm.submit'
  | 'service.status.toggle'
  | 'roaming.enabled.toggle'
  | 'autopay.enable.toggle'
  | 'autopay.method.select'
  | 'autopay.save.submit'
  | 'family.add.submit'
  | 'family.delete.submit'
  | 'email.save.submit'
  | 'search.query.submit'
  | 'search.query.clear'
  | 'settings.dataalert.toggle'
  | 'settings.marketing.toggle'
  | 'settings.theme.toggle';

const MAIN_SCROLL = [{ name: 'main', direction: 'vertical' as const, description: '页面主滚动容器' }];

export const NAVIGATION_DECLARATION: NavigationDeclaration = {
  app: 'chinamobile',
  routes: [
    {
      path: '/',
      component: 'HomePage',
      params: {},
      entryPoint: 'home',
      uiStates: [{ id: 'home.base', search: {}, description: '首页：用量 dashboard + 快捷入口', actions: [] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '首页（话费/流量/套餐 dashboard + 快捷入口）',
    },
    {
      path: '/mall',
      component: 'MallPage',
      params: {},
      entryPoint: 'none',
      uiStates: [
        { id: 'mall.base', search: {}, description: '商城：流量包办理 + 套餐变更入口', actions: [] },
        { id: 'mall.dialog.buy', search: { dialog: 'buyPack' }, description: '购买流量包确认弹窗', actions: [
          { id: 'datapack.confirm.submit', label: '确认购买流量包', behavior: 'submit', scope: 'item', paramsSchema: { packId: 'string' } },
        ] },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '商城（流量包 + 套餐变更入口）',
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
      path: '/balance',
      component: 'BalancePage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'balance.base', search: {}, description: '话费余额详情', actions: [] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '话费余额页',
    },
    {
      path: '/data',
      component: 'DataUsagePage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'data.base', search: {}, description: '流量用量详情', actions: [] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '流量用量页',
    },
    {
      path: '/voice',
      component: 'VoiceUsagePage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'voice.base', search: {}, description: '语音用量详情', actions: [] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '语音用量页',
    },
    {
      path: '/plan',
      component: 'PlanDetailPage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'plan.base', search: {}, description: '当前套餐详情', actions: [] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '套餐详情页',
    },
    {
      path: '/plan/change',
      component: 'PlanChangePage',
      params: {},
      entryPoint: 'none',
      uiStates: [
        { id: 'planchange.base', search: {}, description: '套餐变更选择页', actions: [
          { id: 'planchange.plan.select', label: '选择套餐', behavior: 'other', scope: 'item', paramsSchema: { planId: 'string' } },
        ] },
        { id: 'planchange.dialog.confirm', search: { dialog: 'confirm' }, description: '套餐变更确认弹窗', actions: [
          { id: 'planchange.confirm.submit', label: '确认变更套餐', behavior: 'submit', scope: 'item', paramsSchema: { planId: 'string' } },
        ] },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '基础套餐变更页',
    },
    {
      path: '/bill',
      component: 'BillPage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'bill.base', search: {}, description: '月度账单列表', actions: [] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '月度账单页',
    },
    {
      path: '/bill/detail/:id',
      component: 'BillDetailPage',
      params: { id: 'string' },
      entryPoint: 'none',
      uiStates: [
        { id: 'billdetail.base', search: {}, description: '账单明细', actions: [] },
        { id: 'billdetail.dialog.pay', search: { dialog: 'payBill' }, description: '缴费确认弹窗', actions: [
          { id: 'bill.pay.confirm.submit', label: '确认缴费', behavior: 'submit', scope: 'item', paramsSchema: { billId: 'string' } },
        ] },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '账单明细页',
    },
    {
      path: '/recharge',
      component: 'RechargePage',
      params: {},
      entryPoint: 'none',
      uiStates: [
        { id: 'recharge.base', search: {}, description: '话费充值页', actions: [
          { id: 'recharge.amount.select', label: '选择充值金额', behavior: 'other', scope: 'item', paramsSchema: { amount: 'number' } },
          { id: 'recharge.method.select', label: '选择支付方式', behavior: 'other', scope: 'item', paramsSchema: { methodId: 'string' } },
        ] },
        { id: 'recharge.dialog.confirm', search: { dialog: 'confirm' }, description: '充值确认弹窗', actions: [
          { id: 'recharge.confirm.submit', label: '确认充值', behavior: 'submit', scope: 'item', paramsSchema: { amount: 'number' } },
        ] },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '话费充值页',
    },
    {
      path: '/services',
      component: 'SubscribedServicesPage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'services.base', search: {}, description: '已订业务列表', actions: [
        { id: 'service.status.toggle', label: '切换增值业务开关', behavior: 'toggle', scope: 'item', paramsSchema: { serviceId: 'string' } },
      ] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '已订购服务页',
    },
    {
      path: '/roaming',
      component: 'RoamingPage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'roaming.base', search: {}, description: '国际漫游设置', actions: [
        { id: 'roaming.enabled.toggle', label: '切换国际漫游', behavior: 'toggle' },
      ] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '国际漫游页',
    },
    {
      path: '/autopay',
      component: 'AutopayPage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'autopay.base', search: {}, description: '自动缴费设置', actions: [
        { id: 'autopay.enable.toggle', label: '切换自动缴费', behavior: 'toggle' },
        { id: 'autopay.method.select', label: '选择缴费方式', behavior: 'other', scope: 'item', paramsSchema: { methodId: 'string' } },
        { id: 'autopay.save.submit', label: '保存自动缴费设置', behavior: 'submit' },
      ] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '自动缴费页',
    },
    {
      path: '/family',
      component: 'FamilyPage',
      params: {},
      entryPoint: 'none',
      uiStates: [
        { id: 'family.base', search: {}, description: '亲情号码列表', actions: [] },
        { id: 'family.dialog.add', search: { dialog: 'addFam' }, description: '添加亲情号码弹窗', actions: [
          { id: 'family.add.submit', label: '添加亲情号码', behavior: 'submit' },
        ] },
        { id: 'family.dialog.delete', search: { dialog: 'deleteFam' }, description: '删除亲情号码确认弹窗', actions: [
          { id: 'family.delete.submit', label: '确认删除亲情号码', behavior: 'other', scope: 'item', paramsSchema: { familyId: 'string' } },
        ] },
      ],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '亲情号码页',
    },
    {
      path: '/search',
      component: 'ServiceSearchPage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'search.base', search: {}, description: '服务搜索页', actions: [
        { id: 'search.query.submit', label: '提交搜索', behavior: 'submit' },
        { id: 'search.query.clear', label: '清空搜索', behavior: 'other' },
      ] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '服务搜索页',
    },
    {
      path: '/profile',
      component: 'ProfilePage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'profile.base', search: {}, description: '个人资料页', actions: [] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '个人资料页',
    },
    {
      path: '/profile/email',
      component: 'EmailEditPage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'profileemail.base', search: {}, description: '编辑联系邮箱', actions: [
        { id: 'email.save.submit', label: '保存邮箱', behavior: 'submit' },
      ] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '电子邮箱修改页',
    },
    {
      path: '/orders',
      component: 'OrdersPage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'orders.base', search: {}, description: '交易/操作记录', actions: [] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '交易记录页',
    },
    {
      path: '/settings',
      component: 'SettingsPage',
      params: {},
      entryPoint: 'none',
      uiStates: [{ id: 'settings.base', search: {}, description: '设置页', actions: [
        { id: 'settings.dataalert.toggle', label: '切换流量预警', behavior: 'toggle' },
        { id: 'settings.marketing.toggle', label: '切换营销推送', behavior: 'toggle' },
        { id: 'settings.theme.toggle', label: '切换深色模式', behavior: 'toggle' },
      ] }],
      queryParams: {},
      scrollContainers: MAIN_SCROLL,
      description: '设置页',
    },
  ],
  transitions: [
    // ── main tabs ──
    { id: 'tab.home', from: ['/mall', '/me'], to: '/', search: {}, searchParams: {}, mode: 'replace', params: {}, label: '首页', ui: { placement: 'tabbar', icon: 'home', gesture: 'tap' } },
    { id: 'tab.mall', from: ['/', '/me'], to: '/mall', search: {}, searchParams: {}, mode: 'replace', params: {}, label: '商城', ui: { placement: 'tabbar', icon: 'mall', gesture: 'tap' } },
    { id: 'tab.me', from: ['/', '/mall'], to: '/me', search: {}, searchParams: {}, mode: 'replace', params: {}, label: '我的', ui: { placement: 'tabbar', icon: 'me', gesture: 'tap' } },

    // ── home entries ──
    { id: 'home.balance.open', from: '/', to: '/balance', search: {}, searchParams: {}, mode: 'push', params: {}, label: '话费余额', ui: { placement: 'content', icon: 'wallet', gesture: 'tap' } },
    { id: 'home.data.open', from: '/', to: '/data', search: {}, searchParams: {}, mode: 'push', params: {}, label: '流量用量', ui: { placement: 'content', icon: 'data', gesture: 'tap' } },
    { id: 'home.voice.open', from: '/', to: '/voice', search: {}, searchParams: {}, mode: 'push', params: {}, label: '语音用量', ui: { placement: 'content', icon: 'voice', gesture: 'tap' } },
    { id: 'home.plan.open', from: '/', to: '/plan', search: {}, searchParams: {}, mode: 'push', params: {}, label: '套餐详情', ui: { placement: 'content', icon: 'plan', gesture: 'tap' } },
    { id: 'home.recharge.open', from: ['/', '/balance'], to: '/recharge', search: {}, searchParams: {}, mode: 'push', params: {}, label: '充值', ui: { placement: 'content', icon: 'wallet', gesture: 'tap' } },
    { id: 'home.datapack.open', from: '/', to: '/mall', search: {}, searchParams: {}, mode: 'push', params: {}, label: '流量包', ui: { placement: 'content', icon: 'datapack', gesture: 'tap' } },
    { id: 'home.bill.open', from: '/', to: '/bill', search: {}, searchParams: {}, mode: 'push', params: {}, label: '账单', ui: { placement: 'content', icon: 'bill', gesture: 'tap' } },
    { id: 'home.services.open', from: '/', to: '/services', search: {}, searchParams: {}, mode: 'push', params: {}, label: '已订业务', ui: { placement: 'content', icon: 'services', gesture: 'tap' } },
    { id: 'home.family.open', from: '/', to: '/family', search: {}, searchParams: {}, mode: 'push', params: {}, label: '亲情号码', ui: { placement: 'content', icon: 'family', gesture: 'tap' } },
    { id: 'home.search.open', from: '/', to: '/search', search: {}, searchParams: {}, mode: 'push', params: {}, label: '服务搜索', ui: { placement: 'content', icon: 'search', gesture: 'tap' } },
    { id: 'home.orders.open', from: '/', to: '/orders', search: {}, searchParams: {}, mode: 'push', params: {}, label: '交易记录', ui: { placement: 'content', icon: 'file', gesture: 'tap' } },

    // ── me entries ──
    { id: 'me.profile.open', from: '/me', to: '/profile', search: {}, searchParams: {}, mode: 'push', params: {}, label: '个人资料', ui: { placement: 'content', icon: 'user', gesture: 'tap' } },
    { id: 'me.orders.open', from: '/me', to: '/orders', search: {}, searchParams: {}, mode: 'push', params: {}, label: '交易记录', ui: { placement: 'content', icon: 'file', gesture: 'tap' } },
    { id: 'me.bill.open', from: '/me', to: '/bill', search: {}, searchParams: {}, mode: 'push', params: {}, label: '账单', ui: { placement: 'content', icon: 'bill', gesture: 'tap' } },
    { id: 'me.family.open', from: '/me', to: '/family', search: {}, searchParams: {}, mode: 'push', params: {}, label: '亲情号码', ui: { placement: 'content', icon: 'family', gesture: 'tap' } },
    { id: 'me.services.open', from: '/me', to: '/services', search: {}, searchParams: {}, mode: 'push', params: {}, label: '已订业务', ui: { placement: 'content', icon: 'services', gesture: 'tap' } },
    { id: 'me.autopay.open', from: '/me', to: '/autopay', search: {}, searchParams: {}, mode: 'push', params: {}, label: '自动缴费', ui: { placement: 'content', icon: 'autopay', gesture: 'tap' } },
    { id: 'me.roaming.open', from: '/me', to: '/roaming', search: {}, searchParams: {}, mode: 'push', params: {}, label: '国际漫游', ui: { placement: 'content', icon: 'globe', gesture: 'tap' } },
    { id: 'me.settings.open', from: '/me', to: '/settings', search: {}, searchParams: {}, mode: 'push', params: {}, label: '设置', ui: { placement: 'content', icon: 'settings', gesture: 'tap' } },
    { id: 'me.recharge.open', from: '/me', to: '/recharge', search: {}, searchParams: {}, mode: 'push', params: {}, label: '充值', ui: { placement: 'content', icon: 'wallet', gesture: 'tap' } },

    // ── mall ──
    { id: 'mall.planchange.open', from: '/mall', to: '/plan/change', search: {}, searchParams: {}, mode: 'push', params: {}, label: '套餐变更', ui: { placement: 'content', icon: 'plan', gesture: 'tap' } },

    // ── plan ──
    { id: 'plan.change.open', from: '/plan', to: '/plan/change', search: {}, searchParams: {}, mode: 'push', params: {}, label: '变更套餐', ui: { placement: 'content', icon: 'edit', gesture: 'tap' } },

    // ── bill ──
    { id: 'bill.detail.open', from: '/bill', to: '/bill/detail/:id', search: {}, searchParams: { id: 'string' }, mode: 'push', params: {}, label: '账单明细', ui: { placement: 'content', icon: 'file', gesture: 'tap' } },

    // ── dialog-opening transitions ──
    { id: 'recharge.confirm.dialog.open', from: '/recharge', to: '/recharge', search: { dialog: 'confirm' }, searchParams: { amount: 'number' }, mode: 'push', params: {}, label: '充值确认', ui: { placement: 'content', icon: '', gesture: 'tap' } },
    { id: 'datapack.confirm.dialog.open', from: '/mall', to: '/mall', search: { dialog: 'buyPack' }, searchParams: { packId: 'string' }, mode: 'push', params: {}, label: '购买流量包确认', ui: { placement: 'content', icon: '', gesture: 'tap' } },
    { id: 'planchange.confirm.dialog.open', from: '/plan/change', to: '/plan/change', search: { dialog: 'confirm' }, searchParams: { planId: 'string' }, mode: 'push', params: {}, label: '套餐变更确认', ui: { placement: 'content', icon: '', gesture: 'tap' } },
    { id: 'bill.pay.dialog.open', from: '/bill/detail/:id', to: '/bill/detail/:id', search: { dialog: 'payBill' }, searchParams: { billId: 'string' }, mode: 'push', params: {}, label: '缴费确认', ui: { placement: 'content', icon: '', gesture: 'tap' } },
    { id: 'family.add.open', from: '/family', to: '/family', search: { dialog: 'addFam' }, searchParams: {}, mode: 'push', params: {}, label: '添加亲情号码', ui: { placement: 'content', icon: 'plus', gesture: 'tap' } },
    { id: 'family.delete.dialog.open', from: '/family', to: '/family', search: { dialog: 'deleteFam' }, searchParams: { id: 'string' }, mode: 'push', params: {}, label: '删除亲情号码确认', ui: { placement: 'content', icon: '', gesture: 'tap' } },

    // ── profile ──
    { id: 'profile.email.open', from: '/profile', to: '/profile/email', search: {}, searchParams: {}, mode: 'push', params: {}, label: '修改邮箱', ui: { placement: 'content', icon: 'edit', gesture: 'tap' } },
  ],
  capabilities: { historyBack: true },
};
