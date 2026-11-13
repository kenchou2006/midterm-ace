/**
 * Standardizes and normalizes answer strings across all exam types.
 * 
 * - Strips commas, spaces, punctuation, etc. (e.g., "A, B" -> "AB", "A、B" -> "AB")
 * - Converts to uppercase
 * - Sorts characters alphabetically for order-independent comparison (e.g., "BA" -> "AB")
 */
export const normalizeAnswer = (ans: string | undefined | null): string => {
  if (!ans) return '';
  return ans
    .toString()
    .toUpperCase()
    .replace(/[^A-Z0-9OX]/g, '')
    .split('')
    .sort()
    .join('');
};

/**
 * Checks whether the user's answer matches the official answer.
 * Handles single-choice, multiple-choice, and true/false.
 * Order-independent and ignores commas/spaces/case.
 */
export const isAnswerCorrect = (
  userAns: string | undefined | null,
  trueAns: string | undefined | null
): boolean => {
  const normUser = normalizeAnswer(userAns);
  const normTrue = normalizeAnswer(trueAns);
  return Boolean(normUser && normUser === normTrue);
};

/**
 * Checks whether a specific option key (e.g. 'A') is included in an answer string.
 */
export const isOptionInAnswer = (
  key: string | undefined | null,
  ans: string | undefined | null
): boolean => {
  if (!key || !ans) return false;
  return normalizeAnswer(ans).includes(key.toUpperCase());
};

/**
 * Formats an answer string for human-readable display.
 * - Single letter / True-False (e.g. "A", "O", "X") -> "A", "O", "X"
 * - Multiple options (e.g. "AB", "A,B") -> "A, B"
 * - Empty / null -> ""
 */
export const formatDisplayAnswer = (ans: string | undefined | null): string => {
  if (!ans) return '';
  const norm = normalizeAnswer(ans);
  if (!norm) return ans.toString().trim();
  if (norm.length <= 1) return norm;
  return norm.split('').join(', ');
};

/**
 * Deduplicates options by option key to protect against data anomalies.
 */
export const deduplicateOptions = <T extends { key: string }>(options: T[] | undefined | null): T[] => {
  if (!options || !Array.isArray(options)) return [];
  const seen = new Set<string>();
  return options.filter(opt => {
    if (!opt || !opt.key) return false;
    const k = opt.key.toUpperCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
};
