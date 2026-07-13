import React, { useRef } from 'react';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';

const SearchPage: React.FC = () => {
  const search = useBaicizhanStore(s => s.search);
  const words = useBaicizhanStore(s => s.words);
  const setSearchQuery = useBaicizhanStore(s => s.setSearchQuery);
  const clearSearch = useBaicizhanStore(s => s.clearSearch);
  const openWordFromSearch = useBaicizhanStore(s => s.openWordFromSearch);

  const { bindTap, bindBack, go } = useBaicizhanGestures();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClear = () => {
    clearSearch();
    if (inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.focus();
    }
  };

  const handleResultClick = (wordId: string) => {
    openWordFromSearch(wordId);
    go('search.word.open', { wordId });
  };

  const resultWords = search.results.map(id => words[id]).filter(Boolean);

  return (
    <div className="pt-10 h-full flex flex-col bg-white" data-status-bar-foreground="dark">
      {/* Search Bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button {...bindBack()} className="p-1" aria-label="返回">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-800 outline-none focus:ring-2 focus:ring-orange-300"
            placeholder="搜索单词或释义..."
            value={search.query}
            onChange={handleInputChange}
            autoFocus
            data-action="search.input.type"
            data-action-type="input"
          />
          {search.query && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
              data-action="search.clear.tap"
              data-action-type="tap"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!search.query ? (
          /* Empty state - show search history */
          <div className="p-4">
            {search.history.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">搜索历史</h3>
                <div className="flex flex-wrap gap-2">
                  {search.history.map((h, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearchQuery(h)}
                      className="bg-gray-100 text-gray-600 text-sm px-3 py-1.5 rounded-full active:bg-gray-200"
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {search.history.length === 0 && (
              <div className="flex flex-col items-center justify-center pt-20">
                <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm text-gray-400">搜索你想学习的单词</p>
              </div>
            )}
          </div>
        ) : resultWords.length === 0 ? (
          /* No results */
          <div className="flex flex-col items-center justify-center pt-20">
            <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            <p className="text-sm text-gray-400">没有找到 "{search.query}"</p>
          </div>
        ) : (
          /* Results list */
          <div>
            <div className="px-4 py-2 text-xs text-gray-400">共 {resultWords.length} 个结果</div>
            {resultWords.map(word => (
              <button
                key={word.id}
                onClick={() => handleResultClick(word.id)}
                className="w-full flex items-center justify-between px-4 py-3.5 border-b border-gray-50 active:bg-gray-50 text-left"
                data-trigger="search.word.open"
                data-trigger-type="tap"
                data-trigger-params={JSON.stringify({ wordId: word.id })}
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{word.spelling}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{word.chineseMeaning}</p>
                </div>
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
