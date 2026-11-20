import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  Eye,
  EyeOff,
  HelpCircle,
  Layers,
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
import {
  ALL_CHALLENGES_3D,
  LEVELS_3D,
  calcProgressPercent,
  getChallenge3DById,
  getChallenges3DByLevel,
  getNextChallenge3D,
} from '../geometry3d/challenges3d';
import { addGeo3DObject, movePoint3D } from '../geometry3d/engine3d';
import { v3 } from '../geometry3d/math3d';
import { getObjectDisplayName3D, getPendingDisplayNames3D } from '../geometry3d/naming3d';
import { getTool3DDef } from '../geometry3d/tools3d';
import type { Geo3DRule, Geo3DScene, Solid3DType, Tool3DId, Vec3 } from '../geometry3d/types3d';
import {
  type Challenge3DDefinition,
  type Validation3DReport,
  validateChallenge3D,
} from '../geometry3d/validator3d';
import { MathText } from '../components/math/MathText';
import { Viewport3D, type Viewport3DHandle } from '../components/geometry3d/Viewport3D';
import { WebGLErrorBoundary } from '../components/geometry3d/WebGLErrorBoundary';
import { useApp } from '../store/AppContext';

type GradeFilter = 'all' | 'Toán 11' | 'Toán 12';

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

  const [gradeFilter, setGradeFilter] = useState<GradeFilter>('all');
  const [viewingLevelId, setViewingLevelId] = useState<number | null>(null);

  const activeChallenge = useMemo(
    () => (activeChallenge3DId ? getChallenge3DById(activeChallenge3DId) ?? null : null),
    [activeChallenge3DId]
  );

  // Sync viewing level when returning from a challenge
  useEffect(() => {
    if (activeChallenge) {
      setViewingLevelId(activeChallenge.levelId);
      setActive3DLevelId(activeChallenge.levelId);
    }
  }, [activeChallenge, setActive3DLevelId]);

  if (activeChallenge) {
    return (
      <Challenge3DWorkspace
        challenge={activeChallenge}
        reducedMotion={settings.reducedMotion}
        onBack={() => {
          setViewingLevelId(activeChallenge.levelId);
          setActiveChallenge3DId(null);
        }}
        onNext={(nextId) => setActiveChallenge3DId(nextId)}
        onRecord={recordChallenge3DAttempt}
        onFallback2D={() => {
          setActiveChallenge3DId(null);
          setCampaignDimension('2d');
        }}
      />
    );
  }

  // VIEW B: Level Detail (10 challenges inside the clicked level)
  if (viewingLevelId !== null) {
    const levelMeta = LEVELS_3D.find((l) => l.id === viewingLevelId) ?? LEVELS_3D[0];
    const levelChallenges = getChallenges3DByLevel(levelMeta.id);
    const done = levelChallenges.filter((c) => (progress3DMap[c.id]?.stars ?? 0) >= 1).length;
    const stars = levelChallenges.reduce((s, c) => s + (progress3DMap[c.id]?.stars ?? 0), 0);
    const pct = calcProgressPercent(done, levelChallenges.length);

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setViewingLevelId(null)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[15px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Tất cả 18 cấp độ
          </button>

          {/* Quick jump between 18 levels */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
            {LEVELS_3D.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => {
                  setViewingLevelId(lvl.id);
                  setActive3DLevelId(lvl.id);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                  lvl.id === levelMeta.id
                    ? 'bg-teal-700 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={`Cấp độ ${lvl.roman}: ${lvl.title}`}
              >
                {lvl.roman}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Level Header Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800">
                Cấp độ {levelMeta.roman}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800">
                {levelMeta.curriculumTag}
              </span>
              <span className="text-slate-500 dark:text-slate-400">{levelMeta.topicGroup}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Cấp độ {levelMeta.roman} – {levelMeta.title}
            </h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 max-w-3xl">
              {levelMeta.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-44 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>Tiến độ: {done}/{levelChallenges.length}</span>
                <span className="text-amber-600 flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  {stars}/{levelChallenges.length * 3}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 10 Challenges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {levelChallenges.map((ch) => {
            const rec = progress3DMap[ch.id];
            const chStars = rec?.stars ?? 0;
            const tierColor =
              ch.cognitiveTier === 'Nhận biết'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                : ch.cognitiveTier === 'Thông hiểu'
                ? 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800'
                : ch.cognitiveTier === 'Vận dụng'
                ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800'
                : 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800';

            return (
              <div
                key={ch.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3 hover:border-teal-500 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-300">
                        Bài {ch.levelId}.{ch.order}
                      </span>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${tierColor}`}>
                        {ch.cognitiveTier}
                      </span>
                    </div>
                    <div className="flex items-center gap-0.5" title={`Đạt ${chStars}/3 sao`}>
                      {[1, 2, 3].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            chStars >= s
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-300 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{ch.title}</h4>
                  <div className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    <MathText text={ch.description} />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[60%]">
                    {ch.knowledgeTopic}
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveChallenge3DId(ch.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors"
                  >
                    {chStars >= 1 ? 'Thực hành lại' : 'Bắt đầu'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // VIEW A: 18-Level Overview Grid
  const filteredLevels = LEVELS_3D.filter((lvl) =>
    gradeFilter === 'all' ? true : lvl.curriculumTag === gradeFilter
  );

  const count11 = ALL_CHALLENGES_3D.filter((c) => c.curriculumTag === 'Toán 11').length;
  const count12 = ALL_CHALLENGES_3D.filter((c) => c.curriculumTag === 'Toán 12').length;

  return (
    <div className="space-y-6">
      {/* Summary Header & Grade Filter Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
              <Award className="w-4 h-4" />
              18 Cấp độ · 180 Thử thách Hình học Không gian 3D &amp; Oxyz
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Thử thách hình học
            </h1>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 max-w-2xl">
              Thực hành dựng hình trực tiếp trong không gian 3D theo cấu trúc 18 cấp độ (Toán 11 và Toán 12).
              Đúng không dùng gợi ý: <strong>3 sao</strong> · Có dùng gợi ý: <strong>2 sao</strong> · Sau khi xem lời giải: <strong>1 sao</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="text-2xl font-extrabold text-teal-700 dark:text-teal-300 font-mono-tabular">
                {stats3D.completedCount}/{stats3D.totalChallenges}
              </div>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Thử thách hoàn thành</div>
            </div>
            <div className="text-center px-4 py-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
              <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1 font-mono-tabular">
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
                {stats3D.totalStars}/{stats3D.maxStars}
              </div>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Tổng số sao</div>
            </div>
          </div>
        </div>

        {/* Grade Filter Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: `Tất cả (${ALL_CHALLENGES_3D.length} bài)` },
                { id: 'Toán 11', label: `Toán 11 (${count11} bài)` },
                { id: 'Toán 12', label: `Toán 12 (${count12} bài)` },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setGradeFilter(f.id)}
                className={`px-4 py-2 min-h-[40px] rounded-xl text-[15px] font-semibold transition-colors ${
                  gradeFilter === f.id
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Đang hiển thị {filteredLevels.length} cấp độ · Chọn một cấp độ để mở 10 thử thách
          </div>
        </div>
      </div>

      {/* Responsive Grid of Level Cards (3 cols desktop / 2 cols tablet / 1 col mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLevels.map((lvl) => {
          const chs = getChallenges3DByLevel(lvl.id);
          const done = chs.filter((c) => (progress3DMap[c.id]?.stars ?? 0) >= 1).length;
          const stars = chs.reduce((s, c) => s + (progress3DMap[c.id]?.stars ?? 0), 0);
          const pct = calcProgressPercent(done, chs.length);
          const isLastVisited = active3DLevelId === lvl.id;

          return (
            <div
              key={lvl.id}
              onClick={() => {
                setActive3DLevelId(lvl.id);
                setViewingLevelId(lvl.id);
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActive3DLevelId(lvl.id);
                  setViewingLevelId(lvl.id);
                }
              }}
              className={`group cursor-pointer text-left rounded-2xl border p-5 flex flex-col justify-between gap-3.5 transition-all bg-white dark:bg-slate-900 hover:border-teal-500 hover:shadow-sm ${
                isLastVisited
                  ? 'border-teal-500/80 ring-1 ring-teal-500/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      Cấp độ {lvl.roman}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        lvl.curriculumTag === 'Toán 11'
                          ? 'bg-sky-50 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'bg-violet-50 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300'
                      }`}
                    >
                      {lvl.curriculumTag}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 font-mono-tabular">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    {stars}/{chs.length * 3}
                  </span>
                </div>

                <div>
                  <div className="text-xs font-medium text-teal-700 dark:text-teal-400">
                    {lvl.topicGroup}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors mt-0.5">
                    Cấp độ {lvl.roman} – {lvl.title}
                  </h3>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {lvl.subtitle}
                </p>
              </div>

              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>Hoàn thành: {done}/{chs.length}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <span className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 group-hover:bg-teal-700 group-hover:text-white text-sm font-semibold transition-colors">
                    {done > 0 ? 'Tiếp tục' : 'Bắt đầu'}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
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

type ChallengeParamModal =
  | null
  | 'point_coords'
  | 'plane_equation'
  | 'plane_normal'
  | 'line_dir_vector'
  | 'solid_library';

const Challenge3DWorkspace: React.FC<Challenge3DWorkspaceProps> = ({
  challenge,
  reducedMotion,
  onBack,
  onNext,
  onRecord,
  onFallback2D,
}) => {
  const viewportRef = useRef<Viewport3DHandle | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
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
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [startTime, setStartTime] = useState(() => Date.now());

  // Parameter input modal for Oxyz & solid tools
  const [paramModal, setParamModal] = useState<ChallengeParamModal>(null);
  const [lineDirOriginId, setLineDirOriginId] = useState<string | null>(null);
  const [pForm, setPForm] = useState({
    x: '1',
    y: '2',
    z: '3',
    a: '1',
    b: '1',
    c: '1',
    d: '-3',
    dx: '1',
    dy: '1',
    dz: '1',
    cx: '1',
    cy: '2',
    cz: '2',
    r: '3',
    solidType: 'cube' as Solid3DType,
  });

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
    setParamModal(null);
    setLineDirOriginId(null);
    setStartTime(Date.now());
  }, [challenge]);

  // Listen to native fullscreen changes
  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // Safe keyboard shortcuts (Esc, Ctrl+Z)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }
      if (e.key === 'Escape') {
        if (paramModal) {
          setParamModal(null);
        } else if (pendingRefs.length > 0 || activeTool !== 'select') {
          setPendingRefs([]);
          setActiveTool('select');
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        setUndoStack((u) => {
          if (u.length === 0) return u;
          const last = u[u.length - 1];
          setScene(last);
          return u.slice(0, -1);
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [paramModal, pendingRefs.length, activeTool]);

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

  useEffect(() => {
    setPendingRefs((prev) => {
      if (prev.length === 0) return prev;
      const valid = prev.filter((id) => Boolean(scene.objects[id]));
      return valid.length === prev.length ? prev : valid;
    });
  }, [scene]);

  const givenObjectsSummary = useMemo(() => {
    const init = challenge.buildInitialScene();
    const pts: string[] = [];
    const lines: string[] = [];
    const planes: string[] = [];
    const solids: string[] = [];
    for (const id of init.order) {
      const o = init.objects[id];
      if (!o || !o.style.isGiven) continue;
      if (o.kind === 'point') pts.push(o.label);
      else if (o.kind === 'line' || o.kind === 'segment') lines.push(getObjectDisplayName3D(init, o));
      else if (o.kind === 'plane') planes.push(getObjectDisplayName3D(init, o));
      else if (o.kind === 'solid') solids.push(getObjectDisplayName3D(init, o));
    }
    const parts: string[] = [];
    if (solids.length > 0) parts.push(`Hình khối: ${solids.join(', ')}`);
    if (pts.length > 0) parts.push(`Điểm: ${pts.slice(0, 10).join(', ')}${pts.length > 10 ? '…' : ''}`);
    if (lines.length > 0) parts.push(`Đường/Đoạn: ${lines.slice(0, 6).join(', ')}${lines.length > 6 ? '…' : ''}`);
    if (planes.length > 0) parts.push(`Mặt phẳng: ${planes.join(', ')}`);
    return parts.join(' · ') || 'Hệ trục tọa độ Oxyz trống';
  }, [challenge]);

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
    setLineDirOriginId(null);
    if (tid === 'point_coords' || tid === 'plane_equation' || tid === 'plane_normal' || tid === 'solid_library') {
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
      else if (activeTool === 'segment') finish(addGeo3DObject(scene, { kind: 'segment', rule: 'segment_3d', parents: [refs[0], refs[1]] }));
      else if (activeTool === 'line') finish(addGeo3DObject(scene, { kind: 'line', rule: 'line_two_points', parents: [refs[0], refs[1]] }));
      else if (activeTool === 'ray') finish(addGeo3DObject(scene, { kind: 'ray', rule: 'ray_3d', parents: [refs[0], refs[1]] }));
      else finish(addGeo3DObject(scene, { kind: 'vector', rule: 'vector_two_points', parents: [refs[0], refs[1]] }));
    } else if (activeTool === 'line_dir_vector') {
      if (clicked.kind === 'point') {
        setLineDirOriginId(clickedId);
        setParamModal('line_dir_vector');
      } else {
        flash('Vui lòng nhấp chọn một điểm mà đường thẳng đi qua.');
      }
    } else if (activeTool === 'plane_3pts') {
      if (refs.length < 3) setPendingRefs(refs);
      else finish(addGeo3DObject(scene, { kind: 'plane', rule: 'plane_three_points', parents: refs }));
    } else if (activeTool === 'plane_2lines_inter' || activeTool === 'plane_2lines_para') {
      if (refs.length < 2) setPendingRefs(refs);
      else finish(addGeo3DObject(scene, { kind: 'plane', rule: 'plane_two_lines', parents: [refs[0], refs[1]] }));
    } else if (activeTool === 'polygon') {
      if (pendingRefs.length >= 3 && clickedId === pendingRefs[0]) {
        finish(addGeo3DObject(scene, { kind: 'polygon', rule: 'polygon_3d', parents: pendingRefs }));
      } else if (!pendingRefs.includes(clickedId)) setPendingRefs(refs);
    } else if (activeTool === 'point_on_line') {
      finish(addGeo3DObject(scene, { kind: 'point', rule: 'point_on_line', parents: [clickedId], position: hitPoint, label: `K${userStepCount + 1}` }));
    } else if (activeTool === 'point_on_segment') {
      finish(addGeo3DObject(scene, { kind: 'point', rule: 'point_on_segment', parents: [clickedId], position: hitPoint, label: `K${userStepCount + 1}` }));
    } else if (activeTool === 'point_on_plane') {
      finish(addGeo3DObject(scene, { kind: 'point', rule: 'point_on_plane', parents: [clickedId], position: hitPoint, label: `K${userStepCount + 1}` }));
    } else if (activeTool === 'parallel_line') {
      if (refs.length < 2) setPendingRefs(refs);
      else {
        const ptId = scene.objects[refs[0]]?.kind === 'point' ? refs[0] : refs[1];
        const lId = ptId === refs[0] ? refs[1] : refs[0];
        finish(addGeo3DObject(scene, { kind: 'line', rule: 'line_parallel_point', parents: [ptId, lId] }));
      }
    } else if (activeTool === 'perp_line_plane') {
      if (refs.length < 2) setPendingRefs(refs);
      else {
        const ptId = scene.objects[refs[0]]?.kind === 'point' ? refs[0] : refs[1];
        const pId = ptId === refs[0] ? refs[1] : refs[0];
        finish(addGeo3DObject(scene, { kind: 'line', rule: 'line_perp_plane', parents: [ptId, pId] }));
      }
    } else if (activeTool === 'plane_parallel') {
      if (refs.length < 2) setPendingRefs(refs);
      else {
        const ptId = scene.objects[refs[0]]?.kind === 'point' ? refs[0] : refs[1];
        const pId = ptId === refs[0] ? refs[1] : refs[0];
        finish(addGeo3DObject(scene, { kind: 'plane', rule: 'plane_parallel_point', parents: [ptId, pId] }));
      }
    } else if (activeTool === 'plane_perp_line') {
      if (refs.length < 2) setPendingRefs(refs);
      else {
        const ptId = scene.objects[refs[0]]?.kind === 'point' ? refs[0] : refs[1];
        const lId = ptId === refs[0] ? refs[1] : refs[0];
        finish(addGeo3DObject(scene, { kind: 'plane', rule: 'plane_perp_line', parents: [ptId, lId] }));
      }
    } else if (activeTool === 'plane_line_pt') {
      if (refs.length < 2) setPendingRefs(refs);
      else {
        const lId = scene.objects[refs[0]]?.kind === 'line' || scene.objects[refs[0]]?.kind === 'segment' ? refs[0] : refs[1];
        const ptId = lId === refs[0] ? refs[1] : refs[0];
        finish(addGeo3DObject(scene, { kind: 'plane', rule: 'plane_line_point', parents: [lId, ptId] }));
      }
    } else if (activeTool === 'intersect_pp') {
      if (refs.length < 2) setPendingRefs(refs);
      else finish(addGeo3DObject(scene, { kind: 'line', rule: 'intersect_plane_plane', parents: [refs[0], refs[1]] }));
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
      else finish(addGeo3DObject(scene, { kind: 'line', rule: 'common_perpendicular', parents: [refs[0], refs[1]] }));
    } else if (activeTool === 'cross_section') {
      if (refs.length < 2) setPendingRefs(refs);
      else {
        const sId = scene.objects[refs[0]]?.kind === 'solid' ? refs[0] : refs[1];
        const pId = sId === refs[0] ? refs[1] : refs[0];
        finish(addGeo3DObject(scene, { kind: 'cross_section', rule: 'cross_section_solid_plane', parents: [sId, pId] }));
      }
    } else if (activeTool === 'measure_dihedral') {
      if (refs.length < 4) setPendingRefs(refs);
      else {
        finish(
          addGeo3DObject(scene, {
            kind: 'measurement',
            rule: 'measure_dihedral_angle',
            parents: [refs[0], refs[1], refs[2], refs[3]],
            label: 'Góc nhị diện',
          })
        );
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
      > = {
        measure_length: 'measure_distance_pp',
        measure_angle_vec: 'measure_angle_vectors',
        measure_angle_ll: 'measure_angle_lines',
        measure_angle_lp: 'measure_angle_line_plane',
        measure_angle_pp: 'measure_angle_planes',
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
    const res = validateChallenge3D(challenge, scene, {
      hintsUsed: hintTier,
      viewedSolution,
    });
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

  const toggleWorkspaceFullscreen = async () => {
    try {
      if (!document.fullscreenElement && workspaceRef.current) {
        await workspaceRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen restriction inside embedded iframes
    }
  };

  const nextChallenge = useMemo(() => getNextChallenge3D(challenge.id) ?? null, [challenge.id]);

  const hintLabels = ['Mức 1 – Kiến thức liên quan', 'Mức 2 – Công cụ nên dùng', 'Mức 3 – Các bước dựng hình'];

  return (
    <div
      ref={workspaceRef}
      className={`space-y-4 ${isFullscreen ? 'bg-slate-50 dark:bg-slate-950 p-4 overflow-y-auto h-screen' : ''}`}
    >
      {/* Top Action Header Bar */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Cấp độ {LEVELS_3D.find((l) => l.id === challenge.levelId)?.roman ?? challenge.levelId}
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300">
              <span>Bài {challenge.levelId}.{challenge.order}</span>
              <span>·</span>
              <span>{challenge.curriculumTag}</span>
              <span>·</span>
              <span>{challenge.cognitiveTier}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
              {challenge.title}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={undoStack.length === 0}
            onClick={() => {
              const last = undoStack[undoStack.length - 1];
              if (!last) return;
              setScene(last);
              setUndoStack((u) => u.slice(0, -1));
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
            title="Hoàn tác (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
            Hoàn tác
          </button>
          <button
            type="button"
            onClick={() => {
              setScene(challenge.buildInitialScene());
              setUndoStack([]);
              setPendingRefs([]);
              setReport(null);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-4 h-4" />
            Làm lại
          </button>
          <button
            type="button"
            onClick={() => void toggleWorkspaceFullscreen()}
            className="p-2 min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
            title={isFullscreen ? 'Thoát toàn màn hình (Esc)' : 'Toàn màn hình'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => void handleValidate()}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-teal-700 text-white text-[15px] font-semibold hover:bg-teal-800 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            Kiểm tra
          </button>
        </div>
      </div>

      {/* Main Split: 3D Viewport + Side Task/Hints/Validation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 flex flex-col gap-2.5">
          {/* Complete Allowed Tools Strip (never sliced) */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 px-1">
              <span className="inline-flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-teal-600" />
                Bộ công cụ dựng hình 3D ({challenge.allowedTools.length} công cụ)
              </span>
              {activeTool !== 'select' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTool('select');
                    setPendingRefs([]);
                  }}
                  className="text-teal-700 dark:text-teal-400 hover:underline"
                >
                  Hủy công cụ (Esc)
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {challenge.allowedTools.map((tid) => {
                const def = getTool3DDef(tid);
                return (
                  <button
                    key={tid}
                    type="button"
                    onClick={() => handleSelectTool(tid)}
                    className={`px-3 py-1.5 min-h-[36px] rounded-lg text-[13px] font-semibold transition-colors ${
                      activeTool === tid
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                    title={def.tooltip}
                  >
                    {def.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Single-line Contextual Instruction Bar */}
          {(() => {
            const pendingLabels = getPendingDisplayNames3D(scene, pendingRefs);
            return (
              <div className="px-3.5 py-2 rounded-xl bg-sky-50/90 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800 text-[15px] text-sky-950 dark:text-sky-100 flex items-center justify-between gap-2">
                <span className="truncate font-medium">
                  {banner || getTool3DDef(activeTool).actionPrompt}
                </span>
                {pendingLabels.length > 0 && (
                  <span className="text-[13px] font-bold shrink-0 px-2.5 py-0.5 rounded bg-white dark:bg-slate-800 text-teal-800 dark:text-teal-300 border border-sky-200 dark:border-sky-700">
                    Đã chọn: {pendingLabels.join(' → ')}
                  </span>
                )}
              </div>
            );
          })()}

          {/* Interactive 3D Canvas */}
          <div className={isFullscreen ? 'h-[66vh] min-h-[480px]' : 'h-[540px]'}>
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
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Yêu cầu dựng hình
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
                <BookOpen className="w-3.5 h-3.5" />
                {challenge.curriculumTag}
              </span>
            </div>
            <div className="text-[15px] text-slate-800 dark:text-slate-100 leading-relaxed">
              <MathText text={challenge.description} />
            </div>
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-sm">
              <div>
                <strong className="text-slate-700 dark:text-slate-200">Kiến thức liên quan: </strong>
                <span className="text-slate-600 dark:text-slate-300">{challenge.knowledgeTopic}</span>
              </div>
              <div>
                <strong className="text-slate-700 dark:text-slate-200">Giả thiết: </strong>
                <MathText text={challenge.hypothesis} />
              </div>
              <div>
                <strong className="text-teal-700 dark:text-teal-300">Mục tiêu: </strong>
                <MathText text={challenge.goal} />
              </div>
              <div className="pt-1 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                <Layers className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>Đối tượng ban đầu: {givenObjectsSummary}</span>
              </div>
            </div>
          </div>

          {/* Non-occluding Validation Report */}
          {report && (
            <div
              className={`rounded-2xl border p-4 space-y-2.5 ${
                report.passed
                  ? 'border-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/30 dark:border-emerald-800'
                  : 'border-amber-300 bg-amber-50/90 dark:bg-amber-950/30 dark:border-amber-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="font-bold text-[15px] text-slate-900 dark:text-slate-100">
                  {report.message}
                </div>
                {report.passed && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${
                          report.stars >= s ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-700'
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
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">{report.proofDisclaimer}</p>
              {report.passed && nextChallenge && (
                <button
                  type="button"
                  onClick={() => onNext(nextChallenge.id)}
                  className="w-full py-2.5 px-3 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 flex items-center justify-center gap-1.5"
                >
                  Thử thách tiếp theo: {nextChallenge.title}
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              )}
            </div>
          )}

          {/* 3-Tier Hints */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-slate-100">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Gợi ý ({hintTier}/3)
              </div>
              {hintTier < 3 && (
                <button
                  type="button"
                  onClick={() => setHintTier((h) => Math.min(3, h + 1))}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100"
                >
                  Mở gợi ý mức {hintTier + 1}
                </button>
              )}
            </div>
            {hintTier === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gợi ý gồm 3 mức (kiến thức, công cụ, các bước dựng). Dùng gợi ý khi hoàn thành đạt tối đa 2 sao.
              </p>
            ) : (
              <div className="space-y-2">
                {challenge.hints.slice(0, hintTier).map((hint, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 p-2.5 text-sm text-slate-800 dark:text-slate-200"
                  >
                    <div className="font-bold text-xs text-amber-800 dark:text-amber-300 mb-0.5">
                      {hintLabels[idx] ?? `Mức ${idx + 1}`}
                    </div>
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
            className="w-full py-3 px-4 rounded-2xl border border-sky-300 dark:border-sky-800 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-200 text-[15px] font-semibold hover:bg-sky-100 dark:hover:bg-sky-900/50 flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            Xem lời giải 3D từng bước &amp; Chứng minh
          </button>
        </div>
      </div>

      {/* PARAMETER INPUT MODAL FOR OXYZ/SOLID IN CHALLENGES */}
      {paramModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {getTool3DDef(paramModal).name}
              </h3>
              <button
                type="button"
                onClick={() => setParamModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paramModal === 'point_coords' && (
              <div className="grid grid-cols-3 gap-2">
                {(['x', 'y', 'z'] as const).map((k) => (
                  <label key={k} className="space-y-1">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tọa độ {k}</span>
                    <input
                      type="number"
                      step={0.5}
                      value={pForm[k]}
                      onChange={(e) => setPForm((p) => ({ ...p, [k]: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm font-mono"
                    />
                  </label>
                ))}
              </div>
            )}

            {paramModal === 'plane_normal' && (
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Điểm đi qua M(x, y, z) và vectơ pháp tuyến n = (A, B, C):
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['x', 'y', 'z'] as const).map((k) => (
                    <label key={k} className="space-y-1">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">M({k})</span>
                      <input
                        type="number"
                        step={0.5}
                        value={pForm[k]}
                        onChange={(e) => setPForm((p) => ({ ...p, [k]: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm font-mono"
                      />
                    </label>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['a', 'b', 'c'] as const).map((k) => (
                    <label key={k} className="space-y-1">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">n({k.toUpperCase()})</span>
                      <input
                        type="number"
                        step={0.5}
                        value={pForm[k]}
                        onChange={(e) => setPForm((p) => ({ ...p, [k]: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm font-mono"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {paramModal === 'line_dir_vector' && (
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Đường thẳng đi qua <strong>{lineDirOriginId ? scene.objects[lineDirOriginId]?.label : 'điểm đã chọn'}</strong> có vectơ chỉ phương u = (dx, dy, dz):
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {(['dx', 'dy', 'dz'] as const).map((k) => (
                    <label key={k} className="space-y-1">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{k}</span>
                      <input
                        type="number"
                        step={0.5}
                        value={pForm[k]}
                        onChange={(e) => setPForm((p) => ({ ...p, [k]: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm font-mono"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {paramModal === 'plane_equation' && (
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Phương trình mặt phẳng: Ax + By + Cz + D = 0
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {(['a', 'b', 'c', 'd'] as const).map((k) => (
                    <label key={k} className="space-y-1">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{k.toUpperCase()}</span>
                      <input
                        type="number"
                        step={0.5}
                        value={pForm[k]}
                        onChange={(e) => setPForm((p) => ({ ...p, [k]: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm font-mono"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {paramModal === 'solid_library' && (
              <div className="space-y-3">
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Loại hình khối</span>
                  <select
                    value={pForm.solidType}
                    onChange={(e) => setPForm((p) => ({ ...p, solidType: e.target.value as Solid3DType }))}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                  >
                    <option value="cube">Hình lập phương</option>
                    <option value="box">Hình hộp chữ nhật</option>
                    <option value="regular_tetrahedron">Tứ diện đều</option>
                    <option value="regular_pyramid">Hình chóp tứ giác đều</option>
                    <option value="right_prism">Hình lăng trụ đứng tam giác</option>
                    <option value="sphere">Mặt cầu / Hình cầu</option>
                    <option value="cylinder">Hình trụ tròn xoay</option>
                    <option value="cone">Hình nón tròn xoay</option>
                  </select>
                </label>

                {pForm.solidType === 'sphere' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      {(['cx', 'cy', 'cz'] as const).map((k, idx) => (
                        <label key={k} className="space-y-1">
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Tâm I({['x', 'y', 'z'][idx]})
                          </span>
                          <input
                            type="number"
                            step={0.5}
                            value={pForm[k]}
                            onChange={(e) => setPForm((p) => ({ ...p, [k]: e.target.value }))}
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm font-mono"
                          />
                        </label>
                      ))}
                    </div>
                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Bán kính R</span>
                      <input
                        type="number"
                        step={0.5}
                        min={0.5}
                        value={pForm.r}
                        onChange={(e) => setPForm((p) => ({ ...p, r: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm font-mono"
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setParamModal(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-sm font-medium"
              >
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
                  } else if (paramModal === 'plane_normal') {
                    commit(
                      addGeo3DObject(scene, {
                        kind: 'plane',
                        rule: 'plane_point_normal',
                        params: {
                          px: Number(pForm.x) || 0,
                          py: Number(pForm.y) || 0,
                          pz: Number(pForm.z) || 0,
                          nx: Number(pForm.a) || 0,
                          ny: Number(pForm.b) || 0,
                          nz: Number(pForm.c) || 1,
                        },
                        label: `(P${userStepCount + 1})`,
                      }).scene
                    );
                  } else if (paramModal === 'line_dir_vector' && lineDirOriginId) {
                    commit(
                      addGeo3DObject(scene, {
                        kind: 'line',
                        rule: 'line_point_direction',
                        parents: [lineDirOriginId],
                        params: {
                          dx: Number(pForm.dx) || 0,
                          dy: Number(pForm.dy) || 0,
                          dz: Number(pForm.dz) || 0,
                        },
                        label: `d${userStepCount + 1}`,
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
                    const isSphere = pForm.solidType === 'sphere';
                    commit(
                      addGeo3DObject(scene, {
                        kind: 'solid',
                        rule: `solid_${pForm.solidType}` as Geo3DRule,
                        solidType: pForm.solidType,
                        params: isSphere
                          ? { r: Math.max(0.5, Number(pForm.r) || 2) }
                          : { a: 3, b: 2.5, h: 3.2, r: 2 },
                        center: isSphere
                          ? v3(Number(pForm.cx) || 0, Number(pForm.cy) || 0, Number(pForm.cz) || 0)
                          : v3(0, 0, 0),
                        label: isSphere ? 'Mặt cầu (S)' : 'Hình khối',
                      }).scene
                    );
                  }
                  setParamModal(null);
                  setLineDirOriginId(null);
                  setActiveTool('select');
                }}
                className="px-4 py-2 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
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
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold"
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
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
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
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                              ? 'border-teal-500 bg-teal-50/80 dark:bg-teal-950/40 text-slate-900 dark:text-white'
                              : reached
                              ? 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-800 dark:text-slate-200'
                              : 'border-slate-100 dark:border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="font-semibold">
                            Bước {idx + 1}: {st.actionText}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            <MathText text={st.mathExplanation} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 p-3 space-y-1 text-sm">
                    <div className="font-bold text-emerald-900 dark:text-emerald-300">Chứng minh toán học</div>
                    <div className="text-slate-800 dark:text-slate-200 leading-relaxed">
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
                  {solPlaying ? 'Tạm dừng' : 'Phát'}
                </button>
                <button
                  type="button"
                  disabled={solStep <= 0}
                  onClick={() => {
                    setSolPlaying(false);
                    setSolStep((s) => Math.max(0, s - 1));
                  }}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40"
                  title="Bước trước"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={solStep >= challenge.solutionSteps.length}
                  onClick={() => {
                    setSolPlaying(false);
                    setSolStep((s) => Math.min(challenge.solutionSteps.length, s + 1));
                  }}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 disabled:opacity-40"
                  title="Bước tiếp"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSolPlaying(false);
                    setSolStep(0);
                  }}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                >
                  Xem lại từ đầu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSolPlaying(false);
                    setSolStep(challenge.solutionSteps.length);
                  }}
                  className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold"
                >
                  Hiện toàn bộ
                </button>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium">Tốc độ:</span>
                {([0.5, 1, 1.5, 2] as const).map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => setSolSpeed(sp)}
                    className={`px-2 py-1 rounded-md font-mono font-semibold ${
                      solSpeed === sp
                        ? 'bg-teal-700 text-white'
                        : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {sp}x
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
