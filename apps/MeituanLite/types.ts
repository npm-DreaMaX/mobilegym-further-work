/** MeituanLite App 类型定义 */

/** 收货地址（合成数据） */
export interface Address {
  id: string;
  tag: string; // 家 / 公司 / 学校
  contact: string; // 收货人
  phone: string; // 合成手机号
  detail: string; // 小区 + 楼号门牌
}

/** 优惠活动 */
export interface Promotion {
  type: '满减' | '折扣' | '立减';
  text: string; // 展示文案，如 "满30减5"
  rules?: Array<{ threshold: number; discount: number }>; // 满减阶梯
}

/** 商品 */
export interface Product {
  id: string;
  categoryId: string;
  name: string;
  desc?: string;
  price: number;
  packingFee: number;
  monthSales: number;
  goodRate: number; // 好评率 0-100
  emoji: string; // 合成封面 emoji
  hot?: boolean; // 是否热销
}

/** 商家内分类（侧栏） */
export interface ShopCategory {
  id: string;
  name: string; // 热销 / 主食 / 小吃 / 饮品 / 套餐
}

/** 商家 */
export interface Shop {
  id: string;
  name: string;
  emoji: string; // 合成封面 emoji
  coverColor: string; // 合成封面色块
  rating: number; // 评分 4.x
  monthSales: number;
  minOrder: number; // 起送价
  deliveryFee: number; // 配送费
  deliveryTime: number; // 预计分钟
  distance: number; // 距离 km
  tags: string[]; // 满减 / 准时达 / 品牌 / 热销 / 放心吃
  notice: string; // 店铺公告
  promotions: Promotion[];
  categories: ShopCategory[];
  products: Product[];
}

/** 首页横幅 */
export interface Banner {
  id: string;
  emoji: string;
  color: string;
  title: string;
  subtitle: string;
}

/** 购物车项 */
export interface CartItem {
  productId: string;
  qty: number;
}

/** 支付方式 */
export type PaymentMethod = 'balance' | 'bankcard' | 'wechat' | 'alipay';

/** 订单状态 */
export type OrderStatus =
  | '待支付'
  | '商家已接单'
  | '骑手待接单'
  | '配送中'
  | '已完成';

/** 订单中的商品快照 */
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  packingFee: number;
}

/** 订单 */
export interface Order {
  id: string;
  shopId: string;
  shopName: string;
  shopEmoji: string;
  items: OrderItem[];
  subtotal: number; // 商品小计
  deliveryFee: number;
  packingFee: number;
  discount: number; // 优惠减免
  totalPayable: number; // 实付
  addressId: string;
  addressDetail: string;
  contact: string;
  phone: string;
  paymentMethod: PaymentMethod;
  remark: string;
  utensils: number; // 餐具份数，0=不需要
  createdAt: number; // ts
  status: OrderStatus;
  etaText: string; // 预计送达文案
}

/** 用户档案（合成） */
export interface UserProfile {
  name: string;
  phone: string;
  balance: number;
}

/** 设置 */
export interface MeituanLiteSettings {
  utensils: number;
  defaultRemark: string;
}

/** 提交订单时的输入（组件派生后传入 store） */
export interface SubmitOrderInput {
  shopId: string;
  shopName: string;
  shopEmoji: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  packingFee: number;
  discount: number;
  totalPayable: number;
  addressId: string;
  addressDetail: string;
  contact: string;
  phone: string;
  remark: string;
  utensils: number;
  etaText: string;
}
