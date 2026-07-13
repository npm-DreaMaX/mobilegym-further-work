import { createAppStoreWithActions } from '../../os/createAppStore';
import { now, realNow } from '../../os/TimeService';
import { WALLET_CONFIG } from './data';
import type { WalletCard, Coupon, Ticket, Reward, RedeemedReward, Transaction, WalletState, CardType } from './types';

// ---- State & Actions interfaces ----

interface WalletActions {
  // Bank / card management
  addBankCard: (card: { name: string; issuer: string; holder: string; last4: string; number?: string }) => WalletCard;
  setDefaultCard: (cardId: string) => void;
  renameCard: (cardId: string, name: string) => void;
  freezeCard: (cardId: string) => void;
  unfreezeCard: (cardId: string) => void;
  deleteCard: (cardId: string) => void;
  reorderCards: (cardIds: string[]) => void;

  // Transit
  addTransitCard: (card: { name: string; city: string; balance?: number }) => WalletCard;
  rechargeTransitCard: (cardId: string, amount: number) => void;

  // Membership
  addMembershipCard: (card: { name: string; issuer: string; memberNumber: string; points?: number }) => WalletCard;

  // Rewards
  redeemReward: (membershipCardId: string, rewardId: string) => RedeemedReward | null;

  // Coupons / tickets
  addCoupon: (coupon: { merchant: string; code: string; value: number; expiry: number }) => Coupon;
  redeemCoupon: (couponId: string) => void;
  archiveTicket: (ticketId: string) => void;

  // Search / settings
  addSearchHistory: (query: string) => void;
  updateSettings: (patch: Partial<WalletState['settings']>) => void;
  updateTemp: (patch: Partial<WalletState['_temp']>) => void;
}

// ---- Store ----

const initialState: WalletState = {
  ...WALLET_CONFIG,
  cards: WALLET_CONFIG.cards as WalletCard[],
  coupons: WALLET_CONFIG.coupons as Coupon[],
  tickets: WALLET_CONFIG.tickets as Ticket[],
  rewards: WALLET_CONFIG.rewards as Reward[],
  redeemedRewards: WALLET_CONFIG.redeemedRewards as RedeemedReward[],
  archivedTickets: WALLET_CONFIG.archivedTickets as Ticket[],
  transactions: WALLET_CONFIG.transactions as Transaction[],
  defaultCardId: WALLET_CONFIG.defaultCardId,
  searchHistory: WALLET_CONFIG.searchHistory,
  settings: WALLET_CONFIG.settings,
  _temp: {
    searchQuery: '',
    filterType: 'all',
  },
};

function genId(prefix: string): string {
  return `${prefix}-${realNow()}`;
}

