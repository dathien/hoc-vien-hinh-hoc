import { ALL_CHALLENGES, getChallengeProgramLabel } from '../challenges';
import { TEMPLATES_2D } from '../geometry/templates2d';
import { ALL_CHALLENGES_3D } from '../geometry3d/challenges3d';
import { TEMPLATES_3D } from '../geometry3d/templates3d';
import { ARENA_THPT_PROBLEMS } from './arenaProblems';

export type ThptGrade = '10' | '11' | '12';
export type ThptGradeFilter = 'all' | ThptGrade;

export interface ThptGradeMeta {
  grade: ThptGrade;
  label: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  textbook: string;
  accentHex: string;
  badgeClass: string;
  focusAreas: string[];
  primaryDimension: '2d' | '3d';
  defaultTemplateId: string;
  defaultChallengeId: string;
}

export interface ThptChapter {
  id: string;
  grade: ThptGrade;
  volume: 'Tập 1' | 'Tập 2';
  roman: string;
  title: string;
  summary: string;
}

export type LessonContentCategory =
  | 'Khái niệm và định nghĩa'
  | 'Tính chất hình học'
  | 'Định lí và hệ quả'
  | 'Phương pháp dựng hình';

export interface ThptLesson {
  id: string;
  grade: ThptGrade;
  chapterId: string;
  chapterTitle: string;
  lessonNumber: number;
  title: string;
  summary: string;
  keyFormulas: string[];
  theorem: string;
  hypothesis: string;
  conclusion: string;
  method: string;
  example: string;
  interactiveNote: string;
  dimension: '2d' | '3d';
  templateId: string;
  challengeId: string;
  categories: LessonContentCategory[];
}

export const THPT_GRADE_ORDER: ThptGrade[] = ['10', '11', '12'];

export const THPT_GRADE_FILTER_OPTIONS: Array<{ id: ThptGradeFilter; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: '10', label: 'Toán 10' },
  { id: '11', label: 'Toán 11' },
  { id: '12', label: 'Toán 12' },
];

export const THPT_GRADE_META: Record<ThptGrade, ThptGradeMeta> = {
  '10': {
    grade: '10',
    label: 'Toán 10',
    shortLabel: 'Lớp 10',
    title: 'Toán 10 – Hình học phẳng và tọa độ',
    subtitle: 'Hệ thức lượng trong tam giác, Vectơ và Phương pháp tọa độ trong mặt phẳng Oxy (đường thẳng, đường tròn, ba đường conic).',
    textbook: 'SGK Toán 10 – Kết nối tri thức với cuộc sống (GDPT 2018)',
    accentHex: '#0F766E',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800',
    focusAreas: ['Hệ thức lượng trong tam giác', 'Vectơ & Tích vô hướng', 'Đường thẳng, Đường tròn & Ba đường conic'],
    primaryDimension: '2d',
    defaultTemplateId: 'tpl2d_t10_law_cosines',
    defaultChallengeId: 'L01_C01',
  },
  '11': {
    grade: '11',
    label: 'Toán 11',
    shortLabel: 'Lớp 11',
    title: 'Toán 11 – Hình học không gian',
    subtitle: 'Quan hệ song song, phép chiếu song song, quan hệ vuông góc, góc nhị diện, khoảng cách, thiết diện và thể tích khối đa diện.',
    textbook: 'SGK Toán 11 – Kết nối tri thức với cuộc sống (GDPT 2018)',
    accentHex: '#0284C7',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800',
    focusAreas: ['Quan hệ song song & Thiết diện', 'Quan hệ vuông góc & Góc nhị diện', 'Khoảng cách & Thể tích'],
    primaryDimension: '3d',
    defaultTemplateId: 'T3D_21',
    defaultChallengeId: 'S3D_L01_C01',
  },
  '12': {
    grade: '12',
    label: 'Toán 12',
    shortLabel: 'Lớp 12',
    title: 'Toán 12 – Vectơ và tọa độ trong không gian',
    subtitle: 'Vectơ trong không gian, hệ trục tọa độ Oxyz, phương trình mặt phẳng, phương trình đường thẳng, công thức góc và mặt cầu.',
    textbook: 'SGK Toán 12 – Kết nối tri thức với cuộc sống (GDPT 2018)',
    accentHex: '#7C3AED',
    badgeClass: 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800',
    focusAreas: ['Vectơ & Hệ trục Oxyz', 'Phương trình mặt phẳng & đường thẳng', 'Công thức góc & Mặt cầu'],
    primaryDimension: '3d',
    defaultTemplateId: 'T3D_33',
    defaultChallengeId: 'S3D_L14_C01',
  },
};

export const THPT_CHAPTERS: ThptChapter[] = [
  // ==================== TOÁN 10 (3 CHƯƠNG) ====================
  {
    id: 'ch10_3',
    grade: '10',
    volume: 'Tập 1',
    roman: 'III',
    title: 'Chương III. Hệ thức lượng trong tam giác',
    summary: 'Giá trị lượng giác góc từ 0° đến 180°, định lí côsin, định lí sin, công thức diện tích và giải tam giác.',
  },
  {
    id: 'ch10_4',
    grade: '10',
    volume: 'Tập 1',
    roman: 'IV',
    title: 'Chương IV. Vectơ',
    summary: 'Khái niệm vectơ, tổng – hiệu, tích vectơ với một số, tọa độ vectơ trong mặt phẳng Oxy và tích vô hướng.',
  },
  {
    id: 'ch10_7',
    grade: '10',
    volume: 'Tập 2',
    roman: 'VII',
    title: 'Chương VII. Phương pháp tọa độ trong mặt phẳng',
    summary: 'Phương trình đường thẳng, vị trí tương đối, góc, khoảng cách, phương trình đường tròn và ba đường conic.',
  },

  // ==================== TOÁN 11 (2 CHƯƠNG) ====================
  {
    id: 'ch11_4',
    grade: '11',
    volume: 'Tập 1',
    roman: 'IV',
    title: 'Chương IV. Quan hệ song song trong không gian',
    summary: 'Đường thẳng và mặt phẳng trong không gian, hai đường thẳng song song, đường song song mặt, hai mặt song song và phép chiếu song song.',
  },
  {
    id: 'ch11_7',
    grade: '11',
    volume: 'Tập 2',
    roman: 'VII',
    title: 'Chương VII. Quan hệ vuông góc trong không gian',
    summary: 'Hai đường thẳng vuông góc, đường vuông góc mặt, phép chiếu vuông góc, góc đường – mặt, hai mặt vuông góc – góc nhị diện, khoảng cách và thể tích.',
  },

  // ==================== TOÁN 12 (2 CHƯƠNG) ====================
  {
    id: 'ch12_2',
    grade: '12',
    volume: 'Tập 1',
    roman: 'II',
    title: 'Chương II. Vectơ và hệ trục tọa độ trong không gian',
    summary: 'Vectơ và các phép toán vectơ trong không gian, hệ trục tọa độ Oxyz và biểu thức tọa độ của các phép toán vectơ.',
  },
  {
    id: 'ch12_5',
    grade: '12',
    volume: 'Tập 2',
    roman: 'V',
    title: 'Chương V. Phương pháp tọa độ trong không gian',
    summary: 'Phương trình mặt phẳng, phương trình đường thẳng trong không gian, công thức tính góc trong không gian và phương trình mặt cầu.',
  },
];

/**
 * 29 bài học Hình học chính thức bám sát mục lục SGK Toán 10, 11, 12
 * bộ Kết nối tri thức với cuộc sống (Chương trình GDPT 2018).
 */
