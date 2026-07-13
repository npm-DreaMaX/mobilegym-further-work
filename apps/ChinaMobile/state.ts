import { createAppStoreWithActions } from '../../os/createAppStore';
import { now as timeNow } from '../../os/TimeService';
import {
  CHINAMOBILE_CONFIG,
  CHINAMOBILE_DATA_PACK_BY_ID,
  CHINAMOBILE_PLAN_BY_ID,
  CHINAMOBILE_SERVICE_CATALOG,
  nextTransactionId,
  nextPurchasedPackId,
  nextFamilyId,
} from './data';
import type {
  ChinaMobileState, ChinaMobileActions, Transaction, PurchasedPack, FamilyNumber,
} from './types';

// ── Initial state ────────────────────────────────────────────────────

const initialState: ChinaMobileState = {
  user: { ...CHINAMOBILE_CONFIG.user },
  balance: CHINAMOBILE_CONFIG.balance,
  usage: { ...CHINAMOBILE_CONFIG.usage },
  activePlanId: CHINAMOBILE_CONFIG.activePlanId,
  bills: CHINAMOBILE_CONFIG.bills.map(b => ({ ...b, items: b.items.map(i => ({ ...i })) })),
  purchasedPacks: CHINAMOBILE_CONFIG.purchasedPacks.map(p => ({ ...p })),
  subscribedServices: CHINAMOBILE_CONFIG.subscribedServices.map(s => ({ ...s })),
  roaming: { ...CHINAMOBILE_CONFIG.roaming },
  autopay: { ...CHINAMOBILE_CONFIG.autopay },
  familyNumbers: CHINAMOBILE_CONFIG.familyNumbers.map(f => ({ ...f })),
  profile: { ...CHINAMOBILE_CONFIG.profile },
  paymentMethods: CHINAMOBILE_CONFIG.paymentMethods.map(m => ({ ...m })),
  transactions: CHINAMOBILE_CONFIG.transactions.map(t => ({ ...t })),
  search: {
    current: { ...CHINAMOBILE_CONFIG.search.current },
    history: CHINAMOBILE_CONFIG.search.history.map(h => ({ ...h })),
  },
  settings: { ...CHINAMOBILE_CONFIG.settings },
  _temp: {
    visitedPages: [],
    rechargeDraft: { amount: null, paymentMethodId: 'pm-balance' },
    familyDraft: { phone: '', nickname: '' },
    emailDraft: '',
    planChangeDraft: { planId: null },
    autopayDraft: { enabled: false, paymentMethodId: null },
    datapackDraft: { packId: null },
  },
};

// ── Store ────────────────────────────────────────────────────────────

