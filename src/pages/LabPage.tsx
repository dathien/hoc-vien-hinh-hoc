import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Box,
  Check,
  Compass,
  Copy,
  FilePlus2,
  FolderOpen,
  Layers,
  LayoutGrid,
  Maximize2,
  Minimize2,
  PanelRightOpen,
  Pencil,
  Redo2,
  Save,
  Search,
  Sliders,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import { GeometryCanvas } from '../components/geometry/GeometryCanvas';
import { ObjectPropertiesPanel2D } from '../components/geometry/ObjectPropertiesPanel2D';
import { SmartInstructionBar } from '../components/geometry/SmartInstructionBar';
import { VerticalToolSidebar2D } from '../components/geometry/VerticalToolSidebar2D';
import { LiveGeo3DPreview } from '../components/geometry3d/LiveGeo3DPreview';
import {
  cloneScene,
  createEmptyScene,
  deleteObjectWithDependents,
  moveFreePoint,
  recomputeScene,
  renameGeoObject,
} from '../geometry/engine';
import { getPendingDisplayNames2D } from '../geometry/naming2d';
import { TEMPLATES_2D } from '../geometry/templates2d';
import { TOOL_CATALOG } from '../geometry/tools';
import type { GeoObject, GeoScene, ToolId } from '../geometry/types';
import {
  TEMPLATE_GROUPS_3D,
  TEMPLATES_3D,
  type Template3DGroup,
} from '../geometry3d/templates3d';
import { cloneScene3D } from '../geometry3d/engine3d';
import { type LabSubView, useApp } from '../store/AppContext';

const Lab3DWorkspace = lazy(() => import('./Lab3DWorkspace'));

/** Compact vector thumbnail for any 2D GeoScene (used in Templates & My Drawings) */
const SceneThumbnail2D: React.FC<{ scene: GeoScene }> = ({ scene }) => {
  const pts = scene.order
    .map((id) => scene.objects[id])
    .filter((o): o is GeoObject => Boolean(o && o.valid && o.style.visible));

  let minX = -140,
    maxX = 140,
    minY = -110,
    maxY = 110;
  const xs: number[] = [];
  const ys: number[] = [];
  for (const o of pts) {
    if (o.kind === 'point') {
      xs.push(o.x);
      ys.push(o.y);
    } else if (o.kind === 'circle') {
      xs.push(o.center.x - o.radius, o.center.x + o.radius);
      ys.push(o.center.y - o.radius, o.center.y + o.radius);
    }
  }
  if (xs.length >= 2) {
    minX = Math.min(...xs) - 24;
    maxX = Math.max(...xs) + 24;
    minY = Math.min(...ys) - 24;
    maxY = Math.max(...ys) + 24;
  }
  const w = Math.max(60, maxX - minX);
  const h = Math.max(40, maxY - minY);
  const scale = Math.min(260 / w, 130 / h);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const sx = (x: number) => 140 + (x - cx) * scale;
  const sy = (y: number) => 75 + (y - cy) * scale;

  return (
    <svg viewBox="0 0 280 150" className="w-full h-full">
      {pts.map((o) => {
        if (o.kind === 'polygon' && o.vertices.length >= 3) {
          return (
            <polygon
              key={o.id}
              points={o.vertices.map((v) => `${sx(v.x).toFixed(1)},${sy(v.y).toFixed(1)}`).join(' ')}
              fill={o.style.fillColor ?? o.style.color}
              fillOpacity={o.style.fillOpacity ?? 0.12}
              stroke={o.style.color}
              strokeWidth={1.6}
            />
          );
        }
        if (o.kind === 'circle') {
          const r = o.radius * scale;
          if (!Number.isFinite(r) || r <= 0 || r > 500) return null;
          return (
            <circle
              key={o.id}
              cx={sx(o.center.x)}
              cy={sy(o.center.y)}
              r={r}
              fill="none"
              stroke={o.style.color}
              strokeWidth={1.4}
              strokeDasharray={o.style.dash === 'dashed' ? '4 3' : undefined}
            />
          );
        }
        if (o.kind === 'segment') {
          return (
            <line
              key={o.id}
              x1={sx(o.p1.x)}
              y1={sy(o.p1.y)}
              x2={sx(o.p2.x)}
              y2={sy(o.p2.y)}
              stroke={o.style.color}
              strokeWidth={1.6}
              strokeDasharray={o.style.dash === 'dashed' ? '4 3' : undefined}
            />
          );
        }
        if (o.kind === 'line' || o.kind === 'ray') {
          const dx = o.p2.x - o.p1.x;
          const dy = o.p2.y - o.p1.y;
          const len = Math.hypot(dx, dy) || 1;
          const ux = dx / len;
          const uy = dy / len;
          const x1 = o.kind === 'ray' ? o.p1.x : o.p1.x - ux * 400;
          const y1 = o.kind === 'ray' ? o.p1.y : o.p1.y - uy * 400;
          const x2 = o.p1.x + ux * 400;
          const y2 = o.p1.y + uy * 400;
          return (
            <line
              key={o.id}
              x1={sx(x1)}
              y1={sy(y1)}
              x2={sx(x2)}
              y2={sy(y2)}
              stroke={o.style.color}
              strokeWidth={1.4}
              strokeDasharray={o.style.dash === 'dashed' ? '4 3' : undefined}
              opacity={0.85}
            />
          );
        }
        if (o.kind === 'point') {
          return (
            <circle
              key={o.id}
              cx={sx(o.x)}
              cy={sy(o.y)}
              r={3.2}
              fill={o.style.color}
              stroke="#FFFFFF"
              strokeWidth={1}
            />
          );
        }
        return null;
      })}
    </svg>
  );
};

