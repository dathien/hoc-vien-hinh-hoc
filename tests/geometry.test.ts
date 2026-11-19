import { describe, expect, it } from 'vitest';
import {
  addGeoObject,
  computeSceneCosts,
  createEmptyScene,
  deleteObjectWithDependents,
  moveFreePoint,
  recomputeScene,
} from '../src/geometry/engine';
import {
  angleDegrees,
  areCollinear,
  areParallel,
  arePerpendicular,
  dist,
  isEquilateralTriangle,
} from '../src/geometry/math';
import type { GeoPoint } from '../src/geometry/types';
import { getChallengeById, isChallengeUnlocked } from '../src/challenges';
import {
  applyPerturbation,
  buildInitialScene,
  generatePerturbations,
  validateChallengeConstruction,
} from '../src/validators/validator';

describe('Dynamic Geometry Engine (DAG)', () => {
  it('recomputes dependent objects accurately when parent free points move', () => {
    let scene = createEmptyScene();
    scene = addGeoObject(scene, {
      id: 'A',
      kind: 'point',
      rule: 'free_point',
      parents: [],
      x: 0,
      y: 0,
      label: 'A',
      tool: 'point',
    }).scene;
    scene = addGeoObject(scene, {
      id: 'B',
      kind: 'point',
      rule: 'free_point',
      parents: [],
      x: 100,
      y: 0,
      label: 'B',
      tool: 'point',
    }).scene;
    scene = addGeoObject(scene, {
      id: 'M',
      kind: 'point',
      rule: 'midpoint',
      parents: ['A', 'B'],
      label: 'M',
      tool: 'midpoint',
    }).scene;

    expect((scene.objects['M'] as GeoPoint).x).toBeCloseTo(50, 6);
    expect((scene.objects['M'] as GeoPoint).y).toBeCloseTo(0, 6);

    const moved = moveFreePoint(scene, 'B', { x: 200, y: 120 });
    expect((moved.objects['M'] as GeoPoint).x).toBeCloseTo(100, 6);
    expect((moved.objects['M'] as GeoPoint).y).toBeCloseTo(60, 6);
  });

  it('handles degeneracy gracefully without NaN values', () => {
    let scene = createEmptyScene();
    scene = addGeoObject(scene, {
      id: 'A',
      kind: 'point',
      rule: 'free_point',
      parents: [],
      x: 0,
      y: 0,
      label: 'A',
      tool: 'point',
    }).scene;
    scene = addGeoObject(scene, {
      id: 'B',
      kind: 'point',
      rule: 'free_point',
      parents: [],
      x: 100,
      y: 0,
      label: 'B',
      tool: 'point',
    }).scene;
    scene = addGeoObject(scene, {
      id: 'c1',
      kind: 'circle',
      rule: 'circle_center_point',
      parents: ['A', 'B'],
      label: 'c1',
      tool: 'circle_cp',
    }).scene;

    // Move B onto A (zero radius)
    const collapsed = moveFreePoint(scene, 'B', { x: 0, y: 0 });
    expect(collapsed.objects['c1'].valid).toBe(false);
    expect(Number.isNaN((collapsed.objects['A'] as GeoPoint).x)).toBe(false);
  });

  it('cascades deletion of dependent objects safely', () => {
    let scene = createEmptyScene();
    scene = addGeoObject(scene, { id: 'A', kind: 'point', rule: 'free_point', parents: [], x: 0, y: 0, tool: 'point' }).scene;
    scene = addGeoObject(scene, { id: 'B', kind: 'point', rule: 'free_point', parents: [], x: 80, y: 0, tool: 'point' }).scene;
    scene = addGeoObject(scene, { id: 's', kind: 'segment', rule: 'segment_two_points', parents: ['A', 'B'], tool: 'segment' }).scene;
    scene = addGeoObject(scene, { id: 'M', kind: 'point', rule: 'midpoint', parents: ['A', 'B'], tool: 'midpoint' }).scene;

    const afterDel = deleteObjectWithDependents(scene, 'B');
    expect(afterDel.objects['B']).toBeUndefined();
    expect(afterDel.objects['s']).toBeUndefined();
    expect(afterDel.objects['M']).toBeUndefined();
    expect(afterDel.objects['A']).toBeDefined();
  });

  it('verifies geometric predicates (collinear, parallel, perpendicular, equilateral)', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 100, y: 0 };
    const c = { x: 50, y: 50 * Math.sqrt(3) };
    expect(isEquilateralTriangle(a, b, c)).toBe(true);
    expect(angleDegrees(a, c, b)).toBeCloseTo(60, 4);
    expect(areCollinear({ x: 0, y: 0 }, { x: 50, y: 50 }, { x: 120, y: 120 }, 120)).toBe(true);
    expect(areParallel(a, b, { x: 0, y: 40 }, { x: 100, y: 40 })).toBe(true);
    expect(arePerpendicular(a, b, { x: 50, y: -20 }, { x: 50, y: 80 })).toBe(true);
  });
});

