import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { resolveHeaderLayout } from './headerLayout';
import { PWAInstallButton } from './PWAInstallButton';

interface PrimaryNavItem {
  id: PageId;
  label: string;
  compactLabel?: string;
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
  { id: 'lab', label: 'Phòng thực hành', compactLabel: 'Thực hành', icon: Ruler },
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
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerWidth, setHeaderWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeStarStats = campaignDimension === '3d' ? stats3D : stats;

  // Measure actual rendered header width (handles viewport resize, browser zoom 100-150%, & split panes)
  useEffect(() => {
    const el = headerRef.current;
    const syncWidth = () => {
      const nextW = el?.clientWidth || window.innerWidth;
      if (nextW > 0) setHeaderWidth(nextW);
    };
    syncWidth();

    let ro: ResizeObserver | null = null;
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect.width;
        if (w && w > 0) setHeaderWidth(Math.round(w));
      });
      ro.observe(el);
    }
    window.addEventListener('resize', syncWidth);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', syncWidth);
    };
  }, []);

  const layout = useMemo(
    () => resolveHeaderLayout(headerWidth, settings.presentationMode),
    [headerWidth, settings.presentationMode]
  );

  // Close mobile menu automatically when expanding to desktop layout
  useEffect(() => {
    if (layout.mode !== 'mobile' && mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [layout.mode, mobileMenuOpen]);

  // Close dropdowns on Escape key for clean keyboard accessibility
  useEffect(() => {
    if (!moreOpen && !mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [moreOpen, mobileMenuOpen]);

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

  const visiblePrimaryItems = useMemo(
    () =>
      layout.visiblePrimaryIds
        .map((id) => PRIMARY_NAV.find((item) => item.id === id))
        .filter((item): item is PrimaryNavItem => Boolean(item)),
    [layout.visiblePrimaryIds]
  );

  const overflowPrimaryItems = useMemo(
    () =>
      layout.overflowPrimaryIds
        .map((id) => PRIMARY_NAV.find((item) => item.id === id))
        .filter((item): item is PrimaryNavItem => Boolean(item)),
    [layout.overflowPrimaryIds]
  );

  const isDropdownActive =
    SECONDARY_NAV.some((item) => item.pageId === page) ||
    (layout.mode !== 'mobile' && overflowPrimaryItems.some((item) => item.id === page));

  const isMobile = layout.mode === 'mobile';
  const isFullDesktop = layout.mode === 'full';
  const isVeryNarrow = headerWidth < 430;

  return (
    <header
      ref={headerRef}
      data-header-mode={layout.mode}
      className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200/90 dark:border-slate-800 no-print"
    >
      <div
        className={`w-full max-w-[1600px] mx-auto flex items-center justify-between min-w-0 ${
          isFullDesktop
            ? 'h-[68px] px-6 gap-4'
            : isMobile
            ? 'h-16 px-3 sm:px-5 gap-2'
            : 'h-16 px-4 xl:px-5 gap-2.5'
        }`}
      >
        {/* Zone 1 (Left): Brand */}
        <button
          type="button"
          onClick={() => navigate('home')}
          className="flex items-center gap-2 sm:gap-2.5 text-left min-w-0 shrink group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 rounded-lg"
        >
          <div
            className={`rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs group-hover:bg-teal-800 transition-colors shrink-0 ${
              isVeryNarrow ? 'w-8 h-8' : 'w-9 h-9'
            }`}
          >
            <Compass className={isVeryNarrow ? 'w-4 h-4' : 'w-5 h-5'} />
          </div>
          <div className="min-w-0 leading-tight">
            <div
              className={`font-bold text-slate-900 dark:text-white tracking-tight ${
                isFullDesktop
                  ? 'text-[19px] whitespace-nowrap'
                  : !isMobile
                  ? 'text-[18px] whitespace-nowrap'
                  : isVeryNarrow
                  ? 'text-[15px] leading-[1.18]'
                  : 'text-[17px] whitespace-nowrap'
              }`}
            >
              Học Viện Hình Học Smart
            </div>
            {layout.showSubtitle && (
              <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                Khám phá – Dựng hình – Chinh phục
              </div>
            )}
          </div>
        </button>

        {/* Zone 2 (Center): Primary Navigation (Desktop >= 1024px effective width) */}
        {!isMobile && (
          <nav
            className={`flex items-center justify-center min-w-0 ${
              isFullDesktop ? 'gap-1' : 'gap-0.5'
            }`}
            aria-label="Điều hướng chính"
          >
            {visiblePrimaryItems.map((item) => {
              const active = page === item.id;
              const displayLabel =
                item.id === 'lab' ? layout.labLabel : item.label;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.id)}
                  className={`min-h-[40px] rounded-lg text-[15px] font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
                    isFullDesktop ? 'px-2.5 py-2' : 'px-2 py-2'
                  } ${
                    active
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {displayLabel}
                </button>
              );
            })}

            {/* Overflow / Secondary Dropdown ("Mở rộng" or "Thêm") */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                className={`min-h-[40px] inline-flex items-center gap-1 rounded-lg text-[15px] font-medium whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 ${
                  isFullDesktop ? 'px-2.5 py-2' : 'px-2 py-2'
                } ${
                  isDropdownActive
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
                aria-expanded={moreOpen}
                aria-haspopup="menu"
              >
                <span>{layout.dropdownLabel}</span>
                <ChevronDown
                  className={`w-4 h-4 shrink-0 transition-transform duration-150 ${
                    moreOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {moreOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMoreOpen(false)} />
                  <div
                    role="menu"
                    className="absolute right-0 mt-1.5 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg py-1.5 z-20"
                  >
                    {overflowPrimaryItems.length > 0 && (
                      <>
                        {overflowPrimaryItems.map((item) => {
                          const Icon = item.icon;
                          const active = page === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              role="menuitem"
                              onClick={() => navigate(item.id)}
                              className={`w-full min-h-[42px] flex items-center gap-2.5 px-3.5 py-2 text-[15px] text-left transition-colors ${
                                active
                                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-semibold'
                                  : 'text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium'
                              }`}
                            >
                              <Icon className="w-4 h-4 shrink-0 text-teal-700 dark:text-teal-400" />
                              <span>{item.label}</span>
                            </button>
                          );
                        })}
                        <div className="my-1.5 border-t border-slate-100 dark:border-slate-800" />
                      </>
                    )}

                    {SECONDARY_NAV.map((item) => {
                      const Icon = item.icon;
                      const active = page === item.pageId && !item.sectionId;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          role="menuitem"
                          onClick={() => navigate(item.pageId, item.sectionId)}
                          className={`w-full min-h-[42px] flex items-center gap-2.5 px-3.5 py-2 text-[15px] text-left transition-colors ${
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
        )}

        {/* Zone 3 (Right): Utilities */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {layout.showStarsInBar && (
            <button
              type="button"
              onClick={() => navigate('achievements')}
              className="inline-flex items-center gap-1 h-9 px-2 rounded-lg text-[15px] font-mono-tabular font-semibold text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 whitespace-nowrap shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
              title={`Thử thách 3D: ★ ${stats3D.totalStars}/${stats3D.maxStars} · Thử thách 2D: ★ ${stats.totalStars}/${stats.maxStars}`}
            >
              <span aria-hidden="true">★</span>
              <span>
                {activeStarStats.totalStars}/{activeStarStats.maxStars}
              </span>
            </button>
          )}

          <PWAInstallButton
            compact={layout.installButtonMode === 'full'}
            iconOnly={layout.installButtonMode === 'icon'}
          />

          {layout.showPresentationInBar && (
            <button
              type="button"
              onClick={() => updateSettings({ presentationMode: !settings.presentationMode })}
              className={`w-9 h-9 inline-flex items-center justify-center rounded-lg transition-colors shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 ${
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
          )}

          {layout.showThemeInBar && (
            <button
              type="button"
              onClick={() =>
                updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })
              }
              className="w-9 h-9 inline-flex items-center justify-center rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
              title="Đổi giao diện sáng/tối"
              aria-label="Đổi giao diện sáng tối"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          )}

          {isMobile && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="w-10 h-10 inline-flex items-center justify-center rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
              aria-label={mobileMenuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Compact Dropdown Panel for < 1024px (non-blocking, auto-closes on selection) */}
      {isMobile && mobileMenuOpen && (
        <>
          <div
            className="fixed inset-x-0 top-16 bottom-0 z-10 bg-slate-900/20"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <nav
            aria-label="Điều hướng thu gọn"
            className="relative z-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 sm:px-5 py-3 space-y-3 shadow-lg max-h-[calc(100dvh-4.5rem)] overflow-y-auto"
          >
            <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-1.5">
              {PRIMARY_NAV.map((item) => {
                const Icon = item.icon;
                const active = page === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigate(item.id)}
                    className={`min-h-[44px] flex items-center gap-2.5 px-3 py-2 rounded-lg text-[15px] font-medium text-left transition-colors ${
                      active
                        ? 'bg-teal-700 text-white font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Mở rộng
              </div>
              <div className="grid grid-cols-1 min-[420px]:grid-cols-2 sm:grid-cols-3 gap-1.5">
                {SECONDARY_NAV.map((item) => {
                  const Icon = item.icon;
                  const active = page === item.pageId && !item.sectionId;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => navigate(item.pageId, item.sectionId)}
                      className={`min-h-[44px] flex items-center gap-2.5 px-3 py-2 rounded-lg text-[15px] font-medium text-left transition-colors ${
                        active
                          ? 'bg-teal-700 text-white font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => navigate('achievements')}
                className="text-sm font-mono-tabular font-semibold text-amber-700 dark:text-amber-300 hover:underline text-left"
              >
                ★ {activeStarStats.totalStars}/{activeStarStats.maxStars} sao ·{' '}
                {stats.rank.current.title}
              </button>

              <div className="flex items-center gap-1.5">
                {!layout.showPresentationInBar && (
                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({ presentationMode: !settings.presentationMode });
                      setMobileMenuOpen(false);
                    }}
                    className={`h-9 px-2.5 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium ${
                      settings.presentationMode
                        ? 'bg-violet-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Presentation className="w-4 h-4" />
                    <span>Trình chiếu</span>
                  </button>
                )}
                {!layout.showThemeInBar && (
                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
                      setMobileMenuOpen(false);
                    }}
                    className="h-9 px-2.5 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium"
                  >
                    {settings.theme === 'dark' ? (
                      <Sun className="w-4 h-4" />
                    ) : (
                      <Moon className="w-4 h-4" />
                    )}
                    <span>{settings.theme === 'dark' ? 'Sáng' : 'Tối'}</span>
                  </button>
                )}
                <PWAInstallButton compact />
              </div>
            </div>
          </nav>
        </>
      )}
    </header>
  );
};
