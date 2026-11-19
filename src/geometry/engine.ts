import {
  angleDegrees,
  centroid,
  circumcenter,
  dist,
  distPointToLineLike,
  homothetyPoint,
  incenter,
  inradius,
  intersectCircleCircle,
  intersectLineCircle,
  intersectLineLine,
  isFiniteVec,
  lineEquation,
  midpointVec,
  orthocenter,
  paramOnLine,
  polygonArea,
  polygonPerimeter,
  projectPointToLine,
  reflectPointOverLine,
  reflectPointOverPoint,
  regularPolygonVertices,
  relativeEps,
  rotatePoint,
  tangentPointsFromExternalPoint,
  translatePoint,
} from './math';
import { TOOL_CATALOG } from './tools';
import type {
  ConstructionLogEntry,
  ConstructionRuleType,
  GeoAngleMeasure,
  GeoArc,
  GeoCircle,
  GeoLengthMeasure,
  GeoLineLike,
  GeoObject,
  GeoPoint,
  GeoPolygon,
  GeoScene,
  GeoStyle,
  ToolId,
  Vec2,
} from './types';

let idCounter = 1;
export function genGeoId(prefix = 'g'): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter.toString(36)}`;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export function nextPointLabel(scene: GeoScene): string {
  const existing = new Set(Object.values(scene.objects).map((o) => o.label));
  let idx = scene.nextLabelIndex;
  while (idx < 1000) {
    const letter = ALPHABET[idx % 26];
    const suffix = Math.floor(idx / 26);
    const candidate = suffix === 0 ? letter : `${letter}_${suffix}`;
    idx += 1;
    if (!existing.has(candidate)) {
      scene.nextLabelIndex = idx;
      return candidate;
    }
  }
  return `P${scene.order.length + 1}`;
}

export function defaultStyle(overrides?: Partial<GeoStyle>): GeoStyle {
  return {
    color: '#0F766E',
    strokeWidth: 2.2,
    dash: 'solid',
    visible: true,
    showLabel: true,
    isAuxiliary: false,
    isGiven: false,
    ...overrides,
  };
}

export function createEmptyScene(): GeoScene {
  return {
    objects: {},
    order: [],
    log: [],
    fullAuditLog: [],
    nextLabelIndex: 0,
  };
}

export function cloneScene(scene: GeoScene): GeoScene {
  return structuredClone(scene);
}

function getPoint(scene: GeoScene, id: string): GeoPoint | null {
  const obj = scene.objects[id];
  if (!obj || obj.kind !== 'point' || !obj.valid) return null;
  return obj;
}

function getLineLike(scene: GeoScene, id: string): GeoLineLike | null {
  const obj = scene.objects[id];
  if (
    !obj ||
    (obj.kind !== 'line' && obj.kind !== 'segment' && obj.kind !== 'ray') ||
    !obj.valid
  ) {
    return null;
  }
  return obj;
}

function getCircle(scene: GeoScene, id: string): GeoCircle | null {
  const obj = scene.objects[id];
  if (!obj || obj.kind !== 'circle' || !obj.valid) return null;
  return obj;
}

function makeInvalid(obj: GeoObject): GeoObject {
  return { ...obj, valid: false };
}

/** Re-evaluate a single DAG object from its current parents */
export function evaluateObject(scene: GeoScene, obj: GeoObject): GeoObject {
  const rule = obj.rule;
  const parents = obj.parents;
  const params = obj.params ?? {};

  if (obj.kind === 'point') {
    if (rule === 'free_point') {
      return isFiniteVec(obj) ? { ...obj, valid: true } : makeInvalid(obj);
    }

    if (rule === 'point_on_object') {
      const host = scene.objects[parents[0]];
      if (!host || !host.valid) return makeInvalid(obj);
      const t = Number(params.t ?? 0.5);
      if (host.kind === 'line' || host.kind === 'segment' || host.kind === 'ray') {
        const clampedT =
          host.kind === 'segment'
            ? Math.max(0, Math.min(1, t))
            : host.kind === 'ray'
              ? Math.max(0, t)
              : t;
        return {
          ...obj,
          x: host.p1.x + clampedT * (host.p2.x - host.p1.x),
          y: host.p1.y + clampedT * (host.p2.y - host.p1.y),
          valid: true,
        };
      }
      if (host.kind === 'circle') {
        const ang = Number(params.angle ?? params.t ?? 0);
        return {
          ...obj,
          x: host.center.x + host.radius * Math.cos(ang),
          y: host.center.y + host.radius * Math.sin(ang),
          valid: true,
        };
      }
      return makeInvalid(obj);
    }

    if (rule === 'midpoint') {
      let p1: Vec2 | null = null;
      let p2: Vec2 | null = null;
      if (parents.length === 1) {
        const seg = getLineLike(scene, parents[0]);
        if (seg && seg.kind === 'segment') {
          p1 = seg.p1;
          p2 = seg.p2;
        }
      } else if (parents.length >= 2) {
        p1 = getPoint(scene, parents[0]);
        p2 = getPoint(scene, parents[1]);
      }
      if (!p1 || !p2) return makeInvalid(obj);
      const m = midpointVec(p1, p2);
      return { ...obj, x: m.x, y: m.y, valid: true };
    }

    if (
      rule === 'intersection' ||
      rule === 'intersection_line_line' ||
      rule === 'intersection_line_circle' ||
      rule === 'intersection_circle_circle'
    ) {
      const o1 = scene.objects[parents[0]];
      const o2 = scene.objects[parents[1]];
      if (!o1 || !o2 || !o1.valid || !o2.valid) return makeInvalid(obj);
      const branch = Number(params.branch ?? 0);
      const strict =
        rule === 'intersection' ? params.strict !== false : params.strict === true;
      let candidates: Vec2[] = [];
      const isLine1 = o1.kind === 'line' || o1.kind === 'segment' || o1.kind === 'ray';
      const isLine2 = o2.kind === 'line' || o2.kind === 'segment' || o2.kind === 'ray';
      if (isLine1 && isLine2) {
        candidates = intersectLineLine(o1, o2, strict);
      } else if (isLine1 && o2.kind === 'circle') {
        candidates = intersectLineCircle(o1, o2, strict);
      } else if (o1.kind === 'circle' && isLine2) {
        candidates = intersectLineCircle(o2, o1, strict);
      } else if (o1.kind === 'circle' && o2.kind === 'circle') {
        candidates = intersectCircleCircle(o1, o2);
      }
      if (candidates.length === 0) return makeInvalid(obj);
      const excludeId = typeof params.excludeId === 'string' ? params.excludeId : null;
      if (excludeId && candidates.length > 1) {
        const exclPt = getPoint(scene, excludeId);
        if (exclPt) {
          const filtered = candidates.filter((pt) => dist(pt, exclPt) > 1e-4);
          if (filtered.length > 0) candidates = filtered;
        }
      }
      const chosen = candidates[Math.min(branch, candidates.length - 1)];
      if (!isFiniteVec(chosen)) return makeInvalid(obj);
      return { ...obj, x: chosen.x, y: chosen.y, valid: true };
    }

    if (rule === 'projection_point') {
      const line = getLineLike(scene, parents[0]);
      const p = getPoint(scene, parents[1]);
      if (!line || !p) return makeInvalid(obj);
      const foot = projectPointToLine(p, line.p1, line.p2);
      if (!foot) return makeInvalid(obj);
      return { ...obj, x: foot.x, y: foot.y, valid: true };
    }

    if (rule === 'reflection_line' || rule === 'reflect_line') {
      const p = getPoint(scene, parents[0]);
      const line = getLineLike(scene, parents[1]);
      if (!p || !line) return makeInvalid(obj);
      const ref = reflectPointOverLine(p, line.p1, line.p2);
      if (!ref) return makeInvalid(obj);
      return { ...obj, x: ref.x, y: ref.y, valid: true };
    }

    if (rule === 'reflection_point' || rule === 'reflect_point') {
      const p = getPoint(scene, parents[0]);
      const c = getPoint(scene, parents[1]);
      if (!p || !c) return makeInvalid(obj);
      const ref = reflectPointOverPoint(p, c);
      return { ...obj, x: ref.x, y: ref.y, valid: true };
    }

    if (rule === 'translation') {
      const vFrom = getPoint(scene, parents[0]);
      const vTo = getPoint(scene, parents[1]);
      const p = getPoint(scene, parents[2]);
      if (!vFrom || !vTo || !p) return makeInvalid(obj);
      const res = translatePoint(p, vFrom, vTo);
      return { ...obj, x: res.x, y: res.y, valid: true };
    }

    if (rule === 'rotation') {
      const center = getPoint(scene, parents[0]);
      const p = getPoint(scene, parents[1]);
      if (!center || !p) return makeInvalid(obj);
      const angleDeg = Number(params.angleDeg ?? 90);
      const res = rotatePoint(p, center, angleDeg);
      return { ...obj, x: res.x, y: res.y, valid: true };
    }

    if (rule === 'homothety') {
      const center = getPoint(scene, parents[0]);
      const p = getPoint(scene, parents[1]);
      if (!center || !p) return makeInvalid(obj);
      const factor = Number(params.factor ?? 2);
      const res = homothetyPoint(p, center, factor);
      return { ...obj, x: res.x, y: res.y, valid: true };
    }

    if (rule === 'centroid' || rule === 'circumcenter' || rule === 'incenter' || rule === 'orthocenter') {
      const a = getPoint(scene, parents[0]);
      const b = getPoint(scene, parents[1]);
      const c = getPoint(scene, parents[2]);
      if (!a || !b || !c) return makeInvalid(obj);
      const res =
        rule === 'centroid'
          ? centroid(a, b, c)
          : rule === 'circumcenter'
            ? circumcenter(a, b, c)
            : rule === 'incenter'
              ? incenter(a, b, c)
              : orthocenter(a, b, c);
      if (!res || !isFiniteVec(res)) return makeInvalid(obj);
      return { ...obj, x: res.x, y: res.y, valid: true };
    }
  }

  if (obj.kind === 'line' || obj.kind === 'segment' || obj.kind === 'ray') {
    if (
      rule === 'line_two_points' ||
      rule === 'segment_two_points' ||
      rule === 'ray_two_points'
    ) {
      const p1 = getPoint(scene, parents[0]);
      const p2 = getPoint(scene, parents[1]);
      if (!p1 || !p2) return makeInvalid(obj);
      const eq = lineEquation(p1, p2);
      if (!eq) return makeInvalid(obj);
      return { ...obj, p1: { x: p1.x, y: p1.y }, p2: { x: p2.x, y: p2.y }, ...eq, valid: true };
    }

    if (rule === 'perpendicular_bisector') {
      let p1: Vec2 | null = null;
      let p2: Vec2 | null = null;
      if (parents.length === 1) {
        const seg = getLineLike(scene, parents[0]);
        if (seg) {
          p1 = seg.p1;
          p2 = seg.p2;
        }
      } else {
        p1 = getPoint(scene, parents[0]);
        p2 = getPoint(scene, parents[1]);
      }
      if (!p1 || !p2 || dist(p1, p2) < 1e-8) return makeInvalid(obj);
      const mid = midpointVec(p1, p2);
      const perpPt = { x: mid.x - (p2.y - p1.y), y: mid.y + (p2.x - p1.x) };
      const eq = lineEquation(mid, perpPt);
      if (!eq) return makeInvalid(obj);
      return { ...obj, p1: mid, p2: perpPt, ...eq, valid: true };
    }

    if (rule === 'perpendicular_line') {
      const refLine = getLineLike(scene, parents[0]);
      const p = getPoint(scene, parents[1]);
      if (!refLine || !p) return makeInvalid(obj);
      const p2 = { x: p.x + refLine.a, y: p.y + refLine.b };
      const eq = lineEquation(p, p2);
      if (!eq) return makeInvalid(obj);
      return { ...obj, p1: { x: p.x, y: p.y }, p2, ...eq, valid: true };
    }

    if (rule === 'parallel_line') {
      const refLine = getLineLike(scene, parents[0]);
      const p = getPoint(scene, parents[1]);
      if (!refLine || !p) return makeInvalid(obj);
      const p2 = { x: p.x - refLine.b, y: p.y + refLine.a };
      const eq = lineEquation(p, p2);
      if (!eq) return makeInvalid(obj);
      return { ...obj, p1: { x: p.x, y: p.y }, p2, ...eq, valid: true };
    }

    if (rule === 'angle_bisector') {
      const a = getPoint(scene, parents[0]);
      const v = getPoint(scene, parents[1]);
      const b = getPoint(scene, parents[2]);
      if (!a || !v || !b) return makeInvalid(obj);
      const da = dist(v, a);
      const db = dist(v, b);
      if (da < 1e-8 || db < 1e-8) return makeInvalid(obj);
      const ua = { x: (a.x - v.x) / da, y: (a.y - v.y) / da };
      const ub = { x: (b.x - v.x) / db, y: (b.y - v.y) / db };
      let dir = { x: ua.x + ub.x, y: ua.y + ub.y };
      if (Math.hypot(dir.x, dir.y) < 1e-7) {
        // 180-degree angle: perpendicular to VA
        dir = { x: -ua.y, y: ua.x };
      }
      const p2 = { x: v.x + dir.x * 100, y: v.y + dir.y * 100 };
      const eq = lineEquation(v, p2);
      if (!eq) return makeInvalid(obj);
      return { ...obj, p1: { x: v.x, y: v.y }, p2, ...eq, valid: true };
    }

    if (rule === 'tangent_line') {
      const circle = getCircle(scene, parents[0]);
      const p = getPoint(scene, parents[1]);
      if (!circle || !p) return makeInvalid(obj);
      const d = dist(p, circle.center);
      const branch = Number(params.branch ?? 0);
      if (Math.abs(d - circle.radius) <= relativeEps(circle.radius) * 3) {
        // Point on circle
        const dx = p.x - circle.center.x;
        const dy = p.y - circle.center.y;
        const p2 = { x: p.x - dy, y: p.y + dx };
        const eq = lineEquation(p, p2);
        if (!eq) return makeInvalid(obj);
        return { ...obj, p1: { x: p.x, y: p.y }, p2, ...eq, valid: true };
      }
      const tPts = tangentPointsFromExternalPoint(p, circle.center, circle.radius);
      if (tPts.length === 0) return makeInvalid(obj);
      const t = tPts[Math.min(branch, tPts.length - 1)];
      const eq = lineEquation(p, t);
      if (!eq) return makeInvalid(obj);
      return { ...obj, p1: { x: p.x, y: p.y }, p2: t, ...eq, valid: true };
    }
  }

  if (obj.kind === 'circle') {
    if (rule === 'circle_center_point') {
      const c = getPoint(scene, parents[0]);
      const p = getPoint(scene, parents[1]);
      if (!c || !p) return makeInvalid(obj);
      const r = dist(c, p);
      if (r < 1e-8) return makeInvalid(obj);
      return { ...obj, center: { x: c.x, y: c.y }, radius: r, valid: true };
    }

    if (rule === 'circle_center_radius') {
      const c = getPoint(scene, parents[0]);
      const r = Number(params.radius ?? 100);
      if (!c || !Number.isFinite(r) || r <= 1e-6) return makeInvalid(obj);
      return { ...obj, center: { x: c.x, y: c.y }, radius: r, valid: true };
    }

    if (rule === 'circle_compass' || rule === 'compass_transfer') {
      const r1 = getPoint(scene, parents[0]);
      const r2 = getPoint(scene, parents[1]);
      const c = getPoint(scene, parents[2]);
      if (!r1 || !r2 || !c) return makeInvalid(obj);
      const r = dist(r1, r2);
      if (r < 1e-8) return makeInvalid(obj);
      return { ...obj, center: { x: c.x, y: c.y }, radius: r, valid: true };
    }

    if (rule === 'circumcircle') {
      const a = getPoint(scene, parents[0]);
      const b = getPoint(scene, parents[1]);
      const c = getPoint(scene, parents[2]);
      if (!a || !b || !c) return makeInvalid(obj);
      const o = circumcenter(a, b, c);
      if (!o) return makeInvalid(obj);
      const r = dist(o, a);
      if (r < 1e-8) return makeInvalid(obj);
      return { ...obj, center: o, radius: r, valid: true };
    }

    if (rule === 'incircle') {
      const a = getPoint(scene, parents[0]);
      const b = getPoint(scene, parents[1]);
      const c = getPoint(scene, parents[2]);
      if (!a || !b || !c) return makeInvalid(obj);
      const inc = incenter(a, b, c);
      const r = inradius(a, b, c);
      if (!inc || r < 1e-8) return makeInvalid(obj);
      return { ...obj, center: inc, radius: r, valid: true };
    }
  }

  if (obj.kind === 'arc') {
    const c = getPoint(scene, parents[0]);
    const p1 = getPoint(scene, parents[1]);
    const p2 = getPoint(scene, parents[2]);
    if (!c || !p1 || !p2) return makeInvalid(obj);
    const r = dist(c, p1);
    if (r < 1e-8) return makeInvalid(obj);
    const startAngle = Math.atan2(p1.y - c.y, p1.x - c.x);
    const endAngle = Math.atan2(p2.y - c.y, p2.x - c.x);
    let diff = endAngle - startAngle;
    while (diff < 0) diff += Math.PI * 2;
    return {
      ...obj,
      center: { x: c.x, y: c.y },
      radius: r,
      startAngle,
      endAngle,
      largeArc: diff > Math.PI,
      sweep: true,
      valid: true,
    };
  }

  if (obj.kind === 'polygon') {
    if (rule === 'regular_polygon') {
      const c = getPoint(scene, parents[0]);
      const p = getPoint(scene, parents[1]);
      const sides = Number(params.sides ?? 5);
      if (!c || !p || dist(c, p) < 1e-8) return makeInvalid(obj);
      const vertices = regularPolygonVertices(c, p, sides);
      return {
        ...obj,
        vertices,
        area: polygonArea(vertices),
        perimeter: polygonPerimeter(vertices),
        valid: true,
      };
    }
    const vertices: Vec2[] = [];
    for (const pid of parents) {
      const pt = getPoint(scene, pid);
      if (!pt) return makeInvalid(obj);
      vertices.push({ x: pt.x, y: pt.y });
    }
    if (vertices.length < 3) return makeInvalid(obj);
    return {
      ...obj,
      vertices,
      area: polygonArea(vertices),
      perimeter: polygonPerimeter(vertices),
      valid: true,
    };
  }

  if (obj.kind === 'angle_measure') {
    const a = getPoint(scene, parents[0]);
    const v = getPoint(scene, parents[1]);
    const b = getPoint(scene, parents[2]);
    if (!a || !v || !b) return makeInvalid(obj);
    const deg = angleDegrees(a, v, b);
    if (!Number.isFinite(deg)) return makeInvalid(obj);
    return {
      ...obj,
      vertex: { x: v.x, y: v.y },
      rayA: { x: a.x, y: a.y },
      rayB: { x: b.x, y: b.y },
      degrees: deg,
      isRight: Math.abs(deg - 90) < 0.2,
      valid: true,
    };
  }

  if (obj.kind === 'length_measure') {
    const p1 = getPoint(scene, parents[0]);
    const p2 = getPoint(scene, parents[1]);
    if (!p1 || !p2) return makeInvalid(obj);
    return {
      ...obj,
      p1: { x: p1.x, y: p1.y },
      p2: { x: p2.x, y: p2.y },
      value: dist(p1, p2),
      valid: true,
    };
  }

  return makeInvalid(obj);
}

/** Recompute entire scene in topological creation order (DAG guarantee) */
export function recomputeScene(scene: GeoScene): GeoScene {
  for (const id of scene.order) {
    const obj = scene.objects[id];
    if (!obj) continue;
    scene.objects[id] = evaluateObject(scene, obj);
  }
  return scene;
}

export function moveFreePoint(scene: GeoScene, pointId: string, pos: Vec2): GeoScene {
  const next = cloneScene(scene);
  const obj = next.objects[pointId];
  if (!obj || obj.kind !== 'point') return next;
  if (obj.rule === 'free_point') {
    obj.x = pos.x;
    obj.y = pos.y;
  } else if (obj.rule === 'point_on_object') {
    const host = next.objects[obj.parents[0]];
    if (host && host.valid) {
      if (host.kind === 'line' || host.kind === 'segment' || host.kind === 'ray') {
        let t = paramOnLine(pos, host.p1, host.p2);
        if (host.kind === 'segment') t = Math.max(0.01, Math.min(0.99, t));
        if (host.kind === 'ray') t = Math.max(0.01, t);
        obj.params = { ...obj.params, t };
      } else if (host.kind === 'circle') {
        const angle = Math.atan2(pos.y - host.center.y, pos.x - host.center.x);
        obj.params = { ...obj.params, t: angle, angle };
      }
    }
  }
  return recomputeScene(next);
}

export function getDependents(scene: GeoScene, rootId: string): Set<string> {
  const toDelete = new Set<string>([rootId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of scene.order) {
      if (toDelete.has(id)) continue;
      const obj = scene.objects[id];
      if (obj && obj.parents.some((p) => toDelete.has(p))) {
        toDelete.add(id);
        changed = true;
      }
    }
  }
  return toDelete;
}

export function deleteObjectWithDependents(scene: GeoScene, targetId: string): GeoScene {
  const obj = scene.objects[targetId];
  if (!obj || obj.style.isGiven) return scene;
  const next = cloneScene(scene);
  const removed = getDependents(next, targetId);
  for (const id of removed) {
    delete next.objects[id];
  }
  next.order = next.order.filter((id) => !removed.has(id));
  next.log = next.log.filter(
    (entry) => !entry.createdObjectIds.every((cid) => removed.has(cid))
  );
  return recomputeScene(next);
}

export function computeSceneCosts(scene: GeoScene): {
  totalL: number;
  totalE: number;
  toolsUsed: ToolId[];
} {
  let totalL = 0;
  let totalE = 0;
  const tools = new Set<ToolId>();
  for (const id of scene.order) {
    const obj = scene.objects[id];
    if (!obj || obj.style.isGiven) continue;
    totalL += obj.costL;
    totalE += obj.costE;
    if (obj.createdByTool) tools.add(obj.createdByTool);
  }
  return { totalL, totalE, toolsUsed: Array.from(tools) };
}

export function addGeoObject(
  scene: GeoScene,
  spec: {
    id?: string;
    kind: GeoObject['kind'];
    rule: ConstructionRuleType;
    parents: string[];
    params?: Record<string, number | string | boolean>;
    label?: string;
    x?: number;
    y?: number;
    style?: Partial<GeoStyle>;
    tool?: ToolId;
    costL?: number;
    costE?: number;
    logDescription?: string;
    skipLog?: boolean;
  }
): { scene: GeoScene; id: string } {
  const next = cloneScene(scene);
  const id = spec.id ?? genGeoId(spec.kind.slice(0, 2));
  const label =
    spec.label ??
    (spec.kind === 'point'
      ? nextPointLabel(next)
      : `${spec.kind.slice(0, 1).toUpperCase()}${next.order.length + 1}`);
  const toolInfo = spec.tool ? TOOL_CATALOG[spec.tool] : undefined;
  const costL = spec.style?.isGiven ? 0 : (spec.costL ?? toolInfo?.costL ?? 0);
  const costE = spec.style?.isGiven ? 0 : (spec.costE ?? toolInfo?.costE ?? 0);

  const base = {
    id,
    kind: spec.kind,
    label,
    parents: spec.parents,
    rule: spec.rule,
    params: spec.params,
    valid: true,
    style: defaultStyle(spec.style),
    createdByTool: spec.tool,
    costL,
    costE,
    timestamp: Date.now(),
  };

  let created: GeoObject;
  if (spec.kind === 'point') {
    created = { ...base, kind: 'point', x: spec.x ?? 0, y: spec.y ?? 0 } as GeoPoint;
  } else if (spec.kind === 'line' || spec.kind === 'segment' || spec.kind === 'ray') {
    created = {
      ...base,
      kind: spec.kind,
      p1: { x: 0, y: 0 },
      p2: { x: 1, y: 0 },
      a: 0,
      b: 1,
      c: 0,
    } as GeoLineLike;
  } else if (spec.kind === 'circle') {
    created = { ...base, kind: 'circle', center: { x: 0, y: 0 }, radius: 1 } as GeoCircle;
  } else if (spec.kind === 'arc') {
    created = {
      ...base,
      kind: 'arc',
      center: { x: 0, y: 0 },
      radius: 1,
      startAngle: 0,
      endAngle: Math.PI / 2,
      largeArc: false,
      sweep: true,
    } as GeoArc;
  } else if (spec.kind === 'polygon') {
    created = { ...base, kind: 'polygon', vertices: [], area: 0, perimeter: 0 } as GeoPolygon;
  } else if (spec.kind === 'angle_measure') {
    created = {
      ...base,
      kind: 'angle_measure',
      vertex: { x: 0, y: 0 },
      rayA: { x: 1, y: 0 },
      rayB: { x: 0, y: 1 },
      degrees: 90,
      isRight: true,
    } as GeoAngleMeasure;
  } else {
    created = {
      ...base,
      kind: 'length_measure',
      p1: { x: 0, y: 0 },
      p2: { x: 1, y: 0 },
      value: 1,
    } as GeoLengthMeasure;
  }

  next.objects[id] = created;
  next.order.push(id);
  recomputeScene(next);

  if (!spec.style?.isGiven && !spec.skipLog && spec.tool) {
    const entry: ConstructionLogEntry = {
      id: genGeoId('log'),
      stepNumber: next.log.length + 1,
      tool: spec.tool,
      toolLabel: toolInfo?.name ?? spec.tool,
      description: spec.logDescription ?? `${toolInfo?.name ?? spec.tool} (${label})`,
      usedObjectIds: [...spec.parents],
      createdObjectIds: [id],
      costL,
      costE,
      timestamp: Date.now(),
    };
    next.log.push(entry);
    next.fullAuditLog.push(entry);
  }

  return { scene: next, id };
}

export interface SnapResult {
  type: 'point' | 'intersection' | 'on_object' | 'grid' | 'free';
  pos: Vec2;
  pointId?: string;
  objectIds?: string[];
  branch?: number;
  paramT?: number;
}

/** Find snap target near world coordinate pos */
export function findSnapTarget(
  scene: GeoScene,
  pos: Vec2,
  worldTolerance: number,
  gridSnap = false,
  gridStep = 40
): SnapResult {
  // 1. Existing points have highest priority
  let bestPt: GeoPoint | null = null;
  let bestPtDist = worldTolerance;
  for (const id of scene.order) {
    const obj = scene.objects[id];
    if (!obj || obj.kind !== 'point' || !obj.valid || !obj.style.visible) continue;
    const d = dist(pos, obj);
    if (d < bestPtDist) {
      bestPtDist = d;
      bestPt = obj;
    }
  }
  if (bestPt) {
    return { type: 'point', pos: { x: bestPt.x, y: bestPt.y }, pointId: bestPt.id };
  }

  // 2. Intersections between valid visible curves
  const curves = scene.order
    .map((id) => scene.objects[id])
    .filter(
      (o): o is GeoLineLike | GeoCircle =>
        !!o &&
        o.valid &&
        o.style.visible &&
        (o.kind === 'line' || o.kind === 'segment' || o.kind === 'ray' || o.kind === 'circle')
    );

  let bestInter: { pos: Vec2; o1: string; o2: string; branch: number; d: number } | null = null;
  for (let i = 0; i < curves.length; i++) {
    for (let j = i + 1; j < curves.length; j++) {
      const a = curves[i];
      const b = curves[j];
      let pts: Vec2[] = [];
      if (a.kind === 'circle' && b.kind === 'circle') {
        pts = intersectCircleCircle(a, b);
      } else if (a.kind === 'circle' && b.kind !== 'circle') {
        pts = intersectLineCircle(b, a, true);
      } else if (a.kind !== 'circle' && b.kind === 'circle') {
        pts = intersectLineCircle(a, b, true);
      } else if (a.kind !== 'circle' && b.kind !== 'circle') {
        pts = intersectLineLine(a, b, true);
      }
      for (let idx = 0; idx < pts.length; idx++) {
        const pt = pts[idx];
        const d = dist(pos, pt);
        if (d < worldTolerance && (!bestInter || d < bestInter.d)) {
          bestInter = { pos: pt, o1: a.id, o2: b.id, branch: idx, d };
        }
      }
    }
  }
  if (bestInter) {
    return {
      type: 'intersection',
      pos: bestInter.pos,
      objectIds: [bestInter.o1, bestInter.o2],
      branch: bestInter.branch,
    };
  }

  // 3. Snap on curve
  let bestCurve: { id: string; pos: Vec2; t: number; d: number } | null = null;
  for (const c of curves) {
    if (c.kind === 'circle') {
      const dCenter = dist(pos, c.center);
      const d = Math.abs(dCenter - c.radius);
      if (d < worldTolerance * 0.85 && (!bestCurve || d < bestCurve.d)) {
        const angle = Math.atan2(pos.y - c.center.y, pos.x - c.center.x);
        bestCurve = {
          id: c.id,
          pos: {
            x: c.center.x + c.radius * Math.cos(angle),
            y: c.center.y + c.radius * Math.sin(angle),
          },
          t: angle,
          d,
        };
      }
    } else {
      const d = distPointToLineLike(pos, c);
      if (d < worldTolerance * 0.85 && (!bestCurve || d < bestCurve.d)) {
        let t = paramOnLine(pos, c.p1, c.p2);
        if (c.kind === 'segment') t = Math.max(0, Math.min(1, t));
        if (c.kind === 'ray') t = Math.max(0, t);
        bestCurve = {
          id: c.id,
          pos: {
            x: c.p1.x + t * (c.p2.x - c.p1.x),
            y: c.p1.y + t * (c.p2.y - c.p1.y),
          },
          t,
          d,
        };
      }
    }
  }
  if (bestCurve) {
    return {
      type: 'on_object',
      pos: bestCurve.pos,
      objectIds: [bestCurve.id],
      paramT: bestCurve.t,
    };
  }

  if (gridSnap) {
    return {
      type: 'grid',
      pos: {
        x: Math.round(pos.x / gridStep) * gridStep,
        y: Math.round(pos.y / gridStep) * gridStep,
      },
    };
  }

  return { type: 'free', pos };
}

/** Find object closest to click point for selection or tool targeting */
export function hitTestObject(
  scene: GeoScene,
  pos: Vec2,
  worldTolerance: number,
  allowedKinds?: GeoObject['kind'][]
): GeoObject | null {
  const allow = (k: GeoObject['kind']) => !allowedKinds || allowedKinds.includes(k);

  if (allow('point')) {
    let best: GeoPoint | null = null;
    let bestD = worldTolerance;
    for (const id of scene.order) {
      const o = scene.objects[id];
      if (!o || o.kind !== 'point' || !o.valid || !o.style.visible) continue;
      const d = dist(pos, o);
      if (d < bestD) {
        bestD = d;
        best = o;
      }
    }
    if (best) return best;
  }

  let bestCurve: GeoObject | null = null;
  let bestD = worldTolerance;
  for (const id of scene.order) {
    const o = scene.objects[id];
    if (!o || !o.valid || !o.style.visible || !allow(o.kind)) continue;
    if (o.kind === 'line' || o.kind === 'segment' || o.kind === 'ray') {
      const d = distPointToLineLike(pos, o);
      if (d < bestD) {
        bestD = d;
        bestCurve = o;
      }
    } else if (o.kind === 'circle') {
      const d = Math.abs(dist(pos, o.center) - o.radius);
      if (d < bestD) {
        bestD = d;
        bestCurve = o;
      }
    } else if (o.kind === 'polygon' && o.vertices.length >= 3) {
      for (let i = 0; i < o.vertices.length; i++) {
        const a = o.vertices[i];
        const b = o.vertices[(i + 1) % o.vertices.length];
        const d = distPointToLineLike(pos, { kind: 'segment', p1: a, p2: b });
        if (d < bestD) {
          bestD = d;
          bestCurve = o;
        }
      }
    }
  }
  return bestCurve;
}

/** Compute scene bounding box in world coordinates for Fit-to-Screen */
export function getSceneBounds(scene: GeoScene): {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
} {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const include = (x: number, y: number) => {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  };

  for (const id of scene.order) {
    const o = scene.objects[id];
    if (!o || !o.valid || !o.style.visible) continue;
    if (o.kind === 'point') {
      include(o.x, o.y);
    } else if (o.kind === 'segment' || o.kind === 'line' || o.kind === 'ray') {
      include(o.p1.x, o.p1.y);
      include(o.p2.x, o.p2.y);
    } else if (o.kind === 'circle') {
      include(o.center.x - o.radius, o.center.y - o.radius);
      include(o.center.x + o.radius, o.center.y + o.radius);
    } else if (o.kind === 'polygon') {
      o.vertices.forEach((v) => include(v.x, v.y));
    }
  }

  if (!Number.isFinite(minX)) {
    return { minX: -240, maxX: 240, minY: -180, maxY: 180 };
  }
  const pad = Math.max(60, Math.max(maxX - minX, maxY - minY) * 0.22);
  return { minX: minX - pad, maxX: maxX + pad, minY: minY - pad, maxY: maxY + pad };
}
