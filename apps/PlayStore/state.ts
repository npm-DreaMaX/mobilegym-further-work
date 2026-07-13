import { createAppStoreWithActions } from '../../os/createAppStore';
import { PLAYSTORE_CONFIG } from './data';
import type {
  DownloadJob,
  DownloadStatus,
  InstallRecord,
  UpdateRecord,
  UninstallRecord,
  UserReview,
  ReviewItem,
  SortOption,
  GlobalUpdateSetting,
  SearchSnapshot,
} from './types';

// ---- State & Actions interfaces ----

interface PlayStoreState {
  user: typeof PLAYSTORE_CONFIG.user;
  settings: {
    globalUpdate: GlobalUpdateSetting;
  };
  installedApps: Record<string, string>; // appId -> installedVersion
  installRecords: InstallRecord[];
  updateRecords: UpdateRecord[];
  uninstallRecords: UninstallRecord[];
  downloadJobs: DownloadJob[];
  wishlist: string[]; // appIds
  autoUpdate: Record<string, boolean>; // appId -> autoUpdate enabled
  ratings: Record<string, number>; // appId -> user rating (1-5)
  userReviews: UserReview[];
  reviews: ReviewItem[];
  search: {
    current: Omit<SearchSnapshot, 'id'>;
    history: SearchSnapshot[];
  };
  currentCategoryId: string | null;
  currentSortOption: SortOption;
  openedAppIds: string[];
}

interface PlayStoreActions {
  // Install / Download
  installApp: (appId: string, version: string, now: number) => void;
  addDownloadJob: (appId: string, now: number) => void;
  cancelDownloadJob: (jobId: string) => void;
  completeDownloadJob: (jobId: string) => void;

  // Update
  updateApp: (appId: string, fromVersion: string, toVersion: string, now: number) => void;

  // Uninstall
  uninstallApp: (appId: string, version: string, now: number) => void;

  // Wishlist
  addToWishlist: (appId: string) => void;
  removeFromWishlist: (appId: string) => void;

  // Auto-update
  setAutoUpdate: (appId: string, enabled: boolean) => void;
  setGlobalUpdate: (setting: GlobalUpdateSetting) => void;

  // Ratings & Reviews
  setRating: (appId: string, rating: number) => void;
  addReview: (review: UserReview) => void;
  updateReview: (reviewId: string, rating: number, content: string, now: number) => void;
  deleteReview: (reviewId: string) => void;

  // Search
  setSearchCurrent: (patch: Partial<Omit<SearchSnapshot, 'id'>>) => void;
  recordSearchSnapshot: () => void;
  addOpenedAppId: (appId: string) => void;

  // Navigation state
  setCurrentCategory: (categoryId: string | null) => void;
  setCurrentSortOption: (option: SortOption) => void;

  // Settings
  updateSettings: (patch: Partial<PlayStoreState['settings']>) => void;
}

// ---- Store ----

const initialState: PlayStoreState = {
  user: PLAYSTORE_CONFIG.user,
  settings: {
    globalUpdate: (PLAYSTORE_CONFIG.settings?.globalUpdate as GlobalUpdateSetting) ?? 'wifi_only',
  },
  installedApps: { ...PLAYSTORE_CONFIG.installedApps } as Record<string, string>,
  installRecords: [...PLAYSTORE_CONFIG.installRecords] as InstallRecord[],
  updateRecords: [...PLAYSTORE_CONFIG.updateRecords] as UpdateRecord[],
  uninstallRecords: [...PLAYSTORE_CONFIG.uninstallRecords] as UninstallRecord[],
  downloadJobs: [...PLAYSTORE_CONFIG.downloadJobs] as DownloadJob[],
  wishlist: [...PLAYSTORE_CONFIG.wishlist] as string[],
  autoUpdate: { ...PLAYSTORE_CONFIG.autoUpdate } as Record<string, boolean>,
  ratings: { ...PLAYSTORE_CONFIG.ratings } as Record<string, number>,
  userReviews: [...PLAYSTORE_CONFIG.userReviews] as UserReview[],
  reviews: [...PLAYSTORE_CONFIG.reviews] as ReviewItem[],
  search: {
    current: { ...PLAYSTORE_CONFIG.search.current } as Omit<SearchSnapshot, 'id'>,
    history: [...PLAYSTORE_CONFIG.search.history] as SearchSnapshot[],
  },
  currentCategoryId: PLAYSTORE_CONFIG.currentCategoryId as string | null,
  currentSortOption: (PLAYSTORE_CONFIG.currentSortOption as SortOption) ?? 'relevance',
  openedAppIds: [...PLAYSTORE_CONFIG.openedAppIds] as string[],
};

