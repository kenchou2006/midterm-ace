import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  ExamMeta, 
  Question, 
  QuizConfig, 
  QuizSession, 
  MistakeItem, 
  CorrectItem, 
  HistoryItem,
  QuizMode
} from './types/exam';
import { Navbar, ActiveTab } from './components/Navbar';
import { ExamCard } from './components/ExamCard';
import { ConfigModal } from './components/ConfigModal';
import { QuizView } from './components/QuizView';
import { ResultView } from './components/ResultView';
import { MistakeBankView } from './components/MistakeBankView';
import { HistoryView } from './components/HistoryView';
import { BookmarksView } from './components/BookmarksView';
import { StatsView } from './components/StatsView';
import { StudyBrowseView } from './components/StudyBrowseView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ImageModal } from './components/ImageModal';
import { UpdateNotification } from './components/UpdateNotification';
import { 
  getMistakes, 
  recordMistake, 
  removeMistake, 
  clearMistakes,
  getCorrects,
  recordCorrect,
  getHistory,
  saveHistory,
  clearHistory,
  getBookmarks,
  toggleBookmark,
  getActiveSession,
  saveActiveSession,
  clearActiveSession
} from './utils/storage';
import { generateToeicQuestions, RawToeicWord } from './utils/toeicGenerator';
import { resolveAssetUrl } from './utils/asset';
import { useScrollHeader } from './utils/useScrollHeader';
import { useAppUpdate } from './utils/useAppUpdate';
import { 
  normalizeAnswer, 
  isAnswerCorrect, 
  isOptionInAnswer, 
  deduplicateOptions 
} from './utils/answerHelper';
import { Sparkles, GraduationCap, Flame, ArrowRight } from 'lucide-react';

function shuffle<T>(arr: T[]): T[] {
  const res = [...arr];
  for (let i = res.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [res[i], res[j]] = [res[j], res[i]];
  }
  return res;
}

