import defaults from './defaults.json';
import {
  PLANS,
  PLAN_BY_ID,
  DATA_PACKS,
  DATA_PACK_BY_ID,
  QUICK_ENTRIES,
  SERVICE_CATALOG,
  SERVICE_PHONES,
  RECHARGE_AMOUNTS,
  BILL_CATEGORY_COLOR,
  SERVICE_DEFS,
  SERVICE_DEF_BY_ID,
  nextTransactionId,
  nextPurchasedPackId,
  nextFamilyId,
  computeRemainingDataGb,
  computeRemainingVoiceMin,
  billTotalFromItems,
  highestBillCategory,
} from '../constants';
import type { ChinaMobileState, Bill, Transaction, ChinaMobileSettings, PurchasedPack, SearchHistoryEntry } from '../types';

// World data (read-only catalogs) — not part of the persisted runtime overlay.
export const CHINAMOBILE_PLANS = PLANS;
export const CHINAMOBILE_PLAN_BY_ID = PLAN_BY_ID;
export const CHINAMOBILE_DATA_PACKS = DATA_PACKS;
export const CHINAMOBILE_DATA_PACK_BY_ID = DATA_PACK_BY_ID;
export const CHINAMOBILE_QUICK_ENTRIES = QUICK_ENTRIES;
export const CHINAMOBILE_SERVICE_CATALOG = SERVICE_CATALOG;
export const CHINAMOBILE_SERVICE_PHONES = SERVICE_PHONES;
export const CHINAMOBILE_RECHARGE_AMOUNTS = RECHARGE_AMOUNTS;
export const CHINAMOBILE_BILL_CATEGORY_COLOR = BILL_CATEGORY_COLOR;
export const CHINAMOBILE_SERVICE_DEFS = SERVICE_DEFS;
export const CHINAMOBILE_SERVICE_DEF_BY_ID = SERVICE_DEF_BY_ID;
export {
  nextTransactionId,
  nextPurchasedPackId,
  nextFamilyId,
  computeRemainingDataGb,
  computeRemainingVoiceMin,
  billTotalFromItems,
  highestBillCategory,
};

// Replaceable runtime overlay — the only data the benchmark judges against.
export const CHINAMOBILE_CONFIG: Omit<ChinaMobileState, '_temp'> = {
  user: { ...defaults.user },
  balance: defaults.balance,
  usage: { ...defaults.usage },
  activePlanId: defaults.activePlanId,
  bills: defaults.bills.map(b => ({ ...b, items: b.items.map(i => ({ ...i })) })) as Bill[],
  purchasedPacks: defaults.purchasedPacks.map((p: PurchasedPack) => ({ ...p })),
  subscribedServices: defaults.subscribedServices.map(s => ({ ...s })),
  roaming: { ...defaults.roaming },
  autopay: { ...defaults.autopay },
  familyNumbers: defaults.familyNumbers.map(f => ({ ...f })),
  profile: { ...defaults.profile },
  paymentMethods: defaults.paymentMethods.map(m => ({ ...m })),
  transactions: defaults.transactions.map(t => ({ ...t })) as Transaction[],
  search: {
    current: { ...defaults.search.current },
    history: defaults.search.history.map((h: SearchHistoryEntry) => ({ ...h })),
  },
  settings: { ...defaults.settings } as ChinaMobileSettings,
};
