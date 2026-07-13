import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';

const SpellingExercisePage: React.FC = () => {
  const { wordId } = useParams<{ wordId: string }>();
  const words = useBaicizhanStore(s => s.words);
  const spellingExercises = useBaicizhanStore(s => s.spellingExercises);
  const startSpellingExercise = useBaicizhanStore(s => s.startSpellingExercise);
  const submitSpellingAttempt = useBaicizhanStore(s => s.submitSpellingAttempt);

  const { bindBack, back } = useBaicizhanGestures();

  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [initialized, setInitialized] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const word = wordId ? words[wordId] : undefined;
  const exercise = exerciseId ? spellingExercises[exerciseId] : undefined;

  // Initialize exercise on mount
  useEffect(() => {
    if (wordId && !initialized) {
      setInitialized(true);
      const id = startSpellingExercise(wordId);
      setExerciseId(id);
    }
  }, [wordId, initialized, startSpellingExercise]);

  if (!word || !wordId) {
    return (
      <div className="pt-10 min-h-full bg-white flex items-center justify-center" data-status-bar-foreground="dark">
        <p className="text-gray-400">单词未找到</p>
      </div>
    );
  }

  const handleSubmit = () => {
    if (exerciseId && input.trim() && result === null) {
      const isCorrect = submitSpellingAttempt(exerciseId, input.trim());
      setResult(isCorrect ? 'correct' : 'incorrect');
    }
  };

  const handleRetry = () => {
    if (wordId && exercise?.isCompleted) {
      // Start a new exercise for same word
      const id = startSpellingExercise(wordId);
      setExerciseId(id);
      setInput('');
      setResult(null);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const isCompleted = exercise?.isCompleted ?? false;
  const attempts = exercise?.attempts ?? [];
  const isCorrect = exercise?.isCorrect ?? false;

  return (
    <div className="pt-10 min-h-full bg-white flex flex-col" data-status-bar-foreground="dark">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100">
        <button {...bindBack()} className="p-1 mr-3" aria-label="返回">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">拼写练习</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Hint Section */}
        <div className="w-full max-w-sm mb-8">
          <div className="bg-orange-50 rounded-xl p-5 mb-4 text-center">
            <p className="text-xs text-gray-500 mb-2">请拼写以下单词</p>
            <p className="text-xl font-semibold text-gray-800">{word.chineseMeaning}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">上下文</p>
            <p className="text-sm text-gray-600 italic">{word.exampleSentence}</p>
          </div>
        </div>

        {/* Input Area */}
        {!isCompleted && (
          <div className="w-full max-w-sm">
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-lg text-center text-gray-800 outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
              placeholder="输入拼写..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
              autoFocus
              data-action="spelling.input.type"
              data-action-type="input"
            />
            <button
              onClick={handleSubmit}
              className="w-full bg-orange-500 text-white text-base font-semibold py-3 rounded-xl mt-4 active:bg-orange-600 disabled:opacity-50"
              disabled={!input.trim() || result !== null}
              data-action="spelling.submit.tap"
              data-action-type="submit"
            >
              提交
            </button>
          </div>
        )}

        {/* Result */}
        {isCompleted && (
          <div className="w-full max-w-sm text-center">
            {isCorrect ? (
              <div className="bg-green-50 rounded-xl p-6 mb-4">
                <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-lg font-semibold text-green-700">拼写正确！</p>
                <p className="text-sm text-green-500 mt-1">
                  正确答案: <span className="font-bold">{word.spelling}</span>
                </p>
              </div>
            ) : (
              <div className="bg-red-50 rounded-xl p-6 mb-4">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-lg font-semibold text-red-700">拼写错误</p>
                <p className="text-sm text-red-500 mt-1">
                  正确答案: <span className="font-bold">{word.spelling}</span>
                </p>
                <p className="text-sm text-red-400 mt-1">你的输入: "{attempts[attempts.length - 1]}"</p>
              </div>
            )}

            {/* Attempt History */}
            {attempts.length > 1 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">尝试记录:</p>
                <div className="space-y-1">
                  {attempts.map((a, idx) => (
                    <div
                      key={idx}
                      className={`text-xs px-3 py-1 rounded ${
                        idx === attempts.length - 1
                          ? isCorrect ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      #{idx + 1}: {a}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!isCorrect && (
              <button
                onClick={handleRetry}
                className="w-full bg-orange-500 text-white text-base font-semibold py-3 rounded-xl active:bg-orange-600"
              >
                再试一次
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpellingExercisePage;
