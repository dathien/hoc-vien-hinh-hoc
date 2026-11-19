import type { LengthUnit3D, Vec3 } from './types3d';

export const EPS3D = 1e-6;
export const ANGLE_EPS = 1e-5;

export function v3(x: number, y: number, z: number): Vec3 {
  return {
    x: Number.isFinite(x) ? x : 0,
    y: Number.isFinite(y) ? y : 0,
    z: Number.isFinite(z) ? z : 0,
  };
}

export function isFiniteVec3(v: Vec3 | null | undefined): v is Vec3 {
  return Boolean(v && Number.isFinite(v.x) && Number.isFinite(v.y) && Number.isFinite(v.z));
}

export function add3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function sub3(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function scale3(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

export function dot3(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross3(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function normSq3(a: Vec3): number {
  return a.x * a.x + a.y * a.y + a.z * a.z;
}

export function norm3(a: Vec3): number {
  return Math.sqrt(normSq3(a));
}

export function dist3(a: Vec3, b: Vec3): number {
  return norm3(sub3(a, b));
}

export function midpoint3(a: Vec3, b: Vec3): Vec3 {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, z: (a.z + b.z) / 2 };
}

export function lerp3(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    z: a.z + (b.z - a.z) * t,
  };
}

export function normalize3(a: Vec3): Vec3 | null {
  const n = norm3(a);
  if (n < EPS3D) return null;
  return { x: a.x / n, y: a.y / n, z: a.z / n };
}

export function scaleEps(scale = 1): number {
  return Math.max(EPS3D, EPS3D * Math.max(1, Math.abs(scale)));
}

export function clamp(val: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, val));
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function roundNum(val: number, digits = 2): number {
  if (!Number.isFinite(val)) return 0;
  const f = 10 ** digits;
  const r = Math.round(val * f) / f;
  return Object.is(r, -0) ? 0 : r;
}

export function formatNum(val: number, digits = 2): string {
  if (!Number.isFinite(val)) return '—';
  const r = roundNum(val, digits);
  return r.toString();
}

export function formatUnit(kind: 'length' | 'area' | 'volume', unit: LengthUnit3D): string {
  if (unit === 'cm') return kind === 'length' ? 'cm' : kind === 'area' ? 'cm²' : 'cm³';
  if (unit === 'm') return kind === 'length' ? 'm' : kind === 'area' ? 'm²' : 'm³';
  return kind === 'length' ? 'đvđd' : kind === 'area' ? 'đvdt' : 'đvtt';
}

export function formatPlaneEquation(a: number, b: number, c: number, d: number): string {
  // Normalize nicely so leading non-zero coefficient is positive
  const mag = Math.max(Math.abs(a), Math.abs(b), Math.abs(c), 1e-9);
  let na = a / mag;
  let nb = b / mag;
  let nc = c / mag;
  let nd = d / mag;
  const firstNonZero = [na, nb, nc].find((v) => Math.abs(v) > 1e-4) ?? 1;
  if (firstNonZero < 0) {
    na = -na;
    nb = -nb;
    nc = -nc;
    nd = -nd;
  }

  const terms: string[] = [];
  const pushTerm = (coef: number, sym: string) => {
    if (Math.abs(coef) < 1e-4) return;
    const r = roundNum(coef, 2);
    const absR = Math.abs(r);
    const sign = r >= 0 ? (terms.length > 0 ? ' + ' : '') : terms.length > 0 ? ' - ' : '-';
    const coeffStr = sym && Math.abs(absR - 1) < 1e-4 ? '' : `${absR}`;
    terms.push(`${sign}${coeffStr}${sym}`);
  };

  pushTerm(na, 'x');
  pushTerm(nb, 'y');
  pushTerm(nc, 'z');
  pushTerm(nd, '');

  return terms.length > 0 ? `${terms.join('')} = 0` : '0 = 0';
}

export function formatLineParametric(origin: Vec3, dir: Vec3): string {
  const ox = formatNum(origin.x);
  const oy = formatNum(origin.y);
  const oz = formatNum(origin.z);
  const dx = formatNum(dir.x);
  const dy = formatNum(dir.y);
  const dz = formatNum(dir.z);
  return `x = ${ox} + (${dx})t; y = ${oy} + (${dy})t; z = ${oz} + (${dz})t`;
}

/** Build an orthonormal basis (u, v) spanning the plane with unit normal n */
export function planeBasis(normal: Vec3): { u: Vec3; v: Vec3 } {
  const n = normalize3(normal) ?? { x: 0, y: 0, z: 1 };
  const ref = Math.abs(n.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 1, y: 0, z: 0 };
  const u = normalize3(cross3(ref, n)) ?? { x: 1, y: 0, z: 0 };
  const v = normalize3(cross3(n, u)) ?? { x: 0, y: 1, z: 0 };
  return { u, v };
}

/** Rotate point around origin by Euler angles XYZ (in degrees) */
export function rotateEulerXYZ(p: Vec3, rotDeg: Vec3): Vec3 {
  let { x, y, z } = p;
  if (Math.abs(rotDeg.x) > EPS3D) {
    const rad = degToRad(rotDeg.x);
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const ny = y * c - z * s;
    const nz = y * s + z * c;
    y = ny;
    z = nz;
  }
  if (Math.abs(rotDeg.y) > EPS3D) {
    const rad = degToRad(rotDeg.y);
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const nx = x * c + z * s;
    const nz = -x * s + z * c;
    x = nx;
    z = nz;
  }
  if (Math.abs(rotDeg.z) > EPS3D) {
    const rad = degToRad(rotDeg.z);
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const nx = x * c - y * s;
    const ny = x * s + y * c;
    x = nx;
    y = ny;
  }
  return { x, y, z };
}

/** Rodrigues rotation of point p around line (axisOrigin, axisDir) by angleDeg */
export function rotateAroundAxis(p: Vec3, axisOrigin: Vec3, axisDir: Vec3, angleDeg: number): Vec3 {
  const k = normalize3(axisDir);
  if (!k) return p;
  const rad = degToRad(angleDeg);
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  const v = sub3(p, axisOrigin);
  const term1 = scale3(v, cosA);
  const term2 = scale3(cross3(k, v), sinA);
  const term3 = scale3(k, dot3(k, v) * (1 - cosA));
  return add3(axisOrigin, add3(add3(term1, term2), term3));
}

/** Point projection onto line (origin, unit dir) */
export function projectPointToLine(p: Vec3, origin: Vec3, dir: Vec3): { foot: Vec3; t: number; distance: number } {
  const u = normalize3(dir) ?? { x: 1, y: 0, z: 0 };
  const t = dot3(sub3(p, origin), u);
  const foot = add3(origin, scale3(u, t));
  return { foot, t, distance: dist3(p, foot) };
}

/** Point projection onto plane (unit normal n, n·X + d = 0) */
export function projectPointToPlane(p: Vec3, normal: Vec3, d: number): { foot: Vec3; signedDistance: number; distance: number } {
  const n = normalize3(normal) ?? { x: 0, y: 0, z: 1 };
  const signedDistance = dot3(n, p) + d;
  const foot = sub3(p, scale3(n, signedDistance));
  return { foot, signedDistance, distance: Math.abs(signedDistance) };
}

/** Reflect point across point center */
export function reflectPointAcrossPoint(p: Vec3, center: Vec3): Vec3 {
  return sub3(scale3(center, 2), p);
}

/** Reflect point across plane (unit normal, d) */
export function reflectPointAcrossPlane(p: Vec3, normal: Vec3, d: number): Vec3 {
  const { foot } = projectPointToPlane(p, normal, d);
  return reflectPointAcrossPoint(p, foot);
}

/** Angle between two non-zero vectors in degrees [0, 180] */
export function angleBetweenVectorsDeg(u: Vec3, v: Vec3): number | null {
  const nu = normalize3(u);
  const nv = normalize3(v);
  if (!nu || !nv) return null;
  return radToDeg(Math.acos(clamp(dot3(nu, nv), -1, 1)));
}

/** Angle between two lines in degrees [0, 90] */
export function angleBetweenLinesDeg(d1: Vec3, d2: Vec3): number | null {
  const u1 = normalize3(d1);
  const u2 = normalize3(d2);
  if (!u1 || !u2) return null;
  return radToDeg(Math.acos(clamp(Math.abs(dot3(u1, u2)), 0, 1)));
}

/** Angle between line (dir) and plane (normal) in degrees [0, 90] */
export function angleLinePlaneDeg(lineDir: Vec3, planeNormal: Vec3): number | null {
  const u = normalize3(lineDir);
  const n = normalize3(planeNormal);
  if (!u || !n) return null;
  return radToDeg(Math.asin(clamp(Math.abs(dot3(u, n)), 0, 1)));
}

/** Angle between two planes in degrees [0, 90] */
export function angleBetweenPlanesDeg(n1: Vec3, n2: Vec3): number | null {
  const u1 = normalize3(n1);
  const u2 = normalize3(n2);
  if (!u1 || !u2) return null;
  return radToDeg(Math.acos(clamp(Math.abs(dot3(u1, u2)), 0, 1)));
}

/**
 * Dihedral angle [P, AB, Q] in degrees [0, 180] defined by two half-planes bounded by edge AB
 * containing points P and Q respectively. Distinct from acute angle between two planes!
 */
export function dihedralAngleDeg(p: Vec3, a: Vec3, b: Vec3, q: Vec3): number | null {
  const edge = normalize3(sub3(b, a));
  if (!edge) return null;
  const ap = sub3(p, a);
  const aq = sub3(q, a);
  const perpP = sub3(ap, scale3(edge, dot3(ap, edge)));
  const perpQ = sub3(aq, scale3(edge, dot3(aq, edge)));
  return angleBetweenVectorsDeg(perpP, perpQ);
}

/**
 * Closest points and geometric relation between two lines L1(o1, d1) and L2(o2, d2).
 */
export interface LineLineRelationResult {
  relation: 'coincident' | 'parallel' | 'intersecting' | 'skew';
  isPerpendicular: boolean;
  distance: number;
  angleDeg: number;
  intersection?: Vec3;
  closestP1?: Vec3;
  closestP2?: Vec3;
  summaryVi: string;
}

export function analyzeLineLineRelation(o1: Vec3, d1Raw: Vec3, o2: Vec3, d2Raw: Vec3): LineLineRelationResult {
  const u = normalize3(d1Raw) ?? { x: 1, y: 0, z: 0 };
  const v = normalize3(d2Raw) ?? { x: 1, y: 0, z: 0 };
  const w0 = sub3(o1, o2);
  const scale = Math.max(1, norm3(o1), norm3(o2), norm3(w0));
  const tol = scaleEps(scale) * 20;

  const angleDeg = angleBetweenLinesDeg(u, v) ?? 0;
  const isPerpendicular = Math.abs(angleDeg - 90) < 0.05;

  const crossUV = cross3(u, v);
  const crossNorm = norm3(crossUV);

  if (crossNorm < 1e-5) {
    // Parallel or coincident
    const { distance } = projectPointToLine(o2, o1, u);
    if (distance < tol) {
      return {
        relation: 'coincident',
        isPerpendicular: false,
        distance: 0,
        angleDeg: 0,
        summaryVi: 'Hai đường thẳng trùng nhau.',
      };
    }
    return {
      relation: 'parallel',
      isPerpendicular: false,
      distance,
      angleDeg: 0,
      summaryVi: `Hai đường thẳng song song (khoảng cách = ${formatNum(distance, 3)}).`,
    };
  }

  // Non-parallel: solve closest points
  const a = dot3(u, u); // 1
  const b = dot3(u, v);
  const c = dot3(v, v); // 1
  const d = dot3(u, w0);
  const e = dot3(v, w0);
  const denom = a * c - b * b;

  const sc = (b * e - c * d) / denom;
  const tc = (a * e - b * d) / denom;
  const p1 = add3(o1, scale3(u, sc));
  const p2 = add3(o2, scale3(v, tc));
  const distance = dist3(p1, p2);

  if (distance < tol) {
    const inter = midpoint3(p1, p2);
    return {
      relation: 'intersecting',
      isPerpendicular,
      distance: 0,
      angleDeg,
      intersection: inter,
      closestP1: inter,
      closestP2: inter,
      summaryVi: isPerpendicular
        ? `Hai đường thẳng cắt nhau và vuông góc tại (${formatNum(inter.x)}; ${formatNum(inter.y)}; ${formatNum(inter.z)}).`
        : `Hai đường thẳng cắt nhau tại (${formatNum(inter.x)}; ${formatNum(inter.y)}; ${formatNum(inter.z)}), góc = ${formatNum(angleDeg, 1)}°.`,
    };
  }

  return {
    relation: 'skew',
    isPerpendicular,
    distance,
    angleDeg,
    closestP1: p1,
    closestP2: p2,
    summaryVi: isPerpendicular
      ? `Hai đường thẳng chéo nhau và vuông góc (khoảng cách = ${formatNum(distance, 3)}).`
      : `Hai đường thẳng chéo nhau (khoảng cách = ${formatNum(distance, 3)}, góc = ${formatNum(angleDeg, 1)}°).`,
  };
}

export interface LinePlaneRelationResult {
  relation: 'contained' | 'parallel' | 'intersecting';
  isPerpendicular: boolean;
  distance: number;
  angleDeg: number;
  intersection?: Vec3;
  summaryVi: string;
}

export function analyzeLinePlaneRelation(
  origin: Vec3,
  dirRaw: Vec3,
  normalRaw: Vec3,
  d: number
): LinePlaneRelationResult {
  const u = normalize3(dirRaw) ?? { x: 1, y: 0, z: 0 };
  const n = normalize3(normalRaw) ?? { x: 0, y: 0, z: 1 };
  const denom = dot3(n, u);
  const num = dot3(n, origin) + d;
  const scale = Math.max(1, norm3(origin), Math.abs(d));
  const tol = scaleEps(scale) * 20;

  if (Math.abs(denom) < 1e-5) {
    const dist = Math.abs(num);
    if (dist < tol) {
      return {
        relation: 'contained',
        isPerpendicular: false,
        distance: 0,
        angleDeg: 0,
        summaryVi: 'Đường thẳng nằm trong mặt phẳng.',
      };
    }
    return {
      relation: 'parallel',
      isPerpendicular: false,
      distance: dist,
      angleDeg: 0,
      summaryVi: `Đường thẳng song song với mặt phẳng (khoảng cách = ${formatNum(dist, 3)}).`,
    };
  }

  const t = -num / denom;
  const inter = add3(origin, scale3(u, t));
  const angleDeg = angleLinePlaneDeg(u, n) ?? 0;
  const isPerpendicular = Math.abs(angleDeg - 90) < 0.05;
  return {
    relation: 'intersecting',
    isPerpendicular,
    distance: 0,
    angleDeg,
    intersection: inter,
    summaryVi: isPerpendicular
      ? `Đường thẳng vuông góc và cắt mặt phẳng tại (${formatNum(inter.x)}; ${formatNum(inter.y)}; ${formatNum(inter.z)}).`
      : `Đường thẳng cắt mặt phẳng tại (${formatNum(inter.x)}; ${formatNum(inter.y)}; ${formatNum(inter.z)}), góc = ${formatNum(angleDeg, 1)}°.`,
  };
}

export interface PlanePlaneRelationResult {
  relation: 'coincident' | 'parallel' | 'intersecting';
  isPerpendicular: boolean;
  distance: number;
  angleDeg: number;
  intersectionOrigin?: Vec3;
  intersectionDir?: Vec3;
  summaryVi: string;
}

export function analyzePlanePlaneRelation(
  n1Raw: Vec3,
  d1: number,
  n2Raw: Vec3,
  d2: number
): PlanePlaneRelationResult {
  const n1 = normalize3(n1Raw) ?? { x: 0, y: 0, z: 1 };
  const n2 = normalize3(n2Raw) ?? { x: 0, y: 0, z: 1 };
  const dir = cross3(n1, n2);
  const dirNorm = norm3(dir);
  const scale = Math.max(1, Math.abs(d1), Math.abs(d2));
  const tol = scaleEps(scale) * 20;

  if (dirNorm < 1e-5) {
    const sign = dot3(n1, n2) >= 0 ? 1 : -1;
    const dist = Math.abs(d1 - sign * d2);
    if (dist < tol) {
      return {
        relation: 'coincident',
        isPerpendicular: false,
        distance: 0,
        angleDeg: 0,
        summaryVi: 'Hai mặt phẳng trùng nhau.',
      };
    }
    return {
      relation: 'parallel',
      isPerpendicular: false,
      distance: dist,
      angleDeg: 0,
      summaryVi: `Hai mặt phẳng song song (khoảng cách = ${formatNum(dist, 3)}).`,
    };
  }

  const u = scale3(dir, 1 / dirNorm);
  // Find a point on intersection line: p = ((d2 * n1 - d1 * n2) x dir) / |dir|^2 ... standard formula:
  // Solve n1·p = -d1, n2·p = -d2, u·p = 0
  const n1DotN2 = dot3(n1, n2);
  const denom = 1 - n1DotN2 * n1DotN2;
  const c1 = (-d1 + d2 * n1DotN2) / denom;
  const c2 = (-d2 + d1 * n1DotN2) / denom;
  const origin = add3(scale3(n1, c1), scale3(n2, c2));

  const angleDeg = angleBetweenPlanesDeg(n1, n2) ?? 0;
  const isPerpendicular = Math.abs(angleDeg - 90) < 0.05;
  return {
    relation: 'intersecting',
    isPerpendicular,
    distance: 0,
    angleDeg,
    intersectionOrigin: origin,
    intersectionDir: u,
    summaryVi: isPerpendicular
      ? 'Hai mặt phẳng cắt nhau và vuông góc (góc = 90°).'
      : `Hai mặt phẳng cắt nhau theo giao tuyến (góc = ${formatNum(angleDeg, 1)}°).`,
  };
}

/** Check collinearity of 3+ points */
export function arePointsCollinear(pts: Vec3[]): boolean {
  if (pts.length < 3) return true;
  const a = pts[0];
  let refDir: Vec3 | null = null;
  for (let i = 1; i < pts.length; i++) {
    const d = sub3(pts[i], a);
    if (norm3(d) > 1e-5) {
      refDir = normalize3(d);
      break;
    }
  }
  if (!refDir) return true;
  for (let i = 1; i < pts.length; i++) {
    const c = cross3(sub3(pts[i], a), refDir);
    if (norm3(c) > 1e-4) return false;
  }
  return true;
}

/** Check coplanarity of 4+ points */
export function arePointsCoplanar(pts: Vec3[]): boolean {
  if (pts.length <= 3) return true;
  const a = pts[0];
  let n: Vec3 | null = null;
  for (let i = 1; i < pts.length && !n; i++) {
    for (let j = i + 1; j < pts.length && !n; j++) {
      const c = cross3(sub3(pts[i], a), sub3(pts[j], a));
      if (norm3(c) > 1e-5) {
        n = normalize3(c);
      }
    }
  }
  if (!n) return true; // all collinear -> coplanar
  for (let i = 0; i < pts.length; i++) {
    if (Math.abs(dot3(sub3(pts[i], a), n)) > 1e-4) return false;
  }
  return true;
}

/** Compute area and perimeter of a planar polygon in 3D */
export function computePolygon3DMetrics(vertices: Vec3[]): { area: number; perimeter: number; normal: Vec3 } {
  const nVerts = vertices.length;
  if (nVerts < 3) {
    const perim = nVerts === 2 ? dist3(vertices[0], vertices[1]) : 0;
    return { area: 0, perimeter: perim, normal: { x: 0, y: 0, z: 1 } };
  }
  let perimeter = 0;
  let normalSum = { x: 0, y: 0, z: 0 };
  const p0 = vertices[0];
  for (let i = 0; i < nVerts; i++) {
    const curr = vertices[i];
    const next = vertices[(i + 1) % nVerts];
    perimeter += dist3(curr, next);
    if (i >= 1 && i < nVerts - 1) {
      const c = cross3(sub3(vertices[i], p0), sub3(vertices[i + 1], p0));
      normalSum = add3(normalSum, c);
    }
  }
  const mag = norm3(normalSum);
  const normal = mag > EPS3D ? scale3(normalSum, 1 / mag) : { x: 0, y: 0, z: 1 };
  return { area: 0.5 * mag, perimeter, normal };
}

/**
 * Exact volume and surface area of a closed polyhedron via signed tetrahedron volumes
 * using outward-oriented faces. Never assumes regular shapes!
 */
export function computePolyhedronMetrics(
  vertices: Vec3[],
  faces: Array<{ indices: number[] }>
): { volume: number; surfaceArea: number } {
  if (vertices.length < 4 || faces.length < 4) {
    return { volume: 0, surfaceArea: 0 };
  }
  // Compute centroid so we orient every face outward consistently
  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (const v of vertices) {
    cx += v.x;
    cy += v.y;
    cz += v.z;
  }
  const centroid = { x: cx / vertices.length, y: cy / vertices.length, z: cz / vertices.length };

  let totalArea = 0;
  let totalVol = 0;

  for (const face of faces) {
    if (face.indices.length < 3) continue;
    const fPts = face.indices.map((idx) => vertices[idx]).filter(Boolean);
    if (fPts.length < 3) continue;
    const { area, normal } = computePolygon3DMetrics(fPts);
    totalArea += area;
    const toFace = sub3(fPts[0], centroid);
    const heightToCentroid = Math.abs(dot3(toFace, normal));
    totalVol += (area * heightToCentroid) / 3;
  }

  return { volume: totalVol, surfaceArea: totalArea };
}

/**
 * Exact cross-section of a convex polyhedron (defined by vertices & edges) with an infinite plane
 * n·X + d = 0. Correctly handles:
 * - No intersection
 * - Single vertex touch
 * - Edge touch
 * - Coincident face
 * - Polygon with 3..N sorted cyclic vertices
 */
export function computePolyhedronCrossSection(
  vertices: Vec3[],
  edges: Array<{ a: number; b: number; isDiagonal?: boolean; isAltitude?: boolean; isAxis?: boolean }>,
  planeNormalRaw: Vec3,
  planeD: number
): {
  vertices: Vec3[];
  curveType: 'polygon' | 'segment' | 'point' | 'empty';
  area: number;
  perimeter: number;
  statusNote: string;
} {
  const n = normalize3(planeNormalRaw);
  if (!n || vertices.length === 0) {
    return {
      vertices: [],
      curveType: 'empty',
      area: 0,
      perimeter: 0,
      statusNote: 'Mặt phẳng cắt không hợp lệ.',
    };
  }

  const tol = 1e-4;
  const rawPts: Vec3[] = [];
  const pushUnique = (pt: Vec3) => {
    if (!rawPts.some((q) => dist3(q, pt) < 1e-3)) {
      rawPts.push(pt);
    }
  };

  // Evaluate signed distance of every vertex
  const dists = vertices.map((v) => dot3(n, v) + planeD);

  // 1. Vertices lying directly on the plane
  for (let i = 0; i < vertices.length; i++) {
    if (Math.abs(dists[i]) <= tol) {
      pushUnique(vertices[i]);
    }
  }

  // 2. Structural edges (exclude diagonals/altitudes/axes) crossing the plane
  for (const e of edges) {
    if (e.isDiagonal || e.isAltitude || e.isAxis) continue;
    const da = dists[e.a];
    const db = dists[e.b];
    if (da === undefined || db === undefined) continue;
    if ((da > tol && db < -tol) || (da < -tol && db > tol)) {
      const t = da / (da - db);
      pushUnique(lerp3(vertices[e.a], vertices[e.b], t));
    }
  }

  if (rawPts.length === 0) {
    return {
      vertices: [],
      curveType: 'empty',
      area: 0,
      perimeter: 0,
      statusNote: 'Mặt phẳng không cắt hình khối ở vị trí hiện tại.',
    };
  }
  if (rawPts.length === 1) {
    return {
      vertices: rawPts,
      curveType: 'point',
      area: 0,
      perimeter: 0,
      statusNote: 'Mặt phẳng chỉ tiếp xúc hình khối tại 1 đỉnh.',
    };
  }
  if (rawPts.length === 2) {
    const len = dist3(rawPts[0], rawPts[1]);
    return {
      vertices: rawPts,
      curveType: 'segment',
      area: 0,
      perimeter: len,
      statusNote: `Mặt phẳng cắt hình khối theo một đoạn thẳng (độ dài ${formatNum(len, 2)}).`,
    };
  }

  // Sort cyclically in the plane using orthonormal basis (u, v)
  const centroid = rawPts.reduce((acc, p) => add3(acc, p), { x: 0, y: 0, z: 0 });
  const c = scale3(centroid, 1 / rawPts.length);
  const { u, v } = planeBasis(n);
  const sorted = [...rawPts].sort((p, q) => {
    const dp = sub3(p, c);
    const dq = sub3(q, c);
    const ap = Math.atan2(dot3(dp, v), dot3(dp, u));
    const aq = Math.atan2(dot3(dq, v), dot3(dq, u));
    return ap - aq;
  });

  // Remove nearly-collinear redundant points along edges (e.g. coincident face subdivisions)
  const cleaned: Vec3[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const prev = sorted[(i - 1 + sorted.length) % sorted.length];
    const curr = sorted[i];
    const next = sorted[(i + 1) % sorted.length];
    const v1 = normalize3(sub3(curr, prev));
    const v2 = normalize3(sub3(next, curr));
    if (v1 && v2 && norm3(cross3(v1, v2)) > 1e-3) {
      cleaned.push(curr);
    }
  }
  const finalPts = cleaned.length >= 3 ? cleaned : sorted;
  const { area, perimeter } = computePolygon3DMetrics(finalPts);

  const shapeName =
    finalPts.length === 3
      ? 'tam giác'
      : finalPts.length === 4
        ? 'tứ giác'
        : finalPts.length === 5
          ? 'ngũ giác'
          : finalPts.length === 6
            ? 'lục giác'
            : `đa giác ${finalPts.length} cạnh`;

  return {
    vertices: finalPts,
    curveType: 'polygon',
    area,
    perimeter,
    statusNote: `Thiết diện là hình ${shapeName} (${finalPts.length} đỉnh).`,
  };
}

/**
 * Exact analytical cross-section for Sphere, Cylinder, and Cone!
 * Never fakes an ellipse for every section.
 */
export function computeRevolutionCrossSection(
  solidType: 'sphere' | 'hemisphere' | 'cylinder' | 'cone' | 'cone_frustum',
  center: Vec3,
  rotationDeg: Vec3,
  radius: number,
  height: number,
  planeNormalRaw: Vec3,
  planeD: number,
  radiusTop = 0
): {
  curveLoops: Vec3[][];
  curveType: 'circle' | 'ellipse' | 'parabola' | 'hyperbola' | 'polygon' | 'point' | 'empty';
  area: number;
  perimeter: number;
  statusNote: string;
} {
  const n = normalize3(planeNormalRaw);
  if (!n) {
    return { curveLoops: [], curveType: 'empty', area: 0, perimeter: 0, statusNote: 'Mặt phẳng không hợp lệ.' };
  }

  // Transform plane into solid's local space (center = 0, axis = +Z)
  const invRot = { x: -rotationDeg.x, y: -rotationDeg.y, z: -rotationDeg.z };
  const toWorld = (pLocal: Vec3) => add3(center, rotateEulerXYZ(pLocal, rotationDeg));
  const localNormal = normalize3(rotateEulerXYZ(n, invRot)) ?? n;
  const localD = dot3(n, center) + planeD; // n · (center + R*pLocal) + planeD = localNormal · pLocal + localD

  if (solidType === 'sphere' || solidType === 'hemisphere') {
    const dist = Math.abs(localD);
    if (dist > radius + 1e-4) {
      return { curveLoops: [], curveType: 'empty', area: 0, perimeter: 0, statusNote: 'Mặt phẳng không cắt mặt cầu.' };
    }
    if (Math.abs(dist - radius) <= 1e-4) {
      const pt = toWorld(scale3(localNormal, -localD));
      return { curveLoops: [[pt]], curveType: 'point', area: 0, perimeter: 0, statusNote: 'Mặt phẳng tiếp xúc với mặt cầu tại 1 điểm.' };
    }
    const rSec = Math.sqrt(Math.max(0, radius * radius - dist * dist));
    const secCenter = scale3(localNormal, -localD);
    const { u, v } = planeBasis(localNormal);
    const pts: Vec3[] = [];
    const segs = 64;
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const pLoc = add3(secCenter, add3(scale3(u, rSec * Math.cos(a)), scale3(v, rSec * Math.sin(a))));
      if (solidType === 'hemisphere' && pLoc.z < -1e-4) continue;
      pts.push(toWorld(pLoc));
    }
    if (pts.length < 3) {
      return { curveLoops: [], curveType: 'empty', area: 0, perimeter: 0, statusNote: 'Mặt phẳng không cắt bán cầu.' };
    }
    return {
      curveLoops: [pts],
      curveType: 'circle',
      area: Math.PI * rSec * rSec,
      perimeter: 2 * Math.PI * rSec,
      statusNote: `Thiết diện là hình tròn bán kính r = ${formatNum(rSec, 2)}.`,
    };
  }

  // Cylinder: local z in [0, height], x^2 + y^2 = radius^2
  if (solidType === 'cylinder') {
    const nz = localNormal.z;
    if (Math.abs(nz) < 1e-4) {
      // Plane parallel to axis -> rectangle (if distance < R)
      const horizLen = Math.hypot(localNormal.x, localNormal.y);
      const distAxis = Math.abs(localD) / Math.max(horizLen, 1e-6);
      if (distAxis >= radius - 1e-4) {
        return { curveLoops: [], curveType: 'empty', area: 0, perimeter: 0, statusNote: 'Mặt phẳng không cắt khối trụ.' };
      }
      const halfChord = Math.sqrt(Math.max(0, radius * radius - distAxis * distAxis));
      const nx = localNormal.x / horizLen;
      const ny = localNormal.y / horizLen;
      const bx = -nx * (localD / horizLen);
      const by = -ny * (localD / horizLen);
      const tx = -ny;
      const ty = nx;
      const rect = [
        toWorld({ x: bx - tx * halfChord, y: by - ty * halfChord, z: 0 }),
        toWorld({ x: bx + tx * halfChord, y: by + ty * halfChord, z: 0 }),
        toWorld({ x: bx + tx * halfChord, y: by + ty * halfChord, z: height }),
        toWorld({ x: bx - tx * halfChord, y: by - ty * halfChord, z: height }),
      ];
      return {
        curveLoops: [rect],
        curveType: 'polygon',
        area: 2 * halfChord * height,
        perimeter: 2 * (2 * halfChord + height),
        statusNote: 'Thiết diện song song với trục là hình chữ nhật.',
      };
    }

    // Plane intersects lateral surface at z(theta) = -(nx R cos t + ny R sin t + localD)/nz
    const pts: Vec3[] = [];
    const segs = 72;
    let clipped = false;
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const x = radius * Math.cos(a);
      const y = radius * Math.sin(a);
      const z = -(localNormal.x * x + localNormal.y * y + localD) / nz;
      if (z >= -1e-4 && z <= height + 1e-4) {
        pts.push(toWorld({ x, y, z: clamp(z, 0, height) }));
      } else {
        clipped = true;
      }
    }
    if (pts.length < 3) {
      return { curveLoops: [], curveType: 'empty', area: 0, perimeter: 0, statusNote: 'Mặt phẳng không cắt khối trụ trong đoạn chiều cao hiện tại.' };
    }
    const isCircle = Math.abs(Math.abs(nz) - 1) < 1e-3 && !clipped;
    const { area, perimeter } = computePolygon3DMetrics(pts);
    return {
      curveLoops: [pts],
      curveType: isCircle ? 'circle' : 'ellipse',
      area: isCircle ? Math.PI * radius * radius : area,
      perimeter: isCircle ? 2 * Math.PI * radius : perimeter,
      statusNote: isCircle
        ? `Thiết diện vuông góc với trục là hình tròn bán kính R = ${formatNum(radius, 2)}.`
        : clipped
          ? 'Thiết diện là phần hình elip bị giới hạn bởi hai đáy trụ.'
          : 'Thiết diện nghiêng với trục là hình elip.',
    };
  }

  // Cone / Cone Frustum: local z in [0, height], r(z) = radius + (radiusTop - radius) * (z / height)
  const rTop = solidType === 'cone' ? 0 : radiusTop;
  const pts: Vec3[] = [];
  const segs = 96;
  for (let i = 0; i < segs; i++) {
    const a = (i / segs) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    // Solve localNormal.x * r(z)*ca + localNormal.y * r(z)*sa + localNormal.z * z + localD = 0
    const k = localNormal.x * ca + localNormal.y * sa;
    const slope = (rTop - radius) / Math.max(height, 1e-6);
    const coeffZ = k * slope + localNormal.z;
    const rhs = -(k * radius + localD);
    if (Math.abs(coeffZ) > 1e-5) {
      const z = rhs / coeffZ;
      if (z >= -1e-4 && z <= height + 1e-4) {
        const rAtZ = Math.max(0, radius + slope * z);
        pts.push(toWorld({ x: rAtZ * ca, y: rAtZ * sa, z: clamp(z, 0, height) }));
      }
    }
  }
  if (pts.length < 3) {
    return { curveLoops: [], curveType: 'empty', area: 0, perimeter: 0, statusNote: 'Mặt phẳng không cắt khối nón ở vị trí hiện tại.' };
  }
  const { area, perimeter } = computePolygon3DMetrics(pts);
  const coneHalfAngle = Math.atan2(Math.abs(radius - rTop), Math.max(height, 1e-6));
  const planeAngleToAxis = Math.acos(clamp(Math.abs(localNormal.z), 0, 1));
  let curveType: 'circle' | 'ellipse' | 'parabola' | 'hyperbola' = 'ellipse';
  let statusNote = 'Thiết diện của mặt phẳng với khối nón là đường elip (hoặc phần elip).';
  if (planeAngleToAxis < 1e-2) {
    curveType = 'circle';
    statusNote = 'Thiết diện vuông góc trục hình nón là hình tròn.';
  } else if (Math.abs(planeAngleToAxis - (Math.PI / 2 - coneHalfAngle)) < 0.04) {
    curveType = 'parabola';
    statusNote = 'Mặt phẳng song song một đường sinh — thiết diện là cung parabol.';
  } else if (planeAngleToAxis > Math.PI / 2 - coneHalfAngle + 0.04) {
    curveType = 'hyperbola';
    statusNote = 'Góc cắt vượt góc sinh — thiết diện là nhánh hypebol giới hạn bởi đáy.';
  }
  return {
    curveLoops: [pts],
    curveType,
    area,
    perimeter,
    statusNote,
  };
}

export const fmtNum = formatNum;
export const rotatePointAroundAxis = rotateAroundAxis;