export const THPT_LESSONS: ThptLesson[] = [
  // ==================== TOÁN 10 – CHƯƠNG III (2 BÀI) ====================
  {
    id: 't10_b05',
    grade: '10',
    chapterId: 'ch10_3',
    chapterTitle: 'Chương III. Hệ thức lượng trong tam giác',
    lessonNumber: 5,
    title: 'Bài 5. Giá trị lượng giác của một góc từ 0° đến 180°',
    summary: 'Định nghĩa sin, côsin, tang, côtang trên nửa đường tròn đơn vị và mối liên hệ giữa hai góc bù nhau, phụ nhau.',
    keyFormulas: [
      'M(x_0; y_0) \\in \\text{nửa đường tròn đơn vị} \\Rightarrow \\cos\\alpha = x_0,\\; \\sin\\alpha = y_0',
      '\\sin(180^\\circ - \\alpha) = \\sin\\alpha,\\quad \\cos(180^\\circ - \\alpha) = -\\cos\\alpha',
      '\\sin^2\\alpha + \\cos^2\\alpha = 1,\\quad \\tan\\alpha\\cdot\\cot\\alpha = 1',
    ],
    theorem: 'Với mỗi góc $\\alpha$ ($0^\\circ \\le \\alpha \\le 180^\\circ$), tồn tại duy nhất điểm $M(x_0; y_0)$ trên nửa đường tròn đơn vị sao cho $\\widehat{xOM} = \\alpha$. Khi đó $\\sin\\alpha = y_0$, $\\cos\\alpha = x_0$, $\\tan\\alpha = \\dfrac{y_0}{x_0}$ ($\\alpha \\ne 90^\\circ$), $\\cot\\alpha = \\dfrac{x_0}{y_0}$ ($0^\\circ < \\alpha < 180^\\circ$).',
    hypothesis: 'Góc $\\alpha \\in [0^\\circ; 180^\\circ]$ và điểm $M(x_0; y_0)$ trên nửa đường tròn đơn vị tâm $O$, bán kính $R = 1$.',
    conclusion: 'Hoành độ $x_0$ xác định $\\cos\\alpha$ (âm khi $\\alpha$ là góc tù), tung độ $y_0 \\ge 0$ xác định $\\sin\\alpha$.',
    method: 'Dựng nửa đường tròn đơn vị trên hệ trục $Oxy$, xác định tia $OM$ hợp với $Ox$ góc $\\alpha$, rồi chiếu vuông góc $M$ xuống $Ox$ và $Oy$ để đọc trực tiếp $\\cos\\alpha$ và $\\sin\\alpha$.',
    example: 'Với $\\alpha = 150^\\circ$: do $150^\\circ = 180^\\circ - 30^\\circ$ nên $\\sin 150^\\circ = \\sin 30^\\circ = \\dfrac{1}{2}$ và $\\cos 150^\\circ = -\\cos 30^\\circ = -\\dfrac{\\sqrt{3}}{2}$.',
    interactiveNote: 'Kéo điểm M dọc theo đường tròn đơn vị để quan sát hình chiếu cos α và sin α thay đổi dấu khi vượt qua góc 90°.',
    dimension: '2d',
    templateId: 'tpl2d_t10_unit_semicircle',
    challengeId: 'L03_C03',
    categories: ['Khái niệm và định nghĩa', 'Tính chất hình học'],
  },
  {
    id: 't10_b06',
    grade: '10',
    chapterId: 'ch10_3',
    chapterTitle: 'Chương III. Hệ thức lượng trong tam giác',
    lessonNumber: 6,
    title: 'Bài 6. Hệ thức lượng trong tam giác',
    summary: 'Định lí côsin, định lí sin, năm công thức tính diện tích tam giác và bài toán giải tam giác ứng dụng thực tiễn.',
    keyFormulas: [
      'a^2 = b^2 + c^2 - 2bc\\cos A,\\quad \\cos A = \\frac{b^2 + c^2 - a^2}{2bc}',
      '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C} = 2R',
      'S = \\frac{1}{2}bc\\sin A = \\frac{abc}{4R} = pr = \\sqrt{p(p-a)(p-b)(p-c)}',
    ],
    theorem: 'Trong tam giác $ABC$ với $BC=a, CA=b, AB=c$ và bán kính ngoại tiếp $R$: bình phương một cạnh bằng tổng bình phương hai cạnh còn lại trừ hai lần tích của chúng với côsin góc xen giữa; đồng thời tỉ số cạnh trên sin góc đối diện bằng $2R$.',
    hypothesis: 'Tam giác $ABC$ có ba cạnh $a, b, c$, ba góc $A, B, C$, nửa chu vi $p$, bán kính ngoại tiếp $R$ và nội tiếp $r$.',
    conclusion: 'Tính được các cạnh, góc, diện tích và bán kính $R, r$ từ 3 yếu tố độc lập (trong đó có ít nhất một cạnh).',
    method: 'Nếu biết hai cạnh và góc xen giữa (hoặc ba cạnh) thì dùng định lí côsin; nếu biết một cạnh và hai góc (hoặc hai cạnh và góc đối) thì dùng định lí sin.',
    example: 'Cho $\\triangle ABC$ có $b = 8, c = 5, \\widehat{A} = 60^\\circ$. Ta có $a = \\sqrt{64 + 25 - 2\\cdot 8\\cdot 5\\cdot 0{,}5} = 7$ và $S = \\dfrac{1}{2}\\cdot 8\\cdot 5\\cdot\\dfrac{\\sqrt{3}}{2} = 10\\sqrt{3}$.',
    interactiveNote: 'Kéo các đỉnh A, B, C để quan sát góc A, đường cao AH và kiểm nghiệm trực quan định lí côsin.',
    dimension: '2d',
    templateId: 'tpl2d_t10_law_cosines',
    challengeId: 'L06_C01',
    categories: ['Định lí và hệ quả', 'Phương pháp dựng hình'],
  },

  // ==================== TOÁN 10 – CHƯƠNG IV (5 BÀI) ====================
  {
    id: 't10_b07',
    grade: '10',
    chapterId: 'ch10_4',
    chapterTitle: 'Chương IV. Vectơ',
    lessonNumber: 7,
    title: 'Bài 7. Các khái niệm mở đầu',
    summary: 'Định nghĩa vectơ, giá của vectơ, hai vectơ cùng phương, cùng hướng, bằng nhau và vectơ-không.',
    keyFormulas: [
      '\\overrightarrow{AB} = \\overrightarrow{CD} \\Leftrightarrow ABDC \\text{ là hình bình hành (nếu không thẳng hàng)}',
      '|\\overrightarrow{AB}| = AB,\\quad |\\vec{0}| = 0',
    ],
    theorem: 'Vectơ là một đoạn thẳng có hướng. Hai vectơ bằng nhau khi và chỉ khi chúng có cùng hướng và cùng độ dài.',
    hypothesis: 'Các điểm phân biệt $A, B, C, D$ trong mặt phẳng.',
    conclusion: 'Hai vectơ $\\overrightarrow{AB}, \\overrightarrow{CD}$ cùng phương khi giá của chúng song song hoặc trùng nhau; chúng bằng nhau khi cùng hướng và $AB = CD$.',
    method: 'Từ một điểm $O$ bất kì và vectơ $\\vec{a}$ cho trước, luôn dựng được duy nhất điểm $A$ sao cho $\\overrightarrow{OA} = \\vec{a}$ bằng cách dựng đường song song và chuyển độ dài.',
    example: 'Trong hình bình hành $ABCD$, ta có $\\overrightarrow{AB} = \\overrightarrow{DC}$ và $\\overrightarrow{AD} = \\overrightarrow{BC}$, còn $\\overrightarrow{AB}$ và $\\overrightarrow{CD}$ là hai vectơ đối nhau.',
    interactiveNote: 'Kéo các đỉnh O, A, B trong hình bình hành OACB để quan sát các cặp vectơ bằng nhau luôn song song và cùng độ dài.',
    dimension: '2d',
    templateId: 'tpl2d_t10_vector_parallelogram',
    challengeId: 'L04_C07',
    categories: ['Khái niệm và định nghĩa', 'Tính chất hình học'],
  },
  {
    id: 't10_b08',
    grade: '10',
    chapterId: 'ch10_4',
    chapterTitle: 'Chương IV. Vectơ',
    lessonNumber: 8,
    title: 'Bài 8. Tổng và hiệu của hai vectơ',
    summary: 'Quy tắc ba điểm, quy tắc hình bình hành, tính chất phép cộng vectơ và hiệu hai vectơ.',
    keyFormulas: [
      '\\overrightarrow{AB} + \\overrightarrow{BC} = \\overrightarrow{AC}\\quad (\\text{Quy tắc ba điểm})',
      '\\overrightarrow{OA} + \\overrightarrow{OB} = \\overrightarrow{OC}\\quad (OACB \\text{ là hình bình hành})',
      '\\overrightarrow{OB} - \\overrightarrow{OA} = \\overrightarrow{AB}',
    ],
    theorem: 'Tổng hai vectơ thỏa mãn tính chất giao hoán, kết hợp và quy tắc hình bình hành; hiệu $\\vec{a} - \\vec{b}$ là tổng của $\\vec{a}$ với vectơ đối $-\\vec{b}$.',
    hypothesis: 'Ba điểm $A, B, C$ bất kì hoặc hình bình hành $OACB$.',
    conclusion: 'Vectơ tổng nối từ gốc đầu đến ngọn cuối; vectơ hiệu nối từ ngọn vectơ trừ đến ngọn vectơ bị trừ khi chung gốc.',
    method: 'Để dựng $\\overrightarrow{OA} + \\overrightarrow{OB}$, dựng hai đường thẳng song song tạo hình bình hành $OACB$, đường chéo $\\overrightarrow{OC}$ chính là vectơ tổng.',
    example: 'Trong hình chữ nhật $ABCD$ có $AB = 3, AD = 4$, ta có $|\\overrightarrow{AB} + \\overrightarrow{AD}| = |\\overrightarrow{AC}| = 5$.',
    interactiveNote: 'Kéo điểm A hoặc B để quan sát đồng thời đường chéo tổng OC = OA + OB và đường chéo hiệu BA = OA - OB.',
    dimension: '2d',
    templateId: 'tpl2d_t10_vector_parallelogram',
    challengeId: 'L04_C08',
    categories: ['Tính chất hình học', 'Phương pháp dựng hình'],
  },
  {
    id: 't10_b09',
    grade: '10',
    chapterId: 'ch10_4',
    chapterTitle: 'Chương IV. Vectơ',
    lessonNumber: 9,
    title: 'Bài 9. Tích của một vectơ với một số',
    summary: 'Định nghĩa $k\\vec{a}$, điều kiện hai vectơ cùng phương, hệ thức trung điểm và hệ thức trọng tâm tam giác.',
    keyFormulas: [
      '|k\\vec{a}| = |k|\\cdot|\\vec{a}|',
      'I \\text{ là trung điểm } AB \\Leftrightarrow \\overrightarrow{MA} + \\overrightarrow{MB} = 2\\overrightarrow{MI}',
      'G \\text{ là trọng tâm } \\triangle ABC \\Leftrightarrow \\overrightarrow{MA} + \\overrightarrow{MB} + \\overrightarrow{MC} = 3\\overrightarrow{MG}',
    ],
    theorem: 'Hai vectơ $\\vec{a}$ và $\\vec{b}$ ($\\vec{b} \\ne \\vec{0}$) cùng phương khi và chỉ khi tồn tại số thực $k$ sao cho $\\vec{a} = k\\vec{b}$.',
    hypothesis: 'Số thực $k \\in \\mathbb{R}$, vectơ $\\vec{a}$, trung điểm $I$ của $AB$ và trọng tâm $G$ của $\\triangle ABC$.',
    conclusion: 'Nếu $k > 0$ thì $k\\vec{a}$ cùng hướng $\\vec{a}$; nếu $k < 0$ thì $k\\vec{a}$ ngược hướng $\\vec{a}$. Hệ thức trung điểm và trọng tâm đúng với mọi điểm $M$.',
    method: 'Để chứng minh ba điểm $A, B, C$ thẳng hàng, biểu diễn $\\overrightarrow{AB} = k\\overrightarrow{AC}$ thông qua hai vectơ không cùng phương gốc.',
    example: 'Với $M$ là trung điểm $BC$ của $\\triangle ABC$ và $G$ là trọng tâm, ta có $\\overrightarrow{AG} = \\dfrac{2}{3}\\overrightarrow{AM} = \\dfrac{1}{3}(\\overrightarrow{AB} + \\overrightarrow{AC})$.',
    interactiveNote: 'Kéo điểm O hoặc hai đầu mút A, B để thấy trung điểm I và trọng tâm G của tam giác OAB luôn giữ tỉ lệ 2/3.',
    dimension: '2d',
    templateId: 'tpl2d_t10_vector_scale_midpoint',
    challengeId: 'L07_C01',
    categories: ['Định lí và hệ quả', 'Tính chất hình học'],
  },
  {
    id: 't10_b10',
    grade: '10',
    chapterId: 'ch10_4',
    chapterTitle: 'Chương IV. Vectơ',
    lessonNumber: 10,
    title: 'Bài 10. Vectơ trong mặt phẳng tọa độ',
    summary: 'Hệ trục tọa độ Oxy, tọa độ điểm, tọa độ vectơ và biểu thức tọa độ của phép cộng, trừ, nhân số với vectơ.',
    keyFormulas: [
      '\\vec{u} = x\\vec{i} + y\\vec{j} \\Leftrightarrow \\vec{u} = (x; y)',
      '\\overrightarrow{AB} = (x_B - x_A;\\; y_B - y_A),\\quad AB = \\sqrt{(x_B-x_A)^2 + (y_B-y_A)^2}',
      'I\\left(\\frac{x_A+x_B}{2};\\frac{y_A+y_B}{2}\\right),\\quad G\\left(\\frac{x_A+x_B+x_C}{3};\\frac{y_A+y_B+y_C}{3}\\right)',
    ],
    theorem: 'Trong mặt phẳng tọa độ $Oxy$, mỗi vectơ $\\vec{u}$ được biểu diễn duy nhất dưới dạng $\\vec{u} = x\\vec{i} + y\\vec{j}$, và các phép toán vectơ chuyển trực tiếp thành phép toán đại số trên từng tọa độ.',
    hypothesis: 'Hệ trục tọa độ vuông góc $Oxy$ với cặp vectơ đơn vị $\\vec{i}, \\vec{j}$ và các điểm $A(x_A; y_A), B(x_B; y_B)$.',
    conclusion: 'Hai vectơ $\\vec{u}(x_1; y_1)$ và $\\vec{v}(x_2; y_2)$ cùng phương khi và chỉ khi $x_1 y_2 - x_2 y_1 = 0$.',
    method: 'Đưa bài toán hình học phẳng về tọa độ để kiểm tra thẳng hàng, tìm trung điểm, trọng tâm, đỉnh thứ tư hình bình hành và tính độ dài.',
    example: 'Cho $A(1; 2), B(4; 6)$. Khi đó $\\overrightarrow{AB} = (3; 4)$, độ dài $AB = \\sqrt{3^2 + 4^2} = 5$ và trung điểm $I(2{,}5; 4)$.',
    interactiveNote: 'Kéo các đỉnh tam giác ABC để quan sát ba trung tuyến đồng quy tại trọng tâm G — đúng bằng trung bình cộng tọa độ ba đỉnh.',
    dimension: '2d',
    templateId: 'tpl2d_medians_centroid',
    challengeId: 'L09_C07',
    categories: ['Khái niệm và định nghĩa', 'Tính chất hình học'],
  },
  {
    id: 't10_b11',
    grade: '10',
    chapterId: 'ch10_4',
    chapterTitle: 'Chương IV. Vectơ',
    lessonNumber: 11,
    title: 'Bài 11. Tích vô hướng của hai vectơ',
    summary: 'Góc giữa hai vectơ, định nghĩa tích vô hướng, biểu thức tọa độ và ứng dụng kiểm tra vuông góc, tính góc.',
    keyFormulas: [
      '\\vec{u}\\cdot\\vec{v} = |\\vec{u}|\\cdot|\\vec{v}|\\cos(\\vec{u}, \\vec{v}) = x_1 x_2 + y_1 y_2',
      '\\vec{u} \\perp \\vec{v} \\Leftrightarrow \\vec{u}\\cdot\\vec{v} = 0 \\Leftrightarrow x_1 x_2 + y_1 y_2 = 0',
      '\\cos(\\vec{u}, \\vec{v}) = \\frac{x_1 x_2 + y_1 y_2}{\\sqrt{x_1^2 + y_1^2}\\sqrt{x_2^2 + y_2^2}}',
    ],
    theorem: 'Tích vô hướng của hai vectơ khác $\\vec{0}$ bằng tích độ dài của chúng nhân côsin góc xen giữa, và trong hệ tọa độ $Oxy$ bằng tổng tích các tọa độ tương ứng.',
    hypothesis: 'Hai vectơ $\\vec{u}(x_1; y_1)$ và $\\vec{v}(x_2; y_2)$ trong mặt phẳng $Oxy$.',
    conclusion: 'Tích vô hướng dương khi góc nhọn, bằng $0$ khi hai vectơ vuông góc và âm khi góc tù.',
    method: 'Sử dụng hình chiếu vuông góc $H$ của $A$ lên $OB$ để nhận diện dấu tích vô hướng; dùng biểu thức tọa độ để tính góc và chứng minh vuông góc.',
    example: 'Với $\\vec{u} = (2; 1)$ và $\\vec{v} = (-1; 2)$: $\\vec{u}\\cdot\\vec{v} = 2(-1) + 1\\cdot 2 = 0$, suy ra $\\vec{u} \\perp \\vec{v}$.',
    interactiveNote: 'Kéo điểm A qua lại phía trên điểm O để quan sát góc φ thay đổi giữa nhọn – vuông – tù và hình chiếu OH đổi chiều.',
    dimension: '2d',
    templateId: 'tpl2d_t10_dot_product_proj',
    challengeId: 'L02_C04',
    categories: ['Định lí và hệ quả', 'Tính chất hình học'],
  },

  // ==================== TOÁN 10 – CHƯƠNG VII (4 BÀI) ====================
  {
    id: 't10_b19',
    grade: '10',
    chapterId: 'ch10_7',
    chapterTitle: 'Chương VII. Phương pháp tọa độ trong mặt phẳng',
    lessonNumber: 19,
    title: 'Bài 19. Phương trình đường thẳng',
    summary: 'Phương trình tổng quát (từ vectơ pháp tuyến) và phương trình tham số (từ vectơ chỉ phương) của đường thẳng trong Oxy.',
    keyFormulas: [
      '\\text{Tổng quát: } a(x - x_0) + b(y - y_0) = 0 \\Leftrightarrow ax + by + c = 0\\; (\\vec{n} = (a;b))',
      '\\text{Tham số: } \\begin{cases} x = x_0 + u_1 t \\\\ y = y_0 + u_2 t \\end{cases}\\; (\\vec{u} = (u_1; u_2))',
    ],
    theorem: 'Một đường thẳng trong mặt phẳng $Oxy$ được xác định duy nhất khi biết một điểm đi qua và một vectơ pháp tuyến (hoặc một vectơ chỉ phương).',
    hypothesis: 'Điểm $M_0(x_0; y_0)$ và vectơ pháp tuyến $\\vec{n}(a; b) \\ne \\vec{0}$ (hoặc vectơ chỉ phương $\\vec{u}(u_1; u_2) \\ne \\vec{0}$).',
    conclusion: 'Điểm $M(x; y)$ thuộc đường thẳng khi và chỉ khi $\\overrightarrow{M_0 M} \\perp \\vec{n}$ (hoặc cùng phương $\\vec{u}$).',
    method: 'Đổi linh hoạt giữa $\\vec{n} = (a; b)$ và $\\vec{u} = (-b; a)$ để chuyển đổi nhanh giữa phương trình tổng quát và phương trình tham số.',
    example: 'Đường thẳng qua $A(1; 2)$ nhận $\\vec{n} = (3; -1)$ làm VTPT có phương trình $3(x-1) - (y-2) = 0 \\Leftrightarrow 3x - y - 1 = 0$.',
    interactiveNote: 'Kéo các đỉnh tam giác ABC để quan sát ba đường cao vuông góc với các cạnh đối diện — cơ sở lập phương trình đường cao trong Oxy.',
    dimension: '2d',
    templateId: 'tpl2d_orthocenter',
    challengeId: 'L02_C03',
    categories: ['Khái niệm và định nghĩa', 'Phương pháp dựng hình'],
  },
  {
    id: 't10_b20',
    grade: '10',
    chapterId: 'ch10_7',
    chapterTitle: 'Chương VII. Phương pháp tọa độ trong mặt phẳng',
    lessonNumber: 20,
    title: 'Bài 20. Đường thẳng trong mặt phẳng tọa độ',
    summary: 'Vị trí tương đối giữa hai đường thẳng, công thức góc giữa hai đường thẳng và khoảng cách từ một điểm đến đường thẳng.',
    keyFormulas: [
      '\\cos(\\Delta_1, \\Delta_2) = \\frac{|a_1 a_2 + b_1 b_2|}{\\sqrt{a_1^2 + b_1^2}\\sqrt{a_2^2 + b_2^2}}',
      'd(M_0, \\Delta) = \\frac{|ax_0 + by_0 + c|}{\\sqrt{a^2 + b^2}}',
    ],
    theorem: 'Góc giữa hai đường thẳng $\\Delta_1, \\Delta_2$ luôn nằm trong đoạn $[0^\\circ; 90^\\circ]$ và được tính qua giá trị tuyệt đối côsin góc giữa hai vectơ pháp tuyến; khoảng cách từ $M_0$ đến $\\Delta$ là độ dài đoạn vuông góc $M_0 H$.',
    hypothesis: 'Hai đường thẳng $\\Delta_1: a_1 x + b_1 y + c_1 = 0$, $\\Delta_2: a_2 x + b_2 y + c_2 = 0$ và điểm $M_0(x_0; y_0)$.',
    conclusion: 'Xác định chính xác $\\Delta_1, \\Delta_2$ cắt nhau, song song hay trùng nhau qua hệ phương trình; tính ngay góc nhọn và khoảng cách.',
    method: 'Kiểm tra tỉ lệ $(a_1, b_1)$ và $(a_2, b_2)$ để xét vị trí tương đối; dùng công thức khoảng cách để viết phương trình đường tròn tiếp xúc đường thẳng.',
    example: 'Khoảng cách từ $M(1; -2)$ đến $\\Delta: 3x - 4y - 1 = 0$ là $d(M, \\Delta) = \\dfrac{|3 + 8 - 1|}{5} = 2$.',
    interactiveNote: 'Kéo điểm M hoặc đường thẳng Δ để quan sát đoạn vuông góc MH luôn là khoảng cách ngắn nhất từ M tới Δ.',
    dimension: '2d',
    templateId: 'tpl2d_t10_line_normal_dist',
    challengeId: 'L04_C01',
    categories: ['Định lí và hệ quả', 'Tính chất hình học'],
  },
  {
    id: 't10_b21',
    grade: '10',
    chapterId: 'ch10_7',
    chapterTitle: 'Chương VII. Phương pháp tọa độ trong mặt phẳng',
    lessonNumber: 21,
    title: 'Bài 21. Đường tròn trong mặt phẳng tọa độ',
    summary: 'Phương trình chính tắc và khai triển của đường tròn, điều kiện tồn tại đường tròn và phương trình tiếp tuyến tại một điểm.',
    keyFormulas: [
      '(x - a)^2 + (y - b)^2 = R^2',
      'x^2 + y^2 - 2ax - 2by + c = 0\\; (a^2 + b^2 - c > 0,\\; R = \\sqrt{a^2 + b^2 - c})',
      '\\text{Tiếp tuyến tại } M_0(x_0; y_0):\\; (x_0 - a)(x - x_0) + (y_0 - b)(y - y_0) = 0',
    ],
    theorem: 'Đường tròn tâm $I(a; b)$ bán kính $R$ có phương trình $(x-a)^2+(y-b)^2=R^2$. Tiếp tuyến tại điểm $M_0$ thuộc đường tròn đi qua $M_0$ và nhận $\\overrightarrow{IM_0}$ làm vectơ pháp tuyến.',
    hypothesis: 'Tâm $I(a; b)$, bán kính $R > 0$ và điểm $M_0(x_0; y_0) \\in (C)$.',
    conclusion: 'Lập được phương trình đường tròn và tiếp tuyến ngay khi biết tâm và một điểm (hoặc đường kính, hoặc tiếp xúc một đường thẳng).',
    method: 'Xác định tâm $I$ và bán kính $R = IM$ (hoặc $R = d(I, \\Delta)$ nếu tiếp xúc $\\Delta$), sau đó thay vào phương trình chuẩn.',
    example: 'Đường tròn tâm $I(1; -2)$ đi qua $M(4; 2)$ có $R = \\sqrt{3^2 + 4^2} = 5$ và tiếp tuyến tại $M$ là $3(x-4) + 4(y-2) = 0 \\Leftrightarrow 3x + 4y - 20 = 0$.',
    interactiveNote: 'Kéo điểm M quanh tâm I để thấy tiếp tuyến d luôn vuông góc với bán kính IM tại tiếp điểm M.',
    dimension: '2d',
    templateId: 'tpl2d_t10_circle_tangent',
    challengeId: 'L11_C01',
    categories: ['Định lí và hệ quả', 'Phương pháp dựng hình'],
  },
  {
    id: 't10_b22',
    grade: '10',
    chapterId: 'ch10_7',
    chapterTitle: 'Chương VII. Phương pháp tọa độ trong mặt phẳng',
    lessonNumber: 22,
    title: 'Bài 22. Ba đường conic',
    summary: 'Định nghĩa hình học và phương trình chính tắc của đường elip, đường hypebol và đường parabol cùng ứng dụng quang học – thiên văn.',
    keyFormulas: [
      '\\text{Elip: } \\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1\\; (MF_1 + MF_2 = 2a,\\; c^2 = a^2 - b^2)',
      '\\text{Hypebol: } \\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1\\; (|MF_1 - MF_2| = 2a,\\; c^2 = a^2 + b^2)',
      '\\text{Parabol: } y^2 = 2px\\; (MF = d(M, \\Delta),\\; F(\\tfrac{p}{2}; 0),\\; \\Delta: x = -\\tfrac{p}{2})',
    ],
    theorem: 'Elip là tập hợp các điểm có tổng khoảng cách tới hai tiêu điểm bằng $2a$; Hypebol có trị tuyệt đối hiệu khoảng cách bằng $2a$; Parabol là tập hợp các điểm cách đều tiêu điểm $F$ và đường chuẩn $\\Delta$.',
    hypothesis: 'Hai tiêu điểm $F_1(-c; 0), F_2(c; 0)$ (với elip/hypebol) hoặc tiêu điểm $F(p/2; 0)$ và đường chuẩn $\\Delta: x = -p/2$ (với parabol).',
    conclusion: 'Xác định được tiêu điểm, tiêu cự, trục lớn/nhỏ, đường chuẩn và lập phương trình chính tắc của ba đường conic.',
    method: 'Sử dụng trực tiếp định nghĩa quỹ tích bằng đường tròn dẫn và trung trực để dựng từng điểm của elip và parabol trên mặt phẳng.',
    example: 'Elip $\\dfrac{x^2}{25} + \\dfrac{y^2}{16} = 1$ có $a = 5, b = 4, c = 3$, tiêu điểm $F_1(-3;0), F_2(3;0)$ và độ dài trục lớn $2a = 10$.',
    interactiveNote: 'Kéo điểm P trên đường tròn dẫn (F1; 2a) để thấy điểm M luôn thỏa MF1 + MF2 = 2a không đổi (quỹ tích elip).',
    dimension: '2d',
    templateId: 'tpl2d_t10_ellipse_foci',
    challengeId: 'L11_C07',
    categories: ['Khái niệm và định nghĩa', 'Phương pháp dựng hình'],
  },

  // ==================== TOÁN 11 – CHƯƠNG IV (5 BÀI) ====================
  {
    id: 't11_b10',
    grade: '11',
    chapterId: 'ch11_4',
    chapterTitle: 'Chương IV. Quan hệ song song trong không gian',
    lessonNumber: 10,
    title: 'Bài 10. Đường thẳng và mặt phẳng trong không gian',
    summary: 'Các tính chất thừa nhận của điểm, đường thẳng, mặt phẳng; cách xác định mặt phẳng, hình chóp và hình tứ diện.',
    keyFormulas: [
      'A, B \\in (P) \\Rightarrow AB \\subset (P)',
      'M \\in (P) \\cap (Q) \\Rightarrow (P) \\cap (Q) = d \\text{ đi qua } M',
    ],
    theorem: 'Một mặt phẳng được xác định duy nhất bởi: ba điểm không thẳng hàng; một đường thẳng và một điểm ngoài nó; hoặc hai đường thẳng cắt nhau. Nếu hai mặt phẳng phân biệt có một điểm chung thì chúng có một đường thẳng chung duy nhất gọi là giao tuyến.',
    hypothesis: 'Điểm, đường thẳng và mặt phẳng trong không gian 3 chiều.',
    conclusion: 'Tìm được giao tuyến hai mặt phẳng (tìm 2 điểm chung phân biệt), giao điểm đường thẳng với mặt phẳng và thiết diện cơ bản.',
    method: 'Để tìm giao điểm của đường thẳng $d$ và mặt phẳng $(P)$, chọn mặt phẳng phụ $(Q)$ chứa $d$, tìm giao tuyến $\\Delta = (P) \\cap (Q)$ rồi lấy $I = d \\cap \\Delta$.',
    example: 'Trong hình chóp $S.ABCD$, giao tuyến của $(SAC)$ và $(SBD)$ là đường thẳng $SO$ với $O = AC \\cap BD$.',
    interactiveNote: 'Xoay hình chóp tam giác S.ABC 360° để quan sát 4 mặt phẳng cơ bản và các đỉnh, cạnh trong không gian.',
    dimension: '3d',
    templateId: 'T3D_04',
    challengeId: 'S3D_L01_C01',
    categories: ['Khái niệm và định nghĩa', 'Phương pháp dựng hình'],
  },
  {
    id: 't11_b11',
    grade: '11',
    chapterId: 'ch11_4',
    chapterTitle: 'Chương IV. Quan hệ song song trong không gian',
    lessonNumber: 11,
    title: 'Bài 11. Hai đường thẳng song song',
    summary: 'Vị trí tương đối của hai đường thẳng trong không gian (song song, cắt nhau, trùng nhau, chéo nhau) và định lí giao tuyến song song.',
    keyFormulas: [
      'a \\parallel c,\\; b \\parallel c \\Rightarrow a \\parallel b',
      'a \\subset (P),\\; b \\subset (Q),\\; a \\parallel b,\\; (P)\\cap(Q) = d \\Rightarrow d \\parallel a \\parallel b',
    ],
    theorem: 'Nếu ba mặt phẳng đôi một cắt nhau theo ba giao tuyến phân biệt thì ba giao tuyến ấy hoặc đồng quy hoặc đôi một song song. Đặc biệt, hai mặt phẳng lần lượt chứa hai đường thẳng song song thì giao tuyến (nếu có) song song với hai đường thẳng đó.',
    hypothesis: 'Hai đường thẳng $a, b$ trong không gian (đồng phẳng hoặc chéo nhau).',
    conclusion: 'Xác định nhanh giao tuyến song song và chứng minh hai đường thẳng song song trong không gian qua tính bắc cầu hoặc đường trung bình.',
    method: 'Tìm hai đường thẳng song song trong hai mặt phẳng để dựng giao tuyến chỉ cần biết 1 điểm chung.',
    example: 'Trong hình chóp $S.ABCD$ đáy hình bình hành, giao tuyến của $(SAB)$ và $(SCD)$ là đường thẳng qua $S$ song song $AB$ và $CD$.',
    interactiveNote: 'Quan sát trực quan hai đường thẳng song song và giao tuyến hai mặt phẳng trong không gian 3D.',
    dimension: '3d',
    templateId: 'T3D_15',
    challengeId: 'S3D_L03_C01',
    categories: ['Định lí và hệ quả', 'Tính chất hình học'],
  },
  {
    id: 't11_b12',
    grade: '11',
    chapterId: 'ch11_4',
    chapterTitle: 'Chương IV. Quan hệ song song trong không gian',
    lessonNumber: 12,
    title: 'Bài 12. Đường thẳng và mặt phẳng song song',
    summary: 'Dấu hiệu nhận biết đường thẳng song song mặt phẳng và định lí giao tuyến khi mặt phẳng chứa đường thẳng song song.',
    keyFormulas: [
      'd \\not\\subset (P),\\; d \\parallel a,\\; a \\subset (P) \\Rightarrow d \\parallel (P)',
      'd \\parallel (P),\\; d \\subset (Q),\\; (P)\\cap(Q) = \\Delta \\Rightarrow \\Delta \\parallel d',
    ],
    theorem: 'Nếu đường thẳng $d$ không nằm trong $(P)$ và song song với một đường thẳng nằm trong $(P)$ thì $d \\parallel (P)$. Ngược lại, mọi mặt phẳng $(Q)$ chứa $d$ và cắt $(P)$ đều cắt theo giao tuyến song song với $d$.',
    hypothesis: 'Đường thẳng $d$ và mặt phẳng $(P)$ trong không gian.',
    conclusion: 'Chứng minh $d \\parallel (P)$ bằng cách chỉ ra đường thẳng song song trong $(P)$, và dựng thiết diện song song với đường thẳng cho trước.',
    method: 'Khi cần dựng thiết diện đi qua điểm $M$ và song song với cạnh $d$, kẻ giao tuyến qua $M$ song song $d$ trên mặt phẳng chứa $M$ và $d$.',
    example: 'Trong tứ diện $ABCD$, đường trung bình $MN$ của $\\triangle ABC$ song song với $BC$ nên $MN \\parallel (BCD)$.',
    interactiveNote: 'Quan sát mô hình đường thẳng song song mặt phẳng trong không gian 3D ở các góc nhìn khác nhau.',
    dimension: '3d',
    templateId: 'T3D_13',
    challengeId: 'S3D_L04_C01',
    categories: ['Định lí và hệ quả', 'Phương pháp dựng hình'],
  },
  {
    id: 't11_b13',
    grade: '11',
    chapterId: 'ch11_4',
    chapterTitle: 'Chương IV. Quan hệ song song trong không gian',
    lessonNumber: 13,
    title: 'Bài 13. Hai mặt phẳng song song',
    summary: 'Dấu hiệu nhận biết hai mặt phẳng song song, định lí Thalès trong không gian, hình lăng trụ và hình hộp.',
    keyFormulas: [
      'a, b \\subset (P),\\; a \\cap b = I,\\; a \\parallel (Q),\\; b \\parallel (Q) \\Rightarrow (P) \\parallel (Q)',
      '(P) \\parallel (Q),\\; (R)\\cap(P)=a,\\; (R)\\cap(Q)=b \\Rightarrow a \\parallel b',
    ],
    theorem: 'Nếu mặt phẳng $(P)$ chứa hai đường thẳng cắt nhau cùng song song với mặt phẳng $(Q)$ thì $(P) \\parallel (Q)$. Ba mặt phẳng đôi một song song chắn trên hai cát tuyến bất kì những đoạn thẳng tương ứng tỉ lệ (Định lí Thalès trong không gian).',
    hypothesis: 'Hai mặt phẳng $(P), (Q)$ và mặt phẳng cắt $(R)$.',
    conclusion: 'Chứng minh hai mặt phẳng song song, suy ra mọi đường thẳng trong $(P)$ đều song song $(Q)$ và hai giao tuyến với $(R)$ song song nhau.',
    method: 'Để dựng thiết diện đi qua điểm $M$ và song song với mặt phẳng $(Q)$, kẻ các giao tuyến trên từng mặt khối song song với các cạnh của $(Q)$.',
    example: 'Trong hình lăng trụ $ABC.A\'B\'C\'$, hai mặt đáy $(ABC)$ và $(A\'B\'C\')$ song song với nhau, các mặt bên là hình bình hành.',
    interactiveNote: 'Quan sát hai mặt phẳng song song và thiết diện cắt song song trong mô hình 3D.',
    dimension: '3d',
    templateId: 'T3D_14',
    challengeId: 'S3D_L05_C01',
    categories: ['Định lí và hệ quả', 'Tính chất hình học'],
  },
  {
    id: 't11_b14',
    grade: '11',
    chapterId: 'ch11_4',
    chapterTitle: 'Chương IV. Quan hệ song song trong không gian',
    lessonNumber: 14,
    title: 'Bài 14. Phép chiếu song song',
    summary: 'Định nghĩa phép chiếu song song, các tính chất bất biến và cách vẽ hình biểu diễn của hình không gian chuẩn SGK.',
    keyFormulas: [
      '\\frac{A\'B\'}{C\'D\'} = \\frac{AB}{CD}\\quad (AB \\parallel CD \\text{ hoặc } A,B,C,D \\text{ thẳng hàng})',
    ],
    theorem: 'Phép chiếu song song biến ba điểm thẳng hàng thành ba điểm thẳng hàng không đổi thứ tự, biến hai đường thẳng song song thành song song (hoặc trùng nhau) và bảo toàn tỉ số độ dài hai đoạn thẳng cùng phương.',
    hypothesis: 'Mặt phẳng chiếu $(P)$ và phương chiếu $\\Delta$ cắt $(P)$.',
    conclusion: 'Hình biểu diễn của hình bình hành, hình chữ nhật, hình vuông là hình bình hành; hình biểu diễn của đường tròn là đường elip; trung điểm bảo toàn.',
    method: 'Khi biểu diễn hình khối trên mặt phẳng, dùng nét liền cho cạnh nhìn thấy và nét đứt cho cạnh bị che khuất (chế độ Nét khuất SGK trong Phòng thực hành 3D).',
    example: 'Hình biểu diễn của hình lập phương $ABCD.A\'B\'C\'D\'$ có đáy $ABCD$ vẽ thành hình bình hành và các cạnh bên song song, bằng nhau.',
    interactiveNote: 'Quan sát hình lập phương ở chế độ nét khuất chuẩn SGK — đúng nguyên lí của phép chiếu song song.',
    dimension: '3d',
    templateId: 'T3D_01',
    challengeId: 'S3D_L06_C01',
    categories: ['Khái niệm và định nghĩa', 'Phương pháp dựng hình'],
  },

  // ==================== TOÁN 11 – CHƯƠNG VII (6 BÀI) ====================
  {
    id: 't11_b22',
    grade: '11',
    chapterId: 'ch11_7',
    chapterTitle: 'Chương VII. Quan hệ vuông góc trong không gian',
    lessonNumber: 22,
    title: 'Bài 22. Hai đường thẳng vuông góc',
    summary: 'Góc giữa hai đường thẳng trong không gian (kể cả chéo nhau) và chứng minh hai đường thẳng vuông góc.',
    keyFormulas: [
      '0^\\circ \\le (a, b) \\le 90^\\circ',
      'a \\parallel a\',\\; b \\parallel b\' \\Rightarrow (a, b) = (a\', b\')',
      'a \\perp b \\Leftrightarrow (a, b) = 90^\\circ',
    ],
    theorem: 'Góc giữa hai đường thẳng $a$ và $b$ trong không gian là góc giữa hai đường thẳng $a\'$ và $b\'$ cùng đi qua một điểm $O$ và lần lượt song song (hoặc trùng) với $a$ và $b$.',
    hypothesis: 'Hai đường thẳng $a, b$ bất kì trong không gian.',
    conclusion: 'Đưa góc giữa hai đường chéo nhau về góc trong một tam giác phẳng để tính bằng định lí côsin hoặc chứng minh bằng $90^\\circ$.',
    method: 'Chọn một đỉnh sẵn có trên một đường thẳng và kẻ đường thẳng song song với đường còn lại để tạo góc phẳng dễ tính.',
    example: 'Trong hình lập phương $ABCD.A\'B\'C\'D\'$, ta có $(AB, B\'C\') = (AB, BC) = 90^\\circ$ nên $AB \\perp B\'C\'$.',
    interactiveNote: 'Xoay mô hình để thấy hai đường thẳng vuông góc trong không gian dù cắt nhau hay chéo nhau.',
    dimension: '3d',
    templateId: 'T3D_16',
    challengeId: 'S3D_L07_C01',
    categories: ['Khái niệm và định nghĩa', 'Tính chất hình học'],
  },
  {
    id: 't11_b23',
    grade: '11',
    chapterId: 'ch11_7',
    chapterTitle: 'Chương VII. Quan hệ vuông góc trong không gian',
    lessonNumber: 23,
    title: 'Bài 23. Đường thẳng vuông góc với mặt phẳng',
    summary: 'Dấu hiệu nhận biết đường thẳng vuông góc mặt phẳng, tính chất liên hệ song song – vuông góc và định lí ba đường vuông góc.',
    keyFormulas: [
      'd \\perp a,\\; d \\perp b,\\; a \\cap b = I,\\; a,b \\subset (P) \\Rightarrow d \\perp (P)',
      '\\text{Định lí ba đường vuông góc: } a \\perp d\' \\Leftrightarrow a \\perp d',
    ],
    theorem: 'Nếu một đường thẳng vuông góc với hai đường thẳng cắt nhau cùng nằm trong mặt phẳng $(P)$ thì nó vuông góc với $(P)$, và do đó vuông góc với mọi đường thẳng nằm trong $(P)$.',
    hypothesis: 'Đường thẳng $d$ và hai đường thẳng cắt nhau $a, b \\subset (P)$.',
    conclusion: 'Chứng minh được $d \\perp (P)$, từ đó chứng minh $d$ vuông góc với các cạnh còn lại trong mặt phẳng $(P)$.',
    method: 'Để chứng minh $d \\perp c$, tìm một mặt phẳng $(P)$ chứa $c$ rồi chứng minh $d \\perp (P)$ bằng hai đường cắt nhau.',
    example: 'Cho $S.ABC$ có $SA \\perp (ABC)$ và $AB \\perp BC$. Vì $BC \\perp AB$ và $BC \\perp SA$ nên $BC \\perp (SAB)$, suy ra $BC \\perp SB$.',
    interactiveNote: 'Quan sát đường thẳng vuông góc với mặt phẳng và đường cao hình chóp trong không gian 3D.',
    dimension: '3d',
    templateId: 'T3D_17',
    challengeId: 'S3D_L08_C01',
    categories: ['Định lí và hệ quả', 'Phương pháp dựng hình'],
  },
  {
    id: 't11_b24',
    grade: '11',
    chapterId: 'ch11_7',
    chapterTitle: 'Chương VII. Quan hệ vuông góc trong không gian',
    lessonNumber: 24,
    title: 'Bài 24. Phép chiếu vuông góc. Góc giữa đường thẳng và mặt phẳng',
    summary: 'Định nghĩa hình chiếu vuông góc lên mặt phẳng và cách xác định, tính góc giữa đường thẳng và mặt phẳng.',
    keyFormulas: [
      '\\varphi = (d, (P)) = (d, d\'),\\quad 0^\\circ \\le \\varphi \\le 90^\\circ',
      '\\sin\\varphi = \\frac{MH}{MI}\\; (I = d \\cap (P),\\; H \\text{ là hình chiếu của } M \\text{ lên } (P))',
    ],
    theorem: 'Góc giữa đường thẳng $d$ (không vuông góc với $(P)$) và mặt phẳng $(P)$ là góc giữa $d$ và hình chiếu vuông góc $d\'$ của nó trên $(P)$. Nếu $d \\perp (P)$ thì góc bằng $90^\\circ$.',
    hypothesis: 'Đường thẳng $d$ cắt mặt phẳng $(P)$ tại $I$, điểm $M \\in d$ có hình chiếu vuông góc $H$ trên $(P)$.',
    conclusion: 'Góc giữa $d$ và $(P)$ là góc nhọn $\\widehat{MIH}$ trong tam giác vuông $MHI$ tại $H$.',
    method: 'Bước 1: Tìm giao điểm $I = d \\cap (P)$. Bước 2: Chọn điểm $M \\in d$ và dựng chân đường vuông góc $H$ xuống $(P)$. Bước 3: Tính $\\tan\\widehat{MIH} = \\dfrac{MH}{HI}$.',
    example: 'Trong hình chóp $S.ABCD$ có $SA \\perp (ABCD)$, góc giữa $SC$ và mặt đáy $(ABCD)$ là $\\widehat{SCA}$.',
    interactiveNote: 'Quan sát trực tiếp đường thẳng, hình chiếu vuông góc trên mặt phẳng và góc nhọn tạo thành trong 3D.',
    dimension: '3d',
    templateId: 'T3D_28',
    challengeId: 'S3D_L10_C01',
    categories: ['Khái niệm và định nghĩa', 'Phương pháp dựng hình'],
  },
  {
    id: 't11_b25',
    grade: '11',
    chapterId: 'ch11_7',
    chapterTitle: 'Chương VII. Quan hệ vuông góc trong không gian',
    lessonNumber: 25,
    title: 'Bài 25. Hai mặt phẳng vuông góc',
    summary: 'Góc giữa hai mặt phẳng, góc nhị diện và góc phẳng nhị diện (0° đến 180°), điều kiện hai mặt phẳng vuông góc và các hình lăng trụ đứng, hình hộp chữ nhật, hình lập phương.',
    keyFormulas: [
      '0^\\circ \\le [P, d, Q] \\le 180^\\circ,\\qquad 0^\\circ \\le ((P), (Q)) \\le 90^\\circ',
      'a \\subset (P),\\; a \\perp (Q) \\Rightarrow (P) \\perp (Q)',
    ],
    theorem: 'Hai mặt phẳng vuông góc khi và chỉ khi mặt phẳng này chứa một đường thẳng vuông góc với mặt phẳng kia. Nếu hai mặt phẳng cắt nhau cùng vuông góc với mặt phẳng thứ ba thì giao tuyến của chúng vuông góc với mặt phẳng thứ ba.',
    hypothesis: 'Hai nửa mặt phẳng $(P), (Q)$ chung bờ $d$ tạo góc nhị diện $[P, d, Q]$; điểm $O \\in d$, $Ox \\subset (P), Oy \\subset (Q)$ cùng vuông góc với $d$.',
    conclusion: 'Góc phẳng nhị diện $\\widehat{xOy} \\in [0^\\circ; 180^\\circ]$ đo chính xác độ mở của góc nhị diện (phân biệt rõ với góc giữa hai mặt phẳng luôn thuộc $[0^\\circ; 90^\\circ]$).',
    method: 'Để xác định góc nhị diện $[S, BC, A]$: từ chân đường cao $H$ kẻ $HK \\perp BC$, nối $SK$, khi đó $\\widehat{SKH}$ là góc phẳng nhị diện.',
    example: 'Trong hình chóp đều $S.ABCD$, góc phẳng nhị diện $[S, BC, O]$ là $\\widehat{SMO}$ với $M$ là trung điểm $BC$.',
    interactiveNote: 'Quan sát góc nhị diện [S, BC, A] và góc phẳng nhị diện trong không gian 3D tương tác.',
    dimension: '3d',
    templateId: 'T3D_30',
    challengeId: 'S3D_L11_C05',
    categories: ['Định lí và hệ quả', 'Tính chất hình học'],
  },
  {
    id: 't11_b26',
    grade: '11',
    chapterId: 'ch11_7',
    chapterTitle: 'Chương VII. Quan hệ vuông góc trong không gian',
    lessonNumber: 26,
    title: 'Bài 26. Khoảng cách',
    summary: 'Khoảng cách từ điểm đến đường thẳng, đến mặt phẳng, giữa đường và mặt song song, hai mặt song song và hai đường thẳng chéo nhau.',
    keyFormulas: [
      'd(M, (P)) = MH\\; (H \\text{ là hình chiếu vuông góc của } M \\text{ lên } (P))',
      'd(a, b) = MN\\; (MN \\text{ là đoạn vuông góc chung của } a \\text{ và } b)',
      'd(a, b) = d(a, (P))\\; \\text{với } b \\subset (P) \\text{ và } a \\parallel (P)',
    ],
    theorem: 'Khoảng cách giữa hai đường thẳng chéo nhau bằng độ dài đoạn vuông góc chung của chúng, đồng thời bằng khoảng cách từ một đường thẳng đến mặt phẳng chứa đường thẳng kia và song song với nó.',
    hypothesis: 'Điểm $M$, đường thẳng $a, b$ và mặt phẳng $(P)$ trong không gian.',
    conclusion: 'Quy bài toán khoảng cách khó về khoảng cách từ chân đường cao hoặc dùng tỉ số khoảng cách khi đường thẳng cắt mặt phẳng.',
    method: 'Với mặt bên chứa đường cao, chỉ cần kẻ 1 hoặc 2 nét vuông góc từ chân đường cao để dựng đoạn khoảng cách chuẩn xác.',
    example: 'Trong hình lập phương cạnh $a$, khoảng cách giữa $AA\'$ và $BD$ bằng nửa đường chéo đáy: $AO = \\dfrac{a\\sqrt{2}}{2}$.',
    interactiveNote: 'Quan sát trực quan đoạn vuông góc chung giữa hai đường thẳng chéo nhau và khoảng cách điểm – mặt phẳng trong 3D.',
    dimension: '3d',
    templateId: 'T3D_32',
    challengeId: 'S3D_L12_C01',
    categories: ['Định lí và hệ quả', 'Phương pháp dựng hình'],
  },
  {
    id: 't11_b27',
    grade: '11',
    chapterId: 'ch11_7',
    chapterTitle: 'Chương VII. Quan hệ vuông góc trong không gian',
    lessonNumber: 27,
    title: 'Bài 27. Thể tích',
    summary: 'Công thức thể tích khối lăng trụ, khối hộp, khối chóp và khối chóp cụt đều cùng các bài toán thiết diện – tỉ số thể tích.',
    keyFormulas: [
      'V_{\\text{lăng trụ}} = S_{\\text{đáy}} \\cdot h',
      'V_{\\text{chóp}} = \\frac{1}{3} S_{\\text{đáy}} \\cdot h',
      'V_{\\text{chóp cụt đều}} = \\frac{1}{3} h\\left(S + \\sqrt{SS\'} + S\'\\right)',
    ],
    theorem: 'Thể tích khối lăng trụ bằng diện tích đáy nhân chiều cao; thể tích khối chóp bằng một phần ba tích diện tích đáy với chiều cao.',
    hypothesis: 'Khối đa diện có diện tích đáy $S$ và chiều cao $h$ (khoảng cách từ đỉnh đến mặt đáy).',
    conclusion: 'Tính được thể tích các khối chóp, lăng trụ, tứ diện đều và so sánh thể tích thông qua đáy và chiều cao.',
    method: 'Xác định chân đường cao $H$ để tính $h$, tính diện tích đáy $S$, rồi áp dụng công thức; có thể dùng tỉ số thể tích tứ diện khi cắt bởi mặt phẳng.',
    example: 'Khối tứ diện đều cạnh $a$ có $S = \\dfrac{a^2\\sqrt{3}}{4}$ và $h = \\dfrac{a\\sqrt{6}}{3}$, do đó $V = \\dfrac{a^3\\sqrt{2}}{12}$.',
    interactiveNote: 'Quan sát khối chóp tứ giác đều kèm đường cao SO và thiết diện để hiểu mối liên hệ giữa diện tích đáy, chiều cao và thể tích.',
    dimension: '3d',
    templateId: 'T3D_06',
    challengeId: 'S3D_L13_C01',
    categories: ['Định lí và hệ quả', 'Tính chất hình học'],
  },

  // ==================== TOÁN 12 – CHƯƠNG II (3 BÀI) ====================
  {
    id: 't12_b06',
    grade: '12',
    chapterId: 'ch12_2',
    chapterTitle: 'Chương II. Vectơ và hệ trục tọa độ trong không gian',
    lessonNumber: 6,
    title: 'Bài 6. Vectơ trong không gian',
    summary: 'Các phép toán vectơ trong không gian (tổng, hiệu, tích với số), quy tắc hình hộp và tích vô hướng hai vectơ trong không gian.',
    keyFormulas: [
      '\\overrightarrow{AB} + \\overrightarrow{AD} + \\overrightarrow{AA\'} = \\overrightarrow{AC\'}\\; (\\text{Quy tắc hình hộp})',
      '\\vec{u}\\cdot\\vec{v} = |\\vec{u}|\\cdot|\\vec{v}|\\cos(\\vec{u}, \\vec{v})',
    ],
    theorem: 'Các phép toán cộng, trừ, nhân với một số và tích vô hướng của vectơ trong không gian kế thừa hoàn toàn các tính chất của vectơ phẳng, bổ sung quy tắc hình hộp cho tổng ba vectơ không đồng phẳng.',
    hypothesis: 'Hình hộp $ABCD.A\'B\'C\'D\'$ hoặc hai vectơ $\\vec{u}, \\vec{v}$ trong không gian.',
    conclusion: 'Tính được độ dài đường chéo không gian, góc giữa hai vectơ và chứng minh vuông góc không cần dựng hình chiếu.',
    method: 'Phân tích các vectơ cần xét theo ba vectơ cạnh không đồng phẳng cùng chung gốc để tính tích vô hướng và độ dài.',
    example: 'Trong hình lập phương cạnh $a$, $|\\overrightarrow{AC\'}|^2 = |\\overrightarrow{AB} + \\overrightarrow{AD} + \\overrightarrow{AA\'}|^2 = a^2 + a^2 + a^2 = 3a^2 \\Rightarrow AC\' = a\\sqrt{3}$.',
    interactiveNote: 'Quan sát tổng vectơ theo quy tắc hình bình hành và hình hộp trong không gian 3D.',
    dimension: '3d',
    templateId: 'T3D_35',
    challengeId: 'S3D_L14_C01',
    categories: ['Khái niệm và định nghĩa', 'Tính chất hình học'],
  },
  {
    id: 't12_b07',
    grade: '12',
    chapterId: 'ch12_2',
    chapterTitle: 'Chương II. Vectơ và hệ trục tọa độ trong không gian',
    lessonNumber: 7,
    title: 'Bài 7. Hệ trục tọa độ trong không gian',
    summary: 'Hệ tọa độ Oxyz gồm ba trục đôi một vuông góc Ox, Oy, Oz, ba vectơ đơn vị i, j, k, tọa độ điểm và tọa độ vectơ.',
    keyFormulas: [
      '\\overrightarrow{OM} = x\\vec{i} + y\\vec{j} + z\\vec{k} \\Leftrightarrow M(x; y; z)',
      '\\overrightarrow{AB} = (x_B - x_A;\\; y_B - y_A;\\; z_B - z_A)',
    ],
    theorem: 'Trong không gian $Oxyz$, mỗi điểm $M$ tương ứng duy nhất với bộ ba số thực $(x; y; z)$ là tọa độ của vectơ $\\overrightarrow{OM}$, cho phép đại số hóa toàn bộ hình học không gian.',
    hypothesis: 'Hệ trục tọa độ vuông góc $Oxyz$ với ba vectơ đơn vị $\\vec{i}, \\vec{j}, \\vec{k}$ đôi một vuông góc.',
    conclusion: 'Xác định nhanh hình chiếu vuông góc và điểm đối xứng của $M(x; y; z)$ lên các trục và mặt phẳng tọa độ $(Oxy), (Oyz), (Ozx)$.',
    method: 'Gắn hệ trục $Oxyz$ vào các cạnh đôi một vuông góc của hình hộp chữ nhật, hình lập phương hoặc hình chóp có cạnh bên vuông góc đáy.',
    example: 'Điểm $M(2; -3; 5)$ có hình chiếu lên $(Oxy)$ là $(2; -3; 0)$, lên trục $Oz$ là $(0; 0; 5)$ và đối xứng qua $O$ là $(-2; 3; -5)$.',
    interactiveNote: 'Xoay hệ trục tọa độ Oxyz cùng ba vectơ đơn vị i, j, k và điểm tọa độ trong không gian 3D.',
    dimension: '3d',
    templateId: 'T3D_33',
    challengeId: 'S3D_L15_C01',
    categories: ['Khái niệm và định nghĩa', 'Phương pháp dựng hình'],
  },
  {
    id: 't12_b08',
    grade: '12',
    chapterId: 'ch12_2',
    chapterTitle: 'Chương II. Vectơ và hệ trục tọa độ trong không gian',
    lessonNumber: 8,
    title: 'Bài 8. Biểu thức tọa độ của các phép toán vectơ',
    summary: 'Biểu thức tọa độ của tổng, hiệu, tích với số, trung điểm, trọng tâm, độ dài, tích vô hướng và tích có hướng trong Oxyz.',
    keyFormulas: [
      '\\vec{u}\\cdot\\vec{v} = x_1 x_2 + y_1 y_2 + z_1 z_2,\\quad |\\vec{u}| = \\sqrt{x_1^2 + y_1^2 + z_1^2}',
      '[\\vec{u}, \\vec{v}] = (y_1 z_2 - z_1 y_2;\\; z_1 x_2 - x_1 z_2;\\; x_1 y_2 - y_1 x_2)',
      'G_{\\triangle ABC} = \\left(\\frac{x_A+x_B+x_C}{3};\\; \\frac{y_A+y_B+y_C}{3};\\; \\frac{z_A+z_B+z_C}{3}\\right)',
    ],
    theorem: 'Tích có hướng $[\\vec{u}, \\vec{v}]$ là một vectơ vuông góc với cả $\\vec{u}$ và $\\vec{v}$, đóng vai trò trung tâm để tìm vectơ pháp tuyến mặt phẳng và tính diện tích tam giác trong không gian $Oxyz$.',
    hypothesis: 'Hai vectơ $\\vec{u}(x_1; y_1; z_1)$ và $\\vec{v}(x_2; y_2; z_2)$ trong hệ trục $Oxyz$.',
    conclusion: 'Hai vectơ vuông góc $\\Leftrightarrow \\vec{u}\\cdot\\vec{v} = 0$; hai vectơ cùng phương $\\Leftrightarrow [\\vec{u}, \\vec{v}] = \\vec{0}$.',
    method: 'Kiểm tra kết quả tích có hướng bằng cách nhân vô hướng lại với từng vectơ ban đầu — phải thu được $0$ ở cả hai phép nhân.',
    example: 'Cho $\\vec{u}=(1;2;0), \\vec{v}=(0;1;3) \\Rightarrow [\\vec{u},\\vec{v}] = (6; -3; 1)$. Thử lại: $6\\cdot 1 - 3\\cdot 2 + 1\\cdot 0 = 0$.',
    interactiveNote: 'Quan sát điểm và vectơ trong không gian Oxyz kèm độ dài và các thành phần tọa độ.',
    dimension: '3d',
    templateId: 'T3D_34',
    challengeId: 'S3D_L15_C05',
    categories: ['Định lí và hệ quả', 'Tính chất hình học'],
  },

  // ==================== TOÁN 12 – CHƯƠNG V (4 BÀI) ====================
  {
    id: 't12_b14',
    grade: '12',
    chapterId: 'ch12_5',
    chapterTitle: 'Chương V. Phương pháp tọa độ trong không gian',
    lessonNumber: 14,
    title: 'Bài 14. Phương trình mặt phẳng',
    summary: 'Vectơ pháp tuyến, phương trình tổng quát, phương trình theo đoạn chắn, vị trí tương đối hai mặt phẳng và khoảng cách từ điểm đến mặt phẳng.',
    keyFormulas: [
      'A(x - x_0) + B(y - y_0) + C(z - z_0) = 0 \\Leftrightarrow Ax + By + Cz + D = 0',
      '\\frac{x}{a} + \\frac{y}{b} + \\frac{z}{c} = 1\\; (\\text{đoạn chắn})',
      'd(M_0, (P)) = \\frac{|Ax_0 + By_0 + Cz_0 + D|}{\\sqrt{A^2 + B^2 + C^2}}',
    ],
    theorem: 'Mặt phẳng đi qua $M_0(x_0; y_0; z_0)$ và nhận $\\vec{n}(A; B; C) \\ne \\vec{0}$ làm vectơ pháp tuyến có phương trình $A(x-x_0)+B(y-y_0)+C(z-z_0)=0$.',
    hypothesis: 'Một điểm thuộc mặt phẳng và một vectơ pháp tuyến (hoặc hai vectơ chỉ phương không cùng phương $\\vec{u}, \\vec{v} \\Rightarrow \\vec{n} = [\\vec{u}, \\vec{v}]$).',
    conclusion: 'Viết được phương trình mặt phẳng, xét song song/vuông góc giữa hai mặt phẳng và tính nhanh khoảng cách từ điểm bất kì đến mặt phẳng.',
    method: 'Nếu biết 3 điểm không thẳng hàng $A, B, C$, tính $\\vec{n} = [\\overrightarrow{AB}, \\overrightarrow{AC}]$ rồi lập phương trình đi qua $A$.',
    example: 'Mặt phẳng đi qua $A(2;0;0), B(0;-3;0), C(0;0;4)$ có phương trình $\\dfrac{x}{2} - \\dfrac{y}{3} + \\dfrac{z}{4} = 1 \\Leftrightarrow 6x - 4y + 3z - 12 = 0$.',
    interactiveNote: 'Quan sát trực quan mặt phẳng tổng quát, các giao điểm với ba trục tọa độ và vectơ pháp tuyến trong Oxyz.',
    dimension: '3d',
    templateId: 'T3D_36',
    challengeId: 'S3D_L16_C01',
    categories: ['Định lí và hệ quả', 'Phương pháp dựng hình'],
  },
  {
    id: 't12_b15',
    grade: '12',
    chapterId: 'ch12_5',
    chapterTitle: 'Chương V. Phương pháp tọa độ trong không gian',
    lessonNumber: 15,
    title: 'Bài 15. Phương trình đường thẳng trong không gian',
    summary: 'Phương trình tham số, phương trình chính tắc của đường thẳng và xét vị trí tương đối giữa hai đường thẳng trong Oxyz.',
    keyFormulas: [
      '\\text{Tham số: } \\begin{cases} x = x_0 + a t \\\\ y = y_0 + b t \\\\ z = z_0 + c t \\end{cases},\\qquad \\text{Chính tắc: } \\frac{x-x_0}{a} = \\frac{y-y_0}{b} = \\frac{z-z_0}{c}',
    ],
    theorem: 'Đường thẳng $d$ đi qua $M_0(x_0; y_0; z_0)$ có vectơ chỉ phương $\\vec{u}(a; b; c) \\ne \\vec{0}$ được biểu diễn bằng phương trình tham số (và chính tắc khi $abc \\ne 0$).',
    hypothesis: 'Điểm $M_0$ và vectơ chỉ phương $\\vec{u}(a; b; c)$ trong hệ tọa độ $Oxyz$.',
    conclusion: 'Tìm được giao điểm giữa đường thẳng và mặt phẳng (thay tham số $t$), và phân biệt hai đường thẳng song song, trùng nhau, cắt nhau hay chéo nhau.',
    method: 'Để tìm hình chiếu vuông góc của điểm $M$ lên đường thẳng $d$, tham số hóa $H(t) \\in d$ rồi giải điều kiện $\\overrightarrow{MH}\\cdot\\vec{u}_d = 0$.',
    example: 'Đường thẳng qua $A(1; -2; 3)$ có $\\vec{u} = (2; -1; 4)$ có phương trình chính tắc $\\dfrac{x-1}{2} = \\dfrac{y+2}{-1} = \\dfrac{z-3}{4}$.',
    interactiveNote: 'Quan sát đường thẳng trong không gian Oxyz cùng điểm đi qua và vectơ chỉ phương.',
    dimension: '3d',
    templateId: 'T3D_37',
    challengeId: 'S3D_L17_C01',
    categories: ['Khái niệm và định nghĩa', 'Phương pháp dựng hình'],
  },
  {
    id: 't12_b16',
    grade: '12',
    chapterId: 'ch12_5',
    chapterTitle: 'Chương V. Phương pháp tọa độ trong không gian',
    lessonNumber: 16,
    title: 'Bài 16. Công thức tính góc trong không gian',
    summary: 'Công thức tọa độ tính góc giữa hai đường thẳng, góc giữa đường thẳng và mặt phẳng, góc giữa hai mặt phẳng trong Oxyz.',
    keyFormulas: [
      '\\cos(d_1, d_2) = \\frac{|\\vec{u}_1\\cdot\\vec{u}_2|}{|\\vec{u}_1|\\cdot|\\vec{u}_2|}',
      '\\sin(d, (P)) = \\frac{|\\vec{u}_d\\cdot\\vec{n}_P|}{|\\vec{u}_d|\\cdot|\\vec{n}_P|}',
      '\\cos((P), (Q)) = \\frac{|\\vec{n}_P\\cdot\\vec{n}_Q|}{|\\vec{n}_P|\\cdot|\\vec{n}_Q|}',
    ],
    theorem: 'Ba góc chuẩn trong không gian đều thuộc đoạn $[0^\\circ; 90^\\circ]$: góc hai đường thẳng và góc hai mặt phẳng dùng $\\cos$ qua hai vectơ cùng loại; góc đường thẳng và mặt phẳng dùng $\\sin$ qua cặp vectơ chỉ phương – pháp tuyến.',
    hypothesis: 'Vectơ chỉ phương $\\vec{u}$ của đường thẳng và vectơ pháp tuyến $\\vec{n}$ của mặt phẳng trong $Oxyz$.',
    conclusion: 'Tính trực tiếp mọi góc trong không gian bằng đại số vectơ mà không cần dựng hình chiếu phức tạp.',
    method: 'Luôn lấy giá trị tuyệt đối ở tử số để kết quả thuộc $[0; 1]$, đảm bảo góc nằm đúng trong $[0^\\circ; 90^\\circ]$. Lưu ý phân biệt $\\sin$ (đường – mặt) với $\\cos$ (đường – đường, mặt – mặt).',
    example: 'Với $(P): x+y-1=0$ ($\\vec{n}_P=(1;1;0)$) và $(Q): y+z-2=0$ ($\\vec{n}_Q=(0;1;1)$), ta có $\\cos((P),(Q)) = \\dfrac{1}{2} \\Rightarrow ((P),(Q)) = 60^\\circ$.',
    interactiveNote: 'Quan sát hai mặt phẳng cắt nhau theo giao tuyến trong hệ tọa độ Oxyz và góc giữa hai mặt phẳng.',
    dimension: '3d',
    templateId: 'T3D_40',
    challengeId: 'S3D_L17_C06',
    categories: ['Định lí và hệ quả', 'Tính chất hình học'],
  },
  {
    id: 't12_b17',
    grade: '12',
    chapterId: 'ch12_5',
    chapterTitle: 'Chương V. Phương pháp tọa độ trong không gian',
    lessonNumber: 17,
    title: 'Bài 17. Phương trình mặt cầu',
    summary: 'Phương trình chính tắc và khai triển của mặt cầu trong Oxyz, xác định tâm – bán kính và giao tuyến của mặt phẳng với mặt cầu.',
    keyFormulas: [
      '(x - a)^2 + (y - b)^2 + (z - c)^2 = R^2',
      'x^2 + y^2 + z^2 - 2ax - 2by - 2cz + d = 0\\; (R = \\sqrt{a^2 + b^2 + c^2 - d})',
      'd(I, (P)) < R \\Rightarrow r_{\\text{giao tuyến}} = \\sqrt{R^2 - d^2}',
    ],
    theorem: 'Mặt cầu tâm $I(a; b; c)$, bán kính $R > 0$ là tập hợp các điểm $M(x; y; z)$ thỏa mãn $(x-a)^2+(y-b)^2+(z-c)^2=R^2$. Mặt phẳng $(P)$ tiếp xúc mặt cầu khi và chỉ khi $d(I, (P)) = R$.',
    hypothesis: 'Tâm $I(a; b; c)$, bán kính $R > 0$ và mặt phẳng $(P)$ trong không gian $Oxyz$.',
    conclusion: 'Xác định tâm, bán kính, vị trí tương đối mặt phẳng – mặt cầu và tính bán kính đường tròn giao tuyến.',
    method: 'Với mặt cầu đường kính $AB$, tìm tâm $I$ là trung điểm $AB$ và bán kính $R = \\dfrac{AB}{2}$. Với mặt cầu tiếp xúc $(P)$, tính $R = d(I, (P))$.',
    example: 'Mặt cầu tâm $I(0;0;0), R=5$ cắt mặt phẳng $(P): z = 3$ theo đường tròn giao tuyến có bán kính $r = \\sqrt{5^2 - 3^2} = 4$.',
    interactiveNote: 'Quan sát mặt cầu trong hệ trục tọa độ Oxyz kèm tâm, bán kính và mặt phẳng cắt.',
    dimension: '3d',
    templateId: 'T3D_38',
    challengeId: 'S3D_L18_C01',
    categories: ['Định lí và hệ quả', 'Phương pháp dựng hình'],
  },
];

