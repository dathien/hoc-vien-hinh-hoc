import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Lightbulb,
  Lock,
  RotateCcw,
  ShieldCheck,
  Star,
} from 'lucide-react';
import {
  getChallengeById,
  getChallengeProgramLabel,
  getChallengesByLevel,
  getLevelMeta,
  getNextChallenge,
  isChallengeUnlocked,
  isLevelUnlocked,
  LEVELS,
} from '../challenges';
import { ConfettiBurst } from '../components/common/ConfettiBurst';
import { ConstructionLogPanel } from '../components/geometry/ConstructionLogPanel';
import { GeometryCanvas } from '../components/geometry/GeometryCanvas';
import { GeoThumbnailSVG } from '../components/geometry/GeoThumbnailSVG';
import { SolutionPlayer } from '../components/geometry/SolutionPlayer';
import { ToolPalette } from '../components/geometry/ToolPalette';
import { MathText } from '../components/math/MathText';
import { computeSceneCosts, deleteObjectWithDependents } from '../geometry/engine';
import { TOOL_CATALOG } from '../geometry/tools';
import type { GeoScene, ToolId } from '../geometry/types';
import { audioService } from '../services/audioService';
import { useApp } from '../store/AppContext';
import type { ChallengeDefinition, InitialGeoSpec, ValidationReport } from '../validators/types';
import {
  applyPerturbation,
  buildInitialScene,
  generatePerturbations,
  validateChallengeConstruction,
} from '../validators/validator';

const Campaign3DView = lazy(() => import('./Campaign3DView'));

const HINT_TIER_LABELS = [
  'Mức 1 – Định hướng suy nghĩ',
  'Mức 2 – Gợi ý phương pháp dựng',
  'Mức 3 – Hướng dẫn thao tác cụ thể',
] as const;

function summarizeGivenHypothesis(specs: InitialGeoSpec[]): string {
  const points = specs.filter((s) => s.kind === 'point' && s.style?.showLabel !== false).map((s) => s.label);
  const lines = specs.filter((s) => s.kind === 'line').map((s) => `đường thẳng ${s.label}`);
  const segs = specs.filter((s) => s.kind === 'segment').map((s) => `đoạn thẳng ${s.label}`);
  const rays = specs.filter((s) => s.kind === 'ray').map((s) => `tia ${s.label}`);
  const circles = specs.filter((s) => s.kind === 'circle').map((s) => `đường tròn ${s.label}`);
  const parts: string[] = [];
  if (points.length > 0) parts.push(`các điểm ${points.join(', ')}`);
  if (segs.length > 0) parts.push(segs.join(', '));
  if (lines.length > 0) parts.push(lines.join(', '));
  if (rays.length > 0) parts.push(rays.join(', '));
  if (circles.length > 0) parts.push(circles.join(', '));
  return parts.length > 0 ? `Cho trước ${parts.join('; ')}.` : 'Cho hình vẽ giả thiết trên bảng dựng.';
}

