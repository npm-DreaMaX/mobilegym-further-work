import React from 'react';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';
import { FAMILIARITY_LABELS } from '../constants';

const FavoritesPage: React.FC = () => {
  const words = useBaicizhanStore(s => s.words);
  const favorites = useBaicizhanStore(s => s.favorites);

  const { bindTap, bindBack } = useBaicizhanGestures();

  const favoriteWords = favorites.map(id => words[id]).filter(Boolean);

  return (
    <div className="pt-10 h-full flex flex-col bg-white" data-status-bar-foreground="dark">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100">
        <button {...bindBack()} className="p-1 mr-3" aria-label="返回">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">我的收藏</h1>
        {favoriteWords.length > 0 && (
          <span className="ml-2 text-sm text-gray-400">({favoriteWords.length})</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {favoriteWords.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-sm text-gray-400">还没有收藏的单词</p>
            <p className="text-xs text-gray-300 mt-1">在单词详情页可以收藏单词</p>
          </div>
        ) : (
          <div>
            {favoriteWords.map(word => (
              <button
                key={word.id}
                {...bindTap('favorites.word.open', { wordId: word.id })}
                className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50 active:bg-gray-50 text-left"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{word.spelling}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{word.chineseMeaning}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                    {FAMILIARITY_LABELS[word.familiarity] ?? word.familiarity}
                  </span>
                  <svg className="w-4 h-4 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
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

export default FavoritesPage;
