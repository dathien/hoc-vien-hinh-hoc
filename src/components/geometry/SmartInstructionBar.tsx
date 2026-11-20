import React from 'react';
import { Info, X } from 'lucide-react';

interface SmartInstructionBarProps {
  toolName: string;
  instruction: string;
  selectedLabels?: string[];
  bannerMessage?: string | null;
  canCancel?: boolean;
  onCancel?: () => void;
}

export const SmartInstructionBar: React.FC<SmartInstructionBarProps> = ({
  toolName,
  instruction,
  selectedLabels = [],
  bannerMessage = null,
  canCancel = false,
  onCancel,
}) => {
  const displayText = bannerMessage || instruction;

  return (
    <div
      className="flex items-center justify-between gap-3 px-3.5 py-2 bg-sky-50/90 dark:bg-sky-950/35 border-b border-sky-200/80 dark:border-sky-900/70 text-[15px] text-slate-800 dark:text-slate-100 min-h-[42px]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 min-w-0">
        <Info className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0" />
        <span className="font-semibold text-teal-800 dark:text-teal-300 shrink-0">
          {toolName}:
        </span>
        <span className="truncate text-slate-700 dark:text-slate-200">{displayText}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {selectedLabels.length > 0 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-700 text-teal-800 dark:text-teal-300">
            Đã chọn: {selectedLabels.join(' → ')}
          </span>
        )}
        {canCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-white text-xs font-semibold hover:bg-slate-900"
            title="Hủy thao tác hiện tại (Esc)"
          >
            <X className="w-3.5 h-3.5" />
            Hủy (Esc)
          </button>
        )}
      </div>
    </div>
  );
};
