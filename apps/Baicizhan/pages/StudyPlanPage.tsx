import React from 'react';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';
import { DAILY_GOAL_OPTIONS } from '../constants';

const StudyPlanPage: React.FC = () => {
  const wordBooks = useBaicizhanStore(s => s.wordBooks);
  const studyPlan = useBaicizhanStore(s => s.studyPlan);
  const switchWordBook = useBaicizhanStore(s => s.switchWordBook);
  const setDailyGoal = useBaicizhanStore(s => s.setDailyGoal);

  const { bindTap, bindBack } = useBaicizhanGestures();

  const currentBook = wordBooks[studyPlan.bookId];
  const allBooks = Object.values(wordBooks);

  return (
    <div className="pt-10 min-h-full bg-gray-50" data-status-bar-foreground="dark">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 bg-white border-b border-gray-100">
        <button {...bindBack()} className="p-1 mr-3" aria-label="返回">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">学习计划</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Current Book Section */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">当前词书</h3>
          <div className="bg-orange-50 rounded-xl p-4 mb-3">
            <p className="text-base font-semibold text-gray-800">{currentBook?.name ?? '未选择'}</p>
            {currentBook && (
              <p className="text-xs text-gray-500 mt-1">{currentBook.nameEn} - {currentBook.difficulty}</p>
            )}
          </div>
        </div>

        {/* Word Book Selection */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">切换词书</h3>
          <div className="space-y-2">
            {allBooks.map(book => (
              <button
                key={book.id}
                onClick={() => switchWordBook(book.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left ${
                  book.isCurrent
                    ? 'bg-orange-50 border border-orange-200'
                    : 'bg-gray-50 border border-transparent active:bg-gray-100'
                }`}
                data-action="plan.select.book"
                data-action-type="select"
                data-action-params={JSON.stringify({ bookId: book.id })}
              >
                <div>
                  <p className={`text-sm font-medium ${book.isCurrent ? 'text-orange-700' : 'text-gray-700'}`}>
                    {book.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{book.nameEn}</p>
                </div>
                {book.isCurrent && (
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Goal Section */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">每日目标</h3>
          <p className="text-xs text-gray-400 mb-3">当前目标: 每天 {studyPlan.dailyGoal} 个单词</p>
          <div className="flex flex-wrap gap-2">
            {DAILY_GOAL_OPTIONS.map(goal => (
              <button
                key={goal}
                onClick={() => setDailyGoal(goal)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  studyPlan.dailyGoal === goal
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
                data-action="plan.select.goal"
                data-action-type="select"
                data-action-params={JSON.stringify({ goal })}
              >
                {goal}
              </button>
            ))}
          </div>
        </div>

        {/* Reminder Section */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">学习提醒</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {studyPlan.reminderEnabled ? '已开启' : '已关闭'}
              </p>
              {studyPlan.reminderEnabled && (
                <p className="text-xs text-gray-400 mt-0.5">提醒时间: {studyPlan.reminderTime}</p>
              )}
            </div>
            <button
              {...bindTap('plan.reminder.open')}
              className="text-sm text-orange-500 font-medium active:text-orange-600"
            >
              设置
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanPage;
