import React from 'react';
import { createPortal } from 'react-dom';
import { Question, QuizMode } from '../types/exam';
import { X, CheckCircle2, Bookmark, HelpCircle } from 'lucide-react';
import { isAnswerCorrect } from '../utils/answerHelper';

interface QuestionDrawerProps {
  questions: Question[];
  currentIndex: number;
  userAnswers: Record<string, string>;
  flagged: Record<string, boolean>;
  mode: QuizMode;
  isOpen: boolean;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
  onSubmit: () => void;
}

export const QuestionDrawer: React.FC<QuestionDrawerProps> = ({
  questions,
  currentIndex,
  userAnswers,
  flagged,
  mode,
  isOpen,
  onClose,
  onSelectIndex,
  onSubmit
}) => {
  if (!isOpen) return null;

  const total = questions.length;
  const answeredCount = Object.keys(userAnswers).filter(k => Boolean(userAnswers[k])).length;
  const flaggedCount = Object.keys(flagged).filter(k => flagged[k]).length;
  const unansweredCount = total - answeredCount;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              答題卡與題號導覽
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              點擊題號可直接跳轉至該題
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs text-center">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
            <span className="block text-lg font-bold">{answeredCount}</span>
            <span>已作答</span>
          </div>
          <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
            <span className="block text-lg font-bold">{unansweredCount}</span>
            <span>未作答</span>
          </div>
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium">
            <span className="block text-lg font-bold">{flaggedCount}</span>
            <span>已標記</span>
          </div>
        </div>

        {/* Question Grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-5 gap-2.5">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIndex;
              const ans = userAnswers[q.id];
              const isAnswered = Boolean(ans);
              const isFlag = Boolean(flagged[q.id]);

              // Status styles
              let btnStyle = 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100';

              if (mode === 'practice' && isAnswered) {
                const isCorrect = isAnswerCorrect(ans, q.answer);
                if (isCorrect) {
                  btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold';
                } else if (q.type !== 'multiple') {
                  btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold';
                } else {
                  btnStyle = 'border-purple-600 bg-purple-600 text-white font-bold shadow-sm';
                }
              } else if (isAnswered) {
                btnStyle = 'border-blue-600 bg-blue-600 text-white font-bold shadow-sm';
              }

              if (isCurrent) {
                btnStyle += ' ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-900';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    onSelectIndex(idx);
                    onClose();
                  }}
                  className={`relative h-11 rounded-xl border flex flex-col items-center justify-center text-xs transition transform active:scale-95 ${btnStyle}`}
                >
                  <span className="font-bold">{idx + 1}</span>
                  {isFlag && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <button
            onClick={() => {
              onClose();
              onSubmit();
            }}
            className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>交卷並查看成果報告</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
