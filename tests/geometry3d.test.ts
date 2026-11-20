import { describe, expect, it } from 'vitest';
import {
  addGeo3DObject,
  createEmptyScene3D,
  movePoint3D,
  renameGeo3DObject,
  updateGeo3DObject,
} from '../src/geometry3d/engine3d';
import {
  getObjectDescription3D,
  getObjectDisplayName3D,
  getPendingDisplayNames3D,
  groupObjects3D,
} from '../src/geometry3d/naming3d';
import {
  angleBetweenPlanesDeg,
  dihedralAngleDeg,
  dist3,
  dot3,
  isFiniteVec3,
  sub3,
  v3,
} from '../src/geometry3d/math3d';
import {
  exportScene3DToVectorSvg,
  parseScene3DFromJson,
  serializeScene3DToJson,
} from '../src/geometry3d/export3d';
import { TEMPLATES_3D } from '../src/geometry3d/templates3d';
import {
  ALL_CHALLENGES_3D,
  LEVELS_3D,
  TOTAL_POSSIBLE_3D_STARS,
  calcProgressPercent,
} from '../src/geometry3d/challenges3d';
import { validateChallenge3D } from '../src/geometry3d/validator3d';
import type {
  Geo3DCrossSection,
  Geo3DPlane,
  Geo3DPoint,
  Geo3DSolid,
  Geo3DVector,
} from '../src/geometry3d/types3d';

