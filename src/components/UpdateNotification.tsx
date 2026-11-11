import React from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, RefreshCw, X, CheckCircle, Zap } from 'lucide-react';
import { VersionInfo } from '../utils/useAppUpdate';

interface UpdateNotificationProps {
  hasUpdate: boolean;
  showToast: boolean;
  latestVersion: VersionInfo | null;
  onApplyUpdate: () => void;
  onDismiss: () => void;
  hasActiveQuiz?: boolean;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({
  hasUpdate,
  showToast,
  latestVersion,
  onApplyUpdate,
  onDismiss,
  hasActiveQuiz = false
}) => {
  if (!hasUpdate || !showToast || hasActiveQuiz) {
    return null;
  }

  return createPortal(
    <div className="fixed bottom-6 right-4 sm:right-6 z-50 max-w-md w-[calc(100vw-2rem)] sm:w-auto animate-bounce-in">
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-blue-500/40 dark:border-blue-500/50 rounded-3xl p-5 shadow-2xl shadow-blue-500/20 text-slate-800 dark:text-slate-100 ring-1 ring-black/5">
        
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/30 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                  發現系統新版本！
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {latestVersion?.version ? `v${latestVersion.version}` : '最新版'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {latestVersion?.buildDate ? `發佈於 ${latestVersion.buildDate}` : '伺服器已部署最新考題與功能'}
              </p>
            </div>
          </div>

          <button
            onClick={onDismiss}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="稍後提醒"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Highlights */}
        {latestVersion?.features && latestVersion.features.length > 0 && (
          <div className="my-3 p-3 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 text-xs">
            <div className="text-[11px] font-bold text-blue-700 dark:text-blue-300 mb-1.5 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>更新重點內容：</span>
            </div>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
              {latestVersion.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-1.5 truncate">
                  <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="truncate">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-1">
          <button
            onClick={onApplyUpdate}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/25 active:scale-95 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4 animate-spin-reverse" />
            <span>立即套用更新 (重整)</span>
          </button>
          <button
            onClick={onDismiss}
            className="py-2.5 px-3.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            稍後
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
