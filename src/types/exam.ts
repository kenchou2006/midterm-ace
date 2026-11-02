export type QuestionType = 'single' | 'multiple' | 'true_false';

export interface Option {
  key: string;
  text: string;
  image?: string;
}

export interface Question {
  id: string;
  globalIndex: number;
  examId: string;
  section: string | number;
  sectionName: string;
  number: number;
  type: QuestionType;
  typeLabel: string;
  question: string;
  options: Option[];
  answer: string;
  images?: string[];
  page?: number;
  toeicData?: {
    word: string;
    phonetic: string;
    meaning: string;
    pos: string;
    sentence: string;
    translation: string;
    notes: string;
  };
}

export interface ExamSection {
  id: string | number;
  name: string;
  count: number;
}

export interface ExamMeta {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  badge: string;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | string;
  totalQuestions: number;
  sections: ExamSection[];
  defaultTimeMinutes: number;
  passRate: number;
}

export type QuizMode = 'exam' | 'practice' | 'mistake_workout';
export type ToeicQuizType = 'en_to_zh' | 'zh_to_en' | 'cloze' | 'mixed';

export interface QuizConfig {
  examId: string;
  mode: QuizMode;
  questionCount: number;
  selectedSections: (string | number)[];
  toeicType?: ToeicQuizType;
  timeLimitMinutes: number;
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  questionTypes?: string[];
}

export interface QuizSession {
  id: string;
  config: QuizConfig;
  examMeta: ExamMeta;
  questions: Question[];
  userAnswers: Record<string, string>;
  flagged: Record<string, boolean>;
  startTime: number;
  endTime?: number;
  timeSpentSeconds: number;
  isSubmitted: boolean;
  score?: number;
  correctCount?: number;
  wrongCount?: number;
  isPassed?: boolean;
}

export interface MistakeItem {
  questionId: string;
  examId: string;
  question: Question;
  errorCount: number;
  lastWrongAt: string;
  lastUserAnswer: string;
}

export interface CorrectItem {
  questionId: string;
  examId: string;
  correctCount: number;
  lastCorrectAt: string;
}

export interface HistoryItem {
  id: string;
  examId: string;
  examTitle: string;
  mode: QuizMode;
  date: string;
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  timeSpentSeconds: number;
  isPassed: boolean;
  questions: Question[];
  userAnswers: Record<string, string>;
}
