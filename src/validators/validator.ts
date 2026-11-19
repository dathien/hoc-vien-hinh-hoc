import { addGeoObject, cloneScene, computeSceneCosts, createEmptyScene, recomputeScene } from '../geometry/engine';
import {
  angleDegrees,
  areCollinear,
  areParallel,
  arePerpendicular,
  centroid,
  circumcenter,
  dist,
  homothetyPoint,
  incenter,
  inradius,
  isEquilateralTriangle,
  isIsoscelesTriangle,
  lineEquation,
  midpointVec,
  orthocenter,
  pointsEqual,
  pointOnLineLike,
  projectPointToLine,
  reflectPointOverLine,
  reflectPointOverPoint,
  relativeEps,
  rotatePoint,
  signedDistPointToLine,
  tangentPointsFromExternalPoint,
  translatePoint,
} from '../geometry/math';
import type { GeoCircle, GeoLineLike, GeoPoint, GeoScene, ToolId, Vec2 } from '../geometry/types';
import type {
  ChallengeDefinition,
  ValidationDiagnostic,
  ValidationReport,
  ValidationRule,
} from './types';

const GOLDEN_PHI = (1 + Math.sqrt(5)) / 2;

/** Build an initial GeoScene from a ChallengeDefinition */
export function buildInitialScene(challenge: ChallengeDefinition): GeoScene {
  let scene = createEmptyScene();
  for (const spec of challenge.initialGeometry) {
    const res = addGeoObject(scene, {
      id: spec.id,
      kind: spec.kind,
      rule: spec.rule,
      parents: spec.parents,
      label: spec.label,
      x: spec.x,
      y: spec.y,
      params: spec.params,
      style: {
        color: spec.kind === 'point' ? '#172033' : '#0284C7',
        strokeWidth: 2.5,
        isGiven: true,
        ...spec.style,
      },
      skipLog: true,
    });
    scene = res.scene;
  }
  return recomputeScene(scene);
}

/** Execute a challenge's canonical solutionSteps on top of its initial scene */
export function buildSolutionScene(challenge: ChallengeDefinition, maxSteps?: number): GeoScene {
  let scene = buildInitialScene(challenge);
  const limit = maxSteps ?? challenge.solutionSteps.length;
  for (let i = 0; i < Math.min(limit, challenge.solutionSteps.length); i++) {
    const step = challenge.solutionSteps[i];
    const res = addGeoObject(scene, {
      id: step.id,
      kind: step.kind,
      rule: step.rule,
      parents: step.parents,
      params: step.params,
      label: step.label,
      tool: step.tool,
      style: {
        color: step.isAuxiliary ? '#94A3B8' : '#0F766E',
        dash: step.isAuxiliary ? 'dashed' : 'solid',
        strokeWidth: step.isAuxiliary ? 1.6 : 2.6,
        isAuxiliary: !!step.isAuxiliary,
      },
      logDescription: step.actionText,
    });
    scene = res.scene;
  }
  return recomputeScene(scene);
}

function getValidPoints(scene: GeoScene): GeoPoint[] {
  return scene.order
    .map((id) => scene.objects[id])
    .filter((o): o is GeoPoint => !!o && o.kind === 'point' && o.valid);
}

function getValidLines(scene: GeoScene): GeoLineLike[] {
  return scene.order
    .map((id) => scene.objects[id])
    .filter(
      (o): o is GeoLineLike =>
        !!o &&
        o.valid &&
        (o.kind === 'line' || o.kind === 'segment' || o.kind === 'ray')
    );
}

function getValidCircles(scene: GeoScene): GeoCircle[] {
  return scene.order
    .map((id) => scene.objects[id])
    .filter((o): o is GeoCircle => !!o && o.kind === 'circle' && o.valid);
}

function getPt(scene: GeoScene, id: string): GeoPoint | null {
  const o = scene.objects[id];
  return o && o.kind === 'point' && o.valid ? o : null;
}

function getLn(scene: GeoScene, id: string): GeoLineLike | null {
  const o = scene.objects[id];
  return o && (o.kind === 'line' || o.kind === 'segment' || o.kind === 'ray') && o.valid ? o : null;
}

function getCirc(scene: GeoScene, id: string): GeoCircle | null {
  const o = scene.objects[id];
  return o && o.kind === 'circle' && o.valid ? o : null;
}

function hasSegmentConnecting(scene: GeoScene, a: Vec2, b: Vec2, scale: number): boolean {
  const lines = getValidLines(scene);
  for (const l of lines) {
    if (l.kind === 'segment') {
      if (
        (pointsEqual(l.p1, a, scale) && pointsEqual(l.p2, b, scale)) ||
        (pointsEqual(l.p1, b, scale) && pointsEqual(l.p2, a, scale))
      ) {
        return true;
      }
    }
  }
  return false;
}

function hasLineMatching(scene: GeoScene, a: Vec2, b: Vec2, scale: number, allowSegment = true): boolean {
  const eq = lineEquation(a, b);
  if (!eq) return false;
  const tol = relativeEps(scale) * 5;
  for (const l of getValidLines(scene)) {
    if (!allowSegment && l.kind === 'segment') continue;
    if (
      Math.abs(signedDistPointToLine(l.p1, eq.a, eq.b, eq.c)) <= tol &&
      Math.abs(signedDistPointToLine(l.p2, eq.a, eq.b, eq.c)) <= tol
    ) {
      return true;
    }
  }
  return false;
}

function hasPointAt(scene: GeoScene, target: Vec2, scale: number, requireNonGiven = false): boolean {
  const tol = relativeEps(scale) * 5;
  for (const p of getValidPoints(scene)) {
    if (requireNonGiven && p.style.isGiven) continue;
    if (dist(p, target) <= tol) return true;
  }
  return false;
}

function hasCircleMatching(scene: GeoScene, center: Vec2, radius: number): boolean {
  const tol = relativeEps(Math.max(radius, 50)) * 5;
  for (const c of getValidCircles(scene)) {
    if (dist(c.center, center) <= tol && Math.abs(c.radius - radius) <= tol) {
      return true;
    }
  }
  return false;
}

