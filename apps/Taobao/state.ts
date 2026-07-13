import { createAppStoreWithActions } from '../../os/createAppStore';
import { TAOBAO_CONFIG } from './data';
import type {
  CartItem, Coupon, UserCoupon, Address, CheckoutDraft,
  Order, OrderItem, Logistics, RefundRequest, Review,
  SearchState, SortOption, TaobaoProfile, TaobaoSettings,
} from './types';
import * as TimeService from '../../os/TimeService';

// ---- State shape ----

interface TaobaoState {
  profile: TaobaoProfile;
  settings: TaobaoSettings;
  // Product catalog (world data overlay)
  products: Record<string, any>;
  skus: Record<string, any>;
  categories: Record<string, any>;
  brands: Record<string, any>;
  shops: Record<string, any>;
  // User data
  cart: CartItem[];
  userCoupons: UserCoupon[];
  addresses: Address[];
  checkoutDraft: CheckoutDraft;
  orders: Order[];
  logistics: Record<string, Logistics>;
  refundRequests: RefundRequest[];
  reviews: Review[];
  favoriteIds: string[];
  // Search
  search: SearchState;
  // Browsing
  recentlyViewed: string[];
  openedProductIds: string[];
  // Temp (not persisted)
  _temp: {
    selectedSkuId: string | null;
    selectedQuantity: number;
  };
}

// ---- Initial state ----

const initialSearch: SearchState = {
  current: {
    query: '',
    sortOption: 'comprehensive',
    categoryId: null,
    brandId: null,
    priceMin: '',
    priceMax: '',
    freeShippingOnly: false,
    shopId: null,
    minRating: '',
    resultsCount: 0,
  },
  history: [],
  openedProductIds: [],
};

function buildInitialState(): TaobaoState {
  const cfg = TAOBAO_CONFIG;
  return {
    profile: { ...cfg.profile } as TaobaoProfile,
    settings: { ...cfg.settings } as TaobaoSettings,
    products: { ...cfg.products },
    skus: { ...cfg.skus },
    categories: { ...cfg.categories },
    brands: { ...cfg.brands },
    shops: { ...cfg.shops },
    cart: (cfg.cart ?? []).map((c: any) => ({ ...c })),
    userCoupons: (cfg.userCoupons ?? []).map((uc: any) => ({ ...uc })),
    addresses: (cfg.addresses ?? []).map((a: any) => ({ ...a })),
    checkoutDraft: {
      items: [],
      addressId: null,
      couponId: null,
      shippingMethod: null,
    },
    orders: (cfg.orders ?? []).map((o: any) => ({ ...o, items: (o.items ?? []).map((i: any) => ({ ...i })) })),
    logistics: { ...(cfg.logistics ?? {}) },
    refundRequests: (cfg.refundRequests ?? []).map((r: any) => ({ ...r })),
    reviews: (cfg.reviews ?? []).map((r: any) => ({ ...r })),
    favoriteIds: [...(cfg.favoriteIds ?? [])],
    search: {
      current: { ...initialSearch.current, ...(cfg.search?.current ?? {}) } as SearchState['current'],
      history: [...(cfg.search?.history ?? [])],
      openedProductIds: [...(cfg.search?.openedProductIds ?? [])],
    },
    recentlyViewed: [...(cfg.recentlyViewed ?? [])],
    openedProductIds: [...(cfg.openedProductIds ?? [])],
    _temp: {
      selectedSkuId: null,
      selectedQuantity: 1,
    },
  };
}

// ---- Helper to generate IDs ----

let _idCounter = 1000;
function nextId(prefix: string): string {
  _idCounter += 1;
  return `${prefix}_${TimeService.now()}_${_idCounter}`;
}

// ---- Store ----

