import React from 'react';
import { ActiveTab } from './Navbar';
import { 
  BookOpen, 
  Eye, 
  AlertCircle, 
  Bookmark, 
  BarChart3 
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  mistakeCount: number;
  bookmarkCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  mistakeCount,
  bookmarkCount
}) => {
  const navItems = [
    {
      id: 'exams' as ActiveTab,
      label: '大廳',
      icon: BookOpen,
      activeColor: 'text-blue-600 dark:text-blue-400',
      badge: 0
    },
    {
      id: 'browse' as ActiveTab,
      label: '先看題目',
      icon: Eye,
      activeColor: 'text-cyan-600 dark:text-cyan-400',
      badge: 0
    },
    {
      id: 'mistakes' as ActiveTab,
      label: '錯題本',
      icon: AlertCircle,
      activeColor: 'text-rose-600 dark:text-rose-400',
      badge: mistakeCount
    },
    {
      id: 'bookmarks' as ActiveTab,
      label: '收藏夾',
      icon: Bookmark,
      activeColor: 'text-amber-600 dark:text-amber-400',
      badge: bookmarkCount
    },
    {
      id: 'stats' as ActiveTab,
      label: '數據',
      icon: BarChart3,
      activeColor: 'text-emerald-600 dark:text-emerald-400',
      badge: 0
    }
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-xl px-2 py-1 safe-area-bottom">
      <div className="grid grid-cols-5 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
                isActive 
                  ? 'text-slate-900 dark:text-white font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? `${item.activeColor} scale-110` : ''}`} />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 px-1 min-w-[15px] h-[15px] rounded-full text-[9px] font-bold bg-rose-500 text-white flex items-center justify-center shadow-sm">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-1 transition ${isActive ? `${item.activeColor} font-bold` : 'font-medium'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-8 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
