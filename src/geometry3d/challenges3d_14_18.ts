import { addGeo3DObject, createEmptyScene3D } from './engine3d';
import { v3 } from './math3d';
import type { Challenge3DDefinition } from './validator3d';
import {
  addGivenLine,
  addGivenPlane3,
  buildBoxVerticesScene,
  givenPointsScene,
  makeChallenge3D,
} from './challenges3d_helpers';

export function buildLevels14To18(): Challenge3DDefinition[] {
  const specs: Parameters<typeof makeChallenge3D>[0][] = [
    // =========================================================================
    // CẤP ĐỘ XIV: VECTƠ TRONG KHÔNG GIAN (10 thử thách — Toán 12)
    // =========================================================================
    {
      levelId: 14, order: 1, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Khái niệm vectơ trong không gian',
      title: 'Dựng vectơ AB từ hai điểm trong không gian',
      description: 'Cho hai điểm $A(-1; 0; 1)$ và $B(2; 2; 3)$. Hãy dựng vectơ $\\overrightarrow{AB}$.',
      hypothesis: 'Hai điểm $A(-1; 0; 1)$ và $B(2; 2; 3)$.',
      goal: 'Dựng vectơ $\\overrightarrow{AB}$ có điểm đầu $A$ và điểm cuối $B$.',
      setup: () => givenPointsScene([{ id: 'A', label: 'A', pos: v3(-1, 0, 1) }, { id: 'B', label: 'B', pos: v3(2, 2, 3) }], 'oxyz', true),
      rules: [{ type: 'has_vector_between', refs: ['A', 'B'], description: 'Dựng vectơ AB.' }],
      perturb: ['A', 'B'],
      hints: ['Vectơ AB có hướng từ A tới B và tọa độ bằng B − A.', 'Mở nhóm Vectơ và tọa độ → chọn Vectơ qua 2 điểm.', 'Nhấp điểm đầu A rồi điểm cuối B.'],
      steps: [{ id: 's1', actionText: 'Chọn công cụ Vectơ và nhấp A rồi B.', mathExplanation: 'Vectơ AB = (3; 2; 2).', addInput: { id: 'sol_v', kind: 'vector', rule: 'vector_two_points', parents: ['A', 'B'], label: 'AB' } }],
      proof: 'Vectơ $\\overrightarrow{AB} = (x_B - x_A;\\, y_B - y_A;\\, z_B - z_A) = (3; 2; 2)$.',
    },
    {
      levelId: 14, order: 2, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Hai vectơ đối nhau trong không gian',
      title: 'Dựng vectơ đối BA của vectơ AB',
      description: 'Cho hai điểm $A(1; -1; 0)$ và $B(3; 2; 2)$ đã có vectơ $\\overrightarrow{AB}$. Hãy dựng vectơ đối $\\overrightarrow{BA}$.',
      hypothesis: 'Hai điểm $A, B$ và vectơ $\\overrightarrow{AB}$.',
      goal: 'Dựng vectơ $\\overrightarrow{BA} = -\\overrightarrow{AB}$.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'A', label: 'A', pos: v3(1, -1, 0) }, { id: 'B', label: 'B', pos: v3(3, 2, 2) }], 'oxyz', true);
        return addGeo3DObject(sc, { id: 'vAB', kind: 'vector', rule: 'vector_two_points', parents: ['A', 'B'], label: 'u', style: { color: '#0F766E', isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_vector_between', refs: ['B', 'A'], description: 'Dựng vectơ đối BA.' }],
      perturb: ['A', 'B'],
      hints: ['Vectơ đối có cùng độ dài và ngược hướng với vectơ đã cho.', 'Chọn công cụ Vectơ.', 'Nhấp điểm B trước rồi điểm A sau.'],
      steps: [{ id: 's1', actionText: 'Dựng vectơ từ B tới A.', mathExplanation: 'BA = -AB.', addInput: { id: 'sol_v', kind: 'vector', rule: 'vector_two_points', parents: ['B', 'A'], label: 'BA' } }],
      proof: 'Vectơ $\\overrightarrow{BA} = -\\overrightarrow{AB}$ có cùng độ dài nhưng ngược hướng.',
    },
    {
      levelId: 14, order: 3, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Quy tắc ba điểm cộng vectơ trong không gian',
      title: 'Dựng vectơ tổng AC = AB + BC',
      description: 'Cho ba điểm $A, B, C$ cùng hai vectơ $\\overrightarrow{AB}$ và $\\overrightarrow{BC}$. Hãy dựng vectơ tổng $\\overrightarrow{AC}$.',
      hypothesis: 'Ba điểm $A, B, C$ và hai vectơ $\\overrightarrow{AB}, \\overrightarrow{BC}$.',
      goal: 'Dựng vectơ tổng $\\overrightarrow{AC}$.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'A', label: 'A', pos: v3(-2, -1, 0) }, { id: 'B', label: 'B', pos: v3(1, -1, 1.5) }, { id: 'C', label: 'C', pos: v3(2, 2, 3) }], 'oxyz', true);
        sc = addGeo3DObject(sc, { id: 'v1', kind: 'vector', rule: 'vector_two_points', parents: ['A', 'B'], label: 'AB', style: { color: '#0F766E', isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'v2', kind: 'vector', rule: 'vector_two_points', parents: ['B', 'C'], label: 'BC', style: { color: '#0284C7', isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_vector_between', refs: ['A', 'C'], description: 'Dựng vectơ tổng AC.' }],
      perturb: ['A', 'B', 'C'],
      hints: ['Theo quy tắc ba điểm: AB + BC = AC.', 'Chọn công cụ Vectơ.', 'Nhấp điểm A rồi điểm C.'],
      steps: [{ id: 's1', actionText: 'Dựng vectơ AC.', mathExplanation: 'AB + BC = AC.', addInput: { id: 'sol_v', kind: 'vector', rule: 'vector_two_points', parents: ['A', 'C'], label: 'AC' } }],
      proof: 'Với ba điểm bất kỳ $A, B, C$ trong không gian luôn có $\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}$.',
    },
    {
      levelId: 14, order: 4, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Quy tắc hình hộp trong không gian',
      title: "Dựng vectơ đường chéo AC' = AB + AD + AA' trong hình hộp",
      description: "Cho hình hộp $ABCD.A'B'C'D'$. Hãy dựng vectơ đường chéo $\\overrightarrow{AC'} = \\overrightarrow{AB} + \\overrightarrow{AD} + \\overrightarrow{AA'}$.",
      hypothesis: "Hình hộp $ABCD.A'B'C'D'$.",
      goal: "Dựng vectơ $\\overrightarrow{AC'}$.",
      setup: () => buildBoxVerticesScene({ lx: 3.2, ly: 2.6, lz: 2.8, mode: 'oxyz' }),
      rules: [{ type: 'has_vector_between', refs: ['A', 'C1'], description: "Dựng vectơ đường chéo AC'." }],
      hints: ["Theo quy tắc hình hộp, tổng ba vectơ cạnh chung đỉnh A bằng vectơ đường chéo AC'.", 'Chọn công cụ Vectơ.', "Nhấp điểm A rồi điểm C'."],
      steps: [{ id: 's1', actionText: "Dựng vectơ AC'.", mathExplanation: "AB + AD + AA' = AC'.", addInput: { id: 'sol_v', kind: 'vector', rule: 'vector_two_points', parents: ['A', 'C1'], label: "AC'" } }],
      proof: "Theo quy tắc hình hộp: $\\overrightarrow{AB} + \\overrightarrow{AD} + \\overrightarrow{AA'} = \\overrightarrow{AC'}$.",
    },
    {
      levelId: 14, order: 5, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Góc giữa hai vectơ trong không gian',
      title: 'Đo góc giữa hai vectơ xuất phát từ gốc tọa độ',
      description: 'Cho hai vectơ $\\vec{u} = \\overrightarrow{OA}$ và $\\vec{v} = \\overrightarrow{OB}$. Hãy đo góc giữa hai vectơ $\\vec{u}$ và $\\vec{v}$.',
      hypothesis: 'Hai vectơ $\\vec{u}$ và $\\vec{v}$ chung gốc $O$.',
      goal: 'Đo góc $(\\vec{u}, \\vec{v})$.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }, { id: 'A', label: 'A', pos: v3(3, 0, 0) }, { id: 'B', label: 'B', pos: v3(1.5, 2.6, 0) }], 'oxyz', true);
        sc = addGeo3DObject(sc, { id: 'vu', kind: 'vector', rule: 'vector_two_points', parents: ['O', 'A'], label: 'u', style: { color: '#0F766E', isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'vv', kind: 'vector', rule: 'vector_two_points', parents: ['O', 'B'], label: 'v', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_vectors' }, description: 'Đo góc giữa hai vectơ u và v.' }],
      hints: ['Góc giữa hai vectơ nằm từ 0° đến 180°.', 'Chọn công cụ Góc giữa 2 vectơ trong nhóm Thiết diện và đo lường.', 'Nhấp vectơ u rồi vectơ v.'],
      steps: [{ id: 's1', actionText: 'Đo góc giữa hai vectơ u và v.', mathExplanation: 'cos(u, v) = (u·v)/(|u|·|v|).', addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_vectors', parents: ['vu', 'vv'], label: '∠(u,v)', metricKind: 'angle' } }],
      proof: 'Góc giữa hai vectơ khác vectơ không xác định bởi $\\cos(\\vec{u}, \\vec{v}) = \\frac{\\vec{u} \\cdot \\vec{v}}{|\\vec{u}|\\cdot|\\vec{v}|}$.',
    },
    {
      levelId: 14, order: 6, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Tích vô hướng và hai vectơ vuông góc',
      title: 'Dựng hai vectơ cạnh kề trong lập phương và đo góc 90°',
      description: "Cho hình lập phương $ABCD.A'B'C'D'$. Hãy dựng vectơ $\\overrightarrow{AB}$, vectơ $\\overrightarrow{AD}$ và đo góc giữa hai vectơ đó.",
      hypothesis: "Hình lập phương $ABCD.A'B'C'D'$.",
      goal: 'Dựng $\\overrightarrow{AB}, \\overrightarrow{AD}$ và đo góc giữa chúng.',
      setup: () => buildBoxVerticesScene({ lx: 3, ly: 3, lz: 3, mode: 'oxyz' }),
      rules: [
        { type: 'has_vector_between', refs: ['A', 'B'], description: 'Dựng vectơ AB.' },
        { type: 'has_vector_between', refs: ['A', 'D'], description: 'Dựng vectơ AD.' },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_vectors' }, description: 'Đo góc giữa hai vectơ AB và AD.' },
      ],
      hints: ['Tích vô hướng AB · AD = 0 nên góc giữa chúng bằng 90°.', 'Dựng vectơ AB, vectơ AD rồi dùng Góc giữa 2 vectơ.', 'Bước 1: Vectơ(A, B). Bước 2: Vectơ(A, D). Bước 3: Góc 2 vectơ.'],
      steps: [
        { id: 's1', actionText: 'Dựng vectơ AB.', mathExplanation: 'AB = (3; 0; 0).', addInput: { id: 'sol_v1', kind: 'vector', rule: 'vector_two_points', parents: ['A', 'B'], label: 'AB' } },
        { id: 's2', actionText: 'Dựng vectơ AD.', mathExplanation: 'AD = (0; 3; 0).', addInput: { id: 'sol_v2', kind: 'vector', rule: 'vector_two_points', parents: ['A', 'D'], label: 'AD' } },
        { id: 's3', actionText: 'Đo góc giữa AB và AD.', mathExplanation: 'Góc bằng 90° vì tích vô hướng bằng 0.', addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_vectors', parents: ['sol_v1', 'sol_v2'], label: '∠(AB,AD)', metricKind: 'angle' } },
      ],
      proof: 'Vì $\\overrightarrow{AB} \\cdot \\overrightarrow{AD} = 0$ nên hai vectơ vuông góc với nhau.',
    },
    {
      levelId: 14, order: 7, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Quy tắc hiệu hai vectơ trong không gian',
      title: 'Dựng vectơ hiệu BA = OA − OB',
      description: 'Cho gốc $O$ và hai điểm $A, B$ cùng hai vectơ vị trí $\\overrightarrow{OA}, \\overrightarrow{OB}$. Hãy dựng vectơ hiệu $\\overrightarrow{BA} = \\overrightarrow{OA} - \\overrightarrow{OB}$.',
      hypothesis: 'Gốc $O$, hai điểm $A, B$ và $\\overrightarrow{OA}, \\overrightarrow{OB}$.',
      goal: 'Dựng vectơ $\\overrightarrow{BA}$.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }, { id: 'A', label: 'A', pos: v3(3, 1, 2) }, { id: 'B', label: 'B', pos: v3(1, 3, 1) }], 'oxyz', true);
        sc = addGeo3DObject(sc, { id: 'vA', kind: 'vector', rule: 'vector_two_points', parents: ['O', 'A'], label: 'OA', style: { color: '#0F766E', isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'vB', kind: 'vector', rule: 'vector_two_points', parents: ['O', 'B'], label: 'OB', style: { color: '#0284C7', isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_vector_between', refs: ['B', 'A'], description: 'Dựng vectơ hiệu BA = OA - OB.' }],
      perturb: ['A', 'B'],
      hints: ['Quy tắc hiệu: OA − OB = BA (điểm đầu là B, điểm cuối là A).', 'Chọn công cụ Vectơ.', 'Nhấp điểm B trước rồi điểm A sau.'],
      steps: [{ id: 's1', actionText: 'Dựng vectơ từ B đến A.', mathExplanation: 'OA − OB = BA.', addInput: { id: 'sol_v', kind: 'vector', rule: 'vector_two_points', parents: ['B', 'A'], label: 'BA' } }],
      proof: 'Với mọi điểm $O, A, B$ ta có $\\overrightarrow{OA} - \\overrightarrow{OB} = \\overrightarrow{BA}$.',
    },
    {
      levelId: 14, order: 8, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Hệ thức trung điểm bằng vectơ',
      title: 'Dựng trung điểm M và vectơ trung tuyến SM = 1/2(SA + SB)',
      description: 'Cho tam giác $SAB$ trong không gian. Hãy dựng trung điểm $M$ của $AB$ và dựng vectơ $\\overrightarrow{SM} = \\frac{1}{2}(\\overrightarrow{SA} + \\overrightarrow{SB})$.',
      hypothesis: 'Ba điểm $S, A, B$.',
      goal: 'Dựng trung điểm $M$ của $AB$ và vectơ $\\overrightarrow{SM}$.',
      setup: () => givenPointsScene([{ id: 'S', label: 'S', pos: v3(0, 0, 3.4) }, { id: 'A', label: 'A', pos: v3(-2, -1, 0) }, { id: 'B', label: 'B', pos: v3(2.4, 1.4, 0) }], 'oxyz', true),
      rules: [
        { type: 'has_midpoint_of', refs: ['A', 'B'], description: 'Dựng trung điểm M của AB.' },
        { type: 'has_vector_with_components', refs: [], params: { vx: 0.2, vy: 0.2, vz: -3.4 }, description: 'Dựng vectơ SM.' },
      ],
      hints: ['Dựng trung điểm M của AB trước, rồi dùng công cụ Vectơ nối từ S đến M.', 'Bước 1: Trung điểm(A, B) → M. Bước 2: Vectơ(S, M).', 'Nhấp S rồi nhấp M.'],
      steps: [
        { id: 's1', actionText: 'Dựng trung điểm M của AB.', mathExplanation: 'M = (0,2; 0,2; 0).', addInput: { id: 'sol_m', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'B'], label: 'M' } },
        { id: 's2', actionText: 'Dựng vectơ SM.', mathExplanation: 'SM = 1/2(SA + SB) = (0,2; 0,2; -3,4).', addInput: { id: 'sol_v', kind: 'vector', rule: 'vector_two_points', parents: ['S', 'sol_m'], label: 'SM' } },
      ],
      proof: 'Vì $M$ là trung điểm $AB$ nên với mọi điểm $S$ ta có $\\overrightarrow{SM} = \\frac{1}{2}(\\overrightarrow{SA} + \\overrightarrow{SB})$.',
    },
    {
      levelId: 14, order: 9, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Hai vectơ bằng nhau ở hai cạnh đối hình hộp',
      title: "Dựng vectơ D'C' bằng với vectơ AB trong hình hộp",
      description: "Cho hình hộp $ABCD.A'B'C'D'$ đã có vectơ $\\overrightarrow{AB}$. Hãy dựng vectơ $\\overrightarrow{D'C'}$ bằng vectơ $\\overrightarrow{AB}$.",
      hypothesis: "Hình hộp và vectơ $\\overrightarrow{AB}$.",
      goal: "Dựng vectơ $\\overrightarrow{D'C'} = \\overrightarrow{AB}$.",
      setup: () => addGeo3DObject(buildBoxVerticesScene({ lx: 3.4, ly: 2.6, lz: 2.8, mode: 'oxyz' }), { id: 'vAB', kind: 'vector', rule: 'vector_two_points', parents: ['A', 'B'], label: 'AB', style: { color: '#0F766E', isGiven: true }, skipLog: true }).scene,
      rules: [{ type: 'has_vector_between', refs: ['D1', 'C1'], description: "Dựng vectơ D'C' bằng AB." }],
      hints: ["Trong hình hộp, D'C' song song, cùng hướng và bằng độ dài AB.", 'Chọn công cụ Vectơ.', "Nhấp đỉnh D' rồi đỉnh C'."],
      steps: [{ id: 's1', actionText: "Dựng vectơ D'C'.", mathExplanation: "D'C' = DC = AB.", addInput: { id: 'sol_v', kind: 'vector', rule: 'vector_two_points', parents: ['D1', 'C1'], label: "D'C'" } }],
      proof: "Vì $ABC'D'$ là hình bình hành nên $\\overrightarrow{D'C'} = \\overrightarrow{AB}$.",
    },
    {
      levelId: 14, order: 10, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Độ dài vectơ và góc giữa hai vectơ đường chéo trong lập phương',
      title: "Dựng hai vectơ AB' và AD' và đo góc 60° giữa chúng",
      description: "Cho hình lập phương $ABCD.A'B'C'D'$. Hãy dựng hai vectơ $\\overrightarrow{AB'}$ và $\\overrightarrow{AD'}$, sau đó đo góc giữa chúng.",
      hypothesis: "Hình lập phương cạnh $3$.",
      goal: "Dựng $\\overrightarrow{AB'}, \\overrightarrow{AD'}$ và đo góc giữa chúng ($60^\\circ$).",
      setup: () => buildBoxVerticesScene({ lx: 3, ly: 3, lz: 3, mode: 'oxyz' }),
      rules: [
        { type: 'has_vector_between', refs: ['A', 'B1'], description: "Dựng vectơ AB'." },
        { type: 'has_vector_between', refs: ['A', 'D1'], description: "Dựng vectơ AD'." },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_vectors' }, description: "Đo góc giữa hai vectơ AB' và AD'." },
      ],
      hints: ["ΔAB'D' là tam giác đều cạnh a√2 nên góc giữa hai vectơ bằng 60°.", "Dựng vectơ AB', vectơ AD' rồi đo góc 2 vectơ.", "Bước 1: Vectơ(A, B'). Bước 2: Vectơ(A, D'). Bước 3: Góc 2 vectơ."],
      steps: [
        { id: 's1', actionText: "Dựng vectơ AB'.", mathExplanation: "AB' = (3; 0; 3).", addInput: { id: 'sol_v1', kind: 'vector', rule: 'vector_two_points', parents: ['A', 'B1'], label: "AB'" } },
        { id: 's2', actionText: "Dựng vectơ AD'.", mathExplanation: "AD' = (0; 3; 3).", addInput: { id: 'sol_v2', kind: 'vector', rule: 'vector_two_points', parents: ['A', 'D1'], label: "AD'" } },
        { id: 's3', actionText: "Đo góc giữa AB' và AD'.", mathExplanation: "cos φ = 9 / (3√2 · 3√2) = 1/2 ⇒ φ = 60°.", addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_vectors', parents: ['sol_v1', 'sol_v2'], label: "∠(AB',AD')", metricKind: 'angle' } },
      ],
      proof: "$\\cos(\\overrightarrow{AB'}, \\overrightarrow{AD'}) = \\frac{3\\cdot 0 + 0\\cdot 3 + 3\\cdot 3}{3\\sqrt{2}\\cdot 3\\sqrt{2}} = \\frac{1}{2} \\Rightarrow (\\overrightarrow{AB'}, \\overrightarrow{AD'}) = 60^\\circ$.",
    },

    // =========================================================================
    // CẤP ĐỘ XV: HỆ TỌA ĐỘ OXYZ (10 thử thách — Toán 12)
    // =========================================================================
    {
      levelId: 15, order: 1, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Biểu diễn điểm theo tọa độ (x; y; z)',
      title: 'Dựng điểm M(2; 3; 1) trong hệ trục Oxyz',
      description: 'Trong không gian với hệ tọa độ $Oxyz$, hãy nhập tọa độ để dựng điểm $M(2; 3; 1)$.',
      hypothesis: 'Hệ trục tọa độ $Oxyz$.',
      goal: 'Dựng điểm $M(2; 3; 1)$.',
      setup: () => givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }], 'oxyz', true),
      rules: [{ type: 'has_point_at_coords', refs: [], params: { x: 2, y: 3, z: 1 }, description: 'Dựng điểm M(2; 3; 1).' }],
      hints: ['Mở nhóm Điểm hoặc Vectơ và tọa độ → chọn Điểm theo tọa độ (x; y; z).', 'Nhập x = 2, y = 3, z = 1.', 'Nhấn Tạo điểm để xác nhận.'],
      steps: [{ id: 's1', actionText: 'Nhập tọa độ (2; 3; 1) để tạo điểm M.', mathExplanation: 'OM = 2i + 3j + k.', addInput: { id: 'sol_m', kind: 'point', rule: 'point_coords', position: v3(2, 3, 1), label: 'M' } }],
      proof: 'Điểm $M(2; 3; 1)$ thỏa mãn $\\overrightarrow{OM} = 2\\vec{i} + 3\\vec{j} + \\vec{k}$.',
    },
    {
      levelId: 15, order: 2, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Điểm nằm trên các trục tọa độ Ox, Oy, Oz',
      title: 'Dựng ba điểm A(3; 0; 0), B(0; 2; 0), C(0; 0; 4) trên ba trục tọa độ',
      description: 'Trong $Oxyz$, hãy dựng ba điểm $A(3; 0; 0) \\in Ox$, $B(0; 2; 0) \\in Oy$ và $C(0; 0; 4) \\in Oz$.',
      hypothesis: 'Hệ trục tọa độ $Oxyz$.',
      goal: 'Dựng đúng ba điểm $A, B, C$ trên các trục tọa độ.',
      setup: () => givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }], 'oxyz', true),
      rules: [
        { type: 'has_point_at_coords', refs: [], params: { x: 3, y: 0, z: 0 }, description: 'Có điểm A(3; 0; 0).' },
        { type: 'has_point_at_coords', refs: [], params: { x: 0, y: 2, z: 0 }, description: 'Có điểm B(0; 2; 0).' },
        { type: 'has_point_at_coords', refs: [], params: { x: 0, y: 0, z: 4 }, description: 'Có điểm C(0; 0; 4).' },
      ],
      hints: ['Điểm trên Ox có y = z = 0; trên Oy có x = z = 0; trên Oz có x = y = 0.', 'Dùng công cụ Điểm theo tọa độ 3 lần.', 'Nhập (3;0;0), (0;2;0), (0;0;4).'],
      steps: [
        { id: 's1', actionText: 'Tạo A(3; 0; 0).', mathExplanation: 'A thuộc trục Ox.', addInput: { id: 'sol_a', kind: 'point', rule: 'point_coords', position: v3(3, 0, 0), label: 'A' } },
        { id: 's2', actionText: 'Tạo B(0; 2; 0).', mathExplanation: 'B thuộc trục Oy.', addInput: { id: 'sol_b', kind: 'point', rule: 'point_coords', position: v3(0, 2, 0), label: 'B' } },
        { id: 's3', actionText: 'Tạo C(0; 0; 4).', mathExplanation: 'C thuộc trục Oz.', addInput: { id: 'sol_c', kind: 'point', rule: 'point_coords', position: v3(0, 0, 4), label: 'C' } },
      ],
      proof: 'Ba điểm $A, B, C$ lần lượt nằm trên ba tia $Ox, Oy, Oz$ cách gốc tọa độ $3, 2, 4$ đơn vị.',
    },
    {
      levelId: 15, order: 3, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Tọa độ trung điểm đoạn thẳng trong Oxyz',
      title: 'Xác định trung điểm I của đoạn thẳng AB theo tọa độ',
      description: 'Cho $A(1; -2; 3)$ và $B(3; 4; 1)$. Hãy dựng trung điểm $I(2; 1; 2)$ của đoạn thẳng $AB$.',
      hypothesis: 'Hai điểm $A(1; -2; 3)$ và $B(3; 4; 1)$.',
      goal: 'Dựng trung điểm $I(2; 1; 2)$ của $AB$.',
      setup: () => givenPointsScene([{ id: 'A', label: 'A', pos: v3(1, -2, 3) }, { id: 'B', label: 'B', pos: v3(3, 4, 1) }], 'oxyz', true),
      rules: [{ type: 'has_midpoint_of', refs: ['A', 'B'], description: 'Dựng trung điểm I(2; 1; 2) của AB.' }],
      perturb: ['A', 'B'],
      hints: ['Tọa độ trung điểm bằng trung bình cộng tọa độ hai đầu mút.', 'Dùng công cụ Trung điểm(A, B) để bảo đảm tính động.', 'Nhấp điểm A rồi điểm B.'],
      steps: [{ id: 's1', actionText: 'Dựng trung điểm I của AB.', mathExplanation: 'I = ((1+3)/2; (-2+4)/2; (3+1)/2) = (2; 1; 2).', addInput: { id: 'sol_i', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'B'], label: 'I' } }],
      proof: '$I = \\left(\\frac{1+3}{2}; \\frac{-2+4}{2}; \\frac{3+1}{2}\\right) = (2; 1; 2)$.',
    },
    {
      levelId: 15, order: 4, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Tọa độ trọng tâm tam giác trong Oxyz',
      title: 'Dựng trọng tâm G của tam giác ABC trong Oxyz',
      description: 'Cho $A(3; 0; 0), B(0; 3; 0), C(0; 0; 3)$. Hãy tính và dựng trọng tâm $G(1; 1; 1)$ của $\\triangle ABC$.',
      hypothesis: 'Ba điểm $A(3; 0; 0), B(0; 3; 0), C(0; 0; 3)$.',
      goal: 'Dựng điểm $G(1; 1; 1)$.',
      setup: () => givenPointsScene([{ id: 'A', label: 'A', pos: v3(3, 0, 0) }, { id: 'B', label: 'B', pos: v3(0, 3, 0) }, { id: 'C', label: 'C', pos: v3(0, 0, 3) }], 'oxyz', true),
      rules: [{ type: 'has_point_centroid', refs: ['A', 'B', 'C'], description: 'Dựng trọng tâm G(1; 1; 1) của ΔABC.' }],
      hints: ['Trọng tâm G = ((xA+xB+xC)/3; (yA+yB+yC)/3; (zA+zB+zC)/3) = (1; 1; 1).', 'Chọn công cụ Điểm theo tọa độ.', 'Nhập x = 1, y = 1, z = 1.'],
      steps: [{ id: 's1', actionText: 'Tạo điểm G(1; 1; 1).', mathExplanation: 'G = (3/3; 3/3; 3/3) = (1; 1; 1).', addInput: { id: 'sol_g', kind: 'point', rule: 'point_coords', position: v3(1, 1, 1), label: 'G' } }],
      proof: 'Trọng tâm $\\triangle ABC$ có tọa độ $G = \\left(\\frac{3+0+0}{3}; \\frac{0+3+0}{3}; \\frac{0+0+3}{3}\\right) = (1; 1; 1)$.',
    },
    {
      levelId: 15, order: 5, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Khoảng cách giữa hai điểm trong hệ tọa độ Oxyz',
      title: 'Đo độ dài đoạn thẳng AB giữa A(1; 0; 2) và B(4; 4; 2)',
      description: 'Cho $A(1; 0; 2)$ và $B(4; 4; 2)$. Hãy đo khoảng cách $AB$ (bằng $5$).',
      hypothesis: 'Hai điểm $A(1; 0; 2)$ và $B(4; 4; 2)$.',
      goal: 'Đo độ dài đoạn $AB$.',
      setup: () => givenPointsScene([{ id: 'A', label: 'A', pos: v3(1, 0, 2) }, { id: 'B', label: 'B', pos: v3(4, 4, 2) }], 'oxyz', true),
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_pp' }, description: 'Đo khoảng cách giữa A và B.' }],
      hints: ['AB = √((4−1)² + (4−0)² + (2−2)²) = 5.', 'Chọn công cụ Đo độ dài trong nhóm Thiết diện và đo lường.', 'Nhấp điểm A rồi điểm B.'],
      steps: [{ id: 's1', actionText: 'Đo khoảng cách giữa A và B.', mathExplanation: 'AB = √(3² + 4² + 0²) = 5.', addInput: { id: 'sol_m', kind: 'measurement', rule: 'measure_distance_pp', parents: ['A', 'B'], label: 'AB', metricKind: 'distance' } }],
      proof: '$AB = \\sqrt{(4-1)^2 + (4-0)^2 + (2-2)^2} = \\sqrt{9+16} = 5$.',
    },
    {
      levelId: 15, order: 6, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Điểm đối xứng qua mặt phẳng tọa độ (Oxy)',
      title: 'Dựng điểm đối xứng của M(2; -1; 3) qua mặt phẳng (Oxy)',
      description: 'Cho $M(2; -1; 3)$ và mặt phẳng $(Oxy)$. Hãy dựng ảnh $M\'(2; -1; -3)$ đối xứng với $M$ qua $(Oxy)$.',
      hypothesis: 'Điểm $M(2; -1; 3)$ và mặt phẳng $(Oxy)$.',
      goal: 'Dựng điểm $M\'(2; -1; -3)$.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'M', label: 'M', pos: v3(2, -1, 3) }], 'oxyz', true);
        return addGeo3DObject(sc, { id: 'plOxy', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(Oxy)', style: { color: '#0F766E', opacity: 0.14, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_reflect_point_plane', refs: ['M', 'plOxy'], description: "Dựng ảnh đối xứng M'(2; -1; -3)." }],
      perturb: ['M'],
      hints: ['Đối xứng qua (Oxy) giữ nguyên x, y và đổi dấu z.', 'Chọn Đối xứng qua mặt phẳng(M, (Oxy)).', 'Nhấp điểm M rồi mặt phẳng (Oxy).'],
      steps: [{ id: 's1', actionText: "Dựng M' đối xứng M qua (Oxy).", mathExplanation: "M' = (2; -1; -3).", addInput: { id: 'sol_m1', kind: 'point', rule: 'reflect_point_plane', parents: ['M', 'plOxy'], label: "M'" } }],
      proof: 'Phép đối xứng qua $(Oxy)$ biến $M(x; y; z)$ thành $M\'(x; y; -z) = (2; -1; -3)$.',
    },
    {
      levelId: 15, order: 7, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Điểm đối xứng qua gốc tọa độ O',
      title: 'Dựng điểm đối xứng của A(2; 1; -2) qua gốc tọa độ O',
      description: 'Cho điểm $A(2; 1; -2)$ và gốc tọa độ $O(0; 0; 0)$. Hãy dựng điểm $A\'(-2; -1; 2)$ đối xứng với $A$ qua $O$.',
      hypothesis: 'Gốc $O(0; 0; 0)$ và điểm $A(2; 1; -2)$.',
      goal: 'Dựng $A\'$ đối xứng $A$ qua $O$.',
      setup: () => givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }, { id: 'A', label: 'A', pos: v3(2, 1, -2) }], 'oxyz', true),
      rules: [{ type: 'has_reflect_point_point', refs: ['A', 'O'], description: "Dựng điểm A'(-2; -1; 2) đối xứng A qua O." }],
      perturb: ['A'],
      hints: ['Đối xứng qua O(0;0;0) đổi dấu cả ba tọa độ.', 'Chọn công cụ Đối xứng qua điểm.', 'Nhấp điểm A rồi gốc O.'],
      steps: [{ id: 's1', actionText: "Dựng A' đối xứng A qua O.", mathExplanation: "A' = (-2; -1; 2).", addInput: { id: 'sol_a1', kind: 'point', rule: 'reflect_point_point', parents: ['A', 'O'], label: "A'" } }],
      proof: 'Ảnh đối xứng của $A(x; y; z)$ qua $O$ là $A\'(-x; -y; -z) = (-2; -1; 2)$.',
    },
    {
      levelId: 15, order: 8, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Tìm đỉnh thứ tư của hình bình hành ABCD trong Oxyz',
      title: 'Tìm tọa độ đỉnh D của hình bình hành ABCD',
      description: 'Cho ba đỉnh $A(1; 0; 1), B(3; 1; 1), C(4; 3; 2)$. Hãy tính và dựng đỉnh thứ tư $D(2; 2; 2)$ để $ABCD$ là hình bình hành.',
      hypothesis: 'Ba đỉnh $A(1; 0; 1), B(3; 1; 1), C(4; 3; 2)$.',
      goal: 'Dựng đỉnh $D(2; 2; 2)$.',
      setup: () => givenPointsScene([{ id: 'A', label: 'A', pos: v3(1, 0, 1) }, { id: 'B', label: 'B', pos: v3(3, 1, 1) }, { id: 'C', label: 'C', pos: v3(4, 3, 2) }], 'oxyz', true),
      rules: [{ type: 'has_point_at_coords', refs: [], params: { x: 2, y: 2, z: 2 }, description: 'Dựng đỉnh D(2; 2; 2).' }],
      hints: ['Trong hình bình hành ABCD: AD = BC ⇒ D = A + C − B.', 'Tính D = (1+4−3; 0+3−1; 1+2−1) = (2; 2; 2).', 'Dùng Điểm theo tọa độ và nhập (2; 2; 2).'],
      steps: [{ id: 's1', actionText: 'Tạo điểm D(2; 2; 2).', mathExplanation: 'D = A + C − B = (2; 2; 2).', addInput: { id: 'sol_d', kind: 'point', rule: 'point_coords', position: v3(2, 2, 2), label: 'D' } }],
      proof: 'Từ $\\overrightarrow{AB} = \\overrightarrow{DC}$ suy ra $D = A + C - B = (2; 2; 2)$.',
    },
    {
      levelId: 15, order: 9, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Biểu diễn vectơ theo tọa độ trong Oxyz',
      title: 'Dựng vectơ u = (2; -1; 3) từ hai điểm O và M',
      description: 'Cho gốc $O(0; 0; 0)$. Hãy dựng điểm $M(2; -1; 3)$ và vectơ $\\vec{u} = \\overrightarrow{OM} = (2; -1; 3)$.',
      hypothesis: 'Hệ trục tọa độ $Oxyz$ với gốc $O$.',
      goal: 'Dựng điểm $M(2; -1; 3)$ và vectơ $\\overrightarrow{OM}$.',
      setup: () => givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }], 'oxyz', true),
      rules: [
        { type: 'has_point_at_coords', refs: [], params: { x: 2, y: -1, z: 3 }, description: 'Dựng điểm M(2; -1; 3).' },
        { type: 'has_vector_with_components', refs: [], params: { vx: 2, vy: -1, vz: 3 }, description: 'Dựng vectơ u = (2; -1; 3).' },
      ],
      hints: ['Dựng điểm M(2; -1; 3) rồi dùng công cụ Vectơ nối O tới M.', 'Bước 1: Điểm theo tọa độ(2; -1; 3) → M. Bước 2: Vectơ(O, M).', 'Nhấp gốc O rồi điểm M.'],
      steps: [
        { id: 's1', actionText: 'Tạo điểm M(2; -1; 3).', mathExplanation: 'Điểm biểu diễn tọa độ của vectơ u.', addInput: { id: 'sol_m', kind: 'point', rule: 'point_coords', position: v3(2, -1, 3), label: 'M' } },
        { id: 's2', actionText: 'Dựng vectơ OM.', mathExplanation: 'OM = (2; -1; 3).', addInput: { id: 'sol_v', kind: 'vector', rule: 'vector_two_points', parents: ['O', 'sol_m'], label: 'u' } },
      ],
      proof: 'Vectơ $\\overrightarrow{OM}$ có tọa độ đúng bằng tọa độ điểm cuối $M(2; -1; 3)$.',
    },
    {
      levelId: 15, order: 10, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Tọa độ trọng tâm tứ diện trong Oxyz',
      title: 'Tổng hợp Oxyz: Dựng trọng tâm G của tứ diện ABCD',
      description: 'Cho bốn đỉnh $A(4; 0; 0), B(0; 4; 0), C(0; 0; 4), D(0; 0; 0)$. Hãy tính và dựng trọng tâm $G(1; 1; 1)$ của tứ diện $ABCD$.',
      hypothesis: 'Bốn đỉnh $A, B, C, D$ của tứ diện vuông.',
      goal: 'Dựng trọng tâm $G(1; 1; 1)$ của tứ diện.',
      setup: () => givenPointsScene([
        { id: 'D', label: 'O', pos: v3(0, 0, 0) }, { id: 'A', label: 'A', pos: v3(4, 0, 0) },
        { id: 'B', label: 'B', pos: v3(0, 4, 0) }, { id: 'C', label: 'C', pos: v3(0, 0, 4) },
      ], 'oxyz', true),
      rules: [{ type: 'has_point_centroid', refs: ['A', 'B', 'C', 'D'], description: 'Dựng trọng tâm G(1; 1; 1) của tứ diện.' }],
      hints: ['Trọng tâm tứ diện bằng trung bình cộng tọa độ 4 đỉnh.', 'G = ((4+0+0+0)/4; (0+4+0+0)/4; (0+0+4+0)/4) = (1; 1; 1).', 'Dùng Điểm theo tọa độ và nhập (1; 1; 1).'],
      steps: [{ id: 's1', actionText: 'Tạo trọng tâm G(1; 1; 1).', mathExplanation: 'G = (A+B+C+D)/4 = (1; 1; 1).', addInput: { id: 'sol_g', kind: 'point', rule: 'point_coords', position: v3(1, 1, 1), label: 'G' } }],
      proof: 'Trọng tâm tứ diện $ABCD$ có tọa độ $G = \\frac{A + B + C + D}{4} = (1; 1; 1)$.',
    },

    // =========================================================================
    // CẤP ĐỘ XVI: PHƯƠNG TRÌNH MẶT PHẲNG (10 thử thách — Toán 12)
    // =========================================================================
    {
      levelId: 16, order: 1, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Biểu diễn mặt phẳng theo phương trình tổng quát Ax + By + Cz + D = 0',
      title: 'Dựng mặt phẳng (P): x + y + z − 3 = 0',
      description: 'Trong không gian $Oxyz$, hãy nhập hệ số để dựng mặt phẳng $(P): x + y + z - 3 = 0$.',
      hypothesis: 'Hệ trục tọa độ $Oxyz$.',
      goal: 'Dựng mặt phẳng $(P): x + y + z - 3 = 0$.',
      setup: () => givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }], 'oxyz', true),
      rules: [{ type: 'has_plane_equation', refs: [], params: { a: 1, b: 1, c: 1, d: -3 }, description: 'Dựng mặt phẳng x + y + z − 3 = 0.' }],
      hints: ['Mở nhóm Mặt phẳng hoặc Vectơ và tọa độ → chọn Mặt phẳng theo phương trình.', 'Nhập A = 1, B = 1, C = 1, D = -3.', 'Nhấn Tạo mặt phẳng để hiển thị (P).'],
      steps: [{ id: 's1', actionText: 'Nhập phương trình 1x + 1y + 1z - 3 = 0.', mathExplanation: 'Mặt phẳng cắt Ox, Oy, Oz tại 3 điểm (3;0;0), (0;3;0), (0;0;3).', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 1, d: -3 }, label: '(P)' } }],
      proof: 'Phương trình $x + y + z - 3 = 0$ xác định mặt phẳng có vectơ pháp tuyến $\\vec{n} = (1; 1; 1)$.',
    },
    {
      levelId: 16, order: 2, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Phương trình mặt phẳng theo đoạn chắn',
      title: 'Dựng mặt phẳng đi qua A(2; 0; 0), B(0; 3; 0), C(0; 0; 6)',
      description: 'Cho ba điểm $A(2; 0; 0), B(0; 3; 0), C(0; 0; 6)$. Hãy dựng mặt phẳng $(ABC)$ (có phương trình $\\frac{x}{2}+\\frac{y}{3}+\\frac{z}{6}=1$).',
      hypothesis: 'Ba điểm trên ba trục tọa độ $A, B, C$.',
      goal: 'Dựng mặt phẳng $(ABC)$: $3x + 2y + z - 6 = 0$.',
      setup: () => givenPointsScene([{ id: 'A', label: 'A', pos: v3(2, 0, 0) }, { id: 'B', label: 'B', pos: v3(0, 3, 0) }, { id: 'C', label: 'C', pos: v3(0, 0, 6) }], 'oxyz', true),
      rules: [{ type: 'has_plane_equation', refs: [], params: { a: 3, b: 2, c: 1, d: -6 }, description: 'Dựng mặt phẳng (ABC).' }],
      hints: ['Bạn có thể dùng Mặt phẳng qua 3 điểm (A, B, C) hoặc nhập phương trình 3x + 2y + z − 6 = 0.', 'Chọn Mặt phẳng qua 3 điểm rồi nhấp A, B, C.', 'Hoặc chọn Mặt phẳng theo phương trình với A=3, B=2, C=1, D=-6.'],
      steps: [{ id: 's1', actionText: 'Dựng mặt phẳng qua A, B, C.', mathExplanation: 'Phương trình đoạn chắn x/2 + y/3 + z/6 = 1 ⇔ 3x + 2y + z − 6 = 0.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'C'], label: '(ABC)' } }],
      proof: 'Phương trình theo đoạn chắn $\\frac{x}{2} + \\frac{y}{3} + \\frac{z}{6} = 1 \\Leftrightarrow 3x + 2y + z - 6 = 0$.',
    },
    {
      levelId: 16, order: 3, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Mặt phẳng song song mặt phẳng tọa độ',
      title: 'Dựng mặt phẳng (P): z − 2 = 0 song song với (Oxy)',
      description: 'Hãy dựng mặt phẳng $(P)$ đi qua điểm $M(1; 1; 2)$ và song song với mặt phẳng tọa độ $(Oxy)$ (phương trình $z - 2 = 0$).',
      hypothesis: 'Điểm $M(1; 1; 2)$ và hệ trục $Oxyz$.',
      goal: 'Dựng mặt phẳng $z - 2 = 0$.',
      setup: () => givenPointsScene([{ id: 'M', label: 'M', pos: v3(1, 1, 2) }], 'oxyz', true),
      rules: [{ type: 'has_plane_equation', refs: [], params: { a: 0, b: 0, c: 1, d: -2 }, description: 'Dựng mặt phẳng z − 2 = 0.' }],
      hints: ['Mặt phẳng song song (Oxy) có dạng z + D = 0.', 'Vì đi qua M(1; 1; 2) nên z − 2 = 0 (A=0, B=0, C=1, D=-2).', 'Chọn Mặt phẳng theo phương trình và nhập A=0, B=0, C=1, D=-2.'],
      steps: [{ id: 's1', actionText: 'Nhập phương trình z - 2 = 0.', mathExplanation: 'Vectơ pháp tuyến k = (0; 0; 1) và đi qua M(1; 1; 2).', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: -2 }, label: '(P)' } }],
      proof: 'Mặt phẳng song song $(Oxy)$ đi qua $M(1; 1; 2)$ có phương trình $z - 2 = 0$.',
    },
    {
      levelId: 16, order: 4, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Mặt phẳng đi qua điểm và nhận vectơ pháp tuyến cho trước',
      title: 'Dựng mặt phẳng qua M(1; 2; 1) có pháp tuyến n = (2; -1; 1)',
      description: 'Cho điểm $M(1; 2; 1)$. Hãy viết phương trình và dựng mặt phẳng $(P)$ đi qua $M$ có vectơ pháp tuyến $\\vec{n} = (2; -1; 1)$.',
      hypothesis: 'Điểm $M(1; 2; 1)$ và $\\vec{n} = (2; -1; 1)$.',
      goal: 'Dựng mặt phẳng $2x - y + z - 1 = 0$.',
      setup: () => givenPointsScene([{ id: 'M', label: 'M', pos: v3(1, 2, 1) }], 'oxyz', true),
      rules: [{ type: 'has_plane_equation', refs: [], params: { a: 2, b: -1, c: 1, d: -1 }, description: 'Dựng mặt phẳng 2x − y + z − 1 = 0.' }],
      hints: ['Công thức: 2(x − 1) − 1(y − 2) + 1(z − 1) = 0.', 'Rút gọn ta được 2x − y + z − 1 = 0.', 'Nhập A=2, B=-1, C=1, D=-1 bằng Mặt phẳng theo phương trình.'],
      steps: [{ id: 's1', actionText: 'Nhập phương trình 2x - y + z - 1 = 0.', mathExplanation: '2(1) - 1(2) + 1(1) - 1 = 0.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_equation', params: { a: 2, b: -1, c: 1, d: -1 }, label: '(P)' } }],
      proof: '$2(x-1) - (y-2) + (z-1) = 0 \\Leftrightarrow 2x - y + z - 1 = 0$.',
    },
    {
      levelId: 16, order: 5, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Mặt phẳng trung trực của đoạn thẳng trong Oxyz',
      title: 'Dựng mặt phẳng trung trực của đoạn thẳng AB với A(0;0;0), B(2;2;0)',
      description: 'Cho $A(0; 0; 0)$ và $B(2; 2; 0)$. Hãy dựng mặt phẳng trung trực $(P)$ của $AB$ (phương trình $x + y - 2 = 0$).',
      hypothesis: 'Hai điểm $A(0; 0; 0)$ và $B(2; 2; 0)$.',
      goal: 'Dựng mặt phẳng $x + y - 2 = 0$.',
      setup: () => givenPointsScene([{ id: 'A', label: 'A', pos: v3(0, 0, 0) }, { id: 'B', label: 'B', pos: v3(2, 2, 0) }], 'oxyz', true),
      rules: [{ type: 'has_plane_equation', refs: [], params: { a: 1, b: 1, c: 0, d: -2 }, description: 'Dựng mặt phẳng trung trực x + y − 2 = 0.' }],
      hints: ['Trung điểm M(1; 1; 0), pháp tuyến AB = (2; 2; 0) cùng phương (1; 1; 0).', 'Phương trình: 1(x − 1) + 1(y − 1) = 0 ⇔ x + y − 2 = 0.', 'Nhập A=1, B=1, C=0, D=-2 (hoặc dựng trung điểm M rồi dùng Mặt phẳng vuông góc đường thẳng).'],
      steps: [{ id: 's1', actionText: 'Nhập mặt phẳng x + y - 2 = 0.', mathExplanation: 'Đi qua trung điểm (1; 1; 0) và vuông góc AB.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 0, d: -2 }, label: '(P)' } }],
      proof: 'Trung điểm $M(1; 1; 0)$ và pháp tuyến $\\vec{n} = (1; 1; 0)$ cho phương trình $x + y - 2 = 0$.',
    },
    {
      levelId: 16, order: 6, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Mặt phẳng song song mặt phẳng cho trước trong Oxyz',
      title: 'Dựng mặt phẳng (Q) qua M(1; 1; 2) song song (P): x − y + 2z = 0',
      description: 'Cho mặt phẳng $(P): x - y + 2z = 0$ và điểm $M(1; 1; 2)$. Hãy dựng mặt phẳng $(Q)$ đi qua $M$ và song song với $(P)$.',
      hypothesis: 'Mặt phẳng $(P)$ và điểm $M(1; 1; 2)$.',
      goal: 'Dựng $(Q): x - y + 2z - 4 = 0$.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'M', label: 'M', pos: v3(1, 1, 2) }], 'oxyz', true);
        return addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: -1, c: 2, d: 0 }, label: '(P)', style: { color: '#0F766E', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_plane_parallel_to_through', refs: ['M', 'plP'], description: 'Dựng (Q) qua M song song (P).' }],
      perturb: ['M'],
      hints: ['Dùng Mặt phẳng song song(M, (P)) hoặc nhập phương trình x − y + 2z − 4 = 0.', 'Chọn công cụ Mặt phẳng song song.', 'Nhấp điểm M rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Dựng mặt phẳng (Q) qua M song song (P).', mathExplanation: '(Q): x − y + 2z − 4 = 0.', addInput: { id: 'sol_q', kind: 'plane', rule: 'plane_parallel_point', parents: ['M', 'plP'], label: '(Q)' } }],
      proof: 'Thay $M(1; 1; 2)$ vào $x - y + 2z + D = 0$ được $D = -4$.',
    },
    {
      levelId: 16, order: 7, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Khoảng cách từ điểm đến mặt phẳng bằng tọa độ',
      title: 'Đo khoảng cách từ gốc O đến mặt phẳng (P): 2x + 2y + z − 6 = 0',
      description: 'Cho mặt phẳng $(P): 2x + 2y + z - 6 = 0$ và gốc tọa độ $O(0; 0; 0)$. Hãy đo khoảng cách $d(O, (P))$ (bằng $2$).',
      hypothesis: 'Gốc $O$ và mặt phẳng $(P): 2x + 2y + z - 6 = 0$.',
      goal: 'Đo khoảng cách $d(O, (P)) = 2$.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }], 'oxyz', true);
        return addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 2, b: 2, c: 1, d: -6 }, label: '(P)', style: { color: '#0284C7', opacity: 0.18, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_pplane' }, description: 'Đo d(O, (P)).' }],
      hints: ['d(O, (P)) = |−6| / √(2² + 2² + 1²) = 6/3 = 2.', 'Chọn công cụ Khoảng cách điểm – mặt phẳng.', 'Nhấp O rồi (P).'],
      steps: [{ id: 's1', actionText: 'Đo khoảng cách từ O đến (P).', mathExplanation: 'd(O, (P)) = 2.', addInput: { id: 'sol_m', kind: 'measurement', rule: 'measure_distance_pplane', parents: ['O', 'plP'], label: 'd(O,(P))', metricKind: 'distance' } }],
      proof: '$d(O, (P)) = \\frac{|2\\cdot 0 + 2\\cdot 0 + 1\\cdot 0 - 6|}{\\sqrt{2^2 + 2^2 + 1^2}} = \\frac{6}{3} = 2$.',
    },
    {
      levelId: 16, order: 8, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Góc giữa hai mặt phẳng trong hệ tọa độ Oxyz',
      title: 'Đo góc giữa hai mặt phẳng (P): x + z − 2 = 0 và (Q): z = 0',
      description: 'Cho hai mặt phẳng $(P): x + z - 2 = 0$ và $(Q): z = 0$. Hãy đo góc giữa hai mặt phẳng ($45^\\circ$).',
      hypothesis: 'Hai mặt phẳng $(P)$ và $(Q)$.',
      goal: 'Đo góc giữa $(P)$ và $(Q)$ ($45^\\circ$).',
      setup: () => {
        let sc = createEmptyScene3D(); sc.displayMode = 'oxyz'; sc.showAxes = true;
        sc = addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 0, c: 1, d: -2 }, label: '(P)', style: { color: '#0284C7', opacity: 0.18, isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'plQ', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(Q)', style: { color: '#0F766E', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_planes' }, description: 'Đo góc giữa (P) và (Q).' }],
      hints: ['cos φ = |1·0 + 0·0 + 1·1| / (√2 · 1) = 1/√2 ⇒ φ = 45°.', 'Chọn công cụ Góc giữa 2 mặt phẳng.', 'Nhấp (P) rồi (Q).'],
      steps: [{ id: 's1', actionText: 'Đo góc giữa (P) và (Q).', mathExplanation: 'Góc bằng 45°.', addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_planes', parents: ['plP', 'plQ'], label: '∠((P),(Q))', metricKind: 'angle' } }],
      proof: '$\\cos((P),(Q)) = \\frac{|\\vec{n}_P \\cdot \\vec{n}_Q|}{|\\vec{n}_P|\\cdot|\\vec{n}_Q|} = \\frac{1}{\\sqrt{2}} \\Rightarrow ((P),(Q)) = 45^\\circ$.',
    },
    {
      levelId: 16, order: 9, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Mặt phẳng đi qua hai điểm và vuông góc mặt phẳng cho trước',
      title: 'Dựng mặt phẳng qua A(1;0;0), B(0;1;0) vuông góc (Oxy)',
      description: 'Cho hai điểm $A(1; 0; 0), B(0; 1; 0)$ và mặt phẳng $(Oxy)$. Hãy dựng mặt phẳng $(P)$ đi qua $A, B$ và vuông góc với $(Oxy)$ (phương trình $x + y - 1 = 0$).',
      hypothesis: 'Hai điểm $A, B$ và mặt phẳng $(Oxy)$.',
      goal: 'Dựng mặt phẳng $(P): x + y - 1 = 0$.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'A', label: 'A', pos: v3(1, 0, 0) }, { id: 'B', label: 'B', pos: v3(0, 1, 0) }], 'oxyz', true);
        return addGeo3DObject(sc, { id: 'plOxy', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(Oxy)', style: { color: '#0F766E', opacity: 0.14, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_plane_perp_plane_through', refs: ['A', 'B', 'plOxy'], description: 'Dựng mặt phẳng qua A, B vuông góc (Oxy).' }],
      hints: ['Pháp tuyến của (P) là tích có hướng [AB, k] = (-1; -1; 0) cùng phương (1; 1; 0).', 'Phương trình (P): x + y − 1 = 0.', 'Chọn Mặt phẳng theo phương trình và nhập A=1, B=1, C=0, D=-1.'],
      steps: [{ id: 's1', actionText: 'Nhập mặt phẳng x + y - 1 = 0.', mathExplanation: 'Đi qua A(1;0;0), B(0;1;0) và có n=(1;1;0) ⊥ k=(0;0;1).', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 0, d: -1 }, label: '(P)' } }],
      proof: 'Vectơ pháp tuyến $\\vec{n} = [\\overrightarrow{AB}, \\vec{k}] = (1; 1; 0)$ cho phương trình $x + y - 1 = 0$.',
    },
    {
      levelId: 16, order: 10, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Tổng hợp phương trình mặt phẳng và giao tuyến Oxyz',
      title: 'Dựng mặt phẳng (Q): x − y + z − 1 = 0 và tìm giao tuyến với (P)',
      description: 'Cho mặt phẳng $(P): x + y + z - 3 = 0$. Hãy dựng mặt phẳng $(Q): x - y + z - 1 = 0$ và dựng giao tuyến $d = (P) \\cap (Q)$.',
      hypothesis: 'Mặt phẳng $(P): x + y + z - 3 = 0$.',
      goal: 'Dựng $(Q): x - y + z - 1 = 0$ và giao tuyến $d = (P) \\cap (Q)$.',
      setup: () => {
        let sc = createEmptyScene3D(); sc.displayMode = 'oxyz'; sc.showAxes = true;
        return addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 1, d: -3 }, label: '(P)', style: { color: '#0F766E', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [
        { type: 'has_plane_equation', refs: [], params: { a: 1, b: -1, c: 1, d: -1 }, description: 'Dựng mặt phẳng (Q): x − y + z − 1 = 0.' },
        { type: 'has_line_point_direction', refs: [], params: { px: 2, py: 1, pz: 0, dx: 1, dy: 0, dz: -1 }, description: 'Dựng giao tuyến của (P) và (Q).' },
      ],
      hints: ['Bước 1: Tạo mặt phẳng (Q) với A=1, B=-1, C=1, D=-1.', 'Bước 2: Chọn công cụ Giao tuyến 2 mặt phẳng cho (P) và (Q).', 'Nhấp (P) rồi nhấp (Q).'],
      steps: [
        { id: 's1', actionText: 'Dựng mặt phẳng (Q): x - y + z - 1 = 0.', mathExplanation: 'Phương trình mặt phẳng thứ hai.', addInput: { id: 'sol_q', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: -1, c: 1, d: -1 }, label: '(Q)' } },
        { id: 's2', actionText: 'Dựng giao tuyến của (P) và (Q).', mathExplanation: 'Giao tuyến đi qua (2; 1; 0) có VTCP (1; 0; -1).', addInput: { id: 'sol_d', kind: 'line', rule: 'intersect_plane_plane', parents: ['plP', 'sol_q'], label: 'd' } },
      ],
      proof: 'Hệ phương trình $(P)$ và $(Q)$ cho $y = 1$ và $x + z = 2$, là đường thẳng qua $(2; 1; 0)$ có vectơ chỉ phương $(1; 0; -1)$.',
    },

    // =========================================================================
    // CẤP ĐỘ XVII: PHƯƠNG TRÌNH ĐƯỜNG THẲNG (10 thử thách — Toán 12)
    // =========================================================================
    {
      levelId: 17, order: 1, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Đường thẳng đi qua điểm và có vectơ chỉ phương',
      title: 'Dựng đường thẳng d qua M(1; 0; 1) có VTCP u = (1; 2; 1)',
      description: 'Cho điểm $M(1; 0; 1)$. Hãy dựng đường thẳng $d$ đi qua $M$ và nhận $\\vec{u} = (1; 2; 1)$ làm vectơ chỉ phương.',
      hypothesis: 'Điểm $M(1; 0; 1)$ và $\\vec{u} = (1; 2; 1)$.',
      goal: 'Dựng đường thẳng $d$ qua $M$ có VTCP $(1; 2; 1)$.',
      setup: () => givenPointsScene([{ id: 'M', label: 'M', pos: v3(1, 0, 1) }], 'oxyz', true),
      rules: [{ type: 'has_line_point_direction', refs: ['M'], params: { dx: 1, dy: 2, dz: 1 }, description: 'Dựng đường thẳng qua M có VTCP (1; 2; 1).' }],
      hints: ['Mở nhóm Vectơ và tọa độ → chọn Đường thẳng (điểm + VTCP).', 'Nhấp chọn điểm M, sau đó nhập VTCP (1; 2; 1).', 'Xác nhận để dựng đường thẳng d.'],
      steps: [{ id: 's1', actionText: 'Dựng đường thẳng qua M với VTCP (1; 2; 1).', mathExplanation: 'x = 1 + t, y = 2t, z = 1 + t.', addInput: { id: 'sol_d', kind: 'line', rule: 'line_point_direction', parents: ['M'], params: { dx: 1, dy: 2, dz: 1 }, label: 'd' } }],
      proof: 'Phương trình tham số của $d$: $x = 1 + t,\\; y = 2t,\\; z = 1 + t$.',
    },
    {
      levelId: 17, order: 2, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Đường thẳng đi qua hai điểm cho trước trong Oxyz',
      title: 'Dựng đường thẳng đi qua A(1; -1; 2) và B(3; 1; 0)',
      description: 'Cho hai điểm $A(1; -1; 2)$ và $B(3; 1; 0)$. Hãy dựng đường thẳng $AB$.',
      hypothesis: 'Hai điểm $A(1; -1; 2)$ và $B(3; 1; 0)$.',
      goal: 'Dựng đường thẳng qua $A$ và $B$.',
      setup: () => givenPointsScene([{ id: 'A', label: 'A', pos: v3(1, -1, 2) }, { id: 'B', label: 'B', pos: v3(3, 1, 0) }], 'oxyz', true),
      rules: [{ type: 'has_line_through', refs: ['A', 'B'], description: 'Dựng đường thẳng AB.' }],
      perturb: ['A', 'B'],
      hints: ['Đường thẳng AB nhận vectơ AB = (2; 2; -2) làm VTCP.', 'Chọn công cụ Đường thẳng qua 2 điểm.', 'Nhấp điểm A rồi điểm B.'],
      steps: [{ id: 's1', actionText: 'Dựng đường thẳng qua A và B.', mathExplanation: 'VTCP u = (1; 1; -1).', addInput: { id: 'sol_l', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'AB' } }],
      proof: 'Đường thẳng $AB$ đi qua $A(1; -1; 2)$ và có vectơ chỉ phương $\\vec{u} = (1; 1; -1)$.',
    },
    {
      levelId: 17, order: 3, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Đường thẳng đi qua điểm và vuông góc mặt phẳng (Oxyz)',
      title: 'Dựng đường thẳng qua M(1; 2; 3) vuông góc mặt phẳng (P): x + 2y − z = 0',
      description: 'Cho điểm $M(1; 2; 3)$ và mặt phẳng $(P): x + 2y - z = 0$. Hãy dựng đường thẳng $\\Delta$ đi qua $M$ và vuông góc với $(P)$.',
      hypothesis: 'Điểm $M(1; 2; 3)$ và mặt phẳng $(P)$.',
      goal: 'Dựng đường thẳng qua $M$ vuông góc $(P)$.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'M', label: 'M', pos: v3(1, 2, 3) }], 'oxyz', true);
        return addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 2, c: -1, d: 0 }, label: '(P)', style: { color: '#0F766E', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_line_perp_plane_through', refs: ['M', 'plP'], description: 'Dựng đường thẳng qua M vuông góc (P).' }],
      perturb: ['M'],
      hints: ['Đường thẳng vuông góc (P) nhận pháp tuyến n = (1; 2; -1) làm VTCP.', 'Chọn Đường thẳng vuông góc mặt phẳng(M, (P)).', 'Nhấp điểm M rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Dựng đường thẳng qua M vuông góc (P).', mathExplanation: 'VTCP u = n_(P) = (1; 2; -1).', addInput: { id: 'sol_l', kind: 'line', rule: 'line_perp_plane', parents: ['M', 'plP'], label: 'Δ' } }],
      proof: 'Đường thẳng $\\Delta$ đi qua $M(1; 2; 3)$ và nhận $\\vec{n}_{(P)} = (1; 2; -1)$ làm vectơ chỉ phương.',
    },
    {
      levelId: 17, order: 4, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Đường thẳng song song đường thẳng cho trước trong Oxyz',
      title: 'Dựng đường thẳng qua M(0; 2; 1) song song đường thẳng d',
      description: 'Cho đường thẳng $d$ và điểm $M(0; 2; 1)$. Hãy dựng đường thẳng $d\'$ đi qua $M$ và song song với $d$.',
      hypothesis: 'Đường thẳng $d$ và điểm $M(0; 2; 1)$.',
      goal: 'Dựng $d\'$ qua $M$ song song $d$.',
      setup: () => addGivenLine(givenPointsScene([{ id: 'A', label: 'A', pos: v3(-2, 0, 0) }, { id: 'B', label: 'B', pos: v3(2, 1, 2) }, { id: 'M', label: 'M', pos: v3(0, 2, 1) }], 'oxyz', true), 'ld', 'A', 'B', 'd'),
      rules: [{ type: 'has_line_parallel_to_through', refs: ['M', 'ld'], description: "Dựng d' qua M song song d." }],
      perturb: ['A', 'B', 'M'],
      hints: ['Hai đường thẳng song song có cùng vectơ chỉ phương.', 'Chọn Đường thẳng song song.', 'Nhấp điểm M rồi đường thẳng d.'],
      steps: [{ id: 's1', actionText: "Dựng d' qua M song song d.", mathExplanation: "d' nhận VTCP của d và đi qua M.", addInput: { id: 'sol_l', kind: 'line', rule: 'line_parallel_point', parents: ['M', 'ld'], label: "d'" } }],
      proof: 'Đường thẳng $d\'$ đi qua $M$ và cùng vectơ chỉ phương với $d$.',
    },
    {
      levelId: 17, order: 5, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Giao điểm đường thẳng và mặt phẳng trong Oxyz',
      title: 'Tìm giao điểm của đường thẳng d và mặt phẳng (P): x + y + z − 4 = 0',
      description: 'Cho đường thẳng $d$ đi qua $A(0; 0; 1)$ và $B(2; 2; 3)$, cùng mặt phẳng $(P): x + y + z - 4 = 0$. Hãy dựng giao điểm $I = d \\cap (P)$.',
      hypothesis: 'Đường thẳng $d$ và mặt phẳng $(P)$.',
      goal: 'Dựng giao điểm $I = d \\cap (P)$.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'A', label: 'A', pos: v3(0, 0, 1) }, { id: 'B', label: 'B', pos: v3(2, 2, 3) }], 'oxyz', true);
        sc = addGivenLine(sc, 'ld', 'A', 'B', 'd', '#D97706');
        return addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 1, d: -4 }, label: '(P)', style: { color: '#0284C7', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_intersection_line_plane', refs: ['ld', 'plP'], description: 'Dựng giao điểm I = d ∩ (P).' }],
      perturb: ['A', 'B'],
      hints: ['Thay phương trình tham số d vào (P) tìm t, hoặc dùng Giao điểm đường – mặt.', 'Chọn Giao điểm đường thẳng – mặt phẳng.', 'Nhấp đường thẳng d rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Dựng giao điểm I của d và (P).', mathExplanation: 'I = (1; 1; 2).', addInput: { id: 'sol_i', kind: 'point', rule: 'intersect_line_plane', parents: ['ld', 'plP'], label: 'I' } }],
      proof: 'Thay $(t; t; 1+t)$ vào $x+y+z-4=0$ được $3t-3=0 \\Rightarrow t=1 \\Rightarrow I(1; 1; 2)$.',
    },
    {
      levelId: 17, order: 6, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Vị trí tương đối: giao điểm hai đường thẳng cắt nhau trong Oxyz',
      title: 'Xác định giao điểm của hai đường thẳng d₁ và d₂ trong Oxyz',
      description: 'Cho hai đường thẳng $d_1$ và $d_2$ cắt nhau trong $Oxyz$. Hãy dựng giao điểm $I = d_1 \\cap d_2$.',
      hypothesis: 'Hai đường thẳng cắt nhau $d_1, d_2$.',
      goal: 'Dựng giao điểm $I = d_1 \\cap d_2$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(0, 1, 1) }, { id: 'B', label: 'B', pos: v3(2, 1, 3) },
          { id: 'C', label: 'C', pos: v3(1, -1, 2) }, { id: 'D', label: 'D', pos: v3(1, 3, 2) },
        ], 'oxyz', true);
        sc = addGivenLine(sc, 'd1', 'A', 'B', 'd₁', '#0F766E');
        return addGivenLine(sc, 'd2', 'C', 'D', 'd₂', '#0284C7');
      },
      rules: [{ type: 'has_intersection_ll', refs: ['d1', 'd2'], description: 'Dựng giao điểm I(1; 1; 2) của d₁ và d₂.' }],
      hints: ['Giải hệ tham số tìm điểm chung duy nhất I(1; 1; 2).', 'Chọn Giao điểm 2 đường thẳng.', 'Nhấp d₁ rồi d₂.'],
      steps: [{ id: 's1', actionText: 'Dựng giao điểm của d₁ và d₂.', mathExplanation: 'I = (1; 1; 2).', addInput: { id: 'sol_i', kind: 'point', rule: 'intersect_line_line', parents: ['d1', 'd2'], label: 'I' } }],
      proof: 'Hai đường thẳng cùng đi qua điểm duy nhất $I(1; 1; 2)$.',
    },
    {
      levelId: 17, order: 7, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Góc giữa đường thẳng và mặt phẳng trong Oxyz',
      title: 'Đo góc giữa đường thẳng d và mặt phẳng (P) trong Oxyz',
      description: 'Cho đường thẳng $d$ và mặt phẳng $(P): z = 0$. Hãy đo góc giữa $d$ và $(P)$.',
      hypothesis: 'Đường thẳng $d$ và mặt phẳng $(P)$.',
      goal: 'Đo góc $(d, (P))$.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'A', label: 'A', pos: v3(0, 0, 0) }, { id: 'B', label: 'B', pos: v3(2, 0, 2) }], 'oxyz', true);
        sc = addGivenLine(sc, 'ld', 'A', 'B', 'd', '#D97706');
        return addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(P)', style: { color: '#0F766E', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_line_plane' }, description: 'Đo góc giữa d và (P).' }],
      hints: ['sin φ = |u · n| / (|u| · |n|) = 1/√2 ⇒ φ = 45°.', 'Chọn Góc đường thẳng – mặt phẳng.', 'Nhấp d rồi (P).'],
      steps: [{ id: 's1', actionText: 'Đo góc giữa d và (P).', mathExplanation: 'Góc bằng 45°.', addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_line_plane', parents: ['ld', 'plP'], label: '∠(d,(P))', metricKind: 'angle' } }],
      proof: '$\\sin(d,(P)) = \\frac{|(1;0;1)\\cdot(0;0;1)|}{\\sqrt{2}\\cdot 1} = \\frac{1}{\\sqrt{2}} \\Rightarrow (d,(P)) = 45^\\circ$.',
    },
    {
      levelId: 17, order: 8, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Hình chiếu vuông góc của điểm lên đường thẳng trong Oxyz',
      title: 'Tìm hình chiếu H của M(2; 3; 1) lên đường thẳng d',
      description: 'Cho điểm $M(2; 3; 1)$ và đường thẳng $d$ đi qua $A(0; 1; 1)$ có VTCP $(1; 0; 0)$. Hãy dựng hình chiếu vuông góc $H$ của $M$ lên $d$.',
      hypothesis: 'Điểm $M(2; 3; 1)$ và đường thẳng $d$.',
      goal: 'Dựng hình chiếu vuông góc $H(2; 1; 1)$ trên $d$.',
      setup: () => addGivenLine(givenPointsScene([{ id: 'A', label: 'A', pos: v3(0, 1, 1) }, { id: 'B', label: 'B', pos: v3(4, 1, 1) }, { id: 'M', label: 'M', pos: v3(2, 3, 1) }], 'oxyz', true), 'ld', 'A', 'B', 'd'),
      rules: [{ type: 'has_foot_on_line', refs: ['M', 'ld'], description: 'Dựng hình chiếu H(2; 1; 1) của M trên d.' }],
      perturb: ['M'],
      hints: ['H ∈ d sao cho MH ⊥ u_d.', 'Chọn Hình chiếu lên đường thẳng.', 'Nhấp điểm M rồi đường thẳng d.'],
      steps: [{ id: 's1', actionText: 'Dựng hình chiếu H của M lên d.', mathExplanation: 'H = (2; 1; 1).', addInput: { id: 'sol_h', kind: 'point', rule: 'foot_point_line', parents: ['M', 'ld'], label: 'H' } }],
      proof: 'Hình chiếu $H(t; 1; 1)$ thỏa $\\overrightarrow{MH} \\cdot (1; 0; 0) = t - 2 = 0 \\Rightarrow H(2; 1; 1)$.',
    },
    {
      levelId: 17, order: 9, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Hình chiếu vuông góc của đường thẳng lên mặt phẳng (Oxy)',
      title: 'Dựng hình chiếu của đường thẳng AB lên mặt phẳng (Oxy)',
      description: 'Cho $A(0; 0; 2), B(3; 3; 4)$ và mặt phẳng $(Oxy)$. Hãy dựng hai hình chiếu $A\', B\'$ trên $(Oxy)$ và đường thẳng chiếu $d\' = A\'B\'$.',
      hypothesis: 'Hai điểm $A, B$ và mặt phẳng $(Oxy)$.',
      goal: 'Dựng $A\', B\'$ trên $(Oxy)$ và đường thẳng $A\'B\'$.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'A', label: 'A', pos: v3(0, 0, 2) }, { id: 'B', label: 'B', pos: v3(3, 3, 4) }], 'oxyz', true);
        sc = addGivenLine(sc, 'lAB', 'A', 'B', 'd', '#D97706');
        return addGeo3DObject(sc, { id: 'plOxy', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(Oxy)', style: { color: '#0F766E', opacity: 0.14, isGiven: true }, skipLog: true }).scene;
      },
      rules: [
        { type: 'has_foot_on_plane', refs: ['A', 'plOxy'], description: "Dựng hình chiếu A'(0; 0; 0)." },
        { type: 'has_foot_on_plane', refs: ['B', 'plOxy'], description: "Dựng hình chiếu B'(3; 3; 0)." },
        { type: 'has_line_point_direction', refs: [], params: { px: 0, py: 0, pz: 0, dx: 1, dy: 1, dz: 0 }, description: "Dựng đường thẳng hình chiếu A'B'." },
      ],
      hints: ['Chiếu A, B xuống (Oxy) được A\'(0;0;0), B\'(3;3;0), rồi dựng đường thẳng A\'B\'.', 'Bước 1 & 2: Hình chiếu(A, (Oxy)), (B, (Oxy)). Bước 3: Đường thẳng(A\', B\').', 'Nối đường thẳng qua A\' và B\'.'],
      steps: [
        { id: 's1', actionText: "Dựng A' là hình chiếu A lên (Oxy).", mathExplanation: "A' = (0; 0; 0).", addInput: { id: 'sol_a1', kind: 'point', rule: 'foot_point_plane', parents: ['A', 'plOxy'], label: "A'" } },
        { id: 's2', actionText: "Dựng B' là hình chiếu B lên (Oxy).", mathExplanation: "B' = (3; 3; 0).", addInput: { id: 'sol_b1', kind: 'point', rule: 'foot_point_plane', parents: ['B', 'plOxy'], label: "B'" } },
        { id: 's3', actionText: "Dựng đường thẳng A'B'.", mathExplanation: "Hình chiếu vuông góc của d lên (Oxy).", addInput: { id: 'sol_l', kind: 'line', rule: 'line_two_points', parents: ['sol_a1', 'sol_b1'], label: "d'" } },
      ],
      proof: 'Hình chiếu của $d$ lên $(Oxy)$ là đường thẳng $A\'B\'$ có phương trình $x = t,\\; y = t,\\; z = 0$.',
    },
    {
      levelId: 17, order: 10, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Tổng hợp đường vuông góc chung hai đường thẳng chéo nhau trong Oxyz',
      title: 'Dựng đường vuông góc chung và đo khoảng cách giữa d₁ và d₂ trong Oxyz',
      description: 'Cho hai đường thẳng chéo nhau $d_1, d_2$ trong $Oxyz$. Hãy dựng đường vuông góc chung $\\Delta$ và đo khoảng cách $d(d_1, d_2)$.',
      hypothesis: 'Hai đường thẳng chéo nhau $d_1, d_2$.',
      goal: 'Dựng đường vuông góc chung và đo $d(d_1, d_2)$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(0, 0, 0) }, { id: 'B', label: 'B', pos: v3(3, 0, 0) },
          { id: 'C', label: 'C', pos: v3(1, -2, 2.5) }, { id: 'D', label: 'D', pos: v3(1, 2, 2.5) },
        ], 'oxyz', true);
        sc = addGivenLine(sc, 'd1', 'A', 'B', 'd₁', '#0F766E');
        return addGivenLine(sc, 'd2', 'C', 'D', 'd₂', '#0284C7');
      },
      rules: [
        { type: 'has_common_perpendicular', refs: ['d1', 'd2'], description: 'Dựng đường vuông góc chung của d₁ và d₂.' },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_skew' }, description: 'Đo khoảng cách d(d₁, d₂).' },
      ],
      perturb: ['A', 'B', 'C', 'D'],
      hints: ['Dùng Đường vuông góc chung(d₁, d₂) và Khoảng cách 2 đường chéo nhau(d₁, d₂).', 'Bước 1: Đường vuông góc chung(d₁, d₂).', 'Bước 2: Khoảng cách 2 đường chéo nhau(d₁, d₂).'],
      steps: [
        { id: 's1', actionText: 'Dựng đường vuông góc chung của d₁ và d₂.', mathExplanation: 'Δ cắt và vuông góc cả d₁ và d₂.', addInput: { id: 'sol_cp', kind: 'line', rule: 'common_perpendicular', parents: ['d1', 'd2'], label: 'Δ' } },
        { id: 's2', actionText: 'Đo khoảng cách giữa d₁ và d₂.', mathExplanation: 'Khoảng cách bằng 2,5.', addInput: { id: 'sol_m', kind: 'measurement', rule: 'measure_distance_skew', parents: ['d1', 'd2'], label: 'd(d₁,d₂)', metricKind: 'distance' } },
      ],
      proof: 'Khoảng cách hai đường thẳng chéo nhau tính bằng $\\frac{|[\\vec{u}_1, \\vec{u}_2] \\cdot \\overrightarrow{M_1M_2}|}{|[\\vec{u}_1, \\vec{u}_2]|} = 2{,}5$.',
    },

    // =========================================================================
    // CẤP ĐỘ XVIII: PHƯƠNG TRÌNH MẶT CẦU VÀ BÀI TOÁN TỔNG HỢP (10 thử thách — Toán 12)
    // =========================================================================
    {
      levelId: 18, order: 1, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Mặt cầu tâm O(0; 0; 0) bán kính R',
      title: 'Dựng mặt cầu tâm O(0; 0; 0), bán kính R = 2',
      description: 'Trong $Oxyz$, hãy dựng mặt cầu $(S): x^2 + y^2 + z^2 = 4$ có tâm $O(0; 0; 0)$ và bán kính $R = 2$.',
      hypothesis: 'Hệ trục tọa độ $Oxyz$.',
      goal: 'Dựng mặt cầu tâm $(0; 0; 0)$, bán kính $R = 2$.',
      setup: () => givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }], 'oxyz', true),
      rules: [{ type: 'has_sphere_center_radius', refs: [], params: { cx: 0, cy: 0, cz: 0, r: 2 }, description: 'Dựng mặt cầu tâm O(0;0;0), R = 2.' }],
      hints: ['Mặt cầu x² + y² + z² = 4 có tâm O(0; 0; 0) và bán kính R = √4 = 2.', 'Mở nhóm Hình khối → chọn Mặt cầu (nhập tâm và bán kính).', 'Nhập tâm (0; 0; 0) và bán kính R = 2.'],
      steps: [{ id: 's1', actionText: 'Tạo mặt cầu tâm O(0; 0; 0), R = 2.', mathExplanation: 'Phương trình x² + y² + z² = 4.', addInput: { id: 'sol_s', kind: 'solid', rule: 'solid_sphere', solidType: 'sphere', center: v3(0, 0, 0), params: { r: 2 }, label: '(S)' } }],
      proof: 'Mặt cầu tâm $O(0; 0; 0)$ bán kính $R = 2$ có phương trình $x^2 + y^2 + z^2 = 4$.',
    },
    {
      levelId: 18, order: 2, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Mặt cầu có tâm I(a; b; c) và bán kính R',
      title: 'Dựng mặt cầu (S): (x−1)² + (y+1)² + (z−2)² = 9',
      description: 'Xác định tâm $I$ và bán kính $R$ của mặt cầu $(S): (x - 1)^2 + (y + 1)^2 + (z - 2)^2 = 9$, sau đó dựng mặt cầu $(S)$ trên không gian $Oxyz$.',
      hypothesis: 'Phương trình chính tắc của mặt cầu $(S)$.',
      goal: 'Dựng mặt cầu tâm $I(1; -1; 2)$, bán kính $R = 3$.',
      setup: () => givenPointsScene([{ id: 'I', label: 'I', pos: v3(1, -1, 2) }], 'oxyz', true),
      rules: [{ type: 'has_sphere_center_radius', refs: [], params: { cx: 1, cy: -1, cz: 2, r: 3 }, description: 'Dựng mặt cầu tâm I(1; -1; 2), R = 3.' }],
      hints: ['Từ phương trình chính tắc đọc được tâm I(1; -1; 2) và R = √9 = 3.', 'Mở nhóm Hình khối → Mặt cầu.', 'Nhập tâm (1; -1; 2) và bán kính R = 3.'],
      steps: [{ id: 's1', actionText: 'Tạo mặt cầu tâm I(1; -1; 2), R = 3.', mathExplanation: 'Tâm I(1; -1; 2), R = 3.', addInput: { id: 'sol_s', kind: 'solid', rule: 'solid_sphere', solidType: 'sphere', center: v3(1, -1, 2), params: { r: 3 }, label: '(S)' } }],
      proof: 'Phương trình $(x-a)^2+(y-b)^2+(z-c)^2 = R^2$ cho tâm $I(1; -1; 2)$ và bán kính $R = 3$.',
    },
    {
      levelId: 18, order: 3, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Xác định tâm và bán kính từ phương trình khai triển',
      title: 'Dựng mặt cầu từ phương trình x² + y² + z² − 2x − 4y + 1 = 0',
      description: 'Cho mặt cầu $(S): x^2 + y^2 + z^2 - 2x - 4y + 1 = 0$. Hãy tìm tâm $I(1; 2; 0)$, bán kính $R = 2$ và dựng mặt cầu $(S)$.',
      hypothesis: 'Phương trình khai triển của mặt cầu $(S)$.',
      goal: 'Dựng mặt cầu tâm $I(1; 2; 0)$, bán kính $R = 2$.',
      setup: () => givenPointsScene([{ id: 'O', label: 'O', pos: v3(0, 0, 0) }], 'oxyz', true),
      rules: [{ type: 'has_sphere_center_radius', refs: [], params: { cx: 1, cy: 2, cz: 0, r: 2 }, description: 'Dựng mặt cầu tâm (1; 2; 0), R = 2.' }],
      hints: ['a = 1, b = 2, c = 0, d = 1 ⇒ R = √(a² + b² + c² − d) = √(1 + 4 + 0 − 1) = 2.', 'Mở nhóm Hình khối → Mặt cầu.', 'Nhập tâm (1; 2; 0) và bán kính R = 2.'],
      steps: [{ id: 's1', actionText: 'Tạo mặt cầu tâm (1; 2; 0), R = 2.', mathExplanation: '(x−1)² + (y−2)² + z² = 4.', addInput: { id: 'sol_s', kind: 'solid', rule: 'solid_sphere', solidType: 'sphere', center: v3(1, 2, 0), params: { r: 2 }, label: '(S)' } }],
      proof: 'Biến đổi thành $(x-1)^2 + (y-2)^2 + z^2 = 4$ nên tâm $I(1; 2; 0)$ và $R = 2$.',
    },
    {
      levelId: 18, order: 4, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Mặt cầu đường kính AB trong Oxyz',
      title: 'Dựng tâm I và mặt cầu đường kính AB',
      description: 'Cho $A(0; 0; 1)$ và $B(2; 0; 1)$. Hãy dựng tâm $I$ là trung điểm $AB$ và mặt cầu đường kính $AB$ (tâm $(1; 0; 1)$, $R = 1$).',
      hypothesis: 'Hai đầu mút đường kính $A(0; 0; 1)$ và $B(2; 0; 1)$.',
      goal: 'Dựng trung điểm $I$ của $AB$ và mặt cầu đường kính $AB$.',
      setup: () => givenPointsScene([{ id: 'A', label: 'A', pos: v3(0, 0, 1) }, { id: 'B', label: 'B', pos: v3(2, 0, 1) }], 'oxyz', true),
      rules: [
        { type: 'has_midpoint_of', refs: ['A', 'B'], description: 'Dựng tâm I(1; 0; 1) là trung điểm AB.' },
        { type: 'has_sphere_center_radius', refs: [], params: { cx: 1, cy: 0, cz: 1, r: 1 }, description: 'Dựng mặt cầu tâm (1; 0; 1), R = 1.' },
      ],
      hints: ['Tâm mặt cầu là trung điểm I(1; 0; 1) của AB, bán kính R = AB/2 = 1.', 'Bước 1: Trung điểm(A, B) → I.', 'Bước 2: Hình khối → Mặt cầu với tâm (1; 0; 1), R = 1.'],
      steps: [
        { id: 's1', actionText: 'Dựng trung điểm I của AB.', mathExplanation: 'I = (1; 0; 1).', addInput: { id: 'sol_i', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'B'], label: 'I' } },
        { id: 's2', actionText: 'Tạo mặt cầu tâm (1; 0; 1), R = 1.', mathExplanation: 'R = AB/2 = 1.', addInput: { id: 'sol_s', kind: 'solid', rule: 'solid_sphere', solidType: 'sphere', center: v3(1, 0, 1), params: { r: 1 }, label: '(S)' } },
      ],
      proof: 'Mặt cầu đường kính $AB$ có tâm $I = \\frac{A+B}{2} = (1; 0; 1)$ và bán kính $R = \\frac{AB}{2} = 1$.',
    },
    {
      levelId: 18, order: 5, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Mặt cầu tiếp xúc với mặt phẳng tọa độ (Oxy)',
      title: 'Dựng mặt cầu tâm I(1; 1; 2) tiếp xúc mặt phẳng (Oxy)',
      description: 'Cho điểm $I(1; 1; 2)$ và mặt phẳng $(Oxy)$. Hãy dựng mặt cầu tâm $I$ tiếp xúc với $(Oxy)$ (bán kính $R = |z_I| = 2$).',
      hypothesis: 'Tâm $I(1; 1; 2)$ và mặt phẳng $(Oxy)$.',
      goal: 'Dựng mặt cầu tâm $I(1; 1; 2)$, bán kính $R = 2$.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'I', label: 'I', pos: v3(1, 1, 2) }], 'oxyz', true);
        return addGeo3DObject(sc, { id: 'plOxy', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(Oxy)', style: { color: '#0F766E', opacity: 0.14, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_sphere_center_radius', refs: [], params: { cx: 1, cy: 1, cz: 2, r: 2 }, description: 'Dựng mặt cầu tâm I(1; 1; 2), R = 2.' }],
      hints: ['Mặt cầu tiếp xúc (Oxy) có R = d(I, (Oxy)) = |z_I| = 2.', 'Chọn Hình khối → Mặt cầu.', 'Nhập tâm (1; 1; 2) và R = 2.'],
      steps: [{ id: 's1', actionText: 'Tạo mặt cầu tâm I(1; 1; 2), R = 2.', mathExplanation: 'Tiếp điểm với (Oxy) là H(1; 1; 0).', addInput: { id: 'sol_s', kind: 'solid', rule: 'solid_sphere', solidType: 'sphere', center: v3(1, 1, 2), params: { r: 2 }, label: '(S)' } }],
      proof: 'Vì mặt cầu tiếp xúc $(Oxy)$ nên $R = d(I, (Oxy)) = |2| = 2$.',
    },
    {
      levelId: 18, order: 6, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Giao tuyến đường tròn của mặt cầu và mặt phẳng cắt',
      title: 'Dựng thiết diện đường tròn của mặt cầu cắt bởi mặt phẳng (P)',
      description: 'Cho mặt cầu tâm $I(0; 0; 2)$ bán kính $R = 2{,}5$ và mặt phẳng $(P): z = 1{,}2$. Hãy dựng thiết diện đường tròn giao tuyến.',
      hypothesis: 'Mặt cầu $(S)$ và mặt phẳng cắt $(P)$ có $d(I, (P)) < R$.',
      goal: 'Dựng đường tròn thiết diện bằng công cụ Thiết diện.',
      setup: () => {
        let sc = createEmptyScene3D(); sc.displayMode = 'oxyz'; sc.showAxes = true;
        sc = addGeo3DObject(sc, { id: 'sph1', kind: 'solid', rule: 'solid_sphere', solidType: 'sphere', center: v3(0, 0, 2), params: { r: 2.5 }, label: 'Mặt cầu (S)', style: { color: '#0284C7', opacity: 0.2, isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: -1.2 }, label: '(P)', style: { color: '#D97706', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 8 }, description: 'Dựng đường tròn thiết diện của mặt cầu với (P).' }],
      hints: ['Khi d(I, (P)) < R, mặt phẳng cắt mặt cầu theo đường tròn bán kính r = √(R² − d²).', 'Chọn công cụ Thiết diện.', 'Nhấp mặt cầu (S) rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Dựng thiết diện của mặt cầu (S) với (P).', mathExplanation: 'Đường tròn giao tuyến có r = √(2,5² − 0,8²).', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['sph1', 'plP'], label: 'Đường tròn (C)' } }],
      proof: 'Giao tuyến mặt phẳng $(P)$ và mặt cầu $(S)$ là đường tròn bán kính $r = \\sqrt{R^2 - d^2}$.',
    },
    {
      levelId: 18, order: 7, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Tâm đường tròn giao tuyến là hình chiếu của tâm mặt cầu',
      title: 'Tìm tâm H của đường tròn giao tuyến giữa mặt cầu và mặt phẳng (P)',
      description: 'Cho mặt cầu tâm $I(1; 1; 3)$ và mặt phẳng cắt $(P): z = 1$. Hãy dựng tâm $H$ của đường tròn giao tuyến (chính là hình chiếu vuông góc của $I$ lên $(P)$).',
      hypothesis: 'Tâm $I(1; 1; 3)$, mặt cầu $(S)$ và mặt phẳng $(P)$.',
      goal: 'Dựng tâm $H(1; 1; 1)$ của đường tròn giao tuyến.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'I', label: 'I', pos: v3(1, 1, 3) }], 'oxyz', true);
        sc = addGeo3DObject(sc, { id: 'sph1', kind: 'solid', rule: 'solid_sphere', solidType: 'sphere', center: v3(1, 1, 3), params: { r: 2.5 }, label: '(S)', style: { color: '#0284C7', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: -1 }, label: '(P)', style: { color: '#0F766E', opacity: 0.15, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_foot_on_plane', refs: ['I', 'plP'], description: 'Dựng tâm H(1; 1; 1) của đường tròn giao tuyến.' }],
      hints: ['Tâm đường tròn giao tuyến là hình chiếu vuông góc của tâm I lên (P).', 'Chọn Hình chiếu lên mặt phẳng.', 'Nhấp điểm I rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Dựng hình chiếu H của I lên (P).', mathExplanation: 'H = (1; 1; 1).', addInput: { id: 'sol_h', kind: 'point', rule: 'foot_point_plane', parents: ['I', 'plP'], label: 'H' } }],
      proof: 'Tâm đường tròn giao tuyến luôn là hình chiếu vuông góc của tâm mặt cầu lên mặt phẳng cắt.',
    },
    {
      levelId: 18, order: 8, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Mặt phẳng tiếp diện của mặt cầu tại tiếp điểm',
      title: 'Dựng mặt phẳng tiếp diện của mặt cầu tại điểm M(0; 0; 2)',
      description: 'Cho mặt cầu tâm $I(0; 0; 0)$ bán kính $R = 2$ và điểm $M(0; 0; 2)$ nằm trên mặt cầu cùng bán kính $IM$. Hãy dựng mặt phẳng tiếp diện $(P)$ tại $M$.',
      hypothesis: 'Mặt cầu tâm $I(0;0;0)$, tiếp điểm $M(0;0;2)$ và đoạn bán kính $IM$.',
      goal: 'Dựng mặt phẳng qua $M$ vuông góc với bán kính $IM$.',
      setup: () => {
        let sc = givenPointsScene([{ id: 'I', label: 'I', pos: v3(0, 0, 0) }, { id: 'M', label: 'M', pos: v3(0, 0, 2) }], 'oxyz', true);
        sc = addGeo3DObject(sc, { id: 'eIM', kind: 'segment', rule: 'segment_3d', parents: ['I', 'M'], label: 'IM', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'sph1', kind: 'solid', rule: 'solid_sphere', solidType: 'sphere', center: v3(0, 0, 0), params: { r: 2 }, label: '(S)', style: { color: '#0284C7', opacity: 0.18, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_plane_perp_line_through', refs: ['M', 'eIM'], description: 'Dựng mặt phẳng tiếp diện tại M vuông góc IM.' }],
      hints: ['Mặt phẳng tiếp diện đi qua tiếp điểm M và vuông góc bán kính IM.', 'Chọn Mặt phẳng vuông góc đường thẳng.', 'Nhấp điểm M rồi đoạn bán kính IM.'],
      steps: [{ id: 's1', actionText: 'Dựng mặt phẳng qua M vuông góc IM.', mathExplanation: 'Phương trình tiếp diện là z − 2 = 0.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_perp_line', parents: ['M', 'eIM'], label: '(P)' } }],
      proof: 'Mặt phẳng tiếp xúc mặt cầu tại $M$ đi qua $M$ và nhận $\\overrightarrow{IM}$ làm vectơ pháp tuyến.',
    },
    {
      levelId: 18, order: 9, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Vị trí tương đối của mặt phẳng và mặt cầu qua khoảng cách',
      title: 'Đo khoảng cách d(I, (P)) xác định vị trí tương đối với mặt cầu',
      description: 'Cho mặt cầu tâm $I(1; 1; 2)$ bán kính $R = 2$ và mặt phẳng $(P): x + 2y + 2z - 1 = 0$. Hãy đo khoảng cách $d(I, (P))$ để so sánh với $R$.',
      hypothesis: 'Mặt cầu tâm $I(1; 1; 2), R = 2$ và mặt phẳng $(P)$.',
      goal: 'Đo khoảng cách $d(I, (P))$ ($= 2 = R$, tức tiếp xúc).',
      setup: () => {
        let sc = givenPointsScene([{ id: 'I', label: 'I', pos: v3(1, 1, 2) }], 'oxyz', true);
        sc = addGeo3DObject(sc, { id: 'sph1', kind: 'solid', rule: 'solid_sphere', solidType: 'sphere', center: v3(1, 1, 2), params: { r: 2 }, label: '(S)', style: { color: '#0284C7', opacity: 0.18, isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'plP', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 2, c: 2, d: -1 }, label: '(P)', style: { color: '#D97706', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_pplane' }, description: 'Đo khoảng cách từ tâm I tới (P).' }],
      hints: ['d(I, (P)) = |1 + 2 + 4 − 1| / √(1+4+4) = 6/3 = 2 = R ⇒ tiếp xúc.', 'Chọn Khoảng cách điểm – mặt phẳng.', 'Nhấp tâm I rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Đo khoảng cách từ I tới (P).', mathExplanation: 'd(I, (P)) = 2 = R nên (P) tiếp xúc (S).', addInput: { id: 'sol_m', kind: 'measurement', rule: 'measure_distance_pplane', parents: ['I', 'plP'], label: 'd(I,(P))', metricKind: 'distance' } }],
      proof: 'Vì $d(I, (P)) = \\frac{|1+2+4-1|}{3} = 2 = R$ nên $(P)$ tiếp xúc với mặt cầu $(S)$.',
    },
    {
      levelId: 18, order: 10, curriculumTag: 'Toán 12',
      knowledgeTopic: 'Bài toán tổng hợp Oxyz: Mặt cầu ngoại tiếp tứ diện vuông OABC',
      title: 'Tổng hợp Oxyz: Dựng tâm I và mặt cầu ngoại tiếp tứ diện vuông OABC',
      description: 'Cho tứ diện vuông $OABC$ với $O(0;0;0), A(2;0;0), B(0;2;0), C(0;0;2)$. Hãy dựng tâm mặt cầu ngoại tiếp $I(1; 1; 1)$ và mặt cầu ngoại tiếp tâm $I$, bán kính $R = \\sqrt{3} \\approx 1{,}73$.',
      hypothesis: 'Bốn đỉnh $O, A, B, C$ trên các trục tọa độ.',
      goal: 'Dựng tâm $I(1; 1; 1)$ và mặt cầu ngoại tiếp bán kính $R = \\sqrt{3}$.',
      setup: () => givenPointsScene([
        { id: 'O', label: 'O', pos: v3(0, 0, 0) }, { id: 'A', label: 'A', pos: v3(2, 0, 0) },
        { id: 'B', label: 'B', pos: v3(0, 2, 0) }, { id: 'C', label: 'C', pos: v3(0, 0, 2) },
      ], 'oxyz', true),
      rules: [
        { type: 'has_point_at_coords', refs: [], params: { x: 1, y: 1, z: 1 }, description: 'Dựng tâm I(1; 1; 1).' },
        { type: 'has_sphere_center_radius', refs: [], params: { cx: 1, cy: 1, cz: 1, r: Math.sqrt(3) }, description: 'Dựng mặt cầu ngoại tiếp tâm I(1;1;1), R = √3 ≈ 1,73.' },
      ],
      hints: ['Với tứ diện vuông OABC cạnh a=2, b=2, c=2, tâm ngoại tiếp I(a/2; b/2; c/2) = (1; 1; 1).', 'Bán kính R = √(a² + b² + c²)/2 = √12/2 = √3 ≈ 1,73.', 'Bước 1: Điểm theo tọa độ(1; 1; 1). Bước 2: Mặt cầu tâm (1; 1; 1), R = 1,73.'],
      steps: [
        { id: 's1', actionText: 'Tạo tâm I(1; 1; 1).', mathExplanation: 'I = (a/2; b/2; c/2) = (1; 1; 1).', addInput: { id: 'sol_i', kind: 'point', rule: 'point_coords', position: v3(1, 1, 1), label: 'I' } },
        { id: 's2', actionText: 'Tạo mặt cầu tâm I(1; 1; 1), bán kính R = 1,73.', mathExplanation: 'R = √(1² + 1² + 1²) = √3 ≈ 1,73.', addInput: { id: 'sol_s', kind: 'solid', rule: 'solid_sphere', solidType: 'sphere', center: v3(1, 1, 1), params: { r: Number(Math.sqrt(3).toFixed(3)) }, label: '(S)' } },
      ],
      proof: 'Tâm mặt cầu ngoại tiếp tứ diện vuông $OABC$ là $I\\left(\\frac{a}{2}; \\frac{b}{2}; \\frac{c}{2}\\right) = (1; 1; 1)$ và $R = OI = \\sqrt{3}$.',
    },
  ];

  return specs.map(makeChallenge3D);
}
