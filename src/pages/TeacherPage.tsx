import React, { useMemo, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  GraduationCap,
  Play,
  Plus,
  Presentation,
  Sigma,
  Trash2,
  Users,
  Wrench,
} from 'lucide-react';
import { ALL_CHALLENGES, getChallengeProgramLabel, getChallengesByLevel, LEVELS } from '../challenges';
import { ThptGradeFilterBar } from '../components/common/ThptGradeFilterBar';
import { GeometryCanvas } from '../components/geometry/GeometryCanvas';
import { MathFormulaEditor } from '../components/math/MathFormulaEditor';
import { MathText } from '../components/math/MathText';
import { addGeoObject, createEmptyScene } from '../geometry/engine';
import { ALL_CHALLENGES_3D } from '../geometry3d/challenges3d';
import {
  COMPASS_ONLY_TOOLS,
  EUCLIDEAN_BASIC_TOOLS,
  STRAIGHTEDGE_ONLY_TOOLS,
  TOOL_CATALOG,
} from '../geometry/tools';
import type { GeoPoint, GeoScene, ToolId } from '../geometry/types';
import type { ClassroomRecord } from '../services/storageService';
import { useApp } from '../store/AppContext';
import type {
  ChallengeDefinition,
  Difficulty,
  GradeTag,
  InitialGeoSpec,
  ValidationRuleType,
} from '../validators/types';

type TeacherTab = 'lessons' | 'builder' | 'classes' | 'present';