/** Compute exact analytical target point(s) for formula-based rules */
export function computeTargetGeometry(
  scene: GeoScene,
  rule: ValidationRule
): { points?: Vec2[]; lines?: Array<[Vec2, Vec2]>; circles?: Array<{ c: Vec2; r: number }> } {
  const p0 = getPt(scene, rule.refs[0]);
  const p1 = getPt(scene, rule.refs[1]);
  const p2 = getPt(scene, rule.refs[2]);
  const p3 = getPt(scene, rule.refs[3]);
  const params = rule.params ?? {};

  switch (rule.type) {
    case 'point_at_target_formula': {
      const kind = String(params.formula ?? '');
      if (kind === 'fermat' && p0 && p1 && p2) {
        // Fermat-Torricelli point: if any angle >= 120 deg, it's that vertex
        const angA = angleDegrees(p1, p0, p2);
        const angB = angleDegrees(p0, p1, p2);
        const angC = angleDegrees(p0, p2, p1);
        if (angA >= 119.9) return { points: [p0] };
        if (angB >= 119.9) return { points: [p1] };
        if (angC >= 119.9) return { points: [p2] };
        // Outward equilateral vertices on AB and BC
        const orient = (p1.x - p0.x) * (p2.y - p0.y) - (p1.y - p0.y) * (p2.x - p0.x) >= 0 ? -1 : 1;
        const cOut = rotatePoint(p1, p0, orient * 60);
        const aOut = rotatePoint(p2, p1, orient * 60);
        const eq1 = lineEquation(p2, cOut);
        const eq2 = lineEquation(p0, aOut);
        if (eq1 && eq2) {
          const det = eq1.a * eq2.b - eq2.a * eq1.b;
          if (Math.abs(det) > 1e-9) {
            return {
              points: [
                {
                  x: (eq1.b * eq2.c - eq2.b * eq1.c) / det,
                  y: (eq2.a * eq1.c - eq1.a * eq2.c) / det,
                },
              ],
            };
          }
        }
      }
      if (kind === 'nine_point_center' && p0 && p1 && p2) {
        const o = circumcenter(p0, p1, p2);
        const h = orthocenter(p0, p1, p2);
        if (o && h) return { points: [midpointVec(o, h)] };
      }
      if (kind === 'napoleon_center' && p0 && p1 && p2) {
        return { points: [centroid(p0, p1, p2)] };
      }
      if (kind === 'harmonic_conjugate' && p0 && p1 && p2) {
        // D harmonic conjugate of C wrt A, B: (A,B;C,D) = -1
        const t =
          ((p2.x - p0.x) * (p1.x - p0.x) + (p2.y - p0.y) * (p1.y - p0.y)) /
          Math.max(1e-9, dist(p0, p1) ** 2);
        if (Math.abs(2 * t - 1) > 1e-6) {
          const s = t / (2 * t - 1);
          return {
            points: [{ x: p0.x + s * (p1.x - p0.x), y: p0.y + s * (p1.y - p0.y) }],
          };
        }
      }
      if (kind === 'nagel' && p0 && p1 && p2) {
        const a = dist(p1, p2);
        const b = dist(p0, p2);
        const c = dist(p0, p1);
        const s = (a + b + c) / 2;
        const wa = s - a;
        const wb = s - b;
        const wc = s - c;
        const sum = wa + wb + wc;
        if (sum > 1e-9) {
          return {
            points: [
              {
                x: (wa * p0.x + wb * p1.x + wc * p2.x) / sum,
                y: (wa * p0.y + wb * p1.y + wc * p2.y) / sum,
              },
            ],
          };
        }
      }
      if (kind === 'lemoine' && p0 && p1 && p2) {
        const a2 = dist(p1, p2) ** 2;
        const b2 = dist(p0, p2) ** 2;
        const c2 = dist(p0, p1) ** 2;
        const sum = a2 + b2 + c2;
        if (sum > 1e-9) {
          return {
            points: [
              {
                x: (a2 * p0.x + b2 * p1.x + c2 * p2.x) / sum,
                y: (a2 * p0.y + b2 * p1.y + c2 * p2.y) / sum,
              },
            ],
          };
        }
      }
      if (kind === 'excenter' && p0 && p1 && p2) {
        const a = dist(p1, p2);
        const b = dist(p0, p2);
        const c = dist(p0, p1);
        const denom = -a + b + c;
        if (Math.abs(denom) > 1e-9) {
          return {
            points: [
              {
                x: (-a * p0.x + b * p1.x + c * p2.x) / denom,
                y: (-a * p0.y + b * p1.y + c * p2.y) / denom,
              },
            ],
          };
        }
      }
      if (kind === 'parallelogram_fourth' && p0 && p1 && p2) {
        return {
          points: [
            { x: p1.x + p2.x - p0.x, y: p1.y + p2.y - p0.y },
            { x: p0.x + p2.x - p1.x, y: p0.y + p2.y - p1.y },
            { x: p0.x + p1.x - p2.x, y: p0.y + p1.y - p2.y },
          ],
        };
      }
      if (kind === 'inversion_point') {
        const c = getCirc(scene, rule.refs[0]);
        const p = getPt(scene, rule.refs[1]);
        if (c && p) {
          const d = dist(c.center, p);
          if (d > 1e-6) {
            const k = (c.radius * c.radius) / (d * d);
            return {
              points: [
                {
                  x: c.center.x + k * (p.x - c.center.x),
                  y: c.center.y + k * (p.y - c.center.y),
                },
              ],
            };
          }
        }
      }
      if (kind === 'geometric_mean_point' && p0 && p1 && p2) {
        const a = dist(p0, p1);
        const b = dist(p1, p2);
        const gm = Math.sqrt(a * b);
        const d02 = Math.max(1e-9, dist(p0, p2));
        const dir = { x: (p2.x - p0.x) / d02, y: (p2.y - p0.y) / d02 };
        const perp = { x: -dir.y, y: dir.x };
        return {
          points: [
            { x: p1.x + perp.x * gm, y: p1.y + perp.y * gm },
            { x: p1.x - perp.x * gm, y: p1.y - perp.y * gm },
          ],
        };
      }
      if (kind === 'equilateral_vertex' && p0 && p1) {
        return {
          points: [rotatePoint(p1, p0, 60), rotatePoint(p1, p0, -60)],
        };
      }
      if (kind === 'third_point_collinear_double' && p0 && p1) {
        return { points: [reflectPointOverPoint(p0, p1), reflectPointOverPoint(p1, p0)] };
      }
      if (kind === 'sangaku_tangent_circle_center' && p0 && p1) {
        const m = midpointVec(p0, p1);
        const R = dist(p0, p1) / 2;
        const dir = { x: (p1.x - p0.x) / Math.max(1e-9, 2 * R), y: (p1.y - p0.y) / Math.max(1e-9, 2 * R) };
        const perp = { x: -dir.y, y: dir.x };
        return {
          points: [
            { x: m.x + perp.x * (0.75 * R), y: m.y + perp.y * (0.75 * R) },
            { x: m.x - perp.x * (0.75 * R), y: m.y - perp.y * (0.75 * R) },
          ],
        };
      }
      if (kind === 'square_quarter_circle_center' && p0 && p1) {
        // Given segment AB = side of square; circle tangent to AB at midpoint and to top side of square => center at M + perp*(s/2), radius s/2
        const m = midpointVec(p0, p1);
        const s = dist(p0, p1);
        const dir = { x: (p1.x - p0.x) / Math.max(1e-9, s), y: (p1.y - p0.y) / Math.max(1e-9, s) };
        const perp = { x: -dir.y, y: dir.x };
        return {
          points: [
            { x: m.x + perp.x * (s / 2), y: m.y + perp.y * (s / 2) },
            { x: m.x - perp.x * (s / 2), y: m.y - perp.y * (s / 2) },
          ],
        };
      }
      if (kind === 'miquel_point' && p0 && p1 && p2 && p3) {
        // Miquel / circumcircle intersection or midpoint-based target
        const o1 = circumcenter(p0, p1, p3);
        const o2 = circumcenter(p1, p2, p3);
        if (o1 && o2) return { points: [o1, o2] };
      }
      if (p0 && p1 && p2 && p3 && kind === 'midpoint_quad') {
        return { points: [midpointVec(p0, p2), midpointVec(p1, p3)] };
      }
      if (kind === 'perpendicular_from_point_foot' && p0 && p1 && p2) {
        // Foot of perpendicular from p2 to line p0-p1
        const proj = projectPointToLine(p2, p0, p1);
        if (proj) return { points: [proj] };
      }
      return {};
    }
    case 'circle_at_target_formula': {
      const kind = String(params.formula ?? '');
      if (kind === 'nine_point_circle' && p0 && p1 && p2) {
        const o = circumcenter(p0, p1, p2);
        const h = orthocenter(p0, p1, p2);
        if (o && h) {
          const n = midpointVec(o, h);
          const r = dist(o, p0) / 2;
          return { circles: [{ c: n, r }] };
        }
      }
      if (kind === 'sangaku_two_touching_small' && p0 && p1) {
        // Two equal circles of radius R centered at p0, p1 (dist = 2R), small circle tangent to both and common tangent has r = R/4
        const m = midpointVec(p0, p1);
        const R = dist(p0, p1) / 2;
        const dir = { x: (p1.x - p0.x) / Math.max(1e-9, 2 * R), y: (p1.y - p0.y) / Math.max(1e-9, 2 * R) };
        const perp = { x: -dir.y, y: dir.x };
        return {
          circles: [
            { c: { x: m.x + perp.x * (0.75 * R), y: m.y + perp.y * (0.75 * R) }, r: R / 4 },
            { c: { x: m.x - perp.x * (0.75 * R), y: m.y - perp.y * (0.75 * R) }, r: R / 4 },
          ],
        };
      }
      if (kind === 'sangaku_half_radius_circle' && p0 && p1) {
        const m = midpointVec(p0, p1);
        const r = dist(p0, p1) / 2;
        return { circles: [{ c: m, r }] };
      }
      if (kind === 'sangaku_quarter_circle' && p0 && p1) {
        const m = midpointVec(p0, p1);
        const q1 = midpointVec(p0, m);
        const q2 = midpointVec(m, p1);
        const r = dist(p0, p1) / 4;
        return { circles: [{ c: q1, r }, { c: q2, r }, { c: m, r }] };
      }
      if (kind === 'excircle' && p0 && p1 && p2) {
        const a = dist(p1, p2);
        const b = dist(p0, p2);
        const c = dist(p0, p1);
        const s = (a + b + c) / 2;
        const denom = -a + b + c;
        if (Math.abs(denom) > 1e-9) {
          const ex = {
            x: (-a * p0.x + b * p1.x + c * p2.x) / denom,
            y: (-a * p0.y + b * p1.y + c * p2.y) / denom,
          };
          const area = Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)));
          const r = area / Math.max(1e-9, s - a);
          return { circles: [{ c: ex, r }] };
        }
      }
      return {};
    }
    case 'line_through_target_formula': {
      const kind = String(params.formula ?? '');
      if (kind === 'simson_line' && p0 && p1 && p2 && p3) {
        const f1 = projectPointToLine(p3, p0, p1);
        const f2 = projectPointToLine(p3, p1, p2);
        if (f1 && f2 && dist(f1, f2) > 1e-4) return { lines: [[f1, f2]] };
      }
      if (kind === 'symmedian_A' && p0 && p1 && p2) {
        // Reflection of median AM across angle bisector of A
        const m = midpointVec(p1, p2);
        const b = dist(p0, p2);
        const c = dist(p0, p1);
        const bisPt = {
          x: (b * p1.x + c * p2.x) / Math.max(1e-9, b + c),
          y: (b * p1.y + c * p2.y) / Math.max(1e-9, b + c),
        };
        const mRef = reflectPointOverLine(m, p0, bisPt);
        if (mRef) return { lines: [[p0, mRef]] };
      }
      if (kind === 'euler_line' && p0 && p1 && p2) {
        const o = circumcenter(p0, p1, p2);
        const g = centroid(p0, p1, p2);
        if (o && dist(o, g) > 1e-4) return { lines: [[o, g]] };
      }
      return {};
    }
    default:
      return {};
  }
}

