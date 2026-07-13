import React from 'react';
import { useParams } from 'react-router-dom';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';
import { DIFFICULTY_LABELS, FAMILIARITY_LABELS } from '../constants';

const WordBookDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const wordBooks = useBaicizhanStore(s => s.wordBooks);
  const words = useBaicizhanStore(s => s.words);

  const { bindBack, go } = useBaicizhanGestures();

  const book = bookId ? wordBooks[bookId] : undefined;
  const bookWords = Object.values(words).filter(w => w.bookId === bookId);

  if (!book || !bookId) {
    return (
      <div className="pt-10 min-h-full bg-white flex items-center justify-center" data-status-bar-foreground="dark">
        <p className="text-gray-400">词书未找到</p>
      </div>
    );
  }

  return (
    <div className="pt-10 h-full flex flex-col bg-white" data-status-bar-foreground="dark">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100">
        <button {...bindBack()} className="p-1 mr-3" aria-label="返回">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{book.name}</h1>
      </div>

      {/* Book Info */}
      <div className="bg-white px-4 py-4 border-b border-gray-50">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600">{book.descriptionEn || book.description}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{book.totalWords}</p>
              <p className="text-xs text-gray-400">总单词</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-500">{book.learnedWords}</p>
              <p className="text-xs text-gray-400">已学习</p>
            </div>
            <div className="text-center">
              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                {DIFFICULTY_LABELS[book.difficulty] ?? book.difficulty}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Word List */}
      <div className="flex-1 overflow-y-auto">
        {bookWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-16">
            <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm text-gray-400">该词书暂无单词</p>
          </div>
        ) : (
          <div>
            <div className="px-4 py-2 text-xs text-gray-400">
              共 {bookWords.length} 个单词
            </div>
            {bookWords.map(word => (
              <button
                key={word.id}
                onClick={() => go('wordbooks.word.open', { wordId: word.id })}
                className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50 active:bg-gray-50 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{word.spelling}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{word.chineseMeaning}</p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                  {FAMILIARITY_LABELS[word.familiarity] ?? word.familiarity}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordBookDetailPage;
