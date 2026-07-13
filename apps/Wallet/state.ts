import { createAppStoreWithActions } from '../../os/createAppStore';
import { now } from '../../os/TimeService';
import { WALLET_CONFIG } from './data';
import type {
  BankCardType,
  CardType,
  Coupon,
  RedeemedReward,
  Reward,
  Ticket,
  Transaction,
  WalletCard,
  WalletState,
} from './types';

interface WalletActions {
  addBankCard: (card: { name: string; issuer: string; holder: string; last4: string; number?: string; cardType?: BankCardType }) => WalletCard;
  setDefaultCard: (cardId: string) => void;
  renameCard: (cardId: string, name: string) => void;
  freezeCard: (cardId: string) => void;
  unfreezeCard: (cardId: string) => void;
  deleteCard: (cardId: string) => void;
  reorderCards: (cardIds: string[]) => void;
  addTransitCard: (card: { name: string; city: string; balance?: number }) => WalletCard;
  rechargeTransitCard: (cardId: string, amount: number) => void;
  addMembershipCard: (card: { name: string; issuer: string; memberNumber: string; points?: number }) => WalletCard;
  redeemReward: (membershipCardId: string, rewardId: string) => RedeemedReward | null;
  addCoupon: (coupon: { merchant: string; code: string; value: number; expiry: number }) => Coupon;
  redeemCoupon: (couponId: string) => void;
  archiveTicket: (ticketId: string) => void;
  addSearchHistory: (query: string) => void;
  updateSettings: (patch: Partial<WalletState['settings']>) => void;
  updateTemp: (patch: Partial<WalletState['_temp']>) => void;
}

const configuredCards = (WALLET_CONFIG.cards as WalletCard[]).map((card) => ({
  ...card,
  cardType: card.type === 'bank' ? (card.cardType ?? 'debit') : card.cardType,
  isDefault: card.type === 'bank' && card.id === WALLET_CONFIG.defaultCardId,
}));

const initialState: WalletState = {
  ...WALLET_CONFIG,
  cards: configuredCards,
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
    lastViewedCardId: null,
    lastViewedRoute: null,
  },
};

function nextStableId(prefix: string, ids: string[]): string {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^${escaped}-(\\d+)$`);
  const max = ids.reduce((current, id) => {
    const match = id.match(pattern);
    return match ? Math.max(current, Number(match[1])) : current;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(3, '0')}`;
}

function applyDefault(cards: WalletCard[], defaultCardId: string | null): WalletCard[] {
  const validDefault = defaultCardId && cards.some((card) => card.type === 'bank' && card.id === defaultCardId)
    ? defaultCardId
    : null;
  return cards.map((card) => ({ ...card, isDefault: card.type === 'bank' && card.id === validDefault }));
}

