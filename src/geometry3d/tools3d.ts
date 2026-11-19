import type { Geo3DSolid, Tool3DId } from './types3d';

export interface Tool3DInfo {
  id: Tool3DId;
  name: string;
  group:
    | 'select'
    | 'point'
    | 'line'
    | 'plane'
    | 'polygon'
    | 'solid'
    | 'relation'
    | 'transform'
    | 'section'
    | 'measure'
    | 'text';
  tooltip: string;
  actionPrompt: string;
  expectedInputs: Array<'point' | 'line_like' | 'plane_like' | 'solid' | 'vector' | 'any'>;
  isExtended?: boolean;
}

export const TOOL3D_GROUPS: Array<{
  id: Tool3DInfo['group'];
  label: string;
  isExtended?: boolean;
}> = [
  { id: 'select', label: 'Chọn và di chuyển' },
  { id: 'point', label: 'Điểm (12)' },
  { id: 'line', label: 'Đường (10)' },
  { id: 'plane', label: 'Mặt phẳng (8)' },
  { id: 'polygon', label: 'Đa giác' },
  { id: 'solid', label: 'Hình khối' },
  { id: 'relation', label: 'Quan hệ hình học' },
  { id: 'transform', label: 'Phép biến hình (Mở rộng)', isExtended: true },
  { id: 'section', label: 'Thiết diện' },
  { id: 'measure', label: 'Đo lường' },
  { id: 'text', label: 'Văn bản và công thức' },
];