/** Check a single validation rule on a given (original or perturbed) GeoScene */
export function evaluateValidationRule(
  scene: GeoScene,
  rule: ValidationRule
): { passed: boolean; detail: string } {
  const refs = rule.refs;
  const params = rule.params ?? {};

  switch (rule.type) {
    case 'equilateral_on_segment': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      if (!a || !b) return { passed: false, detail: 'Thiếu dữ kiện điểm A hoặc B.' };
      const ab = dist(a, b);
      const pts = getValidPoints(scene);
      for (const c of pts) {
        if (pointsEqual(c, a, ab) || pointsEqual(c, b, ab)) continue;
        if (isEquilateralTriangle(a, b, c)) {
          const hasAC = hasSegmentConnecting(scene, a, c, ab);
          const hasBC = hasSegmentConnecting(scene, b, c, ab);
          if (hasAC && hasBC) {
            return { passed: true, detail: `Tam giác đều qua đỉnh ${c.label} thỏa mãn AB = AC = BC và các góc 60°.` };
          }
        }
      }
      return {
        passed: false,
        detail: 'Chưa có đỉnh C hợp lệ với hai cạnh AC, BC tạo thành tam giác đều nhận AB làm cạnh.',
      };
    }

    case 'isosceles_on_segment': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      if (!a || !b) return { passed: false, detail: 'Thiếu đoạn AB.' };
      const ab = dist(a, b);
      for (const c of getValidPoints(scene)) {
        if (pointsEqual(c, a, ab) || pointsEqual(c, b, ab) || areCollinear(a, b, c, ab)) continue;
        if (
          isIsoscelesTriangle(a, b, c) &&
          hasSegmentConnecting(scene, a, c, ab) &&
          hasSegmentConnecting(scene, b, c, ab)
        ) {
          return { passed: true, detail: 'Đã dựng tam giác cân hợp lệ.' };
        }
      }
      return { passed: false, detail: 'Cần dựng đỉnh C không thẳng hàng với A, B và nối AC, BC tạo tam giác cân.' };
    }

    case 'circle_center_through_point': {
      const c = getPt(scene, refs[0]);
      const p = getPt(scene, refs[1]);
      if (!c || !p) return { passed: false, detail: 'Thiếu điểm dữ kiện.' };
      const r = dist(c, p);
      if (hasCircleMatching(scene, c, r)) {
        return { passed: true, detail: 'Đã dựng đúng đường tròn theo tâm và điểm cho trước.' };
      }
      return { passed: false, detail: 'Chưa có đường tròn có đúng tâm và đi qua điểm yêu cầu.' };
    }

    case 'two_equal_circles': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      if (!a || !b) return { passed: false, detail: 'Thiếu điểm dữ kiện.' };
      const r = dist(a, b);
      if (hasCircleMatching(scene, a, r) && hasCircleMatching(scene, b, r)) {
        return { passed: true, detail: 'Đã dựng hai đường tròn bằng nhau (A; AB) và (B; BA).' };
      }
      return { passed: false, detail: 'Cần dựng đủ hai đường tròn tâm A qua B và tâm B qua A.' };
    }

    case 'intersection_of_circles': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      if (!a || !b) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const ab = dist(a, b);
      const t1 = rotatePoint(b, a, 60);
      const t2 = rotatePoint(b, a, -60);
      const ok = hasPointAt(scene, t1, ab, true) || hasPointAt(scene, t2, ab, true);
      return ok
        ? { passed: true, detail: 'Đã xác định đúng giao điểm của hai đường tròn.' }
        : { passed: false, detail: 'Chưa xác định giao điểm hợp lệ của hai đường tròn.' };
    }

    case 'perpendicular_bisector_of': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      if (!a || !b) return { passed: false, detail: 'Thiếu dữ kiện A, B.' };
      const mid = midpointVec(a, b);
      const p2 = { x: mid.x - (b.y - a.y), y: mid.y + (b.x - a.x) };
      const ok = hasLineMatching(scene, mid, p2, dist(a, b), true);
      return ok
        ? { passed: true, detail: 'Đã dựng đúng đường trung trực của đoạn thẳng.' }
        : { passed: false, detail: 'Đường thẳng chưa đi qua trung điểm và vuông góc với đoạn AB.' };
    }

    case 'midpoint_of': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      if (!a || !b) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const mid = midpointVec(a, b);
      const ok = hasPointAt(scene, mid, dist(a, b), true);
      return ok
        ? { passed: true, detail: 'Đã xác định chính xác trung điểm đoạn thẳng.' }
        : { passed: false, detail: 'Chưa có điểm trùng với trung điểm đoạn thẳng.' };
    }

    case 'copy_segment_on_ray': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const o = getPt(scene, refs[2]);
      const x = getPt(scene, refs[3]);
      if (!a || !b || !o || !x) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const len = dist(a, b);
      const ox = dist(o, x);
      if (ox < 1e-8) return { passed: false, detail: 'Tia suy biến.' };
      const target = {
        x: o.x + ((x.x - o.x) / ox) * len,
        y: o.y + ((x.y - o.y) / ox) * len,
      };
      const ok = hasPointAt(scene, target, Math.max(len, ox), true);
      return ok
        ? { passed: true, detail: 'Đã sao chép đúng độ dài đoạn thẳng lên tia.' }
        : { passed: false, detail: 'Chưa xác định điểm trên tia cách gốc đúng bằng độ dài AB.' };
    }

    case 'circle_through_two_points_center_on_bisector': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const o = getPt(scene, refs[2]);
      if (!a || !b || !o) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const r = dist(o, a);
      const ok = hasCircleMatching(scene, o, r);
      return ok
        ? { passed: true, detail: 'Đường tròn tâm O đi qua cả A và B.' }
        : { passed: false, detail: 'Chưa dựng đường tròn tâm O qua A và B.' };
    }

    case 'copy_triangle_sss': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const c = getPt(scene, refs[2]);
      const a1 = getPt(scene, refs[3]);
      const b1 = getPt(scene, refs[4]);
      if (!a || !b || !c || !a1 || !b1) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const ac = dist(a, c);
      const bc = dist(b, c);
      const s = Math.max(ac, bc, dist(a, b));
      const tol = relativeEps(s) * 5;
      for (const p of getValidPoints(scene)) {
        if (p.style.isGiven) continue;
        if (Math.abs(dist(a1, p) - ac) <= tol && Math.abs(dist(b1, p) - bc) <= tol) {
          if (hasSegmentConnecting(scene, a1, p, s) && hasSegmentConnecting(scene, b1, p, s)) {
            return { passed: true, detail: 'Tam giác dựng được bằng tam giác ban đầu theo trường hợp c.c.c.' };
          }
        }
      }
      return { passed: false, detail: 'Chưa dựng đủ đỉnh C′ và các cạnh A′C′, B′C′ bằng với tam giác ABC.' };
    }

    case 'perpendicular_at_point':
    case 'perpendicular_from_point':
    case 'altitude_of_triangle': {
      const l = getLn(scene, refs[0]);
      const p = getPt(scene, refs[1]);
      let p1: Vec2 | null = l ? l.p1 : getPt(scene, refs[0]);
      let p2: Vec2 | null = l ? l.p2 : getPt(scene, refs[1]);
      let through: Vec2 | null = l ? p : getPt(scene, refs[2]);
      if (!p1 || !p2 || !through) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const eq = lineEquation(p1, p2);
      if (!eq) return { passed: false, detail: 'Đường thẳng suy biến.' };
      const q = { x: through.x + eq.a * 100, y: through.y + eq.b * 100 };
      const ok = hasLineMatching(scene, through, q, Math.max(dist(p1, p2), 100), true);
      return ok
        ? { passed: true, detail: 'Đường thẳng vuông góc và đi qua đúng điểm yêu cầu.' }
        : { passed: false, detail: 'Chưa có đường thẳng đi qua điểm yêu cầu và vuông góc với đường thẳng chuẩn.' };
    }

    case 'projection_of_point': {
      const l = getLn(scene, refs[0]);
      const p = getPt(scene, refs[1]);
      if (!l || !p) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const foot = projectPointToLine(p, l.p1, l.p2);
      if (!foot) return { passed: false, detail: 'Đường thẳng suy biến.' };
      const ok = hasPointAt(scene, foot, Math.max(dist(p, foot), 100), true);
      return ok
        ? { passed: true, detail: 'Đã xác định chính xác hình chiếu vuông góc.' }
        : { passed: false, detail: 'Chưa có chân đường vuông góc (hình chiếu) trên đường thẳng.' };
    }

    case 'point_equidistant_from_two': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const l = getLn(scene, refs[2]);
      if (!a || !b || !l) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const s = Math.max(dist(a, b), 100);
      const tol = relativeEps(s) * 5;
      for (const p of getValidPoints(scene)) {
        if (p.style.isGiven) continue;
        if (pointOnLineLike(p, l, tol) && Math.abs(dist(p, a) - dist(p, b)) <= tol) {
          return { passed: true, detail: 'Điểm nằm trên đường thẳng và cách đều A, B.' };
        }
      }
      return { passed: false, detail: 'Chưa xác định điểm trên đường thẳng cách đều A và B.' };
    }

    case 'median_of_triangle': {
      const v = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const c = getPt(scene, refs[2]);
      if (!v || !b || !c) return { passed: false, detail: 'Thiếu dữ kiện tam giác.' };
      const m = midpointVec(b, c);
      const ok = hasLineMatching(scene, v, m, dist(b, c), true);
      return ok
        ? { passed: true, detail: 'Đã dựng đúng đường trung tuyến đi qua đỉnh và trung điểm cạnh đối.' }
        : { passed: false, detail: 'Chưa nối đỉnh với trung điểm cạnh đối diện.' };
    }

    case 'right_triangle_legs': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      if (!a || !b) return { passed: false, detail: 'Thiếu cạnh góc vuông.' };
      const ab = dist(a, b);
      const scaleRatio = Number(params.ratio ?? 1);
      const targetLen = ab * scaleRatio;
      const tol = relativeEps(ab) * 5;
      for (const c of getValidPoints(scene)) {
        if (c.style.isGiven) continue;
        if (
          arePerpendicular(a, b, a, c) &&
          Math.abs(dist(a, c) - targetLen) <= tol &&
          hasSegmentConnecting(scene, a, c, ab) &&
          hasSegmentConnecting(scene, b, c, ab)
        ) {
          return { passed: true, detail: 'Đã dựng đúng tam giác vuông theo yêu cầu.' };
        }
      }
      return { passed: false, detail: 'Chưa dựng đủ cạnh góc vuông vuông góc với AB và cạnh huyền.' };
    }

    case 'diameter_perp_chord': {
      const o = getPt(scene, refs[0]);
      const a = getPt(scene, refs[1]);
      const b = getPt(scene, refs[2]);
      if (!o || !a || !b) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const mid = midpointVec(a, b);
      const ok = hasLineMatching(scene, o, mid, dist(a, b), true);
      return ok
        ? { passed: true, detail: 'Đường kính đi qua tâm O và vuông góc với dây cung AB.' }
        : { passed: false, detail: 'Chưa dựng đường thẳng qua O vuông góc với dây AB.' };
    }

    case 'rectangle_from_two_sides': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const d = getPt(scene, refs[2]);
      if (!a || !b || !d) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const c = { x: b.x + d.x - a.x, y: b.y + d.y - a.y };
      const s = Math.max(dist(a, b), dist(a, d));
      const ok =
        hasPointAt(scene, c, s, true) &&
        hasSegmentConnecting(scene, b, c, s) &&
        hasSegmentConnecting(scene, d, c, s);
      return ok
        ? { passed: true, detail: 'Đã dựng đỉnh C và hoàn thiện hình chữ nhật ABCD.' }
        : { passed: false, detail: 'Chưa dựng đủ đỉnh thứ tư C và hai cạnh BC, DC.' };
    }

    case 'parallel_through_point': {
      const l = getLn(scene, refs[0]);
      const p = getPt(scene, refs[1]);
      if (!l || !p) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const q = { x: p.x - l.b * 100, y: p.y + l.a * 100 };
      const ok = hasLineMatching(scene, p, q, Math.max(dist(l.p1, l.p2), 100), true);
      return ok
        ? { passed: true, detail: 'Đường thẳng đi qua điểm cho trước và song song với đường thẳng chuẩn.' }
        : { passed: false, detail: 'Chưa có đường thẳng đi qua điểm yêu cầu và song song với đường thẳng chuẩn.' };
    }

    case 'angle_bisector_of': {
      const a = getPt(scene, refs[0]);
      const v = getPt(scene, refs[1]);
      const b = getPt(scene, refs[2]);
      if (!a || !v || !b) return { passed: false, detail: 'Thiếu dữ kiện góc.' };
      const da = dist(v, a);
      const db = dist(v, b);
      const dir = {
        x: (a.x - v.x) / da + (b.x - v.x) / db,
        y: (a.y - v.y) / da + (b.y - v.y) / db,
      };
      const q = { x: v.x + dir.x * 100, y: v.y + dir.y * 100 };
      const ok = hasLineMatching(scene, v, q, Math.max(da, db), true);
      return ok
        ? { passed: true, detail: 'Đã dựng đúng tia/đường phân giác trong của góc.' }
        : { passed: false, detail: 'Chưa dựng đường chia đôi góc tại đỉnh.' };
    }

    case 'external_angle_bisector_of': {
      const a = getPt(scene, refs[0]);
      const v = getPt(scene, refs[1]);
      const b = getPt(scene, refs[2]);
      if (!a || !v || !b) return { passed: false, detail: 'Thiếu dữ kiện góc.' };
      const da = dist(v, a);
      const db = dist(v, b);
      const dir = {
        x: (a.x - v.x) / da - (b.x - v.x) / db,
        y: (a.y - v.y) / da - (b.y - v.y) / db,
      };
      const q = { x: v.x + dir.x * 100, y: v.y + dir.y * 100 };
      const ok = hasLineMatching(scene, v, q, Math.max(da, db), true);
      return ok
        ? { passed: true, detail: 'Đã dựng đúng đường phân giác ngoài vuông góc phân giác trong.' }
        : { passed: false, detail: 'Chưa dựng đúng phân giác ngoài tại đỉnh góc.' };
    }

    case 'angle_measure_target': {
      const v = getPt(scene, refs[0]);
      const a = getPt(scene, refs[1]);
      const targetDeg = Number(params.angleDeg ?? 60);
      if (!v || !a) return { passed: false, detail: 'Thiếu tia chuẩn.' };
      const s = dist(v, a);
      const q1 = rotatePoint(a, v, targetDeg);
      const q2 = rotatePoint(a, v, -targetDeg);
      const ok = hasLineMatching(scene, v, q1, s, true) || hasLineMatching(scene, v, q2, s, true);
      return ok
        ? { passed: true, detail: `Đã dựng chính xác tia tạo góc ${targetDeg}° với tia ban đầu.` }
        : { passed: false, detail: `Chưa có tia/đường thẳng qua ${v.label} tạo góc đúng ${targetDeg}°.` };
    }

    case 'copy_angle': {
      const a = getPt(scene, refs[0]);
      const o = getPt(scene, refs[1]);
      const b = getPt(scene, refs[2]);
      const o1 = getPt(scene, refs[3]);
      const a1 = getPt(scene, refs[4]);
      if (!a || !o || !b || !o1 || !a1) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const deg = angleDegrees(a, o, b);
      const s = dist(o1, a1);
      const q1 = rotatePoint(a1, o1, deg);
      const q2 = rotatePoint(a1, o1, -deg);
      const ok = hasLineMatching(scene, o1, q1, s, true) || hasLineMatching(scene, o1, q2, s, true);
      return ok
        ? { passed: true, detail: 'Đã sao chép đúng số đo góc sang tia mới.' }
        : { passed: false, detail: 'Tia dựng được chưa tạo góc bằng với góc ban đầu.' };
    }

    case 'parallelogram_from_three': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const d = getPt(scene, refs[2]);
      if (!a || !b || !d) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const c = { x: b.x + d.x - a.x, y: b.y + d.y - a.y };
      const s = Math.max(dist(a, b), dist(a, d));
      const ok =
        hasPointAt(scene, c, s, true) &&
        hasLineMatching(scene, b, c, s, true) &&
        hasLineMatching(scene, d, c, s, true);
      return ok
        ? { passed: true, detail: 'Đã dựng hoàn chỉnh hình bình hành.' }
        : { passed: false, detail: 'Chưa xác định đỉnh thứ tư và hai cạnh đối song song.' };
    }

    case 'square_on_segment': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      if (!a || !b) return { passed: false, detail: 'Thiếu đoạn AB.' };
      const ab = dist(a, b);
      const c1 = rotatePoint(a, b, -90);
      const d1 = rotatePoint(b, a, 90);
      const c2 = rotatePoint(a, b, 90);
      const d2 = rotatePoint(b, a, -90);
      const side1 =
        hasSegmentConnecting(scene, b, c1, ab) &&
        hasSegmentConnecting(scene, c1, d1, ab) &&
        hasSegmentConnecting(scene, d1, a, ab);
      const side2 =
        hasSegmentConnecting(scene, b, c2, ab) &&
        hasSegmentConnecting(scene, c2, d2, ab) &&
        hasSegmentConnecting(scene, d2, a, ab);
      return side1 || side2
        ? { passed: true, detail: 'Đã dựng hoàn chỉnh hình vuông nhận AB làm một cạnh.' }
        : { passed: false, detail: 'Chưa dựng đủ 3 cạnh còn lại của hình vuông trên đoạn AB.' };
    }

    case 'rhombus_on_segment': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      if (!a || !b) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const ab = dist(a, b);
      const ang = Number(params.angleDeg ?? 60);
      for (const sign of [1, -1]) {
        const d = rotatePoint(b, a, sign * ang);
        const c = { x: b.x + d.x - a.x, y: b.y + d.y - a.y };
        if (
          hasSegmentConnecting(scene, a, d, ab) &&
          hasSegmentConnecting(scene, b, c, ab) &&
          hasSegmentConnecting(scene, c, d, ab)
        ) {
          return { passed: true, detail: 'Đã dựng hoàn chỉnh hình thoi.' };
        }
      }
      return { passed: false, detail: 'Chưa dựng đủ các cạnh của hình thoi yêu cầu.' };
    }

    case 'inscribed_square': {
      const o = getPt(scene, refs[0]);
      const a = getPt(scene, refs[1]);
      if (!o || !a) return { passed: false, detail: 'Thiếu đường tròn và đỉnh A.' };
      const r = dist(o, a);
      const b = rotatePoint(a, o, 90);
      const c = rotatePoint(a, o, 180);
      const d = rotatePoint(a, o, 270);
      const ok =
        hasSegmentConnecting(scene, a, b, r) &&
        hasSegmentConnecting(scene, b, c, r) &&
        hasSegmentConnecting(scene, c, d, r) &&
        hasSegmentConnecting(scene, d, a, r);
      return ok
        ? { passed: true, detail: 'Đã dựng đúng hình vuông nội tiếp đường tròn.' }
        : { passed: false, detail: 'Chưa dựng đủ 4 cạnh hình vuông nội tiếp qua đỉnh A.' };
    }

    case 'circumcenter_of_triangle': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const c = getPt(scene, refs[2]);
      if (!a || !b || !c) return { passed: false, detail: 'Thiếu đỉnh tam giác.' };
      const o = circumcenter(a, b, c);
      if (!o) return { passed: false, detail: 'Tam giác suy biến.' };
      const ok = hasPointAt(scene, o, dist(o, a), true);
      return ok
        ? { passed: true, detail: 'Đã xác định chính xác tâm đường tròn ngoại tiếp.' }
        : { passed: false, detail: 'Chưa xác định giao điểm các đường trung trực (tâm ngoại tiếp).' };
    }

    case 'circumcircle_of_triangle': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const c = getPt(scene, refs[2]);
      if (!a || !b || !c) return { passed: false, detail: 'Thiếu đỉnh tam giác.' };
      const o = circumcenter(a, b, c);
      if (!o) return { passed: false, detail: 'Tam giác suy biến.' };
      const ok = hasCircleMatching(scene, o, dist(o, a));
      return ok
        ? { passed: true, detail: 'Đã dựng đúng đường tròn ngoại tiếp tam giác.' }
        : { passed: false, detail: 'Chưa dựng đường tròn đi qua cả 3 đỉnh tam giác.' };
    }

    case 'incenter_of_triangle': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const c = getPt(scene, refs[2]);
      if (!a || !b || !c) return { passed: false, detail: 'Thiếu đỉnh tam giác.' };
      const inc = incenter(a, b, c);
      if (!inc) return { passed: false, detail: 'Tam giác suy biến.' };
      const ok = hasPointAt(scene, inc, dist(a, b), true);
      return ok
        ? { passed: true, detail: 'Đã xác định chính xác tâm đường tròn nội tiếp.' }
        : { passed: false, detail: 'Chưa xác định giao điểm các đường phân giác trong.' };
    }

    case 'incircle_of_triangle': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const c = getPt(scene, refs[2]);
      if (!a || !b || !c) return { passed: false, detail: 'Thiếu đỉnh tam giác.' };
      const inc = incenter(a, b, c);
      const r = inradius(a, b, c);
      if (!inc || r < 1e-6) return { passed: false, detail: 'Tam giác suy biến.' };
      const ok = hasCircleMatching(scene, inc, r);
      return ok
        ? { passed: true, detail: 'Đã dựng đúng đường tròn nội tiếp tiếp xúc 3 cạnh tam giác.' }
        : { passed: false, detail: 'Chưa dựng đường tròn tâm I tiếp xúc 3 cạnh tam giác.' };
    }

    case 'centroid_of_triangle': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const c = getPt(scene, refs[2]);
      if (!a || !b || !c) return { passed: false, detail: 'Thiếu đỉnh tam giác.' };
      const g = centroid(a, b, c);
      const ok = hasPointAt(scene, g, dist(a, b), true);
      return ok
        ? { passed: true, detail: 'Đã xác định chính xác trọng tâm G của tam giác.' }
        : { passed: false, detail: 'Chưa xác định giao điểm hai đường trung tuyến.' };
    }

    case 'orthocenter_of_triangle': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const c = getPt(scene, refs[2]);
      if (!a || !b || !c) return { passed: false, detail: 'Thiếu đỉnh tam giác.' };
      const h = orthocenter(a, b, c);
      if (!h) return { passed: false, detail: 'Tam giác suy biến.' };
      const ok = hasPointAt(scene, h, dist(a, b), true);
      return ok
        ? { passed: true, detail: 'Đã xác định chính xác trực tâm H của tam giác.' }
        : { passed: false, detail: 'Chưa xác định giao điểm hai đường cao của tam giác.' };
    }

    case 'euler_line_of_triangle': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const c = getPt(scene, refs[2]);
      if (!a || !b || !c) return { passed: false, detail: 'Thiếu đỉnh tam giác.' };
      const o = circumcenter(a, b, c);
      const g = centroid(a, b, c);
      if (!o || dist(o, g) < 1e-4) return { passed: true, detail: 'Tam giác đều có O ≡ G ≡ H.' };
      const ok = hasLineMatching(scene, o, g, dist(a, b), true);
      return ok
        ? { passed: true, detail: 'Đã dựng đúng đường thẳng Euler đi qua O, G, H.' }
        : { passed: false, detail: 'Chưa có đường thẳng đi qua tâm ngoại tiếp O, trọng tâm G và trực tâm H.' };
    }

    case 'reflection_over_line': {
      let p: Vec2 | null = null;
      let a: Vec2 | null = null;
      let b: Vec2 | null = null;
      if (refs.length >= 3) {
        a = getPt(scene, refs[0]);
        b = getPt(scene, refs[1]);
        p = getPt(scene, refs[2]);
      } else {
        p = getPt(scene, refs[0]);
        const l = getLn(scene, refs[1]);
        if (l) {
          a = l.p1;
          b = l.p2;
        }
      }
      if (!p || !a || !b) return { passed: false, detail: 'Thiếu điểm hoặc trục.' };
      const ref = reflectPointOverLine(p, a, b);
      if (!ref) return { passed: false, detail: 'Trục suy biến.' };
      const ok = hasPointAt(scene, ref, Math.max(dist(p, ref), 100), true);
      return ok
        ? { passed: true, detail: 'Đã dựng đúng điểm đối xứng qua trục.' }
        : { passed: false, detail: 'Chưa xác định ảnh đối xứng của điểm qua đường thẳng.' };
    }

    case 'reflection_over_point': {
      const p = getPt(scene, refs[0]);
      const o = getPt(scene, refs[1]);
      if (!p || !o) return { passed: false, detail: 'Thiếu điểm hoặc tâm.' };
      const ref = reflectPointOverPoint(p, o);
      const ok = hasPointAt(scene, ref, Math.max(dist(p, o), 100), true);
      return ok
        ? { passed: true, detail: 'Đã dựng đúng điểm đối xứng qua tâm.' }
        : { passed: false, detail: 'Chưa xác định ảnh đối xứng qua tâm.' };
    }

    case 'translation_point': {
      const u1 = getPt(scene, refs[0]);
      const u2 = getPt(scene, refs[1]);
      const p = getPt(scene, refs[2]);
      if (!u1 || !u2 || !p) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const res = translatePoint(p, u1, u2);
      const ok = hasPointAt(scene, res, Math.max(dist(u1, u2), 100), true);
      return ok
        ? { passed: true, detail: 'Đã tịnh tiến chính xác theo vectơ cho trước.' }
        : { passed: false, detail: 'Chưa xác định ảnh của điểm qua phép tịnh tiến.' };
    }

    case 'rotation_point': {
      const o = getPt(scene, refs[0]);
      const p = getPt(scene, refs[1]);
      const deg = Number(params.angleDeg ?? 90);
      if (!o || !p) return { passed: false, detail: 'Thiếu tâm hoặc điểm.' };
      const r1 = rotatePoint(p, o, deg);
      const r2 = rotatePoint(p, o, -deg);
      const s = dist(o, p);
      const ok = hasPointAt(scene, r1, s, true) || hasPointAt(scene, r2, s, true);
      return ok
        ? { passed: true, detail: `Đã dựng ảnh qua phép quay góc ${deg}°.` }
        : { passed: false, detail: `Chưa xác định điểm ảnh sau phép quay ${deg}° quanh tâm.` };
    }

    case 'homothety_point': {
      const o = getPt(scene, refs[0]);
      const p = getPt(scene, refs[1]);
      const k = Number(params.factor ?? 2);
      if (!o || !p) return { passed: false, detail: 'Thiếu tâm hoặc điểm.' };
      const res = homothetyPoint(p, o, k);
      const ok = hasPointAt(scene, res, Math.max(dist(o, p), 100), true);
      return ok
        ? { passed: true, detail: `Đã dựng ảnh qua phép vị tự tỉ số k = ${k}.` }
        : { passed: false, detail: `Chưa xác định ảnh của điểm qua phép vị tự tỉ số k = ${k}.` };
    }

    case 'divide_segment_ratio': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      const num = Number(params.num ?? params.ratioNum ?? 1);
      const den = Number(params.den ?? params.ratioDen ?? 3);
      if (!a || !b || den === 0) return { passed: false, detail: 'Thiếu đoạn AB.' };
      const t = num / den;
      const tAlt = (den - num) / den;
      const p1 = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
      const p2 = { x: a.x + tAlt * (b.x - a.x), y: a.y + tAlt * (b.y - a.y) };
      const ab = dist(a, b);
      const ok = hasPointAt(scene, p1, ab, true) || hasPointAt(scene, p2, ab, true);
      return ok
        ? { passed: true, detail: `Đã xác định điểm chia đoạn theo đúng tỉ lệ ${num}:${den - num}.` }
        : { passed: false, detail: `Chưa có điểm chia đoạn AB theo tỉ lệ yêu cầu.` };
    }

    case 'golden_ratio_point': {
      const a = getPt(scene, refs[0]);
      const b = getPt(scene, refs[1]);
      if (!a || !b) return { passed: false, detail: 'Thiếu đoạn AB.' };
      const ab = dist(a, b);
      const invPhi = 1 / GOLDEN_PHI;
      const targets = [
        { x: a.x + invPhi * (b.x - a.x), y: a.y + invPhi * (b.y - a.y) },
        { x: b.x + invPhi * (a.x - b.x), y: b.y + invPhi * (a.y - b.y) },
        { x: a.x + GOLDEN_PHI * (b.x - a.x), y: a.y + GOLDEN_PHI * (b.y - a.y) },
        { x: b.x + GOLDEN_PHI * (a.x - b.x), y: b.y + GOLDEN_PHI * (a.y - b.y) },
      ];
      const ok = targets.some((t) => hasPointAt(scene, t, ab, true));
      return ok
        ? { passed: true, detail: 'Điểm chia đoạn thỏa mãn đúng tỉ lệ vàng φ = (1 + √5)/2.' }
        : { passed: false, detail: 'Chưa xác định điểm chia đoạn theo tỉ lệ vàng φ.' };
    }

    case 'tangent_at_point': {
      const c = getCirc(scene, refs[0]);
      const p = getPt(scene, refs[1]);
      if (!c || !p) return { passed: false, detail: 'Thiếu đường tròn hoặc tiếp điểm.' };
      const q = { x: p.x - (p.y - c.center.y), y: p.y + (p.x - c.center.x) };
      const ok = hasLineMatching(scene, p, q, c.radius, true);
      return ok
        ? { passed: true, detail: 'Đường thẳng vuông góc với bán kính tại tiếp điểm.' }
        : { passed: false, detail: 'Chưa dựng tiếp tuyến vuông góc với bán kính tại tiếp điểm.' };
    }

    case 'tangent_from_external': {
      const c = getCirc(scene, refs[0]);
      const p = getPt(scene, refs[1]);
      if (!c || !p) return { passed: false, detail: 'Thiếu dữ kiện.' };
      const tPts = tangentPointsFromExternalPoint(p, c.center, c.radius);
      const needBoth = params.both === 'true' || params.both === 1;
      const matched = tPts.filter((t) => hasLineMatching(scene, p, t, c.radius, true)).length;
      const ok = needBoth ? matched >= 2 : matched >= 1;
      return ok
        ? { passed: true, detail: needBoth ? 'Đã dựng đủ cặp tiếp tuyến từ điểm ngoài.' : 'Đã dựng đúng tiếp tuyến từ điểm ngoài.' }
        : { passed: false, detail: needBoth ? 'Cần dựng đủ cả hai tiếp tuyến từ điểm ngoài.' : 'Chưa dựng tiếp tuyến từ điểm ngoài đến đường tròn.' };
    }

    case 'circle_center_finder': {
      const c = getCirc(scene, refs[0]);
      if (!c) return { passed: false, detail: 'Thiếu đường tròn.' };
      const ok = hasPointAt(scene, c.center, c.radius, true);
      return ok
        ? { passed: true, detail: 'Đã xác định chính xác tâm đường tròn.' }
        : { passed: false, detail: 'Chưa xác định điểm trùng với tâm đường tròn.' };
    }

    case 'radical_axis': {
      const c1 = getCirc(scene, refs[0]);
      const c2 = getCirc(scene, refs[1]);
      if (!c1 || !c2) return { passed: false, detail: 'Thiếu hai đường tròn.' };
      const d = dist(c1.center, c2.center);
      if (d < 1e-6) return { passed: false, detail: 'Hai đường tròn đồng tâm.' };
      const a = (c1.radius * c1.radius - c2.radius * c2.radius + d * d) / (2 * d);
      const ux = (c2.center.x - c1.center.x) / d;
      const uy = (c2.center.y - c1.center.y) / d;
      const foot = { x: c1.center.x + a * ux, y: c1.center.y + a * uy };
      const p2 = { x: foot.x - uy * 100, y: foot.y + ux * 100 };
      const ok = hasLineMatching(scene, foot, p2, Math.max(c1.radius, c2.radius, d), true);
      return ok
        ? { passed: true, detail: 'Đã dựng đúng trục đẳng phương của hai đường tròn.' }
        : { passed: false, detail: 'Chưa dựng đúng đường thẳng có cùng phương tích với hai đường tròn.' };
    }

    case 'regular_polygon_in_circle': {
      const o = getPt(scene, refs[0]);
      const a = getPt(scene, refs[1]);
      const sides = Number(params.sides ?? 6);
      if (!o || !a) return { passed: false, detail: 'Thiếu tâm và đỉnh.' };
      const r = dist(o, a);
      const stepDeg = 360 / sides;
      const expectedVerts = Array.from({ length: sides }, (_, i) => rotatePoint(a, o, i * stepDeg));
      const allVerts = expectedVerts.every((v) => hasPointAt(scene, v, r, false));
      return allVerts
        ? { passed: true, detail: `Đã xác định chính xác các đỉnh của đa giác đều ${sides} cạnh.` }
        : { passed: false, detail: `Chưa xác định đủ ${sides} đỉnh cách đều trên đường tròn.` };
    }

    case 'point_at_target_formula': {
      const computed = computeTargetGeometry(scene, rule);
      const targets = computed.points ?? [];
      if (targets.length === 0) return { passed: false, detail: 'Cấu hình suy biến.' };
      const ok = targets.some((t) => hasPointAt(scene, t, 120, true));
      return ok
        ? { passed: true, detail: rule.description }
        : { passed: false, detail: `Chưa xác định đúng điểm mục tiêu: ${rule.description}` };
    }

    case 'circle_at_target_formula': {
      const computed = computeTargetGeometry(scene, rule);
      const targets = computed.circles ?? [];
      if (targets.length === 0) return { passed: false, detail: 'Cấu hình suy biến.' };
      const ok = targets.some((c) => hasCircleMatching(scene, c.c, c.r));
      return ok
        ? { passed: true, detail: rule.description }
        : { passed: false, detail: `Chưa dựng đúng đường tròn mục tiêu: ${rule.description}` };
    }

    case 'line_through_target_formula': {
      const computed = computeTargetGeometry(scene, rule);
      const targets = computed.lines ?? [];
      if (targets.length === 0) return { passed: false, detail: 'Cấu hình suy biến.' };
      const ok = targets.some(([u, v]) => hasLineMatching(scene, u, v, 140, true));
      return ok
        ? { passed: true, detail: rule.description }
        : { passed: false, detail: `Chưa dựng đúng đường thẳng mục tiêu: ${rule.description}` };
    }

    default:
      return { passed: false, detail: 'Quy tắc kiểm chứng chưa hỗ trợ.' };
  }
}

