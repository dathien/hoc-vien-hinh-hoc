import React, { useState } from 'react';
import { CheckCircle2, Download, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  compact?: boolean;
  /** Render as a compact icon button with clear tooltip when header space is tight */
  iconOnly?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  compact = false,
  iconOnly = false,
}) => {
  const { canInstall, isInstalled, promptInstall } = usePWAInstall();
  const [showManualGuide, setShowManualGuide] = useState(false);

  if (isInstalled) {
    if (compact || iconOnly) return null;
    return (
      <div className="inline-flex items-center gap-2 text-sm text-teal-700 dark:text-teal-300 font-medium">
        <CheckCircle2 className="w-4 h-4" />
        Đã cài đặt ứng dụng trên thiết bị
      </div>
    );
  }

  const handleClick = async () => {
    if (canInstall) {
      await promptInstall();
    } else {
      setShowManualGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => void handleClick()}
        className={`inline-flex items-center justify-center gap-1.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/80 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/70 transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
          iconOnly
            ? 'w-9 h-9 p-0'
            : compact
            ? 'h-9 px-3 text-sm font-semibold'
            : 'px-4 py-2 text-sm font-semibold'
        }`}
        title="Cài ứng dụng để học ngoại tuyến không cần mạng"
        aria-label="Cài ứng dụng"
      >
        <Download className="w-4 h-4 shrink-0" />
        {!iconOnly && <span>{compact ? 'Cài ứng dụng' : 'Cài đặt ứng dụng (PWA)'}</span>}
      </button>

      {showManualGuide && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
          onClick={() => setShowManualGuide(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-lg">
                <Smartphone className="w-5 h-5" />
                Cài đặt Học Viện Hình Học Smart
              </div>
              <button
                type="button"
                onClick={() => setShowManualGuide(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Đóng hướng dẫn cài đặt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Trình duyệt của bạn hỗ trợ cài đặt ứng dụng trực tiếp ra màn hình chính để học tập ngay cả khi không có Internet:
            </p>
            <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-200 list-disc pl-5">
              <li>
                <strong>Chrome / Edge (Máy tính):</strong> Nhấp biểu tượng <strong>Cài đặt</strong> trên thanh địa chỉ hoặc vào menu ⋮ → <em>Lưu và chia sẻ → Cài đặt ứng dụng</em>.
              </li>
              <li>
                <strong>Safari (iPhone / iPad):</strong> Nhấn nút <strong>Chia sẻ</strong> ở cạnh dưới → chọn <strong>Thêm vào MH chính</strong>.
              </li>
              <li>
                <strong>Chrome (Android):</strong> Mở menu ⋮ → chọn <strong>Thêm vào màn hình chính</strong>.
              </li>
            </ul>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowManualGuide(false)}
                className="px-4 py-2 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
