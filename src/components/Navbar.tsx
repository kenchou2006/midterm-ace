import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Eye,
  AlertCircle, 
  History, 
  BarChart3, 
  Bookmark,
  Sparkles,
  Download,
  WifiOff,
  CheckCircle2
} from 'lucide-react';

export type ActiveTab = 'exams' | 'browse' | 'mistakes' | 'history' | 'bookmarks' | 'stats';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  mistakeCount: number;
  historyCount: number;
  bookmarkCount: number;
  hasActiveQuiz: boolean;
  onResumeQuiz?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  mistakeCount,
  historyCount,
  bookmarkCount,
  hasActiveQuiz,
  onResumeQuiz
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div 
            onClick={() => onSelectTab('exams')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                  MidtermAce 期中刷題網
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  7科題庫
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                資料庫 ‧ 資安概論 ‧ 網路服管 ‧ ICTP Python ‧ AIL ‧ EEC ‧ TOEIC
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            
            {/* Active Quiz Notice */}
            {hasActiveQuiz && onResumeQuiz && (
              <button
                onClick={onResumeQuiz}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 shadow-sm animate-pulse transition"
              >
                <Sparkles className="w-4 h-4" />
                <span>返回測驗中</span>
              </button>
            )}

            <button
              onClick={() => onSelectTab('exams')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                activeTab === 'exams'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>考試大廳</span>
            </button>

            <button
              onClick={() => onSelectTab('browse')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                activeTab === 'browse'
                  ? 'bg-cyan-50 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 shadow-sm font-bold ring-1 ring-cyan-400/40'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Eye className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>先看題目</span>
            </button>

            <button
              onClick={() => onSelectTab('mistakes')}
              className={`relative hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                activeTab === 'mistakes'
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>錯題本</span>
              {mistakeCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white min-w-[18px] text-center">
                  {mistakeCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('bookmarks')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                activeTab === 'bookmarks'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-4 h-4 text-amber-500" />
              <span>收藏夾</span>
              {bookmarkCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white min-w-[18px] text-center">
                  {bookmarkCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('history')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                activeTab === 'history'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <History className="w-4 h-4" />
              <span>歷史紀錄</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                  {historyCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('stats')}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${
                activeTab === 'stats'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>數據備份</span>
            </button>

            {/* Offline indicator */}
            {!isOnline && (
              <div 
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border border-amber-300 dark:border-amber-700"
                title="目前處於離線狀態，已啟用完整本地快取題庫"
              >
                <WifiOff className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden md:inline">離線模式</span>
              </div>
            )}

            {/* PWA Install Button */}
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-sm shadow-blue-500/20 transition transform hover:scale-105"
                title="安裝 MidtermAce 為獨立桌面 / 手機 App"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">安裝 App</span>
              </button>
            )}

          </nav>
        </div>
      </div>
    </header>
  );
};