export const useWalletStore = createAppStoreWithActions<WalletState, WalletActions>(
  'wallet',
  initialState,
  (set, get) => ({
    addBankCard: (card) => {
      const state = get();
      const id = nextStableId('card-bank', state.cards.map((item) => item.id));
      const last4 = card.last4.replace(/\D/g, '').slice(-4).padStart(4, '0');
      const number = card.number?.replace(/\s/g, '') || `622202000000000${last4}`;
      const shouldDefault = !state.cards.some((item) => item.type === 'bank');
      const newCard: WalletCard = {
        id,
        type: 'bank',
        name: card.name.trim(),
        issuer: card.issuer.trim(),
        holder: card.holder.trim(),
        last4,
        number,
        cardType: card.cardType ?? 'debit',
        balance: 0,
        frozen: false,
        isDefault: shouldDefault,
        sortOrder: state.cards.length,
        barcode: number,
      };
      const defaultCardId = shouldDefault ? id : state.defaultCardId;
      set({ cards: applyDefault([newCard, ...state.cards], defaultCardId), defaultCardId });
      return newCard;
    },
    setDefaultCard: (cardId) => {
      const card = get().cards.find((item) => item.id === cardId);
      if (!card || card.type !== 'bank') return;
      set((state) => ({ cards: applyDefault(state.cards, cardId), defaultCardId: cardId }));
    },
    renameCard: (cardId, name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      set((state) => ({ cards: state.cards.map((card) => card.id === cardId ? { ...card, name: trimmed } : card) }));
    },
    freezeCard: (cardId) => set((state) => ({ cards: state.cards.map((card) => card.id === cardId ? { ...card, frozen: true } : card) })),
    unfreezeCard: (cardId) => set((state) => ({ cards: state.cards.map((card) => card.id === cardId ? { ...card, frozen: false } : card) })),
    deleteCard: (cardId) => {
      const state = get();
      if (!state.cards.some((card) => card.id === cardId)) return;
      const remaining = state.cards.filter((card) => card.id !== cardId);
      const defaultCardId = state.defaultCardId === cardId
        ? (remaining.find((card) => card.type === 'bank')?.id ?? null)
        : state.defaultCardId;
      set({
        cards: applyDefault(remaining.map((card, index) => ({ ...card, sortOrder: index })), defaultCardId),
        defaultCardId,
      });
    },
    reorderCards: (cardIds) => {
      const state = get();
      const requested = cardIds.map((id) => state.cards.find((card) => card.id === id)).filter((card): card is WalletCard => Boolean(card));
      const requestedIds = new Set(requested.map((card) => card.id));
      const cards = [...requested, ...state.cards.filter((card) => !requestedIds.has(card.id))]
        .map((card, index) => ({ ...card, sortOrder: index }));
      set({ cards: applyDefault(cards, state.defaultCardId) });
    },
    addTransitCard: (card) => {
      const state = get();
      const id = nextStableId('card-transit', state.cards.map((item) => item.id));
      const sequence = id.split('-').at(-1) ?? '001';
      const newCard: WalletCard = {
        id,
        type: 'transit',
        name: card.name.trim(),
        issuer: `${card.city.trim()}交通一卡通`,
        city: card.city.trim(),
        balance: card.balance ?? 0,
        frozen: false,
        isDefault: false,
        sortOrder: state.cards.length,
        barcode: `100000${sequence.padStart(7, '0')}`,
      };
      set({ cards: [...state.cards, newCard] });
      return newCard;
    },
    rechargeTransitCard: (cardId, amount) => {
      const state = get();
      const card = state.cards.find((item) => item.id === cardId);
      if (!card || card.type !== 'transit' || !Number.isFinite(amount) || amount <= 0) return;
      const transaction: Transaction = {
        id: nextStableId('txn', state.transactions.map((item) => item.id)),
        cardId,
        type: 'recharge',
        amount,
        description: `${card.name}充值`,
        timestamp: now(),
      };
      set({
        cards: state.cards.map((item) => item.id === cardId ? { ...item, balance: item.balance + amount } : item),
        transactions: [transaction, ...state.transactions],
      });
    },
    addMembershipCard: (card) => {
      const state = get();
      const id = nextStableId('card-membership', state.cards.map((item) => item.id));
      const newCard: WalletCard = {
        id,
        type: 'membership',
        name: card.name.trim(),
        issuer: card.issuer.trim(),
        memberNumber: card.memberNumber.trim(),
        points: Number.isFinite(card.points) ? Math.max(0, Math.floor(card.points ?? 0)) : 0,
        balance: 0,
        frozen: false,
        isDefault: false,
        sortOrder: state.cards.length,
        barcode: card.memberNumber.trim(),
      };
      set({ cards: [...state.cards, newCard] });
      return newCard;
    },
    redeemReward: (membershipCardId, rewardId) => {
      const state = get();
      const card = state.cards.find((item) => item.id === membershipCardId);
      const reward = state.rewards.find((item) => item.id === rewardId && item.membershipCardId === membershipCardId);
      if (!card || card.type !== 'membership' || !reward || (card.points ?? 0) < reward.pointsCost) return null;
      if (state.redeemedRewards.some((item) => item.rewardId === rewardId && item.membershipCardId === membershipCardId)) return null;
      const redeemed: RedeemedReward = {
        id: nextStableId('redeemed', state.redeemedRewards.map((item) => item.id)),
        rewardId,
        membershipCardId,
        name: reward.name,
        pointsCost: reward.pointsCost,
        redeemedAt: now(),
      };
      const transaction: Transaction = {
        id: nextStableId('txn', state.transactions.map((item) => item.id)),
        cardId: membershipCardId,
        type: 'redeem',
        amount: reward.pointsCost,
        description: reward.name,
        timestamp: redeemed.redeemedAt,
      };
      set({
        cards: state.cards.map((item) => item.id === membershipCardId ? { ...item, points: (item.points ?? 0) - reward.pointsCost } : item),
        redeemedRewards: [redeemed, ...state.redeemedRewards],
        transactions: [transaction, ...state.transactions],
      });
      return redeemed;
    },
    addCoupon: (coupon) => {
      const state = get();
      const existing = state.coupons.find((item) => item.code === coupon.code.trim());
      if (existing) return existing;
      const newCoupon: Coupon = {
        id: nextStableId('coupon', state.coupons.map((item) => item.id)),
        merchant: coupon.merchant.trim(),
        code: coupon.code.trim(),
        value: coupon.value,
        expiry: coupon.expiry,
        redeemed: false,
      };
      set({ coupons: [newCoupon, ...state.coupons] });
      return newCoupon;
    },
    redeemCoupon: (couponId) => {
      const state = get();
      const coupon = state.coupons.find((item) => item.id === couponId);
      if (!coupon || coupon.redeemed) return;
      set({ coupons: state.coupons.map((item) => item.id === couponId ? { ...item, redeemed: true, redeemedAt: now() } : item) });
    },
    archiveTicket: (ticketId) => {
      const state = get();
      const ticket = state.tickets.find((item) => item.id === ticketId);
      if (!ticket || state.archivedTickets.some((item) => item.id === ticketId)) return;
      set({
        tickets: state.tickets.filter((item) => item.id !== ticketId),
        archivedTickets: [{ ...ticket, archived: true }, ...state.archivedTickets],
      });
    },
    addSearchHistory: (query) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      set((state) => ({ searchHistory: [trimmed, ...state.searchHistory.filter((item) => item !== trimmed)].slice(0, 20) }));
    },
    updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
    updateTemp: (patch) => set((state) => ({ _temp: { ...state._temp, ...patch } })),
  }),
);
