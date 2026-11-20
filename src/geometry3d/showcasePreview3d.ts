import { buildSolidGeometryData } from './engine3d';
import { buildCameraBasis, isSolidEdgeHidden, projectWithBasis } from './export3d';
import {
  GeometryLabelManager,
  type EdgeObstacle2D,
  type LabelCategory,
  type LabelInput,
  type ResolvedLabel,
} from './labelManager';
import { add3, norm3, scale3, sub3, v3 } from './math3d';
import type { Geo3DSolid, SolidEdgeDef, SolidFaceDef, Vec3 } from './types3d';

export type ShowcaseVariant = 'hero_pyramid' | 'lab_cube_section' | 'oxyz_axes';

export interface ShowcasePointMeta {
  id: string;
  pos: Vec3;
  label: string;
  category: LabelCategory;
  color: string;
  isSpecial?: boolean;
}

export interface ShowcaseModel {
  variant: ShowcaseVariant;
  title: string;
  vertices: Vec3[];
  faces: SolidFaceDef[];
  edges: SolidEdgeDef[];
  pseudoSolid: Geo3DSolid;
  sectionVertices: Vec3[];
  altitude: { p1: Vec3; p2: Vec3 } | null;
  axes: {
    o: Vec3;
    x: Vec3;
    y: Vec3;
    z: Vec3;
  };
  points: ShowcasePointMeta[];
  axisLabels: Array<{
    id: string;
    text: string;
    color: string;
    tip: Vec3;
  }>;
}

export interface ProjectedShowcaseFrame {
  axes: {
    o: { x: number; y: number };
    x: { x: number; y: number };
    y: { x: number; y: number };
    z: { x: number; y: number };
  };
  edges: Array<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    hidden: boolean;
  }>;
  altitude: { x1: number; y1: number; x2: number; y2: number } | null;
  sectionPoints: Array<{ x: number; y: number }>;
  dots: Array<{ id: string; x: number; y: number; isSpecial: boolean }>;
  labels: ResolvedLabel[];
}

/**
 * Build static 3D showcase geometry ONCE per variant (never inside animation loop).
 */