export const useChinaMobileStore = createAppStoreWithActions<ChinaMobileState, ChinaMobileActions>(
  'chinamobile',
  initialState,
  (set, get) => ({
    // ── 页面访问标记（易失，仅 benchmark 判定用） ──
    markPageVisited: (page) => {
      set((s) => {
        if (s._temp.visitedPages.includes(page)) return {};
        return { _temp: { ...s._temp, visitedPages: [...s._temp.visitedPages, page] } };
      });
    },

    // ── 充值：余额 + 交易记录同步更新 ──
    recharge: (amount, paymentMethodId) => {
      const s = get();
      const amt = Math.max(0, Math.round(amount * 100) / 100);
      const txn: Transaction = {
        id: nextTransactionId(s.transactions),
        type: 'recharge',
        amount: amt,
        desc: `话费充值${amt}元`,
        time: timeNow(),
      };
      set((s2) => ({
        balance: Math.round((s2.balance + amt) * 100) / 100,
        transactions: [txn, ...s2.transactions],
        _temp: { ...s2._temp, rechargeDraft: { amount: null, paymentMethodId: 'pm-balance' } },
      }));
    },

    // ── 缴费：清欠费、扣余额、记录；已支付账单不可重复支付 ──
    payBill: (billId, _paymentMethodId) => {
      const s = get();
      const bill = s.bills.find(b => b.id === billId) ?? null;
      if (!bill) return { ok: false, reason: '账单不存在' };
      if (bill.status === 'paid') return { ok: false, reason: '该账单已支付，不可重复支付' };
      if (bill.status === 'current') return { ok: false, reason: '本月账单尚未出账，无需缴费' };
      const amt = Math.round(bill.total * 100) / 100;
      // 缴费不能造成负余额：余额不足时拒绝
      if (s.balance < amt) return { ok: false, reason: '余额不足，请先充值' };
      const txn: Transaction = {
        id: nextTransactionId(s.transactions),
        type: 'payment',
        amount: amt,
        desc: `缴纳${bill.month}账单`,
        time: timeNow(),
      };
      set((s2) => ({
        balance: Math.round((s2.balance - amt) * 100) / 100,
        bills: s2.bills.map(b => b.id === billId
          ? { ...b, status: 'paid' as const, arrears: false }
          : b),
        transactions: [txn, ...s2.transactions],
      }));
      return { ok: true };
    },

    // ── 购买流量包：余额扣款、已购服务记录、流量额度增加 ──
    buyDataPack: (packId, _paymentMethodId) => {
      const s = get();
      const pack = CHINAMOBILE_DATA_PACK_BY_ID[packId];
      if (!pack) return { ok: false, reason: '流量包不存在' };
      if (s.balance < pack.price) return { ok: false, reason: '余额不足' };
      const newPack: PurchasedPack = {
        id: nextPurchasedPackId(s.purchasedPacks),
        packId: pack.id,
        name: pack.name,
        dataGb: pack.dataGb,
        price: pack.price,
        time: timeNow(),
      };
      const txn: Transaction = {
        id: nextTransactionId(s.transactions),
        type: 'datapack',
        amount: pack.price,
        desc: `购买${pack.name}`,
        time: timeNow(),
      };
      set((s2) => ({
        balance: Math.round((s2.balance - pack.price) * 100) / 100,
        purchasedPacks: [newPack, ...s2.purchasedPacks],
        transactions: [txn, ...s2.transactions],
        _temp: { ...s2._temp, datapackDraft: { packId: null } },
      }));
      return { ok: true };
    },

    // ── 套餐变更：记录新套餐（下月生效，不扣余额） ──
    changePlan: (planId) => {
      const s = get();
      const plan = CHINAMOBILE_PLAN_BY_ID[planId];
      if (!plan) return { ok: false, reason: '套餐不存在' };
      if (planId === s.activePlanId) return { ok: false, reason: '当前已是该套餐' };
      const txn: Transaction = {
        id: nextTransactionId(s.transactions),
        type: 'planchange',
        amount: 0,
        desc: `套餐变更为${plan.name}`,
        time: timeNow(),
      };
      set((s2) => ({
        activePlanId: planId,
        transactions: [txn, ...s2.transactions],
        _temp: { ...s2._temp, planChangeDraft: { planId: null } },
      }));
      return { ok: true };
    },

    // ── 增值业务开关（持久） ──
    setServiceEnabled: (serviceId, enabled) => {
      set((s) => ({
        subscribedServices: s.subscribedServices.map(sv =>
          sv.id === serviceId ? { ...sv, enabled } : sv,
        ),
      }));
    },

    // ── 国际漫游（持久，与 settings.roamingEnabled 镜像） ──
    setRoaming: (enabled) => {
      set((s) => ({
        roaming: { enabled },
        settings: { ...s.settings, roamingEnabled: enabled },
      }));
    },

    // ── 自动缴费（持久） ──
    setAutopay: (enabled, paymentMethodId) => {
      set((s) => ({
        autopay: { enabled, paymentMethodId },
        _temp: { ...s._temp, autopayDraft: { enabled: false, paymentMethodId: null } },
      }));
    },

    // ── 亲情号码添加（持久，校验重复） ──
    addFamilyNumber: (phone, nickname) => {
      const s = get();
      const p = String(phone ?? '').trim();
      const n = String(nickname ?? '').trim();
      if (!p) return { ok: false, reason: '请输入手机号' };
      if (!n) return { ok: false, reason: '请输入昵称' };
      if (s.familyNumbers.some(f => f.phone === p)) return { ok: false, reason: '该号码已存在' };
      const fam: FamilyNumber = { id: nextFamilyId(s.familyNumbers), phone: p, nickname: n };
      set((s2) => ({
        familyNumbers: [...s2.familyNumbers, fam],
        _temp: { ...s2._temp, familyDraft: { phone: '', nickname: '' } },
      }));
      return { ok: true };
    },

    // ── 亲情号码删除（持久） ──
    deleteFamilyNumber: (id) => {
      set((s) => ({ familyNumbers: s.familyNumbers.filter(f => f.id !== id) }));
    },

    // ── 邮箱更新（持久） ──
    updateEmail: (email) => {
      set((s) => ({
        profile: { ...s.profile, email: String(email ?? '').trim() },
        _temp: { ...s._temp, emailDraft: '' },
      }));
    },

    // ── 服务搜索（结果来自真实 CHINAMOBILE_SERVICE_CATALOG） ──
    submitServiceSearch: (keyword) => {
      const s = get();
      const q = String(keyword ?? '').trim().toLowerCase();
      const resultIds = q
        ? CHINAMOBILE_SERVICE_CATALOG.filter(svc => svc.name.toLowerCase().includes(q) || svc.category.toLowerCase().includes(q))
            .map(svc => svc.id)
        : [];
      const entry = { keyword: String(keyword ?? '').trim(), time: timeNow() };
      set((s2) => ({
        search: {
          current: { keyword: String(keyword ?? '').trim(), resultIds, searched: true },
          history: [entry, ...s2.search.history.filter(h => h.keyword !== entry.keyword)].slice(0, 20),
        },
      }));
    },

    clearServiceSearch: () => {
      set((s) => ({
        search: {
          current: { keyword: null, resultIds: [], searched: false },
          history: s.search.history,
        },
      }));
    },

    // ── 草稿（易失） ──
    setRechargeDraft: (patch) => {
      set((s) => ({ _temp: { ...s._temp, rechargeDraft: { ...s._temp.rechargeDraft, ...patch } } }));
    },
    setFamilyDraft: (patch) => {
      set((s) => ({ _temp: { ...s._temp, familyDraft: { ...s._temp.familyDraft, ...patch } } }));
    },
    setEmailDraft: (email) => {
      set((s) => ({ _temp: { ...s._temp, emailDraft: email } }));
    },
    setPlanChangeDraft: (patch) => {
      set((s) => ({ _temp: { ...s._temp, planChangeDraft: { ...s._temp.planChangeDraft, ...patch } } }));
    },
    setAutopayDraft: (patch) => {
      set((s) => ({ _temp: { ...s._temp, autopayDraft: { ...s._temp.autopayDraft, ...patch } } }));
    },
    setDatapackDraft: (patch) => {
      set((s) => ({ _temp: { ...s._temp, datapackDraft: { ...s._temp.datapackDraft, ...patch } } }));
    },

    updateSettings: (patch) => {
      set((s) => ({ settings: { ...s.settings, ...patch } }));
    },
  }),
);

// No registerStateAdapter: the snapshot is the raw persisted state (with _temp
// in memory). Derived values (remaining data, current plan, top bill category,
// visited pages) are computed in the bench_env accessor from raw state, so the
// side-effect comparator never sees adapter-derived top-level fields change.
// `_temp` is ignored by the comparator (BaseTask.always_ignore `apps.*._temp`)
// but remains readable by check_goals for page-visit verification.
