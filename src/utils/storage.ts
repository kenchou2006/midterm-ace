import { MistakeItem, CorrectItem, HistoryItem, Question, QuizSession } from '../types/exam';

const STORAGE_KEYS = {
  MISTAKES: 'exam_master_mistakes_v1',
  CORRECTS: 'exam_master_corrects_v1',
  HISTORY: 'exam_master_history_v1',
  BOOKMARKS: 'exam_master_bookmarks_v1',
  ACTIVE_SESSION: 'exam_master_active_session_v1',
  APP_THEME: 'exam_master_theme_v1'
};

// ================= Mistake Bank =================
export function getMistakes(examId?: string): Record<string, MistakeItem> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MISTAKES);
    const data: Record<string, MistakeItem> = raw ? JSON.parse(raw) : {};
    if (!examId || examId === 'all') return data;
    const filtered: Record<string, MistakeItem> = {};
    for (const [key, item] of Object.entries(data)) {
      if (item.examId === examId) {
        filtered[key] = item;
      }
    }
    return filtered;
  } catch (err) {
    console.error('Error reading mistakes from localStorage', err);
    return {};
  }
}

export function recordMistake(examId: string, question: Question, userAnswer: string) {
  try {
    const data = getMistakes();
    const existing = data[question.id];
    data[question.id] = {
      questionId: question.id,
      examId,
      question,
      errorCount: (existing?.errorCount || 0) + 1,
      lastWrongAt: new Date().toISOString(),
      lastUserAnswer: userAnswer
    };
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving mistake to localStorage', err);
  }
}

export function removeMistake(questionId: string) {
  try {
    const data = getMistakes();
    if (data[questionId]) {
      delete data[questionId];
      localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(data));
    }
  } catch (err) {
    console.error('Error deleting mistake', err);
  }
}

export function clearMistakes(examId?: string) {
  try {
    if (!examId || examId === 'all') {
      localStorage.removeItem(STORAGE_KEYS.MISTAKES);
    } else {
      const data = getMistakes();
      for (const [key, item] of Object.entries(data)) {
        if (item.examId === examId) {
          delete data[key];
        }
      }
      localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(data));
    }
  } catch (err) {
    console.error('Error clearing mistakes', err);
  }
}

// ================= Correct Bank =================
export function getCorrects(examId?: string): Record<string, CorrectItem> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CORRECTS);
    const data: Record<string, CorrectItem> = raw ? JSON.parse(raw) : {};
    if (!examId || examId === 'all') return data;
    const filtered: Record<string, CorrectItem> = {};
    for (const [key, item] of Object.entries(data)) {
      if (item.examId === examId) {
        filtered[key] = item;
      }
    }
    return filtered;
  } catch (err) {
    console.error('Error reading corrects from localStorage', err);
    return {};
  }
}

export function recordCorrect(examId: string, questionId: string) {
  try {
    const data = getCorrects();
    const existing = data[questionId];
    data[questionId] = {
      questionId,
      examId,
      correctCount: (existing?.correctCount || 0) + 1,
      lastCorrectAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEYS.CORRECTS, JSON.stringify(data));
  } catch (err) {
    console.error('Error recording correct answer', err);
  }
}

// ================= Exam History =================
export function getHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading history', err);
    return [];
  }
}

export function saveHistory(item: HistoryItem) {
  try {
    const history = getHistory();
    history.unshift(item); // prepend
    // Keep max 100 history items to save space
    if (history.length > 100) {
      history.length = 100;
    }
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (err) {
    console.error('Error saving history item', err);
  }
}

export function clearHistory(examId?: string) {
  try {
    if (!examId || examId === 'all') {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } else {
      const history = getHistory().filter(h => h.examId !== examId);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    }
  } catch (err) {
    console.error('Error clearing history', err);
  }
}

// ================= Bookmarks =================
export function getBookmarks(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
}

export function toggleBookmark(questionId: string): boolean {
  try {
    const data = getBookmarks();
    const nextState = !data[questionId];
    if (nextState) {
      data[questionId] = true;
    } else {
      delete data[questionId];
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(data));
    return nextState;
  } catch (err) {
    return false;
  }
}

// ================= Active Session =================
export function getActiveSession(): QuizSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function saveActiveSession(session: QuizSession) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
  } catch (err) {
    console.error('Error saving active session', err);
  }
}

export function clearActiveSession() {
  try {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  } catch (err) {
    console.error('Error clearing active session', err);
  }
}

// ================= Export & Import =================
export function exportAllData(): string {
  const payload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    mistakes: getMistakes(),
    corrects: getCorrects(),
    history: getHistory(),
    bookmarks: getBookmarks()
  };
  return JSON.stringify(payload, null, 2);
}

export interface ImportMergeResult {
  success: boolean;
  historyAdded: number;
  mistakesMerged: number;
  correctsMerged: number;
  bookmarksMerged: number;
  error?: string;
}

/**
 * 匯入並智能合併備份資料（同時保留本地與匯入紀錄）
 * - 歷史測驗：兩份合併並依紀錄特徵去重，按時間倒序排列
 * - 錯題本：兩份合併，同題累加錯誤次數並保留最新作答時間
 * - 已掌握題目：兩份合併，同題累加作答答對次數
 * - 收藏夾：聯集保留兩者已標記收藏的題目
 */
