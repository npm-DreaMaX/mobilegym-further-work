import { createAppStoreWithActions, registerStateAdapter } from '../../os/createAppStore';
import { now as timeNow } from '../../os/TimeService';
import { GOOGLEDRIVE_CONFIG, nextFileId, DEVICE_FILE_BY_ID } from './data';
import type {
  GoogleDriveState, GoogleDriveActions, FileItem, PermissionRole,
  LinkAccess, FilterType, DriveSettings, FileType, Permission,
} from './types';
import { mimeToFileType } from './types';

// ── Cast JSON data to typed FileItem ──────────────────────────────────

function castFile(raw: any): FileItem {
  return {
    ...raw,
    type: raw.type as FileType,
    linkAccess: raw.linkAccess as LinkAccess,
    driveLabel: raw.driveLabel as 'my_drive' | 'shared' | 'computers',
    permissions: (raw.permissions || []).map((p: any) => ({
      ...p,
      role: p.role as PermissionRole,
    })),
  };
}

// ── Initial state ────────────────────────────────────────────────────

const initialFiles: FileItem[] = GOOGLEDRIVE_CONFIG.files.map(castFile);

const initialState: GoogleDriveState = {
  user: { ...GOOGLEDRIVE_CONFIG.user },
  files: initialFiles,
  settings: { ...GOOGLEDRIVE_CONFIG.settings },
  search: {
    current: { ...GOOGLEDRIVE_CONFIG.search.current },
    history: [...GOOGLEDRIVE_CONFIG.search.history],
  },
  _nextFileId: 21,
  _nextPermissionId: 27,
  _temp: {
    deviceSelectorOpen: false,
    lastViewedFileId: null,
    currentFolderId: null,
  },
};

// ── Pure helpers ────────────────────────────────────────────────────