export interface ThptGradeInventory {
  grade: ThptGrade;
  chaptersCount: number;
  lessonsCount: number;
  templates2DCount: number;
  templates3DCount: number;
  templatesTotal: number;
  challenges2DCount: number;
  challenges3DCount: number;
  challengesTotal: number;
  arenaQuizCount: number;
  arenaConstructCount: number;
}

export interface ThptInventoryStats {
  byGrade: Record<ThptGrade, ThptGradeInventory>;
  extensionTemplates2D: number;
  extensionChallenges2D: number;
  totals: {
    chapters: number;
    lessons: number;
    templates2D: number;
    templates3D: number;
    templatesAll: number;
    challenges2D: number;
    challenges3D: number;
    challengesAll: number;
    arenaQuizAll: number;
  };
}

export function getLessonsByGrade(grade: ThptGradeFilter): ThptLesson[] {
  if (grade === 'all') return THPT_LESSONS;
  return THPT_LESSONS.filter((l) => l.grade === grade);
}

export function getChaptersByGrade(grade: ThptGradeFilter): ThptChapter[] {
  if (grade === 'all') return THPT_CHAPTERS;
  return THPT_CHAPTERS.filter((c) => c.grade === grade);
}

export function template2DMatchesGrade(tag: 'Toán 10' | 'Mở rộng', grade: ThptGradeFilter): boolean {
  if (grade === 'all') return true;
  if (grade === '10') return tag === 'Toán 10';
  return false;
}

