import type { CategoryInfo, SortOption, GlobalUpdateSetting } from './types';

export const CATEGORIES: CategoryInfo[] = [
  { id: 'tools', name: '工具', nameEn: 'Tools', icon: 'IcTools' },
  { id: 'education', name: '教育', nameEn: 'Education', icon: 'IcEducation' },
  { id: 'social', name: '社交', nameEn: 'Social', icon: 'IcSocial' },
  { id: 'music', name: '音乐', nameEn: 'Music', icon: 'IcMusic' },
  { id: 'photography', name: '摄影', nameEn: 'Photography', icon: 'IcPhotography' },
  { id: 'games', name: '游戏', nameEn: 'Games', icon: 'IcGames' },
  { id: 'productivity', name: '效率', nameEn: 'Productivity', icon: 'IcProductivity' },
  { id: 'travel', name: '出行', nameEn: 'Travel', icon: 'IcTravel' },
];

export const SORT_OPTIONS: { id: SortOption; label: string; labelEn: string }[] = [
  { id: 'relevance', label: '相关性', labelEn: 'Relevance' },
  { id: 'rating', label: '评分', labelEn: 'Rating' },
  { id: 'downloads', label: '下载量', labelEn: 'Downloads' },
  { id: 'size', label: '安装包大小', labelEn: 'Size' },
];

export const GLOBAL_UPDATE_OPTIONS: { id: GlobalUpdateSetting; label: string; labelEn: string }[] = [
  { id: 'wifi_only', label: '仅 Wi-Fi', labelEn: 'Wi-Fi only' },
  { id: 'always', label: '始终', labelEn: 'Always' },
  { id: 'never', label: '从不', labelEn: 'Never' },
];

export const TAB_BAR_ITEMS = [
  { id: 'home', route: '/', icon: 'IcHome', label: '首页' },
  { id: 'myapps', route: '/myapps', icon: 'IcApps', label: '我的应用' },
  { id: 'wishlist', route: '/wishlist', icon: 'IcWishlist', label: '愿望单' },
];
