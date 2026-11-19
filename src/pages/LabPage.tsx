import React, { Suspense, lazy, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Box,
  Compass,
  Copy,
  FolderOpen,
  Layers,
  LayoutGrid,
  Palette,
  Plus,
  Save,
  Search,
  Sliders,
  Trash2,
} from 'lucide-react';
import { ConstructionLogPanel } from '../components/geometry/ConstructionLogPanel';
import { GeometryCanvas } from '../components/geometry/GeometryCanvas';
import { ToolPalette } from '../components/geometry/ToolPalette';
import { LiveGeo3DPreview } from '../components/geometry3d/LiveGeo3DPreview';
import {
  addGeoObject,
  cloneScene,
  computeSceneCosts,
  createEmptyScene,
  deleteObjectWithDependents,
} from '../geometry/engine';
import type { GeoScene, ToolId } from '../geometry/types';
import {
  TEMPLATE_GROUPS_3D,
  TEMPLATES_3D,
  type Template3DGroup,
} from '../geometry3d/templates3d';
import { cloneScene3D } from '../geometry3d/engine3d';
import { type LabSubView, useApp } from '../store/AppContext';

const Lab3DWorkspace = lazy(() => import('./Lab3DWorkspace'));

const COLOR_SWATCHES = ['#0F766E', '#0284C7', '#7C3AED', '#D97706', '#DC2626', '#172033'];

function createStarterTriangleEulerScene(): GeoScene {
  let sc = createEmptyScene();
  const a = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -45, y: -95, label: 'A', style: { color: '#0F766E' }, skipLog: true });
  sc = a.scene;
  const b = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: -125, y: 75, label: 'B', style: { color: '#0F766E' }, skipLog: true });
  sc = b.scene;
  const c = addGeoObject(sc, { kind: 'point', rule: 'free_point', parents: [], x: 130, y: 65, label: 'C', style: { color: '#0F766E' }, skipLog: true });
  sc = c.scene;
  sc = addGeoObject(sc, { kind: 'polygon', rule: 'polygon_vertices', parents: [a.id, b.id, c.id], label: 'ABC', style: { color: '#172033', fillColor: '#0F766E', fillOpacity: 0.08 }, skipLog: true }).scene;
  const o = addGeoObject(sc, { kind: 'point', rule: 'circumcenter', parents: [a.id, b.id, c.id], label: 'O', style: { color: '#0284C7' }, skipLog: true });
  sc = o.scene;
  sc = addGeoObject(sc, { kind: 'point', rule: 'centroid', parents: [a.id, b.id, c.id], label: 'G', style: { color: '#0F766E' }, skipLog: true }).scene;
  const h = addGeoObject(sc, { kind: 'point', rule: 'orthocenter', parents: [a.id, b.id, c.id], label: 'H', style: { color: '#7C3AED' }, skipLog: true });
  sc = h.scene;
  sc = addGeoObject(sc, { kind: 'line', rule: 'line_two_points', parents: [o.id, h.id], label: 'Euler', style: { color: '#D97706', strokeWidth: 2.2 }, skipLog: true }).scene;
  sc = addGeoObject(sc, { kind: 'circle', rule: 'circumcircle', parents: [a.id, b.id, c.id], label: '(O)', style: { color: '#0284C7', dash: 'dashed', isAuxiliary: true }, skipLog: true }).scene;
  return sc;
}

