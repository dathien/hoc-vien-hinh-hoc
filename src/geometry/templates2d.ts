import { addGeoObject, createEmptyScene } from './engine';
import type { GeoScene } from './types';

export interface Template2DDefinition {
  id: string;
  title: string;
  curriculumTag: 'Toán 10' | 'Nền tảng 2D' | 'Mở rộng';
  topic: string;
  summary: string;
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

export const TEMPLATES_2D: Template2DDefinition[] = [
  {
    id: 'tpl2d_euler_line',
    title: 'Đường thẳng Euler của tam giác (O, G, H)',
    curriculumTag: 'Mở rộng',
    topic: 'Tam giác & Điểm đặc biệt',
    summary: 'Khám phá tính thẳng hàng của tâm ngoại tiếp O, trọng tâm G và trực tâm H khi kéo các đỉnh A, B, C.',
    buildScene: buildEulerLineScene,
  },
  {
    id: 'tpl2d_circum_incircle',
    title: 'Đường tròn ngoại tiếp và nội tiếp tam giác',
    curriculumTag: 'Toán 10',
    topic: 'Đường tròn & Tam giác',
    summary: 'So sánh trực quan tâm ngoại tiếp O, tâm nội tiếp I và hai đường tròn động theo tam giác ABC.',
    buildScene: buildCircumIncircleScene,
  },
  {
    id: 'tpl2d_medians_centroid',
    title: 'Ba đường trung tuyến và trọng tâm G',
    curriculumTag: 'Nền tảng 2D',
    topic: 'Tam giác & Điểm đặc biệt',
    summary: 'Quan sát sự đồng quy của ba đường trung tuyến AM, BN, CP tại trọng tâm G khi thay đổi đỉnh tam giác.',
    buildScene: buildMediansCentroidScene,
  },
  {
    id: 'tpl2d_orthocenter',
    title: 'Ba đường cao và trực tâm H',
    curriculumTag: 'Nền tảng 2D',
    topic: 'Tam giác & Điểm đặc biệt',
    summary: 'Khám phá vị trí trực tâm H bên trong, trên đỉnh vuông hoặc bên ngoài tam giác tù.',
    buildScene: buildOrthocenterAltitudesScene,
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