export const CampaignPage: React.FC = () => {
  const {
    activeLevelId,
    setActiveLevelId,
    activeChallengeId,
    setActiveChallengeId,
    campaignDimension,
    setCampaignDimension,
    setActiveChallenge3DId,
    teacherPreviewMode,
    setTeacherPreviewMode,
    progressMap,
    customChallenges,
    recordChallengeAttempt,
    stats,
    stats3D,
    settings,
    updateSettings,
  } = useApp();

  const activeChallenge: ChallengeDefinition | undefined = useMemo(() => {
    if (!activeChallengeId) return undefined;
    return (
      getChallengeById(activeChallengeId) ??
      customChallenges.find((c) => c.id === activeChallengeId)
    );
  }, [activeChallengeId, customChallenges]);

  const [scene, setScene] = useState<GeoScene>(() =>
    activeChallenge ? buildInitialScene(activeChallenge) : buildInitialScene(getChallengesByLevel(1)[0])
  );
  const [history, setHistory] = useState<GeoScene[]>([]);
  const [future, setFuture] = useState<GeoScene[]>([]);
  const [activeTool, setActiveTool] = useState<ToolId>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [solutionOpen, setSolutionOpen] = useState(false);
  const [viewedSolutionForAttempt, setViewedSolutionForAttempt] = useState(false);
  const [solutionPreviewScene, setSolutionPreviewScene] = useState<GeoScene | null>(null);
  const [showProofPanel, setShowProofPanel] = useState(false);
  const [showStructureDetails, setShowStructureDetails] = useState(false);

  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [verifyScene, setVerifyScene] = useState<GeoScene | null>(null);
  const [verifyLabel, setVerifyLabel] = useState<string | null>(null);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [startTimeMs, setStartTimeMs] = useState<number>(Date.now());

  const verifyTimerRef = useRef<number | null>(null);

  const stopVerifyAnimation = useCallback(() => {
    if (verifyTimerRef.current !== null) {
      window.clearInterval(verifyTimerRef.current);
      verifyTimerRef.current = null;
    }
    setVerifyScene(null);
    setVerifyLabel(null);
  }, []);

  // Reset workspace whenever activeChallenge changes
  useEffect(() => {
    stopVerifyAnimation();
    if (!activeChallenge) return;
    setScene(buildInitialScene(activeChallenge));
    setHistory([]);
    setFuture([]);
    setSelectedId(null);
    setHintsRevealed(0);
    setSolutionOpen(false);
    setViewedSolutionForAttempt(false);
    setSolutionPreviewScene(null);
    setShowProofPanel(false);
    setShowStructureDetails(false);
    setValidationReport(null);
    setStartTimeMs(Date.now());
    const preferred =
      activeChallenge.allowedTools.find((t) => t === 'circle_cp' || t === 'line' || t === 'segment') ??
      'select';
    setActiveTool(preferred);
  }, [activeChallenge, stopVerifyAnimation]);

  useEffect(() => () => stopVerifyAnimation(), [stopVerifyAnimation]);

  const handleSceneChange = (next: GeoScene, recordHistory = true) => {
    if (recordHistory) {
      setHistory((prev) => [...prev.slice(-39), scene]);
      setFuture([]);
    }
    setScene(next);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture((f) => [scene, ...f]);
    setHistory((h) => h.slice(0, -1));
    setScene(prev);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((h) => [...h, scene]);
    setFuture((f) => f.slice(1));
    setScene(next);
  };

  const handleResetChallenge = () => {
    if (!activeChallenge) return;
    stopVerifyAnimation();
    setScene(buildInitialScene(activeChallenge));
    setHistory([]);
    setFuture([]);
    setSelectedId(null);
    setValidationReport(null);
    setViewedSolutionForAttempt(false);
    setStartTimeMs(Date.now());
  };

  const runDynamicVerification = () => {
    if (!activeChallenge) return;
    stopVerifyAnimation();
    setSolutionOpen(false);
    setSolutionPreviewScene(null);

    const report = validateChallengeConstruction(scene, activeChallenge, 24);
    const perturbations = generatePerturbations(scene, activeChallenge, 8);

    if (settings.reducedMotion || perturbations.length === 0) {
      finishValidation(report);
      return;
    }

    let idx = 0;
    setVerifyLabel(`Đang kiểm chứng hình học động (cấu hình 1/${perturbations.length})...`);
    setVerifyScene(applyPerturbation(scene, perturbations[0]));

    verifyTimerRef.current = window.setInterval(() => {
      idx += 1;
      if (idx >= perturbations.length) {
        stopVerifyAnimation();
        finishValidation(report);
        return;
      }
      setVerifyLabel(`Đang kiểm chứng hình học động (cấu hình ${idx + 1}/${perturbations.length})...`);
      setVerifyScene(applyPerturbation(scene, perturbations[idx]));
    }, Math.max(120, Math.round(230 / settings.animationSpeed)));
  };

  const finishValidation = (report: ValidationReport) => {
    if (!activeChallenge) return;
    setValidationReport(report);
    const elapsedSec = Math.max(1, Math.round((Date.now() - startTimeMs) / 1000));

    if (report.valid) {
      audioService.play('complete');
      setConfettiTrigger((n) => n + 1);
      void recordChallengeAttempt({
        challengeId: activeChallenge.id,
        stars: report.stars,
        usedL: report.usedL,
        usedE: report.usedE,
        elapsedSec,
        viewedSolution: viewedSolutionForAttempt,
      });
    } else {
      audioService.play('error');
      void recordChallengeAttempt({
        challengeId: activeChallenge.id,
        stars: 0,
        usedL: report.usedL,
        usedE: report.usedE,
        elapsedSec,
        viewedSolution: viewedSolutionForAttempt,
      });
    }
  };

  // VIEW 0: 3D Spatial Challenges (Lazy-loaded, strictly separate from 2D 540-star system)
  if (campaignDimension === '3d') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            type="button"
            onClick={() => {
              setCampaignDimension('2d');
              setActiveChallenge3DId(null);
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[15px] font-semibold text-slate-700 dark:text-slate-200 hover:border-teal-400"
          >
            Thử thách hình học phẳng 2D ({stats.completedCount}/180 · ★ {stats.totalStars}/540)
          </button>
          <button
            type="button"
            onClick={() => setCampaignDimension('3d')}
            className="px-4 py-2.5 rounded-xl bg-teal-700 text-white text-[15px] font-semibold shadow-xs"
          >
            Thử thách hình học không gian 3D ({stats3D.completedCount}/{stats3D.totalChallenges} · ★ {stats3D.totalStars}/{stats3D.maxStars})
          </button>
        </div>

        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-[15px] text-slate-600">
              Đang tải hệ thống 180 thử thách Hình học không gian 3D...
            </div>
          }
        >
          <Campaign3DView />
        </Suspense>
      </div>
    );
  }

  // VIEW 1: 18-Level Map & Challenge Picker (2D)
  if (!activeChallenge) {
    const levelMeta = getLevelMeta(activeLevelId) ?? LEVELS[0];
    const levelChallenges = getChallengesByLevel(activeLevelId);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
          <button
            type="button"
            onClick={() => setCampaignDimension('2d')}
            className="px-4 py-2.5 rounded-xl bg-teal-700 text-white text-[15px] font-semibold shadow-xs"
          >
            Thử thách hình học phẳng 2D ({stats.completedCount}/180 · ★ {stats.totalStars}/540)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveChallengeId(null);
              setCampaignDimension('3d');
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[15px] font-semibold text-slate-700 dark:text-slate-200 hover:border-sky-400"
          >
            Thử thách hình học không gian 3D ({stats3D.completedCount}/{stats3D.totalChallenges} · ★ {stats3D.totalStars}/{stats3D.maxStars})
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Hệ thống 18 Cấp độ – 180 Thử thách Hình học Phẳng
            </h1>
            <p className="text-[15px] text-slate-600 dark:text-slate-400 mt-1">
              Hoàn thành bài trước (tối thiểu 1 sao) để mở khóa bài tiếp theo. Mỗi thử thách có tối đa 3 sao: Sao 1 (dựng hình chính xác), Sao 2 (tối ưu số bước dựng L), Sao 3 (tối ưu số phép dựng cơ bản E).
            </p>
          </div>
          {teacherPreviewMode && (
            <div className="flex items-center gap-2 rounded-xl border border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-950/50 px-3.5 py-2 text-sm text-violet-900 dark:text-violet-200">
              <Eye className="w-4 h-4 shrink-0" />
              <span>Chế độ Xem trước Giáo viên (đã mở toàn bộ 180 bài, không lưu sao)</span>
              <button
                type="button"
                onClick={() => setTeacherPreviewMode(false)}
                className="font-semibold underline ml-1"
              >
                Tắt
              </button>
            </div>
          )}
        </div>

        {/* Horizontal 18-Level Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {LEVELS.map((lvl) => {
            const list = getChallengesByLevel(lvl.id);
            const done = list.filter((c) => (progressMap[c.id]?.stars ?? 0) >= 1).length;
            const unlocked = isLevelUnlocked(lvl.id, progressMap, teacherPreviewMode);
            const active = lvl.id === activeLevelId;

            return (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setActiveLevelId(lvl.id)}
                className={`shrink-0 rounded-xl border px-3.5 py-2.5 text-left transition-all min-w-[148px] ${
                  active
                    ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                    : unlocked
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-teal-400'
                    : 'bg-slate-100/70 dark:bg-slate-900/50 border-slate-200/70 dark:border-slate-800 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>Cấp {lvl.roman}</span>
                  {!unlocked && <Lock className="w-3 h-3 opacity-70" />}
                </div>
                <div className="text-xs truncate mt-0.5 opacity-95">{lvl.title}</div>
                <div className="text-[11px] font-mono-tabular mt-1 opacity-80">{done}/10 bài</div>
              </button>
            );
          })}
        </div>

        {/* Selected Level Banner */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-32 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden">
            <GeoThumbnailSVG kind={levelMeta.thumbnailKind} accentColor={levelMeta.accentColor} className="w-full h-24" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="text-xs font-bold uppercase tracking-wide" style={{ color: levelMeta.accentColor }}>
              Cấp độ {levelMeta.roman} · {levelMeta.curriculumCategory}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{levelMeta.title}</h2>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {levelMeta.description}
            </p>
          </div>
        </div>

        {/* 10 Challenge Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {levelChallenges.map((ch) => {
            const unlocked = isChallengeUnlocked(ch, progressMap, teacherPreviewMode);
            const rec = progressMap[ch.id];
            const earnedStars = rec?.stars ?? 0;
            const programLabel = getChallengeProgramLabel(ch);

            return (
              <div
                key={ch.id}
                className={`rounded-2xl border p-4 flex gap-4 transition-all ${
                  unlocked
                    ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-teal-500 hover:shadow-sm'
                    : 'border-slate-200/70 dark:border-slate-800/70 bg-slate-50 dark:bg-slate-900/50 opacity-75'
                }`}
              >
                <div className="w-24 shrink-0 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                  <GeoThumbnailSVG kind={ch.thumbnailKind} accentColor={levelMeta.accentColor} className="w-full h-20" />
                </div>

                <div className="min-w-0 flex-1 flex flex-col justify-between gap-2">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                        Bài {ch.order}/10 · {programLabel} · {ch.difficulty}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= earnedStars
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{ch.title}</h3>
                    <p className="text-[15px] text-slate-600 dark:text-slate-300 line-clamp-2 mt-1">
                      <MathText text={ch.description} />
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                      Mục tiêu: {ch.targetL} bước (L) · {ch.targetE} cơ bản (E)
                      {rec?.bestL != null && ` · Tốt nhất: ${rec.bestL}L/${rec.bestE}E`}
                    </span>

                    {unlocked ? (
                      <button
                        type="button"
                        onClick={() => setActiveChallengeId(ch.id)}
                        className="px-3.5 py-1.5 rounded-lg bg-teal-700 text-white text-[15px] font-semibold hover:bg-teal-800 shrink-0"
                      >
                        {earnedStars > 0 ? 'Làm lại' : 'Bắt đầu'}
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 shrink-0">
                        <Lock className="w-3.5 h-3.5" />
                        Chưa mở khóa
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Teacher Challenges section if available */}
        {customChallenges.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Thử thách do Giáo viên tạo ({customChallenges.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customChallenges.map((ch) => (
                <div
                  key={ch.id}
                  className="rounded-xl border border-violet-200 dark:border-violet-800 bg-white dark:bg-slate-900 p-4 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 dark:text-white truncate">{ch.title}</div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-1">
                      <MathText text={ch.description} />
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveChallengeId(ch.id)}
                    className="px-3.5 py-2 rounded-lg bg-violet-600 text-white text-[15px] font-semibold hover:bg-violet-700 shrink-0"
                  >
                    Thực hành
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // VIEW 2: Active Challenge Interactive Player
  const costs = computeSceneCosts(scene);
  const displayedScene = verifyScene ?? solutionPreviewScene ?? scene;
  const nextCh = getNextChallenge(activeChallenge.id);
  const prevRecord = progressMap[activeChallenge.id];
  const programLabel = getChallengeProgramLabel(activeChallenge);
  const allowedToolNames = activeChallenge.allowedTools
    .filter((t) => t !== 'pan')
    .map((t) => TOOL_CATALOG[t]?.name ?? t);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 pb-24 md:pb-10 space-y-4">
      <ConfettiBurst trigger={confettiTrigger} />

      {/* Top Challenge Navigation & Objective Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setActiveChallengeId(null)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            Danh sách bài
          </button>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              Cấp {activeChallenge.levelId} · Bài {activeChallenge.order} · {programLabel} · {activeChallenge.difficulty}
              {teacherPreviewMode && ' · Chế độ Xem trước Giáo viên'}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
              {activeChallenge.title}
            </h1>
          </div>
        </div>

        {/* Live Step/Elementary Counter & Verify CTA */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 flex items-center gap-3 text-sm font-mono-tabular"
            title="Số bước dựng (L) / mục tiêu đạt Sao 2 · Số phép dựng cơ bản (E) / mục tiêu đạt Sao 3"
          >
            <span className={costs.totalL <= activeChallenge.targetL ? 'text-teal-700 dark:text-teal-400 font-bold' : 'text-amber-600 font-bold'}>
              Bước dựng: {costs.totalL}/{activeChallenge.targetL} (L)
            </span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className={costs.totalE <= activeChallenge.targetE ? 'text-sky-700 dark:text-sky-400 font-bold' : 'text-amber-600 font-bold'}>
              Cơ bản: {costs.totalE}/{activeChallenge.targetE} (E)
            </span>
          </div>

          <button
            type="button"
            onClick={runDynamicVerification}
            disabled={Boolean(verifyScene)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-700 text-white font-semibold text-[15px] hover:bg-teal-800 shadow-sm disabled:opacity-60"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            {verifyScene ? 'Đang kiểm chứng...' : 'Kiểm chứng'}
          </button>
        </div>
      </div>

      {/* Structured Problem Card (Đề bài, Giả thiết, Yêu cầu dựng hình, Công cụ được phép) */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="text-[15px] sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed">
            <strong className="text-teal-700 dark:text-teal-400 mr-1.5">Đề bài:</strong>
            <MathText text={activeChallenge.description} />
          </div>
          <button
            type="button"
            onClick={() => setShowStructureDetails((v) => !v)}
            className="inline-flex items-center gap-1 text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline shrink-0 self-start md:self-center"
          >
            {showStructureDetails ? 'Thu gọn chi tiết đề' : 'Giả thiết & Quy định'}
            {showStructureDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        {showStructureDetails && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-700 dark:text-slate-300">
            <div>
              <div className="font-bold text-slate-900 dark:text-white mb-0.5">1. Giả thiết</div>
              <p>{summarizeGivenHypothesis(activeChallenge.initialGeometry)}</p>
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white mb-0.5">2. Yêu cầu dựng hình</div>
              <ul className="list-disc pl-4 space-y-0.5">
                {activeChallenge.validationRules.map((r, i) => (
                  <li key={i}>
                    <MathText text={r.description} />
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white mb-0.5">3. Công cụ được phép</div>
              <p>{allowedToolNames.join(', ')}.</p>
              {activeChallenge.constraints.length > 0 && (
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                  Lưu ý: {activeChallenge.constraints.join(' · ')}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Restricted Tool Palette */}
      <ToolPalette
        activeTool={activeTool}
        onSelectTool={setActiveTool}
        allowedTools={activeChallenge.allowedTools}
        forbiddenTools={activeChallenge.forbiddenTools}
        inputMode={settings.inputMode}
        onToggleInputMode={() =>
          updateSettings({
            inputMode: settings.inputMode === 'quick' ? 'virtual_tools' : 'quick',
          })
        }
        canUndo={history.length > 0}
        canRedo={future.length > 0}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClearUserObjects={handleResetChallenge}
        selectedObjectId={selectedId}
        onDeleteSelected={() => {
          if (!selectedId) return;
          handleSceneChange(deleteObjectWithDependents(scene, selectedId), true);
          setSelectedId(null);
        }}
        compact
      />

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 space-y-3">
          <GeometryCanvas
            scene={displayedScene}
            onSceneChange={handleSceneChange}
            activeTool={activeTool}
            inputMode={settings.inputMode}
            selectedObjectId={selectedId}
            onSelectObject={setSelectedId}
            readOnly={Boolean(verifyScene || solutionPreviewScene)}
            heightClass="h-[460px] sm:h-[540px]"
            defaultShowGrid={settings.showGrid}
            defaultShowAxes={settings.showAxes}
            defaultShowLabels={settings.showLabels}
            darkTheme={settings.theme === 'dark'}
            statusBanner={verifyLabel}
          />

          {/* Solution Player (only opened when student explicitly requests) */}
          {solutionOpen && (
            <SolutionPlayer
              challenge={activeChallenge}
              onPreviewSceneChange={setSolutionPreviewScene}
              onClose={() => {
                setSolutionOpen(false);
                setSolutionPreviewScene(null);
              }}
              teacherPreviewMode={teacherPreviewMode}
              darkTheme={settings.theme === 'dark'}
            />
          )}
        </div>

        {/* Right Guidance, Validation, Hints & Log */}
        <div className="lg:col-span-4 space-y-4">
          {/* Validation Report Card */}
          {validationReport && (
            <div
              className={`rounded-xl border p-4 space-y-3 ${
                validationReport.valid
                  ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/70 dark:bg-emerald-950/30'
                  : 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-base">
                  {validationReport.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                  )}
                  <span
                    className={
                      validationReport.valid
                        ? 'text-emerald-900 dark:text-emerald-200'
                        : 'text-rose-900 dark:text-rose-200'
                    }
                  >
                    {validationReport.valid
                      ? 'Phép dựng chính xác qua các cấu hình đã kiểm tra'
                      : 'Phép dựng chưa đạt yêu cầu'}
                  </span>
                </div>
                {validationReport.valid && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${
                          s <= validationReport.stars
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              <p className="text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed">
                {validationReport.summary}
              </p>

              {/* Transparent 3-star breakdown */}
              <div className="rounded-lg bg-white/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700 p-3 text-sm space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Sao 1 · Dựng hình chính xác ({validationReport.perturbationsPassed}/{validationReport.perturbationsTested} cấu hình)</span>
                  <strong className={validationReport.star1Correct ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'}>
                    {validationReport.star1Correct ? 'Đạt' : 'Chưa đạt'}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sao 2 · Tối ưu số bước dựng ({validationReport.usedL}/{validationReport.targetL} bước L)</span>
                  <strong className={validationReport.star2OptimalL ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600'}>
                    {validationReport.star2OptimalL ? 'Đạt' : 'Chưa đạt'}
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Sao 3 · Tối ưu phép dựng cơ bản ({validationReport.usedE}/{validationReport.targetE} cơ bản E)</span>
                  <strong className={validationReport.star3OptimalE ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-600'}>
                    {validationReport.star3OptimalE ? 'Đạt' : 'Chưa đạt'}
                  </strong>
                </div>
              </div>

              {/* Improvement hint when valid but < 3 stars */}
              {validationReport.valid && validationReport.stars < 3 && (
                <div className="text-sm text-sky-900 dark:text-sky-200 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 rounded-lg px-3 py-2">
                  <strong>Gợi ý cải thiện: </strong>
                  {!validationReport.star2OptimalL &&
                    `Hãy rút gọn phép dựng xuống còn tối đa ${validationReport.targetL} bước dựng (hiện tại ${validationReport.usedL}) để nhận Sao 2. `}
                  {!validationReport.star3OptimalE &&
                    `Hãy giảm số phép dựng cơ bản xuống tối đa ${validationReport.targetE} (hiện tại ${validationReport.usedE}) bằng cách tận dụng các giao điểm hoặc đường tròn sẵn có để nhận Sao 3.`}
                </div>
              )}

              {validationReport.valid && (
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                  Lưu ý: Kiểm chứng hình học động trên nhiều cấu hình giúp kiểm tra tính ổn định của phép dựng, không thay thế cho chứng minh toán học tổng quát. Hãy xem thêm phần Giải thích &amp; Chứng minh bên dưới.
                </p>
              )}

              {viewedSolutionForAttempt && validationReport.valid && !teacherPreviewMode && (
                <div className="text-sm text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/50 rounded-lg px-3 py-2">
                  Lần dựng này có xem lời giải nên chưa tính sao. Hãy bấm <strong>Làm lại</strong> để tự dựng và nhận đủ sao.
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1">
                {validationReport.valid && nextCh && (
                  <button
                    type="button"
                    onClick={() => setActiveChallengeId(nextCh.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 text-white text-[15px] font-semibold hover:bg-teal-800"
                  >
                    Thử thách tiếp theo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetChallenge}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-[15px] font-medium text-slate-700 dark:text-slate-200"
                >
                  <RotateCcw className="w-4 h-4" />
                  Làm lại
                </button>
              </div>
            </div>
          )}

          {/* 3-Tier Hints, Solution & Proof */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Gợi ý ba mức ({hintsRevealed}/3)
              </h3>
              {prevRecord && prevRecord.stars > 0 && (
                <span className="text-xs font-mono-tabular text-amber-600 dark:text-amber-400">
                  Kỷ lục: ★{prevRecord.stars}
                </span>
              )}
            </div>

            {hintsRevealed > 0 && (
              <div className="space-y-2">
                {activeChallenge.hints.slice(0, hintsRevealed).map((h, i) => (
                  <div
                    key={i}
                    className="rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 p-3 text-[15px] text-slate-700 dark:text-slate-200"
                  >
                    <div className="text-xs font-bold uppercase tracking-wide text-amber-800 dark:text-amber-300 mb-0.5">
                      {HINT_TIER_LABELS[i] ?? `Mức ${i + 1}`}
                    </div>
                    <MathText text={h} />
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {hintsRevealed < 3 && (
                <button
                  type="button"
                  onClick={() => setHintsRevealed((n) => Math.min(3, n + 1))}
                  className="px-3.5 py-2 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-[15px] font-medium hover:bg-amber-200/70"
                >
                  Mở gợi ý mức {hintsRevealed + 1}
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setViewedSolutionForAttempt(true);
                  setSolutionOpen((v) => !v);
                }}
                className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-[15px] font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {solutionOpen ? 'Đóng lời giải động' : 'Xem lời giải từng bước'}
              </button>
              <button
                type="button"
                onClick={() => setShowProofPanel((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-[15px] font-medium text-teal-700 dark:text-teal-300 hover:bg-teal-50/50 dark:hover:bg-teal-950/30"
              >
                <BookOpen className="w-4 h-4" />
                Giải thích &amp; Chứng minh
              </button>
            </div>

            {showProofPanel && (
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3.5 text-[15px] text-slate-700 dark:text-slate-200 space-y-2 leading-relaxed">
                <div className="font-semibold text-teal-800 dark:text-teal-300">
                  Giải thích và chứng minh hình học:
                </div>
                <MathText text={activeChallenge.proof} />
                {activeChallenge.educationalNotes && (
                  <div className="text-sm text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <strong>Nhận xét:</strong> <MathText text={activeChallenge.educationalNotes} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Construction Log */}
          <ConstructionLogPanel
            scene={scene}
            selectedObjectId={selectedId}
            onSelectObject={setSelectedId}
            onDeleteObject={(id) => {
              handleSceneChange(deleteObjectWithDependents(scene, id), true);
              if (selectedId === id) setSelectedId(null);
            }}
          />
        </div>
      </div>
    </div>
  );
};
