import React from 'react';
import { IcTabHome, IcTabCategory, IcTabCart, IcTabMe } from '../res/icons';
import { useLocation } from 'react-router-dom';
import { useTaobaoGestures } from '../navigation';
import { useTaobaoStrings } from '../hooks/useTaobaoStrings';
import { useTaobaoStore } from '../state';

const TabBar: React.FC = () => {
  const location = useLocation();
  const { bindTap } = useTaobaoGestures();
  const s = useTaobaoStrings();
  const currentPath = location.pathname;
  const cartCount = useTaobaoStore(st => st.cart.length);

  const isActive = (path: string) => currentPath === path;

  const showTabs = ['/', '/categories', '/cart', '/me'].includes(currentPath);

  if (!showTabs) return null;

  const activeColor = 'text-app-primary';
  const inactiveColor = 'text-gray-500';

  const tabs = [
    { id: 'tab.home', path: '/', icon: IcTabHome, label: s.tab_home },
    { id: 'tab.category', path: '/categories', icon: IcTabCategory, label: s.tab_category },
    { id: 'tab.cart', path: '/cart', icon: IcTabCart, label: s.tab_cart, badge: cartCount },
    { id: 'tab.me', path: '/me', icon: IcTabMe, label: s.tab_me },
  ];

  return (
    <div
      data-hide-on-keyboard
      className="h-[56px] bg-white border-t border-gray-200 flex justify-around items-center w-full pb-1 absolute bottom-0 left-0 right-0 z-[90]"
    >
      {tabs.map(tab => (
        <div
          key={tab.id}
          {...bindTap(tab.id)}
          className="flex flex-col items-center justify-center w-full cursor-pointer relative"
        >
          <tab.icon size={24} className={isActive(tab.path) ? activeColor : inactiveColor} strokeWidth={isActive(tab.path) ? 2.5 : 2} />
          <span className={`text-[10px] mt-0.5 ${isActive(tab.path) ? activeColor : 'text-gray-500'}`}>
            {tab.label}
          </span>
          {tab.badge && tab.badge > 0 && (
            <span className="absolute top-0 right-1/3 min-w-[16px] h-[16px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {tab.badge > 99 ? '99+' : tab.badge}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default TabBar;
