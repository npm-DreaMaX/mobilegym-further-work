import React from 'react';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';

const MePage: React.FC = () => {
  const statistics = useBaicizhanStore(s => s.statistics);
  const favorites = useBaicizhanStore(s => s.favorites);
  const mistakeBook = useBaicizhanStore(s => s.mistakeBook);

  const { bindTap } = useBaicizhanGestures();

  const menuItems = [
    {
      id: 'me.favorites.open',
      label: '我的收藏',
      count: favorites.length,
      color: 'text-pink-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
    },
    {
      id: 'me.mistakes.open',
      label: '错题本',
      count: mistakeBook.length,
      color: 'text-red-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      id: 'me.statistics.open',
      label: '学习统计',
      count: null,
      color: 'text-green-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'me.plan.open',
      label: '学习计划',
      count: null,
      color: 'text-blue-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      id: 'me.settings.open',
      label: '设置',
      count: null,
      color: 'text-gray-500',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="pt-10 h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Header */}
      <div className="bg-white px-4 py-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">我的</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Stats Card */}
        <div className="bg-white mx-4 mt-4 rounded-xl p-5 shadow-sm">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{statistics.streakDays}</p>
              <p className="text-xs text-gray-500 mt-1">连续天数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{statistics.totalStudyCount}</p>
              <p className="text-xs text-gray-500 mt-1">已学单词</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-500">{statistics.totalMistakeCount}</p>
              <p className="text-xs text-gray-500 mt-1">错题数</p>
            </div>
          </div>
        </div>

        {/* Menu List */}
        <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm divide-y divide-gray-100">
          {menuItems.map(item => (
            <button
              key={item.id}
              {...bindTap(item.id as any)}
              className="w-full flex items-center px-4 py-4 active:bg-gray-50 text-left"
            >
              <span className={`${item.color}`}>{item.icon}</span>
              <span className="flex-1 ml-3 text-sm text-gray-800">{item.label}</span>
              {item.count !== null && item.count > 0 && (
                <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{item.count}</span>
              )}
              <svg className="w-4 h-4 text-gray-300 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="flex border-t border-gray-100 bg-white">
        <button
          {...bindTap('tab.home')}
          className="flex-1 flex flex-col items-center py-2 text-gray-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-0.5">学习</span>
        </button>
        <div className="flex-1 flex flex-col items-center py-2 text-orange-500" data-trigger="tab.me" data-trigger-type="tap">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs mt-0.5">我的</span>
        </div>
      </div>
    </div>
  );
};

export default MePage;