describe('Geometry3D Engine – Core Computational Geometry & Dynamic Constraints', () => {
  it('constructs a cube and dynamically updates 8 vertices, 12 equal edges, and V = a^3 when edge a changes', () => {
    let scene = createEmptyScene3D();
    const res = addGeo3DObject(scene, {
      id: 'cube1',
      kind: 'solid',
      rule: 'solid_cube',
      solidType: 'cube',
      label: "ABCD.A'B'C'D'",
      params: { a: 3 },
    });
    scene = res.scene;
    let cube = scene.objects['cube1'] as Geo3DSolid;
    let structuralEdges = cube.edges.filter((e) => !e.isDiagonal && !e.isAltitude && !e.isAxis);
    expect(cube.valid).toBe(true);
    expect(cube.vertices.length).toBe(8);
    expect(structuralEdges.length).toBe(12);
    expect(cube.volume).toBeCloseTo(27, 4);
    expect(cube.surfaceArea).toBeCloseTo(54, 4);
    for (const e of structuralEdges) {
      expect(dist3(cube.vertices[e.a], cube.vertices[e.b])).toBeCloseTo(3, 4);
    }

    // Change edge length a = 5
    scene = updateGeo3DObject(scene, 'cube1', (o) => ({
      ...o,
      params: { ...(o.params ?? {}), a: 5 },
    }));
    cube = scene.objects['cube1'] as Geo3DSolid;
    structuralEdges = cube.edges.filter((e) => !e.isDiagonal && !e.isAltitude && !e.isAxis);
    expect(cube.vertices.length).toBe(8);
    expect(structuralEdges.length).toBe(12);
    expect(cube.volume).toBeCloseTo(125, 4);
    expect(cube.surfaceArea).toBeCloseTo(150, 4);
    for (const e of structuralEdges) {
      expect(dist3(cube.vertices[e.a], cube.vertices[e.b])).toBeCloseTo(5, 4);
    }
  });

  it('constructs a regular square pyramid with altitude perpendicular to base and V = a^2 * h / 3', () => {
    let scene = createEmptyScene3D();
    const res = addGeo3DObject(scene, {
      id: 'pyr1',
      kind: 'solid',
      rule: 'solid_regular_pyramid',
      solidType: 'regular_pyramid',
      label: 'S.ABCD',
      params: { sides: 4, a: 4, h: 6 },
    });
    scene = res.scene;
    let pyr = scene.objects['pyr1'] as Geo3DSolid;
    expect(pyr.valid).toBe(true);
    expect(pyr.vertices.length).toBe(5);
    expect(pyr.volume).toBeCloseTo((4 * 4 * 6) / 3, 4);

    // Base center O is midpoint of diagonal A(0) and C(2); apex S is vertex 4
    const baseA = pyr.vertices[0];
    const baseB = pyr.vertices[1];
    const baseC = pyr.vertices[2];
    const apex = pyr.vertices[4];
    const baseCenter = v3((baseA.x + baseC.x) / 2, (baseA.y + baseC.y) / 2, (baseA.z + baseC.z) / 2);
    const altitude = sub3(apex, baseCenter);
    expect(dot3(altitude, sub3(baseB, baseA))).toBeCloseTo(0, 4);
    expect(dot3(altitude, sub3(baseC, baseB))).toBeCloseTo(0, 4);
    expect(dist3(apex, baseCenter)).toBeCloseTo(6, 4);

    // Dynamically change base edge and height
    scene = updateGeo3DObject(scene, 'pyr1', (o) => ({
      ...o,
      params: { ...(o.params ?? {}), sides: 4, a: 6, h: 5 },
    }));
    pyr = scene.objects['pyr1'] as Geo3DSolid;
    expect(pyr.volume).toBeCloseTo((6 * 6 * 5) / 3, 4);
  });

  it('dynamically recomputes midpoint M of AB when moving A and B', () => {
    let scene = createEmptyScene3D();
    scene = addGeo3DObject(scene, {
      id: 'A',
      kind: 'point',
      rule: 'free_point_3d',
      label: 'A',
      position: v3(0, 0, 0),
    }).scene;
    scene = addGeo3DObject(scene, {
      id: 'B',
      kind: 'point',
      rule: 'free_point_3d',
      label: 'B',
      position: v3(4, 2, 6),
    }).scene;
    scene = addGeo3DObject(scene, {
      id: 'M',
      kind: 'point',
      rule: 'midpoint_3d',
      label: 'M',
      parents: ['A', 'B'],
    }).scene;

    let M = scene.objects['M'] as Geo3DPoint;
    expect(M.valid).toBe(true);
    expect(M.position.x).toBeCloseTo(2, 5);
    expect(M.position.y).toBeCloseTo(1, 5);
    expect(M.position.z).toBeCloseTo(3, 5);

    scene = movePoint3D(scene, 'A', v3(-2, 4, 2));
    scene = movePoint3D(scene, 'B', v3(6, -2, 8));
    M = scene.objects['M'] as Geo3DPoint;
    expect(M.position.x).toBeCloseTo(2, 5);
    expect(M.position.y).toBeCloseTo(1, 5);
    expect(M.position.z).toBeCloseTo(5, 5);
  });

  it('handles plane through 3 points and safely reports collinear degeneracy without NaN', () => {
    let scene = createEmptyScene3D();
    scene = addGeo3DObject(scene, { id: 'P1', kind: 'point', rule: 'free_point_3d', label: 'A', position: v3(0, 0, 0) }).scene;
    scene = addGeo3DObject(scene, { id: 'P2', kind: 'point', rule: 'free_point_3d', label: 'B', position: v3(3, 0, 0) }).scene;
    scene = addGeo3DObject(scene, { id: 'P3', kind: 'point', rule: 'free_point_3d', label: 'C', position: v3(0, 3, 0) }).scene;
    scene = addGeo3DObject(scene, {
      id: 'pl',
      kind: 'plane',
      rule: 'plane_three_points',
      label: '(ABC)',
      parents: ['P1', 'P2', 'P3'],
    }).scene;

    let pl = scene.objects['pl'] as Geo3DPlane;
    expect(pl.valid).toBe(true);
    expect(Math.abs(pl.normal.z)).toBeCloseTo(1, 5);

    // Move C to be collinear with A and B
    scene = movePoint3D(scene, 'P3', v3(6, 0, 0));
    pl = scene.objects['pl'] as Geo3DPlane;
    expect(pl.valid).toBe(false);
    expect(pl.errorMessage && pl.errorMessage.length > 0).toBe(true);
    expect(isFiniteVec3(pl.normal)).toBe(true);
  });

  it('computes cube cross-section dynamically and handles no-intersection safely', () => {
    let scene = createEmptyScene3D();
    scene = addGeo3DObject(scene, {
      id: 'cube',
      kind: 'solid',
      rule: 'solid_cube',
      solidType: 'cube',
      label: 'Lập phương',
      params: { a: 4 },
    }).scene;
    // Plane z = 2 cuts cube [z in 0..4] in a 4x4 square of area 16
    scene = addGeo3DObject(scene, {
      id: 'cutPl',
      kind: 'plane',
      rule: 'plane_equation',
      label: '(P)',
      params: { a: 0, b: 0, c: 1, d: -2 },
    }).scene;
    scene = addGeo3DObject(scene, {
      id: 'cs',
      kind: 'cross_section',
      rule: 'cross_section_solid_plane',
      label: 'Thiết diện',
      parents: ['cube', 'cutPl'],
    }).scene;

    let cs = scene.objects['cs'] as Geo3DCrossSection;
    expect(cs.valid).toBe(true);
    expect(cs.vertices.length).toBe(4);
    expect(cs.area).toBeCloseTo(16, 3);

    // Move plane outside cube (z = 10 -> d = -10): must not crash and report empty cross-section
    scene = updateGeo3DObject(scene, 'cutPl', (o) => ({
      ...o,
      params: { a: 0, b: 0, c: 1, d: -10 },
    }));
    cs = scene.objects['cs'] as Geo3DCrossSection;
    expect(cs.vertices.length).toBe(0);
    expect(cs.area).toBe(0);
    expect(cs.statusNote.length).toBeGreaterThan(0);
  });

  it('computes Oxyz vector AB and length accurately for A(1;2;3) and B(4;2;3)', () => {
    let scene = createEmptyScene3D();
    scene = addGeo3DObject(scene, {
      id: 'A',
      kind: 'point',
      rule: 'point_coords',
      label: 'A',
      position: v3(1, 2, 3),
    }).scene;
    scene = addGeo3DObject(scene, {
      id: 'B',
      kind: 'point',
      rule: 'point_coords',
      label: 'B',
      position: v3(4, 2, 3),
    }).scene;
    scene = addGeo3DObject(scene, {
      id: 'vAB',
      kind: 'vector',
      rule: 'vector_two_points',
      label: 'AB',
      parents: ['A', 'B'],
    }).scene;

    const vec = scene.objects['vAB'] as Geo3DVector;
    expect(vec.valid).toBe(true);
    expect(vec.components.x).toBeCloseTo(3, 5);
    expect(vec.components.y).toBeCloseTo(0, 5);
    expect(vec.components.z).toBeCloseTo(0, 5);
    expect(vec.magnitude).toBeCloseTo(3, 5);
  });

  it('strictly distinguishes dihedral angle [0°, 180°] from angle between two planes [0°, 90°]', () => {
    // Half-planes bounded by edge AB along Z axis (A=(0,0,0), B=(0,0,1)) with P=(1,0,0), Q=(-1,1,0)
    // Dihedral angle [P, AB, Q] = 135° (obtuse), while acute angle between the two planes = 45°
    const dihedral = dihedralAngleDeg(v3(1, 0, 0), v3(0, 0, 0), v3(0, 0, 1), v3(-1, 1, 0));
    const planeAngle = angleBetweenPlanesDeg(v3(0, 1, 0), v3(1, 1, 0));
    expect(dihedral).toBeCloseTo(135, 3);
    expect(planeAngle).toBeCloseTo(45, 3);
  });

  it('exports true Vector SVG (zero embedded raster) and supports lossless JSON round-trip', () => {
    const tpl = TEMPLATES_3D[0];
    const scene = tpl.buildScene();
    const svg = exportScene3DToVectorSvg(scene, 1000, 700);
    expect(svg).toContain('<svg');
    expect(svg).toMatch(/<(line|polygon|path)/);
    expect(svg).not.toContain('<image');
    expect(svg).not.toContain('data:image/');

    const json = serializeScene3DToJson(scene, tpl.title);
    const parsed = parseScene3DFromJson(json);
    expect(parsed.valid).toBe(true);
    expect(parsed.title).toBe(tpl.title);
    expect(parsed.scene?.order.length).toBe(scene.order.length);
  });
});

