import React from 'react';
import { ListOrdered, Trash2 } from 'lucide-react';
import { getLogDescription2D } from '../../geometry/naming2d';
import type { GeoScene } from '../../geometry/types';

interface ConstructionLogPanelProps {
  scene: GeoScene;
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
  onDeleteObject: (id: string) => void;
}

export const ConstructionLogPanel: React.FC<ConstructionLogPanelProps> = ({
  scene,
  selectedObjectId,
  onSelectObject,
  onDeleteObject,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
          <ListOrdered className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          Nhật ký các bước dựng
        </div>
        <span className="text-xs font-mono-tabular text-slate-500 dark:text-slate-400">
          {scene.log.length} bước
        </span>
      </div>

      {scene.log.length === 0 ? (
        <p className="px-3.5 py-4 text-sm text-slate-500 dark:text-slate-400">
          Chưa có bước dựng nào. Hãy chọn công cụ trên thanh thước &amp; compa để bắt đầu.
        </p>
      ) : (
        <ol className="divide-y divide-slate-100 dark:divide-slate-800 max-h-60 overflow-y-auto">
          {scene.log.map((entry, idx) => {
            const primaryId = entry.createdObjectIds[0];
            const isSelected = primaryId && primaryId === selectedObjectId;
            return (
              <li
                key={entry.id}
                onClick={() => primaryId && onSelectObject(primaryId)}
                className={`flex items-center justify-between gap-2 px-3.5 py-2 text-sm cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200'
                }`}
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    <span className="font-mono-tabular text-xs text-slate-400 mr-1.5">
                      #{idx + 1}
                    </span>
                    {getLogDescription2D(scene, entry)}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono-tabular">
                    {entry.toolLabel} · {entry.costL}L · {entry.costE}E
                  </div>
                </div>
                {primaryId && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteObject(primaryId);
                    }}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0"
                    title="Xóa bước này và các đối tượng phụ thuộc"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
};
