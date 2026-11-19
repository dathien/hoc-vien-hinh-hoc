import type { GeoCircle, GeoLineLike, Vec2 } from './types';

export const BASE_EPS = 1e-6;

export function dist(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function distSq(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

export function add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

export function scaleVec(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

export function dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

export function cross(a: Vec2, b: Vec2): number {
  return a.x * b.y - a.y * b.x;
}

export function midpointVec(a: Vec2, b: Vec2): Vec2 {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function isFiniteVec(p: Vec2 | null | undefined): p is Vec2 {
  return !!p && Number.isFinite(p.x) && Number.isFinite(p.y);
}

export function relativeEps(scale = 100): number {
  return Math.max(1e-5, Math.abs(scale) * 1e-4);
}

export function pointsEqual(a: Vec2, b: Vec2, scale = 100): boolean {
  return dist(a, b) <= relativeEps(scale);
}

/** Normalized line equation ax + by + c = 0 with a^2 + b^2 = 1 */
export function lineEquation(p1: Vec2, p2: Vec2): { a: number; b: number; c: number } | null {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) return null;
  const a = -dy / len;
  const b = dx / len;
  const c = -(a * p1.x + b * p1.y);
  return { a, b, c };
}

export function signedDistPointToLine(p: Vec2, a: number, b: number, c: number): number {
  return a * p.x + b * p.y + c;
}

export function distPointToLine(p: Vec2, p1: Vec2, p2: Vec2): number {
  const eq = lineEquation(p1, p2);
  if (!eq) return dist(p, p1);
  return Math.abs(signedDistPointToLine(p, eq.a, eq.b, eq.c));
}

export function projectPointToLine(p: Vec2, p1: Vec2, p2: Vec2): Vec2 | null {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-12) return null;
  const t = ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / lenSq;
  return { x: p1.x + t * dx, y: p1.y + t * dy };
}

export function paramOnLine(p: Vec2, p1: Vec2, p2: Vec2): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-12) return 0;
  return ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / lenSq;
}

export function pointOnLineLike(p: Vec2, line: Pick<GeoLineLike, 'kind' | 'p1' | 'p2' | 'a' | 'b' | 'c'>, tol?: number): boolean {
  const segLen = Math.max(dist(line.p1, line.p2), 1);
  const eps = tol ?? relativeEps(segLen);
  const d = Math.abs(line.a * p.x + line.b * p.y + line.c);
  if (d > eps) return false;
  if (line.kind === 'line') return true;
  const t = paramOnLine(p, line.p1, line.p2);
  const tEps = eps / segLen;
  if (line.kind === 'ray') return t >= -tEps;
  return t >= -tEps && t <= 1 + tEps;
}

export function distPointToLineLike(p: Vec2, line: Pick<GeoLineLike, 'kind' | 'p1' | 'p2'>): number {
  const dx = line.p2.x - line.p1.x;
  const dy = line.p2.y - line.p1.y;
  const lenSq = dx * dx + dy * dy;
  if (lenSq < 1e-12) return dist(p, line.p1);
  let t = ((p.x - line.p1.x) * dx + (p.y - line.p1.y) * dy) / lenSq;
  if (line.kind === 'segment') t = Math.max(0, Math.min(1, t));
  else if (line.kind === 'ray') t = Math.max(0, t);
  const proj = { x: line.p1.x + t * dx, y: line.p1.y + t * dy };
  return dist(p, proj);
}

export function intersectLineLine(
  l1: Pick<GeoLineLike, 'kind' | 'p1' | 'p2' | 'a' | 'b' | 'c'>,
  l2: Pick<GeoLineLike, 'kind' | 'p1' | 'p2' | 'a' | 'b' | 'c'>,
  strictBounds = true
): Vec2[] {
  const det = l1.a * l2.b - l2.a * l1.b;
  if (Math.abs(det) < 1e-9) return []; // parallel or coincident
  const x = (l1.b * l2.c - l2.b * l1.c) / det;
  const y = (l2.a * l1.c - l1.a * l2.c) / det;
  const pt = { x, y };
  if (!isFiniteVec(pt)) return [];
  if (strictBounds) {
    if (!pointOnLineLike(pt, l1) || !pointOnLineLike(pt, l2)) return [];
  }
  return [pt];
}

