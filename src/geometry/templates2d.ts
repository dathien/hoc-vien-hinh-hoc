import { addGeoObject, createEmptyScene } from './engine';
import type { GeoScene } from './types';

export interface Template2DDefinition {
  id: string;
  title: string;
  curriculumTag: 'Toán 10' | 'Mở rộng';
  topic: string;
  lessonRef?: string;
  summary: string;
  formulaLatex?: string;
  buildScene: () => GeoScene;
}

export function buildEulerLineScene(): GeoScene {
  let sc = createEmptyScene();
  const a = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -45, y: -95, label: 'A', style: { color: '#0F766E' }, skipLog: true });
  sc = a.scene;
  const b = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -125, y: 75, label: 'B', style: { color: '#0F766E' }, skipLog: true });
  sc = b.scene;
  const c = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 130, y: 65, label: 'C', style: { color: '#0F766E' }, skipLog: true });
  sc = c.scene;
  sc = addGeoObject(sc, { kind: 'polygon', rule: 'polygon_vertices', parents: [a.id, b.id, c.id], label: 'ABC', style: { color: '#172033', fillColor: '#0F766E', fillOpacity: 0.08 }, skipLog: true }).scene;
  const o = addGeoObject(sc, { kind: 'point', rule: 'circumcenter', parents: [a.id, b.id, c.id], label: 'O', style: { color: '#0284C7' }, skipLog: true });
  sc = o.scene;
  sc = addGeoObject(sc, { kind: 'point', rule: 'centroid', parents: [a.id, b.id, c.id], label: 'G', style: { color: '#0F766E' }, skipLog: true }).scene;
  const h = addGeoObject(sc, { kind: 'point', rule: 'orthocenter', parents: [a.id, b.id, c.id], label: 'H', style: { color: '#7C3AED' }, skipLog: true });
  sc = h.scene;
  sc = addGeoObject(sc, { kind: 'line', rule: 'line_two_points', parents: [o.id, h.id], label: 'Đường thẳng Euler', style: { color: '#D97706', strokeWidth: 2.2 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'circle', rule: 'circumcircle', parents: [a.id, b.id, c.id], label: '(O)', style: { color: '#0284C7', dash: 'dashed', isAuxiliary: true }, skipLog: true }).scene;
  return sc;
}

function buildCircumIncircleScene(): GeoScene {
  let sc = createEmptyScene();
  const a = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -15, y: -105, label: 'A', style: { color: '#0F766E' }, skipLog: true });
  sc = a.scene;
  const b = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -120, y: 80, label: 'B', style: { color: '#0F766E' }, skipLog: true });
  sc = b.scene;
  const c = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 125, y: 80, label: 'C', style: { color: '#0F766E' }, skipLog: true });
  sc = c.scene;
  sc = addGeoObject(sc, { kind: 'polygon', rule: 'polygon_vertices', parents: [a.id, b.id, c.id], label: 'ABC', style: { color: '#172033', fillColor: '#0284C7', fillOpacity: 0.08 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'circle', rule: 'circumcircle', parents: [a.id, b.id, c.id], label: 'Ngoại tiếp (O)', style: { color: '#0284C7', strokeWidth: 2 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'circle', rule: 'incircle', parents: [a.id, b.id, c.id], label: 'Nội tiếp (I)', style: { color: '#D97706', strokeWidth: 2 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'point', rule: 'circumcenter', parents: [a.id, b.id, c.id], label: 'O', style: { color: '#0284C7' }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'point', rule: 'incenter', parents: [a.id, b.id, c.id], label: 'I', style: { color: '#D97706' }, skipLog: true }).scene;
  return sc;
}

function buildMediansCentroidScene(): GeoScene {
  let sc = createEmptyScene();
  const a = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -20, y: -100, label: 'A', style: { color: '#0F766E' }, skipLog: true });
  sc = a.scene;
  const b = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -130, y: 80, label: 'B', style: { color: '#0F766E' }, skipLog: true });
  sc = b.scene;
  const c = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 130, y: 70, label: 'C', style: { color: '#0F766E' }, skipLog: true });
  sc = c.scene;
  sc = addGeoObject(sc, { kind: 'polygon', rule: 'polygon_vertices', parents: [a.id, b.id, c.id], label: 'ABC', style: { color: '#172033', fillColor: '#0F766E', fillOpacity: 0.08 }, skipLog: true }).scene;
  const ma = addGeoObject(sc, { kind: 'point', rule: 'midpoint', parents: [b.id, c.id], label: 'M', style: { color: '#0284C7' }, skipLog: true });
  sc = ma.scene;
  const mb = addGeoObject(sc, { kind: 'point', rule: 'midpoint', parents: [a.id, c.id], label: 'N', style: { color: '#0284C7' }, skipLog: true });
  sc = mb.scene;
  const mc = addGeoObject(sc, { kind: 'point', rule: 'midpoint', parents: [a.id, b.id], label: 'P', style: { color: '#0284C7' }, skipLog: true });
  sc = mc.scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [a.id, ma.id], label: 'AM', style: { color: '#0284C7', dash: 'dashed' }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [b.id, mb.id], label: 'BN', style: { color: '#0284C7', dash: 'dashed' }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [c.id, mc.id], label: 'CP', style: { color: '#0284C7', dash: 'dashed' }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'point', rule: 'centroid', parents: [a.id, b.id, c.id], label: 'G', style: { color: '#DC2626' }, skipLog: true }).scene;
  return sc;
}

