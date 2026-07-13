import defaults from './defaults.json';
import { TABS, HOME_SECTIONS, SORT_OPTIONS, FILTER_TYPES, NEW_MENU_ITEMS, DEVICE_FILES, DEVICE_FILE_BY_ID, nextFileId, nextPermissionId } from '../constants';
import type { GoogleDriveState, DriveSettings, SearchCurrent } from '../types';

export const GOOGLEDRIVE_DEFAULTS = defaults;

export const GOOGLEDRIVE_CONFIG = {
  tabs: TABS,
  homeSections: HOME_SECTIONS,
  sortOptions: SORT_OPTIONS,
  filterTypes: FILTER_TYPES,
  newMenuItems: NEW_MENU_ITEMS,
  deviceFiles: DEVICE_FILES,
  deviceFileById: DEVICE_FILE_BY_ID,
  nextFileId,
  nextPermissionId,
  user: { ...defaults.user },
  settings: { ...defaults.settings } as DriveSettings,
  search: {
    current: { ...defaults.search.current } as SearchCurrent,
    history: [...defaults.search.history] as string[],
  },
  files: defaults.files.map(f => ({
    ...f,
    permissions: f.permissions.map(p => ({ ...p })),
  })),
};

export { nextFileId, nextPermissionId, DEVICE_FILES, DEVICE_FILE_BY_ID };
