import type { Challenge3DDefinition } from './validator3d';
import { buildLevels1To6 } from './challenges3d_1_6';
import { buildLevels7To10 } from './challenges3d_7_10';
import { buildLevels11To13 } from './challenges3d_11_13';
import { buildLevels14To18 } from './challenges3d_14_18';

export interface Level3DMeta {
  id: number;
  roman: string;
  title: string;
  subtitle: string;
  topicGroup: string;
  curriculumTag: 'Toán 11' | 'Toán 12';
  accentColor: string;
}

export const LEVELS_3D: Level3DMeta[] = [
  // Toán 11 – Hình học không gian (13 cấp độ · 130 thử thách · 390 sao)
  {
    id: 1,
    roman: 'I',
    title: 'Điểm, đường thẳng và mặt phẳng',
    subtitle: 'Dựng điểm, đoạn thẳng, đường thẳng, mặt phẳng và đa giác cơ bản trong không gian.',
    topicGroup: 'Hình học không gian · Mở đầu',
    curriculumTag: 'Toán 11',
    accentColor: '#0F766E',
  },
  {
    id: 2,
    roman: 'II',
    title: 'Giao tuyến và giao điểm',
    subtitle: 'Xác định giao điểm hai đường thẳng, giao điểm đường – mặt và giao tuyến hai mặt phẳng.',
    topicGroup: 'Hình học không gian · Giao điểm & Giao tuyến',
    curriculumTag: 'Toán 11',
    accentColor: '#0284C7',
  },
  {
    id: 3,
    roman: 'III',
    title: 'Hai đường thẳng song song',
    subtitle: 'Dựng đường thẳng song song, đường trung bình và giao tuyến song song trong không gian.',
    topicGroup: 'Quan hệ song song',
    curriculumTag: 'Toán 11',
    accentColor: '#0369A1',
  },
  {
    id: 4,
    roman: 'IV',
    title: 'Đường thẳng song song với mặt phẳng',
    subtitle: 'Dấu hiệu nhận biết, giao tuyến đi qua đường thẳng song song mặt phẳng và mặt phẳng phụ.',
    topicGroup: 'Quan hệ song song',
    curriculumTag: 'Toán 11',
    accentColor: '#0D9488',
  },
  {
    id: 5,
    roman: 'V',
    title: 'Hai mặt phẳng song song',
    subtitle: 'Dựng mặt phẳng song song qua điểm, giao tuyến song song và định lí Thalès trong không gian.',
    topicGroup: 'Quan hệ song song',
    curriculumTag: 'Toán 11',
    accentColor: '#059669',
  },
  {
    id: 6,
    roman: 'VI',
    title: 'Phép chiếu song song',
    subtitle: 'Dựng ảnh hình chiếu song song của điểm, đoạn thẳng, trung điểm và đa giác phẳng.',
    topicGroup: 'Quan hệ song song',
    curriculumTag: 'Toán 11',
    accentColor: '#0891B2',
  },
  {
    id: 7,
    roman: 'VII',
    title: 'Hai đường thẳng vuông góc',
    subtitle: 'Xác định góc 90° giữa hai đường cắt nhau, chéo nhau, đường cao và đường vuông góc chung.',
    topicGroup: 'Quan hệ vuông góc',
    curriculumTag: 'Toán 11',
    accentColor: '#7C3AED',
  },
  {
    id: 8,
    roman: 'VIII',
    title: 'Đường thẳng vuông góc với mặt phẳng',
    subtitle: 'Dựng đường thẳng vuông góc mặt phẳng, mặt phẳng vuông góc đường thẳng và định lí ba đường vuông góc.',
    topicGroup: 'Quan hệ vuông góc',
    curriculumTag: 'Toán 11',
    accentColor: '#6D28D9',
  },
  {
    id: 9,
    roman: 'IX',
    title: 'Hai mặt phẳng vuông góc',
    subtitle: 'Nhận biết, dựng mặt phẳng vuông góc và tính chất giao tuyến của các mặt phẳng vuông góc.',
    topicGroup: 'Quan hệ vuông góc',
    curriculumTag: 'Toán 11',
    accentColor: '#4F46E5',
  },
  {
    id: 10,
    roman: 'X',
    title: 'Hình chiếu vuông góc',
    subtitle: 'Dựng hình chiếu vuông góc của điểm, đoạn thẳng, cạnh bên lên đường thẳng và mặt phẳng.',
    topicGroup: 'Quan hệ vuông góc',
    curriculumTag: 'Toán 11',
    accentColor: '#2563EB',
  },
  {
    id: 11,
    roman: 'XI',
    title: 'Góc trong không gian',
    subtitle: 'Xác định và đo góc giữa hai đường thẳng, đường – mặt, hai mặt phẳng và góc nhị diện.',
    topicGroup: 'Góc & Khoảng cách',
    curriculumTag: 'Toán 11',
    accentColor: '#D97706',
  },
  {
    id: 12,
    roman: 'XII',
    title: 'Khoảng cách trong không gian',
    subtitle: 'Đo khoảng cách từ điểm đến đường, đến mặt phẳng, giữa hai mặt song song và hai đường chéo nhau.',
    topicGroup: 'Góc & Khoảng cách',
    curriculumTag: 'Toán 11',
    accentColor: '#EA580C',
  },
  {
    id: 13,
    roman: 'XIII',
    title: 'Thiết diện và dựng hình tổng hợp',
    subtitle: 'Dựng thiết diện tam giác, tứ giác, ngũ giác, lục giác đều của đa diện và khối tròn xoay.',
    topicGroup: 'Thiết diện & Tổng hợp',
    curriculumTag: 'Toán 11',
    accentColor: '#B45309',
  },

  // Toán 12 – Vectơ và phương pháp tọa độ trong không gian (5 cấp độ · 50 thử thách · 150 sao)
  {
    id: 14,
    roman: 'XIV',
    title: 'Vectơ trong không gian',
    subtitle: 'Dựng vectơ, vectơ đối, quy tắc ba điểm, quy tắc hình hộp và góc giữa hai vectơ.',
    topicGroup: 'Vectơ & Oxyz',
    curriculumTag: 'Toán 12',
    accentColor: '#16A34A',
  },
  {
    id: 15,
    roman: 'XV',
    title: 'Hệ tọa độ Oxyz',
    subtitle: 'Tọa độ điểm, trung điểm, trọng tâm tam giác – tứ diện, điểm đối xứng và khoảng cách.',
    topicGroup: 'Vectơ & Oxyz',
    curriculumTag: 'Toán 12',
    accentColor: '#059669',
  },
  {
    id: 16,
    roman: 'XVI',
    title: 'Phương trình mặt phẳng',
    subtitle: 'Dựng mặt phẳng từ phương trình tổng quát, đoạn chắn, pháp tuyến, khoảng cách và góc.',
    topicGroup: 'Phương pháp tọa độ Oxyz',
    curriculumTag: 'Toán 12',
    accentColor: '#0D9488',
  },
  {
    id: 17,
    roman: 'XVII',
    title: 'Phương trình đường thẳng',
    subtitle: 'Đường thẳng qua điểm và VTCP, vị trí tương đối, giao điểm, hình chiếu và đường vuông góc chung.',
    topicGroup: 'Phương pháp tọa độ Oxyz',
    curriculumTag: 'Toán 12',
    accentColor: '#DC2626',
  },
  {
    id: 18,
    roman: 'XVIII',
    title: 'Phương trình mặt cầu và bài toán tổng hợp',
    subtitle: 'Dựng mặt cầu theo tâm và bán kính, mặt cầu đường kính, tiếp diện và thiết diện đường tròn.',
    topicGroup: 'Phương pháp tọa độ Oxyz',
    curriculumTag: 'Toán 12',
    accentColor: '#BE123C',
  },
];

