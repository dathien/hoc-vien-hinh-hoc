import { addGeo3DObject, createEmptyScene3D } from './engine3d';
import { v3 } from './math3d';
import type { Geo3DScene } from './types3d';

export type Template3DGroup =
  | 'Hình khối cơ bản'
  | 'Quan hệ song song'
  | 'Quan hệ vuông góc'
  | 'Thiết diện'
  | 'Góc và khoảng cách'
  | 'Tọa độ không gian';

export interface Template3DItem {
  id: string;
  number: number;
  title: string;
  group: Template3DGroup;
  curriculumTag: 'Toán 11' | 'Toán 12' | 'Kiến thức mở rộng';
  summary: string;
  formulaLatex?: string;
  buildScene: () => Geo3DScene;
}

function makeBaseScene(mode: Geo3DScene['displayMode'] = 'sgk', showAxes = false): Geo3DScene {
  const sc = createEmptyScene3D();
  sc.displayMode = mode;
  sc.showAxes = showAxes;
  sc.showCoordPlanes = mode === 'oxyz';
  sc.camera.projection = mode === 'sgk' ? 'orthographic' : 'perspective';
  return sc;
}

export const TEMPLATES_3D: Template3DItem[] = [
  // ==================== NHÓM 1: HÌNH KHỐI CƠ BẢN (1–10) ====================
  {
    id: 'T3D_01',
    number: 1,
    title: 'Hình lập phương',
    group: 'Hình khối cơ bản',
    curriculumTag: 'Toán 11',
    summary: 'Hình lập phương ABCD.A\'B\'C\'D\' cạnh a có thể thay đổi kích thước và bật đường chéo AC\'.',
    formulaLatex: 'V = a^3,\\; AC\' = a\\sqrt{3}',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      sc = addGeo3DObject(sc, {
        id: 'cube1',
        kind: 'solid',
        rule: 'solid_cube',
        solidType: 'cube',
        label: "ABCD.A'B'C'D'",
        params: { a: 3.6 },
        style: { color: '#0F766E', showDiagonals: true },
        skipLog: true,
      }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_02',
    number: 2,
    title: 'Hình hộp chữ nhật',
    group: 'Hình khối cơ bản',
    curriculumTag: 'Toán 11',
    summary: 'Hình hộp chữ nhật ba kích thước a, b, c kèm đường chéo không gian và thể tích cập nhật động.',
    formulaLatex: 'V = abc,\\; d = \\sqrt{a^2+b^2+c^2}',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      sc = addGeo3DObject(sc, {
        id: 'box1',
        kind: 'solid',
        rule: 'solid_box',
        solidType: 'box',
        label: "ABCD.A'B'C'D'",
        params: { a: 4.6, b: 3.0, c: 2.6 },
        style: { color: '#0284C7', showDiagonals: true },
        skipLog: true,
      }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_03',
    number: 3,
    title: 'Hình tứ diện đều',
    group: 'Hình khối cơ bản',
    curriculumTag: 'Toán 11',
    summary: 'Tứ diện đều S.ABC cạnh a kèm trọng tâm đáy và đường cao từ đỉnh S.',
    formulaLatex: 'V = \\frac{a^3\\sqrt{2}}{12}',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      const solid = addGeo3DObject(sc, {
        id: 'tet1',
        kind: 'solid',
        rule: 'solid_regular_tetrahedron',
        solidType: 'regular_tetrahedron',
        label: 'S.ABC',
        params: { a: 4.2 },
        style: { color: '#0F766E' },
        skipLog: true,
      });
      sc = solid.scene;
      const pS = addGeo3DObject(sc, { id: 'pS', kind: 'point', rule: 'solid_vertex', parents: [solid.id], params: { vertexIndex: 3 }, label: 'S', skipLog: true });
      sc = pS.scene;
      const pG = addGeo3DObject(sc, { id: 'pG', kind: 'point', rule: 'point_coords', position: v3(0, 0, 0), label: 'G', style: { color: '#D97706' }, skipLog: true });
      sc = pG.scene;
      sc = addGeo3DObject(sc, { kind: 'segment', rule: 'segment_3d', parents: [pS.id, pG.id], label: 'SG', style: { color: '#D97706', dashed: true }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_04',
    number: 4,
    title: 'Hình chóp tam giác',
    group: 'Hình khối cơ bản',
    curriculumTag: 'Toán 11',
    summary: 'Hình chóp S.ABC với các đỉnh tự do kéo thả để quan sát đường cao và thể tích thực tế.',
    formulaLatex: 'V = \\frac{1}{3}S_{\\triangle ABC} \\cdot h',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      sc = addGeo3DObject(sc, {
        id: 'tet_gen',
        kind: 'solid',
        rule: 'solid_tetrahedron',
        solidType: 'tetrahedron',
        label: 'S.ABC',
        params: { a: 4.4, b: 3.4, h: 3.8, apexX: -0.7, apexY: 0.4 },
        style: { color: '#0F766E' },
        skipLog: true,
      }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_05',
    number: 5,
    title: 'Hình chóp tứ giác',
    group: 'Hình khối cơ bản',
    curriculumTag: 'Toán 11',
    summary: 'Hình chóp S.ABCD có đáy tứ giác và đường chéo AC, BD cắt nhau tại O.',
    formulaLatex: 'V = \\frac{1}{3}S_{ABCD} \\cdot h',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      sc = addGeo3DObject(sc, {
        id: 'pyr4',
        kind: 'solid',
        rule: 'solid_pyramid',
        solidType: 'pyramid',
        label: 'S.ABCD',
        params: { sides: 4, a: 3.8, h: 4.2, apexX: -0.9, apexY: 0.5 },
        style: { color: '#0284C7', showDiagonals: true },
        skipLog: true,
      }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_06',
    number: 6,
    title: 'Hình chóp tứ giác đều',
    group: 'Hình khối cơ bản',
    curriculumTag: 'Toán 11',
    summary: 'Hình chóp đều S.ABCD có đáy vuông cạnh a, tâm đáy O và đường cao SO vuông góc với đáy.',
    formulaLatex: 'V = \\frac{1}{3}a^2 h',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      const pyr = addGeo3DObject(sc, {
        id: 'regpyr',
        kind: 'solid',
        rule: 'solid_regular_pyramid',
        solidType: 'regular_pyramid',
        label: 'S.ABCD',
        params: { sides: 4, a: 3.8, h: 4.4 },
        style: { color: '#0F766E', showDiagonals: true },
        skipLog: true,
      });
      sc = pyr.scene;
      const pS = addGeo3DObject(sc, { id: 'pS', kind: 'point', rule: 'solid_vertex', parents: [pyr.id], params: { vertexIndex: 4 }, label: 'S', skipLog: true });
      sc = pS.scene;
      const pO = addGeo3DObject(sc, { id: 'pO', kind: 'point', rule: 'point_coords', position: v3(0, 0, 0), label: 'O', style: { color: '#D97706' }, skipLog: true });
      sc = pO.scene;
      sc = addGeo3DObject(sc, { kind: 'segment', rule: 'segment_3d', parents: [pS.id, pO.id], label: 'SO', style: { color: '#D97706', dashed: true }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_07',
    number: 7,
    title: 'Hình lăng trụ tam giác',
    group: 'Hình khối cơ bản',
    curriculumTag: 'Toán 11',
    summary: 'Hình lăng trụ xiên ABC.A\'B\'C\' với hai đáy song song và các cạnh bên song song bằng nhau.',
    formulaLatex: 'V = S_{\\triangle ABC} \\cdot h',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      sc = addGeo3DObject(sc, {
        id: 'prism3',
        kind: 'solid',
        rule: 'solid_prism',
        solidType: 'prism',
        label: "ABC.A'B'C'",
        params: { sides: 3, a: 3.6, h: 4.0, skewX: 1.0, skewY: 0.4 },
        style: { color: '#0F766E' },
        skipLog: true,
      }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_08',
    number: 8,
    title: 'Hình lăng trụ đứng',
    group: 'Hình khối cơ bản',
    curriculumTag: 'Toán 11',
    summary: 'Hình lăng trụ đứng tam giác ABC.A\'B\'C\' có các cạnh bên vuông góc mặt phẳng đáy.',
    formulaLatex: 'V = S_{\\text{đáy}} \\cdot AA\'',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      sc = addGeo3DObject(sc, {
        id: 'rprism',
        kind: 'solid',
        rule: 'solid_right_prism',
        solidType: 'right_prism',
        label: "ABC.A'B'C'",
        params: { sides: 3, a: 3.6, h: 4.2 },
        style: { color: '#0284C7' },
        skipLog: true,
      }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_09',
    number: 9,
    title: 'Hình hộp',
    group: 'Hình khối cơ bản',
    curriculumTag: 'Toán 11',
    summary: 'Hình hộp tổng quát ABCD.A\'B\'C\'D\' có 6 mặt là hình bình hành và tâm đối xứng.',
    formulaLatex: 'V = S_{\\text{đáy}} \\cdot h',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      sc = addGeo3DObject(sc, {
        id: 'pp1',
        kind: 'solid',
        rule: 'solid_parallelepiped',
        solidType: 'parallelepiped',
        label: "ABCD.A'B'C'D'",
        params: { a: 4.0, b: 3.0, h: 3.2, skewX: 1.2, skewY: 0.6 },
        style: { color: '#0F766E', showDiagonals: true },
        skipLog: true,
      }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_10',
    number: 10,
    title: 'Hình cầu',
    group: 'Hình khối cơ bản',
    curriculumTag: 'Toán 12',
    summary: 'Hình cầu tâm I bán kính R hiển thị bán kính, trục và công thức diện tích – thể tích.',
    formulaLatex: 'S = 4\\pi R^2,\\; V = \\frac{4}{3}\\pi R^3',
    buildScene: () => {
      let sc = makeBaseScene('solid', true);
      sc = addGeo3DObject(sc, {
        id: 'sph1',
        kind: 'solid',
        rule: 'solid_sphere',
        solidType: 'sphere',
        label: 'Mặt cầu (I; R)',
        center: v3(0, 0, 2.4),
        params: { r: 2.4 },
        style: { color: '#0284C7', opacity: 0.28, showAxis: true, showDiagonals: true },
        skipLog: true,
      }).scene;
      return sc;
    },
  },

  // ==================== NHÓM 2: QUAN HỆ SONG SONG (11–15) ====================
  {
    id: 'T3D_11',
    number: 11,
    title: 'Hai đường thẳng song song',
    group: 'Quan hệ song song',
    curriculumTag: 'Toán 11',
    summary: 'Dựng đường thẳng d₂ đi qua M và song song với đường thẳng d₁ qua hai điểm A, B.',
    buildScene: () => {
      let sc = makeBaseScene('sgk', true);
      const a = addGeo3DObject(sc, { id: 'A', kind: 'point', rule: 'free_point_3d', position: v3(-2.5, -1, 0), label: 'A', skipLog: true });
      sc = a.scene;
      const b = addGeo3DObject(sc, { id: 'B', kind: 'point', rule: 'free_point_3d', position: v3(2.5, 0.5, 1), label: 'B', skipLog: true });
      sc = b.scene;
      const m = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'free_point_3d', position: v3(0, 1.5, 2.5), label: 'M', style: { color: '#D97706' }, skipLog: true });
      sc = m.scene;
      const d1 = addGeo3DObject(sc, { id: 'd1', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd₁', style: { color: '#0F766E' }, skipLog: true });
      sc = d1.scene;
      sc = addGeo3DObject(sc, { id: 'd2', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'd1'], label: 'd₂', style: { color: '#0284C7' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_line_point', parents: ['d1', 'M'], label: '(P)', style: { color: '#0284C7', opacity: 0.14 }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_12',
    number: 12,
    title: 'Hai đường thẳng chéo nhau',
    group: 'Quan hệ song song',
    curriculumTag: 'Toán 11',
    summary: 'Hai đường thẳng không đồng phẳng AB và CD trong không gian (minh họa rõ bằng hình tứ diện).',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      const a = addGeo3DObject(sc, { id: 'A', kind: 'point', rule: 'free_point_3d', position: v3(-2.5, -1.5, 0), label: 'A', skipLog: true });
      sc = a.scene;
      const b = addGeo3DObject(sc, { id: 'B', kind: 'point', rule: 'free_point_3d', position: v3(2.5, -1.5, 0), label: 'B', skipLog: true });
      sc = b.scene;
      const c = addGeo3DObject(sc, { id: 'C', kind: 'point', rule: 'free_point_3d', position: v3(0, 2.2, 0), label: 'C', skipLog: true });
      sc = c.scene;
      const d = addGeo3DObject(sc, { id: 'D', kind: 'point', rule: 'free_point_3d', position: v3(0, 0, 3.6), label: 'D', style: { color: '#D97706' }, skipLog: true });
      sc = d.scene;
      sc = addGeo3DObject(sc, { id: 'lAB', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'AB', style: { color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'lCD', kind: 'line', rule: 'line_two_points', parents: ['C', 'D'], label: 'CD', style: { color: '#DC2626' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plABC', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'C'], label: '(ABC)', style: { color: '#0284C7', opacity: 0.14 }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_13',
    number: 13,
    title: 'Đường thẳng song song với mặt phẳng',
    group: 'Quan hệ song song',
    curriculumTag: 'Toán 11',
    summary: 'Đường thẳng d song song với đường thẳng a nằm trong mặt phẳng (P) nên d // (P).',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      sc = addGeo3DObject(sc, { id: 'A', kind: 'point', rule: 'free_point_3d', position: v3(-2.5, -1, 0), label: 'A', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'B', kind: 'point', rule: 'free_point_3d', position: v3(2.5, 0.5, 0), label: 'B', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'C', kind: 'point', rule: 'free_point_3d', position: v3(-1, 2.5, 0), label: 'C', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'free_point_3d', position: v3(0, 0, 2.6), label: 'M', style: { color: '#D97706' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'C'], label: '(P)', style: { color: '#0284C7', opacity: 0.18 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'la', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'a', style: { color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'ld', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'la'], label: 'd', style: { color: '#D97706' }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_14',
    number: 14,
    title: 'Hai mặt phẳng song song',
    group: 'Quan hệ song song',
    curriculumTag: 'Toán 11',
    summary: 'Mặt phẳng (Q) đi qua điểm M và song song với mặt phẳng (P), kèm phép đo khoảng cách động.',
    buildScene: () => {
      let sc = makeBaseScene('solid', true);
      sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(P)', style: { color: '#0284C7', opacity: 0.22 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'free_point_3d', position: v3(0.5, 0.5, 2.8), label: 'M', style: { color: '#D97706' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plQ', kind: 'plane', rule: 'plane_parallel_point', parents: ['M', 'plP'], label: '(Q)', style: { color: '#0F766E', opacity: 0.22 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'distPQ', kind: 'measurement', rule: 'measure_distance_planes', parents: ['plP', 'plQ'], label: 'd((P),(Q))', metricKind: 'distance', skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_15',
    number: 15,
    title: 'Giao tuyến của hai mặt phẳng',
    group: 'Quan hệ song song',
    curriculumTag: 'Toán 11',
    summary: 'Hai mặt phẳng (P) và (Q) cắt nhau theo đường thẳng giao tuyến d duy nhất.',
    buildScene: () => {
      let sc = makeBaseScene('solid', true);
      sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 0, c: 1, d: -2 }, label: '(P)', style: { color: '#0284C7', opacity: 0.22 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plQ', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 1, c: 1, d: -2 }, label: '(Q)', style: { color: '#0F766E', opacity: 0.22 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'inter', kind: 'line', rule: 'intersect_plane_plane', parents: ['plP', 'plQ'], label: 'd = (P)∩(Q)', style: { color: '#DC2626', lineWidth: 3 }, skipLog: true }).scene;
      return sc;
    },
  },

  // ==================== NHÓM 3: QUAN HỆ VUÔNG GÓC (16–20) ====================
  {
    id: 'T3D_16',
    number: 16,
    title: 'Hai đường thẳng vuông góc trong không gian',
    group: 'Quan hệ vuông góc',
    curriculumTag: 'Toán 11',
    summary: 'Quan sát hai đường thẳng vuông góc (cắt nhau hoặc chéo nhau) với phép đo góc bằng 90°.',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      sc = addGeo3DObject(sc, { id: 'cube1', kind: 'solid', rule: 'solid_cube', solidType: 'cube', label: "ABCD.A'B'C'D'", params: { a: 3.4 }, style: { color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'A', kind: 'point', rule: 'solid_vertex', parents: ['cube1'], params: { vertexIndex: 0 }, label: 'A', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'B', kind: 'point', rule: 'solid_vertex', parents: ['cube1'], params: { vertexIndex: 1 }, label: 'B', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'B1', kind: 'point', rule: 'solid_vertex', parents: ['cube1'], params: { vertexIndex: 5 }, label: "B'", skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'C1', kind: 'point', rule: 'solid_vertex', parents: ['cube1'], params: { vertexIndex: 6 }, label: "C'", skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'sAB', kind: 'segment', rule: 'segment_3d', parents: ['A', 'B'], label: 'AB', style: { color: '#DC2626', lineWidth: 3 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'sB1C1', kind: 'segment', rule: 'segment_3d', parents: ['B1', 'C1'], label: "B'C'", style: { color: '#0284C7', lineWidth: 3 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'ang', kind: 'measurement', rule: 'measure_angle_lines', parents: ['sAB', 'sB1C1'], label: "(AB, B'C')", metricKind: 'angle', skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_17',
    number: 17,
    title: 'Đường thẳng vuông góc với mặt phẳng',
    group: 'Quan hệ vuông góc',
    curriculumTag: 'Toán 11',
    summary: 'Đường thẳng d đi qua S và vuông góc với mặt phẳng (P) tại hình chiếu vuông góc H.',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(P)', style: { color: '#0284C7', opacity: 0.2 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'S', kind: 'point', rule: 'free_point_3d', position: v3(0.5, 0.2, 3.6), label: 'S', style: { color: '#D97706' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'H', kind: 'point', rule: 'foot_point_plane', parents: ['S', 'plP'], label: 'H', style: { color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'ld', kind: 'line', rule: 'line_perp_plane', parents: ['S', 'plP'], label: 'd ⊥ (P)', style: { color: '#DC2626', lineWidth: 2.5 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'ang', kind: 'measurement', rule: 'measure_angle_line_plane', parents: ['ld', 'plP'], label: '(d, (P))', metricKind: 'angle', skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_18',
    number: 18,
    title: 'Hai mặt phẳng vuông góc',
    group: 'Quan hệ vuông góc',
    curriculumTag: 'Toán 11',
    summary: 'Hai mặt phẳng (P) và (Q) cắt nhau theo giao tuyến d với góc giữa hai mặt phẳng bằng 90°.',
    buildScene: () => {
      let sc = makeBaseScene('solid', true);
      sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(P)', style: { color: '#0284C7', opacity: 0.22 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plQ', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 0, c: 0, d: 0 }, label: '(Q)', style: { color: '#0F766E', opacity: 0.22 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'd', kind: 'line', rule: 'intersect_plane_plane', parents: ['plP', 'plQ'], label: 'd', style: { color: '#D97706', lineWidth: 2.6 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'ang', kind: 'measurement', rule: 'measure_angle_planes', parents: ['plP', 'plQ'], label: '((P),(Q))', metricKind: 'angle', skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_19',
    number: 19,
    title: 'Hình chiếu vuông góc của một điểm',
    group: 'Quan hệ vuông góc',
    curriculumTag: 'Toán 11',
    summary: 'Kéo điểm M trong không gian và quan sát hình chiếu vuông góc H trên mặt phẳng (ABC) luôn cập nhật tức thời.',
    buildScene: () => {
      let sc = makeBaseScene('sgk', true);
      sc = addGeo3DObject(sc, { id: 'A', kind: 'point', rule: 'free_point_3d', position: v3(-2.5, -1.5, 0), label: 'A', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'B', kind: 'point', rule: 'free_point_3d', position: v3(2.8, -1.2, 0.4), label: 'B', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'C', kind: 'point', rule: 'free_point_3d', position: v3(0, 2.6, 0.8), label: 'C', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plABC', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'C'], label: '(ABC)', style: { color: '#0284C7', opacity: 0.2 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'free_point_3d', position: v3(0.4, 0.5, 3.5), label: 'M', style: { color: '#D97706' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'H', kind: 'point', rule: 'foot_point_plane', parents: ['M', 'plABC'], label: 'H', style: { color: '#DC2626' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'sMH', kind: 'segment', rule: 'segment_3d', parents: ['M', 'H'], label: 'MH', style: { color: '#DC2626', dashed: true }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'dMH', kind: 'measurement', rule: 'measure_distance_pp', parents: ['M', 'H'], label: 'MH', metricKind: 'distance', skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_20',
    number: 20,
    title: 'Đường cao của hình chóp',
    group: 'Quan hệ vuông góc',
    curriculumTag: 'Toán 11',
    summary: 'Hình chóp S.ABCD tự dựng từ điểm S tự do; chân đường cao H tự động cập nhật khi kéo S.',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      sc = addGeo3DObject(sc, { id: 'A', kind: 'point', rule: 'free_point_3d', position: v3(-2, -1.6, 0), label: 'A', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'B', kind: 'point', rule: 'free_point_3d', position: v3(2, -1.6, 0), label: 'B', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'C', kind: 'point', rule: 'free_point_3d', position: v3(2.2, 1.8, 0), label: 'C', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'D', kind: 'point', rule: 'free_point_3d', position: v3(-1.8, 1.8, 0), label: 'D', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'S', kind: 'point', rule: 'free_point_3d', position: v3(-0.6, 0.2, 4.0), label: 'S', style: { color: '#D97706' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'base', kind: 'polygon', rule: 'polygon_3d', parents: ['A', 'B', 'C', 'D'], label: '(ABCD)', style: { color: '#0F766E', opacity: 0.14 }, skipLog: true }).scene;
      for (const [p1, p2] of [['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'A'], ['S', 'A'], ['S', 'B'], ['S', 'C'], ['S', 'D']]) {
        sc = addGeo3DObject(sc, { kind: 'segment', rule: 'segment_3d', parents: [p1, p2], label: `${p1}${p2}`, skipLog: true }).scene;
      }
      sc = addGeo3DObject(sc, { id: 'H', kind: 'point', rule: 'foot_point_plane', parents: ['S', 'base'], label: 'H', style: { color: '#DC2626' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'sSH', kind: 'segment', rule: 'segment_3d', parents: ['S', 'H'], label: 'SH', style: { color: '#DC2626', dashed: true, lineWidth: 2.5 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'mSH', kind: 'measurement', rule: 'measure_distance_pp', parents: ['S', 'H'], label: 'h = SH', metricKind: 'distance', skipLog: true }).scene;
      return sc;
    },
  },

  // ==================== NHÓM 4: THIẾT DIỆN (21–26) ====================
  {
    id: 'T3D_21',
    number: 21,
    title: 'Thiết diện tam giác của hình lập phương',
    group: 'Thiết diện',
    curriculumTag: 'Toán 11',
    summary: 'Mặt phẳng cắt qua 3 cạnh xuất phát từ một đỉnh tạo thiết diện tam giác, cập nhật diện tích tức thời.',
    buildScene: () => {
      let sc = makeBaseScene('solid', false);
      sc = addGeo3DObject(sc, { id: 'cube1', kind: 'solid', rule: 'solid_cube', solidType: 'cube', label: "ABCD.A'B'C'D'", params: { a: 3.6 }, style: { color: '#0F766E', opacity: 0.16 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plCut', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 1, d: -2.4 }, label: '(P)', style: { color: '#0284C7', opacity: 0.12 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'cs1', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['cube1', 'plCut'], label: 'Thiết diện tam giác', style: { color: '#D97706', opacity: 0.42 }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_22',
    number: 22,
    title: 'Thiết diện tứ giác của hình lập phương',
    group: 'Thiết diện',
    curriculumTag: 'Toán 11',
    summary: 'Mặt phẳng nghiêng cắt bốn cạnh song song của hình lập phương tạo thiết diện hình bình hành / chữ nhật.',
    buildScene: () => {
      let sc = makeBaseScene('solid', false);
      sc = addGeo3DObject(sc, { id: 'cube1', kind: 'solid', rule: 'solid_cube', solidType: 'cube', label: "ABCD.A'B'C'D'", params: { a: 3.6 }, style: { color: '#0F766E', opacity: 0.16 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plCut', kind: 'plane', rule: 'plane_equation', params: { a: 0.6, b: 0, c: 1, d: -1.8 }, label: '(P)', style: { color: '#0284C7', opacity: 0.12 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'cs2', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['cube1', 'plCut'], label: 'Thiết diện tứ giác', style: { color: '#D97706', opacity: 0.42 }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_23',
    number: 23,
    title: 'Thiết diện lục giác đều của hình lập phương',
    group: 'Thiết diện',
    curriculumTag: 'Toán 11',
    summary: 'Mặt phẳng đi qua tâm và vuông góc đường chéo chính cắt hình lập phương theo lục giác đều 6 đỉnh.',
    buildScene: () => {
      let sc = makeBaseScene('solid', false);
      sc = addGeo3DObject(sc, { id: 'cube1', kind: 'solid', rule: 'solid_cube', solidType: 'cube', label: "ABCD.A'B'C'D'", params: { a: 3.6 }, style: { color: '#0F766E', opacity: 0.15 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plCut', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 1, d: -1.8 }, label: '(P)', style: { color: '#0284C7', opacity: 0.12 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'cs3', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['cube1', 'plCut'], label: 'Thiết diện lục giác đều', style: { color: '#D97706', opacity: 0.45 }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_24',
    number: 24,
    title: 'Thiết diện của hình tứ diện',
    group: 'Thiết diện',
    curriculumTag: 'Toán 11',
    summary: 'Mặt phẳng cắt hình tứ diện tạo thiết diện tứ giác; chỉnh hệ số phương trình để quan sát biến đổi sang tam giác.',
    buildScene: () => {
      let sc = makeBaseScene('solid', false);
      sc = addGeo3DObject(sc, { id: 'tet1', kind: 'solid', rule: 'solid_regular_tetrahedron', solidType: 'regular_tetrahedron', label: 'S.ABC', params: { a: 4.4 }, style: { color: '#0F766E', opacity: 0.16 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plCut', kind: 'plane', rule: 'plane_equation', params: { a: 0.3, b: 0.8, c: 0.4, d: -0.7 }, label: '(P)', style: { color: '#0284C7', opacity: 0.12 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'cs4', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['tet1', 'plCut'], label: 'Thiết diện tứ diện', style: { color: '#D97706', opacity: 0.44 }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_25',
    number: 25,
    title: 'Thiết diện của hình chóp tứ giác',
    group: 'Thiết diện',
    curriculumTag: 'Toán 11',
    summary: 'Mặt phẳng cắt nghiêng qua các cạnh bên của hình chóp S.ABCD tạo thiết diện tứ giác.',
    buildScene: () => {
      let sc = makeBaseScene('solid', false);
      sc = addGeo3DObject(sc, { id: 'pyr1', kind: 'solid', rule: 'solid_regular_pyramid', solidType: 'regular_pyramid', label: 'S.ABCD', params: { sides: 4, a: 4.0, h: 4.6 }, style: { color: '#0284C7', opacity: 0.16 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plCut', kind: 'plane', rule: 'plane_equation', params: { a: 0.4, b: 0.2, c: 1, d: -1.8 }, label: '(P)', style: { color: '#0F766E', opacity: 0.12 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'cs5', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['pyr1', 'plCut'], label: 'Thiết diện hình chóp', style: { color: '#D97706', opacity: 0.44 }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_26',
    number: 26,
    title: 'Thiết diện của hình lăng trụ',
    group: 'Thiết diện',
    curriculumTag: 'Toán 11',
    summary: 'Mặt phẳng cắt nghiêng lăng trụ đứng tam giác tạo thiết diện tam giác xiên.',
    buildScene: () => {
      let sc = makeBaseScene('solid', false);
      sc = addGeo3DObject(sc, { id: 'pr1', kind: 'solid', rule: 'solid_right_prism', solidType: 'right_prism', label: "ABC.A'B'C'", params: { sides: 3, a: 3.8, h: 4.4 }, style: { color: '#0F766E', opacity: 0.16 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plCut', kind: 'plane', rule: 'plane_equation', params: { a: 0.5, b: 0.3, c: 1, d: -2.1 }, label: '(P)', style: { color: '#0284C7', opacity: 0.12 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'cs6', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['pr1', 'plCut'], label: 'Thiết diện lăng trụ', style: { color: '#D97706', opacity: 0.44 }, skipLog: true }).scene;
      return sc;
    },
  },

  // ==================== NHÓM 5: GÓC VÀ KHOẢNG CÁCH (27–32) ====================
  {
    id: 'T3D_27',
    number: 27,
    title: 'Góc giữa hai đường thẳng',
    group: 'Góc và khoảng cách',
    curriculumTag: 'Toán 11',
    summary: 'Đo góc giữa hai đường thẳng d₁ và d₂ trong không gian (thuộc [0°; 90°]) cập nhật khi kéo điểm.',
    buildScene: () => {
      let sc = makeBaseScene('sgk', true);
      sc = addGeo3DObject(sc, { id: 'A', kind: 'point', rule: 'free_point_3d', position: v3(-2, -1, 0), label: 'A', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'B', kind: 'point', rule: 'free_point_3d', position: v3(2.5, 0.5, 1.5), label: 'B', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'C', kind: 'point', rule: 'free_point_3d', position: v3(-1, 2, 0), label: 'C', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'D', kind: 'point', rule: 'free_point_3d', position: v3(1.5, -1.5, 2.5), label: 'D', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'l1', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd₁', style: { color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'l2', kind: 'line', rule: 'line_two_points', parents: ['C', 'D'], label: 'd₂', style: { color: '#0284C7' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'mAng', kind: 'measurement', rule: 'measure_angle_lines', parents: ['l1', 'l2'], label: '(d₁, d₂)', metricKind: 'angle', skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_28',
    number: 28,
    title: 'Góc giữa đường thẳng và mặt phẳng',
    group: 'Góc và khoảng cách',
    curriculumTag: 'Toán 11',
    summary: 'Góc giữa đường thẳng SA và mặt phẳng đáy (P) chính là góc giữa SA và hình chiếu HA của nó.',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(P)', style: { color: '#0284C7', opacity: 0.18 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'A', kind: 'point', rule: 'free_point_3d', position: v3(-2.4, -0.5, 0), label: 'A', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'S', kind: 'point', rule: 'free_point_3d', position: v3(1.6, 0.5, 3.2), label: 'S', style: { color: '#D97706' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'H', kind: 'point', rule: 'foot_point_plane', parents: ['S', 'plP'], label: 'H', style: { color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'sSA', kind: 'segment', rule: 'segment_3d', parents: ['S', 'A'], label: 'SA', style: { color: '#DC2626', lineWidth: 2.5 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'sSH', kind: 'segment', rule: 'segment_3d', parents: ['S', 'H'], label: 'SH', style: { color: '#0F766E', dashed: true }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'sAH', kind: 'segment', rule: 'segment_3d', parents: ['A', 'H'], label: 'AH', style: { color: '#0284C7' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'ang', kind: 'measurement', rule: 'measure_angle_line_plane', parents: ['sSA', 'plP'], label: '(SA, (P))', metricKind: 'angle', skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_29',
    number: 29,
    title: 'Góc giữa hai mặt phẳng',
    group: 'Góc và khoảng cách',
    curriculumTag: 'Toán 11',
    summary: 'Hai mặt phẳng (P) và (Q) cắt nhau theo giao tuyến d với góc giữa hai mặt phẳng thuộc [0°; 90°].',
    buildScene: () => {
      let sc = makeBaseScene('solid', true);
      sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(P)', style: { color: '#0284C7', opacity: 0.22 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plQ', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 0, c: 1.2, d: 0 }, label: '(Q)', style: { color: '#0F766E', opacity: 0.22 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'd', kind: 'line', rule: 'intersect_plane_plane', parents: ['plP', 'plQ'], label: 'd', style: { color: '#D97706', lineWidth: 2.5 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'ang', kind: 'measurement', rule: 'measure_angle_planes', parents: ['plP', 'plQ'], label: '((P), (Q))', metricKind: 'angle', skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_30',
    number: 30,
    title: 'Góc nhị diện [S, BC, A]',
    group: 'Góc và khoảng cách',
    curriculumTag: 'Toán 11',
    summary: 'Phân biệt rõ góc nhị diện [S, BC, A] trong [0°; 180°] với góc giữa hai mặt phẳng (SBC) và (ABC).',
    buildScene: () => {
      let sc = makeBaseScene('sgk', false);
      sc = addGeo3DObject(sc, { id: 'B', kind: 'point', rule: 'free_point_3d', position: v3(-2.2, 0, 0), label: 'B', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'C', kind: 'point', rule: 'free_point_3d', position: v3(2.2, 0, 0), label: 'C', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'A', kind: 'point', rule: 'free_point_3d', position: v3(0, 2.8, 0), label: 'A', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'S', kind: 'point', rule: 'free_point_3d', position: v3(0, -1.6, 2.8), label: 'S', style: { color: '#D97706' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'pABC', kind: 'polygon', rule: 'polygon_3d', parents: ['A', 'B', 'C'], label: '(ABC)', style: { color: '#0284C7', opacity: 0.2 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'pSBC', kind: 'polygon', rule: 'polygon_3d', parents: ['S', 'B', 'C'], label: '(SBC)', style: { color: '#0F766E', opacity: 0.22 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'sBC', kind: 'segment', rule: 'segment_3d', parents: ['B', 'C'], label: 'BC', style: { color: '#DC2626', lineWidth: 3 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'dih', kind: 'measurement', rule: 'measure_dihedral_angle', parents: ['S', 'B', 'C', 'A'], label: '[S, BC, A]', metricKind: 'dihedral', skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_31',
    number: 31,
    title: 'Khoảng cách từ điểm đến mặt phẳng',
    group: 'Góc và khoảng cách',
    curriculumTag: 'Toán 11',
    summary: 'Khoảng cách từ M đến mặt phẳng (P) bằng độ dài đoạn vuông góc MH.',
    formulaLatex: 'd(M,(P)) = MH = \\frac{|Ax_0+By_0+Cz_0+D|}{\\sqrt{A^2+B^2+C^2}}',
    buildScene: () => {
      let sc = makeBaseScene('solid', true);
      sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 2, d: -2 }, label: '(P)', style: { color: '#0284C7', opacity: 0.22 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'point_coords', position: v3(2, 2, 3), label: 'M', style: { color: '#D97706' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'H', kind: 'point', rule: 'foot_point_plane', parents: ['M', 'plP'], label: 'H', style: { color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'sMH', kind: 'segment', rule: 'segment_3d', parents: ['M', 'H'], label: 'MH', style: { color: '#DC2626', dashed: true, lineWidth: 2.5 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'mD', kind: 'measurement', rule: 'measure_distance_pplane', parents: ['M', 'plP'], label: 'd(M,(P))', metricKind: 'distance', skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_32',
    number: 32,
    title: 'Khoảng cách giữa hai đường thẳng chéo nhau',
    group: 'Góc và khoảng cách',
    curriculumTag: 'Toán 11',
    summary: 'Dựng đường vuông góc chung của hai đường thẳng chéo nhau d₁, d₂ và đo khoảng cách ngắn nhất.',
    buildScene: () => {
      let sc = makeBaseScene('sgk', true);
      sc = addGeo3DObject(sc, { id: 'A', kind: 'point', rule: 'free_point_3d', position: v3(-3, -1, 0), label: 'A', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'B', kind: 'point', rule: 'free_point_3d', position: v3(3, -1, 0), label: 'B', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'C', kind: 'point', rule: 'free_point_3d', position: v3(0, -2.5, 2.6), label: 'C', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'D', kind: 'point', rule: 'free_point_3d', position: v3(0, 2.5, 2.6), label: 'D', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'd1', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd₁', style: { color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'd2', kind: 'line', rule: 'line_two_points', parents: ['C', 'D'], label: 'd₂', style: { color: '#0284C7' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'cp', kind: 'line', rule: 'common_perpendicular', parents: ['d1', 'd2'], label: 'Δ vuông góc chung', style: { color: '#DC2626', dashed: true, lineWidth: 2.5 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'mSkew', kind: 'measurement', rule: 'measure_distance_skew', parents: ['d1', 'd2'], label: 'd(d₁, d₂)', metricKind: 'distance', skipLog: true }).scene;
      return sc;
    },
  },

  // ==================== NHÓM 6: TỌA ĐỘ KHÔNG GIAN OXYZ (33–40) ====================
  {
    id: 'T3D_33',
    number: 33,
    title: 'Hệ tọa độ Oxyz và ba vectơ đơn vị',
    group: 'Tọa độ không gian',
    curriculumTag: 'Toán 12',
    summary: 'Không gian Oxyz với gốc O(0; 0; 0), ba vectơ đơn vị i, j, k và điểm M(3; 2; 3) cùng hình chiếu.',
    formulaLatex: '\\overrightarrow{OM} = x\\vec{i} + y\\vec{j} + z\\vec{k}',
    buildScene: () => {
      let sc = makeBaseScene('oxyz', true);
      sc = addGeo3DObject(sc, { id: 'O', kind: 'point', rule: 'point_coords', position: v3(0, 0, 0), label: 'O', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'point_coords', position: v3(3, 2, 3), label: 'M(3;2;3)', style: { color: '#D97706' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'vi', kind: 'vector', rule: 'vector_coords', params: { ox: 0, oy: 0, oz: 0, vx: 1, vy: 0, vz: 0 }, label: 'i', style: { color: '#DC2626' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'vj', kind: 'vector', rule: 'vector_coords', params: { ox: 0, oy: 0, oz: 0, vx: 0, vy: 1, vz: 0 }, label: 'j', style: { color: '#059669' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'vk', kind: 'vector', rule: 'vector_coords', params: { ox: 0, oy: 0, oz: 0, vx: 0, vy: 0, vz: 1 }, label: 'k', style: { color: '#2563EB' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'vOM', kind: 'vector', rule: 'vector_two_points', parents: ['O', 'M'], label: 'OM', style: { color: '#7C3AED' }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_34',
    number: 34,
    title: 'Điểm và vectơ trong không gian',
    group: 'Tọa độ không gian',
    curriculumTag: 'Toán 12',
    summary: 'Điểm A(1; 2; 3), điểm B(4; 2; 3) và vectơ AB = (3; 0; 0) kèm phép đo độ dài AB = 3.',
    formulaLatex: '\\overrightarrow{AB} = (x_B-x_A;\\; y_B-y_A;\\; z_B-z_A)',
    buildScene: () => {
      let sc = makeBaseScene('oxyz', true);
      sc = addGeo3DObject(sc, { id: 'A', kind: 'point', rule: 'point_coords', position: v3(1, 2, 3), label: 'A', style: { color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'B', kind: 'point', rule: 'point_coords', position: v3(4, 2, 3), label: 'B', style: { color: '#D97706' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'vAB', kind: 'vector', rule: 'vector_two_points', parents: ['A', 'B'], label: 'AB', style: { color: '#7C3AED' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'mAB', kind: 'measurement', rule: 'measure_distance_pp', parents: ['A', 'B'], label: '|AB|', metricKind: 'length', skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_35',
    number: 35,
    title: 'Tổng hai vectơ theo quy tắc hình bình hành',
    group: 'Tọa độ không gian',
    curriculumTag: 'Toán 12',
    summary: 'Minh họa tổng u + v của hai vectơ u(3; 1; 1) và v(1; 3; 2) trong hệ tọa độ Oxyz.',
    formulaLatex: '\\vec{u} + \\vec{v} = (u_1+v_1;\\; u_2+v_2;\\; u_3+v_3)',
    buildScene: () => {
      let sc = makeBaseScene('oxyz', true);
      sc = addGeo3DObject(sc, { id: 'O', kind: 'point', rule: 'point_coords', position: v3(0, 0, 0), label: 'O', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'U', kind: 'point', rule: 'point_coords', position: v3(3, 1, 1), label: 'A', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'V', kind: 'point', rule: 'point_coords', position: v3(1, 3, 2), label: 'B', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'W', kind: 'point', rule: 'point_coords', position: v3(4, 4, 3), label: 'C', style: { color: '#DC2626' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'vu', kind: 'vector', rule: 'vector_two_points', parents: ['O', 'U'], label: 'u', style: { color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'vv', kind: 'vector', rule: 'vector_two_points', parents: ['O', 'V'], label: 'v', style: { color: '#0284C7' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'vw', kind: 'vector', rule: 'vector_two_points', parents: ['O', 'W'], label: 'u + v', style: { color: '#DC2626' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { kind: 'segment', rule: 'segment_3d', parents: ['U', 'W'], label: 'AC', style: { color: '#94A3B8', dashed: true }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { kind: 'segment', rule: 'segment_3d', parents: ['V', 'W'], label: 'BC', style: { color: '#94A3B8', dashed: true }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_36',
    number: 36,
    title: 'Phương trình mặt phẳng trong Oxyz',
    group: 'Tọa độ không gian',
    curriculumTag: 'Toán 12',
    summary: 'Mặt phẳng (P): x + 2y + 2z - 6 = 0 đi qua ba giao điểm với ba trục tọa độ và vectơ pháp tuyến n(1; 2; 2).',
    formulaLatex: 'x + 2y + 2z - 6 = 0',
    buildScene: () => {
      let sc = makeBaseScene('oxyz', true);
      sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 2, c: 2, d: -6 }, label: '(P)', style: { color: '#0284C7', opacity: 0.25 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'A', kind: 'point', rule: 'point_coords', position: v3(6, 0, 0), label: 'A(6;0;0)', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'B', kind: 'point', rule: 'point_coords', position: v3(0, 3, 0), label: 'B(0;3;0)', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'C', kind: 'point', rule: 'point_coords', position: v3(0, 0, 3), label: 'C(0;0;3)', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'vn', kind: 'vector', rule: 'vector_coords', params: { ox: 0, oy: 0, oz: 3, vx: 1, vy: 2, vz: 2 }, label: 'n(1;2;2)', style: { color: '#DC2626' }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_37',
    number: 37,
    title: 'Phương trình đường thẳng trong Oxyz',
    group: 'Tọa độ không gian',
    curriculumTag: 'Toán 12',
    summary: 'Đường thẳng d đi qua M₀(1; 1; 1) có vectơ chỉ phương u(2; 1; 2) biểu diễn theo tham số và chính tắc.',
    formulaLatex: '\\frac{x-1}{2} = \\frac{y-1}{1} = \\frac{z-1}{2}',
    buildScene: () => {
      let sc = makeBaseScene('oxyz', true);
      sc = addGeo3DObject(sc, { id: 'M0', kind: 'point', rule: 'point_coords', position: v3(1, 1, 1), label: 'M₀(1;1;1)', style: { color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'vu', kind: 'vector', rule: 'vector_coords', parents: ['M0'], params: { vx: 2, vy: 1, vz: 2 }, label: 'u(2;1;2)', style: { color: '#7C3AED' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'ld', kind: 'line', rule: 'line_point_direction', parents: ['M0'], params: { dx: 2, dy: 1, dz: 2 }, label: 'd', style: { color: '#0284C7', lineWidth: 2.5 }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_38',
    number: 38,
    title: 'Phương trình mặt cầu trong Oxyz',
    group: 'Tọa độ không gian',
    curriculumTag: 'Toán 12',
    summary: 'Mặt cầu (S) tâm I(1; 1; 2) bán kính R = 2,5 cùng mặt phẳng cắt tạo đường tròn giao tuyến.',
    formulaLatex: '(x-1)^2 + (y-1)^2 + (z-2)^2 = 6.25',
    buildScene: () => {
      let sc = makeBaseScene('oxyz', true);
      sc = addGeo3DObject(sc, { id: 'sph', kind: 'solid', rule: 'solid_sphere', solidType: 'sphere', label: '(S)', center: v3(1, 1, 2), params: { r: 2.5 }, style: { color: '#0284C7', opacity: 0.24 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'pl', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: -2.8 }, label: '(P)', style: { color: '#0F766E', opacity: 0.14 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['sph', 'pl'], label: 'Đường tròn giao tuyến', style: { color: '#D97706', opacity: 0.35 }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_39',
    number: 39,
    title: 'Giao điểm đường thẳng và mặt phẳng trong Oxyz',
    group: 'Tọa độ không gian',
    curriculumTag: 'Toán 12',
    summary: 'Xác định tọa độ giao điểm I của đường thẳng d và mặt phẳng (P): x + y + z - 4 = 0.',
    buildScene: () => {
      let sc = makeBaseScene('oxyz', true);
      sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 1, d: -4 }, label: '(P)', style: { color: '#0284C7', opacity: 0.22 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'M0', kind: 'point', rule: 'point_coords', position: v3(0, 0, 0), label: 'O', skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'ld', kind: 'line', rule: 'line_point_direction', parents: ['M0'], params: { dx: 1, dy: 2, dz: 1 }, label: 'd', style: { color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'I', kind: 'point', rule: 'intersect_line_plane', parents: ['ld', 'plP'], label: 'I = d∩(P)', style: { color: '#DC2626' }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    id: 'T3D_40',
    number: 40,
    title: 'Giao tuyến xác định bằng phương trình hai mặt phẳng',
    group: 'Tọa độ không gian',
    curriculumTag: 'Toán 12',
    summary: 'Tìm đường thẳng giao tuyến d của hệ hai phương trình mặt phẳng (P): x + y + z - 3 = 0 và (Q): x - y + z - 1 = 0.',
    formulaLatex: '\\begin{cases} x+y+z-3=0 \\\\ x-y+z-1=0 \\end{cases}',
    buildScene: () => {
      let sc = makeBaseScene('oxyz', true);
      sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 1, d: -3 }, label: '(P)', style: { color: '#0284C7', opacity: 0.22 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'plQ', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: -1, c: 1, d: -1 }, label: '(Q)', style: { color: '#0F766E', opacity: 0.22 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'd', kind: 'line', rule: 'intersect_plane_plane', parents: ['plP', 'plQ'], label: 'd = (P)∩(Q)', style: { color: '#DC2626', lineWidth: 3 }, skipLog: true }).scene;
      return sc;
    },
  },
];

export const TEMPLATE_GROUPS_3D: Array<{ id: Template3DGroup; title: string }> = [
  { id: 'Hình khối cơ bản', title: 'Hình khối cơ bản' },
  { id: 'Quan hệ song song', title: 'Quan hệ song song' },
  { id: 'Quan hệ vuông góc', title: 'Quan hệ vuông góc' },
  { id: 'Thiết diện', title: 'Thiết diện' },
  { id: 'Góc và khoảng cách', title: 'Góc và khoảng cách' },
  { id: 'Tọa độ không gian', title: 'Tọa độ không gian' },
];

export function getTemplate3DById(id: string): Template3DItem | undefined {
  return TEMPLATES_3D.find((t) => t.id === id);
}