export const usePlayStoreStore = createAppStoreWithActions<PlayStoreState, PlayStoreActions>(
  'playstore',
  initialState,
  (set, get) => ({
    // ---- Install / Download ----
    installApp: (appId: string, version: string, now: number) => {
      set(state => ({
        installedApps: { ...state.installedApps, [appId]: version },
        installRecords: [
          ...state.installRecords,
          { id: `ir-${state.installRecords.length + 1}`, appId, version, installedAt: now },
        ],
      }));
    },

    addDownloadJob: (appId: string, now: number) => {
      set(state => ({
        downloadJobs: [
          ...state.downloadJobs,
          {
            id: `dj-${state.downloadJobs.length + 1}`,
            appId,
            status: 'queued' as DownloadStatus,
            createdAt: now,
          },
        ],
      }));
    },

    cancelDownloadJob: (jobId: string) => {
      set(state => ({
        downloadJobs: state.downloadJobs.map(j =>
          j.id === jobId ? { ...j, status: 'cancelled' as DownloadStatus } : j,
        ),
      }));
    },

    completeDownloadJob: (jobId: string) => {
      set(state => ({
        downloadJobs: state.downloadJobs.map(j =>
          j.id === jobId ? { ...j, status: 'completed' as DownloadStatus } : j,
        ),
      }));
    },

    // ---- Update ----
    updateApp: (appId: string, fromVersion: string, toVersion: string, now: number) => {
      set(state => ({
        installedApps: { ...state.installedApps, [appId]: toVersion },
        updateRecords: [
          ...state.updateRecords,
          {
            id: `ur-${state.updateRecords.length + 1}`,
            appId,
            fromVersion,
            toVersion,
            updatedAt: now,
          },
        ],
      }));
    },

    // ---- Uninstall ----
    uninstallApp: (appId: string, version: string, now: number) => {
      set(state => {
        const newInstalled = { ...state.installedApps };
        delete newInstalled[appId];
        // Keep auto-update setting but set to false
        const newAutoUpdate = { ...state.autoUpdate };
        newAutoUpdate[appId] = false;
        return {
          installedApps: newInstalled,
          autoUpdate: newAutoUpdate,
          uninstallRecords: [
            ...state.uninstallRecords,
            {
              id: `ur-${state.uninstallRecords.length + 1}`,
              appId,
              version,
              uninstalledAt: now,
            },
          ],
        };
      });
    },

    // ---- Wishlist ----
    addToWishlist: (appId: string) => {
      set(state => ({
        wishlist: state.wishlist.includes(appId)
          ? state.wishlist
          : [...state.wishlist, appId],
      }));
    },

    removeFromWishlist: (appId: string) => {
      set(state => ({
        wishlist: state.wishlist.filter(id => id !== appId),
      }));
    },

    // ---- Auto-update ----
    setAutoUpdate: (appId: string, enabled: boolean) => {
      set(state => ({
        autoUpdate: { ...state.autoUpdate, [appId]: enabled },
      }));
    },

    setGlobalUpdate: (setting: GlobalUpdateSetting) => {
      set(state => ({
        settings: { ...state.settings, globalUpdate: setting },
      }));
    },

    // ---- Ratings & Reviews ----
    setRating: (appId: string, rating: number) => {
      set(state => ({
        ratings: { ...state.ratings, [appId]: rating },
      }));
    },

    addReview: (review: UserReview) => {
      set(state => ({
        userReviews: [...state.userReviews, review],
      }));
    },

    updateReview: (reviewId: string, rating: number, content: string, now: number) => {
      set(state => ({
        userReviews: state.userReviews.map(r =>
          r.id === reviewId ? { ...r, rating, content, updatedAt: now } : r,
        ),
      }));
    },

    deleteReview: (reviewId: string) => {
      set(state => ({
        userReviews: state.userReviews.filter(r => r.id !== reviewId),
      }));
    },

    // ---- Search ----
    setSearchCurrent: (patch: Partial<Omit<SearchSnapshot, 'id'>>) => {
      set(state => ({
        search: {
          ...state.search,
          current: { ...state.search.current, ...patch },
        },
      }));
    },

    recordSearchSnapshot: () => {
      set(state => {
        const currentSearch = state.search.current;
        const prevHistory = state.search.history;
        const id = `${prevHistory.length + 1}`;
        const snapshot: SearchSnapshot = { id, ...currentSearch };
        return {
          search: {
            ...state.search,
            history: [...prevHistory, snapshot],
          },
        };
      });
    },

    addOpenedAppId: (appId: string) => {
      set(state => ({
        openedAppIds: state.openedAppIds.includes(appId)
          ? state.openedAppIds
          : [...state.openedAppIds, appId],
      }));
    },

    // ---- Navigation state ----
    setCurrentCategory: (categoryId: string | null) => {
      set({ currentCategoryId: categoryId });
    },

    setCurrentSortOption: (option: SortOption) => {
      set({ currentSortOption: option });
    },

    // ---- Settings ----
    updateSettings: (patch: Partial<PlayStoreState['settings']>) => {
      set(state => ({
        settings: { ...state.settings, ...patch },
      }));
    },
  }),
);
