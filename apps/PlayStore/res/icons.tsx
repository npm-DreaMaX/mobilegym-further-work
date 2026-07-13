import React from 'react';
import {
  Play,
  Search,
  Home,
  Heart,
  Star,
  Download,
  Grid3X3,
  Settings,
  User,
  ChevronLeft,
  X,
  TrendingUp,
  FolderOpen,
  Music,
  Camera,
  Gamepad2,
  Briefcase,
  Plane,
  GraduationCap,
  MessageCircle,
  Wrench,
  Cloud,
  Languages,
  Music2,
  Image,
  Gamepad,
  FileText,
  Video,
  Palette,
  Bus,
  Hash,
  Menu,
  MoreVertical,
  Shield,
  Clock,
  HardDrive,
  Trash2,
  RotateCcw,
  Check,
  Plus,
  Minus,
  Edit3,
  Send,
  Bell,
  Wifi,
  Signal,
  type LucideIcon,
} from 'lucide-react';

// Icon aliases with Ic prefix
export const IcLauncher: LucideIcon = Play;
export const IcHome: LucideIcon = Home;
export const IcSearch: LucideIcon = Search;
export const IcHeart: LucideIcon = Heart;
export const IcStar: LucideIcon = Star;
export const IcDownload: LucideIcon = Download;
export const IcApps: LucideIcon = Grid3X3;
export const IcSettings: LucideIcon = Settings;
export const IcUser: LucideIcon = User;
export const IcBack: LucideIcon = ChevronLeft;
export const IcClose: LucideIcon = X;
export const IcCharts: LucideIcon = TrendingUp;
export const IcCategories: LucideIcon = FolderOpen;
export const IcMusic: LucideIcon = Music;
export const IcPhoto: LucideIcon = Camera;
export const IcGames: LucideIcon = Gamepad2;
export const IcProductivity: LucideIcon = Briefcase;
export const IcTravel: LucideIcon = Plane;
export const IcEducation: LucideIcon = GraduationCap;
export const IcSocial: LucideIcon = MessageCircle;
export const IcTools: LucideIcon = Wrench;
export const IcDrive: LucideIcon = Cloud;
export const IcDuolingo: LucideIcon = Languages;
export const IcSpotify: LucideIcon = Music2;
export const IcPhotography: LucideIcon = Image;
export const IcGamepad: LucideIcon = Gamepad;
export const IcWord: LucideIcon = FileText;
export const IcTiktok: LucideIcon = Video;
export const IcCanva: LucideIcon = Palette;
export const IcUber: LucideIcon = Bus;
export const IcTwitter: LucideIcon = Hash;
export const IcWechat: LucideIcon = MessageCircle;
export const IcMenu: LucideIcon = Menu;
export const IcMore: LucideIcon = MoreVertical;
export const IcShield: LucideIcon = Shield;
export const IcClock: LucideIcon = Clock;
export const IcStorage: LucideIcon = HardDrive;
export const IcTrash: LucideIcon = Trash2;
export const IcUpdate: LucideIcon = RotateCcw;
export const IcCheck: LucideIcon = Check;
export const IcPlus: LucideIcon = Plus;
export const IcMinus: LucideIcon = Minus;
export const IcEdit: LucideIcon = Edit3;
export const IcSend: LucideIcon = Send;
export const IcNotify: LucideIcon = Bell;
export const IcWifi: LucideIcon = Wifi;
export const IcSignal: LucideIcon = Signal;
export const IcWishlist: LucideIcon = Heart;
export const IcEvernote: LucideIcon = FileText;
export const IcZoom: LucideIcon = Video;
export const IcSnapchat: LucideIcon = MessageCircle;
export const IcTripadvisor: LucideIcon = Plane;
export const IcMinecraft: LucideIcon = Gamepad;
export const IcNotion: LucideIcon = FileText;
export const IcCalm: LucideIcon = Cloud;

// Icon registry
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  IcLauncher,
  IcHome,
  IcSearch,
  IcHeart,
  IcStar,
  IcDownload,
  IcApps,
  IcSettings,
  IcUser,
  IcBack,
  IcClose,
  IcCharts,
  IcCategories,
  IcMusic,
  IcPhoto,
  IcGames,
  IcProductivity,
  IcTravel,
  IcEducation,
  IcSocial,
  IcTools,
  IcDrive,
  IcDuolingo,
  IcSpotify,
  IcPhotography,
  IcGamepad,
  IcWord,
  IcTiktok,
  IcCanva,
  IcUber,
  IcTwitter,
  IcWechat,
  IcMenu,
  IcMore,
  IcShield,
  IcClock,
  IcStorage,
  IcTrash,
  IcUpdate,
  IcCheck,
  IcPlus,
  IcMinus,
  IcEdit,
  IcSend,
  IcNotify,
  IcWifi,
  IcSignal,
  IcWishlist,
  IcEvernote,
  IcZoom,
  IcSnapchat,
  IcTripadvisor,
  IcMinecraft,
  IcNotion,
  IcCalm,
};

// Icon renderer for data-driven rendering
export function IconRenderer({ name, size = 22 }: { name: string; size?: number }) {
  const IconComponent = ICON_REGISTRY[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} />;
}
