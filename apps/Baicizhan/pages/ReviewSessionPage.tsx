import React, { useState, useEffect } from 'react';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';

const ReviewSessionPage: React.FC = () => {
  const words = useBaicizhanStore(s => s.words);
  const reviewSessions = useBaicizhanStore(s => s.reviewSessions);
  const reviewSessionWordIds = useBaicizhanStore(s => s._temp.reviewSessionWordIds);
  const currentReviewWordIndex = useBaicizhanStore(s => s._temp.currentReviewWordIndex);
  const recordReviewResult = useBaicizhanStore(s => s.recordReviewResult);
  const completeReviewSession = useBaicizhanStore(s => s.completeReviewSession);

  const { bindAction, bindBack, go } = useBaicizhanGestures();

  const [revealed, setRevealed] = useState(false);
  const [transitioning, setTransitioning] = useState(false);

  const currentSession = reviewSessions.length > 0 ? reviewSessions[reviewSessions.length - 1] : null;

  // Redirect if no session
  useEffect(() => {
    if (!currentSession && reviewSessionWordIds.length === 0) {
      go('tab.home');
    }
  }, [currentSession, reviewSessionWordIds, go]);

  if (!currentSession && reviewSessionWordIds.length === 0) {
    return null;
  }

  const totalWords = reviewSessionWordIds.length;
  const currentIndex = currentReviewWordIndex;
  const currentWordId = currentIndex < totalWords ? reviewSessionWordIds[currentIndex] : null;
  const currentWord = currentWordId ? words[currentWordId] : null;

  const isCompleted = currentSession?.isCompleted ?? false;

  const handleCorrect = () => {
    if (currentWordId && !transitioning) {
      setTransitioning(true);
      recordReviewResult(currentWordId, 'correct');
      setRevealed(false);
      setTimeout(() => setTransitioning(false), 200);
    }
  };

  const handleIncorrect = () => {
    if (currentWordId && !transitioning) {
      setTransitioning(true);
      recordReviewResult(currentWordId, 'incorrect');
      setRevealed(false);
      setTimeout(() => setTransitioning(false), 200);
    }
  };

  const handleComplete = () => {
    completeReviewSession();
    go('tab.home');
  };

  // Completion screen
  if (isCompleted || currentIndex >= totalWords) {
    return (
      <div className="pt-10 min-h-full bg-white flex flex-col" data-status-bar-foreground="dark">
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">复习完成！</h2>
          <p className="text-sm text-gray-500 mb-8">本次复习了 {totalWords} 个单词</p>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-500">{currentSession?.correctCount ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">答对</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{currentSession?.incorrectCount ?? 0}</p>
              <p className="text-xs text-gray-400 mt-1">答错</p>
            </div>
          </div>

          <button
            onClick={handleComplete}
            className="w-full max-w-xs bg-orange-500 text-white text-lg font-semibold py-3 rounded-xl active:bg-orange-600"
            data-action="reviewSession.complete.tap"
            data-action-type="tap"
          >
            完成复习
          </button>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="pt-10 min-h-full bg-white flex items-center justify-center" data-status-bar-foreground="dark">
        <p className="text-gray-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="pt-10 min-h-full bg-gray-50 flex flex-col" data-status-bar-foreground="dark">
      {/* Progress */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <button {...bindBack()} className="p-1" aria-label="返回">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm text-gray-500">{currentIndex + 1} / {totalWords}</span>
          <div className="w-6" />
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-400 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex) / totalWords) * 100}%` }}
          />
        </div>
      </div>

      {/* Word Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="bg-white rounded-2xl w-full max-w-sm p-8 shadow-sm">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-2">{currentWord.spelling}</h2>
          <p className="text-sm text-center text-gray-400 mb-6">{currentWord.phonetic}</p>

          {revealed ? (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <p className="text-lg font-medium text-gray-800">{currentWord.chineseMeaning}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">释义</p>
                <p className="text-sm text-gray-700">{currentWord.englishMeaning}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">例句</p>
                <p className="text-sm text-gray-600 italic">{currentWord.exampleSentence}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8">
              <button
                onClick={() => setRevealed(true)}
                className="bg-gray-100 text-gray-600 text-sm font-medium px-6 py-2 rounded-full active:bg-gray-200"
                data-action="reviewSession.word.showAnswer"
                data-action-type="tap"
              >
                显示答案
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {revealed && (
          <div className="flex gap-4 w-full max-w-sm mt-6">
            <button
              onClick={handleIncorrect}
              className="flex-1 bg-red-500 text-white text-base font-semibold py-3 rounded-xl active:bg-red-600"
              data-action="reviewSession.word.incorrect"
              data-action-type="tap"
              data-action-params={JSON.stringify({ wordId: currentWord.id })}
            >
              答错了
            </button>
            <button
              onClick={handleCorrect}
              className="flex-1 bg-green-500 text-white text-base font-semibold py-3 rounded-xl active:bg-green-600"
              data-action="reviewSession.word.correct"
              data-action-type="tap"
              data-action-params={JSON.stringify({ wordId: currentWord.id })}
            >
              答对了
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSessionPage;
