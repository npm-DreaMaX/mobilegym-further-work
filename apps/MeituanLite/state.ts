import { createAppStoreWithActions, memoSelector } from '../../os/createAppStore';
import { now as timeNow } from '../../os/TimeService';
import {
  MEITUAN_LITE_CONFIG,
  PRODUCT_BY_ID,
  SHOP_BY_ID,
  DEFAULT_ADDRESS_ID,
} from './data';
import type {
  Address,
  CartItem,
  MeituanLiteSettings,
  Order,
  OrderItem,
  PaymentMethod,
  SubmitOrderInput,
  UserProfile,
} from './types';

export interface MeituanLiteState {
  addressId: string;
  cart: CartItem[];
  cartShopId: string | null;
  orders: Order[];
  paymentMethod: PaymentMethod;
  userProfile: UserProfile;
  settings: MeituanLiteSettings;
  _temp: {
    // 易失：仅 benchmark 判定"是否真的执行了搜索"用（不入 localStorage）
    searchCurrent: { q: string; resultShopIds: string[]; searched: boolean } | null;
  };
}

export interface MeituanLiteActions {
  setAddress: (id: string) => void;
  addToCart: (shopId: string, productId: string) => void;
  changeQty: (productId: string, delta: number) => void;
  clearCart: () => void;
  selectPayment: (method: PaymentMethod) => void;
  submitOrder: (input: SubmitOrderInput) => string;
  markOrderPaid: (orderId: string) => void;
  removeOrder: (orderId: string) => void;
  setUtensils: (n: number) => void;
  setRemark: (r: string) => void;
  submitSearch: (q: string, resultShopIds: string[]) => void;
  clearSearch: () => void;
}

const initialState: MeituanLiteState = {
  addressId: DEFAULT_ADDRESS_ID,
  cart: [],
  cartShopId: null,
  orders: [...MEITUAN_LITE_CONFIG.orders],
  paymentMethod: 'balance',
  userProfile: { ...MEITUAN_LITE_CONFIG.userProfile },
  settings: { utensils: 0, defaultRemark: '' },
  _temp: { searchCurrent: null },
};

export const useMeituanLiteStore = createAppStoreWithActions<MeituanLiteState, MeituanLiteActions>(
  'meituan-lite',
  initialState,
  (set, get) => ({
    setAddress: (id) => set({ addressId: id }),

    addToCart: (shopId, productId) =>
      set((s) => {
        // 切换商家 → 清空购物车只保留新商品
        if (s.cartShopId && s.cartShopId !== shopId) {
          return { cartShopId: shopId, cart: [{ productId, qty: 1 }] };
        }
        const existing = s.cart.find((ci) => ci.productId === productId);
        const cart = existing
          ? s.cart.map((ci) =>
              ci.productId === productId ? { ...ci, qty: ci.qty + 1 } : ci,
            )
          : [...s.cart, { productId, qty: 1 }];
        return { cartShopId: shopId, cart };
      }),

    changeQty: (productId, delta) =>
      set((s) => {
        const cart = s.cart
          .map((ci) =>
            ci.productId === productId ? { ...ci, qty: ci.qty + delta } : ci,
          )
          .filter((ci) => ci.qty > 0);
        return { cart, cartShopId: cart.length ? s.cartShopId : null };
      }),

    clearCart: () => set({ cart: [], cartShopId: null }),

    selectPayment: (method) => set({ paymentMethod: method }),

    submitOrder: (input) => {
      const id = `MT${timeNow()}`;
      const order: Order = {
        id,
        shopId: input.shopId,
        shopName: input.shopName,
        shopEmoji: input.shopEmoji,
        items: input.items,
        subtotal: input.subtotal,
        deliveryFee: input.deliveryFee,
        packingFee: input.packingFee,
        discount: input.discount,
        totalPayable: input.totalPayable,
        addressId: input.addressId,
        addressDetail: input.addressDetail,
        contact: input.contact,
        phone: input.phone,
        paymentMethod: get().paymentMethod,
        remark: input.remark,
        utensils: input.utensils,
        createdAt: timeNow(),
        status: '待支付',
        etaText: input.etaText,
      };
      set((s) => ({ orders: [order, ...s.orders], cart: [], cartShopId: null }));
      return id;
    },

    markOrderPaid: (orderId) =>
      set((s) => {
        const method = s.paymentMethod;
        const target = s.orders.find((o) => o.id === orderId);
        const orders = s.orders.map((o) =>
          o.id === orderId
            ? { ...o, status: '商家已接单' as const, paymentMethod: method }
            : o,
        );
        let userProfile = s.userProfile;
        if (method === 'balance' && target) {
          userProfile = {
            ...s.userProfile,
            balance: Math.max(0, s.userProfile.balance - target.totalPayable),
          };
        }
        return { orders, userProfile };
      }),

    removeOrder: (orderId) =>
      set((s) => ({ orders: s.orders.filter((o) => o.id !== orderId) })),

    setUtensils: (n) => set((s) => ({ settings: { ...s.settings, utensils: n } })),

    setRemark: (r) => set((s) => ({ settings: { ...s.settings, defaultRemark: r } })),

    submitSearch: (q, resultShopIds) =>
      set((s) => ({
        _temp: { ...s._temp, searchCurrent: { q, resultShopIds, searched: true } },
      })),
    clearSearch: () =>
      set((s) => ({ _temp: { ...s._temp, searchCurrent: null } })),
  }),
);