export const useTaobaoStore = createAppStoreWithActions<TaobaoState, TaobaoActions>(
  'taobao',
  buildInitialState(),
  (set, get) => ({
    // ---- Profile & Settings ----
    updateProfile: (patch) => set(s => ({ profile: { ...s.profile, ...patch } })),
    updateSettings: (patch) => set(s => ({ settings: { ...s.settings, ...patch } })),

    // ---- Search ----
    setSearchCurrent: (patch) => set(s => ({
      search: { ...s.search, current: { ...s.search.current, ...patch } },
    })),

    recordSearchSnapshot: () => set(s => {
      const cur = s.search.current;
      const snap = {
        id: `${s.search.history.length + 1}`,
        query: cur.query,
        sortOption: cur.sortOption,
        categoryId: cur.categoryId,
        brandId: cur.brandId,
        priceMin: cur.priceMin,
        priceMax: cur.priceMax,
        freeShippingOnly: cur.freeShippingOnly,
        shopId: cur.shopId,
        minRating: cur.minRating,
        resultsCount: cur.resultsCount,
        firstProductId: null,
      };
      return { search: { ...s.search, history: [...s.search.history, snap] } };
    }),

    addRecentSearch: (query: string) => set(s => {
      const q = query.trim();
      if (!q) return s;
      return { search: { ...s.search, current: { ...s.search.current, query: q } } };
    }),

    recordOpenedProduct: (productId: string) => set(s => {
      if (s.openedProductIds.includes(productId)) return s;
      return {
        openedProductIds: [...s.openedProductIds, productId],
        recentlyViewed: [productId, ...s.recentlyViewed.filter(id => id !== productId)].slice(0, 20),
      };
    }),

    clearSearchHistory: () => set(s => ({ search: { ...s.search, history: [] } })),

    // ---- Favorites ----
    toggleFavorite: (productId: string) => set(s => {
      const exists = s.favoriteIds.includes(productId);
      return {
        favoriteIds: exists
          ? s.favoriteIds.filter(id => id !== productId)
          : [...s.favoriteIds, productId],
      };
    }),

    // ---- Cart ----
    addToCart: (productId: string, skuId: string, quantity: number) => set(s => {
      const sku = s.skus[skuId];
      if (!sku || sku.stock < quantity) return s;
      // Check if same SKU already in cart
      const existingIdx = s.cart.findIndex(ci => ci.skuId === skuId);
      let newCart: CartItem[];
      if (existingIdx >= 0) {
        newCart = [...s.cart];
        newCart[existingIdx] = {
          ...newCart[existingIdx],
          quantity: Math.min(newCart[existingIdx].quantity + quantity, sku.stock),
          unitPrice: sku.price,
        };
      } else {
        const newItem: CartItem = {
          id: nextId('cart'),
          productId,
          skuId,
          quantity: Math.min(quantity, sku.stock),
          selected: true,
          addedAt: TimeService.now(),
          unitPrice: sku.price,
        };
        newCart = [...s.cart, newItem];
      }
      return { cart: newCart };
    }),

    updateCartItemQuantity: (cartItemId: string, quantity: number) => set(s => {
      const idx = s.cart.findIndex(ci => ci.id === cartItemId);
      if (idx < 0) return s;
      const sku = s.skus[s.cart[idx].skuId];
      const qty = Math.max(1, Math.min(quantity, sku?.stock ?? 99));
      const newCart = [...s.cart];
      newCart[idx] = { ...newCart[idx], quantity: qty };
      return { cart: newCart };
    }),

    toggleCartSelection: (cartItemId: string) => set(s => {
      const idx = s.cart.findIndex(ci => ci.id === cartItemId);
      if (idx < 0) return s;
      const newCart = [...s.cart];
      newCart[idx] = { ...newCart[idx], selected: !newCart[idx].selected };
      return { cart: newCart };
    }),

    toggleSelectAllCart: (selected: boolean) => set(s => ({
      cart: s.cart.map(ci => ({ ...ci, selected })),
    })),

    removeCartItem: (cartItemId: string) => set(s => ({
      cart: s.cart.filter(ci => ci.id !== cartItemId),
    })),

    // ---- Coupons ----
    claimCoupon: (couponId: string) => set(s => {
      const coupon = TAOBAO_CONFIG.coupons?.[couponId];
      if (!coupon || !coupon.enabled) return s;
      const existing = s.userCoupons.find(uc => uc.couponId === couponId);
      if (existing) return s;
      const now = TimeService.now();
      if (now < coupon.validFrom || now > coupon.validTo) return s;
      return {
        userCoupons: [...s.userCoupons, { couponId, claimedAt: now, used: false }],
      };
    }),

    applyCouponToCheckout: (couponId: string | null) => set(s => ({
      checkoutDraft: { ...s.checkoutDraft, couponId },
    })),

    // ---- Addresses ----
    addAddress: (addr: Omit<Address, 'id'>) => set(s => {
      const newAddr: Address = { ...addr, id: nextId('addr') };
      let newAddresses = [...s.addresses, newAddr];
      if (newAddr.isDefault) {
        newAddresses = newAddresses.map(a => ({ ...a, isDefault: a.id === newAddr.id }));
      }
      return { addresses: newAddresses };
    }),

    updateAddress: (addrId: string, patch: Partial<Address>) => set(s => {
      let newAddresses = s.addresses.map(a => a.id === addrId ? { ...a, ...patch } : a);
      if (patch.isDefault) {
        newAddresses = newAddresses.map(a => ({ ...a, isDefault: a.id === addrId }));
      }
      return { addresses: newAddresses };
    }),

    deleteAddress: (addrId: string) => set(s => ({
      addresses: s.addresses.filter(a => a.id !== addrId),
    })),

    setDefaultAddress: (addrId: string) => set(s => ({
      addresses: s.addresses.map(a => ({ ...a, isDefault: a.id === addrId })),
    })),

    // ---- Checkout ----
    setCheckoutDraft: (draft: Partial<CheckoutDraft>) => set(s => ({
      checkoutDraft: { ...s.checkoutDraft, ...draft },
    })),

    initCheckoutFromCart: () => set(s => {
      const selected = s.cart.filter(ci => ci.selected);
      const items = selected.map(ci => ({
        cartItemId: ci.id,
        productId: ci.productId,
        skuId: ci.skuId,
        quantity: ci.quantity,
        unitPrice: ci.unitPrice,
      }));
      const defaultAddr = s.addresses.find(a => a.isDefault);
      return {
        checkoutDraft: {
          items,
          addressId: defaultAddr?.id ?? null,
          couponId: null,
          shippingMethod: 'standard',
        },
      };
    }),

    // ---- Orders ----
    submitOrder: () => set(s => {
      const draft = s.checkoutDraft;
      if (!draft.addressId || !draft.items.length) return s;

      const address = s.addresses.find(a => a.id === draft.addressId);
      if (!address) return s;

      // Validate stock
      for (const item of draft.items) {
        const sku = s.skus[item.skuId];
        if (!sku || sku.stock < item.quantity) return s;
      }

      // Calculate totals
      const subtotal = draft.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
      const shippingFee = 0; // Simplified: free shipping for now
      let discount = 0;
      let couponSnapshot: Order['couponSnapshot'] = null;

      if (draft.couponId) {
        const uc = s.userCoupons.find(u => u.couponId === draft.couponId && !u.used);
        const coupon = TAOBAO_CONFIG.coupons?.[draft.couponId];
        if (uc && coupon) {
          const now = TimeService.now();
          if (now >= coupon.validFrom && now <= coupon.validTo && subtotal >= coupon.threshold) {
            // Check shop eligibility
            const isPlatform = coupon.type === 'platform';
            const shopOk = isPlatform || draft.items.every(item => {
              const product = s.products[item.productId];
              return product?.shopId === coupon.shopId;
            });
            if (shopOk) {
              discount = coupon.discount;
              couponSnapshot = { couponId: coupon.id, discount: coupon.discount };
            }
          }
        }
      }

      const payable = subtotal + shippingFee - discount;
      const now = TimeService.now();

      // Build order items
      const orderItems: OrderItem[] = draft.items.map(item => {
        const product = s.products[item.productId];
        const sku = s.skus[item.skuId];
        return {
          id: nextId('oi'),
          productId: item.productId,
          skuId: item.skuId,
          skuAttributes: sku?.attributes ?? {},
          productTitle: product?.title ?? '',
          shopId: product?.shopId ?? '',
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          refundStatus: 'none' as const,
        };
      });

      const order: Order = {
        id: nextId('order'),
        items: orderItems,
        addressSnapshot: { ...address },
        couponSnapshot,
        shippingMethod: draft.shippingMethod ?? 'standard',
        shippingFee,
        subtotal,
        discount,
        payable,
        status: 'pending_payment',
        createdAt: now,
      };

      // Deduct stock
      const newSkus = { ...s.skus };
      for (const item of draft.items) {
        const sku = newSkus[item.skuId];
        if (sku) {
          newSkus[item.skuId] = { ...sku, stock: sku.stock - item.quantity };
        }
      }

      // Consume coupon
      const newUserCoupons = s.userCoupons.map(uc =>
        uc.couponId === draft.couponId && !uc.used
          ? { ...uc, used: true, usedOrderId: order.id }
          : uc,
      );

      // Remove settled cart items
      const settledCartItemIds = new Set(draft.items.map(i => i.cartItemId));
      const newCart = s.cart.filter(ci => !settledCartItemIds.has(ci.id));

      return {
        orders: [...s.orders, order],
        skus: newSkus,
        cart: newCart,
        userCoupons: newUserCoupons,
        checkoutDraft: { items: [], addressId: null, couponId: null, shippingMethod: null },
      };
    }),

    // ---- Payment ----
    payOrder: (orderId: string) => set(s => {
      const idx = s.orders.findIndex(o => o.id === orderId);
      if (idx < 0 || s.orders[idx].status !== 'pending_payment') return s;
      const now = TimeService.now();
      const newOrders = [...s.orders];
      newOrders[idx] = { ...newOrders[idx], status: 'paid', paidAt: now };
      // Simulate: paid -> to_ship immediately
      // Actually keep as 'paid' until explicitly shipped for benchmark
      return { orders: newOrders };
    }),

    // ---- Cancel Order ----
    cancelOrder: (orderId: string) => set(s => {
      const idx = s.orders.findIndex(o => o.id === orderId);
      if (idx < 0) return s;
      const order = s.orders[idx];
      if (order.status === 'cancelled' || order.status === 'received' || order.status === 'delivered') return s;

      const now = TimeService.now();
      const newOrders = [...s.orders];
      newOrders[idx] = { ...newOrders[idx], status: 'cancelled', cancelledAt: now };

      // Restore stock
      const newSkus = { ...s.skus };
      for (const item of order.items) {
        const sku = newSkus[item.skuId];
        if (sku) {
          newSkus[item.skuId] = { ...sku, stock: sku.stock + item.quantity };
        }
      }

      // Restore coupon
      const newUserCoupons = s.userCoupons.map(uc =>
        uc.couponId === order.couponSnapshot?.couponId && uc.used
          ? { ...uc, used: false, usedOrderId: undefined }
          : uc,
      );

      return { orders: newOrders, skus: newSkus, userCoupons: newUserCoupons };
    }),

    // ---- Confirm Receipt ----
    confirmReceipt: (orderId: string) => set(s => {
      const idx = s.orders.findIndex(o => o.id === orderId);
      if (idx < 0) return s;
      const order = s.orders[idx];
      if (order.status !== 'delivered' && order.status !== 'shipped') return s;
      const now = TimeService.now();
      const newOrders = [...s.orders];
      newOrders[idx] = { ...newOrders[idx], status: 'received', receivedAt: now };
      return { orders: newOrders };
    }),

    // ---- Refund ----
    requestRefund: (orderId: string, orderItemId: string, reason: string, note: string) => set(s => {
      const orderIdx = s.orders.findIndex(o => o.id === orderId);
      if (orderIdx < 0) return s;
      const order = s.orders[orderIdx];
      const itemIdx = order.items.findIndex(i => i.id === orderItemId);
      if (itemIdx < 0) return s;
      if (order.items[itemIdx].refundStatus !== 'none') return s; // Prevent duplicate

      // Only allow refund for received/delivered orders with refundable items
      if (order.status !== 'received' && order.status !== 'delivered') return s;

      const refund: RefundRequest = {
        id: nextId('refund'),
        orderId,
        orderItemId,
        skuId: order.items[itemIdx].skuId,
        reason,
        note,
        status: 'pending',
        createdAt: TimeService.now(),
      };

      const newOrders = [...s.orders];
      const newItems = [...newOrders[orderIdx].items];
      newItems[itemIdx] = { ...newItems[itemIdx], refundStatus: 'requested' };
      newOrders[orderIdx] = { ...newOrders[orderIdx], items: newItems };

      return { orders: newOrders, refundRequests: [...s.refundRequests, refund] };
    }),

    // ---- Review ----
    submitReview: (orderId: string, orderItemId: string, rating: number, content: string, tags: string[]) => set(s => {
      const orderIdx = s.orders.findIndex(o => o.id === orderId);
      if (orderIdx < 0) return s;
      const order = s.orders[orderIdx];
      if (order.status !== 'received') return s;
      const itemIdx = order.items.findIndex(i => i.id === orderItemId);
      if (itemIdx < 0) return s;
      if (order.items[itemIdx].reviewId) return s; // Already reviewed

      const review: Review = {
        id: nextId('review'),
        orderId,
        orderItemId,
        productId: order.items[itemIdx].productId,
        skuId: order.items[itemIdx].skuId,
        rating,
        content,
        tags,
        createdAt: TimeService.now(),
      };

      const newOrders = [...s.orders];
      const newItems = [...newOrders[orderIdx].items];
      newItems[itemIdx] = { ...newItems[itemIdx], reviewId: review.id };
      newOrders[orderIdx] = { ...newOrders[orderIdx], items: newItems };

      return { orders: newOrders, reviews: [...s.reviews, review] };
    }),

    // ---- Logistics ----
    shipOrder: (orderId: string, logisticsId: string) => set(s => {
      const idx = s.orders.findIndex(o => o.id === orderId);
      if (idx < 0) return s;
      const order = s.orders[idx];
      if (order.status !== 'paid' && order.status !== 'to_ship') return s;
      const now = TimeService.now();
      const newOrders = [...s.orders];
      newOrders[idx] = {
        ...newOrders[idx],
        status: 'shipped',
        shippedAt: now,
        logisticsId,
      };
      return { orders: newOrders };
    }),

    markOrderDelivered: (orderId: string) => set(s => {
      const idx = s.orders.findIndex(o => o.id === orderId);
      if (idx < 0) return s;
      const order = s.orders[idx];
      if (order.status !== 'shipped') return s;
      const now = TimeService.now();
      const newOrders = [...s.orders];
      newOrders[idx] = { ...newOrders[idx], status: 'delivered', deliveredAt: now };
      return { orders: newOrders };
    }),

    // ---- Temp ----
    setTempSelectedSku: (skuId: string | null) => set(s => ({
      _temp: { ...s._temp, selectedSkuId: skuId },
    })),
    setTempSelectedQuantity: (qty: number) => set(s => ({
      _temp: { ...s._temp, selectedQuantity: Math.max(1, qty) },
    })),
  }),
);

