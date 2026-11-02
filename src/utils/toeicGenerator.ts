import { Question, ToeicQuizType } from '../types/exam';

export interface RawToeicWord {
  id: string;
  globalIndex: number;
  category: string;
  no: number;
  word: string;
  phonetic: string;
  meaning: string;
  pos: string;
  sentence: string;
  translation: string;
  notes: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function playSpeech(text: string) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

export function generateToeicQuestions(
  words: RawToeicWord[],
  type: ToeicQuizType = 'mixed'
): Question[] {
  const allWords = words.filter(w => w.word && w.meaning);

  return allWords.map((wordItem, index) => {
    // Pick sub-mode if mixed
    let actualType: 'en_to_zh' | 'zh_to_en' | 'cloze' = 'en_to_zh';
    if (type === 'mixed') {
      const candidates: ('en_to_zh' | 'zh_to_en' | 'cloze')[] = ['en_to_zh', 'zh_to_en'];
      if (wordItem.sentence && wordItem.sentence.length > 5) {
        candidates.push('cloze');
      }
      actualType = candidates[Math.floor(Math.random() * candidates.length)];
    } else if (type === 'cloze' && (!wordItem.sentence || wordItem.sentence.length <= 5)) {
      actualType = 'en_to_zh';
    } else {
      actualType = type as ('en_to_zh' | 'zh_to_en' | 'cloze');
    }

    // Pick 3 distractors
    const pool = allWords.filter(w => w.id !== wordItem.id);
    const shuffledPool = shuffleArray(pool);
    const distractors = shuffledPool.slice(0, 3);

    let questionStem = '';
    let correctOptionText = '';
    let distractorTexts: string[] = [];

    if (actualType === 'en_to_zh') {
      questionStem = `請選出單字「${wordItem.word}」${wordItem.pos ? `(${wordItem.pos})` : ''} 的正確中文意思：`;
      correctOptionText = wordItem.meaning;
      distractorTexts = distractors.map(d => d.meaning);
    } else if (actualType === 'zh_to_en') {
      questionStem = `請選出中文「${wordItem.meaning}」${wordItem.pos ? `(${wordItem.pos})` : ''} 對應的英文單字/片語：`;
      correctOptionText = wordItem.word;
      distractorTexts = distractors.map(d => d.word);
    } else {
      // cloze
      // Replace word in sentence with blank (case-insensitive)
      const cleanWord = wordItem.word.trim();
      const regex = new RegExp(`\\b${cleanWord.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'gi');
      let clozeSentence = wordItem.sentence.replace(regex, '________');
      if (!clozeSentence.includes('________')) {
        // In case word has suffixes (e.g. word is "accept", sentence is "accepted")
        const rootWord = cleanWord.length > 4 ? cleanWord.slice(0, 4) : cleanWord;
        clozeSentence = wordItem.sentence.replace(new RegExp(`\\b${rootWord}\\w*`, 'gi'), '________');
      }
      questionStem = `【克漏字填空】請選出最符合句意的正確單字：\n\n"${clozeSentence}"\n(例句翻譯：${wordItem.translation})`;
      correctOptionText = wordItem.word;
      distractorTexts = distractors.map(d => d.word);
    }

    // Combine and shuffle options
    const rawOptions = [
      { text: correctOptionText, isCorrect: true },
      ...distractorTexts.map(t => ({ text: t, isCorrect: false }))
    ];
    const shuffledOptions = shuffleArray(rawOptions);

    const keys = ['A', 'B', 'C', 'D'];
    let correctKey = 'A';
    const finalOptions = shuffledOptions.map((opt, i) => {
      const key = keys[i];
      if (opt.isCorrect) correctKey = key;
      return {
        key,
        text: opt.text
      };
    });

    return {
      id: wordItem.id,
      globalIndex: index + 1,
      examId: 'toeic',
      section: wordItem.category,
      sectionName: `TOEIC - ${wordItem.category}`,
      number: wordItem.no,
      type: 'single',
      typeLabel: actualType === 'en_to_zh' ? '英選中' : actualType === 'zh_to_en' ? '中選英' : '克漏字',
      question: questionStem,
      options: finalOptions,
      answer: correctKey,
      images: [],
      toeicData: {
        word: wordItem.word,
        phonetic: wordItem.phonetic,
        meaning: wordItem.meaning,
        pos: wordItem.pos,
        sentence: wordItem.sentence,
        translation: wordItem.translation,
        notes: wordItem.notes
      }
    };
  });
}
