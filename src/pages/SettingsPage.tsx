import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  Download,
  HardDrive,
  Music,
  Presentation,
  RotateCcw,
  Settings,
  Upload,
  Volume2,
} from 'lucide-react';
import { PWAInstallButton } from '../components/common/PWAInstallButton';
import { audioService } from '../services/audioService';
import { authService } from '../services/authService';
import { type BackupPayload, validateBackupJson } from '../services/storageService';
import { useApp } from '../store/AppContext';

export const SettingsPage: React.FC = () => {
  const {
    settings,
    updateSettings,
    createBackupPayload,
    applyBackupPayload,
    resetAllProgress,
    stats,
    drawings,
    customChallenges,
    classes,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingBackup, setPendingBackup] = useState<{
    payload: BackupPayload;
    summary: {
      exportedAt: string;
      completedCount: number;
      totalStars: number;
      drawingsCount: number;
      teacherChallengesCount: number;
      classesCount: number;
    };
  } | null>(null);
  const [backupMessage, setBackupMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(
    null
  );
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExportJson = async () => {
    const payload = await createBackupPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sao-luu-hinh-hoc-smart-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupMessage({ type: 'ok', text: 'Đã tải xuống tệp sao lưu JSON thành công.' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      const check = validateBackupJson(text);
      if (!check.valid || !check.payload || !check.summary) {
        setPendingBackup(null);
        setBackupMessage({ type: 'err', text: check.error ?? 'Tệp sao lưu không hợp lệ.' });
        return;
      }
      setPendingBackup({ payload: check.payload, summary: check.summary });
      setBackupMessage(null);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestore = async (mode: 'merge' | 'replace') => {
    if (!pendingBackup) return;
    await applyBackupPayload(pendingBackup.payload, mode);
    setPendingBackup(null);
    setBackupMessage({
      type: 'ok',
      text:
        mode === 'merge'
          ? 'Đã gộp dữ liệu thành công (giữ kỷ lục sao & bước tối ưu cao nhất, không trùng sao).'
          : 'Đã khôi phục thay thế toàn bộ dữ liệu từ bản sao lưu.',
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
          <Settings className="w-8 h-8 text-teal-700 dark:text-teal-400" />
          Cài đặt &amp; Quản lý dữ liệu cục bộ
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400">
          Tùy chỉnh trải nghiệm hiển thị, âm thanh, chế độ trình chiếu và sao lưu an toàn dữ liệu học tập ngay trên thiết bị.
        </p>
      </div>

      {/* Profile & Display */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hồ sơ &amp; Hiển thị</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Tên học viên (hiển thị trên Giấy chứng nhận &amp; Đấu trường)
            </span>
            <input
              type="text"
              value={settings.displayName}
              onChange={(e) => {
                updateSettings({ displayName: e.target.value });
                authService.updateDisplayName(e.target.value);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-base text-slate-900 dark:text-white"
            />
          </label>

          <label className="block space-y-1.5 text-sm">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Chế độ dựng hình mặc định
            </span>
            <select
              value={settings.inputMode}
              onChange={(e) =>
                updateSettings({ inputMode: e.target.value as 'quick' | 'virtual_tools' })
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-base text-slate-900 dark:text-white"
            >
              <option value="quick">Chế độ Vẽ nhanh</option>
              <option value="virtual_tools">Thước &amp; Compa ảo trực quan</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Presentation className="w-5 h-5 text-violet-600 shrink-0" />
              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">
                  Chế độ trình chiếu (20–28px)
                </div>
                <div className="text-xs text-slate-500">Tự động phóng lớn chữ cho TV / Máy chiếu</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.presentationMode}
              onChange={(e) => updateSettings({ presentationMode: e.target.checked })}
              className="w-5 h-5 rounded text-teal-700"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 cursor-pointer">
            <div className="flex items-center gap-2.5">
              <Compass className="w-5 h-5 text-teal-700 shrink-0" />
              <div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">
                  Giao diện nền tối (Dark Mode)
                </div>
                <div className="text-xs text-slate-500">Dịu mắt khi học vào buổi tối</div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.theme === 'dark'}
              onChange={(e) => updateSettings({ theme: e.target.checked ? 'dark' : 'light' })}
              className="w-5 h-5 rounded text-teal-700"
            />
          </label>

          <label className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 cursor-pointer">
            <div>
              <div className="font-semibold text-sm text-slate-900 dark:text-white">
                Giảm hiệu ứng chuyển động
              </div>
              <div className="text-xs text-slate-500">Tắt hiệu ứng chúc mừng và rút gọn hoạt ảnh kiểm chứng</div>
            </div>
            <input
              type="checkbox"
              checked={settings.reducedMotion}
              onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
              className="w-5 h-5 rounded text-teal-700"
            />
          </label>

          <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5">
            <div>
              <div className="font-semibold text-sm text-slate-900 dark:text-white">
                Tốc độ trình phát hoạt ảnh
              </div>
              <div className="text-xs text-slate-500">Áp dụng cho trình phát lời giải và kiểm chứng hình học động</div>
            </div>
            <select
              value={settings.animationSpeed}
              onChange={(e) =>
                updateSettings({
                  animationSpeed: Number(e.target.value) as 0.5 | 1 | 1.5 | 2,
                })
              }
              className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono-tabular"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>
        </div>
      </section>

      {/* Web Audio Settings */}
      <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-sky-600" />
            Âm thanh &amp; Nhạc nền (Web Audio)
          </h2>
          <button
            type="button"
            onClick={() => audioService.play('complete')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/30"
          >
            Nghe thử âm thanh
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <label className="flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-white">
              <span>Hiệu ứng âm thanh thao tác &amp; chiến thắng</span>
              <input
                type="checkbox"
                checked={settings.sfxEnabled}
                onChange={(e) => updateSettings({ sfxEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-teal-700"
              />
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.sfxVolume}
              disabled={!settings.sfxEnabled}
              onChange={(e) => updateSettings({ sfxVolume: Number(e.target.value) })}
              className="w-full accent-teal-700"
            />
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
            <label className="flex items-center justify-between text-sm font-semibold text-slate-900 dark:text-white">
              <span className="inline-flex items-center gap-1.5">
                <Music className="w-4 h-4 text-violet-600" />
                Nhạc nền tập trung nhẹ nhàng
              </span>
              <input
                type="checkbox"
                checked={settings.musicEnabled}
                onChange={(e) => updateSettings({ musicEnabled: e.target.checked })}
                className="w-5 h-5 rounded text-teal-700"
              />
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.musicVolume}
              disabled={!settings.musicEnabled}
              onChange={(e) => updateSettings({ musicVolume: Number(e.target.value) })}
              className="w-full accent-violet-600"
            />
          </div>
        </div>
      </section>

      {/* Local Data Storage, Backup & Restore, PWA */}
      <section
        id="backup-section"
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 scroll-mt-20"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-teal-700" />
              Lưu trữ cục bộ, Sao lưu &amp; Khôi phục, Cài đặt ngoại tuyến
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Dữ liệu hiện tại trên thiết bị: <strong>{stats.completedCount}</strong> bài hoàn thành ·{' '}
              <strong>★{stats.totalStars}</strong> sao · <strong>{drawings.length}</strong> bản vẽ ·{' '}
              <strong>{customChallenges.length}</strong> bài giáo viên tạo · <strong>{classes.length}</strong> lớp học.
            </p>
          </div>
          <PWAInstallButton />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleExportJson()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
          >
            <Download className="w-4 h-4" />
            Xuất tệp sao lưu JSON
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50"
          >
            <Upload className="w-4 h-4" />
            Nhập &amp; Khôi phục từ JSON
          </button>
        </div>

        {backupMessage && (
          <div
            className={`rounded-xl px-4 py-3 text-sm flex items-center gap-2 ${
              backupMessage.type === 'ok'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            {backupMessage.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            {backupMessage.text}
          </div>
        )}

        {/* Restore Preview & Merge/Replace Confirmation */}
        {pendingBackup && (
          <div className="rounded-xl border-2 border-sky-300 dark:border-sky-700 bg-sky-50/70 dark:bg-sky-950/30 p-4 space-y-3">
            <div className="font-bold text-slate-900 dark:text-white">
              Xác nhận khôi phục bản sao lưu hợp lệ
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-200 space-y-1">
              <div>
                Ngày xuất:{' '}
                <strong>
                  {pendingBackup.summary.exportedAt
                    ? new Date(pendingBackup.summary.exportedAt).toLocaleString('vi-VN')
                    : 'Không rõ'}
                </strong>
              </div>
              <div>
                Nội dung: <strong>{pendingBackup.summary.completedCount}</strong> bài hoàn thành ·{' '}
                <strong>★{pendingBackup.summary.totalStars}</strong> sao ·{' '}
                <strong>{pendingBackup.summary.drawingsCount}</strong> bản vẽ ·{' '}
                <strong>{pendingBackup.summary.teacherChallengesCount}</strong> thử thách tự tạo ·{' '}
                <strong>{pendingBackup.summary.classesCount}</strong> lớp học.
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={() => void handleConfirmRestore('merge')}
                className="px-4 py-2 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
              >
                Gộp dữ liệu (Khuyên dùng – giữ điểm cao nhất)
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmRestore('replace')}
                className="px-4 py-2 rounded-lg bg-amber-600 text-white text-sm font-semibold hover:bg-amber-700"
              >
                Thay thế toàn bộ dữ liệu hiện tại
              </button>
              <button
                type="button"
                onClick={() => setPendingBackup(null)}
                className="px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200/70"
              >
                Hủy
              </button>
            </div>
          </div>
        )}

        {/* Reset Local Progress */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Đặt lại toàn bộ tiến trình thử thách (sao &amp; lịch sử mở khóa) về trạng thái ban đầu.
          </div>
          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-sm font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <RotateCcw className="w-4 h-4" />
              Đặt lại tiến trình
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  await resetAllProgress();
                  setConfirmReset(false);
                  setBackupMessage({ type: 'ok', text: 'Đã đặt lại tiến trình thử thách về ban đầu.' });
                }}
                className="px-3.5 py-2 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700"
              >
                Xác nhận xóa tiến trình
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-300"
              >
                Hủy
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
