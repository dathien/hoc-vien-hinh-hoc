import React, { useMemo, useRef, useState } from 'react';
import {
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Layers,
  Pencil,
  Sliders,
  Trash2,
  X,
} from 'lucide-react';
import type { GeoObject, GeoScene } from '../../geometry/types';

const COLOR_SWATCHES = ['#0F766E', '#0284C7', '#7C3AED', '#D97706', '#DC2626', '#172033'];

const KIND_LABEL: Record<GeoObject['kind'], string> = {
  point: 'Điểm',
  line: 'Đường thẳng',
  segment: 'Đoạn thẳng',
  ray: 'Tia',
  circle: 'Đường tròn',
  arc: 'Cung tròn',
  polygon: 'Đa giác',
  angle_measure: 'Đo góc',
  length_measure: 'Đo độ dài',
};

interface ObjectPropertiesPanel2DProps {
  scene: GeoScene;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateLabel: (id: string, label: string) => void;
  onUpdateStyle: (id: string, patch: Partial<GeoObject['style']>) => void;
  onUpdatePointCoords: (id: string, x: number, y: number) => void;
  onUpdateCircleRadius: (id: string, radius: number) => void;
  onDelete: (id: string) => void;
  open: boolean;
  onClose: () => void;
}

export const ObjectPropertiesPanel2D: React.FC<ObjectPropertiesPanel2DProps> = ({
  scene,
  selectedId,
  onSelect,
  onUpdateLabel,
  onUpdateStyle,
  onUpdatePointCoords,
  onUpdateCircleRadius,
  onDelete,
  open,
  onClose,
}) => {
  const [width, setWidth] = useState(296);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; w: number } | null>(null);

  const objects = useMemo(
    () =>
      scene.order
        .map((id) => scene.objects[id])
        .filter((o): o is GeoObject => Boolean(o)),
    [scene]
  );

  const selectedObj = selectedId ? scene.objects[selectedId] ?? null : null;

  const getDependentCount = (targetId: string): number => {
    const visited = new Set<string>([targetId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const id of scene.order) {
        if (visited.has(id)) continue;
        const obj = scene.objects[id];
        if (obj && obj.parents.some((p) => visited.has(p))) {
          visited.add(id);
          changed = true;
        }
      }
    }
    return visited.size - 1;
  };

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    dragStartRef.current = { x: e.clientX, w: width };
    const onMove = (ev: MouseEvent) => {
      if (!dragStartRef.current) return;
      const delta = dragStartRef.current.x - ev.clientX;
      setWidth(Math.max(240, Math.min(380, dragStartRef.current.w + delta)));
    };
    const onUp = () => {
      dragStartRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  if (!open) return null;

  const isFreePoint = selectedObj?.kind === 'point' && selectedObj.rule === 'free_point';
  const isFixedRadiusCircle =
    selectedObj?.kind === 'circle' && selectedObj.rule === 'circle_center_radius';

  return (
    <div
      className="relative flex shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
      style={{ width: `${width}px` }}
    >
      {/* Drag-resize handle */}
      <div
        onMouseDown={startResize}
        className="w-1.5 cursor-col-resize hover:bg-teal-500/40 active:bg-teal-600/60 transition-colors shrink-0"
        title="Kéo để thay đổi độ rộng bảng"
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-[14px] font-bold text-slate-800 dark:text-slate-100">
            <Layers className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            Đối tượng &amp; Thuộc tính
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Ẩn bảng bên phải"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* SECTION A: Object List */}
        <div className="flex-1 min-h-[160px] overflow-y-auto p-2.5 space-y-1 border-b border-slate-200 dark:border-slate-800">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-1">
            Danh sách đối tượng ({objects.length})
          </div>

          {objects.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 px-2 py-4 text-center">
              Bảng vẽ đang trống. Chọn công cụ bên trái để bắt đầu dựng hình.
            </p>
          ) : (
            objects.map((obj) => {
              const isSelected = obj.id === selectedId;
              const isFree = obj.rule === 'free_point';
              const depCount = pendingDeleteId === obj.id ? getDependentCount(obj.id) : 0;

              return (
                <div
                  key={obj.id}
                  className={`rounded-xl border px-2.5 py-2 transition-colors ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50/70 dark:bg-teal-950/35'
                      : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelect(obj.id)}
                      className="flex items-center gap-2 min-w-0 flex-1 text-left"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: obj.style.color }}
                      />
                      <div className="min-w-0">
                        {renamingId === obj.id ? (
                          <div
                            className="flex items-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={renameDraft}
                              autoFocus
                              onChange={(e) => setRenameDraft(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  if (renameDraft.trim()) onUpdateLabel(obj.id, renameDraft.trim());
                                  setRenamingId(null);
                                } else if (e.key === 'Escape') {
                                  setRenamingId(null);
                                }
                              }}
                              className="w-24 px-1.5 py-0.5 text-sm rounded border border-teal-500 bg-white dark:bg-slate-800"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (renameDraft.trim()) onUpdateLabel(obj.id, renameDraft.trim());
                                setRenamingId(null);
                              }}
                              className="p-1 text-teal-700"
                              title="Lưu tên"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="text-[14px] font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {obj.label || KIND_LABEL[obj.kind]}
                          </div>
                        )}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {KIND_LABEL[obj.kind]} · {isFree ? 'Tự do' : 'Phụ thuộc'}
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setRenamingId(obj.id);
                          setRenameDraft(obj.label);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700"
                        title="Đổi tên"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateStyle(obj.id, { visible: !obj.style.visible })}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700"
                        title={obj.style.visible ? 'Ẩn đối tượng' : 'Hiện đối tượng'}
                      >
                        {obj.style.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-amber-600" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const deps = getDependentCount(obj.id);
                          if (deps > 0) {
                            setPendingDeleteId(obj.id);
                          } else {
                            onDelete(obj.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Xóa đối tượng"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Inline delete confirmation when dependent objects exist */}
                  {pendingDeleteId === obj.id && (
                    <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 rounded-lg p-2 text-xs space-y-1.5">
                      <div className="text-rose-800 dark:text-rose-200 font-medium">
                        Xóa <strong>{obj.label}</strong> sẽ xóa thêm {depCount} đối tượng phụ thuộc.
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(null)}
                          className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(obj.id);
                            setPendingDeleteId(null);
                          }}
                          className="px-2 py-1 rounded bg-rose-600 text-white font-semibold"
                        >
                          Xác nhận xóa
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* SECTION B: Contextual Object Properties */}
        <div className="p-3 overflow-y-auto max-h-[52%] space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800 dark:text-slate-100">
              <Sliders className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              Thuộc tính đối tượng
            </div>
            {selectedObj && (
              <button
                type="button"
                onClick={() => onSelect(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
                title="Bỏ chọn"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!selectedObj ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed py-2">
              Chọn một đối tượng trên bảng vẽ để chỉnh sửa thuộc tính.
            </p>
          ) : (
            <div className="space-y-3 text-sm">
              {/* Name */}
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tên đối tượng</span>
                <input
                  type="text"
                  value={selectedObj.label}
                  onChange={(e) => onUpdateLabel(selectedObj.id, e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm"
                />
              </label>

              {/* Color Swatches */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Màu sắc</span>
                <div className="flex items-center gap-2">
                  {COLOR_SWATCHES.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => onUpdateStyle(selectedObj.id, { color: col })}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        selectedObj.style.color === col
                          ? 'border-amber-500 scale-110'
                          : 'border-white dark:border-slate-700'
                      }`}
                      style={{ backgroundColor: col }}
                      aria-label={`Chọn màu ${col}`}
                    />
                  ))}
                </div>
              </div>

              {/* Point-specific contextual properties */}
              {selectedObj.kind === 'point' && (
                <>
                  <label className="block space-y-1">
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                      Kích thước điểm ({(selectedObj.style.pointSize ?? 5).toFixed(0)} px)
                    </span>
                    <input
                      type="range"
                      min={3}
                      max={10}
                      step={1}
                      value={selectedObj.style.pointSize ?? 5}
                      onChange={(e) => onUpdateStyle(selectedObj.id, { pointSize: Number(e.target.value) })}
                      className="w-full accent-teal-700"
                    />
                  </label>

                  {isFreePoint ? (
                    <div className="grid grid-cols-2 gap-2">
                      <label className="space-y-1">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Hoành độ x</span>
                        <input
                          type="number"
                          step={5}
                          value={Math.round(selectedObj.x)}
                          onChange={(e) =>
                            onUpdatePointCoords(selectedObj.id, Number(e.target.value) || 0, selectedObj.y)
                          }
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm font-mono"
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tung độ y</span>
                        <input
                          type="number"
                          step={5}
                          value={Math.round(-selectedObj.y)}
                          onChange={(e) =>
                            onUpdatePointCoords(selectedObj.id, selectedObj.x, -(Number(e.target.value) || 0))
                          }
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-sm font-mono"
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
                      Tọa độ phụ thuộc: ({Math.round(selectedObj.x)}; {Math.round(-selectedObj.y)})
                    </div>
                  )}
                </>
              )}

              {/* Line / Segment / Ray / Circle / Polygon stroke properties */}
              {selectedObj.kind !== 'point' &&
                selectedObj.kind !== 'angle_measure' &&
                selectedObj.kind !== 'length_measure' && (
                  <>
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Kiểu nét</span>
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
                            onClick={() => onUpdateStyle(selectedObj.id, { dash })}
                            className={`py-1.5 rounded-lg text-xs font-semibold border ${
                              selectedObj.style.dash === dash
                                ? 'bg-teal-700 text-white border-teal-700'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Độ dày nét ({selectedObj.style.strokeWidth.toFixed(1)} px)
                      </span>
                      <input
                        type="range"
                        min={1}
                        max={5}
                        step={0.5}
                        value={selectedObj.style.strokeWidth}
                        onChange={(e) =>
                          onUpdateStyle(selectedObj.id, { strokeWidth: Number(e.target.value) })
                        }
                        className="w-full accent-teal-700"
                      />
                    </label>
                  </>
                )}

              {/* Circle-specific radius */}
              {selectedObj.kind === 'circle' && (
                <div className="space-y-1">
                  {isFixedRadiusCircle ? (
                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        Bán kính R
                      </span>
                      <input
                        type="number"
                        min={10}
                        max={350}
                        step={5}
                        value={Math.round(selectedObj.radius)}
                        onChange={(e) =>
                          onUpdateCircleRadius(selectedObj.id, Math.max(10, Number(e.target.value) || 80))
                        }
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm font-mono"
                      />
                    </label>
                  ) : (
                    <div className="text-xs text-slate-500 font-mono bg-white dark:bg-slate-800 rounded-lg px-2.5 py-1.5 border border-slate-200 dark:border-slate-700">
                      Bán kính động: R ≈ {(selectedObj.radius / 10).toFixed(2)} đv
                    </div>
                  )}
                </div>
              )}

              {/* Polygon fill opacity */}
              {selectedObj.kind === 'polygon' && (
                <label className="block space-y-1">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Độ trong suốt nền ({Math.round((selectedObj.style.fillOpacity ?? 0.12) * 100)}%)
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={0.6}
                    step={0.05}
                    value={selectedObj.style.fillOpacity ?? 0.12}
                    onChange={(e) =>
                      onUpdateStyle(selectedObj.id, { fillOpacity: Number(e.target.value) })
                    }
                    className="w-full accent-teal-700"
                  />
                </label>
              )}

              {/* Visibility & label toggles */}
              <div className="pt-1 space-y-1.5 border-t border-slate-200 dark:border-slate-800">
                <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span>Hiển thị nhãn</span>
                  <input
                    type="checkbox"
                    checked={selectedObj.style.showLabel !== false}
                    onChange={(e) => onUpdateStyle(selectedObj.id, { showLabel: e.target.checked })}
                    className="rounded text-teal-700"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300">
                  <span>Hiển thị đối tượng</span>
                  <input
                    type="checkbox"
                    checked={selectedObj.style.visible}
                    onChange={(e) => onUpdateStyle(selectedObj.id, { visible: e.target.checked })}
                    className="rounded text-teal-700"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
