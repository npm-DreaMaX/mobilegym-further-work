// Tab definitions for the main tab bar
export const MAIN_TABS = [
  { id: 'home', route: '/', labelKey: 'tab_home' as const, icon: 'IcTabHome' as const },
  { id: 'category', route: '/categories', labelKey: 'tab_category' as const, icon: 'IcTabCategory' as const },
  { id: 'cart', route: '/cart', labelKey: 'tab_cart' as const, icon: 'IcTabCart' as const },
  { id: 'me', route: '/me', labelKey: 'tab_me' as const, icon: 'IcTabMe' as const },
] as const;

// Sort options for search
export const SORT_OPTIONS = [
  { id: 'comprehensive' as const, labelKey: 'search_sort_comprehensive' as const },
  { id: 'sales' as const, labelKey: 'search_sort_sales' as const },
  { id: 'priceAsc' as const, labelKey: 'search_sort_price_asc' as const },
  { id: 'priceDesc' as const, labelKey: 'search_sort_price_desc' as const },
  { id: 'rating' as const, labelKey: 'search_sort_rating' as const },
] as const;

// Refund reasons
export const REFUND_REASONS = [
  '不喜欢/不想要',
  '商品与描述不符',
  '质量问题',
  '发错货',
  '其他',
] as const;

// Review tags
export const REVIEW_TAGS = [
  '质量好',
  '性价比高',
  '物流快',
  '包装精美',
  '卖家服务好',
  '穿着舒适',
  '效果好',
  '味道好',
] as const;

// Order status tab config
export const ORDER_STATUS_TABS = [
  { id: 'all', labelKey: 'order_all' as const, statuses: ['pending_payment', 'paid', 'to_ship', 'shipped', 'delivered', 'received', 'cancelled'] as const },
  { id: 'pending_payment', labelKey: 'order_pending_payment' as const, statuses: ['pending_payment'] as const },
  { id: 'to_ship', labelKey: 'order_to_ship' as const, statuses: ['paid', 'to_ship'] as const },
  { id: 'shipped', labelKey: 'order_shipped' as const, statuses: ['shipped'] as const },
  { id: 'received', labelKey: 'order_received' as const, statuses: ['delivered', 'received'] as const },
] as const;

export const ORDER_STATUS_LABEL_MAP: Record<string, string> = {
  pending_payment: '待付款',
  paid: '已付款',
  to_ship: '待发货',
  shipped: '已发货',
  delivered: '已送达',
  received: '已完成',
  cancelled: '已取消',
};
