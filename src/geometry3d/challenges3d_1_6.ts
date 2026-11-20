import { addGeo3DObject } from './engine3d';
import { v3 } from './math3d';
import type { Challenge3DDefinition } from './validator3d';
import {
  ALL_3D_TOOLS,
  BASIC_3D_TOOLS,
  addGivenLine,
  addGivenPlane3,
  addGivenSeg,
  buildBoxVerticesScene,
  buildPyramidABCDScene,
  buildTetrahedronScene,
  buildTriPrismScene,
  givenPointsScene,
  makeChallenge3D,
} from './challenges3d_helpers';

export function buildLevels1To6(): Challenge3DDefinition[] {
  const specs: Parameters<typeof makeChallenge3D>[0][] = [
    // =========================================================================
    // CẤP ĐỘ I: ĐIỂM, ĐƯỜNG THẲNG VÀ MẶT PHẲNG (10 thử thách — Toán 11)
    // =========================================================================
    {
      levelId: 1,
      order: 1,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đường thẳng và đoạn thẳng qua hai điểm phân biệt',
      title: 'Nối đoạn thẳng trong không gian',
      description: 'Cho hai điểm phân biệt $A$ và $B$ trong không gian. Hãy dựng đoạn thẳng $AB$.',
      hypothesis: 'Cho trước hai điểm $A, B$.',
      goal: 'Dựng đoạn thẳng $AB$ nối $A$ và $B$.',
      allowedTools: BASIC_3D_TOOLS,
      setup: () => givenPointsScene([{ id: 'A', label: 'A', pos: v3(-2, -1, 0) }, { id: 'B', label: 'B', pos: v3(2.4, 1.2, 2.2) }]),
      rules: [{ type: 'has_segment_between', refs: ['A', 'B'], description: 'Có đoạn thẳng AB nối A và B.' }],
      perturb: ['A', 'B'],
      hints: [
        'Qua hai điểm phân biệt trong không gian xác định duy nhất một đoạn thẳng.',
        'Mở nhóm công cụ Đường ở thanh bên trái và chọn Đoạn thẳng.',
        'Nhấp lần lượt vào điểm A và điểm B để nối đoạn thẳng AB.',
      ],
      steps: [{ id: 's1', actionText: 'Chọn Đoạn thẳng và nhấp lần lượt A, B.', mathExplanation: 'Hai điểm phân biệt A, B xác định đoạn thẳng AB.', addInput: { id: 'sol_ab', kind: 'segment', rule: 'segment_3d', parents: ['A', 'B'], label: 'AB' } }],
      proof: 'Hai điểm phân biệt $A, B$ trong không gian xác định duy nhất đoạn thẳng $AB$.',
    },
    {
      levelId: 1,
      order: 2,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tiên đề đường thẳng đi qua hai điểm phân biệt',
      title: 'Dựng đường thẳng đi qua hai điểm',
      description: 'Cho hai điểm $M$ và $N$ trong không gian. Hãy dựng đường thẳng $MN$.',
      hypothesis: 'Cho hai điểm phân biệt $M, N$.',
      goal: 'Dựng đường thẳng đi qua hai điểm $M$ và $N$.',
      allowedTools: BASIC_3D_TOOLS,
      setup: () => givenPointsScene([{ id: 'M', label: 'M', pos: v3(-1.8, -1.2, 0.5) }, { id: 'N', label: 'N', pos: v3(1.8, 1.4, 2.6) }]),
      rules: [{ type: 'has_line_through', refs: ['M', 'N'], description: 'Có đường thẳng đi qua M và N.' }],
      perturb: ['M', 'N'],
      hints: [
        'Có một và chỉ một đường thẳng đi qua hai điểm phân biệt cho trước.',
        'Chọn công cụ Đường thẳng trong nhóm Đường.',
        'Nhấp vào điểm M rồi nhấp vào điểm N.',
      ],
      steps: [{ id: 's1', actionText: 'Dựng đường thẳng đi qua M và N.', mathExplanation: 'Đường thẳng MN là duy nhất.', addInput: { id: 'sol_l', kind: 'line', rule: 'line_two_points', parents: ['M', 'N'], label: 'MN' } }],
      proof: 'Theo tính chất thừa nhận của hình học không gian, qua hai điểm phân biệt $M, N$ có duy nhất một đường thẳng.',
    },
    {
      levelId: 1,
      order: 3,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Xác định mặt phẳng qua ba điểm không thẳng hàng',
      title: 'Dựng mặt phẳng qua ba điểm không thẳng hàng',
      description: 'Cho ba điểm không thẳng hàng $A, B, C$. Hãy dựng mặt phẳng $(ABC)$.',
      hypothesis: 'Ba điểm $A, B, C$ không thẳng hàng.',
      goal: 'Dựng mặt phẳng $(ABC)$ đi qua ba điểm $A, B, C$.',
      allowedTools: BASIC_3D_TOOLS,
      setup: () => givenPointsScene([
        { id: 'A', label: 'A', pos: v3(-2, -1.5, 0) },
        { id: 'B', label: 'B', pos: v3(2.2, -1.2, 0.5) },
        { id: 'C', label: 'C', pos: v3(0.2, 2.1, 1.6) },
      ]),
      rules: [{ type: 'has_plane_through_points', refs: ['A', 'B', 'C'], description: 'Mặt phẳng đi qua cả ba điểm A, B, C.' }],
      perturb: ['A', 'B', 'C'],
      hints: [
        'Có một và chỉ một mặt phẳng đi qua ba điểm không thẳng hàng.',
        'Mở nhóm Mặt phẳng và chọn công cụ Mặt phẳng qua 3 điểm.',
        'Nhấp lần lượt vào A, B và C để xác định mặt phẳng (ABC).',
      ],
      steps: [{ id: 's1', actionText: 'Chọn Mặt phẳng qua 3 điểm rồi nhấp A, B, C.', mathExplanation: 'Ba điểm không thẳng hàng xác định duy nhất một mặt phẳng.', addInput: { id: 'sol_p', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'C'], label: '(ABC)' } }],
      proof: 'Ba điểm không thẳng hàng $A, B, C$ xác định duy nhất mặt phẳng $(ABC)$.',
    },
    {
      levelId: 1,
      order: 4,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Điểm thuộc đoạn thẳng và trung điểm trong không gian',
      title: 'Xác định trung điểm của cạnh bên tứ diện',
      description: 'Cho hình chóp tam giác $S.ABC$. Hãy dựng trung điểm $M$ của cạnh bên $SA$.',
      hypothesis: 'Hình chóp $S.ABC$ với các đỉnh đã cho.',
      goal: 'Dựng điểm $M$ là trung điểm đoạn thẳng $SA$.',
      allowedTools: BASIC_3D_TOOLS,
      setup: () => buildTetrahedronScene(),
      rules: [{ type: 'has_midpoint_of', refs: ['S', 'A'], description: 'Dựng trung điểm M của đoạn thẳng SA.' }],
      perturb: ['S', 'A'],
      hints: [
        'Trung điểm của đoạn thẳng SA chia SA thành hai đoạn bằng nhau và nằm trên SA.',
        'Mở nhóm Điểm và chọn công cụ Trung điểm.',
        'Nhấp lần lượt vào điểm S và điểm A.',
      ],
      steps: [{ id: 's1', actionText: 'Chọn Trung điểm và nhấp S, A.', mathExplanation: 'M là trung điểm của SA nên MS = MA.', addInput: { id: 'sol_m', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'A'], label: 'M' } }],
      proof: 'Điểm $M$ có tọa độ bằng trung bình cộng tọa độ hai đầu mút $S$ và $A$.',
    },
    {
      levelId: 1,
      order: 5,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Điểm thuộc mặt phẳng',
      title: 'Đặt điểm thuộc mặt phẳng cho trước',
      description: 'Cho mặt phẳng $(P)$ đi qua $A, B, C$. Hãy dựng một điểm $K$ thuộc mặt phẳng $(P)$.',
      hypothesis: 'Cho mặt phẳng $(P)$ xác định bởi $A, B, C$.',
      goal: 'Tạo một điểm nằm trên mặt phẳng $(P)$.',
      allowedTools: BASIC_3D_TOOLS,
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2, -1.5, 0) },
          { id: 'B', label: 'B', pos: v3(2.2, -1.4, 0.4) },
          { id: 'C', label: 'C', pos: v3(0, 2.2, 1.4) },
        ]);
        sc = addGivenPlane3(sc, 'plP', 'A', 'B', 'C', '(P)', '#0F766E', 0.18);
        return sc;
      },
      rules: [{ type: 'has_point_on_plane', refs: ['plP'], description: 'Có ít nhất một điểm thuộc mặt phẳng (P).' }],
      perturb: ['A', 'B', 'C'],
      hints: [
        'Điểm ràng buộc trên mặt phẳng luôn nằm trong mặt phẳng đó ngay cả khi mặt phẳng thay đổi.',
        'Chọn công cụ Điểm trên mặt phẳng trong nhóm Điểm.',
        'Nhấp vào mặt phẳng (P) để gắn điểm K lên mặt phẳng.',
      ],
      steps: [{ id: 's1', actionText: 'Chọn Điểm trên mặt phẳng và nhấp vào mặt phẳng (P).', mathExplanation: 'Điểm K luôn thỏa mãn phương trình mặt phẳng (P).', addInput: { id: 'sol_k', kind: 'point', rule: 'point_on_plane', parents: ['plP'], label: 'K', uv: { u: 0.6, v: 0.4 } } }],
      proof: 'Mọi điểm ràng buộc theo tọa độ tham số $(u, v)$ trên $(P)$ luôn thuộc mặt phẳng $(P)$.',
    },
    {
      levelId: 1,
      order: 6,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Cách xác định mặt phẳng qua một đường thẳng và một điểm ngoài đường thẳng',
      title: 'Dựng mặt phẳng đi qua đường thẳng và điểm ngoài đường thẳng',
      description: 'Cho đường thẳng $d$ đi qua $A, B$ và điểm $S$ không nằm trên $d$. Hãy dựng mặt phẳng $(S, d)$.',
      hypothesis: 'Đường thẳng $d = AB$ và điểm $S \\notin d$.',
      goal: 'Dựng mặt phẳng đi qua $S$ và chứa đường thẳng $d$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.2, -1.2, 0) },
          { id: 'B', label: 'B', pos: v3(2.2, -1.2, 0) },
          { id: 'S', label: 'S', pos: v3(0.3, 1.5, 3) },
        ]);
        sc = addGivenLine(sc, 'ld', 'A', 'B', 'd');
        return sc;
      },
      rules: [{ type: 'has_plane_through_points', refs: ['S', 'A', 'B'], description: 'Mặt phẳng chứa đường thẳng d và đi qua S.' }],
      perturb: ['A', 'B', 'S'],
      hints: [
        'Một đường thẳng và một điểm không thuộc đường thẳng đó xác định duy nhất một mặt phẳng.',
        'Dùng công cụ Mặt phẳng qua đường thẳng và điểm (hoặc Mặt phẳng qua 3 điểm S, A, B).',
        'Nhấp chọn đường thẳng d rồi nhấp vào điểm S.',
      ],
      steps: [{ id: 's1', actionText: 'Chọn Mặt phẳng qua đường thẳng & điểm, nhấp d rồi S.', mathExplanation: 'Mặt phẳng (S, d) chứa toàn bộ đường thẳng d và điểm S.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_line_point', parents: ['ld', 'S'], label: '(S,d)' } }],
      proof: 'Vì $S \\notin d$ nên có duy nhất một mặt phẳng chứa $d$ và đi qua $S$.',
    },
    {
      levelId: 1,
      order: 7,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đa giác phẳng trong không gian và mặt bên hình chóp',
      title: 'Dựng mặt bên tam giác của hình chóp tứ giác',
      description: 'Cho hình chóp $S.ABCD$. Hãy dựng đa giác mặt bên $\\triangle SBC$.',
      hypothesis: 'Hình chóp $S.ABCD$ đã cho.',
      goal: 'Dựng đa giác khép kín qua ba đỉnh $S, B, C$.',
      allowedTools: BASIC_3D_TOOLS,
      setup: () => buildPyramidABCDScene(),
      rules: [
        { type: 'has_polygon_with_vertices', refs: [], params: { minVerts: 3 }, description: 'Dựng được đa giác tam giác.' },
        { type: 'has_plane_through_points', refs: ['S', 'B', 'C'], description: 'Đa giác nằm đúng trên mặt phẳng (SBC).' },
      ],
      perturb: ['S'],
      hints: [
        'Mỗi mặt bên của hình chóp là một hình tam giác có một đỉnh là S và cạnh đối diện là cạnh đáy.',
        'Chọn công cụ Đa giác trong không gian.',
        'Nhấp lần lượt S, B, C rồi xác nhận tạo tam giác SBC.',
      ],
      steps: [{ id: 's1', actionText: 'Dựng đa giác qua 3 đỉnh S, B, C.', mathExplanation: 'Tam giác SBC là một mặt bên của hình chóp S.ABCD.', addInput: { id: 'sol_poly', kind: 'polygon', rule: 'polygon_3d', parents: ['S', 'B', 'C'], label: 'SBC' } }],
      proof: 'Ba đỉnh không thẳng hàng $S, B, C$ xác định tam giác $SBC$ nằm trong mặt phẳng $(SBC)$.',
    },
    {
      levelId: 1,
      order: 8,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đường thẳng nằm trong mặt phẳng',
      title: 'Dựng đường trung tuyến trong mặt bên hình chóp',
      description: 'Cho tứ diện $S.ABC$. Hãy dựng trung điểm $M$ của $BC$ rồi nối đoạn thẳng $SM$ nằm trong mặt phẳng $(SBC)$.',
      hypothesis: 'Tứ diện $S.ABC$.',
      goal: 'Dựng trung điểm $M$ của $BC$ và đoạn thẳng $SM$.',
      allowedTools: BASIC_3D_TOOLS,
      setup: () => buildTetrahedronScene(),
      rules: [
        { type: 'has_midpoint_of', refs: ['B', 'C'], description: 'Xác định trung điểm M của BC.' },
        { type: 'has_line_through', refs: ['S', 'B'], description: 'Kiểm tra cạnh liên quan.' }.type === 'has_line_through'
          ? { type: 'has_segment_between_midpoints', refs: ['S', 'S', 'B', 'C'], description: 'Nối đoạn thẳng SM nối S với trung điểm BC.' }
          : { type: 'has_midpoint_of', refs: ['B', 'C'], description: '' },
      ],
      perturb: ['S', 'B', 'C'],
      hints: [
        'Nếu đường thẳng có hai điểm phân biệt thuộc một mặt phẳng thì mọi điểm của nó đều thuộc mặt phẳng đó.',
        'Dùng Trung điểm để tạo M của BC, sau đó dùng Đoạn thẳng để nối S và M.',
        'Bước 1: Trung điểm(B, C) → M. Bước 2: Đoạn thẳng(S, M).',
      ],
      steps: [
        { id: 's1', actionText: 'Dựng trung điểm M của BC.', mathExplanation: 'M thuộc cạnh BC nên M thuộc mặt phẳng (SBC).', addInput: { id: 'sol_m', kind: 'point', rule: 'midpoint_3d', parents: ['B', 'C'], label: 'M' } },
        { id: 's2', actionText: 'Nối đoạn thẳng SM.', mathExplanation: 'Vì S và M cùng thuộc (SBC) nên đoạn SM nằm trong (SBC).', addInput: { id: 'sol_sm', kind: 'segment', rule: 'segment_3d', parents: ['S', 'sol_m'], label: 'SM' } },
      ],
      proof: 'Vì $S \\in (SBC)$ và $M \\in BC \\subset (SBC)$ nên đường thẳng $SM$ nằm hoàn toàn trong mặt phẳng $(SBC)$.',
    },
    {
      levelId: 1,
      order: 9,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tứ diện và đường trung bình nối hai cạnh đối',
      title: 'Dựng đoạn thẳng nối trung điểm hai cạnh đối tứ diện',
      description: 'Cho tứ diện $S.ABC$. Hãy dựng đoạn thẳng $MN$ nối trung điểm $M$ của $SA$ và trung điểm $N$ của $BC$.',
      hypothesis: 'Tứ diện $S.ABC$.',
      goal: 'Dựng trung điểm $M$ của $SA$, trung điểm $N$ của $BC$ và đoạn $MN$.',
      allowedTools: BASIC_3D_TOOLS,
      setup: () => buildTetrahedronScene(),
      rules: [
        { type: 'has_midpoint_of', refs: ['S', 'A'], description: 'Có trung điểm M của cạnh SA.' },
        { type: 'has_midpoint_of', refs: ['B', 'C'], description: 'Có trung điểm N của cạnh BC.' },
        { type: 'has_segment_between_midpoints', refs: ['S', 'A', 'B', 'C'], description: 'Có đoạn thẳng nối M và N.' },
      ],
      perturb: ['S', 'A', 'B', 'C'],
      hints: [
        'SA và BC là hai cạnh đối nhau của tứ diện S.ABC.',
        'Sử dụng công cụ Trung điểm hai lần rồi dùng công cụ Đoạn thẳng.',
        'Dựng M = trung điểm SA, N = trung điểm BC, rồi nối MN.',
      ],
      steps: [
        { id: 's1', actionText: 'Dựng trung điểm M của SA.', mathExplanation: 'Xác định trung điểm cạnh SA.', addInput: { id: 'sol_m', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'A'], label: 'M' } },
        { id: 's2', actionText: 'Dựng trung điểm N của BC.', mathExplanation: 'Xác định trung điểm cạnh BC.', addInput: { id: 'sol_n', kind: 'point', rule: 'midpoint_3d', parents: ['B', 'C'], label: 'N' } },
        { id: 's3', actionText: 'Nối đoạn thẳng MN.', mathExplanation: 'Đoạn MN là một đoạn trung bình của tứ diện.', addInput: { id: 'sol_mn', kind: 'segment', rule: 'segment_3d', parents: ['sol_m', 'sol_n'], label: 'MN' } },
      ],
      proof: 'Ba đoạn thẳng nối trung điểm các cặp cạnh đối của một tứ diện luôn đồng quy tại trọng tâm tứ diện.',
    },
    {
      levelId: 1,
      order: 10,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tổng hợp dựng hình cơ bản: hình khối và mặt phẳng chéo',
      title: 'Dựng mặt phẳng chéo đi qua ba đỉnh của hình lập phương',
      description: "Cho hình lập phương $ABCD.A'B'C'D'$. Hãy dựng mặt phẳng $(AB'D')$ đi qua ba đỉnh $A, B', D'$.",
      hypothesis: "Hình lập phương $ABCD.A'B'C'D'$.",
      goal: "Dựng mặt phẳng $(AB'D')$.",
      allowedTools: BASIC_3D_TOOLS,
      setup: () => buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2 }),
      rules: [{ type: 'has_plane_through_points', refs: ['A', 'B1', 'D1'], description: "Mặt phẳng đi qua ba đỉnh A, B', D'." }],
      perturb: [],
      hints: [
        "Ba đỉnh A, B', D' không thẳng hàng nên xác định duy nhất một mặt phẳng cắt khối lập phương.",
        'Dùng công cụ Mặt phẳng qua 3 điểm.',
        "Nhấp lần lượt vào A, B' và D'.",
      ],
      steps: [{ id: 's1', actionText: "Chọn Mặt phẳng qua 3 điểm và nhấp A, B', D'.", mathExplanation: "Tam giác AB'D' là tam giác đều cạnh a√2.", addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B1', 'D1'], label: "(AB'D')" } }],
      proof: "Vì $AB' = B'D' = D'A = a\\sqrt{2}$ nên $A, B', D'$ không thẳng hàng và xác định duy nhất mặt phẳng $(AB'D')$.",
    },

    // =========================================================================
    // CẤP ĐỘ II: GIAO TUYẾN VÀ GIAO ĐIỂM (10 thử thách — Toán 11)
    // =========================================================================
    {
      levelId: 2,
      order: 1,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Giao điểm của hai đường thẳng đồng phẳng',
      title: 'Xác định tâm đáy hình chóp tứ giác',
      description: 'Cho hình chóp $S.ABCD$ có hai đường chéo đáy $AC$ và $BD$. Hãy xác định giao điểm $O = AC \\cap BD$.',
      hypothesis: 'Hình chóp $S.ABCD$ cùng hai đoạn chéo $AC, BD$.',
      goal: 'Dựng giao điểm $O$ của $AC$ và $BD$.',
      setup: () => {
        let sc = buildPyramidABCDScene();
        sc = addGivenSeg(sc, 'eAC', 'A', 'C', 'AC', true);
        sc = addGivenSeg(sc, 'eBD', 'B', 'D', 'BD', true);
        return sc;
      },
      rules: [{ type: 'has_intersection_ll', refs: ['eAC', 'eBD'], description: 'Xác định giao điểm O của AC và BD.' }],
      perturb: [],
      hints: [
        'Hai đường chéo của tứ giác lồi ABCD nằm trong cùng mặt phẳng đáy nên cắt nhau tại một điểm O.',
        'Chọn công cụ Giao điểm 2 đường thẳng trong nhóm Điểm.',
        'Nhấp vào đoạn AC rồi nhấp vào đoạn BD.',
      ],
      steps: [{ id: 's1', actionText: 'Dựng giao điểm O của AC và BD.', mathExplanation: 'O là giao điểm hai đường chéo đáy.', addInput: { id: 'sol_o', kind: 'point', rule: 'intersect_line_line', parents: ['eAC', 'eBD'], label: 'O' } }],
      proof: 'Hai đường chéo $AC, BD$ cùng nằm trong mặt phẳng $(ABCD)$ và cắt nhau tại tâm $O$.',
    },
    {
      levelId: 2,
      order: 2,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Giao tuyến của hai mặt phẳng cắt nhau',
      title: 'Tìm giao tuyến của hai mặt phẳng cho trước',
      description: 'Cho hai mặt phẳng $(P)$ và $(Q)$ cắt nhau. Hãy dựng giao tuyến $d = (P) \\cap (Q)$.',
      hypothesis: 'Hai mặt phẳng $(P)$ và $(Q)$ cắt nhau.',
      goal: 'Dựng đường thẳng giao tuyến của $(P)$ và $(Q)$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2, 0, 0) },
          { id: 'B', label: 'B', pos: v3(2, 0, 0) },
          { id: 'C', label: 'C', pos: v3(0, 2.5, 0) },
          { id: 'D', label: 'D', pos: v3(0, -1, 3) },
        ]);
        sc = addGivenPlane3(sc, 'plP', 'A', 'B', 'C', '(P)', '#0F766E', 0.16);
        sc = addGivenPlane3(sc, 'plQ', 'A', 'B', 'D', '(Q)', '#0284C7', 0.16);
        return sc;
      },
      rules: [{ type: 'has_intersection_line_planes', refs: ['plP', 'plQ'], description: 'Dựng giao tuyến của (P) và (Q).' }],
      perturb: ['A', 'B', 'C', 'D'],
      hints: [
        'Nếu hai mặt phẳng phân biệt có một điểm chung thì chúng có chung một đường thẳng gọi là giao tuyến.',
        'Chọn công cụ Giao tuyến 2 mặt phẳng trong nhóm Đường hoặc Mặt phẳng.',
        'Nhấp vào mặt phẳng (P) rồi nhấp vào mặt phẳng (Q).',
      ],
      steps: [{ id: 's1', actionText: 'Chọn Giao tuyến 2 mặt phẳng và nhấp (P), (Q).', mathExplanation: 'Giao tuyến của (P) và (Q) đi qua A và B.', addInput: { id: 'sol_d', kind: 'line', rule: 'intersect_plane_plane', parents: ['plP', 'plQ'], label: 'd' } }],
      proof: 'Hai điểm chung $A, B$ xác định giao tuyến duy nhất $d = AB$ của $(P)$ và $(Q)$.',
    },
    {
      levelId: 2,
      order: 3,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Giao điểm của đường thẳng và mặt phẳng',
      title: 'Tìm giao điểm của đường thẳng và mặt phẳng',
      description: 'Cho đường thẳng $d$ cắt mặt phẳng $(P)$. Hãy xác định giao điểm $I = d \\cap (P)$.',
      hypothesis: 'Mặt phẳng $(P)$ và đường thẳng $d$ cắt $(P)$.',
      goal: 'Dựng giao điểm $I$ của $d$ và $(P)$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.5, -2, 0) },
          { id: 'B', label: 'B', pos: v3(2.5, -2, 0) },
          { id: 'C', label: 'C', pos: v3(0, 2.5, 0) },
          { id: 'M', label: 'M', pos: v3(-1, -0.5, 3) },
          { id: 'N', label: 'N', pos: v3(1.5, 0.8, -1.5) },
        ]);
        sc = addGivenPlane3(sc, 'plP', 'A', 'B', 'C', '(P)', '#0F766E', 0.16);
        sc = addGivenLine(sc, 'ld', 'M', 'N', 'd', '#D97706');
        return sc;
      },
      rules: [{ type: 'has_intersection_line_plane', refs: ['ld', 'plP'], description: 'Xác định giao điểm I của đường thẳng d và mặt phẳng (P).' }],
      perturb: ['M', 'N'],
      hints: [
        'Đường thẳng d không song song và không nằm trong (P) sẽ cắt (P) tại duy nhất một điểm.',
        'Mở nhóm Điểm và chọn Giao điểm đường thẳng – mặt phẳng.',
        'Nhấp vào đường thẳng d rồi nhấp vào mặt phẳng (P).',
      ],
      steps: [{ id: 's1', actionText: 'Dựng giao điểm của d và (P).', mathExplanation: 'I là điểm chung duy nhất của d và (P).', addInput: { id: 'sol_i', kind: 'point', rule: 'intersect_line_plane', parents: ['ld', 'plP'], label: 'I' } }],
      proof: 'Vì $M$ và $N$ nằm về hai phía của $(P)$ nên đường thẳng $MN$ cắt $(P)$ tại duy nhất điểm $I$.',
    },
    {
      levelId: 2,
      order: 4,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Giao tuyến hai mặt phẳng chéo trong hình chóp',
      title: 'Tìm giao tuyến của (SAC) và (SBD)',
      description: 'Cho hình chóp $S.ABCD$. Hãy xác định giao tuyến của hai mặt phẳng chéo $(SAC)$ và $(SBD)$.',
      hypothesis: 'Hình chóp $S.ABCD$ đã dựng sẵn hai mặt phẳng $(SAC)$ và $(SBD)$.',
      goal: 'Dựng giao tuyến $SO$ của $(SAC)$ và $(SBD)$.',
      setup: () => {
        let sc = buildPyramidABCDScene();
        sc = addGivenSeg(sc, 'eAC', 'A', 'C', 'AC', true);
        sc = addGivenSeg(sc, 'eBD', 'B', 'D', 'BD', true);
        sc = addGivenPlane3(sc, 'plSAC', 'S', 'A', 'C', '(SAC)', '#0284C7', 0.14);
        sc = addGivenPlane3(sc, 'plSBD', 'S', 'B', 'D', '(SBD)', '#7C3AED', 0.14);
        return sc;
      },
      rules: [{ type: 'has_intersection_line_planes', refs: ['plSAC', 'plSBD'], description: 'Dựng giao tuyến SO của (SAC) và (SBD).' }],
      perturb: ['S'],
      hints: [
        'Tìm hai điểm chung phân biệt của (SAC) và (SBD): điểm S và giao điểm O của AC với BD.',
        'Bạn có thể dùng công cụ Giao tuyến 2 mặt phẳng hoặc dựng O = AC ∩ BD rồi nối SO.',
        'Nhấp vào (SAC) và (SBD) bằng công cụ Giao tuyến 2 mặt phẳng.',
      ],
      steps: [{ id: 's1', actionText: 'Dựng giao tuyến của (SAC) và (SBD).', mathExplanation: 'S và O = AC ∩ BD là hai điểm chung nên giao tuyến là đường thẳng SO.', addInput: { id: 'sol_so', kind: 'line', rule: 'intersect_plane_plane', parents: ['plSAC', 'plSBD'], label: 'SO' } }],
      proof: 'Ta có $S \\in (SAC) \\cap (SBD)$ và $O = AC \\cap BD \\in (SAC) \\cap (SBD)$, suy ra $(SAC) \\cap (SBD) = SO$.',
    },
    {
      levelId: 2,
      order: 5,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tìm giao tuyến bằng cách kéo dài cặp cạnh đáy cắt nhau',
      title: 'Giao tuyến của hai mặt bên đối diện (SAB) và (SCD)',
      description: 'Cho hình chóp $S.ABCD$ có $AB$ và $CD$ không song song (đáy hình thang nghiêng). Hãy dựng giao tuyến của $(SAB)$ và $(SCD)$.',
      hypothesis: 'Hình chóp $S.ABCD$ với $AB$ cắt $CD$ tại điểm ngoài đáy.',
      goal: 'Dựng giao tuyến của $(SAB)$ và $(SCD)$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.2, -1.5, 0) },
          { id: 'B', label: 'B', pos: v3(1.8, -1.8, 0) },
          { id: 'C', label: 'C', pos: v3(1.4, 1.4, 0) },
          { id: 'D', label: 'D', pos: v3(-1.4, 1.8, 0) },
          { id: 'S', label: 'S', pos: v3(-0.2, 0.2, 3.8) },
        ]);
        sc = addGivenSeg(sc, 'eAB', 'A', 'B', 'AB');
        sc = addGivenSeg(sc, 'eBC', 'B', 'C', 'BC');
        sc = addGivenSeg(sc, 'eCD', 'C', 'D', 'CD', true);
        sc = addGivenSeg(sc, 'eDA', 'D', 'A', 'DA', true);
        sc = addGivenSeg(sc, 'eSA', 'S', 'A', 'SA');
        sc = addGivenSeg(sc, 'eSB', 'S', 'B', 'SB');
        sc = addGivenSeg(sc, 'eSC', 'S', 'C', 'SC');
        sc = addGivenSeg(sc, 'eSD', 'S', 'D', 'SD', true);
        sc = addGivenPlane3(sc, 'plSAB', 'S', 'A', 'B', '(SAB)', '#0F766E', 0.13);
        sc = addGivenPlane3(sc, 'plSCD', 'S', 'C', 'D', '(SCD)', '#D97706', 0.13);
        return sc;
      },
      rules: [{ type: 'has_intersection_line_planes', refs: ['plSAB', 'plSCD'], description: 'Dựng giao tuyến SE của (SAB) và (SCD).' }],
      perturb: ['S'],
      hints: [
        'S là điểm chung thứ nhất; giao điểm E của hai đường thẳng AB và CD trong mặt phẳng đáy là điểm chung thứ hai.',
        'Dùng Giao tuyến 2 mặt phẳng cho (SAB) và (SCD), hoặc kéo dài AB cắt CD tại E rồi nối SE.',
        'Chọn Giao tuyến 2 mặt phẳng, nhấp (SAB) rồi nhấp (SCD).',
      ],
      steps: [{ id: 's1', actionText: 'Dựng giao tuyến của (SAB) và (SCD).', mathExplanation: 'Giao tuyến là đường thẳng đi qua S và E = AB ∩ CD.', addInput: { id: 'sol_se', kind: 'line', rule: 'intersect_plane_plane', parents: ['plSAB', 'plSCD'], label: 'SE' } }],
      proof: 'Trong $(ABCD)$, gọi $E = AB \\cap CD$. Khi đó $S$ và $E$ đều thuộc $(SAB) \\cap (SCD)$ nên giao tuyến là $SE$.',
    },
    {
      levelId: 2,
      order: 6,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Giao điểm của đường thẳng với mặt phẳng phụ',
      title: 'Tìm giao điểm của đường thẳng MN với mặt phẳng đáy (ABC)',
      description: 'Cho tứ diện $S.ABC$, với $M \\in SA$ và $N \\in SB$ ($MN$ không song song $AB$). Hãy xác định giao điểm $E = MN \\cap (ABC)$.',
      hypothesis: 'Tứ diện $S.ABC$, điểm $M \\in SA$, điểm $N \\in SB$ và đường thẳng $MN$.',
      goal: 'Dựng giao điểm $E$ của đường thẳng $MN$ với mặt phẳng $(ABC)$.',
      setup: () => {
        let sc = buildTetrahedronScene({ withBasePlane: true });
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'point_on_segment', parents: ['eSA'], t: 0.35, label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'N', kind: 'point', rule: 'point_on_segment', parents: ['eSB'], t: 0.68, label: 'N', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGivenLine(sc, 'lMN', 'M', 'N', 'MN', '#D97706');
        return sc;
      },
      rules: [{ type: 'has_intersection_line_plane', refs: ['lMN', 'plABC'], description: 'Xác định giao điểm E = MN ∩ (ABC).' }],
      perturb: ['S', 'A', 'B'],
      hints: [
        'MN và AB cùng nằm trong mặt phẳng (SAB) nên giao điểm của MN và (ABC) chính là giao điểm của MN và AB.',
        'Dùng công cụ Giao điểm đường thẳng – mặt phẳng (chọn MN và (ABC)) hoặc Giao điểm 2 đường thẳng (MN và AB).',
        'Nhấp vào đường thẳng MN rồi nhấp vào mặt phẳng (ABC).',
      ],
      steps: [{ id: 's1', actionText: 'Tìm giao điểm của MN với (ABC).', mathExplanation: 'E = MN ∩ AB nằm trên mặt phẳng (ABC).', addInput: { id: 'sol_e', kind: 'point', rule: 'intersect_line_plane', parents: ['lMN', 'plABC'], label: 'E' } }],
      proof: 'Vì $MN \\subset (SAB)$ và $(SAB) \\cap (ABC) = AB$ nên $E = MN \\cap AB$ chính là giao điểm của $MN$ với $(ABC)$.',
    },
    {
      levelId: 2,
      order: 7,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Giao tuyến mặt phẳng qua trung điểm với mặt đáy',
      title: 'Tìm giao tuyến của (MBC) với mặt phẳng (SAD)',
      description: 'Cho hình chóp $S.ABCD$, $M$ là trung điểm $SA$. Hãy dựng giao tuyến của hai mặt phẳng $(MBC)$ và $(SAD)$.',
      hypothesis: 'Hình chóp $S.ABCD$ (đáy hình thang có $BC$ cắt $AD$) và trung điểm $M$ của $SA$.',
      goal: 'Dựng giao tuyến của $(MBC)$ và $(SAD)$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.2, -1.6, 0) },
          { id: 'B', label: 'B', pos: v3(1.8, -1.2, 0) },
          { id: 'C', label: 'C', pos: v3(1.6, 1.5, 0) },
          { id: 'D', label: 'D', pos: v3(-1.8, 2.0, 0) },
          { id: 'S', label: 'S', pos: v3(0, 0, 3.8) },
        ]);
        sc = addGivenSeg(sc, 'eAB', 'A', 'B', 'AB');
        sc = addGivenSeg(sc, 'eBC', 'B', 'C', 'BC');
        sc = addGivenSeg(sc, 'eCD', 'C', 'D', 'CD', true);
        sc = addGivenSeg(sc, 'eDA', 'D', 'A', 'DA', true);
        sc = addGivenSeg(sc, 'eSA', 'S', 'A', 'SA');
        sc = addGivenSeg(sc, 'eSB', 'S', 'B', 'SB');
        sc = addGivenSeg(sc, 'eSC', 'S', 'C', 'SC');
        sc = addGivenSeg(sc, 'eSD', 'S', 'D', 'SD', true);
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'A'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGivenPlane3(sc, 'plMBC', 'M', 'B', 'C', '(MBC)', '#0284C7', 0.14);
        sc = addGivenPlane3(sc, 'plSAD', 'S', 'A', 'D', '(SAD)', '#0F766E', 0.14);
        return sc;
      },
      rules: [{ type: 'has_intersection_line_planes', refs: ['plMBC', 'plSAD'], description: 'Dựng giao tuyến của (MBC) và (SAD).' }],
      perturb: ['S'],
      hints: [
        'Điểm chung thứ nhất là M (vì M ∈ SA ⊂ (SAD)). Điểm chung thứ hai là F = BC ∩ AD.',
        'Chọn công cụ Giao tuyến 2 mặt phẳng.',
        'Nhấp vào mặt phẳng (MBC) rồi nhấp vào mặt phẳng (SAD).',
      ],
      steps: [{ id: 's1', actionText: 'Dựng giao tuyến của (MBC) và (SAD).', mathExplanation: 'Giao tuyến đi qua M và F = BC ∩ AD.', addInput: { id: 'sol_mf', kind: 'line', rule: 'intersect_plane_plane', parents: ['plMBC', 'plSAD'], label: 'MF' } }],
      proof: 'Vì $M \\in SA \\subset (SAD)$ và $F = BC \\cap AD$ là điểm chung thứ hai nên $(MBC) \\cap (SAD) = MF$.',
    },
    {
      levelId: 2,
      order: 8,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Giao điểm cạnh bên với mặt phẳng cắt',
      title: 'Xác định giao điểm cạnh SC với mặt phẳng (ABM)',
      description: 'Cho hình chóp $S.ABCD$, $M$ nằm trên cạnh $SD$. Mặt phẳng $(ABM)$ cắt mặt phẳng $(SCD)$ và cạnh $SC$. Hãy tìm giao điểm $K = SC \\cap (ABM)$.',
      hypothesis: 'Hình chóp $S.ABCD$, điểm $M \\in SD$, mặt phẳng $(ABM)$ và đường thẳng $SC$.',
      goal: 'Dựng giao điểm $K = SC \\cap (ABM)$.',
      setup: () => {
        let sc = buildPyramidABCDScene();
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'point_on_segment', parents: ['eSD'], t: 0.45, label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGivenPlane3(sc, 'plABM', 'A', 'B', 'M', '(ABM)', '#7C3AED', 0.15);
        return sc;
      },
      rules: [{ type: 'has_intersection_line_plane', refs: ['eSC', 'plABM'], description: 'Xác định giao điểm K của SC với mặt phẳng (ABM).' }],
      perturb: ['S'],
      hints: [
        'Cạnh SC cắt mặt phẳng (ABM) tại điểm K nằm trên SC sao cho MK ∥ AB ∥ CD.',
        'Chọn công cụ Giao điểm đường thẳng – mặt phẳng.',
        'Nhấp vào cạnh SC rồi nhấp vào mặt phẳng (ABM).',
      ],
      steps: [{ id: 's1', actionText: 'Dựng giao điểm K của SC và (ABM).', mathExplanation: 'K là điểm chung duy nhất của SC với mặt phẳng (ABM).', addInput: { id: 'sol_k', kind: 'point', rule: 'intersect_line_plane', parents: ['eSC', 'plABM'], label: 'K' } }],
      proof: 'Vì $AB \\parallel CD$ nên giao tuyến của $(ABM)$ với $(SCD)$ là đường thẳng qua $M$ song song $CD$, cắt $SC$ tại $K$.',
    },
    {
      levelId: 2,
      order: 9,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Giao tuyến trong hình lăng trụ tam giác',
      title: "Tìm giao tuyến của (AB'C') và (A'BC)",
      description: "Cho lăng trụ tam giác $ABC.A'B'C'$. Hãy dựng giao tuyến của hai mặt phẳng $(AB'C')$ và $(A'BC)$.",
      hypothesis: "Lăng trụ $ABC.A'B'C'$ cùng hai mặt phẳng $(AB'C')$ và $(A'BC)$.",
      goal: "Dựng giao tuyến của $(AB'C')$ và $(A'BC)$.",
      setup: () => {
        let sc = buildTriPrismScene({ right: true });
        sc = addGivenPlane3(sc, 'pl1', 'A', 'B1', 'C1', "(AB'C')", '#0284C7', 0.14);
        sc = addGivenPlane3(sc, 'pl2', 'A1', 'B', 'C', "(A'BC)", '#D97706', 0.14);
        return sc;
      },
      rules: [{ type: 'has_intersection_line_planes', refs: ['pl1', 'pl2'], description: "Dựng giao tuyến của (AB'C') và (A'BC)." }],
      perturb: [],
      hints: [
        "Giao điểm I = AB' ∩ A'B và J = AC' ∩ A'C đều là điểm chung của hai mặt phẳng.",
        'Dùng công cụ Giao tuyến 2 mặt phẳng.',
        "Nhấp chọn mặt phẳng (AB'C') rồi mặt phẳng (A'BC).",
      ],
      steps: [{ id: 's1', actionText: "Dựng giao tuyến của (AB'C') và (A'BC).", mathExplanation: "Giao tuyến đi qua tâm hai mặt bên ABB'A' và ACC'A'.", addInput: { id: 'sol_ij', kind: 'line', rule: 'intersect_plane_plane', parents: ['pl1', 'pl2'], label: 'IJ' } }],
      proof: "Gọi $I = AB' \\cap A'B$ và $J = AC' \\cap A'C$. Cả $I$ và $J$ đều thuộc $(AB'C') \\cap (A'BC)$ nên giao tuyến là $IJ$.",
    },
    {
      levelId: 2,
      order: 10,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Ba điểm thẳng hàng qua giao tuyến hai mặt phẳng',
      title: 'Dựng giao tuyến qua hai giao điểm trong hình chóp',
      description: 'Cho hình chóp $S.ABCD$ có mặt phẳng $(MNP)$ cắt các cạnh bên, với $M \\in SA, N \\in SB, P \\in SC$. Hãy dựng giao điểm $Q = SD \\cap (MNP)$ và giao tuyến của $(MNP)$ với $(SCD)$.',
      hypothesis: 'Hình chóp $S.ABCD$, mặt phẳng $(MNP)$ và mặt phẳng $(SCD)$.',
      goal: 'Dựng điểm $Q = SD \\cap (MNP)$ và giao tuyến $(MNP) \\cap (SCD)$.',
      setup: () => {
        let sc = buildPyramidABCDScene();
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'point_on_segment', parents: ['eSA'], t: 0.4, label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'N', kind: 'point', rule: 'point_on_segment', parents: ['eSB'], t: 0.55, label: 'N', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'P', kind: 'point', rule: 'point_on_segment', parents: ['eSC'], t: 0.65, label: 'P', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGivenPlane3(sc, 'plMNP', 'M', 'N', 'P', '(MNP)', '#7C3AED', 0.15);
        sc = addGivenPlane3(sc, 'plSCD', 'S', 'C', 'D', '(SCD)', '#0F766E', 0.12);
        return sc;
      },
      rules: [
        { type: 'has_intersection_line_plane', refs: ['eSD', 'plMNP'], description: 'Xác định giao điểm Q = SD ∩ (MNP).' },
        { type: 'has_intersection_line_planes', refs: ['plMNP', 'plSCD'], description: 'Dựng giao tuyến PQ của (MNP) và (SCD).' },
      ],
      perturb: ['S'],
      hints: [
        'Điểm Q thuộc SD đồng thời nằm trong mặt phẳng (MNP); khi nối P và Q ta được giao tuyến của (MNP) và (SCD).',
        'Dùng công cụ Giao điểm đường – mặt cho SD và (MNP), rồi dùng Đoạn thẳng/Giao tuyến cho PQ.',
        'Bước 1: Giao điểm(SD, (MNP)) → Q. Bước 2: Giao tuyến((MNP), (SCD)) hoặc Đường thẳng(P, Q).',
      ],
      steps: [
        { id: 's1', actionText: 'Dựng giao điểm Q của SD và (MNP).', mathExplanation: 'Q là điểm chung của cạnh SD với mặt phẳng (MNP).', addInput: { id: 'sol_q', kind: 'point', rule: 'intersect_line_plane', parents: ['eSD', 'plMNP'], label: 'Q' } },
        { id: 's2', actionText: 'Dựng giao tuyến PQ của (MNP) và (SCD).', mathExplanation: 'P và Q cùng thuộc (MNP) và (SCD) nên PQ là giao tuyến.', addInput: { id: 'sol_pq', kind: 'line', rule: 'intersect_plane_plane', parents: ['plMNP', 'plSCD'], label: 'PQ' } },
      ],
      proof: 'Hai điểm $P \\in SC$ và $Q \\in SD$ cùng thuộc $(MNP)$ và $(SCD)$ nên đường thẳng $PQ = (MNP) \\cap (SCD)$.',
    },

    // =========================================================================
    // CẤP ĐỘ III: HAI ĐƯỜNG THẲNG SONG SONG (10 thử thách — Toán 11)
    // =========================================================================
    {
      levelId: 3,
      order: 1,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tiên đề đường thẳng song song qua một điểm ngoài đường thẳng',
      title: 'Dựng đường thẳng đi qua điểm M và song song đường thẳng d',
      description: 'Cho đường thẳng $d$ và điểm $M \\notin d$. Hãy dựng đường thẳng $\\Delta$ đi qua $M$ và song song với $d$.',
      hypothesis: 'Đường thẳng $d = AB$ và điểm $M$ không nằm trên $d$.',
      goal: 'Dựng đường thẳng $\\Delta$ qua $M$ sao cho $\\Delta \\parallel d$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2, -1, 0) },
          { id: 'B', label: 'B', pos: v3(2, -1, 0.8) },
          { id: 'M', label: 'M', pos: v3(-0.5, 1.8, 2.2) },
        ]);
        sc = addGivenLine(sc, 'ld', 'A', 'B', 'd');
        return sc;
      },
      rules: [{ type: 'has_line_parallel_to_through', refs: ['M', 'ld'], description: 'Đường thẳng đi qua M và song song với d.' }],
      perturb: ['A', 'B', 'M'],
      hints: [
        'Trong không gian, qua một điểm không nằm trên đường thẳng cho trước có đúng một đường thẳng song song với nó.',
        'Mở nhóm Quan hệ hình học và chọn Đường thẳng song song.',
        'Nhấp vào điểm M rồi nhấp vào đường thẳng d.',
      ],
      steps: [{ id: 's1', actionText: 'Chọn Đường thẳng song song, nhấp M rồi d.', mathExplanation: 'Đường thẳng Δ có cùng vectơ chỉ phương với d và đi qua M.', addInput: { id: 'sol_p', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'ld'], label: 'Δ' } }],
      proof: 'Hai điểm $A, B$ và điểm $M$ đồng phẳng; trong mặt phẳng $(M, d)$ có duy nhất đường thẳng qua $M$ song song $d$.',
    },
    {
      levelId: 3,
      order: 2,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đường trung bình của tam giác trong không gian',
      title: 'Dựng đường trung bình song song cạnh đáy tứ diện',
      description: 'Cho tứ diện $S.ABC$. Hãy dựng trung điểm $M$ của $SA$, trung điểm $N$ của $SB$ và nối $MN \\parallel AB$.',
      hypothesis: 'Tứ diện $S.ABC$.',
      goal: 'Dựng $M, N$ là trung điểm $SA, SB$ và đoạn thẳng $MN$.',
      setup: () => buildTetrahedronScene(),
      rules: [
        { type: 'has_midpoint_of', refs: ['S', 'A'], description: 'Dựng trung điểm M của SA.' },
        { type: 'has_midpoint_of', refs: ['S', 'B'], description: 'Dựng trung điểm N của SB.' },
        { type: 'has_segment_between_midpoints', refs: ['S', 'A', 'S', 'B'], description: 'Nối đường trung bình MN ∥ AB.' },
      ],
      perturb: ['S', 'A', 'B'],
      hints: [
        'Trong tam giác SAB, đoạn nối trung điểm hai cạnh SA và SB là đường trung bình nên song song cạnh đáy AB.',
        'Dùng Trung điểm cho SA và SB, sau đó dùng Đoạn thẳng nối M và N.',
        'Dựng M = trung điểm(S, A), N = trung điểm(S, B), rồi nối MN.',
      ],
      steps: [
        { id: 's1', actionText: 'Dựng trung điểm M của SA.', mathExplanation: 'M chia đôi SA.', addInput: { id: 'sol_m', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'A'], label: 'M' } },
        { id: 's2', actionText: 'Dựng trung điểm N của SB.', mathExplanation: 'N chia đôi SB.', addInput: { id: 'sol_n', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'B'], label: 'N' } },
        { id: 's3', actionText: 'Nối đoạn MN.', mathExplanation: 'MN là đường trung bình của ΔSAB nên MN ∥ AB.', addInput: { id: 'sol_mn', kind: 'segment', rule: 'segment_3d', parents: ['sol_m', 'sol_n'], label: 'MN' } },
      ],
      proof: 'Trong $\\triangle SAB$, $M, N$ lần lượt là trung điểm $SA, SB$ nên $MN \\parallel AB$ và $MN = \\frac{1}{2}AB$.',
    },
    {
      levelId: 3,
      order: 3,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tính chất bắc cầu của hai đường thẳng song song',
      title: 'Dựng đường thẳng qua điểm D song song với cạnh bên trong hình hộp',
      description: "Cho hình hộp $ABCD.A'B'C'D'$. Hãy dựng đường thẳng qua tâm $O$ của đáy dưới và song song với cạnh bên $BB'$.",
      hypothesis: "Hình hộp $ABCD.A'B'C'D'$ và điểm $O$ ở đáy dưới.",
      goal: "Dựng đường thẳng qua $O$ song song $BB'$ (từ đó cũng song song $AA', CC', DD'$).",
      setup: () => {
        let sc = buildBoxVerticesScene({ lx: 3.4, ly: 2.8, lz: 3.2 });
        sc = addGeo3DObject(sc, { id: 'O', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'C'], label: 'O', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rules: [{ type: 'has_line_parallel_to_through', refs: ['O', 'eBB1'], description: "Đường thẳng đi qua O và song song BB'." }],
      perturb: [],
      hints: [
        "Hai đường thẳng phân biệt cùng song song với một đường thẳng thứ ba thì song song với nhau.",
        'Chọn công cụ Đường thẳng song song.',
        "Nhấp vào điểm O rồi nhấp vào cạnh bên BB'.",
      ],
      steps: [{ id: 's1', actionText: "Dựng đường thẳng qua O song song BB'.", mathExplanation: "Đường thẳng này cũng song song AA', CC', DD'.", addInput: { id: 'sol_l', kind: 'line', rule: 'line_parallel_point', parents: ['O', 'eBB1'], label: 'd' } }],
      proof: "Vì các cạnh bên hình hộp đôi một song song nên đường thẳng qua $O$ song song $BB'$ cũng song song với $AA', CC', DD'$.",
    },
    {
      levelId: 3,
      order: 4,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Định lí về giao tuyến của ba mặt phẳng (ba mặt phẳng đôi một cắt nhau)',
      title: 'Giao tuyến song song của (SAB) và (SCD) trong hình chóp đáy hình bình hành',
      description: 'Cho hình chóp $S.ABCD$ có đáy $ABCD$ là hình vuông (nên $AB \\parallel CD$). Hãy dựng giao tuyến $Sx$ của hai mặt phẳng $(SAB)$ và $(SCD)$.',
      hypothesis: 'Hình chóp $S.ABCD$ có $AB \\parallel CD$.',
      goal: 'Dựng đường thẳng $Sx$ đi qua $S$ và song song với $AB$ (cũng là giao tuyến $(SAB) \\cap (SCD)$).',
      setup: () => {
        let sc = buildPyramidABCDScene();
        sc = addGivenPlane3(sc, 'plSAB', 'S', 'A', 'B', '(SAB)', '#0F766E', 0.13);
        sc = addGivenPlane3(sc, 'plSCD', 'S', 'C', 'D', '(SCD)', '#0284C7', 0.13);
        return sc;
      },
      rules: [{ type: 'has_line_parallel_to_through', refs: ['S', 'eAB'], description: 'Dựng giao tuyến Sx qua S song song AB và CD.' }],
      perturb: ['S'],
      hints: [
        'Hai mặt phẳng (SAB) và (SCD) lần lượt chứa hai đường thẳng song song AB và CD, có điểm chung S thì giao tuyến của chúng đi qua S và song song với AB, CD.',
        'Chọn Đường thẳng song song (qua S, song song AB) hoặc Giao tuyến 2 mặt phẳng ((SAB) và (SCD)).',
        'Nhấp vào S rồi nhấp vào cạnh AB.',
      ],
      steps: [{ id: 's1', actionText: 'Dựng đường thẳng qua S song song AB.', mathExplanation: 'Sx = (SAB) ∩ (SCD) và Sx ∥ AB ∥ CD.', addInput: { id: 'sol_sx', kind: 'line', rule: 'line_parallel_point', parents: ['S', 'eAB'], label: 'Sx' } }],
      proof: 'Vì $AB \\subset (SAB)$, $CD \\subset (SCD)$, $AB \\parallel CD$ và $S \\in (SAB) \\cap (SCD)$ nên giao tuyến đi qua $S$ và song song với $AB, CD$.',
    },
    {
      levelId: 3,
      order: 5,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Mặt phẳng xác định bởi hai đường thẳng song song',
      title: 'Dựng mặt phẳng xác định bởi hai đường thẳng song song',
      description: 'Cho hai đường thẳng song song $a$ và $b$. Hãy dựng mặt phẳng $(P)$ chứa cả $a$ và $b$.',
      hypothesis: 'Hai đường thẳng $a \\parallel b$ trong không gian.',
      goal: 'Dựng mặt phẳng chứa cả $a$ và $b$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2, -1.5, 0) },
          { id: 'B', label: 'B', pos: v3(2, -1.5, 0) },
          { id: 'C', label: 'C', pos: v3(-1, 1.5, 2) },
          { id: 'D', label: 'D', pos: v3(3, 1.5, 2) },
        ]);
        sc = addGivenLine(sc, 'la', 'A', 'B', 'a', '#0F766E');
        sc = addGivenLine(sc, 'lb', 'C', 'D', 'b', '#0284C7');
        return sc;
      },
      rules: [{ type: 'has_plane_through_points', refs: ['A', 'B', 'C', 'D'], description: 'Mặt phẳng chứa đồng thời cả hai đường thẳng a và b.' }],
      perturb: [],
      hints: [
        'Hai đường thẳng song song xác định duy nhất một mặt phẳng chứa chúng.',
        'Chọn công cụ Mặt phẳng qua hai đường thẳng song song (hoặc Mặt phẳng qua 3 điểm A, B, C).',
        'Nhấp vào đường thẳng a rồi nhấp vào đường thẳng b.',
      ],
      steps: [{ id: 's1', actionText: 'Dựng mặt phẳng qua hai đường thẳng song song a, b.', mathExplanation: 'a ∥ b nên tồn tại duy nhất mặt phẳng (a, b).', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_two_lines', parents: ['la', 'lb'], label: '(a,b)' } }],
      proof: 'Hai đường thẳng song song $a, b$ đồng phẳng và xác định duy nhất mặt phẳng $(a, b)$.',
    },
    {
      levelId: 3,
      order: 6,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Giao tuyến song song trong lăng trụ',
      title: "Dựng đường thẳng qua trung điểm M của AA' song song B'C'",
      description: "Cho lăng trụ tam giác $ABC.A'B'C'$. Hãy dựng trung điểm $M$ của $AA'$, sau đó dựng đường thẳng qua $M$ song song với $BC$.",
      hypothesis: "Lăng trụ tam giác $ABC.A'B'C'$.",
      goal: "Dựng trung điểm $M$ của $AA'$ và đường thẳng $d$ qua $M$ song song $BC$.",
      setup: () => buildTriPrismScene({ right: false }),
      rules: [
        { type: 'has_midpoint_of', refs: ['A', 'A1'], description: "Dựng trung điểm M của cạnh bên AA'." },
      ],
      perturb: [],
      hints: [
        "Trong lăng trụ, BC ∥ B'C'. Trước hết tìm trung điểm M của AA'.",
        'Dùng Trung điểm cho A và A\', sau đó dùng Đường thẳng song song qua M song song BC.',
        'Bước 1: Trung điểm(A, A\') → M. Bước 2: Đường thẳng song song(M, BC).',
      ],
      steps: [
        { id: 's1', actionText: "Dựng trung điểm M của AA'.", mathExplanation: "M là trung điểm cạnh bên AA'.", addInput: { id: 'sol_m', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'A1'], label: 'M' } },
        { id: 's2', actionText: 'Dựng đường thẳng qua M song song BC.', mathExplanation: "Đường thẳng này cũng song song B'C'.", addInput: { id: 'sol_d', kind: 'line', rule: 'line_parallel_point', parents: ['sol_m', 'eBC'], label: 'd' } },
      ],
      proof: "Vì $BC \\parallel B'C'$ nên đường thẳng qua trung điểm $M$ của $AA'$ song song $BC$ cũng song song với $B'C'$.",
    },
    {
      levelId: 3,
      order: 7,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tính chất hình bình hành của tứ giác trung điểm (Varignon 3D)',
      title: 'Dựng đường thẳng song song nối trung điểm hai cặp cạnh của tứ diện',
      description: 'Cho tứ diện $S.ABC$ có $M, N, P, Q$ lần lượt là trung điểm $SA, SB, BC, CA$. Hãy dựng hai cạnh đối $MN$ và $QP$ để kiểm chứng $MN \\parallel QP$.',
      hypothesis: 'Tứ diện $S.ABC$ với 4 trung điểm $M, N, P, Q$ đã cho.',
      goal: 'Nối hai đoạn thẳng $MN$ và $QP$ song song với nhau.',
      setup: () => {
        let sc = buildTetrahedronScene();
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'A'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'N', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'B'], label: 'N', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'P', kind: 'point', rule: 'midpoint_3d', parents: ['B', 'C'], label: 'P', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'Q', kind: 'point', rule: 'midpoint_3d', parents: ['C', 'A'], label: 'Q', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rules: [
        { type: 'has_segment_between', refs: ['M', 'N'], description: 'Dựng đoạn MN.' },
        { type: 'has_segment_between', refs: ['Q', 'P'], description: 'Dựng đoạn QP.' },
      ],
      perturb: ['S', 'A', 'B', 'C'],
      hints: [
        'Cả MN và QP đều song song với AB và bằng một nửa AB nên MN ∥ QP và MN = QP.',
        'Chọn công cụ Đoạn thẳng.',
        'Nối M với N, sau đó nối Q với P.',
      ],
      steps: [
        { id: 's1', actionText: 'Nối đoạn thẳng MN.', mathExplanation: 'MN ∥ AB và MN = 1/2 AB.', addInput: { id: 'sol_mn', kind: 'segment', rule: 'segment_3d', parents: ['M', 'N'], label: 'MN' } },
        { id: 's2', actionText: 'Nối đoạn thẳng QP.', mathExplanation: 'QP ∥ AB và QP = 1/2 AB nên MN ∥ QP.', addInput: { id: 'sol_qp', kind: 'segment', rule: 'segment_3d', parents: ['Q', 'P'], label: 'QP' } },
      ],
      proof: 'Theo tính chất đường trung bình và tính chất bắc cầu song song, $MN \\parallel AB$ và $QP \\parallel AB$ suy ra $MN \\parallel QP$ và $MNPQ$ là hình bình hành.',
    },
    {
      levelId: 3,
      order: 8,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Giao tuyến song song khi cắt hình chóp bởi mặt phẳng chứa cạnh đáy',
      title: 'Dựng giao tuyến của (ABM) và (SCD) song song với CD',
      description: 'Cho hình chóp $S.ABCD$ đáy hình vuông và điểm $M$ là trung điểm $SD$. Hãy dựng đường thẳng $d$ qua $M$ song song $CD$ (là giao tuyến của $(ABM)$ và $(SCD)$) rồi tìm giao điểm $N = d \\cap SC$.',
      hypothesis: 'Hình chóp $S.ABCD$ và trung điểm $M$ của $SD$.',
      goal: 'Dựng $d$ qua $M$ song song $CD$ và giao điểm $N = d \\cap SC$.',
      setup: () => {
        let sc = buildPyramidABCDScene();
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'D'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rules: [
        { type: 'has_line_parallel_to_through', refs: ['M', 'eCD'], description: 'Dựng đường thẳng qua M song song CD.' },
        { type: 'has_midpoint_of', refs: ['S', 'C'], description: 'Tìm giao điểm N (chính là trung điểm SC).' },
      ],
      perturb: ['S'],
      hints: [
        'Vì AB ∥ CD nên giao tuyến của (ABM) và (SCD) là đường thẳng qua M song song với CD.',
        'Dùng Đường thẳng song song (M, CD) rồi dùng Giao điểm 2 đường thẳng với SC.',
        'Bước 1: Đường thẳng song song(M, CD) → d. Bước 2: Giao điểm(d, SC) → N.',
      ],
      steps: [
        { id: 's1', actionText: 'Dựng đường thẳng d qua M song song CD.', mathExplanation: 'd là giao tuyến của (ABM) và (SCD).', addInput: { id: 'sol_d', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'eCD'], label: 'd' } },
        { id: 's2', actionText: 'Tìm giao điểm N của d và cạnh SC.', mathExplanation: 'Vì M là trung điểm SD và MN ∥ CD nên N là trung điểm SC.', addInput: { id: 'sol_n', kind: 'point', rule: 'intersect_line_line', parents: ['sol_d', 'eSC'], label: 'N' } },
      ],
      proof: 'Vì $AB \\parallel CD$ và $M \\in (ABM) \\cap (SCD)$ nên giao tuyến qua $M$ song song $CD$, cắt $SC$ tại trung điểm $N$.',
    },
    {
      levelId: 3,
      order: 9,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tứ giác thiết diện hình thang từ giao tuyến song song',
      title: 'Hoàn thiện hình thang ABNM trong hình chóp',
      description: 'Cho hình chóp $S.ABCD$ đáy hình vuông với $M, N$ là trung điểm $SD, SC$. Hãy dựng đa giác thiết diện $ABNM$ (hình thang có $MN \\parallel AB$).',
      hypothesis: 'Hình chóp $S.ABCD$ cùng trung điểm $M \\in SD, N \\in SC$.',
      goal: 'Dựng đa giác $ABNM$.',
      setup: () => {
        let sc = buildPyramidABCDScene();
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'D'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'N', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'C'], label: 'N', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rules: [
        { type: 'has_polygon_with_vertices', refs: [], params: { minVerts: 4 }, description: 'Dựng được tứ giác ABNM.' },
        { type: 'has_plane_through_points', refs: ['A', 'B', 'N', 'M'], description: 'Bốn đỉnh A, B, N, M đồng phẳng.' },
      ],
      perturb: ['S'],
      hints: [
        'Vì MN ∥ CD và CD ∥ AB nên MN ∥ AB, suy ra bốn điểm A, B, N, M đồng phẳng và lập thành hình thang.',
        'Chọn công cụ Đa giác trong không gian.',
        'Nhấp lần lượt 4 đỉnh A, B, N, M.',
      ],
      steps: [{ id: 's1', actionText: 'Dựng đa giác ABNM.', mathExplanation: 'ABNM là hình thang với hai đáy AB và MN.', addInput: { id: 'sol_poly', kind: 'polygon', rule: 'polygon_3d', parents: ['A', 'B', 'N', 'M'], label: 'ABNM' } }],
      proof: 'Do $MN \\parallel CD \\parallel AB$ và $MN = \\frac{1}{2}AB$ nên $ABNM$ là hình thang.',
    },
    {
      levelId: 3,
      order: 10,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tổng hợp hai đường thẳng song song trong hình lập phương',
      title: "Dựng đường chéo song song trong hai mặt đối diện hình lập phương",
      description: "Cho hình lập phương $ABCD.A'B'C'D'$. Hãy dựng đường thẳng $d$ đi qua $B'$ và song song với đường chéo $AD'$, rồi dựng mặt phẳng chứa hai đường thẳng song song $AD'$ và $BC'$.",
      hypothesis: "Hình lập phương $ABCD.A'B'C'D'$ với đường chéo $AD'$.",
      goal: "Dựng $d$ qua $B'$ song song $AD'$ và mặt phẳng $(AD'C'B)$.",
      setup: () => {
        let sc = buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2 });
        sc = addGivenSeg(sc, 'eAD1', 'A', 'D1', "AD'", false);
        return sc;
      },
      rules: [
        { type: 'has_line_parallel_to_through', refs: ['B1', 'eAD1'], description: "Dựng đường thẳng qua B' song song AD'." },
        { type: 'has_plane_through_points', refs: ['A', 'D1', 'C1', 'B'], description: "Dựng mặt phẳng chéo (ABC'D')." },
      ],
      perturb: [],
      hints: [
        "Tứ giác ABC'D' là hình chữ nhật nên AD' ∥ BC'.",
        'Dùng Đường thẳng song song (B\', AD\') và Mặt phẳng qua 3 điểm (A, B, C\').',
        "Bước 1: Đường thẳng song song(B', AD'). Bước 2: Mặt phẳng qua 3 điểm(A, B, C').",
      ],
      steps: [
        { id: 's1', actionText: "Dựng đường thẳng qua B' song song AD'.", mathExplanation: "Đường thẳng có cùng vectơ chỉ phương với AD'.", addInput: { id: 'sol_d', kind: 'line', rule: 'line_parallel_point', parents: ['B1', 'eAD1'], label: 'd' } },
        { id: 's2', actionText: "Dựng mặt phẳng (ABC'D').", mathExplanation: "Chứa cặp cạnh song song AD' và BC'.", addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'C1'], label: "(ABC'D')" } },
      ],
      proof: "Vì $AB \\parallel C'D'$ và $AB = C'D'$ nên $ABC'D'$ là hình bình hành (hình chữ nhật), suy ra $AD' \\parallel BC'$.",
    },

    // =========================================================================
    // CẤP ĐỘ IV: ĐƯỜNG THẲNG SONG SONG VỚI MẶT PHẲNG (10 thử thách — Toán 11)
    // =========================================================================
    {
      levelId: 4,
      order: 1,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Dấu hiệu nhận biết đường thẳng song song với mặt phẳng',
      title: 'Dựng đường thẳng đi qua S song song mặt phẳng đáy (ABC)',
      description: 'Cho tứ diện $S.ABC$. Hãy dựng đường thẳng $d$ đi qua đỉnh $S$ và song song với cạnh $AB$ (suy ra $d \\parallel (ABC)$).',
      hypothesis: 'Tứ diện $S.ABC$ có mặt phẳng đáy $(ABC)$.',
      goal: 'Dựng đường thẳng $d$ qua $S$ song song mặt phẳng $(ABC)$ (qua việc song song với $AB$).',
      setup: () => buildTetrahedronScene({ withBasePlane: true }),
      rules: [{ type: 'has_line_parallel_plane_through', refs: ['S', 'plABC'], description: 'Đường thẳng đi qua S và song song với mặt phẳng (ABC).' }],
      perturb: ['S', 'A', 'B', 'C'],
      hints: [
        'Nếu đường thẳng d không nằm trong (P) và song song với một đường thẳng nằm trong (P) thì d ∥ (P).',
        'Chọn công cụ Đường thẳng song song.',
        'Nhấp vào đỉnh S rồi nhấp vào cạnh AB (hoặc BC, CA) nằm trong đáy (ABC).',
      ],
      steps: [{ id: 's1', actionText: 'Dựng đường thẳng qua S song song AB.', mathExplanation: 'Vì d ∥ AB và AB ⊂ (ABC) nên d ∥ (ABC).', addInput: { id: 'sol_d', kind: 'line', rule: 'line_parallel_point', parents: ['S', 'eAB'], label: 'd' } }],
      proof: 'Vì $d \\not\\subset (ABC)$, $AB \\subset (ABC)$ và $d \\parallel AB$ nên theo định lí dấu hiệu nhận biết ta có $d \\parallel (ABC)$.',
    },
    {
      levelId: 4,
      order: 2,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đường trung bình song song với mặt đáy hình chóp',
      title: 'Dựng đoạn MN song song với mặt đáy (ABCD)',
      description: 'Cho hình chóp $S.ABCD$. Hãy dựng trung điểm $M$ của $SA$, trung điểm $N$ của $SC$ và nối $MN \\parallel (ABCD)$.',
      hypothesis: 'Hình chóp $S.ABCD$ có mặt đáy $(ABCD)$.',
      goal: 'Dựng $M, N$ là trung điểm $SA, SC$ và nối đoạn thẳng $MN$.',
      setup: () => buildPyramidABCDScene({ withBasePlane: true }),
      rules: [
        { type: 'has_midpoint_of', refs: ['S', 'A'], description: 'Dựng trung điểm M của SA.' },
        { type: 'has_midpoint_of', refs: ['S', 'C'], description: 'Dựng trung điểm N của SC.' },
        { type: 'has_segment_between_midpoints', refs: ['S', 'A', 'S', 'C'], description: 'Nối MN song song AC nên MN ∥ (ABCD).' },
      ],
      perturb: ['S'],
      hints: [
        'Trong ΔSAC, đoạn nối trung điểm hai cạnh SA và SC song song với đường chéo đáy AC ⊂ (ABCD).',
        'Dùng Trung điểm cho SA, SC rồi dùng Đoạn thẳng nối M và N.',
        'Bước 1: M = trung điểm(S, A). Bước 2: N = trung điểm(S, C). Bước 3: Đoạn thẳng(M, N).',
      ],
      steps: [
        { id: 's1', actionText: 'Dựng trung điểm M của SA.', mathExplanation: 'M là trung điểm SA.', addInput: { id: 'sol_m', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'A'], label: 'M' } },
        { id: 's2', actionText: 'Dựng trung điểm N của SC.', mathExplanation: 'N là trung điểm SC.', addInput: { id: 'sol_n', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'C'], label: 'N' } },
        { id: 's3', actionText: 'Nối đoạn MN.', mathExplanation: 'MN ∥ AC và AC ⊂ (ABCD) ⇒ MN ∥ (ABCD).', addInput: { id: 'sol_mn', kind: 'segment', rule: 'segment_3d', parents: ['sol_m', 'sol_n'], label: 'MN' } },
      ],
      proof: 'Ta có $MN \\parallel AC$ (đường trung bình $\\triangle SAC$) mà $AC \\subset (ABCD)$ nên $MN \\parallel (ABCD)$.',
    },
    {
      levelId: 4,
      order: 3,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đường thẳng song song mặt bên trong hình lập phương',
      title: "Dựng đường thẳng qua B song song với mặt phẳng (CDD'C')",
      description: "Cho hình lập phương $ABCD.A'B'C'D'$. Hãy dựng đường thẳng qua điểm $B$ và song song với cạnh $CD'$ (nên song song mặt phẳng $(CDD'C')$).",
      hypothesis: "Hình lập phương $ABCD.A'B'C'D'$ có mặt bên $(CDD'C')$.",
      goal: "Dựng đường thẳng đi qua $B$ song song mặt phẳng $(CDD'C')$.",
      setup: () => {
        let sc = buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2 });
        sc = addGivenPlane3(sc, 'plCDD1', 'C', 'D', 'D1', "(CDD'C')", '#0284C7', 0.14);
        sc = addGivenSeg(sc, 'eCD1', 'C', 'D1', "CD'");
        return sc;
      },
      rules: [{ type: 'has_line_parallel_plane_through', refs: ['B', 'plCDD1'], description: "Đường thẳng đi qua B song song với mặt phẳng (CDD'C')." }],
      perturb: [],
      hints: [
        "Mọi đường thẳng đi qua B song song với một đường thẳng trong (CDD'C') như CD, CC' hoặc CD' đều song song với (CDD'C').",
        'Chọn công cụ Đường thẳng song song.',
        "Nhấp vào điểm B rồi nhấp vào cạnh CD' (hoặc CD).",
      ],
      steps: [{ id: 's1', actionText: "Dựng đường thẳng qua B song song CD'.", mathExplanation: "Đường thẳng qua B song song CD' nằm trong (ABB'A') nên song song (CDD'C').", addInput: { id: 'sol_l', kind: 'line', rule: 'line_parallel_point', parents: ['B', 'eCD1'], label: 'd' } }],
      proof: "Vì $d \\parallel CD'$ và $CD' \\subset (CDD'C')$, $B \\notin (CDD'C')$ nên $d \\parallel (CDD'C')$.",
    },
    {
      levelId: 4,
      order: 4,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Định lí về giao tuyến khi đường thẳng song song mặt phẳng',
      title: 'Tìm giao tuyến mặt phẳng chứa đường thẳng song song đáy',
      description: 'Cho hình chóp $S.ABCD$ đáy hình vuông. Mặt phẳng $(P)$ đi qua trung điểm $M$ của $SA$ và song song $AB$ cắt $(SAB)$ theo giao tuyến $d$. Hãy dựng đường thẳng $d$.',
      hypothesis: 'Hình chóp $S.ABCD$ và trung điểm $M$ của $SA$.',
      goal: 'Dựng đường thẳng $d$ qua $M$ song song $AB$.',
      setup: () => {
        let sc = buildPyramidABCDScene();
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'A'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rules: [{ type: 'has_line_parallel_to_through', refs: ['M', 'eAB'], description: 'Dựng giao tuyến d qua M song song AB.' }],
      perturb: ['S'],
      hints: [
        'Nếu đường thẳng AB ∥ (P) và mặt phẳng (SAB) chứa AB cắt (P) theo giao tuyến d thì d ∥ AB.',
        'Chọn công cụ Đường thẳng song song.',
        'Nhấp vào điểm M rồi nhấp vào cạnh AB.',
      ],
      steps: [{ id: 's1', actionText: 'Dựng đường thẳng d qua M song song AB.', mathExplanation: 'd = (P) ∩ (SAB) song song với AB.', addInput: { id: 'sol_d', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'eAB'], label: 'd' } }],
      proof: 'Theo tính chất đường thẳng song song mặt phẳng, vì $AB \\parallel (P)$ và $AB \\subset (SAB)$ nên giao tuyến của $(P)$ và $(SAB)$ qua $M$ phải song song với $AB$.',
    },
    {
      levelId: 4,
      order: 5,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đường thẳng nối trọng tâm hai mặt bên song song cạnh đáy',
      title: 'Dựng đường trung bình song song mặt bên (SBC)',
      description: 'Cho tứ diện $S.ABC$. Gọi $M, N$ lần lượt là trung điểm $SA, AB$. Hãy dựng đoạn thẳng $MN$ và chứng tỏ $MN \\parallel (SBC)$.',
      hypothesis: 'Tứ diện $S.ABC$ với mặt bên $(SBC)$.',
      goal: 'Dựng $M, N$ là trung điểm $SA, AB$ và nối $MN$.',
      setup: () => {
        let sc = buildTetrahedronScene();
        sc = addGivenPlane3(sc, 'plSBC', 'S', 'B', 'C', '(SBC)', '#0284C7', 0.14);
        return sc;
      },
      rules: [
        { type: 'has_midpoint_of', refs: ['S', 'A'], description: 'Dựng trung điểm M của SA.' },
        { type: 'has_midpoint_of', refs: ['A', 'B'], description: 'Dựng trung điểm N của AB.' },
        { type: 'has_segment_between_midpoints', refs: ['S', 'A', 'A', 'B'], description: 'Nối MN song song SB nên MN ∥ (SBC).' },
      ],
      perturb: ['S', 'A', 'B', 'C'],
      hints: [
        'Đường trung bình MN của tam giác SAB song song với cạnh SB nằm trong (SBC).',
        'Dùng công cụ Trung điểm và Đoạn thẳng.',
        'Dựng M = trung điểm(S, A), N = trung điểm(A, B), rồi nối MN.',
      ],
      steps: [
        { id: 's1', actionText: 'Dựng trung điểm M của SA.', mathExplanation: 'M là trung điểm SA.', addInput: { id: 'sol_m', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'A'], label: 'M' } },
        { id: 's2', actionText: 'Dựng trung điểm N của AB.', mathExplanation: 'N là trung điểm AB.', addInput: { id: 'sol_n', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'B'], label: 'N' } },
        { id: 's3', actionText: 'Nối đoạn thẳng MN.', mathExplanation: 'MN ∥ SB ⊂ (SBC) ⇒ MN ∥ (SBC).', addInput: { id: 'sol_mn', kind: 'segment', rule: 'segment_3d', parents: ['sol_m', 'sol_n'], label: 'MN' } },
      ],
      proof: 'Trong $\\triangle SAB$, $MN$ là đường trung bình ứng với cạnh $SB$ nên $MN \\parallel SB \\subset (SBC)$, suy ra $MN \\parallel (SBC)$.',
    },
    {
      levelId: 4,
      order: 6,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Mặt phẳng đi qua một đường thẳng và song song với đường thẳng chéo nhau',
      title: 'Dựng mặt phẳng chứa cạnh BC và song song cạnh SA',
      description: 'Cho tứ diện $S.ABC$. Hãy dựng đường thẳng $d$ qua $B$ song song với $SA$, rồi dựng mặt phẳng $(P)$ đi qua $B, C$ và chứa $d$ để có $SA \\parallel (P)$.',
      hypothesis: 'Tứ diện $S.ABC$.',
      goal: 'Dựng đường thẳng $d$ qua $B$ song song $SA$ và mặt phẳng $(P)$ chứa $d$ và $C$.',
      setup: () => buildTetrahedronScene(),
      rules: [
        { type: 'has_line_parallel_to_through', refs: ['B', 'eSA'], description: 'Dựng đường thẳng d qua B song song SA.' },
      ],
      perturb: ['S', 'A', 'B', 'C'],
      hints: [
        'Qua hai đường thẳng chéo nhau SA và BC có duy nhất một mặt phẳng chứa BC và song song với SA.',
        'Dùng Đường thẳng song song (B, SA) để dựng d, sau đó dùng Mặt phẳng qua đường thẳng và điểm (d, C).',
        'Bước 1: Đường thẳng song song(B, SA) → d. Bước 2: Mặt phẳng qua đường thẳng & điểm(d, C).',
      ],
      steps: [
        { id: 's1', actionText: 'Dựng đường thẳng d qua B song song SA.', mathExplanation: 'd ∥ SA và đi qua B.', addInput: { id: 'sol_d', kind: 'line', rule: 'line_parallel_point', parents: ['B', 'eSA'], label: 'd' } },
        { id: 's2', actionText: 'Dựng mặt phẳng (P) đi qua đường thẳng d và điểm C.', mathExplanation: 'Vì d ⊂ (P) và SA ∥ d nên SA ∥ (P).', addInput: { id: 'sol_p', kind: 'plane', rule: 'plane_line_point', parents: ['sol_d', 'C'], label: '(P)' } },
      ],
      proof: 'Mặt phẳng $(P) = (d, C)$ chứa $BC$ và chứa $d \\parallel SA$, trong khi $SA \\not\\subset (P)$, nên $SA \\parallel (P)$.',
    },
    {
      levelId: 4,
      order: 7,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đường thẳng song song mặt phẳng trong lăng trụ tam giác',
      title: "Chứng minh đường chéo A'B song song mặt phẳng chứa trung điểm",
      description: "Cho lăng trụ tam giác $ABC.A'B'C'$ với $M$ là trung điểm $AC$ và $O$ là tâm mặt bên $ABB'A'$. Hãy nối đoạn thẳng $OM$ song song với mặt phẳng $(BCC'B')$.",
      hypothesis: "Lăng trụ $ABC.A'B'C'$, trung điểm $M$ của $AC$, tâm $O$ của $ABB'A'$.",
      goal: "Dựng đoạn thẳng $OM$ song song với mặt phẳng $(BCC'B')$.",
      setup: () => {
        let sc = buildTriPrismScene({ right: true });
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'C'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'O', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'B1'], label: 'O', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGivenPlane3(sc, 'plBCC1', 'B', 'C', 'C1', "(BCC'B')", '#0284C7', 0.14);
        return sc;
      },
      rules: [
        { type: 'has_segment_between', refs: ['O', 'M'], description: 'Dựng đoạn thẳng OM.' },
        { type: 'has_line_parallel_plane_through', refs: ['M', 'plBCC1'], description: "OM song song mặt phẳng (BCC'B')." },
      ],
      perturb: [],
      hints: [
        "Trong tam giác AB'C, O là trung điểm AB' và M là trung điểm AC nên OM ∥ B'C ⊂ (BCC'B').",
        'Chọn công cụ Đoạn thẳng.',
        'Nhấp vào điểm O và điểm M để nối đoạn OM.',
      ],
      steps: [{ id: 's1', actionText: 'Nối đoạn thẳng OM.', mathExplanation: "OM là đường trung bình của ΔAB'C nên OM ∥ B'C ⇒ OM ∥ (BCC'B').", addInput: { id: 'sol_om', kind: 'segment', rule: 'segment_3d', parents: ['O', 'M'], label: 'OM' } }],
      proof: "Vì $O$ là trung điểm $AB'$ và $M$ là trung điểm $AC$ nên $OM \\parallel B'C \\subset (BCC'B')$, suy ra $OM \\parallel (BCC'B')$.",
    },
    {
      levelId: 4,
      order: 8,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tìm giao điểm dùng tính chất đường thẳng song song mặt phẳng',
      title: 'Dựng giao tuyến của mặt phẳng qua M song song với hai đường thẳng',
      description: 'Cho hình chóp $S.ABCD$ đáy hình vuông, $M$ là trung điểm $SB$. Hãy dựng đường thẳng $d_1$ qua $M$ song song $AB$ và $d_2$ qua $M$ song song $BC$.',
      hypothesis: 'Hình chóp $S.ABCD$ và trung điểm $M$ của $SB$.',
      goal: 'Dựng $d_1 \\parallel AB$ và $d_2 \\parallel BC$ đi qua $M$.',
      setup: () => {
        let sc = buildPyramidABCDScene({ withBasePlane: true });
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'B'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rules: [
        { type: 'has_line_parallel_to_through', refs: ['M', 'eAB'], description: 'Dựng d₁ qua M song song AB.' },
        { type: 'has_line_parallel_to_through', refs: ['M', 'eBC'], description: 'Dựng d₂ qua M song song BC.' },
      ],
      perturb: ['S'],
      hints: [
        'Hai đường thẳng d₁ và d₂ đi qua M lần lượt song song với hai cạnh đáy AB, BC sẽ xác định mặt phẳng song song với đáy.',
        'Dùng công cụ Đường thẳng song song hai lần.',
        'Nhấp (M, AB) để dựng d₁ và nhấp (M, BC) để dựng d₂.',
      ],
      steps: [
        { id: 's1', actionText: 'Dựng d₁ qua M song song AB.', mathExplanation: 'd₁ ∥ AB ⇒ d₁ ∥ (ABCD).', addInput: { id: 'sol_d1', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'eAB'], label: 'd₁' } },
        { id: 's2', actionText: 'Dựng d₂ qua M song song BC.', mathExplanation: 'd₂ ∥ BC ⇒ d₂ ∥ (ABCD).', addInput: { id: 'sol_d2', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'eBC'], label: 'd₂' } },
      ],
      proof: 'Vì $d_1 \\parallel AB$ và $d_2 \\parallel BC$ nên cả hai đường thẳng cùng song song với $(ABCD)$.',
    },
    {
      levelId: 4,
      order: 9,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tia song song mặt phẳng trong hình hộp',
      title: "Dựng đường thẳng qua tâm O của mặt đáy song song (A'BD)",
      description: "Cho hình lập phương $ABCD.A'B'C'D'$ có tâm mặt đáy $O = AC \\cap BD$. Hãy dựng đường thẳng $OC'$ và kiểm tra $OC' \\parallel (A'BD)$? Không — nối $O$ với trung điểm $I$ của $A'C'$? Hãy dựng đường thẳng qua $C$ song song với $A'O$ (suy ra song song $(A'BD)$).",
      hypothesis: "Hình lập phương $ABCD.A'B'C'D'$, tâm đáy $O$, đoạn $A'O$ và mặt phẳng $(A'BD)$.",
      goal: "Dựng đường thẳng đi qua $C$ song song với $A'O$ (nên song song mặt phẳng $(A'BD)$).",
      setup: () => {
        let sc = buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2 });
        sc = addGeo3DObject(sc, { id: 'O', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'C'], label: 'O', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGivenSeg(sc, 'eA1O', 'A1', 'O', "A'O");
        sc = addGivenPlane3(sc, 'plA1BD', 'A1', 'B', 'D', "(A'BD)", '#7C3AED', 0.14);
        return sc;
      },
      rules: [{ type: 'has_line_parallel_to_through', refs: ['C', 'eA1O'], description: "Dựng đường thẳng qua C song song A'O (suy ra song song (A'BD))." }],
      perturb: [],
      hints: [
        "Đường thẳng qua C song song với A'O (nằm trong (A'BD)) sẽ song song với mặt phẳng (A'BD).",
        'Chọn công cụ Đường thẳng song song.',
        "Nhấp vào điểm C rồi nhấp vào đoạn thẳng A'O.",
      ],
      steps: [{ id: 's1', actionText: "Dựng đường thẳng qua C song song A'O.", mathExplanation: "Đường thẳng này đi qua tâm O' của mặt trên và song song (A'BD).", addInput: { id: 'sol_l', kind: 'line', rule: 'line_parallel_point', parents: ['C', 'eA1O'], label: 'd' } }],
      proof: "Vì $d \\parallel A'O$ và $A'O \\subset (A'BD)$ nên $d \\parallel (A'BD)$.",
    },
    {
      levelId: 4,
      order: 10,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tổng hợp đường thẳng song song mặt phẳng',
      title: 'Dựng giao tuyến hai mặt phẳng cùng song song một đường thẳng',
      description: 'Cho hình chóp $S.ABCD$ đáy hình vuông. Dựng mặt phẳng $(P)$ đi qua trung điểm $M$ của $SA$ song song $(SBC)$ theo cách dựng hai đường thẳng $d_1 \\parallel SB$ và $d_2 \\parallel BC$ qua $M$, rồi dựng mặt phẳng $(P)$ chứa $d_1, d_2$.',
      hypothesis: 'Hình chóp $S.ABCD$ và trung điểm $M$ của $SA$.',
      goal: 'Dựng $d_1$ qua $M$ song song $SB$, $d_2$ qua $M$ song song $BC$, và mặt phẳng $(P)$ chứa $d_1, d_2$.',
      setup: () => {
        let sc = buildPyramidABCDScene();
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'A'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGivenPlane3(sc, 'plSBC', 'S', 'B', 'C', '(SBC)', '#0284C7', 0.13);
        return sc;
      },
      rules: [
        { type: 'has_line_parallel_to_through', refs: ['M', 'eSB'], description: 'Dựng d₁ qua M song song SB.' },
        { type: 'has_line_parallel_to_through', refs: ['M', 'eBC'], description: 'Dựng d₂ qua M song song BC.' },
        { type: 'has_plane_parallel_to_through', refs: ['M', 'plSBC'], description: 'Dựng mặt phẳng (P) qua M song song (SBC).' },
      ],
      perturb: ['S'],
      hints: [
        'Mặt phẳng chứa hai đường thẳng cắt nhau d₁ ∥ SB và d₂ ∥ BC sẽ song song với (SBC).',
        'Dùng Đường thẳng song song hai lần rồi dùng Mặt phẳng qua hai đường thẳng cắt nhau.',
        'Bước 1: d₁ ∥ SB qua M. Bước 2: d₂ ∥ BC qua M. Bước 3: Mặt phẳng(d₁, d₂).',
      ],
      steps: [
        { id: 's1', actionText: 'Dựng d₁ qua M song song SB.', mathExplanation: 'd₁ ∥ SB ⊂ (SBC).', addInput: { id: 'sol_d1', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'eSB'], label: 'd₁' } },
        { id: 's2', actionText: 'Dựng d₂ qua M song song BC.', mathExplanation: 'd₂ ∥ BC ⊂ (SBC).', addInput: { id: 'sol_d2', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'eBC'], label: 'd₂' } },
        { id: 's3', actionText: 'Dựng mặt phẳng (P) chứa d₁ và d₂.', mathExplanation: '(P) song song với (SBC).', addInput: { id: 'sol_p', kind: 'plane', rule: 'plane_two_lines', parents: ['sol_d1', 'sol_d2'], label: '(P)' } },
      ],
      proof: 'Hai đường thẳng cắt nhau $d_1, d_2 \\subset (P)$ lần lượt song song với $SB, BC \\subset (SBC)$ nên $(P) \\parallel (SBC)$.',
    },

    // =========================================================================
    // CẤP ĐỘ V: HAI MẶT PHẲNG SONG SONG (10 thử thách — Toán 11)
    // =========================================================================
    {
      levelId: 5,
      order: 1,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Mặt phẳng đi qua một điểm và song song mặt phẳng cho trước',
      title: 'Dựng mặt phẳng qua điểm M song song mặt phẳng (P)',
      description: 'Cho mặt phẳng $(P)$ và điểm $M \\notin (P)$. Hãy dựng mặt phẳng $(Q)$ đi qua $M$ và song song với $(P)$.',
      hypothesis: 'Mặt phẳng $(P) = (ABC)$ và điểm $M \\notin (P)$.',
      goal: 'Dựng mặt phẳng $(Q)$ qua $M$ sao cho $(Q) \\parallel (P)$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2, -1.5, 0) },
          { id: 'B', label: 'B', pos: v3(2, -1.5, 0) },
          { id: 'C', label: 'C', pos: v3(0, 2, 0.5) },
          { id: 'M', label: 'M', pos: v3(0, 0, 2.8) },
        ]);
        sc = addGivenPlane3(sc, 'plP', 'A', 'B', 'C', '(P)', '#0F766E', 0.16);
        return sc;
      },
      rules: [{ type: 'has_plane_parallel_to_through', refs: ['M', 'plP'], description: 'Dựng mặt phẳng (Q) qua M song song (P).' }],
      perturb: ['A', 'B', 'C', 'M'],
      hints: [
        'Qua một điểm nằm ngoài một mặt phẳng cho trước có một và chỉ một mặt phẳng song song với mặt phẳng đó.',
        'Mở nhóm Mặt phẳng và chọn Mặt phẳng song song.',
        'Nhấp vào điểm M rồi nhấp vào mặt phẳng (P).',
      ],
      steps: [{ id: 's1', actionText: 'Chọn Mặt phẳng song song và nhấp M, (P).', mathExplanation: '(Q) có cùng vectơ pháp tuyến với (P) và đi qua M.', addInput: { id: 'sol_q', kind: 'plane', rule: 'plane_parallel_point', parents: ['M', 'plP'], label: '(Q)' } }],
      proof: 'Qua điểm $M \\notin (P)$ có duy nhất mặt phẳng $(Q) \\parallel (P)$.',
    },
    {
      levelId: 5,
      order: 2,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Mặt phẳng cắt hình chóp song song với đáy',
      title: 'Dựng mặt phẳng qua trung điểm cạnh bên song song đáy hình chóp',
      description: 'Cho tứ diện $S.ABC$ và trung điểm $M$ của $SA$. Hãy dựng mặt phẳng $(Q)$ đi qua $M$ và song song với mặt phẳng đáy $(ABC)$.',
      hypothesis: 'Tứ diện $S.ABC$, mặt đáy $(ABC)$ và trung điểm $M$ của $SA$.',
      goal: 'Dựng mặt phẳng $(Q)$ qua $M$ và song song $(ABC)$.',
      setup: () => {
        let sc = buildTetrahedronScene({ withBasePlane: true });
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'A'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rules: [{ type: 'has_plane_parallel_to_through', refs: ['M', 'plABC'], description: 'Mặt phẳng qua M song song (ABC).' }],
      perturb: ['S', 'A', 'B', 'C'],
      hints: [
        'Mặt phẳng qua trung điểm SA song song đáy (ABC) sẽ đi qua trung điểm của SB và SC.',
        'Chọn công cụ Mặt phẳng song song.',
        'Nhấp vào điểm M rồi nhấp vào mặt phẳng đáy (ABC).',
      ],
      steps: [{ id: 's1', actionText: 'Dựng mặt phẳng qua M song song (ABC).', mathExplanation: '(Q) cắt SB, SC lần lượt tại trung điểm của chúng.', addInput: { id: 'sol_q', kind: 'plane', rule: 'plane_parallel_point', parents: ['M', 'plABC'], label: '(Q)' } }],
      proof: 'Mặt phẳng $(Q)$ đi qua $M$ song song $(ABC)$ cắt các cạnh bên theo các tỉ số bằng nhau (định lí Thales trong không gian).',
    },
    {
      levelId: 5,
      order: 3,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hai mặt đáy của hình lăng trụ song song',
      title: 'Dựng mặt phẳng đáy trên song song đáy dưới của hình hộp',
      description: "Cho hình hộp $ABCD.A'B'C'D'$ với mặt đáy $(ABCD)$. Hãy dựng mặt phẳng đi qua $A'$ song song với $(ABCD)$ và kiểm chứng nó chứa $B', C', D'$.",
      hypothesis: "Hình hộp $ABCD.A'B'C'D'$ và mặt đáy $(ABCD)$.",
      goal: "Dựng mặt phẳng $(A'B'C'D') \\parallel (ABCD)$.",
      setup: () => buildBoxVerticesScene({ lx: 3.4, ly: 2.6, lz: 3, withBasePlane: true }),
      rules: [
        { type: 'has_plane_parallel_to_through', refs: ['A1', 'plBase'], description: "Mặt phẳng qua A' song song (ABCD)." },
        { type: 'has_plane_through_points', refs: ['A1', 'B1', 'C1', 'D1'], description: "Chứa cả 4 đỉnh A', B', C', D'." },
      ],
      perturb: [],
      hints: [
        "Hai mặt đáy của hình hộp luôn nằm trên hai mặt phẳng song song.",
        'Chọn công cụ Mặt phẳng song song.',
        "Nhấp vào điểm A' rồi nhấp vào mặt phẳng đáy (ABCD).",
      ],
      steps: [{ id: 's1', actionText: "Dựng mặt phẳng qua A' song song (ABCD).", mathExplanation: "Mặt phẳng này trùng với mặt đáy trên (A'B'C'D').", addInput: { id: 'sol_top', kind: 'plane', rule: 'plane_parallel_point', parents: ['A1', 'plBase'], label: "(A'B'C'D')" } }],
      proof: "Trong hình hộp $ABCD.A'B'C'D'$, $A'B' \\parallel AB$ và $A'D' \\parallel AD$ nên $(A'B'C'D') \\parallel (ABCD)$.",
    },
    {
      levelId: 5,
      order: 4,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hai mặt phẳng chéo song song trong hình lập phương',
      title: "Chứng tỏ (BDA') song song (B'D'C) trong hình lập phương",
      description: "Cho hình lập phương $ABCD.A'B'C'D'$ có sẵn mặt phẳng $(A'BD)$. Hãy dựng mặt phẳng $(B'D'C)$ và kiểm chứng $(B'D'C) \\parallel (A'BD)$.",
      hypothesis: "Hình lập phương $ABCD.A'B'C'D'$ và mặt phẳng $(A'BD)$.",
      goal: "Dựng mặt phẳng đi qua $C$ song song $(A'BD)$ (chính là mặt phẳng $(B'D'C)$).",
      setup: () => {
        let sc = buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2 });
        sc = addGivenPlane3(sc, 'plA1BD', 'A1', 'B', 'D', "(A'BD)", '#0F766E', 0.15);
        return sc;
      },
      rules: [
        { type: 'has_plane_parallel_to_through', refs: ['C', 'plA1BD'], description: "Mặt phẳng qua C song song (A'BD)." },
        { type: 'has_plane_through_points', refs: ['B1', 'D1', 'C'], description: "Mặt phẳng đi qua B', D', C." },
      ],
      perturb: [],
      hints: [
        "Trong hình lập phương, B'D' ∥ BD và B'C ∥ A'D nên (B'D'C) ∥ (A'BD).",
        'Chọn Mặt phẳng qua 3 điểm (B\', D\', C) hoặc Mặt phẳng song song (C, (A\'BD)).',
        "Nhấp lần lượt B', D', C.",
      ],
      steps: [{ id: 's1', actionText: "Dựng mặt phẳng (B'D'C).", mathExplanation: "(B'D'C) song song với (A'BD).", addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['B1', 'D1', 'C'], label: "(B'D'C)" } }],
      proof: "Vì $B'D' \\parallel BD$ và $B'C \\parallel A'D$ (cùng nằm trong các hình bình hành $BDD'B'$ và $A'BCD'$) nên $(B'D'C) \\parallel (A'BD)$.",
    },
    {
      levelId: 5,
      order: 5,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Định lí về hai giao tuyến song song khi một mặt phẳng cắt hai mặt phẳng song song',
      title: 'Dựng hai giao tuyến song song trên hai mặt đáy lăng trụ',
      description: "Cho lăng trụ tam giác $ABC.A'B'C'$ có hai đáy song song $(ABC) \\parallel (A'B'C')$ và mặt phẳng cắt $(P)$. Hãy dựng hai giao tuyến $d_1 = (P) \\cap (ABC)$ và $d_2 = (P) \\cap (A'B'C')$.",
      hypothesis: "Hai mặt đáy song song $(ABC), (A'B'C')$ và mặt phẳng cắt $(P)$.",
      goal: 'Dựng cả hai giao tuyến $d_1$ và $d_2$ song song với nhau.',
      setup: () => {
        let sc = buildTriPrismScene({ right: true, withBasePlane: true });
        sc = addGivenPlane3(sc, 'plTop', 'A1', 'B1', 'C1', "(A'B'C')", '#0284C7', 0.12);
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'B'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'N', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'C'], label: 'N', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'K', kind: 'point', rule: 'midpoint_3d', parents: ['B1', 'C1'], label: 'K', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGivenPlane3(sc, 'plP', 'M', 'N', 'K', '(P)', '#7C3AED', 0.14);
        return sc;
      },
      rules: [
        { type: 'has_intersection_line_planes', refs: ['plP', 'plABC'], description: 'Dựng giao tuyến d₁ của (P) và (ABC).' },
        { type: 'has_intersection_line_planes', refs: ['plP', 'plTop'], description: "Dựng giao tuyến d₂ của (P) và (A'B'C')." },
      ],
      perturb: [],
      hints: [
        'Một mặt phẳng cắt hai mặt phẳng song song theo hai giao tuyến song song với nhau.',
        'Dùng công cụ Giao tuyến 2 mặt phẳng hai lần.',
        "Lần 1: (P) và (ABC). Lần 2: (P) và (A'B'C').",
      ],
      steps: [
        { id: 's1', actionText: 'Dựng giao tuyến d₁ = (P) ∩ (ABC).', mathExplanation: 'Giao tuyến thứ nhất trên đáy dưới.', addInput: { id: 'sol_d1', kind: 'line', rule: 'intersect_plane_plane', parents: ['plP', 'plABC'], label: 'd₁' } },
        { id: 's2', actionText: "Dựng giao tuyến d₂ = (P) ∩ (A'B'C').", mathExplanation: 'Giao tuyến thứ hai trên đáy trên, song song d₁.', addInput: { id: 'sol_d2', kind: 'line', rule: 'intersect_plane_plane', parents: ['plP', 'plTop'], label: 'd₂' } },
      ],
      proof: "Vì $(ABC) \\parallel (A'B'C')$ nên hai giao tuyến $d_1, d_2$ của $(P)$ với hai mặt đáy đồng phẳng và không có điểm chung, suy ra $d_1 \\parallel d_2$.",
    },
    {
      levelId: 5,
      order: 6,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Định lí Thales trong không gian qua ba mặt phẳng song song',
      title: 'Xác định giao điểm theo định lí Thales trong không gian',
      description: 'Cho hình chóp $S.ABCD$ với mặt phẳng $(Q)$ qua điểm $M \\in SA$ và song song đáy $(ABCD)$. Hãy tìm giao điểm $N = SB \\cap (Q)$ và $P = SC \\cap (Q)$.',
      hypothesis: 'Hình chóp $S.ABCD$, mặt phẳng $(Q) \\parallel (ABCD)$.',
      goal: 'Dựng giao điểm $N = SB \\cap (Q)$ và $P = SC \\cap (Q)$.',
      setup: () => {
        let sc = buildPyramidABCDScene({ withBasePlane: true });
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'point_on_segment', parents: ['eSA'], t: 0.4, label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'plQ', kind: 'plane', rule: 'plane_parallel_point', parents: ['M', 'plABCD'], label: '(Q)', style: { color: '#7C3AED', opacity: 0.15, isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rules: [
        { type: 'has_intersection_line_plane', refs: ['eSB', 'plQ'], description: 'Tìm giao điểm N = SB ∩ (Q).' },
        { type: 'has_intersection_line_plane', refs: ['eSC', 'plQ'], description: 'Tìm giao điểm P = SC ∩ (Q).' },
      ],
      perturb: ['S'],
      hints: [
        'Mặt phẳng song song đáy cắt các cạnh bên theo tỉ số bằng nhau: SM/SA = SN/SB = SP/SC.',
        'Dùng Giao điểm đường thẳng – mặt phẳng hai lần.',
        'Lần 1: SB và (Q) → N. Lần 2: SC và (Q) → P.',
      ],
      steps: [
        { id: 's1', actionText: 'Dựng giao điểm N = SB ∩ (Q).', mathExplanation: 'SN/SB = SM/SA.', addInput: { id: 'sol_n', kind: 'point', rule: 'intersect_line_plane', parents: ['eSB', 'plQ'], label: 'N' } },
        { id: 's2', actionText: 'Dựng giao điểm P = SC ∩ (Q).', mathExplanation: 'SP/SC = SM/SA.', addInput: { id: 'sol_p', kind: 'point', rule: 'intersect_line_plane', parents: ['eSC', 'plQ'], label: 'P' } },
      ],
      proof: 'Theo định lí Thales trong không gian, mặt phẳng $(Q) \\parallel (ABCD)$ cắt các cạnh bên tại $M, N, P$ sao cho $\\frac{SM}{SA} = \\frac{SN}{SB} = \\frac{SP}{SC}$.',
    },
    {
      levelId: 5,
      order: 7,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Mặt phẳng trung bình của tứ diện',
      title: 'Dựng mặt phẳng qua ba trung điểm song song mặt bên (SBC)',
      description: 'Cho tứ diện $S.ABC$. Hãy dựng ba trung điểm $M, N, P$ của $SA, AB, AC$ rồi dựng mặt phẳng $(MNP)$ song song $(SBC)$.',
      hypothesis: 'Tứ diện $S.ABC$ và mặt bên $(SBC)$.',
      goal: 'Dựng trung điểm $M, N, P$ của $SA, AB, AC$ và mặt phẳng $(MNP)$.',
      setup: () => {
        let sc = buildTetrahedronScene();
        sc = addGivenPlane3(sc, 'plSBC', 'S', 'B', 'C', '(SBC)', '#0284C7', 0.14);
        return sc;
      },
      rules: [
        { type: 'has_midpoint_of', refs: ['S', 'A'], description: 'Dựng trung điểm M của SA.' },
        { type: 'has_midpoint_of', refs: ['A', 'B'], description: 'Dựng trung điểm N của AB.' },
        { type: 'has_midpoint_of', refs: ['A', 'C'], description: 'Dựng trung điểm P của AC.' },
      ],
      perturb: ['S', 'A', 'B', 'C'],
      hints: [
        'Ba đường trung bình MN, NP, PM lần lượt song song với SB, BC, CS nên (MNP) ∥ (SBC).',
        'Dùng Trung điểm 3 lần rồi dùng Mặt phẳng qua 3 điểm.',
        'Dựng M = trung điểm(S,A), N = trung điểm(A,B), P = trung điểm(A,C) và dựng (MNP).',
      ],
      steps: [
        { id: 's1', actionText: 'Dựng trung điểm M của SA.', mathExplanation: 'M ∈ SA.', addInput: { id: 'sol_m', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'A'], label: 'M' } },
        { id: 's2', actionText: 'Dựng trung điểm N của AB.', mathExplanation: 'N ∈ AB.', addInput: { id: 'sol_n', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'B'], label: 'N' } },
        { id: 's3', actionText: 'Dựng trung điểm P của AC.', mathExplanation: 'P ∈ AC.', addInput: { id: 'sol_p', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'C'], label: 'P' } },
        { id: 's4', actionText: 'Dựng mặt phẳng (MNP).', mathExplanation: 'MN ∥ SB, NP ∥ BC nên (MNP) ∥ (SBC).', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['sol_m', 'sol_n', 'sol_p'], label: '(MNP)' } },
      ],
      proof: 'Vì $MN \\parallel SB$ và $NP \\parallel BC$ nên $(MNP) \\parallel (SBC)$.',
    },
    {
      levelId: 5,
      order: 8,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Mặt phẳng song song mặt bên trong hình chóp cụt / hình chóp',
      title: 'Dựng mặt phẳng qua trung điểm O của AC song song mặt bên (SAB)',
      description: 'Cho hình chóp $S.ABCD$ đáy hình vuông có tâm $O = AC \\cap BD$. Hãy dựng mặt phẳng $(Q)$ đi qua $O$ và song song với mặt bên $(SAB)$.',
      hypothesis: 'Hình chóp $S.ABCD$, mặt bên $(SAB)$ và tâm đáy $O$.',
      goal: 'Dựng mặt phẳng $(Q)$ qua $O$ và song song $(SAB)$.',
      setup: () => {
        let sc = buildPyramidABCDScene();
        sc = addGeo3DObject(sc, { id: 'O', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'C'], label: 'O', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGivenPlane3(sc, 'plSAB', 'S', 'A', 'B', '(SAB)', '#0F766E', 0.14);
        return sc;
      },
      rules: [{ type: 'has_plane_parallel_to_through', refs: ['O', 'plSAB'], description: 'Dựng mặt phẳng (Q) qua O song song (SAB).' }],
      perturb: ['S'],
      hints: [
        'Mặt phẳng qua O song song (SAB) sẽ cắt (ABCD) theo đường trung bình qua O song song AB và cắt SC, SD tại trung điểm của chúng.',
        'Chọn công cụ Mặt phẳng song song.',
        'Nhấp vào điểm O rồi nhấp vào mặt phẳng (SAB).',
      ],
      steps: [{ id: 's1', actionText: 'Dựng mặt phẳng qua O song song (SAB).', mathExplanation: '(Q) cắt hình chóp theo thiết diện hình thang.', addInput: { id: 'sol_q', kind: 'plane', rule: 'plane_parallel_point', parents: ['O', 'plSAB'], label: '(Q)' } }],
      proof: 'Qua $O \\notin (SAB)$ có duy nhất mặt phẳng $(Q) \\parallel (SAB)$.',
    },
    {
      levelId: 5,
      order: 9,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Mặt phẳng song song trong lăng trụ tam giác',
      title: "Dựng mặt phẳng qua A song song với (A'BC)",
      description: "Cho lăng trụ tam giác $ABC.A'B'C'$ với mặt phẳng $(A'BC)$ đã cho. Hãy dựng mặt phẳng $(Q)$ đi qua $B'$ và song song với $(A'BC)$.",
      hypothesis: "Lăng trụ $ABC.A'B'C'$ và mặt phẳng $(A'BC)$.",
      goal: "Dựng mặt phẳng $(Q)$ đi qua $B'$ và song song với $(A'BC)$.",
      setup: () => {
        let sc = buildTriPrismScene({ right: false });
        sc = addGivenPlane3(sc, 'plA1BC', 'A1', 'B', 'C', "(A'BC)", '#0284C7', 0.14);
        return sc;
      },
      rules: [{ type: 'has_plane_parallel_to_through', refs: ['B1', 'plA1BC'], description: "Mặt phẳng qua B' song song (A'BC)." }],
      perturb: [],
      hints: [
        "Mặt phẳng qua B' song song (A'BC) sẽ chứa cạnh B'C' vì B'C' ∥ BC.",
        'Chọn công cụ Mặt phẳng song song.',
        "Nhấp vào đỉnh B' rồi nhấp vào mặt phẳng (A'BC).",
      ],
      steps: [{ id: 's1', actionText: "Dựng mặt phẳng qua B' song song (A'BC).", mathExplanation: "Mặt phẳng song song với (A'BC) và đi qua B', C'.", addInput: { id: 'sol_q', kind: 'plane', rule: 'plane_parallel_point', parents: ['B1', 'plA1BC'], label: '(Q)' } }],
      proof: "Vì $B'C' \\parallel BC \\subset (A'BC)$ nên mặt phẳng qua $B'$ song song $(A'BC)$ cũng chứa toàn bộ cạnh $B'C'$.",
    },
    {
      levelId: 5,
      order: 10,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tổng hợp thiết diện song song trong khối lập phương',
      title: "Dựng thiết diện song song với mặt phẳng (A'BD) trong khối lập phương",
      description: "Cho khối lập phương $ABCD.A'B'C'D'$, mặt phẳng $(A'BD)$ và trung điểm $M$ của cạnh $BC$. Hãy dựng mặt phẳng $(Q)$ qua $M$ song song $(A'BD)$ rồi dựng thiết diện của khối lập phương cắt bởi $(Q)$.",
      hypothesis: "Khối lập phương, mặt phẳng $(A'BD)$ và trung điểm $M$ của $BC$.",
      goal: "Dựng $(Q)$ qua $M$ song song $(A'BD)$ và dựng thiết diện lục giác đều của khối lập phương.",
      setup: () => {
        let sc = buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2, withSolid: true });
        sc = addGivenPlane3(sc, 'plA1BD', 'A1', 'B', 'D', "(A'BD)", '#0F766E', 0.12);
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['B', 'C'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rules: [
        { type: 'has_plane_parallel_to_through', refs: ['M', 'plA1BD'], description: "Mặt phẳng (Q) qua M song song (A'BD)." },
        { type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 6 }, description: 'Dựng được thiết diện lục giác của khối lập phương.' },
      ],
      perturb: [],
      hints: [
        "Mặt phẳng đi qua trung điểm cạnh BC và song song với (A'BD) đi qua trung điểm của 6 cạnh nên cắt khối lập phương theo một lục giác đều.",
        'Dùng Mặt phẳng song song (M, (A\'BD)), sau đó dùng Thiết diện khối – mặt phẳng.',
        "Bước 1: Mặt phẳng song song(M, (A'BD)) → (Q). Bước 2: Thiết diện(Khối lập phương, (Q)).",
      ],
      steps: [
        { id: 's1', actionText: "Dựng (Q) qua M song song (A'BD).", mathExplanation: "(Q) đi qua trung điểm 6 cạnh của hình lập phương.", addInput: { id: 'sol_q', kind: 'plane', rule: 'plane_parallel_point', parents: ['M', 'plA1BD'], label: '(Q)' } },
        { id: 's2', actionText: 'Dựng thiết diện của khối lập phương cắt bởi (Q).', mathExplanation: 'Thiết diện là lục giác đều có cạnh a√2/2.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['solidBox', 'sol_q'], label: 'Thiết diện' } },
      ],
      proof: "Mặt phẳng qua trung điểm $M$ của $BC$ song song $(A'BD)$ cắt 6 cạnh $BC, CD, DD', D'A', A'B', B'B$ tại trung điểm của chúng tạo thành thiết diện lục giác đều.",
    },

    // =========================================================================
    // CẤP ĐỘ VI: PHÉP CHIẾU SONG SONG (10 thử thách — Toán 11)
    // =========================================================================
    {
      levelId: 6,
      order: 1,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Định nghĩa hình chiếu song song của một điểm',
      title: 'Xác định hình chiếu song song của điểm M lên mặt phẳng (P)',
      description: 'Cho mặt phẳng chiếu $(P)$, phương chiếu $l$ và điểm $M$ ngoài $(P)$. Hãy dựng đường thẳng qua $M$ song song $l$ rồi tìm hình chiếu song song $M\'$ của $M$ trên $(P)$.',
      hypothesis: 'Mặt phẳng $(P)$, đường thẳng phương chiếu $l$ và điểm $M$.',
      goal: 'Dựng tia chiếu qua $M$ song song $l$ và giao điểm $M\'$ trên $(P)$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.5, -2, 0) },
          { id: 'B', label: 'B', pos: v3(2.5, -2, 0) },
          { id: 'C', label: 'C', pos: v3(0, 2.5, 0) },
          { id: 'L1', label: 'L₁', pos: v3(-2.5, 1.5, 0) },
          { id: 'L2', label: 'L₂', pos: v3(-1.5, 2.0, 3) },
          { id: 'M', label: 'M', pos: v3(1.2, 0.4, 3.0) },
        ]);
        sc = addGivenPlane3(sc, 'plP', 'A', 'B', 'C', '(P)', '#0F766E', 0.16);
        sc = addGivenLine(sc, 'll', 'L1', 'L2', 'l', '#0284C7');
        return sc;
      },
      rules: [
        { type: 'has_line_parallel_to_through', refs: ['M', 'll'], description: 'Dựng đường thẳng qua M song song phương chiếu l.' },
        { type: 'has_point_on_plane', refs: ['plP'], description: "Xác định hình chiếu song song M' trên (P)." },
      ],
      perturb: ['M'],
      hints: [
        "Hình chiếu song song M' của M lên (P) theo phương l là giao điểm của đường thẳng qua M song song l với mặt phẳng (P).",
        'Dùng Đường thẳng song song (M, l), sau đó dùng Giao điểm đường – mặt với (P).',
        'Bước 1: d = Đường thẳng song song(M, l). Bước 2: M\' = Giao điểm(d, (P)).',
      ],
      steps: [
        { id: 's1', actionText: 'Dựng đường chiếu qua M song song l.', mathExplanation: 'Đường chiếu song song với phương l.', addInput: { id: 'sol_d', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'll'], label: 'd' } },
        { id: 's2', actionText: "Tìm giao điểm M' của d với (P).", mathExplanation: "M' là hình chiếu song song của M lên (P).", addInput: { id: 'sol_m1', kind: 'point', rule: 'intersect_line_plane', parents: ['sol_d', 'plP'], label: "M'" } },
      ],
      proof: "Theo định nghĩa phép chiếu song song, $M'$ là giao điểm duy nhất của đường thẳng qua $M$ song song phương $l$ với mặt phẳng chiếu $(P)$.",
    },
    {
      levelId: 6,
      order: 2,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hình chiếu song song của điểm nằm trên mặt phẳng chiếu',
      title: 'Phép chiếu song song theo phương cạnh bên lăng trụ',
      description: "Cho lăng trụ nghiêng $ABC.A'B'C'$. Xét phép chiếu song song lên mặt đáy $(ABC)$ theo phương cạnh bên $AA'$. Hãy dựng đường thẳng qua trung điểm $M$ của $A'B'$ song song $AA'$ và tìm hình chiếu $M_1$ trên $(ABC)$.",
      hypothesis: "Lăng trụ $ABC.A'B'C'$, mặt đáy $(ABC)$ và trung điểm $M$ của $A'B'$.",
      goal: "Tìm hình chiếu song song $M_1$ của $M$ trên $(ABC)$ theo phương $AA'$ (chính là trung điểm $AB$).",
      setup: () => {
        let sc = buildTriPrismScene({ right: false, withBasePlane: true });
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['A1', 'B1'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rules: [
        { type: 'has_line_parallel_to_through', refs: ['M', 'eAA1'], description: "Dựng đường chiếu qua M song song AA'." },
        { type: 'has_midpoint_of', refs: ['A', 'B'], description: 'Hình chiếu M₁ trùng với trung điểm cạnh AB.' },
      ],
      perturb: [],
      hints: [
        "Phép chiếu song song bảo toàn tỉ số độ dài nên hình chiếu của trung điểm A'B' chính là trung điểm AB.",
        'Dùng Đường thẳng song song (M, AA\') rồi lấy giao điểm với (ABC).',
        "Bước 1: d = Đường thẳng song song(M, AA'). Bước 2: M₁ = Giao điểm(d, (ABC)).",
      ],
      steps: [
        { id: 's1', actionText: "Dựng đường chiếu qua M song song AA'.", mathExplanation: "Đường chiếu nằm trong mặt bên ABB'A'.", addInput: { id: 'sol_d', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'eAA1'], label: 'd' } },
        { id: 's2', actionText: 'Tìm giao điểm M₁ của d và (ABC).', mathExplanation: 'M₁ là trung điểm của AB.', addInput: { id: 'sol_m1', kind: 'point', rule: 'intersect_line_plane', parents: ['sol_d', 'plABC'], label: 'M₁' } },
      ],
      proof: "Vì $A' \\mapsto A$, $B' \\mapsto B$ qua phép chiếu phương $AA'$ và phép chiếu song song bảo toàn tỉ số đoạn thẳng nên trung điểm $M$ của $A'B'$ chiếu thành trung điểm $M_1$ của $AB$.",
    },
    {
      levelId: 6,
      order: 3,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hình chiếu song song của đoạn thẳng lên mặt phẳng',
      title: 'Dựng hình chiếu song song của đoạn thẳng AB lên mặt đáy',
      description: 'Cho mặt phẳng $(P)$, phương chiếu $l$ và hai điểm $M, N$ đã có sẵn đường chiếu $d_M, d_N$. Hãy tìm hai hình chiếu $M\', N\'$ trên $(P)$ và nối đoạn chiếu $M\'N\'$.',
      hypothesis: 'Mặt phẳng $(P)$, hai đường chiếu $d_M, d_N$ song song phương chiếu.',
      goal: 'Tìm $M\' = d_M \\cap (P)$, $N\' = d_N \\cap (P)$ và nối đoạn $M\'N\'$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-3, -2, 0) },
          { id: 'B', label: 'B', pos: v3(3, -2, 0) },
          { id: 'C', label: 'C', pos: v3(0, 3, 0) },
          { id: 'M', label: 'M', pos: v3(-1.2, -0.4, 2.8) },
          { id: 'N', label: 'N', pos: v3(1.8, 0.8, 3.2) },
          { id: 'M0', label: 'M₀', pos: v3(-2.0, -1.0, 0) },
          { id: 'N0', label: 'N₀', pos: v3(0.8857, 0.1143, 0) },
        ]);
        sc = addGivenPlane3(sc, 'plP', 'A', 'B', 'C', '(P)', '#0F766E', 0.15);
        sc = addGivenSeg(sc, 'eMN', 'M', 'N', 'MN');
        sc = addGivenLine(sc, 'dM', 'M', 'M0', 'd_M', '#0284C7');
        sc = addGivenLine(sc, 'dN', 'N', 'N0', 'd_N', '#0284C7');
        return sc;
      },
      rules: [
        { type: 'has_intersection_line_plane', refs: ['dM', 'plP'], description: "Tìm hình chiếu M' của M." },
        { type: 'has_intersection_line_plane', refs: ['dN', 'plP'], description: "Tìm hình chiếu N' của N." },
        { type: 'has_segment_between', refs: ['M0', 'N0'], description: "Nối đoạn chiếu M'N'." },
      ],
      perturb: [],
      hints: [
        "Hình chiếu song song của đoạn thẳng MN là đoạn thẳng nối hai hình chiếu M' và N' của hai đầu mút.",
        'Dùng Giao điểm đường – mặt cho d_M, d_N với (P), rồi dùng Đoạn thẳng nối M\'N\'.',
        "Bước 1: M' = d_M ∩ (P). Bước 2: N' = d_N ∩ (P). Bước 3: Nối M'N'.",
      ],
      steps: [
        { id: 's1', actionText: "Tìm M' = d_M ∩ (P).", mathExplanation: "M' là hình chiếu của M.", addInput: { id: 'sol_m1', kind: 'point', rule: 'intersect_line_plane', parents: ['dM', 'plP'], label: "M'" } },
        { id: 's2', actionText: "Tìm N' = d_N ∩ (P).", mathExplanation: "N' là hình chiếu của N.", addInput: { id: 'sol_n1', kind: 'point', rule: 'intersect_line_plane', parents: ['dN', 'plP'], label: "N'" } },
        { id: 's3', actionText: "Nối đoạn thẳng M'N'.", mathExplanation: "M'N' là hình chiếu song song của MN lên (P).", addInput: { id: 'sol_seg', kind: 'segment', rule: 'segment_3d', parents: ['sol_m1', 'sol_n1'], label: "M'N'" } },
      ],
      proof: "Phép chiếu song song biến đoạn thẳng không song song phương chiếu thành đoạn thẳng $M'N'$ nối hình chiếu của hai đầu mút.",
    },
    {
      levelId: 6,
      order: 4,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Bảo toàn tính song song qua phép chiếu song song',
      title: 'Hình chiếu song song của hai cạnh đối song song trong hình hộp',
      description: "Cho hình hộp nghiêng $ABCD.A'B'C'D'$. Phép chiếu song song lên $(ABCD)$ theo phương $AA'$ biến $A'B'$ thành $AB$ và $D'C'$ thành $DC$. Hãy dựng đường thẳng qua tâm $O'$ của mặt trên song song $AA'$ để tìm hình chiếu $O$ là tâm đáy dưới.",
      hypothesis: "Hình hộp $ABCD.A'B'C'D'$ có đáy $(ABCD)$ và tâm mặt trên $O'$.",
      goal: "Dựng đường chiếu qua $O'$ song song $AA'$ và xác định tâm đáy dưới $O$.",
      setup: () => {
        let sc = buildBoxVerticesScene({ lx: 3.4, ly: 2.8, lz: 3.0, withBasePlane: true });
        sc = addGeo3DObject(sc, { id: 'O1', kind: 'point', rule: 'midpoint_3d', parents: ['A1', 'C1'], label: "O'", style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rules: [
        { type: 'has_line_parallel_to_through', refs: ['O1', 'eAA1'], description: "Đường chiếu qua O' song song AA'." },
        { type: 'has_midpoint_of', refs: ['A', 'C'], description: 'Tìm hình chiếu O trùng tâm hình bình hành ABCD.' },
      ],
      perturb: [],
      hints: [
        "Tâm O' là trung điểm đường chéo A'C' nên hình chiếu song song của nó theo phương AA' chính là trung điểm O của AC.",
        'Dùng Đường thẳng song song (O\', AA\') rồi tìm giao điểm với (ABCD).',
        "Bước 1: d = Đường thẳng song song(O', AA'). Bước 2: O = Giao điểm(d, (ABCD)).",
      ],
      steps: [
        { id: 's1', actionText: "Dựng đường chiếu qua O' song song AA'.", mathExplanation: "Đường thẳng đi qua tâm hai đáy.", addInput: { id: 'sol_d', kind: 'line', rule: 'line_parallel_point', parents: ['O1', 'eAA1'], label: 'd' } },
        { id: 's2', actionText: 'Tìm giao điểm O của d với (ABCD).', mathExplanation: 'O là hình chiếu của O\' và là tâm đáy ABCD.', addInput: { id: 'sol_o', kind: 'point', rule: 'intersect_line_plane', parents: ['sol_d', 'plBase'], label: 'O' } },
      ],
      proof: "Phép chiếu song song theo phương $AA'$ biến đường chéo $A'C'$ thành $AC$ và bảo toàn trung điểm nên biến $O'$ thành $O$.",
    },
    {
      levelId: 6,
      order: 5,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Mặt phẳng chiếu chứa đường thẳng chiếu',
      title: 'Dựng mặt phẳng chiếu của đoạn thẳng SA theo phương l',
      description: 'Cho đoạn thẳng $MN$ và đường thẳng phương chiếu $l$. Hãy dựng đường thẳng $d$ qua $M$ song song $l$, sau đó dựng mặt phẳng chiếu $(Q)$ chứa $MN$ và $d$.',
      hypothesis: 'Đoạn thẳng $MN$ và phương chiếu $l$.',
      goal: 'Dựng đường chiếu $d$ qua $M$ song song $l$ và mặt phẳng chiếu $(Q)$ chứa $d$ và $N$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'M', label: 'M', pos: v3(-1.5, -0.5, 2.6) },
          { id: 'N', label: 'N', pos: v3(1.8, 0.8, 3.2) },
          { id: 'L1', label: 'L₁', pos: v3(-2, 1.5, 0) },
          { id: 'L2', label: 'L₂', pos: v3(-1.2, 2.0, 2.8) },
        ]);
        sc = addGivenSeg(sc, 'eMN', 'M', 'N', 'MN');
        sc = addGivenLine(sc, 'll', 'L1', 'L2', 'l', '#0284C7');
        return sc;
      },
      rules: [
        { type: 'has_line_parallel_to_through', refs: ['M', 'll'], description: 'Dựng đường chiếu d qua M song song l.' },
      ],
      perturb: ['M', 'N'],
      hints: [
        'Mặt phẳng chiếu của đoạn thẳng MN là mặt phẳng chứa MN và song song với phương chiếu l.',
        'Dựng d qua M song song l rồi dựng mặt phẳng qua d và N.',
        'Bước 1: Đường thẳng song song(M, l) → d. Bước 2: Mặt phẳng qua đường thẳng & điểm(d, N).',
      ],
      steps: [
        { id: 's1', actionText: 'Dựng d qua M song song l.', mathExplanation: 'd là đường chiếu qua M.', addInput: { id: 'sol_d', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'll'], label: 'd' } },
        { id: 's2', actionText: 'Dựng mặt phẳng chiếu (Q) qua d và N.', mathExplanation: '(Q) chứa đoạn MN và song song phương l.', addInput: { id: 'sol_q', kind: 'plane', rule: 'plane_line_point', parents: ['sol_d', 'N'], label: '(Q)' } },
      ],
      proof: 'Giao tuyến của mặt phẳng chiếu $(Q)$ với mặt phẳng chiếu $(P)$ chính là hình chiếu song song của đường thẳng $MN$ lên $(P)$.',
    },
    {
      levelId: 6,
      order: 6,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Bảo toàn trọng tâm tam giác qua phép chiếu song song',
      title: 'Chiếu song song cạnh bên để xác định ảnh trung điểm',
      description: 'Cho tứ diện $S.ABC$ với mặt đáy $(ABC)$. Xét phép chiếu song song lên $(ABC)$ theo phương $SA$. Hãy tìm hình chiếu $M\'$ của trung điểm $M$ trên $SB$ lên $(ABC)$ bằng cách dựng đường qua $M$ song song $SA$ cắt $(ABC)$.',
      hypothesis: 'Tứ diện $S.ABC$, mặt đáy $(ABC)$ và trung điểm $M$ của $SB$.',
      goal: 'Dựng đường chiếu qua $M$ song song $SA$ và giao điểm $M\'$ (trung điểm $AB$).',
      setup: () => {
        let sc = buildTetrahedronScene({ withBasePlane: true });
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'B'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rules: [
        { type: 'has_line_parallel_to_through', refs: ['M', 'eSA'], description: 'Dựng đường chiếu qua M song song SA.' },
        { type: 'has_midpoint_of', refs: ['A', 'B'], description: "Hình chiếu M' là trung điểm AB." },
      ],
      perturb: ['S', 'A', 'B', 'C'],
      hints: [
        'Theo phương chiếu SA, điểm S chiếu thành A còn B giữ nguyên nên trung điểm M của SB chiếu thành trung điểm AB.',
        'Dùng Đường thẳng song song (M, SA) rồi lấy Giao điểm đường – mặt với (ABC).',
        "Bước 1: d = Đường thẳng song song(M, SA). Bước 2: M' = Giao điểm(d, (ABC)).",
      ],
      steps: [
        { id: 's1', actionText: 'Dựng đường thẳng qua M song song SA.', mathExplanation: 'Đường chiếu nằm trong mặt phẳng (SAB).', addInput: { id: 'sol_d', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'eSA'], label: 'd' } },
        { id: 's2', actionText: "Tìm giao điểm M' của d với (ABC).", mathExplanation: "M' là trung điểm cạnh AB.", addInput: { id: 'sol_m1', kind: 'point', rule: 'intersect_line_plane', parents: ['sol_d', 'plABC'], label: "M'" } },
      ],
      proof: "Vì $MM' \\parallel SA$ và $M$ là trung điểm $SB$ nên $M'$ là trung điểm $AB$.",
    },
    {
      levelId: 6,
      order: 7,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hình biểu diễn của hình bình hành và tâm đối xứng',
      title: 'Dựng ảnh của trọng tâm mặt bên qua phép chiếu song song',
      description: 'Cho hình chóp $S.ABCD$ với mặt đáy $(ABCD)$. Xét phép chiếu song song theo phương $SD$ lên $(ABCD)$. Hãy tìm ảnh $N\'$ của trung điểm $N$ trên $SC$ qua phép chiếu này.',
      hypothesis: 'Hình chóp $S.ABCD$, mặt đáy $(ABCD)$ và trung điểm $N$ của $SC$.',
      goal: 'Dựng đường thẳng qua $N$ song song $SD$ và tìm giao điểm $N\'$ trên $(ABCD)$ (trung điểm $CD$).',
      setup: () => {
        let sc = buildPyramidABCDScene({ withBasePlane: true });
        sc = addGeo3DObject(sc, { id: 'N', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'C'], label: 'N', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        return sc;
      },
      rules: [
        { type: 'has_line_parallel_to_through', refs: ['N', 'eSD'], description: 'Dựng đường chiếu qua N song song SD.' },
        { type: 'has_midpoint_of', refs: ['C', 'D'], description: "Ảnh N' là trung điểm cạnh CD." },
      ],
      perturb: ['S'],
      hints: [
        'Theo phương chiếu SD, S biến thành D và C giữ nguyên nên trung điểm N của SC biến thành trung điểm CD.',
        'Dùng Đường thẳng song song (N, SD) rồi tìm giao điểm với (ABCD).',
        "Bước 1: d = Đường thẳng song song(N, SD). Bước 2: N' = Giao điểm(d, (ABCD)).",
      ],
      steps: [
        { id: 's1', actionText: 'Dựng đường thẳng qua N song song SD.', mathExplanation: 'Đường chiếu song song SD.', addInput: { id: 'sol_d', kind: 'line', rule: 'line_parallel_point', parents: ['N', 'eSD'], label: 'd' } },
        { id: 's2', actionText: "Tìm giao điểm N' với (ABCD).", mathExplanation: "N' là trung điểm CD.", addInput: { id: 'sol_n1', kind: 'point', rule: 'intersect_line_plane', parents: ['sol_d', 'plABCD'], label: "N'" } },
      ],
      proof: "Đường thẳng qua trung điểm $N$ của $SC$ song song $SD$ cắt $CD$ tại trung điểm $N'$ của $CD$.",
    },
    {
      levelId: 6,
      order: 8,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Chiếu song song lên mặt phẳng song song mặt phẳng chứa hình',
      title: 'Hình chiếu song song của đa giác nằm trên mặt phẳng song song',
      description: "Cho lăng trụ tam giác $ABC.A'B'C'$ với mặt đáy $(ABC)$. Hãy dựng đa giác đáy trên $\\triangle A'B'C'$ — hình có hình chiếu song song theo phương $AA'$ trùng khớp với $\\triangle ABC$.",
      hypothesis: "Lăng trụ tam giác $ABC.A'B'C'$ có các đỉnh đáy trên $A', B', C'$.",
      goal: "Dựng đa giác $\\triangle A'B'C'$.",
      setup: () => buildTriPrismScene({ right: false, withBasePlane: true }),
      rules: [
        { type: 'has_polygon_with_vertices', refs: [], params: { minVerts: 3 }, description: "Dựng được tam giác A'B'C'." },
        { type: 'has_plane_through_points', refs: ['A1', 'B1', 'C1'], description: "Đa giác nằm trên mặt đáy trên (A'B'C')." },
      ],
      perturb: [],
      hints: [
        "Hình nằm trong mặt phẳng song song với mặt phẳng chiếu có hình chiếu song song bằng chính nó.",
        'Chọn công cụ Đa giác trong không gian.',
        "Nhấp lần lượt ba đỉnh A', B', C'.",
      ],
      steps: [{ id: 's1', actionText: "Dựng đa giác A'B'C'.", mathExplanation: "Phép chiếu song song phương AA' biến ΔA'B'C' thành ΔABC bằng nó.", addInput: { id: 'sol_poly', kind: 'polygon', rule: 'polygon_3d', parents: ['A1', 'B1', 'C1'], label: "A'B'C'" } }],
      proof: "Vì $(A'B'C') \\parallel (ABC)$ nên phép chiếu song song theo phương $AA'$ là phép tịnh tiến biến $\\triangle A'B'C'$ thành $\\triangle ABC$.",
    },
    {
      levelId: 6,
      order: 9,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hình chiếu song song của đường chéo khối hộp lên mặt bên',
      title: "Chiếu đường chéo AC' lên mặt phẳng (ABCD) theo phương BB'",
      description: "Cho hình lập phương $ABCD.A'B'C'D'$. Xét phép chiếu song song lên $(ABCD)$ theo phương $BB'$. Hãy dựng đoạn thẳng là hình chiếu của đường chéo $AC'$ trên $(ABCD)$.",
      hypothesis: "Hình lập phương $ABCD.A'B'C'D'$ có đường chéo $AC'$.",
      goal: 'Nối đường chéo đáy $AC$ — chính là hình chiếu song song của $AC\'$ lên $(ABCD)$.',
      setup: () => {
        let sc = buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2, withBasePlane: true });
        sc = addGivenSeg(sc, 'eAC1', 'A', 'C1', "AC'");
        return sc;
      },
      rules: [{ type: 'has_segment_between', refs: ['A', 'C'], description: "Dựng đoạn AC là hình chiếu song song của AC' lên (ABCD)." }],
      perturb: [],
      hints: [
        "Theo phương BB' ∥ CC', điểm A thuộc (ABCD) chiếu thành A, còn điểm C' chiếu thành C.",
        'Chọn công cụ Đoạn thẳng.',
        'Nhấp vào A rồi nhấp vào C để nối đoạn AC.',
      ],
      steps: [{ id: 's1', actionText: 'Nối đoạn thẳng AC.', mathExplanation: "Hình chiếu của A là A, của C' là C nên hình chiếu của AC' là AC.", addInput: { id: 'sol_ac', kind: 'segment', rule: 'segment_3d', parents: ['A', 'C'], label: 'AC' } }],
      proof: "Vì $C'C \\parallel B'B$ và $A \\in (ABCD)$ nên hình chiếu song song của $AC'$ theo phương $BB'$ lên $(ABCD)$ là đoạn $AC$.",
    },
    {
      levelId: 6,
      order: 10,
      curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tổng hợp phép chiếu song song và tỉ số đoạn thẳng',
      title: 'Dựng hình chiếu song song của đoạn trung bình MN lên đáy tứ diện',
      description: 'Cho tứ diện $S.ABC$ có $M, N$ lần lượt là trung điểm $SB, SC$. Xét phép chiếu song song lên $(ABC)$ theo phương $SA$. Hãy tìm hình chiếu $M\', N\'$ của $M, N$ rồi nối đoạn $M\'N\'$.',
      hypothesis: 'Tứ diện $S.ABC$, mặt đáy $(ABC)$ và hai trung điểm $M \\in SB, N \\in SC$.',
      goal: 'Dựng đường chiếu của $M, N$ song song $SA$, tìm $M\', N\'$ trên $(ABC)$ và nối $M\'N\'$.',
      setup: () => {
        let sc = buildTetrahedronScene({ withBasePlane: true });
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'B'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'N', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'C'], label: 'N', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        sc = addGivenSeg(sc, 'eMN', 'M', 'N', 'MN');
        return sc;
      },
      rules: [
        { type: 'has_midpoint_of', refs: ['A', 'B'], description: "Tìm hình chiếu M' (trung điểm AB)." },
        { type: 'has_midpoint_of', refs: ['A', 'C'], description: "Tìm hình chiếu N' (trung điểm AC)." },
        { type: 'has_segment_between_midpoints', refs: ['A', 'B', 'A', 'C'], description: "Nối đoạn chiếu M'N' ∥ BC." },
      ],
      perturb: ['S', 'A', 'B', 'C'],
      hints: [
        "Theo phương chiếu SA, M chiếu thành trung điểm M' của AB và N chiếu thành trung điểm N' của AC.",
        'Dựng đường song song SA qua M và N cắt (ABC) tại M\', N\' (hoặc dùng Trung điểm AB, AC) rồi nối M\'N\'.',
        "Dựng d₁ ∥ SA qua M → M' = d₁ ∩ (ABC); d₂ ∥ SA qua N → N' = d₂ ∩ (ABC); nối M'N'.",
      ],
      steps: [
        { id: 's1', actionText: 'Dựng đường chiếu qua M song song SA.', mathExplanation: 'Đường chiếu của M.', addInput: { id: 'sol_d1', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'eSA'], label: 'd₁' } },
        { id: 's2', actionText: "Tìm M' = d₁ ∩ (ABC).", mathExplanation: "M' là trung điểm AB.", addInput: { id: 'sol_m1', kind: 'point', rule: 'intersect_line_plane', parents: ['sol_d1', 'plABC'], label: "M'" } },
        { id: 's3', actionText: 'Dựng đường chiếu qua N song song SA.', mathExplanation: 'Đường chiếu của N.', addInput: { id: 'sol_d2', kind: 'line', rule: 'line_parallel_point', parents: ['N', 'eSA'], label: 'd₂' } },
        { id: 's4', actionText: "Tìm N' = d₂ ∩ (ABC).", mathExplanation: "N' là trung điểm AC.", addInput: { id: 'sol_n1', kind: 'point', rule: 'intersect_line_plane', parents: ['sol_d2', 'plABC'], label: "N'" } },
        { id: 's5', actionText: "Nối đoạn thẳng M'N'.", mathExplanation: "M'N' là đường trung bình của ΔABC và M'N' ∥ MN ∥ BC.", addInput: { id: 'sol_seg', kind: 'segment', rule: 'segment_3d', parents: ['sol_m1', 'sol_n1'], label: "M'N'" } },
      ],
      proof: "Phép chiếu song song theo phương $SA$ biến $M, N$ lần lượt thành trung điểm $M', N'$ của $AB, AC$, và $M'N' \\parallel BC \\parallel MN$.",
    },
  ];

  return specs.map(makeChallenge3D);
}
