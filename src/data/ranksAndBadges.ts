import { ALL_CHALLENGES, getChallengesByLevel } from '../challenges';
import type { ChallengeProgressRecord } from '../services/storageService';

export interface RankTier {
  id: string;
  level: number;
  title: string;
  minStars: number;
  color: string;
  description: string;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  criteriaText: string;
  category: 'Tiến trình' | 'Tối ưu' | 'Chuyên đề' | 'Sáng tạo';
  accentColor: string;
  iconName:
    | 'Compass'
    | 'Sparkles'
    | 'Star'
    | 'Trophy'
    | 'Award'
    | 'Target'
    | 'Ruler'
    | 'Flame'
    | 'PenTool'
    | 'Crown'
    | 'Layers'
    | 'CheckCircle2';
  evaluate: (ctx: BadgeEvaluationContext) => { unlocked: boolean; progress: number; target: number };
}

export interface BadgeEvaluationContext {
  progressMap: Record<string, ChallengeProgressRecord>;
  totalStars: number;
  completedCount: number;
  threeStarCount: number;
  streakDays: number;
  drawingsCount: number;
  arenaParticipations: number;
}

export const RANK_TIERS: RankTier[] = [
  {
    id: 'r1',
    level: 1,
    title: 'Người khám phá',
    minStars: 0,
    color: '#0F766E',
    description: 'Bắt đầu hành trình làm quen với thước thẳng và compa.',
  },
  {
    id: 'r2',
    level: 2,
    title: 'Học viên dựng hình',
    minStars: 20,
    color: '#0284C7',
    description: 'Nắm vững tam giác đều, trung trực, vuông góc và phân giác cơ bản.',
  },
  {
    id: 'r3',
    level: 3,
    title: 'Kỹ sư hình học',
    minStars: 60,
    color: '#0284C7',
    description: 'Thành thạo đường song song, tứ giác đặc biệt và các tâm tam giác.',
  },
  {
    id: 'r4',
    level: 4,
    title: 'Chuyên gia hình học',
    minStars: 130,
    color: '#7C3AED',
    description: 'Làm chủ phép biến hình, định lí Thalès và hình học tỉ số vàng.',
  },
  {
    id: 'r5',
    level: 5,
    title: 'Thành thạo thước và compa',
    minStars: 220,
    color: '#7C3AED',
    description: 'Chinh phục tiếp tuyến, phương tích, đa giác đều và các đường tròn tiếp xúc.',
  },
  {
    id: 'r6',
    level: 6,
    title: 'Kiến trúc sư Toán học',
    minStars: 330,
    color: '#D97706',
    description: 'Vượt qua các thử thách chỉ dùng compa hoặc chỉ dùng thước thẳng.',
  },
  {
    id: 'r7',
    level: 7,
    title: 'Chuyên sâu hình học',
    minStars: 430,
    color: '#D97706',
    description: 'Tinh thông hình học chuyên sâu và các cấu hình Olympic kinh điển.',
  },
  {
    id: 'r8',
    level: 8,
    title: 'Xuất sắc toàn diện',
    minStars: 500,
    color: '#B45309',
    description: `Đạt mức tối ưu về số bước dựng trên gần trọn bộ ${ALL_CHALLENGES.length} thử thách hình học phẳng.`,
  },
];

export function computeRank(totalStars: number): {
  current: RankTier;
  next: RankTier | null;
  progressPercent: number;
} {
  let current = RANK_TIERS[0];
  let next: RankTier | null = RANK_TIERS[1] ?? null;

  for (let i = 0; i < RANK_TIERS.length; i++) {
    if (totalStars >= RANK_TIERS[i].minStars) {
      current = RANK_TIERS[i];
      next = RANK_TIERS[i + 1] ?? null;
    }
  }

  if (!next) {
    return { current, next: null, progressPercent: 100 };
  }

  const span = Math.max(1, next.minStars - current.minStars);
  const gained = Math.max(0, totalStars - current.minStars);
  return {
    current,
    next,
    progressPercent: Math.min(100, Math.round((gained / span) * 100)),
  };
}

