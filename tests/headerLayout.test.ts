import { describe, expect, it } from 'vitest';
import {
  ALL_PRIMARY_NAV_IDS,
  resolveHeaderLayout,
} from '../src/components/common/headerLayout';

const REQUIRED_WIDTHS = [1920, 1600, 1440, 1366, 1280, 1024, 768, 390, 360] as const;
const REQUIRED_ZOOMS = [1.0, 1.1, 1.25, 1.5] as const;

describe('Responsive Header Layout Matrix (9 resolutions x 4 zoom levels)', () => {
  it('never overflows and preserves every primary route and Install App action across all 36 viewport/zoom combinations', () => {
    for (const vw of REQUIRED_WIDTHS) {
      for (const zoom of REQUIRED_ZOOMS) {
        const effectiveWidth = Math.floor(vw / zoom);
        const cfg = resolveHeaderLayout(effectiveWidth, false);

        // 1. Estimated total horizontal width must fit cleanly inside effective container width
        expect(
          cfg.estimatedContentWidthPx,
          `Overflow detected at ${vw}px @ ${Math.round(zoom * 100)}% (effective ${effectiveWidth}px, mode=${cfg.mode})`
        ).toBeLessThanOrEqual(effectiveWidth);

        // 2. Every single primary route must exist in either visible bar or overflow menu (zero lost routes, zero duplicates)
        const combined = [...cfg.visiblePrimaryIds, ...cfg.overflowPrimaryIds];
        expect(combined.length).toBe(ALL_PRIMARY_NAV_IDS.length);
        expect(new Set(combined)).toEqual(new Set(ALL_PRIMARY_NAV_IDS));

        // 3. Install App button is ALWAYS accessible in the header (either full text or icon+tooltip)
        expect(['full', 'icon']).toContain(cfg.installButtonMode);
      }
    }
  });

  it('uses full desktop layout (>= 1440px @ 100%) with full labels, subtitle, stars, and full Install App button', () => {
    for (const vw of [1920, 1600, 1440]) {
      const cfg = resolveHeaderLayout(vw, false);
      expect(cfg.mode).toBe('full');
      expect(cfg.visiblePrimaryIds).toEqual(ALL_PRIMARY_NAV_IDS);
      expect(cfg.overflowPrimaryIds).toEqual([]);
      expect(cfg.labLabel).toBe('Phòng thực hành');
      expect(cfg.dropdownLabel).toBe('Mở rộng');
      expect(cfg.showSubtitle).toBe(true);
      expect(cfg.showStarsInBar).toBe(true);
      expect(cfg.installButtonMode).toBe('full');
    }
  });

  it('uses smart compact desktop modes (1024px–1366px @ 100%) shortening Lab label and folding overflow items into "Thêm"', () => {
    const cfg1366 = resolveHeaderLayout(1366, false);
    expect(cfg1366.mode).toBe('compact-all');
    expect(cfg1366.labLabel).toBe('Thực hành');
    expect(cfg1366.visiblePrimaryIds.length).toBe(6);

    const cfg1280 = resolveHeaderLayout(1280, false);
    expect(cfg1280.mode).toBe('compact-all');
    expect(cfg1280.labLabel).toBe('Thực hành');
    expect(cfg1280.installButtonMode).toBe('icon');

    const cfg1152 = resolveHeaderLayout(1152, false); // 1440 @ 125%
    expect(cfg1152.mode).toBe('compact-more-5');
    expect(cfg1152.dropdownLabel).toBe('Thêm');
    expect(cfg1152.overflowPrimaryIds).toContain('library');
    expect(cfg1152.installButtonMode).toBe('icon');

    const cfg1024 = resolveHeaderLayout(1024, false);
    expect(cfg1024.mode).toBe('compact-more-4');
    expect(cfg1024.dropdownLabel).toBe('Thêm');
    expect(cfg1024.overflowPrimaryIds).toEqual(['arena', 'library']);
    expect(cfg1024.installButtonMode).toBe('icon');
  });

  it('uses compact mobile menu below 1024px (768, 390, 360 and high zoom)', () => {
    const cfg768 = resolveHeaderLayout(768, false);
    expect(cfg768.mode).toBe('mobile');
    expect(cfg768.showStarsInBar).toBe(true);
    expect(cfg768.installButtonMode).toBe('full');

    const cfg390 = resolveHeaderLayout(390, false);
    expect(cfg390.mode).toBe('mobile');
    expect(cfg390.showStarsInBar).toBe(false);
    expect(cfg390.installButtonMode).toBe('icon');

    const cfg360 = resolveHeaderLayout(360, false);
    expect(cfg360.mode).toBe('mobile');
    expect(cfg360.installButtonMode).toBe('icon');
  });

  it('adapts cleanly in Presentation Mode (20px root font-size) without overflowing', () => {
    for (const vw of [1920, 1600, 1440, 1280, 1024]) {
      const cfg = resolveHeaderLayout(vw, true);
      expect(cfg.estimatedContentWidthPx).toBeLessThanOrEqual(vw * 0.8 + 1);
    }
  });
});
