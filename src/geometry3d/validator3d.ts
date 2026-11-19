import { addGeo3DObject, cloneScene3D, recomputeScene3D } from './engine3d';
import {
  analyzeLineLineRelation,
  analyzeLinePlaneRelation,
  analyzePlanePlaneRelation,
  cross3,
  dist3,
  dot3,
  midpoint3,
  norm3,
  normalize3,
  projectPointToLine,
  projectPointToPlane,
  reflectPointAcrossPlane,
  reflectPointAcrossPoint,
  sub3,
  v3,
} from './math3d';
import type { Geo3DObject, Geo3DPoint, Geo3DScene, Tool3DId, Vec3 } from './types3d';

export type Validation3DRuleType =
  | 'has_point_at_coords'
  | 'has_midpoint_of'
  | 'has_segment_between'
  | 'has_segment_between_midpoints'
  | 'has_line_through'
  | 'has_vector_between'
  | 'has_vector_with_components'
  | 'has_plane_through_points'
  | 'has_plane_equation'
  | 'has_line_parallel_to_through'
  | 'has_plane_parallel_to_through'
  | 'has_intersection_line_planes'
  | 'has_intersection_line_plane'
  | 'has_line_perp_plane_through'
  | 'has_plane_perp_line_through'
  | 'has_foot_on_plane'
  | 'has_foot_on_line'
  | 'has_reflect_point_plane'
  | 'has_reflect_point_point'
  | 'has_common_perpendicular'
  | 'has_cross_section_with_min_verts'
  | 'has_solid_of_type'
  | 'has_measurement_of_rule'
  | 'has_polygon_with_vertices';

export interface Validation3DRule {
  type: Validation3DRuleType;
  refs: string[];
  params?: Record<string, number | string>;
  description: string;
}

export interface SolutionStep3D {
  id: string;
  actionText: string;
  mathExplanation: string;
  addInput: Parameters<typeof addGeo3DObject>[1];
}

export interface Challenge3DDefinition {
  id: string;
  levelId: number;
  order: number;
  title: string;
  description: string;
  hypothesis: string;
  goal: string;
  difficulty: 'Cơ bản' | 'Trung bình' | 'Khá' | 'Nâng cao';
  curriculumTag: 'Toán 11' | 'Toán 12' | 'Kiến thức mở rộng';
  allowedTools: Tool3DId[];
  targetSteps: number;
  buildInitialScene: () => Geo3DScene;
  validationRules: Validation3DRule[];
  perturbFreePointIds: string[];
  hints: [string, string, string];
  solutionSteps: SolutionStep3D[];
  proof: string;
}

export type Validation3DStatus =
  | 'passed'
  | 'missing_object'
  | 'invalid_object'
  | 'condition_failed'
  | 'unstable';

export interface Validation3DReport {
  status: Validation3DStatus;
  passed: boolean;
  stars: 0 | 1 | 2 | 3;
  usedSteps: number;
  targetSteps: number;
  configsPassed: number;
  configsTotal: number;
  message: string;
  details: string[];
  proofDisclaimer: string;
}

function getPt(scene: Geo3DScene, id: string): Vec3 | null {
  const o = scene.objects[id];
  return o && o.kind === 'point' && o.valid ? o.position : null;
}

function getLine(scene: Geo3DScene, id: string): { origin: Vec3; direction: Vec3 } | null {
  const o = scene.objects[id];
  if (!o || !o.valid) return null;
  if (o.kind === 'line' || o.kind === 'ray') return { origin: o.origin, direction: o.direction };
  if (o.kind === 'segment') {
    const d = normalize3(sub3(o.p2, o.p1));
    return d ? { origin: o.p1, direction: d } : null;
  }
  return null;
}

function getPlane(scene: Geo3DScene, id: string): { normal: Vec3; d: number } | null {
  const o = scene.objects[id];
  if (!o || !o.valid) return null;
  if (o.kind === 'plane') return { normal: o.normal, d: o.d };
  if (o.kind === 'polygon' && o.vertices.length >= 3) {
    const n = normalize3(o.normal);
    if (!n) return null;
    return { normal: n, d: -dot3(n, o.vertices[0]) };
  }
  return null;
}

