import React, { useState, useMemo } from 'react';
import { Question, QuizMode } from '../types/exam';
import { 
  Bookmark, 
  Volume2, 
  CheckCircle, 
  XCircle, 
  ZoomIn, 
  BookOpen, 
  Check, 
  X as XIcon,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { playSpeech } from '../utils/toeicGenerator';
import { resolveAssetUrl } from '../utils/asset';
import { 
  isAnswerCorrect, 
  isOptionInAnswer, 
  formatDisplayAnswer, 
  normalizeAnswer, 
  deduplicateOptions 
} from '../utils/answerHelper';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  userAnswer: string;
  isFlagged: boolean;
  mode: QuizMode;
  onSelectAnswer: (answer: string, isConfirmed?: boolean) => void;
  onToggleFlag: () => void;
  onOpenImage: (src: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  userAnswer,
  isFlagged,
  mode,
  onSelectAnswer,
  onToggleFlag,
  onOpenImage
}) => {
  const isAnswered = Boolean(userAnswer);
  const isMultiple = question.type === 'multiple';
  const isTrueFalse = question.type === 'true_false';

  // For multiple choice in practice mode: temporary selection before confirm
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Check correctness using robust answer normalizer
  const isCorrect = isAnswered && isAnswerCorrect(userAnswer, question.answer);

  // Whether practice feedback (green/red & explanation) should be revealed
  const isRevealed = mode === 'practice' && isAnswered && (!isMultiple || showExplanation);

  // Safeguard against duplicate option keys in data
  const safeOptions = useMemo(() => deduplicateOptions(question.options), [question.options]);

  const handleOptionClick = (key: string) => {
    if (isMultiple) {
      if (showExplanation) return; // already submitted
      // Toggle key in userAnswer string
      const currentSelected = normalizeAnswer(userAnswer).split('');
      let updated: string[];
      if (currentSelected.includes(key)) {
        updated = currentSelected.filter(k => k !== key);
      } else {
        updated = [...currentSelected, key];
      }
      onSelectAnswer(normalizeAnswer(updated.join('')), false);
    } else {
      onSelectAnswer(key, true);
      if (mode === 'practice') {
        setShowExplanation(true);
      }
    }
  };

  // Type badge styling
  const typeBadgeMap: Record<string, string> = {
    single: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    multiple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
    true_false: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 animate-fade-in">
      
      {/* Top Question Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-black tracking-wider uppercase px-3 py-1 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
            Q {currentIndex + 1} / {totalQuestions}
          </span>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${typeBadgeMap[question.type] || 'bg-slate-100 text-slate-700'}`}>
            {question.typeLabel}
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl truncate max-w-xs sm:max-w-md">
            {question.sectionName}
          </span>
        </div>

        {/* Flag / Bookmark Button */}
        <button
          onClick={onToggleFlag}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
            isFlagged
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={isFlagged ? '已標記複習' : '標記此題稍後檢查'}
        >
          <Bookmark className={`w-4 h-4 ${isFlagged ? 'fill-amber-500 text-amber-500' : ''}`} />
          <span className="hidden sm:inline">{isFlagged ? '已標記' : '標記題目'}</span>
        </button>
      </div>

      {/* TOEIC Word Audio & Helper Bar (If applicable) */}
      {question.toeicData && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => playSpeech(question.toeicData?.word || '')}
              className="w-10 h-10 rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 transition transform active:scale-95"
              title="點擊聽美式真人發音"
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 dark:text-white">
                  {question.toeicData.word}
                </span>
                {question.toeicData.pos && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                    {question.toeicData.pos}
                  </span>
                )}
              </div>
              {question.toeicData.phonetic && (
                <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {question.toeicData.phonetic}
                </div>
              )}
            </div>
          </div>
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
            多益核心單字
          </span>
        </div>
      )}

      {/* Question Text */}
      <div className="mb-6">
        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap">
          {question.question}
        </h4>
      </div>

      {/* Question Images (if any) */}
      {question.images && question.images.length > 0 && (
        <div className="mb-6 space-y-3">
          {question.images.map((imgSrc, idx) => (
            <div 
              key={idx}
              onClick={() => onOpenImage(imgSrc)}
              className="relative inline-block group cursor-pointer border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-white"
            >
              <img 
                src={resolveAssetUrl(imgSrc)} 
                alt={`題目附圖 ${idx + 1}`} 
                className="max-h-72 object-contain p-2 rounded-xl"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 text-white text-xs font-semibold">
                <ZoomIn className="w-4 h-4" />
                <span>點擊放大檢視</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Options List */}
      {isTrueFalse ? (
        /* True / False Layout */
        <div className="grid grid-cols-2 gap-4 mb-6">
          {[
            { key: 'O', label: '正確 (True)', icon: Check, color: 'emerald' },
            { key: 'X', label: '錯誤 (False)', icon: XIcon, color: 'rose' }
          ].map((item) => {
            const isSelected = userAnswer === item.key;
            const isCorrectOption = isOptionInAnswer(item.key, question.answer);
            
            let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';
            
            if (isRevealed) {
              if (isCorrectOption) {
                btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/30';
              } else if (isSelected && !isCorrectOption) {
                btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 ring-2 ring-rose-500/30';
              }
            } else if (isSelected) {
              btnStyle = 'border-blue-600 bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 ring-2 ring-blue-500/30';
            }

            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleOptionClick(item.key)}
                className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 font-bold text-base transition transform active:scale-95 ${btnStyle}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  item.key === 'O' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                }`}>
                  <Icon className="w-6 h-6 stroke-[3]" />
                </div>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      ) : (
        /* Standard Single or Multiple Choice Options */
        <div className="space-y-3 mb-6">
          {safeOptions.map((opt) => {
            const isSelected = isMultiple
              ? isOptionInAnswer(opt.key, userAnswer)
              : userAnswer === opt.key;
            
            const isCorrectOption = isOptionInAnswer(opt.key, question.answer);

            let optStyle = 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200';
            let badgeStyle = 'border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';

            if (isRevealed) {
              if (isCorrectOption) {
                optStyle = 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 ring-1 ring-emerald-500/40';
                badgeStyle = 'border-emerald-500 bg-emerald-500 text-white';
              } else if (isSelected && !isCorrectOption) {
                optStyle = 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100 ring-1 ring-rose-500/40';
                badgeStyle = 'border-rose-500 bg-rose-500 text-white';
              }
            } else if (isSelected) {
              optStyle = isMultiple
                ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-900/40 text-purple-950 dark:text-purple-100 ring-2 ring-purple-500/30'
                : 'border-blue-600 bg-blue-50/70 dark:bg-blue-900/40 text-blue-950 dark:text-blue-100 ring-2 ring-blue-500/30';
              badgeStyle = isMultiple
                ? 'border-purple-600 bg-purple-600 text-white'
                : 'border-blue-600 bg-blue-600 text-white';
            }

            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleOptionClick(opt.key)}
                className={`w-full p-4 rounded-2xl border-2 text-left transition flex items-start gap-3.5 group ${optStyle}`}
              >
                {/* Option Letter Indicator */}
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border transition ${badgeStyle}`}>
                  {opt.key}
                </span>

                {/* Option Text & Image */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="text-sm sm:text-base font-medium leading-relaxed whitespace-pre-wrap">
                    {opt.text || <span className="italic text-slate-400">見附圖</span>}
                  </div>
                  {opt.image && (
                    <img 
                      src={resolveAssetUrl(opt.image)} 
                      alt={`選項 ${opt.key} 附圖`} 
                      className="mt-2 max-h-36 object-contain rounded-lg border border-slate-200" 
                    />
                  )}
                </div>

                {/* Status Icon in Practice Mode */}
                {isRevealed && (
                  <div className="shrink-0 pt-1">
                    {isCorrectOption ? (
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    ) : isSelected ? (
                      <XCircle className="w-5 h-5 text-rose-500" />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Multiple Choice Submit confirmation in Practice mode */}
      {isMultiple && mode === 'practice' && !showExplanation && isAnswered && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => {
              setShowExplanation(true);
              onSelectAnswer(userAnswer, true);
            }}
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20 flex items-center gap-1.5 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>送出多選答案並查看解析</span>
          </button>
        </div>
      )}

      {/* Practice Mode Explanation Box */}
      {isRevealed && (
        <div className={`p-5 rounded-2xl border animate-fade-in ${
          isCorrect 
            ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/60' 
            : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
        }`}>
          <div className="flex items-center gap-2 mb-2 font-bold text-sm">
            {isCorrect ? (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-900 dark:text-emerald-300">回答正確！太棒了！</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-600" />
                <span className="text-rose-900 dark:text-rose-300">回答錯誤，此題已自動記錄至錯題本</span>
              </>
            )}
          </div>

          <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 space-y-2">
            <div>
              <span className="font-semibold text-slate-900 dark:text-white">標準答案：</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-700 ml-1">
                {formatDisplayAnswer(question.answer)}
              </span>
              {userAnswer && !isCorrect && (
                <span className="ml-3 text-slate-500">
                  (您的作答：<span className="font-bold text-rose-600">{formatDisplayAnswer(userAnswer)}</span>)
                </span>
              )}
            </div>

            {/* Question Explanation */}
            {question.explanation && (
              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200">💡 題目詳解與說明：</span>
                <p className="mt-1 text-slate-600 dark:text-slate-300 leading-relaxed bg-white/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm">
                  {question.explanation}
                </p>
              </div>
            )}

            {/* TOEIC Word Notes / Collocations */}
            {question.toeicData && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">單字中文釋義：</span>
                  <span>{question.toeicData.meaning}</span>
                </div>
                {question.toeicData.sentence && (
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">權威例句：</span>
                    <p className="italic text-slate-600 dark:text-slate-300 mt-0.5">{question.toeicData.sentence}</p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">{question.toeicData.translation}</p>
                  </div>
                )}
                {question.toeicData.notes && (
                  <div className="pt-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">相關補充(同義/反義/衍生詞)：</span>
                    <pre className="mt-1 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 whitespace-pre-wrap font-sans">
                      {question.toeicData.notes}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