export function intersectLineCircle(
  line: Pick<GeoLineLike, 'kind' | 'p1' | 'p2' | 'a' | 'b' | 'c'>,
  circle: Pick<GeoCircle, 'center' | 'radius'>,
  strictBounds = true
): Vec2[] {
  if (circle.radius < 1e-9) return [];
  const d = line.a * circle.center.x + line.b * circle.center.y + line.c;
  const foot = {
    x: circle.center.x - line.a * d,
    y: circle.center.y - line.b * d,
  };
  const tol = relativeEps(circle.radius);
  if (Math.abs(d) > circle.radius + tol) return [];
  const dir = { x: -line.b, y: line.a };
  const hSq = Math.max(0, circle.radius * circle.radius - d * d);
  const h = Math.sqrt(hSq);
  const pts: Vec2[] =
    h <= tol * 0.5
      ? [foot]
      : [
          { x: foot.x + dir.x * h, y: foot.y + dir.y * h },
          { x: foot.x - dir.x * h, y: foot.y - dir.y * h },
        ];
  if (!strictBounds) return pts;
  return pts.filter((p) => pointOnLineLike(p, line));
}

export function intersectCircleCircle(
  c1: Pick<GeoCircle, 'center' | 'radius'>,
  c2: Pick<GeoCircle, 'center' | 'radius'>
): Vec2[] {
  if (c1.radius < 1e-9 || c2.radius < 1e-9) return [];
  const dx = c2.center.x - c1.center.x;
  const dy = c2.center.y - c1.center.y;
  const d = Math.hypot(dx, dy);
  const scale = Math.max(c1.radius, c2.radius, d, 1);
  const tol = relativeEps(scale);

  if (d < tol) return []; // concentric or coincident
  if (d > c1.radius + c2.radius + tol) return []; // disjoint
  if (d < Math.abs(c1.radius - c2.radius) - tol) return []; // contained

  const a = (c1.radius * c1.radius - c2.radius * c2.radius + d * d) / (2 * d);
  const hSq = Math.max(0, c1.radius * c1.radius - a * a);
  const h = Math.sqrt(hSq);
  const xm = c1.center.x + (a * dx) / d;
  const ym = c1.center.y + (a * dy) / d;
  const rx = (-dy * h) / d;
  const ry = (dx * h) / d;

  if (h <= tol * 0.5) {
    return [{ x: xm, y: ym }];
  }
  return [
    { x: xm + rx, y: ym + ry },
    { x: xm - rx, y: ym - ry },
  ];
}

export function reflectPointOverLine(p: Vec2, l1: Vec2, l2: Vec2): Vec2 | null {
  const foot = projectPointToLine(p, l1, l2);
  if (!foot) return null;
  return { x: 2 * foot.x - p.x, y: 2 * foot.y - p.y };
}

export function reflectPointOverPoint(p: Vec2, center: Vec2): Vec2 {
  return { x: 2 * center.x - p.x, y: 2 * center.y - p.y };
}

export function translatePoint(p: Vec2, vFrom: Vec2, vTo: Vec2): Vec2 {
  return { x: p.x + (vTo.x - vFrom.x), y: p.y + (vTo.y - vFrom.y) };
}

export function rotatePoint(p: Vec2, center: Vec2, angleDeg: number): Vec2 {
  const rad = (angleDeg * Math.PI) / 180;
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  return { x: center.x + dx * c - dy * s, y: center.y + dx * s + dy * c };
}

export function homothetyPoint(p: Vec2, center: Vec2, factor: number): Vec2 {
  return {
    x: center.x + factor * (p.x - center.x),
    y: center.y + factor * (p.y - center.y),
  };
}