/** Deterministic pseudo-random generator for reproducible 24-config perturbation tests */
function mulberry32(seed: number): () => number {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/** Generate N independent valid perturbed configurations of free points */
export function generatePerturbations(
  baseScene: GeoScene,
  challenge: ChallengeDefinition,
  count = 24
): Array<Record<string, Vec2>> {
  const { freePointIds, jitterRadius, minSeparation = 45, enforceAcuteTriangle, enforceNonCollinear, enforceMaxAngleBelow120 } =
    challenge.perturbationRules;
  const rng = mulberry32(challenge.levelId * 1009 + challenge.order * 97 + 17);
  const configs: Array<Record<string, Vec2>> = [];

  const basePositions: Record<string, Vec2> = {};
  for (const id of freePointIds) {
    const pt = getPt(baseScene, id);
    if (pt) basePositions[id] = { x: pt.x, y: pt.y };
  }

  let attempts = 0;
  while (configs.length < count && attempts < count * 20) {
    attempts += 1;
    const cfg: Record<string, Vec2> = {};
    // Include deliberate boundary cases in the last 3 configurations
    const isBoundary = configs.length >= count - 3;
    const radiusScale = isBoundary ? 1.35 : 0.45 + rng() * 0.85;

    for (const id of freePointIds) {
      const base = basePositions[id];
      if (!base) continue;
      const angle = rng() * Math.PI * 2;
      const mag = rng() * jitterRadius * radiusScale;
      cfg[id] = {
        x: base.x + Math.cos(angle) * mag,
        y: base.y + Math.sin(angle) * mag,
      };
    }

    // Validate minimum separation between free points
    const pts = Object.values(cfg);
    let ok = true;
    for (let i = 0; i < pts.length && ok; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        if (dist(pts[i], pts[j]) < minSeparation) {
          ok = false;
          break;
        }
      }
    }
    if (!ok) continue;

    if ((enforceNonCollinear || enforceAcuteTriangle || enforceMaxAngleBelow120) && pts.length >= 3) {
      const [a, b, c] = pts;
      if (areCollinear(a, b, c, 200)) continue;
      const angA = angleDegrees(b, a, c);
      const angB = angleDegrees(a, b, c);
      const angC = angleDegrees(a, c, b);
      if (enforceAcuteTriangle && (angA >= 85 || angB >= 85 || angC >= 85)) continue;
      if (enforceMaxAngleBelow120 && (angA >= 115 || angB >= 115 || angC >= 115)) continue;
    }

    configs.push(cfg);
  }

  return configs;
}

