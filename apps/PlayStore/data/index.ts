import defaults from './defaults.json';
import type { AppInfo } from '../types';

// Merge defaults with empty runtime slots
export const PLAYSTORE_CONFIG = {
  ...defaults,
};

// Base apps data (world data - read only reference for bench)
export function baseApps(): AppInfo[] {
  return PLAYSTORE_CONFIG.apps as AppInfo[];
}

export function baseAppById(id: string): AppInfo | undefined {
  return (PLAYSTORE_CONFIG.apps as AppInfo[]).find(a => a.id === id);
}
