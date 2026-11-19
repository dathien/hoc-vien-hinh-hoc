import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Circle,
  Compass,
  Crosshair,
  GitCommitHorizontal,
  Hand,
  Hexagon,
  Info,
  Lock,
  Minus,
  MousePointer2,
  MoveHorizontal,
  PenTool,
  Redo2,
  RotateCcw,
  Ruler,
  Scissors,
  SlidersHorizontal,
  Sparkles,
  Square,
  Trash2,
  Triangle,
  Undo2,
} from 'lucide-react';
import { TOOL_CATALOG, TOOL_GROUPS } from '../../geometry/tools';
import type { ToolId } from '../../geometry/types';

interface ToolPaletteProps {
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  allowedTools?: ToolId[];
  forbiddenTools?: ToolId[];
  inputMode: 'quick' | 'virtual_tools';
  onToggleInputMode: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearUserObjects: () => void;
  selectedObjectId: string | null;
  onDeleteSelected: () => void;
  compact?: boolean;
}

const CORE_SHOW_IF_LOCKED: ToolId[] = ['line', 'segment', 'ray', 'circle_cp', 'compass'];

function renderToolIcon(tool: ToolId) {
  const cls = 'w-4 h-4 shrink-0';
  switch (tool) {
    case 'select':
      return <MousePointer2 className={cls} />;
    case 'pan':
      return <Hand className={cls} />;
    case 'point':
    case 'point_on_object':
      return <Crosshair className={cls} />;
    case 'intersect':
      return <Sparkles className={cls} />;
    case 'line':
    case 'ray':
    case 'polyline':
      return <Ruler className={cls} />;
    case 'segment':
      return <Minus className={cls} />;
    case 'circle_cp':
    case 'circle_cr':
    case 'arc':
    case 'incircle':
    case 'circumcircle':
      return <Circle className={cls} />;
    case 'compass':
      return <Compass className={cls} />;
    case 'midpoint':
      return <GitCommitHorizontal className={cls} />;
    case 'perp_bisector':
    case 'perpendicular':
    case 'parallel':
    case 'angle_bisector':
    case 'median':
    case 'altitude':
    case 'tangent':
    case 'projection':
      return <PenTool className={cls} />;
    case 'reflect_line':
    case 'reflect_point':
    case 'translate':
    case 'rotate':
    case 'homothety':
      return <MoveHorizontal className={cls} />;
    case 'triangle':
      return <Triangle className={cls} />;
    case 'quadrilateral':
      return <Square className={cls} />;
    case 'polygon':
    case 'regular_polygon':
      return <Hexagon className={cls} />;
    case 'measure_length':
    case 'measure_angle':
    case 'measure_area':
      return <SlidersHorizontal className={cls} />;
    default:
      return <Scissors className={cls} />;
  }
}

function buildToolTooltip(toolId: ToolId, allowed: boolean): string {
  const info = TOOL_CATALOG[toolId];
  const tierLabel = info.isEuclideanBasic ? 'Công cụ dựng hình cơ bản' : 'Công cụ dựng hình hỗ trợ';
  if (!allowed) {
    return `${info.name} (${tierLabel})\nTrạng thái: Bị khóa theo yêu cầu của thử thách này để đảm bảo đúng phép dựng.`;
  }
  const steps = info.promptSteps.map((s, idx) => `${idx + 1}. ${s}`).join('\n');
  return `${info.name} — ${tierLabel}\nCông dụng: ${info.elementaryBasis}\nThứ tự thao tác:\n${steps}`;
}

