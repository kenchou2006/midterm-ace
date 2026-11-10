import React from 'react';
import { ExamMeta } from '../types/exam';
import { 
  Play, 
  Flame, 
  AlertTriangle, 
  FileText, 
  Layers, 
  Clock, 
  CheckCircle2,
  ChevronRight,
  Eye
} from 'lucide-react';

interface ExamCardProps {
  exam: ExamMeta;
  correctCount: number;
  mistakeCount: number;
  lastScore: number | null;
  onOpenConfig: (exam: ExamMeta, defaultMode?: 'exam' | 'practice' | 'mistake_workout') => void;
  onOpenStudy?: (exam: ExamMeta) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  correctCount,
  mistakeCount,
  lastScore,
  onOpenConfig,
  onOpenStudy
}) => {
  // Theme color styling
  const colorMap: Record<string, {
    border: string;
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    btnPrimary: string;
    accentRing: string;
  }> = {
    cyan: {
      border: 'hover:border-cyan-400 dark:hover:border-cyan-500',
      badgeBg: 'bg-cyan-100 dark:bg-cyan-950/60',
      badgeText: 'text-cyan-800 dark:text-cyan-300',
      iconBg: 'from-cyan-600 to-blue-600',
      btnPrimary: 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-cyan-500/20',
      accentRing: 'focus:ring-cyan-500'
    },
    violet: {
      border: 'hover:border-violet-400 dark:hover:border-violet-500',
      badgeBg: 'bg-violet-100 dark:bg-violet-950/60',
      badgeText: 'text-violet-800 dark:text-violet-300',
      iconBg: 'from-violet-600 to-purple-700',
      btnPrimary: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-500/20',
      accentRing: 'focus:ring-violet-500'
    },
    teal: {
      border: 'hover:border-teal-400 dark:hover:border-teal-500',
      badgeBg: 'bg-teal-100 dark:bg-teal-950/60',
      badgeText: 'text-teal-800 dark:text-teal-300',
      iconBg: 'from-teal-600 to-emerald-700',
      btnPrimary: 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/20',
      accentRing: 'focus:ring-teal-500'
    },
    indigo: {
      border: 'hover:border-indigo-400 dark:hover:border-indigo-500',
      badgeBg: 'bg-indigo-100 dark:bg-indigo-950/60',
      badgeText: 'text-indigo-700 dark:text-indigo-300',
      iconBg: 'from-indigo-600 to-blue-700',
      btnPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20',
      accentRing: 'focus:ring-indigo-500'
    },
    emerald: {
      border: 'hover:border-emerald-400 dark:hover:border-emerald-500',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/60',
      badgeText: 'text-emerald-700 dark:text-emerald-300',
      iconBg: 'from-emerald-600 to-teal-700',
      btnPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20',
      accentRing: 'focus:ring-emerald-500'
    },
    amber: {
      border: 'hover:border-amber-400 dark:hover:border-amber-500',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/60',
      badgeText: 'text-amber-800 dark:text-amber-300',
      iconBg: 'from-amber-500 to-orange-600',
      btnPrimary: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20',
      accentRing: 'focus:ring-amber-500'
    },
    rose: {
      border: 'hover:border-rose-400 dark:hover:border-rose-500',
      badgeBg: 'bg-rose-100 dark:bg-rose-950/60',
      badgeText: 'text-rose-700 dark:text-rose-300',
      iconBg: 'from-rose-600 to-pink-700',
      btnPrimary: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/20',
      accentRing: 'focus:ring-rose-500'
    },
    sky: {
      border: 'hover:border-sky-400 dark:hover:border-sky-500',
      badgeBg: 'bg-sky-100 dark:bg-sky-950/60',
      badgeText: 'text-sky-700 dark:text-sky-300',
      iconBg: 'from-sky-500 to-blue-600',
      btnPrimary: 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-500/20',
      accentRing: 'focus:ring-sky-500'
    },
    blue: {
      border: 'hover:border-blue-400 dark:hover:border-blue-500',
      badgeBg: 'bg-blue-100 dark:bg-blue-950/60',
      badgeText: 'text-blue-700 dark:text-blue-300',
      iconBg: 'from-blue-600 to-indigo-700',
      btnPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20',
      accentRing: 'focus:ring-blue-500'
    }
  };

  const colors = colorMap[exam.color] || colorMap.indigo;
  const masteryPercentage = exam.totalQuestions > 0 ? Math.min(100, Math.round((correctCount / exam.totalQuestions) * 100)) : 0;

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${colors.border} group`}>
      <div>
        {/* Header badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${colors.badgeBg} ${colors.badgeText}`}>
            {exam.badge}
          </span>
          {lastScore !== null && (
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
              lastScore >= exam.passRate ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
            }`}>
              上次得分: {lastScore}分
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition mb-1">
          {exam.title}
        </h3>
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
          {exam.subTitle}
        </p>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-5 leading-relaxed line-clamp-3">
          {exam.description}
        </p>

        {/* Meta Stats Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl mb-5 text-xs text-slate-600 dark:text-slate-300">
          <div className="flex flex-col items-center justify-center p-1 text-center">
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>題庫總量</span>
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
              {exam.totalQuestions} 題
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-1 text-center border-x border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>題型/單元</span>
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
              {exam.sections.length} 個範圍
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-1 text-center">
            <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>及格標準</span>
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
              {exam.passRate} 分及格
            </span>
          </div>
        </div>

        {/* Mastery Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>掌握進度 (已答對 {correctCount} 題)</span>
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-200">{masteryPercentage}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${masteryPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
        <button
          onClick={() => onOpenConfig(exam, 'exam')}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition transform active:scale-[0.98] ${colors.btnPrimary}`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>開始模擬測驗 / 刷題</span>
          <ChevronRight className="w-4 h-4 ml-auto" />
        </button>

        {onOpenStudy && (
          <button
            onClick={() => onOpenStudy(exam)}
            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-100 hover:bg-cyan-50 hover:text-cyan-800 dark:bg-slate-800 dark:hover:bg-cyan-950/60 dark:hover:text-cyan-300 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition border border-transparent hover:border-cyan-300 dark:hover:border-cyan-700"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>先看題目 / 免測驗背題 ({exam.totalQuestions} 題)</span>
          </button>
        )}

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenConfig(exam, 'practice')}
            className="py-2 px-3 rounded-xl font-medium text-xs bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5 transition border border-slate-200 dark:border-slate-700"
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>即時刷題</span>
          </button>

          <button
            onClick={() => onOpenConfig(exam, 'mistake_workout')}
            disabled={mistakeCount === 0}
            className={`py-2 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition border ${
              mistakeCount > 0
                ? 'border-rose-200 dark:border-rose-900 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 dark:text-rose-300'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 text-slate-400 dark:bg-slate-800/30 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span>錯題特訓 ({mistakeCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