/** Apply a perturbation map of free point coordinates to a scene and recompute its DAG */
export function applyPerturbation(scene: GeoScene, cfg: Record<string, Vec2>): GeoScene {
  const next = cloneScene(scene);
  for (const [id, pos] of Object.entries(cfg)) {
    const obj = next.objects[id];
    if (obj && obj.kind === 'point' && obj.rule === 'free_point') {
      obj.x = pos.x;
      obj.y = pos.y;
    }
  }
  return recomputeScene(next);
}

/** Full anti-guessing verification & 3-star scoring engine */
export function validateChallengeConstruction(
  scene: GeoScene,
  challenge: ChallengeDefinition,
  perturbationCount = 24
): ValidationReport {
  const { totalL, totalE, toolsUsed } = computeSceneCosts(scene);

  // 1. Check forbidden tools
  const allowedSet = new Set<ToolId>(challenge.allowedTools);
  const forbiddenSet = new Set<ToolId>(challenge.forbiddenTools);
  const forbiddenUsed =
    toolsUsed.find((t) => forbiddenSet.has(t) || !allowedSet.has(t)) ?? null;

  if (forbiddenUsed) {
    return {
      valid: false,
      stars: 0,
      star1Correct: false,
      star2OptimalL: false,
      star3OptimalE: false,
      usedL: totalL,
      usedE: totalE,
      targetL: challenge.targetL,
      targetE: challenge.targetE,
      perturbationsTested: 0,
      perturbationsPassed: 0,
      forbiddenToolUsed: forbiddenUsed,
      diagnostics: [
        {
          passed: false,
          ruleDescription: 'Quy tắc sử dụng công cụ',
          detail: `Có thao tác sử dụng công cụ không được phép ("${forbiddenUsed}") trong thử thách này.`,
        },
      ],
      summary: 'Có thao tác không phù hợp với yêu cầu bài toán: đã sử dụng công cụ bị khóa.',
    };
  }

  // Must have constructed at least one non-given object
  const constructedCount = scene.order.filter((id) => !scene.objects[id]?.style.isGiven).length;
  if (constructedCount === 0) {
    return {
      valid: false,
      stars: 0,
      star1Correct: false,
      star2OptimalL: false,
      star3OptimalE: false,
      usedL: totalL,
      usedE: totalE,
      targetL: challenge.targetL,
      targetE: challenge.targetE,
      perturbationsTested: 0,
      perturbationsPassed: 0,
      forbiddenToolUsed: null,
      diagnostics: [
        {
          passed: false,
          ruleDescription: 'Chưa dựng hình',
          detail: 'Bạn chưa thực hiện phép dựng hình nào trên bảng vẽ.',
        },
      ],
      summary: 'Hãy thực hiện các bước dựng hình trước khi kiểm tra.',
    };
  }

  // 2. Check initial configuration
  const diagnostics: ValidationDiagnostic[] = [];
  let initialPassed = true;
  for (const rule of challenge.validationRules) {
    const res = evaluateValidationRule(scene, rule);
    diagnostics.push({
      passed: res.passed,
      ruleDescription: rule.description,
      detail: res.detail,
    });
    if (!res.passed) initialPassed = false;
  }

  if (!initialPassed) {
    return {
      valid: false,
      stars: 0,
      star1Correct: false,
      star2OptimalL: false,
      star3OptimalE: false,
      usedL: totalL,
      usedE: totalE,
      targetL: challenge.targetL,
      targetE: challenge.targetE,
      perturbationsTested: 1,
      perturbationsPassed: 0,
      forbiddenToolUsed: null,
      diagnostics,
      summary: 'Quan hệ hình học chưa thỏa mãn yêu cầu đề bài trên cấu hình hiện tại.',
    };
  }

  // 3. Anti-guessing perturbation testing (24 independent non-trivial configs)
  const perturbations = generatePerturbations(scene, challenge, perturbationCount);
  let passedCount = 0;
  let firstFailure: ValidationDiagnostic | null = null;

  for (let i = 0; i < perturbations.length; i++) {
    const pScene = applyPerturbation(scene, perturbations[i]);
    let configOk = true;
    for (const rule of challenge.validationRules) {
      const res = evaluateValidationRule(pScene, rule);
      if (!res.passed) {
        configOk = false;
        if (!firstFailure) {
          firstFailure = {
            passed: false,
            ruleDescription: rule.description,
            detail: `Phép dựng bị phá vỡ khi thay đổi giả thiết (cấu hình kiểm chứng #${i + 1}): ${res.detail}`,
            failedPerturbationIndex: i,
          };
        }
        break;
      }
    }
    if (configOk) passedCount += 1;
  }

  const allPerturbationsPassed =
    perturbations.length === 0 || passedCount === perturbations.length;

  if (!allPerturbationsPassed) {
    if (firstFailure) diagnostics.push(firstFailure);
    return {
      valid: false,
      stars: 0,
      star1Correct: false,
      star2OptimalL: false,
      star3OptimalE: false,
      usedL: totalL,
      usedE: totalE,
      targetL: challenge.targetL,
      targetE: challenge.targetE,
      perturbationsTested: perturbations.length,
      perturbationsPassed: passedCount,
      forbiddenToolUsed: null,
      diagnostics,
      summary: `Phép dựng chưa ổn định khi thay đổi giả thiết (${passedCount}/${perturbations.length} cấu hình đạt). Hãy kiểm tra lại quan hệ phụ thuộc giữa các đối tượng.`,
    };
  }

  // 4. Three-star scoring
  const star1Correct = true;
  const star2OptimalL = totalL <= challenge.targetL;
  const star3OptimalE = totalE <= challenge.targetE;
  const stars = (1 + (star2OptimalL ? 1 : 0) + (star3OptimalE ? 1 : 0)) as 1 | 2 | 3;

  return {
    valid: true,
    stars,
    star1Correct,
    star2OptimalL,
    star3OptimalE,
    usedL: totalL,
    usedE: totalE,
    targetL: challenge.targetL,
    targetE: challenge.targetE,
    perturbationsTested: perturbations.length,
    perturbationsPassed: passedCount,
    forbiddenToolUsed: null,
    diagnostics,
    summary:
      stars === 3
        ? `Phép dựng chính xác qua cả ${perturbations.length}/${perturbations.length} cấu hình đã kiểm tra và đạt tối ưu ${totalL} bước dựng / ${totalE} phép dựng cơ bản.`
        : `Phép dựng chính xác qua ${perturbations.length}/${perturbations.length} cấu hình đã kiểm tra (${totalL} bước dựng, ${totalE} phép dựng cơ bản; mục tiêu ≤ ${challenge.targetL} bước dựng, ≤ ${challenge.targetE} phép dựng cơ bản).`,
  };
}