export function importAllData(jsonStr: string): ImportMergeResult {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, historyAdded: 0, mistakesMerged: 0, correctsMerged: 0, bookmarksMerged: 0, error: '格式不合法的 JSON 檔案' };
    }

    // 1. Merge Mistakes
    const localMistakes = getMistakes();
    const importedMistakes = (parsed.mistakes && typeof parsed.mistakes === 'object') ? parsed.mistakes : {};
    const mergedMistakes: Record<string, MistakeItem> = { ...localMistakes };
    let mistakesMergedCount = 0;

    for (const [qId, impItem] of Object.entries(importedMistakes as Record<string, MistakeItem>)) {
      if (!impItem || !impItem.questionId) continue;
      const localItem = mergedMistakes[qId];
      if (!localItem) {
        mergedMistakes[qId] = impItem;
        mistakesMergedCount++;
      } else {
        const localTime = new Date(localItem.lastWrongAt || 0).getTime();
        const impTime = new Date(impItem.lastWrongAt || 0).getTime();
        const isImportNewer = impTime >= localTime;

        mergedMistakes[qId] = {
          ...localItem,
          question: impItem.question || localItem.question,
          examId: localItem.examId || impItem.examId,
          errorCount: (localItem.errorCount || 1) + (impItem.errorCount || 1),
          lastWrongAt: isImportNewer ? impItem.lastWrongAt : localItem.lastWrongAt,
          lastUserAnswer: isImportNewer ? impItem.lastUserAnswer : localItem.lastUserAnswer
        };
        mistakesMergedCount++;
      }
    }
    localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(mergedMistakes));

    // 2. Merge Corrects
    const localCorrects = getCorrects();
    const importedCorrects = (parsed.corrects && typeof parsed.corrects === 'object') ? parsed.corrects : {};
    const mergedCorrects: Record<string, CorrectItem> = { ...localCorrects };
    let correctsMergedCount = 0;

    for (const [qId, impItem] of Object.entries(importedCorrects as Record<string, CorrectItem>)) {
      if (!impItem || !impItem.questionId) continue;
      const localItem = mergedCorrects[qId];
      if (!localItem) {
        mergedCorrects[qId] = impItem;
        correctsMergedCount++;
      } else {
        const localTime = new Date(localItem.lastCorrectAt || 0).getTime();
        const impTime = new Date(impItem.lastCorrectAt || 0).getTime();
        const isImportNewer = impTime >= localTime;

        mergedCorrects[qId] = {
          ...localItem,
          examId: localItem.examId || impItem.examId,
          correctCount: (localItem.correctCount || 1) + (impItem.correctCount || 1),
          lastCorrectAt: isImportNewer ? impItem.lastCorrectAt : localItem.lastCorrectAt
        };
        correctsMergedCount++;
      }
    }
    localStorage.setItem(STORAGE_KEYS.CORRECTS, JSON.stringify(mergedCorrects));

    // 3. Merge Bookmarks
    const localBookmarks = getBookmarks();
    const importedBookmarks = (parsed.bookmarks && typeof parsed.bookmarks === 'object') ? parsed.bookmarks : {};
    const mergedBookmarks: Record<string, boolean> = { ...localBookmarks };
    let bookmarksMergedCount = 0;

    for (const [qId, isBookmarked] of Object.entries(importedBookmarks as Record<string, boolean>)) {
      if (isBookmarked) {
        if (!mergedBookmarks[qId]) {
          bookmarksMergedCount++;
        }
        mergedBookmarks[qId] = true;
      }
    }
    localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(mergedBookmarks));

    // 4. Merge Exam History
    const localHistory = getHistory();
    const importedHistory = Array.isArray(parsed.history) ? parsed.history : [];

    const seenIds = new Set<string>();
    const seenSignatures = new Set<string>();
    const combinedHistory: HistoryItem[] = [];

    const getSig = (h: HistoryItem) => `${h.examId}_${h.date}_${h.score}_${h.totalQuestions}_${h.correctCount}`;

    // Add local first
    for (const h of localHistory) {
      if (h.id) seenIds.add(h.id);
      seenSignatures.add(getSig(h));
      combinedHistory.push(h);
    }

    let historyAddedCount = 0;
    // Add imported if not duplicated
    for (const h of importedHistory) {
      const sig = getSig(h);
      if ((h.id && seenIds.has(h.id)) || seenSignatures.has(sig)) {
        continue;
      }
      if (h.id) seenIds.add(h.id);
      seenSignatures.add(sig);
      combinedHistory.push(h);
      historyAddedCount++;
    }

    // Sort descending by date
    combinedHistory.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    // Limit to 100 entries to prevent quota limits
    if (combinedHistory.length > 100) {
      combinedHistory.length = 100;
    }
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(combinedHistory));

    return {
      success: true,
      historyAdded: historyAddedCount,
      mistakesMerged: mistakesMergedCount,
      correctsMerged: correctsMergedCount,
      bookmarksMerged: bookmarksMergedCount
    };
  } catch (err: any) {
    console.error('Failed to import data', err);
    return {
      success: false,
      historyAdded: 0,
      mistakesMerged: 0,
      correctsMerged: 0,
      bookmarksMerged: 0,
      error: err?.message || '檔案解析失敗'
    };
  }
}
