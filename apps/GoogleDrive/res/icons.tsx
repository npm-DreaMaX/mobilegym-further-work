import React from 'react';
import {
  Folder,
  FolderOpen,
  FolderPlus,
  File,
  FileText,
  FileSpreadsheet,
  Presentation,
  Image,
  Video,
  Music,
  Archive,
  Upload,
  Download,
  Star,
  Users,
  User,
  Clock,
  Trash2,
  Search,
  Plus,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Home,
  Settings,
  Monitor,
  Share2,
  Link,
  Globe,
  Lock,
  Pencil,
  Check,
  X,
  List,
  Grid3X3,
  ArrowUpDown,
  Filter,
  Table,
  HardDrive,
  type LucideIcon,
} from 'lucide-react';

export const IcFolder: LucideIcon = Folder;
export const IcFolderOpen: LucideIcon = FolderOpen;
export const IcFolderPlus: LucideIcon = FolderPlus;
export const IcFile: LucideIcon = File;
export const IcFileText: LucideIcon = FileText;
export const IcFileSpreadsheet: LucideIcon = FileSpreadsheet;
export const IcPresentation: LucideIcon = Presentation;
export const IcImage: LucideIcon = Image;
export const IcVideo: LucideIcon = Video;
export const IcMusic: LucideIcon = Music;
export const IcArchive: LucideIcon = Archive;
export const IcUpload: LucideIcon = Upload;
export const IcDownload: LucideIcon = Download;
export const IcStar: LucideIcon = Star;
export const IcUsers: LucideIcon = Users;
export const IcUser: LucideIcon = User;
export const IcClock: LucideIcon = Clock;
export const IcTrash: LucideIcon = Trash2;
export const IcSearch: LucideIcon = Search;
export const IcPlus: LucideIcon = Plus;
export const IcMoreVertical: LucideIcon = MoreVertical;
export const IcChevronRight: LucideIcon = ChevronRight;
export const IcChevronLeft: LucideIcon = ChevronLeft;
export const IcArrowLeft: LucideIcon = ArrowLeft;
export const IcHome: LucideIcon = Home;
export const IcSettings: LucideIcon = Settings;
export const IcMonitor: LucideIcon = Monitor;
export const IcShare2: LucideIcon = Share2;
export const IcLink: LucideIcon = Link;
export const IcGlobe: LucideIcon = Globe;
export const IcLock: LucideIcon = Lock;
export const IcPencil: LucideIcon = Pencil;
export const IcCheck: LucideIcon = Check;
export const IcX: LucideIcon = X;
export const IcList: LucideIcon = List;
export const IcGrid: LucideIcon = Grid3X3;
export const IcSortAlpha: LucideIcon = ArrowUpDown;
export const IcFilter: LucideIcon = Filter;
export const IcTable: LucideIcon = Table;
export const IcHardDrive: LucideIcon = HardDrive;
export const IcSortDesc: LucideIcon = ArrowUpDown;

export const ICON_REGISTRY: Record<string, LucideIcon> = {
  IcFolder,
  IcFolderOpen,
  IcFolderPlus,
  IcFile,
  IcFileText,
  IcFileSpreadsheet,
  IcPresentation,
  IcImage,
  IcVideo,
  IcMusic,
  IcArchive,
  IcUpload,
  IcDownload,
  IcStar,
  IcUsers,
  IcUser,
  IcClock,
  IcTrash,
  IcSearch,
  IcPlus,
  IcMoreVertical,
  IcChevronRight,
  IcChevronLeft,
  IcArrowLeft,
  IcHome,
  IcSettings,
  IcMonitor,
  IcShare2,
  IcLink,
  IcGlobe,
  IcLock,
  IcPencil,
  IcCheck,
  IcX,
  IcList,
  IcGrid,
  IcSortAlpha,
  IcFilter,
  IcTable,
  IcHardDrive,
  IcSortDesc,
};

// ── Icon renderer for data-driven icon usage ──
import type { SVGProps } from 'react';

interface IconRendererProps extends SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
}

export function IconRenderer({ name, size = 22, ...props }: IconRendererProps) {
  const IconComponent = ICON_REGISTRY[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} {...props} />;
}

export const IcLauncher = IcHardDrive;
