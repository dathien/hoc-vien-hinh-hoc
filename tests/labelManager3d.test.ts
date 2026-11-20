import { describe, expect, it } from 'vitest';
import { exportScene3DToVectorSvg } from '../src/geometry3d/export3d';
import {
  boxesIntersect,
  GeometryLabelManager,
  type LabelInput,
} from '../src/geometry3d/labelManager';
import {
  buildShowcaseModel,
  projectShowcaseFrame,
} from '../src/geometry3d/showcasePreview3d';
import { TEMPLATES_3D } from '../src/geometry3d/templates3d';

describe('GeometryLabelManager & 3D Continuous 60-Second Rotation Stability', () => {
  it('HomePage hero_pyramid: 60s continuous rotation (3,600 frames @ 60fps) has zero S flicker, zero S/z overlap, and zero wrap hitch', () => {
    const model = buildShowcaseModel('hero_pyramid');
    const manager = new GeometryLabelManager();
    const width = 320;
    const height = 210;
    const dt = 1 / 60;
    const speed = 0.34; // rad/s (exact LiveGeo3DPreview speed)
    const totalFrames = 3600; // 60 seconds continuous rotation (> 3 full 360° revolutions)

    let angle = 0.58;
    let prevSX: number | null = null;
    let prevSY: number | null = null;
    let maxSJump = 0;
    let minSZDistance = Infinity;
    let szOverlapCount = 0;
    let anyPairOverlapCount = 0;
    let outOfBoundsCount = 0;

    for (let f = 0; f < totalFrames; f++) {
      angle = (angle + dt * speed) % (Math.PI * 2);
      const frame = projectShowcaseFrame(
        model,
        angle,
        width,
        height,
        manager,
        f === 0 ? 0 : dt
      );

      // Unique IDs check
      const idSet = new Set(frame.labels.map((l) => l.id));
      expect(idSet.size).toBe(frame.labels.length);

      const labelS = frame.labels.find((l) => l.text === 'S');
      const labelZ = frame.labels.find((l) => l.id === '_axis_z');
      expect(labelS).toBeDefined();
      expect(labelZ).toBeDefined();
      if (!labelS || !labelZ) continue;

      // S must never overlap z
      if (boxesIntersect(labelS, labelZ, 0)) {
        szOverlapCount += 1;
      }
      const szDist = Math.hypot(labelS.x - labelZ.x, labelS.y - labelZ.y);
      if (szDist < minSZDistance) minSZDistance = szDist;

      // S must never flicker/teleport frame-to-frame
      if (prevSX !== null && prevSY !== null) {
        const jump = Math.hypot(labelS.x - prevSX, labelS.y - prevSY);
        if (jump > maxSJump) maxSJump = jump;
      }
      prevSX = labelS.x;
      prevSY = labelS.y;

      // Check viewport bounds and pairwise overlaps
      for (let i = 0; i < frame.labels.length; i++) {
        const a = frame.labels[i];
        if (
          a.x - a.width * 0.5 < 0 ||
          a.x + a.width * 0.5 > width ||
          a.y - a.height * 0.5 < 0 ||
          a.y + a.height * 0.5 > height
        ) {
          outOfBoundsCount += 1;
        }
        for (let j = i + 1; j < frame.labels.length; j++) {
          if (boxesIntersect(a, frame.labels[j], 0)) {
            anyPairOverlapCount += 1;
          }
        }
      }

      // Solid edge visibility/hidden classification must always remain valid
      expect(frame.edges.some((e) => !e.hidden)).toBe(true);
    }

    expect(szOverlapCount).toBe(0);
    expect(anyPairOverlapCount).toBe(0);
    expect(outOfBoundsCount).toBe(0);
    expect(minSZDistance).toBeGreaterThanOrEqual(18);
    expect(maxSJump).toBeLessThan(1.5);
  });

  it('HomePage hero_pyramid stays stable across multiple viewport sizes (compact 260x170 and large 800x520)', () => {
    const model = buildShowcaseModel('hero_pyramid');
    for (const [w, h] of [
      [260, 170],
      [480, 320],
      [800, 520],
    ] as const) {
      const manager = new GeometryLabelManager();
      let angle = 0;
      const dt = 1 / 60;
      let prevS: { x: number; y: number } | null = null;
      let maxJump = 0;

      for (let f = 0; f < 600; f++) {
        angle = (angle + dt * 0.6) % (Math.PI * 2);
        const frame = projectShowcaseFrame(model, angle, w, h, manager, f === 0 ? 0 : dt);
        const s = frame.labels.find((l) => l.text === 'S')!;
        const z = frame.labels.find((l) => l.id === '_axis_z')!;
        expect(s).toBeDefined();
        expect(z).toBeDefined();
        expect(boxesIntersect(s, z, 0)).toBe(false);
        if (prevS) {
          maxJump = Math.max(maxJump, Math.hypot(s.x - prevS.x, s.y - prevS.y));
        }
        prevS = { x: s.x, y: s.y };
      }
      expect(maxJump).toBeLessThan(2.0);
    }
  });

  it('Lab lab_cube_section: 60s continuous rotation (3,600 frames) preserves all vertices, cross-section labels, and axes without clipping', () => {
    const model = buildShowcaseModel('lab_cube_section');
    const manager = new GeometryLabelManager();
    const width = 360;
    const height = 210;
    const dt = 1 / 60;
    let angle = 0.58;
    let outOfBounds = 0;
    let overlapCount = 0;

    for (let f = 0; f < 3600; f++) {
      angle = (angle + dt * 0.34) % (Math.PI * 2);
      const frame = projectShowcaseFrame(model, angle, width, height, manager, f === 0 ? 0 : dt);
      expect(frame.labels.length).toBe(model.points.length + model.axisLabels.length);

      for (let i = 0; i < frame.labels.length; i++) {
        const a = frame.labels[i];
        if (
          a.x - a.width * 0.5 < 0 ||
          a.x + a.width * 0.5 > width ||
          a.y - a.height * 0.5 < 0 ||
          a.y + a.height * 0.5 > height
        ) {
          outOfBounds += 1;
        }
        for (let j = i + 1; j < frame.labels.length; j++) {
          if (boxesIntersect(a, frame.labels[j], 0)) {
            overlapCount += 1;
          }
        }
      }
    }

    expect(outOfBounds).toBe(0);
    expect(overlapCount).toBe(0);
  });

  it('Dense Oxyz & tall apex S near z-axis tip: hysteresis prevents flicker and keeps S, z, coordinates, measurements, and formulas non-overlapping', () => {
    const manager = new GeometryLabelManager();
    const width = 960;
    const height = 640;
    const dt = 1 / 60;
    let prevS: { x: number; y: number } | null = null;
    let maxSJump = 0;

    for (let f = 0; f < 3600; f++) {
      const ang = (f * dt * 0.45) % (Math.PI * 2);
      // Simulate tiny floating-point noise on vertical axis x = width/2 ± 1e-12
      const eps = (f % 2 === 0 ? 1 : -1) * 1e-12;
      const inputs: LabelInput[] = [
        {
          id: 'solid_v_S',
          objectId: 'solid_1',
          text: 'S',
          category: 'point',
          color: '#0F172A',
          anchorX: width * 0.5 + eps,
          anchorY: 132,
        },
        {
          id: '_axis_z',
          objectId: '_axis_z',
          text: 'z',
          category: 'axis',
          color: '#0284C7',
          anchorX: width * 0.5 - eps,
          anchorY: 118,
          preferredDir: { x: 14, y: -120 },
        },
        {
          id: 'pt_A',
          objectId: 'pt_A',
          text: 'A(2; 0; 0)',
          category: 'coord',
          color: '#0F172A',
          anchorX: width * 0.5 + Math.cos(ang) * 180,
          anchorY: height * 0.62 + Math.sin(ang) * 55,
        },
        {
          id: 'pt_B',
          objectId: 'pt_B',
          text: 'B(0; 2; 0)',
          category: 'coord',
          color: '#0F172A',
          anchorX: width * 0.5 + Math.cos(ang + Math.PI * 0.5) * 180,
          anchorY: height * 0.62 + Math.sin(ang + Math.PI * 0.5) * 55,
        },
        {
          id: 'meas_1',
          objectId: 'meas_1',
          text: 'SO = 6.0',
          category: 'measure',
          color: '#0F766E',
          anchorX: width * 0.5,
          anchorY: 260,
        },
        {
          id: 'form_1',
          objectId: 'form_1',
          text: 'V = 1/3 B·h',
          category: 'formula',
          color: '#0F172A',
          anchorX: width * 0.5 + 18,
          anchorY: 270,
        },
      ];

      const resolved = manager.update(inputs, {
        width,
        height,
        fontSize: 15,
        dt: f === 0 ? 0 : dt,
        edges: [
          { x1: width * 0.5, y1: 420, x2: width * 0.5, y2: 118 },
        ],
      });

      const s = resolved.find((l) => l.id === 'solid_v_S')!;
      const z = resolved.find((l) => l.id === '_axis_z')!;
      expect(boxesIntersect(s, z, 0)).toBe(false);

      for (let i = 0; i < resolved.length; i++) {
        for (let j = i + 1; j < resolved.length; j++) {
          expect(boxesIntersect(resolved[i], resolved[j], 0)).toBe(false);
        }
      }

      if (prevS) {
        maxSJump = Math.max(maxSJump, Math.hypot(s.x - prevS.x, s.y - prevS.y));
      }
      prevS = { x: s.x, y: s.y };
    }

    // Even with alternating ±1e-12 IEEE-754 jitter every single frame, S moves 0.00px!
    expect(maxSJump).toBeLessThan(0.01);
  });

  it('exportScene3DToVectorSvg uses GeometryLabelManager with crisp white halo', () => {
    const tpl = TEMPLATES_3D.find((t) => t.id.includes('pyramid') || t.title.toLowerCase().includes('chóp')) ?? TEMPLATES_3D[0];
    expect(tpl).toBeDefined();
    if (!tpl) return;
    const svg = exportScene3DToVectorSvg(tpl.buildScene(), 900, 620);
    expect(svg).toContain('paint-order="stroke"');
    expect(svg).toContain('text-anchor="middle"');
    expect(svg).toContain('<text ');
  });
});