function checkSingleRule(scene: Geo3DScene, rule: Validation3DRule): boolean {
  const userObjects: Geo3DObject[] = scene.order
    .map((id) => scene.objects[id])
    .filter((o): o is Geo3DObject => Boolean(o && o.valid && !o.style.isGiven));
  const allValid: Geo3DObject[] = scene.order
    .map((id) => scene.objects[id])
    .filter((o): o is Geo3DObject => Boolean(o && o.valid));

  const tol = 0.08;

  switch (rule.type) {
    case 'has_point_at_coords': {
      const target = v3(Number(rule.params?.x ?? 0), Number(rule.params?.y ?? 0), Number(rule.params?.z ?? 0));
      return userObjects.some((o) => o.kind === 'point' && dist3(o.position, target) < tol);
    }

    case 'has_midpoint_of': {
      const a = getPt(scene, rule.refs[0]);
      const b = getPt(scene, rule.refs[1]);
      if (!a || !b) return false;
      const mid = midpoint3(a, b);
      return userObjects.some((o) => o.kind === 'point' && dist3(o.position, mid) < tol);
    }

    case 'has_segment_between': {
      const a = getPt(scene, rule.refs[0]);
      const b = getPt(scene, rule.refs[1]);
      if (!a || !b) return false;
      return userObjects.some(
        (o) =>
          o.kind === 'segment' &&
          ((dist3(o.p1, a) < tol && dist3(o.p2, b) < tol) || (dist3(o.p1, b) < tol && dist3(o.p2, a) < tol))
      );
    }

    case 'has_segment_between_midpoints': {
      const a1 = getPt(scene, rule.refs[0]);
      const b1 = getPt(scene, rule.refs[1]);
      const a2 = getPt(scene, rule.refs[2]);
      const b2 = getPt(scene, rule.refs[3]);
      if (!a1 || !b1 || !a2 || !b2) return false;
      const m1 = midpoint3(a1, b1);
      const m2 = midpoint3(a2, b2);
      return userObjects.some(
        (o) =>
          o.kind === 'segment' &&
          ((dist3(o.p1, m1) < tol && dist3(o.p2, m2) < tol) || (dist3(o.p1, m2) < tol && dist3(o.p2, m1) < tol))
      );
    }

    case 'has_line_through': {
      const a = getPt(scene, rule.refs[0]);
      const b = getPt(scene, rule.refs[1]);
      if (!a || !b) return false;
      const expectedDir = normalize3(sub3(b, a));
      if (!expectedDir) return false;
      return userObjects.some((o) => {
        if (o.kind !== 'line' && o.kind !== 'segment' && o.kind !== 'ray') return false;
        const l = getLine(scene, o.id);
        if (!l) return false;
        const dA = projectPointToLine(a, l.origin, l.direction).distance;
        const dB = projectPointToLine(b, l.origin, l.direction).distance;
        return dA < tol && dB < tol;
      });
    }

    case 'has_vector_between': {
      const a = getPt(scene, rule.refs[0]);
      const b = getPt(scene, rule.refs[1]);
      if (!a || !b) return false;
      const expected = sub3(b, a);
      return userObjects.some(
        (o) => o.kind === 'vector' && dist3(o.components, expected) < tol
      );
    }

    case 'has_vector_with_components': {
      const expected = v3(Number(rule.params?.vx ?? 0), Number(rule.params?.vy ?? 0), Number(rule.params?.vz ?? 0));
      return userObjects.some((o) => o.kind === 'vector' && dist3(o.components, expected) < tol);
    }

    case 'has_plane_through_points': {
      const pts = rule.refs.map((id) => getPt(scene, id)).filter((p): p is Vec3 => Boolean(p));
      if (pts.length < 3) return false;
      return userObjects.some((o) => {
        if (o.kind !== 'plane' && o.kind !== 'polygon') return false;
        const pl = getPlane(scene, o.id);
        if (!pl) return false;
        return pts.every((p) => Math.abs(dot3(pl.normal, p) + pl.d) < tol);
      });
    }

    case 'has_plane_equation': {
      const a = Number(rule.params?.a ?? 0);
      const b = Number(rule.params?.b ?? 0);
      const c = Number(rule.params?.c ?? 1);
      const dVal = Number(rule.params?.d ?? 0);
      const len = Math.hypot(a, b, c);
      if (len < 1e-6) return false;
      const nExp = v3(a / len, b / len, c / len);
      const dExp = dVal / len;
      return userObjects.some((o) => {
        if (o.kind !== 'plane') return false;
        const rel = analyzePlanePlaneRelation(o.normal, o.d, nExp, dExp);
        return rel.relation === 'coincident';
      });
    }

    case 'has_line_parallel_to_through': {
      const pt = getPt(scene, rule.refs[0]);
      const refL = getLine(scene, rule.refs[1]);
      if (!pt || !refL) return false;
      return userObjects.some((o) => {
        if (o.kind !== 'line') return false;
        const crossLen = norm3(cross3(o.direction, refL.direction));
        const dPt = projectPointToLine(pt, o.origin, o.direction).distance;
        return crossLen < 0.03 && dPt < tol;
      });
    }

    case 'has_plane_parallel_to_through': {
      const pt = getPt(scene, rule.refs[0]);
      const refPl = getPlane(scene, rule.refs[1]);
      if (!pt || !refPl) return false;
      return userObjects.some((o) => {
        if (o.kind !== 'plane') return false;
        const crossLen = norm3(cross3(o.normal, refPl.normal));
        const dPt = Math.abs(dot3(o.normal, pt) + o.d);
        return crossLen < 0.03 && dPt < tol;
      });
    }

    case 'has_intersection_line_planes': {
      const p1 = getPlane(scene, rule.refs[0]);
      const p2 = getPlane(scene, rule.refs[1]);
      if (!p1 || !p2) return false;
      const rel = analyzePlanePlaneRelation(p1.normal, p1.d, p2.normal, p2.d);
      if (rel.relation !== 'intersecting' || !rel.intersectionOrigin || !rel.intersectionDir) return false;
      return userObjects.some((o) => {
        if (o.kind !== 'line' && o.kind !== 'segment') return false;
        const l = getLine(scene, o.id);
        if (!l) return false;
        const cmp = analyzeLineLineRelation(l.origin, l.direction, rel.intersectionOrigin!, rel.intersectionDir!);
        return cmp.relation === 'coincident';
      });
    }

    case 'has_intersection_line_plane': {
      const l = getLine(scene, rule.refs[0]);
      const pl = getPlane(scene, rule.refs[1]);
      if (!l || !pl) return false;
      const rel = analyzeLinePlaneRelation(l.origin, l.direction, pl.normal, pl.d);
      if (rel.relation !== 'intersecting' || !rel.intersection) return false;
      return userObjects.some((o) => o.kind === 'point' && dist3(o.position, rel.intersection!) < tol);
    }

    case 'has_line_perp_plane_through': {
      const pt = getPt(scene, rule.refs[0]);
      const pl = getPlane(scene, rule.refs[1]);
      if (!pt || !pl) return false;
      return userObjects.some((o) => {
        if (o.kind !== 'line' && o.kind !== 'segment') return false;
        const l = getLine(scene, o.id);
        if (!l) return false;
        const crossLen = norm3(cross3(l.direction, pl.normal));
        const dPt = projectPointToLine(pt, l.origin, l.direction).distance;
        return crossLen < 0.03 && dPt < tol;
      });
    }

    case 'has_plane_perp_line_through': {
      const pt = getPt(scene, rule.refs[0]);
      const refL = getLine(scene, rule.refs[1]);
      if (!pt || !refL) return false;
      return userObjects.some((o) => {
        if (o.kind !== 'plane') return false;
        const crossLen = norm3(cross3(o.normal, refL.direction));
        const dPt = Math.abs(dot3(o.normal, pt) + o.d);
        return crossLen < 0.03 && dPt < tol;
      });
    }

    case 'has_foot_on_plane': {
      const pt = getPt(scene, rule.refs[0]);
      const pl = getPlane(scene, rule.refs[1]);
      if (!pt || !pl) return false;
      const { foot } = projectPointToPlane(pt, pl.normal, pl.d);
      return userObjects.some((o) => o.kind === 'point' && dist3(o.position, foot) < tol);
    }

    case 'has_foot_on_line': {
      const pt = getPt(scene, rule.refs[0]);
      const l = getLine(scene, rule.refs[1]);
      if (!pt || !l) return false;
      const { foot } = projectPointToLine(pt, l.origin, l.direction);
      return userObjects.some((o) => o.kind === 'point' && dist3(o.position, foot) < tol);
    }

    case 'has_reflect_point_plane': {
      const pt = getPt(scene, rule.refs[0]);
      const pl = getPlane(scene, rule.refs[1]);
      if (!pt || !pl) return false;
      const img = reflectPointAcrossPlane(pt, pl.normal, pl.d);
      return userObjects.some((o) => o.kind === 'point' && dist3(o.position, img) < tol);
    }

    case 'has_reflect_point_point': {
      const pt = getPt(scene, rule.refs[0]);
      const c = getPt(scene, rule.refs[1]);
      if (!pt || !c) return false;
      const img = reflectPointAcrossPoint(pt, c);
      return userObjects.some((o) => o.kind === 'point' && dist3(o.position, img) < tol);
    }

    case 'has_common_perpendicular': {
      const l1 = getLine(scene, rule.refs[0]);
      const l2 = getLine(scene, rule.refs[1]);
      if (!l1 || !l2) return false;
      const rel = analyzeLineLineRelation(l1.origin, l1.direction, l2.origin, l2.direction);
      if (rel.relation !== 'skew' || !rel.closestP1 || !rel.closestP2) return false;
      const expDir = normalize3(sub3(rel.closestP2, rel.closestP1));
      if (!expDir) return false;
      return userObjects.some((o) => {
        if (o.kind !== 'line' && o.kind !== 'segment') return false;
        const l = getLine(scene, o.id);
        if (!l) return false;
        const cmp = analyzeLineLineRelation(l.origin, l.direction, rel.closestP1!, expDir);
        return cmp.relation === 'coincident';
      });
    }

    case 'has_cross_section_with_min_verts': {
      const minV = Number(rule.params?.minVerts ?? 3);
      return userObjects.some(
        (o) => o.kind === 'cross_section' && o.vertices.length >= minV && o.area > 1e-3
      );
    }

    case 'has_solid_of_type': {
      const st = String(rule.params?.solidType ?? 'cube');
      return allValid.some((o) => o.kind === 'solid' && !o.style.isGiven && o.solidType === st);
    }

    case 'has_measurement_of_rule': {
      const rName = String(rule.params?.rule ?? '');
      return userObjects.some((o) => o.kind === 'measurement' && o.rule === rName);
    }

    case 'has_polygon_with_vertices': {
      const minV = Number(rule.params?.minVerts ?? 3);
      return userObjects.some((o) => o.kind === 'polygon' && o.vertices.length >= minV && o.area > 1e-3);
    }
  }
}