export function angleDegrees(a: Vec2, vertex: Vec2, b: Vec2): number {
  const v1 = sub(a, vertex);
  const v2 = sub(b, vertex);
  const l1 = Math.hypot(v1.x, v1.y);
  const l2 = Math.hypot(v2.x, v2.y);
  if (l1 < 1e-9 || l2 < 1e-9) return NaN;
  const cosVal = Math.max(-1, Math.min(1, dot(v1, v2) / (l1 * l2)));
  return (Math.acos(cosVal) * 180) / Math.PI;
}

export function areCollinear(a: Vec2, b: Vec2, c: Vec2, scale?: number): boolean {
  const s = scale ?? Math.max(dist(a, b), dist(b, c), dist(a, c), 1);
  const area2 = Math.abs(cross(sub(b, a), sub(c, a)));
  return area2 <= relativeEps(s) * s * 2;
}

export function areParallel(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): boolean {
  const u = sub(a2, a1);
  const v = sub(b2, b1);
  const lu = Math.hypot(u.x, u.y);
  const lv = Math.hypot(v.x, v.y);
  if (lu < 1e-9 || lv < 1e-9) return false;
  return Math.abs(cross(u, v)) / (lu * lv) < 1e-3;
}

export function arePerpendicular(a1: Vec2, a2: Vec2, b1: Vec2, b2: Vec2): boolean {
  const u = sub(a2, a1);
  const v = sub(b2, b1);
  const lu = Math.hypot(u.x, u.y);
  const lv = Math.hypot(v.x, v.y);
  if (lu < 1e-9 || lv < 1e-9) return false;
  return Math.abs(dot(u, v)) / (lu * lv) < 1e-3;
}

export function centroid(a: Vec2, b: Vec2, c: Vec2): Vec2 {
  return { x: (a.x + b.x + c.x) / 3, y: (a.y + b.y + c.y) / 3 };
}

export function circumcenter(a: Vec2, b: Vec2, c: Vec2): Vec2 | null {
  const d = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  if (Math.abs(d) < 1e-7) return null;
  const a2 = a.x * a.x + a.y * a.y;
  const b2 = b.x * b.x + b.y * b.y;
  const c2 = c.x * c.x + c.y * c.y;
  const ux = (a2 * (b.y - c.y) + b2 * (c.y - a.y) + c2 * (a.y - b.y)) / d;
  const uy = (a2 * (c.x - b.x) + b2 * (a.x - c.x) + c2 * (b.x - a.x)) / d;
  return { x: ux, y: uy };
}

export function incenter(a: Vec2, b: Vec2, c: Vec2): Vec2 | null {
  const la = dist(b, c);
  const lb = dist(a, c);
  const lc = dist(a, b);
  const p = la + lb + lc;
  if (p < 1e-9 || areCollinear(a, b, c)) return null;
  return {
    x: (la * a.x + lb * b.x + lc * c.x) / p,
    y: (la * a.y + lb * b.y + lc * c.y) / p,
  };
}

export function orthocenter(a: Vec2, b: Vec2, c: Vec2): Vec2 | null {
  const o = circumcenter(a, b, c);
  if (!o) return null;
  // Euler vector relation: H = A + B + C - 2O
  return {
    x: a.x + b.x + c.x - 2 * o.x,
    y: a.y + b.y + c.y - 2 * o.y,
  };
}

export function inradius(a: Vec2, b: Vec2, c: Vec2): number {
  const la = dist(b, c);
  const lb = dist(a, c);
  const lc = dist(a, b);
  const s = (la + lb + lc) / 2;
  const area = Math.abs(cross(sub(b, a), sub(c, a))) / 2;
  if (s < 1e-9) return 0;
  return area / s;
}