describe('40 Editable 3D Templates Integrity', () => {
  it('contains exactly 40 unique templates and every template produces valid finite geometry', () => {
    expect(TEMPLATES_3D.length).toBe(40);
    const ids = new Set<string>();
    const errors: string[] = [];

    for (const tpl of TEMPLATES_3D) {
      if (ids.has(tpl.id)) {
        errors.push(`Duplicate template id: ${tpl.id}`);
      }
      ids.add(tpl.id);
      const scene = tpl.buildScene();
      if (scene.order.length === 0) {
        errors.push(`${tpl.id}: empty scene`);
      }
      for (const oid of scene.order) {
        const obj = scene.objects[oid];
        if (!obj) {
          errors.push(`${tpl.id}: missing object ${oid}`);
          continue;
        }
        if (obj.kind === 'point' && !isFiniteVec3(obj.position)) {
          errors.push(`${tpl.id}: non-finite point ${oid}`);
        }
        if (obj.kind === 'solid') {
          if (obj.vertices.some((v) => !isFiniteVec3(v))) {
            errors.push(`${tpl.id}: non-finite solid vertices in ${oid}`);
          }
          if (!Number.isFinite(obj.volume) || !Number.isFinite(obj.surfaceArea)) {
            errors.push(`${tpl.id}: non-finite metrics in ${oid}`);
          }
        }
      }
    }

    expect(errors).toEqual([]);
  });
});