export const LabPage: React.FC = () => {
  const {
    setPage,
    settings,
    labSubView,
    setLabSubView,
    drawings,
    saveDrawing,
    deleteDrawing,
    drawings3D,
    saveDrawing3D,
    deleteDrawing3D,
    labInitialScene,
    labInitialTitle,
    clearLabInitialScene,
    lab3DInitialScene,
    lab3DInitialTitle,
    openLab3DWithScene,
    clearLab3DInitialScene,
    logStudyEvent,
  } = useApp();

  // 2D Studio State (opens clean blank canvas by default)
  const workspace2DRef = useRef<HTMLDivElement | null>(null);
  const [scene, setScene] = useState<GeoScene>(() => labInitialScene ?? createEmptyScene());
  const [history, setHistory] = useState<GeoScene[]>([]);
  const [future, setFuture] = useState<GeoScene[]>([]);
  const [activeTool, setActiveTool] = useState<ToolId>('select');
  const [pending2DIds, setPending2DIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawingId, setDrawingId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>(labInitialTitle ?? 'Bản vẽ 2D mới');
  const [isDirty, setIsDirty] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);

  // Studio layout toggles
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [isFullscreen2D, setIsFullscreen2D] = useState(false);

  // Contextual tool params
  const [fixedRadius, setFixedRadius] = useState(80);
  const [rotateAngleDeg, setRotateAngleDeg] = useState(60);
  const [homothetyFactor, setHomothetyFactor] = useState(2);
  const [regularPolygonSides, setRegularPolygonSides] = useState(5);

  // Unified Templates Library filters
  const [tplDimFilter, setTplDimFilter] = useState<'all' | '2d' | '3d'>('all');
  const [tplGroup, setTplGroup] = useState<Template3DGroup | 'all'>('all');
  const [tplQuery, setTplQuery] = useState('');

  // Unified My Drawings filters & inline actions
  const [savedFilter, setSavedFilter] = useState<'all' | '2d' | '3d'>('all');
  const [savedQuery, setSavedQuery] = useState('');
  const [renamingSavedId, setRenamingSavedId] = useState<string | null>(null);
  const [renameSavedDraft, setRenameSavedDraft] = useState('');
  const [confirmDeleteSavedId, setConfirmDeleteSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (labInitialScene) {
      setScene(labInitialScene);
      setHistory([]);
      setFuture([]);
      setTitle(labInitialTitle ?? 'Bản vẽ 2D');
      setDrawingId(null);
      setIsDirty(false);
      setLabSubView('2d');
      clearLabInitialScene();
    }
  }, [labInitialScene, labInitialTitle, clearLabInitialScene, setLabSubView]);

  useEffect(() => {
    const onFs = () => setIsFullscreen2D(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const handleSceneChange = useCallback(
    (next: GeoScene, recordHistory = true) => {
      if (recordHistory) {
        setHistory((prev) => [...prev.slice(-39), scene]);
        setFuture([]);
      }
      setScene(next);
      setIsDirty(true);
    },
    [scene]
  );

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture((f) => [scene, ...f]);
    setHistory((h) => h.slice(0, -1));
    setScene(prev);
    setIsDirty(true);
  }, [history, scene]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((h) => [...h, scene]);
    setFuture((f) => f.slice(1));
    setScene(next);
    setIsDirty(true);
  }, [future, scene]);

  const handleDeleteObject = useCallback(
    (id: string) => {
      handleSceneChange(deleteObjectWithDependents(scene, id), true);
      if (selectedId === id) setSelectedId(null);
    },
    [handleSceneChange, scene, selectedId]
  );

  const handleSave = useCallback(async () => {
    const now = new Date().toISOString();
    const id = drawingId ?? `draw_${Date.now()}`;
    const cleanTitle = title.trim() || 'Bản vẽ 2D mới';
    await saveDrawing({
      id,
      title: cleanTitle,
      scene,
      createdAt: drawingId
        ? drawings.find((d) => d.id === drawingId)?.createdAt ?? now
        : now,
      updatedAt: now,
    });
    setDrawingId(id);
    setIsDirty(false);
    setSaveFeedback('Đã lưu bản vẽ');
    await logStudyEvent({
      type: 'lab',
      refId: id,
      title: cleanTitle,
      detail: `Lưu bản vẽ 2D (${scene.order.length} đối tượng)`,
    });
    window.setTimeout(() => setSaveFeedback(null), 2400);
  }, [drawingId, title, saveDrawing, scene, drawings, logStudyEvent]);

  const createBlank2DDrawing = () => {
    setScene(createEmptyScene());
    setHistory([]);
    setFuture([]);
    setTitle('Bản vẽ 2D mới');
    setDrawingId(null);
    setSelectedId(null);
    setActiveTool('select');
    setIsDirty(false);
    setConfirmNewOpen(false);
  };

  const requestNew2DDrawing = () => {
    if (isDirty && scene.order.length > 0) {
      setConfirmNewOpen(true);
    } else {
      createBlank2DDrawing();
    }
  };

  // Safe keyboard shortcuts in 2D mode (never interfere with text inputs)
  useEffect(() => {
    if (labSubView !== '2d') return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'Escape') {
        setActiveTool('select');
        setConfirmNewOpen(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void handleSave();
      } else if (e.key === 'Delete' && selectedId) {
        e.preventDefault();
        handleDeleteObject(selectedId);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [labSubView, handleUndo, handleRedo, handleSave, selectedId, handleDeleteObject]);

  const toggleFullscreen2D = async () => {
    try {
      if (!document.fullscreenElement && workspace2DRef.current) {
        await workspace2DRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Ignore fullscreen restrictions
    }
  };

  const updateObjectStyle = (id: string, patch: Partial<GeoObject['style']>) => {
    const next = cloneScene(scene);
    const obj = next.objects[id];
    if (!obj) return;
    obj.style = { ...obj.style, ...patch };
    handleSceneChange(next, true);
  };

  const updateObjectLabel = (id: string, newLabel: string) => {
    const next = renameGeoObject(scene, id, newLabel);
    if (next === scene) return;
    handleSceneChange(next, true);
  };

  const updatePointCoords = (id: string, x: number, y: number) => {
    handleSceneChange(moveFreePoint(scene, id, { x, y }), true);
  };

  const updateCircleRadius = (id: string, radius: number) => {
    const next = cloneScene(scene);
    const obj = next.objects[id];
    if (!obj || obj.kind !== 'circle') return;
    obj.params = { ...(obj.params ?? {}), radius };
    handleSceneChange(recomputeScene(next), true);
  };

  const filteredTemplates2D = useMemo(() => {
    if (tplDimFilter === '3d') return [];
    const q = tplQuery.trim().toLowerCase();
    return TEMPLATES_2D.filter(
      (t) =>
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.topic.toLowerCase().includes(q)
    );
  }, [tplDimFilter, tplQuery]);

  const filteredTemplates3D = useMemo(() => {
    if (tplDimFilter === '2d') return [];
    const q = tplQuery.trim().toLowerCase();
    return TEMPLATES_3D.filter((t) => {
      if (tplGroup !== 'all' && t.group !== tplGroup) return false;
      if (q && !t.title.toLowerCase().includes(q) && !t.summary.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [tplDimFilter, tplGroup, tplQuery]);

  const totalTemplatesCount = TEMPLATES_2D.length + TEMPLATES_3D.length;
  const totalSavedCount = drawings.length + drawings3D.length;

  const SUB_TABS: Array<{ id: LabSubView; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'hub', label: 'Không gian 2D & 3D', icon: LayoutGrid },
    { id: '2d', label: 'Dựng hình phẳng 2D', icon: Compass },
    { id: '3d', label: 'Dựng hình không gian 3D', icon: Box },
    { id: 'templates', label: `Thư viện hình mẫu (${totalTemplatesCount})`, icon: Layers },
    { id: 'saved', label: `Bản vẽ của tôi (${totalSavedCount})`, icon: FolderOpen },
  ];

  const active2DToolInfo = TOOL_CATALOG[activeTool];
  const active2DInstruction =
    active2DToolInfo.promptSteps[
      Math.min(pending2DIds.length, active2DToolInfo.promptSteps.length - 1)
    ] ?? '';

  return (
    <div
      className={`${
        labSubView === '2d' || labSubView === '3d' ? 'max-w-[1640px]' : 'max-w-7xl'
      } mx-auto px-3 sm:px-5 py-4 pb-20 md:pb-8 space-y-3.5`}
    >
      {/* Compact Single-Row Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = labSubView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLabSubView(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 min-h-[40px] rounded-xl text-[15px] font-semibold transition-colors ${
                active
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* VIEW 0: LAB HUB */}
      {labSubView === 'hub' && (
        <div className="space-y-8 py-2">
          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Phòng thực hành Hình học Động 2D &amp; 3D
            </h1>
            <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Chọn không gian dựng hình phù hợp cho bài giảng và thực hành: dựng hình phẳng bằng thước &amp; compa hoặc dựng hình không gian 3D, cắt thiết diện, phân tích Oxyz và trình chiếu lớp học.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: 2D Dynamic Geometry */}
            <div className="rounded-3xl border border-teal-200 dark:border-teal-800/70 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between gap-5 hover:border-teal-500 transition-all">
              <div className="space-y-4">
                <div className="h-52 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-3 flex items-center justify-center">
                  <svg viewBox="0 0 360 210" className="w-full h-full" role="img" aria-label="Minh họa dựng hình phẳng 2D">
                    <circle cx="180" cy="112" r="76" fill="none" stroke="#0284C7" strokeWidth="1.6" strokeDasharray="5 4" opacity="0.7" />
                    <polygon points="108,162 256,162 162,38" fill="rgba(15,118,110,0.10)" stroke="#0F766E" strokeWidth="2.4" />
                    <line x1="88" y1="126" x2="274" y2="86" stroke="#D97706" strokeWidth="2.2" />
                    <circle cx="180" cy="112" r="5" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.8" />
                    <circle cx="175" cy="120" r="5" fill="#0F766E" stroke="#FFFFFF" strokeWidth="1.8" />
                    <circle cx="162" cy="137" r="5" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="1.8" />
                    <text x="95" y="176" fontSize="13" fontWeight="700" fill="#0F172A">B</text>
                    <text x="262" y="176" fontSize="13" fontWeight="700" fill="#0F172A">C</text>
                    <text x="158" y="30" fontSize="13" fontWeight="700" fill="#0F172A">A</text>
                    <text x="242" y="80" fontSize="12" fontWeight="700" fill="#D97706">Đường thẳng Euler</text>
                  </svg>
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                    Hình học phẳng 2D · Thước &amp; Compa động
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Dựng hình phẳng 2D
                  </h2>
                  <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Giao diện 4 vùng gọn gàng với 8 nhóm công cụ dọc, bảng vẽ trắng rộng rãi, thanh hướng dẫn một dòng và bảng thuộc tính theo ngữ cảnh.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLabSubView('2d')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-700 text-white text-[15px] font-semibold hover:bg-teal-800"
                >
                  Mở không gian 2D
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTplDimFilter('2d');
                    setLabSubView('templates');
                  }}
                  className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-[15px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Xem hình mẫu 2D
                </button>
              </div>
            </div>

            {/* Card 2: 3D Dynamic Geometry */}
            <div className="rounded-3xl border border-sky-200 dark:border-sky-800/70 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between gap-5 hover:border-sky-500 transition-all">
              <div className="space-y-4">
                <div className="h-52 rounded-2xl border border-sky-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 p-2 flex items-center justify-center">
                  <LiveGeo3DPreview
                    variant="lab_cube_section"
                    width={360}
                    height={210}
                    animate={true}
                    reducedMotion={settings.reducedMotion}
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400">
                    Hình học không gian 3D &amp; Oxyz · Toán 11 &amp; 12
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                    Dựng hình không gian 3D
                  </h2>
                  <p className="text-[15px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    Thư viện 18 hình khối, 4 chế độ hiển thị (nét khuất chuẩn SGK, hình khối, khung dây, Oxyz), thiết diện động, đo góc – khoảng cách và trình chiếu lớp học.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setLabSubView('3d')}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 text-white text-[15px] font-semibold hover:bg-sky-700"
                >
                  Mở không gian 3D
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTplDimFilter('3d');
                    setLabSubView('templates');
                  }}
                  className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-[15px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Khám phá 40 hình mẫu 3D
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: REDESIGNED 4-ZONE 2D STUDIO */}
      {labSubView === '2d' && (
        <div
          ref={workspace2DRef}
          className={`flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden ${
            isFullscreen2D ? 'h-screen rounded-none border-0' : 'h-[calc(100vh-158px)] min-h-[680px]'
          }`}
        >
          {/* ZONE 1: Compact Top Drawing Manager Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-center gap-2 min-w-[200px] flex-1 max-w-md">
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setIsDirty(true);
                }}
                aria-label="Tên bản vẽ 2D"
                className="w-full rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-teal-600 focus:bg-slate-50 dark:focus:bg-slate-800 px-2.5 py-1.5 text-[16px] font-bold text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTplDimFilter('2d');
                  setLabSubView('templates');
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Layers className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                Mở mẫu
              </button>
              <button
                type="button"
                onClick={requestNew2DDrawing}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <FilePlus2 className="w-4 h-4" />
                Bản vẽ mới
              </button>

              <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 hidden sm:block" />

              <button
                type="button"
                onClick={handleUndo}
                disabled={history.length === 0}
                className="p-2 min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-35 flex items-center justify-center"
                title="Hoàn tác (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                disabled={future.length === 0}
                className="p-2 min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-35 flex items-center justify-center"
                title="Làm lại (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => void toggleFullscreen2D()}
                className="p-2 min-h-[40px] min-w-[40px] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center"
                title={isFullscreen2D ? 'Thoát toàn màn hình (Esc)' : 'Toàn màn hình'}
              >
                {isFullscreen2D ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              {!rightPanelOpen && (
                <button
                  type="button"
                  onClick={() => setRightPanelOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                  title="Hiện bảng Đối tượng & Thuộc tính"
                >
                  <PanelRightOpen className="w-4 h-4" />
                  <span className="hidden md:inline">Thuộc tính</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => void handleSave()}
                className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 shadow-xs"
                title="Lưu bản vẽ (Ctrl+S)"
              >
                <Save className="w-4 h-4" />
                {saveFeedback ?? 'Lưu bản vẽ'}
              </button>
            </div>
          </div>

          {/* Unsaved Changes Inline Confirmation Bar */}
          {confirmNewOpen && (
            <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="font-medium text-amber-950 dark:text-amber-100">
                Bản vẽ hiện tại có thay đổi chưa lưu. Bạn muốn lưu trước khi tạo bản vẽ trống mới không?
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmNewOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={createBlank2DDrawing}
                  className="px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100"
                >
                  Không lưu, tạo mới
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleSave();
                    createBlank2DDrawing();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800"
                >
                  Lưu &amp; Tạo mới
                </button>
              </div>
            </div>
          )}

          {/* ZONES 2, 3, 4: Left Vertical Sidebar + Center White Canvas + Right Properties Panel */}
          <div className="flex-1 flex min-h-0 overflow-hidden relative">
            {/* ZONE 2: Left Vertical 8-Group Toolbar */}
            <VerticalToolSidebar2D
              activeTool={activeTool}
              onSelectTool={setActiveTool}
              collapsed={leftCollapsed}
              onToggleCollapse={() => setLeftCollapsed((v) => !v)}
            />

            {/* ZONE 3: Center Canvas + Smart Single-Line Instruction Bar */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
              <SmartInstructionBar
                toolName={active2DToolInfo.name}
                instruction={active2DInstruction}
                selectedLabels={getPendingDisplayNames2D(scene, pending2DIds)}
                canCancel={activeTool !== 'select' || pending2DIds.length > 0}
                onCancel={() => setActiveTool('select')}
              />

              {/* Compact contextual tool parameter bar ONLY when active tool needs numeric input */}
              {(activeTool === 'circle_cr' ||
                activeTool === 'rotate' ||
                activeTool === 'homothety' ||
                activeTool === 'regular_polygon') && (
                <div className="flex flex-wrap items-center gap-4 border-b border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm">
                  <div className="flex items-center gap-1.5 font-semibold text-sky-900 dark:text-sky-200">
                    <Sliders className="w-4 h-4" />
                    Tham số:
                  </div>
                  {activeTool === 'circle_cr' && (
                    <label className="flex items-center gap-2">
                      <span>Bán kính R:</span>
                      <input
                        type="number"
                        min={10}
                        max={300}
                        value={fixedRadius}
                        onChange={(e) => setFixedRadius(Math.max(10, Number(e.target.value) || 80))}
                        className="w-20 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 font-mono"
                      />
                    </label>
                  )}
                  {activeTool === 'rotate' && (
                    <label className="flex items-center gap-2">
                      <span>Góc quay (độ):</span>
                      <input
                        type="number"
                        min={-360}
                        max={360}
                        value={rotateAngleDeg}
                        onChange={(e) => setRotateAngleDeg(Number(e.target.value) || 60)}
                        className="w-20 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 font-mono"
                      />
                    </label>
                  )}
                  {activeTool === 'homothety' && (
                    <label className="flex items-center gap-2">
                      <span>Tỉ số vị tự k:</span>
                      <input
                        type="number"
                        step={0.5}
                        value={homothetyFactor}
                        onChange={(e) => setHomothetyFactor(Number(e.target.value) || 2)}
                        className="w-20 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 font-mono"
                      />
                    </label>
                  )}
                  {activeTool === 'regular_polygon' && (
                    <label className="flex items-center gap-2">
                      <span>Số cạnh n (3–16):</span>
                      <input
                        type="number"
                        min={3}
                        max={16}
                        value={regularPolygonSides}
                        onChange={(e) =>
                          setRegularPolygonSides(Math.max(3, Math.min(16, Number(e.target.value) || 5)))
                        }
                        className="w-20 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 font-mono"
                      />
                    </label>
                  )}
                </div>
              )}

              <div className="flex-1 min-h-0">
                <GeometryCanvas
                  scene={scene}
                  onSceneChange={handleSceneChange}
                  activeTool={activeTool}
                  inputMode={settings.inputMode}
                  selectedObjectId={selectedId}
                  onSelectObject={setSelectedId}
                  heightClass="h-full w-full"
                  defaultShowGrid={settings.showGrid}
                  defaultShowAxes={settings.showAxes}
                  defaultShowLabels={settings.showLabels}
                  darkTheme={settings.theme === 'dark'}
                  fixedRadius={fixedRadius}
                  rotateAngleDeg={rotateAngleDeg}
                  homothetyFactor={homothetyFactor}
                  regularPolygonSides={regularPolygonSides}
                  hideBottomGuidance={true}
                  onPendingChange={setPending2DIds}
                />
              </div>
            </div>

            {/* ZONE 4: Collapsible, Hideable, Resizable Right Properties Panel */}
            <ObjectPropertiesPanel2D
              scene={scene}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdateLabel={updateObjectLabel}
              onUpdateStyle={updateObjectStyle}
              onUpdatePointCoords={updatePointCoords}
              onUpdateCircleRadius={updateCircleRadius}
              onDelete={handleDeleteObject}
              open={rightPanelOpen}
              onClose={() => setRightPanelOpen(false)}
            />
          </div>
        </div>
      )}

      {/* VIEW 2: LAZY-LOADED 3D WORKSPACE */}
      {labSubView === '3d' && (
        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center text-[15px] text-slate-600">
              Đang khởi tạo không gian dựng hình 3D WebGL...
            </div>
          }
        >
          <Lab3DWorkspace
            initialScene={lab3DInitialScene}
            initialTitle={lab3DInitialTitle}
            onFallback2D={() => {
              clearLab3DInitialScene();
              setLabSubView('2d');
            }}
            onOpenTemplates={() => {
              setTplDimFilter('3d');
              setLabSubView('templates');
            }}
            onOpenGuide={() => setPage('guide')}
          />
        </Suspense>
      )}

      {/* VIEW 3: UNIFIED TEMPLATES LIBRARY (2D + 40 3D TEMPLATES) */}
      {labSubView === 'templates' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Thư viện Hình mẫu 2D &amp; 3D ({totalTemplatesCount} hình mẫu)
              </h2>
              <p className="text-[15px] text-slate-600 dark:text-slate-300 mt-1">
                Mở trực tiếp bản dựng sống để tương tác, xoay 360°, kéo điểm hoặc chỉnh sửa mà không làm thay đổi hình mẫu gốc.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tplQuery}
                onChange={(e) => setTplQuery(e.target.value)}
                placeholder="Tìm Đường thẳng Euler, hình chóp..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[15px]"
              />
            </div>
          </div>

          {/* 2D / 3D Dimension Filter + 3D Topic Sub-filters */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                { id: 'all', label: `Tất cả (${totalTemplatesCount})` },
                { id: '2d', label: `Hình phẳng 2D (${TEMPLATES_2D.length})` },
                { id: '3d', label: `Không gian 3D (${TEMPLATES_3D.length})` },
              ] as const
            ).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setTplDimFilter(d.id)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold border ${
                  tplDimFilter === d.id
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}

            {tplDimFilter !== '2d' && (
              <>
                <span className="text-slate-300 dark:text-slate-700 mx-1">|</span>
                <button
                  type="button"
                  onClick={() => setTplGroup('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    tplGroup === 'all'
                      ? 'bg-sky-700 text-white border-sky-700'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Mọi chủ đề 3D
                </button>
                {TEMPLATE_GROUPS_3D.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setTplGroup(g.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      tplGroup === g.id
                        ? 'bg-sky-700 text-white border-sky-700'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {g.title}
                  </button>
                ))}
              </>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 2D Templates */}
            {filteredTemplates2D.map((tpl) => {
              const previewScene = tpl.buildScene();
              return (
                <div
                  key={tpl.id}
                  className="rounded-2xl border border-teal-200/80 dark:border-teal-900 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3 hover:border-teal-500 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="h-40 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 overflow-hidden p-2">
                      <SceneThumbnail2D scene={previewScene} />
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-teal-700 dark:text-teal-400">2D · {tpl.curriculumTag}</span>
                      <span className="text-slate-400">{tpl.topic}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {tpl.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {tpl.summary}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setScene(tpl.buildScene());
                      setHistory([]);
                      setFuture([]);
                      setTitle(tpl.title);
                      setDrawingId(null);
                      setSelectedId(null);
                      setIsDirty(false);
                      setLabSubView('2d');
                    }}
                    className="w-full py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 flex items-center justify-center gap-1.5"
                  >
                    Mở trong không gian 2D
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {/* 3D Templates (All 40 preserved) */}
            {filteredTemplates3D.map((tpl) => {
              const previewScene = tpl.buildScene();
              return (
                <div
                  key={tpl.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3 hover:border-sky-500 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="h-40 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950 overflow-hidden">
                      <LiveGeo3DPreview
                        scene={previewScene}
                        width={300}
                        height={170}
                        animate={false}
                        reducedMotion={true}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-sky-700 dark:text-sky-400">3D · {tpl.curriculumTag}</span>
                      <span className="text-slate-400">{previewScene.order.length} đối tượng</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {tpl.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                      {tpl.summary}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openLab3DWithScene(tpl.buildScene(), tpl.title)}
                    className="w-full py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 flex items-center justify-center gap-1.5"
                  >
                    Mở trong không gian 3D
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 4: UNIFIED MY DRAWINGS (2D + 3D) */}
      {labSubView === 'saved' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Bản vẽ của tôi (2D &amp; 3D)
              </h2>
              <p className="text-[15px] text-slate-600 dark:text-slate-300">
                Quản lý tập trung mọi bản vẽ 2D và 3D đã lưu trên thiết bị: mở, đổi tên, nhân bản hoặc xóa an toàn.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['all', '2d', '3d'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSavedFilter(f)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold border ${
                    savedFilter === f
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {f === 'all' ? 'Tất cả' : f === '2d' ? `2D (${drawings.length})` : `3D (${drawings3D.length})`}
                </button>
              ))}
              <input
                type="text"
                value={savedQuery}
                onChange={(e) => setSavedQuery(e.target.value)}
                placeholder="Tìm theo tên bản vẽ..."
                className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              />
            </div>
          </div>

          {totalSavedCount === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center space-y-3">
              <p className="text-[15px] text-slate-500">
                Bạn chưa lưu bản vẽ nào. Hãy mở không gian 2D hoặc 3D, dựng hình và bấm <strong>Lưu bản vẽ</strong>.
              </p>
              <div className="flex justify-center gap-3">
                <button type="button" onClick={() => setLabSubView('2d')} className="px-4 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold">
                  Dựng hình 2D
                </button>
                <button type="button" onClick={() => setLabSubView('3d')} className="px-4 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-semibold">
                  Dựng hình 3D
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(savedFilter === 'all' || savedFilter === '3d') &&
                drawings3D
                  .filter((d) => !savedQuery.trim() || d.title.toLowerCase().includes(savedQuery.toLowerCase()))
                  .map((d) => (
                    <div
                      key={d.id}
                      className="rounded-2xl border border-sky-200 dark:border-sky-800/70 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="h-36 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 overflow-hidden">
                          <LiveGeo3DPreview scene={d.scene} width={280} height={150} animate={false} reducedMotion={true} />
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-400">
                          <span>Bản vẽ 3D</span>
                          <span className="text-slate-400 font-normal">
                            {new Date(d.updatedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {renamingSavedId === d.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={renameSavedDraft}
                              autoFocus
                              onChange={(e) => setRenameSavedDraft(e.target.value)}
                              className="flex-1 px-2 py-1 text-sm rounded-lg border border-sky-500 bg-white dark:bg-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (renameSavedDraft.trim()) {
                                  void saveDrawing3D({
                                    ...d,
                                    title: renameSavedDraft.trim(),
                                    updatedAt: new Date().toISOString(),
                                  });
                                }
                                setRenamingSavedId(null);
                              }}
                              className="p-1.5 rounded-lg bg-teal-700 text-white"
                              title="Lưu tên mới"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRenamingSavedId(null)}
                              className="p-1.5 rounded-lg border border-slate-300"
                              title="Hủy"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <h3 className="font-bold text-slate-900 dark:text-white truncate">{d.title}</h3>
                        )}
                      </div>

                      {confirmDeleteSavedId === d.id ? (
                        <div className="pt-2 border-t border-rose-200 dark:border-rose-800 flex items-center justify-between gap-2 text-xs">
                          <span className="text-rose-700 dark:text-rose-300 font-semibold">Xóa bản vẽ này?</span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteSavedId(null)}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void deleteDrawing3D(d.id);
                                setConfirmDeleteSavedId(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => openLab3DWithScene(d.scene, d.title)}
                            className="text-sm font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                          >
                            Mở bản vẽ →
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setRenamingSavedId(d.id);
                                setRenameSavedDraft(d.title);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Đổi tên"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const now = new Date().toISOString();
                                void saveDrawing3D({
                                  ...d,
                                  id: `d3d_${Date.now()}`,
                                  title: `${d.title} (Bản sao)`,
                                  scene: cloneScene3D(d.scene),
                                  createdAt: now,
                                  updatedAt: now,
                                });
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Nhân bản"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteSavedId(d.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Xóa bản vẽ 3D"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

              {(savedFilter === 'all' || savedFilter === '2d') &&
                drawings
                  .filter((d) => !savedQuery.trim() || d.title.toLowerCase().includes(savedQuery.toLowerCase()))
                  .map((d) => (
                    <div
                      key={d.id}
                      className="rounded-2xl border border-teal-200 dark:border-teal-800/70 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3"
                    >
                      <div className="space-y-2">
                        <div className="h-36 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 overflow-hidden p-2">
                          <SceneThumbnail2D scene={d.scene} />
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-teal-700 dark:text-teal-400">
                          <span>Bản vẽ 2D</span>
                          <span className="text-slate-400 font-normal">
                            {new Date(d.updatedAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                        {renamingSavedId === d.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={renameSavedDraft}
                              autoFocus
                              onChange={(e) => setRenameSavedDraft(e.target.value)}
                              className="flex-1 px-2 py-1 text-sm rounded-lg border border-teal-500 bg-white dark:bg-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (renameSavedDraft.trim()) {
                                  void saveDrawing({
                                    ...d,
                                    title: renameSavedDraft.trim(),
                                    updatedAt: new Date().toISOString(),
                                  });
                                }
                                setRenamingSavedId(null);
                              }}
                              className="p-1.5 rounded-lg bg-teal-700 text-white"
                              title="Lưu tên mới"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRenamingSavedId(null)}
                              className="p-1.5 rounded-lg border border-slate-300"
                              title="Hủy"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <h3 className="font-bold text-slate-900 dark:text-white truncate">{d.title}</h3>
                        )}
                      </div>

                      {confirmDeleteSavedId === d.id ? (
                        <div className="pt-2 border-t border-rose-200 dark:border-rose-800 flex items-center justify-between gap-2 text-xs">
                          <span className="text-rose-700 dark:text-rose-300 font-semibold">Xóa bản vẽ này?</span>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteSavedId(null)}
                              className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700"
                            >
                              Hủy
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void deleteDrawing(d.id);
                                setConfirmDeleteSavedId(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-semibold"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => {
                              setScene(cloneScene(d.scene));
                              setTitle(d.title);
                              setDrawingId(d.id);
                              setHistory([]);
                              setFuture([]);
                              setSelectedId(null);
                              setIsDirty(false);
                              setLabSubView('2d');
                            }}
                            className="text-sm font-semibold text-teal-700 dark:text-teal-400 hover:underline"
                          >
                            Mở bản vẽ →
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setRenamingSavedId(d.id);
                                setRenameSavedDraft(d.title);
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Đổi tên"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const now = new Date().toISOString();
                                void saveDrawing({
                                  ...d,
                                  id: `draw_${Date.now()}`,
                                  title: `${d.title} (Bản sao)`,
                                  scene: cloneScene(d.scene),
                                  createdAt: now,
                                  updatedAt: now,
                                });
                              }}
                              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              title="Nhân bản"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteSavedId(d.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="Xóa bản vẽ 2D"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
