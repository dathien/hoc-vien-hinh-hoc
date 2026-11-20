import { addGeo3DObject } from './engine3d';
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

export function buildLevels7To10(): Challenge3DDefinition[] {
  const specs: Parameters<typeof makeChallenge3D>[0][] = [
    // =========================================================================
    // CẤP ĐỘ VII: HAI ĐƯỜNG THẲNG VUÔNG GÓC (10 thử thách — Toán 11)
    // =========================================================================
    {
      levelId: 7, order: 1, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Góc giữa hai đường thẳng trong không gian',
      title: 'Đo góc giữa hai cạnh kề của hình lập phương',
      description: "Cho hình lập phương $ABCD.A'B'C'D'$. Hãy đo góc giữa hai đường thẳng $AB$ và $AA'$.",
      hypothesis: "Hình lập phương $ABCD.A'B'C'D'$.",
      goal: "Đo góc giữa $AB$ và $AA'$ ($90^\\circ$).",
      setup: () => buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2 }),
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_lines' }, description: "Đo góc giữa AB và AA'." }],
      hints: ["Mặt bên ABB'A' là hình vuông nên AB ⊥ AA'.", 'Mở nhóm Thiết diện và đo lường → Góc giữa 2 đường thẳng.', "Nhấp chọn cạnh AB rồi cạnh AA'."],
      steps: [{ id: 's1', actionText: "Đo góc giữa AB và AA'.", mathExplanation: "∠(AB, AA') = 90°.", addInput: { id: 'sol_ang', kind: 'measurement', rule: 'measure_angle_lines', parents: ['eAB', 'eAA1'], label: "∠(AB,AA')", metricKind: 'angle' } }],
      proof: "Mặt $ABB'A'$ là hình vuông nên $AB \\perp AA'$, tức $(AB, AA') = 90^\\circ$.",
    },
    {
      levelId: 7, order: 2, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hai đường thẳng chéo nhau vuông góc',
      title: 'Kiểm chứng hai cạnh chéo nhau vuông góc trong lập phương',
      description: "Cho hình lập phương $ABCD.A'B'C'D'$. Hãy đo góc giữa hai đường thẳng chéo nhau $AB$ và $CC'$.",
      hypothesis: "Hình lập phương $ABCD.A'B'C'D'$.",
      goal: "Đo góc giữa $AB$ và $CC'$ để xác nhận $AB \\perp CC'$.",
      setup: () => buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2 }),
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_lines' }, description: "Đo góc giữa AB và CC'." }],
      hints: ["CC' ∥ BB' mà AB ⊥ BB' nên AB ⊥ CC'.", 'Chọn công cụ Góc giữa 2 đường thẳng.', "Nhấp cạnh AB rồi cạnh CC'."],
      steps: [{ id: 's1', actionText: "Đo góc giữa AB và CC'.", mathExplanation: "∠(AB, CC') = 90°.", addInput: { id: 'sol_ang', kind: 'measurement', rule: 'measure_angle_lines', parents: ['eAB', 'eCC1'], label: "∠(AB,CC')", metricKind: 'angle' } }],
      proof: "Do $CC' \\parallel BB'$ và $AB \\perp BB'$ nên $(AB, CC') = 90^\\circ$.",
    },
    {
      levelId: 7, order: 3, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hai đường chéo hình vuông vuông góc',
      title: 'Dựng đường chéo AC vuông góc với BD ở đáy vuông',
      description: 'Cho hình chóp tứ giác đều $S.ABCD$ đã có đường chéo $BD$. Hãy nối đường chéo $AC$ vuông góc với $BD$.',
      hypothesis: 'Hình chóp $S.ABCD$ đáy vuông đã có $BD$.',
      goal: 'Nối đoạn thẳng $AC$ vuông góc với $BD$.',
      setup: () => addGivenSeg(buildPyramidABCDScene(), 'eBD', 'B', 'D', 'BD', true),
      rules: [{ type: 'has_segment_between', refs: ['A', 'C'], description: 'Nối đoạn thẳng AC.' }],
      hints: ['Hai đường chéo hình vuông vuông góc tại trung điểm.', 'Chọn công cụ Đoạn thẳng.', 'Nhấp điểm A rồi điểm C.'],
      steps: [{ id: 's1', actionText: 'Nối đoạn thẳng AC.', mathExplanation: 'Trong hình vuông ABCD có AC ⊥ BD.', addInput: { id: 'sol_ac', kind: 'segment', rule: 'segment_3d', parents: ['A', 'C'], label: 'AC' } }],
      proof: 'Đáy $ABCD$ là hình vuông nên $AC \\perp BD$.',
    },
    {
      levelId: 7, order: 4, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đường cao tam giác mặt bên trong không gian',
      title: 'Dựng đường cao SH vuông góc với cạnh đáy BC',
      description: 'Cho tứ diện $S.ABC$. Hãy dựng hình chiếu vuông góc $H$ của $S$ lên $BC$ và nối đoạn thẳng $SH \\perp BC$.',
      hypothesis: 'Tứ diện $S.ABC$.',
      goal: 'Dựng $H$ là hình chiếu vuông góc của $S$ lên $BC$ và nối $SH$.',
      setup: () => buildTetrahedronScene(),
      rules: [
        { type: 'has_foot_on_line', refs: ['S', 'eBC'], description: 'Dựng hình chiếu H của S lên BC.' },
        { type: 'has_line_perp_line_through', refs: ['S', 'eBC'], description: 'Nối đoạn SH vuông góc BC.' },
      ],
      perturb: ['S', 'B', 'C'],
      hints: ['H thuộc BC sao cho SH ⊥ BC.', 'Dùng Hình chiếu lên đường thẳng(S, BC) rồi nối đoạn SH.', 'Bước 1: Hình chiếu lên đường thẳng(S, BC) → H. Bước 2: Đoạn thẳng(S, H).'],
      steps: [
        { id: 's1', actionText: 'Dựng hình chiếu H của S lên BC.', mathExplanation: 'SH ⊥ BC.', addInput: { id: 'sol_h', kind: 'point', rule: 'foot_point_line', parents: ['S', 'eBC'], label: 'H' } },
        { id: 's2', actionText: 'Nối đoạn thẳng SH.', mathExplanation: 'SH là đường cao mặt bên ΔSBC.', addInput: { id: 'sol_sh', kind: 'segment', rule: 'segment_3d', parents: ['S', 'sol_h'], label: 'SH' } },
      ],
      proof: 'Vì $H$ là hình chiếu vuông góc của $S$ trên $BC$ nên $SH \\perp BC$.',
    },
    {
      levelId: 7, order: 5, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Xác định góc hai đường chéo nhau bằng phép tịnh tiến song song',
      title: 'Dựng đường thẳng qua B song song SA để xác định góc (SA, BC)',
      description: 'Cho tứ diện $S.ABC$. Để đưa hai đường thẳng chéo nhau $SA$ và $BC$ về hai đường cắt nhau, hãy dựng đường thẳng $d$ qua $B$ song song $SA$.',
      hypothesis: 'Tứ diện $S.ABC$.',
      goal: 'Dựng đường thẳng $d$ đi qua $B$ và song song $SA$.',
      setup: () => buildTetrahedronScene(),
      rules: [{ type: 'has_line_parallel_to_through', refs: ['B', 'eSA'], description: 'Đường thẳng qua B song song SA.' }],
      perturb: ['S', 'A', 'B'],
      hints: ['Góc (SA, BC) = góc (d, BC) với d qua B và d ∥ SA.', 'Chọn công cụ Đường thẳng song song.', 'Nhấp điểm B rồi cạnh SA.'],
      steps: [{ id: 's1', actionText: 'Dựng đường thẳng qua B song song SA.', mathExplanation: 'd ∥ SA và cắt BC tại B.', addInput: { id: 'sol_d', kind: 'line', rule: 'line_parallel_point', parents: ['B', 'eSA'], label: 'd' } }],
      proof: 'Vì $d \\parallel SA$ và $d$ cắt $BC$ tại $B$ nên $(SA, BC) = (d, BC)$.',
    },
    {
      levelId: 7, order: 6, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hai đường chéo vuông góc ở hai mặt đáy lập phương',
      title: "Kiểm chứng A'C' vuông góc BD trong hình lập phương",
      description: "Cho hình lập phương $ABCD.A'B'C'D'$ đã có $BD$. Hãy nối đường chéo $A'C'$ và đo góc giữa $A'C'$ và $BD$.",
      hypothesis: "Hình lập phương $ABCD.A'B'C'D'$ cùng đường chéo $BD$.",
      goal: "Nối đoạn thẳng $A'C'$ và đo góc giữa $A'C'$ và $BD$.",
      setup: () => addGivenSeg(buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2 }), 'eBD', 'B', 'D', 'BD', true),
      rules: [
        { type: 'has_segment_between', refs: ['A1', 'C1'], description: "Nối đoạn A'C'." },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_lines' }, description: "Đo góc giữa A'C' và BD." },
      ],
      hints: ["A'C' ∥ AC mà AC ⊥ BD nên A'C' ⊥ BD.", "Nối A'C', rồi chọn Góc giữa 2 đường thẳng.", "Bước 1: Đoạn thẳng(A', C'). Bước 2: Góc 2 đường thẳng(A'C', BD)."],
      steps: [
        { id: 's1', actionText: "Nối đoạn A'C'.", mathExplanation: "A'C' ∥ AC.", addInput: { id: 'sol_a1c1', kind: 'segment', rule: 'segment_3d', parents: ['A1', 'C1'], label: "A'C'" } },
        { id: 's2', actionText: "Đo góc giữa A'C' và BD.", mathExplanation: "Góc đo được bằng 90°.", addInput: { id: 'sol_ang', kind: 'measurement', rule: 'measure_angle_lines', parents: ['sol_a1c1', 'eBD'], label: "∠(A'C',BD)", metricKind: 'angle' } },
      ],
      proof: "Vì $A'C' \\parallel AC$ và $AC \\perp BD$ nên $A'C' \\perp BD$.",
    },
    {
      levelId: 7, order: 7, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Các cặp cạnh đối của tứ diện đều vuông góc với nhau',
      title: 'Kiểm chứng hai cạnh đối vuông góc trong tứ diện đều',
      description: 'Cho tứ diện đều $S.ABC$. Hãy dựng trung điểm $M$ của $BC$ và đo góc giữa hai cạnh đối $SA$ và $BC$.',
      hypothesis: 'Tứ diện đều $S.ABC$.',
      goal: 'Dựng trung điểm $M$ của $BC$ và đo góc giữa $SA$ và $BC$ ($90^\\circ$).',
      setup: () => {
        const a = 4; const R = a / Math.sqrt(3); const h = a * Math.sqrt(2 / 3);
        return buildTetrahedronScene({ aPos: v3(R, 0, 0), bPos: v3(-R / 2, a / 2, 0), cPos: v3(-R / 2, -a / 2, 0), sPos: v3(0, 0, h) });
      },
      rules: [
        { type: 'has_midpoint_of', refs: ['B', 'C'], description: 'Dựng trung điểm M của BC.' },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_lines' }, description: 'Đo góc giữa SA và BC.' },
      ],
      hints: ['BC ⊥ SM và BC ⊥ AM nên BC ⊥ (SAM), suy ra BC ⊥ SA.', 'Dựng trung điểm M của BC và đo góc (SA, BC).', 'Bước 1: Trung điểm(B, C). Bước 2: Góc 2 đường thẳng(SA, BC).'],
      steps: [
        { id: 's1', actionText: 'Dựng trung điểm M của BC.', mathExplanation: 'BC ⊥ SM và BC ⊥ AM.', addInput: { id: 'sol_m', kind: 'point', rule: 'midpoint_3d', parents: ['B', 'C'], label: 'M' } },
        { id: 's2', actionText: 'Đo góc giữa SA và BC.', mathExplanation: '∠(SA, BC) = 90°.', addInput: { id: 'sol_ang', kind: 'measurement', rule: 'measure_angle_lines', parents: ['eSA', 'eBC'], label: '∠(SA,BC)', metricKind: 'angle' } },
      ],
      proof: 'Vì $BC \\perp SM$ và $BC \\perp AM$ nên $BC \\perp (SAM) \\Rightarrow BC \\perp SA$.',
    },
    {
      levelId: 7, order: 8, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Mặt phẳng trung trực của đoạn thẳng trong không gian',
      title: 'Dựng trung điểm M và mặt phẳng trung trực của đoạn AB',
      description: 'Cho đoạn thẳng $AB$ trong không gian. Hãy dựng trung điểm $M$ của $AB$ và mặt phẳng trung trực đi qua $M$ vuông góc với $AB$.',
      hypothesis: 'Đoạn thẳng $AB$.',
      goal: 'Dựng trung điểm $M$ và mặt phẳng đi qua $M$ vuông góc $AB$.',
      setup: () => addGivenSeg(givenPointsScene([{ id: 'A', label: 'A', pos: v3(-2, -1, 0.5) }, { id: 'B', label: 'B', pos: v3(2, 1.4, 2.5) }]), 'eAB', 'A', 'B', 'AB'),
      rules: [
        { type: 'has_midpoint_of', refs: ['A', 'B'], description: 'Dựng trung điểm M của AB.' },
      ],
      perturb: ['A', 'B'],
      hints: ['Mặt phẳng trung trực đi qua trung điểm M của AB và vuông góc AB.', 'Dùng Trung điểm(A, B) rồi Mặt phẳng vuông góc đường thẳng(M, AB).', 'Bước 1: Trung điểm(A, B) → M. Bước 2: Mặt phẳng vuông góc đường thẳng(M, AB).'],
      steps: [
        { id: 's1', actionText: 'Dựng trung điểm M của AB.', mathExplanation: 'M chia đôi đoạn AB.', addInput: { id: 'sol_m', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'B'], label: 'M' } },
        { id: 's2', actionText: 'Dựng mặt phẳng qua M vuông góc AB.', mathExplanation: 'Mọi đường thẳng qua M trong mặt phẳng này đều vuông góc AB.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_perp_line', parents: ['sol_m', 'eAB'], label: '(α)' } },
      ],
      proof: 'Mặt phẳng đi qua trung điểm $M$ và vuông góc $AB$ là tập hợp mọi điểm cách đều $A$ và $B$.',
    },
    {
      levelId: 7, order: 9, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đường vuông góc chung của hai đường thẳng chéo nhau',
      title: 'Dựng đường vuông góc chung của hai đường thẳng chéo nhau',
      description: 'Cho hai đường thẳng chéo nhau $d_1$ và $d_2$. Hãy dựng đường vuông góc chung $\\Delta$ cắt và vuông góc với cả hai đường thẳng.',
      hypothesis: 'Hai đường thẳng chéo nhau $d_1, d_2$.',
      goal: 'Dựng đường vuông góc chung của $d_1$ và $d_2$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2, -1, 0) }, { id: 'B', label: 'B', pos: v3(2, -1, 0) },
          { id: 'C', label: 'C', pos: v3(0, -2, 2.6) }, { id: 'D', label: 'D', pos: v3(0, 2, 2.6) },
        ]);
        sc = addGivenLine(sc, 'd1', 'A', 'B', 'd₁', '#0F766E');
        sc = addGivenLine(sc, 'd2', 'C', 'D', 'd₂', '#0284C7');
        return sc;
      },
      rules: [{ type: 'has_common_perpendicular', refs: ['d1', 'd2'], description: 'Dựng đường vuông góc chung của d₁ và d₂.' }],
      perturb: ['A', 'B', 'C', 'D'],
      hints: ['Hai đường thẳng chéo nhau có duy nhất một đường vuông góc chung.', 'Chọn công cụ Đường vuông góc chung.', 'Nhấp đường thẳng d₁ rồi d₂.'],
      steps: [{ id: 's1', actionText: 'Dựng đường vuông góc chung của d₁ và d₂.', mathExplanation: 'Δ cắt và vuông góc cả d₁ và d₂.', addInput: { id: 'sol_cp', kind: 'line', rule: 'common_perpendicular', parents: ['d1', 'd2'], label: 'Δ' } }],
      proof: 'Tồn tại duy nhất đường thẳng $\\Delta$ cắt và vuông góc với cả hai đường chéo nhau $d_1, d_2$.',
    },
    {
      levelId: 7, order: 10, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tổng hợp hai đường thẳng vuông góc trong hình chóp',
      title: 'Dựng đường cao AK vuông góc SC trong hình chóp SA ⊥ (ABCD)',
      description: 'Cho hình chóp $S.ABCD$ có $SA \\perp (ABCD)$. Hãy dựng hình chiếu vuông góc $K$ của $A$ lên $SC$ và nối đoạn thẳng $AK \\perp SC$.',
      hypothesis: 'Hình chóp $S.ABCD$ có $SA \\perp (ABCD)$.',
      goal: 'Dựng chân đường cao $K$ trên $SC$ và nối $AK$.',
      setup: () => buildPyramidABCDScene({ saPerpBase: true }),
      rules: [
        { type: 'has_foot_on_line', refs: ['A', 'eSC'], description: 'Dựng hình chiếu K của A trên SC.' },
        { type: 'has_line_perp_line_through', refs: ['A', 'eSC'], description: 'Nối đoạn thẳng AK ⊥ SC.' },
      ],
      hints: ['K là chân đường cao kẻ từ A trong tam giác vuông SAC.', 'Dùng Hình chiếu lên đường thẳng(A, SC) rồi nối đoạn AK.', 'Bước 1: Hình chiếu lên đường thẳng(A, SC) → K. Bước 2: Đoạn thẳng(A, K).'],
      steps: [
        { id: 's1', actionText: 'Dựng hình chiếu K của A lên SC.', mathExplanation: 'AK ⊥ SC.', addInput: { id: 'sol_k', kind: 'point', rule: 'foot_point_line', parents: ['A', 'eSC'], label: 'K' } },
        { id: 's2', actionText: 'Nối đoạn thẳng AK.', mathExplanation: 'AK là đường cao ΔSAC.', addInput: { id: 'sol_ak', kind: 'segment', rule: 'segment_3d', parents: ['A', 'sol_k'], label: 'AK' } },
      ],
      proof: 'Điểm $K$ là hình chiếu vuông góc của $A$ trên $SC$ nên $AK \\perp SC$.',
    },

    // =========================================================================
    // CẤP ĐỘ VIII: ĐƯỜNG THẲNG VUÔNG GÓC VỚI MẶT PHẲNG (10 thử thách — Toán 11)
    // =========================================================================
    {
      levelId: 8, order: 1, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Dựng đường thẳng đi qua điểm và vuông góc mặt phẳng',
      title: 'Dựng đường thẳng qua điểm S vuông góc mặt phẳng (P)',
      description: 'Cho mặt phẳng $(P)$ và điểm $S \\notin (P)$. Hãy dựng đường thẳng $d$ đi qua $S$ và vuông góc với $(P)$.',
      hypothesis: 'Mặt phẳng $(P)$ và điểm $S \\notin (P)$.',
      goal: 'Dựng đường thẳng $d$ qua $S$ vuông góc $(P)$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.4, -1.5, 0) }, { id: 'B', label: 'B', pos: v3(2.4, -1.5, 0) },
          { id: 'C', label: 'C', pos: v3(0, 2.3, 0.3) }, { id: 'S', label: 'S', pos: v3(0.2, 0.3, 3.6) },
        ]);
        return addGivenPlane3(sc, 'plP', 'A', 'B', 'C', '(P)', '#0F766E', 0.16);
      },
      rules: [{ type: 'has_line_perp_plane_through', refs: ['S', 'plP'], description: 'Đường thẳng qua S vuông góc (P).' }],
      perturb: ['A', 'B', 'C', 'S'],
      hints: ['Qua một điểm có duy nhất đường thẳng vuông góc mặt phẳng cho trước.', 'Chọn Đường thẳng vuông góc mặt phẳng.', 'Nhấp điểm S rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Dựng đường thẳng qua S vuông góc (P).', mathExplanation: 'd nhận pháp tuyến của (P) làm vectơ chỉ phương.', addInput: { id: 'sol_d', kind: 'line', rule: 'line_perp_plane', parents: ['S', 'plP'], label: 'd' } }],
      proof: 'Qua $S$ có duy nhất đường thẳng nhận $\\vec{n}_{(P)}$ làm vectơ chỉ phương nên vuông góc $(P)$.',
    },
    {
      levelId: 8, order: 2, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Dựng mặt phẳng đi qua điểm và vuông góc đường thẳng',
      title: 'Dựng mặt phẳng qua điểm M vuông góc đường thẳng d',
      description: 'Cho đường thẳng $d$ và điểm $M$. Hãy dựng mặt phẳng $(P)$ đi qua $M$ và vuông góc với $d$.',
      hypothesis: 'Đường thẳng $d$ và điểm $M$.',
      goal: 'Dựng mặt phẳng $(P)$ qua $M$ vuông góc $d$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2, -1, 0) }, { id: 'B', label: 'B', pos: v3(2, 1.2, 2.2) },
          { id: 'M', label: 'M', pos: v3(0, 0.5, 1.5) },
        ]);
        return addGivenLine(sc, 'ld', 'A', 'B', 'd');
      },
      rules: [{ type: 'has_plane_perp_line_through', refs: ['M', 'ld'], description: 'Mặt phẳng qua M vuông góc với d.' }],
      perturb: ['A', 'B', 'M'],
      hints: ['Qua M có duy nhất một mặt phẳng vuông góc với d.', 'Chọn công cụ Mặt phẳng vuông góc đường thẳng.', 'Nhấp điểm M rồi đường thẳng d.'],
      steps: [{ id: 's1', actionText: 'Dựng mặt phẳng qua M vuông góc d.', mathExplanation: '(P) nhận vectơ chỉ phương của d làm vectơ pháp tuyến.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_perp_line', parents: ['M', 'ld'], label: '(P)' } }],
      proof: 'Mặt phẳng qua $M$ có pháp tuyến $\\vec{u}_d$ là mặt phẳng duy nhất vuông góc với $d$.',
    },
    {
      levelId: 8, order: 3, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đường cao của hình chóp từ đỉnh xuống mặt đáy',
      title: 'Dựng đường cao hình chóp tam giác S.ABC',
      description: 'Cho tứ diện $S.ABC$ có mặt phẳng đáy $(ABC)$. Hãy dựng đường thẳng cao đi qua $S$ vuông góc với $(ABC)$.',
      hypothesis: 'Tứ diện $S.ABC$ với đáy $(ABC)$.',
      goal: 'Dựng đường thẳng qua $S$ vuông góc $(ABC)$.',
      setup: () => buildTetrahedronScene({ withBasePlane: true }),
      rules: [{ type: 'has_line_perp_plane_through', refs: ['S', 'plABC'], description: 'Đường thẳng qua S vuông góc (ABC).' }],
      perturb: ['S'],
      hints: ['Đường cao đi qua đỉnh S và vuông góc đáy (ABC).', 'Chọn Đường thẳng vuông góc mặt phẳng.', 'Nhấp S rồi (ABC).'],
      steps: [{ id: 's1', actionText: 'Dựng đường thẳng qua S vuông góc (ABC).', mathExplanation: 'Đường thẳng vuông góc mọi đường nằm trong (ABC).', addInput: { id: 'sol_h', kind: 'line', rule: 'line_perp_plane', parents: ['S', 'plABC'], label: 'h' } }],
      proof: 'Đường thẳng qua $S$ theo pháp tuyến đáy $(ABC)$ là đường cao của hình chóp.',
    },
    {
      levelId: 8, order: 4, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Dấu hiệu nhận biết đường thẳng vuông góc mặt phẳng',
      title: 'Dựng mặt phẳng (SAC) vuông góc BD trong hình chóp đều',
      description: 'Cho hình chóp tứ giác đều $S.ABCD$ có sẵn $BD$. Hãy dựng mặt phẳng $(SAC)$ vuông góc với đường chéo $BD$.',
      hypothesis: 'Hình chóp đều $S.ABCD$ có $BD$.',
      goal: 'Dựng mặt phẳng $(SAC)$ vuông góc $BD$.',
      setup: () => addGivenSeg(buildPyramidABCDScene(), 'eBD', 'B', 'D', 'BD', true),
      rules: [{ type: 'has_plane_perp_line_through', refs: ['S', 'eBD'], description: 'Mặt phẳng (SAC) qua S vuông góc BD.' }],
      hints: ['BD ⊥ AC và BD ⊥ SO nên BD ⊥ (SAC).', 'Dùng Mặt phẳng qua 3 điểm (S, A, C) hoặc Mặt phẳng vuông góc đường thẳng (S, BD).', 'Nhấp S, A, C.'],
      steps: [{ id: 's1', actionText: 'Dựng mặt phẳng (SAC).', mathExplanation: 'BD vuông góc cả AC và SO nên BD ⊥ (SAC).', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['S', 'A', 'C'], label: '(SAC)' } }],
      proof: 'Vì $BD \\perp AC$ và $BD \\perp SO$ nên $BD \\perp (SAC)$.',
    },
    {
      levelId: 8, order: 5, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Trục của hình hộp chữ nhật vuông góc hai đáy',
      title: 'Dựng trục qua tâm O vuông góc mặt đáy hình hộp chữ nhật',
      description: "Cho hình hộp chữ nhật $ABCD.A'B'C'D'$ có đáy $(ABCD)$ và tâm đáy $O$. Hãy dựng đường thẳng qua $O$ vuông góc $(ABCD)$.",
      hypothesis: "Hình hộp chữ nhật, mặt đáy $(ABCD)$ và tâm $O$.",
      goal: 'Dựng đường thẳng qua $O$ vuông góc $(ABCD)$.',
      setup: () => {
        let sc = buildBoxVerticesScene({ lx: 3.4, ly: 2.8, lz: 3.2, withBasePlane: true });
        return addGeo3DObject(sc, { id: 'O', kind: 'point', rule: 'midpoint_3d', parents: ['A', 'C'], label: 'O', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
      },
      rules: [{ type: 'has_line_perp_plane_through', refs: ['O', 'plBase'], description: 'Đường thẳng qua O vuông góc (ABCD).' }],
      hints: ['Trục qua O vuông góc đáy cũng song song với các cạnh bên.', 'Chọn Đường thẳng vuông góc mặt phẳng.', 'Nhấp O rồi (ABCD).'],
      steps: [{ id: 's1', actionText: 'Dựng đường thẳng qua O vuông góc (ABCD).', mathExplanation: 'Trục thẳng đứng đi qua tâm hai đáy.', addInput: { id: 'sol_ax', kind: 'line', rule: 'line_perp_plane', parents: ['O', 'plBase'], label: 'Δ' } }],
      proof: 'Đường thẳng qua $O$ vuông góc $(ABCD)$ song song với $AA\'$ và đi qua tâm đáy trên.',
    },
    {
      levelId: 8, order: 6, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Mặt phẳng vuông góc cạnh bên SC của hình chóp',
      title: 'Dựng mặt phẳng qua A vuông góc cạnh bên SC',
      description: 'Cho hình chóp $S.ABCD$ có $SA \\perp (ABCD)$. Hãy dựng mặt phẳng $(\\alpha)$ đi qua $A$ và vuông góc với cạnh bên $SC$.',
      hypothesis: 'Hình chóp $S.ABCD$ có $SA \\perp (ABCD)$.',
      goal: 'Dựng mặt phẳng $(\\alpha)$ qua $A$ vuông góc $SC$.',
      setup: () => buildPyramidABCDScene({ saPerpBase: true }),
      rules: [{ type: 'has_plane_perp_line_through', refs: ['A', 'eSC'], description: 'Mặt phẳng qua A vuông góc SC.' }],
      hints: ['Mặt phẳng này đi qua các hình chiếu của A lên SB, SC, SD.', 'Chọn Mặt phẳng vuông góc đường thẳng.', 'Nhấp điểm A rồi cạnh SC.'],
      steps: [{ id: 's1', actionText: 'Dựng mặt phẳng qua A vuông góc SC.', mathExplanation: 'Mặt phẳng nhận SC làm phương pháp tuyến.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_perp_line', parents: ['A', 'eSC'], label: '(α)' } }],
      proof: 'Mặt phẳng $(\\alpha)$ đi qua $A$ có pháp tuyến $\\overrightarrow{SC}$ nên vuông góc $SC$.',
    },
    {
      levelId: 8, order: 7, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Định lí ba đường vuông góc',
      title: 'Dựng mặt phẳng (SAD) vuông góc CD kiểm chứng định lí ba đường vuông góc',
      description: 'Cho hình chóp $S.ABCD$ đáy vuông có $SA \\perp (ABCD)$. Hãy dựng mặt phẳng $(SAD)$ vuông góc cạnh $CD$.',
      hypothesis: 'Hình chóp $S.ABCD$ có $SA \\perp (ABCD)$.',
      goal: 'Dựng mặt phẳng $(SAD)$ vuông góc với $CD$.',
      setup: () => buildPyramidABCDScene({ saPerpBase: true }),
      rules: [{ type: 'has_plane_perp_line_through', refs: ['S', 'eCD'], description: 'Dựng mặt phẳng (SAD) vuông góc CD.' }],
      hints: ['CD ⊥ AD và CD ⊥ SA nên CD ⊥ (SAD), suy ra CD ⊥ SD.', 'Dùng Mặt phẳng qua 3 điểm(S, A, D).', 'Nhấp S, A, D.'],
      steps: [{ id: 's1', actionText: 'Dựng mặt phẳng (SAD).', mathExplanation: 'CD ⊥ (SAD) nên CD ⊥ SD.', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['S', 'A', 'D'], label: '(SAD)' } }],
      proof: 'Do $CD \\perp AD$ và $CD \\perp SA$ nên $CD \\perp (SAD) \\Rightarrow CD \\perp SD$.',
    },
    {
      levelId: 8, order: 8, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đường chéo chính lập phương vuông góc mặt phẳng chéo',
      title: "Kiểm chứng AC' vuông góc mặt phẳng (A'BD)",
      description: "Cho hình lập phương $ABCD.A'B'C'D'$. Hãy dựng mặt phẳng $(A'BD)$ và nối đường chéo $AC'$ vuông góc với $(A'BD)$.",
      hypothesis: "Hình lập phương $ABCD.A'B'C'D'$.",
      goal: "Dựng mặt phẳng $(A'BD)$ và đoạn thẳng $AC'$.",
      setup: () => buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2 }),
      rules: [
        { type: 'has_plane_through_points', refs: ['A1', 'B', 'D'], description: "Dựng mặt phẳng (A'BD)." },
        { type: 'has_segment_between', refs: ['A', 'C1'], description: "Nối đường chéo AC'." },
      ],
      hints: ["Đường chéo AC' vuông góc cả BD và A'B nên AC' ⊥ (A'BD).", "Dùng Mặt phẳng qua 3 điểm(A', B, D) và Đoạn thẳng(A, C').", "Bước 1: Mặt phẳng(A', B, D). Bước 2: Đoạn thẳng(A, C')."],
      steps: [
        { id: 's1', actionText: "Dựng mặt phẳng (A'BD).", mathExplanation: "Mặt phẳng chéo tam giác đều A'BD.", addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['A1', 'B', 'D'], label: "(A'BD)" } },
        { id: 's2', actionText: "Nối đường chéo AC'.", mathExplanation: "AC' ⊥ (A'BD).", addInput: { id: 'sol_ac1', kind: 'segment', rule: 'segment_3d', parents: ['A', 'C1'], label: "AC'" } },
      ],
      proof: "Vì $AC' \\perp BD$ và $AC' \\perp A'B$ nên $AC' \\perp (A'BD)$.",
    },
    {
      levelId: 8, order: 9, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đường vuông góc và chân đường vuông góc trên mặt phẳng',
      title: 'Dựng đường thẳng qua S vuông góc (P) và tìm giao điểm H',
      description: 'Cho mặt phẳng $(P)$ và điểm $S \\notin (P)$. Hãy dựng đường thẳng $d$ qua $S$ vuông góc $(P)$ và giao điểm $H = d \\cap (P)$.',
      hypothesis: 'Mặt phẳng $(P)$ và điểm $S \\notin (P)$.',
      goal: 'Dựng $d \\perp (P)$ qua $S$ và giao điểm $H \\in (P)$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.4, -1.6, 0) }, { id: 'B', label: 'B', pos: v3(2.4, -1.4, 0.3) },
          { id: 'C', label: 'C', pos: v3(0, 2.2, 0.8) }, { id: 'S', label: 'S', pos: v3(0.6, 0.2, 3.8) },
        ]);
        return addGivenPlane3(sc, 'plP', 'A', 'B', 'C', '(P)', '#0284C7', 0.16);
      },
      rules: [
        { type: 'has_line_perp_plane_through', refs: ['S', 'plP'], description: 'Dựng đường thẳng d qua S vuông góc (P).' },
        { type: 'has_foot_on_plane', refs: ['S', 'plP'], description: 'Dựng giao điểm H = d ∩ (P).' },
      ],
      perturb: ['A', 'B', 'C', 'S'],
      hints: ['Giao điểm H của đường vuông góc d với (P) là hình chiếu của S.', 'Dùng Đường thẳng vuông góc mặt phẳng rồi Giao điểm đường – mặt.', 'Bước 1: Đường vuông góc(S, (P)) → d. Bước 2: Giao điểm(d, (P)) → H.'],
      steps: [
        { id: 's1', actionText: 'Dựng đường thẳng d qua S vuông góc (P).', mathExplanation: 'd ⊥ (P).', addInput: { id: 'sol_d', kind: 'line', rule: 'line_perp_plane', parents: ['S', 'plP'], label: 'd' } },
        { id: 's2', actionText: 'Dựng giao điểm H = d ∩ (P).', mathExplanation: 'H là hình chiếu vuông góc của S trên (P).', addInput: { id: 'sol_h', kind: 'point', rule: 'intersect_line_plane', parents: ['sol_d', 'plP'], label: 'H' } },
      ],
      proof: 'Giao điểm $H = d \\cap (P)$ là chân đường vuông góc hạ từ $S$ xuống $(P)$.',
    },
    {
      levelId: 8, order: 10, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tổng hợp đường thẳng vuông góc mặt phẳng và phép đối xứng qua mặt phẳng',
      title: 'Dựng trục vuông góc đáy và điểm S\' đối xứng S qua (ABC)',
      description: 'Cho tứ diện $S.ABC$ có mặt đáy $(ABC)$. Hãy dựng đường thẳng $d$ qua $S$ vuông góc $(ABC)$ và điểm $S\'$ đối xứng $S$ qua $(ABC)$.',
      hypothesis: 'Tứ diện $S.ABC$ và mặt đáy $(ABC)$.',
      goal: 'Dựng $d \\perp (ABC)$ qua $S$ và ảnh đối xứng $S\'$.',
      setup: () => buildTetrahedronScene({ withBasePlane: true }),
      rules: [
        { type: 'has_line_perp_plane_through', refs: ['S', 'plABC'], description: 'Đường thẳng qua S vuông góc (ABC).' },
        { type: 'has_reflect_point_plane', refs: ['S', 'plABC'], description: "Điểm S' đối xứng S qua (ABC)." },
      ],
      perturb: ['S'],
      hints: ['Ảnh đối xứng S\' nằm trên đường vuông góc kẻ từ S xuống (ABC).', 'Dùng Đường thẳng vuông góc mặt phẳng và Đối xứng qua mặt phẳng.', 'Bước 1: Đường vuông góc(S, (ABC)). Bước 2: Đối xứng qua mặt phẳng(S, (ABC)).'],
      steps: [
        { id: 's1', actionText: 'Dựng đường thẳng qua S vuông góc (ABC).', mathExplanation: 'Đường thẳng đi qua S và S\'.', addInput: { id: 'sol_d', kind: 'line', rule: 'line_perp_plane', parents: ['S', 'plABC'], label: 'd' } },
        { id: 's2', actionText: "Dựng ảnh S' đối xứng S qua (ABC).", mathExplanation: '(ABC) là mặt phẳng trung trực của SS\'.', addInput: { id: 'sol_s1', kind: 'point', rule: 'reflect_point_plane', parents: ['S', 'plABC'], label: "S'" } },
      ],
      proof: 'Đoạn $SS\'$ vuông góc $(ABC)$ và bị $(ABC)$ chia đôi tại chân đường cao $H$.',
    },

    // =========================================================================
    // CẤP ĐỘ IX: HAI MẶT PHẲNG VUÔNG GÓC (10 thử thách — Toán 11)
    // =========================================================================
    {
      levelId: 9, order: 1, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Góc giữa hai mặt phẳng vuông góc',
      title: 'Kiểm chứng hai mặt kề vuông góc trong hình lập phương',
      description: "Cho hình lập phương $ABCD.A'B'C'D'$ có sẵn $(ABCD)$ và $(ABB'A')$. Hãy đo góc giữa hai mặt phẳng này.",
      hypothesis: "Hai mặt phẳng $(ABCD)$ và $(ABB'A')$.",
      goal: 'Đo góc giữa hai mặt phẳng ($90^\\circ$).',
      setup: () => addGivenPlane3(buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2, withBasePlane: true }), 'plSide', 'A', 'B', 'A1', "(ABB'A')", '#7C3AED', 0.14),
      rules: [{ type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_angle_planes' }, description: 'Đo góc giữa hai mặt phẳng.' }],
      hints: ['Hai mặt kề của hình lập phương vuông góc nhau.', 'Chọn Góc giữa 2 mặt phẳng.', "Nhấp (ABCD) rồi (ABB'A')."],
      steps: [{ id: 's1', actionText: "Đo góc giữa (ABCD) và (ABB'A').", mathExplanation: 'Góc bằng 90°.', addInput: { id: 'sol_ang', kind: 'measurement', rule: 'measure_angle_planes', parents: ['plBase', 'plSide'], label: '∠((P),(Q))', metricKind: 'angle' } }],
      proof: "Vì $AA' \\perp (ABCD)$ và $AA' \\subset (ABB'A')$ nên $(ABB'A') \\perp (ABCD)$.",
    },
    {
      levelId: 9, order: 2, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Điều kiện để hai mặt phẳng vuông góc',
      title: 'Dựng mặt bên (SAB) vuông góc đáy trong hình chóp SA ⊥ (ABCD)',
      description: 'Cho hình chóp $S.ABCD$ có $SA \\perp (ABCD)$ và mặt phẳng đáy $(ABCD)$. Hãy dựng mặt phẳng $(SAB)$ vuông góc đáy.',
      hypothesis: 'Hình chóp $S.ABCD$ ($SA \\perp (ABCD)$) và mặt đáy $(ABCD)$.',
      goal: 'Dựng mặt phẳng $(SAB)$ vuông góc $(ABCD)$.',
      setup: () => buildPyramidABCDScene({ saPerpBase: true, withBasePlane: true }),
      rules: [{ type: 'has_plane_perp_plane_through', refs: ['S', 'A', 'plABCD'], description: '(SAB) vuông góc (ABCD).' }],
      hints: ['Mặt phẳng chứa đường thẳng vuông góc với đáy thì vuông góc với đáy.', 'Chọn Mặt phẳng qua 3 điểm.', 'Nhấp S, A, B.'],
      steps: [{ id: 's1', actionText: 'Dựng mặt phẳng (SAB).', mathExplanation: 'SA ⊥ (ABCD) nên (SAB) ⊥ (ABCD).', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['S', 'A', 'B'], label: '(SAB)' } }],
      proof: 'Vì $SA \\perp (ABCD)$ và $SA \\subset (SAB)$ nên $(SAB) \\perp (ABCD)$.',
    },
    {
      levelId: 9, order: 3, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Mặt phẳng chéo vuông góc đáy hình chóp',
      title: 'Dựng mặt phẳng (SAC) vuông góc mặt đáy (ABCD)',
      description: 'Cho hình chóp $S.ABCD$ có $SA \\perp (ABCD)$ và mặt phẳng đáy $(ABCD)$. Hãy dựng mặt phẳng chéo $(SAC)$ vuông góc $(ABCD)$.',
      hypothesis: 'Hình chóp $S.ABCD$ ($SA \\perp (ABCD)$).',
      goal: 'Dựng mặt phẳng $(SAC)$ vuông góc $(ABCD)$.',
      setup: () => buildPyramidABCDScene({ saPerpBase: true, withBasePlane: true }),
      rules: [
        { type: 'has_plane_through_points', refs: ['S', 'A', 'C'], description: 'Dựng mặt phẳng (SAC).' },
        { type: 'has_plane_perp_plane_through', refs: ['S', 'C', 'plABCD'], description: '(SAC) vuông góc (ABCD).' },
      ],
      hints: ['(SAC) chứa SA ⊥ (ABCD).', 'Chọn Mặt phẳng qua 3 điểm.', 'Nhấp S, A, C.'],
      steps: [{ id: 's1', actionText: 'Dựng mặt phẳng (SAC).', mathExplanation: '(SAC) ⊥ (ABCD).', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['S', 'A', 'C'], label: '(SAC)' } }],
      proof: 'Vì $SA \\perp (ABCD)$ và $SA \\subset (SAC)$ nên $(SAC) \\perp (ABCD)$.',
    },
    {
      levelId: 9, order: 4, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Giao tuyến hai mặt phẳng cùng vuông góc mặt phẳng thứ ba',
      title: 'Tìm giao tuyến của hai mặt bên cùng vuông góc đáy',
      description: 'Cho hình chóp $S.ABCD$ có $(SAB)$ và $(SAD)$ cùng vuông góc với đáy $(ABCD)$. Hãy dựng giao tuyến $SA$ của $(SAB)$ và $(SAD)$.',
      hypothesis: 'Hai mặt phẳng $(SAB)$ và $(SAD)$ cùng vuông góc $(ABCD)$.',
      goal: 'Dựng giao tuyến $SA$ của $(SAB)$ và $(SAD)$.',
      setup: () => {
        let sc = buildPyramidABCDScene({ saPerpBase: true, withBasePlane: true });
        sc = addGivenPlane3(sc, 'plSAB', 'S', 'A', 'B', '(SAB)', '#0284C7', 0.14);
        sc = addGivenPlane3(sc, 'plSAD', 'S', 'A', 'D', '(SAD)', '#7C3AED', 0.14);
        return sc;
      },
      rules: [{ type: 'has_intersection_line_planes', refs: ['plSAB', 'plSAD'], description: 'Dựng giao tuyến SA.' }],
      hints: ['Giao tuyến của hai mặt phẳng cùng vuông góc đáy sẽ vuông góc đáy.', 'Chọn Giao tuyến 2 mặt phẳng.', 'Nhấp (SAB) rồi (SAD).'],
      steps: [{ id: 's1', actionText: 'Dựng giao tuyến của (SAB) và (SAD).', mathExplanation: 'Giao tuyến SA vuông góc (ABCD).', addInput: { id: 'sol_sa', kind: 'line', rule: 'intersect_plane_plane', parents: ['plSAB', 'plSAD'], label: 'SA' } }],
      proof: 'Hai mặt phẳng cắt nhau cùng vuông góc $(ABCD)$ thì giao tuyến $SA$ vuông góc $(ABCD)$.',
    },
    {
      levelId: 9, order: 5, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Đường cao kẻ tới giao tuyến của hai mặt phẳng vuông góc',
      title: 'Dựng đường cao SH từ mặt bên vuông góc đáy xuống giao tuyến AB',
      description: 'Cho tứ diện $S.ABC$ có $(SAB) \\perp (ABC)$. Hãy dựng hình chiếu $H$ của $S$ lên $AB$ và nối $SH \\perp (ABC)$.',
      hypothesis: 'Tứ diện $S.ABC$ có $(SAB) \\perp (ABC)$.',
      goal: 'Dựng $H \\in AB$ sao cho $SH \\perp AB$ và nối $SH$.',
      setup: () => buildTetrahedronScene({ sPos: v3(-0.2, -1.6, 3.6), withBasePlane: true }),
      rules: [
        { type: 'has_foot_on_line', refs: ['S', 'eAB'], description: 'Dựng hình chiếu H của S trên AB.' },
        { type: 'has_line_perp_plane_through', refs: ['S', 'plABC'], description: 'Nối SH vuông góc (ABC).' },
      ],
      hints: ['Trong mặt phẳng (SAB), kẻ SH ⊥ AB thì SH ⊥ (ABC).', 'Dùng Hình chiếu lên đường thẳng(S, AB) rồi nối đoạn SH.', 'Bước 1: Hình chiếu(S, AB) → H. Bước 2: Đoạn thẳng(S, H).'],
      steps: [
        { id: 's1', actionText: 'Dựng hình chiếu H của S lên AB.', mathExplanation: 'SH ⊥ AB.', addInput: { id: 'sol_h', kind: 'point', rule: 'foot_point_line', parents: ['S', 'eAB'], label: 'H' } },
        { id: 's2', actionText: 'Nối đoạn thẳng SH.', mathExplanation: 'SH ⊥ (ABC).', addInput: { id: 'sol_sh', kind: 'segment', rule: 'segment_3d', parents: ['S', 'sol_h'], label: 'SH' } },
      ],
      proof: 'Do $(SAB) \\perp (ABC)$ theo giao tuyến $AB$ và $SH \\subset (SAB), SH \\perp AB$ nên $SH \\perp (ABC)$.',
    },
    {
      levelId: 9, order: 6, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hai mặt chéo vuông góc trong hình lập phương',
      title: "Dựng mặt phẳng (BDD'B') vuông góc (ACC'A')",
      description: "Cho hình lập phương $ABCD.A'B'C'D'$ đã có $(ACC'A')$. Hãy dựng mặt phẳng $(BDD'B')$ vuông góc $(ACC'A')$.",
      hypothesis: "Hình lập phương và mặt phẳng $(ACC'A')$.",
      goal: "Dựng mặt phẳng $(BDD'B')$ vuông góc $(ACC'A')$.",
      setup: () => addGivenPlane3(buildBoxVerticesScene({ lx: 3.2, ly: 3.2, lz: 3.2 }), 'plAC', 'A', 'C', 'C1', "(ACC'A')", '#0284C7', 0.14),
      rules: [
        { type: 'has_plane_through_points', refs: ['B', 'D', 'D1'], description: "Dựng (BDD'B')." },
        { type: 'has_plane_perp_plane_through', refs: ['B', 'D', 'plAC'], description: "Vuông góc (ACC'A')." },
      ],
      hints: ["BD ⊥ (ACC'A') nên (BDD'B') ⊥ (ACC'A').", "Chọn Mặt phẳng qua 3 điểm.", "Nhấp B, D, D'."],
      steps: [{ id: 's1', actionText: "Dựng mặt phẳng (BDD'B').", mathExplanation: "(BDD'B') ⊥ (ACC'A').", addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['B', 'D', 'D1'], label: "(BDD'B')" } }],
      proof: "Vì $BD \\perp (ACC'A')$ nên $(BDD'B') \\perp (ACC'A')$.",
    },
    {
      levelId: 9, order: 7, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hai mặt bên vuông góc trong hình chóp SA ⊥ (ABCD)',
      title: 'Dựng mặt phẳng (SBC) vuông góc với (SAB)',
      description: 'Cho hình chóp $S.ABCD$ đáy vuông có $SA \\perp (ABCD)$ và mặt phẳng $(SAB)$. Hãy dựng mặt phẳng $(SBC)$ vuông góc $(SAB)$.',
      hypothesis: 'Hình chóp $S.ABCD$ ($SA \\perp (ABCD)$) và $(SAB)$.',
      goal: 'Dựng mặt phẳng $(SBC)$ vuông góc $(SAB)$.',
      setup: () => addGivenPlane3(buildPyramidABCDScene({ saPerpBase: true }), 'plSAB', 'S', 'A', 'B', '(SAB)', '#0F766E', 0.14),
      rules: [
        { type: 'has_plane_through_points', refs: ['S', 'B', 'C'], description: 'Dựng (SBC).' },
        { type: 'has_plane_perp_plane_through', refs: ['S', 'C', 'plSAB'], description: '(SBC) vuông góc (SAB).' },
      ],
      hints: ['BC ⊥ (SAB) nên (SBC) ⊥ (SAB).', 'Chọn Mặt phẳng qua 3 điểm.', 'Nhấp S, B, C.'],
      steps: [{ id: 's1', actionText: 'Dựng mặt phẳng (SBC).', mathExplanation: 'BC ⊥ AB và BC ⊥ SA nên (SBC) ⊥ (SAB).', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['S', 'B', 'C'], label: '(SBC)' } }],
      proof: 'Vì $BC \\perp (SAB)$ và $BC \\subset (SBC)$ nên $(SBC) \\perp (SAB)$.',
    },
    {
      levelId: 9, order: 8, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Mặt bên lăng trụ đứng vuông góc với đáy',
      title: "Dựng mặt bên (ABB'A') vuông góc với đáy lăng trụ đứng",
      description: "Cho lăng trụ đứng $ABC.A'B'C'$ có mặt đáy $(ABC)$. Hãy dựng mặt phẳng mặt bên $(ABB'A')$ vuông góc $(ABC)$.",
      hypothesis: "Lăng trụ đứng $ABC.A'B'C'$ với đáy $(ABC)$.",
      goal: "Dựng mặt phẳng $(ABB'A')$ vuông góc $(ABC)$.",
      setup: () => buildTriPrismScene({ right: true, withBasePlane: true }),
      rules: [
        { type: 'has_plane_through_points', refs: ['A', 'B', 'A1'], description: "Dựng (ABB'A')." },
        { type: 'has_plane_perp_plane_through', refs: ['A', 'B', 'plABC'], description: 'Vuông góc đáy (ABC).' },
      ],
      hints: ["Cạnh bên AA' vuông góc đáy nên mặt bên chứa nó vuông góc đáy.", 'Chọn Mặt phẳng qua 3 điểm.', "Nhấp A, B, A'."],
      steps: [{ id: 's1', actionText: "Dựng mặt phẳng (ABB'A').", mathExplanation: "(ABB'A') ⊥ (ABC).", addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_three_points', parents: ['A', 'B', 'A1'], label: "(ABB'A')" } }],
      proof: "Vì $AA' \\perp (ABC)$ nên $(ABB'A') \\perp (ABC)$.",
    },
    {
      levelId: 9, order: 9, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Mặt phẳng vuông góc đồng thời hai mặt phẳng cắt nhau',
      title: 'Dựng mặt phẳng qua M vuông góc với cả (P) và (Q)',
      description: 'Cho hai mặt phẳng $(P), (Q)$ cắt nhau theo giao tuyến $d$ và điểm $M$. Hãy dựng mặt phẳng $(\\alpha)$ qua $M$ vuông góc với cả $(P)$ và $(Q)$.',
      hypothesis: 'Hai mặt phẳng $(P), (Q)$, giao tuyến $d$ và điểm $M$.',
      goal: 'Dựng mặt phẳng qua $M$ vuông góc giao tuyến $d$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2, 0, 0) }, { id: 'B', label: 'B', pos: v3(2, 0, 0) },
          { id: 'C', label: 'C', pos: v3(0, 2.4, 0) }, { id: 'D', label: 'D', pos: v3(0, 0.5, 2.8) },
          { id: 'M', label: 'M', pos: v3(0.8, 1.2, 1.6) },
        ]);
        sc = addGivenPlane3(sc, 'plP', 'A', 'B', 'C', '(P)', '#0F766E', 0.14);
        sc = addGivenPlane3(sc, 'plQ', 'A', 'B', 'D', '(Q)', '#0284C7', 0.14);
        return addGivenLine(sc, 'ld', 'A', 'B', 'd', '#D97706');
      },
      rules: [{ type: 'has_plane_perp_line_through', refs: ['M', 'ld'], description: 'Mặt phẳng qua M vuông góc giao tuyến d.' }],
      perturb: ['M'],
      hints: ['Mặt phẳng vuông góc giao tuyến d thì vuông góc cả (P) và (Q).', 'Chọn Mặt phẳng vuông góc đường thẳng.', 'Nhấp điểm M rồi giao tuyến d.'],
      steps: [{ id: 's1', actionText: 'Dựng mặt phẳng qua M vuông góc d.', mathExplanation: 'd ⊥ (α) nên (α) vuông góc cả (P) và (Q).', addInput: { id: 'sol_pl', kind: 'plane', rule: 'plane_perp_line', parents: ['M', 'ld'], label: '(α)' } }],
      proof: 'Vì $d \\perp (\\alpha)$ và $d = (P) \\cap (Q)$ nên $(\\alpha) \\perp (P)$ và $(\\alpha) \\perp (Q)$.',
    },
    {
      levelId: 9, order: 10, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tổng hợp hai mặt phẳng vuông góc trong hình chóp đều',
      title: 'Dựng (SBD) vuông góc (SAC) và tìm giao tuyến SO',
      description: 'Cho hình chóp đều $S.ABCD$ đã có $(SAC)$. Hãy dựng mặt phẳng $(SBD)$ vuông góc $(SAC)$ và dựng giao tuyến $SO$ của hai mặt phẳng.',
      hypothesis: 'Hình chóp đều $S.ABCD$ cùng $(SAC)$.',
      goal: 'Dựng mặt phẳng $(SBD)$ và giao tuyến $SO$.',
      setup: () => addGivenPlane3(buildPyramidABCDScene(), 'plSAC', 'S', 'A', 'C', '(SAC)', '#0284C7', 0.14),
      rules: [
        { type: 'has_plane_through_points', refs: ['S', 'B', 'D'], description: 'Dựng mặt phẳng (SBD).' },
        { type: 'has_plane_perp_plane_through', refs: ['S', 'B', 'plSAC'], description: '(SBD) vuông góc (SAC).' },
      ],
      hints: ['BD ⊥ (SAC) nên (SBD) ⊥ (SAC) với giao tuyến SO.', 'Dựng (SBD) qua S, B, D rồi dựng giao tuyến ((SAC), (SBD)).', 'Bước 1: Mặt phẳng(S, B, D). Bước 2: Giao tuyến((SAC), (SBD)).'],
      steps: [
        { id: 's1', actionText: 'Dựng mặt phẳng (SBD).', mathExplanation: '(SBD) ⊥ (SAC).', addInput: { id: 'sol_sbd', kind: 'plane', rule: 'plane_three_points', parents: ['S', 'B', 'D'], label: '(SBD)' } },
        { id: 's2', actionText: 'Dựng giao tuyến SO của (SAC) và (SBD).', mathExplanation: 'SO là đường cao hình chóp đều.', addInput: { id: 'sol_so', kind: 'line', rule: 'intersect_plane_plane', parents: ['plSAC', 'sol_sbd'], label: 'SO' } },
      ],
      proof: 'Vì $BD \\perp (SAC)$ nên $(SBD) \\perp (SAC)$ và giao tuyến là đường cao $SO$.',
    },

    // =========================================================================
    // CẤP ĐỘ X: HÌNH CHIẾU VUÔNG GÓC (10 thử thách — Toán 11)
    // =========================================================================
    {
      levelId: 10, order: 1, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hình chiếu vuông góc của điểm lên mặt phẳng',
      title: 'Dựng hình chiếu vuông góc của S lên mặt phẳng (P)',
      description: 'Cho điểm $S$ và mặt phẳng $(P)$. Hãy dựng hình chiếu vuông góc $H$ của $S$ lên $(P)$.',
      hypothesis: 'Mặt phẳng $(P)$ và điểm $S \\notin (P)$.',
      goal: 'Dựng hình chiếu vuông góc $H$ của $S$ trên $(P)$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.5, -1.6, 0) }, { id: 'B', label: 'B', pos: v3(2.5, -1.4, 0.2) },
          { id: 'C', label: 'C', pos: v3(0, 2.4, 0.5) }, { id: 'S', label: 'S', pos: v3(0.5, -0.2, 3.6) },
        ]);
        return addGivenPlane3(sc, 'plP', 'A', 'B', 'C', '(P)', '#0F766E', 0.16);
      },
      rules: [{ type: 'has_foot_on_plane', refs: ['S', 'plP'], description: 'Dựng hình chiếu H của S lên (P).' }],
      perturb: ['A', 'B', 'C', 'S'],
      hints: ['H thuộc (P) sao cho SH ⊥ (P).', 'Chọn Hình chiếu lên mặt phẳng.', 'Nhấp điểm S rồi mặt phẳng (P).'],
      steps: [{ id: 's1', actionText: 'Dựng hình chiếu H của S lên (P).', mathExplanation: 'SH ⊥ (P) và H ∈ (P).', addInput: { id: 'sol_h', kind: 'point', rule: 'foot_point_plane', parents: ['S', 'plP'], label: 'H' } }],
      proof: 'Điểm $H$ là chân đường vuông góc duy nhất hạ từ $S$ xuống $(P)$.',
    },
    {
      levelId: 10, order: 2, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hình chiếu vuông góc của điểm lên đường thẳng',
      title: 'Dựng hình chiếu vuông góc của M lên đường thẳng d',
      description: 'Cho đường thẳng $d$ và điểm $M \\notin d$. Hãy dựng hình chiếu vuông góc $H$ của $M$ lên $d$.',
      hypothesis: 'Đường thẳng $d$ và điểm $M \\notin d$.',
      goal: 'Dựng hình chiếu $H$ của $M$ lên $d$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.4, -1, 0) }, { id: 'B', label: 'B', pos: v3(2.4, 1.2, 1.4) },
          { id: 'M', label: 'M', pos: v3(-0.3, 1.6, 2.8) },
        ]);
        return addGivenLine(sc, 'ld', 'A', 'B', 'd');
      },
      rules: [{ type: 'has_foot_on_line', refs: ['M', 'ld'], description: 'Dựng hình chiếu H của M lên d.' }],
      perturb: ['A', 'B', 'M'],
      hints: ['H thuộc d sao cho MH ⊥ d.', 'Chọn Hình chiếu lên đường thẳng.', 'Nhấp điểm M rồi đường thẳng d.'],
      steps: [{ id: 's1', actionText: 'Dựng hình chiếu H của M lên d.', mathExplanation: 'MH ⊥ d.', addInput: { id: 'sol_h', kind: 'point', rule: 'foot_point_line', parents: ['M', 'ld'], label: 'H' } }],
      proof: 'Hình chiếu vuông góc $H$ của $M$ trên $d$ thỏa $\\overrightarrow{MH} \\cdot \\vec{u}_d = 0$.',
    },
    {
      levelId: 10, order: 3, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Chân đường cao hình chóp đều',
      title: 'Dựng chân đường cao O và đường cao SO của hình chóp đều',
      description: 'Cho hình chóp tứ giác đều $S.ABCD$ có mặt đáy $(ABCD)$. Hãy dựng hình chiếu $O$ của $S$ lên $(ABCD)$ và nối đoạn $SO$.',
      hypothesis: 'Hình chóp đều $S.ABCD$ và đáy $(ABCD)$.',
      goal: 'Dựng chân đường cao $O$ và đoạn $SO$.',
      setup: () => buildPyramidABCDScene({ withBasePlane: true }),
      rules: [
        { type: 'has_foot_on_plane', refs: ['S', 'plABCD'], description: 'Dựng hình chiếu O của S lên (ABCD).' },
        { type: 'has_line_perp_plane_through', refs: ['S', 'plABCD'], description: 'Nối đường cao SO.' },
      ],
      hints: ['O trùng với tâm hình vuông ABCD.', 'Dùng Hình chiếu lên mặt phẳng(S, (ABCD)) rồi nối SO.', 'Bước 1: Hình chiếu(S, (ABCD)) → O. Bước 2: Đoạn thẳng(S, O).'],
      steps: [
        { id: 's1', actionText: 'Dựng hình chiếu O của S lên (ABCD).', mathExplanation: 'O là tâm đáy ABCD.', addInput: { id: 'sol_o', kind: 'point', rule: 'foot_point_plane', parents: ['S', 'plABCD'], label: 'O' } },
        { id: 's2', actionText: 'Nối đoạn thẳng SO.', mathExplanation: 'SO ⊥ (ABCD).', addInput: { id: 'sol_so', kind: 'segment', rule: 'segment_3d', parents: ['S', 'sol_o'], label: 'SO' } },
      ],
      proof: 'Hình chiếu vuông góc của đỉnh $S$ xuống đáy hình chóp đều trùng với tâm $O$ của đáy.',
    },
    {
      levelId: 10, order: 4, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hình chiếu vuông góc của đoạn thẳng lên mặt phẳng',
      title: 'Dựng hình chiếu vuông góc của đoạn thẳng MN lên (P)',
      description: 'Cho đoạn thẳng $MN$ và mặt phẳng $(P)$. Hãy dựng hình chiếu $M\', N\'$ của $M, N$ lên $(P)$ và nối đoạn chiếu $M\'N\'$.',
      hypothesis: 'Đoạn thẳng $MN$ và mặt phẳng $(P)$.',
      goal: 'Dựng $M\', N\'$ trên $(P)$ và nối đoạn thẳng $M\'N\'$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'A', label: 'A', pos: v3(-2.6, -2, 0) }, { id: 'B', label: 'B', pos: v3(2.6, -2, 0) },
          { id: 'C', label: 'C', pos: v3(0, 2.6, 0) }, { id: 'M', label: 'M', pos: v3(-1.4, -0.6, 2.2) },
          { id: 'N', label: 'N', pos: v3(1.6, 1.2, 3.2) },
        ]);
        sc = addGivenPlane3(sc, 'plP', 'A', 'B', 'C', '(P)', '#0F766E', 0.15);
        return addGivenSeg(sc, 'eMN', 'M', 'N', 'MN');
      },
      rules: [
        { type: 'has_foot_on_plane', refs: ['M', 'plP'], description: "Dựng hình chiếu M' của M." },
        { type: 'has_foot_on_plane', refs: ['N', 'plP'], description: "Dựng hình chiếu N' của N." },
      ],
      perturb: ['M', 'N'],
      hints: ['Hình chiếu đoạn thẳng nối hình chiếu hai đầu mút.', 'Dựng M\', N\' bằng Hình chiếu lên mặt phẳng rồi nối M\'N\'.', 'Bước 1 & 2: Hình chiếu(M, (P)), (N, (P)). Bước 3: Đoạn thẳng(M\', N\').'],
      steps: [
        { id: 's1', actionText: "Dựng hình chiếu M' của M lên (P).", mathExplanation: "MM' ⊥ (P).", addInput: { id: 'sol_m1', kind: 'point', rule: 'foot_point_plane', parents: ['M', 'plP'], label: "M'" } },
        { id: 's2', actionText: "Dựng hình chiếu N' của N lên (P).", mathExplanation: "NN' ⊥ (P).", addInput: { id: 'sol_n1', kind: 'point', rule: 'foot_point_plane', parents: ['N', 'plP'], label: "N'" } },
        { id: 's3', actionText: "Nối đoạn M'N'.", mathExplanation: "M'N' là hình chiếu của MN trên (P).", addInput: { id: 'sol_seg', kind: 'segment', rule: 'segment_3d', parents: ['sol_m1', 'sol_n1'], label: "M'N'" } },
      ],
      proof: 'Đoạn thẳng $M\'N\'$ là hình chiếu vuông góc của đoạn $MN$ lên $(P)$.',
    },
    {
      levelId: 10, order: 5, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hình chiếu vuông góc của cạnh bên lên đáy',
      title: 'Dựng hình chiếu cạnh bên SC lên mặt đáy (ABC)',
      description: 'Cho tứ diện $S.ABC$ có đáy $(ABC)$. Hãy dựng hình chiếu $H$ của $S$ lên $(ABC)$ và nối $HC$ là hình chiếu của $SC$.',
      hypothesis: 'Tứ diện $S.ABC$ và đáy $(ABC)$.',
      goal: 'Dựng hình chiếu $H$ của $S$ trên $(ABC)$ và đoạn thẳng $HC$.',
      setup: () => buildTetrahedronScene({ withBasePlane: true }),
      rules: [
        { type: 'has_foot_on_plane', refs: ['S', 'plABC'], description: 'Dựng hình chiếu H của S lên (ABC).' },
        { type: 'has_line_parallel_plane_through', refs: ['C', 'plABC'], description: 'Nối đoạn HC nằm trong (ABC).' },
      ],
      perturb: ['S'],
      hints: ['C nằm trên (ABC) nên hình chiếu của SC là HC.', 'Dựng H = Hình chiếu(S, (ABC)) rồi nối HC.', 'Bước 1: Hình chiếu(S, (ABC)) → H. Bước 2: Đoạn thẳng(H, C).'],
      steps: [
        { id: 's1', actionText: 'Dựng hình chiếu H của S lên (ABC).', mathExplanation: 'SH ⊥ (ABC).', addInput: { id: 'sol_h', kind: 'point', rule: 'foot_point_plane', parents: ['S', 'plABC'], label: 'H' } },
        { id: 's2', actionText: 'Nối đoạn thẳng HC.', mathExplanation: 'HC là hình chiếu của SC lên (ABC).', addInput: { id: 'sol_hc', kind: 'segment', rule: 'segment_3d', parents: ['sol_h', 'C'], label: 'HC' } },
      ],
      proof: 'Hình chiếu của $S, C$ lên $(ABC)$ lần lượt là $H, C$ nên hình chiếu của $SC$ là $HC$.',
    },
    {
      levelId: 10, order: 6, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Chiều cao của lăng trụ xiên',
      title: "Dựng hình chiếu đỉnh A' xuống mặt đáy lăng trụ xiên",
      description: "Cho lăng trụ xiên $ABC.A'B'C'$ có đáy $(ABC)$. Hãy dựng hình chiếu $H$ của $A'$ lên $(ABC)$ và nối đường cao $A'H$.",
      hypothesis: "Lăng trụ xiên $ABC.A'B'C'$ và đáy $(ABC)$.",
      goal: "Dựng hình chiếu $H$ của $A'$ trên $(ABC)$ và đoạn $A'H$.",
      setup: () => buildTriPrismScene({ right: false, withBasePlane: true }),
      rules: [
        { type: 'has_foot_on_plane', refs: ['A1', 'plABC'], description: "Dựng hình chiếu H của A' lên (ABC)." },
        { type: 'has_line_perp_plane_through', refs: ['A1', 'plABC'], description: "Nối đường cao A'H." },
      ],
      hints: ["Độ dài A'H là chiều cao lăng trụ xiên.", "Dựng H = Hình chiếu(A', (ABC)) rồi nối A'H.", "Bước 1: Hình chiếu(A', (ABC)) → H. Bước 2: Đoạn thẳng(A', H)."],
      steps: [
        { id: 's1', actionText: "Dựng hình chiếu H của A' lên (ABC).", mathExplanation: "A'H ⊥ (ABC).", addInput: { id: 'sol_h', kind: 'point', rule: 'foot_point_plane', parents: ['A1', 'plABC'], label: 'H' } },
        { id: 's2', actionText: "Nối đoạn thẳng A'H.", mathExplanation: "A'H là đường cao lăng trụ.", addInput: { id: 'sol_ah', kind: 'segment', rule: 'segment_3d', parents: ['A1', 'sol_h'], label: "A'H" } },
      ],
      proof: "Đoạn $A'H \\perp (ABC)$ là chiều cao của lăng trụ xiên $ABC.A'B'C'$.",
    },
    {
      levelId: 10, order: 7, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hình chiếu của chân đường cao lên mặt bên hình chóp',
      title: 'Dựng hình chiếu của A lên mặt bên (SBC)',
      description: 'Cho hình chóp $S.ABCD$ đáy vuông có $SA \\perp (ABCD)$ và mặt phẳng $(SBC)$. Hãy dựng hình chiếu vuông góc $H$ của $A$ lên $(SBC)$.',
      hypothesis: 'Hình chóp $S.ABCD$ ($SA \\perp (ABCD)$) và $(SBC)$.',
      goal: 'Dựng hình chiếu $H$ của $A$ lên $(SBC)$.',
      setup: () => addGivenPlane3(buildPyramidABCDScene({ saPerpBase: true }), 'plSBC', 'S', 'B', 'C', '(SBC)', '#0284C7', 0.14),
      rules: [{ type: 'has_foot_on_plane', refs: ['A', 'plSBC'], description: 'Dựng hình chiếu H của A trên (SBC).' }],
      hints: ['Vì BC ⊥ (SAB) nên hình chiếu H nằm ngay trên cạnh SB.', 'Chọn Hình chiếu lên mặt phẳng.', 'Nhấp A rồi (SBC).'],
      steps: [{ id: 's1', actionText: 'Dựng hình chiếu H của A lên (SBC).', mathExplanation: 'AH ⊥ SB và AH ⊥ BC nên AH ⊥ (SBC).', addInput: { id: 'sol_h', kind: 'point', rule: 'foot_point_plane', parents: ['A', 'plSBC'], label: 'H' } }],
      proof: 'Vì $(SAB) \\perp (SBC)$ theo giao tuyến $SB$ nên $AH \\perp SB \\Rightarrow AH \\perp (SBC)$.',
    },
    {
      levelId: 10, order: 8, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tính bảo toàn trung điểm của phép chiếu vuông góc',
      title: 'Chiếu vuông góc S, M, N xuống mặt phẳng đáy (ABC)',
      description: 'Cho tứ diện $S.ABC$ với mặt đáy $(ABC)$, $M$ là trung điểm $SA$, $N$ là trung điểm $SB$. Hãy dựng hình chiếu vuông góc của $S, M, N$ lên $(ABC)$.',
      hypothesis: 'Tứ diện $S.ABC$, đáy $(ABC)$ và hai trung điểm $M, N$.',
      goal: 'Dựng ba hình chiếu $S\', M\', N\'$ trên $(ABC)$.',
      setup: () => {
        let sc = buildTetrahedronScene({ withBasePlane: true });
        sc = addGeo3DObject(sc, { id: 'M', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'A'], label: 'M', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
        return addGeo3DObject(sc, { id: 'N', kind: 'point', rule: 'midpoint_3d', parents: ['S', 'B'], label: 'N', style: { color: '#D97706', isGiven: true }, skipLog: true }).scene;
      },
      rules: [
        { type: 'has_foot_on_plane', refs: ['S', 'plABC'], description: "Dựng S' trên (ABC)." },
        { type: 'has_foot_on_plane', refs: ['M', 'plABC'], description: "Dựng M' trên (ABC)." },
        { type: 'has_foot_on_plane', refs: ['N', 'plABC'], description: "Dựng N' trên (ABC)." },
      ],
      perturb: ['S'],
      hints: ['Dùng Hình chiếu lên mặt phẳng lần lượt cho S, M, N.', 'M\' và N\' là trung điểm AS\' và BS\'.', 'Chọn (S, (ABC)), (M, (ABC)), (N, (ABC)).'],
      steps: [
        { id: 's1', actionText: "Dựng hình chiếu S' của S.", mathExplanation: "SS' ⊥ (ABC).", addInput: { id: 'sol_s1', kind: 'point', rule: 'foot_point_plane', parents: ['S', 'plABC'], label: "S'" } },
        { id: 's2', actionText: "Dựng hình chiếu M' của M.", mathExplanation: "M' là trung điểm AS'.", addInput: { id: 'sol_m1', kind: 'point', rule: 'foot_point_plane', parents: ['M', 'plABC'], label: "M'" } },
        { id: 's3', actionText: "Dựng hình chiếu N' của N.", mathExplanation: "N' là trung điểm BS'.", addInput: { id: 'sol_n1', kind: 'point', rule: 'foot_point_plane', parents: ['N', 'plABC'], label: "N'" } },
      ],
      proof: 'Phép chiếu vuông góc bảo toàn tính thẳng hàng và trung điểm đoạn thẳng.',
    },
    {
      levelId: 10, order: 9, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Hình chiếu lên mặt phẳng tọa độ và trục tọa độ',
      title: 'Dựng hình chiếu của M(3; 2; 4) lên (Oxy) và trục Ox',
      description: 'Trong $Oxyz$, cho điểm $M(3; 2; 4)$, mặt phẳng $(Oxy)$ và trục $Ox$. Hãy dựng hình chiếu $H$ lên $(Oxy)$ và hình chiếu $P$ lên trục $Ox$.',
      hypothesis: 'Điểm $M(3; 2; 4)$, $(Oxy)$ và $Ox$.',
      goal: 'Dựng $H(3; 2; 0)$ và $P(3; 0; 0)$.',
      setup: () => {
        let sc = givenPointsScene([
          { id: 'O', label: 'O', pos: v3(0, 0, 0) }, { id: 'X', label: 'I', pos: v3(4, 0, 0) },
          { id: 'Y', label: 'J', pos: v3(0, 4, 0) }, { id: 'M', label: 'M', pos: v3(3, 2, 4) },
        ], 'oxyz', true);
        sc = addGivenPlane3(sc, 'plOxy', 'O', 'X', 'Y', '(Oxy)', '#0F766E', 0.14);
        return addGivenLine(sc, 'lOx', 'O', 'X', 'Ox', '#DC2626');
      },
      rules: [
        { type: 'has_foot_on_plane', refs: ['M', 'plOxy'], description: 'Dựng H(3; 2; 0) trên (Oxy).' },
        { type: 'has_foot_on_line', refs: ['M', 'lOx'], description: 'Dựng P(3; 0; 0) trên Ox.' },
      ],
      hints: ['Hình chiếu của M(x; y; z) lên (Oxy) là (x; y; 0) và lên Ox là (x; 0; 0).', 'Dùng Hình chiếu lên mặt phẳng và Hình chiếu lên đường thẳng.', 'Bước 1: Hình chiếu(M, (Oxy)). Bước 2: Hình chiếu(M, Ox).'],
      steps: [
        { id: 's1', actionText: 'Dựng hình chiếu H của M lên (Oxy).', mathExplanation: 'H = (3; 2; 0).', addInput: { id: 'sol_h', kind: 'point', rule: 'foot_point_plane', parents: ['M', 'plOxy'], label: 'H' } },
        { id: 's2', actionText: 'Dựng hình chiếu P của M lên Ox.', mathExplanation: 'P = (3; 0; 0).', addInput: { id: 'sol_p', kind: 'point', rule: 'foot_point_line', parents: ['M', 'lOx'], label: 'P' } },
      ],
      proof: 'Chiếu $M(3; 2; 4)$ xuống $(Oxy)$ cho $H(3; 2; 0)$, xuống $Ox$ cho $P(3; 0; 0)$.',
    },
    {
      levelId: 10, order: 10, curriculumTag: 'Toán 11',
      knowledgeTopic: 'Tổng hợp hình chiếu vuông góc lên mặt chéo hình chóp',
      title: 'Dựng hình chiếu của A lên (SBD) và đo khoảng cách AH',
      description: 'Cho hình chóp $S.ABCD$ đáy vuông có $SA \\perp (ABCD)$ và mặt phẳng $(SBD)$. Hãy dựng hình chiếu vuông góc $H$ của $A$ lên $(SBD)$ và đo khoảng cách $d(A, (SBD))$.',
      hypothesis: 'Hình chóp $S.ABCD$ ($SA \\perp (ABCD)$) và $(SBD)$.',
      goal: 'Dựng hình chiếu $H$ của $A$ trên $(SBD)$ và đo $d(A, (SBD))$.',
      setup: () => addGivenPlane3(buildPyramidABCDScene({ saPerpBase: true }), 'plSBD', 'S', 'B', 'D', '(SBD)', '#7C3AED', 0.14),
      rules: [
        { type: 'has_foot_on_plane', refs: ['A', 'plSBD'], description: 'Dựng hình chiếu H của A lên (SBD).' },
        { type: 'has_measurement_of_rule', refs: [], params: { rule: 'measure_distance_pplane' }, description: 'Đo d(A, (SBD)).' },
      ],
      hints: ['H nằm trên đoạn SO với O là tâm đáy.', 'Dùng Hình chiếu lên mặt phẳng(A, (SBD)) và Khoảng cách điểm – mặt phẳng.', 'Bước 1: Hình chiếu(A, (SBD)). Bước 2: Khoảng cách điểm – mặt phẳng(A, (SBD)).'],
      steps: [
        { id: 's1', actionText: 'Dựng hình chiếu H của A lên (SBD).', mathExplanation: 'AH ⊥ (SBD).', addInput: { id: 'sol_h', kind: 'point', rule: 'foot_point_plane', parents: ['A', 'plSBD'], label: 'H' } },
        { id: 's2', actionText: 'Đo khoảng cách từ A tới (SBD).', mathExplanation: 'd(A, (SBD)) = AH.', addInput: { id: 'sol_d', kind: 'measurement', rule: 'measure_distance_pplane', parents: ['A', 'plSBD'], label: 'd(A,(SBD))', metricKind: 'distance' } },
      ],
      proof: 'Vì $BD \\perp (SAC)$ nên đường cao $AH$ của $\\triangle SAO$ vuông góc với $(SBD)$.',
    },
  ];

  return specs.map(makeChallenge3D);
}
