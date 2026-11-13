import React, { useState } from 'react';
import { Question, ExamMeta } from '../types/exam';
import { Bookmark, Play, Volume2, Trash2, Layers, CheckCircle2 } from 'lucide-react';
import { playSpeech } from '../utils/toeicGenerator';
import { resolveAssetUrl } from '../utils/asset';
import { ImageModal } from './ImageModal';
import { isOptionInAnswer, formatDisplayAnswer, deduplicateOptions } from '../utils/answerHelper';

interface BookmarksViewProps {
  bookmarks: Record<string, boolean>;
  allQuestionsMap: Record<string, Question>;
  exams: ExamMeta[];
  onToggleBookmark: (questionId: string) => void;
  onStartBookmarkWorkout: (questions: Question[]) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  allQuestionsMap,
  exams,
  onToggleBookmark,
  onStartBookmarkWorkout
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [zoomImageSrc, setZoomImageSrc] = useState<string | null>(null);

  // List of bookmarked questions
  const bookmarkedQuestions = Object.keys(bookmarks)
    .filter(id => bookmarks[id] && allQuestionsMap[id])
    .map(id => allQuestionsMap[id]);

  const filtered = bookmarkedQuestions.filter(q => {
    if (selectedExamId !== 'all' && q.examId !== selectedExamId) return false;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center font-bold">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              收藏夾 / 重點題目
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            作答或檢討時標記的重點題，隨時集中複習特訓
          </p>
        </div>

        {filtered.length > 0 && (
          <button
            onClick={() => onStartBookmarkWorkout(filtered)}
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 transition flex items-center gap-2 active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>特訓已收藏題目 ({filtered.length} 題)</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setSelectedExamId('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            selectedExamId === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          全部收藏 ({bookmarkedQuestions.length})
        </button>

        {exams.map(e => {
          const count = bookmarkedQuestions.filter(q => q.examId === e.id).length;
          return (
            <button
              key={e.id}
              onClick={() => setSelectedExamId(e.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedExamId === e.id
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {e.title.split(' ')[0]} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            尚未收藏任何題目
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            在做題或檢討答案時，隨時點擊右上角的書籤星星按鈕即可將難題收錄於此。
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((q, idx) => {
            const exam = exams.find(e => e.id === q.examId);

            return (
              <div
                key={q.id}
                className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs px-2.5 py-1 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200">
                      #{idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {exam?.title.split(' ')[0]}
                    </span>
                    <span className="text-xs text-slate-400">
                      ‧ {q.sectionName}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleBookmark(q.id)}
                    className="p-1.5 rounded-lg text-amber-500 hover:text-slate-400 transition"
                    title="取消收藏"
                  >
                    <Bookmark className="w-4 h-4 fill-amber-500" />
                  </button>
                </div>

                {q.toeicData && (
                  <div className="mb-3 flex items-center gap-2 p-2 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                    <button
                      onClick={() => playSpeech(q.toeicData?.word || '')}
                      className="p-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{q.toeicData.word}</span>
                    <span className="text-xs font-mono text-slate-400">{q.toeicData.phonetic}</span>
                    <span className="text-xs font-bold text-rose-600">[{q.toeicData.pos}]</span>
                  </div>
                )}

                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3 whitespace-pre-wrap leading-relaxed">
                  {q.question}
                </h4>

                {q.images && q.images.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {q.images.map((imgSrc, imgI) => (
                      <div 
                        key={imgI}
                        onClick={() => setZoomImageSrc(imgSrc)}
                        className="cursor-pointer inline-block border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:opacity-90 transition bg-white"
                      >
                        <img src={resolveAssetUrl(imgSrc)} alt="收藏附圖" className="max-h-40 object-contain p-2" />
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {deduplicateOptions(q.options).map(opt => (
                    <div
                      key={opt.key}
                      className={`p-2 rounded-xl border text-xs flex flex-col gap-1 ${
                        isOptionInAnswer(opt.key, q.answer)
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{opt.key}.</span>
                        <span className="whitespace-pre-wrap">{opt.text || '(見圖)'}</span>
                      </div>
                      {opt.image && (
                        <img src={resolveAssetUrl(opt.image)} alt="選項圖" className="mt-1 max-h-20 object-contain rounded border border-slate-200 dark:border-slate-700 bg-white" />
                      )}
                    </div>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-400">標準答案：</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 ml-1">
                      {formatDisplayAnswer(q.answer)}
                    </span>
                  </div>
                  {q.toeicData && (
                    <div className="text-slate-600 dark:text-slate-300">
                      {q.toeicData.meaning}
                    </div>
                  )}

                  {q.explanation && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <span className="font-bold text-slate-900 dark:text-white">💡 詳解：</span>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {zoomImageSrc && (
        <ImageModal
          src={zoomImageSrc}
          onClose={() => setZoomImageSrc(null)}
        />
      )}

    </div>
  );
};
