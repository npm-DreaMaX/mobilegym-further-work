// ── Domain types for the Cainiao app ──────────────────────────────────

/** 物流状态：待揽收 / 运输中 / 已到站(待取件) / 已取件 / 已签收(已完成) */
export type PackageStatus =
  | 'pending_ship'
  | 'in_transit'
  | 'arrived_station'
  | 'picked_up'
  | 'delivered';

/** 列表筛选维度（与 HomePage 筛选 tab 一一对应） */
export type FilterKey = 'all' | 'in_transit' | 'arrived_station' | 'picked_up';

export interface LogisticsEvent {
  /** 毫秒时间戳（由 TimeService 生成，setup 注入时为固定值） */
  time: number;
  /** 节点地点 */
  location: string;
  /** 节点描述 */
  description: string;
  /** 该节点对应的状态 */
  status: PackageStatus;
}

export interface StationInfo {
  /** 驿站名称 */
  name: string;
  /** 驿站地址 */
  address: string;
  /** 取件码 */
  pickupCode: string;
  /** 营业时间 */
  businessHours: string;
}

export interface ContactInfo {
  name: string;
  phone: string;
  address: string;
}

export interface Package {
  id: string;
  /** 运单号 */
  trackingNo: string;
  /** 承运商 id（指向 CARRIERS 目录） */
  carrierId: string;
  /** 承运商显示名（冗余存于 state，judge/UI 同源） */
  carrierName: string;
  /** 当前物流状态 */
  status: PackageStatus;
  /** 状态显示文案 */
  statusLabel: string;
  /** 收件人 */
  recipient: ContactInfo;
  /** 寄件人 */
  sender: ContactInfo;
  /** 发件城市 */
  fromCity: string;
  /** 收件城市 */
  toCity: string;
  /** 预计送达日期 ISO yyyy-mm-dd */
  eta: string;
  /** 物品类型 */
  itemCategory: string;
  /** 重量 kg */
  weight: number;
  /** 完整物流时间线（按时间倒序：最新节点在前） */
  events: LogisticsEvent[];
  /** 取件/驿站信息，仅 arrived_station 状态有值 */
  station: StationInfo | null;
  /** 取件码（冗余字段，arrived_station 时非空，便于 judge 读取） */
  pickupCode: string | null;
}

export interface SendRecord {
  id: string;
  /** 寄件人 */
  sender: ContactInfo;
  /** 收件人 */
  receiver: ContactInfo;
  /** 物品类型 */
  itemCategory: string;
  /** 重量 kg */
  weight: number;
  /** 服务类型 id（指向 SERVICE_TYPES 目录） */
  serviceType: string;
  /** 服务类型显示名 */
  serviceLabel: string;
  /** 承运商 id */
  carrierId: string;
  carrierName: string;
  /** 预约上门取件时间（展示串，如 "今天 14:00-16:00"） */
  pickupTime: string;
  /** 备注 */
  note: string;
  /** 预计费用（元） */
  fee: number;
  /** 订单状态 */
  status: 'pending_pickup' | 'shipping' | 'completed';
  /** 创建时间戳 */
  createdAt: number;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  /** 省/市/区拼接前的结构化字段，便于 judge 读取 */
  province: string;
  city: string;
  district: string;
  /** 详细地址 */
  detail: string;
  /** 标签：家 / 公司 / 学校 / 其他 */
  tag: string;
  isDefault: boolean;
}

export interface NotificationItem {
  id: string;
  /** 通知类型 */
  type: 'pickup' | 'transit' | 'arrival' | 'system';
  title: string;
  body: string;
  /** 毫秒时间戳 */
  time: number;
  read: boolean;
  /** 关联包裹 id（可空） */
  packageId: string | null;
  /** 是否已归档/隐藏 */
  archived: boolean;
}

export interface SearchEntry {
  /** 搜索的运单号 */
  trackingNo: string;
  /** 搜索时间戳 */
  time: number;
  /** 是否找到匹配包裹 */
  found: boolean;
  /** 匹配到的包裹 id（未找到为 null） */
  packageId: string | null;
}

export interface SearchCurrent {
  /** 当前搜索的运单号 */
  trackingNo: string | null;
  /** 匹配到的包裹 id（未找到为 null） */
  resultPackageId: string | null;
  /** 结果数量（0 或 1） */
  resultCount: number;
  /** 是否处于"已提交搜索"状态 */
  searched: boolean;
}

export interface CainiaoSettings {
  /** 取件提醒 */
  pickupAlert: boolean;
  /** 运输中提醒 */
  transitAlert: boolean;
  /** 到达提醒 */
  arrivalAlert: boolean;
  /** 主题（light/dark） */
  themeId: 'light' | 'dark';
}

export interface UserProfile {
  id: string;
  /** 昵称 */
  nickname: string;
  /** 真实姓名 */
  name: string;
  avatar: string;
  phone: string;
}

export interface CainiaoState {
  user: UserProfile;
  packages: Package[];
  sendRecords: SendRecord[];
  addresses: Address[];
  notifications: NotificationItem[];
  search: {
    current: SearchCurrent;
    history: SearchEntry[];
  };
  filter: {
    /** 当前筛选维度，null 等同 all */
    currentStatus: FilterKey | null;
  };
  defaultAddressId: string | null;
  settings: CainiaoSettings;
  _temp: {
    /** 寄件表单草稿（易失） */
    sendDraft: Partial<SendRecord> | null;
    /** 最近查看的包裹 id（易失浏览态，仅供 benchmark 判定"是否打开正确包裹详情"；
     *  不落 localStorage，不计入副作用检测（apps.*._temp 在 always_ignore）） */
    lastViewedPackageId: string | null;
  };
}

export interface CainiaoActions {
  // 包裹
  markPackagePickedUp: (packageId: string) => void;
  /** 记录最近查看的包裹详情（易失浏览态，供 benchmark 判定） */
  viewPackage: (packageId: string) => void;
  // 搜索
  submitSearch: (trackingNo: string) => void;
  clearSearch: () => void;
  // 筛选
  setFilter: (filter: FilterKey | null) => void;
  // 寄件
  submitSendRecord: (record: Omit<SendRecord, 'id' | 'createdAt' | 'status'>) => string;
  // 地址
  upsertAddress: (addr: Omit<Address, 'id'> & { id?: string }) => string;
  deleteAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  // 通知
  markNotificationRead: (notificationId: string) => void;
  archiveNotification: (notificationId: string) => void;
  // 用户资料
  updateNickname: (nickname: string) => void;
  // 设置
  updateSettings: (patch: Partial<CainiaoSettings>) => void;
}

// ── Pure helpers ─────────────────────────────────────────────────────

/** 将状态映射到筛选维度 */
export function statusToFilter(status: PackageStatus): FilterKey {
  switch (status) {
    case 'in_transit':
      return 'in_transit';
    case 'arrived_station':
      return 'arrived_station';
    case 'picked_up':
    case 'delivered':
      return 'picked_up';
    case 'pending_ship':
    default:
      return 'all';
  }
}

/** 筛选维度包含的状态集合 */
export function filterStatuses(filter: FilterKey): PackageStatus[] | null {
  switch (filter) {
    case 'in_transit':
      return ['in_transit'];
    case 'arrived_station':
      return ['arrived_station'];
    case 'picked_up':
      return ['picked_up', 'delivered'];
    case 'all':
    default:
      return null;
  }
}

export const STATUS_LABELS: Record<PackageStatus, string> = {
  pending_ship: '待揽收',
  in_transit: '运输中',
  arrived_station: '待取件',
  picked_up: '已取件',
  delivered: '已签收',
};
