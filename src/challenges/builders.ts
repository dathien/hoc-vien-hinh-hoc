import { COMPASS_ONLY_TOOLS, EUCLIDEAN_BASIC_TOOLS, STRAIGHTEDGE_ONLY_TOOLS } from '../geometry/tools';
import type { ToolId } from '../geometry/types';
import type {
  ChallengeDefinition,
  CognitiveLevel,
  CurriculumCategory,
  Difficulty,
  GradeTag,
  InitialGeoSpec,
  PerturbationRule,
  SolutionAction,
  ValidationRule,
} from '../validators/types';

export const STANDARD_TOOLS: ToolId[] = [
  ...EUCLIDEAN_BASIC_TOOLS,
  'compass',
  'midpoint',
  'perp_bisector',
  'perpendicular',
  'parallel',
  'angle_bisector',
];

export const ADVANCED_TOOLS: ToolId[] = [
  ...STANDARD_TOOLS,
  'tangent',
  'projection',
  'reflect_line',
  'reflect_point',
  'translate',
  'rotate',
  'homothety',
  'circumcircle',
  'incircle',
  'median',
  'altitude',
];

export const ALL_NON_COMPASS: ToolId[] = [
  'line',
  'segment',
  'ray',
  'polyline',
  'circle_cr',
  'arc',
  'midpoint',
  'perp_bisector',
  'perpendicular',
  'parallel',
  'angle_bisector',
  'median',
  'altitude',
  'tangent',
  'projection',
  'reflect_line',
  'reflect_point',
  'translate',
  'rotate',
  'homothety',
  'triangle',
  'quadrilateral',
  'polygon',
  'regular_polygon',
  'incircle',
  'circumcircle',
  'measure_length',
  'measure_angle',
  'measure_area',
];

export const ALL_NON_STRAIGHTEDGE: ToolId[] = [
  'circle_cp',
  'circle_cr',
  'compass',
  'arc',
  'polyline',
  'midpoint',
  'perp_bisector',
  'perpendicular',
  'parallel',
  'angle_bisector',
  'median',
  'altitude',
  'tangent',
  'projection',
  'reflect_line',
  'reflect_point',
  'translate',
  'rotate',
  'homothety',
  'triangle',
  'quadrilateral',
  'polygon',
  'regular_polygon',
  'incircle',
  'circumcircle',
  'measure_length',
  'measure_angle',
  'measure_area',
];

/** Initial geometry helpers */
export function givenSegmentAB(ax = -110, ay = 40, bx = 110, by = 40): InitialGeoSpec[] {
  return [
    { id: 'A', kind: 'point', rule: 'free_point', parents: [], label: 'A', x: ax, y: ay },
    { id: 'B', kind: 'point', rule: 'free_point', parents: [], label: 'B', x: bx, y: by },
    { id: 'segAB', kind: 'segment', rule: 'segment_two_points', parents: ['A', 'B'], label: 'AB' },
  ];
}

export function givenTwoPointsAB(ax = -110, ay = 20, bx = 110, by = -20): InitialGeoSpec[] {
  return [
    { id: 'A', kind: 'point', rule: 'free_point', parents: [], label: 'A', x: ax, y: ay },
    { id: 'B', kind: 'point', rule: 'free_point', parents: [], label: 'B', x: bx, y: by },
  ];
}

