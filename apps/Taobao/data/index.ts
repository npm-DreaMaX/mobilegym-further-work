import defaults from './defaults.json';
import { resolveDataTimestamp } from '../../../os/TimeService';

// Resolve all relative timestamps in defaults data
const resolvedDefaults = {
  ...defaults,
  cart: (defaults.cart ?? []).map((c: any) => ({
    ...c,
    addedAt: resolveDataTimestamp(c.addedAt),
  })),
  userCoupons: (defaults.userCoupons ?? []).map((uc: any) => ({
    ...uc,
    claimedAt: resolveDataTimestamp(uc.claimedAt),
  })),
  orders: (defaults.orders ?? []).map((o: any) => ({
    ...o,
    createdAt: resolveDataTimestamp(o.createdAt),
    paidAt: o.paidAt ? resolveDataTimestamp(o.paidAt) : undefined,
    shippedAt: o.shippedAt ? resolveDataTimestamp(o.shippedAt) : undefined,
    deliveredAt: o.deliveredAt ? resolveDataTimestamp(o.deliveredAt) : undefined,
    receivedAt: o.receivedAt ? resolveDataTimestamp(o.receivedAt) : undefined,
  })),
  logistics: Object.fromEntries(
    Object.entries(defaults.logistics ?? {}).map(([k, v]: [string, any]) => [
      k,
      {
        ...v,
        estimatedDelivery: resolveDataTimestamp(v.estimatedDelivery),
        events: (v.events ?? []).map((e: any) => ({
          ...e,
          time: resolveDataTimestamp(e.time),
        })),
      },
    ]),
  ),
  reviews: (defaults.reviews ?? []).map((r: any) => ({
    ...r,
    createdAt: resolveDataTimestamp(r.createdAt),
  })),
  coupons: Object.fromEntries(
    Object.entries(defaults.coupons ?? {}).map(([k, v]: [string, any]) => [
      k,
      {
        ...v,
        validFrom: resolveDataTimestamp(v.validFrom),
        validTo: resolveDataTimestamp(v.validTo),
      },
    ]),
  ),
};

export const TAOBAO_CONFIG = resolvedDefaults;