function generateShareableLink(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

// ── Store ────────────────────────────────────────────────────────────

export const useGoogleDriveStore = createAppStoreWithActions<GoogleDriveState, GoogleDriveActions>(
  'googledrive',
  initialState,
  (set, get) => ({
    // ── Create folder ──
    createFolder: (name, parentId) => {
      const s = get();
      const id = nextFileId(s.files);
      const newFolder: FileItem = {
        id,
        name,
        mimeType: 'application/vnd.google-apps.folder',
        type: 'folder',
        size: 0,
        owner: s.user.email,
        ownerName: s.user.name,
        parentId,
        modifiedTime: timeNow(),
        starred: false,
        trashed: false,
        trashedFromParentId: null,
        permissions: [
          { id: `perm-${s._nextPermissionId}`, email: s.user.email, name: s.user.name, role: 'owner' as PermissionRole, grantedAt: timeNow() },
        ],
        linkAccess: 'restricted' as LinkAccess,
        shareableLink: null,
        sharedWithMe: false,
        sharedBy: null,
        sharedAt: null,
        driveLabel: 'my_drive',
        createdTime: timeNow(),
        lastOpenedAt: null,
      };
      set((prev) => ({
        files: [...prev.files, newFolder],
        _nextFileId: prev._nextFileId + 1,
        _nextPermissionId: prev._nextPermissionId + 1,
      }));
      return id;
    },

    // ── Upload device file ──
    uploadDeviceFile: (deviceFileId, parentId) => {
      const s = get();
      const deviceFile = DEVICE_FILE_BY_ID[deviceFileId];
      if (!deviceFile) return '';
      const id = nextFileId(s.files);
      const fileType = mimeToFileType(deviceFile.mimeType);
      const newFile: FileItem = {
        id,
        name: deviceFile.name,
        mimeType: deviceFile.mimeType,
        type: fileType,
        size: deviceFile.size,
        owner: s.user.email,
        ownerName: s.user.name,
        parentId,
        modifiedTime: timeNow(),
        starred: false,
        trashed: false,
        trashedFromParentId: null,
        permissions: [
          { id: `perm-${s._nextPermissionId}`, email: s.user.email, name: s.user.name, role: 'owner' as PermissionRole, grantedAt: timeNow() },
        ],
        linkAccess: 'restricted' as LinkAccess,
        shareableLink: null,
        sharedWithMe: false,
        sharedBy: null,
        sharedAt: null,
        driveLabel: 'my_drive',
        createdTime: timeNow(),
        lastOpenedAt: null,
      };
      set((prev) => ({
        files: [...prev.files, newFile],
        _nextFileId: prev._nextFileId + 1,
        _nextPermissionId: prev._nextPermissionId + 1,
        user: { ...prev.user, storageUsed: prev.user.storageUsed + deviceFile.size },
      }));
      return id;
    },

    // ── Rename file ──
    renameFile: (fileId, newName) => {
      set((s) => ({
        files: s.files.map((f) =>
          f.id === fileId ? { ...f, name: newName, modifiedTime: timeNow() } : f,
        ),
      }));
    },

    // ── Move file ──
    moveFile: (fileId, targetParentId) => {
      set((s) => ({
        files: s.files.map((f) =>
          f.id === fileId ? { ...f, parentId: targetParentId, modifiedTime: timeNow() } : f,
        ),
      }));
    },

    // ── Move to trash ──
    deleteFile: (fileId) => {
      set((s) => ({
        files: s.files.map((f) =>
          f.id === fileId
            ? { ...f, trashed: true, trashedFromParentId: f.parentId, parentId: null, modifiedTime: timeNow() }
            : f,
        ),
      }));
    },

    // ── Restore from trash ──
    restoreFile: (fileId) => {
      set((s) => ({
        files: s.files.map((f) =>
          f.id === fileId && f.trashed
            ? { ...f, trashed: false, parentId: f.trashedFromParentId, trashedFromParentId: null, modifiedTime: timeNow() }
            : f,
        ),
      }));
    },

    // ── Permanently delete ──
    permanentlyDeleteFile: (fileId) => {
      set((s) => {
        const file = s.files.find(f => f.id === fileId);
        if (!file) return s;
        const idsToRemove = new Set<string>([fileId]);
        if (file.type === 'folder') {
          const queue = [fileId];
          while (queue.length > 0) {
            const currentId = queue.shift()!;
            const children = s.files.filter(f => f.parentId === currentId && f.id !== currentId);
            for (const child of children) {
              idsToRemove.add(child.id);
              if (child.type === 'folder') {
                queue.push(child.id);
              }
            }
          }
        }
        return {
          ...s,
          files: s.files.filter(f => !idsToRemove.has(f.id)),
        };
      });
    },

    // ── Toggle star ──
    toggleStar: (fileId) => {
      set((s) => ({
        files: s.files.map((f) =>
          f.id === fileId ? { ...f, starred: !f.starred } : f,
        ),
      }));
    },

    // ── Add permission ──
    addPermission: (fileId, email, name, role) => {
      const s = get();
      const permId = `perm-${s._nextPermissionId}`;
      const newPerm: Permission = {
        id: permId,
        email,
        name,
        role,
        grantedAt: timeNow(),
      };
      set((prev) => ({
        files: prev.files.map((f) =>
          f.id === fileId
            ? { ...f, permissions: [...f.permissions, newPerm], modifiedTime: timeNow() }
            : f,
        ),
        _nextPermissionId: prev._nextPermissionId + 1,
      }));
      return permId;
    },

    // ── Update permission ──
    updatePermission: (fileId, permissionId, role) => {
      set((s) => ({
        files: s.files.map((f) =>
          f.id === fileId
            ? {
                ...f,
                permissions: f.permissions.map((p) =>
                  p.id === permissionId ? { ...p, role } : p,
                ),
                modifiedTime: timeNow(),
              }
            : f,
        ),
      }));
    },

    // ── Remove permission ──
    removePermission: (fileId, permissionId) => {
      set((s) => ({
        files: s.files.map((f) =>
          f.id === fileId
            ? { ...f, permissions: f.permissions.filter((p) => p.id !== permissionId), modifiedTime: timeNow() }
            : f,
        ),
      }));
    },

    // ── Set link access ──
    setLinkAccess: (fileId, linkAccess) => {
      set((s) => ({
        files: s.files.map((f) =>
          f.id === fileId
            ? {
                ...f,
                linkAccess,
                shareableLink: linkAccess !== 'restricted' ? generateShareableLink(fileId) : null,
                modifiedTime: timeNow(),
              }
            : f,
        ),
      }));
    },

    // ── Submit search ──
    submitSearch: (query) => {
      const s = get();
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        set((s2) => ({
          search: {
            current: { query: '', filterType: 'all', filterOwner: '', searched: false, resultCount: 0, resultIds: [] },
            history: s2.search.history,
          },
        }));
        return;
      }
      const lowerQuery = trimmedQuery.toLowerCase();
      const matched = s.files.filter(f => {
        if (f.trashed) return false;
        return f.name.toLowerCase().includes(lowerQuery);
      });
      const history = [trimmedQuery, ...s.search.history.filter(h => h !== trimmedQuery)].slice(0, 20);
      set((s2) => ({
        search: {
          current: {
            query: trimmedQuery,
            filterType: s2.search.current.filterType,
            filterOwner: s2.search.current.filterOwner,
            searched: true,
            resultCount: matched.length,
            resultIds: matched.map(f => f.id),
          },
          history,
        },
      }));
    },

    // ── Set search filter ──
    setSearchFilter: (filterType) => {
      set((s) => {
        const current = s.search.current;
        let pool = s.files.filter(f => !f.trashed);
        if (current.query) {
          const lowerQuery = current.query.toLowerCase();
          pool = pool.filter(f => f.name.toLowerCase().includes(lowerQuery));
        }
        if (filterType !== 'all') {
          pool = pool.filter(f => f.type === filterType);
        }
        if (current.filterOwner) {
          const ownerLower = current.filterOwner.toLowerCase();
          pool = pool.filter(f => f.owner.toLowerCase().includes(ownerLower));
        }
        return {
          search: {
            ...s.search,
            current: {
              ...current,
              filterType,
              searched: true,
              resultCount: pool.length,
              resultIds: pool.map(f => f.id),
            },
          },
        };
      });
    },

    // ── Set search owner filter ──
    setSearchOwnerFilter: (ownerEmail) => {
      set((s) => {
        const current = s.search.current;
        let pool = s.files.filter(f => !f.trashed);
        if (current.query) {
          const lowerQuery = current.query.toLowerCase();
          pool = pool.filter(f => f.name.toLowerCase().includes(lowerQuery));
        }
        if (current.filterType !== 'all') {
          pool = pool.filter(f => f.type === current.filterType);
        }
        if (ownerEmail) {
          const ownerLower = ownerEmail.toLowerCase();
          pool = pool.filter(f => f.owner.toLowerCase().includes(ownerLower));
        }
        return {
          search: {
            ...s.search,
            current: {
              ...current,
              filterOwner: ownerEmail,
              searched: true,
              resultCount: pool.length,
              resultIds: pool.map(f => f.id),
            },
          },
        };
      });
    },

    // ── Clear search ──
    clearSearch: () => {
      set((s) => ({
        search: {
          current: { query: '', filterType: 'all', filterOwner: '', searched: false, resultCount: 0, resultIds: [] },
          history: s.search.history,
        },
      }));
    },

    // ── Update settings ──
    updateSettings: (patch) => {
      set((s) => ({ settings: { ...s.settings, ...patch } }));
    },

    // ── View file (volatile) ──
    viewFile: (fileId) => {
      set((s) => ({ _temp: { ...s._temp, lastViewedFileId: fileId } }));
    },

    // ── Set current folder (volatile) ──
    setCurrentFolder: (folderId) => {
      set((s) => ({ _temp: { ...s._temp, currentFolderId: folderId } }));
    },

    // ── Record open (for recent tracking) ──
    recordOpen: (fileId) => {
      set((s) => ({
        files: s.files.map((f) =>
          f.id === fileId ? { ...f, lastOpenedAt: timeNow() } : f,
        ),
      }));
    },
  }),
);