export const TOOL3D_CATALOG: Record<Tool3DId, Tool3DInfo> = {
  select: {
    id: 'select',
    name: 'Chọn và di chuyển',
    group: 'select',
    tooltip: 'Nhấp vào điểm, cạnh, mặt phẳng hoặc hình khối để xem thuộc tính; kéo điểm tự do theo mặt phẳng làm việc.',
    actionPrompt: 'Nhấp chọn đối tượng để xem thuộc tính hoặc kéo giữ chuột để xoay góc nhìn 3D.',
    expectedInputs: [],
  },
  pan_orbit: {
    id: 'pan_orbit',
    name: 'Xoay & Dịch chuyển góc nhìn',
    group: 'select',
    tooltip: 'Kéo chuột trái để xoay 360°, giữ Shift hoặc chuột phải để dịch chuyển, cuộn chuột để phóng to/thu nhỏ.',
    actionPrompt: 'Kéo chuột để xoay hình 360°, cuộn chuột để phóng to/thu nhỏ, chuột phải để dịch chuyển.',
    expectedInputs: [],
  },
  // Points (12)
  point_free: {
    id: 'point_free',
    name: 'Điểm tự do trên mặt phẳng làm việc',
    group: 'point',
    tooltip: 'Nhấp vào không gian để tạo điểm trên mặt phẳng làm việc đang chọn (Oxy, Oxz, Oyz hoặc mặt phẳng tùy chỉnh).',
    actionPrompt: 'Nhấp vào mặt phẳng làm việc hiện tại để tạo điểm tự do (có thể đổi mặt phẳng ở thanh dưới).',
    expectedInputs: [],
  },
  point_coords: {
    id: 'point_coords',
    name: 'Điểm theo tọa độ (x; y; z)',
    group: 'point',
    tooltip: 'Nhập chính xác tọa độ x, y, z trong hệ trục Oxyz để tạo điểm.',
    actionPrompt: 'Nhập tọa độ (x; y; z) trong hộp thoại nhanh rồi nhấn Tạo điểm.',
    expectedInputs: [],
  },
  point_on_line: {
    id: 'point_on_line',
    name: 'Điểm trên đường thẳng',
    group: 'point',
    tooltip: 'Chọn một đường thẳng để gắn điểm chạy dọc theo đường thẳng đó.',
    actionPrompt: 'Nhấp chọn một đường thẳng hoặc tia để đặt điểm ràng buộc lên đó.',
    expectedInputs: ['line_like'],
  },
  point_on_segment: {
    id: 'point_on_segment',
    name: 'Điểm trên đoạn thẳng',
    group: 'point',
    tooltip: 'Chọn một đoạn thẳng để tạo điểm di chuyển trong phạm vi hai đầu mút.',
    actionPrompt: 'Nhấp chọn một đoạn thẳng để gắn điểm ràng buộc lên đoạn thẳng đó.',
    expectedInputs: ['line_like'],
  },
  point_on_plane: {
    id: 'point_on_plane',
    name: 'Điểm trên mặt phẳng',
    group: 'point',
    tooltip: 'Chọn một mặt phẳng để tạo điểm luôn nằm trong mặt phẳng đó.',
    actionPrompt: 'Nhấp chọn một mặt phẳng (hoặc đa giác) để tạo điểm nằm trong mặt phẳng đó.',
    expectedInputs: ['plane_like'],
  },
  midpoint: {
    id: 'midpoint',
    name: 'Trung điểm của đoạn thẳng',
    group: 'point',
    tooltip: 'Chọn 2 điểm (hoặc 1 đoạn thẳng) để dựng trung điểm phụ thuộc động.',
    actionPrompt: 'Chọn hai điểm A và B để dựng trung điểm M của đoạn thẳng AB.',
    expectedInputs: ['point', 'point'],
  },
  intersect_ll: {
    id: 'intersect_ll',
    name: 'Giao điểm hai đường thẳng',
    group: 'point',
    tooltip: 'Chọn hai đường thẳng cắt nhau để xác định giao điểm duy nhất.',
    actionPrompt: 'Chọn lần lượt hai đường thẳng (hoặc đoạn thẳng) cắt nhau để tìm giao điểm.',
    expectedInputs: ['line_like', 'line_like'],
  },
  intersect_lp: {
    id: 'intersect_lp',
    name: 'Giao điểm đường thẳng và mặt phẳng',
    group: 'point',
    tooltip: 'Chọn 1 đường thẳng rồi chọn 1 mặt phẳng để xác định giao điểm.',
    actionPrompt: 'Chọn một đường thẳng trước, sau đó chọn một mặt phẳng để tìm giao điểm.',
    expectedInputs: ['line_like', 'plane_like'],
  },
  foot_line: {
    id: 'foot_line',
    name: 'Hình chiếu vuông góc lên đường thẳng',
    group: 'point',
    tooltip: 'Chọn 1 điểm rồi chọn 1 đường thẳng để dựng hình chiếu vuông góc.',
    actionPrompt: 'Chọn điểm cần chiếu, sau đó chọn đường thẳng để dựng hình chiếu vuông góc.',
    expectedInputs: ['point', 'line_like'],
  },
  foot_plane: {
    id: 'foot_plane',
    name: 'Hình chiếu vuông góc lên mặt phẳng',
    group: 'point',
    tooltip: 'Chọn 1 điểm rồi chọn 1 mặt phẳng để dựng hình chiếu vuông góc H.',
    actionPrompt: 'Chọn điểm cần chiếu trước, sau đó chọn mặt phẳng để dựng hình chiếu vuông góc.',
    expectedInputs: ['point', 'plane_like'],
  },
  reflect_point: {
    id: 'reflect_point',
    name: 'Điểm đối xứng qua điểm',
    group: 'point',
    tooltip: 'Chọn điểm gốc rồi chọn tâm đối xứng để dựng điểm đối xứng.',
    actionPrompt: 'Chọn điểm gốc trước, sau đó chọn điểm làm tâm đối xứng.',
    expectedInputs: ['point', 'point'],
  },
  reflect_plane: {
    id: 'reflect_plane',
    name: 'Điểm đối xứng qua mặt phẳng',
    group: 'point',
    tooltip: 'Chọn điểm gốc rồi chọn mặt phẳng đối xứng.',
    actionPrompt: 'Chọn điểm gốc trước, sau đó chọn mặt phẳng đối xứng.',
    expectedInputs: ['point', 'plane_like'],
  },

  // Lines (10)
  segment: {
    id: 'segment',
    name: 'Đoạn thẳng qua hai điểm',
    group: 'line',
    tooltip: 'Chọn hai điểm phân biệt để nối thành đoạn thẳng 3D.',
    actionPrompt: 'Chọn hai điểm để tạo đoạn thẳng.',
    expectedInputs: ['point', 'point'],
  },
  line: {
    id: 'line',
    name: 'Đường thẳng qua hai điểm',
    group: 'line',
    tooltip: 'Chọn hai điểm phân biệt để dựng đường thẳng kéo dài vô hạn hai phía.',
    actionPrompt: 'Chọn hai điểm phân biệt để tạo đường thẳng.',
    expectedInputs: ['point', 'point'],
  },
  ray: {
    id: 'ray',
    name: 'Tia',
    group: 'line',
    tooltip: 'Chọn điểm gốc rồi chọn điểm định hướng để tạo tia trong không gian.',
    actionPrompt: 'Chọn điểm gốc trước, sau đó chọn điểm hướng để tạo tia.',
    expectedInputs: ['point', 'point'],
  },
  vector: {
    id: 'vector',
    name: 'Vectơ',
    group: 'line',
    tooltip: 'Chọn điểm đầu và điểm cuối (hoặc nhập tọa độ) để tạo vectơ 3D có mũi tên.',
    actionPrompt: 'Chọn điểm đầu rồi chọn điểm cuối để tạo vectơ trong không gian.',
    expectedInputs: ['point', 'point'],
  },
  parallel_line: {
    id: 'parallel_line',
    name: 'Đường thẳng song song qua điểm',
    group: 'line',
    tooltip: 'Chọn 1 điểm và 1 đường thẳng đã cho để dựng đường thẳng đi qua điểm và song song.',
    actionPrompt: 'Chọn điểm đi qua trước, sau đó chọn đường thẳng song song tham chiếu.',
    expectedInputs: ['point', 'line_like'],
  },
  perp_line_plane: {
    id: 'perp_line_plane',
    name: 'Đường thẳng vuông góc với mặt phẳng',
    group: 'line',
    tooltip: 'Chọn 1 điểm và 1 mặt phẳng để dựng đường thẳng đi qua điểm và vuông góc mặt phẳng.',
    actionPrompt: 'Chọn một điểm trước, sau đó chọn mặt phẳng để dựng đường thẳng vuông góc.',
    expectedInputs: ['point', 'plane_like'],
  },
  line_dir_vector: {
    id: 'line_dir_vector',
    name: 'Đường thẳng theo điểm & vectơ chỉ phương',
    group: 'line',
    tooltip: 'Nhập điểm đi qua và vectơ chỉ phương u = (a; b; c) (hoặc phương trình tham số / chính tắc).',
    actionPrompt: 'Nhập tọa độ điểm đi qua và vectơ chỉ phương trong hộp thoại Oxyz.',
    expectedInputs: [],
  },
  intersect_pp: {
    id: 'intersect_pp',
    name: 'Giao tuyến hai mặt phẳng',
    group: 'line',
    tooltip: 'Chọn hai mặt phẳng cắt nhau để dựng đường thẳng giao tuyến chính xác.',
    actionPrompt: 'Chọn lần lượt hai mặt phẳng cắt nhau để dựng giao tuyến.',
    expectedInputs: ['plane_like', 'plane_like'],
  },
  common_perp: {
    id: 'common_perp',
    name: 'Đường vuông góc chung hai đường chéo nhau',
    group: 'line',
    tooltip: 'Chọn hai đường thẳng chéo nhau để dựng đường vuông góc chung duy nhất.',
    actionPrompt: 'Chọn hai đường thẳng chéo nhau để dựng đường vuông góc chung.',
    expectedInputs: ['line_like', 'line_like'],
  },
  circle_plane: {
    id: 'circle_plane',
    name: 'Đường tròn trong mặt phẳng',
    group: 'line',
    tooltip: 'Chọn tâm, mặt phẳng chứa và một điểm trên đường tròn (hoặc nhập bán kính).',
    actionPrompt: 'Chọn điểm tâm, mặt phẳng chứa và điểm đi qua để dựng đường tròn trong không gian.',
    expectedInputs: ['point', 'plane_like', 'point'],
  },

  // Planes (8)
  plane_3pts: {
    id: 'plane_3pts',
    name: 'Mặt phẳng qua ba điểm không thẳng hàng',
    group: 'plane',
    tooltip: 'Chọn ba điểm không thẳng hàng A, B, C để dựng mặt phẳng (ABC).',
    actionPrompt: 'Chọn ba điểm không thẳng hàng để tạo mặt phẳng.',
    expectedInputs: ['point', 'point', 'point'],
  },
  plane_line_pt: {
    id: 'plane_line_pt',
    name: 'Mặt phẳng qua đường thẳng và điểm',
    group: 'plane',
    tooltip: 'Chọn một đường thẳng và một điểm không thuộc đường thẳng đó.',
    actionPrompt: 'Chọn đường thẳng trước, sau đó chọn điểm nằm ngoài đường thẳng đó.',
    expectedInputs: ['line_like', 'point'],
  },
  plane_2lines_inter: {
    id: 'plane_2lines_inter',
    name: 'Mặt phẳng chứa hai đường thẳng cắt nhau',
    group: 'plane',
    tooltip: 'Chọn hai đường thẳng cắt nhau để dựng mặt phẳng duy nhất chứa chúng.',
    actionPrompt: 'Chọn lần lượt hai đường thẳng cắt nhau.',
    expectedInputs: ['line_like', 'line_like'],
  },
  plane_2lines_para: {
    id: 'plane_2lines_para',
    name: 'Mặt phẳng chứa hai đường thẳng song song',
    group: 'plane',
    tooltip: 'Chọn hai đường thẳng song song phân biệt để dựng mặt phẳng chứa chúng.',
    actionPrompt: 'Chọn lần lượt hai đường thẳng song song phân biệt.',
    expectedInputs: ['line_like', 'line_like'],
  },
  plane_parallel: {
    id: 'plane_parallel',
    name: 'Mặt phẳng song song qua điểm',
    group: 'plane',
    tooltip: 'Chọn 1 điểm và 1 mặt phẳng đã cho để dựng mặt phẳng song song đi qua điểm đó.',
    actionPrompt: 'Chọn điểm đi qua trước, sau đó chọn mặt phẳng song song tham chiếu.',
    expectedInputs: ['point', 'plane_like'],
  },
  plane_perp_line: {
    id: 'plane_perp_line',
    name: 'Mặt phẳng vuông góc với đường thẳng',
    group: 'plane',
    tooltip: 'Chọn 1 điểm và 1 đường thẳng để dựng mặt phẳng đi qua điểm và vuông góc đường thẳng.',
    actionPrompt: 'Chọn điểm đi qua trước, sau đó chọn đường thẳng pháp tuyến.',
    expectedInputs: ['point', 'line_like'],
  },
  plane_normal: {
    id: 'plane_normal',
    name: 'Mặt phẳng qua điểm & vectơ pháp tuyến',
    group: 'plane',
    tooltip: 'Nhập điểm đi qua M(x₀; y₀; z₀) và vectơ pháp tuyến n = (A; B; C).',
    actionPrompt: 'Nhập tọa độ điểm và vectơ pháp tuyến trong bảng nhập Oxyz.',
    expectedInputs: [],
  },
  plane_equation: {
    id: 'plane_equation',
    name: 'Mặt phẳng theo phương trình Ax+By+Cz+D=0',
    group: 'plane',
    tooltip: 'Nhập các hệ số A, B, C, D (với A, B, C không đồng thời bằng 0) để dựng mặt phẳng.',
    actionPrompt: 'Nhập hệ số A, B, C, D của phương trình tổng quát Ax + By + Cz + D = 0.',
    expectedInputs: [],
  },

  // Polygon
  polygon: {
    id: 'polygon',
    name: 'Đa giác không gian',
    group: 'polygon',
    tooltip: 'Chọn lần lượt 3 đỉnh trở lên (nhấn "Hoàn tất đa giác" hoặc nhấp lại đỉnh đầu) để tạo mặt đa giác.',
    actionPrompt: 'Chọn ít nhất 3 điểm đỉnh, sau đó nhấn "Tạo đa giác" để khép kín mặt.',
    expectedInputs: ['point', 'point', 'point'],
  },

  // Solids
  solid_library: {
    id: 'solid_library',
    name: 'Chèn hình khối 3D (Đa diện & Tròn xoay)',
    group: 'solid',
    tooltip: 'Mở danh sách 18 loại hình đa diện và hình tròn xoay có đầy đủ tham số chỉnh sửa.',
    actionPrompt: 'Chọn loại hình khối trong bảng bên để đưa trực tiếp vào không gian dựng hình.',
    expectedInputs: [],
  },

  // Relation analyzer
  analyze_relation: {
    id: 'analyze_relation',
    name: 'Phân tích quan hệ hình học',
    group: 'relation',
    tooltip: 'Kiểm tra song song, vuông góc, cắt nhau, chéo nhau, thẳng hàng, đồng phẳng bằng tọa độ & vectơ.',
    actionPrompt: 'Chọn 2 đối tượng (đường–đường, đường–mặt, mặt–mặt) hoặc 3–4 điểm để phân tích quan hệ.',
    expectedInputs: ['any', 'any'],
  },

  // Transforms (Extended)
  transform_3d: {
    id: 'transform_3d',
    name: 'Phép biến hình không gian (Mở rộng)',
    group: 'transform',
    tooltip: 'Tịnh tiến, quay quanh trục, đối xứng tâm, đối xứng mặt phẳng, vị tự kèm thanh trượt quan sát trước & sau.',
    actionPrompt: 'Chọn phép biến hình và kéo thanh trượt t từ 0% đến 100% để quan sát quá trình biến đổi.',
    expectedInputs: [],
    isExtended: true,
  },

  // Cross-section
  cross_section: {
    id: 'cross_section',
    name: 'Dựng thiết diện (Hình khối ∩ Mặt phẳng)',
    group: 'section',
    tooltip: 'Chọn 1 hình khối và 1 mặt phẳng cắt (hoặc 3 điểm không thẳng hàng) để dựng thiết diện chính xác.',
    actionPrompt: 'Chọn hình khối trước, sau đó chọn mặt phẳng cắt để tự động xác định và tô màu thiết diện.',
    expectedInputs: ['solid', 'plane_like'],
  },

  // Measurements
  measure_length: {
    id: 'measure_length',
    name: 'Đo khoảng cách hai điểm / Độ dài đoạn',
    group: 'measure',
    tooltip: 'Chọn 2 điểm để đo chính xác độ dài đoạn thẳng.',
    actionPrompt: 'Chọn hai điểm để đo khoảng cách giữa chúng.',
    expectedInputs: ['point', 'point'],
  },
  measure_angle_vec: {
    id: 'measure_angle_vec',
    name: 'Đo góc giữa hai vectơ',
    group: 'measure',
    tooltip: 'Chọn hai vectơ để tính góc trong khoảng [0°; 180°].',
    actionPrompt: 'Chọn lần lượt hai vectơ để đo góc giữa chúng.',
    expectedInputs: ['vector', 'vector'],
  },
  measure_angle_ll: {
    id: 'measure_angle_ll',
    name: 'Đo góc giữa hai đường thẳng',
    group: 'measure',
    tooltip: 'Chọn hai đường thẳng để tính góc nhọn/vuông trong [0°; 90°].',
    actionPrompt: 'Chọn hai đường thẳng để đo góc giữa hai đường thẳng.',
    expectedInputs: ['line_like', 'line_like'],
  },
  measure_angle_lp: {
    id: 'measure_angle_lp',
    name: 'Đo góc giữa đường thẳng và mặt phẳng',
    group: 'measure',
    tooltip: 'Chọn 1 đường thẳng và 1 mặt phẳng để tính góc trong [0°; 90°].',
    actionPrompt: 'Chọn đường thẳng trước, sau đó chọn mặt phẳng để đo góc.',
    expectedInputs: ['line_like', 'plane_like'],
  },
  measure_angle_pp: {
    id: 'measure_angle_pp',
    name: 'Đo góc giữa hai mặt phẳng',
    group: 'measure',
    tooltip: 'Chọn hai mặt phẳng để tính góc giữa hai mặt phẳng trong [0°; 90°].',
    actionPrompt: 'Chọn hai mặt phẳng để đo góc giữa chúng (từ 0° đến 90°).',
    expectedInputs: ['plane_like', 'plane_like'],
  },
  measure_dihedral: {
    id: 'measure_dihedral',
    name: 'Đo góc nhị diện [P, AB, Q]',
    group: 'measure',
    tooltip: 'Chọn 4 điểm P, A, B, Q để đo góc nhị diện trong [0°; 180°] — phân biệt rõ với góc giữa hai mặt phẳng.',
    actionPrompt: 'Chọn lần lượt 4 điểm: P (nửa mặt 1), A và B (cạnh nhị diện), Q (nửa mặt 2).',
    expectedInputs: ['point', 'point', 'point', 'point'],
  },
  measure_dist_pl: {
    id: 'measure_dist_pl',
    name: 'Khoảng cách từ điểm đến đường thẳng',
    group: 'measure',
    tooltip: 'Chọn 1 điểm và 1 đường thẳng để tính khoảng cách vuông góc.',
    actionPrompt: 'Chọn điểm trước, sau đó chọn đường thẳng.',
    expectedInputs: ['point', 'line_like'],
  },
  measure_dist_pplane: {
    id: 'measure_dist_pplane',
    name: 'Khoảng cách từ điểm đến mặt phẳng',
    group: 'measure',
    tooltip: 'Chọn 1 điểm và 1 mặt phẳng để tính khoảng cách vuông góc.',
    actionPrompt: 'Chọn điểm trước, sau đó chọn mặt phẳng.',
    expectedInputs: ['point', 'plane_like'],
  },
  measure_dist_skew: {
    id: 'measure_dist_skew',
    name: 'Khoảng cách hai đường thẳng chéo nhau',
    group: 'measure',
    tooltip: 'Chọn hai đường thẳng chéo nhau để tính khoảng cách ngắn nhất giữa chúng.',
    actionPrompt: 'Chọn lần lượt hai đường thẳng chéo nhau.',
    expectedInputs: ['line_like', 'line_like'],
  },
  measure_dist_planes: {
    id: 'measure_dist_planes',
    name: 'Khoảng cách hai mặt phẳng song song',
    group: 'measure',
    tooltip: 'Chọn hai mặt phẳng song song để tính khoảng cách giữa chúng.',
    actionPrompt: 'Chọn lần lượt hai mặt phẳng song song.',
    expectedInputs: ['plane_like', 'plane_like'],
  },

  // Formula & Text
  formula_note: {
    id: 'formula_note',
    name: 'Chèn công thức & ghi chú Toán học',
    group: 'text',
    tooltip: 'Mở trình soạn thảo công thức Toán học trực quan để gắn công thức vào hình 3D.',
    actionPrompt: 'Soạn công thức Toán học trong trình soạn thảo rồi nhấn Áp dụng để chèn lên không gian 3D.',
    expectedInputs: [],
  },
};