export const ALL_CHALLENGES_3D: Challenge3DDefinition[] = [
  ...buildLevels1To6(),
  ...buildLevels7To10(),
  ...buildLevels11To13(),
  ...buildLevels14To18(),
];

/** Unified export (identical to ALL_CHALLENGES_3D) to prevent any partial-list regressions */
export const CHALLENGES_3D: Challenge3DDefinition[] = ALL_CHALLENGES_3D;

export const TOTAL_3D_CHALLENGES = ALL_CHALLENGES_3D.length; // 180
export const TOTAL_POSSIBLE_3D_STARS = ALL_CHALLENGES_3D.length * 3; // 540

export function calcProgressPercent(done: number, total: number): number {
  if (!Number.isFinite(total) || total <= 0) return 0;
  if (!Number.isFinite(done) || done <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((done / total) * 100)));
}

export function getChallenges3DByLevel(levelId: number): Challenge3DDefinition[] {
  return ALL_CHALLENGES_3D.filter((c) => c.levelId === levelId).sort((a, b) => a.order - b.order);
}

export function getChallenge3DById(id: string): Challenge3DDefinition | undefined {
  return ALL_CHALLENGES_3D.find((c) => c.id === id);
}

export function getNextChallenge3D(currentId: string): Challenge3DDefinition | undefined {
  const idx = ALL_CHALLENGES_3D.findIndex((c) => c.id === currentId);
  return idx >= 0 && idx + 1 < ALL_CHALLENGES_3D.length ? ALL_CHALLENGES_3D[idx + 1] : undefined;
}