describe('18 Levels – 180 Spatial 3D Challenges Integrity & Dynamic Validation', () => {
  it('contains exactly 18 levels and 180 unique 3D challenges (130 Toán 11, 50 Toán 12, 540 max stars)', () => {
    expect(LEVELS_3D.length).toBe(18);
    expect(ALL_CHALLENGES_3D.length).toBe(180);
    expect(TOTAL_POSSIBLE_3D_STARS).toBe(540);

    const grade11Count = ALL_CHALLENGES_3D.filter((c) => c.curriculumTag === 'Toán 11').length;
    const grade12Count = ALL_CHALLENGES_3D.filter((c) => c.curriculumTag === 'Toán 12').length;
    expect(grade11Count).toBe(130);
    expect(grade12Count).toBe(50);

    const ids = new Set<string>();
    for (let lvl = 1; lvl <= 18; lvl++) {
      const list = ALL_CHALLENGES_3D.filter((c) => c.levelId === lvl);
      expect(list.length).toBe(10);
      for (const c of list) {
        expect(ids.has(c.id)).toBe(false);
        ids.add(c.id);
        expect(c.hints.length).toBe(3);
        expect(c.solutionSteps.length).toBeGreaterThan(0);
      }
    }
    expect(ALL_CHALLENGES_3D.length * 3).toBe(540);
  });

  it('computes safe progress percentage without division by zero or false 100%', () => {
    expect(calcProgressPercent(0, 10)).toBe(0);
    expect(calcProgressPercent(0, 0)).toBe(0);
    expect(calcProgressPercent(5, 10)).toBe(50);
    expect(calcProgressPercent(10, 10)).toBe(100);
    expect(calcProgressPercent(180, 180)).toBe(100);
  });

  it('rejects empty initial scene and validates canonical solution with exact 3/2/1/0 star scoring for ALL 180 challenges', () => {
    const failures: string[] = [];

    for (const ch of ALL_CHALLENGES_3D) {
      let scene = ch.buildInitialScene();
      for (const id of scene.order) {
        if (!scene.objects[id]?.valid) {
          failures.push(`${ch.id} (${ch.title}): invalid initial object ${id}`);
        }
      }

      const emptyReport = validateChallenge3D(ch, scene);
      if (emptyReport.passed || emptyReport.stars !== 0) {
        failures.push(
          `${ch.id} (${ch.title}): initial scene unexpectedly passed (passed=${emptyReport.passed}, stars=${emptyReport.stars})`
        );
      }

      for (const step of ch.solutionSteps) {
        scene = addGeo3DObject(scene, step.addInput).scene;
      }

      const cleanReport = validateChallenge3D(ch, scene);
      if (!cleanReport.passed || cleanReport.stars !== 3) {
        failures.push(
          `${ch.id} (${ch.title}): FAILED clean [${cleanReport.status}] stars=${cleanReport.stars} — ${cleanReport.message} | ${cleanReport.details.join('; ')}`
        );
      }

      const hintReport = validateChallenge3D(ch, scene, { hintsUsed: 1, viewedSolution: false });
      if (!hintReport.passed || hintReport.stars !== 2) {
        failures.push(
          `${ch.id} (${ch.title}): expected 2 stars with hints, got passed=${hintReport.passed}, stars=${hintReport.stars}`
        );
      }

      const solReport = validateChallenge3D(ch, scene, { hintsUsed: 0, viewedSolution: true });
      if (!solReport.passed || solReport.stars !== 1) {
        failures.push(
          `${ch.id} (${ch.title}): expected 1 star after viewing solution, got passed=${solReport.passed}, stars=${solReport.stars}`
        );
      }
    }

    if (failures.length > 0) {
      console.error(`Failed 3D challenges (${failures.length}):\n` + failures.join('\n'));
    }
    expect(failures).toEqual([]);
  });
});

