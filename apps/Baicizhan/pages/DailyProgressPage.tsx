import React from 'react';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';

const DailyProgressPage: React.FC = () => {
  const dailyProgress = useBaicizhanStore(s => s.dailyProgress);
  const studyPlan = useBaicizhanStore(s => s.studyPlan);

  const { bindBack } = useBaicizhanGestures();

  const studiedCount = dailyProgress?.studiedCount ?? 0;
  const reviewedCount = dailyProgress?.reviewedCount ?? 0;
  const goalCompleted = dailyProgress?.goalCompleted ?? false;
  const dailyGoal = studyPlan.dailyGoal;

  const progressPercent = dailyGoal > 0
    ? Math.min(100, Math.round((studiedCount / dailyGoal) * 100))
    : 0;

  return (
    <div className="pt-10 min-h-full bg-gray-50" data-status-bar-foreground="dark">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 bg-white border-b border-gray-100">
        <button {...bindBack()} className="p-1 mr-3" aria-label="返回">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">今日进度</h1>
      </div>

      <div className="p-4">
        {/* Date */}
        <p className="text-sm text-gray-500 mb-4">
          日期: {dailyProgress?.date ?? '今日'}
        </p>

        {/* Progress Card */}
        <div className="bg-white rounded-xl p-5 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">学习进度</p>
            {goalCompleted && (
              <span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full">已完成</span>
            )}
          </div>

          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-right text-sm text-gray-500">
            {studiedCount} / {dailyGoal} 词
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="text-2xl font-bold text-blue-500">{studiedCount}</p>
            <p className="text-xs text-gray-500 mt-1">已学习</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <p className="text-2xl font-bold text-green-500">{reviewedCount}</p>
            <p className="text-xs text-gray-500 mt-1">已复习</p>
          </div>
        </div>

        {/* Today's Records Summary */}
        {studiedCount > 0 && (
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">今日学习记录</h3>
            <p className="text-xs text-gray-400">
              今日已学习 {studiedCount} 个新单词，复习 {reviewedCount} 个旧单词
              {goalCompleted && '，已完成今日目标'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyProgressPage;
