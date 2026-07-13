// ── Domain types for the GoogleDrive app ───────────────────────────────

export type FileType =
  | 'folder'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'pdf'
  | 'image'
  | 'text'
  | 'video'
  | 'audio'
  | 'archive'
  | 'other';

export type PermissionRole = 'owner' | 'editor' | 'viewer';

export type LinkAccess = 'restricted' | 'anyone_viewer' | 'anyone_editor';

export interface Permission {
  /** Stable permission id, e.g. "perm-001" */
  id: string;
  /** Email of the collaborator */
  email: string;
  /** Display name */
  name: string;
  role: PermissionRole;
  /** When the permission was granted (ms timestamp) */
  grantedAt: number;
}

export interface FileItem {
  /** Stable file id, e.g. "file-001" */
  id: string;
  /** Display name including extension */
  name: string;
  /** MIME type string */
  mimeType: string;
  type: FileType;
  /** File size in bytes */
  size: number;
  /** Owner email */
  owner: string;
  /** Owner display name */
  ownerName: string;
  /** Parent folder id (null for root) */
  parentId: string | null;
  /** Last modified timestamp (ms) */
  modifiedTime: number;
  /** Whether the file is starred */
  starred: boolean;
  /** Whether the file is in trash */
  trashed: boolean;
  /** Original parent id before trashing (for restore) */
  trashedFromParentId: string | null;
  /** Permissions list (includes owner) */
  permissions: Permission[];
  /** Link sharing access level */
  linkAccess: LinkAccess;
  /** Shareable link (null if linkAccess is restricted) */
  shareableLink: string | null;
  /** Whether this file was shared with the current user */
  sharedWithMe: boolean;
  /** Who shared it with the current user (if sharedWithMe) */
  sharedBy: string | null;
  /** When it was shared (ms timestamp, if sharedWithMe) */
  sharedAt: number | null;
  /** Drive label: 'my_drive' | 'shared' | 'computers' */
  driveLabel: 'my_drive' | 'shared' | 'computers';
  /** Created timestamp (ms) */
  createdTime: number;
  /** Last opened timestamp (ms) for recent tracking */
  lastOpenedAt: number | null;
}

export type SortOption = 'name' | 'modified' | 'size';

export type FilterType = 'all' | 'document' | 'spreadsheet' | 'presentation' | 'pdf' | 'image' | 'text' | 'folder';

export interface SearchCurrent {
  query: string;
  filterType: FilterType;
  filterOwner: string;
  searched: boolean;
  resultCount: number;
  /** Ids of files matching the current search */
  resultIds: string[];
}

export type SortDirection = 'asc' | 'desc';

export interface DriveSettings {
  sortOption: SortOption;
  sortDirection: SortDirection;
  viewMode: 'list' | 'grid';
}

export interface DeviceFile {
  /** Device-local file id, e.g. "device-file-001" */
  id: string;
  name: string;
  mimeType: string;
  type: FileType;
  size: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  storageUsed: number;
  storageTotal: number;
}

export interface GoogleDriveState {
  user: UserProfile;
  files: FileItem[];
  settings: DriveSettings;
  search: {
    current: SearchCurrent;
    /** Recent search queries */
    history: string[];
  };
  /** ID counter for new files */
  _nextFileId: number;
  /** ID counter for new permissions */
  _nextPermissionId: number;
  _temp: {
    /** Device file selector state */
    deviceSelectorOpen: boolean;
    /** Currently viewed file ID (volatile) */
    lastViewedFileId: string | null;
    /** Current navigation breadcrumb / folder stack */
    currentFolderId: string | null;
  };
}

export interface GoogleDriveActions {
  // File CRUD
  createFolder: (name: string, parentId: string | null) => string;
  uploadDeviceFile: (deviceFileId: string, parentId: string | null) => string;
  renameFile: (fileId: string, newName: string) => void;
  moveFile: (fileId: string, targetParentId: string | null) => void;
  deleteFile: (fileId: string) => void;
  restoreFile: (fileId: string) => void;
  permanentlyDeleteFile: (fileId: string) => void;
  // Star
  toggleStar: (fileId: string) => void;
  // Permissions
  addPermission: (fileId: string, email: string, name: string, role: PermissionRole) => string;
  updatePermission: (fileId: string, permissionId: string, role: PermissionRole) => void;
  removePermission: (fileId: string, permissionId: string) => void;
  setLinkAccess: (fileId: string, linkAccess: LinkAccess) => void;
  // Search
  submitSearch: (query: string) => void;
  setSearchFilter: (filterType: FilterType) => void;
  setSearchOwnerFilter: (ownerEmail: string) => void;
  clearSearch: () => void;
  // Settings
  updateSettings: (patch: Partial<DriveSettings>) => void;
  // Navigation helpers
  viewFile: (fileId: string) => void;
  setCurrentFolder: (folderId: string | null) => void;
  // Recent tracking
  recordOpen: (fileId: string) => void;
}

/** Map file type to readable Chinese label */
export const FILE_TYPE_LABELS: Record<FileType, string> = {
  folder: '文件夹',
  document: 'Google 文档',
  spreadsheet: 'Google 表格',
  presentation: 'Google 幻灯片',
  pdf: 'PDF',
  image: '图片',
  text: '文本文件',
  video: '视频',
  audio: '音频',
  archive: '压缩文件',
  other: '其他',
};

/** Map file type to readable English label */
export const FILE_TYPE_LABELS_EN: Record<FileType, string> = {
  folder: 'Folder',
  document: 'Google Docs',
  spreadsheet: 'Google Sheets',
  presentation: 'Google Slides',
  pdf: 'PDF',
  image: 'Image',
  text: 'Text File',
  video: 'Video',
  audio: 'Audio',
  archive: 'Archive',
  other: 'Other',
};

/** File type from MIME type string */
export function mimeToFileType(mimeType: string): FileType {
  if (mimeType === 'application/vnd.google-apps.folder') return 'folder';
  if (mimeType === 'application/vnd.google-apps.document') return 'document';
  if (mimeType === 'application/vnd.google-apps.spreadsheet') return 'spreadsheet';
  if (mimeType === 'application/vnd.google-apps.presentation') return 'presentation';
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('text/')) return 'text';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('tar') || mimeType.includes('7z')) return 'archive';
  return 'other';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function filterTypeToFileTypes(ft: FilterType): FileType[] {
  if (ft === 'all') return [];
  return [ft as FileType];
}