export interface SolidCatalogItem {
  solidType: Geo3DSolid['solidType'];
  name: string;
  category: 'polyhedron' | 'revolution';
  curriculumTag: 'Toán 11' | 'Toán 12' | 'Kiến thức mở rộng';
  defaultParams: Record<string, number>;
  formulaLatex: string;
  description: string;
}

export const SOLID_CATALOG: SolidCatalogItem[] = [
  // A. Polyhedra
  {
    solidType: 'tetrahedron',
    name: 'Hình tứ diện',
    category: 'polyhedron',
    curriculumTag: 'Toán 11',
    defaultParams: { a: 4.2, b: 3.4, h: 3.6, apexX: -0.4, apexY: 0.3 },
    formulaLatex: 'V = \\frac{1}{3}S_{\\text{đáy}} \\cdot h',
    description: 'Khối đa diện cơ bản gồm 4 đỉnh, 6 cạnh, 4 mặt tam giác.',
  },
  {
    solidType: 'regular_tetrahedron',
    name: 'Hình tứ diện đều',
    category: 'polyhedron',
    curriculumTag: 'Toán 11',
    defaultParams: { a: 4 },
    formulaLatex: 'V = \\frac{a^3\\sqrt{2}}{12}',
    description: 'Bốn mặt là bốn tam giác đều bằng nhau cạnh a.',
  },
  {
    solidType: 'cube',
    name: 'Hình lập phương',
    category: 'polyhedron',
    curriculumTag: 'Toán 11',
    defaultParams: { a: 3.5 },
    formulaLatex: 'V = a^3,\\; S_{tp} = 6a^2',
    description: '8 đỉnh, 12 cạnh bằng nhau, 6 mặt là hình vuông.',
  },
  {
    solidType: 'box',
    name: 'Hình hộp chữ nhật',
    category: 'polyhedron',
    curriculumTag: 'Toán 11',
    defaultParams: { a: 4.5, b: 3, c: 2.8 },
    formulaLatex: 'V = abc',
    description: 'Ba kích thước a, b, c đôi một vuông góc.',
  },
  {
    solidType: 'parallelepiped',
    name: 'Hình hộp',
    category: 'polyhedron',
    curriculumTag: 'Toán 11',
    defaultParams: { a: 4, b: 3, h: 3, skewX: 1.1, skewY: 0.6 },
    formulaLatex: 'V = S_{\\text{đáy}} \\cdot h',
    description: 'Sáu mặt đều là hình bình hành; có thể chỉnh độ nghiêng cạnh bên.',
  },
  {
    solidType: 'prism',
    name: 'Hình lăng trụ tam giác',
    category: 'polyhedron',
    curriculumTag: 'Toán 11',
    defaultParams: { sides: 3, a: 3.6, h: 4, skewX: 0.9, skewY: 0.4 },
    formulaLatex: 'V = S_{\\text{đáy}} \\cdot h',
    description: 'Hai đáy là tam giác song song bằng nhau, các mặt bên là hình bình hành.',
  },
  {
    solidType: 'right_prism',
    name: 'Hình lăng trụ đứng',
    category: 'polyhedron',
    curriculumTag: 'Toán 11',
    defaultParams: { sides: 4, a: 3.2, h: 4.2 },
    formulaLatex: 'V = S_{\\text{đáy}} \\cdot h',
    description: 'Các cạnh bên vuông góc với mặt phẳng đáy (chỉnh được số cạnh đáy 3–8).',
  },
  {
    solidType: 'pyramid',
    name: 'Hình chóp đa giác',
    category: 'polyhedron',
    curriculumTag: 'Toán 11',
    defaultParams: { sides: 4, a: 3.8, h: 4.2, apexX: -0.6, apexY: 0.4 },
    formulaLatex: 'V = \\frac{1}{3}S_{\\text{đáy}} \\cdot h',
    description: 'Hình chóp S.ABC / S.ABCD / ngũ giác / lục giác tùy chọn số cạnh đáy.',
  },
  {
    solidType: 'regular_pyramid',
    name: 'Hình chóp đều',
    category: 'polyhedron',
    curriculumTag: 'Toán 11',
    defaultParams: { sides: 4, a: 3.6, h: 4.2 },
    formulaLatex: 'V = \\frac{1}{3}S_{\\text{đáy}} \\cdot h',
    description: 'Đáy là đa giác đều, chân đường cao trùng tâm đáy.',
  },
  {
    solidType: 'pyramid_frustum',
    name: 'Hình chóp cụt đều',
    category: 'polyhedron',
    curriculumTag: 'Toán 11',
    defaultParams: { sides: 4, a: 4, aTop: 2, h: 3.2 },
    formulaLatex: 'V = \\frac{h}{3}(S_1 + S_2 + \\sqrt{S_1 S_2})',
    description: 'Phần hình chóp nằm giữa đáy và mặt phẳng cắt song song đáy.',
  },
  {
    solidType: 'octahedron',
    name: 'Hình bát diện đều',
    category: 'polyhedron',
    curriculumTag: 'Kiến thức mở rộng',
    defaultParams: { a: 3.4 },
    formulaLatex: 'V = \\frac{\\sqrt{2}}{3}a^3',
    description: 'Khối đa diện đều 8 mặt tam giác đều (kiến thức mở rộng).',
  },
  {
    solidType: 'dodecahedron',
    name: 'Hình mười hai mặt đều',
    category: 'polyhedron',
    curriculumTag: 'Kiến thức mở rộng',
    defaultParams: { a: 1.8 },
    formulaLatex: 'V = \\frac{15+7\\sqrt{5}}{4}a^3',
    description: 'Khối đa diện đều 12 mặt ngũ giác đều (kiến thức mở rộng).',
  },
  {
    solidType: 'icosahedron',
    name: 'Hình hai mươi mặt đều',
    category: 'polyhedron',
    curriculumTag: 'Kiến thức mở rộng',
    defaultParams: { a: 2.4 },
    formulaLatex: 'V = \\frac{5(3+\\sqrt{5})}{12}a^3',
    description: 'Khối đa diện đều 20 mặt tam giác đều (kiến thức mở rộng).',
  },

  // B. Revolution solids
  {
    solidType: 'cylinder',
    name: 'Hình trụ',
    category: 'revolution',
    curriculumTag: 'Kiến thức mở rộng',
    defaultParams: { r: 2, h: 4 },
    formulaLatex: 'V = \\pi R^2 h,\\; S_{xq} = 2\\pi R h',
    description: 'Khối tròn xoay bán kính đáy R và chiều cao h.',
  },
  {
    solidType: 'cone',
    name: 'Hình nón',
    category: 'revolution',
    curriculumTag: 'Kiến thức mở rộng',
    defaultParams: { r: 2.2, h: 4.2 },
    formulaLatex: 'V = \\frac{1}{3}\\pi R^2 h,\\; S_{xq} = \\pi R l',
    description: 'Khối tròn xoay đỉnh S, bán kính đáy R, chiều cao h.',
  },
  {
    solidType: 'cone_frustum',
    name: 'Hình nón cụt',
    category: 'revolution',
    curriculumTag: 'Kiến thức mở rộng',
    defaultParams: { r: 2.4, rTop: 1.2, h: 3.4 },
    formulaLatex: 'V = \\frac{\\pi h}{3}(R^2 + Rr + r^2)',
    description: 'Khối nón cụt hai bán kính R, r và chiều cao h (kiến thức mở rộng).',
  },
  {
    solidType: 'sphere',
    name: 'Hình cầu / Mặt cầu',
    category: 'revolution',
    curriculumTag: 'Toán 12',
    defaultParams: { r: 2.4 },
    formulaLatex: 'V = \\frac{4}{3}\\pi R^3,\\; S = 4\\pi R^2',
    description: 'Tập hợp các điểm cách tâm I một khoảng không đổi R.',
  },
  {
    solidType: 'hemisphere',
    name: 'Bán cầu',
    category: 'revolution',
    curriculumTag: 'Kiến thức mở rộng',
    defaultParams: { r: 2.4 },
    formulaLatex: 'V = \\frac{2}{3}\\pi R^3,\\; S_{tp} = 3\\pi R^2',
    description: 'Nửa khối cầu bán kính R (kiến thức mở rộng).',
  },
];

export function getTool3DDef(id: Tool3DId): Tool3DInfo {
  return TOOL3D_CATALOG[id];
}

