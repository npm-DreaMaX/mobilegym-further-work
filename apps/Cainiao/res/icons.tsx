import React from 'react';
import {
  Home,
  Package,
  Send,
  Truck,
  Search,
  ScanLine,
  MapPin,
  Clock,
  ChevronRight,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Check,
  Bell,
  Settings,
  User,
  Phone,
  Calendar,
  FileText,
  QrCode,
  PackageCheck,
  Box,
  MapPinned,
  Boxes,
  Store,
  PackageSearch,
  ChevronLeft,
} from 'lucide-react';

// ── Ic* aliases ──────────────────────────────────────────────────────
export const IcHome = Home;
export const IcPackage = Package;
export const IcSend = Send;
export const IcTruck = Truck;
export const IcSearch = Search;
export const IcScan = ScanLine;
export const IcMapPin = MapPin;
export const IcClock = Clock;
export const IcChevronRight = ChevronRight;
export const IcChevronLeft = ChevronLeft;
export const IcBack = ArrowLeft;
export const IcPlus = Plus;
export const IcEdit = Pencil;
export const IcDelete = Trash2;
export const IcCheck = Check;
export const IcBell = Bell;
export const IcSettings = Settings;
export const IcUser = User;
export const IcPhone = Phone;
export const IcCalendar = Calendar;
export const IcFileText = FileText;
export const IcQrCode = QrCode;
export const IcPackageCheck = PackageCheck;
export const IcBox = Box;
export const IcMapPinned = MapPinned;
export const IcBoxes = Boxes;
export const IcStation = Store;
export const IcPackageSearch = PackageSearch;
export const IcTabHome = Home;
export const IcTabSend = Send;
export const IcTabMe = User;

// ── Brand launcher icon (custom SVG) ─────────────────────────────────
export const IcLauncher: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <rect width="48" height="48" rx="10" fill="#FF6A00" />
    <path d="M24 9l13 6v9c0 7.5-5.3 13.2-13 16C16.3 37.2 11 31.5 11 24v-9l13-6z" fill="#fff" fillOpacity="0.18" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M17 25l4.5 4.5L31 20" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const ICON_REGISTRY: Record<string, React.FC<React.SVGProps<SVGSVGElement> | React.ComponentType<any>>> = {
  IcHome,
  IcPackage,
  IcSend,
  IcTruck,
  IcSearch,
  IcScan,
  IcMapPin,
  IcClock,
  IcChevronRight,
  IcChevronLeft,
  IcBack,
  IcPlus,
  IcEdit,
  IcDelete,
  IcCheck,
  IcBell,
  IcSettings,
  IcUser,
  IcPhone,
  IcCalendar,
  IcFileText,
  IcQrCode,
  IcPackageCheck,
  IcBox,
  IcMapPinned,
  IcBoxes,
  IcStation,
  IcPackageSearch,
  IcTabHome,
  IcTabSend,
  IcTabMe,
  IcLauncher,
};
