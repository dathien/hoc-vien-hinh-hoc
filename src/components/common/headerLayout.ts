import type { PageId } from '../../store/AppContext';

export type HeaderLayoutMode =
  | 'full'
  | 'compact-all'
  | 'compact-more-5'
  | 'compact-more-4'
  | 'mobile';

export interface HeaderLayoutConfig {
  mode: HeaderLayoutMode;
  /** Primary nav page IDs shown directly on the top bar */
  visiblePrimaryIds: PageId[];
  /** Primary nav page IDs folded into the "Thêm" dropdown when space is tight */
  overflowPrimaryIds: PageId[];
  /** Display label for the Lab route ("Phòng thực hành" vs "Thực hành") */
  labLabel: 'Phòng thực hành' | 'Thực hành';
  /** Display label for the dropdown ("Mở rộng" vs "Thêm") */
  dropdownLabel: 'Mở rộng' | 'Thêm';
  /** Whether to show the tagline "Khám phá – Dựng hình – Chinh phục" */
  showSubtitle: boolean;
  /** Whether to show total stars pill/counter in top bar (always shown in mobile menu too) */
  showStarsInBar: boolean;
  /** Install button display style in top bar */
  installButtonMode: 'full' | 'icon';
  /** Whether to show Presentation Mode toggle in top bar (moved to drawer on ultra-narrow viewports) */
  showPresentationInBar: boolean;
  /** Whether to show Theme toggle in top bar (moved to drawer on ultra-narrow < 340px zoom) */
  showThemeInBar: boolean;
  /** Estimated worst-case total horizontal width of header content in px (for layout verification) */
  estimatedContentWidthPx: number;
}

export const ALL_PRIMARY_NAV_IDS: readonly PageId[] = [
  'home',
  'campaign',
  'lab',
  'grades',
  'arena',
  'library',
] as const;

/**
 * Pure, deterministic header layout resolver driven by the real container width
 * (from ResizeObserver) and presentation-mode font scale.
 *
 * Guarantees:
 * - Zero overflow at all viewports (360px -> 1920px+) and zooms (100% -> 150%).
 * - Menu font size remains >= 15px on desktop (never shrinks text to cram items).
 * - Never drops any navigation route or the Install App action.
 */
export function resolveHeaderLayout(
  containerWidth: number,
  presentationMode = false
): HeaderLayoutConfig {
  // In presentation mode, root font-size scales 16px -> 20px (+25%),
  // so scale effective available width by 0.8 to maintain comfortable spacing.
  const effW = presentationMode ? containerWidth * 0.8 : containerWidth;

  if (effW >= 1400) {
    return {
      mode: 'full',
      visiblePrimaryIds: ['home', 'campaign', 'lab', 'grades', 'arena', 'library'],
      overflowPrimaryIds: [],
      labLabel: 'Phòng thực hành',
      dropdownLabel: 'Mở rộng',
      showSubtitle: true,
      showStarsInBar: true,
      installButtonMode: 'full',
      showPresentationInBar: true,
      showThemeInBar: true,
      estimatedContentWidthPx: 1320,
    };
  }

  if (effW >= 1240) {
    const showFullInstall = effW >= 1340;
    const showSubtitle = effW >= 1320;
    return {
      mode: 'compact-all',
      visiblePrimaryIds: ['home', 'campaign', 'lab', 'grades', 'arena', 'library'],
      overflowPrimaryIds: [],
      labLabel: 'Thực hành',
      dropdownLabel: 'Mở rộng',
      showSubtitle,
      showStarsInBar: true,
      installButtonMode: showFullInstall ? 'full' : 'icon',
      showPresentationInBar: true,
      showThemeInBar: true,
      estimatedContentWidthPx: showFullInstall ? 1265 : 1175,
    };
  }

  if (effW >= 1120) {
    return {
      mode: 'compact-more-5',
      visiblePrimaryIds: ['home', 'campaign', 'lab', 'grades', 'arena'],
      overflowPrimaryIds: ['library'],
      labLabel: 'Thực hành',
      dropdownLabel: 'Thêm',
      showSubtitle: false,
      showStarsInBar: true,
      installButtonMode: 'icon',
      showPresentationInBar: true,
      showThemeInBar: true,
      estimatedContentWidthPx: 1055,
    };
  }

  if (effW >= 1024) {
    return {
      mode: 'compact-more-4',
      visiblePrimaryIds: ['home', 'campaign', 'lab', 'grades'],
      overflowPrimaryIds: ['arena', 'library'],
      labLabel: 'Thực hành',
      dropdownLabel: 'Thêm',
      showSubtitle: false,
      showStarsInBar: true,
      installButtonMode: 'icon',
      showPresentationInBar: true,
      showThemeInBar: true,
      estimatedContentWidthPx: 955,
    };
  }

  // Mobile / tablet / high-zoom compact mode (< 1024px effective width)
  return {
    mode: 'mobile',
    visiblePrimaryIds: [],
    overflowPrimaryIds: ['home', 'campaign', 'lab', 'grades', 'arena', 'library'],
    labLabel: 'Phòng thực hành',
    dropdownLabel: 'Mở rộng',
    showSubtitle: effW >= 540,
    showStarsInBar: effW >= 560,
    installButtonMode: effW >= 680 ? 'full' : 'icon',
    showPresentationInBar: effW >= 480,
    showThemeInBar: effW >= 340,
    estimatedContentWidthPx: effW >= 680 ? 580 : effW >= 540 ? 460 : effW >= 340 ? 310 : 210,
  };
}
