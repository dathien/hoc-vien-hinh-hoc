import React, { useEffect, useRef, useState } from 'react';
import {
  Circle,
  Compass,
  Dot,
  FlipHorizontal2,
  MousePointer2,
  PanelLeftClose,
  PanelLeftOpen,
  Pentagon,
  Ruler,
  SlidersHorizontal,
  Spline,
  ChevronRight,
} from 'lucide-react';
import { TOOL_CATALOG } from '../../geometry/tools';
import type { ToolId } from '../../geometry/types';

export interface ToolGroup2DDef {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  tools: ToolId[];
}

export const LAB_2D_GROUPS: ToolGroup2DDef[] = [
  {
    id: 'select',
    label: '1. Chọn',
    shortLabel: 'Chọn',
    icon: MousePointer2,
    tools: ['select', 'pan'],
  },
  {
    id: 'point',
    label: '2. Điểm',
    shortLabel: 'Điểm',
    icon: Dot,
    tools: ['point', 'point_on_object', 'intersect', 'midpoint'],
  },
  {
    id: 'ruler',
    label: '3. Thước thẳng',
    shortLabel: 'Thước thẳng',
    icon: Spline,
    tools: ['segment', 'line', 'ray', 'polyline'],
  },
  {
    id: 'compass',
    label: '4. Compa',
    shortLabel: 'Compa',
    icon: Compass,
    tools: ['circle_cp', 'circle_cr', 'compass', 'arc'],
  },
  {
    id: 'construct',
    label: '5. Dựng hình',
    shortLabel: 'Dựng hình',
    icon: SlidersHorizontal,
    tools: [
      'perp_bisector',
      'perpendicular',
      'parallel',
      'angle_bisector',
      'median',
      'altitude',
      'tangent',
      'projection',
    ],
  },
  {
    id: 'transform',
    label: '6. Biến hình',
    shortLabel: 'Biến hình',
    icon: FlipHorizontal2,
    tools: ['reflect_line', 'reflect_point', 'translate', 'rotate', 'homothety'],
  },
  {
    id: 'shapes',
    label: '7. Đa giác và đường tròn',
    shortLabel: 'Đa giác',
    icon: Pentagon,
    tools: ['triangle', 'quadrilateral', 'polygon', 'regular_polygon', 'circumcircle', 'incircle'],
  },
  {
    id: 'measure',
    label: '8. Đo lường',
    shortLabel: 'Đo lường',
    icon: Ruler,
    tools: ['measure_length', 'measure_angle', 'measure_area'],
  },
];

const QUICK_TOOLS_2D: Array<{
  id: ToolId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'select', label: 'Chọn', icon: MousePointer2 },
  { id: 'point', label: 'Điểm', icon: Dot },
  { id: 'segment', label: 'Đoạn thẳng', icon: Spline },
  { id: 'circle_cp', label: 'Đường tròn', icon: Circle },
];

interface VerticalToolSidebar2DProps {
  activeTool: ToolId;
  onSelectTool: (tool: ToolId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const VerticalToolSidebar2D: React.FC<VerticalToolSidebar2DProps> = ({
  activeTool,
  onSelectTool,
  collapsed,
  onToggleCollapse,
}) => {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close flyout on outside click or Escape
  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpenGroupId(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenGroupId(null);
    };
    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  const openGroup = LAB_2D_GROUPS.find((g) => g.id === openGroupId) ?? null;

  return (
    <div ref={rootRef} className="relative flex shrink-0 z-20">
      <aside
        className={`flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-150 ${
          collapsed ? 'w-[60px]' : 'w-[228px]'
        }`}
        aria-label="Thanh công cụ dựng hình 2D"
      >
        {/* Header & Collapse Toggle */}
        <div className="flex items-center justify-between px-2.5 py-2 border-b border-slate-200 dark:border-slate-800">
          {!collapsed && (
            <span className="text-[13px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 truncate">
              Công cụ 2D
            </span>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-2 min-h-[40px] min-w-[40px] rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center mx-auto sm:mx-0"
            title={collapsed ? 'Mở rộng thanh công cụ' : 'Thu gọn chỉ hiện biểu tượng'}
            aria-label={collapsed ? 'Mở rộng thanh công cụ' : 'Thu gọn thanh công cụ'}
          >
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick-Access 4 Tools */}
        <div className="p-2 border-b border-slate-200 dark:border-slate-800">
          {!collapsed && (
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1.5 mb-1.5">
              Truy cập nhanh
            </div>
          )}
          <div className={collapsed ? 'flex flex-col gap-1' : 'grid grid-cols-2 gap-1.5'}>
            {QUICK_TOOLS_2D.map((qt) => {
              const Icon = qt.icon;
              const isActive = activeTool === qt.id;
              return (
                <button
                  key={qt.id}
                  type="button"
                  onClick={() => {
                    onSelectTool(qt.id);
                    setOpenGroupId(null);
                  }}
                  title={TOOL_CATALOG[qt.id].name}
                  className={`flex items-center ${
                    collapsed ? 'justify-center px-0' : 'justify-start gap-1.5 px-2.5'
                  } min-h-[42px] rounded-xl text-[14px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/70 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{qt.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* 8 Grouped Tool Categories */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {!collapsed && (
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1.5 mb-1">
              8 Nhóm công cụ
            </div>
          )}
          {LAB_2D_GROUPS.map((grp) => {
            const Icon = grp.icon;
            const hasActive = grp.tools.includes(activeTool);
            const isOpen = openGroupId === grp.id;

            return (
              <button
                key={grp.id}
                type="button"
                onClick={() => setOpenGroupId((cur) => (cur === grp.id ? null : grp.id))}
                title={grp.label}
                className={`w-full flex items-center ${
                  collapsed ? 'justify-center px-0' : 'justify-between px-2.5'
                } min-h-[42px] rounded-xl text-[15px] font-medium transition-colors ${
                  isOpen
                    ? 'bg-teal-50 dark:bg-teal-950/50 text-teal-800 dark:text-teal-200 ring-1 ring-teal-500/40'
                    : hasActive
                    ? 'bg-slate-100 dark:bg-slate-800 text-teal-800 dark:text-teal-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${hasActive || isOpen ? 'text-teal-700 dark:text-teal-400' : 'text-slate-500'}`} />
                  {!collapsed && <span className="truncate">{grp.shortLabel}</span>}
                </span>
                {!collapsed && (
                  <ChevronRight
                    className={`w-4 h-4 shrink-0 text-slate-400 transition-transform ${
                      isOpen ? 'rotate-90 text-teal-700' : ''
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Single-group flyout panel beside the sidebar (auto-closes on tool select) */}
      {openGroup && (
        <div
          className="absolute top-2 left-full ml-2 w-[264px] max-h-[calc(100%-16px)] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2.5 space-y-1.5 z-30"
          role="menu"
          aria-label={openGroup.label}
        >
          <div className="px-2 py-1 text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-400 border-b border-slate-100 dark:border-slate-800">
            {openGroup.label}
          </div>
          {openGroup.tools.map((tid) => {
            const def = TOOL_CATALOG[tid];
            const isActive = activeTool === tid;
            return (
              <button
                key={tid}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelectTool(tid);
                  setOpenGroupId(null);
                }}
                className={`w-full text-left px-3 py-2.5 min-h-[44px] rounded-xl transition-colors ${
                  isActive
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="text-[15px] font-semibold leading-snug">{def.name}</div>
                <div
                  className={`text-xs mt-0.5 line-clamp-1 ${
                    isActive ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {def.promptSteps[0]}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