function buildOrthocenterAltitudesScene(): GeoScene {
  let sc = createEmptyScene();
  const a = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -35, y: -100, label: 'A', style: { color: '#0F766E' }, skipLog: true });
  sc = a.scene;
  const b = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -130, y: 80, label: 'B', style: { color: '#0F766E' }, skipLog: true });
  sc = b.scene;
  const c = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 130, y: 75, label: 'C', style: { color: '#0F766E' }, skipLog: true });
  sc = c.scene;
  const bc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [b.id, c.id], label: 'BC', style: { color: '#172033' }, skipLog: true });
  sc = bc.scene;
  const ca = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [c.id, a.id], label: 'CA', style: { color: '#172033' }, skipLog: true });
  sc = ca.scene;
  const ab = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [a.id, b.id], label: 'AB', style: { color: '#172033' }, skipLog: true });
  sc = ab.scene;
  sc = addGeoObject(sc, { kind: 'line', rule: 'perpendicular_line', parents: [bc.id, a.id], label: 'h_a', style: { color: '#7C3AED', dash: 'dashed' }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'line', rule: 'perpendicular_line', parents: [ca.id, b.id], label: 'h_b', style: { color: '#7C3AED', dash: 'dashed' }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'line', rule: 'perpendicular_line', parents: [ab.id, c.id], label: 'h_c', style: { color: '#7C3AED', dash: 'dashed' }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'point', rule: 'orthocenter', parents: [a.id, b.id, c.id], label: 'H', style: { color: '#DC2626' }, skipLog: true }).scene;
  return sc;
}

function buildReflectionLineScene(): GeoScene {
  let sc = createEmptyScene();
  const d1 = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 0, y: -115, label: 'U', style: { color: '#0284C7' }, skipLog: true });
  sc = d1.scene;
  const d2 = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 10, y: 115, label: 'V', style: { color: '#0284C7' }, skipLog: true });
  sc = d2.scene;
  const axis = addGeoObject(sc, { kind: 'line', rule: 'line_two_points', parents: [d1.id, d2.id], label: 'd', style: { color: '#0284C7', strokeWidth: 2.2 }, skipLog: true });
  sc = axis.scene;
  const a = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -120, y: -55, label: 'A', style: { color: '#0F766E' }, skipLog: true });
  sc = a.scene;
  const b = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -65, y: 60, label: 'B', style: { color: '#0F766E' }, skipLog: true });
  sc = b.scene;
  const c = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -145, y: 45, label: 'C', style: { color: '#0F766E' }, skipLog: true });
  sc = c.scene;
  sc = addGeoObject(sc, { kind: 'polygon', rule: 'polygon_vertices', parents: [a.id, b.id, c.id], label: 'ABC', style: { color: '#0F766E', fillColor: '#0F766E', fillOpacity: 0.14 }, skipLog: true }).scene;
  const a1 = addGeoObject(sc, { kind: 'point', rule: 'reflection_line', parents: [a.id, axis.id], label: "A'", style: { color: '#7C3AED' }, skipLog: true });
  sc = a1.scene;
  const b1 = addGeoObject(sc, { kind: 'point', rule: 'reflection_line', parents: [b.id, axis.id], label: "B'", style: { color: '#7C3AED' }, skipLog: true });
  sc = b1.scene;
  const c1 = addGeoObject(sc, { kind: 'point', rule: 'reflection_line', parents: [c.id, axis.id], label: "C'", style: { color: '#7C3AED' }, skipLog: true });
  sc = c1.scene;
  sc = addGeoObject(sc, { kind: 'polygon', rule: 'polygon_vertices', parents: [a1.id, b1.id, c1.id], label: "A'B'C'", style: { color: '#7C3AED', fillColor: '#7C3AED', fillOpacity: 0.14 }, skipLog: true }).scene;
  return sc;
}

