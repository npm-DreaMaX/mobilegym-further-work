// ── Structural configuration only (no user data, no raw Lucide names) ──

import type { DeviceFile } from './types';

/** Bottom navigation tabs */
export interface TabInfo {
  id: string;
  route: string;
  label: string;
  labelEn: string;
  icon: string;
}

export const TABS: TabInfo[] = [
  { id: 'home', route: '/', label: '首页', labelEn: 'Home', icon: 'IcHome' },
  { id: 'starred', route: '/starred', label: '星标', labelEn: 'Starred', icon: 'IcStar' },
  { id: 'shared', route: '/shared', label: '已共享', labelEn: 'Shared', icon: 'IcUsers' },
  { id: 'files', route: '/files', label: '文件', labelEn: 'Files', icon: 'IcFolder' },
];

/** Home page quick-access sections */
export interface HomeSection {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
  route: string;
}

export const HOME_SECTIONS: HomeSection[] = [
  { id: 'my_drive', label: '我的云端硬盘', labelEn: 'My Drive', icon: 'IcFolder', route: '/files' },
  { id: 'computers', label: '计算机', labelEn: 'Computers', icon: 'IcMonitor', route: '/computers' },
  { id: 'shared', label: '与我共享', labelEn: 'Shared with me', icon: 'IcUsers', route: '/shared' },
  { id: 'recent', label: '最近', labelEn: 'Recent', icon: 'IcClock', route: '/recent' },
  { id: 'starred', label: '已加星标', labelEn: 'Starred', icon: 'IcStar', route: '/starred' },
  { id: 'trash', label: '回收站', labelEn: 'Trash', icon: 'IcTrash', route: '/trash' },
];

/** Sort options for the sort menu */
export interface SortOptionInfo {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
}

export const SORT_OPTIONS: SortOptionInfo[] = [
  { id: 'name', label: '名称', labelEn: 'Name', icon: 'IcSortAlpha' },
  { id: 'modified', label: '最后修改时间', labelEn: 'Last modified', icon: 'IcClock' },
  { id: 'size', label: '文件大小', labelEn: 'File size', icon: 'IcFileText' },
];

/** Filter type options for the filter menu */
export interface FilterTypeInfo {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
}

export const FILTER_TYPES: FilterTypeInfo[] = [
  { id: 'all', label: '全部', labelEn: 'All', icon: 'IcFile' },
  { id: 'folder', label: '文件夹', labelEn: 'Folders', icon: 'IcFolder' },
  { id: 'document', label: '文档', labelEn: 'Documents', icon: 'IcFileText' },
  { id: 'spreadsheet', label: '表格', labelEn: 'Spreadsheets', icon: 'IcTable' },
  { id: 'presentation', label: '演示文稿', labelEn: 'Presentations', icon: 'IcPresentation' },
  { id: 'pdf', label: 'PDF', labelEn: 'PDF', icon: 'IcFileText' },
  { id: 'image', label: '图片', labelEn: 'Images', icon: 'IcImage' },
  { id: 'text', label: '文本', labelEn: 'Text', icon: 'IcFileText' },
];

/** New menu item definitions */
export interface NewMenuItem {
  id: string;
  label: string;
  labelEn: string;
  icon: string;
}

export const NEW_MENU_ITEMS: NewMenuItem[] = [
  { id: 'folder', label: '文件夹', labelEn: 'Folder', icon: 'IcFolderPlus' },
  { id: 'upload', label: '上传文件', labelEn: 'Upload file', icon: 'IcUpload' },
  { id: 'document', label: 'Google 文档', labelEn: 'Google Docs', icon: 'IcFileText' },
  { id: 'spreadsheet', label: 'Google 表格', labelEn: 'Google Sheets', icon: 'IcTable' },
  { id: 'presentation', label: 'Google 幻灯片', labelEn: 'Google Slides', icon: 'IcPresentation' },
];

/** Simulated device files available for upload */
export const DEVICE_FILES: DeviceFile[] = [
  { id: 'device-file-001', name: 'quarterly-plan.pdf', mimeType: 'application/pdf', type: 'pdf', size: 2450000 },
  { id: 'device-file-002', name: 'field-notes.txt', mimeType: 'text/plain', type: 'text', size: 48000 },
  { id: 'device-file-003', name: 'budget-forecast.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', type: 'spreadsheet', size: 890000 },
  { id: 'device-file-004', name: 'product-demo.pptx', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', type: 'presentation', size: 5200000 },
  { id: 'device-file-005', name: 'team-photo.jpg', mimeType: 'image/jpeg', type: 'image', size: 3200000 },
  { id: 'device-file-006', name: 'meeting-notes.docx', mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', type: 'document', size: 156000 },
];

/** Device file lookup */
export const DEVICE_FILE_BY_ID: Record<string, DeviceFile> = Object.fromEntries(
  DEVICE_FILES.map(f => [f.id, f]),
);

/** Deterministic new file ID generator */
export function nextFileId(existing: { id: string }[]): string {
  const maxN = existing.reduce((m, f) => {
    const match = f.id.match(/^file-(\d+)$/);
    return match ? Math.max(m, parseInt(match[1], 10)) : m;
  }, 0);
  return `file-${String(maxN + 1).padStart(3, '0')}`;
}

/** Deterministic new permission ID generator */
export function nextPermissionId(existing: { id: string }[]): string {
  const maxN = existing.reduce((m, p) => {
    const match = p.id.match(/^perm-(\d+)$/);
    return match ? Math.max(m, parseInt(match[1], 10)) : m;
  }, 0);
  return `perm-${String(maxN + 1).padStart(3, '0')}`;
}