const RULE_TEMPLATES: Array<{
  type: ValidationRuleType;
  label: string;
  needDesc: string;
  buildInitial: () => GeoScene;
  refs: string[];
}> = [
  {
    type: 'equilateral_on_segment',
    label: 'Dựng tam giác đều trên đoạn AB',
    needDesc: 'Cho sẵn đoạn AB, học sinh dựng đỉnh C tạo tam giác đều ABC.',
    refs: ['A', 'B'],
    buildInitial: () => {
      let sc = createEmptyScene();
      sc = addGeoObject(sc, { id: 'A', kind: 'point', rule: 'free_point', parents: [], x: -80, y: 35, label: 'A', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeoObject(sc, { id: 'B', kind: 'point', rule: 'free_point', parents: [], x: 80, y: 35, label: 'B', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeoObject(sc, { id: 'sAB', kind: 'segment', rule: 'segment_two_points', parents: ['A', 'B'], label: 'AB', style: { isGiven: true, color: '#172033' }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    type: 'midpoint_of',
    label: 'Dựng trung điểm của đoạn thẳng AB',
    needDesc: 'Cho sẵn hai điểm A, B và đoạn AB, học sinh dựng trung điểm M.',
    refs: ['A', 'B'],
    buildInitial: () => {
      let sc = createEmptyScene();
      sc = addGeoObject(sc, { id: 'A', kind: 'point', rule: 'free_point', parents: [], x: -90, y: 10, label: 'A', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeoObject(sc, { id: 'B', kind: 'point', rule: 'free_point', parents: [], x: 90, y: -10, label: 'B', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeoObject(sc, { id: 'sAB', kind: 'segment', rule: 'segment_two_points', parents: ['A', 'B'], label: 'AB', style: { isGiven: true, color: '#172033' }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    type: 'perpendicular_bisector_of',
    label: 'Dựng đường trung trực của đoạn thẳng AB',
    needDesc: 'Cho sẵn đoạn AB, học sinh dựng đường thẳng vuông góc tại trung điểm.',
    refs: ['A', 'B'],
    buildInitial: () => {
      let sc = createEmptyScene();
      sc = addGeoObject(sc, { id: 'A', kind: 'point', rule: 'free_point', parents: [], x: -85, y: 20, label: 'A', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeoObject(sc, { id: 'B', kind: 'point', rule: 'free_point', parents: [], x: 85, y: -20, label: 'B', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeoObject(sc, { id: 'sAB', kind: 'segment', rule: 'segment_two_points', parents: ['A', 'B'], label: 'AB', style: { isGiven: true, color: '#172033' }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    type: 'parallel_through_point',
    label: 'Dựng đường song song qua điểm P',
    needDesc: 'Cho đường thẳng AB và điểm P ngoài đường thẳng, dựng đường qua P song song AB.',
    refs: ['lAB', 'P'],
    buildInitial: () => {
      let sc = createEmptyScene();
      sc = addGeoObject(sc, { id: 'A', kind: 'point', rule: 'free_point', parents: [], x: -100, y: 45, label: 'A', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeoObject(sc, { id: 'B', kind: 'point', rule: 'free_point', parents: [], x: 100, y: 35, label: 'B', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeoObject(sc, { id: 'lAB', kind: 'line', rule: 'line_two_points', parents: ['A', 'B'], label: 'd', style: { isGiven: true, color: '#172033' }, skipLog: true }).scene;
      sc = addGeoObject(sc, { id: 'P', kind: 'point', rule: 'free_point', parents: [], x: -10, y: -45, label: 'P', style: { isGiven: true, color: '#D97706' }, skipLog: true }).scene;
      return sc;
    },
  },
  {
    type: 'angle_bisector_of',
    label: 'Dựng tia phân giác góc AOB',
    needDesc: 'Cho góc AOB tạo bởi hai tia OA, OB, học sinh dựng đường phân giác.',
    refs: ['A', 'O', 'B'],
    buildInitial: () => {
      let sc = createEmptyScene();
      sc = addGeoObject(sc, { id: 'O', kind: 'point', rule: 'free_point', parents: [], x: -85, y: 45, label: 'O', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeoObject(sc, { id: 'A', kind: 'point', rule: 'free_point', parents: [], x: 95, y: 45, label: 'A', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeoObject(sc, { id: 'B', kind: 'point', rule: 'free_point', parents: [], x: 40, y: -70, label: 'B', style: { isGiven: true, color: '#0F766E' }, skipLog: true }).scene;
      sc = addGeoObject(sc, { id: 'rOA', kind: 'ray', rule: 'ray_two_points', parents: ['O', 'A'], label: 'OA', style: { isGiven: true, color: '#172033' }, skipLog: true }).scene;
      sc = addGeoObject(sc, { id: 'rOB', kind: 'ray', rule: 'ray_two_points', parents: ['O', 'B'], label: 'OB', style: { isGiven: true, color: '#172033' }, skipLog: true }).scene;
      return sc;
    },
  },
];

const SELECTABLE_TOOLS: ToolId[] = [
  'select',
  'pan',
  'point',
  'point_on_object',
  'intersect',
  'line',
  'segment',
  'ray',
  'circle_cp',
  'compass',
  'midpoint',
  'perp_bisector',
  'perpendicular',
  'parallel',
  'angle_bisector',
];

export const TeacherPage: React.FC = () => {
  const {
    teacherPreviewMode,
    setTeacherPreviewMode,
    openChallenge,
    activeGradeFilter,
    setActiveGradeFilter,
    openChallenge3D,
    customChallenges,
    saveCustomChallenge,
    deleteCustomChallenge,
    classes,
    saveClass,
    deleteClass,
    settings,
    updateSettings,
    setPage,
  } = useApp();

  const [tab, setTab] = useState<TeacherTab>('lessons');
  const [lessonLevelFilter, setLessonLevelFilter] = useState<number>(1);

  // Builder state
  const [bTitle, setBTitle] = useState('Bài tập dựng trung điểm đoạn thẳng AB');
  const [bDesc, setBDesc] = useState(
    'Cho đoạn thẳng $AB$. Hãy dựng trung điểm $M$ của $AB$ chỉ bằng thước thẳng và compa.'
  );
  const [bGrade, setBGrade] = useState<GradeTag>('Lớp 10');
  const [bDiff, setBDiff] = useState<Difficulty>('Cơ bản');
  const [bTargetL, setBTargetL] = useState(3);
  const [bTargetE, setBTargetE] = useState(3);
  const [bHint1, setBHint1] = useState('Vẽ hai đường tròn cùng bán kính tâm $A$ và $B$.');
  const [bHint2, setBHint2] = useState('Nối hai giao điểm của hai đường tròn để tạo đường trung trực.');
  const [bHint3, setBHint3] = useState('Lấy giao điểm của đường trung trực với đoạn $AB$.');
  const [bRuleIdx, setBRuleIdx] = useState(1);
  const [bScene, setBScene] = useState<GeoScene>(() => RULE_TEMPLATES[1].buildInitial());
  const [bAllowedTools, setBAllowedTools] = useState<ToolId[]>([...EUCLIDEAN_BASIC_TOOLS]);
  const [showFormulaEditor, setShowFormulaEditor] = useState(false);
  const [builderToast, setBuilderToast] = useState<string | null>(null);

  // Classroom state
  const [className, setClassName] = useState('');
  const [classGrade, setClassGrade] = useState('Lớp 10');
  const [newStudentNames, setNewStudentNames] = useState<Record<string, string>>({});

  const totalSystemChallenges = ALL_CHALLENGES.length + ALL_CHALLENGES_3D.length;

  const filteredLessons = useMemo(() => {
    if (activeGradeFilter === '10') {
      return getChallengesByLevel(lessonLevelFilter).filter(
        (c) => getChallengeProgramLabel(c) === 'Toán 10'
      );
    }
    return getChallengesByLevel(lessonLevelFilter);
  }, [lessonLevelFilter, activeGradeFilter]);

  const filtered3DLessons = useMemo(() => {
    if (activeGradeFilter === '10') return [];
    if (activeGradeFilter === '11') {
      return ALL_CHALLENGES_3D.filter((c) => c.curriculumTag === 'Toán 11').slice(0, 20);
    }
    if (activeGradeFilter === '12') {
      return ALL_CHALLENGES_3D.filter((c) => c.curriculumTag === 'Toán 12').slice(0, 20);
    }
    return ALL_CHALLENGES_3D.slice(0, 12);
  }, [activeGradeFilter]);

  const handleRuleTemplateChange = (idx: number) => {
    setBRuleIdx(idx);
    const tpl = RULE_TEMPLATES[idx];
    if (tpl) {
      setBScene(tpl.buildInitial());
    }
  };

  const handleSaveCustomChallenge = async () => {
    const tpl = RULE_TEMPLATES[bRuleIdx];
    const initialGeometry: InitialGeoSpec[] = bScene.order
      .map((id) => bScene.objects[id])
      .filter((o): o is NonNullable<typeof o> => Boolean(o))
      .map((o) => ({
        id: o.id,
        kind: o.kind,
        rule: o.rule,
        parents: o.parents,
        label: o.label,
        x: o.kind === 'point' ? o.x : undefined,
        y: o.kind === 'point' ? o.y : undefined,
        params: o.params,
        style: { ...o.style, isGiven: true },
      }));

    const freePointIds = bScene.order
      .map((id) => bScene.objects[id])
      .filter((o): o is GeoPoint => Boolean(o && o.kind === 'point' && o.rule === 'free_point'))
      .map((p) => p.id);

    const newChallenge: ChallengeDefinition = {
      id: `CUSTOM_${Date.now().toString(36).toUpperCase()}`,
      levelId: 1,
      order: customChallenges.length + 1,
      title: bTitle.trim() || 'Thử thách do giáo viên tạo',
      description: bDesc.trim() || tpl.needDesc,
      difficulty: bDiff,
      gradeTags: [bGrade],
      curriculumCategory: 'Chính khóa',
      cognitiveLevel: 'Vận dụng',
      prerequisites: [],
      initialGeometry,
      allowedTools: bAllowedTools.length > 0 ? bAllowedTools : [...EUCLIDEAN_BASIC_TOOLS],
      forbiddenTools: [],
      constraints: ['Bài tập tự tạo trong Công cụ giáo viên'],
      validationRules: [
        {
          type: tpl.type,
          refs: tpl.refs,
          description: tpl.label,
        },
      ],
      perturbationRules: {
        freePointIds,
        jitterRadius: 22,
        minSeparation: 45,
      },
      targetL: Math.max(1, bTargetL),
      targetE: Math.max(1, bTargetE),
      hints: [bHint1, bHint2, bHint3],
      solutionSteps: [],
      proof: 'Kiểm chứng trực tiếp bằng quy tắc hình học động trên nhiều cấu hình biến động.',
      thumbnailKind: 'perpendicular',
      educationalNotes: 'Bài tập thực hành do giáo viên biên soạn.',
      isTeacherCustom: true,
    };

    await saveCustomChallenge(newChallenge);
    setBuilderToast('Đã lưu thử thách mới! Bạn có thể bấm "Chạy thử ngay" ở danh sách bên dưới.');
    window.setTimeout(() => setBuilderToast(null), 4000);
  };

  const handleCreateClass = async () => {
    if (!className.trim()) return;
    const cls: ClassroomRecord = {
      id: `cls_${Date.now()}`,
      name: className.trim(),
      grade: classGrade,
      schoolYear: '2025 – 2026',
      assignedChallengeIds: ['L01_C01', 'L02_C01', 'L03_C01'],
      students: [],
      createdAt: new Date().toISOString(),
    };
    await saveClass(cls);
    setClassName('');
  };

  const handleAddStudent = async (cls: ClassroomRecord) => {
    const name = (newStudentNames[cls.id] ?? '').trim();
    if (!name) return;
    await saveClass({
      ...cls,
      students: [
        ...cls.students,
        {
          id: `st_${Date.now()}`,
          name,
          completedCount: 0,
          stars: 0,
        },
      ],
    });
    setNewStudentNames((prev) => ({ ...prev, [cls.id]: '' }));
  };

  const exportClassCsv = (cls: ClassroomRecord) => {
    const rows = [
      ['STT', 'Ho ten hoc sinh', 'Lop', 'So bai hoan thanh', 'Tong sao'],
      ...cls.students.map((s, i) => [
        String(i + 1),
        `"${s.name.replace(/"/g, '""')}"`,
        `"${cls.name}"`,
        String(s.completedCount),
        String(s.stars),
      ]),
    ];
    const csv = '\uFEFF' + rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `danh-sach-${cls.name.toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <GraduationCap className="w-8 h-8 text-teal-700 dark:text-teal-400" />
            Công cụ Giáo viên (Miễn phí hoàn toàn)
          </h1>
          <p className="text-[15px] text-slate-600 dark:text-slate-400 mt-1">
            Mở xem trước toàn bộ {totalSystemChallenges} bài học 2D – 3D THPT để giảng dạy, tự tạo bài tập dựng hình trực quan, quản lý lớp học và bật chế độ trình chiếu cỡ lớn.
          </p>
        </div>

        {/* Teacher Preview Switch */}
        <button
          type="button"
          onClick={() => setTeacherPreviewMode(!teacherPreviewMode)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
            teacherPreviewMode
              ? 'bg-violet-700 text-white border-violet-700'
              : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-violet-500'
          }`}
        >
          <Eye className="w-4 h-4" />
          {teacherPreviewMode
            ? `Đang bật Xem trước ${ALL_CHALLENGES.length} bài 2D`
            : `Bật Xem trước toàn bộ ${ALL_CHALLENGES.length} bài 2D`}
        </button>
      </div>

      {/* 4 Workspace Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {(
          [
            ['lessons', `Quản lý ${totalSystemChallenges} bài học`, BookOpen],
            ['builder', 'Tạo thử thách mới', Wrench],
            ['classes', 'Quản lý lớp học THPT', Users],
            ['present', 'Chế độ giảng dạy & Trình chiếu', Presentation],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === id
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: LESSONS & TEACHER PREVIEW */}
      {tab === 'lessons' && (
        <div className="space-y-5">
          <div className="rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800 p-4 text-sm text-violet-900 dark:text-violet-200">
            <strong>Chế độ Xem trước Giáo viên:</strong> Khi mở bất kỳ bài nào từ đây, hệ thống tự động mở khóa xem trước để giảng dạy và chiếu lời giải từng bước mà <strong>không làm thay đổi sao hay tiến trình cá nhân</strong> của học sinh trên thiết bị.
          </div>

          <ThptGradeFilterBar value={activeGradeFilter} onChange={setActiveGradeFilter} />

          {/* 2D Lessons (Toán 10 & All) */}
          {(activeGradeFilter === 'all' || activeGradeFilter === '10') && (
            <div className="space-y-3">
              <div className="flex gap-1.5 overflow-x-auto pb-2">
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => setLessonLevelFilter(l.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-semibold ${
                      lessonLevelFilter === l.id
                        ? 'bg-teal-700 text-white'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Cấp {l.roman}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredLessons.map((ch) => (
                  <div
                    key={ch.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                        2D · Bài {ch.order} · {ch.curriculumCategory} · {ch.gradeTags.join(', ')} · {ch.targetL}L/{ch.targetE}E
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white truncate mt-0.5">
                        {ch.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        <MathText text={ch.description} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openChallenge(ch.id, { teacherPreview: true })}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Chiếu bài 2D
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3D Lessons (Toán 11 & Toán 12) */}
          {filtered3DLessons.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Bài thực hành Hình học Không gian 3D &amp; Oxyz ({filtered3DLessons.length} bài tiêu biểu)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtered3DLessons.map((ch) => (
                  <div
                    key={ch.id}
                    className="rounded-xl border border-sky-200/80 dark:border-sky-800/70 bg-white dark:bg-slate-900 p-4 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                        3D · Cấp {ch.levelId}.{ch.order} · {ch.curriculumTag} · {ch.difficulty}
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white truncate mt-0.5">
                        {ch.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        <MathText text={ch.description} />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openChallenge3D(ch.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-sky-700 text-white text-sm font-semibold hover:bg-sky-800 shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Chiếu bài 3D
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: VISUAL NO-JSON CHALLENGE BUILDER */}
      {tab === 'builder' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Trình tạo thử thách trực quan (Không cần viết mã)
              </h2>
              <p className="text-[15px] text-slate-500 dark:text-slate-400 mt-0.5">
                Chọn mục tiêu kiểm chứng, kéo vị trí các điểm đề bài ngay trên bảng vẽ, chèn công thức bằng bàn phím Toán học trực quan rồi lưu vào máy.
              </p>
            </div>

            {builderToast && (
              <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {builderToast}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form fields */}
              <div className="lg:col-span-6 space-y-4">
                <label className="block space-y-1 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Tiêu đề bài tập</span>
                  <input
                    type="text"
                    value={bTitle}
                    onChange={(e) => setBTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </label>

                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      Đề bài yêu cầu dựng hình
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowFormulaEditor((v) => !v)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-semibold hover:bg-teal-100"
                    >
                      <Sigma className="w-3.5 h-3.5" />
                      {showFormulaEditor ? 'Ẩn bàn phím công thức' : 'Chèn công thức Toán học'}
                    </button>
                  </div>
                  <textarea
                    rows={3}
                    value={bDesc}
                    onChange={(e) => setBDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
                    <span className="text-xs font-semibold text-slate-400 mr-1.5">Xem trước:</span>
                    <MathText text={bDesc} />
                  </div>
                </div>

                {showFormulaEditor && (
                  <MathFormulaEditor
                    onApply={(formula) => {
                      setBDesc((prev) => `${prev.trim()} ${formula} `);
                      setShowFormulaEditor(false);
                    }}
                    onCancel={() => setShowFormulaEditor(false)}
                  />
                )}

                <label className="block space-y-1 text-sm">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Quy tắc kiểm chứng tính chính xác của phép dựng
                  </span>
                  <select
                    value={bRuleIdx}
                    onChange={(e) => handleRuleTemplateChange(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {RULE_TEMPLATES.map((tpl, idx) => (
                      <option key={tpl.type} value={idx}>
                        {tpl.label}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-slate-500">Khối lớp</span>
                    <select
                      value={bGrade}
                      onChange={(e) => setBGrade(e.target.value as GradeTag)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      {(['Lớp 10', 'Lớp 11', 'Lớp 12', 'Học sinh giỏi'] as GradeTag[]).map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-slate-500">Độ khó</span>
                    <select
                      value={bDiff}
                      onChange={(e) => setBDiff(e.target.value as Difficulty)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    >
                      {(['Cơ bản', 'Trung bình', 'Khá', 'Nâng cao', 'Olympic'] as Difficulty[]).map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-slate-500">Mục tiêu L</span>
                    <input
                      type="number"
                      min={1}
                      max={30}
                      value={bTargetL}
                      onChange={(e) => setBTargetL(Number(e.target.value) || 3)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono-tabular"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-slate-500">Mục tiêu E</span>
                    <input
                      type="number"
                      min={1}
                      max={40}
                      value={bTargetE}
                      onChange={(e) => setBTargetE(Number(e.target.value) || 3)}
                      className="w-full px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono-tabular"
                    />
                  </label>
                </div>

                {/* Tool permissions */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Công cụ cho phép học sinh dùng
                    </span>
                    <div className="flex gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => setBAllowedTools([...EUCLIDEAN_BASIC_TOOLS])}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 text-teal-800 dark:text-teal-300 font-medium"
                      >
                        Thước &amp; Compa cơ bản
                      </button>
                      <button
                        type="button"
                        onClick={() => setBAllowedTools([...COMPASS_ONLY_TOOLS])}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 text-violet-800 dark:text-violet-300 font-medium"
                      >
                        Chỉ Compa
                      </button>
                      <button
                        type="button"
                        onClick={() => setBAllowedTools([...STRAIGHTEDGE_ONLY_TOOLS])}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-sky-50 text-sky-800 dark:text-sky-300 font-medium"
                      >
                        Chỉ Thước
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-xs">
                    {SELECTABLE_TOOLS.map((tid) => (
                      <label
                        key={tid}
                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={bAllowedTools.includes(tid)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBAllowedTools([...bAllowedTools, tid]);
                            } else {
                              setBAllowedTools(bAllowedTools.filter((t) => t !== tid));
                            }
                          }}
                          className="rounded text-teal-700"
                        />
                        <span className="truncate">{TOOL_CATALOG[tid].name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Interactive canvas to position initial givens */}
              <div className="lg:col-span-6 space-y-3">
                <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Kéo chỉnh vị trí hình đề bài ban đầu
                </div>
                <GeometryCanvas
                  scene={bScene}
                  onSceneChange={setBScene}
                  interactiveDragOnly
                  compactToolbar
                  heightClass="h-[340px]"
                  darkTheme={settings.theme === 'dark'}
                />

                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    3 cấp gợi ý cho học sinh
                  </div>
                  <input
                    type="text"
                    value={bHint1}
                    onChange={(e) => setBHint1(e.target.value)}
                    placeholder="Gợi ý cấp 1..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    value={bHint2}
                    onChange={(e) => setBHint2(e.target.value)}
                    placeholder="Gợi ý cấp 2..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <input
                    type="text"
                    value={bHint3}
                    onChange={(e) => setBHint3(e.target.value)}
                    placeholder="Gợi ý cấp 3..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => void handleSaveCustomChallenge()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800"
                  >
                    <Plus className="w-4 h-4" />
                    Lưu thử thách vào thiết bị
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Saved custom challenges */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Kho thử thách tự tạo ({customChallenges.length})
            </h3>
            {customChallenges.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có thử thách tự tạo nào.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {customChallenges.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 p-3.5 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {c.title}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {c.gradeTags.join(', ')} · {c.difficulty} · {c.targetL}L/{c.targetE}E
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => openChallenge(c.id, { teacherPreview: false })}
                        className="px-3 py-1.5 rounded-lg bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800"
                      >
                        Chạy thử ngay
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteCustomChallenge(c.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                        title="Xóa thử thách"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: LOCAL CLASSROOM MANAGEMENT */}
      {tab === 'classes' && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-wrap items-end gap-3">
            <label className="flex-1 min-w-[200px] space-y-1 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Tên lớp học mới</span>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="Ví dụ: Lớp 10A1 – Hình học THPT"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </label>
            <label className="w-36 space-y-1 text-sm">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Khối</span>
              <select
                value={classGrade}
                onChange={(e) => setClassGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              >
                {['Lớp 10', 'Lớp 11', 'Lớp 12', 'CLB Toán THPT'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => void handleCreateClass()}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-700 text-white font-semibold text-sm hover:bg-teal-800"
            >
              <Plus className="w-4 h-4" />
              Tạo lớp
            </button>
          </div>

          {classes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center text-sm text-slate-500">
              Chưa có lớp học nào. Tạo lớp để quản lý danh sách học sinh, ghi nhận sao và xuất bảng điểm CSV ngay trên máy tính.
            </div>
          ) : (
            <div className="space-y-4">
              {classes.map((cls) => (
                <div
                  key={cls.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {cls.name} · {cls.grade}
                      </h3>
                      <div className="text-xs text-slate-500">
                        Năm học {cls.schoolYear} · {cls.students.length} học sinh
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => exportClassCsv(cls)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Xuất CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteClass(cls.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600"
                        title="Xóa lớp"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Add student */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newStudentNames[cls.id] ?? ''}
                      onChange={(e) =>
                        setNewStudentNames((prev) => ({ ...prev, [cls.id]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && void handleAddStudent(cls)}
                      placeholder="Nhập họ tên học sinh cần thêm..."
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => void handleAddStudent(cls)}
                      className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700"
                    >
                      Thêm học sinh
                    </button>
                  </div>

                  {cls.students.length > 0 && (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      {cls.students.map((st, idx) => (
                        <div
                          key={st.id}
                          className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 text-sm"
                        >
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {idx + 1}. {st.name}
                          </span>
                          <div className="flex items-center gap-3 text-xs font-mono-tabular">
                            <button
                              type="button"
                              onClick={() =>
                                void saveClass({
                                  ...cls,
                                  students: cls.students.map((item) =>
                                    item.id === st.id
                                      ? {
                                          ...item,
                                          completedCount: item.completedCount + 1,
                                          stars: item.stars + 3,
                                        }
                                      : item
                                  ),
                                })
                              }
                              className="px-2.5 py-1 rounded bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-semibold hover:bg-amber-100"
                            >
                              +1 bài (+3★)
                            </button>
                            <span className="text-slate-600 dark:text-slate-300">
                              {st.completedCount} bài · ★{st.stars}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                void saveClass({
                                  ...cls,
                                  students: cls.students.filter((item) => item.id !== st.id),
                                })
                              }
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: PRESENTATION & TEACHING MODE */}
      {tab === 'present' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Chế độ Trình chiếu Lớp học (TV · Máy chiếu · Màn hình LED)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Tự động phóng to cỡ chữ toàn bộ ứng dụng lên chuẩn trình chiếu 20–28px để học sinh ngồi cuối phòng vẫn đọc rõ đề bài, nhãn điểm và chứng minh Toán học.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  updateSettings({ presentationMode: !settings.presentationMode })
                }
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm ${
                  settings.presentationMode
                    ? 'bg-violet-700 text-white'
                    : 'bg-teal-700 text-white hover:bg-teal-800'
                }`}
              >
                <Presentation className="w-4 h-4" />
                {settings.presentationMode
                  ? 'Đang bật Chế độ trình chiếu (Nhấp để tắt)'
                  : 'Bật Chế độ trình chiếu ngay'}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Lối tắt giảng dạy trực tiếp
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Chuyển nhanh đến bảng vẽ tự do, phòng đấu trường LED hoặc kho {ALL_CHALLENGES.length} thử thách có sẵn lời giải động.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setPage('lab')}
                className="px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700"
              >
                Mở Phòng thực hành tự do
              </button>
              <button
                type="button"
                onClick={() => setPage('arena')}
                className="px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700"
              >
                Mở Đấu trường LED
              </button>
              <button
                type="button"
                onClick={() => setPage('library')}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                Mở Thư viện định lý động
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
