import React from 'react';
import {
  Home, Package, PackageCheck, FileText, Coins, LayoutGrid, Users, Gauge,
  PhoneCall, Globe, Repeat, User, Gift, CreditCard, Phone, Wallet,
  ArrowLeft, ChevronRight, Search, Check, Plus, Pencil, Trash2, Bell, Settings, Store,
} from 'lucide-react';

// ── Ic* aliases ──────────────────────────────────────────────────────
export const IcHome = Home;
export const IcWallet = Wallet;
export const IcDataPack = PackageCheck;
export const IcBill = FileText;
export const IcPlan = Package;
export const IcBalance = Coins;
export const IcServices = LayoutGrid;
export const IcFamily = Users;
export const IcGrid = LayoutGrid;
export const IcDataUsage = Gauge;
export const IcVoice = PhoneCall;
export const IcGlobe = Globe;
export const IcAutopay = Repeat;
export const IcUser = User;
export const IcPoints = Gift;
export const IcCard = CreditCard;
export const IcPhone = Phone;
export const IcFileText = FileText;
export const IcBack = ArrowLeft;
export const IcChevronRight = ChevronRight;
export const IcSearch = Search;
export const IcCheck = Check;
export const IcPlus = Plus;
export const IcEdit = Pencil;
export const IcDelete = Trash2;
export const IcBell = Bell;
export const IcSettings = Settings;
export const IcTabHome = Home;
export const IcTabMall = Store;
export const IcTabMe = User;

// ── Brand launcher icon (custom SVG) ─────────────────────────────────
export const IcLauncher: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="48" height="48" rx="10" fill="#0066B3" />
    <path d="M14 18c4-6 16-6 20 0" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" fill="none" />
    <path d="M16 23c3-4 13-4 16 0" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
    <path d="M18 28c2-3 8-3 10 0" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <circle cx="24" cy="33" r="2.4" fill="#fff" />
  </svg>
);

export const ICON_REGISTRY: Record<string, React.FC<React.SVGProps<SVGSVGElement>> | React.ComponentType<any>> = {
  IcHome, IcWallet, IcDataPack, IcBill, IcPlan, IcBalance, IcServices, IcFamily, IcGrid,
  IcDataUsage, IcVoice, IcGlobe, IcAutopay, IcUser, IcPoints, IcCard, IcPhone, IcFileText,
  IcBack, IcChevronRight, IcSearch, IcCheck, IcPlus, IcEdit, IcDelete, IcBell, IcSettings,
  IcTabHome, IcTabMall, IcTabMe, IcLauncher,
};
