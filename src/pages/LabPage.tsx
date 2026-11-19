import React, { useEffect, useState } from 'react';
import {
  FolderOpen,
  Palette,
  Plus,
  Save,
  Sliders,
  Trash2,
} from 'lucide-react';
import { ConstructionLogPanel } from '../components/geometry/ConstructionLogPanel';
import { GeometryCanvas } from '../components/geometry/GeometryCanvas';
import { ToolPalette } from '../components/geometry/ToolPalette';
import {
  addGeoObject,
  cloneScene,
  computeSceneCosts,
  createEmptyScene,
  deleteObjectWithDependents,
} from '../geometry/engine';
import type { GeoScene, ToolId } from '../geometry/types';
import { useApp } from '../store/AppContext';

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
    settings,
    updateSettings,
    drawings,
    saveDrawing,
    deleteDrawing,
    labInitialScene,
    labInitialTitle,
    clearLabInitialScene,
    logStudyEvent,
  } = useApp();

  const [scene, setScene] = useState<GeoScene>(() => labInitialScene ?? createEmptyScene());
  const [history, setHistory] = useState<GeoScene[]>([]);
  const [future, setFuture] = useState<GeoScene[]>([]);
  const [activeTool, setActiveTool] = useState<ToolId>('select');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [drawingId, setDrawingId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>(labInitialTitle ?? 'Bản vẽ hình học mới');
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);
  const [showSavedDrawer, setShowSavedDrawer] = useState(false);

  // Tool parameters
  const [fixedRadius, setFixedRadius] = useState(80);
  const [rotateAngleDeg, setRotateAngleDeg] = useState(60);
  const [homothetyFactor, setHomothetyFactor] = useState(2);
  const [regularPolygonSides, setRegularPolygonSides] = useState(5);

  useEffect(() => {
    if (labInitialScene) {
      setScene(labInitialScene);
      setHistory([]);
      setFuture([]);
      setTitle(labInitialTitle ?? 'Bản vẽ mở từ Thư viện');
      setDrawingId(null);
      clearLabInitialScene();
    }
  }, [labInitialScene, labInitialTitle, clearLabInitialScene]);

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

  // Keyboard shortcuts Ctrl+Z / Ctrl+Y
  useEffect(() => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-10 space-y-4">
      {/* Top Action Header */}
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
            Bản vẽ đã lưu ({drawings.length})
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

      {/* Saved Drawings Drawer */}
      {showSavedDrawer && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white">
              Bản vẽ đã lưu trên thiết bị
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
              Chưa có bản vẽ nào được lưu. Hãy dựng hình và bấm <strong>Lưu bản vẽ</strong>.
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

      {/* Full Unrestricted Tool Palette */}
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

      {/* Contextual parameter bar for parametric tools */}
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

      {/* Workspace Grid */}
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

        {/* Right Inspector & Construction Log */}
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
  );
};
