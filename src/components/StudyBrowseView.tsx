import React, { useState, useMemo, useCallback } from 'react';
import { 
  ExamMeta, 
  Question, 
  Option,
  QuizMode 
} from '../types/exam';
import { RawToeicWord, generateToeicQuestions, playSpeech } from '../utils/toeicGenerator';
import { resolveAssetUrl } from '../utils/asset';
import { 
  Eye, 
  EyeOff, 
  Search, 
  Filter, 
  Bookmark, 
  CheckCircle2, 
  X, 
  Volume2, 
  ZoomIn, 
  Layers, 
  Grid, 
  ArrowUp,
  Sparkles,
  BookOpen,
  GraduationCap,
  Play
} from 'lucide-react';

interface StudyBrowseViewProps {
  exams: ExamMeta[];
  rawQuestions: Record<string, Question[]>;
  rawToeicWords: RawToeicWord[];
  bookmarks: Record<string, boolean>;
  onToggleBookmark: (questionId: string) => void;
  initialExamId?: string;
  onStartQuizWithExam?: (exam: ExamMeta, mode?: QuizMode) => void;
  onOpenImage: (src: string) => void;
}

export const StudyBrowseView: React.FC<StudyBrowseViewProps> = ({
  exams,
  rawQuestions,
  rawToeicWords,
  bookmarks,
  onToggleBookmark,
  initialExamId = 'dbms',
  onStartQuizWithExam,
  onOpenImage
}) => {
  // Current Selected Exam
  const [selectedExamId, setSelectedExamId] = useState<string>(initialExamId);

  // Filters
  const [selectedSection, setSelectedSection] = useState<string | number>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);

  // Mode: 'always_show' (背題/速讀) vs 'click_to_reveal' (自測/回想)
  const [revealMode, setRevealMode] = useState<'always_show' | 'click_to_reveal'>('always_show');
  
  // For 'click_to_reveal' mode: tracked revealed question IDs
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  // Jump Drawer open state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Currently active exam object
  const currentExam = useMemo(() => {
    return exams.find(e => e.id === selectedExamId) || exams[0];
  }, [exams, selectedExamId]);

  // All questions for current exam
  const currentExamQuestions = useMemo<Question[]>(() => {
    if (!currentExam) return [];

    if (currentExam.id === 'toeic') {
      if (rawToeicWords.length === 0) return [];
      return generateToeicQuestions(rawToeicWords, 'mixed');
    }

    return rawQuestions[currentExam.id] || [];
  }, [currentExam, rawQuestions, rawToeicWords]);

  // Filtered Questions
  const filteredQuestions = useMemo<Question[]>(() => {
    let list = currentExamQuestions;

    // Section filter
    if (selectedSection !== 'all') {
      list = list.filter(q => String(q.section) === String(selectedSection));
    }

    // Type filter
    if (selectedType !== 'all') {
      list = list.filter(q => q.type === selectedType);
    }

    // Bookmarked only
    if (onlyBookmarked) {
      list = list.filter(q => Boolean(bookmarks[q.id]));
    }

    // Search Query
    if (searchQuery.trim()) {
      const qLower = searchQuery.trim().toLowerCase();
      list = list.filter(q => {
        const matchQ = q.question.toLowerCase().includes(qLower);
        const matchOpts = q.options.some(opt => opt.text.toLowerCase().includes(qLower));
        const matchSec = q.sectionName.toLowerCase().includes(qLower);
        const matchToeic = q.toeicData 
          ? (q.toeicData.word.toLowerCase().includes(qLower) || 
             q.toeicData.meaning.toLowerCase().includes(qLower) ||
             q.toeicData.sentence.toLowerCase().includes(qLower))
          : false;
        return matchQ || matchOpts || matchSec || matchToeic;
      });
    }

    return list;
  }, [currentExamQuestions, selectedSection, selectedType, onlyBookmarked, searchQuery, bookmarks]);

  // Toggle single question reveal in click_to_reveal mode
  const handleToggleReveal = useCallback((qId: string) => {
    setRevealedIds(prev => ({
      ...prev,
      [qId]: !prev[qId]
    }));
  }, []);

  // Reveal all or Hide all
  const handleRevealAll = useCallback(() => {
    const map: Record<string, boolean> = {};
    filteredQuestions.forEach(q => { map[q.id] = true; });
    setRevealedIds(map);
  }, [filteredQuestions]);

  const handleHideAll = useCallback(() => {
    setRevealedIds({});
  }, []);

  // Scroll to question
  const scrollToQuestion = useCallback((qId: string) => {
    setIsDrawerOpen(false);
    const el = document.getElementById(`study-q-${qId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Add subtle highlight flash
      el.classList.add('ring-4', 'ring-cyan-500/50');
      setTimeout(() => {
        el.classList.remove('ring-4', 'ring-cyan-500/50');
      }, 1500);
    }
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-fade-in pb-28 sm:pb-20">
      
      {/* Top Banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-teal-700 via-cyan-700 to-blue-800 text-white p-6 sm:p-8 shadow-xl overflow-hidden mb-8">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md text-cyan-100 mb-3">
            <Eye className="w-3.5 h-3.5" />
            <span>先看題目模式 ‧ 免測驗 ‧ 直接速讀背題 ‧ 附完整正解</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
            題庫瀏覽與背題系統
          </h1>
          <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed mb-4">
            點選各考試科目，即可隨時查閱全科目考題與選項。支援「答案常顯背題」與「自主點擊查看」，助您在測驗前快速掌握所有核心考點！
          </p>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-black/20 text-cyan-100 font-medium">
              當前科目：{currentExam?.title} (共 {currentExamQuestions.length} 題)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-black/20 text-cyan-100 font-medium">
              目前篩選顯示：{filteredQuestions.length} 題
            </span>
          </div>
        </div>

        {/* Decorative Background */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
      </div>

      {/* 1. Subject Switcher Tabs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-cyan-600" />
            <span>切換考試科目</span>
          </label>
          <span className="text-xs text-slate-400">
            共 {exams.length} 門科目可選
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {exams.map((exam) => {
            const isSelected = exam.id === selectedExamId;
            return (
              <button
                key={exam.id}
                onClick={() => {
                  setSelectedExamId(exam.id);
                  setSelectedSection('all');
                  setSelectedType('all');
                  setSearchQuery('');
                  setRevealedIds({});
                }}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-950/50 text-cyan-950 dark:text-cyan-100 ring-2 ring-cyan-500/30 shadow-sm font-bold'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {exam.badge}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {exam.totalQuestions}題
                  </span>
                </div>
                <span className="text-xs font-bold truncate mt-1">
                  {exam.title}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Sticky Toolbar (Filters, Search, View Mode) */}
      <div className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-4 mb-6 transition-all">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜尋題目關鍵字、選項文字、單元名稱..."
              className="w-full pl-10 pr-9 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Section Filter */}
            {currentExam && currentExam.sections.length > 0 && (
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="py-2 px-3 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
              >
                <option value="all">所有單元 ({currentExamQuestions.length}題)</option>
                {currentExam.sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.name}
                  </option>
                ))}
              </select>
            )}

            {/* Question Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="py-2 px-3 rounded-xl text-xs font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            >
              <option value="all">所有題型</option>
              <option value="single">單選題</option>
              <option value="multiple">複選題</option>
              <option value="true_false">是非題</option>
            </select>

            {/* Bookmarked Only Toggle */}
            <button
              onClick={() => setOnlyBookmarked(!onlyBookmarked)}
              className={`flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition border ${
                onlyBookmarked
                  ? 'border-amber-400 bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 ring-1 ring-amber-400/40'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${onlyBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>已收藏</span>
            </button>

            {/* Question Catalog Drawer Trigger */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="flex items-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm shadow-cyan-600/20 transition active:scale-95"
            >
              <Grid className="w-3.5 h-3.5" />
              <span>題號目錄 ({filteredQuestions.length})</span>
            </button>
          </div>

        </div>

        {/* Second Row: Mode Toggle & Batch Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 dark:text-slate-400">
              顯示模式：
            </span>
            <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setRevealMode('always_show')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-xs transition ${
                  revealMode === 'always_show'
                    ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>答案常顯 (背題)</span>
              </button>
              <button
                onClick={() => setRevealMode('click_to_reveal')}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg font-bold text-xs transition ${
                  revealMode === 'click_to_reveal'
                    ? 'bg-white dark:bg-slate-700 text-cyan-700 dark:text-cyan-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>自測查看</span>
              </button>
            </div>
          </div>

          {revealMode === 'click_to_reveal' && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRevealAll}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                展開所有答案
              </button>
              <button
                onClick={handleHideAll}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              >
                收合所有答案
              </button>
            </div>
          )}

          {/* Quick test button */}
          {onStartQuizWithExam && currentExam && (
            <button
              onClick={() => onStartQuizWithExam(currentExam, 'practice')}
              className="ml-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 transition"
            >
              <Play className="w-3.5 h-3.5" />
              <span>轉為即時刷題測驗</span>
            </button>
          )}

        </div>
      </div>

      {/* 3. Question Cards List */}
      {filteredQuestions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200 mb-1">
            未找到符合條件的考題
          </h3>
          <p className="text-xs text-slate-400 mb-4">
            請嘗試調整關鍵字搜尋或篩選範圍
          </p>
          <button
            onClick={() => {
              setSelectedSection('all');
              setSelectedType('all');
              setSearchQuery('');
              setOnlyBookmarked(false);
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 text-white hover:bg-cyan-700 transition"
          >
            重設篩選條件
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredQuestions.map((q, idx) => {
            const isBookmarked = Boolean(bookmarks[q.id]);
            const isRevealed = revealMode === 'always_show' || Boolean(revealedIds[q.id]);
            const ansKeySet = new Set(q.answer.split(''));

            return (
              <div
                key={q.id}
                id={`study-q-${q.id}`}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                {/* Question Header Bar */}
                <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                      Q {q.number || idx + 1}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-xl ${
                      q.type === 'multiple'
                        ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                        : q.type === 'true_false'
                        ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                        : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    }`}>
                      {q.typeLabel}
                    </span>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-xl truncate max-w-xs sm:max-w-md">
                      {q.sectionName}
                    </span>
                  </div>

                  {/* Bookmark Button */}
                  <button
                    onClick={() => onToggleBookmark(q.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                      isBookmarked
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold'
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title={isBookmarked ? '點擊取消收藏' : '加入收藏夾'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                    <span className="hidden sm:inline">{isBookmarked ? '已收藏' : '收藏'}</span>
                  </button>
                </div>

                {/* TOEIC Helper if applicable */}
                {q.toeicData && (
                  <div className="mb-4 p-3.5 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30 border border-rose-100 dark:border-rose-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => playSpeech(q.toeicData?.word || '')}
                        className="w-9 h-9 rounded-xl bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 transition transform active:scale-95"
                        title="點擊聽美式真人發音"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-slate-900 dark:text-white">
                            {q.toeicData.word}
                          </span>
                          {q.toeicData.pos && (
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300">
                              {q.toeicData.pos}
                            </span>
                          )}
                        </div>
                        {q.toeicData.phonetic && (
                          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                            {q.toeicData.phonetic}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                      多益核心單字
                    </span>
                  </div>
                )}

                {/* Question Text */}
                <div className="mb-5">
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap font-sans">
                    {q.question}
                  </h4>
                </div>

                {/* Question Images */}
                {q.images && q.images.length > 0 && (
                  <div className="mb-5 space-y-3">
                    {q.images.map((imgSrc, imgIdx) => (
                      <div 
                        key={imgIdx} 
                        className="relative group inline-block max-w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white shadow-sm"
                      >
                        <img
                          src={resolveAssetUrl(imgSrc)}
                          alt={`考題附圖 ${imgIdx + 1}`}
                          className="max-h-64 sm:max-h-80 w-auto object-contain cursor-pointer transition transform group-hover:scale-[1.01]"
                          onClick={() => onOpenImage(resolveAssetUrl(imgSrc))}
                        />
                        <button
                          onClick={() => onOpenImage(resolveAssetUrl(imgSrc))}
                          className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[11px] font-semibold flex items-center gap-1 backdrop-blur-sm transition"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>放大圖片</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Options List */}
                <div className="space-y-2.5 mb-5">
                  {q.options.map((opt) => {
                    const isOptionCorrect = ansKeySet.has(opt.key);
                    const showOptionHighlight = isRevealed && isOptionCorrect;

                    return (
                      <div
                        key={opt.key}
                        className={`p-3.5 sm:p-4 rounded-2xl border text-xs sm:text-sm transition flex items-start gap-3 ${
                          showOptionHighlight
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-semibold ring-1 ring-emerald-500/30'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {/* Option Key Badge */}
                        <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition ${
                          showOptionHighlight
                            ? 'bg-emerald-600 text-white shadow-sm'
                            : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                        }`}>
                          {opt.key}
                        </div>

                        {/* Option Text */}
                        <div className="flex-1 pt-0.5 whitespace-pre-wrap leading-relaxed">
                          {opt.text}
                        </div>

                        {/* Correct badge */}
                        {showOptionHighlight && (
                          <div className="shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>正確解答</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Answer Display / Reveal Action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  {isRevealed ? (
                    <div className="flex items-center gap-2 p-2.5 px-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-bold">正確答案：</span>
                      <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded-md">
                        【 {q.answer} 】
                      </span>
                      {q.options.filter(o => ansKeySet.has(o.key)).map(o => (
                        <span key={o.key} className="hidden sm:inline text-xs text-emerald-800 dark:text-emerald-300">
                          {o.text.length > 30 ? o.text.substring(0, 30) + '...' : o.text}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleToggleReveal(q.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm shadow-cyan-600/20 transition active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>查看正確解答</span>
                    </button>
                  )}

                  {revealMode === 'click_to_reveal' && isRevealed && (
                    <button
                      onClick={() => handleToggleReveal(q.id)}
                      className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                    >
                      隱藏答案
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Buttons on Mobile / Desktop */}
      <div className="fixed right-5 bottom-20 sm:bottom-8 z-30 flex flex-col gap-2.5">
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="w-12 h-12 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-600/30 flex items-center justify-center transition transform active:scale-95"
          title="開啟題目目錄"
        >
          <Grid className="w-5 h-5" />
        </button>

        <button
          onClick={scrollToTop}
          className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center transition transform active:scale-95"
          title="回到頂端"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>

      {/* Question Jump Drawer */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in"
          onClick={() => setIsDrawerOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Grid className="w-4 h-4 text-cyan-600" />
                  <span>題號快速直達目錄</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  目前顯示 {filteredQuestions.length} 題，點擊即可平滑捲動
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions Grid */}
            <div className="flex-1 overflow-y-auto p-5">
              <div className="grid grid-cols-5 gap-2.5">
                {filteredQuestions.map((q, idx) => {
                  const isBookmarked = Boolean(bookmarks[q.id]);
                  return (
                    <button
                      key={q.id}
                      onClick={() => scrollToQuestion(q.id)}
                      className={`relative p-2.5 rounded-xl text-xs font-bold border transition flex flex-col items-center justify-center ${
                        isBookmarked
                          ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>Q {q.number || idx + 1}</span>
                      {isBookmarked && (
                        <Bookmark className="w-2.5 h-2.5 fill-amber-500 text-amber-500 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-center">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition"
              >
                關閉目錄
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
