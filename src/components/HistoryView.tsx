import React, { useState } from 'react';
import { HistoryItem, ExamMeta, Question } from '../types/exam';
import { 
  History, 
  Trash2, 
  Trophy, 
  XCircle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  FileText,
  RotateCcw,
  Eye,
  Search
} from 'lucide-react';
import { ResultView } from './ResultView';

interface HistoryViewProps {
  history: HistoryItem[];
  exams: ExamMeta[];
  onClearHistory: (examId?: string) => void;
  onRetakeFromHistory: (questions: Question[]) => void;
  bookmarks: Record<string, boolean>;
  onToggleBookmark: (questionId: string) => void;
  onReturnHome: () => void;
  onGoToMistakeBank: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  exams,
  onClearHistory,
  onRetakeFromHistory,
  bookmarks,
  onToggleBookmark,
  onReturnHome,
  onGoToMistakeBank
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [inspectingItem, setInspectingItem] = useState<HistoryItem | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  const filteredHistory = history.filter(h => {
    if (selectedExamId !== 'all' && h.examId !== selectedExamId) return false;
    return true;
  });

  const formatDuration = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins === 0) return `${secs} 秒`;
    return `${mins} 分 ${secs} 秒`;
  };

  // If user clicked "查看試卷", render ResultView for that historical record
  if (inspectingItem) {
    const pseudoSession = {
      id: inspectingItem.id,
      config: {
        examId: inspectingItem.examId,
        mode: inspectingItem.mode,
        questionCount: inspectingItem.totalQuestions,
        selectedSections: [],
        timeLimitMinutes: 0,
        shuffleQuestions: false,
        shuffleOptions: false
      },
      examMeta: exams.find(e => e.id === inspectingItem.examId) || exams[0],
      questions: inspectingItem.questions,
      userAnswers: inspectingItem.userAnswers,
      flagged: {},
      startTime: 0,
      timeSpentSeconds: inspectingItem.timeSpentSeconds,
      isSubmitted: true,
      score: inspectingItem.score,
      correctCount: inspectingItem.correctCount,
      wrongCount: inspectingItem.wrongCount,
      isPassed: inspectingItem.isPassed
    };

    return (
      <div>
        <div className="max-w-4xl mx-auto px-4 pt-6">
          <button
            onClick={() => setInspectingItem(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 transition"
          >
            ← 返回測驗歷史紀錄清單
          </button>
        </div>
        <ResultView
          session={pseudoSession}
          onRetakeSameConfig={() => onRetakeFromHistory(inspectingItem.questions)}
          onRetakeMistakes={(mistakes) => onRetakeFromHistory(mistakes)}
          onReturnHome={onReturnHome}
          onGoToMistakeBank={onGoToMistakeBank}
          bookmarks={bookmarks}
          onToggleBookmark={onToggleBookmark}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              模擬測驗歷史紀錄
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            本機自動儲存每一次測驗得分、作答明細與及格狀態
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-800 transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>清空所有歷史紀錄</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setSelectedExamId('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            selectedExamId === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          全部紀錄 ({history.length})
        </button>

        {exams.map(e => {
          const count = history.filter(h => h.examId === e.id).length;
          return (
            <button
              key={e.id}
              onClick={() => setSelectedExamId(e.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedExamId === e.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {e.title.split(' ')[0]} ({count})
            </button>
          );
        })}
      </div>

      {/* History Items List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            尚無測驗紀錄
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            在考試大廳選擇任一考試並完成模擬測驗或刷題交卷後，紀錄將即時呈現於此。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredHistory.map((item) => {
            const isPassed = item.isPassed;
            const dateStr = new Date(item.date).toLocaleString('zh-TW', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={item.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Info */}
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black shrink-0 ${
                    isPassed 
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                      : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}>
                    <span className="text-base">{item.score}</span>
                    <span className="text-[9px] font-semibold">分</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {item.examTitle}
                      </h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isPassed 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {isPassed ? '及格 PASS' : '未及格'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {dateStr}
                      </span>
                      <span>‧</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        用時 {formatDuration(item.timeSpentSeconds)}
                      </span>
                      <span>‧</span>
                      <span>
                        共 {item.totalQuestions} 題 (對 {item.correctCount} / 錯 {item.wrongCount})
                      </span>
                      <span>‧</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">
                        {item.mode === 'exam' ? '模擬考試' : item.mode === 'practice' ? '刷題練習' : '錯題特訓'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setInspectingItem(item)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
                  >
                    <Eye className="w-4 h-4 text-blue-600" />
                    <span>查看完整試卷</span>
                  </button>

                  <button
                    onClick={() => onRetakeFromHistory(item.questions)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition"
                    title="以相同題目重新測驗"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>重測此份</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              確定要清空所有歷史紀錄嗎？
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              此動作將清除您累積的 {history.length} 筆測驗成績與作答卷紀錄。
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
                  onClearHistory();
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
