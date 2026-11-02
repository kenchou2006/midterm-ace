import React, { useState, useRef } from 'react';
import { ExamMeta, HistoryItem, MistakeItem, CorrectItem } from '../types/exam';
import { 
  BarChart3, 
  Download, 
  Upload, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  Database,
  Layers
} from 'lucide-react';
import { exportAllData, importAllData } from '../utils/storage';

interface StatsViewProps {
  exams: ExamMeta[];
  history: HistoryItem[];
  mistakes: Record<string, MistakeItem>;
  corrects: Record<string, CorrectItem>;
  bookmarks: Record<string, boolean>;
  onDataReset: () => void;
  onDataImported: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  exams,
  history,
  mistakes,
  corrects,
  bookmarks,
  onDataReset,
  onDataImported
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalBankQuestions = exams.reduce((acc, e) => acc + e.totalQuestions, 0);
  const totalCorrectLearned = Object.keys(corrects).length;
  const totalMistakes = Object.keys(mistakes).length;
  const totalCompletedTests = history.length;
  const overallMastery = totalBankQuestions > 0 ? Math.round((totalCorrectLearned / totalBankQuestions) * 100) : 0;

  // Average test score
  const avgScore = history.length > 0 
    ? Math.round(history.reduce((acc, h) => acc + h.score, 0) / history.length) 
    : 0;

  // Handle Export
  const handleExport = () => {
    const jsonStr = exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ExamMaster_學習進度備份_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle Import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importAllData(content);
      if (success) {
        setImportMessage('備份資料成功匯入並已生效！');
        onDataImported();
      } else {
        setImportMessage('匯入失敗：請確認檔案是否為合法的 ExamMaster 備份 JSON 檔案。');
      }
      setTimeout(() => setImportMessage(null), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 flex items-center justify-center font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              學習數據與本機備份
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            本系統所有做題、錯題、對題紀錄皆儲存於瀏覽器 LocalStorage，支援完整匯出與匯入備份
          </p>
        </div>
      </div>

      {/* Top 4-Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 font-medium mb-1">總題庫量</div>
          <div className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
            <Database className="w-5 h-5 text-blue-600" />
            <span>{totalBankQuestions}</span>
            <span className="text-xs text-slate-400 font-normal">題</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            4 科證照核心考試題庫
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 font-medium mb-1">已掌握/做對題目</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-5 h-5" />
            <span>{totalCorrectLearned}</span>
            <span className="text-xs text-slate-400 font-normal">題</span>
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-2">
            總題庫涵蓋率: {overallMastery}%
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 font-medium mb-1">錯題本待消滅</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
            <AlertTriangle className="w-5 h-5" />
            <span>{totalMistakes}</span>
            <span className="text-xs text-slate-400 font-normal">題</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            特訓答對後即可自動消滅
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="text-xs text-slate-400 font-medium mb-1">已完成測驗場次</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" />
            <span>{totalCompletedTests}</span>
            <span className="text-xs text-slate-400 font-normal">場</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-2">
            歷史平均成績: {avgScore} 分
          </div>
        </div>
      </div>

      {/* Per Exam Breakdown */}
      <div className="mb-8">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          各科掌握進度一覽
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {exams.map(e => {
            const examCorrect = Object.values(corrects).filter(c => c.examId === e.id).length;
            const examMistakes = Object.values(mistakes).filter(m => m.examId === e.id).length;
            const percentage = Math.min(100, Math.round((examCorrect / e.totalQuestions) * 100));

            return (
              <div
                key={e.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {e.badge}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {e.title}
                    </h4>
                  </div>
                  <span className="font-extrabold text-sm text-emerald-600">
                    {percentage}%
                  </span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>總題數: {e.totalQuestions} 題</span>
                  <span>已答對: {examCorrect} 題</span>
                  <span className="text-rose-500 font-medium">錯題本: {examMistakes} 題</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Backup and Data Management */}
      <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          本機資料備份與還原
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          將您的完整做題紀錄、錯題本、收藏題等所有個人學習數據匯出為 JSON 備份檔，或隨時在其他裝置匯入。
        </p>

        {importMessage && (
          <div className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-xs font-semibold">
            {importMessage}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExport}
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition flex items-center gap-2 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>匯出學習進度備份 (JSON)</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition flex items-center gap-2 active:scale-95"
          >
            <Upload className="w-4 h-4 text-slate-500" />
            <span>匯入還原備份檔</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="ml-auto px-4 py-2.5 rounded-xl font-medium text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>重設全部學習紀錄</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              確定要重設所有學習資料嗎？
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              此動作將清除您累積的所有測驗歷史、錯題特訓本、已掌握題目紀錄及收藏夾，且無法復原。
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                取消
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  onDataReset();
                }}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm transition"
              >
                確定重設
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