describe('Mandatory Acceptance Test: Level I – Challenge 1 (Tam giác đều)', () => {
  const ch1 = getChallengeById('L01_C01')!;
  const ch2 = getChallengeById('L01_C02')!;

  it('passes with 4L / 4E and 3 stars on BOTH sides of segment AB, survives 24 perturbations, and unlocks Challenge 2', () => {
    for (const branch of [0, 1]) {
      let scene = buildInitialScene(ch1);
      scene = addGeoObject(scene, {
        id: 'cA',
        kind: 'circle',
        rule: 'circle_center_point',
        parents: ['A', 'B'],
        tool: 'circle_cp',
      }).scene;
      scene = addGeoObject(scene, {
        id: 'cB',
        kind: 'circle',
        rule: 'circle_center_point',
        parents: ['B', 'A'],
        tool: 'circle_cp',
      }).scene;
      scene = addGeoObject(scene, {
        id: 'C',
        kind: 'point',
        rule: 'intersection_circle_circle',
        parents: ['cA', 'cB'],
        params: { branch },
        label: 'C',
        tool: 'intersect',
      }).scene;
      scene = addGeoObject(scene, {
        id: 'segAC',
        kind: 'segment',
        rule: 'segment_two_points',
        parents: ['A', 'C'],
        tool: 'segment',
      }).scene;
      scene = addGeoObject(scene, {
        id: 'segBC',
        kind: 'segment',
        rule: 'segment_two_points',
        parents: ['B', 'C'],
        tool: 'segment',
      }).scene;

      const costs = computeSceneCosts(scene);
      expect(costs.totalL).toBe(4);
      expect(costs.totalE).toBe(4);

      const report = validateChallengeConstruction(scene, ch1, 24);
      expect(report.valid).toBe(true);
      expect(report.stars).toBe(3);
      expect(report.star1Correct).toBe(true);
      expect(report.star2OptimalL).toBe(true);
      expect(report.star3OptimalE).toBe(true);
      expect(report.perturbationsPassed).toBe(report.perturbationsTested);
      expect(report.perturbationsTested).toBeGreaterThanOrEqual(24);

      // Verify exact equality after manual drag
      const dragged = moveFreePoint(recomputeScene(scene), 'B', { x: 175, y: -45 });
      const A = dragged.objects['A'] as GeoPoint;
      const B = dragged.objects['B'] as GeoPoint;
      const C = dragged.objects['C'] as GeoPoint;
      expect(dist(A, B)).toBeCloseTo(dist(A, C), 5);
      expect(dist(A, B)).toBeCloseTo(dist(B, C), 5);
    }

    // Unlock verification
    expect(isChallengeUnlocked(ch1, {})).toBe(true);
    expect(isChallengeUnlocked(ch2, {})).toBe(false);
    expect(isChallengeUnlocked(ch2, { L01_C01: { stars: 3 } })).toBe(true);
  });

  it('REJECTS a visually guessed (free-point) equilateral triangle during perturbation test', () => {
    let scene = buildInitialScene(ch1);
    const A = scene.objects['A'] as GeoPoint;
    const B = scene.objects['B'] as GeoPoint;
    const midX = (A.x + B.x) / 2;
    const h = (dist(A, B) * Math.sqrt(3)) / 2;

    // Place a FREE point C at the exact initial equilateral coordinate (cheating!)
    scene = addGeoObject(scene, {
      id: 'C_fake',
      kind: 'point',
      rule: 'free_point',
      parents: [],
      x: midX,
      y: A.y - h,
      label: 'C',
      tool: 'point',
    }).scene;
    scene = addGeoObject(scene, {
      id: 'segAC',
      kind: 'segment',
      rule: 'segment_two_points',
      parents: ['A', 'C_fake'],
      tool: 'segment',
    }).scene;
    scene = addGeoObject(scene, {
      id: 'segBC',
      kind: 'segment',
      rule: 'segment_two_points',
      parents: ['B', 'C_fake'],
      tool: 'segment',
    }).scene;

    const perts = generatePerturbations(scene, ch1, 10);
    expect(perts.length).toBe(10);
    const pertScene = applyPerturbation(scene, perts[0]);
    expect(pertScene.objects['C_fake']).toBeDefined();

    const report = validateChallengeConstruction(scene, ch1, 24);
    expect(report.valid).toBe(false);
    expect(report.stars).toBe(0);
  });
});
