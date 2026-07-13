import defaults from './defaults.json';
import { BANK_OPTIONS, TRANSIT_CITIES, MEMBERSHIP_BRANDS, COUPON_MERCHANTS, TICKET_MERCHANTS } from '../constants';

export const WALLET_CONFIG = {
  ...defaults,
  bankOptions: BANK_OPTIONS,
  transitCities: TRANSIT_CITIES,
  membershipBrands: MEMBERSHIP_BRANDS,
  couponMerchants: COUPON_MERCHANTS,
  ticketMerchants: TICKET_MERCHANTS,
} as const;
