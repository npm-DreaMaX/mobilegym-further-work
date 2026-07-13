import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useBaicizhanStore } from '../state';
import { useBaicizhanGestures } from '../navigation';
import { DIFFICULTY_LABELS, FAMILIARITY_LABELS } from '../constants';

const WordDetailPage: React.FC = () => {
  const { wordId } = useParams<{ wordId: string }>();
  const words = useBaicizhanStore(s => s.words);
  const wordBooks = useBaicizhanStore(s => s.wordBooks);
  const notes = useBaicizhanStore(s => s.notes);
  const toggleFavorite = useBaicizhanStore(s => s.toggleFavorite);
  const addNote = useBaicizhanStore(s => s.addNote);
  const editNote = useBaicizhanStore(s => s.editNote);
  const deleteNote = useBaicizhanStore(s => s.deleteNote);

  const { bindTap, bindBack, back, go } = useBaicizhanGestures();

  const [noteInput, setNoteInput] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  const word = wordId ? words[wordId] : undefined;
  const book = word ? wordBooks[word.bookId] : undefined;
  const wordNotes = word ? word.noteIds.map(id => notes[id]).filter(Boolean) : [];

  if (!word || !wordId) {
    return (
      <div className="pt-10 min-h-full bg-white flex items-center justify-center" data-status-bar-foreground="dark">
        <p className="text-gray-400">单词未找到</p>
      </div>
    );
  }

  const handleToggleFavorite = () => {
    toggleFavorite(wordId);
  };

  const handleAddNote = () => {
    if (noteInput.trim()) {
      addNote(wordId, noteInput.trim());
      setNoteInput('');
      setShowAddNote(false);
    }
  };

  const handleStartEdit = (noteId: string, content: string) => {
    setEditingNoteId(noteId);
    setEditInput(content);
  };

  const handleSaveEdit = () => {
    if (editingNoteId && editInput.trim()) {
      editNote(editingNoteId, editInput.trim());
      setEditingNoteId(null);
      setEditInput('');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
  };

  return (
    <div className="pt-10 min-h-full bg-white" data-status-bar-foreground="dark">
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 border-b border-gray-100">
        <button {...bindBack()} className="p-1 mr-3" aria-label="返回">
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-900">单词详情</h1>
      </div>

      <div className="p-5 overflow-y-auto">
        {/* Word Spelling */}
        <h2 className="text-3xl font-bold text-gray-900 mb-1">{word.spelling}</h2>
        <p className="text-sm text-gray-400 mb-4">{word.phonetic}</p>

        {/* Meanings */}
        <div className="bg-orange-50 rounded-xl p-4 mb-4">
          <p className="text-lg text-gray-800 font-medium mb-2">{word.chineseMeaning}</p>
          <p className="text-sm text-gray-500">{word.englishMeaning}</p>
        </div>

        {/* Example Sentence */}
        <div className="bg-blue-50 rounded-xl p-4 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-1">例句</p>
          <p className="text-sm text-gray-600 italic">{word.exampleSentence}</p>
          <p className="text-sm text-gray-500 mt-1">{word.exampleTranslation}</p>
        </div>

        {/* Info Row */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="bg-gray-100 rounded-lg px-3 py-1.5">
            <span className="text-xs text-gray-500">词书: </span>
            <span className="text-xs font-medium text-gray-700">{book?.name ?? word.bookId}</span>
          </div>
          <div className="bg-gray-100 rounded-lg px-3 py-1.5">
            <span className="text-xs text-gray-500">难度: </span>
            <span className="text-xs font-medium text-gray-700">{DIFFICULTY_LABELS[word.difficulty] ?? word.difficulty}</span>
          </div>
          <div className="bg-gray-100 rounded-lg px-3 py-1.5">
            <span className="text-xs text-gray-500">状态: </span>
            <span className="text-xs font-medium text-gray-700">{FAMILIARITY_LABELS[word.familiarity] ?? word.familiarity}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex gap-6 mb-6">
          <div className="text-center">
            <p className="text-lg font-bold text-gray-800">{word.studyCount}</p>
            <p className="text-xs text-gray-400">学习次数</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-red-500">{word.mistakeCount}</p>
            <p className="text-xs text-gray-400">错误次数</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleToggleFavorite}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border ${
              word.isFavorite
                ? 'bg-pink-50 border-pink-200 text-pink-500'
                : 'bg-gray-50 border-gray-200 text-gray-500'
            } active:opacity-80`}
            data-action="word.favorite.toggle"
            data-action-type="tap"
            data-action-params={JSON.stringify({ wordId })}
          >
            <svg className="w-5 h-5" fill={word.isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-sm font-medium">{word.isFavorite ? '已收藏' : '收藏'}</span>
          </button>
          <button
            {...bindTap('word.spelling.open', { wordId })}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 active:opacity-80"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span className="text-sm font-medium">拼写练习</span>
          </button>
          <button
            {...bindTap('word.listening.open', { wordId })}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 border border-green-200 text-green-600 active:opacity-80"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span className="text-sm font-medium">听力练习</span>
          </button>
        </div>

        {/* Notes Section */}
        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900">笔记 ({wordNotes.length})</h3>
            <button
              onClick={() => setShowAddNote(!showAddNote)}
              className="text-sm text-orange-500 font-medium"
              data-action="word.note.add"
              data-action-type="tap"
            >
              {showAddNote ? '取消' : '+ 添加笔记'}
            </button>
          </div>

          {/* Add Note Input */}
          {showAddNote && (
            <div className="mb-4 bg-gray-50 rounded-xl p-3">
              <textarea
                className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none outline-none focus:ring-2 focus:ring-orange-300"
                rows={3}
                placeholder="输入笔记内容..."
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => { setShowAddNote(false); setNoteInput(''); }}
                  className="px-4 py-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg"
                >
                  取消
                </button>
                <button
                  onClick={handleAddNote}
                  className="px-4 py-1.5 text-sm text-white bg-orange-500 rounded-lg disabled:opacity-50"
                  disabled={!noteInput.trim()}
                >
                  保存
                </button>
              </div>
            </div>
          )}

          {/* Notes List */}
          {wordNotes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">暂无笔记</p>
          ) : (
            <div className="space-y-3">
              {wordNotes.map(note => (
                <div key={note.id} className="bg-gray-50 rounded-xl p-4">
                  {editingNoteId === note.id ? (
                    <div>
                      <textarea
                        className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-700 resize-none outline-none focus:ring-2 focus:ring-orange-300"
                        rows={3}
                        value={editInput}
                        onChange={e => setEditInput(e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-4 py-1.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-lg"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleSaveEdit}
                          className="px-4 py-1.5 text-sm text-white bg-orange-500 rounded-lg disabled:opacity-50"
                          disabled={!editInput.trim()}
                        >
                          保存
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-700">{note.content}</p>
                      <div className="flex justify-end gap-3 mt-2">
                        <button
                          onClick={() => handleStartEdit(note.id, note.content)}
                          className="text-xs text-blue-500"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-xs text-red-500"
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordDetailPage;
