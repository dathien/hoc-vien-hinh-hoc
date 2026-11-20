import React from 'react';
import {
  THPT_GRADE_FILTER_OPTIONS,
  type ThptGradeFilter,
} from '../../data/thptCurriculum';

interface ThptGradeFilterBarProps {
  value: ThptGradeFilter;
  onChange: (next: ThptGradeFilter) => void;
  counts?: Partial<Record<ThptGradeFilter, number>>;
  size?: 'sm' | 'md';
  className?: string;
}

const ACTIVE_STYLE: Record<ThptGradeFilter, string> = {
  all: 'bg-slate-900 text-white border-slate-900 dark:bg-teal-600 dark:border-teal-600 shadow-xs',
  '10': 'bg-teal-700 text-white border-teal-700 shadow-xs',
  '11': 'bg-sky-700 text-white border-sky-700 shadow-xs',
  '12': 'bg-violet-700 text-white border-violet-700 shadow-xs',
};

export const ThptGradeFilterBar: React.FC<ThptGradeFilterBarProps> = ({
  value,
  onChange,
  counts,
  size = 'md',
  className = '',
}) => {
  const pad = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2 text-[15px]';

  return (
    <div
      role="tablist"
      aria-label="Lọc theo khối lớp THPT"
      className={`inline-flex flex-wrap items-center gap-2 ${className}`}
    >
      {THPT_GRADE_FILTER_OPTIONS.map((opt) => {
        const active = value === opt.id;
        const count = counts?.[opt.id];
        return (
          <button
            key={opt.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(opt.id)}
            className={`inline-flex items-center gap-1.5 rounded-xl font-semibold border transition-colors ${pad} ${
              active
                ? ACTIVE_STYLE[opt.id]
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-teal-400 dark:hover:border-teal-500'
            }`}
          >
            <span>{opt.label}</span>
            {typeof count === 'number' && (
              <span
                className={`text-xs font-mono-tabular px-1.5 py-0.5 rounded-md ${
                  active
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
