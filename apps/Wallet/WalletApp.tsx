import React from 'react';
import { MemoryRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAppNavigationHandler } from '../../os/hooks/useAppNavigationHandler';
import { useDarkMode } from '../../os/hooks/useDarkMode';
import { applySkinToThemeColors } from '../../os/SkinService';
import { themeToCssVars } from '../../os/utils/themeToCssVars';
import { manifest } from './manifest';
import { useAppNavigate } from './navigation';
import {
  AddBankCard, AddCoupon, AddMembership, AddTransitCard, ArchivedTickets, BankCardDetail, BankCards,
  BarcodeOrQRCode, CouponDetail, Coupons, DeleteBankCard, EditBankCard, ExpiredTickets, MembershipCards,
  MembershipDetail, Rewards, Search, TransitCardDetail, TransitCards, WalletHome,
} from './pages/WalletPages';

const WalletNavigationHandler: React.FC = () => {
  const { pathname } = useLocation();
  const { go } = useAppNavigate();
  useAppNavigationHandler('wallet', {
    onBack: () => {
      if (pathname === '/') return false;
      if (pathname === '/bank-cards') go('wallet.bankCards.home');
      else if (/^\/bank-cards\/[^/]+\/edit$/.test(pathname)) go('wallet.editBankCard.detail', { id: pathname.split('/')[2] });
      else if (/^\/bank-cards\/[^/]+\/delete$/.test(pathname)) go('wallet.deleteBankCard.detail', { id: pathname.split('/')[2] });
      else if (/^\/bank-cards\/[^/]+$/.test(pathname)) go('wallet.bankCardDetail.bankCards');
      else if (pathname === '/bank-cards/add') go('wallet.addBankCard.bankCards');
      else if (pathname === '/transit-cards') go('wallet.transitCards.home');
      else if (/^\/transit-cards\/[^/]+$/.test(pathname)) go('wallet.transitCardDetail.transitCards');
      else if (pathname === '/transit-cards/add') go('wallet.addTransitCard.transitCards');
      else if (pathname === '/membership-cards') go('wallet.membershipCards.home');
      else if (/^\/membership-cards\/[^/]+$/.test(pathname)) go('wallet.membershipDetail.membershipCards');
      else if (pathname === '/membership-cards/add') go('wallet.addMembership.membershipCards');
      else if (/^\/rewards\/[^/]+$/.test(pathname)) go('wallet.rewards.membershipDetail', { id: pathname.split('/')[2] });
      else if (pathname === '/coupons') go('wallet.coupons.home');
      else if (/^\/coupons\/[^/]+$/.test(pathname)) go('wallet.couponDetail.coupons');
      else if (pathname === '/coupons/add') go('wallet.addCoupon.coupons');
      else if (pathname === '/expired-tickets') go('wallet.expiredTickets.home');
      else if (pathname === '/archived-tickets') go('wallet.archivedTickets.expiredTickets');
      else if (pathname === '/search') go('wallet.search.home');
      else if (/^\/code\/bank\/[^/]+$/.test(pathname)) go('wallet.code.bankCardDetail', { id: pathname.split('/')[3] });
      else if (/^\/code\/transit\/[^/]+$/.test(pathname)) go('wallet.code.transitCardDetail', { id: pathname.split('/')[3] });
      else if (/^\/code\/membership\/[^/]+$/.test(pathname)) go('wallet.code.membershipDetail', { id: pathname.split('/')[3] });
      else if (/^\/code\/coupon\/[^/]+$/.test(pathname)) go('wallet.code.couponDetail', { id: pathname.split('/')[3] });
      else return false;
      return true;
    },
  });
  return null;
};

const WalletRoutes: React.FC = () => <>
  <WalletNavigationHandler />
  <Routes>
    <Route path="/" element={<WalletHome />} />
    <Route path="/bank-cards" element={<BankCards />} />
    <Route path="/bank-cards/add" element={<AddBankCard />} />
    <Route path="/bank-cards/:id" element={<BankCardDetail />} />
    <Route path="/bank-cards/:id/edit" element={<EditBankCard />} />
    <Route path="/bank-cards/:id/delete" element={<DeleteBankCard />} />
    <Route path="/transit-cards" element={<TransitCards />} />
    <Route path="/transit-cards/add" element={<AddTransitCard />} />
    <Route path="/transit-cards/:id" element={<TransitCardDetail />} />
    <Route path="/membership-cards" element={<MembershipCards />} />
    <Route path="/membership-cards/add" element={<AddMembership />} />
    <Route path="/membership-cards/:id" element={<MembershipDetail />} />
    <Route path="/rewards/:id" element={<Rewards />} />
    <Route path="/coupons" element={<Coupons />} />
    <Route path="/coupons/add" element={<AddCoupon />} />
    <Route path="/coupons/:id" element={<CouponDetail />} />
    <Route path="/expired-tickets" element={<ExpiredTickets />} />
    <Route path="/archived-tickets" element={<ArchivedTickets />} />
    <Route path="/search" element={<Search />} />
    <Route path="/code/bank/:id" element={<BarcodeOrQRCode kindOverride="bank" />} />
    <Route path="/code/transit/:id" element={<BarcodeOrQRCode kindOverride="transit" />} />
    <Route path="/code/membership/:id" element={<BarcodeOrQRCode kindOverride="membership" />} />
    <Route path="/code/coupon/:id" element={<BarcodeOrQRCode kindOverride="coupon" />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</>;

export const WalletApp: React.FC = () => {
  const { isDark } = useDarkMode();
  const themeColors = isDark ? { ...manifest.theme.colors, ...(manifest.theme.colorsDark ?? {}) } : manifest.theme.colors;
  const cssVars = themeToCssVars(applySkinToThemeColors(themeColors));
  return <div className="h-full w-full bg-app-bg" style={cssVars as React.CSSProperties}><MemoryRouter><WalletRoutes /></MemoryRouter></div>;
};

export default WalletApp;
