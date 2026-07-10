import { MEITUAN_LITE_CONSTANTS, HOME_CATEGORIES, TABS, SHOP_TAG_COLORS } from '../constants';
import defaults from './defaults.json';
import type { Shop, Address, Banner, UserProfile, Order, Product } from '../types';

export type { Shop, Address, Banner, UserProfile, Order, Product, CartItem, PaymentMethod, OrderStatus, OrderItem, SubmitOrderInput, MeituanLiteSettings, Promotion, ShopCategory } from '../types';

const d = defaults as any;

const shops = d.shops as Shop[];
const addresses = d.addresses as Address[];
const banners = d.banners as Banner[];
const userProfile = d.userProfile as UserProfile;
const initialOrders = (d.orders ?? []) as Order[];
const hotKeywords = d.hotKeywords as string[];

export const MEITUAN_LITE_CONFIG = {
  ...MEITUAN_LITE_CONSTANTS,
  shops,
  addresses,
  banners,
  userProfile,
  orders: initialOrders,
  hotKeywords,
} as const;

/** 商家按 id 查找 */
export const SHOP_BY_ID: Record<string, Shop> = Object.fromEntries(
  shops.map((s) => [s.id, s]),
);

/** 商品按 id 查找（跨商家，product id 全局唯一） */
export const PRODUCT_BY_ID: Record<string, Product> = {};
for (const s of shops) {
  for (const p of s.products) {
    PRODUCT_BY_ID[p.id] = p;
  }
}

/** 默认收货地址 id */
export const DEFAULT_ADDRESS_ID: string = addresses[0]?.id ?? '';

export { HOME_CATEGORIES, TABS, SHOP_TAG_COLORS };