export function App() {
  // Auto-collapsing header on downward scroll
  const isHeaderVisible = useScrollHeader(10, 60);

  // Navigation
  const [activeTab, setActiveTab] = useState<ActiveTab>('exams');

  // Loaded Data
  const [exams, setExams] = useState<ExamMeta[]>([]);
  const [rawQuestions, setRawQuestions] = useState<Record<string, Question[]>>({});
  const [rawToeicWords, setRawToeicWords] = useState<RawToeicWord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Local Storage state
  const [mistakes, setMistakes] = useState<Record<string, MistakeItem>>({});
  const [corrects, setCorrects] = useState<Record<string, CorrectItem>>({});
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({});

  // Active Session
  const [activeSession, setActiveSession] = useState<QuizSession | null>(null);
  const [pendingSession, setPendingSession] = useState<QuizSession | null>(null);

  // Auto Version Checker & PWA Updater
  const appUpdate = useAppUpdate(Boolean(activeSession && !activeSession.isSubmitted));

  // Config Modal State
  const [configModalExam, setConfigModalExam] = useState<ExamMeta | null>(null);
  const [configDefaultMode, setConfigDefaultMode] = useState<QuizMode>('exam');

  // Study Browse State
  const [browseExamId, setBrowseExamId] = useState<string>('dbms');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Refresh LocalStorage data in state
  const reloadStorageData = useCallback(() => {
    setMistakes(getMistakes());
    setCorrects(getCorrects());
    setHistory(getHistory());
    setBookmarks(getBookmarks());
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    async function loadData() {
      try {
        reloadStorageData();

        // Check if there was an in-progress session (keep as pending, do not auto-force redirect)
        const existingSession = getActiveSession();
        if (existingSession && !existingSession.isSubmitted) {
          setPendingSession(existingSession);
        }

        const metaRes: ExamMeta[] = await fetch(resolveAssetUrl('data/exams_meta.json')).then(r => r.json());
        setExams(metaRes);

        const questionEntries = await Promise.all(
          metaRes.map(async (exam) => {
            try {
              const res = await fetch(resolveAssetUrl(`data/${exam.id}.json`)).then(r => r.json());
              return [exam.id, res] as const;
            } catch (err) {
              console.error(`Failed to load data/${exam.id}.json`, err);
              return [exam.id, []] as const;
            }
          })
        );
        const questionsMap: Record<string, Question[]> = Object.fromEntries(questionEntries);

        setRawQuestions(questionsMap);
        if (questionsMap.toeic) {
          setRawToeicWords(
            questionsMap.toeic
              .map((q: Question) => q.toeicData as RawToeicWord)
              .filter(Boolean)
          );
        }
      } catch (err) {
        console.error('Failed to load question banks', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [reloadStorageData]);

  // Combined Map of all questions for easy lookup in Bookmarks
  const allQuestionsMap = useMemo(() => {
    const map: Record<string, Question> = {};
    Object.values(rawQuestions).forEach(list => {
      list.forEach(q => { map[q.id] = q; });
    });
    return map;
  }, [rawQuestions]);

  const totalQuestionsCount = useMemo(() => {
    return exams.reduce((sum, e) => sum + e.totalQuestions, 0);
  }, [exams]);

  // Start Quiz Handler
  const handleStartQuiz = useCallback((config: QuizConfig) => {
    const examMeta = exams.find(e => e.id === config.examId);
    if (!examMeta) return;

    let pool: Question[] = [];

    if (config.mode === 'mistake_workout') {
      // Pick from mistake bank for this exam
      const examMistakes = Object.values(mistakes).filter(m => m.examId === config.examId);
      pool = examMistakes.map(m => m.question);
    } else if (config.examId === 'toeic' && (config.toeicType === 'zh_to_en' || config.toeicType === 'cloze')) {
      // Generate dynamically only if user explicitly selected non-standard variant (中選英 or 克漏字)
      const selectedCats = new Set(config.selectedSections);
      const filteredWords = rawToeicWords.filter(w => selectedCats.has(w.category));
      pool = generateToeicQuestions(filteredWords, config.toeicType);
    } else {
      // Pre-compiled static questions
      const questions = rawQuestions[config.examId] || [];
      const selectedSecs = new Set(config.selectedSections);
      pool = questions.filter(q => selectedSecs.has(q.section));
    }

    // Shuffle questions if requested
    let finalQuestions = config.shuffleQuestions ? shuffle(pool) : [...pool];

    // Slice to requested count
    finalQuestions = finalQuestions.slice(0, config.questionCount);

    // Shuffle options if requested (only for single/multiple choice, keep O/X order)
    if (config.shuffleOptions) {
      finalQuestions = finalQuestions.map(q => {
        if (q.type === 'true_false' || q.options.length <= 1) return q;
        const cleanOpts = deduplicateOptions(q.options);
        const shuffledOpts = shuffle(cleanOpts);
        // Map new keys A, B, C, D
        const keys = ['A', 'B', 'C', 'D', 'E', 'F'];
        let updatedAnswer = '';
        const mappedOptions = shuffledOpts.map((opt, i) => {
          const newKey = keys[i] || opt.key;
          if (isOptionInAnswer(opt.key, q.answer)) {
            updatedAnswer += newKey;
          }
          return {
            ...opt,
            key: newKey
          };
        });
        return {
          ...q,
          options: mappedOptions,
          answer: normalizeAnswer(updatedAnswer)
        };
      });
    }

    const newSession: QuizSession = {
      id: `session_${Date.now()}`,
      config,
      examMeta,
      questions: finalQuestions,
      userAnswers: {},
      flagged: {},
      startTime: Date.now(),
      timeSpentSeconds: 0,
      isSubmitted: false
    };

    setActiveSession(newSession);
    setPendingSession(newSession);
    saveActiveSession(newSession);
    setConfigModalExam(null);
  }, [exams, mistakes, rawToeicWords, rawQuestions]);

  // Update Answer during active test
  const handleUpdateAnswer = useCallback((questionId: string, answer: string, isConfirmed: boolean = false) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const updated = {
        ...prev,
        userAnswers: {
          ...prev.userAnswers,
          [questionId]: answer
        }
      };
      saveActiveSession(updated);

      // In practice mode, record immediately to correct/mistake bank only when confirmed or single/tf choice
      if (prev.config.mode === 'practice' || prev.config.mode === 'mistake_workout') {
        const q = prev.questions.find(item => item.id === questionId);
        if (q && answer) {
          const isMulti = q.type === 'multiple';
          if (!isMulti || isConfirmed) {
            const isCorrect = isAnswerCorrect(answer, q.answer);
            if (isCorrect) {
              recordCorrect(q.examId, q.id);
              // In mistake workout, remove from mistake bank if answered correctly!
              if (prev.config.mode === 'mistake_workout') {
                removeMistake(q.id);
              }
            } else {
              recordMistake(q.examId, q, answer);
            }
            setMistakes(getMistakes());
            setCorrects(getCorrects());
          }
        }
      }

      return updated;
    });
  }, []);

  // Toggle Flag
  const handleToggleFlag = useCallback((questionId: string) => {
    setActiveSession(prev => {
      if (!prev) return null;
      const nextFlag = !prev.flagged[questionId];
      const updated = {
        ...prev,
        flagged: {
          ...prev.flagged,
          [questionId]: nextFlag
        }
      };
      saveActiveSession(updated);
      return updated;
    });
  }, []);

  // Submit Quiz
  const handleSubmitQuiz = useCallback(() => {
    if (!activeSession) return;

    const total = activeSession.questions.length;
    let correctCount = 0;
    let wrongCount = 0;

    activeSession.questions.forEach(q => {
      const isCorrect = isAnswerCorrect(activeSession.userAnswers[q.id], q.answer);
      if (isCorrect) {
        correctCount++;
        recordCorrect(q.examId, q.id);
        // If in mistake workout mode, answer correct removes it from mistake bank
        if (activeSession.config.mode === 'mistake_workout') {
          removeMistake(q.id);
        }
      } else {
        wrongCount++;
        recordMistake(q.examId, q, activeSession.userAnswers[q.id] || '');
      }
    });

    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const isPassed = score >= activeSession.examMeta.passRate;
    const timeSpentSeconds = Math.round((Date.now() - activeSession.startTime) / 1000);

    const completedSession: QuizSession = {
      ...activeSession,
      isSubmitted: true,
      endTime: Date.now(),
      timeSpentSeconds,
      score,
      correctCount,
      wrongCount,
      isPassed
    };

    // Save to History
    saveHistory({
      id: completedSession.id,
      examId: completedSession.examMeta.id,
      examTitle: completedSession.examMeta.title,
      mode: completedSession.config.mode,
      date: new Date().toISOString(),
      score,
      totalQuestions: total,
      correctCount,
      wrongCount,
      timeSpentSeconds,
      isPassed,
      questions: completedSession.questions,
      userAnswers: completedSession.userAnswers
    });

    clearActiveSession();
    setPendingSession(null);
    setActiveSession(completedSession);
    reloadStorageData();
  }, [activeSession, reloadStorageData]);

  // Exit Quiz Handler
  const handleExitQuiz = useCallback((shouldSave: boolean) => {
    if (shouldSave && activeSession) {
      saveActiveSession(activeSession);
      setPendingSession(activeSession);
    } else {
      clearActiveSession();
      setPendingSession(null);
    }
    setActiveSession(null);
  }, [activeSession]);

  // Retake with same configuration
  const handleRetakeSame = useCallback(() => {
    if (!activeSession) return;
    handleStartQuiz(activeSession.config);
  }, [activeSession, handleStartQuiz]);

  // Retake mistakes only
  const handleRetakeMistakes = useCallback((mistakeQuestions: Question[]) => {
    if (!activeSession) return;
    const newSession: QuizSession = {
      id: `session_${Date.now()}`,
      config: {
        ...activeSession.config,
        mode: 'practice', // Practice mode for mistake workout
        questionCount: mistakeQuestions.length
      },
      examMeta: activeSession.examMeta,
      questions: mistakeQuestions,
      userAnswers: {},
      flagged: {},
      startTime: Date.now(),
      timeSpentSeconds: 0,
      isSubmitted: false
    };
    setActiveSession(newSession);
    setPendingSession(newSession);
    saveActiveSession(newSession);
  }, [activeSession]);

  // Start workout from Mistake Bank or Bookmarks directly
  const handleStartCustomWorkout = useCallback((questions: Question[], title: string = '專項特訓') => {
    if (questions.length === 0) return;
    const firstExamId = questions[0].examId;
    const examMeta = exams.find(e => e.id === firstExamId) || exams[0];

    const newSession: QuizSession = {
      id: `session_${Date.now()}`,
      config: {
        examId: examMeta.id,
        mode: 'practice',
        questionCount: questions.length,
        selectedSections: [],
        timeLimitMinutes: 0,
        shuffleQuestions: false,
        shuffleOptions: false
      },
      examMeta: {
        ...examMeta,
        title: `${examMeta.title} (${title})`
      },
      questions,
      userAnswers: {},
      flagged: {},
      startTime: Date.now(),
      timeSpentSeconds: 0,
      isSubmitted: false
    };

    setActiveSession(newSession);
    setPendingSession(newSession);
    saveActiveSession(newSession);
  }, [exams]);

  // Bookmark toggle
  const handleToggleBookmark = useCallback((questionId: string) => {
    toggleBookmark(questionId);
    setBookmarks(getBookmarks());
  }, []);

  // Remove single mistake
  const handleRemoveMistake = useCallback((questionId: string) => {
    removeMistake(questionId);
    setMistakes(getMistakes());
  }, []);

  // Clear all mistakes
  const handleClearMistakes = useCallback((examId?: string) => {
    clearMistakes(examId);
    setMistakes(getMistakes());
  }, []);

  // Clear all history
  const handleClearHistory = useCallback((examId?: string) => {
    clearHistory(examId);
    setHistory(getHistory());
  }, []);

  // Reset all data
  const handleResetAllData = useCallback(() => {
    clearMistakes();
    clearHistory();
    clearActiveSession();
    localStorage.clear();
    reloadStorageData();
    setActiveSession(null);
  }, [reloadStorageData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 animate-bounce mb-4">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          正在載入題庫與圖資...
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          多益聽力 ‧ 資料庫 ‧ 資安概論 ‧ 網路服管 ‧ ICTP ‧ AIL ‧ EEC ‧ TOEIC 共 2,490 題
        </p>
      </div>
    );
  }

  // Active Test in progress
  if (activeSession && !activeSession.isSubmitted) {
    return (
      <QuizView
        session={activeSession}
        onUpdateAnswer={handleUpdateAnswer}
        onToggleFlag={handleToggleFlag}
        onSubmitQuiz={handleSubmitQuiz}
        onExitQuiz={handleExitQuiz}
      />
    );
  }

  // Active Test completed Result View
  if (activeSession && activeSession.isSubmitted) {
    return (
      <div>
        <Navbar
          activeTab={activeTab}
          onSelectTab={(tab) => {
            setActiveSession(null);
            setActiveTab(tab);
          }}
          mistakeCount={Object.keys(mistakes).length}
          historyCount={history.length}
          bookmarkCount={Object.keys(bookmarks).length}
          hasActiveQuiz={false}
          examCount={exams.length}
        />
        <ResultView
          session={activeSession}
          onRetakeSameConfig={handleRetakeSame}
          onRetakeMistakes={handleRetakeMistakes}
          onReturnHome={() => setActiveSession(null)}
          onGoToMistakeBank={() => {
            setActiveSession(null);
            setActiveTab('mistakes');
          }}
          bookmarks={bookmarks}
          onToggleBookmark={handleToggleBookmark}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col justify-between">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mistakeCount={Object.keys(mistakes).length}
        historyCount={history.length}
        bookmarkCount={Object.keys(bookmarks).length}
        hasActiveQuiz={Boolean(pendingSession || (activeSession && !activeSession.isSubmitted))}
        onResumeQuiz={() => {
          const s = activeSession || pendingSession;
          if (s) setActiveSession(s);
        }}
        examCount={exams.length}
        isVisible={isHeaderVisible}
        hasUpdate={appUpdate.hasUpdate}
        onApplyUpdate={appUpdate.applyUpdate}
      />

      {/* Main Content Area based on Tab */}
      <main className="flex-1 pb-24 sm:pb-16">
        {activeTab === 'exams' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

            {/* Pending Active Quiz Banner (if any) */}
            {pendingSession && !activeSession && (
              <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/30 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <span>暫停中的測驗進度</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    </div>
                    <div className="text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                      {pendingSession.examMeta.title} ‧ {pendingSession.config.mode === 'exam' ? '模擬考試' : '刷題練習'} (進度 {Object.keys(pendingSession.userAnswers).length} / {pendingSession.questions.length} 題)
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    onClick={() => setActiveSession(pendingSession)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition active:scale-95"
                  >
                    繼續作答
                  </button>
                  <button
                    onClick={() => {
                      clearActiveSession();
                      setPendingSession(null);
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  >
                    捨棄此場
                  </button>
                </div>
              </div>
            )}
            
            {/* Hero Welcome Banner */}
            <div className="relative rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white p-8 sm:p-10 shadow-xl overflow-hidden mb-10">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md text-blue-100 mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>全功能離線題庫 ‧ 模擬考試 ‧ 即時刷題 ‧ 先看題目 ‧ 錯題消滅</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
                  期中與專業認證模擬測驗系統
                </h1>
                <p className="text-sm sm:text-base text-blue-100 leading-relaxed mb-6">
                  精選收錄本目錄下 {exams.length} 門核心考試，支援先看題目背題、自選範圍、自訂測驗題數、計時交卷、錯題本與對題歷史分析，助您考取高分及格！
                </p>

                {/* Quick Stats Pill */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-blue-200">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    總收錄 {totalQuestionsCount.toLocaleString()} 題
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    本機已做對 {Object.keys(corrects).length} 題
                  </span>
                  {Object.keys(mistakes).length > 0 && (
                    <button
                      onClick={() => setActiveTab('mistakes')}
                      className="px-3 py-1 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white transition flex items-center gap-1"
                    >
                      <span>錯題本有 {Object.keys(mistakes).length} 題待消滅</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Decorative Background Glows */}
              <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
              <div className="absolute right-1/4 bottom-0 -mb-10 w-64 h-64 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
            </div>

            {/* Exam Cards Grid */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span>選擇測驗考試科目 (共 {exams.length} 門)</span>
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  點擊各考試即可設定測驗題數與單元範圍，或直接先看題目
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exams.map(exam => {
                  const examCorrect = Object.values(corrects).filter(c => c.examId === exam.id).length;
                  const examMistakes = Object.values(mistakes).filter(m => m.examId === exam.id).length;
                  const lastExamHistory = history.find(h => h.examId === exam.id);

                  return (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      correctCount={examCorrect}
                      mistakeCount={examMistakes}
                      lastScore={lastExamHistory ? lastExamHistory.score : null}
                      onOpenConfig={(targetExam, defaultMode) => {
                        setConfigModalExam(targetExam);
                        setConfigDefaultMode(defaultMode || 'exam');
                      }}
                      onOpenStudy={(targetExam) => {
                        setBrowseExamId(targetExam.id);
                        setActiveTab('browse');
                      }}
                    />
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'browse' && (
          <StudyBrowseView
            exams={exams}
            rawQuestions={rawQuestions}
            rawToeicWords={rawToeicWords}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            initialExamId={browseExamId}
            onStartQuizWithExam={(targetExam, mode) => {
              setConfigModalExam(targetExam);
              setConfigDefaultMode(mode || 'exam');
            }}
            onOpenImage={(src) => setPreviewImage(src)}
            isHeaderVisible={isHeaderVisible}
          />
        )}

        {activeTab === 'mistakes' && (
          <MistakeBankView
            mistakes={mistakes}
            exams={exams}
            onRemoveMistake={handleRemoveMistake}
            onClearMistakes={handleClearMistakes}
            onStartMistakeWorkout={(questions) => handleStartCustomWorkout(questions, '錯題特訓')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            history={history}
            exams={exams}
            onClearHistory={handleClearHistory}
            onRetakeFromHistory={(questions) => handleStartCustomWorkout(questions, '歷史試卷重測')}
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            onReturnHome={() => setActiveTab('exams')}
            onGoToMistakeBank={() => setActiveTab('mistakes')}
          />
        )}

        {activeTab === 'bookmarks' && (
          <BookmarksView
            bookmarks={bookmarks}
            allQuestionsMap={allQuestionsMap}
            exams={exams}
            onToggleBookmark={handleToggleBookmark}
            onStartBookmarkWorkout={(questions) => handleStartCustomWorkout(questions, '收藏題特訓')}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            exams={exams}
            history={history}
            mistakes={mistakes}
            corrects={corrects}
            bookmarks={bookmarks}
            onDataReset={handleResetAllData}
            onDataImported={reloadStorageData}
            appUpdate={appUpdate}
          />
        )}
      </main>

      {/* Config Modal */}
      {configModalExam && (
        <ConfigModal
          exam={configModalExam}
          allExams={exams}
          onSelectExam={(e) => setConfigModalExam(e)}
          defaultMode={configDefaultMode}
          mistakeCount={Object.values(mistakes).filter(m => m.examId === configModalExam.id).length}
          onClose={() => setConfigModalExam(null)}
          onStartQuiz={handleStartQuiz}
        />
      )}

      {/* Image Zoom Modal */}
      {previewImage && (
        <ImageModal
          src={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {/* Auto-update Floating Notification Banner */}
      <UpdateNotification
        hasUpdate={appUpdate.hasUpdate}
        showToast={appUpdate.showToast}
        latestVersion={appUpdate.latestVersion}
        onApplyUpdate={appUpdate.applyUpdate}
        onDismiss={appUpdate.dismissUpdateToast}
        hasActiveQuiz={Boolean(activeSession && !activeSession.isSubmitted)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        mistakeCount={Object.keys(mistakes).length}
        bookmarkCount={Object.keys(bookmarks).length}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm py-6 text-center text-xs text-slate-400 mb-12 sm:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>期中證照模擬測驗與刷題系統 ‧ 題庫由本機目錄 PDF/Excel 即時驅動</span>
          <span>支援 資料庫管理 ‧ 資訊安全概論 ‧ 網路服務管理 ‧ ICTP Python ‧ AIL 人工智慧 ‧ EEC 網路行銷 ‧ TOEIC 多益</span>
        </div>
      </footer>

    </div>
  );
}
export default App;
