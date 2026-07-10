import type React from 'react';
import {
  IcFood,
  IcDrink,
  IcStore,
  IcMedicine,
  IcFruit,
  IcErrand,
  IcBreakfast,
  IcNight,
  IcHome,
  IcOrder,
  IcMe,
} from './res/icons';

/** 首页分类宫格项（固定结构，icon 用 Ic* 组件引用，name 为 strings key） */
export interface HomeCategory {
  id: string;
  name: 'cat_food' | 'cat_drink' | 'cat_store' | 'cat_medicine' | 'cat_fruit' | 'cat_errand' | 'cat_breakfast' | 'cat_night';
  icon: React.FC<any>;
  color: string; // 圆形底色
}

export const HOME_CATEGORIES: HomeCategory[] = [
  { id: 'food', name: 'cat_food', icon: IcFood, color: '#FF8C00' },
  { id: 'drink', name: 'cat_drink', icon: IcDrink, color: '#FFB300' },
  { id: 'store', name: 'cat_store', icon: IcStore, color: '#26C261' },
  { id: 'medicine', name: 'cat_medicine', icon: IcMedicine, color: '#3B8BFF' },
  { id: 'fruit', name: 'cat_fruit', icon: IcFruit, color: '#FF5339' },
  { id: 'errand', name: 'cat_errand', icon: IcErrand, color: '#9C5BF5' },
  { id: 'breakfast', name: 'cat_breakfast', icon: IcBreakfast, color: '#FF9D3D' },
  { id: 'night', name: 'cat_night', icon: IcNight, color: '#5B6BFF' },
];

/** 底部 Tab 项 */
export interface TabItem {
  id: 'home' | 'orders' | 'me';
  label: 'tab_home' | 'tab_orders' | 'tab_me';
  icon: React.FC<any>;
  route: string;
}

export const TABS: TabItem[] = [
  { id: 'home', label: 'tab_home', icon: IcHome, route: '/' },
  { id: 'orders', label: 'tab_orders', icon: IcOrder, route: '/orders' },
  { id: 'me', label: 'tab_me', icon: IcMe, route: '/me' },
];

/** 商家标签 → 展示色 */
export const SHOP_TAG_COLORS: Record<string, string> = {
  满减: '#FF5339',
  准时达: '#3B8BFF',
  品牌: '#9C5BF5',
  热销: '#FF8C00',
  放心吃: '#26C261',
  新客: '#26C261',
  折扣: '#FF5339',
};

/** 结构 / 费用常量 */
export const MEITUAN_LITE_CONSTANTS = {
  categoryGridColumns: 4, // 一行 4 个
  categoryRowsVisible: 2, // 首屏可见 2 行
  deliveryFeeDefault: 3, // 默认配送费（无满免时）
  packingFeeDefault: 1, // 默认单件包装费
  defaultEtaMinutes: 35, // 默认预计送达
  freeDeliveryThreshold: 30, // 满免配送费门槛
} as const;
