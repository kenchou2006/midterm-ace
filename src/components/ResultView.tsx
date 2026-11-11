import React, { useState, useEffect } from 'react';
import { QuizSession, Question } from '../types/exam';
import { 
  Trophy, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  RotateCcw, 
  AlertTriangle, 
  Home, 
  BookOpen, 
  Filter,
  Bookmark,
  Volume2,
  ZoomIn
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSpeech } from '../utils/toeicGenerator';
import { resolveAssetUrl } from '../utils/asset';
import { ImageModal } from './ImageModal';

interface ResultViewProps {
  session: QuizSession;
  onRetakeSameConfig: () => void;
  onRetakeMistakes: (mistakeQuestions: Question[]) => void;
  onReturnHome: () => void;
  onGoToMistakeBank: () => void;
  bookmarks: Record<string, boolean>;
  onToggleBookmark: (questionId: string) => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  session,
  onRetakeSameConfig,
  onRetakeMistakes,
  onReturnHome,
  onGoToMistakeBank,
  bookmarks,
  onToggleBookmark
}) => {
  const [filterType, setFilterType] = useState<'all' | 'wrong' | 'correct'>('all');
  const [zoomImageSrc, setZoomImageSrc] = useState<string | null>(null);

  const total = session.questions.length;
  const correctCount = session.correctCount ?? 0;
  const wrongCount = session.wrongCount ?? 0;
  const score = session.score ?? Math.round((correctCount / total) * 100);
  const isPassed = session.isPassed ?? (score >= session.examMeta.passRate);

  // Trigger celebration confetti if passed
  useEffect(() => {
    if (isPassed) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore
      }
    }
  }, [isPassed]);

  // Mistakes in this session
  const mistakeQuestions = session.questions.filter(q => {
    const userAns = (session.userAnswers[q.id] || '').split('').sort().join('');
    const trueAns = q.answer.split('').sort().join('');
    return userAns !== trueAns;
  });

  // Filtered review list
  const filteredQuestions = session.questions.filter(q => {
    const userAns = (session.userAnswers[q.id] || '').split('').sort().join('');
    const trueAns = q.answer.split('').sort().join('');
    const isCorrect = userAns === trueAns;

    if (filterType === 'wrong') return !isCorrect;
    if (filterType === 'correct') return isCorrect;
    return true;
  });

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) return `${secs} 秒`;
    return `${mins} 分 ${secs} 秒`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Hero Result Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl border shadow-xl text-center mb-8 relative overflow-hidden ${
        isPassed 
          ? 'bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-300 dark:border-emerald-800' 
          : 'bg-gradient-to-b from-rose-500/10 via-rose-500/5 to-transparent border-rose-300 dark:border-rose-800'
      }`}>
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider mb-4 shadow-sm" style={{
          backgroundColor: isPassed ? '#10b981' : '#f43f5e',
          color: 'white'
        }}>
          {isPassed ? <Trophy className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          <span>{isPassed ? '測驗合格 (PASS)' : '未達合格標準 (FAIL)'}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-1">
          {session.examMeta.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
          及格門檻: {session.examMeta.passRate} 分 ‧ 作答時間: {formatDuration(session.timeSpentSeconds)}
        </p>

        {/* Big Score Display */}
        <div className="flex items-baseline justify-center gap-1 mb-8">
          <span className={`text-6xl sm:text-7xl font-black tracking-tight ${
            isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {score}
          </span>
          <span className="text-xl sm:text-2xl font-bold text-slate-400">/ 100 分</span>
        </div>

        {/* Stats 4-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto mb-8">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">答對題數</div>
            <div className="text-lg font-black text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>{correctCount} 題</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">答錯題數</div>
            <div className="text-lg font-black text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
              <XCircle className="w-4 h-4" />
              <span>{wrongCount} 題</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">正確率</div>
            <div className="text-lg font-black text-blue-600 dark:text-blue-400">
              {Math.round((correctCount / total) * 100)}%
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-xs text-slate-400 font-medium mb-1">平均用時</div>
            <div className="text-lg font-black text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{Math.round(session.timeSpentSeconds / total)} 秒/題</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {mistakeQuestions.length > 0 && (
            <button
              onClick={() => onRetakeMistakes(mistakeQuestions)}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 transition flex items-center gap-2 active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>重測本場錯題 ({mistakeQuestions.length})</span>
            </button>
          )}

          <button
            onClick={onRetakeSameConfig}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition flex items-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>再測一次</span>
          </button>

          <button
            onClick={onGoToMistakeBank}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" />
            <span>前往錯題本</span>
          </button>

          <button
            onClick={onReturnHome}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>回考試大廳</span>
          </button>
        </div>

      </div>

      {/* Review Section */}
      <div className="space-y-6">
        
        {/* Review Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              試卷詳細解析檢視
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              檢討題目、查看標準答案與相關考點補充
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
              }`}
            >
              全部 ({total})
            </button>
            <button
              onClick={() => setFilterType('wrong')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'wrong'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              僅看錯題 ({wrongCount})
            </button>
            <button
              onClick={() => setFilterType('correct')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filterType === 'correct'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              僅看對題 ({correctCount})
            </button>
          </div>
        </div>

        {/* Question Review Cards List */}
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const userAns = session.userAnswers[q.id] || '';
            const userAnsNorm = userAns.split('').sort().join('');
            const trueAnsNorm = q.answer.split('').sort().join('');
            const isCorrect = userAnsNorm === trueAnsNorm;
            const isBookmarked = Boolean(bookmarks[q.id]);

            return (
              <div 
                key={q.id}
                className={`p-6 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition ${
                  isCorrect 
                    ? 'border-slate-200 dark:border-slate-800' 
                    : 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20'
                }`}
              >
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${
                      isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                      第 {idx + 1} 題
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {q.typeLabel}
                    </span>
                    <span className="text-xs text-slate-400 hidden sm:inline">
                      {q.sectionName}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleBookmark(q.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 transition"
                    title={isBookmarked ? '取消收藏' : '加入收藏'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                  </button>
                </div>

                {/* TOEIC Word Audio Bar */}
                {q.toeicData && (
                  <div className="mb-3 flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => playSpeech(q.toeicData?.word || '')}
                      className="p-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition"
                      title="發音"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-sm text-slate-900 dark:text-white">{q.toeicData.word}</span>
                    <span className="text-xs font-mono text-slate-400">{q.toeicData.phonetic}</span>
                    <span className="text-xs font-mono text-rose-600 dark:text-rose-400 font-bold">[{q.toeicData.pos}]</span>
                  </div>
                )}

                {/* Question Stem */}
                <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white mb-4 whitespace-pre-wrap leading-relaxed">
                  {q.question}
                </p>

                {/* Question Images */}
                {q.images && q.images.length > 0 && (
                  <div className="mb-4 space-y-2">
                    {q.images.map((imgSrc, imgI) => (
                      <div 
                        key={imgI}
                        onClick={() => setZoomImageSrc(imgSrc)}
                        className="cursor-pointer inline-block border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:opacity-90 transition bg-white"
                      >
                        <img src={resolveAssetUrl(imgSrc)} alt="題目附圖" className="max-h-48 object-contain p-2" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Options List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                  {q.options.map((opt) => {
                    const isUserChoice = userAns.includes(opt.key);
                    const isTrueChoice = q.answer.includes(opt.key);

                    let boxStyle = 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300';
                    if (isTrueChoice) {
                      boxStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-bold';
                    } else if (isUserChoice && !isTrueChoice) {
                      boxStyle = 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 line-through';
                    }

                    return (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${boxStyle}`}
                      >
                        <span className="font-bold shrink-0">{opt.key}.</span>
                        <div className="flex-1">
                          <span>{opt.text || '(見圖)'}</span>
                          {opt.image && (
                            <img src={resolveAssetUrl(opt.image)} alt="選項圖" className="mt-1 max-h-24 object-contain" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Answer Summary Footnote */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-slate-500">正確答案：</span>
                      <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {q.answer}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">您的作答：</span>
                      <span className={`font-bold font-mono ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {userAns || '(未作答)'}
                      </span>
                    </div>
                  </div>

                  {q.toeicData && (
                    <div className="text-slate-600 dark:text-slate-300">
                      釋義：{q.toeicData.meaning}
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

      </div>

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
