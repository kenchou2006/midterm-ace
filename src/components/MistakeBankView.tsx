import React, { useState } from 'react';
import { MistakeItem, ExamMeta, Question } from '../types/exam';
import { 
  AlertTriangle, 
  Trash2, 
  Play, 
  CheckCircle2, 
  Search, 
  Filter, 
  Layers, 
  Volume2,
  ZoomIn,
  BookOpen
} from 'lucide-react';
import { playSpeech } from '../utils/toeicGenerator';
import { resolveAssetUrl } from '../utils/asset';
import { ImageModal } from './ImageModal';

interface MistakeBankViewProps {
  mistakes: Record<string, MistakeItem>;
  exams: ExamMeta[];
  onRemoveMistake: (questionId: string) => void;
  onClearMistakes: (examId?: string) => void;
  onStartMistakeWorkout: (questions: Question[]) => void;
}

export const MistakeBankView: React.FC<MistakeBankViewProps> = ({
  mistakes,
  exams,
  onRemoveMistake,
  onClearMistakes,
  onStartMistakeWorkout
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minErrorCount, setMinErrorCount] = useState<number>(1);
  const [zoomImageSrc, setZoomImageSrc] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const mistakeList = Object.values(mistakes);

  // Filtered list
  const filteredMistakes = mistakeList.filter(item => {
    if (selectedExamId !== 'all' && item.examId !== selectedExamId) return false;
    if (item.errorCount < minErrorCount) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const stem = item.question.question.toLowerCase();
      const sec = (item.question.sectionName || '').toLowerCase();
      const toeicWord = (item.question.toeicData?.word || '').toLowerCase();
      const toeicMeaning = (item.question.toeicData?.meaning || '').toLowerCase();
      return stem.includes(q) || sec.includes(q) || toeicWord.includes(q) || toeicMeaning.includes(q);
    }
    return true;
  });

  // Start workout with all filtered questions
  const handleStartWorkout = () => {
    if (filteredMistakes.length === 0) return;
    const questions = filteredMistakes.map(m => m.question);
    onStartMistakeWorkout(questions);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              本地錯題特訓本
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            自動記錄各科測驗答錯之題目，提供高強度「錯題消滅」專題訓練
          </p>
        </div>

        <div className="flex items-center gap-2">
          {filteredMistakes.length > 0 && (
            <button
              onClick={handleStartWorkout}
              className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 transition flex items-center gap-2 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>特訓此清單 ({filteredMistakes.length} 題)</span>
            </button>
          )}

          {mistakeList.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="清空錯題本"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-6 shadow-sm space-y-4">
        
        {/* Exam category pills */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedExamId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              selectedExamId === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            全部考科 ({mistakeList.length})
          </button>

          {exams.map(e => {
            const count = mistakeList.filter(m => m.examId === e.id).length;
            return (
              <button
                key={e.id}
                onClick={() => setSelectedExamId(e.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedExamId === e.id
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {e.title.split(' ')[0]} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Minimum Error count filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜尋題目關鍵字、考點、英文單字..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 whitespace-nowrap">錯誤次數篩選:</span>
            {[1, 2, 3].map(cnt => (
              <button
                key={cnt}
                onClick={() => setMinErrorCount(cnt)}
                className={`px-2.5 py-1.5 rounded-lg font-bold border transition ${
                  minErrorCount === cnt
                    ? 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50'
                }`}
              >
                ≥ {cnt} 次
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Mistake Items List */}
      {filteredMistakes.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {mistakeList.length === 0 ? '太棒了！目前沒有任何錯題' : '沒有符合條件的錯題'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {mistakeList.length === 0 
              ? '您在進行測驗或刷題時，所有做錯的題目都會自動收錄在此處方便複習。' 
              : '請嘗試放寬搜尋條件或清除篩選器。'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMistakes.map((item) => {
            const q = item.question;
            const exam = exams.find(e => e.id === item.examId);

            return (
              <div
                key={item.questionId}
                className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow transition"
              >
                {/* Header row */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>累計出錯 {item.errorCount} 次</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {exam?.title.split(' ')[0]}
                    </span>
                    <span className="text-xs text-slate-400">
                      ‧ {q.sectionName}
                    </span>
                  </div>

                  {/* 消滅錯題按鈕 */}
                  <button
                    onClick={() => onRemoveMistake(item.questionId)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 transition"
                    title="我已學會，從錯題本中移除此題"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>消滅此錯題</span>
                  </button>
                </div>

                {/* TOEIC Word Audio Bar */}
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

                {/* Question Stem */}
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3 whitespace-pre-wrap leading-relaxed">
                  {q.question}
                </h4>

                {/* Images */}
                {q.images && q.images.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {q.images.map((imgSrc, imgI) => (
                      <div 
                        key={imgI}
                        onClick={() => setZoomImageSrc(imgSrc)}
                        className="cursor-pointer inline-block border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:opacity-90 transition bg-white"
                      >
                        <img src={resolveAssetUrl(imgSrc)} alt="錯題附圖" className="max-h-40 object-contain p-2" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {q.options.map(opt => {
                    const isCorrectOpt = q.answer.includes(opt.key);
                    const wasUserAns = item.lastUserAnswer.includes(opt.key);

                    let style = 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300';
                    if (isCorrectOpt) {
                      style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-bold';
                    } else if (wasUserAns) {
                      style = 'border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 line-through';
                    }

                    return (
                      <div key={opt.key} className={`p-2 rounded-xl border text-xs flex items-center gap-2 ${style}`}>
                        <span className="font-bold">{opt.key}.</span>
                        <span className="truncate">{opt.text || '(見圖)'}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Answer footnote */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500">標準正確答案：</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      {q.answer}
                    </span>
                    <span className="text-slate-400">|</span>
                    <span className="text-slate-500">上次作答：</span>
                    <span className="font-bold font-mono text-rose-600">
                      {item.lastUserAnswer || '(未作答)'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    最後出錯: {new Date(item.lastWrongAt).toLocaleDateString()}
                  </span>
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

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              確定要清空錯題本嗎？
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              此動作將清除您累積的 {mistakeList.length} 筆錯題紀錄，建議先進行備份或特訓。
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowClearConfirm(false);
                  onClearMistakes();
                }}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
              >
                確定清空
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
