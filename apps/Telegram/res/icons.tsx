// apps/Telegram/res/icons.tsx
// Telegram App 图标定义

import {
  MessageCircle as IcMessageCircle,
  Users as IcUsers,
  Settings as IcSettings,
  Search as IcSearch,
  Send as IcSend,
  Edit as IcEdit,
  Trash as IcTrash,
  Share as IcShare,
  Smile as IcSmile,
  Pin as IcPin,
  BellOff as IcBellOff,
  Archive as IcArchive,
  Check as IcCheck,
  X as IcX,
  Plus as IcPlus,
  ChevronLeft as IcChevronLeft,
  MoreVertical as IcMoreVertical,
  Eye as IcEye,
  EyeOff as IcEyeOff,
  Phone as IcPhone,
  AtSign as IcAtSign,
  Info as IcInfo,
  Reply as IcReply,
  MessageSquare as IcMessageSquare,
  UserPlus as IcUserPlus,
  UserMinus as IcUserMinus,
  Clock as IcClock,
  Star as IcStar,
  Volume2 as IcVolume2,
  VolumeX as IcVolumeX,
  Lock as IcLock,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';

// ── 图标导出 ────────────────────────────────────────────────────────
export {
  IcMessageCircle,
  IcUsers,
  IcSettings,
  IcSearch,
  IcSend,
  IcEdit,
  IcTrash,
  IcShare,
  IcSmile,
  IcPin,
  IcBellOff,
  IcArchive,
  IcCheck,
  IcX,
  IcPlus,
  IcChevronLeft,
  IcMoreVertical,
  IcEye,
  IcEyeOff,
  IcPhone,
  IcAtSign,
  IcInfo,
  IcReply,
  IcMessageSquare,
  IcUserPlus,
  IcUserMinus,
  IcClock,
  IcStar,
  IcVolume2,
  IcVolumeX,
  IcLock,
};

// ── App 图标（launcher）───────────────────────────────────────────
export function IcLauncher({ size = 24, ...props }: LucideProps) {
  return <IcMessageCircle size={size} {...props} />;
}

// ── ICON_REGISTRY ───────────────────────────────────────────────────
export const ICON_REGISTRY = {
  IcMessageCircle,
  IcUsers,
  IcSettings,
  IcSearch,
  IcSend,
  IcEdit,
  IcTrash,
  IcShare,
  IcSmile,
  IcPin,
  IcBellOff,
  IcArchive,
  IcCheck,
  IcX,
  IcPlus,
  IcChevronLeft,
  IcMoreVertical,
  IcEye,
  IcEyeOff,
  IcPhone,
  IcAtSign,
  IcInfo,
  IcReply,
  IcMessageSquare,
  IcUserPlus,
  IcUserMinus,
  IcClock,
  IcStar,
  IcVolume2,
  IcVolumeX,
  IcLock,
  IcLauncher,
};

export type IconName = keyof typeof ICON_REGISTRY;

// ── IconRenderer ────────────────────────────────────────────────────
export function IconRenderer({ name, size = 24, ...props }: { name: IconName; size?: number } & LucideProps) {
  const Icon = ICON_REGISTRY[name];
  return Icon ? <Icon size={size} {...props} /> : null;
}
