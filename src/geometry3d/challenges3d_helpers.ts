import { addGeo3DObject, createEmptyScene3D } from './engine3d';
import { v3 } from './math3d';
import type { Geo3DScene, Tool3DId, Vec3 } from './types3d';
import type {
  Challenge3DDefinition,
  CognitiveTier3D,
  SolutionStep3D,
  Validation3DRule,
} from './validator3d';

export const BASIC_3D_TOOLS: Tool3DId[] = [
  'select',
  'pan_orbit',
  'point_free',
  'point_coords',
  'point_on_line',
  'point_on_segment',
  'point_on_plane',
  'midpoint',
  'segment',
  'line',
  'ray',
  'plane_3pts',
  'polygon',
  'solid_library',
];

export const ALL_3D_TOOLS: Tool3DId[] = [
  ...BASIC_3D_TOOLS,
  'vector',
  'intersect_ll',
  'intersect_lp',
  'foot_line',
  'foot_plane',
  'reflect_point',
  'reflect_plane',
  'parallel_line',
  'perp_line_plane',
  'line_dir_vector',
  'intersect_pp',
  'common_perp',
  'plane_line_pt',
  'plane_2lines_inter',
  'plane_2lines_para',
  'plane_parallel',
  'plane_perp_line',
  'plane_normal',
  'plane_equation',
  'cross_section',
  'measure_length',
  'measure_angle_vec',
  'measure_angle_ll',
  'measure_angle_lp',
  'measure_angle_pp',
  'measure_dihedral',
  'measure_dist_pl',
  'measure_dist_pplane',
  'measure_dist_skew',
  'measure_dist_planes',
];

export function tierForOrder(order: number): {
  cognitiveTier: CognitiveTier3D;
  difficulty: Challenge3DDefinition['difficulty'];
} {
  if (order <= 3) return { cognitiveTier: 'Nhận biết', difficulty: 'Cơ bản' };
  if (order <= 7) return { cognitiveTier: 'Thông hiểu', difficulty: 'Trung bình' };
  if (order <= 9) return { cognitiveTier: 'Vận dụng', difficulty: 'Khá' };
  return { cognitiveTier: 'Tổng hợp', difficulty: 'Nâng cao' };
}

export function givenPointsScene(
  pts: Array<{ id: string; label: string; pos: Vec3 }>,
  mode: Geo3DScene['displayMode'] = 'sgk',
  showAxes = true
): Geo3DScene {
  const sc = createEmptyScene3D();
  sc.displayMode = mode;
  sc.showAxes = showAxes;
  sc.showCoordPlanes = mode === 'oxyz';
  let cur = sc;
  for (const p of pts) {
    cur = addGeo3DObject(cur, {
      id: p.id,
      kind: 'point',
      rule: 'free_point_3d',
      position: p.pos,
      label: p.label,
      style: { color: '#0F766E', isGiven: true },
      skipLog: true,
    }).scene;
  }
  return cur;
}

export function addGivenSeg(sc: Geo3DScene, id: string, a: string, b: string, label?: string, dashed = false): Geo3DScene {
  return addGeo3DObject(sc, {
    id,
    kind: 'segment',
    rule: 'segment_3d',
    parents: [a, b],
    label: label ?? `${a}${b}`,
    style: { color: '#1E293B', isGiven: true, dashed },
    skipLog: true,
  }).scene;
}

export function addGivenLine(sc: Geo3DScene, id: string, a: string, b: string, label: string, color = '#0284C7'): Geo3DScene {
  return addGeo3DObject(sc, {
    id,
    kind: 'line',
    rule: 'line_two_points',
    parents: [a, b],
    label,
    style: { color, isGiven: true },
    skipLog: true,
  }).scene;
}

export function addGivenPlane3(sc: Geo3DScene, id: string, a: string, b: string, c: string, label: string, color = '#0EA5E9', opacity = 0.14): Geo3DScene {
  return addGeo3DObject(sc, {
    id,
    kind: 'plane',
    rule: 'plane_three_points',
    parents: [a, b, c],
    label,
    style: { color, opacity, isGiven: true },
    skipLog: true,
  }).scene;
}

