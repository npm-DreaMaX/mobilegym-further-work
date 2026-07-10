// Tier-2 component-level colors (Tier-1 semantic colors are in manifest.ts theme.colors)
// Naming: <area>_<purpose> matching AOSP colors.xml convention
export const colors = {
  // [brand] 美团黄系
  brand_yellow: '#FFC300',
  brand_yellow_dark: '#FFB000',
  brand_yellow_light: '#FFD161',
  brand_yellow_soft: '#FFF3D6',

  // [price] 价格红色强调
  price_red: '#FF5339',
  price_red_dark: '#E0402F',

  // [tag] 标签色
  tag_red: '#FF5339',
  tag_orange: '#FF8C00',
  tag_blue: '#3B8BFF',
  tag_green: '#26C261',
  tag_gray: '#9B9B9B',
  tag_purple: '#9C5BF5',

  // [card] 卡片
  card_surface: '#ffffff',
  card_divider: '#f5f5f5',

  // [rating] 评分星
  rating_star: '#FFB400',

  // [mask] 遮罩
  mask_dim: 'rgba(0,0,0,0.5)',
} as const;

export const colorsDark: Partial<typeof colors> = {} as const;
