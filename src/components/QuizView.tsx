import React, { useState, useEffect } from 'react';
import { QuizSession } from '../types/exam';
import { QuestionCard } from './QuestionCard';
import { QuestionDrawer } from './QuestionDrawer';
import { ImageModal } from './ImageModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  LayoutGrid, 
  ArrowLeft,
  AlertTriangle
} from 'lucide-react';

interface QuizViewProps {
  session: QuizSession;
  onUpdateAnswer: (questionId: string, answer: string, isConfirmed?: boolean) => void;
  onToggleFlag: (questionId: string) => void;
  onSubmitQuiz: () => void;
  onExitQuiz: (shouldSave: boolean) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({
  session,
  onUpdateAnswer,
  onToggleFlag,
  onSubmitQuiz,
  onExitQuiz
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [zoomImageSrc, setZoomImageSrc] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState<boolean>(false);

  // Timer logic
  const [secondsRemaining, setSecondsRemaining] = useState<number>(() => {
    if (session.config.timeLimitMinutes > 0) {
      const totalSec = session.config.timeLimitMinutes * 60;
      return Math.max(0, totalSec - session.timeSpentSeconds);
    }
    return session.timeSpentSeconds; // Elapsed stopwatch
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (session.config.timeLimitMinutes > 0) {
          if (prev <= 1) {
            clearInterval(timer);
            onSubmitQuiz();
            return 0;
          }
          return prev - 1;
        } else {
          return prev + 1; // stopwatch
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session.config.timeLimitMinutes, onSubmitQuiz]);

  const questions = session.questions;
  const currentQuestion = questions[currentIndex];
  const total = questions.length;
  const answeredCount = Object.keys(session.userAnswers).filter(k => Boolean(session.userAnswers[k])).length;
  const unansweredCount = total - answeredCount;

  // Format timer
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isCountDown = session.config.timeLimitMinutes > 0;
  const isTimeRunningLow = isCountDown && secondsRemaining < 300; // under 5 min

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      
      {/* Top Fixed Quiz Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-3">
            
            {/* Left: Exit & Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowExitConfirm(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="暫停並返回大廳"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-[180px] sm:max-w-xs">
                  {session.examMeta.title}
                </h1>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {session.config.mode === 'exam' ? '模擬考試' : session.config.mode === 'practice' ? '刷題練習' : '錯題特訓'}
                  </span>
                  <span>‧</span>
                  <span>進度 {answeredCount} / {total}</span>
                </div>
              </div>
            </div>

            {/* Right: Timer & Drawer Toggle & Submit */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Timer badge */}
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border transition ${
                isTimeRunningLow
                  ? 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
              }`}>
                <Clock className="w-4 h-4 text-slate-400" />
                <span>{formatTime(secondsRemaining)}</span>
              </div>

              {/* Answer Sheet Drawer Toggle */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 transition"
              >
                <LayoutGrid className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">答題卡</span>
                <span className="text-xs font-semibold px-1.5 py-0.2 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {answeredCount}/{total}
                </span>
              </button>

              {/* Submit Quiz Button */}
              <button
                onClick={() => setShowSubmitConfirm(true)}
                className="px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition active:scale-95"
              >
                交卷
              </button>
            </div>

          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1">
          <div 
            className="bg-blue-600 h-1 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      </header>

      {/* Main Question Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentQuestion && (
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={total}
            userAnswer={session.userAnswers[currentQuestion.id] || ''}
            isFlagged={Boolean(session.flagged[currentQuestion.id])}
            mode={session.config.mode}
            onSelectAnswer={(ans, isConfirmed) => onUpdateAnswer(currentQuestion.id, ans, isConfirmed)}
            onToggleFlag={() => onToggleFlag(currentQuestion.id)}
            onOpenImage={(src) => setZoomImageSrc(src)}
          />
        )}
      </main>

      {/* Bottom Sticky Navigation */}
      <footer className="sticky bottom-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>上一題</span>
          </button>

          {/* Center question tracker */}
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {currentIndex + 1} / {total}
          </div>

          {currentIndex === total - 1 ? (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>完成交卷</span>
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(total - 1, prev + 1))}
              className="flex items-center gap-1 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition active:scale-95"
            >
              <span>下一題</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

        </div>
      </footer>

      {/* Question Drawer */}
      <QuestionDrawer
        questions={questions}
        currentIndex={currentIndex}
        userAnswers={session.userAnswers}
        flagged={session.flagged}
        mode={session.config.mode}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSelectIndex={(idx) => setCurrentIndex(idx)}
        onSubmit={() => setShowSubmitConfirm(true)}
      />

      {/* Image Modal Lightbox */}
      {zoomImageSrc && (
        <ImageModal
          src={zoomImageSrc}
          onClose={() => setZoomImageSrc(null)}
        />
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              暫停或結束測驗？
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              您可以選擇暫存進度回大廳，或直接放棄結束本場測驗。
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExitQuiz(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition active:scale-95"
              >
                暫停存檔並回大廳 (隨時可繼續)
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  繼續作答
                </button>
                <button
                  onClick={() => {
                    setShowExitConfirm(false);
                    onExitQuiz(false);
                  }}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 transition"
                >
                  放棄並捨棄此場
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              確認交卷結算成績？
            </h3>
            
            {unansweredCount > 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 mb-5 text-left text-xs text-amber-800 dark:text-amber-300">
                <span className="font-bold">提醒：</span> 您尚有 <strong className="text-rose-600 dark:text-rose-400">{unansweredCount}</strong> 題尚未作答，未作答題目將視為錯誤。
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                全數 {total} 題皆已作答完畢！交卷後將產生成績單與完整試題解析。
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                返回檢查
              </button>
              <button
                onClick={() => {
                  setShowSubmitConfirm(false);
                  onSubmitQuiz();
                }}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
              >
                確定交卷
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