// ── 派生选择器（memoSelector：输入浅比较，不在 store 内暴露 query getter）──

export interface CartLine {
  productId: string;
  qty: number;
  name: string;
  price: number;
  packingFee: number;
  emoji: string;
}

export const selectCartLines = memoSelector(
  (s: MeituanLiteState & MeituanLiteActions) => s.cart,
  (cart): CartLine[] =>
    cart
      .map((ci) => {
        const p = PRODUCT_BY_ID[ci.productId];
        if (!p) return null;
        return {
          productId: ci.productId,
          qty: ci.qty,
          name: p.name,
          price: p.price,
          packingFee: p.packingFee,
          emoji: p.emoji,
        };
      })
      .filter((x): x is CartLine => x !== null),
);

export const selectCartCount = memoSelector(
  (s: MeituanLiteState & MeituanLiteActions) => s.cart,
  (cart) => cart.reduce((n, ci) => n + ci.qty, 0),
);

export const selectCartSubtotal = memoSelector(
  (s: MeituanLiteState & MeituanLiteActions) => s.cart,
  (cart) =>
    cart.reduce((sum, ci) => sum + (PRODUCT_BY_ID[ci.productId]?.price ?? 0) * ci.qty, 0),
);

/** 计算配送费（满免门槛） */
export function computeDeliveryFee(shop: { deliveryFee: number }, subtotal: number): number {
  if (subtotal <= 0) return 0;
  if (subtotal >= MEITUAN_LITE_CONFIG.freeDeliveryThreshold) return 0;
  return shop.deliveryFee;
}

/** 计算包装费 */
export function computePackingFee(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.packingFee * l.qty, 0);
}

/** 计算满减优惠金额 */
export function computeDiscount(
  promotions: Array<{ type: string; rules?: Array<{ threshold: number; discount: number }> }>,
  subtotal: number,
): number {
  if (subtotal <= 0) return 0;
  for (const promo of promotions) {
    if (promo.type !== '满减' || !promo.rules) continue;
    const sorted = [...promo.rules].sort((a, b) => b.threshold - a.threshold);
    for (const r of sorted) {
      if (subtotal >= r.threshold) return r.discount;
    }
  }
  return 0;
}

/** 当前收货地址 */
export function selectAddress(s: MeituanLiteState): Address {
  return (
    MEITUAN_LITE_CONFIG.addresses.find((a) => a.id === s.addressId) ??
    MEITUAN_LITE_CONFIG.addresses[0]
  );
}

/** 当前购物车所属商家 */
export function getCartShop(s: MeituanLiteState) {
  return s.cartShopId ? SHOP_BY_ID[s.cartShopId] ?? null : null;
}
