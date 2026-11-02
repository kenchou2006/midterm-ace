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

export function importAllData(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.mistakes) localStorage.setItem(STORAGE_KEYS.MISTAKES, JSON.stringify(parsed.mistakes));
    if (parsed.corrects) localStorage.setItem(STORAGE_KEYS.CORRECTS, JSON.stringify(parsed.corrects));
    if (parsed.history) localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(parsed.history));
    if (parsed.bookmarks) localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(parsed.bookmarks));
    return true;
  } catch (err) {
    console.error('Failed to import data', err);
    return false;
  }
}