// ==================== TOÁN 10 – SGK KẾT NỐI TRI THỨC VỚI CUỘC SỐNG ====================

function buildUnitSemicircleTrigScene(): GeoScene {
  let sc = createEmptyScene();
  const o = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 0, y: 55, label: 'O', style: { color: '#0F172A' }, skipLog: true });
  sc = o.scene;
  const xRef = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 115, y: 55, label: 'E', style: { color: '#0284C7' }, skipLog: true });
  sc = xRef.scene;
  const ox = addGeoObject(sc, { kind: 'line', rule: 'line_two_points', parents: [o.id, xRef.id], label: 'Ox', style: { color: '#64748B', strokeWidth: 1.6 }, skipLog: true });
  sc = ox.scene;
  const oy = addGeoObject(sc, { kind: 'line', rule: 'perpendicular_line', parents: [ox.id, o.id], label: 'Oy', style: { color: '#64748B', strokeWidth: 1.6 }, skipLog: true });
  sc = oy.scene;
  const unitC = addGeoObject(sc, { kind: 'circle', rule: 'circle_center_point', parents: [o.id, xRef.id], label: '(O; 1)', style: { color: '#0284C7', strokeWidth: 2 }, skipLog: true });
  sc = unitC.scene;
  const m = addGeoObject(sc, { kind: 'point', rule: 'point_on_object', parents: [unitC.id], params: { t: -Math.PI / 3 }, label: 'M', style: { color: '#D97706' }, skipLog: true });
  sc = m.scene;
  const hx = addGeoObject(sc, { kind: 'point', rule: 'projection_point', parents: [ox.id, m.id], label: 'H', style: { color: '#0F766E' }, skipLog: true });
  sc = hx.scene;
  const ky = addGeoObject(sc, { kind: 'point', rule: 'projection_point', parents: [oy.id, m.id], label: 'K', style: { color: '#7C3AED' }, skipLog: true });
  sc = ky.scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [o.id, m.id], label: 'OM', style: { color: '#D97706', strokeWidth: 2.4 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [m.id, hx.id], label: 'sin α', style: { color: '#7C3AED', dash: 'dashed' }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [m.id, ky.id], label: 'cos α', style: { color: '#0F766E', dash: 'dashed' }, skipLog: true }).scene;
  return sc;
}

function buildLawOfCosinesTriangleScene(): GeoScene {
  let sc = createEmptyScene();
  const a = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -45, y: -85, label: 'A', style: { color: '#0F766E' }, skipLog: true });
  sc = a.scene;
  const b = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -135, y: 75, label: 'B', style: { color: '#0F766E' }, skipLog: true });
  sc = b.scene;
  const c = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 135, y: 75, label: 'C', style: { color: '#0F766E' }, skipLog: true });
  sc = c.scene;
  sc = addGeoObject(sc, { kind: 'polygon', rule: 'polygon_vertices', parents: [a.id, b.id, c.id], label: 'ABC', style: { color: '#0F766E', fillColor: '#0F766E', fillOpacity: 0.1 }, skipLog: true }).scene;
  const bcLine = addGeoObject(sc, { kind: 'line', rule: 'line_two_points', parents: [b.id, c.id], label: 'BC', style: { color: '#94A3B8', dash: 'dotted', isAuxiliary: true }, skipLog: true });
  sc = bcLine.scene;
  const h = addGeoObject(sc, { kind: 'point', rule: 'projection_point', parents: [bcLine.id, a.id], label: 'H', style: { color: '#D97706' }, skipLog: true });
  sc = h.scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [a.id, h.id], label: 'h_a', style: { color: '#D97706', dash: 'dashed', strokeWidth: 2 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'angle_measure', rule: 'angle_measure', parents: [b.id, a.id, c.id], label: '∠A', style: { color: '#7C3AED' }, skipLog: true }).scene;
  return sc;
}