export function template3DMatchesGrade(
  tag: 'Toán 11' | 'Toán 12' | 'Kiến thức mở rộng',
  grade: ThptGradeFilter
): boolean {
  if (grade === 'all') return true;
  if (grade === '11') return tag === 'Toán 11';
  if (grade === '12') return tag === 'Toán 12';
  return false;
}

/**
 * Thống kê động hoàn toàn từ dữ liệu thực tế — tuyệt đối không hardcode số lượng.
 */
export function getThptInventoryStats(): ThptInventoryStats {
  const computeGrade = (grade: ThptGrade): ThptGradeInventory => {
    const label = grade === '10' ? 'Toán 10' : grade === '11' ? 'Toán 11' : 'Toán 12';
    const chaptersCount = THPT_CHAPTERS.filter((c) => c.grade === grade).length;
    const lessonsCount = THPT_LESSONS.filter((l) => l.grade === grade).length;
    const templates2DCount = TEMPLATES_2D.filter((t) => template2DMatchesGrade(t.curriculumTag, grade)).length;
    const templates3DCount = TEMPLATES_3D.filter((t) => template3DMatchesGrade(t.curriculumTag, grade)).length;
    const challenges2DCount = ALL_CHALLENGES.filter((c) => getChallengeProgramLabel(c) === label).length;
    const challenges3DCount = ALL_CHALLENGES_3D.filter((c) => c.curriculumTag === label).length;
    const arenaQuizCount = ARENA_THPT_PROBLEMS.filter((p) => p.grade === grade).length;
    const arenaConstructCount = challenges2DCount;

    return {
      grade,
      chaptersCount,
      lessonsCount,
      templates2DCount,
      templates3DCount,
      templatesTotal: templates2DCount + templates3DCount,
      challenges2DCount,
      challenges3DCount,
      challengesTotal: challenges2DCount + challenges3DCount,
      arenaQuizCount,
      arenaConstructCount,
    };
  };

  const g10 = computeGrade('10');
  const g11 = computeGrade('11');
  const g12 = computeGrade('12');

  const extensionTemplates2D = TEMPLATES_2D.filter((t) => t.curriculumTag === 'Mở rộng').length;
  const extensionChallenges2D = ALL_CHALLENGES.filter((c) => {
    const lbl = getChallengeProgramLabel(c);
    return lbl === 'Kiến thức mở rộng' || lbl === 'Hình học Olympic';
  }).length;

  return {
    byGrade: { '10': g10, '11': g11, '12': g12 },
    extensionTemplates2D,
    extensionChallenges2D,
    totals: {
      chapters: THPT_CHAPTERS.length,
      lessons: THPT_LESSONS.length,
      templates2D: TEMPLATES_2D.length,
      templates3D: TEMPLATES_3D.length,
      templatesAll: TEMPLATES_2D.length + TEMPLATES_3D.length,
      challenges2D: ALL_CHALLENGES.length,
      challenges3D: ALL_CHALLENGES_3D.length,
      challengesAll: ALL_CHALLENGES.length + ALL_CHALLENGES_3D.length,
      arenaQuizAll: ARENA_THPT_PROBLEMS.length,
    },
  };
}
