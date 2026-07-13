import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IcOrder,
  IcHeart,
  IcCoupon,
  IcLocation,
  IcSettings,
  IcNavForward,
  IcPayment,
  IcPackage,
  IcTruck,
  IcStar,
} from '../res/icons';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useTaobaoStore } from '../state';
import TabBar from '../components/TabBar';
import type { Order } from '../types';

const ORDER_STATUS_ICONS: { key: string; icon: typeof IcPayment; label: string; color: string }[] = [
  { key: 'pending_payment', icon: IcPayment, label: '待付款', color: '#FF6A00' },
  { key: 'to_ship', icon: IcPackage, label: '待发货', color: '#3B8BFF' },
  { key: 'shipped', icon: IcTruck, label: '待收货', color: '#26C261' },
  { key: 'received', icon: IcStar, label: '已完成', color: '#9B9B9B' },
];

const MePage: React.FC = () => {
  const navigate = useNavigate();
  const { go } = useTaobaoGestures();
  const s = useTaobaoStrings();

  const profile = useTaobaoStore((st) => st.profile);
  const orders = useTaobaoStore((st) => st.orders);
  const favoriteIds = useTaobaoStore((st) => st.favoriteIds);
  const recentlyViewed = useTaobaoStore((st) => st.recentlyViewed);
  const products = useTaobaoStore((st) => st.products);

  const orderCountByStatus = orders.reduce<Record<string, number>>((acc, o: Order) => {
    const key = o.status as string;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const menuItems = [
    { icon: IcHeart, color: '#FF6A00', label: s.me_favorites, badge: favoriteIds.length, action: () => go('me.favorites.open') },
    { icon: IcCoupon, color: '#FFB000', label: s.me_coupons, action: () => go('me.coupons.open') },
    { icon: IcLocation, color: '#26C261', label: s.me_addresses, action: () => go('me.addresses.open') },
    { icon: IcSettings, color: '#9B9B9B', label: s.me_settings, action: () => go('me.settings.open') },
  ];

  const recentProducts = recentlyViewed
    .map((id) => products[id])
    .filter(Boolean)
    .slice(0, 6);

  return (
    <div className="h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Profile section */}
      <div className="flex-shrink-0 bg-gradient-to-br from-[#FF6A00] to-[#FF8C00] pt-12 pb-6 px-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/30 flex items-center justify-center text-2xl font-bold text-white">
            {profile.name ? profile.name[0] : '?'}
          </div>
          <div className="flex flex-col">
            <span className="text-[18px] font-bold text-white">{profile.name}</span>
            <span className="text-[12px] text-white/80 mt-0.5">{profile.phone}</span>
          </div>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto"
        data-scroll-container="main"
        data-scroll-direction="vertical"
      >
        {/* Order status row */}
        <div className="bg-white mx-3 -mt-3 rounded-xl px-2 py-3 flex items-center justify-around shadow-sm">
          {ORDER_STATUS_ICONS.map((item) => {
            const Icon = item.icon;
            const count = orderCountByStatus[item.key] || 0;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => navigate(`/orders?tab=${item.key}`)}
                className="flex flex-col items-center gap-1 px-3 py-1 active:opacity-60"
              >
                <div className="relative">
                  <Icon size={22} style={{ color: item.color }} />
                  {count > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                      {count > 99 ? '99+' : count}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-gray-500">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* My Orders link */}
        <button
          type="button"
          onClick={() => go('me.orders.open')}
          className="w-full bg-white mt-2 px-4 py-3 flex items-center justify-between active:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <IcOrder size={18} className="text-gray-600" />
            <span className="text-[14px] text-gray-800 font-medium">{s.me_orders}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[12px] text-gray-400">{s.me_view_all_orders}</span>
            <IcNavForward size={14} className="text-gray-300" />
          </div>
        </button>

        {/* Menu items */}
        <div className="bg-white mt-2 mb-2">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={item.action}
                className="w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-b-0 active:bg-gray-50"
              >
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white"
                  style={{ background: item.color }}
                >
                  <Icon size={15} />
                </span>
                <span className="flex-1 text-left text-[14px] text-gray-800">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="text-[12px] text-[#FF6A00] font-medium mr-1">{item.badge}</span>
                )}
                <IcNavForward size={14} className="text-gray-300" />
              </button>
            );
          })}
        </div>

        {/* Recently viewed */}
        {recentProducts.length > 0 && (
          <div className="bg-white mt-2 mb-2 px-4 py-3">
            <p className="text-[14px] font-semibold text-gray-800 mb-3">{s.me_recently_viewed}</p>
            <div className="flex gap-3 overflow-x-auto pb-1" data-scroll-container="main" data-scroll-direction="horizontal">
              {recentProducts.map((product: any) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => navigate(`/item/${product.id}`)}
                  className="flex-shrink-0 w-24 active:opacity-60"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mb-1">
                    <span className="text-[10px] text-gray-400">商品</span>
                  </div>
                  <p className="text-[11px] text-gray-700 line-clamp-2 leading-snug">
                    {product.title}
                  </p>
                  <p className="text-[12px] font-semibold text-[#FF5339] mt-0.5">¥{product.price}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <TabBar />
    </div>
  );
};

export default MePage;