export const LabPage: React.FC = () => {
  const {
    setPage,
    settings,
    updateSettings,
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

  // 2D Lab State (100% preserved)
  const [scene, setScene] = useState<GeoScene>(() => labInitialScene ?? createEmptyScene());
  const [history, setHistory] = useState<GeoScene[]>([]);
  const [future, setFuture] = useState<GeoScene[]>([]);
  const [activeTool, setActiveTool] = useState<ToolId>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawingId, setDrawingId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>(labInitialTitle ?? 'Bản vẽ hình học mới');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);

  const [fixedRadius, setFixedRadius] = useState(80);
  const [rotateAngleDeg, setRotateAngleDeg] = useState(60);
  const [homothetyFactor, setHomothetyFactor] = useState(2);
  const [regularPolygonSides, setRegularPolygonSides] = useState(5);

  // Templates & Saved Drawings filters
  const [tplGroup, setTplGroup] = useState<Template3DGroup | 'all'>('all');
  const [tplQuery, setTplQuery] = useState('');
  const [savedFilter, setSavedFilter] = useState<'all' | '2d' | '3d'>('all');
  const [savedQuery, setSavedQuery] = useState('');

  useEffect(() => {
    if (labInitialScene) {
      setScene(labInitialScene);
      setHistory([]);
      setFuture([]);
      setTitle(labInitialTitle ?? 'Bản vẽ mở từ Thư viện');
      setDrawingId(null);
      setLabSubView('2d');
      clearLabInitialScene();
    }
  }, [labInitialScene, labInitialTitle, clearLabInitialScene, setLabSubView]);

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

  // Keyboard shortcuts Ctrl+Z / Ctrl+Y in 2D mode
  useEffect(() => {
    if (labSubView !== '2d') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const handleDeleteObject = (id: string) => {
    handleSceneChange(deleteObjectWithDependents(scene, id), true);
    if (selectedId === id) setSelectedId(null);
  };

  const handleSave = async () => {
    const now = new Date().toISOString();
    const id = drawingId ?? `draw_${Date.now()}`;
    await saveDrawing({
      id,
      title: title.trim() || 'Bản vẽ hình học',
      scene,
      createdAt: drawingId
        ? (drawings.find((d) => d.id === drawingId)?.createdAt ?? now)
        : now,
      updatedAt: now,
    });
    setDrawingId(id);
    setSaveFeedback('Đã lưu vào thiết bị');
    await logStudyEvent({
      type: 'lab',
      refId: id,
      title: title.trim() || 'Bản vẽ hình học',
      detail: `Lưu bản vẽ (${scene.order.length} đối tượng)`,
    });
    window.setTimeout(() => setSaveFeedback(null), 2400);
  };

  const filteredTemplates = useMemo(() => {
    const q = tplQuery.trim().toLowerCase();
    return TEMPLATES_3D.filter((t) => {
      if (tplGroup !== 'all' && t.group !== tplGroup) return false;
      if (q && !t.title.toLowerCase().includes(q) && !t.summary.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [tplGroup, tplQuery]);

  const selectedObj = selectedId ? scene.objects[selectedId] : null;
  const costs = computeSceneCosts(scene);

  const updateSelectedStyle = (patch: Partial<NonNullable<typeof selectedObj>['style']>) => {
    if (!selectedId) return;
    const next = cloneScene(scene);
    const obj = next.objects[selectedId];
    if (!obj) return;
    obj.style = { ...obj.style, ...patch };
    handleSceneChange(next, true);
  };

  const updateSelectedLabel = (newLabel: string) => {
    if (!selectedId) return;
    const next = cloneScene(scene);
    const obj = next.objects[selectedId];
    if (!obj) return;
    obj.label = newLabel;
    handleSceneChange(next, false);
  };

  const SUB_TABS: Array<{ id: LabSubView; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'hub', label: 'Không gian 2D & 3D', icon: LayoutGrid },
    { id: '2d', label: 'Dựng hình phẳng 2D', icon: Compass },
    { id: '3d', label: 'Dựng hình không gian 3D', icon: Box },
    { id: 'templates', label: `Thư viện hình mẫu (${TEMPLATES_3D.length})`, icon: Layers },
    { id: 'saved', label: `Bản dựng của tôi (${drawings.length + drawings3D.length})`, icon: FolderOpen },
  ];

  return (
    <div className={`${labSubView === '3d' ? 'max-w-[1600px]' : 'max-w-7xl'} mx-auto px-3 sm:px-6 py-5 pb-24 md:pb-10 space-y-4`}>
      {/* Sub-navigation bar inside Phòng thực hành */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = labSubView === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setLabSubView(tab.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[15px] font-semibold transition-colors ${
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

      {/* VIEW 0: LAB HUB (2 ANIMATED 2D & 3D CARDS) */}
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
                    Đầy đủ công cụ cơ bản và nâng cao (trung trực, phân giác, tâm đường tròn, phép biến hình 2D, đo độ dài – góc, lưới tọa độ và xuất PNG/SVG).
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
                    handleSceneChange(createStarterTriangleEulerScene(), true);
                    setTitle('Khám phá Đường thẳng Euler');
                    setLabSubView('2d');
                  }}
                  className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-[15px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                >
                  Mở mẫu Đường thẳng Euler
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
                    Thư viện 18 hình khối, 4 chế độ hiển thị (chuẩn nét khuất SGK, hình khối, khung dây, Oxyz), thiết diện động, đo góc – khoảng cách, trình chiếu và xuất SVG vector / PNG.
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
                  onClick={() => setLabSubView('templates')}
                  className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-[15px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50"
                >
                  Khám phá 40 hình mẫu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 1: FULL 2D LAB (100% PRESERVED) */}
      {labSubView === '2d' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[240px]">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                aria-label="Tên bản vẽ"
                className="text-xl font-bold text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-600 focus:outline-none px-1 py-0.5 max-w-sm w-full"
              />
              <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
                {scene.order.length} đối tượng · {costs.totalL}L · {costs.totalE}E
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  handleSceneChange(createStarterTriangleEulerScene(), true);
                  setTitle('Khám phá Đường thẳng Euler');
                  setDrawingId(null);
                }}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Mẫu Đường thẳng Euler
              </button>
              <button
                type="button"
                onClick={() => {
                  handleSceneChange(createEmptyScene(), true);
                  setTitle('Bản vẽ hình học mới');
                  setDrawingId(null);
                  setSelectedId(null);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <Plus className="w-4 h-4" />
                Bảng trống
              </button>
              <button
                type="button"
                onClick={() => setShowSavedDrawer((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <FolderOpen className="w-4 h-4" />
                Bản vẽ 2D đã lưu ({drawings.length})
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
              >
                <Save className="w-4 h-4" />
                {saveFeedback ?? 'Lưu bản vẽ'}
              </button>
            </div>
          </div>

          {showSavedDrawer && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Bản vẽ 2D đã lưu trên thiết bị
                </h3>
                <button
                  type="button"
                  onClick={() => setShowSavedDrawer(false)}
                  className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                >
                  Đóng
                </button>
              </div>
              {drawings.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Chưa có bản vẽ 2D nào được lưu. Hãy dựng hình và bấm <strong>Lưu bản vẽ</strong>.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {drawings.map((d) => (
                    <div
                      key={d.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 flex items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-800/50"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setScene(d.scene);
                          setTitle(d.title);
                          setDrawingId(d.id);
                          setHistory([]);
                          setFuture([]);
                          setShowSavedDrawer(false);
                        }}
                        className="text-left min-w-0 flex-1"
                      >
                        <div className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {d.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          {d.scene.order.length} đối tượng · {new Date(d.updatedAt).toLocaleDateString('vi-VN')}
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteDrawing(d.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Xóa bản vẽ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <ToolPalette
            activeTool={activeTool}
            onSelectTool={setActiveTool}
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
            onClearUserObjects={() => {
              handleSceneChange(createEmptyScene(), true);
              setSelectedId(null);
            }}
            selectedObjectId={selectedId}
            onDeleteSelected={() => selectedId && handleDeleteObject(selectedId)}
          />

          {(activeTool === 'circle_cr' ||
            activeTool === 'rotate' ||
            activeTool === 'homothety' ||
            activeTool === 'regular_polygon') && (
            <div className="flex flex-wrap items-center gap-4 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30 px-4 py-2.5 text-sm">
              <div className="flex items-center gap-1.5 font-semibold text-sky-900 dark:text-sky-200">
                <Sliders className="w-4 h-4" />
                Tham số công cụ:
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
                    className="w-20 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 font-mono-tabular"
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
                    className="w-20 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 font-mono-tabular"
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
                    className="w-20 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 font-mono-tabular"
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
                    className="w-20 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-2 py-1 font-mono-tabular"
                  />
                </label>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            <div className="lg:col-span-9">
              <GeometryCanvas
                scene={scene}
                onSceneChange={handleSceneChange}
                activeTool={activeTool}
                inputMode={settings.inputMode}
                selectedObjectId={selectedId}
                onSelectObject={setSelectedId}
                heightClass="h-[560px] lg:h-[620px]"
                defaultShowGrid={settings.showGrid}
                defaultShowAxes={settings.showAxes}
                defaultShowLabels={settings.showLabels}
                darkTheme={settings.theme === 'dark'}
                fixedRadius={fixedRadius}
                rotateAngleDeg={rotateAngleDeg}
                homothetyFactor={homothetyFactor}
                regularPolygonSides={regularPolygonSides}
              />
            </div>

            <div className="lg:col-span-3 space-y-4">
              {selectedObj && (
                <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                      <Palette className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                      Thuộc tính đối tượng
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteObject(selectedObj.id)}
                      className="text-xs text-rose-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>

                  <label className="block space-y-1 text-xs">
                    <span className="text-slate-500">Nhãn hiển thị</span>
                    <input
                      type="text"
                      value={selectedObj.label}
                      onChange={(e) => updateSelectedLabel(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm text-slate-900 dark:text-white"
                    />
                  </label>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-500">Màu nét</span>
                    <div className="flex items-center gap-1.5">
                      {COLOR_SWATCHES.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => updateSelectedStyle({ color: col })}
                          className={`w-6 h-6 rounded-full border-2 ${
                            selectedObj.style.color === col
                              ? 'border-amber-500 scale-110'
                              : 'border-white dark:border-slate-700'
                          }`}
                          style={{ backgroundColor: col }}
                          aria-label={`Màu ${col}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-slate-500">Kiểu nét</span>
                    <div className="grid grid-cols-3 gap-1">
                      {(
                        [
                          ['solid', 'Liền'],
                          ['dashed', 'Đứt'],
                          ['dotted', 'Chấm'],
                        ] as const
                      ).map(([dash, label]) => (
                        <button
                          key={dash}
                          type="button"
                          onClick={() => updateSelectedStyle({ dash })}
                          className={`py-1 rounded-md text-xs font-medium border ${
                            selectedObj.style.dash === dash
                              ? 'bg-teal-700 text-white border-teal-700'
                              : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 pt-1">
                    <span>Đánh dấu là nét dựng phụ</span>
                    <input
                      type="checkbox"
                      checked={Boolean(selectedObj.style.isAuxiliary)}
                      onChange={(e) =>
                        updateSelectedStyle({
                          isAuxiliary: e.target.checked,
                          dash: e.target.checked ? 'dashed' : 'solid',
                        })
                      }
                      className="rounded text-teal-700"
                    />
                  </label>
                </div>
              )}

              <ConstructionLogPanel
                scene={scene}
                selectedObjectId={selectedId}
                onSelectObject={setSelectedId}
                onDeleteObject={handleDeleteObject}
              />
            </div>
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
            onOpenGuide={() => setPage('guide')}
          />
        </Suspense>
      )}

      {/* VIEW 3: 40 3D TEMPLATES LIBRARY */}
      {labSubView === 'templates' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Thư viện 40 Hình mẫu Không gian 3D
              </h2>
              <p className="text-[15px] text-slate-600 dark:text-slate-300 mt-1">
                Mọi hình mẫu đều là bản dựng 3D thực, có thể xoay 360°, thay đổi kích thước, kéo mặt phẳng cắt thiết diện và chỉnh sửa tự do.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tplQuery}
                onChange={(e) => setTplQuery(e.target.value)}
                placeholder="Tìm hình chóp, thiết diện, Oxyz..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[15px]"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTplGroup('all')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold border ${
                tplGroup === 'all'
                  ? 'bg-teal-700 text-white border-teal-700'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
            >
              Tất cả ({TEMPLATES_3D.length})
            </button>
            {TEMPLATE_GROUPS_3D.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setTplGroup(g.id)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold border ${
                  tplGroup === g.id
                    ? 'bg-teal-700 text-white border-teal-700'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {g.title}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((tpl) => {
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
                      <span className="text-sky-700 dark:text-sky-400">{tpl.curriculumTag}</span>
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

      {/* VIEW 4: MY SAVED DRAWINGS (2D + 3D UNIFIED) */}
      {labSubView === 'saved' && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                Bản dựng của tôi (2D &amp; 3D)
              </h2>
              <p className="text-[15px] text-slate-600 dark:text-slate-300">
                Quản lý, tìm kiếm, nhân bản hoặc mở lại các bản vẽ 2D và 3D đã lưu ngoại tuyến trên thiết bị.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {(['all', '2d', '3d'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setSavedFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-sm font-semibold border ${
                    savedFilter === f
                      ? 'bg-teal-700 text-white border-teal-700'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700'
                  }`}
                >
                  {f === 'all' ? 'Tất cả' : f === '2d' ? `2D (${drawings.length})` : `3D (${drawings3D.length})`}
                </button>
              ))}
              <input
                type="text"
                value={savedQuery}
                onChange={(e) => setSavedQuery(e.target.value)}
                placeholder="Tìm theo tên bản dựng..."
                className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm"
              />
            </div>
          </div>

          {drawings.length + drawings3D.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center space-y-3">
              <p className="text-[15px] text-slate-500">
                Bạn chưa lưu bản dựng nào. Hãy mở không gian 2D hoặc 3D, vẽ hình và nhấn <strong>Lưu</strong>.
              </p>
              <div className="flex justify-center gap-3">
                <button type="button" onClick={() => setLabSubView('2d')} className="px-4 py-2 rounded-xl bg-teal-700 text-white text-sm font-semibold">
                  Dựng hình 2D
                </button>
                <button type="button" onClick={() => setLabSubView('3d')} className="px-4 py-2 rounded-xl bg-sky-600 text-white text-sm font-semibold">
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
                    <div key={d.id} className="rounded-2xl border border-sky-200 dark:border-sky-800/70 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3">
                      <div className="space-y-2">
                        <div className="h-36 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 overflow-hidden">
                          <LiveGeo3DPreview scene={d.scene} width={280} height={150} animate={false} reducedMotion={true} />
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold text-sky-700">
                          <span>Bản dựng 3D</span>
                          <span className="text-slate-400 font-normal">{new Date(d.updatedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{d.title}</h3>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => openLab3DWithScene(d.scene, d.title)}
                          className="text-sm font-semibold text-sky-700 hover:underline"
                        >
                          Mở trong 3D →
                        </button>
                        <div className="flex items-center gap-1">
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
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                            title="Nhân bản"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteDrawing3D(d.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                            title="Xóa bản dựng 3D"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

              {(savedFilter === 'all' || savedFilter === '2d') &&
                drawings
                  .filter((d) => !savedQuery.trim() || d.title.toLowerCase().includes(savedQuery.toLowerCase()))
                  .map((d) => (
                    <div key={d.id} className="rounded-2xl border border-teal-200 dark:border-teal-800/70 bg-white dark:bg-slate-900 p-4 flex flex-col justify-between gap-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-bold text-teal-700">
                          <span>Bản dựng 2D</span>
                          <span className="text-slate-400 font-normal">{new Date(d.updatedAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white truncate">{d.title}</h3>
                        <p className="text-xs text-slate-500">{d.scene.order.length} đối tượng phẳng</p>
                      </div>
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setScene(d.scene);
                            setTitle(d.title);
                            setDrawingId(d.id);
                            setHistory([]);
                            setFuture([]);
                            setLabSubView('2d');
                          }}
                          className="text-sm font-semibold text-teal-700 hover:underline"
                        >
                          Mở trong 2D →
                        </button>
                        <div className="flex items-center gap-1">
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
                            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
                            title="Nhân bản"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void deleteDrawing(d.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                            title="Xóa bản dựng 2D"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
