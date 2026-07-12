import { createAppStoreWithActions, registerStateAdapter } from '../../os/createAppStore';
import { now as timeNow } from '../../os/TimeService';
import { CAINIAO_CONFIG, computeSendFee, nextSendRecordId, nextAddressId } from './data';
import { STATUS_LABELS } from './types';
import type {
  CainiaoState, CainiaoActions, Package, PackageStatus, FilterKey,
  SendRecord, Address, NotificationItem, LogisticsEvent,
} from './types';

// ── Initial state ────────────────────────────────────────────────────

const initialState: CainiaoState = {
  user: { ...CAINIAO_CONFIG.user },
  packages: CAINIAO_CONFIG.packages.map(p => ({
    ...p,
    recipient: { ...p.recipient },
    sender: { ...p.sender },
    events: p.events.map(e => ({ ...e })),
    station: p.station ? { ...p.station } : null,
  })),
  sendRecords: CAINIAO_CONFIG.sendRecords.map(r => ({
    ...r,
    sender: { ...r.sender },
    receiver: { ...r.receiver },
  })),
  addresses: CAINIAO_CONFIG.addresses.map(a => ({ ...a })),
  notifications: CAINIAO_CONFIG.notifications.map(n => ({ ...n })),
  search: {
    current: { ...CAINIAO_CONFIG.search.current },
    history: [...CAINIAO_CONFIG.search.history],
  },
  filter: { ...CAINIAO_CONFIG.filter },
  defaultAddressId: CAINIAO_CONFIG.defaultAddressId,
  settings: { ...CAINIAO_CONFIG.settings },
  _temp: {
    sendDraft: null,
    lastViewedPackageId: null,
  },
};

// ── Pure helpers ────────────────────────────────────────────────────

function findPackageByTrackingNo(packages: Package[], rawTrackingNo: string): Package | null {
  const q = String(rawTrackingNo ?? '').trim().toUpperCase();
  if (!q) return null;
  return packages.find(p => p.trackingNo.toUpperCase() === q) ?? null;
}

// ── Store ────────────────────────────────────────────────────────────

export const useCainiaoStore = createAppStoreWithActions<CainiaoState, CainiaoActions>(
  'cainiao',
  initialState,
  (set, get) => ({
    // ── 包裹：确认取件 ──
    markPackagePickedUp: (packageId) => {
      set((s) => ({
        packages: s.packages.map((p) => {
          if (p.id !== packageId) return p;
          if (p.status === 'picked_up' || p.status === 'delivered') return p;
          const pickedEvent: LogisticsEvent = {
            time: timeNow(),
            location: p.station?.name ?? p.toCity ?? '驿站',
            description: '用户已取件',
            status: 'picked_up',
          };
          return {
            ...p,
            status: 'picked_up' as PackageStatus,
            statusLabel: STATUS_LABELS.picked_up,
            station: null,
            pickupCode: null,
            events: [pickedEvent, ...p.events],
          };
        }),
      }));
    },

    // ── 包裹：记录浏览（易失，仅写 _temp，不持久、不计副作用） ──
    viewPackage: (packageId) => {
      set((s) => ({ _temp: { ...s._temp, lastViewedPackageId: packageId } }));
    },

    // ── 搜索 ──
    submitSearch: (trackingNo) => {
      const s = get();
      const pkg = findPackageByTrackingNo(s.packages, trackingNo);
      const found = !!pkg;
      const normalized = String(trackingNo ?? '').trim();
      const entry = {
        trackingNo: normalized,
        time: timeNow(),
        found,
        packageId: pkg?.id ?? null,
      };
      set((s2) => ({
        search: {
          current: {
            trackingNo: normalized,
            resultPackageId: pkg?.id ?? null,
            resultCount: found ? 1 : 0,
            searched: true,
          },
          history: [entry, ...s2.search.history.filter(h => h.trackingNo !== normalized)].slice(0, 20),
        },
      }));
    },

    clearSearch: () => {
      set((s) => ({
        search: {
          current: {
            trackingNo: null,
            resultPackageId: null,
            resultCount: 0,
            searched: false,
          },
          history: s.search.history,
        },
      }));
    },

    // ── 筛选 ──
    setFilter: (filter) => {
      set(() => ({ filter: { currentStatus: filter } }));
    },

    // ── 寄件 ──
    submitSendRecord: (record) => {
      const s = get();
      const id = nextSendRecordId(s.sendRecords);
      const newRecord: SendRecord = {
        ...record,
        id,
        status: 'pending_pickup',
        createdAt: timeNow(),
      };
      set((s2) => ({ sendRecords: [newRecord, ...s2.sendRecords] }));
      return id;
    },

    // ── 地址 ──
    upsertAddress: (addr) => {
      const s = get();
      // 编辑现有
      if (addr.id && s.addresses.some(a => a.id === addr.id)) {
        const updated: Address = {
          id: addr.id,
          name: addr.name,
          phone: addr.phone,
          province: addr.province,
          city: addr.city,
          district: addr.district,
          detail: addr.detail,
          tag: addr.tag,
          isDefault: addr.isDefault,
        };
        set((s2) => ({
          addresses: s2.addresses.map(a => a.id === updated.id ? updated : a),
          defaultAddressId: updated.isDefault ? updated.id : s2.defaultAddressId,
        }));
        return updated.id;
      }
      // 新增
      const id = nextAddressId(s.addresses);
      const created: Address = {
        id,
        name: addr.name,
        phone: addr.phone,
        province: addr.province,
        city: addr.city,
        district: addr.district,
        detail: addr.detail,
        tag: addr.tag,
        isDefault: addr.isDefault,
      };
      set((s2) => {
        let addresses = s2.addresses.map(a => created.isDefault ? { ...a, isDefault: false } : a);
        addresses = [created, ...addresses];
        return {
          addresses,
          defaultAddressId: created.isDefault ? created.id : s2.defaultAddressId,
        };
      });
      return id;
    },

    deleteAddress: (addressId) => {
      set((s) => {
        const addresses = s.addresses.filter(a => a.id !== addressId);
        let defaultAddressId = s.defaultAddressId;
        if (defaultAddressId === addressId) {
          defaultAddressId = addresses.find(a => a.isDefault)?.id ?? addresses[0]?.id ?? null;
        }
        return { addresses, defaultAddressId };
      });
    },

    setDefaultAddress: (addressId) => {
      set((s) => ({
        addresses: s.addresses.map(a => ({ ...a, isDefault: a.id === addressId })),
        defaultAddressId: addressId,
      }));
    },

    // ── 通知 ──
    markNotificationRead: (notificationId) => {
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } as NotificationItem : n,
        ),
      }));
    },

    archiveNotification: (notificationId) => {
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === notificationId ? { ...n, archived: true } as NotificationItem : n,
        ),
      }));
    },

    // ── 用户资料 ──
    updateNickname: (nickname) => {
      set((s) => ({ user: { ...s.user, nickname } }));
    },

    // ── 设置 ──
    updateSettings: (patch) => {
      set((s) => ({ settings: { ...s.settings, ...patch } }));
    },
  }),
);