// ── Snapshot adapter for bench_env ───────────────────────────────────

registerStateAdapter('googledrive', (state) => {
  const files: FileItem[] = (state as any).files ?? [];
  const settings = (state as any).settings ?? { sortOption: 'modified', sortDirection: 'desc', viewMode: 'list' };
  const user = (state as any).user ?? { name: '', email: '', avatar: '', storageUsed: 0, storageTotal: 0 };
  const search = (state as any).search ?? { current: { query: '', filterType: 'all', filterOwner: '', searched: false, resultCount: 0, resultIds: [] }, history: [] };

  return {
    ...(state as any),
    // Derived: file IDs
    fileIds: files.map(f => f.id),
    activeFiles: files.filter(f => !f.trashed),
    activeFileIds: files.filter(f => !f.trashed).map(f => f.id),
    trashedFiles: files.filter(f => f.trashed),
    trashedFileIds: files.filter(f => f.trashed).map(f => f.id),
    starredFiles: files.filter(f => f.starred && !f.trashed),
    starredFileIds: files.filter(f => f.starred && !f.trashed).map(f => f.id),
    sharedWithMeFiles: files.filter(f => f.sharedWithMe && !f.trashed),
    sharedWithMeFileIds: files.filter(f => f.sharedWithMe && !f.trashed).map(f => f.id),
    recentFiles: files.filter(f => !f.trashed && f.lastOpenedAt !== null)
      .sort((a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0)).slice(0, 20),
    recentFileIds: files.filter(f => !f.trashed && f.lastOpenedAt !== null)
      .sort((a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0)).slice(0, 20).map(f => f.id),
    rootFiles: files.filter(f => !f.trashed && f.parentId === null),
    rootFileIds: files.filter(f => !f.trashed && f.parentId === null).map(f => f.id),
    storageUsed: user.storageUsed,
    storageTotal: user.storageTotal,
    sortOption: settings.sortOption,
    sortDirection: settings.sortDirection,
    viewMode: settings.viewMode,
    searchQuery: search.current?.query ?? '',
    searchFilterType: search.current?.filterType ?? 'all',
    searchFilterOwner: search.current?.filterOwner ?? '',
    searchSearched: search.current?.searched ?? false,
    searchResultCount: search.current?.resultCount ?? 0,
    searchResultIds: search.current?.resultIds ?? [],
    searchHistory: search.history ?? [],
  };
});