/** Build a classic tetrahedron S.ABC with given vertices & wireframe edges */
export function buildTetrahedronScene(opts?: {
  sPos?: Vec3;
  aPos?: Vec3;
  bPos?: Vec3;
  cPos?: Vec3;
  withBasePlane?: boolean;
  mode?: Geo3DScene['displayMode'];
}): Geo3DScene {
  let sc = givenPointsScene(
    [
      { id: 'A', label: 'A', pos: opts?.aPos ?? v3(-2.4, -1.6, 0) },
      { id: 'B', label: 'B', pos: opts?.bPos ?? v3(2.4, -1.6, 0) },
      { id: 'C', label: 'C', pos: opts?.cPos ?? v3(0.4, 2.2, 0) },
      { id: 'S', label: 'S', pos: opts?.sPos ?? v3(-0.3, -0.2, 3.8) },
    ],
    opts?.mode ?? 'sgk',
    opts?.mode === 'oxyz'
  );
  sc = addGivenSeg(sc, 'eAB', 'A', 'B', 'AB');
  sc = addGivenSeg(sc, 'eBC', 'B', 'C', 'BC');
  sc = addGivenSeg(sc, 'eCA', 'C', 'A', 'CA', true);
  sc = addGivenSeg(sc, 'eSA', 'S', 'A', 'SA');
  sc = addGivenSeg(sc, 'eSB', 'S', 'B', 'SB');
  sc = addGivenSeg(sc, 'eSC', 'S', 'C', 'SC');
  if (opts?.withBasePlane) {
    sc = addGivenPlane3(sc, 'plABC', 'A', 'B', 'C', '(ABC)', '#0F766E', 0.12);
  }
  return sc;
}

/** Build a square pyramid S.ABCD (optionally SA ⊥ (ABCD)) */
export function buildPyramidABCDScene(opts?: {
  saPerpBase?: boolean;
  a?: number;
  h?: number;
  withBasePlane?: boolean;
  mode?: Geo3DScene['displayMode'];
}): Geo3DScene {
  const half = (opts?.a ?? 3.6) / 2;
  const h = opts?.h ?? 4;
  const sPos = opts?.saPerpBase ? v3(-half, -half, h) : v3(0, 0, h);
  let sc = givenPointsScene(
    [
      { id: 'A', label: 'A', pos: v3(-half, -half, 0) },
      { id: 'B', label: 'B', pos: v3(half, -half, 0) },
      { id: 'C', label: 'C', pos: v3(half, half, 0) },
      { id: 'D', label: 'D', pos: v3(-half, half, 0) },
      { id: 'S', label: 'S', pos: sPos },
    ],
    opts?.mode ?? 'sgk',
    opts?.mode === 'oxyz'
  );
  sc = addGivenSeg(sc, 'eAB', 'A', 'B', 'AB');
  sc = addGivenSeg(sc, 'eBC', 'B', 'C', 'BC');
  sc = addGivenSeg(sc, 'eCD', 'C', 'D', 'CD', true);
  sc = addGivenSeg(sc, 'eDA', 'D', 'A', 'DA', true);
  sc = addGivenSeg(sc, 'eSA', 'S', 'A', 'SA');
  sc = addGivenSeg(sc, 'eSB', 'S', 'B', 'SB');
  sc = addGivenSeg(sc, 'eSC', 'S', 'C', 'SC');
  sc = addGivenSeg(sc, 'eSD', 'S', 'D', 'SD', true);
  if (opts?.withBasePlane) {
    sc = addGivenPlane3(sc, 'plABCD', 'A', 'B', 'C', '(ABCD)', '#0F766E', 0.12);
  }
  return sc;
}

/** Build a cube or rectangular box ABCD.A'B'C'D' with explicit labeled vertex points */
export function buildBoxVerticesScene(opts?: {
  lx?: number;
  ly?: number;
  lz?: number;
  withBasePlane?: boolean;
  withTopPlane?: boolean;
  withSolid?: boolean;
  mode?: Geo3DScene['displayMode'];
}): Geo3DScene {
  const lx = opts?.lx ?? 3;
  const ly = opts?.ly ?? 3;
  const lz = opts?.lz ?? 3;
  const mode = opts?.mode ?? 'sgk';
  let sc = givenPointsScene(
    [
      { id: 'A', label: 'A', pos: v3(0, 0, 0) },
      { id: 'B', label: 'B', pos: v3(lx, 0, 0) },
      { id: 'C', label: 'C', pos: v3(lx, ly, 0) },
      { id: 'D', label: 'D', pos: v3(0, ly, 0) },
      { id: 'A1', label: "A'", pos: v3(0, 0, lz) },
      { id: 'B1', label: "B'", pos: v3(lx, 0, lz) },
      { id: 'C1', label: "C'", pos: v3(lx, ly, lz) },
      { id: 'D1', label: "D'", pos: v3(0, ly, lz) },
    ],
    mode,
    mode === 'oxyz'
  );
  sc = addGivenSeg(sc, 'eAB', 'A', 'B', 'AB');
  sc = addGivenSeg(sc, 'eBC', 'B', 'C', 'BC');
  sc = addGivenSeg(sc, 'eCD', 'C', 'D', 'CD', true);
  sc = addGivenSeg(sc, 'eDA', 'D', 'A', 'DA', true);
  sc = addGivenSeg(sc, 'eA1B1', 'A1', 'B1', "A'B'");
  sc = addGivenSeg(sc, 'eB1C1', 'B1', 'C1', "B'C'");
  sc = addGivenSeg(sc, 'eC1D1', 'C1', 'D1', "C'D'");
  sc = addGivenSeg(sc, 'eD1A1', 'D1', 'A1', "D'A'");
  sc = addGivenSeg(sc, 'eAA1', 'A', 'A1', "AA'", true);
  sc = addGivenSeg(sc, 'eBB1', 'B', 'B1', "BB'");
  sc = addGivenSeg(sc, 'eCC1', 'C', 'C1', "CC'");
  sc = addGivenSeg(sc, 'eDD1', 'D', 'D1', "DD'");
  if (opts?.withBasePlane) {
    sc = addGivenPlane3(sc, 'plBase', 'A', 'B', 'C', '(ABCD)', '#0F766E', 0.11);
  }
  if (opts?.withTopPlane) {
    sc = addGivenPlane3(sc, 'plTop', 'A1', 'B1', 'C1', "(A'B'C'D')", '#0284C7', 0.11);
  }
  if (opts?.withSolid) {
    sc = addGeo3DObject(sc, {
      id: 'solidBox',
      kind: 'solid',
      rule: lx === ly && ly === lz ? 'solid_cube' : 'solid_box',
      solidType: lx === ly && ly === lz ? 'cube' : 'box',
      center: v3(lx / 2, ly / 2, 0),
      params: lx === ly && ly === lz ? { a: lx } : { a: lx, b: ly, c: lz },
      label: lx === ly && ly === lz ? "Lập phương ABCD.A'B'C'D'" : "Hình hộp ABCD.A'B'C'D'",
      style: { color: '#0F766E', opacity: 0.14, isGiven: true },
      skipLog: true,
    }).scene;
  }
  return sc;
}

