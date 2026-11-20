import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  ChevronDown,
  Compass,
  FileBadge,
  GraduationCap,
  HardDrive,
  HelpCircle,
  Home,
  Layers,
  Map,
  Menu,
  Moon,
  Presentation,
  Ruler,
  Settings,
  Sun,
  Swords,
  X,
} from 'lucide-react';
import { type PageId, useApp } from '../../store/AppContext';
import { PWAInstallButton } from './PWAInstallButton';

interface PrimaryNavItem {
  id: PageId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SecondaryNavItem {
  key: string;
  pageId: PageId;
  sectionId?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRIMARY_NAV: PrimaryNavItem[] = [
  { id: 'home', label: 'Trang chủ', icon: Home },
  { id: 'campaign', label: 'Thử thách', icon: Map },
  { id: 'lab', label: 'Phòng thực hành', icon: Ruler },
  { id: 'grades', label: 'Theo lớp', icon: Layers },
  { id: 'arena', label: 'Đấu trường', icon: Swords },
  { id: 'library', label: 'Thư viện', icon: BookOpen },
];

const SECONDARY_NAV: SecondaryNavItem[] = [
  { key: 'achievements', pageId: 'achievements', label: 'Thành tích học tập', icon: Award },
  {
    key: 'certificate',
    pageId: 'achievements',
    sectionId: 'certificate-section',
    label: 'Giấy chứng nhận',
    icon: FileBadge,
  },
  { key: 'teacher', pageId: 'teacher', label: 'Công cụ giáo viên', icon: GraduationCap },
  { key: 'guide', pageId: 'guide', label: 'Hướng dẫn sử dụng', icon: HelpCircle },
  {
    key: 'backup',
    pageId: 'settings',
    sectionId: 'backup-section',
    label: 'Sao lưu và khôi phục',
    icon: HardDrive,
  },
  { key: 'settings', pageId: 'settings', label: 'Cài đặt', icon: Settings },
];

export const Header: React.FC = () => {
  const { page, setPage, settings, updateSettings, stats, stats3D, campaignDimension } = useApp();
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeStarStats = campaignDimension === '3d' ? stats3D : stats;

  const navigate = (target: PageId, sectionId?: string) => {
    setPage(target);
    setMoreOpen(false);
    setMobileMenuOpen(false);
    if (sectionId) {
      window.setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 60);
    }
  };

  const isSecondaryActive = SECONDARY_NAV.some((item) => item.pageId === page);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200/90 dark:border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Left: Brand */}
        <button
          type="button"
          onClick={() => navigate('home')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs group-hover:bg-teal-800 transition-colors">
            <Compass className="w-5 h-5" />
          </div>
          <div className="leading-tight">
            <div className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
              Học Viện Hình Học Smart
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Khám phá – Dựng hình – Chinh phục
            </div>
          </div>
        </button>

        {/* Center: Primary navigation (7 items: 6 links + Mở rộng) */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Điều hướng chính">
          {PRIMARY_NAV.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(item.id)}
                className={`px-3 py-2 rounded-lg text-[15px] font-medium whitespace-nowrap shrink-0 transition-colors ${
                  active
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Secondary dropdown: Mở rộng */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMoreOpen((v) => !v)}
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-[15px] font-medium whitespace-nowrap shrink-0 transition-colors ${
                isSecondaryActive
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              aria-expanded={moreOpen}
              aria-haspopup="menu"
            >
              Mở rộng
              <ChevronDown className="w-4 h-4" />
            </button>

            {moreOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                <div
                  role="menu"
                  className="absolute right-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg py-1.5 z-20"
                >
                  {SECONDARY_NAV.map((item) => {
                    const Icon = item.icon;
                    const active = page === item.pageId && !item.sectionId;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        role="menuitem"
                        onClick={() => navigate(item.pageId, item.sectionId)}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-[15px] text-left transition-colors ${
                          active
                            ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold'
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0 text-teal-700 dark:text-teal-400" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Right: Quick controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate('achievements')}
            className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[15px] font-mono-tabular font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 whitespace-nowrap shrink-0"
            title={`Thử thách 3D: ★ ${stats3D.totalStars}/${stats3D.maxStars} · Thử thách 2D: ★ ${stats.totalStars}/${stats.maxStars}`}
          >
            ★ {activeStarStats.totalStars}/{activeStarStats.maxStars}
          </button>

          <div className="hidden sm:block">
            <PWAInstallButton compact />
          </div>

          <button
            type="button"
            onClick={() => updateSettings({ presentationMode: !settings.presentationMode })}
            className={`p-2 rounded-lg transition-colors shrink-0 ${
              settings.presentationMode
                ? 'bg-violet-600 text-white'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={
              settings.presentationMode
                ? 'Tắt chế độ trình chiếu'
                : 'Bật chế độ trình chiếu (phóng lớn chữ cho máy chiếu/TV)'
            }
            aria-label="Chế độ trình chiếu"
          >
            <Presentation className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
            }
            className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            title="Đổi giao diện sáng/tối"
            aria-label="Đổi giao diện sáng tối"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
            aria-label="Mở menu điều hướng"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Slide-down Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-3 shadow-lg">
          <div className="grid grid-cols-2 gap-1.5">
            {PRIMARY_NAV.map((item) => {
              const Icon = item.icon;
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  className={`min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-lg text-[15px] font-medium ${
                    active
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Mở rộng
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {SECONDARY_NAV.map((item) => {
                const Icon = item.icon;
                const active = page === item.pageId && !item.sectionId;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => navigate(item.pageId, item.sectionId)}
                    className={`min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                      active
                        ? 'bg-teal-700 text-white'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm font-mono-tabular font-semibold text-amber-700 dark:text-amber-300">
              ★ {activeStarStats.totalStars}/{activeStarStats.maxStars} sao · {stats.rank.current.title}
            </span>
            <PWAInstallButton compact />
          </div>
        </div>
      )}
    </header>
  );
};
