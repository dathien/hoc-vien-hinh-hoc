import { addGeo3DObject, createEmptyScene3D } from './engine3d';
import { v3 } from './math3d';
import type { Geo3DScene, Tool3DId } from './types3d';
import type { Challenge3DDefinition } from './validator3d';

export interface Level3DMeta {
  id: number;
  roman: string;
  title: string;
  subtitle: string;
  curriculumTag: 'Toán 11' | 'Toán 12';
  accentColor: string;
}

export const LEVELS_3D: Level3DMeta[] = [
  {
    id: 1,
    roman: 'I',
    title: 'Làm quen dựng hình không gian',
    subtitle: 'Điểm, đoạn thẳng, đường thẳng, mặt phẳng và hình khối cơ bản',
    curriculumTag: 'Toán 11',
    accentColor: '#0F766E',
  },
  {
    id: 2,
    roman: 'II',
    title: 'Quan hệ song song',
    subtitle: 'Đường thẳng song song, mặt phẳng song song và giao tuyến',
    curriculumTag: 'Toán 11',
    accentColor: '#0284C7',
  },
  {
    id: 3,
    roman: 'III',
    title: 'Quan hệ vuông góc',
    subtitle: 'Đường thẳng vuông góc, mặt phẳng vuông góc và hình chiếu',
    curriculumTag: 'Toán 11',
    accentColor: '#7C3AED',
  },
  {
    id: 4,
    roman: 'IV',
    title: 'Thiết diện – Góc – Khoảng cách',
    subtitle: 'Dựng thiết diện đa diện, xác định góc và khoảng cách không gian',
    curriculumTag: 'Toán 11',
    accentColor: '#D97706',
  },
  {
    id: 5,
    roman: 'V',
    title: 'Vectơ và hệ tọa độ Oxyz',
    subtitle: 'Tọa độ điểm, vectơ, phép toán vectơ và biểu diễn hình học',
    curriculumTag: 'Toán 12',
    accentColor: '#059669',
  },
  {
    id: 6,
    roman: 'VI',
    title: 'Phương pháp tọa độ trong không gian',
    subtitle: 'Phương trình mặt phẳng, đường thẳng, mặt cầu và bài toán tổng hợp',
    curriculumTag: 'Toán 12',
    accentColor: '#DC2626',
  },
];

const BASIC_3D_TOOLS: Tool3DId[] = [
  'select',
  'pan_orbit',
  'point_free',
  'point_coords',
  'midpoint',
  'segment',
  'line',
  'ray',
  'vector',
  'plane_3pts',
  'polygon',
  'solid_library',
];

