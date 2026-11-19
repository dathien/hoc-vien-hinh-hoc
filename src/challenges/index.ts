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
  'Kiến thức nền tảng',
  'Toán 10',
  'Toán 11',
  'Toán 12',
  'Kiến thức mở rộng',
  'Hình học Olympic',
];

const TOAN_10_IDS = new Set([
  'L04_C07',
  'L04_C08',
  'L04_C09',
  'L09_C07',
  'L09_C08',
  'L11_C01',
  'L11_C02',
  'L11_C03',
  'L11_C07',
]);

const TOAN_11_IDS = new Set([
  'L08_C01',
  'L08_C02',
  'L08_C03',
  'L08_C04',
  'L08_C05',
  'L08_C06',
  'L08_C07',
  'L08_C08',
  'L08_C09',
  'L08_C10',
]);

/**
 * Phân loại khoa học theo phạm vi kiến thức thực tế (GDPT 2018 & SGK Kết nối tri thức với cuộc sống):
 * - Không mặc định các nội dung nâng cao/Olympic (đường tròn chín điểm, Fermat, Lemoine, Simson, Miquel, Napoleon, Sangaku) là kiến thức bắt buộc THPT.
 * - Không gán cưỡng ép Toán 12 cho các bài dựng hình phẳng cổ điển.
 */
export function getChallengeProgramLabel(ch: ChallengeDefinition): ProgramLabel {
  if (ch.levelId === 18 || ch.curriculumCategory === 'Olympic') {
    return 'Hình học Olympic';
  }
  if (
    ch.levelId === 10 ||
    ch.levelId === 12 ||
    ch.levelId === 14 ||
    ch.levelId === 15 ||
    ch.levelId === 16 ||
    ch.levelId === 17 ||
    (ch.levelId === 13 && ch.order > 1) ||
    ch.curriculumCategory === 'Mở rộng' ||
    ch.curriculumCategory === 'Học sinh giỏi'
  ) {
    return 'Kiến thức mở rộng';
  }
  if (TOAN_11_IDS.has(ch.id)) {
    return 'Toán 11';
  }
  if (TOAN_10_IDS.has(ch.id)) {
    return 'Toán 10';
  }
  return 'Kiến thức nền tảng';
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
