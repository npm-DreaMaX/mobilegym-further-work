import React from 'react';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';
import { REMINDER_TIME_OPTIONS } from '../constants';

const ReminderPage: React.FC = () => {
  const studyPlan = useBaicizhanStore(s => s.studyPlan);
  const setReminder = useBaicizhanStore(s => s.setReminder);

  const { bindBack, back } = useBaicizhanGestures();

  const { reminderEnabled, reminderTime } = studyPlan;

  const handleToggle = () => {
    setReminder(!reminderEnabled);
  };

  const handleTimeSelect = (time: string) => {
    setReminder(true, time);
  };

  const handleSave = () => {
    back();
  };

  return (
    <div className="pt-10 min-h-full bg-gray-50" data-status-bar-foreground="dark">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 bg-white border-b border-gray-100">
        <button {...bindBack()} className="p-1 mr-3" aria-label="返回">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">学习提醒</h1>
      </div>

      <div className="p-4 space-y-4">
        {/* Toggle Switch */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">学习提醒</p>
              <p className="text-xs text-gray-400 mt-0.5">每天按时提醒学习</p>
            </div>
            <button
              onClick={handleToggle}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors ${
                reminderEnabled ? 'bg-orange-500' : 'bg-gray-200'
              }`}
              data-action="reminder.toggle.tap"
              data-action-type="tap"
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                reminderEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {reminderEnabled && (
            <p className="text-xs text-orange-500 mt-3">
              当前提醒时间: {reminderTime}
            </p>
          )}

          {!reminderEnabled && (
            <p className="text-xs text-gray-400 mt-3">提醒已关闭</p>
          )}
        </div>

        {/* Time Selection */}
        {reminderEnabled && (
          <div className="bg-white rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">选择提醒时间</h3>
            <div className="grid grid-cols-3 gap-2">
              {REMINDER_TIME_OPTIONS.map(time => (
                <button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    reminderTime === time
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                  }`}
                  data-action="reminder.select.time"
                  data-action-type="select"
                  data-action-params={JSON.stringify({ time })}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full bg-orange-500 text-white text-base font-semibold py-3 rounded-xl active:bg-orange-600"
        >
          保存
        </button>
      </div>
    </div>
  );
};

export default ReminderPage;
