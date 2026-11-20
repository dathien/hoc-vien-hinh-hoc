import type { ChallengeDefinition, LevelMeta, ProgramLabel } from '../validators/types';
import { LEVELS } from './levels';
import { CHALLENGES_LEVELS_1_TO_3 } from './levels_1_3';
import { CHALLENGES_LEVELS_4_TO_6 } from './levels_4_6';
import { CHALLENGES_LEVELS_7_TO_9 } from './levels_7_9';
import { CHALLENGES_LEVELS_10_TO_12 } from './levels_10_12';
import { LEVELS_13_15 } from './levels_13_15';
import { LEVELS_16_18 } from './levels_16_18';

export { LEVELS };

export const PROGRAM_LABELS: ProgramLabel[] = [
  'Toán 10',
  'Toán 11',
  'Toán 12',
  'Kiến thức mở rộng',
  'Hình học Olympic',
];

/**
 * Các cấp độ dựng hình phẳng 2D gắn trực tiếp với nền tảng & trọng tâm Hình học phẳng Toán 10:
 * Cấp I–VII (tam giác, vuông góc, góc, song song/tịnh tiến vectơ, tứ giác, các điểm đặc biệt),
 * Cấp IX (Thalès & tỉ số đoạn thẳng) và Cấp XI (đường tròn & tiếp tuyến).
 */
const TOAN_10_LEVEL_IDS = new Set([1, 2, 3, 4, 5, 6, 7, 9, 11]);
const TOAN_11_LEVEL_IDS = new Set([8]);

/**
 * Phân loại khoa học theo phạm vi THPT 10–11–12 (GDPT 2018 & SGK Kết nối tri thức với cuộc sống):
 * - Toán 10: Các cấp độ dựng hình phẳng nền tảng & tọa độ phẳng (Cấp I–VII, IX, XI).
 * - Toán 11: Chuyên đề phép biến hình phẳng (Cấp VIII) — kết hợp cùng 130 thử thách không gian 3D Toán 11.
 * - Kiến thức mở rộng & Hình học Olympic: Các chuyên đề chuyên sâu (Cấp X, XII–XVIII).
 */
export function getChallengeProgramLabel(ch: ChallengeDefinition): ProgramLabel {
  if (ch.levelId === 18 || ch.curriculumCategory === 'Olympic') {
    return 'Hình học Olympic';
  }
  if (TOAN_11_LEVEL_IDS.has(ch.levelId)) {
    return 'Toán 11';
  }
  if (TOAN_10_LEVEL_IDS.has(ch.levelId)) {
    return 'Toán 10';
  }
  return 'Kiến thức mở rộng';
}

export const ALL_CHALLENGES: ChallengeDefinition[] = [
  ...CHALLENGES_LEVELS_1_TO_3,
  ...CHALLENGES_LEVELS_4_TO_6,
  ...CHALLENGES_LEVELS_7_TO_9,
  ...CHALLENGES_LEVELS_10_TO_12,
  ...LEVELS_13_15,
  ...LEVELS_16_18,
];

const CHALLENGE_MAP = new Map<string, ChallengeDefinition>(
  ALL_CHALLENGES.map((c) => [c.id, c])
);

export function getChallengeById(id: string): ChallengeDefinition | undefined {
  return CHALLENGE_MAP.get(id);
}

export function getChallengesByLevel(levelId: number): ChallengeDefinition[] {
  return ALL_CHALLENGES.filter((c) => c.levelId === levelId).sort((a, b) => a.order - b.order);
}

export function getLevelMeta(levelId: number): LevelMeta | undefined {
  return LEVELS.find((l) => l.id === levelId);
}

export function getNextChallenge(currentId: string): ChallengeDefinition | undefined {
  const idx = ALL_CHALLENGES.findIndex((c) => c.id === currentId);
  if (idx < 0 || idx + 1 >= ALL_CHALLENGES.length) return undefined;
  return ALL_CHALLENGES[idx + 1];
}

export function isChallengeUnlocked(
  challenge: ChallengeDefinition,
  completedMap: Record<string, { stars: number }>,
  teacherPreviewMode = false
): boolean {
  if (teacherPreviewMode) return true;
  if (challenge.isTeacherCustom) return true;
  if (challenge.levelId === 1 && challenge.order === 1) return true;

  // All prerequisites must have >= 1 star
  for (const pre of challenge.prerequisites) {
    if (!completedMap[pre] || completedMap[pre].stars < 1) {
      return false;
    }
  }
  return true;
}

export function isLevelUnlocked(
  levelId: number,
  completedMap: Record<string, { stars: number }>,
  teacherPreviewMode = false
): boolean {
  if (teacherPreviewMode || levelId === 1) return true;
  const prevLevelChallenges = getChallengesByLevel(levelId - 1);
  return prevLevelChallenges.every((c) => (completedMap[c.id]?.stars ?? 0) >= 1);
}
