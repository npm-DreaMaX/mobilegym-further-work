// ---- Product & SKU ----

export interface Product {
  id: string;
  title: string;
  shopId: string;
  categoryId: string;
  brandId: string;
  price: number;          // minimum SKU price, for display
  originalPrice: number;  // original list price
  sales: number;
  rating: number;         // 0-5, e.g. 4.8
  reviewCount: number;
  freeShipping: boolean;
  description: string;
  images: string[];
  skuIds: string[];
  enabled: boolean;
}

export interface Sku {
  id: string;
  productId: string;
  attributes: Record<string, string>;  // e.g. { color: '红色', size: 'M' }
  price: number;
  originalPrice: number;
  stock: number;
  enabled: boolean;
}

// ---- Category & Brand & Shop ----

export interface Category {
  id: string;
  name: string;
  icon: string;
  productIds: string[];
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
}

export interface Shop {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  productIds: string[];
  description: string;
}

// ---- Cart ----

export interface CartItem {
  id: string;         // stable cart item id
  productId: string;
  skuId: string;
  quantity: number;
  selected: boolean;
  addedAt: number;    // timestamp
  unitPrice: number;  // snapshot of SKU price at add time
}

// ---- Coupon ----

export interface Coupon {
  id: string;
  name: string;
  type: 'platform' | 'shop';
  shopId?: string;           // only for shop coupons
  threshold: number;         // min order amount
  discount: number;          // discount amount
  description: string;
  validFrom: number;
  validTo: number;
  enabled: boolean;
}

export interface UserCoupon {
  couponId: string;
  claimedAt: number;
  used: boolean;         // consumed after order
  usedOrderId?: string;
}

// ---- Address ----

export interface Address {
  id: string;
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  detail: string;
  isDefault: boolean;
  zipCode?: string;
}

// ---- Checkout Draft ----

export interface CheckoutDraft {
  items: CheckoutDraftItem[];
  addressId: string | null;
  couponId: string | null;
  shippingMethod: string | null;
}

export interface CheckoutDraftItem {
  cartItemId: string;
  productId: string;
  skuId: string;
  quantity: number;
  unitPrice: number;
}

// ---- Order ----

export type OrderStatus =
  | 'pending_payment'
  | 'paid'
  | 'to_ship'
  | 'shipped'
  | 'delivered'
  | 'received'
  | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  skuId: string;
  skuAttributes: Record<string, string>;
  productTitle: string;
  shopId: string;
  quantity: number;
  unitPrice: number;
  refundStatus: 'none' | 'requested' | 'refunded';
  reviewId?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  addressSnapshot: Address;
  couponSnapshot: { couponId: string; discount: number } | null;
  shippingMethod: string;
  shippingFee: number;
  subtotal: number;
  discount: number;
  payable: number;
  status: OrderStatus;
  createdAt: number;
  paidAt?: number;
  shippedAt?: number;
  deliveredAt?: number;
  receivedAt?: number;
  cancelledAt?: number;
  logisticsId?: string;
}

// ---- Logistics ----

export interface LogisticsEvent {
  time: number;
  location: string;
  description: string;
}

export interface Logistics {
  id: string;
  orderId: string;
  carrier: string;
  trackingNumber: string;
  events: LogisticsEvent[];
  estimatedDelivery: number;
  status: 'in_transit' | 'out_for_delivery' | 'delivered';
}

// ---- Refund ----

export interface RefundRequest {
  id: string;
  orderId: string;
  orderItemId: string;
  skuId: string;
  reason: string;
  note: string;
  status: 'pending' | 'approved' | 'refunded' | 'rejected';
  createdAt: number;
}

// ---- Review ----

export interface Review {
  id: string;
  orderId: string;
  orderItemId: string;
  productId: string;
  skuId: string;
  rating: number;       // 1-5
  content: string;
  tags: string[];
  createdAt: number;
}

// ---- Search ----

export interface SearchState {
  current: SearchCurrent;
  history: SearchSnapshot[];
  openedProductIds: string[];
}

export interface SearchCurrent {
  query: string;
  sortOption: SortOption;
  categoryId: string | null;
  brandId: string | null;
  priceMin: string;
  priceMax: string;
  freeShippingOnly: boolean;
  shopId: string | null;
  minRating: string;
  resultsCount: number;
}

export interface SearchSnapshot {
  id: string;
  query: string;
  sortOption: SortOption;
  categoryId: string | null;
  brandId: string | null;
  priceMin: string;
  priceMax: string;
  freeShippingOnly: boolean;
  shopId: string | null;
  minRating: string;
  resultsCount: number;
  firstProductId: string | null;
}

export type SortOption = 'comprehensive' | 'sales' | 'priceAsc' | 'priceDesc' | 'rating';

// ---- Profile / Settings ----

export interface TaobaoProfile {
  name: string;
  avatar: string;
  phone: string;
}

export interface TaobaoSettings {
  theme: 'light' | 'dark';
  notification: boolean;
}
