import React, { useMemo } from 'react';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';

const HomePage: React.FC = () => {
  const words = useBaicizhanStore(s => s.words);
  const wordBooks = useBaicizhanStore(s => s.wordBooks);
  const studyPlan = useBaicizhanStore(s => s.studyPlan);
  const statistics = useBaicizhanStore(s => s.statistics);
  const mistakeBook = useBaicizhanStore(s => s.mistakeBook);
  const dailyProgress = useBaicizhanStore(s => s.dailyProgress);
  const todaySession = useBaicizhanStore(s => s.todaySession);
  const startStudySession = useBaicizhanStore(s => s.startStudySession);

  const { bindTap, go } = useBaicizhanGestures();

  const currentBook = wordBooks[studyPlan.bookId];
  const reviewCount = mistakeBook.length;
  const studiedCount = dailyProgress?.studiedCount ?? 0;
  const goalCompleted = dailyProgress?.goalCompleted ?? false;

  const studyWordIds = useMemo(() => {
    return Object.values(words)
      .filter(w => w.bookId === studyPlan.bookId && w.familiarity !== 'familiar' && w.familiarity !== 'mastered')
      .map(w => w.id);
  }, [words, studyPlan.bookId]);

  const handleStartStudy = () => {
    if (studyWordIds.length > 0) {
      startStudySession(studyWordIds);
    }
    go('home.study.start');
  };

  const progressPercent = studyPlan.dailyGoal > 0
    ? Math.min(100, Math.round((studiedCount / studyPlan.dailyGoal) * 100))
    : 0;

  return (
    <div className="pt-10 h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">百词斩</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-orange-500 font-medium">
            {statistics.streakDays} 天
          </span>
          <button
            {...bindTap('home.search.open')}
            className="p-1"
            aria-label="搜索"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {/* Current Book & Daily Progress Card */}
        <div className="bg-white rounded-xl mt-4 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">当前词书</p>
              <p className="text-base font-semibold text-gray-900">{currentBook?.name ?? '未选择'}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">今日学习</p>
              <p className="text-base font-semibold text-orange-500">{studiedCount} / {studyPlan.dailyGoal}</p>
            </div>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {goalCompleted && (
            <p className="text-xs text-green-500 mt-1 text-right">已完成今日目标</p>
          )}
        </div>

        {/* Review Reminder */}
        {reviewCount > 0 && (
          <div
            className="bg-red-50 border border-red-100 rounded-xl mt-3 p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium text-red-600">待复习单词</p>
              <p className="text-xs text-red-400">还有 {reviewCount} 个单词需要复习</p>
            </div>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">{reviewCount}</span>
          </div>
        )}

        {/* Start Study Button */}
        <button
          onClick={handleStartStudy}
          className="w-full bg-orange-500 text-white text-lg font-semibold py-4 rounded-xl mt-4 active:bg-orange-600 disabled:opacity-50"
          data-trigger="home.study.start"
          data-trigger-type="tap"
          disabled={studyWordIds.length === 0}
        >
          {todaySession?.isCompleted ? '继续学习' : '开始学习'}
        </button>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          <button
            {...bindTap('home.search.open')}
            className="flex flex-col items-center bg-white rounded-xl py-4 shadow-sm active:bg-gray-50"
          >
            <svg className="w-6 h-6 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs text-gray-600">搜索</span>
          </button>
          <button
            {...bindTap('home.wordbooks.open')}
            className="flex flex-col items-center bg-white rounded-xl py-4 shadow-sm active:bg-gray-50"
          >
            <svg className="w-6 h-6 text-blue-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-xs text-gray-600">词书</span>
          </button>
          <button
            {...bindTap('home.mistakes.open')}
            className="flex flex-col items-center bg-white rounded-xl py-4 shadow-sm active:bg-gray-50"
          >
            <svg className="w-6 h-6 text-red-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs text-gray-600">错题本</span>
          </button>
          <button
            {...bindTap('home.progress.open')}
            className="flex flex-col items-center bg-white rounded-xl py-4 shadow-sm active:bg-gray-50"
          >
            <svg className="w-6 h-6 text-green-500 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-xs text-gray-600">进度</span>
          </button>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="flex border-t border-gray-100 bg-white" data-trigger="tab.home" data-trigger-type="tap">
        <div className="flex-1 flex flex-col items-center py-2 text-orange-500">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
          <span className="text-xs mt-0.5">学习</span>
        </div>
        <button
          {...bindTap('tab.me')}
          className="flex-1 flex flex-col items-center py-2 text-gray-400"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs mt-0.5">我的</span>
        </button>
      </div>
    </div>
  );
};

export default HomePage;
