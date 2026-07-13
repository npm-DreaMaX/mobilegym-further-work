import React from 'react';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';
import { DIFFICULTY_LABELS } from '../constants';

const WordBooksPage: React.FC = () => {
  const wordBooks = useBaicizhanStore(s => s.wordBooks);

  const { bindTap, bindBack } = useBaicizhanGestures();

  const allBooks = Object.values(wordBooks);

  return (
    <div className="pt-10 h-full flex flex-col bg-gray-50" data-status-bar-foreground="dark">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 bg-white border-b border-gray-100">
        <button {...bindBack()} className="p-1 mr-3" aria-label="返回">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">词书选择</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {allBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-sm text-gray-400">暂无词书</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allBooks.map(book => (
              <button
                key={book.id}
                {...bindTap('wordbooks.detail.open', { bookId: book.id })}
                className={`w-full text-left bg-white rounded-xl p-5 shadow-sm active:bg-gray-50 border ${
                  book.isCurrent ? 'border-orange-200' : 'border-transparent'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">{book.name}</h3>
                      {book.isCurrent && (
                        <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">当前</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{book.nameEn}</p>
                    <p className="text-xs text-gray-500 mt-2">{book.description}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <span className="text-xs text-gray-400">
                        共 {book.totalWords} 词
                      </span>
                      <span className="text-xs text-blue-500">
                        已学 {book.learnedWords} 词
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {DIFFICULTY_LABELS[book.difficulty] ?? book.difficulty}
                      </span>
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WordBooksPage;
