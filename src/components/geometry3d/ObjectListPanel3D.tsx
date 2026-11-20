import React, { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  getObjectDescription3D,
  getObjectDisplayName3D,
  groupObjects3D,
  type ObjectGroupKey3D,
} from '../../geometry3d/naming3d';
import type { Geo3DScene } from '../../geometry3d/types3d';
import { GeoObjectIcon, resolveIconKind3D } from '../geometry/GeoObjectIcon';

interface ObjectListPanel3DProps {
  scene: Geo3DScene;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string, nextName: string) => void;
  onToggleVisibility: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ObjectListPanel3D: React.FC<ObjectListPanel3DProps> = ({
  scene,
  selectedId,
  onSelect,
  onRename,
  onToggleVisibility,
  onDelete,
}) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Partial<Record<ObjectGroupKey3D, boolean>>>({});

  const groups = useMemo(() => groupObjects3D(scene), [scene]);

  const toggleGroup = (key: ObjectGroupKey3D) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  if (groups.length === 0) {
    return (
      <p className="text-[14px] text-slate-500 dark:text-slate-400 px-2 py-5 text-center leading-relaxed">
        Không gian 3D đang trống. Chọn công cụ bên trái để bắt đầu dựng hình.
      </p>
    );
  }

  return (
    <div className="space-y-2.5">
      {groups.map((grp) => {
        const isCollapsed = Boolean(collapsedGroups[grp.key]);
        return (
          <section key={grp.key} className="space-y-1">
            <button
              type="button"
              onClick={() => toggleGroup(grp.key)}
              className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-[13px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100/85 dark:bg-slate-800/75 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{grp.title}</span>
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-teal-700 dark:text-teal-400">
                {grp.objects.length}
              </span>
            </button>

            {!isCollapsed && (
              <div className="space-y-1 pl-0.5">
                {grp.objects.map((obj) => {
                  const isSelected = obj.id === selectedId;
                  const isVisible = obj.style.visible !== false;
                  const displayName = getObjectDisplayName3D(scene, obj);
                  const description = getObjectDescription3D(scene, obj);
                  const depCount = pendingDeleteId === obj.id ? getDependentCount(obj.id) : 0;

                  return (
                    <div
                      key={obj.id}
                      className={`rounded-xl border px-2.5 py-2 transition-colors ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50/75 dark:bg-teal-950/35'
                          : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelect(obj.id)}
                          className="flex items-start gap-2.5 min-w-0 flex-1 text-left"
                        >
                          <div className="mt-0.5 shrink-0">
                            <GeoObjectIcon
                              kind={resolveIconKind3D(obj)}
                              color={obj.style.color}
                              className="w-5 h-5"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
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
                                      onRename(obj.id, renameDraft.trim());
                                      setRenamingId(null);
                                    } else if (e.key === 'Escape') {
                                      setRenamingId(null);
                                    }
                                  }}
                                  placeholder={
                                    obj.kind === 'point'
                                      ? 'Nhập ký hiệu điểm (vd: M)'
                                      : 'Để trống để dùng tên tự động'
                                  }
                                  className="w-full min-w-0 px-2 py-1 text-[14px] rounded border border-teal-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    onRename(obj.id, renameDraft.trim());
                                    setRenamingId(null);
                                  }}
                                  className="p-1 text-teal-700 dark:text-teal-400 shrink-0"
                                  title="Lưu tên"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div
                                className={`text-[15px] font-semibold leading-snug break-words ${
                                  isVisible
                                    ? 'text-slate-900 dark:text-slate-100'
                                    : 'text-slate-400 dark:text-slate-500 line-through'
                                }`}
                              >
                                {displayName}
                              </div>
                            )}
                            {description && (
                              <div className="text-[12.5px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 break-words">
                                {description}
                              </div>
                            )}
                          </div>
                        </button>

                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setRenamingId(obj.id);
                              setRenameDraft(obj.kind === 'point' ? obj.label : displayName);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700"
                            title="Đổi tên đối tượng"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleVisibility(obj.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700"
                            title={isVisible ? 'Ẩn đối tượng' : 'Hiện đối tượng'}
                          >
                            {isVisible ? (
                              <Eye className="w-3.5 h-3.5" />
                            ) : (
                              <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                            )}
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

                      {pendingDeleteId === obj.id && (
                        <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30 rounded-lg p-2 text-xs space-y-1.5">
                          <div className="text-rose-800 dark:text-rose-200 font-medium leading-snug">
                            Xóa <strong>{displayName}</strong> sẽ xóa thêm {depCount} đối tượng phụ thuộc.
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
                })}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};