export const ToolPalette: React.FC<ToolPaletteProps> = ({
  activeTool,
  onSelectTool,
  allowedTools,
  forbiddenTools,
  inputMode,
  onToggleInputMode,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearUserObjects,
  selectedObjectId,
  onDeleteSelected,
  compact = false,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const isToolAllowed = (tool: ToolId): boolean => {
    if (forbiddenTools?.includes(tool)) return false;
    if (allowedTools && allowedTools.length > 0) {
      return allowedTools.includes(tool);
    }
    return true;
  };

  const visibleGroups = TOOL_GROUPS.map((g) => ({
    ...g,
    tools: g.tools.filter((t) => {
      // In unrestricted Lab mode, show all implemented tools
      if (!allowedTools) return true;
      // In challenge mode, show all allowed tools + only core locked ruler/compass tools so the toolbar stays uncluttered
      return allowedTools.includes(t) || (forbiddenTools?.includes(t) && CORE_SHOW_IF_LOCKED.includes(t));
    }),
  })).filter((g) => g.tools.length > 0);

  const quickBarTools: ToolId[] = (
    allowedTools ?? ['select', 'point', 'intersect', 'line', 'segment', 'circle_cp']
  ).slice(0, 7);

  const activeInfo = TOOL_CATALOG[activeTool];

  return (
    <>
      {/* Desktop / Tablet horizontal-compact toolbar */}
      <div className="hidden md:flex flex-col gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={onToggleInputMode}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[15px] font-medium border transition-colors ${
                inputMode === 'virtual_tools'
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
              }`}
              title="Chuyển đổi giữa chế độ vẽ nhanh và chế độ hiển thị thước thẳng – compa ảo trực quan"
            >
              <Compass className="w-4 h-4" />
              {inputMode === 'virtual_tools' ? 'Thước thẳng & Compa ảo' : 'Chế độ Vẽ nhanh'}
            </button>
            <span className="text-sm text-slate-600 dark:text-slate-300 px-1">
              Đang chọn:{' '}
              <strong className="text-slate-900 dark:text-white">{activeInfo.name}</strong>
              {activeInfo.costE > 0 && (
                <span className="text-xs font-mono-tabular text-teal-700 dark:text-teal-400 ml-1">
                  ({activeInfo.costL} bước dựng · {activeInfo.costE} phép dựng cơ bản)
                </span>
              )}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[15px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              title="Hoàn tác bước vừa dựng (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
              Hoàn tác
            </button>
            <button
              type="button"
              onClick={onRedo}
              disabled={!canRedo}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[15px] text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40"
              title="Làm lại bước vừa hoàn tác (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            {selectedObjectId && (
              <button
                type="button"
                onClick={onDeleteSelected}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[15px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                title="Xóa đối tượng đang chọn cùng các đối tượng phụ thuộc"
              >
                <Trash2 className="w-4 h-4" />
                Xóa
              </button>
            )}
            <button
              type="button"
              onClick={onClearUserObjects}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[15px] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Xóa toàn bộ các nét đã dựng để làm lại từ đầu"
            >
              <RotateCcw className="w-4 h-4" />
              Làm lại
            </button>
          </div>
        </div>

        {/* Tool buttons grouped clearly by Cơ bản vs Hỗ trợ */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {visibleGroups.map((group) => (
            <div key={group.key} className="flex items-center gap-1 flex-wrap">
              <span
                className={`text-xs font-semibold mr-1 ${
                  group.tier === 'basic'
                    ? 'text-teal-700 dark:text-teal-400'
                    : 'text-sky-700 dark:text-sky-400'
                }`}
              >
                {group.label}:
              </span>
              {group.tools.map((tid) => {
                const info = TOOL_CATALOG[tid];
                const allowed = isToolAllowed(tid);
                const selected = activeTool === tid;
                return (
                  <button
                    key={tid}
                    type="button"
                    disabled={!allowed}
                    onClick={() => allowed && onSelectTool(tid)}
                    title={buildToolTooltip(tid, allowed)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                      compact ? 'text-sm' : 'text-[15px]'
                    } ${
                      selected
                        ? 'bg-teal-700 text-white shadow-sm'
                        : allowed
                        ? 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 hover:text-teal-800 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-700'
                        : 'bg-slate-100/70 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border border-dashed border-slate-200 dark:border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    {allowed ? renderToolIcon(tid) : <Lock className="w-3.5 h-3.5" />}
                    <span className="whitespace-nowrap">{info.name}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Active tool inline step-order guide */}
        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Info className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
          <span>
            <strong className="text-slate-800 dark:text-slate-100">Cách thao tác:</strong>{' '}
            {activeInfo.promptSteps.join(' → ')}
          </span>
        </div>
      </div>

      {/* Mobile bottom floating bar + expandable drawer (>=44px touch targets) */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-t border-slate-200 dark:border-slate-700 shadow-lg no-print">
        {mobileDrawerOpen && (
          <div className="max-h-[54vh] overflow-y-auto px-3 py-3 border-b border-slate-200 dark:border-slate-700 space-y-3">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-700 dark:text-slate-200">
              <strong>{activeInfo.name}:</strong> {activeInfo.promptSteps.join(' → ')}
            </div>
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={onToggleInputMode}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              >
                <Compass className="w-4 h-4" />
                {inputMode === 'virtual_tools' ? 'Thước & Compa ảo' : 'Vẽ nhanh'}
              </button>
              <button
                type="button"
                onClick={onClearUserObjects}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-rose-600 bg-rose-50 dark:bg-rose-950/30"
              >
                <RotateCcw className="w-4 h-4" />
                Làm lại
              </button>
            </div>
            {visibleGroups.map((group) => (
              <div key={group.key} className="space-y-1.5">
                <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {group.label}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {group.tools.map((tid) => {
                    const info = TOOL_CATALOG[tid];
                    const allowed = isToolAllowed(tid);
                    const selected = activeTool === tid;
                    return (
                      <button
                        key={tid}
                        type="button"
                        disabled={!allowed}
                        onClick={() => {
                          if (!allowed) return;
                          onSelectTool(tid);
                          setMobileDrawerOpen(false);
                        }}
                        className={`min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                          selected
                            ? 'bg-teal-700 text-white'
                            : allowed
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                            : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {allowed ? renderToolIcon(tid) : <Lock className="w-4 h-4" />}
                        <span className="truncate">{info.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-1 px-2 py-1.5 overflow-x-auto">
          <div className="flex items-center gap-1">
            {quickBarTools.map((tid) => {
              const allowed = isToolAllowed(tid);
              const selected = activeTool === tid;
              return (
                <button
                  key={tid}
                  type="button"
                  disabled={!allowed}
                  onClick={() => allowed && onSelectTool(tid)}
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg ${
                    selected
                      ? 'bg-teal-700 text-white'
                      : allowed
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                      : 'text-slate-400 opacity-50'
                  }`}
                  aria-label={TOOL_CATALOG[tid].name}
                  title={TOOL_CATALOG[tid].name}
                >
                  {renderToolIcon(tid)}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onUndo}
              disabled={!canUndo}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-40"
              aria-label="Hoàn tác"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMobileDrawerOpen((v) => !v)}
              className="min-h-[44px] px-3 flex items-center gap-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 text-sm font-semibold"
            >
              Công cụ
              {mobileDrawerOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