function buildVectorParallelogramScene(): GeoScene {
  let sc = createEmptyScene();
  const o = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -115, y: 65, label: 'O', style: { color: '#0F172A' }, skipLog: true });
  sc = o.scene;
  const a = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 25, y: 55, label: 'A', style: { color: '#0F766E' }, skipLog: true });
  sc = a.scene;
  const b = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -55, y: -65, label: 'B', style: { color: '#0284C7' }, skipLog: true });
  sc = b.scene;
  const c = addGeoObject(sc, { kind: 'point', rule: 'translation', parents: [o.id, a.id, b.id], label: 'C', style: { color: '#D97706' }, skipLog: true });
  sc = c.scene;
  sc = addGeoObject(sc, { kind: 'polygon', rule: 'polygon_vertices', parents: [o.id, a.id, c.id, b.id], label: 'OACB', style: { color: '#94A3B8', fillColor: '#0284C7', fillOpacity: 0.08 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [o.id, a.id], label: 'a', style: { color: '#0F766E', strokeWidth: 2.6 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [o.id, b.id], label: 'b', style: { color: '#0284C7', strokeWidth: 2.6 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [o.id, c.id], label: 'a + b', style: { color: '#D97706', strokeWidth: 2.8 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [b.id, a.id], label: 'a - b', style: { color: '#7C3AED', dash: 'dashed', strokeWidth: 2 }, skipLog: true }).scene;
  return sc;
}

function buildVectorMidpointScaleScene(): GeoScene {
  let sc = createEmptyScene();
  const a = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -120, y: 65, label: 'A', style: { color: '#0F766E' }, skipLog: true });
  sc = a.scene;
  const b = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 115, y: 55, label: 'B', style: { color: '#0F766E' }, skipLog: true });
  sc = b.scene;
  const o = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -15, y: -85, label: 'O', style: { color: '#0284C7' }, skipLog: true });
  sc = o.scene;
  const i = addGeoObject(sc, { kind: 'point', rule: 'midpoint', parents: [a.id, b.id], label: 'I', style: { color: '#D97706' }, skipLog: true });
  sc = i.scene;
  const g = addGeoObject(sc, { kind: 'point', rule: 'centroid', parents: [o.id, a.id, b.id], label: 'G', style: { color: '#DC2626' }, skipLog: true });
  sc = g.scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [a.id, b.id], label: 'AB', style: { color: '#0F766E', strokeWidth: 2.2 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [o.id, a.id], label: 'OA', style: { color: '#0284C7', strokeWidth: 2 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [o.id, b.id], label: 'OB', style: { color: '#0284C7', strokeWidth: 2 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [o.id, i.id], label: 'OI', style: { color: '#D97706', strokeWidth: 2.5 }, skipLog: true }).scene;
  return sc;
}

function buildDotProductProjectionScene(): GeoScene {
  let sc = createEmptyScene();
  const o = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -115, y: 55, label: 'O', style: { color: '#0F172A' }, skipLog: true });
  sc = o.scene;
  const b = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 130, y: 55, label: 'B', style: { color: '#0284C7' }, skipLog: true });
  sc = b.scene;
  const a = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 15, y: -75, label: 'A', style: { color: '#0F766E' }, skipLog: true });
  sc = a.scene;
  const obLine = addGeoObject(sc, { kind: 'line', rule: 'line_two_points', parents: [o.id, b.id], label: 'OB', style: { color: '#94A3B8', dash: 'dotted', isAuxiliary: true }, skipLog: true });
  sc = obLine.scene;
  const h = addGeoObject(sc, { kind: 'point', rule: 'projection_point', parents: [obLine.id, a.id], label: 'H', style: { color: '#D97706' }, skipLog: true });
  sc = h.scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [o.id, a.id], label: 'u', style: { color: '#0F766E', strokeWidth: 2.6 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [o.id, b.id], label: 'v', style: { color: '#0284C7', strokeWidth: 2.6 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [o.id, h.id], label: 'OH', style: { color: '#D97706', strokeWidth: 3 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [a.id, h.id], label: 'AH', style: { color: '#7C3AED', dash: 'dashed' }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'angle_measure', rule: 'angle_measure', parents: [a.id, o.id, b.id], label: 'φ', style: { color: '#7C3AED' }, skipLog: true }).scene;
  return sc;
}