function countCompletedInLevel(
  levelId: number,
  progressMap: Record<string, ChallengeProgressRecord>
): number {
  return getChallengesByLevel(levelId).filter((c) => (progressMap[c.id]?.stars ?? 0) >= 1).length;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'b_first_step',
    title: 'Nét vẽ đầu tiên',
    description: 'Hoàn thành thử thách dựng hình đầu tiên vượt qua kiểm tra biến động.',
    criteriaText: 'Hoàn thành ít nhất 1 thử thách (≥ 1 sao)',
    category: 'Tiến trình',
    accentColor: '#0F766E',
    iconName: 'Compass',
    evaluate: (ctx) => ({
      unlocked: ctx.completedCount >= 1,
      progress: Math.min(1, ctx.completedCount),
      target: 1,
    }),
  },
  {
    id: 'b_level1_clear',
    title: 'Vững vàng nền tảng',
    description: 'Hoàn thành trọn vẹn toàn bộ 10 thử thách của Cấp độ I – Dựng hình cơ bản.',
    criteriaText: 'Hoàn thành 10/10 bài Cấp độ I',
    category: 'Tiến trình',
    accentColor: '#0F766E',
    iconName: 'CheckCircle2',
    evaluate: (ctx) => {
      const done = countCompletedInLevel(1, ctx.progressMap);
      return { unlocked: done >= 10, progress: done, target: 10 };
    },
  },
  {
    id: 'b_first_3star',
    title: 'Tối ưu hoàn hảo',
    description: 'Đạt trọn vẹn 3 sao (đúng hình học, tối ưu số bước L và số bước sơ cấp E).',
    criteriaText: 'Đạt 3 sao ở ít nhất 1 thử thách',
    category: 'Tối ưu',
    accentColor: '#D97706',
    iconName: 'Star',
    evaluate: (ctx) => ({
      unlocked: ctx.threeStarCount >= 1,
      progress: Math.min(1, ctx.threeStarCount),
      target: 1,
    }),
  },
  {
    id: 'b_25_optimal',
    title: 'Kỹ sư tối ưu L & E',
    description: 'Chinh phục 3 sao tối ưu trên 25 thử thách khác nhau.',
    criteriaText: 'Đạt 3 sao ở 25 thử thách',
    category: 'Tối ưu',
    accentColor: '#D97706',
    iconName: 'Target',
    evaluate: (ctx) => ({
      unlocked: ctx.threeStarCount >= 25,
      progress: Math.min(25, ctx.threeStarCount),
      target: 25,
    }),
  },
  {
    id: 'b_50_done',
    title: 'Chinh phục 50 thử thách',
    description: 'Vượt qua 50 bài toán dựng hình động với kiểm chứng tính chính xác của phép dựng.',
    criteriaText: `Hoàn thành 50/${ALL_CHALLENGES.length} thử thách`,
    category: 'Tiến trình',
    accentColor: '#0284C7',
    iconName: 'Layers',
    evaluate: (ctx) => ({
      unlocked: ctx.completedCount >= 50,
      progress: Math.min(50, ctx.completedCount),
      target: 50,
    }),
  },
  {
    id: 'b_100_done',
    title: 'Bách chiến hình học',
    description: 'Hoàn thành hơn một nửa lộ trình Học viện với 100 thử thách chính xác.',
    criteriaText: `Hoàn thành 100/${ALL_CHALLENGES.length} thử thách`,
    category: 'Tiến trình',
    accentColor: '#7C3AED',
    iconName: 'Award',
    evaluate: (ctx) => ({
      unlocked: ctx.completedCount >= 100,
      progress: Math.min(100, ctx.completedCount),
      target: 100,
    }),
  },
  {
    id: 'b_golden_artist',
    title: 'Khám phá Tỉ số vàng',
    description: 'Hoàn thành toàn bộ Cấp độ X – Tỉ số vàng và hình học đối xứng.',
    criteriaText: 'Hoàn thành 10/10 bài Cấp độ X',
    category: 'Chuyên đề',
    accentColor: '#D97706',
    iconName: 'Sparkles',
    evaluate: (ctx) => {
      const done = countCompletedInLevel(10, ctx.progressMap);
      return { unlocked: done >= 10, progress: done, target: 10 };
    },
  },
  {
    id: 'b_compass_master',
    title: 'Kỹ thuật dựng hình bằng compa',
    description: 'Hoàn thành toàn bộ 10 thử thách Cấp độ XV chỉ bằng compa (Định lí Mohr–Mascheroni).',
    criteriaText: 'Hoàn thành 10/10 bài Cấp độ XV',
    category: 'Chuyên đề',
    accentColor: '#7C3AED',
    iconName: 'Compass',
    evaluate: (ctx) => {
      const done = countCompletedInLevel(15, ctx.progressMap);
      return { unlocked: done >= 10, progress: done, target: 10 };
    },
  },
  {
    id: 'b_straightedge_master',
    title: 'Kỹ thuật dựng hình bằng thước thẳng',
    description: 'Hoàn thành toàn bộ 10 thử thách Cấp độ XVI chỉ bằng thước thẳng (Định lí Poncelet–Steiner).',
    criteriaText: 'Hoàn thành 10/10 bài Cấp độ XVI',
    category: 'Chuyên đề',
    accentColor: '#0F766E',
    iconName: 'Ruler',
    evaluate: (ctx) => {
      const done = countCompletedInLevel(16, ctx.progressMap);
      return { unlocked: done >= 10, progress: done, target: 10 };
    },
  },
  {
    id: 'b_olympic_champion',
    title: 'Nhà vô địch Olympic',
    description: 'Chinh phục trọn vẹn 10 bài toán đỉnh cao ở Cấp độ XVIII.',
    criteriaText: 'Hoàn thành 10/10 bài Cấp độ XVIII',
    category: 'Chuyên đề',
    accentColor: '#B45309',
    iconName: 'Crown',
    evaluate: (ctx) => {
      const done = countCompletedInLevel(18, ctx.progressMap);
      return { unlocked: done >= 10, progress: done, target: 10 };
    },
  },
  {
    id: 'b_lab_creator',
    title: 'Nhà thực hành sáng tạo',
    description: 'Sáng tạo và lưu ít nhất 3 bản vẽ hình học động trong Phòng thực hành.',
    criteriaText: 'Lưu từ 3 bản vẽ trong Phòng thực hành',
    category: 'Sáng tạo',
    accentColor: '#0284C7',
    iconName: 'PenTool',
    evaluate: (ctx) => ({
      unlocked: ctx.drawingsCount >= 3,
      progress: Math.min(3, ctx.drawingsCount),
      target: 3,
    }),
  },
  {
    id: 'b_streak_7',
    title: 'Bền bỉ 7 ngày liên tiếp',
    description: 'Duy trì thói quen rèn luyện tư duy hình học suốt 7 ngày liên tiếp.',
    criteriaText: 'Chuỗi học tập đạt 7 ngày',
    category: 'Sáng tạo',
    accentColor: '#EA580C',
    iconName: 'Flame',
    evaluate: (ctx) => ({
      unlocked: ctx.streakDays >= 7,
      progress: Math.min(7, ctx.streakDays),
      target: 7,
    }),
  },
];

export const TOTAL_POSSIBLE_STARS = ALL_CHALLENGES.length * 3;
