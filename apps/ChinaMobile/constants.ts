// ── Structural configuration only (no user data, no raw Lucide names) ──

import type { Plan, DataPack, SubscribedService, Bill } from './types';

// ── 基础套餐目录（固定属性，world data；当前生效项由 state.activePlanId 指向） ──
export const PLANS: Plan[] = [
  { id: 'plan-128', name: '5G智享套餐-128元', price: 128, dataGb: 30, voiceMin: 500, desc: '30GB流量 + 500分钟语音，适合中度使用' },
  { id: 'plan-188', name: '5G智享套餐-188元', price: 188, dataGb: 60, voiceMin: 1000, desc: '60GB流量 + 1000分钟语音，主流套餐' },
  { id: 'plan-238', name: '5G智享套餐-238元', price: 238, dataGb: 100, voiceMin: 1500, desc: '100GB流量 + 1500分钟语音，重度使用' },
  { id: 'plan-58', name: '飞享套餐-58元', price: 58, dataGb: 10, voiceMin: 100, desc: '10GB流量 + 100分钟语音，经济实惠' },
];

export const PLAN_BY_ID: Record<string, Plan> = Object.fromEntries(PLANS.map(p => [p.id, p]));

// ── 流量包商城目录（固定可购买项） ──
export const DATA_PACKS: DataPack[] = [
  { id: 'pack-3gb', name: '3GB流量日包', dataGb: 3, price: 5, validity: '当日有效', desc: '当日24点前有效，适合临时救急' },
  { id: 'pack-10gb', name: '10GB流量加油包', dataGb: 10, price: 15, validity: '当月有效', desc: '本月有效，叠加在套餐流量之上' },
  { id: 'pack-20gb', name: '20GB流量月包', dataGb: 20, price: 30, validity: '当月有效', desc: '本月有效，大流量用户首选' },
  { id: 'pack-5gb7d', name: '5GB流量7天包', dataGb: 5, price: 8, validity: '7天有效', desc: '7天内有效，灵活补充' },
];

export const DATA_PACK_BY_ID: Record<string, DataPack> = Object.fromEntries(DATA_PACKS.map(p => [p.id, p]));

// ── 首页快捷入口（固定结构） ──
export interface QuickEntry {
  id: string;
  label: string;
  icon: string; // Ic* alias
}
export const QUICK_ENTRIES: QuickEntry[] = [
  { id: 'recharge', label: '充值交费', icon: 'IcWallet' },
  { id: 'datapack', label: '流量包', icon: 'IcDataPack' },
  { id: 'bill', label: '账单查询', icon: 'IcBill' },
  { id: 'plan', label: '套餐详情', icon: 'IcPlan' },
  { id: 'balance', label: '话费余额', icon: 'IcBalance' },
  { id: 'services', label: '已订业务', icon: 'IcServices' },
  { id: 'family', label: '亲情号码', icon: 'IcFamily' },
  { id: 'more', label: '更多服务', icon: 'IcGrid' },
];

// ── 服务搜索目录（固定可搜服务，搜索结果必须来自此真实列表） ──
export interface SearchableService {
  id: string;
  name: string;
  category: string;
  icon: string; // Ic* alias
}
export const SERVICE_CATALOG: SearchableService[] = [
  { id: 'svc-recharge', name: '充值交费', category: '话费', icon: 'IcWallet' },
  { id: 'svc-datapack', name: '流量包办理', category: '流量', icon: 'IcDataPack' },
  { id: 'svc-bill', name: '账单查询', category: '账单', icon: 'IcBill' },
  { id: 'svc-plan', name: '套餐变更', category: '套餐', icon: 'IcPlan' },
  { id: 'svc-balance', name: '话费余额查询', category: '话费', icon: 'IcBalance' },
  { id: 'svc-data', name: '流量用量查询', category: '流量', icon: 'IcDataUsage' },
  { id: 'svc-voice', name: '语音用量查询', category: '语音', icon: 'IcVoice' },
  { id: 'svc-services', name: '已订业务', category: '业务', icon: 'IcServices' },
  { id: 'svc-roaming', name: '国际漫游', category: '业务', icon: 'IcGlobe' },
  { id: 'svc-autopay', name: '自动缴费', category: '缴费', icon: 'IcAutopay' },
  { id: 'svc-family', name: '亲情号码', category: '家庭', icon: 'IcFamily' },
  { id: 'svc-profile', name: '个人资料', category: '账户', icon: 'IcUser' },
  { id: 'svc-points', name: '积分商城', category: '积分', icon: 'IcPoints' },
  { id: 'svc-invoice', name: '电子发票', category: '账单', icon: 'IcFileText' },
  { id: 'svc-card', name: '实名认证', category: '账户', icon: 'IcCard' },
  { id: 'svc-hotline', name: '客服热线', category: '服务', icon: 'IcPhone' },
];

