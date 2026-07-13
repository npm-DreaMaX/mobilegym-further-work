import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';

const ListeningExercisePage: React.FC = () => {
  const { wordId } = useParams<{ wordId: string }>();
  const words = useBaicizhanStore(s => s.words);
  const listeningExercises = useBaicizhanStore(s => s.listeningExercises);
  const startListeningExercise = useBaicizhanStore(s => s.startListeningExercise);
  const playListening = useBaicizhanStore(s => s.playListening);
  const submitListeningAnswer = useBaicizhanStore(s => s.submitListeningAnswer);

  const { bindBack, back } = useBaicizhanGestures();

  const [exerciseId, setExerciseId] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  const word = wordId ? words[wordId] : undefined;
  const exercise = exerciseId ? listeningExercises[exerciseId] : undefined;

  // Generate options: target word + 3 random words from same book
  const options = useMemo(() => {
    if (!word || !wordId) return [];
    const bookWords = Object.values(words).filter(w => w.bookId === word.bookId && w.id !== wordId);
    // Shuffle and pick 3
    const shuffled = [...bookWords].sort(() => Math.random() - 0.5);
    const randoms = shuffled.slice(0, 3);
    // Combine with target and shuffle again for display
    const allOptions = [{ id: wordId, spelling: word.spelling }, ...randoms.map(w => ({ id: w.id, spelling: w.spelling }))];
    return allOptions.sort(() => Math.random() - 0.5);
  }, [word, wordId, words]);

  // Initialize exercise on mount
  useEffect(() => {
    if (wordId && !initialized) {
      setInitialized(true);
      const id = startListeningExercise(wordId);
      setExerciseId(id);
    }
  }, [wordId, initialized, startListeningExercise]);

  if (!word || !wordId) {
    return (
      <div className="pt-10 min-h-full bg-white flex items-center justify-center" data-status-bar-foreground="dark">
        <p className="text-gray-400">单词未找到</p>
      </div>
    );
  }

  const isPlayed = exercise?.played ?? false;
  const isCompleted = exercise?.isCompleted ?? false;
  const isCorrect = exercise?.isCorrect ?? false;

  const handlePlay = () => {
    if (exerciseId && !isPlayed) {
      playListening(exerciseId);
    }
  };

  const handleSelect = (optId: string) => {
    if (!isPlayed || isCompleted) return;
    setSelectedOption(optId);
  };

  const handleSubmit = () => {
    if (exerciseId && selectedOption && !isCompleted) {
      const correct = submitListeningAnswer(exerciseId, selectedOption);
      setResult(correct ? 'correct' : 'incorrect');
    }
  };

  return (
    <div className="pt-10 min-h-full bg-white flex flex-col" data-status-bar-foreground="dark">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100">
        <button {...bindBack()} className="p-1 mr-3" aria-label="返回">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">听力练习</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6">
        {/* Target Word Hint */}
        <div className="w-full max-w-sm mb-6">
          <div className="bg-gray-50 rounded-xl p-5 text-center">
            <p className="text-xs text-gray-500 mb-1">点击播放按钮听单词发音</p>
            <p className="text-sm text-gray-400 mt-2">中文提示: {word.chineseMeaning}</p>
          </div>
        </div>

        {/* Play Button */}
        {!isPlayed && (
          <button
            onClick={handlePlay}
            className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center active:bg-orange-600 shadow-lg shadow-orange-200 mb-8"
            data-action="listening.play.tap"
            data-action-type="tap"
          >
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}

        {isPlayed && !isCompleted && (
          <>
            {/* Replay Button */}
            <button
              onClick={handlePlay}
              className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center active:bg-orange-200 mb-6"
              data-action="listening.play.tap"
              data-action-type="tap"
            >
              <svg className="w-6 h-6 text-orange-500 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>

            {/* Options */}
            <div className="w-full max-w-sm space-y-3 mb-6">
              {options.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full py-3 px-4 rounded-xl border text-left text-sm font-medium transition-colors ${
                    selectedOption === opt.id
                      ? 'bg-orange-50 border-orange-300 text-orange-700'
                      : 'bg-white border-gray-200 text-gray-700 active:bg-gray-50'
                  }`}
                  data-action="listening.select.option"
                  data-action-type="select"
                  data-action-params={JSON.stringify({ wordId: opt.id })}
                >
                  {opt.spelling}
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full max-w-sm bg-orange-500 text-white text-base font-semibold py-3 rounded-xl active:bg-orange-600 disabled:opacity-50"
              disabled={!selectedOption}
              data-action="listening.submit.tap"
              data-action-type="submit"
            >
              提交答案
            </button>
          </>
        )}

        {/* Result */}
        {isCompleted && (
          <div className="w-full max-w-sm text-center">
            {isCorrect ? (
              <div className="bg-green-50 rounded-xl p-6">
                <svg className="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-lg font-semibold text-green-700">回答正确！</p>
                <p className="text-sm text-green-500 mt-1">你选择了: {word.spelling}</p>
              </div>
            ) : (
              <div className="bg-red-50 rounded-xl p-6">
                <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <p className="text-lg font-semibold text-red-700">回答错误</p>
                <p className="text-sm text-red-500 mt-1">
                  正确答案: <span className="font-bold">{word.spelling}</span>
                </p>
                {exercise?.selectedOption && (
                  <p className="text-sm text-red-400 mt-1">
                    你选择了: {words[exercise.selectedOption]?.spelling ?? '未知'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeningExercisePage;
