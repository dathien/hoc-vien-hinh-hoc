import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  HelpCircle,
  Lightbulb,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Star,
  Undo2,
  X,
} from 'lucide-react';
import { CHALLENGES_3D, LEVELS_3D, getChallenge3DById } from '../geometry3d/challenges3d';
import { addGeo3DObject, movePoint3D } from '../geometry3d/engine3d';
import { v3 } from '../geometry3d/math3d';
import { getTool3DDef } from '../geometry3d/tools3d';
import type { Geo3DScene, Solid3DType, Tool3DId, Vec3 } from '../geometry3d/types3d';
import {
  type Challenge3DDefinition,
  type Validation3DReport,
  validateChallenge3D,
} from '../geometry3d/validator3d';
import { MathText } from '../components/math/MathText';
import { Viewport3D, type Viewport3DHandle } from '../components/geometry3d/Viewport3D';
import { WebGLErrorBoundary } from '../components/geometry3d/WebGLErrorBoundary';
import { useApp } from '../store/AppContext';

export const Campaign3DView: React.FC = () => {
  const {
    settings,
    active3DLevelId,
    setActive3DLevelId,
    activeChallenge3DId,
    setActiveChallenge3DId,
    progress3DMap,
    recordChallenge3DAttempt,
    stats3D,
    setCampaignDimension,
  } = useApp();

  const activeChallenge = useMemo(
    () => (activeChallenge3DId ? getChallenge3DById(activeChallenge3DId) ?? null : null),
    [activeChallenge3DId]
  );

  if (activeChallenge) {
    return (
      <Challenge3DWorkspace
        challenge={activeChallenge}
        reducedMotion={settings.reducedMotion}
        onBack={() => setActiveChallenge3DId(null)}
        onNext={(nextId) => setActiveChallenge3DId(nextId)}
        onRecord={recordChallenge3DAttempt}
        onFallback2D={() => {
          setActiveChallenge3DId(null);
          setCampaignDimension('2d');
        }}
      />
    );
  }

  const levelChallenges = CHALLENGES_3D.filter((c) => c.levelId === active3DLevelId);

  return (
    <div className="space-y-6">
      {/* Separate 3D Spatial Progress Summary */}
      <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50/90 via-white to-teal-50/80 dark:from-slate-900 dark:to-slate-900 dark:border-slate-800 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
            <Award className="w-4 h-4" />
            Hệ thống tiến độ hình học không gian 3D (tách riêng 540 sao 2D)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
            60 Thử thách Hình học Không gian 3D (6 Cấp độ)
          </h2>
          <p className="text-[15px] text-slate-600 dark:text-slate-300">
            Dựng hình trực tiếp trong không gian 3D, kiểm chứng động trên nhiều cấu hình và theo dõi lời giải từng bước.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-extrabold text-teal-700 dark:text-teal-300">
              {stats3D.completedCount}/{stats3D.totalChallenges}
            </div>
            <div className="text-xs font-medium text-slate-500">Bài hoàn thành</div>
          </div>
          <div className="text-center px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="text-2xl font-extrabold text-amber-600 flex items-center justify-center gap-1">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              {stats3D.totalStars}/{stats3D.maxStars}
            </div>
            <div className="text-xs font-medium text-slate-500">Sao không gian 3D</div>
          </div>
        </div>
      </div>

      {/* 6 Level Selector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {LEVELS_3D.map((lvl) => {
          const chs = CHALLENGES_3D.filter((c) => c.levelId === lvl.id);
          const done = chs.filter((c) => (progress3DMap[c.id]?.stars ?? 0) >= 1).length;
          const stars = chs.reduce((s, c) => s + (progress3DMap[c.id]?.stars ?? 0), 0);
          const selected = active3DLevelId === lvl.id;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setActive3DLevelId(lvl.id)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                selected
                  ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/30 shadow-sm ring-1 ring-teal-500/40'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-400'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Cấp độ {lvl.roman} · {lvl.curriculumTag}
                </span>
                <span className="text-xs font-semibold text-amber-600 flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  {stars}/{chs.length * 3}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{lvl.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{lvl.subtitle}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all"
                    style={{ width: `${Math.round((done / chs.length) * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {done}/{chs.length}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 10 Challenges in Selected 3D Level */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {levelChallenges.map((ch) => {
          const rec = progress3DMap[ch.id];
          const stars = rec?.stars ?? 0;
          return (
            <div
              key={ch.id}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3 hover:border-teal-400 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                    Bài {ch.levelId}.{ch.order} · {ch.curriculumTag} · {ch.difficulty}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${
                          stars >= s
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{ch.title}</h4>
                <div className="text-[15px] text-slate-600 dark:text-slate-300">
                  <MathText text={ch.description} />
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500">
                  Mục tiêu tối ưu: ≤ {ch.targetSteps} bước dựng
                </span>
                <button
                  type="button"
                  onClick={() => setActiveChallenge3DId(ch.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
                >
                  {stars >= 1 ? 'Thực hành lại' : 'Bắt đầu dựng 3D'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface Challenge3DWorkspaceProps {
  challenge: Challenge3DDefinition;
  reducedMotion: boolean;
  onBack: () => void;
  onNext: (nextId: string) => void;
  onRecord: (params: {
    challengeId: string;
    stars: 0 | 1 | 2 | 3;
    usedSteps: number;
    elapsedSec: number;
    viewedSolution: boolean;
  }) => Promise<void>;
  onFallback2D: () => void;
}

const Challenge3DWorkspace: React.FC<Challenge3DWorkspaceProps> = ({
  challenge,
  reducedMotion,
  onBack,
  onNext,
  onRecord,
  onFallback2D,
}) => {
  const viewportRef = useRef<Viewport3DHandle | null>(null);
  const solContainerRef = useRef<HTMLDivElement | null>(null);

  const [scene, setScene] = useState<Geo3DScene>(() => challenge.buildInitialScene());
  const [undoStack, setUndoStack] = useState<Geo3DScene[]>([]);
  const [activeTool, setActiveTool] = useState<Tool3DId>('select');
  const [pendingRefs, setPendingRefs] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [report, setReport] = useState<Validation3DReport | null>(null);
  const [hintTier, setHintTier] = useState<number>(0);
  const [viewedSolution, setViewedSolution] = useState(false);
  const [startTime] = useState(() => Date.now());

  // Quick parameter inputs for Oxyz & solid tools in challenges
  const [paramModal, setParamModal] = useState<null | 'point_coords' | 'plane_equation' | 'solid_library'>(null);
  const [pForm, setPForm] = useState({ x: '1', y: '2', z: '3', a: '1', b: '1', c: '1', d: '-3', solidType: 'cube' as Solid3DType });

  // Animated 3D Solution Player state
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [solStep, setSolStep] = useState(0);
  const [solPlaying, setSolPlaying] = useState(false);
  const [solSpeed, setSolSpeed] = useState<0.5 | 1 | 1.5 | 2>(1);
  const [solShowExplain, setSolShowExplain] = useState(true);
  const [solFullscreen, setSolFullscreen] = useState(false);

  // Reset when challenge changes
  useEffect(() => {
    setScene(challenge.buildInitialScene());
    setUndoStack([]);
    setActiveTool('select');
    setPendingRefs([]);
    setSelectedId(null);
    setReport(null);
    setHintTier(0);
    setViewedSolution(false);
    setSolutionOpen(false);
    setSolStep(0);
    setSolPlaying(false);
  }, [challenge]);

  const commit = useCallback((next: Geo3DScene) => {
    setScene((prev) => {
      setUndoStack((u) => [...u.slice(-29), prev]);
      return next;
    });
  }, []);

  const flash = useCallback((msg: string) => {
    setBanner(msg);
    window.setTimeout(() => setBanner((cur) => (cur === msg ? null : cur)), 3400);
  }, []);

  // Build scene for animated SolutionPlayer3D up to step `solStep`
  const solutionScene = useMemo(() => {
    let sc = challenge.buildInitialScene();
    for (let i = 0; i < solStep && i < challenge.solutionSteps.length; i++) {
      sc = addGeo3DObject(sc, challenge.solutionSteps[i].addInput).scene;
    }
    return sc;
  }, [challenge, solStep]);

  useEffect(() => {
    if (!solPlaying || !solutionOpen) return;
    if (solStep >= challenge.solutionSteps.length) {
      setSolPlaying(false);
      return;
    }
    const ms = Math.round(1400 / solSpeed);
    const t = window.setTimeout(() => {
      setSolStep((s) => Math.min(challenge.solutionSteps.length, s + 1));
    }, ms);
    return () => window.clearTimeout(t);
  }, [solPlaying, solStep, solSpeed, solutionOpen, challenge.solutionSteps.length]);

  const userStepCount = useMemo(
    () => scene.order.filter((id) => scene.objects[id] && !scene.objects[id].style.isGiven).length,
    [scene]
  );

  const handleSelectTool = (tid: Tool3DId) => {
    setActiveTool(tid);
    setPendingRefs([]);
    if (tid === 'point_coords' || tid === 'plane_equation' || tid === 'solid_library') {
      setParamModal(tid);
    }
  };

  const handleWorkingPlaneClick = (pos: Vec3) => {
    if (activeTool !== 'point_free') return;
    const res = addGeo3DObject(scene, {
      kind: 'point',
      rule: 'free_point_3d',
      position: pos,
      label: `P${userStepCount + 1}`,
    });
    commit(res.scene);
    setSelectedId(res.id);
  };

  const handleObjectClick = (clickedId: string, hitPoint: Vec3) => {
    const clicked = scene.objects[clickedId];
    if (!clicked || !clicked.valid) return;
    const refs = [...pendingRefs, clickedId];

    const finish = (res: { scene: Geo3DScene; id: string }) => {
      commit(res.scene);
      setSelectedId(res.id);
      setPendingRefs([]);
      const c = res.scene.objects[res.id];
      if (c && !c.valid && c.errorMessage) flash(c.errorMessage);
    };

    if (activeTool === 'midpoint') {
      if (refs.length < 2) setPendingRefs(refs);
      else finish(addGeo3DObject(scene, { kind: 'point', rule: 'midpoint_3d', parents: [refs[0], refs[1]], label: `M${userStepCount + 1}` }));
    } else if (activeTool === 'segment' || activeTool === 'line' || activeTool === 'ray' || activeTool === 'vector') {
      if (refs.length < 2) setPendingRefs(refs);
      else if (activeTool === 'segment') finish(addGeo3DObject(scene, { kind: 'segment', rule: 'segment_3d', parents: [refs[0], refs[1]], label: `s${userStepCount + 1}` }));
      else if (activeTool === 'line') finish(addGeo3DObject(scene, { kind: 'line', rule: 'line_two_points', parents: [refs[0], refs[1]], label: `d${userStepCount + 1}` }));
      else if (activeTool === 'ray') finish(addGeo3DObject(scene, { kind: 'ray', rule: 'ray_3d', parents: [refs[0], refs[1]], label: `r${userStepCount + 1}` }));
      else finish(addGeo3DObject(scene, { kind: 'vector', rule: 'vector_two_points', parents: [refs[0], refs[1]], label: `v${userStepCount + 1}` }));
    } else if (activeTool === 'plane_3pts') {
      if (refs.length < 3) setPendingRefs(refs);
      else finish(addGeo3DObject(scene, { kind: 'plane', rule: 'plane_three_points', parents: refs, label: `(P${userStepCount + 1})` }));
    } else if (activeTool === 'polygon') {
      if (pendingRefs.length >= 3 && clickedId === pendingRefs[0]) {
        finish(addGeo3DObject(scene, { kind: 'polygon', rule: 'polygon_3d', parents: pendingRefs, label: `ĐG${userStepCount + 1}` }));
      } else if (!pendingRefs.includes(clickedId)) setPendingRefs(refs);
    } else if (activeTool === 'point_on_line') {
      finish(addGeo3DObject(scene, { kind: 'point', rule: 'point_on_line', parents: [clickedId], position: hitPoint, label: `K${userStepCount + 1}` }));
    } else if (activeTool === 'point_on_plane') {
      finish(addGeo3DObject(scene, { kind: 'point', rule: 'point_on_plane', parents: [clickedId], position: hitPoint, label: `K${userStepCount + 1}` }));
    } else if (activeTool === 'parallel_line') {
      if (refs.length < 2) setPendingRefs(refs);
      else {
        const ptId = scene.objects[refs[0]]?.kind === 'point' ? refs[0] : refs[1];
        const lId = ptId === refs[0] ? refs[1] : refs[0];
        finish(addGeo3DObject(scene, { kind: 'line', rule: 'line_parallel_point', parents: [ptId, lId], label: `d${userStepCount + 1}` }));
      }
    } else if (activeTool === 'perp_line_plane') {
      if (refs.length < 2) setPendingRefs(refs);
      else {
        const ptId = scene.objects[refs[0]]?.kind === 'point' ? refs[0] : refs[1];
        const pId = ptId === refs[0] ? refs[1] : refs[0];
        finish(addGeo3DObject(scene, { kind: 'line', rule: 'line_perp_plane', parents: [ptId, pId], label: `d${userStepCount + 1}` }));
      }
    } else if (activeTool === 'plane_parallel') {
      if (refs.length < 2) setPendingRefs(refs);
      else {
        const ptId = scene.objects[refs[0]]?.kind === 'point' ? refs[0] : refs[1];
        const pId = ptId === refs[0] ? refs[1] : refs[0];
        finish(addGeo3DObject(scene, { kind: 'plane', rule: 'plane_parallel_point', parents: [ptId, pId], label: `(Q${userStepCount + 1})` }));
      }
    } else if (activeTool === 'plane_perp_line') {
      if (refs.length < 2) setPendingRefs(refs);
      else {
        const ptId = scene.objects[refs[0]]?.kind === 'point' ? refs[0] : refs[1];
        const lId = ptId === refs[0] ? refs[1] : refs[0];
        finish(addGeo3DObject(scene, { kind: 'plane', rule: 'plane_perp_line', parents: [ptId, lId], label: `(Q${userStepCount + 1})` }));
      }
    } else if (activeTool === 'plane_line_pt') {
      if (refs.length < 2) setPendingRefs(refs);
      else {
        const lId = scene.objects[refs[0]]?.kind === 'line' || scene.objects[refs[0]]?.kind === 'segment' ? refs[0] : refs[1];
        const ptId = lId === refs[0] ? refs[1] : refs[0];
        finish(addGeo3DObject(scene, { kind: 'plane', rule: 'plane_line_point', parents: [lId, ptId], label: `(P${userStepCount + 1})` }));
      }
    } else if (activeTool === 'intersect_pp') {
      if (refs.length < 2) setPendingRefs(refs);
      else finish(addGeo3DObject(scene, { kind: 'line', rule: 'intersect_plane_plane', parents: [refs[0], refs[1]], label: `gt${userStepCount + 1}` }));
    } else if (activeTool === 'intersect_lp') {
      if (refs.length < 2) setPendingRefs(refs);
      else {
        const lId = scene.objects[refs[0]]?.kind === 'plane' ? refs[1] : refs[0];
        const pId = lId === refs[0] ? refs[1] : refs[0];
        finish(addGeo3DObject(scene, { kind: 'point', rule: 'intersect_line_plane', parents: [lId, pId], label: `I${userStepCount + 1}` }));
      }
    } else if (activeTool === 'intersect_ll') {
      if (refs.length < 2) setPendingRefs(refs);
      else finish(addGeo3DObject(scene, { kind: 'point', rule: 'intersect_line_line', parents: [refs[0], refs[1]], label: `I${userStepCount + 1}` }));
    } else if (activeTool === 'foot_plane' || activeTool === 'foot_line' || activeTool === 'reflect_plane' || activeTool === 'reflect_point') {
      if (refs.length < 2) setPendingRefs(refs);
      else {
        const ptId = scene.objects[refs[0]]?.kind === 'point' ? refs[0] : refs[1];
        const refId = ptId === refs[0] ? refs[1] : refs[0];
        const ruleMap = {
          foot_plane: 'foot_point_plane',
          foot_line: 'foot_point_line',
          reflect_plane: 'reflect_point_plane',
          reflect_point: 'reflect_point_point',
        } as const;
        finish(addGeo3DObject(scene, { kind: 'point', rule: ruleMap[activeTool], parents: [ptId, refId], label: `H${userStepCount + 1}` }));
      }
    } else if (activeTool === 'common_perp') {
      if (refs.length < 2) setPendingRefs(refs);
      else finish(addGeo3DObject(scene, { kind: 'line', rule: 'common_perpendicular', parents: [refs[0], refs[1]], label: `vc${userStepCount + 1}` }));
    } else if (activeTool === 'cross_section') {
      if (refs.length < 2) setPendingRefs(refs);
      else {
        const sId = scene.objects[refs[0]]?.kind === 'solid' ? refs[0] : refs[1];
        const pId = sId === refs[0] ? refs[1] : refs[0];
        finish(addGeo3DObject(scene, { kind: 'cross_section', rule: 'cross_section_solid_plane', parents: [sId, pId], label: 'Thiết diện' }));
      }
    } else if (activeTool.startsWith('measure_')) {
      const ruleMap: Record<
        string,
        | 'measure_distance_pp'
        | 'measure_distance_pl'
        | 'measure_distance_pplane'
        | 'measure_distance_skew'
        | 'measure_distance_planes'
        | 'measure_angle_vectors'
        | 'measure_angle_lines'
        | 'measure_angle_line_plane'
        | 'measure_angle_planes'
        | 'measure_dihedral_angle'
      > = {
        measure_length: 'measure_distance_pp',
        measure_angle_vec: 'measure_angle_vectors',
        measure_angle_ll: 'measure_angle_lines',
        measure_angle_lp: 'measure_angle_line_plane',
        measure_angle_pp: 'measure_angle_planes',
        measure_dihedral: 'measure_dihedral_angle',
        measure_dist_pl: 'measure_distance_pl',
        measure_dist_pplane: 'measure_distance_pplane',
        measure_dist_skew: 'measure_distance_skew',
        measure_dist_planes: 'measure_distance_planes',
      };
      if (activeTool === 'measure_length' && clicked.kind === 'segment') {
        finish(addGeo3DObject(scene, { kind: 'measurement', rule: 'measure_distance_pp', parents: clicked.parents.slice(0, 2), label: 'Độ dài', metricKind: 'length' }));
      } else if (refs.length < 2) setPendingRefs(refs);
      else {
        let pA = refs[0], pB = refs[1];
        if ((activeTool === 'measure_dist_pl' || activeTool === 'measure_dist_pplane') && scene.objects[pA]?.kind !== 'point') {
          [pA, pB] = [pB, pA];
        }
        if (activeTool === 'measure_angle_lp' && scene.objects[pA]?.kind === 'plane') {
          [pA, pB] = [pB, pA];
        }
        finish(addGeo3DObject(scene, { kind: 'measurement', rule: ruleMap[activeTool] ?? 'measure_distance_pp', parents: [pA, pB], label: 'Đo đạc' }));
      }
    }
  };

  const handleValidate = async () => {
    const res = validateChallenge3D(challenge, scene);
    setReport(res);
    const elapsedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    await onRecord({
      challengeId: challenge.id,
      stars: res.passed ? res.stars : 0,
      usedSteps: res.usedSteps,
      elapsedSec,
      viewedSolution,
    });
  };

  const nextChallenge = useMemo(() => {
    const idx = CHALLENGES_3D.findIndex((c) => c.id === challenge.id);
    return idx >= 0 && idx < CHALLENGES_3D.length - 1 ? CHALLENGES_3D[idx + 1] : null;
  }, [challenge.id]);

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Danh sách 3D
          </button>
          <div>
            <div className="text-xs font-bold text-teal-700 dark:text-teal-300">
              Bài {challenge.levelId}.{challenge.order} · {challenge.curriculumTag} · {challenge.difficulty}
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{challenge.title}</h2>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-700 dark:text-slate-200">
            Bước dựng: {userStepCount} / {challenge.targetSteps}
          </span>
          <button
            type="button"
            disabled={undoStack.length === 0}
            onClick={() => {
              const last = undoStack[undoStack.length - 1];
              if (!last) return;
              setScene(last);
              setUndoStack((u) => u.slice(0, -1));
            }}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            title="Hoàn tác"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setScene(challenge.buildInitialScene());
              setUndoStack([]);
              setPendingRefs([]);
              setReport(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw className="w-4 h-4" />
            Làm lại
          </button>
          <button
            type="button"
            onClick={() => void handleValidate()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 text-white text-[15px] font-semibold hover:bg-teal-800 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            Kiểm chứng phép dựng
          </button>
        </div>
      </div>

      {/* Main Split: 3D Viewport + Side Task/Hints/Validation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 flex flex-col gap-2.5">
          {/* Allowed tools strip */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 flex flex-wrap items-center gap-1.5">
            {challenge.allowedTools.slice(0, 14).map((tid) => {
              const def = getTool3DDef(tid);
              return (
                <button
                  key={tid}
                  type="button"
                  onClick={() => handleSelectTool(tid)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    activeTool === tid
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                  }`}
                  title={def.tooltip}
                >
                  {def.name}
                </button>
              );
            })}
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-sky-50/70 border border-sky-200/80 text-sm text-sky-900 flex items-center justify-between gap-2">
            <span>{banner || getTool3DDef(activeTool).actionPrompt}</span>
            {pendingRefs.length > 0 && (
              <span className="text-xs font-bold">
                Đã chọn: {pendingRefs.map((id) => scene.objects[id]?.label ?? id).join(', ')}
              </span>
            )}
          </div>

          <div className="h-[520px]">
            <WebGLErrorBoundary onFallback2D={onFallback2D}>
              <Viewport3D
                ref={viewportRef}
                scene={scene}
                activeTool={activeTool}
                selectedId={selectedId}
                autoRotate={false}
                autoRotateSpeed={1}
                reducedMotion={reducedMotion}
                onSelectObject={setSelectedId}
                onObjectClick={handleObjectClick}
                onWorkingPlaneClick={handleWorkingPlaneClick}
                onPointDrag={(id, pos) => setScene((prev) => movePoint3D(prev, id, pos))}
                onFallback2D={onFallback2D}
              />
            </WebGLErrorBoundary>
          </div>
        </div>

        {/* Right Side: Problem Statement, Validation Report, 3-Tier Hints, Solution Trigger */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2.5">
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Đề bài</div>
            <div className="text-[15px] text-slate-800 dark:text-slate-100 leading-relaxed">
              <MathText text={challenge.description} />
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-sm">
              <div>
                <strong className="text-slate-700 dark:text-slate-200">Giả thiết: </strong>
                <MathText text={challenge.hypothesis} />
              </div>
              <div>
                <strong className="text-teal-700 dark:text-teal-300">Mục tiêu: </strong>
                <MathText text={challenge.goal} />
              </div>
            </div>
          </div>

          {/* Validation Report */}
          {report && (
            <div
              className={`rounded-2xl border p-4 space-y-2.5 ${
                report.passed
                  ? 'border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/30'
                  : 'border-amber-300 bg-amber-50/80 dark:bg-amber-950/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {report.message}
                </div>
                {report.passed && (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${
                          report.stars >= s ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <ul className="text-sm text-slate-700 dark:text-slate-200 space-y-1 list-disc pl-4">
                {report.details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 italic">{report.proofDisclaimer}</p>
              {report.passed && nextChallenge && (
                <button
                  type="button"
                  onClick={() => onNext(nextChallenge.id)}
                  className="w-full py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 flex items-center justify-center gap-1.5"
                >
                  Thử thách tiếp theo: {nextChallenge.title}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* 3-Tier Hints */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Gợi ý phân tầng ({hintTier}/3)
              </div>
              {hintTier < 3 && (
                <button
                  type="button"
                  onClick={() => setHintTier((h) => Math.min(3, h + 1))}
                  className="text-xs font-semibold text-teal-700 hover:underline"
                >
                  Mở gợi ý mức {hintTier + 1}
                </button>
              )}
            </div>
            {hintTier === 0 ? (
              <p className="text-sm text-slate-500">
                Nếu gặp khó khăn, bạn có thể mở gợi ý theo 3 mức từ định hướng đến bước dựng chi tiết.
              </p>
            ) : (
              <div className="space-y-2">
                {challenge.hints.slice(0, hintTier).map((hint, idx) => (
                  <div key={idx} className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-2.5 text-sm text-slate-800">
                    <span className="font-bold text-amber-800 mr-1">Mức {idx + 1}:</span>
                    <MathText text={hint} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Animated 3D Solution Player Launcher */}
          <button
            type="button"
            onClick={() => {
              setViewedSolution(true);
              setSolutionOpen(true);
              setSolStep(0);
              setSolPlaying(false);
            }}
            className="w-full py-3 rounded-2xl border border-sky-300 bg-sky-50 text-sky-900 text-[15px] font-semibold hover:bg-sky-100 flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Xem lời giải 3D từng bước & Chứng minh
          </button>
        </div>
      </div>

      {/* PARAMETER INPUT MODAL FOR OXYZ/SOLID IN CHALLENGES */}
      {paramModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">{getTool3DDef(paramModal).name}</h3>
              <button type="button" onClick={() => setParamModal(null)}><X className="w-5 h-5" /></button>
            </div>
            {paramModal === 'point_coords' && (
              <div className="grid grid-cols-3 gap-2">
                {(['x', 'y', 'z'] as const).map((k) => (
                  <label key={k} className="space-y-1">
                    <span className="text-xs font-semibold text-slate-600">{k}</span>
                    <input
                      type="number"
                      step={0.5}
                      value={pForm[k]}
                      onChange={(e) => setPForm((p) => ({ ...p, [k]: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-mono"
                    />
                  </label>
                ))}
              </div>
            )}
            {paramModal === 'plane_equation' && (
              <div className="grid grid-cols-4 gap-2">
                {(['a', 'b', 'c', 'd'] as const).map((k) => (
                  <label key={k} className="space-y-1">
                    <span className="text-xs font-semibold text-slate-600">{k.toUpperCase()}</span>
                    <input
                      type="number"
                      step={0.5}
                      value={pForm[k]}
                      onChange={(e) => setPForm((p) => ({ ...p, [k]: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-mono"
                    />
                  </label>
                ))}
              </div>
            )}
            {paramModal === 'solid_library' && (
              <select
                value={pForm.solidType}
                onChange={(e) => setPForm((p) => ({ ...p, solidType: e.target.value as Solid3DType }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="cube">Hình lập phương</option>
                <option value="cuboid">Hình hộp chữ nhật</option>
                <option value="tetrahedron_regular">Tứ diện đều</option>
                <option value="pyramid_quad_regular">Hình chóp tứ giác đều</option>
                <option value="prism_triangular">Hình lăng trụ tam giác</option>
                <option value="sphere">Hình cầu</option>
                <option value="cylinder">Hình trụ tròn xoay</option>
                <option value="cone">Hình nón tròn xoay</option>
              </select>
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setParamModal(null)} className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-sm">
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  if (paramModal === 'point_coords') {
                    commit(
                      addGeo3DObject(scene, {
                        kind: 'point',
                        rule: 'point_coords',
                        position: v3(Number(pForm.x) || 0, Number(pForm.y) || 0, Number(pForm.z) || 0),
                        label: `M${userStepCount + 1}`,
                      }).scene
                    );
                  } else if (paramModal === 'plane_equation') {
                    commit(
                      addGeo3DObject(scene, {
                        kind: 'plane',
                        rule: 'plane_equation',
                        params: {
                          a: Number(pForm.a) || 0,
                          b: Number(pForm.b) || 0,
                          c: Number(pForm.c) || 0,
                          d: Number(pForm.d) || 0,
                        },
                        label: `(P${userStepCount + 1})`,
                      }).scene
                    );
                  } else {
                    commit(
                      addGeo3DObject(scene, {
                        kind: 'solid',
                        rule: (`solid_${pForm.solidType}` as import('../geometry3d/types3d').Geo3DRule),
                        solidType: pForm.solidType,
                        params: { a: 3, b: 2.5, h: 3.2, r: 2 },
                        center: v3(0, 0, 0),
                        label: 'Hình khối',
                      }).scene
                    );
                  }
                  setParamModal(null);
                  setActiveTool('select');
                }}
                className="px-4 py-1.5 rounded-lg bg-teal-700 text-white text-sm font-semibold"
              >
                Áp dụng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANIMATED 3D SOLUTION PLAYER MODAL */}
      {solutionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-3 sm:p-5">
          <div
            ref={solContainerRef}
            className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Lời giải 3D từng bước — {challenge.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Bước {solStep} / {challenge.solutionSteps.length} · Bạn có thể xoay mô hình 3D tự do trong khi xem lời giải
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSolShowExplain((v) => !v)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold"
                >
                  {solShowExplain ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {solShowExplain ? 'Ẩn giải thích' : 'Hiện giải thích'}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      if (!document.fullscreenElement && solContainerRef.current) {
                        await solContainerRef.current.requestFullscreen();
                        setSolFullscreen(true);
                      } else if (document.fullscreenElement) {
                        await document.exitFullscreen();
                        setSolFullscreen(false);
                      }
                    } catch {
                      // Ignore fullscreen restriction
                    }
                  }}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600"
                  title="Toàn màn hình"
                >
                  {solFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSolPlaying(false);
                    setSolutionOpen(false);
                  }}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
              <div className={`${solShowExplain ? 'lg:col-span-7' : 'lg:col-span-12'} p-3 h-[420px] lg:h-[480px]`}>
                <WebGLErrorBoundary onFallback2D={onFallback2D}>
                  <Viewport3D
                    scene={solutionScene}
                    activeTool="pan_orbit"
                    selectedId={null}
                    autoRotate={false}
                    autoRotateSpeed={1}
                    reducedMotion={reducedMotion}
                    onSelectObject={() => {}}
                    onObjectClick={() => {}}
                    onWorkingPlaneClick={() => {}}
                    onPointDrag={() => {}}
                  />
                </WebGLErrorBoundary>
              </div>
              {solShowExplain && (
                <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 p-4 overflow-y-auto space-y-3">
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase text-slate-500">Các bước thực hiện</div>
                    {challenge.solutionSteps.map((st, idx) => {
                      const reached = idx < solStep;
                      const current = idx === solStep - 1;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => {
                            setSolPlaying(false);
                            setSolStep(idx + 1);
                          }}
                          className={`w-full text-left rounded-xl border p-2.5 text-sm transition-colors ${
                            current
                              ? 'border-teal-500 bg-teal-50/80 text-slate-900'
                              : reached
                              ? 'border-slate-200 bg-slate-50 text-slate-800'
                              : 'border-slate-100 text-slate-400'
                          }`}
                        >
                          <div className="font-semibold">
                            Bước {idx + 1}: {st.actionText}
                          </div>
                          <div className="text-xs text-slate-600 mt-0.5">
                            <MathText text={st.mathExplanation} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 space-y-1 text-sm">
                    <div className="font-bold text-emerald-900">Chứng minh toán học</div>
                    <div className="text-slate-800 leading-relaxed">
                      <MathText text={challenge.proof} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Playback controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (solStep >= challenge.solutionSteps.length) setSolStep(0);
                    setSolPlaying((p) => !p);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
                >
                  {solPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {solPlaying ? 'Tạm dừng' : solStep === 0 ? 'Bắt đầu' : 'Tiếp tục'}
                </button>
                <button
                  type="button"
                  disabled={solStep <= 0}
                  onClick={() => {
                    setSolPlaying(false);
                    setSolStep((s) => Math.max(0, s - 1));
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium disabled:opacity-40"
                >
                  <SkipBack className="w-4 h-4" />
                  Bước trước
                </button>
                <button
                  type="button"
                  disabled={solStep >= challenge.solutionSteps.length}
                  onClick={() => {
                    setSolPlaying(false);
                    setSolStep((s) => Math.min(challenge.solutionSteps.length, s + 1));
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium disabled:opacity-40"
                >
                  Bước tiếp theo
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSolPlaying(false);
                    setSolStep(0);
                  }}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-300 bg-white text-sm font-medium"
                >
                  <RotateCcw className="w-4 h-4" />
                  Làm lại
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span>Tốc độ:</span>
                {([0.5, 1, 1.5, 2] as const).map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => setSolSpeed(sp)}
                    className={`px-2 py-1 rounded-lg ${
                      solSpeed === sp ? 'bg-teal-700 text-white' : 'bg-white border border-slate-300'
                    }`}
                  >
                    {sp}×
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaign3DView;