function buildLineDistanceOxyScene(): GeoScene {
  let sc = createEmptyScene();
  const a = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -125, y: 65, label: 'A', style: { color: '#0284C7' }, skipLog: true });
  sc = a.scene;
  const b = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 130, y: -35, label: 'B', style: { color: '#0284C7' }, skipLog: true });
  sc = b.scene;
  const d = addGeoObject(sc, { kind: 'line', rule: 'line_two_points', parents: [a.id, b.id], label: 'Δ', style: { color: '#0284C7', strokeWidth: 2.4 }, skipLog: true });
  sc = d.scene;
  const m = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -30, y: -85, label: 'M', style: { color: '#0F766E' }, skipLog: true });
  sc = m.scene;
  const h = addGeoObject(sc, { kind: 'point', rule: 'projection_point', parents: [d.id, m.id], label: 'H', style: { color: '#D97706' }, skipLog: true });
  sc = h.scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [m.id, h.id], label: 'd(M, Δ)', style: { color: '#D97706', strokeWidth: 2.4, dash: 'dashed' }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'length_measure', rule: 'length_measure', parents: [m.id, h.id], label: 'MH', style: { color: '#D97706' }, skipLog: true }).scene;
  return sc;
}

function buildAngleTwoLinesOxyScene(): GeoScene {
  let sc = createEmptyScene();
  const a1 = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -135, y: 65, label: 'A', style: { color: '#0F766E' }, skipLog: true });
  sc = a1.scene;
  const b1 = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 130, y: -55, label: 'B', style: { color: '#0F766E' }, skipLog: true });
  sc = b1.scene;
  const d1 = addGeoObject(sc, { kind: 'line', rule: 'line_two_points', parents: [a1.id, b1.id], label: 'Δ1', style: { color: '#0F766E', strokeWidth: 2.2 }, skipLog: true });
  sc = d1.scene;
  const c1 = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -120, y: -70, label: 'C', style: { color: '#0284C7' }, skipLog: true });
  sc = c1.scene;
  const e1 = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 125, y: 55, label: 'D', style: { color: '#0284C7' }, skipLog: true });
  sc = e1.scene;
  const d2 = addGeoObject(sc, { kind: 'line', rule: 'line_two_points', parents: [c1.id, e1.id], label: 'Δ2', style: { color: '#0284C7', strokeWidth: 2.2 }, skipLog: true });
  sc = d2.scene;
  const inter = addGeoObject(sc, { kind: 'point', rule: 'intersection_line_line', parents: [d1.id, d2.id], label: 'I', style: { color: '#D97706' }, skipLog: true });
  sc = inter.scene;
  sc = addGeoObject(sc, { kind: 'angle_measure', rule: 'angle_measure', parents: [b1.id, inter.id, e1.id], label: 'φ', style: { color: '#7C3AED' }, skipLog: true }).scene;
  return sc;
}

function buildCircleTangentOxyScene(): GeoScene {
  let sc = createEmptyScene();
  const center = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -25, y: 10, label: 'I', style: { color: '#0284C7' }, skipLog: true });
  sc = center.scene;
  const m = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 65, y: -45, label: 'M', style: { color: '#0F766E' }, skipLog: true });
  sc = m.scene;
  sc = addGeoObject(sc, { kind: 'circle', rule: 'circle_center_point', parents: [center.id, m.id], label: '(C)', style: { color: '#0284C7', strokeWidth: 2.2 }, skipLog: true }).scene;
  const rad = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [center.id, m.id], label: 'R', style: { color: '#0F766E', strokeWidth: 2 }, skipLog: true });
  sc = rad.scene;
  sc = addGeoObject(sc, { kind: 'line', rule: 'perpendicular_line', parents: [rad.id, m.id], label: 'Tiếp tuyến d', style: { color: '#D97706', strokeWidth: 2.4 }, skipLog: true }).scene;
  return sc;
}

