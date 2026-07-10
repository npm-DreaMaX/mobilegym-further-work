// Tier-2 drawable icons — 对应 AOSP res/drawable/*.xml
// 单色图标使用 currentColor，多色图标引用 res/colors.ts
import React from 'react';
import {
  Utensils,
  Coffee,
  Store,
  Pill,
  Cherry,
  Bike,
  Sunrise,
  Moon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  ShoppingCart,
  Home,
  ReceiptText,
  CircleUser,
  MapPin,
  Plus,
  Minus,
  X,
  Clock,
  Star,
  Flame,
  Tag,
  Bell,
  Wallet,
  CreditCard,
  MessageCircle,
  Check,
  Trash2,
  Soup,
  UtensilsCrossed,
  ArrowRight,
  Phone,
  Gift,
  ShieldCheck,
} from 'lucide-react';

// ── Navigation / chrome ──────────────────────────────────
export const IcNavBack = ChevronLeft;
export const IcArrowRight = ArrowRight;
export const IcChevronRight = ChevronRight;
export const IcChevronDown = ChevronDown;

// ── Common actions ───────────────────────────────────────
export const IcSearch = Search;
export const IcCart = ShoppingCart;
export const IcPlus = Plus;
export const IcMinus = Minus;
export const IcClose = X;
export const IcCheck = Check;
export const IcTrash = Trash2;

// ── Tab bar ──────────────────────────────────────────────
export const IcHome = Home;
export const IcOrder = ReceiptText;
export const IcMe = CircleUser;

// ── Home category grid ───────────────────────────────────
export const IcFood = Utensils;
export const IcDrink = Coffee;
export const IcStore = Store;
export const IcMedicine = Pill;
export const IcFruit = Cherry;
export const IcErrand = Bike;
export const IcBreakfast = Sunrise;
export const IcNight = Moon;

// ── Misc ─────────────────────────────────────────────────
export const IcLocation = MapPin;
export const IcClock = Clock;
export const IcStar = Star;
export const IcFire = Flame;
export const IcTag = Tag;
export const IcBell = Bell;
export const IcWallet = Wallet;
export const IcCard = CreditCard;
export const IcChat = MessageCircle;
export const IcPhone = Phone;
export const IcGift = Gift;
export const IcShield = ShieldCheck;

// ── App launcher ─────────────────────────────────────────
export const IcLauncher = Soup;
export const IcLogo = UtensilsCrossed;

// ── Registry for dynamic lookup (used by IconRenderer) ───
export const ICON_REGISTRY: Record<string, any> = {
  IcNavBack,
  IcArrowRight,
  IcChevronRight,
  IcChevronDown,
  IcSearch,
  IcCart,
  IcPlus,
  IcMinus,
  IcClose,
  IcCheck,
  IcTrash,
  IcHome,
  IcOrder,
  IcMe,
  IcFood,
  IcDrink,
  IcStore,
  IcMedicine,
  IcFruit,
  IcErrand,
  IcBreakfast,
  IcNight,
  IcLocation,
  IcClock,
  IcStar,
  IcFire,
  IcTag,
  IcBell,
  IcWallet,
  IcCard,
  IcChat,
  IcPhone,
  IcGift,
  IcShield,
  IcLauncher,
  IcLogo,
};
