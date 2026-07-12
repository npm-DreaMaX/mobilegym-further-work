// ── Structural configuration only (no user data, no raw Lucide names) ──

export interface CarrierInfo {
  id: string;
  name: string;
  shortName: string;
  icon: string; // Ic* alias
  color: string;
}

/** 承运商目录（固定属性，来自 world data，不放 defaults.json） */
export const CARRIERS: CarrierInfo[] = [
  { id: 'sf', name: '顺丰速运', shortName: '顺丰', icon: 'IcTruck', color: '#000000' },
  { id: 'zt', name: '中通快递', shortName: '中通', icon: 'IcTruck', color: '#1A73E8' },
  { id: 'yt', name: '圆通速递', shortName: '圆通', icon: 'IcTruck', color: '#FE7D00' },
  { id: 'sto', name: '申通快递', shortName: '申通', icon: 'IcTruck', color: '#E4393C' },
  { id: 'yd', name: '韵达快递', shortName: '韵达', icon: 'IcTruck', color: '#005C9A' },
  { id: 'jd', name: '京东物流', shortName: '京东', icon: 'IcTruck', color: '#C81623' },
  { id: 'jt', name: '极兔速递', shortName: '极兔', icon: 'IcTruck', color: '#D6001C' },
  { id: 'ems', name: '中国邮政', shortName: '邮政', icon: 'IcTruck', color: '#007E3E' },
  { id: 'db', name: '德邦快递', shortName: '德邦', icon: 'IcTruck', color: '#FF6A00' },
  { id: 'tt', name: '天天快递', shortName: '天天', icon: 'IcTruck', color: '#00A0E9' },
  { id: 'fw', name: '丰网速运', shortName: '丰网', icon: 'IcTruck', color: '#2E8B57' },
  { id: 'cn', name: '菜鸟驿站', shortName: '菜鸟', icon: 'IcStation', color: '#FF6A00' },
];

export const CARRIER_BY_ID: Record<string, CarrierInfo> = Object.fromEntries(
  CARRIERS.map(c => [c.id, c]),
);

export interface ServiceTypeInfo {
  id: string;
  name: string;
  /** 基础运费（元） */
  baseFee: number;
  /** 每公斤加价（元） */
  perKg: number;
  /** 预计时效（天） */
  etaDays: number;
  icon: string;
}

/** 寄件服务类型目录 */
export const SERVICE_TYPES: ServiceTypeInfo[] = [
  { id: 'standard', name: '标准快递', baseFee: 12, perKg: 2, etaDays: 2, icon: 'IcTruck' },
  { id: 'economy', name: '经济快递', baseFee: 8, perKg: 1, etaDays: 3, icon: 'IcTruck' },
  { id: 'samecity', name: '同城配送', baseFee: 10, perKg: 1.5, etaDays: 1, icon: 'IcTruck' },
  { id: 'large', name: '大件物流', baseFee: 20, perKg: 3, etaDays: 3, icon: 'IcTruck' },
  { id: 'fresh', name: '生鲜冷链', baseFee: 18, perKg: 2.5, etaDays: 1, icon: 'IcTruck' },
];

export const SERVICE_BY_ID: Record<string, ServiceTypeInfo> = Object.fromEntries(
  SERVICE_TYPES.map(s => [s.id, s]),
);

/** 物品类型目录 */
export const ITEM_CATEGORIES: string[] = [
  '日用品',
  '食品',
  '数码产品',
  '服饰鞋包',
  '书籍',
  '文件',
  '家居家电',
  '母婴用品',
  '美妆护肤',
  '其他',
];

/** 预约取件时段 */
export const PICKUP_TIME_SLOTS: string[] = [
  '今天 09:00-11:00',
  '今天 11:00-13:00',
  '今天 14:00-16:00',
  '今天 16:00-18:00',
  '今天 18:00-20:00',
  '明天 09:00-11:00',
  '明天 14:00-16:00',
];

/** 地址标签目录 */
export const ADDRESS_TAGS: string[] = ['家', '公司', '学校', '其他'];

/** 寄件服务 + 费用确定性计算（UI 与 setup/judge 可复算） */
export function computeSendFee(serviceTypeId: string, weightKg: number): number {
  const s = SERVICE_BY_ID[serviceTypeId];
  if (!s) return 0;
  const w = Math.max(1, weightKg);
  return Math.round((s.baseFee + s.perKg * (w - 1)) * 100) / 100;
}

/** 寄件 id 生成（确定性：基于已有序数 + 时间戳，但 setup/judge 用 initial/final id diff 判定） */
export function nextSendRecordId(existing: { id: string }[]): string {
  const maxN = existing.reduce((m, r) => {
    const match = r.id.match(/^send-(\d+)$/);
    return match ? Math.max(m, parseInt(match[1], 10)) : m;
  }, 0);
  return `send-${String(maxN + 1).padStart(3, '0')}`;
}

export function nextAddressId(existing: { id: string }[]): string {
  const maxN = existing.reduce((m, r) => {
    const match = r.id.match(/^addr-(\d+)$/);
    return match ? Math.max(m, parseInt(match[1], 10)) : m;
  }, 0);
  return `addr-${String(maxN + 1).padStart(3, '0')}`;
}

/** 地址标签 → icon */
export const ADDRESS_TAG_ICON: Record<string, string> = {
  '家': 'IcHome',
  '公司': 'IcFileText',
  '学校': 'IcFileText',
  '其他': 'IcMapPin',
};