/**
 * Dynamic 3D geometric validation across multiple perturbed non-degenerate configurations.
 * Implements all 8 steps and all 5 Vietnamese status messages from Section XXVI.
 */
export function validateChallenge3D(
  challenge: Challenge3DDefinition,
  scene: Geo3DScene
): Validation3DReport {
  const proofDisclaimer =
    'Lưu ý: Kiểm chứng bằng số trên nhiều cấu hình động xác nhận tính ổn định của phép dựng nhưng không thay thế cho chứng minh toán học tổng quát.';

  const userObjects = scene.order
    .map((id) => scene.objects[id])
    .filter((o): o is Geo3DObject => Boolean(o && !o.style.isGiven));
  const usedSteps = userObjects.length;

  if (usedSteps === 0) {
    return {
      status: 'missing_object',
      passed: false,
      stars: 0,
      usedSteps,
      targetSteps: challenge.targetSteps,
      configsPassed: 0,
      configsTotal: 1,
      message: 'Thiếu đối tượng cần dựng.',
      details: ['Bạn chưa dựng thêm đối tượng nào trên không gian 3D. Hãy đọc mục tiêu dựng hình và thực hiện phép dựng.'],
      proofDisclaimer,
    };
  }

  const invalidUserObjs = userObjects.filter((o) => !o.valid);
  if (invalidUserObjs.length > 0) {
    return {
      status: 'invalid_object',
      passed: false,
      stars: 0,
      usedSteps,
      targetSteps: challenge.targetSteps,
      configsPassed: 0,
      configsTotal: 1,
      message: 'Có đối tượng không hợp lệ.',
      details: invalidUserObjs.map((o) => `${o.label}: ${o.errorMessage ?? 'Quan hệ hình học bị suy biến.'}`),
      proofDisclaimer,
    };
  }

  // Check on current configuration first
  const currentResults = challenge.validationRules.map((r) => ({
    rule: r,
    ok: checkSingleRule(scene, r),
  }));
  const failedCurrent = currentResults.filter((x) => !x.ok);
  if (failedCurrent.length > 0) {
    return {
      status: 'condition_failed',
      passed: false,
      stars: 0,
      usedSteps,
      targetSteps: challenge.targetSteps,
      configsPassed: 0,
      configsTotal: 1,
      message: 'Chưa thỏa mãn một hoặc nhiều quan hệ hình học.',
      details: failedCurrent.map((x) => `Chưa đạt: ${x.rule.description}`),
      proofDisclaimer,
    };
  }

  // Perturb free given points across deterministic non-degenerate configurations
  const perturbOffsets: Vec3[] = [
    v3(0.45, -0.35, 0.25),
    v3(-0.5, 0.4, -0.2),
    v3(0.3, 0.55, 0.35),
    v3(-0.4, -0.45, 0.4),
    v3(0.6, 0.2, -0.35),
    v3(-0.35, 0.3, 0.5),
  ];

  const freeIds = challenge.perturbFreePointIds.filter(
    (id) => scene.objects[id]?.kind === 'point'
  );
  const totalConfigs = freeIds.length > 0 ? perturbOffsets.length + 1 : 1;
  let passedConfigs = 1;

  if (freeIds.length > 0) {
    for (let i = 0; i < perturbOffsets.length; i++) {
      const cloned = cloneScene3D(scene);
      const off = perturbOffsets[i];
      freeIds.forEach((pid, pIdx) => {
        const pt = cloned.objects[pid] as Geo3DPoint | undefined;
        if (!pt || pt.kind !== 'point') return;
        const sign = pIdx % 2 === 0 ? 1 : -1;
        pt.position = {
          x: pt.position.x + off.x * sign * (1 + 0.15 * pIdx),
          y: pt.position.y + off.y * (pIdx % 3 === 0 ? 1 : -0.8),
          z: pt.position.z + off.z * (pIdx % 2 === 0 ? 0.7 : -0.9),
        };
      });
      const recomputed = recomputeScene3D(cloned);
      const allOk = challenge.validationRules.every((r) => checkSingleRule(recomputed, r));
      if (allOk) passedConfigs += 1;
    }
  }

  if (passedConfigs < totalConfigs) {
    return {
      status: 'unstable',
      passed: false,
      stars: 0,
      usedSteps,
      targetSteps: challenge.targetSteps,
      configsPassed: passedConfigs,
      configsTotal: totalConfigs,
      message: 'Phép dựng chưa ổn định khi thay đổi giả thiết.',
      details: [
        `Đạt ${passedConfigs}/${totalConfigs} cấu hình biến động. Hãy kiểm tra lại xem đối tượng đã được dựng bằng công cụ ràng buộc hình học đúng chưa thay vì đặt điểm rời rạc.`,
      ],
      proofDisclaimer,
    };
  }

  // Passed! Compute 3-star rating for 3D (strictly separate from 2D 540-star system)
  const stars: 1 | 2 | 3 =
    usedSteps <= challenge.targetSteps ? 3 : usedSteps <= challenge.targetSteps + 2 ? 2 : 1;

  return {
    status: 'passed',
    passed: true,
    stars,
    usedSteps,
    targetSteps: challenge.targetSteps,
    configsPassed: passedConfigs,
    configsTotal: totalConfigs,
    message: 'Phép dựng thỏa mãn các điều kiện đã kiểm tra.',
    details: [
      `Kiểm chứng thành công trên ${passedConfigs}/${totalConfigs} cấu hình không suy biến.`,
      `Số bước dựng: ${usedSteps} (mục tiêu tối ưu: ≤ ${challenge.targetSteps} bước).`,
    ],
    proofDisclaimer,
  };
}