export function buildShowcaseModel(variant: ShowcaseVariant): ShowcaseModel {
  if (variant === 'lab_cube_section') {
    const solid = buildSolidGeometryData('cube', v3(0, 0, 0), v3(0, 0, 0), { a: 2.5 });
    const verts = solid.vertices;
    const structuralEdges = solid.edges.filter((e) => !e.isDiagonal && !e.isAltitude && !e.isAxis);
    const pseudoSolid = { vertices: verts, faces: solid.faces } as Geo3DSolid;

    const m1 = scale3(add3(verts[0], verts[1]), 0.5);
    const m2 = scale3(add3(verts[1], verts[2]), 0.5);
    const m3 = scale3(add3(verts[2], verts[6]), 0.5);
    const m4 = scale3(add3(verts[6], verts[7]), 0.5);
    const m5 = scale3(add3(verts[7], verts[4]), 0.5);
    const m6 = scale3(add3(verts[4], verts[0]), 0.5);

    const points: ShowcasePointMeta[] = [
      ...verts.map((pos, i) => ({
        id: `v_${i}`,
        pos,
        label: solid.defaultLabels[i] ?? `V${i + 1}`,
        category: 'point' as LabelCategory,
        color: '#0F172A',
      })),
      { id: 'sp_M', pos: m1, label: 'M', category: 'point', color: '#0369A1', isSpecial: true },
      { id: 'sp_N', pos: m3, label: 'N', category: 'point', color: '#0369A1', isSpecial: true },
      { id: 'sp_P', pos: m5, label: 'P', category: 'point', color: '#0369A1', isSpecial: true },
    ];

    return {
      variant,
      title: 'Thiết diện hình lập phương',
      vertices: verts,
      faces: solid.faces,
      edges: structuralEdges,
      pseudoSolid,
      sectionVertices: [m1, m2, m3, m4, m5, m6],
      altitude: null,
      axes: {
        o: v3(0, 0, 0),
        x: v3(2.4, 0, 0),
        y: v3(0, 2.4, 0),
        z: v3(0, 0, 3.1),
      },
      points,
      axisLabels: [
        { id: '_axis_x', text: 'x', color: '#DC2626', tip: v3(2.4, 0, 0) },
        { id: '_axis_y', text: 'y', color: '#059669', tip: v3(0, 2.4, 0) },
        { id: '_axis_z', text: 'z', color: '#0284C7', tip: v3(0, 0, 3.1) },
      ],
    };
  }

  // Default hero_pyramid & oxyz_axes: Regular square pyramid S.ABCD with altitude SO + cross-section MNPQ
  const solid = buildSolidGeometryData('regular_pyramid', v3(0, 0, 0), v3(0, 0, 0), {
    sides: 4,
    a: 2.8,
    h: 2.9,
  });
  const verts = solid.vertices; // 0..3 base A, B, C, D; 4 apex S at (0, 0, 2.9)
  const structuralEdges = solid.edges.filter((e) => !e.isDiagonal && !e.isAltitude && !e.isAxis);
  const pseudoSolid = { vertices: verts, faces: solid.faces } as Geo3DSolid;

  const O = v3(0, 0, 0);
  const S = verts[4];
  const M = scale3(add3(S, verts[0]), 0.5);
  const N = scale3(add3(S, verts[1]), 0.5);
  const P = scale3(add3(S, verts[2]), 0.5);
  const Q = scale3(add3(S, verts[3]), 0.5);

  const points: ShowcasePointMeta[] = [
    ...verts.map((pos, i) => ({
      id: `v_${i}`,
      pos,
      label: solid.defaultLabels[i] ?? `V${i + 1}`,
      category: 'point' as LabelCategory,
      color: '#0F172A',
    })),
    { id: 'sp_O', pos: O, label: 'O', category: 'origin', color: '#0369A1', isSpecial: true },
    { id: 'sp_M', pos: M, label: 'M', category: 'point', color: '#0369A1', isSpecial: true },
    { id: 'sp_P', pos: P, label: 'P', category: 'point', color: '#0369A1', isSpecial: true },
  ];

  return {
    variant,
    title: 'Hình chóp S.ABCD & thiết diện',
    vertices: verts,
    faces: solid.faces,
    edges: structuralEdges,
    pseudoSolid,
    sectionVertices: [M, N, P, Q],
    altitude: { p1: S, p2: O },
    axes: {
      o: v3(0, 0, 0),
      x: v3(2.3, 0, 0),
      y: v3(0, 2.3, 0),
      z: v3(0, 0, 3.4),
    },
    points,
    axisLabels: [
      { id: '_axis_x', text: 'x', color: '#DC2626', tip: v3(2.3, 0, 0) },
      { id: '_axis_y', text: 'y', color: '#059669', tip: v3(0, 2.3, 0) },
      { id: '_axis_z', text: 'z', color: '#0284C7', tip: v3(0, 0, 3.4) },
    ],
  };
}

/**
 * Pure frame projection for LiveGeo3DPreview and automated 60-second stability tests.
 * Uses GeometryLabelManager with hysteresis & edge-obstacle avoidance so labels
 * never flicker, disappear, or overlap (e.g. S vs z).
 */
