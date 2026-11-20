import React, { useEffect, useRef, useState } from 'react';
import {
  Axis3d,
  Box,
  ChevronRight,
  Compass,
  Dot,
  GitBranch,
  Layers,
  MousePointer2,
  PanelLeftClose,
  PanelLeftOpen,
  Ruler,
  Spline,
} from 'lucide-react';
import { getTool3DDef } from '../../geometry3d/tools3d';
import type { Tool3DId, WorkingPlaneKind } from '../../geometry3d/types3d';

interface ToolGroup3DDef {
  id: string;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  tools: Tool3DId[];
}

export const LAB_3D_GROUPS: ToolGroup3DDef[] = [
  {
    id: 'select',
    label: '1. Chọn và góc nhìn',
    shortLabel: 'Chọn & Góc nhìn',
    icon: MousePointer2,
    tools: ['select', 'pan_orbit'],
  },
  {
    id: 'point',
    label: '2. Điểm',
    shortLabel: 'Điểm',
    icon: Dot,
    tools: [
      'point_free',
      'point_coords',
      'point_on_line',
      'point_on_segment',
      'point_on_plane',
      'midpoint',
      'intersect_ll',
      'intersect_lp',
      'foot_line',
      'foot_plane',
      'reflect_point',
      'reflect_plane',
    ],
  },
  {
    id: 'line',
    label: '3. Đường',
    shortLabel: 'Đường',
    icon: Spline,
    tools: [
      'segment',
      'line',
      'ray',
      'parallel_line',
      'perp_line_plane',
      'intersect_pp',
      'common_perp',
      'circle_plane',
    ],
  },
  {
    id: 'plane',
    label: '4. Mặt phẳng',
    shortLabel: 'Mặt phẳng',
    icon: Layers,
    tools: [
      'plane_3pts',
      'plane_line_pt',
      'plane_2lines_inter',
      'plane_2lines_para',
      'plane_parallel',
      'plane_perp_line',
      'plane_normal',
      'plane_equation',
    ],
  },
  {
    id: 'relation',
    label: '5. Quan hệ hình học',
    shortLabel: 'Quan hệ',
    icon: GitBranch,
    tools: ['analyze_relation', 'transform_3d', 'formula_note'],
  },
  {
    id: 'solid',
    label: '6. Hình khối',
    shortLabel: 'Hình khối',
    icon: Box,
    tools: ['solid_library', 'polygon'],
  },
  {
    id: 'section_measure',
    label: '7. Thiết diện và đo lường',
    shortLabel: 'Thiết diện & Đo',
    icon: Ruler,
    tools: [
      'cross_section',
      'measure_length',
      'measure_angle_vec',
      'measure_angle_ll',
      'measure_angle_lp',
      'measure_angle_pp',
      'measure_dihedral',
      'measure_dist_pl',
      'measure_dist_pplane',
      'measure_dist_skew',
      'measure_dist_planes',
    ],
  },
  {
    id: 'vector_oxyz',
    label: '8. Vectơ và tọa độ',
    shortLabel: 'Vectơ & Oxyz',
    icon: Axis3d,
    tools: ['vector', 'line_dir_vector', 'point_coords', 'plane_normal', 'plane_equation'],
  },
];

const QUICK_TOOLS_3D: Array<{
  id: Tool3DId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'select', label: 'Chọn', icon: MousePointer2 },
  { id: 'point_free', label: 'Điểm', icon: Dot },
  { id: 'segment', label: 'Đoạn thẳng', icon: Spline },
  { id: 'solid_library', label: 'Hình khối', icon: Box },
];

interface VerticalToolSidebar3DProps {
  activeTool: Tool3DId;
  onSelectTool: (tool: Tool3DId) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  workingPlaneKind: WorkingPlaneKind;
  workingPlaneOffset: number;
  onChangeWorkingPlane: (kind: WorkingPlaneKind) => void;
  onChangeWorkingPlaneOffset: (offset: number) => void;
}

export const VerticalToolSidebar3D: React.FC<VerticalToolSidebar3DProps> = ({
  activeTool,
  onSelectTool,
  collapsed,
  onToggleCollapse,
  workingPlaneKind,
  workingPlaneOffset,
  onChangeWorkingPlane,
  onChangeWorkingPlaneOffset,
}) => {
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

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

  const openGroup = LAB_3D_GROUPS.find((g) => g.id === openGroupId) ?? null;

  return (
    <div ref={rootRef} className="relative flex shrink-0 z-20">
      <aside
        className={`flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-150 ${
          collapsed ? 'w-[60px]' : 'w-[236px]'
        }`}
        aria-label="Thanh công cụ dựng hình 3D"
      >
        {/* Header & Collapse Toggle */}
        <div className="flex items-center justify-between px-2.5 py-2 border-b border-slate-200 dark:border-slate-800">
          {!collapsed && (
            <span className="text-[13px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 truncate flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              Công cụ 3D
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
            {QUICK_TOOLS_3D.map((qt) => {
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
                  title={getTool3DDef(qt.id).name}
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
          {LAB_3D_GROUPS.map((grp) => {
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
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      hasActive || isOpen ? 'text-teal-700 dark:text-teal-400' : 'text-slate-500'
                    }`}
                  />
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

          {/* Compact Working Plane Selector (only when expanded) */}
          {!collapsed && (
            <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 px-1 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-500">
                <span>Mặt phẳng vẽ</span>
                <span className="font-mono text-teal-700 dark:text-teal-400">
                  {workingPlaneKind}
                  {workingPlaneOffset !== 0
                    ? ` (${workingPlaneOffset > 0 ? '+' : ''}${workingPlaneOffset})`
                    : ''}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {(['Oxy', 'Oxz', 'Oyz'] as WorkingPlaneKind[]).map((wp) => (
                  <button
                    key={wp}
                    type="button"
                    onClick={() => onChangeWorkingPlane(wp)}
                    className={`py-1.5 rounded-lg text-xs font-semibold ${
                      workingPlaneKind === wp
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {wp}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={-5}
                max={5}
                step={0.5}
                value={workingPlaneOffset}
                onChange={(e) => onChangeWorkingPlaneOffset(Number(e.target.value))}
                className="w-full accent-teal-700"
                aria-label="Cao độ mặt phẳng làm việc"
              />
            </div>
          )}
        </div>
      </aside>

      {/* Single-group flyout panel beside the sidebar (auto-closes upon tool click) */}
      {openGroup && (
        <div
          className="absolute top-2 left-full ml-2 w-[280px] max-h-[calc(100%-16px)] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl p-2.5 space-y-1.5 z-30"
          role="menu"
          aria-label={openGroup.label}
        >
          <div className="px-2 py-1 text-xs font-bold uppercase tracking-wide text-teal-700 dark:text-teal-400 border-b border-slate-100 dark:border-slate-800">
            {openGroup.label}
          </div>
          {openGroup.tools.map((tid) => {
            const def = getTool3DDef(tid);
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
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[14px] font-semibold leading-snug">{def.name}</span>
                  {def.isExtended && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                      }`}
                    >
                      Mở rộng
                    </span>
                  )}
                </div>
                <div
                  className={`text-xs mt-0.5 line-clamp-1 ${
                    isActive ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {def.actionPrompt}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