// ── 客服电话（固定目录，参考 Railway SERVICE_PHONES） ──
export const SERVICE_PHONES: { id: string; label: string; number: string }[] = [
  { id: 'ph-10086', label: '全国客服热线', number: '10086' },
  { id: 'ph-1008611', label: '话费余额查询', number: '1008611' },
  { id: 'ph-1008612', label: '人工服务', number: '1008612' },
  { id: 'ph-13800138', label: '集团客户', number: '13800138000' },
];

// ── 充值预设金额（固定） ──
export const RECHARGE_AMOUNTS: number[] = [30, 50, 100, 200, 300, 500];

// ── 业务分类标签（账单明细分类展示色） ──
export const BILL_CATEGORY_COLOR: Record<string, string> = {
  套餐费: '#0066B3',
  语音通话费: '#FF6A00',
  流量费: '#00A0E9',
  增值业务费: '#9B59B6',
  代收费用: '#8A8F99',
  其他费用: '#B0B4BC',
};

// ── 已订增值业务默认目录（固定属性 + 初始 enabled 在 defaults.json） ──
// 名称/价格/可否退订属固定属性，放 constants；enabled 初值放 defaults.json。
export interface ServiceDef {
  id: string;
  name: string;
  price: number;
  cancellable: boolean;
  desc: string;
}
export const SERVICE_DEFS: ServiceDef[] = [
  { id: 'vas-callerid', name: '来电显示', price: 0, cancellable: false, desc: '显示来电号码，基础功能' },
  { id: 'vas-cloud', name: '和彩云盘', price: 5, cancellable: true, desc: '云存储空间，月费5元' },
  { id: 'vas-crbt', name: '视频彩铃', price: 6, cancellable: true, desc: '视频彩铃服务，月费6元' },
  { id: 'vas-weather', name: '气象短信', price: 2, cancellable: true, desc: '每日天气预报短信，月费2元' },
  { id: 'vas-139mail', name: '139邮箱', price: 0, cancellable: true, desc: '移动邮箱服务，免费' },
];
export const SERVICE_DEF_BY_ID: Record<string, ServiceDef> = Object.fromEntries(SERVICE_DEFS.map(s => [s.id, s]));

// ── id 生成（确定性：基于已有最大序号） ──
export function nextTransactionId(existing: { id: string }[]): string {
  const maxN = existing.reduce((m, r) => {
    const match = r.id.match(/^txn-(\d+)$/);
    return match ? Math.max(m, parseInt(match[1], 10)) : m;
  }, 0);
  return `txn-${String(maxN + 1).padStart(3, '0')}`;
}

export function nextPurchasedPackId(existing: { id: string }[]): string {
  const maxN = existing.reduce((m, r) => {
    const match = r.id.match(/^pack-txn-(\d+)$/);
    return match ? Math.max(m, parseInt(match[1], 10)) : m;
  }, 0);
  return `pack-txn-${String(maxN + 1).padStart(3, '0')}`;
}

export function nextFamilyId(existing: { id: string }[]): string {
  const maxN = existing.reduce((m, r) => {
    const match = r.id.match(/^fam-(\d+)$/);
    return match ? Math.max(m, parseInt(match[1], 10)) : m;
  }, 0);
  return `fam-${String(maxN + 1).padStart(3, '0')}`;
}

// ── 派生计算（UI 与 setup/judge 可复算，不持久化） ──
export function computeRemainingDataGb(state: {
  usage: { dataTotalGb: number; dataUsedGb: number };
  purchasedPacks: { dataGb: number }[];
}): number {
  const extra = state.purchasedPacks.reduce((s, p) => s + p.dataGb, 0);
  return Math.round((state.usage.dataTotalGb + extra - state.usage.dataUsedGb) * 100) / 100;
}

export function computeRemainingVoiceMin(usage: { voiceTotalMin: number; voiceUsedMin: number }): number {
  return Math.max(0, usage.voiceTotalMin - usage.voiceUsedMin);
}

export function billTotalFromItems(items: { amount: number }[]): number {
  return Math.round(items.reduce((s, i) => s + i.amount, 0) * 100) / 100;
}

export function highestBillCategory(bill: Bill | undefined): { category: string; amount: number } | null {
  if (!bill || !bill.items || bill.items.length === 0) return null;
  let top = bill.items[0];
  for (const it of bill.items) {
    if (it.amount > top.amount) top = it;
  }
  return { category: top.category, amount: top.amount };
}