export function givenLineAndPointOn(ax = -160, ay = 30, bx = 160, by = 10, t = 0.5): InitialGeoSpec[] {
  return [
    { id: 'A', kind: 'point', rule: 'free_point', parents: [], label: 'A', x: ax, y: ay },
    { id: 'B', kind: 'point', rule: 'free_point', parents: [], label: 'B', x: bx, y: by },
    { id: 'lineAB', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd' },
    { id: 'P', kind: 'point', rule: 'point_on_object', parents: ['lineAB'], params: { t }, label: 'P' },
  ];
}

export function givenLineAndPointOff(
  ax = -160,
  ay = 60,
  bx = 160,
  by = 40,
  px = 15,
  py = -95
): InitialGeoSpec[] {
  return [
    { id: 'A', kind: 'point', rule: 'free_point', parents: [], label: 'A', x: ax, y: ay },
    { id: 'B', kind: 'point', rule: 'free_point', parents: [], label: 'B', x: bx, y: by },
    { id: 'lineAB', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd' },
    { id: 'P', kind: 'point', rule: 'free_point', parents: [], label: 'P', x: px, y: py },
  ];
}

export function givenTriangleABC(
  ax = -125,
  ay = 95,
  bx = 135,
  by = 85,
  cx = -25,
  cy = -110
): InitialGeoSpec[] {
  return [
    { id: 'A', kind: 'point', rule: 'free_point', parents: [], label: 'A', x: ax, y: ay },
    { id: 'B', kind: 'point', rule: 'free_point', parents: [], label: 'B', x: bx, y: by },
    { id: 'C', kind: 'point', rule: 'free_point', parents: [], label: 'C', x: cx, y: cy },
    { id: 'segAB', kind: 'segment', rule: 'segment_two_points', parents: ['A', 'B'], label: 'AB' },
    { id: 'segBC', kind: 'segment', rule: 'segment_two_points', parents: ['B', 'C'], label: 'BC' },
    { id: 'segCA', kind: 'segment', rule: 'segment_two_points', parents: ['C', 'A'], label: 'CA' },
  ];
}

export function givenAngleAOB(
  ox = -120,
  oy = 75,
  ax = 120,
  ay = 75,
  bx = 40,
  by = -105
): InitialGeoSpec[] {
  return [
    { id: 'O', kind: 'point', rule: 'free_point', parents: [], label: 'O', x: ox, y: oy },
    { id: 'A', kind: 'point', rule: 'free_point', parents: [], label: 'A', x: ax, y: ay },
    { id: 'B', kind: 'point', rule: 'free_point', parents: [], label: 'B', x: bx, y: by },
    { id: 'rayOA', kind: 'ray', rule: 'ray_two_points', parents: ['O', 'A'], label: 'Ox' },
    { id: 'rayOB', kind: 'ray', rule: 'ray_two_points', parents: ['O', 'B'], label: 'Oy' },
  ];
}

export function givenRayOA(ox = -130, oy = 40, ax = 140, ay = 40): InitialGeoSpec[] {
  return [
    { id: 'O', kind: 'point', rule: 'free_point', parents: [], label: 'O', x: ox, y: oy },
    { id: 'A', kind: 'point', rule: 'free_point', parents: [], label: 'A', x: ax, y: ay },
    { id: 'rayOA', kind: 'ray', rule: 'ray_two_points', parents: ['O', 'A'], label: 'Ox' },
  ];
}

export function givenCircleOA(ox = 0, oy = 0, ax = 120, ay = 0): InitialGeoSpec[] {
  return [
    { id: 'O', kind: 'point', rule: 'free_point', parents: [], label: 'O', x: ox, y: oy },
    { id: 'A', kind: 'point', rule: 'free_point', parents: [], label: 'A', x: ax, y: ay },
    { id: 'circO', kind: 'circle', rule: 'circle_center_point', parents: ['O', 'A'], label: '(O)' },
  ];
}

export function givenCircleWithExternalP(
  ox = -60,
  oy = 10,
  ax = 25,
  ay = 10,
  px = 165,
  py = -35
): InitialGeoSpec[] {
  return [
    { id: 'O', kind: 'point', rule: 'free_point', parents: [], label: 'O', x: ox, y: oy },
    { id: 'A', kind: 'point', rule: 'free_point', parents: [], label: 'A', x: ax, y: ay },
    { id: 'circO', kind: 'circle', rule: 'circle_center_point', parents: ['O', 'A'], label: '(O)' },
    { id: 'P', kind: 'point', rule: 'free_point', parents: [], label: 'P', x: px, y: py },
  ];
}

export function givenTwoCircles(
  o1x = -95,
  o1y = 10,
  r1x = -10,
  r1y = 10,
  o2x = 90,
  o2y = -5,
  r2x = 15,
  r2y = -5
): InitialGeoSpec[] {
  return [
    { id: 'O1', kind: 'point', rule: 'free_point', parents: [], label: 'O₁', x: o1x, y: o1y },
    { id: 'R1', kind: 'point', rule: 'free_point', parents: [], label: 'R₁', x: r1x, y: r1y, style: { showLabel: false } },
    { id: 'circ1', kind: 'circle', rule: 'circle_center_point', parents: ['O1', 'R1'], label: '(O₁)' },
    { id: 'O2', kind: 'point', rule: 'free_point', parents: [], label: 'O₂', x: o2x, y: o2y },
    { id: 'R2', kind: 'point', rule: 'free_point', parents: [], label: 'R₂', x: r2x, y: r2y, style: { showLabel: false } },
    { id: 'circ2', kind: 'circle', rule: 'circle_center_point', parents: ['O2', 'R2'], label: '(O₂)' },
  ];
}

export interface CompactChallengeInput {
  levelId: number;
  order: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  gradeTags: GradeTag[];
  curriculumCategory: CurriculumCategory;
  cognitiveLevel: CognitiveLevel;
  initialGeometry: InitialGeoSpec[];
  mode?: 'euclidean' | 'standard' | 'advanced' | 'compass_only' | 'straightedge_only';
  constraints?: string[];
  validationRules: ValidationRule[];
  perturbationRules: PerturbationRule;
  targetL: number;
  targetE: number;
  hints: [string, string, string];
  solutionSteps: SolutionAction[];
  proof: string;
  thumbnailKind: string;
  educationalNotes: string;
}

export function makeChallenge(c: CompactChallengeInput): ChallengeDefinition {
  const id = `L${String(c.levelId).padStart(2, '0')}_C${String(c.order).padStart(2, '0')}`;
  const mode = c.mode ?? 'standard';

  let allowedTools: ToolId[];
  let forbiddenTools: ToolId[] = ['circle_cr', 'measure_length', 'measure_angle', 'measure_area'];

  if (mode === 'euclidean') {
    allowedTools = [...EUCLIDEAN_BASIC_TOOLS];
    forbiddenTools = ['circle_cr', 'compass', 'midpoint', 'perp_bisector', 'perpendicular', 'parallel', 'angle_bisector', 'measure_length', 'measure_angle'];
  } else if (mode === 'compass_only') {
    allowedTools = [...COMPASS_ONLY_TOOLS];
    forbiddenTools = [...ALL_NON_COMPASS];
  } else if (mode === 'straightedge_only') {
    allowedTools = [...STRAIGHTEDGE_ONLY_TOOLS];
    forbiddenTools = [...ALL_NON_STRAIGHTEDGE];
  } else if (mode === 'advanced') {
    allowedTools = [...ADVANCED_TOOLS];
  } else {
    allowedTools = [...STANDARD_TOOLS];
  }

  const prevId =
    c.order > 1
      ? `L${String(c.levelId).padStart(2, '0')}_C${String(c.order - 1).padStart(2, '0')}`
      : c.levelId > 1
        ? `L${String(c.levelId - 1).padStart(2, '0')}_C10`
        : null;

  return {
    id,
    levelId: c.levelId,
    order: c.order,
    title: c.title,
    description: c.description,
    difficulty: c.difficulty,
    gradeTags: c.gradeTags,
    curriculumCategory: c.curriculumCategory,
    cognitiveLevel: c.cognitiveLevel,
    prerequisites: prevId ? [prevId] : [],
    initialGeometry: c.initialGeometry,
    allowedTools,
    forbiddenTools,
    constraints: c.constraints ?? [
      mode === 'compass_only'
        ? 'Chỉ được dùng compa và giao điểm, khóa toàn bộ thước thẳng.'
        : mode === 'straightedge_only'
          ? 'Chỉ được dùng thước thẳng không chia độ, khóa toàn bộ compa.'
          : 'Không dùng thước chia độ hoặc đo số trực tiếp; phép dựng phải giữ nguyên tính chất khi kéo điểm dữ kiện.',
    ],
    validationRules: c.validationRules,
    perturbationRules: c.perturbationRules,
    targetL: c.targetL,
    targetE: c.targetE,
    hints: c.hints,
    solutionSteps: c.solutionSteps,
    proof: c.proof,
    thumbnailKind: c.thumbnailKind,
    educationalNotes: c.educationalNotes,
  };
}