// ── Snapshot adapter for bench_env ───────────────────────────────────
// Exposes derived convenience fields the judge can read directly, alongside
// the raw persisted state. _temp is excluded from persistence by default.

registerStateAdapter('cainiao', (state) => {
  const packages: Package[] = state.packages ?? [];
  const notifications: NotificationItem[] = state.notifications ?? [];
  const sendRecords: SendRecord[] = state.sendRecords ?? [];
  const addresses: Address[] = state.addresses ?? [];
  const filter: FilterKey | null = state.filter?.currentStatus ?? null;

  const statusCount: Record<string, number> = {};
  for (const p of packages) {
    statusCount[p.status] = (statusCount[p.status] ?? 0) + 1;
  }

  return {
    ...state,
    // 派生：包裹 id 列表（便于 judge 引用）
    packageIds: packages.map(p => p.id),
    // 派生：各状态包裹 id 列表
    packagesByStatus: {
      pending_ship: packages.filter(p => p.status === 'pending_ship').map(p => p.id),
      in_transit: packages.filter(p => p.status === 'in_transit').map(p => p.id),
      arrived_station: packages.filter(p => p.status === 'arrived_station').map(p => p.id),
      picked_up: packages.filter(p => p.status === 'picked_up').map(p => p.id),
      delivered: packages.filter(p => p.status === 'delivered').map(p => p.id),
    },
    statusCount,
    // 派生：待取件包裹（有取件码）
    pickupablePackages: packages
      .filter(p => p.status === 'arrived_station' && !!p.pickupCode)
      .map(p => ({ id: p.id, trackingNo: p.trackingNo, pickupCode: p.pickupCode })),
    // 派生：未读通知数
    unreadNotificationCount: notifications.filter(n => !n.read).length,
    unreadNotificationIds: notifications.filter(n => !n.read).map(n => n.id),
    // 派生：地址 id 列表 + 默认地址
    addressIds: addresses.map(a => a.id),
    defaultAddressId: state.defaultAddressId ?? addresses.find(a => a.isDefault)?.id ?? null,
    // 派生：寄件记录 id 列表
    sendRecordIds: sendRecords.map(r => r.id),
    // 派生：当前筛选
    currentFilter: filter,
    // 派生：搜索结果
    searchResult: state.search?.current ?? null,
    // 派生：用户昵称
    nickname: state.user?.nickname ?? '',
    // 派生：设置
    settings: state.settings ?? null,
  };
});
