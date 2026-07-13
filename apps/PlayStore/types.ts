// ---- App Entity Types ----

export type CategoryId = string;

export interface AppInfo {
  id: string;
  name: string;
  developer: string;
  categoryId: CategoryId;
  summary: string;
  description: string;
  storeVersion: string;
  size: string; // e.g. "24 MB"
  sizeBytes: number;
  rating: number; // 0.0 - 5.0
  ratingCount: number;
  downloads: string; // e.g. "1M+"
  ageRating: string; // e.g. "3+"
  updatedAt: number; // timestamp
  icon: string; // icon name from Ic* registry
}

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  nameEn: string;
  icon: string;
}

// ---- Runtime State Types ----

export type DownloadStatus = 'queued' | 'downloading' | 'completed' | 'cancelled';

export interface DownloadJob {
  id: string;
  appId: string;
  status: DownloadStatus;
  createdAt: number;
}

export interface InstallRecord {
  id: string;
  appId: string;
  version: string;
  installedAt: number;
}

export interface UpdateRecord {
  id: string;
  appId: string;
  fromVersion: string;
  toVersion: string;
  updatedAt: number;
}

export interface UninstallRecord {
  id: string;
  appId: string;
  version: string;
  uninstalledAt: number;
}

export interface UserReview {
  id: string;
  appId: string;
  rating: number; // 1-5
  content: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReviewItem {
  id: string;
  appId: string;
  userName: string;
  rating: number;
  content: string;
  createdAt: number;
}

export type SortOption = 'relevance' | 'rating' | 'downloads' | 'size';
export type GlobalUpdateSetting = 'wifi_only' | 'always' | 'never';

export interface SearchSnapshot {
  id: string;
  query: string;
  categoryId: string | null;
  sortOption: SortOption;
  resultsCount: number;
  firstResultId: string | null;
}

export interface PlayStoreSettings {
  globalUpdate: GlobalUpdateSetting;
}

export interface PlayStoreUser {
  name: string;
  avatar: string;
}
