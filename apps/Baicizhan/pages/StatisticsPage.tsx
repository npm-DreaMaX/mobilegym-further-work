import React from 'react';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';

const StatisticsPage: React.FC = () => {
  const statistics = useBaicizhanStore(s => s.statistics);
  const studyRecords = useBaicizhanStore(s => s.studyRecords);
  const reviewRecords = useBaicizhanStore(s => s.reviewRecords);

  const { bindBack } = useBaicizhanGestures();

  const totalKnown = studyRecords.filter(r => r.result === 'known').length;
  const totalUnknown = studyRecords.filter(r => r.result === 'unknown').length;

  return (
    <div className="pt-10 min-h-full bg-gray-50" data-status-bar-foreground="dark">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 bg-white border-b border-gray-100">
        <button {...bindBack()} className="p-1 mr-3" aria-label="返回">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">学习统计</h1>
      </div>

      <div className="p-4">
        {/* Overview Stats */}
        <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">总览</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-500">{statistics.totalStudyCount}</p>
              <p className="text-xs text-gray-500 mt-1">学习次数</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{statistics.totalMistakeCount}</p>
              <p className="text-xs text-gray-500 mt-1">错题总数</p>
            </div>
          </div>
        </div>

        {/* More Stats */}
        <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-pink-500">{statistics.totalFavoriteCount}</p>
              <p className="text-xs text-gray-500 mt-1">收藏</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-500">{statistics.streakDays}</p>
              <p className="text-xs text-gray-500 mt-1">连续天数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">{totalKnown}</p>
              <p className="text-xs text-gray-500 mt-1">认识</p>
            </div>
          </div>
        </div>

        {/* Study Records Summary */}
        {studyRecords.length > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">学习记录</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>总学习记录</span>
                <span className="font-medium text-gray-700">{studyRecords.length} 条</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>总复习记录</span>
                <span className="font-medium text-gray-700">{reviewRecords.length} 条</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>最后学习日期</span>
                <span className="font-medium text-gray-700">{statistics.lastStudyDate ?? '暂无'}</span>
              </div>
            </div>
          </div>
        )}

        {studyRecords.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-10">
            <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm text-gray-400">还没有学习记录</p>
            <p className="text-xs text-gray-300 mt-1">开始学习后将在这里展示统计</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsPage;
