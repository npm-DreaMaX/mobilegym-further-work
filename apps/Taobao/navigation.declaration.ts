import type { NavigationDeclaration, ScrollContainerDeclaration } from './navigation.types';

const MAIN_SCROLL: ScrollContainerDeclaration[] = [
  { name: 'main', direction: 'vertical', description: 'Main Content Area' },
];

export const NAVIGATION_DECLARATION: NavigationDeclaration = {
  app: 'taobao',
  routes: [
    // ---- Home ----
    {
      path: '/', component: 'HomePage', params: {}, entryPoint: 'home',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [{ id: 'home.base', search: {}, description: '淘宝首页' }],
      description: '淘宝首页',
    },
    // ---- Categories ----
    {
      path: '/categories', component: 'CategoriesPage', params: {}, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [{ id: 'categories.base', search: {}, description: '分类页面' }],
      description: '分类页面',
    },
    // ---- Search ----
    {
      path: '/search', component: 'SearchPage', params: {}, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: { q: 'string', category: 'string' },
      uiStates: [
        {
          id: 'search.base', search: {}, description: '搜索页面',
          actions: [
            { id: 'search.sort.select.option', label: '打开排序菜单', behavior: 'select', description: '选择排序选项' },
            { id: 'search.filter.open.drawer', label: '打开筛选', behavior: 'other', description: '打开筛选面板' },
          ],
        },
      ],
      description: '搜索页面',
    },
    // ---- Product Detail ----
    {
      path: '/item/:id', component: 'ProductDetailPage', params: { id: 'string' }, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [
        {
          id: 'item.base', search: {}, description: '商品详情',
          actions: [
            { id: 'item.sku.select.option', label: '选择SKU', behavior: 'select', description: '选择商品规格' },
            { id: 'item.quantity.set.value', label: '设置数量', behavior: 'input', description: '设置购买数量', paramsSchema: { value: 'number' } },
            { id: 'item.cart.add.submit', label: '加入购物车', behavior: 'submit', description: '加入购物车' },
            { id: 'item.buy.now.submit', label: '立即购买', behavior: 'submit', description: '立即购买' },
            { id: 'item.favorite.toggle', label: '收藏/取消收藏', behavior: 'toggle', description: '收藏或取消收藏商品' },
            { id: 'item.shop.enter.nav', label: '进入店铺', behavior: 'other', description: '进入店铺页面' },
          ],
        },
      ],
      description: '商品详情页',
    },
    // ---- Cart ----
    {
      path: '/cart', component: 'CartPage', params: {}, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [
        {
          id: 'cart.base', search: {}, description: '购物车',
          actions: [
            { id: 'cart.item.select.toggle', label: '勾选/取消购物车项', behavior: 'toggle', scope: 'item', paramsSchema: { itemId: 'string' }, description: '勾选或取消购物车商品' },
            { id: 'cart.item.quantity.set', label: '修改数量', behavior: 'input', scope: 'item', paramsSchema: { itemId: 'string', value: 'number' }, description: '修改购物车商品数量' },
            { id: 'cart.item.delete.confirm', label: '删除购物车项', behavior: 'other', scope: 'item', paramsSchema: { itemId: 'string' }, description: '删除购物车商品' },
            { id: 'cart.selectAll.toggle', label: '全选/取消全选', behavior: 'toggle', description: '全选或取消全选购物车' },
          ],
        },
      ],
      description: '购物车页面',
    },
    // ---- Checkout ----
    {
      path: '/checkout', component: 'CheckoutPage', params: {}, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [
        {
          id: 'checkout.base', search: {}, description: '确认订单',
          actions: [
            { id: 'checkout.address.select.open', label: '选择地址', behavior: 'other', description: '选择收货地址' },
            { id: 'checkout.coupon.select.open', label: '选择优惠券', behavior: 'other', description: '选择优惠券' },
            { id: 'checkout.shipping.select.method', label: '选择配送方式', behavior: 'select', description: '选择配送方式' },
            { id: 'checkout.order.submit.go', label: '提交订单', behavior: 'submit', description: '提交订单' },
          ],
        },
      ],
      description: '结算页面',
    },
    // ---- Payment ----
    {
      path: '/payment/:orderId', component: 'PaymentPage', params: { orderId: 'string' }, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [
        {
          id: 'payment.base', search: {}, description: '支付页面',
          actions: [
            { id: 'payment.order.pay.confirm', label: '确认支付', behavior: 'submit', description: '确认支付' },
          ],
        },
      ],
      description: '支付页面',
    },
    // ---- Orders ----
    {
      path: '/orders', component: 'OrdersPage', params: {}, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [
        { id: 'orders.base', search: {}, description: '我的订单' },
        { id: 'orders.tab.all', search: { tab: 'all' }, description: '全部订单' },
        { id: 'orders.tab.pending', search: { tab: 'pending_payment' }, description: '待付款' },
        { id: 'orders.tab.toShip', search: { tab: 'to_ship' }, description: '待发货' },
        { id: 'orders.tab.shipped', search: { tab: 'shipped' }, description: '待收货' },
        { id: 'orders.tab.received', search: { tab: 'received' }, description: '已完成' },
      ],
      description: '我的订单页',
    },
    // ---- Order Detail ----
    {
      path: '/order/:id', component: 'OrderDetailPage', params: { id: 'string' }, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [
        {
          id: 'orderDetail.base', search: {}, description: '订单详情',
          actions: [
            { id: 'orderDetail.order.pay.go', label: '去支付', behavior: 'submit', description: '去支付' },
            { id: 'orderDetail.order.cancel.go', label: '取消订单', behavior: 'submit', description: '取消订单' },
            { id: 'orderDetail.order.receipt.confirm', label: '确认收货', behavior: 'submit', description: '确认收货' },
            { id: 'orderDetail.logistics.track.open', label: '查看物流', behavior: 'other', description: '查看物流详情' },
            { id: 'orderDetail.refund.request.open', label: '申请退款', behavior: 'other', description: '申请退款' },
            { id: 'orderDetail.review.write.open', label: '评价', behavior: 'other', description: '评价商品' },
          ],
        },
      ],
      description: '订单详情页',
    },
    // ---- Logistics ----
    {
      path: '/logistics/:orderId', component: 'LogisticsPage', params: { orderId: 'string' }, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [{ id: 'logistics.base', search: {}, description: '物流详情' }],
      description: '物流详情页',
    },
    // ---- Refund ----
    {
      path: '/refund/:orderId/:itemId', component: 'RefundPage', params: { orderId: 'string', itemId: 'string' }, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [
        {
          id: 'refund.base', search: {}, description: '申请退款',
          actions: [
            { id: 'refund.reason.select.option', label: '选择退款原因', behavior: 'select', description: '选择退款原因' },
            { id: 'refund.note.input.value', label: '填写说明', behavior: 'input', description: '填写退款说明', paramsSchema: { value: 'string' } },
            { id: 'refund.request.submit.go', label: '提交退款', behavior: 'submit', description: '提交退款申请' },
          ],
        },
      ],
      description: '退款页面',
    },
    // ---- Review ----
    {
      path: '/review/:orderId/:itemId', component: 'ReviewPage', params: { orderId: 'string', itemId: 'string' }, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [
        {
          id: 'review.base', search: {}, description: '评价',
          actions: [
            { id: 'review.rating.select.star', label: '选择评分', behavior: 'select', description: '选择星级评分' },
            { id: 'review.content.input.text', label: '填写评价', behavior: 'input', description: '填写评价内容', paramsSchema: { value: 'string' } },
            { id: 'review.tags.select.item', label: '选择标签', behavior: 'select', description: '选择评价标签' },
            { id: 'review.content.submit.go', label: '提交评价', behavior: 'submit', description: '提交评价' },
          ],
        },
      ],
      description: '评价页面',
    },
    // ---- Me / Profile ----
    {
      path: '/me', component: 'MePage', params: {}, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [{ id: 'me.base', search: {}, description: '我的淘宝' }],
      description: '我的淘宝页面',
    },
    // ---- Favorites ----
    {
      path: '/favorites', component: 'FavoritesPage', params: {}, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [{ id: 'favorites.base', search: {}, description: '我的收藏' }],
      description: '收藏页面',
    },
    // ---- Coupons ----
    {
      path: '/coupons', component: 'CouponsPage', params: {}, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [
        {
          id: 'coupons.base', search: {}, description: '优惠券',
          actions: [
            { id: 'coupon.item.claim.submit', label: '领取优惠券', behavior: 'submit', scope: 'item', paramsSchema: { couponId: 'string' }, description: '领取优惠券' },
          ],
        },
      ],
      description: '优惠券页面',
    },
    // ---- Addresses ----
    {
      path: '/addresses', component: 'AddressesPage', params: {}, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [
        {
          id: 'addresses.base', search: {}, description: '收货地址',
          actions: [
            { id: 'address.item.default.set', label: '设为默认', behavior: 'toggle', scope: 'item', paramsSchema: { addressId: 'string' }, description: '设为默认地址' },
            { id: 'address.item.delete.confirm', label: '删除地址', behavior: 'other', scope: 'item', paramsSchema: { addressId: 'string' }, description: '删除地址' },
          ],
        },
      ],
      description: '收货地址页面',
    },
    // ---- Address Edit ----
    {
      path: '/address/edit', component: 'AddressEditPage', params: {}, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: { id: 'string' },
      uiStates: [
        {
          id: 'addressEdit.base', search: {}, description: '编辑地址',
          actions: [
            { id: 'addressEdit.form.save.submit', label: '保存地址', behavior: 'submit', description: '保存收货地址' },
          ],
        },
      ],
      description: '编辑地址页面',
    },
    // ---- Settings ----
    {
      path: '/settings', component: 'SettingsPage', params: {}, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [{ id: 'settings.base', search: {}, description: '设置' }],
      description: '设置页面',
    },
    // ---- Shop ----
    {
      path: '/shop/:id', component: 'ShopPage', params: { id: 'string' }, entryPoint: 'none',
      scrollContainers: MAIN_SCROLL, queryParams: {},
      uiStates: [{ id: 'shop.base', search: {}, description: '店铺页面' }],
      description: '店铺页面',
    },
  ],

  transitions: [
    // ---- Tab switching ----
    { id: 'tab.home', from: ['/categories', '/cart', '/me'], to: '/', search: {}, searchParams: {}, mode: 'replace', params: {}, label: '切换到首页', ui: { placement: 'tabbar', icon: 'home', gesture: 'tap' } },
    { id: 'tab.category', from: ['/', '/cart', '/me'], to: '/categories', search: {}, searchParams: {}, mode: 'replace', params: {}, label: '切换到分类', ui: { placement: 'tabbar', icon: 'grid', gesture: 'tap' } },
    { id: 'tab.cart', from: ['/', '/categories', '/me'], to: '/cart', search: {}, searchParams: {}, mode: 'replace', params: {}, label: '切换到购物车', ui: { placement: 'tabbar', icon: 'cart', gesture: 'tap' } },
    { id: 'tab.me', from: ['/', '/categories', '/cart'], to: '/me', search: {}, searchParams: {}, mode: 'replace', params: {}, label: '切换到我的', ui: { placement: 'tabbar', icon: 'user', gesture: 'tap' } },

    // ---- Home -> sub pages ----
    { id: 'home.search.open', from: '/', to: '/search', search: {}, searchParams: {}, mode: 'push', params: {}, label: '打开搜索', ui: { placement: 'topbar', icon: 'search', gesture: 'tap' } },
    { id: 'home.item.open', from: '/', to: '/item/:id', search: {}, searchParams: {}, mode: 'push', params: { id: 'string' }, label: '打开商品详情', ui: { placement: 'content', icon: 'package', gesture: 'tap' } },
    { id: 'home.category.open', from: '/', to: '/categories', search: {}, searchParams: {}, mode: 'push', params: {}, label: '打开分类', ui: { placement: 'content', icon: 'grid', gesture: 'tap' } },

    // ---- Search -> item ----
    { id: 'search.item.open', from: ['/search', '/shop/:id'], to: '/item/:id', search: {}, searchParams: {}, mode: 'push', params: { id: 'string' }, label: '打开商品详情', ui: { placement: 'content', icon: 'package', gesture: 'tap' } },

    // ---- Categories -> item / shop ----
    { id: 'category.item.open', from: '/categories', to: '/item/:id', search: {}, searchParams: {}, mode: 'push', params: { id: 'string' }, label: '打开商品详情', ui: { placement: 'content', icon: 'package', gesture: 'tap' } },
    { id: 'category.shop.open', from: '/categories', to: '/shop/:id', search: {}, searchParams: {}, mode: 'push', params: { id: 'string' }, label: '打开店铺', ui: { placement: 'content', icon: 'shop', gesture: 'tap' } },

    // ---- Item -> shop ----
    { id: 'item.shop.open', from: '/item/:id', to: '/shop/:id', search: {}, searchParams: {}, mode: 'push', params: { id: 'string' }, label: '进入店铺', ui: { placement: 'content', icon: 'shop', gesture: 'tap' } },

    // ---- Cart -> checkout ----
    { id: 'cart.checkout.open', from: ['/cart', '/item/:id'], to: '/checkout', search: {}, searchParams: {}, mode: 'push', params: {}, label: '去结算', ui: { placement: 'content', icon: 'cart', gesture: 'tap' } },

    // ---- Checkout -> payment ----
    { id: 'checkout.payment.open', from: ['/checkout', '/orders'], to: '/payment/:orderId', search: {}, searchParams: {}, mode: 'push', params: { orderId: 'string' }, label: '去支付', ui: { placement: 'content', icon: 'payment', gesture: 'tap' } },

    // ---- Checkout -> address selection ----
    { id: 'checkout.address.select.open', from: '/checkout', to: '/addresses', search: {}, searchParams: {}, mode: 'push', params: {}, label: '选择地址', ui: { placement: 'content', icon: 'location', gesture: 'tap' } },

    // ---- Checkout -> coupon selection ----
    { id: 'checkout.coupon.select.open', from: '/checkout', to: '/coupons', search: {}, searchParams: {}, mode: 'push', params: {}, label: '选择优惠券', ui: { placement: 'content', icon: 'coupon', gesture: 'tap' } },

    // ---- Item -> cart (for buy now flow: item -> cart -> checkout) ----
    { id: 'item.cart.checkout.open', from: '/item/:id', to: '/cart', search: {}, searchParams: {}, mode: 'push', params: {}, label: '去购物车结算', ui: { placement: 'content', icon: 'cart', gesture: 'tap' } },

    // ---- Me -> sub pages ----
    { id: 'me.orders.open', from: '/me', to: '/orders', search: {}, searchParams: {}, mode: 'push', params: {}, label: '查看订单', ui: { placement: 'content', icon: 'order', gesture: 'tap' } },
    { id: 'me.favorites.open', from: '/me', to: '/favorites', search: {}, searchParams: {}, mode: 'push', params: {}, label: '查看收藏', ui: { placement: 'content', icon: 'heart', gesture: 'tap' } },
    { id: 'me.coupons.open', from: '/me', to: '/coupons', search: {}, searchParams: {}, mode: 'push', params: {}, label: '查看优惠券', ui: { placement: 'content', icon: 'coupon', gesture: 'tap' } },
    { id: 'me.addresses.open', from: '/me', to: '/addresses', search: {}, searchParams: {}, mode: 'push', params: {}, label: '查看地址', ui: { placement: 'content', icon: 'location', gesture: 'tap' } },
    { id: 'me.settings.open', from: '/me', to: '/settings', search: {}, searchParams: {}, mode: 'push', params: {}, label: '打开设置', ui: { placement: 'content', icon: 'settings', gesture: 'tap' } },

    // ---- Addresses -> edit ----
    { id: 'address.edit.open', from: '/addresses', to: '/address/edit', search: {}, searchParams: {}, mode: 'push', params: {}, label: '编辑地址', ui: { placement: 'content', icon: 'edit', gesture: 'tap' } },
    { id: 'address.add.open', from: '/addresses', to: '/address/edit', search: {}, searchParams: {}, mode: 'push', params: {}, label: '新增地址', ui: { placement: 'content', icon: 'plus', gesture: 'tap' } },

    // ---- Orders -> detail ----
    { id: 'order.detail.open', from: '/orders', to: '/order/:id', search: {}, searchParams: {}, mode: 'push', params: { id: 'string' }, label: '查看订单详情', ui: { placement: 'content', icon: 'order', gesture: 'tap' } },

    // ---- Order detail -> logistics / refund / review ----
    { id: 'orderDetail.logistics.open', from: ['/order/:id', '/orders'], to: '/logistics/:id', search: {}, searchParams: {}, mode: 'push', params: { id: 'string' }, label: '查看物流', ui: { placement: 'content', icon: 'truck', gesture: 'tap' } },
    { id: 'orderDetail.refund.open', from: '/order/:id', to: '/refund/:id/:itemId', search: {}, searchParams: {}, mode: 'push', params: { id: 'string', itemId: 'string' }, label: '申请退款', ui: { placement: 'content', icon: 'refresh', gesture: 'tap' } },
    { id: 'orderDetail.review.open', from: ['/order/:id', '/orders'], to: '/review/:id/:itemId', search: {}, searchParams: {}, mode: 'push', params: { id: 'string', itemId: 'string' }, label: '评价', ui: { placement: 'content', icon: 'star', gesture: 'tap' } },

    // ---- Payment -> orders (after success) ----
    { id: 'payment.orders.open', from: '/payment/:orderId', to: '/orders', search: {}, searchParams: {}, mode: 'push', params: {}, label: '查看订单', ui: { placement: 'content', icon: 'order', gesture: 'tap' } },

    // ---- Favorites -> item ----
    { id: 'favorites.item.open', from: '/favorites', to: '/item/:id', search: {}, searchParams: {}, mode: 'push', params: { id: 'string' }, label: '打开商品详情', ui: { placement: 'content', icon: 'package', gesture: 'tap' } },

    // ---- Cart tab accessible from item detail (for navigation after adding to cart) ----
    { id: 'tab.cart.fromItem', from: '/item/:id', to: '/cart', search: {}, searchParams: {}, mode: 'replace', params: {}, label: '切换到购物车', ui: { placement: 'tabbar', icon: 'cart', gesture: 'tap' } },
  ],

  capabilities: {
    historyBack: true,
  },
};
