export type CardType = 'bank' | 'transit' | 'membership';
export type BankCardType = 'debit' | 'credit';
export type PassType = 'coupon' | 'ticket';

export interface WalletCard {
  id: string;
  type: CardType;
  name: string;
  issuer?: string;
  holder?: string;
  last4?: string;
  number?: string;
  cardType?: BankCardType;
  balance: number;
  points?: number;
  memberNumber?: string;
  city?: string;
  frozen: boolean;
  isDefault: boolean;
  sortOrder: number;
  barcode: string;
}

export interface Coupon {
  id: string;
  merchant: string;
  code: string;
  value: number;
  expiry: number;
  redeemed: boolean;
  redeemedAt?: number;
}

export interface Ticket {
  id: string;
  merchant: string;
  title: string;
  code: string;
  expiredAt: number;
  archived: boolean;
}

export interface Reward {
  id: string;
  membershipCardId: string;
  name: string;
  pointsCost: number;
}

export interface RedeemedReward {
  id: string;
  rewardId: string;
  membershipCardId: string;
  name: string;
  pointsCost: number;
  redeemedAt: number;
}

export interface Transaction {
  id: string;
  cardId: string;
  type: 'recharge' | 'redeem' | 'refund' | 'payment';
  amount: number;
  description: string;
  timestamp: number;
}

export interface WalletSettings {
  themeId: string;
  notifications: boolean;
}

export interface WalletUser {
  name: string;
  phone: string;
  avatar: string;
}

export interface WalletState {
  user: WalletUser;
  cards: WalletCard[];
  coupons: Coupon[];
  tickets: Ticket[];
  rewards: Reward[];
  redeemedRewards: RedeemedReward[];
  archivedTickets: Ticket[];
  transactions: Transaction[];
  defaultCardId: string | null;
  searchHistory: string[];
  settings: WalletSettings;
  _temp: {
    searchQuery: string;
    filterType: 'all' | CardType | PassType;
    lastViewedCardId: string | null;
    lastViewedRoute: string | null;
  };
}