const ALL_3D_TOOLS: Tool3DId[] = [
  ...BASIC_3D_TOOLS,
  'point_on_line',
  'point_on_segment',
  'point_on_plane',
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

function givenPointsScene(
  pts: Array<{ id: string; label: string; pos: { x: number; y: number; z: number } }>,
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

export const CHALLENGES_3D: Challenge3DDefinition[] = [
  // ==================== CẤP ĐỘ 1: LÀM QUEN DỰNG HÌNH KHÔNG GIAN (10 bài) ====================
  {
    id: 'S3D_L01_C01',
    levelId: 1,
    order: 1,
    title: 'Nối đoạn thẳng trong không gian',
    description: 'Cho hai điểm $A$ và $B$ trong không gian. Hãy dựng đoạn thẳng $AB$.',
    hypothesis: 'Cho trước hai điểm phân biệt $A, B$.',
    goal: 'Dựng đoạn thẳng $AB$ nối hai điểm $A$ và $B$.',
    difficulty: 'Cơ bản',
    curriculumTag: 'Toán 11',
    allowedTools: BASIC_3D_TOOLS,
    targetSteps: 1,
    buildInitialScene: () =>
      givenPointsScene([
        { id: 'A', label: 'A', pos: v3(-2, -1, 0) },
        { id: 'B', label: 'B', pos: v3(2.4, 1.2, 2.2) },
      ]),
    validationRules: [{ type: 'has_segment_between', refs: ['A', 'B'], description: 'Có đoạn thẳng AB nối A và B.' }],
    perturbFreePointIds: ['A', 'B'],
    hints: [
      'Một đoạn thẳng trong không gian hoàn toàn được xác định bởi hai điểm đầu mút.',
      'Mở nhóm công cụ Đường ở thanh bên trái.',
      'Chọn công cụ "Đoạn thẳng qua hai điểm", sau đó nhấp lần lượt vào điểm A và điểm B.',
    ],
    solutionSteps: [
      {
        id: 's1',
        actionText: 'Chọn công cụ Đoạn thẳng và nhấp lần lượt vào A, B.',
        mathExplanation: 'Qua hai điểm phân biệt A, B có duy nhất một đoạn thẳng AB.',
        addInput: { id: 'sol_seg', kind: 'segment', rule: 'segment_3d', parents: ['A', 'B'], label: 'AB' },
      },
    ],
    proof: 'Hai điểm phân biệt $A, B$ trong không gian xác định duy nhất đoạn thẳng $AB$.',
  },
  {
    id: 'S3D_L01_C02',
    levelId: 1,
    order: 2,
    title: 'Dựng trung điểm đoạn thẳng trong không gian',
    description: 'Cho hai điểm $A, B$ trong không gian. Hãy dựng trung điểm $M$ của đoạn thẳng $AB$.',
    hypothesis: 'Cho hai điểm $A, B$ tự do trong không gian.',
    goal: 'Dựng trung điểm $M$ phụ thuộc động theo $A$ và $B$.',
    difficulty: 'Cơ bản',
    curriculumTag: 'Toán 11',
    allowedTools: BASIC_3D_TOOLS,
    targetSteps: 1,
    buildInitialScene: () => {
      let sc = givenPointsScene([
        { id: 'A', label: 'A', pos: v3(-2.4, -1, 0.4) },
        { id: 'B', label: 'B', pos: v3(2.2, 1.6, 2.8) },
      ]);
      sc = addGeo3DObject(sc, { id: 'sAB', kind: 'segment', rule: 'segment_3d', parents: ['A', 'B'], label: 'AB', style: { isGiven: true }, skipLog: true }).scene;
      return sc;
    },
    validationRules: [{ type: 'has_midpoint_of', refs: ['A', 'B'], description: 'Dựng trung điểm M của AB.' }],
    perturbFreePointIds: ['A', 'B'],
    hints: [
      'Trung điểm chia đoạn thẳng thành hai phần bằng nhau và luôn di chuyển theo hai đầu mút.',
      'Sử dụng công cụ dựng Trung điểm trong nhóm Điểm.',
      'Chọn công cụ "Trung điểm của đoạn thẳng", nhấp vào điểm A rồi nhấp vào điểm B.',
    ],
    solutionSteps: [
      {
        id: 's1',
        actionText: 'Chọn công cụ Trung điểm rồi nhấp A và B.',
        mathExplanation: 'Tọa độ trung điểm $M = \\left(\\frac{x_A+x_B}{2}; \\frac{y_A+y_B}{2}; \\frac{z_A+z_B}{2}\\right)$.',
        addInput: { id: 'sol_M', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'B'], label: 'M', style: { color: '#D97706' } },
      },
    ],
    proof: 'Điểm $M$ được dựng theo quy tắc trung điểm luôn thỏa mãn $\\overrightarrow{MA} + \\overrightarrow{MB} = \\vec{0}$ với mọi vị trí của $A, B$.',
  },
  {
    id: 'S3D_L01_C03',
    levelId: 1,
    order: 3,
    title: 'Dựng đường thẳng qua hai điểm phân biệt',
    description: 'Cho hai điểm $A, B$. Hãy dựng đường thẳng kéo dài đi qua hai điểm $A$ và $B$.',
    hypothesis: 'Cho hai điểm phân biệt $A, B$.',
    goal: 'Dựng đường thẳng $d$ đi qua $A$ và $B$.',
    difficulty: 'Cơ bản',
    curriculumTag: 'Toán 11',
    allowedTools: BASIC_3D_TOOLS,
    targetSteps: 1,
    buildInitialScene: () =>
      givenPointsScene([
        { id: 'A', label: 'A', pos: v3(-2, -1.2, 0.5) },
        { id: 'B', label: 'B', pos: v3(2, 1.4, 2.5) },
      ]),
    validationRules: [{ type: 'has_line_through', refs: ['A', 'B'], description: 'Dựng đường thẳng đi qua A và B.' }],
    perturbFreePointIds: ['A', 'B'],
    hints: [
      'Theo tính chất thừa nhận của hình học không gian, có một và chỉ một đường thẳng đi qua hai điểm phân biệt.',
      'Mở nhóm Đường và chọn "Đường thẳng qua hai điểm".',
      'Nhấp điểm A rồi nhấp điểm B để tạo đường thẳng AB.',
    ],
    solutionSteps: [
      {
        id: 's1',
        actionText: 'Chọn công cụ Đường thẳng qua hai điểm, nhấp A và B.',
        mathExplanation: 'Đường thẳng $AB$ là tập hợp các điểm $M$ sao cho $\\overrightarrow{AM}$ cùng phương $\\overrightarrow{AB}$.',
        addInput: { id: 'sol_l', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd' },
      },
    ],
    proof: 'Qua hai điểm phân biệt trong không gian có duy nhất một đường thẳng.',
  },
  {
    id: 'S3D_L01_C04',
    levelId: 1,
    order: 4,
    title: 'Dựng mặt phẳng đi qua ba điểm không thẳng hàng',
    description: 'Cho ba điểm không thẳng hàng $A, B, C$. Hãy dựng mặt phẳng $(ABC)$.',
    hypothesis: 'Cho ba điểm không thẳng hàng $A, B, C$.',
    goal: 'Dựng mặt phẳng $(ABC)$ đi qua cả ba điểm.',
    difficulty: 'Cơ bản',
    curriculumTag: 'Toán 11',
    allowedTools: BASIC_3D_TOOLS,
    targetSteps: 1,
    buildInitialScene: () =>
      givenPointsScene([
        { id: 'A', label: 'A', pos: v3(-2.4, -1.4, 0) },
        { id: 'B', label: 'B', pos: v3(2.4, -1.2, 0.6) },
        { id: 'C', label: 'C', pos: v3(0, 2.2, 1.4) },
      ]),
    validationRules: [{ type: 'has_plane_through_points', refs: ['A', 'B', 'C'], description: 'Dựng mặt phẳng (ABC).' }],
    perturbFreePointIds: ['A', 'B', 'C'],
    hints: [
      'Ba điểm không thẳng hàng xác định duy nhất một mặt phẳng.',
      'Mở nhóm Mặt phẳng ở thanh công cụ bên trái.',
      'Chọn "Mặt phẳng qua ba điểm không thẳng hàng", rồi nhấp lần lượt A, B, C.',
    ],
    solutionSteps: [
      {
        id: 's1',
        actionText: 'Chọn công cụ Mặt phẳng qua 3 điểm, nhấp A, B, C.',
        mathExplanation: 'Vectơ pháp tuyến của mặt phẳng là $\\vec{n} = [\\overrightarrow{AB}, \\overrightarrow{AC}] \\neq \\vec{0}$.',
        addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'C'], label: '(ABC)' },
      },
    ],
    proof: 'Vì $A, B, C$ không thẳng hàng nên có duy nhất một mặt phẳng đi qua cả ba điểm này.',
  },
  {
    id: 'S3D_L01_C05',
    levelId: 1,
    order: 5,
    title: 'Dựng đường trung bình trong tam giác không gian',
    description: 'Cho tam giác $ABC$ trong không gian. Hãy dựng trung điểm $M$ của $AB$, trung điểm $N$ của $AC$ và nối đoạn thẳng $MN$.',
    hypothesis: 'Cho tam giác $ABC$ trong không gian.',
    goal: 'Dựng $M$ là trung điểm $AB$, $N$ là trung điểm $AC$ và đoạn thẳng $MN$.',
    difficulty: 'Cơ bản',
    curriculumTag: 'Toán 11',
    allowedTools: BASIC_3D_TOOLS,
    targetSteps: 3,
    buildInitialScene: () => {
      let sc = givenPointsScene([
        { id: 'A', label: 'A', pos: v3(0, 0, 3.2) },
        { id: 'B', label: 'B', pos: v3(-2.5, -1.5, 0) },
        { id: 'C', label: 'C', pos: v3(2.5, 1.2, 0) },
      ]);
      sc = addGeo3DObject(sc, { id: 'sAB', kind: 'segment', rule: 'segment_3d', parents: ['A', 'B'], label: 'AB', style: { isGiven: true }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'sAC', kind: 'segment', rule: 'segment_3d', parents: ['A', 'C'], label: 'AC', style: { isGiven: true }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'sBC', kind: 'segment', rule: 'segment_3d', parents: ['B', 'C'], label: 'BC', style: { isGiven: true }, skipLog: true }).scene;
      return sc;
    },
    validationRules: [
      { type: 'has_midpoint_of', refs: ['A', 'B'], description: 'Có trung điểm M của AB.' },
      { type: 'has_midpoint_of', refs: ['A', 'C'], description: 'Có trung điểm N của AC.' },
      { type: 'has_segment_between_midpoints', refs: ['A', 'B', 'A', 'C'], description: 'Nối đường trung bình MN.' },
    ],
    perturbFreePointIds: ['A', 'B', 'C'],
    hints: [
      'Đường trung bình nối trung điểm hai cạnh của tam giác và song song với cạnh thứ ba.',
      'Dựng lần lượt hai trung điểm trên AB và AC trước.',
      'Dùng công cụ Trung điểm cho (A, B) và (A, C), sau đó dùng Đoạn thẳng nối hai trung điểm vừa dựng.',
    ],
    solutionSteps: [
      { id: 's1', actionText: 'Dựng trung điểm M của AB.', mathExplanation: '$M$ là trung điểm $AB$.', addInput: { id: 'sol_M', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'B'], label: 'M' } },
      { id: 's2', actionText: 'Dựng trung điểm N của AC.', mathExplanation: '$N$ là trung điểm $AC$.', addInput: { id: 'sol_N', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'C'], label: 'N' } },
      { id: 's3', actionText: 'Nối đoạn thẳng MN.', mathExplanation: '$MN \\parallel BC$ và $MN = \\frac{1}{2}BC$.', addInput: { id: 'sol_MN', kind: 'segment', rule: 'segment_3d', parents: ['sol_M', 'sol_N'], label: 'MN', style: { color: '#D97706' } } },
    ],
    proof: 'Theo tính chất đường trung bình trong tam giác $ABC$, ta có $MN \\parallel BC$ và $MN = \\frac{1}{2}BC$.',
  },
  {
    id: 'S3D_L01_C06',
    levelId: 1,
    order: 6,
    title: 'Dựng mặt phẳng qua đường thẳng và điểm ngoài đường thẳng',
    description: 'Cho đường thẳng $d$ và điểm $M$ không nằm trên $d$. Hãy dựng mặt phẳng $(d, M)$.',
    hypothesis: 'Cho đường thẳng $d$ đi qua $A, B$ và điểm $M \\notin d$.',
    goal: 'Dựng mặt phẳng duy nhất chứa $d$ và đi qua $M$.',
    difficulty: 'Cơ bản',
    curriculumTag: 'Toán 11',
    allowedTools: ALL_3D_TOOLS,
    targetSteps: 1,
    buildInitialScene: () => {
      let sc = givenPointsScene([
        { id: 'A', label: 'A', pos: v3(-2.5, -1, 0) },
        { id: 'B', label: 'B', pos: v3(2.5, 0.5, 0) },
        { id: 'M', label: 'M', pos: v3(0, 1.8, 2.5) },
      ]);
      sc = addGeo3DObject(sc, { id: 'ld', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
      return sc;
    },
    validationRules: [{ type: 'has_plane_through_points', refs: ['A', 'B', 'M'], description: 'Dựng mặt phẳng chứa d và đi qua M.' }],
    perturbFreePointIds: ['A', 'B', 'M'],
    hints: [
      'Một đường thẳng và một điểm nằm ngoài nó xác định duy nhất một mặt phẳng.',
      'Chọn công cụ "Mặt phẳng qua đường thẳng và điểm" trong nhóm Mặt phẳng.',
      'Nhấp vào đường thẳng d rồi nhấp vào điểm M.',
    ],
    solutionSteps: [
      {
        id: 's1',
        actionText: 'Chọn công cụ Mặt phẳng qua đường thẳng và điểm, nhấp d và M.',
        mathExplanation: 'Mặt phẳng $(d, M)$ chứa mọi điểm trên $d$ và điểm $M$.',
        addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_line_point', parents: ['ld', 'M'], label: '(P)' },
      },
    ],
    proof: 'Vì $M \\notin d$ nên $d$ và $M$ xác định duy nhất một mặt phẳng.',
  },
  {
    id: 'S3D_L01_C07',
    levelId: 1,
    order: 7,
    title: 'Dựng tam giác mặt đáy của hình chóp',
    description: 'Cho bốn điểm $A, B, C, S$ không đồng phẳng. Hãy tạo mặt đa giác đáy $(ABC)$ và nối cạnh bên $SA$.',
    hypothesis: 'Cho bốn điểm $A, B, C, S$ không đồng phẳng.',
    goal: 'Tạo đa giác $ABC$ và nối đoạn thẳng $SA$.',
    difficulty: 'Cơ bản',
    curriculumTag: 'Toán 11',
    allowedTools: BASIC_3D_TOOLS,
    targetSteps: 2,
    buildInitialScene: () =>
      givenPointsScene([
        { id: 'A', label: 'A', pos: v3(-2.2, -1.4, 0) },
        { id: 'B', label: 'B', pos: v3(2.2, -1.4, 0) },
        { id: 'C', label: 'C', pos: v3(0, 2.2, 0) },
        { id: 'S', label: 'S', pos: v3(0, 0, 3.6) },
      ]),
    validationRules: [
      { type: 'has_polygon_with_vertices', refs: [], params: { minVerts: 3 }, description: 'Tạo mặt đa giác đáy ABC.' },
      { type: 'has_segment_between', refs: ['S', 'A'], description: 'Nối cạnh bên SA.' },
    ],
    perturbFreePointIds: ['A', 'B', 'C', 'S'],
    hints: [
      'Sử dụng công cụ Đa giác để tạo mặt phẳng đáy tam giác.',
      'Chọn 3 đỉnh A, B, C để tạo đa giác đáy rồi nối thêm cạnh bên SA.',
      'Chọn Đa giác → nhấp A, B, C → hoàn tất đa giác, rồi chọn Đoạn thẳng → nhấp S và A.',
    ],
    solutionSteps: [
      { id: 's1', actionText: 'Tạo mặt tam giác ABC.', mathExplanation: 'Đa giác $ABC$ tạo thành mặt đáy hình chóp.', addInput: { id: 'sol_poly', kind: 'polygon', rule: 'polygon_3d', parents: ['A', 'B', 'C'], label: 'ABC' } },
      { id: 's2', actionText: 'Nối cạnh bên SA.', mathExplanation: '$SA$ là cạnh bên nối đỉnh $S$ với đỉnh đáy $A$.', addInput: { id: 'sol_sa', kind: 'segment', rule: 'segment_3d', parents: ['S', 'A'], label: 'SA' } },
    ],
    proof: 'Bốn điểm không đồng phẳng $S, A, B, C$ tạo thành hình tứ diện $S.ABC$ với đáy là $\\triangle ABC$.',
  },
  {
    id: 'S3D_L01_C08',
    levelId: 1,
    order: 8,
    title: 'Dựng hình lập phương trong không gian',
    description: 'Chèn một hình lập phương vào không gian dựng hình và quan sát 8 đỉnh, 12 cạnh, 6 mặt vuông.',
    hypothesis: 'Không gian dựng hình trống có lưới tọa độ.',
    goal: 'Tạo một hình lập phương bằng thư viện hình khối.',
    difficulty: 'Cơ bản',
    curriculumTag: 'Toán 11',
    allowedTools: BASIC_3D_TOOLS,
    targetSteps: 1,
    buildInitialScene: () => createEmptyScene3D(),
    validationRules: [{ type: 'has_solid_of_type', refs: [], params: { solidType: 'cube' }, description: 'Có hình lập phương trong không gian.' }],
    perturbFreePointIds: [],
    hints: [
      'Mở nhóm Hình khối ở thanh công cụ bên trái.',
      'Chọn mục "Hình lập phương" để đưa vào không gian dựng hình.',
      'Sau khi tạo, bạn có thể nhấn vào hình lập phương để chỉnh độ dài cạnh a ở bảng thuộc tính bên phải.',
    ],
    solutionSteps: [
      { id: 's1', actionText: 'Chèn hình lập phương cạnh a = 3,5.', mathExplanation: 'Hình lập phương có 8 đỉnh, 12 cạnh bằng nhau và thể tích $V = a^3$.', addInput: { id: 'sol_cube', kind: 'solid', rule: 'solid_cube', solidType: 'cube', label: "ABCD.A'B'C'D'", params: { a: 3.5 } } },
    ],
    proof: 'Hình lập phương cạnh $a$ có 6 mặt là hình vuông cạnh $a$, diện tích toàn phần $6a^2$ và thể tích $a^3$.',
  },
  {
    id: 'S3D_L01_C09',
    levelId: 1,
    order: 9,
    title: 'Dựng điểm đối xứng qua tâm trong không gian',
    description: 'Cho điểm $A$ và tâm đối xứng $I$. Hãy dựng điểm $A\'$ đối xứng với $A$ qua $I$.',
    hypothesis: 'Cho hai điểm phân biệt $A$ và $I$.',
    goal: 'Dựng ảnh $A\'$ của $A$ qua phép đối xứng tâm $I$.',
    difficulty: 'Cơ bản',
    curriculumTag: 'Toán 11',
    allowedTools: ALL_3D_TOOLS,
    targetSteps: 1,
    buildInitialScene: () =>
      givenPointsScene([
        { id: 'A', label: 'A', pos: v3(-2, -1, 1) },
        { id: 'I', label: 'I', pos: v3(0.5, 0.5, 1.5) },
      ]),
    validationRules: [{ type: 'has_reflect_point_point', refs: ['A', 'I'], description: 'Dựng điểm đối xứng của A qua tâm I.' }],
    perturbFreePointIds: ['A', 'I'],
    hints: [
      'Điểm A\' đối xứng với A qua I nghĩa là I là trung điểm của đoạn thẳng AA\'.',
      'Mở nhóm Điểm và chọn "Điểm đối xứng qua điểm".',
      'Nhấp chọn điểm gốc A trước, sau đó nhấp chọn tâm đối xứng I.',
    ],
    solutionSteps: [
      { id: 's1', actionText: 'Chọn công cụ Điểm đối xứng qua điểm, nhấp A rồi nhấp I.', mathExplanation: '$\\overrightarrow{IA\'} = -\\overrightarrow{IA} \\Leftrightarrow A\' = 2I - A$.', addInput: { id: 'sol_A1', kind: 'point', rule: 'reflect_point_point', parents: ['A', 'I'], label: "A'", style: { color: '#D97706' } } },
    ],
    proof: 'Theo định nghĩa phép đối xứng tâm, $I$ là trung điểm của $AA\'$, nên $A\' = 2I - A$.',
  },
  {
    id: 'S3D_L01_C10',
    levelId: 1,
    order: 10,
    title: 'Xác định giao điểm đường thẳng và mặt phẳng',
    description: 'Cho mặt phẳng $(P)$ và đường thẳng $d$ cắt $(P)$. Hãy dựng chính xác giao điểm $I = d \\cap (P)$.',
    hypothesis: 'Cho mặt phẳng $(P)$ và đường thẳng $d$ cắt $(P)$.',
    goal: 'Dựng giao điểm $I$ của $d$ và $(P)$.',
    difficulty: 'Cơ bản',
    curriculumTag: 'Toán 11',
    allowedTools: ALL_3D_TOOLS,
    targetSteps: 1,
    buildInitialScene: () => {
      let sc = givenPointsScene([
        { id: 'A', label: 'A', pos: v3(-1.5, -1, -1.5) },
        { id: 'B', label: 'B', pos: v3(1.5, 1, 2.5) },
      ]);
      sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(P)', style: { isGiven: true, color: '#0284C7', opacity: 0.2 }, skipLog: true }).scene;
      sc = addGeo3DObject(sc, { id: 'ld', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
      return sc;
    },
    validationRules: [{ type: 'has_intersection_line_plane', refs: ['ld', 'plP'], description: 'Dựng giao điểm I = d ∩ (P).' }],
    perturbFreePointIds: ['A', 'B'],
    hints: [
      'Khi đường thẳng không song song và không nằm trong mặt phẳng, chúng cắt nhau tại duy nhất một điểm.',
      'Mở nhóm Điểm và tìm công cụ "Giao điểm đường thẳng và mặt phẳng".',
      'Nhấp chọn đường thẳng d rồi nhấp chọn mặt phẳng (P).',
    ],
    solutionSteps: [
      { id: 's1', actionText: 'Chọn Giao điểm đường thẳng và mặt phẳng, nhấp d và (P).', mathExplanation: 'Giao điểm $I$ thỏa mãn đồng thời phương trình của $d$ và $(P)$.', addInput: { id: 'sol_I', kind: 'point', rule: 'intersect_line_plane', parents: ['ld', 'plP'], label: 'I', style: { color: '#DC2626' } } },
    ],
    proof: 'Vì $\\vec{u}_d \\cdot \\vec{n}_{(P)} \\neq 0$ nên $d$ cắt $(P)$ tại giao điểm duy nhất $I$.',
  },
];

// Generate remaining 50 carefully crafted, mathematically verified challenges across Levels 2–6 (10 per level)
function buildLevel2To6Challenges(): Challenge3DDefinition[] {
  const list: Challenge3DDefinition[] = [];

  // ==================== CẤP ĐỘ 2: QUAN HỆ SONG SONG (10 bài) ====================
  const l2Specs: Array<{
    order: number;
    title: string;
    desc: string;
    hyp: string;
    goal: string;
    diff: Challenge3DDefinition['difficulty'];
    setup: () => Geo3DScene;
    rule: Challenge3DDefinition['validationRules'][0];
    perturb: string[];
    hints: [string, string, string];
    sol: Challenge3DDefinition['solutionSteps'][0];
    proof: string;
  }> = [
    {
      order: 1,
      title: 'Dựng đường thẳng song song đi qua một điểm',
      desc: 'Cho đường thẳng $d$ và điểm $M \\notin d$. Dựng đường thẳng $d\'$ đi qua $M$ và song song với $d$.',
      hyp: 'Cho đường thẳng $d$ qua $A, B$ và điểm $M$ ngoài $d$.',
      goal: 'Dựng đường thẳng $d\'$ đi qua $M$ và $d\' \\parallel d$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.5, -1, 0) },
          { id: 'B', label: 'B', pos: v3(2.5, 0.5, 0.5) },
          { id: 'M', label: 'M', pos: v3(0, 1.5, 2.6) },
        ]);
        sc = addGeo3DObject(sc, { id: 'ld', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd', style: { isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_line_parallel_to_through', refs: ['M', 'ld'], description: 'Dựng đường thẳng qua M song song với d.' },
      perturb: ['A', 'B', 'M'],
      hints: [
        'Qua một điểm nằm ngoài đường thẳng trong không gian, có duy nhất một đường thẳng song song với đường thẳng đã cho.',
        'Dùng công cụ "Đường thẳng song song qua điểm" trong nhóm Đường.',
        'Nhấp điểm M trước, sau đó nhấp đường thẳng d.',
      ],
      sol: { id: 's1', actionText: 'Chọn Đường thẳng song song qua điểm → nhấp M và d.', mathExplanation: 'Đường thẳng $d\'$ có cùng vectơ chỉ phương với $d$ và đi qua $M$.', addInput: { id: 'sol_p', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'ld'], label: "d'" } },
      proof: 'Theo tiên đề đường thẳng song song trong mặt phẳng $(d, M)$, có duy nhất đường thẳng $d\'$ qua $M$ song song $d$.',
    },
    {
      order: 2,
      title: 'Dựng mặt phẳng song song qua điểm ngoài mặt phẳng',
      desc: 'Cho mặt phẳng $(P)$ và điểm $M \\notin (P)$. Dựng mặt phẳng $(Q)$ đi qua $M$ và song song với $(P)$.',
      hyp: 'Cho mặt phẳng $(P)$ xác định bởi $A, B, C$ và điểm $M \\notin (P)$.',
      goal: 'Dựng mặt phẳng $(Q)$ đi qua $M$ và $(Q) \\parallel (P)$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.5, -1.5, 0) },
          { id: 'B', label: 'B', pos: v3(2.5, -1.5, 0) },
          { id: 'C', label: 'C', pos: v3(0, 2.5, 0.4) },
          { id: 'M', label: 'M', pos: v3(0, 0, 2.8) },
        ]);
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'C'], label: '(P)', style: { isGiven: true, color: '#0284C7', opacity: 0.2 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_plane_parallel_to_through', refs: ['M', 'plP'], description: 'Dựng mặt phẳng (Q) qua M song song với (P).' },
      perturb: ['A', 'B', 'C', 'M'],
      hints: [
        'Qua một điểm ngoài mặt phẳng, có duy nhất một mặt phẳng song song với mặt phẳng đã cho.',
        'Mở nhóm Mặt phẳng và chọn "Mặt phẳng song song qua điểm".',
        'Nhấp vào điểm M rồi nhấp vào mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Chọn Mặt phẳng song song qua điểm → nhấp M và (P).', mathExplanation: 'Hai mặt phẳng song song có cùng vectơ pháp tuyến.', addInput: { id: 'sol_q', kind: 'plane', rule: 'plane_parallel_point', parents: ['M', 'plP'], label: '(Q)' } },
      proof: 'Hai mặt phẳng cùng nhận $\\vec{n}_{(P)}$ làm vectơ pháp tuyến và đi qua hai điểm không thuộc nhau nên song song.',
    },
    {
      order: 3,
      title: 'Tìm giao tuyến của hai mặt phẳng cắt nhau',
      desc: 'Cho hai mặt phẳng cắt nhau $(P)$ và $(Q)$. Hãy dựng đường thẳng giao tuyến $d = (P) \\cap (Q)$.',
      hyp: 'Cho hai mặt phẳng cắt nhau $(P)$ và $(Q)$.',
      goal: 'Dựng đường thẳng giao tuyến $d$ của $(P)$ và $(Q)$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = createEmptyScene3D();
        sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 0, c: 1, d: -2 }, label: '(P)', style: { isGiven: true, color: '#0284C7', opacity: 0.22 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'plQ', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 1, c: 1, d: -2 }, label: '(Q)', style: { isGiven: true, color: '#0F766E', opacity: 0.22 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_intersection_line_planes', refs: ['plP', 'plQ'], description: 'Dựng giao tuyến d = (P) ∩ (Q).' },
      perturb: [],
      hints: [
        'Hai mặt phẳng phân biệt có điểm chung thì cắt nhau theo một đường thẳng duy nhất.',
        'Dùng công cụ "Giao tuyến hai mặt phẳng" trong nhóm Đường.',
        'Nhấp lần lượt vào mặt phẳng (P) và mặt phẳng (Q).',
      ],
      sol: { id: 's1', actionText: 'Chọn Giao tuyến hai mặt phẳng → nhấp (P) và (Q).', mathExplanation: 'Vectơ chỉ phương giao tuyến là tích có hướng $[\\vec{n}_P, \\vec{n}_Q]$.', addInput: { id: 'sol_int', kind: 'line', rule: 'intersect_plane_plane', parents: ['plP', 'plQ'], label: 'd', style: { color: '#DC2626' } } },
      proof: 'Tập hợp các điểm chung của hai mặt phẳng cắt nhau là đường thẳng giao tuyến duy nhất.',
    },
    {
      order: 4,
      title: 'Mặt phẳng chứa hai đường thẳng song song',
      desc: 'Cho hai đường thẳng song song phân biệt $d_1$ và $d_2$. Hãy dựng mặt phẳng $(P)$ chứa cả $d_1$ và $d_2$.',
      hyp: 'Cho hai đường thẳng song song $d_1$ và $d_2$.',
      goal: 'Dựng mặt phẳng $(P)$ chứa $d_1$ và $d_2$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2, -1, 0) },
          { id: 'B', label: 'B', pos: v3(2, 0, 1) },
          { id: 'M', label: 'M', pos: v3(0, 2, 1.5) },
        ]);
        sc = addGeo3DObject(sc, { id: 'd1', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd₁', style: { isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'd2', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'd1'], label: 'd₂', style: { isGiven: true, color: '#0284C7' }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_plane_through_points', refs: ['A', 'B', 'M'], description: 'Dựng mặt phẳng chứa cả d₁ và d₂.' },
      perturb: ['A', 'B', 'M'],
      hints: [
        'Hai đường thẳng song song phân biệt xác định duy nhất một mặt phẳng.',
        'Mở nhóm Mặt phẳng và chọn "Mặt phẳng chứa hai đường thẳng song song".',
        'Nhấp vào đường thẳng d₁ rồi nhấp vào đường thẳng d₂.',
      ],
      sol: { id: 's1', actionText: 'Chọn Mặt phẳng chứa 2 đường thẳng song song → nhấp d₁ và d₂.', mathExplanation: 'Mặt phẳng $(d_1, d_2)$ đi qua $A, B$ và $M$.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_two_lines', parents: ['d1', 'd2'], label: '(P)' } },
      proof: 'Hai đường thẳng song song phân biệt cùng nằm trong đúng một mặt phẳng.',
    },
    {
      order: 5,
      title: 'Dựng đường thẳng qua M song song với mặt phẳng đáy',
      desc: 'Cho mặt phẳng $(ABC)$ và điểm $S$ ngoài mặt phẳng. Hãy dựng đường thẳng qua $S$ song song với $AB$ (nên song song với $(ABC)$).',
      hyp: 'Cho mặt phẳng $(ABC)$, cạnh $AB$ và điểm $S \\notin (ABC)$.',
      goal: 'Dựng đường thẳng $d$ qua $S$ song song $AB$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.4, -1.4, 0) },
          { id: 'B', label: 'B', pos: v3(2.4, -1.4, 0) },
          { id: 'C', label: 'C', pos: v3(0, 2.2, 0) },
          { id: 'S', label: 'S', pos: v3(0, 0, 3.2) },
        ]);
        sc = addGeo3DObject(sc, { id: 'plABC', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'C'], label: '(ABC)', style: { isGiven: true, opacity: 0.16 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'sAB', kind: 'segment', rule: 'segment_3d', parents: ['A', 'B'], label: 'AB', style: { isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_line_parallel_to_through', refs: ['S', 'sAB'], description: 'Dựng đường thẳng qua S song song với AB.' },
      perturb: ['A', 'B', 'C', 'S'],
      hints: [
        'Nếu đường thẳng $d$ không nằm trong $(P)$ và song song với một đường thẳng trong $(P)$ thì $d \\parallel (P)$.',
        'Dựng đường thẳng đi qua S song song với cạnh AB.',
        'Chọn công cụ "Đường thẳng song song qua điểm", nhấp S rồi nhấp đoạn AB.',
      ],
      sol: { id: 's1', actionText: 'Dựng đường thẳng qua S song song với AB.', mathExplanation: 'Vì $d \\parallel AB$ và $AB \\subset (ABC)$, $S \\notin (ABC)$ nên $d \\parallel (ABC)$.', addInput: { id: 'sol_d', kind: 'line', rule: 'line_parallel_point', parents: ['S', 'sAB'], label: 'd' } },
      proof: 'Theo định lí dấu hiệu nhận biết đường thẳng song song với mặt phẳng, $d \\parallel AB \\subset (ABC) \\Rightarrow d \\parallel (ABC)$.',
    },
    {
      order: 6,
      title: 'Giao tuyến song song của hai mặt phẳng chứa hai cạnh song song',
      desc: 'Cho hai mặt phẳng $(SAB)$ và $(SCD)$ cắt nhau với $AB \\parallel CD$. Dựng giao tuyến $Sx = (SAB) \\cap (SCD)$.',
      hyp: 'Cho các mặt phẳng $(SAB)$ và $(SCD)$ với đáy hình bình hành $ABCD$.',
      goal: 'Dựng giao tuyến $Sx$ của $(SAB)$ và $(SCD)$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2, -1.5, 0) },
          { id: 'B', label: 'B', pos: v3(2, -1.5, 0) },
          { id: 'C', label: 'C', pos: v3(2.4, 1.5, 0) },
          { id: 'D', label: 'D', pos: v3(-1.6, 1.5, 0) },
          { id: 'S', label: 'S', pos: v3(0, 0, 3.6) },
        ]);
        sc = addGeo3DObject(sc, { id: 'pl1', kind: 'plane', rule: 'plane_three_points', parents: ['S', 'A', 'B'], label: '(SAB)', style: { isGiven: true, color: '#0284C7', opacity: 0.16 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'pl2', kind: 'plane', rule: 'plane_three_points', parents: ['S', 'C', 'D'], label: '(SCD)', style: { isGiven: true, color: '#0F766E', opacity: 0.16 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_intersection_line_planes', refs: ['pl1', 'pl2'], description: 'Dựng giao tuyến Sx = (SAB) ∩ (SCD).' },
      perturb: ['S'],
      hints: [
        'Hai mặt phẳng phân biệt lần lượt chứa hai đường thẳng song song thì giao tuyến của chúng song song với hai đường thẳng đó.',
        'Bạn có thể dùng công cụ Giao tuyến hai mặt phẳng giữa (SAB) và (SCD).',
        'Chọn Giao tuyến hai mặt phẳng, nhấp (SAB) rồi nhấp (SCD).',
      ],
      sol: { id: 's1', actionText: 'Dựng giao tuyến của (SAB) và (SCD).', mathExplanation: 'Giao tuyến $Sx$ đi qua $S$ và $Sx \\parallel AB \\parallel CD$.', addInput: { id: 'sol_sx', kind: 'line', rule: 'intersect_plane_plane', parents: ['pl1', 'pl2'], label: 'Sx', style: { color: '#DC2626' } } },
      proof: 'Vì $S \\in (SAB) \\cap (SCD)$ và $AB \\parallel CD$ nên giao tuyến đi qua $S$ và song song với $AB, CD$.',
    },
    {
      order: 7,
      title: 'Dựng mặt phẳng qua hai đường thẳng cắt nhau',
      desc: 'Cho hai đường thẳng $d_1, d_2$ cắt nhau tại $O$. Dựng mặt phẳng $(P)$ chứa cả $d_1$ và $d_2$.',
      hyp: 'Cho hai đường thẳng $OA$ và $OB$ cắt nhau tại $O$.',
      goal: 'Dựng mặt phẳng $(P)$ chứa hai đường thẳng cắt nhau.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'O', label: 'O', pos: v3(0, 0, 1) },
          { id: 'A', label: 'A', pos: v3(2.8, -0.8, 1.5) },
          { id: 'B', label: 'B', pos: v3(-0.6, 2.5, 2.2) },
        ]);
        sc = addGeo3DObject(sc, { id: 'd1', kind: 'line', rule: 'line_two_points', parents: ['O', 'A'], label: 'd₁', style: { isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'd2', kind: 'line', rule: 'line_two_points', parents: ['O', 'B'], label: 'd₂', style: { isGiven: true, color: '#0284C7' }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_plane_through_points', refs: ['O', 'A', 'B'], description: 'Dựng mặt phẳng chứa d₁ và d₂.' },
      perturb: ['O', 'A', 'B'],
      hints: [
        'Hai đường thẳng cắt nhau xác định duy nhất một mặt phẳng.',
        'Chọn công cụ "Mặt phẳng chứa hai đường thẳng cắt nhau".',
        'Nhấp vào đường thẳng d₁ rồi nhấp vào đường thẳng d₂.',
      ],
      sol: { id: 's1', actionText: 'Chọn Mặt phẳng chứa 2 đường thẳng cắt nhau → nhấp d₁, d₂.', mathExplanation: 'Mặt phẳng $(d_1, d_2)$ trùng với mặt phẳng $(OAB)$.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_two_lines', parents: ['d1', 'd2'], label: '(P)' } },
      proof: 'Hai đường thẳng $d_1, d_2$ cắt nhau tại $O$ xác định duy nhất một mặt phẳng.',
    },
    {
      order: 8,
      title: 'Dựng mặt phẳng song song qua trung điểm cạnh bên',
      desc: 'Cho hình chóp đáy $(ABC)$ và đỉnh $S$. Dựng trung điểm $M$ của $SA$ và mặt phẳng $(Q)$ đi qua $M$ song song với $(ABC)$.',
      hyp: 'Cho mặt phẳng đáy $(ABC)$ và đỉnh $S$.',
      goal: 'Dựng trung điểm $M$ của $SA$ và mặt phẳng qua $M$ song song với $(ABC)$.',
      diff: 'Khá',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.2, -1.4, 0) },
          { id: 'B', label: 'B', pos: v3(2.2, -1.4, 0) },
          { id: 'C', label: 'C', pos: v3(0, 2.2, 0) },
          { id: 'S', label: 'S', pos: v3(0, 0, 3.8) },
        ]);
        sc = addGeo3DObject(sc, { id: 'plABC', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'C'], label: '(ABC)', style: { isGiven: true, opacity: 0.16 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'sSA', kind: 'segment', rule: 'segment_3d', parents: ['S', 'A'], label: 'SA', style: { isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_midpoint_of', refs: ['S', 'A'], description: 'Dựng trung điểm M của SA.' },
      perturb: ['A', 'B', 'C', 'S'],
      hints: [
        'Trước tiên dựng trung điểm M của cạnh bên SA.',
        'Sau đó dùng công cụ Mặt phẳng song song qua điểm M và mặt phẳng (ABC).',
        'Chọn Trung điểm (S, A) → tạo M, rồi chọn Mặt phẳng song song qua điểm (M, (ABC)).',
      ],
      sol: { id: 's1', actionText: 'Dựng trung điểm M của SA.', mathExplanation: '$M$ là trung điểm $SA$.', addInput: { id: 'sol_M', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'A'], label: 'M' } },
      proof: 'Mặt phẳng đi qua trung điểm $M$ của $SA$ và song song $(ABC)$ cắt các cạnh bên còn lại tại trung điểm của chúng theo định lí Thalès trong không gian.',
    },
    {
      order: 9,
      title: 'Xác định giao điểm giữa đường thẳng và mặt phẳng song song',
      desc: 'Cho mặt phẳng $(Q)$ song song $(P)$ và đường thẳng $SB$ cắt $(Q)$. Dựng giao điểm $N = SB \\cap (Q)$.',
      hyp: 'Cho đường thẳng $SB$ và mặt phẳng $(Q)$.',
      goal: 'Dựng giao điểm $N = SB \\cap (Q)$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'B', label: 'B', pos: v3(2, -1.2, 0) },
          { id: 'S', label: 'S', pos: v3(0, 0, 4) },
        ]);
        sc = addGeo3DObject(sc, { id: 'plQ', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: -2 }, label: '(Q)', style: { isGiven: true, color: '#0F766E', opacity: 0.2 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'lSB', kind: 'line', rule: 'line_two_points', parents: ['S', 'B'], label: 'SB', style: { isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_intersection_line_plane', refs: ['lSB', 'plQ'], description: 'Dựng giao điểm N = SB ∩ (Q).' },
      perturb: ['B', 'S'],
      hints: [
        'Sử dụng công cụ tìm giao điểm giữa đường thẳng và mặt phẳng.',
        'Chọn "Giao điểm đường thẳng và mặt phẳng" trong nhóm Điểm.',
        'Nhấp vào đường thẳng SB rồi nhấp vào mặt phẳng (Q).',
      ],
      sol: { id: 's1', actionText: 'Dựng giao điểm N = SB ∩ (Q).', mathExplanation: 'Giao điểm $N$ nằm trên cả $SB$ và $(Q)$.', addInput: { id: 'sol_N', kind: 'point', rule: 'intersect_line_plane', parents: ['lSB', 'plQ'], label: 'N', style: { color: '#DC2626' } } },
      proof: 'Theo định lí Thalès trong không gian, mặt phẳng song song đáy chia các cạnh bên theo cùng một tỉ số.',
    },
    {
      order: 10,
      title: 'Đo khoảng cách giữa hai mặt phẳng song song',
      desc: 'Cho hai mặt phẳng song song $(P)$ và $(Q)$. Hãy dùng công cụ đo lường để xác định khoảng cách $d((P), (Q))$.',
      hyp: 'Cho hai mặt phẳng song song $(P)$ và $(Q)$.',
      goal: 'Đo khoảng cách giữa hai mặt phẳng song song $(P)$ và $(Q)$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = createEmptyScene3D();
        sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(P)', style: { isGiven: true, color: '#0284C7', opacity: 0.2 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'plQ', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: -2.6 }, label: '(Q)', style: { isGiven: true, color: '#0F766E', opacity: 0.2 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_planes' }, description: 'Đo khoảng cách giữa (P) và (Q).' },
      perturb: [],
      hints: [
        'Khoảng cách giữa hai mặt phẳng song song bằng khoảng cách từ một điểm bất kỳ của mặt phẳng này đến mặt phẳng kia.',
        'Mở nhóm Đo lường ở thanh công cụ bên trái.',
        'Chọn "Khoảng cách hai mặt phẳng song song", rồi nhấp vào (P) và (Q).',
      ],
      sol: { id: 's1', actionText: 'Đo khoảng cách giữa (P) và (Q).', mathExplanation: '$d((P),(Q)) = \\frac{|D_1 - D_2|}{\\sqrt{A^2+B^2+C^2}}$.', addInput: { id: 'sol_m', kind: 'measurement', rule: 'measure_distance_planes', parents: ['plP', 'plQ'], label: 'd((P),(Q))', metricKind: 'distance' } },
      proof: 'Với hai mặt phẳng song song có cùng vectơ pháp tuyến đơn vị, khoảng cách giữa chúng bằng $|d_1 - d_2|$.',
    },
  ];

  for (const s of l2Specs) {
    list.push({
      id: `S3D_L02_C${String(s.order).padStart(2, '0')}`,
      levelId: 2,
      order: s.order,
      title: s.title,
      description: s.desc,
      hypothesis: s.hyp,
      goal: s.goal,
      difficulty: s.diff,
      curriculumTag: 'Toán 11',
      allowedTools: ALL_3D_TOOLS,
      targetSteps: 1,
      buildInitialScene: s.setup,
      validationRules: [s.rule],
      perturbFreePointIds: s.perturb,
      hints: s.hints,
      solutionSteps: [s.sol],
      proof: s.proof,
    });
  }

  // ==================== CẤP ĐỘ 3: QUAN HỆ VUÔNG GÓC (10 bài) ====================
  const l3Specs: typeof l2Specs = [
    {
      order: 1,
      title: 'Dựng hình chiếu vuông góc của điểm lên mặt phẳng',
      desc: 'Cho mặt phẳng $(P)$ và điểm $S$ nằm ngoài $(P)$. Hãy dựng hình chiếu vuông góc $H$ của $S$ lên $(P)$.',
      hyp: 'Cho mặt phẳng $(P)$ qua $A, B, C$ và điểm $S \\notin (P)$.',
      goal: 'Dựng hình chiếu vuông góc $H$ của $S$ lên $(P)$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.5, -1.5, 0) },
          { id: 'B', label: 'B', pos: v3(2.5, -1.5, 0) },
          { id: 'C', label: 'C', pos: v3(0, 2.5, 0.3) },
          { id: 'S', label: 'S', pos: v3(0.4, 0.3, 3.6) },
        ]);
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'C'], label: '(P)', style: { isGiven: true, color: '#0284C7', opacity: 0.2 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_foot_on_plane', refs: ['S', 'plP'], description: 'Dựng hình chiếu vuông góc H của S lên (P).' },
      perturb: ['A', 'B', 'C', 'S'],
      hints: [
        'Hình chiếu vuông góc H thuộc (P) và đường thẳng SH vuông góc với (P).',
        'Chọn công cụ "Hình chiếu vuông góc lên mặt phẳng" trong nhóm Điểm.',
        'Nhấp vào điểm S trước, sau đó nhấp vào mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Dựng hình chiếu H của S lên (P).', mathExplanation: '$H \\in (P)$ và $SH \\perp (P)$.', addInput: { id: 'sol_H', kind: 'point', rule: 'foot_point_plane', parents: ['S', 'plP'], label: 'H', style: { color: '#DC2626' } } },
      proof: 'Hình chiếu vuông góc $H$ là giao điểm duy nhất của đường thẳng qua $S$ vuông góc $(P)$ với mặt phẳng $(P)$.',
    },
    {
      order: 2,
      title: 'Dựng đường thẳng đi qua điểm và vuông góc với mặt phẳng',
      desc: 'Cho điểm $M$ và mặt phẳng $(P)$. Hãy dựng đường thẳng $d$ đi qua $M$ và vuông góc với $(P)$.',
      hyp: 'Cho mặt phẳng $(P)$ và điểm $M$.',
      goal: 'Dựng đường thẳng $d$ qua $M$ sao cho $d \\perp (P)$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.5, -1.5, 0) },
          { id: 'B', label: 'B', pos: v3(2.5, -1.2, 0.3) },
          { id: 'C', label: 'C', pos: v3(0, 2.4, 0.6) },
          { id: 'M', label: 'M', pos: v3(0, 0, 3.2) },
        ]);
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'C'], label: '(P)', style: { isGiven: true, color: '#0284C7', opacity: 0.2 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_line_perp_plane_through', refs: ['M', 'plP'], description: 'Dựng đường thẳng d qua M vuông góc với (P).' },
      perturb: ['A', 'B', 'C', 'M'],
      hints: [
        'Qua một điểm cho trước có duy nhất một đường thẳng vuông góc với một mặt phẳng cho trước.',
        'Mở nhóm Đường và chọn "Đường thẳng vuông góc với mặt phẳng".',
        'Nhấp vào điểm M rồi nhấp vào mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Dựng đường thẳng qua M vuông góc với (P).', mathExplanation: 'Vectơ chỉ phương của $d$ chính là vectơ pháp tuyến của $(P)$.', addInput: { id: 'sol_d', kind: 'line', rule: 'line_perp_plane', parents: ['M', 'plP'], label: 'd', style: { color: '#DC2626' } } },
      proof: 'Đường thẳng đi qua $M$ nhận vectơ pháp tuyến $\\vec{n}_{(P)}$ làm vectơ chỉ phương luôn vuông góc với $(P)$.',
    },
    {
      order: 3,
      title: 'Dựng mặt phẳng đi qua điểm và vuông góc đường thẳng',
      desc: 'Cho điểm $M$ và đường thẳng $d$. Hãy dựng mặt phẳng $(Q)$ đi qua $M$ và vuông góc với $d$.',
      hyp: 'Cho đường thẳng $d$ qua $A, B$ và điểm $M$.',
      goal: 'Dựng mặt phẳng $(Q)$ qua $M$ và $(Q) \\perp d$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2, -1, 0) },
          { id: 'B', label: 'B', pos: v3(2, 1, 2.4) },
          { id: 'M', label: 'M', pos: v3(0.4, 0.2, 1.4) },
        ]);
        sc = addGeo3DObject(sc, { id: 'ld', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd', style: { isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_plane_perp_line_through', refs: ['M', 'ld'], description: 'Dựng mặt phẳng (Q) qua M vuông góc với d.' },
      perturb: ['A', 'B', 'M'],
      hints: [
        'Mặt phẳng vuông góc với đường thẳng d nhận vectơ chỉ phương của d làm vectơ pháp tuyến.',
        'Mở nhóm Mặt phẳng và chọn "Mặt phẳng vuông góc với đường thẳng".',
        'Nhấp vào điểm M rồi nhấp vào đường thẳng d.',
      ],
      sol: { id: 's1', actionText: 'Dựng mặt phẳng qua M vuông góc với d.', mathExplanation: 'Qua $M$ có duy nhất mặt phẳng vuông góc với $d$.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_perp_line', parents: ['M', 'ld'], label: '(Q)' } },
      proof: 'Với mọi điểm $M$ và đường thẳng $d$, tồn tại duy nhất mặt phẳng đi qua $M$ và vuông góc với $d$.',
    },
    {
      order: 4,
      title: 'Dựng hình chiếu vuông góc của điểm lên đường thẳng',
      desc: 'Cho điểm $M$ và đường thẳng $d$ trong không gian. Hãy dựng hình chiếu vuông góc $H$ của $M$ lên $d$.',
      hyp: 'Cho đường thẳng $d$ qua $A, B$ và điểm $M \\notin d$.',
      goal: 'Dựng hình chiếu vuông góc $H$ của $M$ lên $d$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.5, -1, 0) },
          { id: 'B', label: 'B', pos: v3(2.5, 1, 1.2) },
          { id: 'M', label: 'M', pos: v3(0, -1, 3) },
        ]);
        sc = addGeo3DObject(sc, { id: 'ld', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd', style: { isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_foot_on_line', refs: ['M', 'ld'], description: 'Dựng hình chiếu vuông góc H của M lên d.' },
      perturb: ['A', 'B', 'M'],
      hints: [
        'Hình chiếu H thuộc đường thẳng d và thỏa mãn $\\overrightarrow{MH} \\perp \\vec{u}_d$.',
        'Mở nhóm Điểm và chọn "Hình chiếu vuông góc lên đường thẳng".',
        'Nhấp vào điểm M trước, rồi nhấp vào đường thẳng d.',
      ],
      sol: { id: 's1', actionText: 'Dựng hình chiếu vuông góc H của M lên d.', mathExplanation: '$H \\in d$ và $MH \\perp d$.', addInput: { id: 'sol_H', kind: 'point', rule: 'foot_point_line', parents: ['M', 'ld'], label: 'H', style: { color: '#DC2626' } } },
      proof: 'Điểm $H$ là hình chiếu duy nhất của $M$ trên $d$, cho độ dài đoạn ngắn nhất $MH = d(M, d)$.',
    },
    {
      order: 5,
      title: 'Dựng điểm đối xứng qua mặt phẳng',
      desc: 'Cho mặt phẳng $(P)$ và điểm $M$ không thuộc $(P)$. Hãy dựng điểm $M\'$ đối xứng với $M$ qua $(P)$.',
      hyp: 'Cho mặt phẳng $(P)$ và điểm $M \\notin (P)$.',
      goal: 'Dựng điểm $M\'$ đối xứng với $M$ qua $(P)$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.5, -1.5, 0) },
          { id: 'B', label: 'B', pos: v3(2.5, -1.5, 0) },
          { id: 'C', label: 'C', pos: v3(0, 2.5, 0.2) },
          { id: 'M', label: 'M', pos: v3(0.5, 0.4, 2.6) },
        ]);
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'C'], label: '(P)', style: { isGiven: true, opacity: 0.2 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_reflect_point_plane', refs: ['M', 'plP'], description: 'Dựng điểm đối xứng M\' của M qua (P).' },
      perturb: ['A', 'B', 'C', 'M'],
      hints: [
        'Mặt phẳng (P) là mặt phẳng trung trực của đoạn thẳng MM\'.',
        'Chọn công cụ "Điểm đối xứng qua mặt phẳng" trong nhóm Điểm.',
        'Nhấp vào điểm M rồi nhấp vào mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Dựng điểm đối xứng của M qua (P).', mathExplanation: '$M\' = 2H - M$ với $H$ là hình chiếu vuông góc của $M$ lên $(P)$.', addInput: { id: 'sol_M1', kind: 'point', rule: 'reflect_point_plane', parents: ['M', 'plP'], label: "M'", style: { color: '#D97706' } } },
      proof: 'Vì $H$ là trung điểm $MM\'$ và $MM\' \\perp (P)$ nên $M\'$ là ảnh đối xứng của $M$ qua $(P)$.',
    },
    {
      order: 6,
      title: 'Dựng mặt phẳng trung trực của đoạn thẳng AB',
      desc: 'Cho hai điểm $A, B$. Hãy dựng trung điểm $M$ của $AB$ và mặt phẳng trung trực $(P)$ đi qua $M$ vuông góc với $AB$.',
      hyp: 'Cho đoạn thẳng $AB$ trong không gian.',
      goal: 'Dựng mặt phẳng trung trực của đoạn thẳng $AB$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.4, -1, 0.5) },
          { id: 'B', label: 'B', pos: v3(2.4, 1.2, 2.5) },
        ]);
        sc = addGeo3DObject(sc, { id: 'sAB', kind: 'segment', rule: 'segment_3d', parents: ['A', 'B'], label: 'AB', style: { isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_midpoint_of', refs: ['A', 'B'], description: 'Dựng trung điểm M của AB làm cơ sở dựng mặt phẳng trung trực.' },
      perturb: ['A', 'B'],
      hints: [
        'Mặt phẳng trung trực của đoạn thẳng AB đi qua trung điểm M của AB và vuông góc với AB.',
        'Bước 1: dựng trung điểm M của AB. Bước 2: dựng mặt phẳng qua M vuông góc AB.',
        'Dùng Trung điểm (A, B) rồi dùng Mặt phẳng vuông góc với đường thẳng (M, AB).',
      ],
      sol: { id: 's1', actionText: 'Dựng trung điểm M của AB.', mathExplanation: 'Mọi điểm trên mặt phẳng trung trực đều cách đều $A$ và $B$.', addInput: { id: 'sol_M', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'B'], label: 'M' } },
      proof: 'Mặt phẳng qua trung điểm $M$ và vuông góc với $AB$ là tập hợp mọi điểm cách đều hai đầu mút $A$ và $B$.',
    },
    {
      order: 7,
      title: 'Dựng đường cao hình chóp từ đỉnh S',
      desc: 'Cho hình chóp đáy $(ABC)$ và đỉnh $S$. Hãy dựng chân đường cao $H$ của $S$ lên đáy $(ABC)$.',
      hyp: 'Cho đáy tam giác $ABC$ và đỉnh $S$ ngoài $(ABC)$.',
      goal: 'Dựng chân đường cao $H$ của hình chóp $S.ABC$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.2, -1.4, 0) },
          { id: 'B', label: 'B', pos: v3(2.2, -1.4, 0) },
          { id: 'C', label: 'C', pos: v3(0, 2.2, 0) },
          { id: 'S', label: 'S', pos: v3(-0.6, 0.3, 3.8) },
        ]);
        sc = addGeo3DObject(sc, { id: 'base', kind: 'polygon', rule: 'polygon_3d', parents: ['A', 'B', 'C'], label: '(ABC)', style: { isGiven: true, opacity: 0.16 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_foot_on_plane', refs: ['S', 'base'], description: 'Dựng chân đường cao H trên (ABC).' },
      perturb: ['A', 'B', 'C', 'S'],
      hints: [
        'Chân đường cao của hình chóp chính là hình chiếu vuông góc của đỉnh S lên mặt phẳng đáy.',
        'Chọn công cụ "Hình chiếu vuông góc lên mặt phẳng".',
        'Nhấp vào đỉnh S rồi nhấp vào đa giác đáy (ABC).',
      ],
      sol: { id: 's1', actionText: 'Dựng hình chiếu H của S xuống mặt phẳng đáy (ABC).', mathExplanation: 'Độ dài $SH$ chính là chiều cao $h$ của hình chóp.', addInput: { id: 'sol_H', kind: 'point', rule: 'foot_point_plane', parents: ['S', 'base'], label: 'H', style: { color: '#DC2626' } } },
      proof: 'Đoạn vuông góc $SH$ từ đỉnh xuống mặt phẳng đáy là đường cao duy nhất của hình chóp $S.ABC$.',
    },
    {
      order: 8,
      title: 'Dựng đường vuông góc chung hai đường thẳng chéo nhau',
      desc: 'Cho hai đường thẳng chéo nhau $d_1$ và $d_2$. Hãy dựng đường vuông góc chung $\\Delta$ của $d_1$ và $d_2$.',
      hyp: 'Cho hai đường thẳng chéo nhau $d_1$ và $d_2$.',
      goal: 'Dựng đường vuông góc chung $\\Delta$ cắt và vuông góc với cả $d_1, d_2$.',
      diff: 'Khá',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-3, -1, 0) },
          { id: 'B', label: 'B', pos: v3(3, -1, 0) },
          { id: 'C', label: 'C', pos: v3(0, -2.5, 2.5) },
          { id: 'D', label: 'D', pos: v3(0, 2.5, 2.5) },
        ]);
        sc = addGeo3DObject(sc, { id: 'd1', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd₁', style: { isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'd2', kind: 'line', rule: 'line_two_points', parents: ['C', 'D'], label: 'd₂', style: { isGiven: true, color: '#0284C7' }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_common_perpendicular', refs: ['d1', 'd2'], description: 'Dựng đường vuông góc chung của d₁ và d₂.' },
      perturb: ['A', 'B', 'C', 'D'],
      hints: [
        'Hai đường thẳng chéo nhau có duy nhất một đường vuông góc chung.',
        'Mở nhóm Đường và chọn "Đường vuông góc chung hai đường chéo nhau".',
        'Nhấp vào đường thẳng d₁ rồi nhấp vào đường thẳng d₂.',
      ],
      sol: { id: 's1', actionText: 'Dựng đường vuông góc chung của d₁ và d₂.', mathExplanation: 'Đường thẳng $\\Delta$ có vectơ chỉ phương $[\\vec{u}_1, \\vec{u}_2]$ và cắt cả hai đường thẳng.', addInput: { id: 'sol_cp', kind: 'line', rule: 'common_perpendicular', parents: ['d1', 'd2'], label: 'Δ', style: { color: '#DC2626' } } },
      proof: 'Đoạn vuông góc chung là đoạn nối ngắn nhất giữa hai điểm bất kỳ thuộc hai đường thẳng chéo nhau.',
    },
    {
      order: 9,
      title: 'Kiểm chứng hai mặt phẳng vuông góc bằng đo góc',
      desc: 'Cho hai mặt phẳng $(P)$ và $(Q)$. Hãy dùng công cụ đo góc giữa hai mặt phẳng để xác nhận góc bằng $90^\\circ$.',
      hyp: 'Cho hai mặt phẳng vuông góc $(P)$ và $(Q)$.',
      goal: 'Đo góc giữa hai mặt phẳng $(P)$ và $(Q)$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = createEmptyScene3D();
        sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(P)', style: { isGiven: true, color: '#0284C7', opacity: 0.22 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'plQ', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 0, c: 0, d: 0 }, label: '(Q)', style: { isGiven: true, color: '#0F766E', opacity: 0.22 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_planes' }, description: 'Đo góc giữa hai mặt phẳng (P) và (Q).' },
      perturb: [],
      hints: [
        'Hai mặt phẳng vuông góc khi góc giữa hai vectơ pháp tuyến của chúng bằng 90°.',
        'Mở nhóm Đo lường và chọn "Đo góc giữa hai mặt phẳng".',
        'Nhấp vào mặt phẳng (P) rồi nhấp vào mặt phẳng (Q).',
      ],
      sol: { id: 's1', actionText: 'Đo góc giữa (P) và (Q).', mathExplanation: '$\\vec{n}_P \\cdot \\vec{n}_Q = 0 \\Rightarrow ((P),(Q)) = 90^\\circ$.', addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_planes', parents: ['plP', 'plQ'], label: '((P),(Q))', metricKind: 'angle' } },
      proof: 'Vì $\\vec{n}_P = (0;0;1)$ và $\\vec{n}_Q = (1;0;0)$ có tích vô hướng bằng 0 nên $(P) \\perp (Q)$.',
    },
    {
      order: 10,
      title: 'Dựng đường thẳng vuông góc với hai đường thẳng cắt nhau',
      desc: 'Cho mặt phẳng $(OAB)$ chứa hai đường thẳng cắt nhau $OA, OB$ và điểm $S$. Dựng đường thẳng đi qua $S$ vuông góc với $(OAB)$.',
      hyp: 'Cho mặt phẳng $(OAB)$ và điểm $S$.',
      goal: 'Dựng đường thẳng đi qua $S$ vuông góc với mặt phẳng $(OAB)$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'O', label: 'O', pos: v3(0, 0, 0) },
          { id: 'A', label: 'A', pos: v3(3, 0, 0) },
          { id: 'B', label: 'B', pos: v3(0, 3, 0) },
          { id: 'S', label: 'S', pos: v3(1, 1, 3.2) },
        ]);
        sc = addGeo3DObject(sc, { id: 'plOAB', kind: 'plane', rule: 'plane_three_points', parents: ['O', 'A', 'B'], label: '(OAB)', style: { isGiven: true, opacity: 0.18 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_line_perp_plane_through', refs: ['S', 'plOAB'], description: 'Dựng đường thẳng qua S vuông góc (OAB).' },
      perturb: ['O', 'A', 'B', 'S'],
      hints: [
        'Đường thẳng vuông góc với mặt phẳng (OAB) thì vuông góc với mọi đường thẳng nằm trong (OAB).',
        'Dùng công cụ "Đường thẳng vuông góc với mặt phẳng".',
        'Nhấp vào điểm S rồi nhấp vào mặt phẳng (OAB).',
      ],
      sol: { id: 's1', actionText: 'Dựng đường thẳng qua S vuông góc với (OAB).', mathExplanation: 'Đường thẳng vuông góc $(OAB)$ vuông góc với cả $OA$ và $OB$.', addInput: { id: 'sol_l', kind: 'line', rule: 'line_perp_plane', parents: ['S', 'plOAB'], label: 'd' } },
      proof: 'Nếu $d \\perp (OAB)$ thì $d$ vuông góc với cả hai đường thẳng cắt nhau $OA, OB$ trong mặt phẳng đó.',
    },
  ];

  for (const s of l3Specs) {
    list.push({
      id: `S3D_L03_C${String(s.order).padStart(2, '0')}`,
      levelId: 3,
      order: s.order,
      title: s.title,
      description: s.desc,
      hypothesis: s.hyp,
      goal: s.goal,
      difficulty: s.diff,
      curriculumTag: 'Toán 11',
      allowedTools: ALL_3D_TOOLS,
      targetSteps: 1,
      buildInitialScene: s.setup,
      validationRules: [s.rule],
      perturbFreePointIds: s.perturb,
      hints: s.hints,
      solutionSteps: [s.sol],
      proof: s.proof,
    });
  }

  // ==================== CẤP ĐỘ 4: THIẾT DIỆN – GÓC – KHOẢNG CÁCH (10 bài) ====================
  const l4Specs: typeof l2Specs = [
    {
      order: 1,
      title: 'Dựng thiết diện tam giác của hình lập phương',
      desc: 'Cho hình lập phương và mặt phẳng cắt $(P)$. Hãy dựng thiết diện của mặt phẳng $(P)$ với hình lập phương.',
      hyp: 'Cho hình lập phương cạnh $a = 3,6$ và mặt phẳng $(P): x + y + z - 2,4 = 0$.',
      goal: 'Dựng thiết diện tam giác giữa hình lập phương và $(P)$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = createEmptyScene3D();
        sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'cube1', kind: 'solid', rule: 'solid_cube', solidType: 'cube', label: "ABCD.A'B'C'D'", params: { a: 3.6 }, style: { isGiven: true, color: '#0F766E', opacity: 0.16 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 1, d: -2.4 }, label: '(P)', style: { isGiven: true, color: '#0284C7', opacity: 0.14 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 3 }, description: 'Dựng thiết diện hợp lệ (≥ 3 đỉnh).' },
      perturb: [],
      hints: [
        'Thiết diện là đa giác tạo bởi các giao tuyến của mặt phẳng cắt với các mặt của hình khối.',
        'Mở nhóm Thiết diện ở thanh công cụ bên trái.',
        'Chọn công cụ "Dựng thiết diện", nhấp vào hình lập phương trước rồi nhấp vào mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Chọn công cụ Thiết diện → nhấp Hình lập phương và (P).', mathExplanation: 'Mặt phẳng $(P)$ cắt 3 cạnh xuất phát từ một đỉnh tạo thiết diện tam giác.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['cube1', 'plP'], label: 'Thiết diện' } },
      proof: 'Giao điểm của $(P)$ với 3 cạnh chung đỉnh tạo thành tam giác đều là thiết diện của hình lập phương.',
    },
    {
      order: 2,
      title: 'Dựng thiết diện lục giác đều của hình lập phương',
      desc: 'Cho hình lập phương và mặt phẳng $(P)$ đi qua tâm vuông góc với đường chéo chính. Hãy dựng thiết diện lục giác đều.',
      hyp: 'Cho hình lập phương cạnh $3,6$ và mặt phẳng $(P): x + y + z - 1,8 = 0$.',
      goal: 'Dựng thiết diện lục giác đều (6 đỉnh) của hình lập phương.',
      diff: 'Khá',
      setup: () => {
        let sc = createEmptyScene3D();
        sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'cube1', kind: 'solid', rule: 'solid_cube', solidType: 'cube', label: "ABCD.A'B'C'D'", params: { a: 3.6 }, style: { isGiven: true, color: '#0F766E', opacity: 0.16 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 1, d: -1.8 }, label: '(P)', style: { isGiven: true, color: '#0284C7', opacity: 0.14 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 6 }, description: 'Dựng thiết diện lục giác (6 đỉnh).' },
      perturb: [],
      hints: [
        'Mặt phẳng cắt qua trung điểm của 6 cạnh hình lập phương tạo thành lục giác đều.',
        'Dùng công cụ Thiết diện giữa hình lập phương và mặt phẳng (P).',
        'Chọn Dựng thiết diện → nhấp hình lập phương → nhấp mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Dựng thiết diện lục giác đều.', mathExplanation: 'Các cạnh thiết diện đều có độ dài $\\frac{a\\sqrt{2}}{2}$.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['cube1', 'plP'], label: 'Thiết diện lục giác' } },
      proof: 'Mặt phẳng trung trực của đường chéo chính cắt 6 cạnh hình lập phương tại đúng 6 trung điểm, tạo thành lục giác đều.',
    },
    {
      order: 3,
      title: 'Dựng thiết diện của hình tứ diện đều',
      desc: 'Cho hình tứ diện đều và mặt phẳng cắt $(P)$. Hãy dựng thiết diện và quan sát diện tích của nó.',
      hyp: 'Cho tứ diện đều $S.ABC$ và mặt phẳng cắt $(P)$.',
      goal: 'Dựng thiết diện giữa tứ diện và mặt phẳng $(P)$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = createEmptyScene3D();
        sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'tet1', kind: 'solid', rule: 'solid_regular_tetrahedron', solidType: 'regular_tetrahedron', label: 'S.ABC', params: { a: 4.4 }, style: { isGiven: true, color: '#0F766E', opacity: 0.16 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0.3, b: 0.8, c: 0.4, d: -0.7 }, label: '(P)', style: { isGiven: true, color: '#0284C7', opacity: 0.14 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 3 }, description: 'Dựng thiết diện của tứ diện.' },
      perturb: [],
      hints: [
        'Thiết diện của mặt phẳng với tứ diện có thể là tam giác hoặc tứ giác.',
        'Dùng công cụ Dựng thiết diện trong nhóm Thiết diện.',
        'Nhấp vào tứ diện S.ABC rồi nhấp vào mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Dựng thiết diện của tứ diện với (P).', mathExplanation: 'Giao của mặt phẳng với 4 mặt tứ diện tạo thiết diện tứ giác.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['tet1', 'plP'], label: 'Thiết diện' } },
      proof: 'Vì tứ diện có 4 mặt nên mặt phẳng cắt không qua đỉnh chỉ có thể tạo thiết diện tam giác hoặc tứ giác.',
    },
    {
      order: 4,
      title: 'Dựng thiết diện của hình chóp tứ giác đều',
      desc: 'Cho hình chóp tứ giác đều $S.ABCD$ và mặt phẳng cắt nghiêng $(P)$. Hãy dựng thiết diện tứ giác.',
      hyp: 'Cho hình chóp tứ giác đều $S.ABCD$ và mặt phẳng $(P)$.',
      goal: 'Dựng thiết diện của hình chóp cắt bởi $(P)$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = createEmptyScene3D();
        sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'pyr1', kind: 'solid', rule: 'solid_regular_pyramid', solidType: 'regular_pyramid', label: 'S.ABCD', params: { sides: 4, a: 4.0, h: 4.5 }, style: { isGiven: true, color: '#0284C7', opacity: 0.16 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0.35, b: 0.2, c: 1, d: -1.8 }, label: '(P)', style: { isGiven: true, color: '#0F766E', opacity: 0.14 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 4 }, description: 'Dựng thiết diện tứ giác của hình chóp.' },
      perturb: [],
      hints: [
        'Mặt phẳng cắt cả 4 cạnh bên của hình chóp tứ giác tạo thành thiết diện tứ giác.',
        'Chọn công cụ "Dựng thiết diện".',
        'Nhấp vào hình chóp S.ABCD rồi nhấp vào mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Dựng thiết diện hình chóp tứ giác.', mathExplanation: 'Thiết diện cắt đủ 4 cạnh bên $SA, SB, SC, SD$.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['pyr1', 'plP'], label: 'Thiết diện' } },
      proof: 'Giao điểm của $(P)$ với 4 cạnh bên sắp xếp theo thứ tự vòng tạo thành tứ giác lồi thiết diện.',
    },
    {
      order: 5,
      title: 'Dựng thiết diện của hình lăng trụ đứng',
      desc: 'Cho hình lăng trụ đứng tam giác $ABC.A\'B\'C\'$ và mặt phẳng cắt nghiêng $(P)$. Hãy dựng thiết diện.',
      hyp: 'Cho lăng trụ đứng $ABC.A\'B\'C\'$ và mặt phẳng $(P)$.',
      goal: 'Dựng thiết diện tam giác của hình lăng trụ.',
      diff: 'Trung bình',
      setup: () => {
        let sc = createEmptyScene3D();
        sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'pr1', kind: 'solid', rule: 'solid_right_prism', solidType: 'right_prism', label: "ABC.A'B'C'", params: { sides: 3, a: 3.8, h: 4.4 }, style: { isGiven: true, color: '#0F766E', opacity: 0.16 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0.4, b: 0.2, c: 1, d: -2.0 }, label: '(P)', style: { isGiven: true, color: '#0284C7', opacity: 0.14 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 3 }, description: 'Dựng thiết diện của hình lăng trụ.' },
      perturb: [],
      hints: [
        'Mặt phẳng cắt cả 3 cạnh bên của lăng trụ tam giác tạo thiết diện tam giác.',
        'Chọn công cụ Dựng thiết diện.',
        'Nhấp vào hình lăng trụ rồi nhấp vào mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Dựng thiết diện lăng trụ.', mathExplanation: 'Diện tích hình chiếu của thiết diện lên đáy bằng $S_{\\text{thiết diện}} \\cdot \\cos\\varphi$.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['pr1', 'plP'], label: 'Thiết diện' } },
      proof: 'Ba giao điểm trên ba cạnh bên song song tạo thành tam giác thiết diện.',
    },
    {
      order: 6,
      title: 'Đo góc giữa hai đường thẳng trong không gian',
      desc: 'Cho hai đường thẳng $d_1, d_2$. Hãy sử dụng công cụ đo góc để xác định góc $(d_1, d_2)$.',
      hyp: 'Cho hai đường thẳng $d_1, d_2$ trong không gian.',
      goal: 'Đo góc giữa $d_1$ và $d_2$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2, -1, 0) },
          { id: 'B', label: 'B', pos: v3(2, 0.5, 1) },
          { id: 'C', label: 'C', pos: v3(-1, 2, 0) },
          { id: 'D', label: 'D', pos: v3(1.5, -1, 2) },
        ]);
        sc = addGeo3DObject(sc, { id: 'd1', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd₁', style: { isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'd2', kind: 'line', rule: 'line_two_points', parents: ['C', 'D'], label: 'd₂', style: { isGiven: true, color: '#0284C7' }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_lines' }, description: 'Đo góc giữa hai đường thẳng.' },
      perturb: ['A', 'B', 'C', 'D'],
      hints: [
        'Góc giữa hai đường thẳng luôn nằm trong đoạn $[0^\\circ; 90^\\circ]$.',
        'Mở nhóm Đo lường và chọn "Đo góc giữa hai đường thẳng".',
        'Nhấp vào đường thẳng d₁ rồi nhấp vào đường thẳng d₂.',
      ],
      sol: { id: 's1', actionText: 'Đo góc giữa d₁ và d₂.', mathExplanation: '$\\cos(d_1, d_2) = \\frac{|\\vec{u}_1 \\cdot \\vec{u}_2|}{|\\vec{u}_1|\\cdot|\\vec{u}_2|}$.', addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_lines', parents: ['d1', 'd2'], label: '(d₁,d₂)', metricKind: 'angle' } },
      proof: 'Góc giữa hai đường thẳng trong không gian được xác định qua giá trị tuyệt đối côsin góc giữa hai vectơ chỉ phương.',
    },
    {
      order: 7,
      title: 'Đo góc giữa đường thẳng và mặt phẳng',
      desc: 'Cho mặt phẳng $(P)$ và đường thẳng $SA$ cắt $(P)$. Hãy đo góc giữa $SA$ và $(P)$.',
      hyp: 'Cho mặt phẳng $(P)$ và đoạn thẳng $SA$.',
      goal: 'Xác định góc giữa đường thẳng $SA$ và mặt phẳng $(P)$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.4, -0.5, 0) },
          { id: 'S', label: 'S', pos: v3(1.5, 0.5, 3.0) },
        ]);
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(P)', style: { isGiven: true, opacity: 0.2 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'sSA', kind: 'segment', rule: 'segment_3d', parents: ['S', 'A'], label: 'SA', style: { isGiven: true, color: '#DC2626' }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_line_plane' }, description: 'Đo góc giữa SA và (P).' },
      perturb: ['A', 'S'],
      hints: [
        'Góc giữa đường thẳng và mặt phẳng là góc giữa đường thẳng đó và hình chiếu vuông góc của nó trên mặt phẳng.',
        'Mở nhóm Đo lường và chọn "Đo góc giữa đường thẳng và mặt phẳng".',
        'Nhấp vào đoạn SA rồi nhấp vào mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Đo góc giữa SA và (P).', mathExplanation: '$\\sin(SA, (P)) = \\frac{|\\vec{u} \\cdot \\vec{n}|}{|\\vec{u}|\\cdot|\\vec{n}|}$.', addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_line_plane', parents: ['sSA', 'plP'], label: '(SA,(P))', metricKind: 'angle' } },
      proof: 'Góc giữa đường thẳng và mặt phẳng thuộc $[0^\\circ; 90^\\circ]$ và phụ với góc giữa vectơ chỉ phương và vectơ pháp tuyến.',
    },
    {
      order: 8,
      title: 'Đo góc nhị diện [S, BC, A]',
      desc: 'Cho bốn điểm $S, B, C, A$ tạo hai nửa mặt phẳng có chung cạnh $BC$. Hãy đo góc nhị diện $[S, BC, A]$.',
      hyp: 'Cho bốn điểm $S, B, C, A$ với cạnh chung $BC$.',
      goal: 'Đo góc nhị diện $[S, BC, A]$ (giá trị trong $[0^\\circ; 180^\\circ]$).',
      diff: 'Khá',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'B', label: 'B', pos: v3(-2.2, 0, 0) },
          { id: 'C', label: 'C', pos: v3(2.2, 0, 0) },
          { id: 'A', label: 'A', pos: v3(0, 2.6, 0) },
          { id: 'S', label: 'S', pos: v3(0, -1.5, 2.6) },
        ]);
        sc = addGeo3DObject(sc, { id: 'sBC', kind: 'segment', rule: 'segment_3d', parents: ['B', 'C'], label: 'BC', style: { isGiven: true, color: '#DC2626' }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_dihedral_angle' }, description: 'Đo góc nhị diện [S, BC, A].' },
      perturb: ['S', 'B', 'C', 'A'],
      hints: [
        'Khác với góc giữa hai mặt phẳng (≤ 90°), góc nhị diện có thể là góc tù (từ 0° đến 180°).',
        'Chọn công cụ "Đo góc nhị diện [P, AB, Q]" trong nhóm Đo lường.',
        'Nhấp lần lượt 4 điểm: S, B, C, A.',
      ],
      sol: { id: 's1', actionText: 'Đo góc nhị diện [S, BC, A].', mathExplanation: 'Góc phẳng nhị diện tạo bởi hai tia cùng vuông góc cạnh $BC$ trong hai nửa mặt phẳng.', addInput: { id: 'sol_d', kind: 'measurement', rule: 'measure_dihedral_angle', parents: ['S', 'B', 'C', 'A'], label: '[S,BC,A]', metricKind: 'dihedral' } },
      proof: 'Số đo góc nhị diện $[S, BC, A]$ bằng góc giữa hai vectơ vuông góc với $BC$ hướng về phía $S$ và $A$.',
    },
    {
      order: 9,
      title: 'Tính khoảng cách từ điểm đến mặt phẳng',
      desc: 'Cho mặt phẳng $(P)$ và điểm $M \\notin (P)$. Hãy đo khoảng cách $d(M, (P))$.',
      hyp: 'Cho mặt phẳng $(P)$ và điểm $M$.',
      goal: 'Đo khoảng cách từ điểm $M$ đến mặt phẳng $(P)$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = givenPointsScene([{ id: 'M', label: 'M', pos: v3(1, 1.5, 3.2) }]);
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 2, d: -2 }, label: '(P)', style: { isGiven: true, color: '#0284C7', opacity: 0.22 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_pplane' }, description: 'Đo khoảng cách từ M đến (P).' },
      perturb: ['M'],
      hints: [
        'Khoảng cách từ điểm đến mặt phẳng bằng độ dài đoạn nối từ điểm tới hình chiếu vuông góc của nó.',
        'Mở nhóm Đo lường và chọn "Khoảng cách từ điểm đến mặt phẳng".',
        'Nhấp vào điểm M rồi nhấp vào mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Đo khoảng cách d(M, (P)).', mathExplanation: '$d(M,(P)) = \\frac{|Ax_M+By_M+Cz_M+D|}{\\sqrt{A^2+B^2+C^2}}$.', addInput: { id: 'sol_d', kind: 'measurement', rule: 'measure_distance_pplane', parents: ['M', 'plP'], label: 'd(M,(P))', metricKind: 'distance' } },
      proof: 'Mọi điểm $N \\in (P)$ đều thỏa $MN \\ge MH = d(M,(P))$.',
    },
    {
      order: 10,
      title: 'Đo khoảng cách giữa hai đường thẳng chéo nhau',
      desc: 'Cho hai đường thẳng chéo nhau $d_1, d_2$. Hãy xác định khoảng cách ngắn nhất $d(d_1, d_2)$.',
      hyp: 'Cho hai đường thẳng chéo nhau $d_1, d_2$.',
      goal: 'Đo khoảng cách giữa hai đường thẳng chéo nhau $d_1$ và $d_2$.',
      diff: 'Khá',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.5, -1, 0) },
          { id: 'B', label: 'B', pos: v3(2.5, -1, 0) },
          { id: 'C', label: 'C', pos: v3(0, -2, 2.4) },
          { id: 'D', label: 'D', pos: v3(0, 2, 2.4) },
        ]);
        sc = addGeo3DObject(sc, { id: 'd1', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd₁', style: { isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'd2', kind: 'line', rule: 'line_two_points', parents: ['C', 'D'], label: 'd₂', style: { isGiven: true, color: '#0284C7' }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_skew' }, description: 'Đo khoảng cách d(d₁, d₂).' },
      perturb: ['A', 'B', 'C', 'D'],
      hints: [
        'Khoảng cách giữa hai đường thẳng chéo nhau bằng độ dài đoạn vuông góc chung của chúng.',
        'Mở nhóm Đo lường và chọn "Khoảng cách hai đường thẳng chéo nhau".',
        'Nhấp lần lượt vào d₁ và d₂.',
      ],
      sol: { id: 's1', actionText: 'Đo khoảng cách hai đường thẳng chéo nhau d₁, d₂.', mathExplanation: '$d(d_1, d_2) = \\frac{|[\\vec{u}_1, \\vec{u}_2] \\cdot \\overrightarrow{AC}|}{|[\\vec{u}_1, \\vec{u}_2]|}$.', addInput: { id: 'sol_m', kind: 'measurement', rule: 'measure_distance_skew', parents: ['d1', 'd2'], label: 'd(d₁,d₂)', metricKind: 'distance' } },
      proof: 'Công thức tích hỗn tạp cho khoảng cách ngắn nhất giữa hai đường thẳng chéo nhau trong không gian.',
    },
  ];

  for (const s of l4Specs) {
    list.push({
      id: `S3D_L04_C${String(s.order).padStart(2, '0')}`,
      levelId: 4,
      order: s.order,
      title: s.title,
      description: s.desc,
      hypothesis: s.hyp,
      goal: s.goal,
      difficulty: s.diff,
      curriculumTag: 'Toán 11',
      allowedTools: ALL_3D_TOOLS,
      targetSteps: 1,
      buildInitialScene: s.setup,
      validationRules: [s.rule],
      perturbFreePointIds: s.perturb,
      hints: s.hints,
      solutionSteps: [s.sol],
      proof: s.proof,
    });
  }

  // ==================== CẤP ĐỘ 5: VECTƠ VÀ HỆ TỌA ĐỘ OXYZ (10 bài - Toán 12) ====================
  const l5Specs: typeof l2Specs = [
    {
      order: 1,
      title: 'Biểu diễn điểm A(1; 2; 3) trong hệ tọa độ Oxyz',
      desc: 'Trong hệ tọa độ $Oxyz$, hãy tạo chính xác điểm $A(1; 2; 3)$.',
      hyp: 'Hệ trục tọa độ $Oxyz$ với gốc $O(0; 0; 0)$.',
      goal: 'Tạo điểm $A$ có tọa độ $(1; 2; 3)$.',
      diff: 'Cơ bản',
      setup: () => givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }], 'oxyz', true),
      rule: { type: 'has_point_at_coords', refs: [], params: { x: 1, y: 2, z: 3 }, description: 'Tạo điểm có tọa độ (1; 2; 3).' },
      perturb: [],
      hints: [
        'Sử dụng công cụ nhập điểm theo tọa độ chính xác.',
        'Mở nhóm Điểm → chọn "Điểm theo tọa độ (x; y; z)".',
        'Nhập x = 1, y = 2, z = 3 rồi nhấn Tạo điểm.',
      ],
      sol: { id: 's1', actionText: 'Nhập tọa độ điểm A(1; 2; 3).', mathExplanation: '$\\overrightarrow{OA} = 1\\vec{i} + 2\\vec{j} + 3\\vec{k}$.', addInput: { id: 'sol_A', kind: 'point', rule: 'point_coords', position: v3(1, 2, 3), label: 'A' } },
      proof: 'Mỗi bộ ba số thực $(x; y; z)$ xác định duy nhất một điểm trong hệ tọa độ $Oxyz$.',
    },
    {
      order: 2,
      title: 'Dựng vectơ AB trong hệ tọa độ Oxyz',
      desc: 'Cho $A(1; 2; 3)$ và $B(4; 2; 3)$. Hãy dựng vectơ $\\overrightarrow{AB}$ và kiểm tra tọa độ $(3; 0; 0)$, độ dài bằng $3$.',
      hyp: 'Cho hai điểm $A(1; 2; 3)$ và $B(4; 2; 3)$.',
      goal: 'Dựng vectơ $\\overrightarrow{AB}$.',
      diff: 'Cơ bản',
      setup: () =>
        givenPointsScene(
          [
            { id: 'A', label: 'A(1;2;3)', pos: v3(1, 2, 3) },
            { id: 'B', label: 'B(4;2;3)', pos: v3(4, 2, 3) },
          ],
          'oxyz',
          true
        ),
      rule: { type: 'has_vector_between', refs: ['A', 'B'], description: 'Dựng vectơ AB = (3; 0; 0).' },
      perturb: ['A', 'B'],
      hints: [
        'Tọa độ vectơ $\\overrightarrow{AB} = (x_B - x_A; y_B - y_A; z_B - z_A)$.',
        'Chọn công cụ "Vectơ" trong nhóm Đường.',
        'Nhấp vào điểm đầu A trước, sau đó nhấp vào điểm cuối B.',
      ],
      sol: { id: 's1', actionText: 'Dựng vectơ từ A đến B.', mathExplanation: '$\\overrightarrow{AB} = (4-1; 2-2; 3-3) = (3; 0; 0),\\; |\\overrightarrow{AB}| = 3$.', addInput: { id: 'sol_v', kind: 'vector', rule: 'vector_two_points', parents: ['A', 'B'], label: 'AB' } },
      proof: '$\\overrightarrow{AB} = (3; 0; 0)$ nên $|\\overrightarrow{AB}| = \\sqrt{3^2+0^2+0^2} = 3$.',
    },
    {
      order: 3,
      title: 'Xác định trung điểm trong tọa độ Oxyz',
      desc: 'Cho $A(2; -2; 4)$ và $B(4; 2; 0)$. Hãy dựng trung điểm $M$ của $AB$ và đối chiếu tọa độ $M(3; 0; 2)$.',
      hyp: 'Cho $A(2; -2; 4)$ và $B(4; 2; 0)$.',
      goal: 'Dựng trung điểm $M$ của $AB$.',
      diff: 'Cơ bản',
      setup: () =>
        givenPointsScene(
          [
            { id: 'A', label: 'A', pos: v3(2, -2, 4) },
            { id: 'B', label: 'B', pos: v3(4, 2, 0) },
          ],
          'oxyz',
          true
        ),
      rule: { type: 'has_midpoint_of', refs: ['A', 'B'], description: 'Dựng trung điểm M của AB.' },
      perturb: ['A', 'B'],
      hints: [
        'Tọa độ trung điểm bằng trung bình cộng tọa độ hai đầu mút.',
        'Chọn công cụ Trung điểm trong nhóm Điểm.',
        'Nhấp vào A và B để dựng trung điểm M.',
      ],
      sol: { id: 's1', actionText: 'Dựng trung điểm M của AB.', mathExplanation: '$M\\left(\\frac{2+4}{2}; \\frac{-2+2}{2}; \\frac{4+0}{2}\\right) = (3; 0; 2)$.', addInput: { id: 'sol_M', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'B'], label: 'M' } },
      proof: 'Công thức tọa độ trung điểm: $x_M = \\frac{x_A+x_B}{2}, y_M = \\frac{y_A+y_B}{2}, z_M = \\frac{z_A+z_B}{2}$.',
    },
    {
      order: 4,
      title: 'Tìm hình chiếu vuông góc lên mặt phẳng Oxy',
      desc: 'Cho điểm $M(2; 3; 4)$ và mặt phẳng tọa độ $(Oxy): z = 0$. Hãy dựng hình chiếu vuông góc $H$ của $M$ lên $(Oxy)$.',
      hyp: 'Cho $M(2; 3; 4)$ và mặt phẳng $(Oxy)$.',
      goal: 'Dựng hình chiếu vuông góc $H(2; 3; 0)$ của $M$ lên $(Oxy)$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = givenPointsScene([{ id: 'M', label: 'M(2;3;4)', pos: v3(2, 3, 4) }], 'oxyz', true);
        sc = addGeo3DObject(sc, { id: 'oxy', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(Oxy)', style: { isGiven: true, opacity: 0.16 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_foot_on_plane', refs: ['M', 'oxy'], description: 'Dựng hình chiếu vuông góc H trên (Oxy).' },
      perturb: ['M'],
      hints: [
        'Hình chiếu vuông góc của $M(x_0; y_0; z_0)$ lên $(Oxy)$ có tọa độ $(x_0; y_0; 0)$.',
        'Chọn công cụ "Hình chiếu vuông góc lên mặt phẳng".',
        'Nhấp điểm M rồi nhấp mặt phẳng (Oxy).',
      ],
      sol: { id: 's1', actionText: 'Chiếu vuông góc M xuống (Oxy).', mathExplanation: 'Giữ nguyên $x, y$ và đặt $z = 0$ ta được $H(2; 3; 0)$.', addInput: { id: 'sol_H', kind: 'point', rule: 'foot_point_plane', parents: ['M', 'oxy'], label: 'H' } },
      proof: 'Đường thẳng qua $M$ vuông góc $(Oxy)$ song song $Oz$, cắt $(Oxy)$ tại điểm có $z = 0$.',
    },
    {
      order: 5,
      title: 'Tìm điểm đối xứng qua mặt phẳng Oxy',
      desc: 'Cho điểm $M(2; -1; 3)$. Hãy dựng điểm $M\'$ đối xứng với $M$ qua mặt phẳng $(Oxy)$.',
      hyp: 'Cho điểm $M(2; -1; 3)$ và mặt phẳng $(Oxy)$.',
      goal: 'Dựng $M\'(2; -1; -3)$ đối xứng với $M$ qua $(Oxy)$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = givenPointsScene([{ id: 'M', label: 'M', pos: v3(2, -1, 3) }], 'oxyz', true);
        sc = addGeo3DObject(sc, { id: 'oxy', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(Oxy)', style: { isGiven: true, opacity: 0.16 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_reflect_point_plane', refs: ['M', 'oxy'], description: 'Dựng điểm đối xứng M\' của M qua (Oxy).' },
      perturb: ['M'],
      hints: [
        'Khi lấy đối xứng qua $(Oxy)$, cao độ $z$ đổi dấu thành $-z$.',
        'Chọn công cụ "Điểm đối xứng qua mặt phẳng".',
        'Nhấp vào điểm M rồi nhấp vào mặt phẳng (Oxy).',
      ],
      sol: { id: 's1', actionText: 'Lấy đối xứng điểm M qua (Oxy).', mathExplanation: 'Điểm đối xứng là $M\'(2; -1; -3)$.', addInput: { id: 'sol_M1', kind: 'point', rule: 'reflect_point_plane', parents: ['M', 'oxy'], label: "M'" } },
      proof: 'Vì $(Oxy)$ là mặt phẳng trung trực của $MM\'$ nên $x\'=x, y\'=y, z\'=-z$.',
    },
    {
      order: 6,
      title: 'Đo góc giữa hai vectơ trong không gian Oxyz',
      desc: 'Cho hai vectơ $\\vec{u} = (2; 0; 0)$ và $\\vec{v} = (1; 1; 0)$. Hãy đo góc giữa hai vectơ $(\\vec{u}, \\vec{v})$.',
      hyp: 'Cho hai vectơ $\\vec{u}$ và $\\vec{v}$ chung gốc $O$.',
      goal: 'Đo góc giữa hai vectơ $\\vec{u}$ và $\\vec{v}$.',
      diff: 'Cơ bản',
      setup: () => {
        let sc = givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }], 'oxyz', true);
        sc = addGeo3DObject(sc, { id: 'vu', kind: 'vector', rule: 'vector_coords', params: { ox: 0, oy: 0, oz: 0, vx: 3, vy: 0, vz: 0 }, label: 'u', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'vv', kind: 'vector', rule: 'vector_coords', params: { ox: 0, oy: 0, oz: 0, vx: 2, vy: 2, vz: 0 }, label: 'v', style: { isGiven: true, color: '#7C3AED' }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_vectors' }, description: 'Đo góc giữa hai vectơ u và v.' },
      perturb: [],
      hints: [
        'Góc giữa hai vectơ xác định theo công thức tích vô hướng $\\cos(\\vec{u}, \\vec{v}) = \\frac{\\vec{u}\\cdot\\vec{v}}{|\\vec{u}||\\vec{v}|}$.',
        'Mở nhóm Đo lường và chọn "Đo góc giữa hai vectơ".',
        'Nhấp vào vectơ u rồi nhấp vào vectơ v.',
      ],
      sol: { id: 's1', actionText: 'Đo góc giữa vectơ u và v.', mathExplanation: '$\\cos(\\vec{u},\\vec{v}) = \\frac{6}{3 \\cdot 2\\sqrt{2}} = \\frac{\\sqrt{2}}{2} \\Rightarrow 45^\\circ$.', addInput: { id: 'sol_ang', kind: 'measurement', rule: 'measure_angle_vectors', parents: ['vu', 'vv'], label: '(u, v)', metricKind: 'angle' } },
      proof: 'Áp dụng biểu thức tọa độ của tích vô hướng ta tính được góc bằng $45^\\circ$.',
    },
    {
      order: 7,
      title: 'Dựng vectơ tổng u + v bằng tọa độ',
      desc: 'Cho $\\vec{u} = (2; 1; 0)$ và $\\vec{v} = (1; 2; 2)$. Hãy tạo điểm đầu mút $C(3; 3; 2)$ biểu diễn vectơ tổng $\\overrightarrow{OC} = \\vec{u} + \\vec{v}$.',
      hyp: 'Cho gốc $O(0;0;0)$ và hai vectơ $\\vec{u}(2;1;0), \\vec{v}(1;2;2)$.',
      goal: 'Tạo điểm $C(3; 3; 2)$ biểu diễn tổng hai vectơ.',
      diff: 'Trung bình',
      setup: () => {
        let sc = givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }], 'oxyz', true);
        sc = addGeo3DObject(sc, { id: 'vu', kind: 'vector', rule: 'vector_coords', params: { ox: 0, oy: 0, oz: 0, vx: 2, vy: 1, vz: 0 }, label: 'u', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'vv', kind: 'vector', rule: 'vector_coords', params: { ox: 0, oy: 0, oz: 0, vx: 1, vy: 2, vz: 2 }, label: 'v', style: { isGiven: true, color: '#0284C7' }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_point_at_coords', refs: [], params: { x: 3, y: 3, z: 2 }, description: 'Tạo điểm C(3; 3; 2).' },
      perturb: [],
      hints: [
        'Cộng từng tọa độ tương ứng: $(2+1; 1+2; 0+2) = (3; 3; 2)$.',
        'Chọn công cụ "Điểm theo tọa độ (x; y; z)".',
        'Nhập x = 3, y = 3, z = 2 để tạo điểm C.',
      ],
      sol: { id: 's1', actionText: 'Tạo điểm C(3; 3; 2).', mathExplanation: '$\\vec{u} + \\vec{v} = (3; 3; 2)$.', addInput: { id: 'sol_C', kind: 'point', rule: 'point_coords', position: v3(3, 3, 2), label: 'C' } },
      proof: 'Biểu thức tọa độ của tổng hai vectơ là cộng từng hoành độ, tung độ và cao độ tương ứng.',
    },
    {
      order: 8,
      title: 'Tìm điểm đối xứng qua gốc tọa độ O',
      desc: 'Cho điểm $A(2; -1; 3)$ và gốc $O(0; 0; 0)$. Hãy dựng điểm $A\'$ đối xứng với $A$ qua $O$.',
      hyp: 'Cho điểm $A(2; -1; 3)$ và gốc tọa độ $O(0; 0; 0)$.',
      goal: 'Dựng điểm $A\'(-2; 1; -3)$ đối xứng với $A$ qua $O$.',
      diff: 'Cơ bản',
      setup: () =>
        givenPointsScene(
          [
            { id: 'O', label: 'O', pos: v3(0, 0, 0) },
            { id: 'A', label: 'A', pos: v3(2, -1, 3) },
          ],
          'oxyz',
          true
        ),
      rule: { type: 'has_reflect_point_point', refs: ['A', 'O'], description: 'Dựng điểm đối xứng A\' của A qua O.' },
      perturb: ['A'],
      hints: [
        'Điểm đối xứng qua gốc tọa độ $O$ đổi dấu cả ba tọa độ $(x; y; z) \\to (-x; -y; -z)$.',
        'Chọn công cụ "Điểm đối xứng qua điểm".',
        'Nhấp điểm A rồi nhấp gốc O.',
      ],
      sol: { id: 's1', actionText: 'Dựng điểm đối xứng của A qua O.', mathExplanation: '$A\'(-2; 1; -3)$.', addInput: { id: 'sol_A1', kind: 'point', rule: 'reflect_point_point', parents: ['A', 'O'], label: "A'" } },
      proof: 'Vì $O$ là trung điểm $AA\'$ nên $\\overrightarrow{OA\'} = -\\overrightarrow{OA}$.',
    },
    {
      order: 9,
      title: 'Tính độ dài đoạn thẳng trong Oxyz',
      desc: 'Cho $A(0; 0; 0)$ và $B(3; 4; 0)$. Hãy dùng công cụ đo độ dài để kiểm chứng $AB = 5$.',
      hyp: 'Cho hai điểm $A(0; 0; 0)$ và $B(3; 4; 0)$.',
      goal: 'Đo độ dài đoạn thẳng $AB$.',
      diff: 'Cơ bản',
      setup: () =>
        givenPointsScene(
          [
            { id: 'A', label: 'A(0;0;0)', pos: v3(0, 0, 0) },
            { id: 'B', label: 'B(3;4;0)', pos: v3(3, 4, 0) },
          ],
          'oxyz',
          true
        ),
      rule: { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_pp' }, description: 'Đo khoảng cách AB.' },
      perturb: ['A', 'B'],
      hints: [
        '$AB = \\sqrt{(x_B-x_A)^2 + (y_B-y_A)^2 + (z_B-z_A)^2}$.',
        'Mở nhóm Đo lường và chọn "Đo khoảng cách hai điểm".',
        'Nhấp vào A rồi nhấp vào B.',
      ],
      sol: { id: 's1', actionText: 'Đo khoảng cách giữa A và B.', mathExplanation: '$AB = \\sqrt{3^2 + 4^2 + 0^2} = 5$.', addInput: { id: 'sol_m', kind: 'measurement', rule: 'measure_distance_pp', parents: ['A', 'B'], label: 'AB', metricKind: 'length' } },
      proof: 'Áp dụng công thức khoảng cách hai điểm trong không gian $Oxyz$.',
    },
    {
      order: 10,
      title: 'Tìm hình chiếu vuông góc lên trục Ox',
      desc: 'Cho điểm $M(3; 2; 4)$ và trục $Ox$ đi qua $O(0;0;0)$ và $E_1(1;0;0)$. Dựng hình chiếu vuông góc của $M$ lên trục $Ox$.',
      hyp: 'Cho điểm $M(3; 2; 4)$ và đường thẳng trục $Ox$.',
      goal: 'Dựng hình chiếu vuông góc $H(3; 0; 0)$ của $M$ lên trục $Ox$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = givenPointsScene(
          [
            { id: 'O', label: 'O', pos: v3(0, 0, 0) },
            { id: 'E1', label: 'E₁', pos: v3(1, 0, 0) },
            { id: 'M', label: 'M', pos: v3(3, 2, 4) },
          ],
          'oxyz',
          true
        );
        sc = addGeo3DObject(sc, { id: 'ox', kind: 'line', rule: 'line_two_points', parents: ['O', 'E1'], label: 'Ox', style: { isGiven: true, color: '#DC2626' }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_foot_on_line', refs: ['M', 'ox'], description: 'Dựng hình chiếu vuông góc của M lên Ox.' },
      perturb: ['M'],
      hints: [
        'Hình chiếu vuông góc của $M(x_0; y_0; z_0)$ lên trục $Ox$ là $(x_0; 0; 0)$.',
        'Chọn công cụ "Hình chiếu vuông góc lên đường thẳng".',
        'Nhấp vào điểm M rồi nhấp vào trục Ox.',
      ],
      sol: { id: 's1', actionText: 'Chiếu vuông góc M lên trục Ox.', mathExplanation: 'Hình chiếu lên $Ox$ giữ nguyên hoành độ: $H(3; 0; 0)$.', addInput: { id: 'sol_H', kind: 'point', rule: 'foot_point_line', parents: ['M', 'ox'], label: 'H' } },
      proof: 'Đoạn $MH$ vuông góc với trục $Ox$ tại điểm có cùng hoành độ với $M$ và $y = z = 0$.',
    },
  ];

  for (const s of l5Specs) {
    list.push({
      id: `S3D_L05_C${String(s.order).padStart(2, '0')}`,
      levelId: 5,
      order: s.order,
      title: s.title,
      description: s.desc,
      hypothesis: s.hyp,
      goal: s.goal,
      difficulty: s.diff,
      curriculumTag: 'Toán 12',
      allowedTools: ALL_3D_TOOLS,
      targetSteps: 1,
      buildInitialScene: s.setup,
      validationRules: [s.rule],
      perturbFreePointIds: s.perturb,
      hints: s.hints,
      solutionSteps: [s.sol],
      proof: s.proof,
    });
  }

  // ==================== CẤP ĐỘ 6: PHƯƠNG PHÁP TỌA ĐỘ TRONG KHÔNG GIAN (10 bài - Toán 12) ====================
  const l6Specs: typeof l2Specs = [
    {
      order: 1,
      title: 'Dựng mặt phẳng theo phương trình tổng quát',
      desc: 'Trong $Oxyz$, hãy dựng mặt phẳng $(P)$ có phương trình tổng quát $x + y + z - 3 = 0$.',
      hyp: 'Hệ tọa độ $Oxyz$.',
      goal: 'Dựng mặt phẳng $(P): x + y + z - 3 = 0$.',
      diff: 'Cơ bản',
      setup: () => givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }], 'oxyz', true),
      rule: { type: 'has_plane_equation', refs: [], params: { a: 1, b: 1, c: 1, d: -3 }, description: 'Dựng mặt phẳng x + y + z - 3 = 0.' },
      perturb: [],
      hints: [
        'Mặt phẳng có dạng $Ax + By + Cz + D = 0$ với $A=1, B=1, C=1, D=-3$.',
        'Mở nhóm Mặt phẳng và chọn "Mặt phẳng theo phương trình Ax+By+Cz+D=0".',
        'Nhập A = 1, B = 1, C = 1, D = -3 rồi nhấn Dựng mặt phẳng.',
      ],
      sol: { id: 's1', actionText: 'Nhập phương trình x + y + z - 3 = 0.', mathExplanation: 'Mặt phẳng cắt 3 trục tại $(3;0;0), (0;3;0), (0;0;3)$.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 1, d: -3 }, label: '(P)' } },
      proof: 'Phương trình theo đoạn chắn: $\\frac{x}{3} + \\frac{y}{3} + \\frac{z}{3} = 1 \\Leftrightarrow x + y + z - 3 = 0$.',
    },
    {
      order: 2,
      title: 'Dựng mặt phẳng chắn ba trục tọa độ',
      desc: 'Cho $A(3; 0; 0)$, $B(0; 2; 0)$, $C(0; 0; 2)$. Hãy dựng mặt phẳng $(ABC)$ và quan sát phương trình tổng quát của nó.',
      hyp: 'Cho ba điểm trên ba trục tọa độ $A, B, C$.',
      goal: 'Dựng mặt phẳng $(ABC)$.',
      diff: 'Cơ bản',
      setup: () =>
        givenPointsScene(
          [
            { id: 'A', label: 'A(3;0;0)', pos: v3(3, 0, 0) },
            { id: 'B', label: 'B(0;2;0)', pos: v3(0, 2, 0) },
            { id: 'C', label: 'C(0;0;2)', pos: v3(0, 0, 2) },
          ],
          'oxyz',
          true
        ),
      rule: { type: 'has_plane_through_points', refs: ['A', 'B', 'C'], description: 'Dựng mặt phẳng (ABC).' },
      perturb: ['A', 'B', 'C'],
      hints: [
        'Ba điểm trên ba trục tọa độ khác gốc O không thẳng hàng nên xác định một mặt phẳng.',
        'Chọn công cụ "Mặt phẳng qua ba điểm không thẳng hàng".',
        'Nhấp lần lượt vào A, B, C.',
      ],
      sol: { id: 's1', actionText: 'Dựng mặt phẳng (ABC).', mathExplanation: 'Phương trình: $\\frac{x}{3} + \\frac{y}{2} + \\frac{z}{2} = 1 \\Leftrightarrow 2x + 3y + 3z - 6 = 0$.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'C'], label: '(ABC)' } },
      proof: 'Ba điểm $A(a;0;0), B(0;b;0), C(0;0;c)$ với $abc \\neq 0$ xác định mặt phẳng $\\frac{x}{a}+\\frac{y}{b}+\\frac{z}{c}=1$.',
    },
    {
      order: 3,
      title: 'Dựng đường thẳng đi qua điểm và có vectơ chỉ phương',
      desc: 'Cho hai điểm $M_0(1; 0; 1)$ và $M_1(3; 2; 3)$. Hãy dựng đường thẳng $d$ đi qua $M_0, M_1$ và xem phương trình tham số.',
      hyp: 'Cho $M_0(1; 0; 1)$ và $M_1(3; 2; 3)$.',
      goal: 'Dựng đường thẳng đi qua $M_0, M_1$.',
      diff: 'Cơ bản',
      setup: () =>
        givenPointsScene(
          [
            { id: 'M0', label: 'M₀(1;0;1)', pos: v3(1, 0, 1) },
            { id: 'M1', label: 'M₁(3;2;3)', pos: v3(3, 2, 3) },
          ],
          'oxyz',
          true
        ),
      rule: { type: 'has_line_through', refs: ['M0', 'M1'], description: 'Dựng đường thẳng đi qua M₀ và M₁.' },
      perturb: ['M0', 'M1'],
      hints: [
        'Đường thẳng đi qua hai điểm $M_0, M_1$ có vectơ chỉ phương $\\overrightarrow{M_0M_1} = (2; 2; 2)$.',
        'Chọn công cụ "Đường thẳng qua hai điểm".',
        'Nhấp vào M₀ rồi nhấp vào M₁.',
      ],
      sol: { id: 's1', actionText: 'Dựng đường thẳng qua M₀ và M₁.', mathExplanation: 'Phương trình chính tắc: $\\frac{x-1}{1} = \\frac{y}{1} = \\frac{z-1}{1}$.', addInput: { id: 'sol_l', kind: 'line', rule: 'line_two_points', parents: ['M0', 'M1'], label: 'd' } },
      proof: 'Mọi điểm trên đường thẳng có dạng $M_0 + t\\overrightarrow{M_0M_1}$ với $t \\in \\mathbb{R}$.',
    },
    {
      order: 4,
      title: 'Dựng mặt cầu trong hệ tọa độ Oxyz',
      desc: 'Trong hệ tọa độ $Oxyz$, hãy chèn một mặt cầu $(S)$ để quan sát phương trình $(x-a)^2+(y-b)^2+(z-c)^2=R^2$.',
      hyp: 'Hệ tọa độ $Oxyz$.',
      goal: 'Tạo một mặt cầu trong không gian $Oxyz$.',
      diff: 'Cơ bản',
      setup: () => givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }], 'oxyz', true),
      rule: { type: 'has_solid_of_type', refs: [], params: { solidType: 'sphere' }, description: 'Tạo mặt cầu (S).' },
      perturb: [],
      hints: [
        'Mở nhóm Hình khối ở thanh bên trái.',
        'Chọn "Hình cầu / Mặt cầu" trong nhóm Hình tròn xoay.',
        'Sau khi tạo, nhấp vào mặt cầu để xem tọa độ tâm và phương trình ở bảng bên phải.',
      ],
      sol: { id: 's1', actionText: 'Tạo mặt cầu (S) trong Oxyz.', mathExplanation: 'Phương trình mặt cầu tâm $I(a;b;c)$ bán kính $R$: $(x-a)^2+(y-b)^2+(z-c)^2=R^2$.', addInput: { id: 'sol_s', kind: 'solid', rule: 'solid_sphere', solidType: 'sphere', label: '(S)', center: v3(0, 0, 2), params: { r: 2.2 } } },
      proof: 'Tập hợp mọi điểm $M(x;y;z)$ thỏa mãn $IM = R$ lập thành mặt cầu $(S)$.',
    },
    {
      order: 5,
      title: 'Giao điểm đường thẳng và mặt phẳng trong Oxyz',
      desc: 'Cho mặt phẳng $(P): x + y + z - 4 = 0$ và đường thẳng $d$ qua $O(0;0;0)$ và $A(1;2;1)$. Dựng giao điểm $I = d \\cap (P)$.',
      hyp: 'Cho mặt phẳng $(P)$ và đường thẳng $d$.',
      goal: 'Dựng chính xác giao điểm $I = d \\cap (P)$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = givenPointsScene(
          [
            { id: 'O', label: 'O', pos: v3(0, 0, 0) },
            { id: 'A', label: 'A', pos: v3(1, 2, 1) },
          ],
          'oxyz',
          true
        );
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 1, d: -4 }, label: '(P)', style: { isGiven: true, opacity: 0.22 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'ld', kind: 'line', rule: 'line_two_points', parents: ['O', 'A'], label: 'd', style: { isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_intersection_line_plane', refs: ['ld', 'plP'], description: 'Dựng giao điểm I = d ∩ (P).' },
      perturb: ['O', 'A'],
      hints: [
        'Thế phương trình tham số của $d$ vào $(P)$ để giải tìm $t = 1 \\Rightarrow I(1; 2; 1)$.',
        'Chọn công cụ "Giao điểm đường thẳng và mặt phẳng".',
        'Nhấp vào đường thẳng d rồi nhấp vào mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Dựng giao điểm I = d ∩ (P).', mathExplanation: '$t + 2t + t - 4 = 0 \\Rightarrow t = 1 \\Rightarrow I(1; 2; 1)$.', addInput: { id: 'sol_I', kind: 'point', rule: 'intersect_line_plane', parents: ['ld', 'plP'], label: 'I', style: { color: '#DC2626' } } },
      proof: 'Giao điểm $I$ là nghiệm duy nhất của hệ phương trình gồm $d$ và $(P)$.',
    },
    {
      order: 6,
      title: 'Tìm giao tuyến hai mặt phẳng bằng phương trình',
      desc: 'Cho $(P): x + y + z - 3 = 0$ và $(Q): x - y + z - 1 = 0$. Dựng đường thẳng giao tuyến $d = (P) \\cap (Q)$.',
      hyp: 'Cho hai mặt phẳng $(P)$ và $(Q)$ cắt nhau.',
      goal: 'Dựng đường thẳng giao tuyến $d$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = createEmptyScene3D();
        sc.displayMode = 'oxyz';
        sc.showAxes = true;
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 1, d: -3 }, label: '(P)', style: { isGiven: true, color: '#0284C7', opacity: 0.22 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'plQ', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: -1, c: 1, d: -1 }, label: '(Q)', style: { isGiven: true, color: '#0F766E', opacity: 0.22 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_intersection_line_planes', refs: ['plP', 'plQ'], description: 'Dựng giao tuyến d = (P) ∩ (Q).' },
      perturb: [],
      hints: [
        'Vectơ chỉ phương giao tuyến là $[\\vec{n}_P, \\vec{n}_Q] = (2; 0; -2)$.',
        'Chọn công cụ "Giao tuyến hai mặt phẳng".',
        'Nhấp vào (P) rồi nhấp vào (Q).',
      ],
      sol: { id: 's1', actionText: 'Dựng giao tuyến của (P) và (Q).', mathExplanation: 'Giao tuyến đi qua $(1; 1; 1)$ với vectơ chỉ phương $(1; 0; -1)$.', addInput: { id: 'sol_d', kind: 'line', rule: 'intersect_plane_plane', parents: ['plP', 'plQ'], label: 'd', style: { color: '#DC2626' } } },
      proof: 'Hai mặt phẳng có hai vectơ pháp tuyến không cùng phương nên cắt nhau theo giao tuyến duy nhất.',
    },
    {
      order: 7,
      title: 'Dựng đường tròn giao tuyến của mặt cầu và mặt phẳng',
      desc: 'Cho mặt cầu $(S)$ tâm $I(0; 0; 2)$, bán kính $R = 2,5$ và mặt phẳng $(P): z = 2,8$. Hãy dựng thiết diện đường tròn.',
      hyp: 'Cho mặt cầu $(S)$ và mặt phẳng cắt $(P)$ thỏa $d(I,(P)) < R$.',
      goal: 'Dựng thiết diện đường tròn $(S) \\cap (P)$.',
      diff: 'Khá',
      setup: () => {
        let sc = createEmptyScene3D();
        sc.displayMode = 'oxyz';
        sc.showAxes = true;
        sc = addGeo3DObject(sc, { id: 'sph', kind: 'solid', rule: 'solid_sphere', solidType: 'sphere', label: '(S)', center: v3(0, 0, 2), params: { r: 2.5 }, style: { isGiven: true, color: '#0284C7', opacity: 0.22 }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: -2.8 }, label: '(P)', style: { isGiven: true, color: '#0F766E', opacity: 0.14 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 12 }, description: 'Dựng đường tròn giao tuyến của (S) và (P).' },
      perturb: [],
      hints: [
        'Vì $d(I,(P)) = 0,8 < R = 2,5$ nên mặt phẳng cắt mặt cầu theo một đường tròn bán kính $r = \\sqrt{R^2 - d^2}$.',
        'Chọn công cụ "Dựng thiết diện" trong nhóm Thiết diện.',
        'Nhấp vào mặt cầu (S) rồi nhấp vào mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Dựng đường tròn thiết diện (S) ∩ (P).', mathExplanation: 'Bán kính đường tròn giao tuyến $r = \\sqrt{2,5^2 - 0,8^2} \\approx 2,37$.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['sph', 'plP'], label: 'Đường tròn giao tuyến' } },
      proof: 'Theo định lí Pythagoras trong không gian, bán kính đường tròn giao tuyến là $r = \\sqrt{R^2 - d^2}$.',
    },
    {
      order: 8,
      title: 'Dựng hình chiếu vuông góc lên mặt phẳng tổng quát trong Oxyz',
      desc: 'Cho mặt phẳng $(P): x + 2y + 2z - 6 = 0$ và điểm $M(2; 2; 4)$. Hãy dựng hình chiếu vuông góc $H$ của $M$ lên $(P)$.',
      hyp: 'Cho mặt phẳng $(P)$ và điểm $M(2; 2; 4)$.',
      goal: 'Dựng hình chiếu vuông góc $H$ của $M$ lên $(P)$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = givenPointsScene([{ id: 'M', label: 'M(2;2;4)', pos: v3(2, 2, 4) }], 'oxyz', true);
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 2, c: 2, d: -6 }, label: '(P)', style: { isGiven: true, opacity: 0.22 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_foot_on_plane', refs: ['M', 'plP'], description: 'Dựng hình chiếu H của M lên (P).' },
      perturb: ['M'],
      hints: [
        'Đường thẳng qua $M$ vuông góc $(P)$ có vectơ chỉ phương $\\vec{n} = (1; 2; 2)$.',
        'Dùng công cụ "Hình chiếu vuông góc lên mặt phẳng".',
        'Nhấp điểm M rồi nhấp mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Dựng hình chiếu vuông góc H của M lên (P).', mathExplanation: 'Tọa độ $H = M - \\frac{Ax_M+By_M+Cz_M+D}{A^2+B^2+C^2}\\vec{n}$.', addInput: { id: 'sol_H', kind: 'point', rule: 'foot_point_plane', parents: ['M', 'plP'], label: 'H', style: { color: '#DC2626' } } },
      proof: 'Hình chiếu $H$ là giao điểm của đường thẳng pháp tuyến qua $M$ với mặt phẳng $(P)$.',
    },
    {
      order: 9,
      title: 'Viết và dựng mặt phẳng song song qua điểm trong Oxyz',
      desc: 'Cho mặt phẳng $(P): x + y + 2z - 2 = 0$ và điểm $M(1; 1; 3)$. Hãy dựng mặt phẳng $(Q)$ đi qua $M$ và song song với $(P)$.',
      hyp: 'Cho mặt phẳng $(P)$ và điểm $M(1; 1; 3)$.',
      goal: 'Dựng mặt phẳng $(Q)$ qua $M$ song song với $(P)$.',
      diff: 'Trung bình',
      setup: () => {
        let sc = givenPointsScene([{ id: 'M', label: 'M(1;1;3)', pos: v3(1, 1, 3) }], 'oxyz', true);
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 2, d: -2 }, label: '(P)', style: { isGiven: true, opacity: 0.2 }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_plane_parallel_to_through', refs: ['M', 'plP'], description: 'Dựng mặt phẳng (Q) qua M song song (P).' },
      perturb: ['M'],
      hints: [
        'Mặt phẳng $(Q) \\parallel (P)$ có dạng $x + y + 2z + D\' = 0$.',
        'Chọn công cụ "Mặt phẳng song song qua điểm".',
        'Nhấp điểm M rồi nhấp mặt phẳng (P).',
      ],
      sol: { id: 's1', actionText: 'Dựng mặt phẳng (Q) qua M song song (P).', mathExplanation: 'Thay $M(1;1;3)$ ta có $1+1+6+D\'=0 \\Rightarrow D\'=-8$.', addInput: { id: 'sol_Q', kind: 'plane', rule: 'plane_parallel_point', parents: ['M', 'plP'], label: '(Q)' } },
      proof: 'Hai mặt phẳng có cùng vectơ pháp tuyến $(1;1;2)$ và đi qua hai điểm không thuộc nhau nên song song.',
    },
    {
      order: 10,
      title: 'Khoảng cách từ điểm đến đường thẳng trong Oxyz',
      desc: 'Cho điểm $M(2; 2; 3)$ và đường thẳng $d$ đi qua $A(0; 0; 0)$, $B(2; 0; 0)$. Hãy tính khoảng cách $d(M, d)$.',
      hyp: 'Cho điểm $M(2; 2; 3)$ và đường thẳng $d$.',
      goal: 'Đo khoảng cách từ điểm $M$ đến đường thẳng $d$.',
      diff: 'Khá',
      setup: () => {
        let sc = givenPointsScene(
          [
            { id: 'A', label: 'A', pos: v3(0, 0, 0) },
            { id: 'B', label: 'B', pos: v3(3, 0, 0) },
            { id: 'M', label: 'M', pos: v3(2, 2, 3) },
          ],
          'oxyz',
          true
        );
        sc = addGeo3DObject(sc, { id: 'ld', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd', style: { isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rule: { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_pl' }, description: 'Đo khoảng cách d(M, d).' },
      perturb: ['A', 'B', 'M'],
      hints: [
        '$d(M, d) = \\frac{|[\\overrightarrow{AM}, \\vec{u}_d]|}{|\\vec{u}_d|}$.',
        'Mở nhóm Đo lường và chọn "Khoảng cách từ điểm đến đường thẳng".',
        'Nhấp vào điểm M rồi nhấp vào đường thẳng d.',
      ],
      sol: { id: 's1', actionText: 'Đo khoảng cách từ M đến đường thẳng d.', mathExplanation: '$d(M, d) = \\sqrt{2^2 + 3^2} = \\sqrt{13} \\approx 3,61$.', addInput: { id: 'sol_m', kind: 'measurement', rule: 'measure_distance_pl', parents: ['M', 'ld'], label: 'd(M,d)', metricKind: 'distance' } },
      proof: 'Diện tích hình bình hành tạo bởi $\\overrightarrow{AM}$ và $\\vec{u}_d$ chia cho $|\\vec{u}_d|$ bằng đúng chiều cao $d(M, d)$.',
    },
  ];

  for (const s of l6Specs) {
    list.push({
      id: `S3D_L06_C${String(s.order).padStart(2, '0')}`,
      levelId: 6,
      order: s.order,
      title: s.title,
      description: s.desc,
      hypothesis: s.hyp,
      goal: s.goal,
      difficulty: s.diff,
      curriculumTag: 'Toán 12',
      allowedTools: ALL_3D_TOOLS,
      targetSteps: 1,
      buildInitialScene: s.setup,
      validationRules: [s.rule],
      perturbFreePointIds: s.perturb,
      hints: s.hints,
      solutionSteps: [s.sol],
      proof: s.proof,
    });
  }

  return list;
}

export const ALL_CHALLENGES_3D: Challenge3DDefinition[] = [
  ...CHALLENGES_3D,
  ...buildLevel2To6Challenges(),
];

export const TOTAL_POSSIBLE_3D_STARS = ALL_CHALLENGES_3D.length * 3; // 60 * 3 = 180 stars (strictly separate from 2D 540 stars)

export function getChallenges3DByLevel(levelId: number): Challenge3DDefinition[] {
  return ALL_CHALLENGES_3D.filter((c) => c.levelId === levelId).sort((a, b) => a.order - b.order);
}

export function getChallenge3DById(id: string): Challenge3DDefinition | undefined {
  return ALL_CHALLENGES_3D.find((c) => c.id === id);
}
