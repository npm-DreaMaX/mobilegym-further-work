/**
 * MeituanLite 字符串资源 — 对应 AOSP res/values/strings.xml
 */
export const strings = {
  app_name: '美团Lite',

  // ── 通用 ──────────────────────────────────────────────
  back: '返回',
  cancel: '取消',
  confirm: '确认',
  submit: '提交',
  pay: '支付',
  yuan: '¥',
  free: '免',
  empty: '暂无数据',

  // ── Tab ───────────────────────────────────────────────
  tab_home: '首页',
  tab_orders: '订单',
  tab_me: '我的',

  // ── 首页 ──────────────────────────────────────────────
  home_search_placeholder: '搜索商家、商品名称',
  home_nearby: '附近商家',
  home_banner_hongbao: '红包雨来袭 最高领88元',
  home_location_hint: '当前位置',

  // ── 分类 ──────────────────────────────────────────────
  cat_food: '美食',
  cat_drink: '甜点饮品',
  cat_store: '超市便利',
  cat_medicine: '买药',
  cat_fruit: '水果',
  cat_errand: '跑腿',
  cat_breakfast: '早餐',
  cat_night: '夜宵',

  // ── 商家列表 / 详情 ──────────────────────────────────
  shop_month_sales: '月售',
  shop_min_order: '起送',
  shop_delivery_fee: '配送费',
  shop_delivery_time: '分钟',
  shop_distance_km: 'km',
  shop_notice: '公告',
  shop_promotion: '优惠',
  shop_rating: '评分',
  shop_good_rate: '好评',
  shop_sold: '已售',
  shop_add: '加入购物车',
  shop_category_hot: '热销',
  shop_back_to_home: '返回首页',

  // ── 购物车 ────────────────────────────────────────────
  cart_title: '购物车',
  cart_empty: '购物车是空的',
  cart_clear: '清空购物车',
  cart_subtotal: '商品小计',
  cart_packing: '包装费',
  cart_delivery: '配送费',
  cart_discount: '优惠减免',
  cart_diff_to_min: '还差¥{0}起送',
  cart_go_checkout: '去结算',
  cart_item_count: '件',

  // ── 结算 ──────────────────────────────────────────────
  checkout_title: '确认订单',
  checkout_address: '收货地址',
  checkout_no_address: '请选择收货地址',
  checkout_delivery_time: '配送时间',
  checkout_asap: '立即送出',
  checkout_remark: '订单备注',
  checkout_remark_placeholder: '口味、偏好等（选填）',
  checkout_utensils: '餐具份数',
  checkout_utensils_none: '不需要餐具',
  checkout_utensils_n: '{0}份',
  checkout_items: '商品明细',
  checkout_payable: '实付',
  checkout_submit: '提交订单',
  checkout_contact: '联系人',
  checkout_eta: '预计送达',

  // ── 支付 ──────────────────────────────────────────────
  pay_title: '确认支付',
  pay_amount: '支付金额',
  pay_method: '支付方式',
  pay_method_balance: '余额支付',
  pay_method_bankcard: '银行卡支付',
  pay_method_wechat: '微信支付',
  pay_method_alipay: '支付宝',
  pay_balance: '余额',
  pay_simulated_notice: '模拟支付，不会产生真实扣款',
  pay_confirm: '确认支付',
  pay_success: '支付成功',

  // ── 支付成功 ──────────────────────────────────────────
  pay_success_title: '支付成功',
  pay_success_order_no: '订单号',
  pay_success_eta: '预计送达',
  pay_success_status: '商家已接单',
  pay_success_view_order: '查看订单',
  pay_success_back_home: '返回首页',

  // ── 订单 ──────────────────────────────────────────────
  orders_title: '我的订单',
  orders_empty: '暂无订单，去首页逛逛吧',
  orders_status_pending: '待支付',
  orders_status_accepted: '商家已接单',
  orders_status_rider: '骑手待接单',
  orders_status_delivering: '配送中',
  orders_status_done: '已完成',
  order_detail_title: '订单详情',
  order_status: '订单状态',
  order_shop: '商家',
  order_items: '商品',
  order_address: '收货地址',
  order_pay_method: '支付方式',
  order_time: '下单时间',
  order_total: '订单金额',
  order_again: '再来一单',

  // ── 我的 ──────────────────────────────────────────────
  me_title: '我的',
  me_orders: '我的订单',
  me_wallet: '我的钱包',
  me_balance: '账户余额',
  me_address: '收货地址',
  me_service: '客服中心',
  me_settings: '设置',
  me_simulated_user: '模拟用户',
} as const;

export type StringKey = keyof typeof strings;