function buildParabolaFocusDirectrixScene(): GeoScene {
  let sc = createEmptyScene();
  const d1 = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -115, y: -105, label: 'U', style: { color: '#64748B' }, skipLog: true });
  sc = d1.scene;
  const d2 = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -115, y: 105, label: 'V', style: { color: '#64748B' }, skipLog: true });
  sc = d2.scene;
  const dir = addGeoObject(sc, { kind: 'line', rule: 'line_two_points', parents: [d1.id, d2.id], label: 'Đường chuẩn Δ', style: { color: '#0284C7', strokeWidth: 2.2 }, skipLog: true });
  sc = dir.scene;
  const f = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 15, y: 0, label: 'F', style: { color: '#DC2626' }, skipLog: true });
  sc = f.scene;
  const h = addGeoObject(sc, { kind: 'point', rule: 'point_on_object', parents: [dir.id], params: { t: 0.28 }, label: 'H', style: { color: '#0284C7' }, skipLog: true });
  sc = h.scene;
  const perpH = addGeoObject(sc, { kind: 'line', rule: 'perpendicular_line', parents: [dir.id, h.id], label: 'd_H', style: { color: '#94A3B8', dash: 'dashed', isAuxiliary: true }, skipLog: true });
  sc = perpH.scene;
  const bisFH = addGeoObject(sc, { kind: 'line', rule: 'perpendicular_bisector', parents: [f.id, h.id], label: 'Tiếp tuyến', style: { color: '#7C3AED', dash: 'dashed' }, skipLog: true });
  sc = bisFH.scene;
  const m = addGeoObject(sc, { kind: 'point', rule: 'intersection_line_line', parents: [perpH.id, bisFH.id], label: 'M', style: { color: '#0F766E' }, skipLog: true });
  sc = m.scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [m.id, f.id], label: 'MF', style: { color: '#D97706', strokeWidth: 2.2 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [m.id, h.id], label: 'MH', style: { color: '#0F766E', strokeWidth: 2.2 }, skipLog: true }).scene;
  return sc;
}

function buildEllipseFociScene(): GeoScene {
  let sc = createEmptyScene();
  const f1 = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -75, y: 0, label: 'F1', style: { color: '#DC2626' }, skipLog: true });
  sc = f1.scene;
  const f2 = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 75, y: 0, label: 'F2', style: { color: '#DC2626' }, skipLog: true });
  sc = f2.scene;
  const guide = addGeoObject(sc, { kind: 'circle', rule: 'circle_center_radius', parents: [f1.id], params: { radius: 190 }, label: 'Đường tròn dẫn (F1; 2a)', style: { color: '#94A3B8', dash: 'dotted', isAuxiliary: true }, skipLog: true });
  sc = guide.scene;
  const p = addGeoObject(sc, { kind: 'point', rule: 'point_on_object', parents: [guide.id], params: { t: -0.72 }, label: 'P', style: { color: '#0284C7' }, skipLog: true });
  sc = p.scene;
  const rayF1P = addGeoObject(sc, { kind: 'line', rule: 'line_two_points', parents: [f1.id, p.id], label: 'F1P', style: { color: '#94A3B8', dash: 'dashed', isAuxiliary: true }, skipLog: true });
  sc = rayF1P.scene;
  const bisPF2 = addGeoObject(sc, { kind: 'line', rule: 'perpendicular_bisector', parents: [p.id, f2.id], label: 'Tiếp tuyến elip', style: { color: '#7C3AED', dash: 'dashed' }, skipLog: true });
  sc = bisPF2.scene;
  const m = addGeoObject(sc, { kind: 'point', rule: 'intersection_line_line', parents: [rayF1P.id, bisPF2.id], label: 'M', style: { color: '#0F766E' }, skipLog: true });
  sc = m.scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [m.id, f1.id], label: 'MF1', style: { color: '#0F766E', strokeWidth: 2.4 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'segment', rule: 'segment_two_points', parents: [m.id, f2.id], label: 'MF2', style: { color: '#D97706', strokeWidth: 2.4 }, skipLog: true }).scene;
  return sc;
}

