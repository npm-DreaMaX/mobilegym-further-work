import React from 'react';
import {
  Wallet,
  CreditCard,
  Ticket,
  Gift,
  User,
  Plus,
  Search,
  ChevronLeft,
  MoreVertical,
  Settings,
  Trash2,
  Edit3,
  Lock,
  Unlock,
  ArrowUpDown,
  QrCode,
  Barcode,
  X,
  Check,
  MapPin,
  Bus,
  Crown,
  Coffee,
  Ticket as TicketIcon,
} from 'lucide-react';

// ── Navigation / chrome ──────────────────────────────────
export const IcNavBack = ChevronLeft;
export const IcMoreVert = MoreVertical;

// ── Common actions ───────────────────────────────────────
export const IcAdd = Plus;
export const IcSearch = Search;
export const IcClose = X;
export const IcCheck = Check;
export const IcEdit = Edit3;
export const IcDelete = Trash2;
export const IcLock = Lock;
export const IcUnlock = Unlock;
export const IcSort = ArrowUpDown;

// ── App specific ─────────────────────────────────────────
export const IcWallet = Wallet;
export const IcCoupon = Ticket;
export const IcTicket = TicketIcon;
export const IcReward = Gift;
export const IcMe = User;
export const IcSettings = Settings;
export const IcQrCode = QrCode;
export const IcBarcode = Barcode;
export const IcLocation = MapPin;
export const IcTransit = Bus;
export const IcMembership = Crown;
export const IcCoffee = Coffee;
export const IcCreditCard = CreditCard;

// ── App launcher ─────────────────────────────────────────
export const IcLauncher = Wallet;

// ── Registry for dynamic lookup (used by IconRenderer) ───
export const ICON_REGISTRY: Record<string, any> = {
  IcNavBack,
  IcMoreVert,
  IcAdd,
  IcSearch,
  IcClose,
  IcCheck,
  IcEdit,
  IcDelete,
  IcLock,
  IcUnlock,
  IcSort,
  IcWallet,
  IcCoupon,
  IcTicket,
  IcReward,
  IcMe,
  IcSettings,
  IcQrCode,
  IcBarcode,
  IcLocation,
  IcTransit,
  IcMembership,
  IcCoffee,
  IcCreditCard,
  IcLauncher,
};