export function polygonArea(pts: Vec2[]): number {
  if (pts.length < 3) return 0;
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    sum += pts[i].x * pts[j].y - pts[j].x * pts[i].y;
  }
  return Math.abs(sum) / 2;
}

export function polygonPerimeter(pts: Vec2[]): number {
  if (pts.length < 2) return 0;
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    sum += dist(pts[i], pts[(i + 1) % pts.length]);
  }
  return sum;
}

export function areConcyclic(a: Vec2, b: Vec2, c: Vec2, d: Vec2): boolean {
  const o = circumcenter(a, b, c);
  if (!o) return false;
  const r = dist(o, a);
  return Math.abs(dist(o, d) - r) <= relativeEps(r) * 3;
}

export function areConcurrent(
  l1: [Vec2, Vec2],
  l2: [Vec2, Vec2],
  l3: [Vec2, Vec2]
): boolean {
  const eq1 = lineEquation(l1[0], l1[1]);
  const eq2 = lineEquation(l2[0], l2[1]);
  const eq3 = lineEquation(l3[0], l3[1]);
  if (!eq1 || !eq2 || !eq3) return false;
  const pts = intersectLineLine(
    { kind: 'line', p1: l1[0], p2: l1[1], ...eq1 },
    { kind: 'line', p1: l2[0], p2: l2[1], ...eq2 },
    false
  );
  if (pts.length === 0) return false;
  const scale = Math.max(dist(l3[0], l3[1]), 100);
  return Math.abs(signedDistPointToLine(pts[0], eq3.a, eq3.b, eq3.c)) <= relativeEps(scale) * 3;
}

export function isEquilateralTriangle(a: Vec2, b: Vec2, c: Vec2): boolean {
  const d1 = dist(a, b);
  const d2 = dist(b, c);
  const d3 = dist(c, a);
  if (d1 < 1e-4) return false;
  const tol = relativeEps(d1) * 4;
  return Math.abs(d1 - d2) <= tol && Math.abs(d2 - d3) <= tol && Math.abs(d3 - d1) <= tol;
}

export function isIsoscelesTriangle(a: Vec2, b: Vec2, c: Vec2): boolean {
  const d1 = dist(a, b);
  const d2 = dist(b, c);
  const d3 = dist(c, a);
  const s = Math.max(d1, d2, d3);
  if (s < 1e-4 || areCollinear(a, b, c)) return false;
  const tol = relativeEps(s) * 4;
  return Math.abs(d1 - d2) <= tol || Math.abs(d2 - d3) <= tol || Math.abs(d3 - d1) <= tol;
}

export function isRightTriangle(a: Vec2, b: Vec2, c: Vec2): boolean {
  if (areCollinear(a, b, c)) return false;
  const angA = angleDegrees(b, a, c);
  const angB = angleDegrees(a, b, c);
  const angC = angleDegrees(a, c, b);
  return (
    Math.abs(angA - 90) < 0.25 ||
    Math.abs(angB - 90) < 0.25 ||
    Math.abs(angC - 90) < 0.25
  );
}

export function tangentPointsFromExternalPoint(p: Vec2, center: Vec2, radius: number): Vec2[] {
  const d = dist(p, center);
  if (d < radius - relativeEps(radius)) return [];
  if (Math.abs(d - radius) <= relativeEps(radius)) return [p];
  const mid = midpointVec(p, center);
  return intersectCircleCircle({ center, radius }, { center: mid, radius: d / 2 });
}

export function regularPolygonVertices(center: Vec2, start: Vec2, sides: number): Vec2[] {
  const n = Math.max(3, Math.min(24, Math.round(sides)));
  const r = dist(center, start);
  const startAngle = Math.atan2(start.y - center.y, start.x - center.x);
  const verts: Vec2[] = [];
  for (let i = 0; i < n; i++) {
    const a = startAngle + (2 * Math.PI * i) / n;
    verts.push({ x: center.x + r * Math.cos(a), y: center.y + r * Math.sin(a) });
  }
  return verts;
}