describe('3D Textbook Geometric Naming, Rename Propagation & Grouping', () => {
  it('generates SGK 3D names, propagates point renames, preserves custom labels & IDs, and survives JSON round-trip', () => {
    let scene = createEmptyScene3D();
    const rA = addGeo3DObject(scene, { id: 'g3_pt_a', kind: 'point', rule: 'free_point_3d', label: 'A', position: v3(0, 0, 0) });
    scene = rA.scene;
    const rB = addGeo3DObject(scene, { id: 'g3_pt_b', kind: 'point', rule: 'free_point_3d', label: 'B', position: v3(4, 0, 0) });
    scene = rB.scene;
    const rC = addGeo3DObject(scene, { id: 'g3_pt_c', kind: 'point', rule: 'free_point_3d', label: 'C', position: v3(0, 4, 0) });
    scene = rC.scene;

    const rSeg = addGeo3DObject(scene, { id: 'g3_seg_ab', kind: 'segment', rule: 'segment_3d', parents: [rA.id, rB.id] });
    scene = rSeg.scene;
    const rPl = addGeo3DObject(scene, { id: 'g3_pl_abc', kind: 'plane', rule: 'plane_three_points', parents: [rA.id, rB.id, rC.id] });
    scene = rPl.scene;
    const rVec = addGeo3DObject(scene, { id: 'g3_vec_ab', kind: 'vector', rule: 'vector_two_points', parents: [rA.id, rB.id] });
    scene = rVec.scene;
    const rCube = addGeo3DObject(scene, { id: 'g3_cube', kind: 'solid', rule: 'solid_cube', solidType: 'cube', params: { a: 3 } });
    scene = rCube.scene;

    expect(getObjectDisplayName3D(scene, scene.objects[rA.id])).toBe('Điểm A');
    expect(getObjectDisplayName3D(scene, scene.objects[rSeg.id])).toBe('Đoạn thẳng AB');
    expect(getObjectDisplayName3D(scene, scene.objects[rPl.id])).toBe('Mặt phẳng (ABC)');
    expect(getObjectDisplayName3D(scene, scene.objects[rVec.id])).toBe('Vectơ AB');
    expect(getObjectDisplayName3D(scene, scene.objects[rCube.id])).toBe('Hình lập phương');

    // Custom label on vector must be preserved across point rename
    scene = renameGeo3DObject(scene, rVec.id, 'Vectơ chỉ phương u');
    scene = renameGeo3DObject(scene, rA.id, 'M');

    expect(scene.objects[rSeg.id].parents).toEqual([rA.id, rB.id]);
    expect(getObjectDisplayName3D(scene, scene.objects[rA.id])).toBe('Điểm M');
    expect(getObjectDisplayName3D(scene, scene.objects[rSeg.id])).toBe('Đoạn thẳng MB');
    expect(getObjectDisplayName3D(scene, scene.objects[rPl.id])).toBe('Mặt phẳng (MBC)');
    expect(getObjectDisplayName3D(scene, scene.objects[rVec.id])).toBe('Vectơ chỉ phương u');
    expect(getObjectDescription3D(scene, scene.objects[rPl.id])).toBe('Đi qua ba điểm M, B, C');

    // Only non-empty groups returned
    const groups = groupObjects3D(scene);
    expect(groups.map((g) => g.key)).toEqual(['point', 'line_segment', 'vector', 'plane', 'solid']);
    expect(groups.every((g) => g.objects.length > 0)).toBe(true);

    // Pending display names never leak raw IDs
    expect(getPendingDisplayNames3D(scene, [rA.id, 'g3_nonexistent_123', rPl.id])).toEqual([
      'Điểm M',
      'Mặt phẳng (MBC)',
    ]);

    // JSON round-trip preserves IDs, customLabel, and names
    const json = serializeScene3DToJson(scene, 'Test 3D Naming');
    const parsed = parseScene3DFromJson(json);
    expect(parsed.valid).toBe(true);
    expect(getObjectDisplayName3D(parsed.scene!, parsed.scene!.objects[rSeg.id])).toBe('Đoạn thẳng MB');
    expect(getObjectDisplayName3D(parsed.scene!, parsed.scene!.objects[rVec.id])).toBe('Vectơ chỉ phương u');
  });
});

