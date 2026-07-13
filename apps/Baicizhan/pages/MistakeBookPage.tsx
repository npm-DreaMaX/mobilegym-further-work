import React from 'react';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';

const MistakeBookPage: React.FC = () => {
  const words = useBaicizhanStore(s => s.words);
  const mistakeBook = useBaicizhanStore(s => s.mistakeBook);
  const startReviewSession = useBaicizhanStore(s => s.startReviewSession);

  const { bindTap, bindBack, go } = useBaicizhanGestures();

  const mistakeWords = mistakeBook.map(id => words[id]).filter(Boolean);

  const handleStartReview = () => {
    if (mistakeBook.length > 0) {
      startReviewSession(mistakeBook);
    }
    go('home.review.start');
  };

  return (
    <div className="pt-10 h-full flex flex-col bg-white" data-status-bar-foreground="dark">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100">
        <button {...bindBack()} className="p-1 mr-3" aria-label="返回">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">错题本</h1>
        {mistakeWords.length > 0 && (
          <span className="ml-2 text-sm text-gray-400">({mistakeWords.length})</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {mistakeWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-gray-400">错题本为空</p>
            <p className="text-xs text-gray-300 mt-1">继续加油，没有错题！</p>
          </div>
        ) : (
          <div>
            {/* Start Review Button */}
            <div className="px-4 py-3">
              <button
                onClick={handleStartReview}
                className="w-full bg-orange-500 text-white text-sm font-semibold py-3 rounded-xl active:bg-orange-600"
                data-action="mistakes.review.start"
                data-action-type="tap"
              >
                开始复习 ({mistakeWords.length})
              </button>
            </div>

            {/* Word List */}
            <div>
              {mistakeWords.map(word => (
                <button
                  key={word.id}
                  {...bindTap('mistakes.word.open', { wordId: word.id })}
                  className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50 active:bg-gray-50 text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{word.spelling}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{word.chineseMeaning}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-400 bg-red-50 px-2 py-0.5 rounded">
                      错 {word.mistakeCount} 次
                    </span>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MistakeBookPage;
