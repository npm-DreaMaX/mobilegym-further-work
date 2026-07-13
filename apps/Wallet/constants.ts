import type { CardType, PassType } from './types';

export const CARD_TYPE_LABELS: Record<CardType, { label: string; labelEn: string; color: string }> = {
  bank: { label: '银行卡', labelEn: 'Bank Card', color: '#2B7DE9' },
  transit: { label: '交通卡', labelEn: 'Transit Card', color: '#34C759' },
  membership: { label: '会员卡', labelEn: 'Membership', color: '#FF9500' },
};

export const PASS_TYPE_LABELS: Record<PassType, { label: string; labelEn: string; color: string }> = {
  coupon: { label: '优惠券', labelEn: 'Coupon', color: '#FF3B30' },
  ticket: { label: '票券', labelEn: 'Ticket', color: '#5856D6' },
};

export const FILTER_OPTIONS: Array<{ id: 'all' | CardType | PassType; label: string; labelEn: string }> = [
  { id: 'all', label: '全部', labelEn: 'All' },
  { id: 'bank', label: '银行卡', labelEn: 'Bank' },
  { id: 'transit', label: '交通卡', labelEn: 'Transit' },
  { id: 'membership', label: '会员卡', labelEn: 'Membership' },
  { id: 'coupon', label: '优惠券', labelEn: 'Coupon' },
  { id: 'ticket', label: '票券', labelEn: 'Ticket' },
];

export const BANK_OPTIONS = [
  '中国工商银行',
  '中国建设银行',
  '中国农业银行',
  '中国银行',
  '招商银行',
  '交通银行',
  '中信银行',
  '中国光大银行',
  '平安银行',
  '兴业银行',
];

export const TRANSIT_CITIES = ['北京', '上海', '广州', '深圳', '杭州', '成都', '武汉', '西安', '重庆', '南京'];

export const MEMBERSHIP_BRANDS = ['星巴克', '海底捞', '山姆会员', 'Costco', '奈雪的茶', '喜茶', '瑞幸咖啡', '盒马鲜生'];

export const COUPON_MERCHANTS = ['麦当劳', '肯德基', '必胜客', '星巴克', '瑞幸咖啡', '喜茶', '奈雪的茶', '海底捞'];

export const TICKET_MERCHANTS = ['滴滴出行', '美团单车', '高德打车', '青桔单车', '哈啰单车'];