export function projectShowcaseFrame(
  model: ShowcaseModel,
  angle: number,
  width: number,
  height: number,
  labelManager: GeometryLabelManager,
  dt: number
): ProjectedShowcaseFrame {
  const radius = 9.5;
  const camPos = v3(Math.cos(angle) * radius, Math.sin(angle) * radius, 5.2);
  const camTarget = v3(0, 0, 1.05);
  const scalePx = Math.min(width, height) / 5.4;
  const basis = buildCameraBasis(camPos, camTarget);
  const camDist = Math.max(2, norm3(sub3(camTarget, camPos)));

  const proj = (p: Vec3) =>
    projectWithBasis(p, camPos, camDist, basis, width, height, 'orthographic', scalePx);

  const axO = proj(model.axes.o);
  const axX = proj(model.axes.x);
  const axY = proj(model.axes.y);
  const axZ = proj(model.axes.z);

  const edgeObstacles: EdgeObstacle2D[] = [
    { x1: axO.x, y1: axO.y, x2: axX.x, y2: axX.y },
    { x1: axO.x, y1: axO.y, x2: axY.x, y2: axY.y },
    { x1: axO.x, y1: axO.y, x2: axZ.x, y2: axZ.y },
  ];

  const projectedVerts = model.vertices.map(proj);
  const edges = model.edges.map((e) => {
    const p1 = projectedVerts[e.a];
    const p2 = projectedVerts[e.b];
    const hidden = isSolidEdgeHidden(model.pseudoSolid, e.a, e.b, camPos);
    edgeObstacles.push({ x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y });
    return { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, hidden };
  });

  let altitude: { x1: number; y1: number; x2: number; y2: number } | null = null;
  if (model.altitude) {
    const a1 = proj(model.altitude.p1);
    const a2 = proj(model.altitude.p2);
    altitude = { x1: a1.x, y1: a1.y, x2: a2.x, y2: a2.y };
    edgeObstacles.push({ x1: a1.x, y1: a1.y, x2: a2.x, y2: a2.y });
  }

  const sectionPoints = model.sectionVertices.map(proj);
  for (let i = 0; i < sectionPoints.length; i++) {
    const a = sectionPoints[i];
    const b = sectionPoints[(i + 1) % sectionPoints.length];
    edgeObstacles.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  }

  const labelInputs: LabelInput[] = [];
  const dots: Array<{ id: string; x: number; y: number; isSpecial: boolean }> = [];

  for (const pt of model.points) {
    const p2 = proj(pt.pos);
    dots.push({ id: pt.id, x: p2.x, y: p2.y, isSpecial: Boolean(pt.isSpecial) });
    labelInputs.push({
      id: pt.id,
      objectId: pt.id,
      text: pt.label,
      category: pt.category,
      color: pt.color,
      anchorX: p2.x,
      anchorY: p2.y,
      isAuxiliary: Boolean(pt.isSpecial),
      anchorRadius: pt.isSpecial ? 6 : 7,
    });
  }

  // Axis labels prefer extending cleanly away from the origin along their axis ray.
  // For the vertical z-axis near the top edge, add a subtle rightward lean (+0.35, -0.94)
  // so 'z' sits cleanly on the upper-right of the arrowhead while apex 'S' prefers upper-left.
  for (const ax of model.axisLabels) {
    const tip2 = proj(ax.tip);
    const dx = tip2.x - axO.x;
    const dy = tip2.y - axO.y;
    const preferredDir =
      ax.id === '_axis_z'
        ? { x: dx + 14, y: dy - 8 }
        : { x: dx, y: dy };
    labelInputs.push({
      id: ax.id,
      objectId: ax.id,
      text: ax.text,
      category: 'axis',
      color: ax.color,
      anchorX: tip2.x,
      anchorY: tip2.y,
      preferredDir,
      anchorRadius: 5,
    });
  }

  const isCompact = Math.min(width, height) < 300;
  const fontSize = isCompact ? 12 : 13;

  const labels = labelManager.update(labelInputs, {
    width,
    height,
    fontSize,
    dt,
    edges: edgeObstacles,
    padding: 6,
    compact: true,
  });

  return {
    axes: {
      o: { x: axO.x, y: axO.y },
      x: { x: axX.x, y: axX.y },
      y: { x: axY.x, y: axY.y },
      z: { x: axZ.x, y: axZ.y },
    },
    edges,
    altitude,
    sectionPoints,
    dots,
    labels,
  };
}