export const useWalletStore = createAppStoreWithActions<WalletState, WalletActions>(
  'wallet',
  initialState,
  (set, get) => ({
    addBankCard: (card) => {
      const newCard: WalletCard = {
        id: genId('card-bank'),
        type: 'bank' as const,
        name: card.name,
        issuer: card.issuer,
        holder: card.holder,
        last4: card.last4,
        number: card.number ?? '',
        balance: 0,
        frozen: false,
        isDefault: false,
        sortOrder: get().cards.length,
        barcode: card.number ?? genId('BANK'),
      };
      set((state) => ({ cards: [newCard, ...state.cards] }));
      return newCard;
    },

    setDefaultCard: (cardId) => {
      set((state) => ({
        cards: state.cards.map((c) => ({ ...c, isDefault: c.id === cardId })),
        defaultCardId: cardId,
      }));
    },

    renameCard: (cardId, name) => {
      set((state) => ({
        cards: state.cards.map((c) => (c.id === cardId ? { ...c, name } : c)),
      }));
    },

    freezeCard: (cardId) => {
      set((state) => ({
        cards: state.cards.map((c) => (c.id === cardId ? { ...c, frozen: true } : c)),
      }));
    },

    unfreezeCard: (cardId) => {
      set((state) => ({
        cards: state.cards.map((c) => (c.id === cardId ? { ...c, frozen: false } : c)),
      }));
    },

    deleteCard: (cardId) => {
      const state = get();
      const card = state.cards.find((c) => c.id === cardId);
      if (!card) return;
      let nextDefaultId = state.defaultCardId;
      if (state.defaultCardId === cardId) {
        const remaining = state.cards.filter((c) => c.id !== cardId);
        const bankCards = remaining.filter((c) => c.type === 'bank');
        nextDefaultId = bankCards.length > 0 ? bankCards[0].id : null;
      }
      set((s) => ({
        cards: s.cards.filter((c) => c.id !== cardId),
        defaultCardId: nextDefaultId,
      }));
    },

    reorderCards: (cardIds) => {
      const state = get();
      const cardMap = new Map(state.cards.map((c) => [c.id, c]));
      const reordered = cardIds.map((id, index) => {
        const c = cardMap.get(id);
        if (!c) return null;
        return { ...c, sortOrder: index };
      }).filter(Boolean) as WalletCard[];
      set(() => ({ cards: reordered }));
    },

    addTransitCard: (card) => {
      const newCard: WalletCard = {
        id: genId('card-transit'),
        type: 'transit' as const,
        name: card.name,
        issuer: `${card.city}交通一卡通`,
        city: card.city,
        balance: card.balance ?? 0,
        frozen: false,
        isDefault: false,
        sortOrder: get().cards.length,
        barcode: genId('T'),
      };
      set((state) => ({ cards: [...state.cards, newCard] }));
      return newCard;
    },

    rechargeTransitCard: (cardId, amount) => {
      const state = get();
      const card = state.cards.find((c) => c.id === cardId);
      if (!card || card.type !== 'transit') return;
      const txn: Transaction = {
        id: genId('txn'),
        cardId,
        type: 'recharge' as const,
        amount,
        description: `${card.name}充值`,
        timestamp: now(),
      };
      set((s) => ({
        cards: s.cards.map((c) => (c.id === cardId ? { ...c, balance: c.balance + amount } : c)),
        transactions: [txn, ...s.transactions],
      }));
    },

    addMembershipCard: (card) => {
      const newCard: WalletCard = {
        id: genId('card-membership'),
        type: 'membership' as const,
        name: card.name,
        issuer: card.issuer,
        memberNumber: card.memberNumber,
        points: card.points ?? 0,
        balance: 0,
        frozen: false,
        isDefault: false,
        sortOrder: get().cards.length,
        barcode: card.memberNumber,
      };
      set((state) => ({ cards: [...state.cards, newCard] }));
      return newCard;
    },

    redeemReward: (membershipCardId, rewardId) => {
      const state = get();
      const card = state.cards.find((c) => c.id === membershipCardId);
      const reward = state.rewards.find((r) => r.id === rewardId);
      if (!card || card.type !== 'membership' || !reward) return null;
      if (card.points == null || card.points < reward.pointsCost) return null;
      if (state.redeemedRewards.some((r) => r.rewardId === rewardId)) return null;
      const redeemed: RedeemedReward = {
        id: genId('redeemed'),
        rewardId: reward.id,
        membershipCardId: card.id,
        name: reward.name,
        pointsCost: reward.pointsCost,
        redeemedAt: now(),
      };
      set((s) => ({
        cards: s.cards.map((c) =>
          c.id === membershipCardId && c.points != null
            ? { ...c, points: c.points - reward.pointsCost }
            : c,
        ),
        redeemedRewards: [redeemed, ...s.redeemedRewards],
      }));
      return redeemed;
    },

    addCoupon: (coupon) => {
      const newCoupon: Coupon = {
        id: genId('coupon'),
        merchant: coupon.merchant,
        code: coupon.code,
        value: coupon.value,
        expiry: coupon.expiry,
        redeemed: false,
      };
      set((state) => ({ coupons: [newCoupon, ...state.coupons] }));
      return newCoupon;
    },

    redeemCoupon: (couponId) => {
      const state = get();
      const coupon = state.coupons.find((c) => c.id === couponId);
      if (!coupon || coupon.redeemed) return;
      set((s) => ({
        coupons: s.coupons.map((c) =>
          c.id === couponId
            ? { ...c, redeemed: true, redeemedAt: now() }
            : c,
        ),
      }));
    },

    archiveTicket: (ticketId) => {
      set((state) => {
        const ticket = state.tickets.find((t) => t.id === ticketId);
        if (!ticket) return state;
        return {
          tickets: state.tickets.filter((t) => t.id !== ticketId),
          archivedTickets: [{ ...ticket, archived: true }, ...state.archivedTickets],
        };
      });
    },

    addSearchHistory: (query) => {
      const q = query.trim();
      if (!q) return;
      set((state) => ({
        searchHistory: [q, ...state.searchHistory.filter((item) => item !== q)].slice(0, 20),
      }));
    },

    updateSettings: (patch) => {
      set((state) => ({ settings: { ...state.settings, ...patch } }));
    },

    updateTemp: (patch) => {
      set((state) => ({ _temp: { ...state._temp, ...patch } }));
    },
  }),
);
