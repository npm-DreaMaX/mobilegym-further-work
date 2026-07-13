// ChinaMobile (中国移动) app-level types.

export type SettingsThemeId = 'light' | 'dark';

/** 话费/流量/语音用量 */
export interface UsageQuota {
  /** 本月套餐内高速流量总量（GB） */
  dataTotalGb: number;
  /** 已用高速流量（GB） */
  dataUsedGb: number;
  /** 套餐内语音总分钟数 */
  voiceTotalMin: number;
  /** 已用语音分钟数 */
  voiceUsedMin: number;
  /** 套餐内短信条数 */
  smsTotal: number;
  /** 已用短信条数 */
  smsUsed: number;
}

/** 基础套餐（可变更目录项 + 当前生效项同构） */
export interface Plan {
  id: string;
  name: string;
  price: number;
  dataGb: number;
  voiceMin: number;
  /** 套餐亮点/描述 */
  desc: string;
}

/** 已购流量加油包 */
export interface PurchasedPack {
  id: string;
  packId: string;
  name: string;
  dataGb: number;
  price: number;
  /** 生效时间戳 */
  time: number;
}

/** 月度账单明细项 */
export interface BillItem {
  /** 费用分类，如「套餐费」「流量费」 */
  category: string;
  /** 金额（元） */
  amount: number;
}

/** 月度账单 */
export interface Bill {
  id: string;
  /** 月份 YYYY-MM */
  month: string;
  /** 账单总额（元） */
  total: number;
  /** 状态：current 本月未出账 / unpaid 未缴欠费 / paid 已缴 */
  status: 'current' | 'unpaid' | 'paid';
  /** 是否欠费 */
  arrears: boolean;
  items: BillItem[];
}

/** 增值业务（可订购/退订） */
export interface SubscribedService {
  id: string;
  name: string;
  /** 月费（元） */
  price: number;
  enabled: boolean;
  /** 是否可退订（部分业务不可退订，仅展示） */
  cancellable: boolean;
}

/** 流量包商城可购买项 */
export interface DataPack {
  id: string;
  name: string;
  dataGb: number;
  price: number;
  /** 有效期描述 */
  validity: string;
  desc: string;
}

/** 家庭/亲情号码 */
export interface FamilyNumber {
  id: string;
  /** 手机号 */
  phone: string;
  /** 昵称 */
  nickname: string;
}

/** 支付方式 */
export interface PaymentMethod {
  id: string;
  /** 类型：balance / bankcard / alipay / wechat */
  type: string;
  /** 展示标签 */
  label: string;
  /** 尾号（可选） */
  tail?: string;
}

/** 交易/操作记录 */
export interface Transaction {
  id: string;
  /** 类型：recharge 充值 / payment 缴费 / datapack 购流量包 / planchange 套餐变更 / service 业务办理 */
  type: 'recharge' | 'payment' | 'datapack' | 'planchange' | 'service';
  /** 金额（元，0 表示无金额变更，如套餐变更） */
  amount: number;
  /** 摘要 */
  desc: string;
  /** 时间戳 */
  time: number;
}

/** 服务搜索记录 */
export interface SearchHistoryEntry {
  keyword: string;
  time: number;
}

export interface ChinaMobileSettings {
  themeId: SettingsThemeId;
  /** 流量预警开关 */
  dataAlert: boolean;
  /** 营销推送开关 */
  marketingPush: boolean;
  /** 国际漫游（亦由 roaming.enabled 镜像） */
  roamingEnabled: boolean;
}

/** 服务搜索当前态 */
export interface SearchCurrent {
  keyword: string | null;
  resultIds: string[];
  searched: boolean;
}

export interface ChinaMobileState {
  user: {
    name: string;
    phone: string;
    points: number;
  };
  /** 话费余额（元），顶层业务实体 */
  balance: number;
  usage: UsageQuota;
  activePlanId: string;
  bills: Bill[];
  purchasedPacks: PurchasedPack[];
  subscribedServices: SubscribedService[];
  roaming: { enabled: boolean };
  autopay: { enabled: boolean; paymentMethodId: string | null };
  familyNumbers: FamilyNumber[];
  profile: {
    email: string;
    realName: string;
    idNo: string;
    address: string;
  };
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  search: {
    current: SearchCurrent;
    history: SearchHistoryEntry[];
  };
  settings: ChinaMobileSettings;
  _temp: {
    /** 已访问页面标记（仅 benchmark 判定用，不持久、不计副作用） */
    visitedPages: string[];
    rechargeDraft: { amount: number | null; paymentMethodId: string };
    familyDraft: { phone: string; nickname: string };
    emailDraft: string;
    planChangeDraft: { planId: string | null };
    autopayDraft: { enabled: boolean; paymentMethodId: string | null };
    datapackDraft: { packId: string | null };
  };
}

export interface ChinaMobileActions {
  markPageVisited: (page: string) => void;
  recharge: (amount: number, paymentMethodId: string) => void;
  payBill: (billId: string, paymentMethodId: string) => { ok: boolean; reason?: string };
  buyDataPack: (packId: string, paymentMethodId: string) => { ok: boolean; reason?: string };
  changePlan: (planId: string) => { ok: boolean; reason?: string };
  setServiceEnabled: (serviceId: string, enabled: boolean) => void;
  setRoaming: (enabled: boolean) => void;
  setAutopay: (enabled: boolean, paymentMethodId: string | null) => void;
  addFamilyNumber: (phone: string, nickname: string) => { ok: boolean; reason?: string };
  deleteFamilyNumber: (id: string) => void;
  updateEmail: (email: string) => void;
  submitServiceSearch: (keyword: string) => void;
  clearServiceSearch: () => void;
  setRechargeDraft: (patch: Partial<ChinaMobileState['_temp']['rechargeDraft']>) => void;
  setFamilyDraft: (patch: Partial<ChinaMobileState['_temp']['familyDraft']>) => void;
  setEmailDraft: (email: string) => void;
  setPlanChangeDraft: (patch: Partial<ChinaMobileState['_temp']['planChangeDraft']>) => void;
  setAutopayDraft: (patch: Partial<ChinaMobileState['_temp']['autopayDraft']>) => void;
  setDatapackDraft: (patch: Partial<ChinaMobileState['_temp']['datapackDraft']>) => void;
  updateSettings: (patch: Partial<ChinaMobileSettings>) => void;
}