/** Build a triangular prism ABC.A'B'C' */
export function buildTriPrismScene(opts?: { right?: boolean; withBasePlane?: boolean }): Geo3DScene {
  const skewX = opts?.right === false ? 1.1 : 0;
  const skewY = opts?.right === false ? 0.6 : 0;
  let sc = givenPointsScene([
    { id: 'A', label: 'A', pos: v3(-2, -1.4, 0) },
    { id: 'B', label: 'B', pos: v3(2, -1.4, 0) },
    { id: 'C', label: 'C', pos: v3(0, 1.8, 0) },
    { id: 'A1', label: "A'", pos: v3(-2 + skewX, -1.4 + skewY, 3.6) },
    { id: 'B1', label: "B'", pos: v3(2 + skewX, -1.4 + skewY, 3.6) },
    { id: 'C1', label: "C'", pos: v3(0 + skewX, 1.8 + skewY, 3.6) },
  ]);
  sc = addGivenSeg(sc, 'eAB', 'A', 'B', 'AB');
  sc = addGivenSeg(sc, 'eBC', 'B', 'C', 'BC');
  sc = addGivenSeg(sc, 'eCA', 'C', 'A', 'CA', true);
  sc = addGivenSeg(sc, 'eA1B1', 'A1', 'B1', "A'B'");
  sc = addGivenSeg(sc, 'eB1C1', 'B1', 'C1', "B'C'");
  sc = addGivenSeg(sc, 'eC1A1', 'C1', 'A1', "C'A'");
  sc = addGivenSeg(sc, 'eAA1', 'A', 'A1', "AA'");
  sc = addGivenSeg(sc, 'eBB1', 'B', 'B1', "BB'");
  sc = addGivenSeg(sc, 'eCC1', 'C', 'C1', "CC'");
  if (opts?.withBasePlane) {
    sc = addGivenPlane3(sc, 'plABC', 'A', 'B', 'C', '(ABC)', '#0F766E', 0.12);
  }
  return sc;
}

export interface CompactChallenge3DSpec {
  levelId: number;
  order: number;
  curriculumTag: 'Toán 11' | 'Toán 12';
  knowledgeTopic: string;
  title: string;
  description: string;
  hypothesis: string;
  goal: string;
  allowedTools?: Tool3DId[];
  setup: () => Geo3DScene;
  rules: Validation3DRule[];
  perturb?: string[];
  hints: [string, string, string];
  steps: SolutionStep3D[];
  proof: string;
}

export function makeChallenge3D(spec: CompactChallenge3DSpec): Challenge3DDefinition {
  const { cognitiveTier, difficulty } = tierForOrder(spec.order);
  return {
    id: `S3D_L${String(spec.levelId).padStart(2, '0')}_C${String(spec.order).padStart(2, '0')}`,
    levelId: spec.levelId,
    order: spec.order,
    title: spec.title,
    description: spec.description,
    hypothesis: spec.hypothesis,
    goal: spec.goal,
    knowledgeTopic: spec.knowledgeTopic,
    difficulty,
    cognitiveTier,
    curriculumTag: spec.curriculumTag,
    allowedTools: spec.allowedTools ?? ALL_3D_TOOLS,
    targetSteps: Math.max(1, spec.steps.length),
    buildInitialScene: spec.setup,
    validationRules: spec.rules,
    perturbFreePointIds: spec.perturb ?? [],
    hints: spec.hints,
    solutionSteps: spec.steps,
    proof: spec.proof,
  };
}
