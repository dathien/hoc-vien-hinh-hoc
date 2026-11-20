import { addGeo3DObject, createEmptyScene3D } from './engine3d';
import { v3 } from './math3d';
import type { Challenge3DDefinition } from './validator3d';
import {
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

export function buildLevels11To13(): Challenge3DDefinition[] {
  const specs: Parameters<typeof makeChallenge3D>[0][] = [
    // =========================================================================
    // CẤP ĐỘ XI: GÓC TRONG KHÔNG GIAN (10 thử thách — Toán 11)
    // =========================================================================
    {
      levelId: 11, order: 1, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Góc giữa đường thẳng và mặt phẳng',
      title: 'Đo góc giữa cạnh bên SB và mặt phẳng đáy (ABCD)',
      description: 'Cho hình chóp $S.ABCD$ có $SA \\perp (ABCD)$ và mặt đáy $(ABCD)$. Hãy đo góc giữa $SB$ và $(ABCD)$.',
      hypothesis: 'Hình chóp $S.ABCD$ ($SA \\perp (ABCD)$) với đáy $(ABCD)$.',
      goal: 'Đo góc giữa đường thẳng $SB$ và mặt phẳng $(ABCD)$.',
      setup: () => buildPyramidABCDScene({ saPerpBase: true, withBasePlane: true }),
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_line_plane' }, description: 'Đo góc giữa SB và (ABCD).' }],
      hints: ['Hình chiếu của SB trên (ABCD) là AB nên góc là ∠SBA.', 'Chọn Góc đường thẳng – mặt phẳng.', 'Nhấp cạnh SB rồi mặt phẳng (ABCD).'],
      steps: [{ id: 's1', actionText: 'Đo góc giữa SB và (ABCD).', mathExplanation: 'Góc bằng ∠SBA.', addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_line_plane', parents: ['eSB', 'plABCD'], label: '∠(SB,(ABCD))', metricKind: 'angle' } }],
      proof: 'Hình chiếu vuông góc của $SB$ trên $(ABCD)$ là $AB$ nên $(SB, (ABCD)) = \\widehat{SBA}$.',
    },
    {
      levelId: 11, order: 2, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Góc giữa hai mặt phẳng cắt nhau',
      title: 'Đo góc giữa mặt bên (SBC) và mặt phẳng đáy (ABCD)',
      description: 'Cho hình chóp đều $S.ABCD$ với $(ABCD)$ và $(SBC)$. Hãy đo góc giữa hai mặt phẳng $(SBC)$ và $(ABCD)$.',
      hypothesis: 'Hình chóp đều $S.ABCD$ có $(ABCD)$ và $(SBC)$.',
      goal: 'Đo góc giữa hai mặt phẳng $(SBC)$ và $(ABCD)$.',
      setup: () => addGivenPlane3(buildPyramidABCDScene({ withBasePlane: true }), 'plSBC', 'S', 'B', 'C', '(SBC)', '#0284C7', 0.14),
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_planes' }, description: 'Đo góc giữa (SBC) và (ABCD).' }],
      hints: ['Góc giữa hai mặt phẳng thuộc [0°; 90°].', 'Chọn Góc giữa 2 mặt phẳng.', 'Nhấp (SBC) rồi (ABCD).'],
      steps: [{ id: 's1', actionText: 'Đo góc giữa (SBC) và (ABCD).', mathExplanation: 'Góc giữa hai mặt phẳng bằng góc giữa hai pháp tuyến.', addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_planes', parents: ['plSBC', 'plABCD'], label: '∠((SBC),(ABCD))', metricKind: 'angle' } }],
      proof: 'Gọi $M$ là trung điểm $BC$, $O$ là tâm đáy thì $((SBC), (ABCD)) = \\widehat{SMO}$.',
    },
    {
      levelId: 11, order: 3, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Góc phẳng nhị diện [S, BC, A]',
      title: 'Đo góc nhị diện [S, BC, A] trong hình chóp',
      description: 'Cho hình chóp $S.ABCD$ có $SA \\perp (ABCD)$. Hãy đo góc nhị diện $[S, BC, A]$.',
      hypothesis: 'Hình chóp $S.ABCD$ với $S, B, C, A$.',
      goal: 'Đo góc nhị diện $[S, BC, A]$.',
      setup: () => buildPyramidABCDScene({ saPerpBase: true }),
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_dihedral_angle' }, description: 'Đo góc nhị diện [S, BC, A].' }],
      hints: ['Góc nhị diện [P, AB, Q] chọn lần lượt 4 điểm P, A, B, Q.', 'Chọn Góc nhị diện.', 'Nhấp lần lượt S, B, C, A.'],
      steps: [{ id: 's1', actionText: 'Đo góc nhị diện [S, BC, A].', mathExplanation: 'Góc phẳng nhị diện bằng ∠SBA.', addInput: { id: 'sol_d', kind: 'measurement', rule: 'measure_dihedral_angle', parents: ['S', 'B', 'C', 'A'], label: '[S,BC,A]', metricKind: 'angle' } }],
      proof: 'Vì $BC \\perp AB$ và $BC \\perp SB$ nên góc nhị diện $[S, BC, A]$ bằng $\\widehat{SBA}$.',
    },
    {
      levelId: 11, order: 4, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Góc giữa hai đường thẳng chéo nhau trong lập phương',
      title: "Đo góc giữa hai đường chéo mặt A'B và B'C (60°)",
      description: "Cho hình lập phương $ABCD.A'B'C'D'$. Hãy nối hai đường chéo mặt $A'B$ và $B'C$, rồi đo góc giữa chúng.",
      hypothesis: "Hình lập phương $ABCD.A'B'C'D'$.",
      goal: "Nối $A'B, B'C$ và đo góc giữa chúng.",
      setup: () => buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2 }),
      rules: [
        { type: 'has_segment_between', refs: ['A1', 'B'], description: "Nối đoạn A'B." },
        { type: 'has_segment_between', refs: ['B1', 'C'], description: "Nối đoạn B'C." },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_lines' }, description: "Đo góc giữa A'B và B'C." },
      ],
      hints: ["B'C ∥ A'D và ΔA'BD đều nên góc bằng 60°.", "Nối A'B, B'C rồi dùng Góc 2 đường thẳng.", "Bước 1: Đoạn(A', B). Bước 2: Đoạn(B', C). Bước 3: Góc 2 đường(A'B, B'C)."],
      steps: [
        { id: 's1', actionText: "Nối đoạn A'B.", mathExplanation: "Đường chéo mặt ABB'A'.", addInput: { id: 'sol_1', kind: 'segment', rule: 'segment_3d', parents: ['A1', 'B'], label: "A'B" } },
        { id: 's2', actionText: "Nối đoạn B'C.", mathExplanation: "Đường chéo mặt BCC'B'.", addInput: { id: 'sol_2', kind: 'segment', rule: 'segment_3d', parents: ['B1', 'C'], label: "B'C" } },
        { id: 's3', actionText: "Đo góc giữa A'B và B'C.", mathExplanation: "Góc bằng 60°.", addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_lines', parents: ['sol_1', 'sol_2'], label: "∠(A'B,B'C)", metricKind: 'angle' } },
      ],
      proof: "Do $B'C \\parallel A'D$ và $\\triangle A'BD$ đều nên $(A'B, B'C) = 60^\\circ$.",
    },
    {
      levelId: 11, order: 5, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Góc giữa đường chéo lập phương và mặt đáy',
      title: "Nối và đo góc giữa đường chéo AC' với mặt đáy (ABCD)",
      description: "Cho hình lập phương $ABCD.A'B'C'D'$ có đáy $(ABCD)$. Hãy nối đường chéo $AC'$ và đo góc giữa $AC'$ và $(ABCD)$.",
      hypothesis: "Hình lập phương và mặt đáy $(ABCD)$.",
      goal: "Nối $AC'$ và đo góc $(AC', (ABCD))$.",
      setup: () => buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2, withBasePlane: true }),
      rules: [
        { type: 'has_segment_between', refs: ['A', 'C1'], description: "Nối đường chéo AC'." },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_line_plane' }, description: "Đo góc giữa AC' và (ABCD)." },
      ],
      hints: ["Hình chiếu của AC' lên (ABCD) là AC, tan φ = 1/√2 ≈ 35,3°.", "Nối AC' rồi chọn Góc đường thẳng – mặt phẳng.", "Bước 1: Đoạn(A, C'). Bước 2: Góc đường – mặt(AC', (ABCD))."],
      steps: [
        { id: 's1', actionText: "Nối đường chéo AC'.", mathExplanation: "Đường chéo chính của hình lập phương.", addInput: { id: 'sol_ac1', kind: 'segment', rule: 'segment_3d', parents: ['A', 'C1'], label: "AC'" } },
        { id: 's2', actionText: "Đo góc giữa AC' và (ABCD).", mathExplanation: "Góc ≈ 35,3°.", addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_line_plane', parents: ['sol_ac1', 'plBase'], label: "∠(AC',(ABCD))", metricKind: 'angle' } },
      ],
      proof: "Vì $C'C \\perp (ABCD)$ nên $(AC', (ABCD)) = \\widehat{C'AC} = \\arctan(1/\\sqrt{2})$.",
    },
    {
      levelId: 11, order: 6, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Xác định góc giữa cạnh bên và đáy của tứ diện bất kỳ',
      title: 'Dựng hình chiếu H và đo góc giữa SC và mặt đáy (ABC)',
      description: 'Cho tứ diện $S.ABC$ có đáy $(ABC)$. Hãy dựng hình chiếu $H$ của $S$ lên $(ABC)$ và đo góc giữa $SC$ và $(ABC)$.',
      hypothesis: 'Tứ diện $S.ABC$ với đáy $(ABC)$.',
      goal: 'Dựng $H$ trên $(ABC)$ và đo góc $(SC, (ABC))$.',
      setup: () => buildTetrahedronScene({ withBasePlane: true }),
      rules: [
        { type: 'has_foot_on_plane', refs: ['S', 'plABC'], description: 'Dựng hình chiếu H của S lên (ABC).' },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_line_plane' }, description: 'Đo góc giữa SC và (ABC).' },
      ],
      perturb: ['S'],
      hints: ['Góc giữa SC và (ABC) bằng góc giữa SC và hình chiếu HC.', 'Dùng Hình chiếu lên mặt phẳng(S, (ABC)) và Góc đường – mặt(SC, (ABC)).', 'Bước 1: Hình chiếu(S, (ABC)). Bước 2: Góc đường – mặt(SC, (ABC)).'],
      steps: [
        { id: 's1', actionText: 'Dựng hình chiếu H của S lên (ABC).', mathExplanation: 'HC là hình chiếu của SC.', addInput: { id: 'sol_h', kind: 'point', rule: 'foot_point_plane', parents: ['S', 'plABC'], label: 'H' } },
        { id: 's2', actionText: 'Đo góc giữa SC và (ABC).', mathExplanation: '∠(SC, (ABC)) = ∠SCH.', addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_line_plane', parents: ['eSC', 'plABC'], label: '∠(SC,(ABC))', metricKind: 'angle' } },
      ],
      proof: 'Hình chiếu của $SC$ lên $(ABC)$ là $HC$ nên $(SC, (ABC)) = \\widehat{SCH}$.',
    },
    {
      levelId: 11, order: 7, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Góc nhị diện giữa hai mặt của tứ diện đều',
      title: 'Đo góc nhị diện [S, BC, A] trong tứ diện đều',
      description: 'Cho tứ diện đều $S.ABC$. Hãy đo góc nhị diện $[S, BC, A]$ giữa $(SBC)$ và $(ABC)$ ($\\arccos(1/3) \\approx 70{,}5^\\circ$).',
      hypothesis: 'Tứ diện đều $S.ABC$.',
      goal: 'Đo góc nhị diện $[S, BC, A]$.',
      setup: () => {
        const a = 4; const R = a / Math.sqrt(3); const h = a * Math.sqrt(2 / 3);
        return buildTetrahedronScene({ aPos: v3(R, 0, 0), bPos: v3(-R / 2, a / 2, 0), cPos: v3(-R / 2, -a / 2, 0), sPos: v3(0, 0, h) });
      },
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_dihedral_angle' }, description: 'Đo góc nhị diện [S, BC, A].' }],
      hints: ['Góc nhị diện tứ diện đều có cos φ = 1/3 ≈ 70,5°.', 'Chọn công cụ Góc nhị diện.', 'Nhấp lần lượt S, B, C, A.'],
      steps: [{ id: 's1', actionText: 'Đo góc nhị diện [S, BC, A].', mathExplanation: 'φ = arccos(1/3) ≈ 70,5°.', addInput: { id: 'sol_d', kind: 'measurement', rule: 'measure_dihedral_angle', parents: ['S', 'B', 'C', 'A'], label: '[S,BC,A]', metricKind: 'angle' } }],
      proof: 'Cosin góc nhị diện giữa hai mặt bất kỳ của tứ diện đều bằng $\\frac{1}{3}$.',
    },
    {
      levelId: 11, order: 8, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Góc giữa mặt phẳng chéo và đáy lăng trụ đứng',
      title: "Dựng mặt phẳng (A'BC) và đo góc với mặt đáy (ABC)",
      description: "Cho lăng trụ đứng $ABC.A'B'C'$ có đáy $(ABC)$. Hãy dựng mặt phẳng $(A'BC)$ và đo góc giữa $(A'BC)$ và $(ABC)$.",
      hypothesis: "Lăng trụ đứng $ABC.A'B'C'$ và đáy $(ABC)$.",
      goal: "Dựng $(A'BC)$ và đo góc $((A'BC), (ABC))$.",
      setup: () => buildTriPrismScene({ right: true, withBasePlane: true }),
      rules: [
        { type: 'has_plane_through_points', refs: ['A1', 'B', 'C'], description: "Dựng (A'BC)." },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_planes' }, description: "Đo góc ((A'BC), (ABC))." },
      ],
      hints: ["Dựng (A'BC) bằng Mặt phẳng qua 3 điểm rồi đo góc 2 mặt phẳng.", "Chọn Mặt phẳng qua 3 điểm(A', B, C) → Góc 2 mặt phẳng.", "Bước 1: Mặt phẳng(A', B, C). Bước 2: Góc 2 mặt phẳng((A'BC), (ABC))."],
      steps: [
        { id: 's1', actionText: "Dựng mặt phẳng (A'BC).", mathExplanation: "Mặt phẳng đi qua A', B, C.", addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['A1', 'B', 'C'], label: "(A'BC)" } },
        { id: 's2', actionText: "Đo góc giữa (A'BC) và (ABC).", mathExplanation: "Góc được tính từ hai pháp tuyến.", addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_planes', parents: ['sol_pl', 'plABC'], label: "∠((A'BC),(ABC))", metricKind: 'angle' } },
      ],
      proof: "Kẻ $AH \\perp BC$ thì $A'H \\perp BC$, suy ra $((A'BC), (ABC)) = \\widehat{A'HA}$.",
    },
    {
      levelId: 11, order: 9, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Góc giữa cạnh bên và mặt bên hình chóp',
      title: 'Đo góc giữa cạnh bên SC và mặt phẳng (SAB)',
      description: 'Cho hình chóp $S.ABCD$ đáy vuông có $SA \\perp (ABCD)$ và $(SAB)$. Hãy đo góc giữa $SC$ và $(SAB)$.',
      hypothesis: 'Hình chóp $S.ABCD$ ($SA \\perp (ABCD)$) và $(SAB)$.',
      goal: 'Đo góc giữa $SC$ và $(SAB)$.',
      setup: () => addGivenPlane3(buildPyramidABCDScene({ saPerpBase: true }), 'plSAB', 'S', 'A', 'B', '(SAB)', '#0F766E', 0.14),
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_line_plane' }, description: 'Đo góc giữa SC và (SAB).' }],
      hints: ['Vì BC ⊥ (SAB) nên hình chiếu của SC là SB.', 'Chọn Góc đường thẳng – mặt phẳng.', 'Nhấp cạnh SC rồi mặt phẳng (SAB).'],
      steps: [{ id: 's1', actionText: 'Đo góc giữa SC và (SAB).', mathExplanation: '∠(SC, (SAB)) = ∠BSC.', addInput: { id: 'sol_a', kind: 'measurement', rule: 'measure_angle_line_plane', parents: ['eSC', 'plSAB'], label: '∠(SC,(SAB))', metricKind: 'angle' } }],
      proof: 'Do $BC \\perp (SAB)$ nên hình chiếu của $SC$ lên $(SAB)$ là $SB$, góc cần tìm là $\\widehat{BSC}$.',
    },
    {
      levelId: 11, order: 10, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tổng hợp góc nhị diện giữa hai mặt bên kề nhau của hình chóp đều',
      title: 'Dựng mặt bên (SAB) và đo góc nhị diện [A, SB, C]',
      description: 'Cho hình chóp đều $S.ABCD$. Hãy dựng mặt phẳng $(SAB)$ và đo góc nhị diện $[A, SB, C]$ giữa hai mặt bên kề nhau.',
      hypothesis: 'Hình chóp đều $S.ABCD$.',
      goal: 'Dựng $(SAB)$ và đo góc nhị diện $[A, SB, C]$.',
      setup: () => buildPyramidABCDScene(),
      rules: [
        { type: 'has_plane_through_points', refs: ['S', 'A', 'B'], description: 'Dựng mặt phẳng (SAB).' },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_dihedral_angle' }, description: 'Đo góc nhị diện [A, SB, C].' },
      ],
      hints: ['Cạnh chung của (SAB) và (SBC) là SB.', 'Dựng (SAB) rồi đo góc nhị diện với 4 điểm A, S, B, C.', 'Bước 1: Mặt phẳng(S, A, B). Bước 2: Góc nhị diện(A, S, B, C).'],
      steps: [
        { id: 's1', actionText: 'Dựng mặt phẳng (SAB).', mathExplanation: 'Mặt bên thứ nhất.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['S', 'A', 'B'], label: '(SAB)' } },
        { id: 's2', actionText: 'Đo góc nhị diện [A, SB, C].', mathExplanation: 'Góc phẳng nhị diện giữa hai mặt bên kề nhau.', addInput: { id: 'sol_d', kind: 'measurement', rule: 'measure_dihedral_angle', parents: ['A', 'S', 'B', 'C'], label: '[A,SB,C]', metricKind: 'angle' } },
      ],
      proof: 'Hai đường cao $AH, CH$ cùng vuông góc cạnh chung $SB$ tạo thành góc phẳng nhị diện $\\widehat{AHC}$.',
    },

    // =========================================================================
    // CẤP ĐỘ XII: KHOẢNG CÁCH TRONG KHÔNG GIAN (10 thử thách — Toán 11)
    // =========================================================================
    {
      levelId: 12, order: 1, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Khoảng cách từ điểm đến đường thẳng',
      title: 'Đo khoảng cách từ điểm M đến đường thẳng d',
      description: 'Cho đường thẳng $d$ và điểm $M \\notin d$. Hãy đo khoảng cách $d(M, d)$.',
      hypothesis: 'Đường thẳng $d = AB$ và điểm $M \\notin d$.',
      goal: 'Đo khoảng cách $d(M, d)$.',
      setup: () => addGivenLine(givenPointsScene([{ id: 'A', label: 'A', pos: v3(-2.5, -1, 0) }, { id: 'B', label: 'B', pos: v3(2.5, 1, 0) }, { id: 'M', label: 'M', pos: v3(0, 1.5, 3) }]), 'ld', 'A', 'B', 'd'),
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_pl' }, description: 'Đo khoảng cách từ M đến d.' }],
      perturb: ['A', 'B', 'M'],
      hints: ['d(M, d) bằng độ dài đoạn vuông góc MH.', 'Chọn Khoảng cách điểm – đường thẳng.', 'Nhấp điểm M rồi đường thẳng d.'],
      steps: [{ id: 's1', actionText: 'Đo khoảng cách từ M đến d.', mathExplanation: 'd(M, d) = MH.', addInput: { id: 'sol_m', kind: 'measurement', rule: 'measure_distance_pl', parents: ['M', 'ld'], label: 'd(M,d)', metricKind: 'distance' } }],
      proof: 'Khoảng cách $d(M, d)$ bằng độ dài đoạn vuông góc hạ từ $M$ xuống $d$.',
    },
    {
      levelId: 12, order: 2, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Khoảng cách từ điểm đến mặt phẳng',
      title: 'Đo khoảng cách từ đỉnh S đến mặt đáy (ABC)',
      description: 'Cho tứ diện $S.ABC$ có đáy $(ABC)$. Hãy đo chiều cao $h = d(S, (ABC))$.',
      hypothesis: 'Tứ diện $S.ABC$ và đáy $(ABC)$.',
      goal: 'Đo khoảng cách $d(S, (ABC))$.',
      setup: () => buildTetrahedronScene({ withBasePlane: true }),
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_pplane' }, description: 'Đo d(S, (ABC)).' }],
      perturb: ['S'],
      hints: ['Chiều cao hình chóp là khoảng cách từ S đến đáy.', 'Chọn Khoảng cách điểm – mặt phẳng.', 'Nhấp S rồi (ABC).'],
      steps: [{ id: 's1', actionText: 'Đo khoảng cách từ S đến (ABC).', mathExplanation: 'h = d(S, (ABC)).', addInput: { id: 'sol_m', kind: 'measurement', rule: 'measure_distance_pplane', parents: ['S', 'plABC'], label: 'd(S,(ABC))', metricKind: 'distance' } }],
      proof: 'Khoảng cách từ $S$ tới $(ABC)$ là độ dài đoạn đường cao $SH$.',
    },
    {
      levelId: 12, order: 3, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Khoảng cách giữa hai mặt phẳng song song',
      title: 'Đo khoảng cách giữa hai đáy của hình hộp chữ nhật',
      description: "Cho hình hộp chữ nhật $ABCD.A'B'C'D'$ có hai đáy song song $(ABCD)$ và $(A'B'C'D')$. Hãy đo khoảng cách giữa chúng.",
      hypothesis: "Hai đáy song song $(ABCD)$ và $(A'B'C'D')$.",
      goal: "Đo $d((ABCD), (A'B'C'D'))$.",
      setup: () => buildBoxVerticesScene({ lx: 3.6, ly: 2.8, lz: 3.4, withBasePlane: true, withTopPlane: true }),
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_planes' }, description: "Đo d((ABCD), (A'B'C'D'))." }],
      hints: ['Khoảng cách hai mặt song song bằng chiều cao hình hộp.', 'Chọn Khoảng cách hai mặt phẳng song song.', "Nhấp (ABCD) rồi (A'B'C'D')."],
      steps: [{ id: 's1', actionText: "Đo khoảng cách giữa (ABCD) và (A'B'C'D').", mathExplanation: 'Khoảng cách bằng 3,4.', addInput: { id: 'sol_m', kind: 'measurement', rule: 'measure_distance_planes', parents: ['plBase', 'plTop'], label: 'd((P),(Q))', metricKind: 'distance' } }],
      proof: "Khoảng cách giữa hai đáy hình hộp chữ nhật bằng độ dài cạnh bên $AA' = 3{,}4$.",
    },
    {
      levelId: 12, order: 4, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Khoảng cách giữa hai đường thẳng chéo nhau',
      title: "Đo khoảng cách giữa hai cạnh chéo nhau AB và CC' trong lập phương",
      description: "Cho hình lập phương $ABCD.A'B'C'D'$. Hãy đo khoảng cách giữa hai đường thẳng chéo nhau $AB$ và $CC'$.",
      hypothesis: "Hình lập phương cạnh $3{,}2$.",
      goal: "Đo $d(AB, CC')$.",
      setup: () => buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2 }),
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_skew' }, description: "Đo d(AB, CC')." }],
      hints: ["BC là đoạn vuông góc chung nên d(AB, CC') = BC = 3,2.", 'Chọn Khoảng cách 2 đường chéo nhau.', "Nhấp AB rồi CC'."],
      steps: [{ id: 's1', actionText: "Đo khoảng cách giữa AB và CC'.", mathExplanation: "d(AB, CC') = 3,2.", addInput: { id: 'sol_m', kind: 'measurement', rule: 'measure_distance_skew', parents: ['eAB', 'eCC1'], label: "d(AB,CC')", metricKind: 'distance' } }],
      proof: "Vì $BC \\perp AB$ và $BC \\perp CC'$ nên $d(AB, CC') = BC = 3{,}2$.",
    },
    {
      levelId: 12, order: 5, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Khoảng cách từ chân đường cao tới mặt bên',
      title: 'Dựng hình chiếu H và đo khoảng cách từ A tới mặt phẳng (SCD)',
      description: 'Cho hình chóp $S.ABCD$ đáy vuông có $SA \\perp (ABCD)$ và $(SCD)$. Hãy dựng hình chiếu $H$ của $A$ lên $(SCD)$ và đo $d(A, (SCD))$.',
      hypothesis: 'Hình chóp $S.ABCD$ ($SA \\perp (ABCD)$) và $(SCD)$.',
      goal: 'Dựng $H$ trên $(SCD)$ và đo $d(A, (SCD))$.',
      setup: () => addGivenPlane3(buildPyramidABCDScene({ saPerpBase: true }), 'plSCD', 'S', 'C', 'D', '(SCD)', '#D97706', 0.14),
      rules: [
        { type: 'has_foot_on_plane', refs: ['A', 'plSCD'], description: 'Dựng hình chiếu H của A trên (SCD).' },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_pplane' }, description: 'Đo d(A, (SCD)).' },
      ],
      hints: ['CD ⊥ (SAD) nên đường cao AH của ΔSAD vuông góc (SCD).', 'Dùng Hình chiếu lên mặt phẳng và Khoảng cách điểm – mặt phẳng.', 'Bước 1: Hình chiếu(A, (SCD)). Bước 2: Khoảng cách điểm – mặt phẳng(A, (SCD)).'],
      steps: [
        { id: 's1', actionText: 'Dựng hình chiếu H của A lên (SCD).', mathExplanation: 'H ∈ SD và AH ⊥ (SCD).', addInput: { id: 'sol_h', kind: 'point', rule: 'foot_point_plane', parents: ['A', 'plSCD'], label: 'H' } },
        { id: 's2', actionText: 'Đo khoảng cách từ A tới (SCD).', mathExplanation: 'd(A, (SCD)) = AH.', addInput: { id: 'sol_d', kind: 'measurement', rule: 'measure_distance_pplane', parents: ['A', 'plSCD'], label: 'd(A,(SCD))', metricKind: 'distance' } },
      ],
      proof: 'Vì $CD \\perp (SAD)$ nên $AH \\perp SD \\Rightarrow AH \\perp (SCD)$ và $d(A, (SCD)) = AH$.',
    },
    {
      levelId: 12, order: 6, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Khoảng cách từ đường thẳng song song đến mặt phẳng',
      title: 'Đo khoảng cách từ cạnh AB song song tới mặt phẳng (SCD)',
      description: 'Cho hình chóp $S.ABCD$ đáy vuông có $AB \\parallel (SCD)$. Hãy đo khoảng cách từ điểm $A$ đến $(SCD)$ để xác định $d(AB, (SCD))$.',
      hypothesis: 'Hình chóp $S.ABCD$ với $AB \\parallel (SCD)$.',
      goal: 'Đo $d(A, (SCD)) = d(AB, (SCD))$.',
      setup: () => addGivenPlane3(buildPyramidABCDScene({ saPerpBase: true }), 'plSCD', 'S', 'C', 'D', '(SCD)', '#0284C7', 0.14),
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_pplane' }, description: 'Đo d(A, (SCD)).' }],
      hints: ['d(AB, (SCD)) = d(A, (SCD)) vì AB ∥ (SCD).', 'Chọn Khoảng cách điểm – mặt phẳng.', 'Nhấp điểm A rồi mặt phẳng (SCD).'],
      steps: [{ id: 's1', actionText: 'Đo khoảng cách từ A tới (SCD).', mathExplanation: 'd(AB, (SCD)) = d(A, (SCD)).', addInput: { id: 'sol_d', kind: 'measurement', rule: 'measure_distance_pplane', parents: ['A', 'plSCD'], label: 'd(AB,(SCD))', metricKind: 'distance' } }],
      proof: 'Do $AB \\parallel CD \\subset (SCD)$ nên $d(AB, (SCD)) = d(A, (SCD))$.',
    },
    {
      levelId: 12, order: 7, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đường vuông góc chung và khoảng cách hai cạnh chéo nhau hình chóp',
      title: 'Dựng đường vuông góc chung và đo khoảng cách giữa SA và BC',
      description: 'Cho hình chóp $S.ABCD$ đáy vuông có $SA \\perp (ABCD)$. Hãy dựng đường vuông góc chung của $SA$ và $BC$ rồi đo $d(SA, BC)$.',
      hypothesis: 'Hình chóp $S.ABCD$ ($SA \\perp (ABCD)$).',
      goal: 'Dựng đường vuông góc chung và đo $d(SA, BC)$.',
      setup: () => buildPyramidABCDScene({ saPerpBase: true }),
      rules: [
        { type: 'has_common_perpendicular', refs: ['eSA', 'eBC'], description: 'Dựng đường vuông góc chung của SA và BC.' },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_skew' }, description: 'Đo d(SA, BC).' },
      ],
      hints: ['AB vuông góc cả SA và BC nên AB là đoạn vuông góc chung.', 'Dùng Đường vuông góc chung(SA, BC) và Khoảng cách 2 đường chéo nhau(SA, BC).', 'Bước 1: Đường vuông góc chung(SA, BC). Bước 2: Khoảng cách 2 đường chéo nhau(SA, BC).'],
      steps: [
        { id: 's1', actionText: 'Dựng đường vuông góc chung của SA và BC.', mathExplanation: 'Trùng đường thẳng AB.', addInput: { id: 'sol_cp', kind: 'line', rule: 'common_perpendicular', parents: ['eSA', 'eBC'], label: 'Δ' } },
        { id: 's2', actionText: 'Đo khoảng cách giữa SA và BC.', mathExplanation: 'd(SA, BC) = AB = 3,6.', addInput: { id: 'sol_d', kind: 'measurement', rule: 'measure_distance_skew', parents: ['eSA', 'eBC'], label: 'd(SA,BC)', metricKind: 'distance' } },
      ],
      proof: 'Vì $AB \\perp SA$ và $AB \\perp BC$ nên $d(SA, BC) = AB$.',
    },
    {
      levelId: 12, order: 8, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Khoảng cách giữa cạnh bên vuông góc đáy và đường chéo đáy',
      title: 'Dựng đường vuông góc chung và đo khoảng cách giữa SA và BD',
      description: 'Cho hình chóp $S.ABCD$ đáy vuông có $SA \\perp (ABCD)$ cùng $BD$. Hãy dựng đường vuông góc chung của $SA, BD$ và đo $d(SA, BD)$.',
      hypothesis: 'Hình chóp $S.ABCD$ ($SA \\perp (ABCD)$) và $BD$.',
      goal: 'Dựng đường vuông góc chung và đo $d(SA, BD)$.',
      setup: () => addGivenSeg(buildPyramidABCDScene({ saPerpBase: true }), 'eBD', 'B', 'D', 'BD', true),
      rules: [
        { type: 'has_common_perpendicular', refs: ['eSA', 'eBD'], description: 'Dựng đường vuông góc chung của SA và BD.' },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_skew' }, description: 'Đo d(SA, BD).' },
      ],
      hints: ['AO vuông góc cả SA và BD nên d(SA, BD) = AO.', 'Dùng Đường vuông góc chung(SA, BD) và Khoảng cách 2 đường chéo nhau.', 'Bước 1: Đường vuông góc chung(SA, BD). Bước 2: Khoảng cách 2 đường chéo nhau(SA, BD).'],
      steps: [
        { id: 's1', actionText: 'Dựng đường vuông góc chung của SA và BD.', mathExplanation: 'Đường thẳng chứa đường chéo AC.', addInput: { id: 'sol_cp', kind: 'line', rule: 'common_perpendicular', parents: ['eSA', 'eBD'], label: 'AO' } },
        { id: 's2', actionText: 'Đo khoảng cách giữa SA và BD.', mathExplanation: 'd(SA, BD) = a√2/2.', addInput: { id: 'sol_d', kind: 'measurement', rule: 'measure_distance_skew', parents: ['eSA', 'eBD'], label: 'd(SA,BD)', metricKind: 'distance' } },
      ],
      proof: 'Với $O = AC \\cap BD$, ta có $AO \\perp SA$ và $AO \\perp BD$ nên $d(SA, BD) = AO$.',
    },
    {
      levelId: 12, order: 9, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Khoảng cách hai đường chéo mặt đáy lập phương',
      title: "Đo khoảng cách giữa BD và A'C' trong hình lập phương",
      description: "Cho hình lập phương $ABCD.A'B'C'D'$ có $BD$ và $A'C'$. Hãy dựng đường vuông góc chung của $BD, A'C'$ và đo $d(BD, A'C')$.",
      hypothesis: "Hình lập phương cùng $BD$ và $A'C'$.",
      goal: "Dựng đường vuông góc chung và đo $d(BD, A'C')$.",
      setup: () => {
        let sc = buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2 });
        sc = addGivenSeg(sc, 'eBD', 'B', 'D', 'BD', true);
        return addGivenSeg(sc, 'eA1C1', 'A1', 'C1', "A'C'");
      },
      rules: [
        { type: 'has_common_perpendicular', refs: ['eBD', 'eA1C1'], description: "Dựng đường vuông góc chung của BD và A'C'." },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_skew' }, description: "Đo d(BD, A'C')." },
      ],
      hints: ["Hai đường thẳng nằm trên hai đáy song song cách nhau đúng một cạnh lập phương.", "Dùng Đường vuông góc chung và Khoảng cách 2 đường chéo nhau.", "Bước 1: Đường vuông góc chung(BD, A'C'). Bước 2: Khoảng cách 2 đường chéo nhau(BD, A'C')."],
      steps: [
        { id: 's1', actionText: "Dựng đường vuông góc chung của BD và A'C'.", mathExplanation: "Trục nối tâm hai đáy OO'.", addInput: { id: 'sol_cp', kind: 'line', rule: 'common_perpendicular', parents: ['eBD', 'eA1C1'], label: "OO'" } },
        { id: 's2', actionText: "Đo khoảng cách giữa BD và A'C'.", mathExplanation: "d(BD, A'C') = 3,2.", addInput: { id: 'sol_d', kind: 'measurement', rule: 'measure_distance_skew', parents: ['eBD', 'eA1C1'], label: "d(BD,A'C')", metricKind: 'distance' } },
      ],
      proof: "Đoạn nối tâm hai đáy $OO'$ là đoạn vuông góc chung của $BD$ và $A'C'$, có độ dài bằng cạnh lập phương.",
    },
    {
      levelId: 12, order: 10, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Quy đổi tỉ số khoảng cách qua trung điểm',
      title: 'Dựng trung điểm M của SA và đo khoảng cách từ M tới (SBC)',
      description: 'Cho hình chóp $S.ABCD$ đáy vuông có $SA \\perp (ABCD)$ và $(SBC)$. Hãy dựng trung điểm $M$ của $SA$ và đo $d(M, (SBC))$.',
      hypothesis: 'Hình chóp $S.ABCD$ ($SA \\perp (ABCD)$) và $(SBC)$.',
      goal: 'Dựng trung điểm $M$ của $SA$ và đo $d(M, (SBC))$.',
      setup: () => addGivenPlane3(buildPyramidABCDScene({ saPerpBase: true }), 'plSBC', 'S', 'B', 'C', '(SBC)', '#0F766E', 0.14),
      rules: [
        { type: 'has_midpoint_of', refs: ['S', 'A'], description: 'Dựng trung điểm M của SA.' },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_pplane' }, description: 'Đo d(M, (SBC)).' },
      ],
      hints: ['M là trung điểm SA nên d(M, (SBC)) = 1/2 d(A, (SBC)).', 'Dùng Trung điểm(S, A) rồi Khoảng cách điểm – mặt phẳng(M, (SBC)).', 'Bước 1: Trung điểm(S, A) → M. Bước 2: Khoảng cách điểm – mặt phẳng(M, (SBC)).'],
      steps: [
        { id: 's1', actionText: 'Dựng trung điểm M của SA.', mathExplanation: 'SM/SA = 1/2.', addInput: { id: 'sol_m', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'A'], label: 'M' } },
        { id: 's2', actionText: 'Đo khoảng cách từ M tới (SBC).', mathExplanation: 'd(M, (SBC)) = 1/2 d(A, (SBC)).', addInput: { id: 'sol_d', kind: 'measurement', rule: 'measure_distance_pplane', parents: ['sol_m', 'plSBC'], label: 'd(M,(SBC))', metricKind: 'distance' } },
      ],
      proof: 'Vì $SA$ cắt $(SBC)$ tại $S$ và $M$ là trung điểm $SA$ nên $d(M, (SBC)) = \\frac{1}{2}d(A, (SBC))$.',
    },

    // =========================================================================
    // CẤP ĐỘ XIII: THIẾT DIỆN VÀ DỰNG HÌNH TỔNG HỢP (10 thử thách — Toán 11)
    // =========================================================================
    {
      levelId: 13, order: 1, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Thiết diện hình vuông của khối lập phương',
      title: 'Dựng thiết diện hình vuông của hình lập phương',
      description: 'Cho hình lập phương cạnh $3{,}4$ và mặt phẳng ngang $(P): z = 1{,}6$. Hãy dựng thiết diện của hình lập phương cắt bởi $(P)$.',
      hypothesis: 'Hình lập phương và mặt phẳng $(P)$ song song đáy.',
      goal: 'Dựng thiết diện 4 đỉnh của khối lập phương.',
      setup: () => {
        let sc = createEmptyScene3D(); sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'cube1', kind: 'solid', rule: 'solid_cube', solidType: 'cube', center: v3(0, 0, 0), params: { a: 3.4 }, label: "Lập phương", style: { color: '#0F766E', opacity: 0.18, isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'plCut', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: -1.6 }, label: '(P)', style: { color: '#D97706', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 4 }, description: 'Dựng thiết diện hình vuông (4 đỉnh).' }],
      hints: ['Mặt phẳng song song đáy cắt lập phương theo thiết diện hình vuông.', 'Chọn công cụ Thiết diện trong nhóm Thiết diện và đo lường.', 'Nhấp khối lập phương rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Dựng thiết diện khối lập phương với (P).', mathExplanation: 'Thiết diện hình vuông cạnh 3,4.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['cube1', 'plCut'], label: 'Thiết diện' } }],
      proof: 'Mặt phẳng song song đáy cắt 4 cạnh bên lập phương tạo thành hình vuông bằng đáy.',
    },
    {
      levelId: 13, order: 2, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Thiết diện tam giác của tứ diện đều',
      title: 'Dựng thiết diện tam giác của khối tứ diện đều',
      description: 'Cho khối tứ diện đều và mặt phẳng cắt $(P)$. Hãy dựng thiết diện tam giác của tứ diện.',
      hypothesis: 'Khối tứ diện đều và mặt phẳng $(P)$.',
      goal: 'Dựng thiết diện 3 đỉnh của tứ diện.',
      setup: () => {
        let sc = createEmptyScene3D(); sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'tet1', kind: 'solid', rule: 'solid_regular_tetrahedron', solidType: 'regular_tetrahedron', center: v3(0, 0, 0), params: { a: 4.2 }, label: 'Tứ diện đều', style: { color: '#0284C7', opacity: 0.18, isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'plCut', kind: 'plane', rule: 'plane_equation', params: { a: 0.2, b: 0.1, c: 1, d: -1.4 }, label: '(P)', style: { color: '#D97706', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 3 }, description: 'Dựng thiết diện tam giác (3 đỉnh).' }],
      hints: ['Mặt phẳng cắt ba cạnh bên tạo thành tam giác.', 'Chọn công cụ Thiết diện.', 'Nhấp khối tứ diện rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Dựng thiết diện tứ diện với (P).', mathExplanation: 'Thiết diện tam giác.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['tet1', 'plCut'], label: 'Thiết diện Δ' } }],
      proof: 'Ba giao tuyến với ba mặt bên của tứ diện khép kín thành thiết diện tam giác.',
    },
    {
      levelId: 13, order: 3, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Thiết diện tứ giác của hình chóp tứ giác đều',
      title: 'Dựng thiết diện tứ giác của khối chóp tứ giác đều',
      description: 'Cho khối chóp tứ giác đều và mặt phẳng nghiêng $(P)$. Hãy dựng thiết diện tứ giác của khối chóp.',
      hypothesis: 'Khối chóp tứ giác đều và mặt phẳng $(P)$.',
      goal: 'Dựng thiết diện 4 đỉnh của khối chóp.',
      setup: () => {
        let sc = createEmptyScene3D(); sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'pyr1', kind: 'solid', rule: 'solid_regular_pyramid', solidType: 'regular_pyramid', center: v3(0, 0, 0), params: { sides: 4, a: 3.8, h: 4.2 }, label: 'Chóp S.ABCD', style: { color: '#7C3AED', opacity: 0.18, isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'plCut', kind: 'plane', rule: 'plane_equation', params: { a: 0.25, b: -0.15, c: 1, d: -1.8 }, label: '(P)', style: { color: '#D97706', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 4 }, description: 'Dựng thiết diện tứ giác (4 đỉnh).' }],
      hints: ['Mặt phẳng cắt cả 4 cạnh bên tạo thành thiết diện tứ giác.', 'Chọn Thiết diện.', 'Nhấp khối chóp rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Dựng thiết diện khối chóp với (P).', mathExplanation: 'Thiết diện tứ giác lồi.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['pyr1', 'plCut'], label: 'Thiết diện' } }],
      proof: 'Bốn giao điểm trên bốn cạnh bên tạo thành thiết diện tứ giác lồi.',
    },
    {
      levelId: 13, order: 4, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Thiết diện ngũ giác của khối lập phương',
      title: 'Dựng thiết diện ngũ giác của hình lập phương',
      description: 'Cho hình lập phương cạnh $3{,}6$ và mặt phẳng nghiêng $(P): x + y + 1{,}4z = 3{,}8$. Hãy dựng thiết diện ngũ giác.',
      hypothesis: 'Hình lập phương và mặt phẳng $(P)$.',
      goal: 'Dựng thiết diện có ít nhất 5 đỉnh.',
      setup: () => {
        let sc = createEmptyScene3D(); sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'cube1', kind: 'solid', rule: 'solid_cube', solidType: 'cube', center: v3(0, 0, 0), params: { a: 3.6 }, label: 'Lập phương', style: { color: '#0F766E', opacity: 0.18, isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'plCut', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 1.4, d: -3.8 }, label: '(P)', style: { color: '#DC2626', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 5 }, description: 'Dựng thiết diện ngũ giác (≥ 5 đỉnh).' }],
      hints: ['Mặt phẳng cắt 5 mặt hình lập phương tạo thành ngũ giác.', 'Chọn Thiết diện.', 'Nhấp khối lập phương rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Dựng thiết diện ngũ giác.', mathExplanation: 'Thiết diện gồm 5 cạnh.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['cube1', 'plCut'], label: 'Thiết diện ngũ giác' } }],
      proof: 'Mặt phẳng $(P)$ cắt 5 mặt lập phương tạo nên thiết diện ngũ giác lồi.',
    },
    {
      levelId: 13, order: 5, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Thiết diện lục giác đều kinh điển của hình lập phương',
      title: 'Dựng thiết diện lục giác đều của khối lập phương',
      description: 'Cho hình lập phương cạnh $3{,}6$ và mặt phẳng chéo $(P): x + y + z = 1{,}8$ đi qua tâm lập phương. Hãy dựng thiết diện lục giác đều.',
      hypothesis: 'Hình lập phương và mặt phẳng $(P)$ qua tâm.',
      goal: 'Dựng thiết diện 6 đỉnh (lục giác đều).',
      setup: () => {
        let sc = createEmptyScene3D(); sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'cube1', kind: 'solid', rule: 'solid_cube', solidType: 'cube', center: v3(0, 0, 0), params: { a: 3.6 }, label: 'Lập phương', style: { color: '#0F766E', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'plHex', kind: 'plane', rule: 'plane_equation', params: { a: 1, b: 1, c: 1, d: -1.8 }, label: '(P)', style: { color: '#D97706', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 6 }, description: 'Dựng thiết diện lục giác đều (6 đỉnh).' }],
      hints: ['Mặt phẳng trung trực đường chéo chính cắt tất cả 6 mặt lập phương tại 6 trung điểm cạnh.', 'Chọn Thiết diện.', 'Nhấp khối lập phương rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Dựng thiết diện lục giác đều.', mathExplanation: '6 đỉnh là trung điểm 6 cạnh lập phương.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['cube1', 'plHex'], label: 'Lục giác đều' } }],
      proof: 'Sáu trung điểm trên 6 cạnh tạo thành lục giác đều cạnh $\\frac{a\\sqrt{2}}{2}$.',
    },
    {
      levelId: 13, order: 6, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Dựng mặt phẳng qua 3 điểm rồi cắt thiết diện hình hộp',
      title: 'Dựng mặt phẳng (MNP) và cắt thiết diện khối hộp chữ nhật',
      description: 'Cho khối hộp chữ nhật và ba điểm $M, N, P$ trên các cạnh bên. Hãy dựng mặt phẳng $(MNP)$ rồi cắt thiết diện của khối hộp.',
      hypothesis: 'Khối hộp chữ nhật cùng ba điểm $M, N, P$.',
      goal: 'Dựng $(MNP)$ và thiết diện của khối hộp.',
      setup: () => {
        let sc = createEmptyScene3D(); sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'box1', kind: 'solid', rule: 'solid_box', solidType: 'box', center: v3(0, 0, 0), params: { a: 4, b: 3, c: 3.2 }, label: 'Hình hộp chữ nhật', style: { color: '#0284C7', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'free_point_3d', position: v3(-2, -1.5, 1.4), label: 'M', style: { color: '#DC2626', isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'N', kind: 'point', rule: 'free_point_3d', position: v3(2, -1.5, 2.2), label: 'N', style: { color: '#DC2626', isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'P', kind: 'point', rule: 'free_point_3d', position: v3(2, 1.5, 1.0), label: 'P', style: { color: '#DC2626', isGiven: true }, skipLog: true }).scene;
      },
      rules: [
        { type: 'has_plane_through_points', refs: ['M', 'N', 'P'], description: 'Dựng mặt phẳng (MNP).' },
        { type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 4 }, description: 'Dựng thiết diện khối hộp với (MNP).' },
      ],
      hints: ['Dựng (MNP) trước, sau đó dùng công cụ Thiết diện.', 'Bước 1: Mặt phẳng qua 3 điểm(M, N, P). Bước 2: Thiết diện(Hình hộp, (MNP)).', 'Nhấp khối hộp và mặt phẳng (MNP).'],
      steps: [
        { id: 's1', actionText: 'Dựng mặt phẳng (MNP).', mathExplanation: 'Xác định mặt phẳng cắt.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['M', 'N', 'P'], label: '(MNP)' } },
        { id: 's2', actionText: 'Dựng thiết diện của khối hộp với (MNP).', mathExplanation: 'Thiết diện là hình bình hành.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['box1', 'sol_pl'], label: 'Thiết diện' } },
      ],
      proof: 'Mặt phẳng $(MNP)$ cắt 4 mặt bên song song từng đôi tạo nên thiết diện hình bình hành.',
    },
    {
      levelId: 13, order: 7, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Thiết diện của khối lăng trụ đứng tam giác',
      title: 'Dựng thiết diện nghiêng của lăng trụ tam giác',
      description: 'Cho khối lăng trụ đứng tam giác và mặt phẳng nghiêng $(P)$. Hãy dựng thiết diện của lăng trụ.',
      hypothesis: 'Khối lăng trụ đứng tam giác và $(P)$.',
      goal: 'Dựng thiết diện tam giác của lăng trụ.',
      setup: () => {
        let sc = createEmptyScene3D(); sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'pr1', kind: 'solid', rule: 'solid_right_prism', solidType: 'right_prism', center: v3(0, 0, 0), params: { sides: 3, a: 3.6, h: 4 }, label: "Lăng trụ", style: { color: '#059669', opacity: 0.18, isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'plCut', kind: 'plane', rule: 'plane_equation', params: { a: 0.35, b: 0.2, c: 1, d: -2.0 }, label: '(P)', style: { color: '#D97706', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 3 }, description: 'Dựng thiết diện của lăng trụ.' }],
      hints: ['Mặt phẳng cắt cả ba cạnh bên tạo thành thiết diện tam giác.', 'Chọn Thiết diện.', 'Nhấp lăng trụ rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Dựng thiết diện của lăng trụ với (P).', mathExplanation: 'Thiết diện tam giác có S_đáy = S_td · cos φ.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['pr1', 'plCut'], label: 'Thiết diện' } }],
      proof: 'Diện tích hình chiếu đáy liên hệ diện tích thiết diện theo $S_{\\text{đáy}} = S_{\\text{td}} \\cos\\varphi$.',
    },
    {
      levelId: 13, order: 8, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Thiết diện song song đáy của hình chóp',
      title: 'Dựng mặt phẳng qua M song song đáy và cắt thiết diện chóp',
      description: 'Cho khối chóp tứ giác đều, mặt phẳng đáy $(ABCD)$ và điểm $M$ ở giữa cạnh bên. Hãy dựng mặt phẳng $(Q)$ qua $M$ song song đáy rồi cắt thiết diện.',
      hypothesis: 'Khối chóp, đáy $(ABCD)$ và điểm $M$.',
      goal: 'Dựng $(Q) \\parallel (ABCD)$ qua $M$ và thiết diện hình vuông.',
      setup: () => {
        let sc = createEmptyScene3D(); sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'pyr1', kind: 'solid', rule: 'solid_regular_pyramid', solidType: 'regular_pyramid', center: v3(0, 0, 0), params: { sides: 4, a: 4, h: 4 }, label: 'Chóp S.ABCD', style: { color: '#7C3AED', opacity: 0.18, isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'plOxy', kind: 'plane', rule: 'plane_equation', params: { a: 0, b: 0, c: 1, d: 0 }, label: '(ABCD)', style: { color: '#0F766E', opacity: 0.12, isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'free_point_3d', position: v3(-1, -1, 2), label: 'M', style: { color: '#DC2626', isGiven: true }, skipLog: true }).scene;
      },
      rules: [
        { type: 'has_plane_parallel_to_through', refs: ['M', 'plOxy'], description: 'Dựng mặt phẳng (Q) qua M song song đáy.' },
        { type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 4 }, description: 'Dựng thiết diện hình vuông.' },
      ],
      hints: ['Dựng (Q) qua M song song (ABCD), rồi dùng Thiết diện.', 'Bước 1: Mặt phẳng song song(M, (ABCD)) → (Q). Bước 2: Thiết diện(Chóp, (Q)).', 'Nhấp chóp và mặt phẳng (Q).'],
      steps: [
        { id: 's1', actionText: 'Dựng mặt phẳng (Q) qua M song song đáy.', mathExplanation: '(Q) cắt 4 cạnh bên tại trung điểm.', addInput: { id: 'sol_q', kind: 'plane', rule: 'plane_parallel_point', parents: ['M', 'plOxy'], label: '(Q)' } },
        { id: 's2', actionText: 'Dựng thiết diện của khối chóp với (Q).', mathExplanation: 'Thiết diện hình vuông diện tích bằng 1/4 đáy.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['pyr1', 'sol_q'], label: 'Thiết diện' } },
      ],
      proof: 'Thiết diện song song đáy đồng dạng với đáy theo tỉ số $k = 1/2$ nên diện tích bằng $1/4$ đáy.',
    },
    {
      levelId: 13, order: 9, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Thiết diện elip của khối trụ tròn xoay',
      title: 'Dựng thiết diện elip của khối trụ tròn xoay',
      description: 'Cho khối trụ đứng và mặt phẳng nghiêng $(P)$ cắt trục khối trụ. Hãy dựng thiết diện elip của khối trụ.',
      hypothesis: 'Khối trụ và mặt phẳng nghiêng $(P)$.',
      goal: 'Dựng thiết diện elip.',
      setup: () => {
        let sc = createEmptyScene3D(); sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'cyl1', kind: 'solid', rule: 'solid_cylinder', solidType: 'cylinder', center: v3(0, 0, 0), params: { r: 1.8, h: 4.4 }, label: 'Khối trụ', style: { color: '#0284C7', opacity: 0.2, isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'plCut', kind: 'plane', rule: 'plane_equation', params: { a: 0.45, b: 0, c: 1, d: -2.2 }, label: '(P)', style: { color: '#D97706', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 8 }, description: 'Dựng thiết diện elip của khối trụ.' }],
      hints: ['Mặt phẳng cắt chéo trục trụ tạo thành thiết diện elip.', 'Chọn Thiết diện.', 'Nhấp khối trụ rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Dựng thiết diện của khối trụ với (P).', mathExplanation: 'Thiết diện là đường elip.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['cyl1', 'plCut'], label: 'Thiết diện elip' } }],
      proof: 'Giao của mặt trụ tròn xoay với mặt phẳng nghiêng góc $\\alpha$ là hình elip diện tích $\\frac{\\pi r^2}{\\cos\\alpha}$.',
    },
    {
      levelId: 13, order: 10, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Bài toán tổng hợp dựng mặt phẳng cắt và thiết diện hình thoi',
      title: 'Tổng hợp: Dựng mặt phẳng (MNP) và thiết diện hình thoi của lập phương',
      description: 'Cho khối lập phương cạnh $3{,}6$ và ba điểm $M, N, P$ trên các cạnh. Hãy dựng mặt phẳng $(MNP)$ và thiết diện của khối lập phương.',
      hypothesis: 'Khối lập phương và ba điểm $M, N, P$.',
      goal: 'Dựng $(MNP)$ và thiết diện hình thoi 4 đỉnh.',
      setup: () => {
        let sc = createEmptyScene3D(); sc.displayMode = 'solid';
        sc = addGeo3DObject(sc, { id: 'cube1', kind: 'solid', rule: 'solid_cube', solidType: 'cube', center: v3(0, 0, 0), params: { a: 3.6 }, label: 'Lập phương', style: { color: '#0F766E', opacity: 0.16, isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'free_point_3d', position: v3(1.8, -1.8, 1.8), label: 'M', style: { color: '#DC2626', isGiven: true }, skipLog: true }).scene;
        sc = addGeo3DObject(sc, { id: 'N', kind: 'point', rule: 'free_point_3d', position: v3(1.8, 1.8, 3.6), label: 'N', style: { color: '#DC2626', isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'P', kind: 'point', rule: 'free_point_3d', position: v3(-1.8, 1.8, 1.8), label: 'P', style: { color: '#DC2626', isGiven: true }, skipLog: true }).scene;
      },
      rules: [
        { type: 'has_plane_through_points', refs: ['M', 'N', 'P'], description: 'Dựng mặt phẳng (MNP).' },
        { type: 'has_cross_section_with_min_verts', refs: [], params: { minVerts: 4 }, description: 'Dựng thiết diện lập phương với (MNP).' },
      ],
      hints: ['Dựng (MNP) đi qua 3 điểm rồi dùng Thiết diện.', 'Bước 1: Mặt phẳng qua 3 điểm(M, N, P). Bước 2: Thiết diện(Lập phương, (MNP)).', 'Xoay góc nhìn 3D để quan sát hình thoi đối xứng.'],
      steps: [
        { id: 's1', actionText: 'Dựng mặt phẳng (MNP).', mathExplanation: 'Mặt phẳng đi qua 3 điểm biên.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['M', 'N', 'P'], label: '(MNP)' } },
        { id: 's2', actionText: 'Dựng thiết diện của khối lập phương với (MNP).', mathExplanation: 'Thiết diện là hình thoi.', addInput: { id: 'sol_cs', kind: 'cross_section', rule: 'cross_section_solid_plane', parents: ['cube1', 'sol_pl'], label: 'Thiết diện' } },
      ],
      proof: 'Mặt phẳng $(MNP)$ cắt các mặt bên đối xứng tạo nên thiết diện hình thoi.',
    },
  ];

  return specs.map(makeChallenge3D);
}