export const TEMPLATES_2D: Template2DDefinition[] = [
  // ==================== TOÁN 10 – HÌNH HỌC PHẲNG VÀ TỌA ĐỘ (13 hình mẫu) ====================
  {
    id: 'tpl2d_t10_unit_semicircle',
    title: 'Nửa đường tròn đơn vị & Giá trị lượng giác góc 0° – 180°',
    curriculumTag: 'Toán 10',
    topic: 'Hệ thức lượng trong tam giác',
    lessonRef: 'Chương III · Bài 5',
    summary: 'Kéo điểm M trên đường tròn đơn vị để quan sát hình chiếu H (cos α) và K (sin α) khi góc thay đổi từ 0° đến 180°.',
    formulaLatex: '\\sin^2\\alpha + \\cos^2\\alpha = 1',
    buildScene: buildUnitSemicircleTrigScene,
  },
  {
    id: 'tpl2d_t10_law_cosines',
    title: 'Hệ thức lượng & Định lí côsin trong tam giác',
    curriculumTag: 'Toán 10',
    topic: 'Hệ thức lượng trong tam giác',
    lessonRef: 'Chương III · Bài 6',
    summary: 'Kéo các đỉnh tam giác ABC để quan sát góc A, đường cao AH và kiểm nghiệm hệ thức côsin trong tam giác nhọn, vuông, tù.',
    formulaLatex: 'a^2 = b^2 + c^2 - 2bc\\cos A',
    buildScene: buildLawOfCosinesTriangleScene,
  },
  {
    id: 'tpl2d_circum_incircle',
    title: 'Đường tròn ngoại tiếp (Định lí sin) và nội tiếp tam giác',
    curriculumTag: 'Toán 10',
    topic: 'Hệ thức lượng trong tam giác',
    lessonRef: 'Chương III · Bài 6',
    summary: 'Quan sát trực quan bán kính ngoại tiếp R = a/(2 sin A), bán kính nội tiếp r = S/p và hai tâm O, I theo tam giác ABC.',
    formulaLatex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R',
    buildScene: buildCircumIncircleScene,
  },
  {
    id: 'tpl2d_t10_vector_parallelogram',
    title: 'Tổng và hiệu hai vectơ theo quy tắc hình bình hành',
    curriculumTag: 'Toán 10',
    topic: 'Vectơ trong mặt phẳng',
    lessonRef: 'Chương IV · Bài 8',
    summary: 'Kéo các điểm O, A, B để quan sát vectơ tổng OC = OA + OB và vectơ hiệu BA = OA - OB cập nhật trực tiếp.',
    formulaLatex: '\\overrightarrow{OA} + \\overrightarrow{OB} = \\overrightarrow{OC}',
    buildScene: buildVectorParallelogramScene,
  },
  {
    id: 'tpl2d_t10_vector_scale_midpoint',
    title: 'Hệ thức trung điểm và trọng tâm bằng vectơ',
    curriculumTag: 'Toán 10',
    topic: 'Vectơ trong mặt phẳng',
    lessonRef: 'Chương IV · Bài 9',
    summary: 'Minh họa hệ thức 2·OI = OA + OB với trung điểm I và trọng tâm G của tam giác OAB khi thay đổi vị trí điểm O.',
    formulaLatex: '\\overrightarrow{OA} + \\overrightarrow{OB} = 2\\overrightarrow{OI}',
    buildScene: buildVectorMidpointScaleScene,
  },
  {
    id: 'tpl2d_medians_centroid',
    title: 'Ba đường trung tuyến và trọng tâm tam giác',
    curriculumTag: 'Toán 10',
    topic: 'Vectơ trong mặt phẳng',
    lessonRef: 'Chương IV · Bài 9',
    summary: 'Quan sát ba đường trung tuyến AM, BN, CP đồng quy tại trọng tâm G thỏa mãn GA + GB + GC = 0.',
    formulaLatex: '\\overrightarrow{GA} + \\overrightarrow{GB} + \\overrightarrow{GC} = \\vec{0}',
    buildScene: buildMediansCentroidScene,
  },
  {
    id: 'tpl2d_t10_dot_product_proj',
    title: 'Tích vô hướng hai vectơ và hình chiếu vuông góc',
    curriculumTag: 'Toán 10',
    topic: 'Vectơ trong mặt phẳng',
    lessonRef: 'Chương IV · Bài 11',
    summary: 'Kéo điểm A để thấy dấu của tích vô hướng thay đổi từ dương (góc nhọn), bằng 0 (vuông góc) sang âm (góc tù).',
    formulaLatex: '\\vec{u}\\cdot\\vec{v} = |\\vec{u}|\\cdot|\\vec{v}|\\cos(\\vec{u},\\vec{v})',
    buildScene: buildDotProductProjectionScene,
  },
  {
    id: 'tpl2d_orthocenter',
    title: 'Ba đường cao và trực tâm tam giác',
    curriculumTag: 'Toán 10',
    topic: 'Phương pháp tọa độ trong mặt phẳng',
    lessonRef: 'Chương VII · Bài 19',
    summary: 'Khám phá trực tâm H và tính vuông góc giữa đường cao với cạnh đối diện — ứng dụng viết phương trình đường cao trong Oxy.',
    buildScene: buildOrthocenterAltitudesScene,
  },
  {
    id: 'tpl2d_t10_line_normal_dist',
    title: 'Phương trình đường thẳng & Khoảng cách từ điểm đến đường thẳng',
    curriculumTag: 'Toán 10',
    topic: 'Phương pháp tọa độ trong mặt phẳng',
    lessonRef: 'Chương VII · Bài 19 – 20',
    summary: 'Kéo điểm M hoặc đường thẳng Δ để quan sát hình chiếu vuông góc H và độ dài đoạn vuông góc MH = d(M, Δ).',
    formulaLatex: 'd(M, \\Delta) = \\frac{|ax_0 + by_0 + c|}{\\sqrt{a^2 + b^2}}',
    buildScene: buildLineDistanceOxyScene,
  },
  {
    id: 'tpl2d_t10_angle_two_lines',
    title: 'Vị trí tương đối và góc giữa hai đường thẳng trong Oxy',
    curriculumTag: 'Toán 10',
    topic: 'Phương pháp tọa độ trong mặt phẳng',
    lessonRef: 'Chương VII · Bài 20',
    summary: 'Thay đổi phương của Δ1, Δ2 để quan sát giao điểm I và góc giữa hai đường thẳng luôn nằm trong khoảng 0° đến 90°.',
    formulaLatex: '\\cos(\\Delta_1, \\Delta_2) = \\frac{|\\vec{n}_1\\cdot\\vec{n}_2|}{|\\vec{n}_1|\\cdot|\\vec{n}_2|}',
    buildScene: buildAngleTwoLinesOxyScene,
  },
  {
    id: 'tpl2d_t10_circle_tangent',
    title: 'Đường tròn và tiếp tuyến tại điểm trong mặt phẳng Oxy',
    curriculumTag: 'Toán 10',
    topic: 'Phương pháp tọa độ trong mặt phẳng',
    lessonRef: 'Chương VII · Bài 21',
    summary: 'Quan sát đường tròn tâm I đi qua M và tiếp tuyến d đi qua M nhận vectơ IM làm vectơ pháp tuyến.',
    formulaLatex: '(x - a)^2 + (y - b)^2 = R^2',
    buildScene: buildCircleTangentOxyScene,
  },
  {
    id: 'tpl2d_t10_ellipse_foci',
    title: 'Đường elip – Hai tiêu điểm F1, F2 và tổng khoảng cách 2a',
    curriculumTag: 'Toán 10',
    topic: 'Ba đường conic',
    lessonRef: 'Chương VII · Bài 22',
    summary: 'Kéo điểm P trên đường tròn dẫn để thấy điểm M luôn thỏa mãn MF1 + MF2 = 2a không đổi (quỹ tích hình elip).',
    formulaLatex: '\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1\\; (a > b > 0)',
    buildScene: buildEllipseFociScene,
  },
  {
    id: 'tpl2d_t10_parabola_focus_directrix',
    title: 'Đường parabol – Tiêu điểm F và đường chuẩn Δ',
    curriculumTag: 'Toán 10',
    topic: 'Ba đường conic',
    lessonRef: 'Chương VII · Bài 22',
    summary: 'Kéo điểm H dọc theo đường chuẩn Δ để quan sát điểm M luôn cách đều tiêu điểm F và đường chuẩn Δ (MF = MH).',
    formulaLatex: 'y^2 = 2px\\; (p > 0)',
    buildScene: buildParabolaFocusDirectrixScene,
  },

  // ==================== HÌNH MẪU 2D MỞ RỘNG (2 hình mẫu) ====================
  {
    id: 'tpl2d_euler_line',
    title: 'Đường thẳng Euler của tam giác (O, G, H)',
    curriculumTag: 'Mở rộng',
    topic: 'Tam giác & Điểm đặc biệt',
    summary: 'Khám phá tính thẳng hàng của tâm ngoại tiếp O, trọng tâm G và trực tâm H khi kéo các đỉnh A, B, C.',
    buildScene: buildEulerLineScene,
  },
  {
    id: 'tpl2d_reflection_axis',
    title: 'Phép đối xứng trục trên mặt phẳng',
    curriculumTag: 'Mở rộng',
    topic: 'Phép biến hình 2D',
    summary: 'Kéo các đỉnh tam giác ABC hoặc trục đối xứng d để quan sát ảnh đối xứng A\'B\'C\' cập nhật tức thời.',
    buildScene: buildReflectionLineScene,
  },
];

export function getTemplate2DById(id: string): Template2DDefinition | undefined {
  return TEMPLATES_2D.find((t) => t.id === id);
}
