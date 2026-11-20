import React from 'react';
import { Info, X } from 'lucide-react';
import { sanitizeUiText } from '../../geometry/naming2d';

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
  const cleanSelected = selectedLabels
    .map((lbl) => sanitizeUiText(lbl))
    .filter((lbl) => lbl.length > 0);

  return (
    <div
      className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2 bg-sky-50/90 dark:bg-sky-950/35 border-b border-sky-200/80 dark:border-sky-900/70 text-[15px] text-slate-800 dark:text-slate-100 min-h-[44px]"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <Info className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0" />
        <span className="font-semibold text-teal-800 dark:text-teal-300 shrink-0">
          {toolName}:
        </span>
        <span className="text-slate-700 dark:text-slate-200 leading-snug">{displayText}</span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {cleanSelected.length > 0 && (
          <span className="text-[14px] font-semibold px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-700 text-teal-800 dark:text-teal-300">
            Đã chọn: {cleanSelected.join(' → ')}
          </span>
        )}
        {canCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 text-white text-[13px] font-semibold hover:bg-slate-900"
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
