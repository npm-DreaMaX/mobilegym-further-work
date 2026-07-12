import defaults from './defaults.json';
import { CARRIERS, CARRIER_BY_ID, SERVICE_TYPES, SERVICE_BY_ID, ITEM_CATEGORIES, PICKUP_TIME_SLOTS, ADDRESS_TAGS, computeSendFee, nextSendRecordId, nextAddressId } from '../constants';
import type { CainiaoState } from '../types';

// World data (read-only catalogs) — not part of the persisted runtime overlay.
export const CAINIAO_CARRIERS = CARRIERS;
export const CAINIAO_CARRIER_BY_ID = CARRIER_BY_ID;
export const CAINIAO_SERVICE_TYPES = SERVICE_TYPES;
export const CAINIAO_SERVICE_BY_ID = SERVICE_BY_ID;
export const CAINIAO_ITEM_CATEGORIES = ITEM_CATEGORIES;
export const CAINIAO_PICKUP_TIME_SLOTS = PICKUP_TIME_SLOTS;
export const CAINIAO_ADDRESS_TAGS = ADDRESS_TAGS;
export { computeSendFee, nextSendRecordId, nextAddressId };

// Replaceable runtime overlay — the only data the benchmark judges against.
export const CAINIAO_CONFIG: Omit<CainiaoState, '_temp'> = {
  user: { ...defaults.user },
  packages: defaults.packages.map(p => ({ ...p, events: p.events.map(e => ({ ...e })), recipient: { ...p.recipient }, sender: { ...p.sender }, station: p.station ? { ...p.station } : null })),
  sendRecords: defaults.sendRecords.map(r => ({ ...r, sender: { ...r.sender }, receiver: { ...r.receiver } })),
  addresses: defaults.addresses.map(a => ({ ...a })),
  notifications: defaults.notifications.map(n => ({ ...n })),
  search: {
    current: { ...defaults.search.current },
    history: [...defaults.search.history],
  },
  filter: { ...defaults.filter },
  defaultAddressId: defaults.defaultAddressId,
  settings: { ...defaults.settings },
};
