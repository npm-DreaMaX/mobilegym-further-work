import type { NavigationDeclaration, ScrollContainerDeclaration } from './navigation.types';

const MAIN_SCROLL: ScrollContainerDeclaration[] = [
  { name: 'main', direction: 'vertical', description: 'Main Content Area' },
];

export const NAVIGATION_DECLARATION: NavigationDeclaration = {
  app: 'playstore',
  routes: [
    // ---- Home ----
    {
      path: '/',
      component: 'HomePage',
      params: {},
      entryPoint: 'home',
      scrollContainers: MAIN_SCROLL,
      uiStates: [
        {
          id: 'home.base',
          search: {},
          description: 'Play 商店首页 - 推荐',
          actions: [],
        },
      ],
      queryParams: {},
      description: 'Play 商店首页',
    },
    // ---- Search ----
    {
      path: '/search',
      component: 'SearchPage',
      params: {},
      entryPoint: 'none',
      scrollContainers: MAIN_SCROLL,
      uiStates: [
        {
          id: 'search.base',
          search: {},
          description: '搜索页面',
          actions: [
            { id: 'search.history.clear', label: '清除搜索记录', behavior: 'other', description: '清除搜索历史' },
          ],
        },
      ],
      queryParams: {},
      description: '搜索页面',
    },
    // ---- Categories ----
    {
      path: '/categories',
      component: 'CategoriesPage',
      params: {},
      entryPoint: 'none',
      scrollContainers: MAIN_SCROLL,
      uiStates: [
        {
          id: 'categories.base',
          search: {},
          description: '分类列表页面',
        },
      ],
      queryParams: {},
      description: '分类列表页面',
    },
    // ---- Category Detail ----
    {
      path: '/categories/:categoryId',
      component: 'CategoryDetailPage',
      params: { categoryId: 'string' },
      entryPoint: 'none',
      scrollContainers: MAIN_SCROLL,
      uiStates: [
        {
          id: 'categoryDetail.base',
          search: {},
          description: '分类详情页 - App 列表',
          actions: [],
        },
      ],
      queryParams: {},
      description: '分类详情页',
    },
    // ---- Top Charts ----
    {
      path: '/charts',
      component: 'ChartsPage',
      params: {},
      entryPoint: 'none',
      scrollContainers: MAIN_SCROLL,
      uiStates: [
        {
          id: 'charts.base',
          search: {},
          description: '排行榜页面',
          actions: [],
        },
      ],
      queryParams: {},
      description: '排行榜页面',
    },
    // ---- App Detail ----
    {
      path: '/app/:appId',
      component: 'AppDetailPage',
      params: { appId: 'string' },
      entryPoint: 'none',
      scrollContainers: MAIN_SCROLL,
      uiStates: [
        {
          id: 'appDetail.base',
          search: {},
          description: 'App 详情页',
          actions: [
            { id: 'appDetail.install.invoke', label: '安装', behavior: 'other', description: '点击安装按钮' },
            { id: 'appDetail.update.invoke', label: '更新', behavior: 'other', description: '点击更新按钮' },
            { id: 'appDetail.uninstall.invoke', label: '卸载', behavior: 'other', description: '点击卸载按钮' },
            { id: 'appDetail.cancelDownload.invoke', label: '取消下载', behavior: 'other', description: '点击取消下载按钮' },
            { id: 'appDetail.wishlist.add', label: '加入愿望单', behavior: 'toggle', description: '加入/移出愿望单' },
            { id: 'appDetail.autoUpdate.toggle', label: '自动更新开关', behavior: 'toggle', description: '开关自动更新' },
          ],
        },
      ],
      queryParams: {},
      description: 'App 详情页',
    },
    // ---- Reviews ----
    {
      path: '/app/:appId/reviews',
      component: 'ReviewsPage',
      params: { appId: 'string' },
      entryPoint: 'none',
      scrollContainers: MAIN_SCROLL,
      uiStates: [
        {
          id: 'reviews.base',
          search: {},
          description: '评价列表页',
        },
      ],
      queryParams: {},
      description: '评价列表页',
    },
    // ---- Write/Edit Review ----
    {
      path: '/app/:appId/review/edit',
      component: 'ReviewEditPage',
      params: { appId: 'string' },
      entryPoint: 'none',
      scrollContainers: MAIN_SCROLL,
      uiStates: [
        {
          id: 'reviewEdit.base',
          search: {},
          description: '撰写/编辑评价页',
          actions: [
            { id: 'reviewEdit.rating.set.star', label: '设置评分', behavior: 'other', description: '选择星级评分' },
            { id: 'reviewEdit.content.input.text', label: '输入评价内容', behavior: 'input', description: '输入评价文字', paramsSchema: { value: 'string' } },
            { id: 'reviewEdit.form.submit', label: '提交评价', behavior: 'submit', description: '提交评价' },
            { id: 'reviewEdit.form.delete', label: '删除评价', behavior: 'other', description: '删除自己的评价' },
          ],
        },
      ],
      queryParams: {},
      description: '撰写/编辑评价页',
    },
    // ---- My Apps ----
    {
      path: '/myapps',
      component: 'MyAppsPage',
      params: {},
      entryPoint: 'none',
      scrollContainers: MAIN_SCROLL,
      uiStates: [
        {
          id: 'myApps.base',
          search: { tab: 'installed' },
          description: '我的应用 - 已安装列表',
        },
        {
          id: 'myApps.tab.updates',
          search: { tab: 'updates' },
          description: '我的应用 - 更新列表',
        },
        {
          id: 'myApps.tab.downloads',
          search: { tab: 'downloads' },
          description: '我的应用 - 下载队列',
        },
      ],
      queryParams: {},
      description: '我的应用页面',
    },
    // ---- Wishlist ----
    {
      path: '/wishlist',
      component: 'WishlistPage',
      params: {},
      entryPoint: 'none',
      scrollContainers: MAIN_SCROLL,
      uiStates: [
        {
          id: 'wishlist.base',
          search: {},
          description: '愿望单页面',
        },
      ],
      queryParams: {},
      description: '愿望单页面',
    },
    // ---- Settings ----
    {
      path: '/settings',
      component: 'SettingsPage',
      params: {},
      entryPoint: 'none',
      scrollContainers: MAIN_SCROLL,
      uiStates: [
        {
          id: 'settings.base',
          search: {},
          description: '设置页面',
          actions: [
            { id: 'settings.globalUpdate.select.option', label: '全局自动更新设置', behavior: 'other', description: '选择全局自动更新方式' },
          ],
        },
      ],
      queryParams: {},
      description: '设置页面',
    },
  ],

  transitions: [
    // ---- Tab switching ----
    {
      id: 'tab.home',
      from: ['/myapps', '/wishlist'],
      to: '/',
      search: {},
      searchParams: {},
      mode: 'replace',
      params: {},
      label: '切换到首页',
      ui: { placement: 'tabbar', icon: 'home', gesture: 'tap' },
    },
    {
      id: 'tab.myapps',
      from: ['/', '/wishlist'],
      to: '/myapps',
      search: {},
      searchParams: {},
      mode: 'replace',
      params: {},
      label: '切换到我的应用',
      ui: { placement: 'tabbar', icon: 'apps', gesture: 'tap' },
    },
    {
      id: 'tab.wishlist',
      from: ['/', '/myapps'],
      to: '/wishlist',
      search: {},
      searchParams: {},
      mode: 'replace',
      params: {},
      label: '切换到愿望单',
      ui: { placement: 'tabbar', icon: 'heart', gesture: 'tap' },
    },

    // ---- My Apps tab switching (sub-tabs via search) ----
    {
      id: 'myApps.tab.installed',
      from: '/myapps',
      to: '/myapps',
      search: { tab: 'installed' },
      searchParams: {},
      mode: 'replace',
      params: {},
      label: '已安装',
      ui: { placement: 'content', gesture: 'tap' },
    },
    {
      id: 'myApps.tab.updates',
      from: '/myapps',
      to: '/myapps',
      search: { tab: 'updates' },
      searchParams: {},
      mode: 'replace',
      params: {},
      label: '更新',
      ui: { placement: 'content', gesture: 'tap' },
    },
    {
      id: 'myApps.tab.downloads',
      from: '/myapps',
      to: '/myapps',
      search: { tab: 'downloads' },
      searchParams: {},
      mode: 'replace',
      params: {},
      label: '下载队列',
      ui: { placement: 'content', gesture: 'tap' },
    },

    // ---- Home → Search ----
    {
      id: 'home.search.open',
      from: '/',
      to: '/search',
      search: {},
      searchParams: {},
      mode: 'push',
      params: {},
      label: '打开搜索',
      ui: { placement: 'topbar', gesture: 'tap' },
    },

    // ---- Home → Categories ----
    {
      id: 'home.categories.open',
      from: '/',
      to: '/categories',
      search: {},
      searchParams: {},
      mode: 'push',
      params: {},
      label: '打开分类列表',
      ui: { placement: 'content', gesture: 'tap' },
    },

    // ---- Home → Charts ----
    {
      id: 'home.charts.open',
      from: '/',
      to: '/charts',
      search: {},
      searchParams: {},
      mode: 'push',
      params: {},
      label: '打开排行榜',
      ui: { placement: 'content', gesture: 'tap' },
    },

    // ---- Home → Settings ----
    {
      id: 'home.settings.open',
      from: '/',
      to: '/settings',
      search: {},
      searchParams: {},
      mode: 'push',
      params: {},
      label: '打开设置',
      ui: { placement: 'topbar', gesture: 'tap' },
    },

    // ---- Categories → Category Detail ----
    {
      id: 'categories.detail.open',
      from: '/categories',
      to: '/categories/:categoryId',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { categoryId: 'string' },
      label: '打开分类详情',
      ui: { placement: 'content', gesture: 'tap' },
    },

    // ---- Home → Category Detail (quick access) ----
    {
      id: 'home.category.open',
      from: '/',
      to: '/categories/:categoryId',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { categoryId: 'string' },
      label: '打开分类',
      ui: { placement: 'content', gesture: 'tap' },
    },

    // ---- Home → App Detail ----
    {
      id: 'home.app.open',
      from: '/',
      to: '/app/:appId',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { appId: 'string' },
      label: '打开 App 详情',
      ui: { placement: 'content', gesture: 'tap' },
    },

    // ---- Search → App Detail ----
    {
      id: 'search.app.open',
      from: '/search',
      to: '/app/:appId',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { appId: 'string' },
      label: '打开 App 详情',
      ui: { placement: 'content', gesture: 'tap' },
    },

    // ---- Category Detail → App Detail ----
    {
      id: 'categoryDetail.app.open',
      from: '/categories/:categoryId',
      to: '/app/:appId',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { appId: 'string' },
      label: '打开 App 详情',
      ui: { placement: 'content', gesture: 'tap' },
    },

    // ---- Charts → App Detail ----
    {
      id: 'charts.app.open',
      from: '/charts',
      to: '/app/:appId',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { appId: 'string' },
      label: '打开 App 详情',
      ui: { placement: 'content', gesture: 'tap' },
    },

    // ---- Wishlist → App Detail ----
    {
      id: 'wishlist.app.open',
      from: '/wishlist',
      to: '/app/:appId',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { appId: 'string' },
      label: '打开 App 详情',
      ui: { placement: 'content', gesture: 'tap' },
    },

    // ---- My Apps → App Detail ----
    {
      id: 'myApps.app.open',
      from: '/myapps',
      to: '/app/:appId',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { appId: 'string' },
      label: '打开 App 详情',
      ui: { placement: 'content', gesture: 'tap' },
    },

    // ---- App Detail → Reviews ----
    {
      id: 'appDetail.reviews.open',
      from: '/app/:appId',
      to: '/app/:appId/reviews',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { appId: 'string' },
      label: '查看所有评价',
      ui: { placement: 'content', gesture: 'tap' },
    },

    // ---- Reviews → Write/Edit Review ----
    {
      id: 'reviews.edit.open',
      from: '/app/:appId/reviews',
      to: '/app/:appId/review/edit',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { appId: 'string' },
      label: '撰写评价',
      ui: { placement: 'content', gesture: 'tap' },
    },

    // ---- App Detail → Write/Edit Review ----
    {
      id: 'appDetail.review.edit',
      from: '/app/:appId',
      to: '/app/:appId/review/edit',
      search: {},
      searchParams: {},
      mode: 'push',
      params: { appId: 'string' },
      label: '撰写/编辑评价',
      ui: { placement: 'content', gesture: 'tap' },
    },

    // ---- My Apps → Settings ----
    {
      id: 'myApps.settings.open',
      from: '/myapps',
      to: '/settings',
      search: {},
      searchParams: {},
      mode: 'push',
      params: {},
      label: '打开设置',
      ui: { placement: 'topbar', gesture: 'tap' },
    },
  ],

  capabilities: {
    historyBack: true,
  },
};
