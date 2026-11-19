import React from 'react';
import { useApp } from '../../store/AppContext';

export const Footer: React.FC = () => {
  const { setPage } = useApp();

  return (
    <footer className="mt-12 border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-600 dark:text-slate-400">
        <div className="text-center sm:text-left font-medium text-slate-700 dark:text-slate-300">
          Copyright © 2026 – Phát triển bởi Thầy Hồ Nguyễn Đa Thiện.
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <button
            type="button"
            onClick={() => setPage('guide')}
            className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
          >
            Hướng dẫn sử dụng
          </button>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <button
            type="button"
            onClick={() => setPage('library')}
            className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
          >
            Thư viện kiến thức
          </button>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <button
            type="button"
            onClick={() => setPage('settings')}
            className="hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
          >
            Sao lưu &amp; Khôi phục
          </button>
        </div>
      </div>
    </footer>
  );
};
