import React, { useState, useMemo } from 'react';
import { ExamMeta, QuizConfig, QuizMode, ToeicQuizType } from '../types/exam';
import { 
  X, 
  Settings2, 
  HelpCircle, 
  Clock, 
  Shuffle, 
  Sparkles, 
  Flame, 
  Play, 
  Layers,
  Volume2
} from 'lucide-react';

interface ConfigModalProps {
  exam: ExamMeta;
  allExams: ExamMeta[];
  onSelectExam: (exam: ExamMeta) => void;
  defaultMode?: QuizMode;
  mistakeCount: number;
  onClose: () => void;
  onStartQuiz: (config: QuizConfig) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  exam,
  allExams,
  onSelectExam,
  defaultMode = 'exam',
  mistakeCount,
  onClose,
  onStartQuiz
}) => {
  // Mode
  const [mode, setMode] = useState<QuizMode>(defaultMode);

  // Selected sections
  const [selectedSections, setSelectedSections] = useState<(string | number)[]>(
    exam.sections.map(s => s.id)
  );

  // TOEIC quiz type
  const [toeicType, setToeicType] = useState<ToeicQuizType>('mixed');

  // Question count
  const [questionCount, setQuestionCount] = useState<number>(20);
  const [isCustomCount, setIsCustomCount] = useState<boolean>(false);

  // Time limit (minutes)
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(
    mode === 'exam' ? exam.defaultTimeMinutes : 0
  );

  // Shuffling
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);
  const [shuffleOptions, setShuffleOptions] = useState<boolean>(false);

  // Calculate total questions in selected sections
  const availableInScope = useMemo(() => {
    if (mode === 'mistake_workout') {
      return mistakeCount;
    }
    const matchingSections = exam.sections.filter(s => selectedSections.includes(s.id));
    return matchingSections.reduce((acc, curr) => acc + curr.count, 0);
  }, [exam, selectedSections, mode, mistakeCount]);

  // Handle section toggle
  const toggleSection = (id: string | number) => {
    if (selectedSections.includes(id)) {
      if (selectedSections.length > 1) {
        setSelectedSections(selectedSections.filter(s => s !== id));
      }
    } else {
      setSelectedSections([...selectedSections, id]);
    }
  };

  const selectAllSections = () => {
    setSelectedSections(exam.sections.map(s => s.id));
  };

  const handleStart = () => {
    const finalCount = Math.min(questionCount, availableInScope);
    onStartQuiz({
      examId: exam.id,
      mode,
      questionCount: finalCount > 0 ? finalCount : 1,
      selectedSections,
      toeicType: exam.id === 'toeic' ? toeicType : undefined,
      timeLimitMinutes: mode === 'exam' ? timeLimitMinutes : 0,
      shuffleQuestions,
      shuffleOptions
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                測驗設定與範圍選擇
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                客製化您的模擬考試或刷題練習
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">

          {/* 1. Exam Selector Switcher */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              選擇考試類別
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {allExams.map((e) => (
                <button
                  key={e.id}
                  onClick={() => {
                    onSelectExam(e);
                    setSelectedSections(e.sections.map(s => s.id));
                  }}
                  className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                    exam.id === e.id
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="text-[11px] font-bold truncate">{e.badge}</span>
                  <span className="text-xs font-semibold truncate mt-1">{e.title.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Mode Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              測驗模式
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode('exam');
                  if (timeLimitMinutes === 0) setTimeLimitMinutes(exam.defaultTimeMinutes);
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  mode === 'exam'
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    模擬考試
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-200/60 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                    計時交卷
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  模擬正式考試環境，可設倒數計時，交卷後統一出成績與解析。
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('practice');
                  setTimeLimitMinutes(0);
                }}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  mode === 'practice'
                    ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-amber-500" />
                    刷題練習
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/60 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                    即時反饋
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  作答後立刻揭曉正誤與詳解，不限時間，邊做邊學效率最高。
                </p>
              </button>

              <button
                type="button"
                disabled={mistakeCount === 0}
                onClick={() => setMode('mistake_workout')}
                className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                  mistakeCount === 0
                    ? 'opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800'
                    : mode === 'mistake_workout'
                    ? 'border-rose-600 bg-rose-50/70 dark:bg-rose-900/40 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-rose-500" />
                    錯題特訓
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                    {mistakeCount} 題
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                  專門攻克本科目累積的錯題本，答對即可消滅錯題！
                </p>
              </button>
            </div>
          </div>

          {/* 3. Scope & Section Selection (Not needed in mistake_workout) */}
          {mode !== 'mistake_workout' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  測驗範圍 / 章節單元 ({selectedSections.length} / {exam.sections.length} 個範圍已選)
                </label>
                <button
                  type="button"
                  onClick={selectAllSections}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  全部勾選
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 dark:border-slate-800 rounded-2xl">
                {exam.sections.map((sec) => {
                  const isChecked = selectedSections.includes(sec.id);
                  return (
                    <label
                      key={sec.id}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer text-xs transition ${
                        isChecked 
                          ? 'border-blue-400/80 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 font-medium' 
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate mr-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSection(sec.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                        />
                        <span className="truncate">{sec.name}</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 shrink-0">
                        {sec.count} 題
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* 4. TOEIC specific test type */}
          {exam.id === 'toeic' && mode !== 'mistake_workout' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                單字題型出題方式
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'mixed', label: '綜合隨機', desc: '英選中+中選英+克漏字' },
                  { id: 'en_to_zh', label: '英選中', desc: '看單字選中文釋義' },
                  { id: 'zh_to_en', label: '中選英', desc: '看中文選正確單字' },
                  { id: 'cloze', label: '例句克漏字', desc: '商務語境填空' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setToeicType(item.id as ToeicQuizType)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      toeicType === item.id
                        ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="text-xs font-bold flex items-center gap-1">
                      <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Question Count Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                測驗題數 (範圍內可用: {availableInScope} 題)
              </label>
              {isCustomCount && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                  自訂題數模式
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 mb-2">
              {[10, 20, 30, 50].map((num) => (
                <button
                  key={num}
                  type="button"
                  disabled={availableInScope < num}
                  onClick={() => {
                    setQuestionCount(num);
                    setIsCustomCount(false);
                  }}
                  className={`py-2 px-3.5 rounded-xl text-xs font-bold border transition ${
                    !isCustomCount && questionCount === num
                      ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                      : availableInScope < num
                      ? 'opacity-40 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed'
                      : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {num} 題
                </button>
              ))}

              <button
                type="button"
                onClick={() => {
                  setQuestionCount(availableInScope);
                  setIsCustomCount(false);
                }}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold border transition ${
                  !isCustomCount && questionCount === availableInScope
                    ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                全部 ({availableInScope} 題)
              </button>

              <button
                type="button"
                onClick={() => setIsCustomCount(true)}
                className={`py-2 px-3.5 rounded-xl text-xs font-bold border transition ${
                  isCustomCount
                    ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                自訂
              </button>
            </div>

            {isCustomCount && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min={1}
                  max={availableInScope}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Math.max(1, Math.min(availableInScope, Number(e.target.value) || 1)))}
                  className="w-32 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold"
                />
                <span className="text-xs text-slate-500">
                  題 (請輸入 1 ~ {availableInScope})
                </span>
              </div>
            )}
          </div>

          {/* 6. Time Limit & Shuffling Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Time limit */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                時間限制
              </label>
              {mode === 'exam' ? (
                <div className="flex items-center gap-2">
                  <select
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-xs font-medium"
                  >
                    <option value={15}>15 分鐘 (極速衝刺)</option>
                    <option value={30}>30 分鐘 (標準短測)</option>
                    <option value={50}>50 分鐘 (標準認證考時)</option>
                    <option value={60}>60 分鐘 (完整模擬)</option>
                    <option value={90}>90 分鐘 (充足練習)</option>
                    <option value={0}>不限時間 (自由正數計時)</option>
                  </select>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">
                  刷題模式預設不限時間，輕鬆學習無壓力。
                </p>
              )}
            </div>

            {/* Shuffling switches */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Shuffle className="w-3.5 h-3.5" />
                隨機化設定
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>題目亂序抽題 (防止死背題號順序)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span>選項隨機亂序 (防止死記 ABCD 選項位置)</span>
              </label>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 z-10 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur-md px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            即將測驗 <strong className="text-slate-900 dark:text-white">{Math.min(questionCount, availableInScope)}</strong> 題 
            {mode === 'exam' && timeLimitMinutes > 0 ? ` ‧ 限時 ${timeLimitMinutes} 分鐘` : ''}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl font-medium text-xs text-slate-600 hover:text-slate-800 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition"
            >
              取消
            </button>
            <button
              type="button"
              disabled={availableInScope === 0}
              onClick={handleStart}
              className="px-6 py-2.5 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition flex items-center gap-1.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>進入測驗</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