// ---- Actions interface ----

interface TaobaoActions {
  updateProfile: (patch: Partial<TaobaoProfile>) => void;
  updateSettings: (patch: Partial<TaobaoSettings>) => void;
  setSearchCurrent: (patch: Partial<SearchState['current']>) => void;
  recordSearchSnapshot: () => void;
  addRecentSearch: (query: string) => void;
  recordOpenedProduct: (productId: string) => void;
  clearSearchHistory: () => void;
  toggleFavorite: (productId: string) => void;
  addToCart: (productId: string, skuId: string, quantity: number) => void;
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void;
  toggleCartSelection: (cartItemId: string) => void;
  toggleSelectAllCart: (selected: boolean) => void;
  removeCartItem: (cartItemId: string) => void;
  claimCoupon: (couponId: string) => void;
  applyCouponToCheckout: (couponId: string | null) => void;
  addAddress: (addr: Omit<Address, 'id'>) => void;
  updateAddress: (addrId: string, patch: Partial<Address>) => void;
  deleteAddress: (addrId: string) => void;
  setDefaultAddress: (addrId: string) => void;
  setCheckoutDraft: (draft: Partial<CheckoutDraft>) => void;
  initCheckoutFromCart: () => void;
  submitOrder: () => void;
  payOrder: (orderId: string) => void;
  cancelOrder: (orderId: string) => void;
  confirmReceipt: (orderId: string) => void;
  requestRefund: (orderId: string, orderItemId: string, reason: string, note: string) => void;
  submitReview: (orderId: string, orderItemId: string, rating: number, content: string, tags: string[]) => void;
  shipOrder: (orderId: string, logisticsId: string) => void;
  markOrderDelivered: (orderId: string) => void;
  setTempSelectedSku: (skuId: string | null) => void;
  setTempSelectedQuantity: (qty: number) => void;
}
