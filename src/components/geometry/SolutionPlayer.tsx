import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  X,
} from 'lucide-react';
import { addGeoObject } from '../../geometry/engine';
import type { GeoScene } from '../../geometry/types';
import { buildInitialScene } from '../../validators/validator';
import type { ChallengeDefinition } from '../../validators/types';
import { MathText } from '../math/MathText';
import { GeometryCanvas } from './GeometryCanvas';

interface SolutionPlayerProps {
  challenge: ChallengeDefinition;
  onPreviewSceneChange: (scene: GeoScene | null) => void;
  onClose: () => void;
  teacherPreviewMode?: boolean;
  darkTheme?: boolean;
}

export const SolutionPlayer: React.FC<SolutionPlayerProps> = ({
  challenge,
  onPreviewSceneChange,
  onClose,
  teacherPreviewMode = false,
  darkTheme = false,
}) => {
  const [stepIndex, setStepIndex] = useState(0); // 0 = initial, 1..N = after step i
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [showAux, setShowAux] = useState(true);
  const [showProof, setShowProof] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [localScene, setLocalScene] = useState<GeoScene>(() => buildInitialScene(challenge));

  const totalSteps = challenge.solutionSteps.length;

  useEffect(() => {
    let sc = buildInitialScene(challenge);
    for (let i = 0; i < stepIndex; i++) {
      const st = challenge.solutionSteps[i];
      if (!st) break;
      const isCurrent = i === stepIndex - 1;
      const added = addGeoObject(sc, {
        id: st.id,
        kind: st.kind,
        rule: st.rule,
        parents: st.parents,
        params: st.params,
        label: st.label,
        tool: st.tool,
        style: {
          color: isCurrent ? '#D97706' : st.isAuxiliary ? '#0284C7' : '#0F766E',
          strokeWidth: isCurrent ? 3 : st.isAuxiliary ? 1.5 : 2.3,
          dash: st.isAuxiliary ? 'dashed' : 'solid',
          isAuxiliary: Boolean(st.isAuxiliary),
          visible: st.isAuxiliary ? showAux : true,
        },
        logDescription: st.actionText,
      });
      sc = added.scene;
    }
    setLocalScene(sc);
    onPreviewSceneChange(sc);
  }, [challenge, stepIndex, showAux, onPreviewSceneChange]);

  useEffect(() => {
    if (!playing) return;
    if (stepIndex >= totalSteps) {
      setPlaying(false);
      return;
    }
    const ms = Math.round(1450 / speed);
    const timer = window.setTimeout(() => {
      setStepIndex((s) => Math.min(totalSteps, s + 1));
    }, ms);
    return () => window.clearTimeout(timer);
  }, [playing, stepIndex, totalSteps, speed]);

  const currentStep = stepIndex > 0 ? challenge.solutionSteps[stepIndex - 1] : null;

  const controlsContent = (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-base font-bold text-amber-900 dark:text-amber-300">
            Lời giải động từng bước ({stepIndex}/{totalSteps})
          </div>
          {!teacherPreviewMode && (
            <p className="text-sm text-amber-800/90 dark:text-amber-400/90 flex items-center gap-1.5 mt-0.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Chế độ xem lời giải chỉ mang tính tham khảo và không tự động cộng sao. Hãy tự dựng lại sau khi hiểu cách làm.
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFullscreen((v) => !v)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            title={fullscreen ? 'Thu nhỏ màn hình' : 'Xem lời giải toàn màn hình'}
          >
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span>{fullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setFullscreen(false);
              onPreviewSceneChange(null);
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-slate-800"
            aria-label="Đóng lời giải"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIndex(0);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            title="Làm lại từ bước đầu"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Làm lại</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIndex((s) => Math.max(0, s - 1));
            }}
            disabled={stepIndex === 0}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 disabled:opacity-40"
            title="Quay lại bước trước"
          >
            <SkipBack className="w-4 h-4" />
            <span>Bước trước</span>
          </button>
          <button
            type="button"
            onClick={() => {
              if (stepIndex >= totalSteps) setStepIndex(0);
              setPlaying((p) => !p);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 text-white text-[15px] font-semibold hover:bg-teal-800"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {playing ? 'Tạm dừng' : 'Bắt đầu'}
          </button>
          <button
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIndex((s) => Math.min(totalSteps, s + 1));
            }}
            disabled={stepIndex >= totalSteps}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 disabled:opacity-40"
            title="Chuyển sang bước tiếp theo"
          >
            <span>Bước tiếp theo</span>
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-xs font-medium text-slate-500">Tốc độ:</span>
          <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
            {[0.5, 1, 1.5, 2].map((sp) => (
              <button
                key={sp}
                type="button"
                onClick={() => setSpeed(sp)}
                className={`px-2.5 py-1.5 font-mono-tabular text-xs ${
                  speed === sp
                    ? 'bg-teal-700 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setShowAux((v) => !v)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200"
          >
            {showAux ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            Nét phụ
          </button>
        </div>
      </div>

      {/* Step progress bar */}
      <div className="flex gap-1">
        {challenge.solutionSteps.map((st, idx) => (
          <button
            key={st.id}
            type="button"
            onClick={() => {
              setPlaying(false);
              setStepIndex(idx + 1);
            }}
            className={`h-2.5 flex-1 rounded-full transition-colors ${
              idx < stepIndex ? 'bg-teal-600' : 'bg-slate-200 dark:bg-slate-700'
            }`}
            title={`Bước ${idx + 1}: ${st.actionText}`}
          />
        ))}
      </div>

      {/* Narration card */}
      <div className="rounded-lg bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3.5 text-[15px] space-y-1.5">
        {currentStep ? (
          <>
            <div className="font-semibold text-teal-800 dark:text-teal-300">
              Bước {stepIndex}: <MathText text={currentStep.actionText} />
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              <strong>Mục tiêu:</strong> <MathText text={currentStep.purpose} />
            </div>
            <div className="text-slate-600 dark:text-slate-300">
              <strong>Kết quả:</strong> <MathText text={currentStep.resultText} />
            </div>
            <div className="text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/60 rounded-md px-3 py-2">
              <strong>Giải thích Toán học:</strong> <MathText text={currentStep.mathExplanation} />
            </div>
          </>
        ) : (
          <div className="text-slate-600 dark:text-slate-300">
            Đang ở hình đề bài ban đầu. Nhấn <strong>Bắt đầu</strong> hoặc <strong>Bước tiếp theo</strong> để quan sát từng bước dựng hình.
          </div>
        )}
      </div>

      {/* Toggle full mathematical proof */}
      <div>
        <button
          type="button"
          onClick={() => setShowProof((v) => !v)}
          className="text-[15px] font-semibold text-teal-700 dark:text-teal-400 hover:underline"
        >
          {showProof ? 'Ẩn giải thích và chứng minh' : 'Xem giải thích và chứng minh đầy đủ'}
        </button>
        {showProof && (
          <div className="mt-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3.5 text-[15px] text-slate-700 dark:text-slate-200 leading-relaxed">
            <MathText text={challenge.proof} />
          </div>
        )}
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto flex items-center justify-center">
        <div className="w-full max-w-6xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 space-y-4 shadow-2xl">
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {challenge.title} — Trình chiếu lời giải toàn màn hình
          </div>
          <GeometryCanvas
            scene={localScene}
            onSceneChange={() => {}}
            readOnly
            heightClass="h-[460px] sm:h-[520px]"
            darkTheme={darkTheme}
          />
          {controlsContent}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-amber-300 dark:border-amber-700/70 bg-amber-50/60 dark:bg-slate-900 p-4 shadow-sm">
      {controlsContent}
    </div>
  );
};
