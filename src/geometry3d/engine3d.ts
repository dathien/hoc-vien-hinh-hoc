import {
  add3,
  analyzeLineLineRelation,
  analyzeLinePlaneRelation,
  analyzePlanePlaneRelation,
  angleBetweenLinesDeg,
  angleBetweenPlanesDeg,
  angleBetweenVectorsDeg,
  angleLinePlaneDeg,
  computePolygon3DMetrics,
  computePolyhedronCrossSection,
  computePolyhedronMetrics,
  computeRevolutionCrossSection,
  cross3,
  degToRad,
  dihedralAngleDeg,
  dist3,
  dot3,
  EPS3D,
  formatNum,
  formatUnit,
  isFiniteVec3,
  lerp3,
  midpoint3,
  norm3,
  normalize3,
  planeBasis,
  projectPointToLine,
  projectPointToPlane,
  reflectPointAcrossPlane,
  reflectPointAcrossPoint,
  rotateEulerXYZ,
  scale3,
  sub3,
  v3,
} from './math3d';
import type {
  Geo3DCircle,
  Geo3DCrossSection,
  Geo3DFormulaNote,
  Geo3DLine,
  Geo3DMeasurement,
  Geo3DObject,
  Geo3DPlane,
  Geo3DPoint,
  Geo3DPolygon,
  Geo3DRay,
  Geo3DRule,
  Geo3DScene,
  Geo3DSegment,
  Geo3DSolid,
  Geo3DStyle,
  Geo3DVector,
  LengthUnit3D,
  SolidEdgeDef,
  SolidFaceDef,
  Vec3,
} from './types3d';

const LABEL_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
  'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',
];

export function nextPointLabel3D(idx: number): string {
  const letter = LABEL_ALPHABET[idx % LABEL_ALPHABET.length];
  const cycle = Math.floor(idx / LABEL_ALPHABET.length);
  return cycle === 0 ? letter : `${letter}_${cycle}`;
}

export function createEmptyScene3D(): Geo3DScene {
  return {
    schemaVersion: 1,
    objects: {},
    order: [],
    log: [],
    nextLabelIndex: 0,
    workingPlane: { kind: 'Oxy', offset: 0 },
    displayMode: 'sgk',
    showGrid: true,
    showAxes: true,
    showCoordPlanes: false,
    showHiddenLines: true,
    showLabels: true,
    showAuxiliary: true,
    unit: 'unit',
    camera: {
      position: { x: 8, y: 7, z: 9 },
      target: { x: 0, y: 1, z: 0 },
      projection: 'orthographic',
      zoom: 1,
    },
  };
}

export function cloneScene3D(scene: Geo3DScene): Geo3DScene {
  return JSON.parse(JSON.stringify(scene)) as Geo3DScene;
}

/** Generate geometry of every polyhedron & revolution solid from its live parameters */
export function buildSolidGeometryData(
  solidType: Geo3DSolid['solidType'],
  center: Vec3,
  rotation: Vec3,
  params: Record<string, number | string | boolean | number[]> = {}
): {
  vertices: Vec3[];
  edges: SolidEdgeDef[];
  faces: SolidFaceDef[];
  defaultLabels: string[];
  volume: number;
  surfaceArea: number;
  lateralArea: number;
  baseArea: number;
  height: number;
  radius?: number;
  radiusTop?: number;
  isExtendedCurriculum?: boolean;
  formulaSummary: string;
} {
  const num = (key: string, fallback: number) => {
    const val = Number(params[key]);
    return Number.isFinite(val) && val > 0.05 ? val : fallback;
  };
  const signedNum = (key: string, fallback: number) => {
    const val = Number(params[key]);
    return Number.isFinite(val) ? val : fallback;
  };

  const toWorld = (pts: Vec3[]) => pts.map((p) => add3(center, rotateEulerXYZ(p, rotation)));

  let localVerts: Vec3[] = [];
  let edges: SolidEdgeDef[] = [];
  let faces: SolidFaceDef[] = [];
  let defaultLabels: string[] = [];
  let height = num('h', 4);
  let radius: number | undefined;
  let radiusTop: number | undefined;
  let baseArea = 0;
  let lateralArea = 0;
  let surfaceArea = 0;
  let volume = 0;
  let isExtendedCurriculum = false;
  let formulaSummary = '';

  switch (solidType) {
    case 'cube': {
      const a = num('a', 3.5);
      const h2 = a / 2;
      height = a;
      localVerts = [
        v3(-h2, -h2, 0), v3(h2, -h2, 0), v3(h2, h2, 0), v3(-h2, h2, 0),
        v3(-h2, -h2, a), v3(h2, -h2, a), v3(h2, h2, a), v3(-h2, h2, a),
      ];
      defaultLabels = ['A', 'B', 'C', 'D', "A'", "B'", "C'", "D'"];
      edges = [
        { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 0 },
        { a: 4, b: 5 }, { a: 5, b: 6 }, { a: 6, b: 7 }, { a: 7, b: 4 },
        { a: 0, b: 4 }, { a: 1, b: 5 }, { a: 2, b: 6 }, { a: 3, b: 7 },
        { a: 0, b: 6, isDiagonal: true }, { a: 1, b: 7, isDiagonal: true },
      ];
      faces = [
        { indices: [0, 3, 2, 1], name: '(ABCD)' },
        { indices: [4, 5, 6, 7], name: "(A'B'C'D')" },
        { indices: [0, 1, 5, 4], name: "(ABB'A')" },
        { indices: [1, 2, 6, 5], name: "(BCC'B')" },
        { indices: [2, 3, 7, 6], name: "(CDD'C')" },
        { indices: [3, 0, 4, 7], name: "(DAA'D')" },
      ];
      baseArea = a * a;
      lateralArea = 4 * a * a;
      surfaceArea = 6 * a * a;
      volume = a * a * a;
      formulaSummary = 'V = a^3,\\; S_{tp} = 6a^2';
      break;
    }

    case 'box': {
      const a = num('a', 4.5);
      const b = num('b', 3);
      const c = num('c', 2.8);
      height = c;
      localVerts = [
        v3(-a / 2, -b / 2, 0), v3(a / 2, -b / 2, 0), v3(a / 2, b / 2, 0), v3(-a / 2, b / 2, 0),
        v3(-a / 2, -b / 2, c), v3(a / 2, -b / 2, c), v3(a / 2, b / 2, c), v3(-a / 2, b / 2, c),
      ];
      defaultLabels = ['A', 'B', 'C', 'D', "A'", "B'", "C'", "D'"];
      edges = [
        { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 0 },
        { a: 4, b: 5 }, { a: 5, b: 6 }, { a: 6, b: 7 }, { a: 7, b: 4 },
        { a: 0, b: 4 }, { a: 1, b: 5 }, { a: 2, b: 6 }, { a: 3, b: 7 },
        { a: 0, b: 6, isDiagonal: true },
      ];
      faces = [
        { indices: [0, 3, 2, 1] }, { indices: [4, 5, 6, 7] },
        { indices: [0, 1, 5, 4] }, { indices: [1, 2, 6, 5] },
        { indices: [2, 3, 7, 6] }, { indices: [3, 0, 4, 7] },
      ];
      baseArea = a * b;
      lateralArea = 2 * (a + b) * c;
      surfaceArea = 2 * (a * b + b * c + c * a);
      volume = a * b * c;
      formulaSummary = 'V = abc,\\; S_{tp} = 2(ab + bc + ca)';
      break;
    }

    case 'parallelepiped': {
      const a = num('a', 4);
      const b = num('b', 3);
      const h = num('h', 3);
      const sx = signedNum('skewX', 1.1);
      const sy = signedNum('skewY', 0.7);
      height = h;
      const dx = 0.8;
      localVerts = [
        v3(-a / 2, -b / 2, 0), v3(a / 2, -b / 2, 0), v3(a / 2 + dx, b / 2, 0), v3(-a / 2 + dx, b / 2, 0),
        v3(-a / 2 + sx, -b / 2 + sy, h), v3(a / 2 + sx, -b / 2 + sy, h), v3(a / 2 + dx + sx, b / 2 + sy, h), v3(-a / 2 + dx + sx, b / 2 + sy, h),
      ];
      defaultLabels = ['A', 'B', 'C', 'D', "A'", "B'", "C'", "D'"];
      edges = [
        { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 0 },
        { a: 4, b: 5 }, { a: 5, b: 6 }, { a: 6, b: 7 }, { a: 7, b: 4 },
        { a: 0, b: 4 }, { a: 1, b: 5 }, { a: 2, b: 6 }, { a: 3, b: 7 },
        { a: 0, b: 6, isDiagonal: true },
      ];
      faces = [
        { indices: [0, 3, 2, 1] }, { indices: [4, 5, 6, 7] },
        { indices: [0, 1, 5, 4] }, { indices: [1, 2, 6, 5] },
        { indices: [2, 3, 7, 6] }, { indices: [3, 0, 4, 7] },
      ];
      const m = computePolyhedronMetrics(localVerts, faces);
      baseArea = a * b;
      surfaceArea = m.surfaceArea;
      lateralArea = Math.max(0, surfaceArea - 2 * baseArea);
      volume = baseArea * h;
      formulaSummary = 'V = S_{\\text{đáy}} \\cdot h';
      break;
    }

    case 'regular_tetrahedron': {
      const a = num('a', 4);
      const R = a / Math.sqrt(3);
      const h = a * Math.sqrt(2 / 3);
      height = h;
      localVerts = [
        v3(R, 0, 0),
        v3(-R / 2, (a) / 2, 0),
        v3(-R / 2, -(a) / 2, 0),
        v3(0, 0, h),
      ];
      defaultLabels = ['A', 'B', 'C', 'S'];
      edges = [
        { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 0 },
        { a: 3, b: 0 }, { a: 3, b: 1 }, { a: 3, b: 2 },
      ];
      faces = [
        { indices: [0, 2, 1] },
        { indices: [3, 0, 1] },
        { indices: [3, 1, 2] },
        { indices: [3, 2, 0] },
      ];
      baseArea = (Math.sqrt(3) / 4) * a * a;
      lateralArea = 3 * baseArea;
      surfaceArea = Math.sqrt(3) * a * a;
      volume = (a * a * a * Math.sqrt(2)) / 12;
      formulaSummary = 'V = \\frac{a^3\\sqrt{2}}{12},\\; h = a\\sqrt{\\frac{2}{3}}';
      break;
    }

    case 'tetrahedron': {
      const a = num('a', 4.2);
      const b = num('b', 3.4);
      const h = num('h', 3.6);
      const ox = signedNum('apexX', -0.4);
      const oy = signedNum('apexY', 0.3);
      height = h;
      localVerts = [
        v3(-a / 2, -b / 2, 0),
        v3(a / 2, -b / 2, 0),
        v3(0.3, b / 2, 0),
        v3(ox, oy, h),
      ];
      defaultLabels = ['A', 'B', 'C', 'S'];
      edges = [
        { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 0 },
        { a: 3, b: 0 }, { a: 3, b: 1 }, { a: 3, b: 2 },
      ];
      faces = [
        { indices: [0, 2, 1] },
        { indices: [3, 0, 1] },
        { indices: [3, 1, 2] },
        { indices: [3, 2, 0] },
      ];
      baseArea = computePolygon3DMetrics([localVerts[0], localVerts[1], localVerts[2]]).area;
      const m = computePolyhedronMetrics(localVerts, faces);
      surfaceArea = m.surfaceArea;
      lateralArea = Math.max(0, surfaceArea - baseArea);
      volume = (baseArea * h) / 3;
      formulaSummary = 'V = \\frac{1}{3} S_{\\text{đáy}} \\cdot h';
      break;
    }

    case 'pyramid':
    case 'regular_pyramid': {
      const sides = Math.max(3, Math.min(8, Math.round(num('sides', 4))));
      const a = num('a', 3.6);
      const h = num('h', 4.2);
      const isReg = solidType === 'regular_pyramid';
      const ox = isReg ? 0 : signedNum('apexX', -0.6);
      const oy = isReg ? 0 : signedNum('apexY', 0.4);
      height = h;
      const R = a / (2 * Math.sin(Math.PI / sides));
      const baseVerts: Vec3[] = [];
      for (let i = 0; i < sides; i++) {
        const ang = (i / sides) * Math.PI * 2 + (sides === 4 ? Math.PI / 4 : 0);
        baseVerts.push(v3(R * Math.cos(ang), R * Math.sin(ang), 0));
      }
      localVerts = [...baseVerts, v3(ox, oy, h)];
      const apexIdx = sides;
      defaultLabels = [
        ...Array.from({ length: sides }, (_, i) => LABEL_ALPHABET[i]),
        'S',
      ];
      edges = [];
      for (let i = 0; i < sides; i++) {
        edges.push({ a: i, b: (i + 1) % sides });
        edges.push({ a: apexIdx, b: i });
      }
      if (sides === 4) {
        edges.push({ a: 0, b: 2, isDiagonal: true }, { a: 1, b: 3, isDiagonal: true });
      }
      faces = [{ indices: Array.from({ length: sides }, (_, i) => sides - 1 - i) }];
      for (let i = 0; i < sides; i++) {
        faces.push({ indices: [apexIdx, i, (i + 1) % sides] });
      }
      baseArea = computePolygon3DMetrics(baseVerts).area;
      const m = computePolyhedronMetrics(localVerts, faces);
      surfaceArea = m.surfaceArea;
      lateralArea = Math.max(0, surfaceArea - baseArea);
      volume = (baseArea * h) / 3;
      formulaSummary = 'V = \\frac{1}{3} S_{\\text{đáy}} \\cdot h';
      break;
    }

    case 'pyramid_frustum': {
      const sides = Math.max(3, Math.min(8, Math.round(num('sides', 4))));
      const a = num('a', 4);
      const aTop = num('aTop', 2);
      const h = num('h', 3.2);
      height = h;
      const R1 = a / (2 * Math.sin(Math.PI / sides));
      const R2 = aTop / (2 * Math.sin(Math.PI / sides));
      const bot: Vec3[] = [];
      const top: Vec3[] = [];
      for (let i = 0; i < sides; i++) {
        const ang = (i / sides) * Math.PI * 2 + (sides === 4 ? Math.PI / 4 : 0);
        bot.push(v3(R1 * Math.cos(ang), R1 * Math.sin(ang), 0));
        top.push(v3(R2 * Math.cos(ang), R2 * Math.sin(ang), h));
      }
      localVerts = [...bot, ...top];
      defaultLabels = [
        ...Array.from({ length: sides }, (_, i) => LABEL_ALPHABET[i]),
        ...Array.from({ length: sides }, (_, i) => `${LABEL_ALPHABET[i]}'`),
      ];
      for (let i = 0; i < sides; i++) {
        edges.push({ a: i, b: (i + 1) % sides });
        edges.push({ a: sides + i, b: sides + ((i + 1) % sides) });
        edges.push({ a: i, b: sides + i });
      }
      faces = [
        { indices: Array.from({ length: sides }, (_, i) => sides - 1 - i) },
        { indices: Array.from({ length: sides }, (_, i) => sides + i) },
      ];
      for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        faces.push({ indices: [i, next, sides + next, sides + i] });
      }
      const s1 = computePolygon3DMetrics(bot).area;
      const s2 = computePolygon3DMetrics(top).area;
      baseArea = s1;
      const m = computePolyhedronMetrics(localVerts, faces);
      surfaceArea = m.surfaceArea;
      lateralArea = Math.max(0, surfaceArea - s1 - s2);
      volume = (h / 3) * (s1 + s2 + Math.sqrt(s1 * s2));
      formulaSummary = 'V = \\frac{h}{3}(S_1 + S_2 + \\sqrt{S_1 S_2})';
      break;
    }

    case 'prism':
    case 'right_prism': {
      const sides = Math.max(3, Math.min(8, Math.round(num('sides', 3))));
      const a = num('a', 3.4);
      const h = num('h', 4.2);
      const isRight = solidType === 'right_prism';
      const sx = isRight ? 0 : signedNum('skewX', 1.0);
      const sy = isRight ? 0 : signedNum('skewY', 0.5);
      height = h;
      const R = a / (2 * Math.sin(Math.PI / sides));
      const bot: Vec3[] = [];
      const top: Vec3[] = [];
      for (let i = 0; i < sides; i++) {
        const ang = (i / sides) * Math.PI * 2 + (sides === 4 ? Math.PI / 4 : -Math.PI / 2);
        const bx = R * Math.cos(ang);
        const by = R * Math.sin(ang);
        bot.push(v3(bx, by, 0));
        top.push(v3(bx + sx, by + sy, h));
      }
      localVerts = [...bot, ...top];
      defaultLabels = [
        ...Array.from({ length: sides }, (_, i) => LABEL_ALPHABET[i]),
        ...Array.from({ length: sides }, (_, i) => `${LABEL_ALPHABET[i]}'`),
      ];
      for (let i = 0; i < sides; i++) {
        edges.push({ a: i, b: (i + 1) % sides });
        edges.push({ a: sides + i, b: sides + ((i + 1) % sides) });
        edges.push({ a: i, b: sides + i });
      }
      faces = [
        { indices: Array.from({ length: sides }, (_, i) => sides - 1 - i) },
        { indices: Array.from({ length: sides }, (_, i) => sides + i) },
      ];
      for (let i = 0; i < sides; i++) {
        const next = (i + 1) % sides;
        faces.push({ indices: [i, next, sides + next, sides + i] });
      }
      baseArea = computePolygon3DMetrics(bot).area;
      const m = computePolyhedronMetrics(localVerts, faces);
      surfaceArea = m.surfaceArea;
      lateralArea = Math.max(0, surfaceArea - 2 * baseArea);
      volume = baseArea * h;
      formulaSummary = 'V = S_{\\text{đáy}} \\cdot h';
      break;
    }

    case 'octahedron': {
      const a = num('a', 3.4);
      const r = a / Math.SQRT2;
      height = 2 * r;
      isExtendedCurriculum = true;
      localVerts = [
        v3(r, 0, r), v3(0, r, r), v3(-r, 0, r), v3(0, -r, r),
        v3(0, 0, 2 * r), v3(0, 0, 0),
      ];
      defaultLabels = ['A', 'B', 'C', 'D', 'S', "S'"];
      edges = [
        { a: 0, b: 1 }, { a: 1, b: 2 }, { a: 2, b: 3 }, { a: 3, b: 0 },
        { a: 4, b: 0 }, { a: 4, b: 1 }, { a: 4, b: 2 }, { a: 4, b: 3 },
        { a: 5, b: 0 }, { a: 5, b: 1 }, { a: 5, b: 2 }, { a: 5, b: 3 },
      ];
      faces = [
        { indices: [4, 0, 1] }, { indices: [4, 1, 2] }, { indices: [4, 2, 3] }, { indices: [4, 3, 0] },
        { indices: [5, 1, 0] }, { indices: [5, 2, 1] }, { indices: [5, 3, 2] }, { indices: [5, 0, 3] },
      ];
      surfaceArea = 2 * Math.sqrt(3) * a * a;
      lateralArea = surfaceArea;
      baseArea = a * a;
      volume = (Math.SQRT2 / 3) * a * a * a;
      formulaSummary = 'V = \\frac{\\sqrt{2}}{3}a^3,\\; S_{tp} = 2\\sqrt{3}a^2';
      break;
    }

    case 'icosahedron': {
      const a = num('a', 2.4);
      const phi = (1 + Math.sqrt(5)) / 2;
      const s = a / 2;
      isExtendedCurriculum = true;
      const raw: Vec3[] = [
        v3(-1, phi, 0), v3(1, phi, 0), v3(-1, -phi, 0), v3(1, -phi, 0),
        v3(0, -1, phi), v3(0, 1, phi), v3(0, -1, -phi), v3(0, 1, -phi),
        v3(phi, 0, -1), v3(phi, 0, 1), v3(-phi, 0, -1), v3(-phi, 0, 1),
      ];
      const lift = phi * s;
      height = 2 * lift;
      localVerts = raw.map((p) => v3(p.x * s, p.y * s, p.z * s + lift));
      defaultLabels = Array.from({ length: 12 }, (_, i) => `V_${i + 1}`);
      faces = [
        { indices: [0, 11, 5] }, { indices: [0, 5, 1] }, { indices: [0, 1, 7] }, { indices: [0, 7, 10] }, { indices: [0, 10, 11] },
        { indices: [1, 5, 9] }, { indices: [5, 11, 4] }, { indices: [11, 10, 2] }, { indices: [10, 7, 6] }, { indices: [7, 1, 8] },
        { indices: [3, 9, 4] }, { indices: [3, 4, 2] }, { indices: [3, 2, 6] }, { indices: [3, 6, 8] }, { indices: [3, 8, 9] },
        { indices: [4, 9, 5] }, { indices: [2, 4, 11] }, { indices: [6, 2, 10] }, { indices: [8, 6, 7] }, { indices: [9, 8, 1] },
      ];
      const edgeSet = new Set<string>();
      for (const f of faces) {
        for (let i = 0; i < 3; i++) {
          const u = f.indices[i];
          const w = f.indices[(i + 1) % 3];
          const key = u < w ? `${u}_${w}` : `${w}_${u}`;
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push({ a: u, b: w });
          }
        }
      }
      surfaceArea = 5 * Math.sqrt(3) * a * a;
      lateralArea = surfaceArea;
      volume = (5 * (3 + Math.sqrt(5)) / 12) * a * a * a;
      formulaSummary = 'V = \\frac{5(3+\\sqrt{5})}{12}a^3,\\; S_{tp} = 5\\sqrt{3}a^2';
      break;
    }

    case 'dodecahedron': {
      const a = num('a', 1.8);
      const phi = (1 + Math.sqrt(5)) / 2;
      const inv = 1 / phi;
      const s = a / (2 / phi);
      isExtendedCurriculum = true;
      const raw: Vec3[] = [
        v3(1, 1, 1), v3(1, 1, -1), v3(1, -1, 1), v3(1, -1, -1),
        v3(-1, 1, 1), v3(-1, 1, -1), v3(-1, -1, 1), v3(-1, -1, -1),
        v3(0, inv, phi), v3(0, -inv, phi), v3(0, inv, -phi), v3(0, -inv, -phi),
        v3(inv, phi, 0), v3(-inv, phi, 0), v3(inv, -phi, 0), v3(-inv, -phi, 0),
        v3(phi, 0, inv), v3(phi, 0, -inv), v3(-phi, 0, inv), v3(-phi, 0, -inv),
      ];
      const lift = phi * s;
      height = 2 * lift;
      localVerts = raw.map((p) => v3(p.x * s, p.y * s, p.z * s + lift));
      defaultLabels = Array.from({ length: 20 }, (_, i) => `D_${i + 1}`);
      faces = [
        { indices: [0, 8, 9, 2, 16] }, { indices: [0, 16, 17, 1, 12] },
        { indices: [0, 12, 13, 4, 8] }, { indices: [4, 18, 6, 9, 8] },
        { indices: [2, 9, 6, 15, 14] }, { indices: [2, 14, 3, 17, 16] },
        { indices: [1, 17, 3, 11, 10] }, { indices: [1, 10, 5, 13, 12] },
        { indices: [4, 13, 5, 19, 18] }, { indices: [7, 19, 5, 10, 11] },
        { indices: [7, 11, 3, 14, 15] }, { indices: [7, 15, 6, 18, 19] },
      ];
      const edgeSet = new Set<string>();
      for (const f of faces) {
        for (let i = 0; i < f.indices.length; i++) {
          const u = f.indices[i];
          const w = f.indices[(i + 1) % f.indices.length];
          const key = u < w ? `${u}_${w}` : `${w}_${u}`;
          if (!edgeSet.has(key)) {
            edgeSet.add(key);
            edges.push({ a: u, b: w });
          }
        }
      }
      surfaceArea = 3 * Math.sqrt(25 + 10 * Math.sqrt(5)) * a * a;
      lateralArea = surfaceArea;
      volume = ((15 + 7 * Math.sqrt(5)) / 4) * a * a * a;
      formulaSummary = 'V = \\frac{15+7\\sqrt{5}}{4}a^3';
      break;
    }

    case 'cylinder': {
      const r = num('r', 2);
      const h = num('h', 4);
      radius = r;
      height = h;
      localVerts = [v3(0, 0, 0), v3(0, 0, h), v3(r, 0, 0), v3(r, 0, h)];
      defaultLabels = ['O', "O'", 'A', "A'"];
      edges = [
        { a: 0, b: 1, isAxis: true },
        { a: 0, b: 2, isDiagonal: true },
        { a: 2, b: 3 },
      ];
      baseArea = Math.PI * r * r;
      lateralArea = 2 * Math.PI * r * h;
      surfaceArea = lateralArea + 2 * baseArea;
      volume = baseArea * h;
      formulaSummary = 'V = \\pi R^2 h,\\; S_{xq} = 2\\pi R h,\\; S_{tp} = 2\\pi R(h + R)';
      break;
    }

    case 'cone': {
      const r = num('r', 2.2);
      const h = num('h', 4.2);
      radius = r;
      height = h;
      const l = Math.hypot(r, h);
      localVerts = [v3(0, 0, 0), v3(0, 0, h), v3(r, 0, 0)];
      defaultLabels = ['O', 'S', 'A'];
      edges = [
        { a: 0, b: 1, isAltitude: true, isAxis: true },
        { a: 0, b: 2, isDiagonal: true },
        { a: 1, b: 2 },
      ];
      baseArea = Math.PI * r * r;
      lateralArea = Math.PI * r * l;
      surfaceArea = lateralArea + baseArea;
      volume = (baseArea * h) / 3;
      formulaSummary = 'V = \\frac{1}{3}\\pi R^2 h,\\; S_{xq} = \\pi R l';
      break;
    }

    case 'cone_frustum': {
      const r = num('r', 2.4);
      const r2 = num('rTop', 1.2);
      const h = num('h', 3.4);
      radius = r;
      radiusTop = r2;
      height = h;
      isExtendedCurriculum = true;
      const l = Math.hypot(r - r2, h);
      localVerts = [v3(0, 0, 0), v3(0, 0, h), v3(r, 0, 0), v3(r2, 0, h)];
      defaultLabels = ['O', "O'", 'A', "A'"];
      edges = [
        { a: 0, b: 1, isAxis: true },
        { a: 2, b: 3 },
      ];
      baseArea = Math.PI * r * r;
      lateralArea = Math.PI * (r + r2) * l;
      surfaceArea = lateralArea + baseArea + Math.PI * r2 * r2;
      volume = (Math.PI * h / 3) * (r * r + r * r2 + r2 * r2);
      formulaSummary = 'V = \\frac{\\pi h}{3}(R^2 + Rr + r^2)';
      break;
    }

    case 'sphere': {
      const r = num('r', 2.4);
      radius = r;
      height = 2 * r;
      localVerts = [v3(0, 0, 0), v3(r, 0, 0), v3(0, 0, r)];
      defaultLabels = ['I', 'A', 'N'];
      edges = [
        { a: 0, b: 1, isDiagonal: true },
        { a: 0, b: 2, isAxis: true },
      ];
      baseArea = Math.PI * r * r;
      lateralArea = 4 * Math.PI * r * r;
      surfaceArea = 4 * Math.PI * r * r;
      volume = (4 / 3) * Math.PI * r * r * r;
      formulaSummary = 'V = \\frac{4}{3}\\pi R^3,\\; S = 4\\pi R^2';
      break;
    }

    case 'hemisphere': {
      const r = num('r', 2.4);
      radius = r;
      height = r;
      isExtendedCurriculum = true;
      localVerts = [v3(0, 0, 0), v3(r, 0, 0), v3(0, 0, r)];
      defaultLabels = ['O', 'A', 'N'];
      edges = [
        { a: 0, b: 1, isDiagonal: true },
        { a: 0, b: 2, isAxis: true },
      ];
      baseArea = Math.PI * r * r;
      lateralArea = 2 * Math.PI * r * r;
      surfaceArea = 3 * Math.PI * r * r;
      volume = (2 / 3) * Math.PI * r * r * r;
      formulaSummary = 'V = \\frac{2}{3}\\pi R^3,\\; S_{tp} = 3\\pi R^2';
      break;
    }
  }

  return {
    vertices: toWorld(localVerts),
    edges,
    faces,
    defaultLabels,
    volume,
    surfaceArea,
    lateralArea,
    baseArea,
    height,
    radius,
    radiusTop,
    isExtendedCurriculum,
    formulaSummary,
  };
}

function getLineLike(obj: Geo3DObject | undefined): { origin: Vec3; direction: Vec3 } | null {
  if (!obj || !obj.valid) return null;
  if (obj.kind === 'line') return { origin: obj.origin, direction: obj.direction };
  if (obj.kind === 'ray') return { origin: obj.origin, direction: obj.direction };
  if (obj.kind === 'segment') {
    const d = normalize3(sub3(obj.p2, obj.p1));
    return d ? { origin: obj.p1, direction: d } : null;
  }
  if (obj.kind === 'vector') {
    const d = normalize3(obj.components);
    return d ? { origin: obj.origin, direction: d } : null;
  }
  return null;
}

function getPointPos(obj: Geo3DObject | undefined): Vec3 | null {
  if (!obj || !obj.valid || obj.kind !== 'point') return null;
  return isFiniteVec3(obj.position) ? obj.position : null;
}

function getPlaneData(obj: Geo3DObject | undefined): { normal: Vec3; d: number; anchor: Vec3 } | null {
  if (!obj || !obj.valid) return null;
  if (obj.kind === 'plane') return { normal: obj.normal, d: obj.d, anchor: obj.anchor };
  if (obj.kind === 'polygon' && obj.vertices.length >= 3) {
    const n = normalize3(obj.normal);
    if (!n) return null;
    const anchor = obj.vertices[0];
    return { normal: n, d: -dot3(n, anchor), anchor };
  }
  return null;
}

/** Recompute every object in topological order along the dependency graph */
export function recomputeScene3D(scene: Geo3DScene): Geo3DScene {
  const objs: Record<string, Geo3DObject> = {};
  const unit: LengthUnit3D = scene.unit ?? 'unit';

  for (const id of scene.order) {
    const raw = scene.objects[id];
    if (!raw) continue;
    const obj: Geo3DObject = { ...raw };

    const p0 = objs[obj.parents[0]];
    const p1 = objs[obj.parents[1]];
    const p2 = objs[obj.parents[2]];
    const p3 = objs[obj.parents[3]];

    // Reset validity before recompute
    obj.valid = true;
    obj.errorMessage = undefined;

    switch (obj.kind) {
      case 'point': {
        const pt = obj as Geo3DPoint;
        switch (pt.rule) {
          case 'free_point_3d':
          case 'point_coords': {
            if (!isFiniteVec3(pt.position)) {
              pt.valid = false;
              pt.errorMessage = 'Tọa độ điểm không hợp lệ.';
            }
            break;
          }
          case 'solid_vertex': {
            const solid = p0?.kind === 'solid' && p0.valid ? p0 : null;
            const vIdx = Number(pt.params?.vertexIndex ?? 0);
            if (!solid || !solid.vertices[vIdx]) {
              pt.valid = false;
              pt.errorMessage = 'Đỉnh không tồn tại trên hình khối.';
            } else {
              pt.position = solid.vertices[vIdx];
            }
            break;
          }
          case 'point_on_line': {
            const line = getLineLike(p0);
            if (!line) {
              pt.valid = false;
              pt.errorMessage = 'Đường thẳng chứa điểm không hợp lệ.';
            } else {
              const t = Number.isFinite(pt.t) ? (pt.t as number) : 0;
              pt.position = add3(line.origin, scale3(line.direction, t));
            }
            break;
          }
          case 'point_on_segment': {
            const seg = p0?.kind === 'segment' && p0.valid ? p0 : null;
            if (!seg) {
              pt.valid = false;
              pt.errorMessage = 'Đoạn thẳng chứa điểm không hợp lệ.';
            } else {
              const t = Math.max(0, Math.min(1, Number.isFinite(pt.t) ? (pt.t as number) : 0.5));
              pt.t = t;
              pt.position = lerp3(seg.p1, seg.p2, t);
            }
            break;
          }
          case 'point_on_plane': {
            const pl = getPlaneData(p0);
            if (!pl) {
              pt.valid = false;
              pt.errorMessage = 'Mặt phẳng chứa điểm không hợp lệ.';
            } else {
              const { u, v } = planeBasis(pl.normal);
              const uVal = pt.uv?.u ?? 0;
              const vVal = pt.uv?.v ?? 0;
              pt.position = add3(pl.anchor, add3(scale3(u, uVal), scale3(v, vVal)));
            }
            break;
          }
          case 'midpoint_3d': {
            const a = getPointPos(p0);
            const b = getPointPos(p1);
            if (!a || !b) {
              pt.valid = false;
              pt.errorMessage = 'Cần hai điểm hợp lệ để xác định trung điểm.';
            } else {
              pt.position = midpoint3(a, b);
            }
            break;
          }
          case 'intersect_line_line': {
            const l1 = getLineLike(p0);
            const l2 = getLineLike(p1);
            if (!l1 || !l2) {
              pt.valid = false;
              pt.errorMessage = 'Thiếu hai đường thẳng hợp lệ.';
            } else {
              const rel = analyzeLineLineRelation(l1.origin, l1.direction, l2.origin, l2.direction);
              if (rel.relation === 'intersecting' && rel.intersection) {
                pt.position = rel.intersection;
              } else {
                pt.valid = false;
                pt.errorMessage =
                  rel.relation === 'skew'
                    ? 'Hai đường thẳng chéo nhau nên không có giao điểm.'
                    : rel.relation === 'parallel'
                      ? 'Hai đường thẳng song song nên không có giao điểm.'
                      : 'Hai đường thẳng trùng nhau (vô số điểm chung).';
              }
            }
            break;
          }
          case 'intersect_line_plane': {
            const l = getLineLike(p0);
            const pl = getPlaneData(p1);
            if (!l || !pl) {
              pt.valid = false;
              pt.errorMessage = 'Cần một đường thẳng và một mặt phẳng hợp lệ.';
            } else {
              const rel = analyzeLinePlaneRelation(l.origin, l.direction, pl.normal, pl.d);
              if (rel.relation === 'intersecting' && rel.intersection) {
                pt.position = rel.intersection;
              } else {
                pt.valid = false;
                pt.errorMessage =
                  rel.relation === 'parallel'
                    ? 'Đường thẳng song song với mặt phẳng nên không có giao điểm.'
                    : 'Đường thẳng nằm trong mặt phẳng (vô số điểm chung).';
              }
            }
            break;
          }
          case 'foot_point_line': {
            const a = getPointPos(p0);
            const l = getLineLike(p1);
            if (!a || !l) {
              pt.valid = false;
              pt.errorMessage = 'Cần một điểm và một đường thẳng hợp lệ.';
            } else {
              pt.position = projectPointToLine(a, l.origin, l.direction).foot;
            }
            break;
          }
          case 'foot_point_plane': {
            const a = getPointPos(p0);
            const pl = getPlaneData(p1);
            if (!a || !pl) {
              pt.valid = false;
              pt.errorMessage = 'Cần một điểm và một mặt phẳng hợp lệ.';
            } else {
              pt.position = projectPointToPlane(a, pl.normal, pl.d).foot;
            }
            break;
          }
          case 'reflect_point_point': {
            const a = getPointPos(p0);
            const center = getPointPos(p1);
            if (!a || !center) {
              pt.valid = false;
              pt.errorMessage = 'Cần điểm gốc và tâm đối xứng hợp lệ.';
            } else {
              pt.position = reflectPointAcrossPoint(a, center);
            }
            break;
          }
          case 'reflect_point_plane': {
            const a = getPointPos(p0);
            const pl = getPlaneData(p1);
            if (!a || !pl) {
              pt.valid = false;
              pt.errorMessage = 'Cần điểm gốc và mặt phẳng đối xứng hợp lệ.';
            } else {
              pt.position = reflectPointAcrossPlane(a, pl.normal, pl.d);
            }
            break;
          }
        }
        break;
      }

      case 'segment': {
        const seg = obj as Geo3DSegment;
        const a = getPointPos(p0);
        const b = getPointPos(p1);
        if (!a || !b) {
          seg.valid = false;
          seg.errorMessage = 'Thiếu hai đầu mút hợp lệ.';
        } else {
          seg.p1 = a;
          seg.p2 = b;
          seg.length = dist3(a, b);
        }
        break;
      }

      case 'line': {
        const line = obj as Geo3DLine;
        switch (line.rule) {
          case 'line_two_points': {
            const a = getPointPos(p0);
            const b = getPointPos(p1);
            const d = a && b ? normalize3(sub3(b, a)) : null;
            if (!a || !d) {
              line.valid = false;
              line.errorMessage = 'Hai điểm trùng nhau — không xác định được đường thẳng duy nhất.';
            } else {
              line.origin = a;
              line.direction = d;
            }
            break;
          }
          case 'line_parallel_point': {
            const pt = getPointPos(p0);
            const refL = getLineLike(p1);
            if (!pt || !refL) {
              line.valid = false;
              line.errorMessage = 'Cần một điểm và một đường thẳng tham chiếu hợp lệ.';
            } else {
              line.origin = pt;
              line.direction = refL.direction;
            }
            break;
          }
          case 'line_perp_plane': {
            const pt = getPointPos(p0);
            const pl = getPlaneData(p1);
            if (!pt || !pl) {
              line.valid = false;
              line.errorMessage = 'Cần một điểm và một mặt phẳng hợp lệ.';
            } else {
              line.origin = pt;
              line.direction = pl.normal;
            }
            break;
          }
          case 'line_point_direction': {
            const pt = getPointPos(p0);
            const dx = Number(line.params?.dx ?? 1);
            const dy = Number(line.params?.dy ?? 0);
            const dz = Number(line.params?.dz ?? 0);
            const dir = normalize3(v3(dx, dy, dz));
            const origin = pt ?? v3(Number(line.params?.ox ?? 0), Number(line.params?.oy ?? 0), Number(line.params?.oz ?? 0));
            if (!dir) {
              line.valid = false;
              line.errorMessage = 'Vectơ chỉ phương không được bằng vectơ không (0; 0; 0).';
            } else {
              line.origin = origin;
              line.direction = dir;
            }
            break;
          }
          case 'intersect_plane_plane': {
            const pl1 = getPlaneData(p0);
            const pl2 = getPlaneData(p1);
            if (!pl1 || !pl2) {
              line.valid = false;
              line.errorMessage = 'Cần hai mặt phẳng hợp lệ để tìm giao tuyến.';
            } else {
              const rel = analyzePlanePlaneRelation(pl1.normal, pl1.d, pl2.normal, pl2.d);
              if (rel.relation === 'intersecting' && rel.intersectionOrigin && rel.intersectionDir) {
                line.origin = rel.intersectionOrigin;
                line.direction = rel.intersectionDir;
              } else {
                line.valid = false;
                line.errorMessage =
                  rel.relation === 'parallel'
                    ? 'Hai mặt phẳng song song nên không có giao tuyến.'
                    : 'Hai mặt phẳng trùng nhau (vô số điểm chung).';
              }
            }
            break;
          }
          case 'common_perpendicular': {
            const l1 = getLineLike(p0);
            const l2 = getLineLike(p1);
            if (!l1 || !l2) {
              line.valid = false;
              line.errorMessage = 'Cần hai đường thẳng hợp lệ.';
            } else {
              const rel = analyzeLineLineRelation(l1.origin, l1.direction, l2.origin, l2.direction);
              if (rel.relation === 'skew' && rel.closestP1 && rel.closestP2) {
                const dir = normalize3(sub3(rel.closestP2, rel.closestP1));
                if (dir) {
                  line.origin = rel.closestP1;
                  line.direction = dir;
                  line.params = {
                    ...(line.params ?? {}),
                    p1x: rel.closestP1.x,
                    p1y: rel.closestP1.y,
                    p1z: rel.closestP1.z,
                    p2x: rel.closestP2.x,
                    p2y: rel.closestP2.y,
                    p2z: rel.closestP2.z,
                  };
                } else {
                  line.valid = false;
                  line.errorMessage = 'Không xác định được đường vuông góc chung.';
                }
              } else {
                line.valid = false;
                line.errorMessage = 'Đường vuông góc chung duy nhất chỉ tồn tại cho hai đường thẳng chéo nhau.';
              }
            }
            break;
          }
        }
        break;
      }

      case 'ray': {
        const ray = obj as Geo3DRay;
        const a = getPointPos(p0);
        const b = getPointPos(p1);
        const d = a && b ? normalize3(sub3(b, a)) : null;
        if (!a || !d) {
          ray.valid = false;
          ray.errorMessage = 'Cần hai điểm phân biệt để tạo tia.';
        } else {
          ray.origin = a;
          ray.direction = d;
        }
        break;
      }

      case 'vector': {
        const vec = obj as Geo3DVector;
        if (vec.rule === 'vector_two_points') {
          const a = getPointPos(p0);
          const b = getPointPos(p1);
          if (!a || !b) {
            vec.valid = false;
            vec.errorMessage = 'Cần điểm đầu và điểm cuối hợp lệ.';
          } else {
            vec.origin = a;
            vec.components = sub3(b, a);
            vec.magnitude = norm3(vec.components);
          }
        } else {
          const ox = Number(vec.params?.ox ?? 0);
          const oy = Number(vec.params?.oy ?? 0);
          const oz = Number(vec.params?.oz ?? 0);
          const vx = Number(vec.params?.vx ?? 1);
          const vy = Number(vec.params?.vy ?? 0);
          const vz = Number(vec.params?.vz ?? 0);
          vec.origin = p0 ? (getPointPos(p0) ?? v3(ox, oy, oz)) : v3(ox, oy, oz);
          vec.components = v3(vx, vy, vz);
          vec.magnitude = norm3(vec.components);
        }
        break;
      }

      case 'plane': {
        const pl = obj as Geo3DPlane;
        const setFromPointNormal = (pt: Vec3, rawN: Vec3) => {
          const n = normalize3(rawN);
          if (!n) {
            pl.valid = false;
            pl.errorMessage = 'Các yếu tố suy biến (thẳng hàng hoặc vectơ pháp tuyến bằng 0) — không xác định được mặt phẳng duy nhất.';
            return;
          }
          pl.normal = n;
          pl.d = -dot3(n, pt);
          pl.anchor = pt;
          pl.rawCoeffs = { a: rawN.x, b: rawN.y, c: rawN.z, d: -dot3(rawN, pt) };
        };

        switch (pl.rule) {
          case 'plane_three_points': {
            const a = getPointPos(p0);
            const b = getPointPos(p1);
            const c = getPointPos(p2);
            if (!a || !b || !c) {
              pl.valid = false;
              pl.errorMessage = 'Cần ba điểm hợp lệ.';
            } else {
              const rawN = cross3(sub3(b, a), sub3(c, a));
              if (norm3(rawN) < 1e-4) {
                pl.valid = false;
                pl.errorMessage = 'Ba điểm thẳng hàng — không xác định được mặt phẳng duy nhất.';
              } else {
                const center = scale3(add3(add3(a, b), c), 1 / 3);
                setFromPointNormal(center, rawN);
              }
            }
            break;
          }
          case 'plane_line_point': {
            const l = getLineLike(p0);
            const pt = getPointPos(p1);
            if (!l || !pt) {
              pl.valid = false;
              pl.errorMessage = 'Cần một đường thẳng và một điểm ngoài đường thẳng.';
            } else {
              const rawN = cross3(l.direction, sub3(pt, l.origin));
              if (norm3(rawN) < 1e-4) {
                pl.valid = false;
                pl.errorMessage = 'Điểm thuộc đường thẳng — không xác định được mặt phẳng duy nhất.';
              } else {
                setFromPointNormal(midpoint3(l.origin, pt), rawN);
              }
            }
            break;
          }
          case 'plane_two_lines': {
            const l1 = getLineLike(p0);
            const l2 = getLineLike(p1);
            if (!l1 || !l2) {
              pl.valid = false;
              pl.errorMessage = 'Cần hai đường thẳng cắt nhau hoặc song song phân biệt.';
            } else {
              const rel = analyzeLineLineRelation(l1.origin, l1.direction, l2.origin, l2.direction);
              if (rel.relation === 'intersecting' && rel.intersection) {
                setFromPointNormal(rel.intersection, cross3(l1.direction, l2.direction));
              } else if (rel.relation === 'parallel') {
                setFromPointNormal(
                  midpoint3(l1.origin, l2.origin),
                  cross3(l1.direction, sub3(l2.origin, l1.origin))
                );
              } else {
                pl.valid = false;
                pl.errorMessage =
                  rel.relation === 'skew'
                    ? 'Hai đường thẳng chéo nhau nên không đồng phẳng.'
                    : 'Hai đường thẳng trùng nhau — vô số mặt phẳng đi qua.';
              }
            }
            break;
          }
          case 'plane_parallel_point': {
            const pt = getPointPos(p0);
            const refPl = getPlaneData(p1);
            if (!pt || !refPl) {
              pl.valid = false;
              pl.errorMessage = 'Cần một điểm và một mặt phẳng tham chiếu.';
            } else {
              setFromPointNormal(pt, refPl.normal);
            }
            break;
          }
          case 'plane_perp_line': {
            const pt = getPointPos(p0);
            const refL = getLineLike(p1);
            if (!pt || !refL) {
              pl.valid = false;
              pl.errorMessage = 'Cần một điểm và một đường thẳng tham chiếu.';
            } else {
              setFromPointNormal(pt, refL.direction);
            }
            break;
          }
          case 'plane_point_normal': {
            const pt = getPointPos(p0) ?? v3(Number(pl.params?.px ?? 0), Number(pl.params?.py ?? 0), Number(pl.params?.pz ?? 0));
            const rawN = v3(Number(pl.params?.nx ?? 0), Number(pl.params?.ny ?? 0), Number(pl.params?.nz ?? 1));
            setFromPointNormal(pt, rawN);
            break;
          }
          case 'plane_equation': {
            const a = Number(pl.params?.a ?? 0);
            const b = Number(pl.params?.b ?? 0);
            const c = Number(pl.params?.c ?? 1);
            const dVal = Number(pl.params?.d ?? 0);
            const len = Math.hypot(a, b, c);
            if (len < EPS3D) {
              pl.valid = false;
              pl.errorMessage = 'Phương trình mặt phẳng cần có A, B, C không đồng thời bằng 0.';
            } else {
              const n = { x: a / len, y: b / len, z: c / len };
              const dNorm = dVal / len;
              pl.normal = n;
              pl.d = dNorm;
              pl.anchor = scale3(n, -dNorm);
              pl.rawCoeffs = { a, b, c, d: dVal };
            }
            break;
          }
        }
        break;
      }

      case 'circle': {
        const cir = obj as Geo3DCircle;
        const center = getPointPos(p0) ?? cir.center;
        const pl = getPlaneData(p1);
        const radiusPt = getPointPos(p2);
        const normal = pl ? pl.normal : (normalize3(cir.normal) ?? { x: 0, y: 0, z: 1 });
        const radius = radiusPt ? dist3(center, radiusPt) : Number(cir.params?.radius ?? cir.radius ?? 2);
        if (!isFiniteVec3(center) || radius < 1e-4) {
          cir.valid = false;
          cir.errorMessage = 'Đường tròn cần tâm hợp lệ và bán kính dương.';
        } else {
          cir.center = center;
          cir.normal = normal;
          cir.radius = radius;
        }
        break;
      }

      case 'polygon': {
        const poly = obj as Geo3DPolygon;
        const verts = obj.parents
          .map((pid) => getPointPos(objs[pid]))
          .filter((p): p is Vec3 => Boolean(p));
        if (verts.length < 3) {
          poly.valid = false;
          poly.errorMessage = 'Đa giác cần ít nhất 3 đỉnh hợp lệ.';
        } else {
          poly.vertices = verts;
          const m = computePolygon3DMetrics(verts);
          poly.area = m.area;
          poly.perimeter = m.perimeter;
          poly.normal = m.normal;
        }
        break;
      }

      case 'solid': {
        const solid = obj as Geo3DSolid;
        const data = buildSolidGeometryData(solid.solidType, solid.center, solid.rotation, solid.params);
        solid.vertices = data.vertices;
        solid.edges = data.edges;
        solid.faces = data.faces;
        if (!solid.vertexLabels || solid.vertexLabels.length !== data.vertices.length) {
          solid.vertexLabels = data.defaultLabels;
        }
        solid.volume = data.volume;
        solid.surfaceArea = data.surfaceArea;
        solid.lateralArea = data.lateralArea;
        solid.baseArea = data.baseArea;
        solid.height = data.height;
        solid.radius = data.radius;
        solid.radiusTop = data.radiusTop;
        solid.isExtendedCurriculum = data.isExtendedCurriculum;
        solid.formulaSummary = data.formulaSummary;
        break;
      }

      case 'cross_section': {
        const cs = obj as Geo3DCrossSection;
        const solid = p0?.kind === 'solid' && p0.valid ? p0 : null;
        const pl = getPlaneData(p1);
        if (!solid || !pl) {
          cs.valid = false;
          cs.errorMessage = 'Cần một hình khối và một mặt phẳng cắt hợp lệ.';
        } else {
          cs.planeNormal = pl.normal;
          cs.planeAnchor = pl.anchor;
          if (
            solid.solidType === 'sphere' ||
            solid.solidType === 'hemisphere' ||
            solid.solidType === 'cylinder' ||
            solid.solidType === 'cone' ||
            solid.solidType === 'cone_frustum'
          ) {
            const res = computeRevolutionCrossSection(
              solid.solidType,
              solid.center,
              solid.rotation,
              solid.radius ?? 2,
              solid.height,
              pl.normal,
              pl.d,
              solid.radiusTop ?? 0
            );
            cs.vertices = res.curveLoops[0] ?? [];
            cs.curveLoops = res.curveLoops;
            cs.curveType = res.curveType;
            cs.vertexLabels = [];
            cs.area = res.area;
            cs.perimeter = res.perimeter;
            cs.statusNote = res.statusNote;
          } else {
            const res = computePolyhedronCrossSection(solid.vertices, solid.edges, pl.normal, pl.d);
            cs.vertices = res.vertices;
            cs.curveLoops = undefined;
            cs.curveType = res.curveType;
            cs.vertexLabels = res.vertices.map((_, i) => `T_${i + 1}`);
            cs.area = res.area;
            cs.perimeter = res.perimeter;
            cs.statusNote = res.statusNote;
          }
        }
        break;
      }

      case 'measurement': {
        const m = obj as Geo3DMeasurement;
        switch (m.rule) {
          case 'measure_distance_pp': {
            const a = getPointPos(p0);
            const b = getPointPos(p1);
            if (!a || !b) {
              m.valid = false;
            } else {
              m.value = dist3(a, b);
              m.anchor = midpoint3(a, b);
              m.formattedValue = `${formatNum(m.value, 2)} ${formatUnit('length', unit)}`;
            }
            break;
          }
          case 'measure_distance_pl': {
            const a = getPointPos(p0);
            const l = getLineLike(p1);
            if (!a || !l) {
              m.valid = false;
            } else {
              const proj = projectPointToLine(a, l.origin, l.direction);
              m.value = proj.distance;
              m.anchor = midpoint3(a, proj.foot);
              m.formattedValue = `d = ${formatNum(m.value, 2)} ${formatUnit('length', unit)}`;
            }
            break;
          }
          case 'measure_distance_pplane': {
            const a = getPointPos(p0);
            const pl = getPlaneData(p1);
            if (!a || !pl) {
              m.valid = false;
            } else {
              const proj = projectPointToPlane(a, pl.normal, pl.d);
              m.value = proj.distance;
              m.anchor = midpoint3(a, proj.foot);
              m.formattedValue = `d = ${formatNum(m.value, 2)} ${formatUnit('length', unit)}`;
            }
            break;
          }
          case 'measure_distance_skew': {
            const l1 = getLineLike(p0);
            const l2 = getLineLike(p1);
            if (!l1 || !l2) {
              m.valid = false;
            } else {
              const rel = analyzeLineLineRelation(l1.origin, l1.direction, l2.origin, l2.direction);
              m.value = rel.distance;
              m.anchor = rel.closestP1 && rel.closestP2 ? midpoint3(rel.closestP1, rel.closestP2) : midpoint3(l1.origin, l2.origin);
              m.formattedValue = `d = ${formatNum(m.value, 2)} ${formatUnit('length', unit)}`;
            }
            break;
          }
          case 'measure_distance_planes': {
            const pl1 = getPlaneData(p0);
            const pl2 = getPlaneData(p1);
            if (!pl1 || !pl2) {
              m.valid = false;
            } else {
              const rel = analyzePlanePlaneRelation(pl1.normal, pl1.d, pl2.normal, pl2.d);
              m.value = rel.distance;
              m.anchor = midpoint3(pl1.anchor, pl2.anchor);
              m.formattedValue =
                rel.relation === 'intersecting'
                  ? 'Hai mặt phẳng cắt nhau (d = 0)'
                  : `d = ${formatNum(m.value, 2)} ${formatUnit('length', unit)}`;
            }
            break;
          }
          case 'measure_angle_vectors': {
            const v1 = p0?.kind === 'vector' && p0.valid ? p0.components : null;
            const v2 = p1?.kind === 'vector' && p1.valid ? p1.components : null;
            const deg = v1 && v2 ? angleBetweenVectorsDeg(v1, v2) : null;
            if (deg === null) {
              m.valid = false;
            } else {
              m.value = deg;
              m.anchor = (p0 as Geo3DVector).origin;
              m.formattedValue = `${formatNum(deg, 1)}°`;
            }
            break;
          }
          case 'measure_angle_lines': {
            const l1 = getLineLike(p0);
            const l2 = getLineLike(p1);
            const deg = l1 && l2 ? angleBetweenLinesDeg(l1.direction, l2.direction) : null;
            if (deg === null) {
              m.valid = false;
            } else {
              m.value = deg;
              m.anchor = midpoint3(l1!.origin, l2!.origin);
              m.formattedValue = `${formatNum(deg, 1)}°`;
            }
            break;
          }
          case 'measure_angle_line_plane': {
            const l = getLineLike(p0);
            const pl = getPlaneData(p1);
            const deg = l && pl ? angleLinePlaneDeg(l.direction, pl.normal) : null;
            if (deg === null) {
              m.valid = false;
            } else {
              m.value = deg;
              m.anchor = l!.origin;
              m.formattedValue = `${formatNum(deg, 1)}°`;
            }
            break;
          }
          case 'measure_angle_planes': {
            const pl1 = getPlaneData(p0);
            const pl2 = getPlaneData(p1);
            const deg = pl1 && pl2 ? angleBetweenPlanesDeg(pl1.normal, pl2.normal) : null;
            if (deg === null) {
              m.valid = false;
            } else {
              m.value = deg;
              m.anchor = midpoint3(pl1!.anchor, pl2!.anchor);
              m.formattedValue = `${formatNum(deg, 1)}°`;
            }
            break;
          }
          case 'measure_dihedral_angle': {
            const ptP = getPointPos(p0);
            const ptA = getPointPos(p1);
            const ptB = getPointPos(p2);
            const ptQ = getPointPos(p3);
            const deg = ptP && ptA && ptB && ptQ ? dihedralAngleDeg(ptP, ptA, ptB, ptQ) : null;
            if (deg === null) {
              m.valid = false;
            } else {
              m.value = deg;
              m.anchor = midpoint3(ptA!, ptB!);
              m.formattedValue = `Nhị diện = ${formatNum(deg, 1)}°`;
            }
            break;
          }
          case 'measure_polygon_metrics': {
            const poly = p0?.kind === 'polygon' && p0.valid ? p0 : null;
            if (!poly) {
              m.valid = false;
            } else {
              m.value = poly.area;
              m.anchor = poly.vertices[0] ?? v3(0, 0, 0);
              m.formattedValue = `S = ${formatNum(poly.area, 2)} ${formatUnit('area', unit)} · P = ${formatNum(poly.perimeter, 2)}`;
            }
            break;
          }
        }
        break;
      }

      case 'formula': {
        const f = obj as Geo3DFormulaNote;
        if (!isFiniteVec3(f.position)) f.position = v3(0, 0, 0);
        break;
      }
    }

    objs[id] = obj;
  }

  return { ...scene, objects: objs };
}

export interface Add3DObjectInput {
  id?: string;
  kind: Geo3DObject['kind'];
  rule: Geo3DRule;
  parents?: string[];
  label?: string;
  constraint?: Geo3DObject['constraint'];
  style?: Partial<Geo3DStyle>;
  params?: Record<string, number | string | boolean | number[]>;
  position?: Vec3;
  t?: number;
  uv?: { u: number; v: number };
  solidType?: Geo3DSolid['solidType'];
  center?: Vec3;
  rotation?: Vec3;
  vertexLabels?: string[];
  metricKind?: Geo3DMeasurement['metricKind'];
  latex?: string;
  toolName?: string;
  logDescription?: string;
  skipLog?: boolean;
}

export function addGeo3DObject(
  scene: Geo3DScene,
  input: Add3DObjectInput
): { scene: Geo3DScene; id: string } {
  const id = input.id ?? `g3_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
  let nextIdx = scene.nextLabelIndex;
  let label = input.label;
  if (!label) {
    if (input.kind === 'point') {
      label = nextPointLabel3D(nextIdx);
      nextIdx += 1;
    } else if (input.kind === 'plane') {
      label = `(P_${scene.order.length + 1})`;
    } else if (input.kind === 'line') {
      label = `d_${scene.order.length + 1}`;
    } else if (input.kind === 'vector') {
      label = `u_${scene.order.length + 1}`;
    } else if (input.kind === 'cross_section') {
      label = 'Thiết diện';
    } else {
      label = `Obj_${scene.order.length + 1}`;
    }
  }

  const baseStyle: Geo3DStyle = {
    color:
      input.kind === 'point'
        ? '#0F766E'
        : input.kind === 'plane'
          ? '#0284C7'
          : input.kind === 'cross_section'
            ? '#D97706'
            : input.kind === 'vector'
              ? '#7C3AED'
              : '#172033',
    opacity: input.kind === 'plane' ? 0.22 : input.kind === 'cross_section' ? 0.36 : input.kind === 'solid' ? 0.2 : 1,
    size: 1,
    lineWidth: 2,
    dashed: false,
    showLabel: true,
    showFaces: true,
    showEdges: true,
    showVertices: true,
    showDiagonals: false,
    showAltitude: false,
    showAxis: false,
    planeExtent: 4.5,
    ...(input.style ?? {}),
  };

  const constraint =
    input.constraint ??
    (input.rule === 'free_point_3d' || input.rule === 'point_coords'
      ? 'free'
      : input.rule === 'point_on_line' || input.rule === 'point_on_segment' || input.rule === 'point_on_plane'
        ? 'constrained'
        : 'dependent');

  const common = {
    id,
    rule: input.rule,
    parents: input.parents ?? [],
    label,
    constraint,
    valid: true,
    style: baseStyle,
    params: input.params,
  };

  let created: Geo3DObject;
  switch (input.kind) {
    case 'point':
      created = {
        ...common,
        kind: 'point',
        position: input.position ?? v3(0, 0, 0),
        t: input.t,
        uv: input.uv,
      };
      break;
    case 'segment':
      created = { ...common, kind: 'segment', p1: v3(0, 0, 0), p2: v3(1, 0, 0), length: 1 };
      break;
    case 'line':
      created = { ...common, kind: 'line', origin: v3(0, 0, 0), direction: v3(1, 0, 0) };
      break;
    case 'ray':
      created = { ...common, kind: 'ray', origin: v3(0, 0, 0), direction: v3(1, 0, 0) };
      break;
    case 'vector':
      created = { ...common, kind: 'vector', origin: v3(0, 0, 0), components: v3(1, 0, 0), magnitude: 1 };
      break;
    case 'plane':
      created = {
        ...common,
        kind: 'plane',
        normal: v3(0, 0, 1),
        d: 0,
        anchor: v3(0, 0, 0),
        rawCoeffs: { a: 0, b: 0, c: 1, d: 0 },
      };
      break;
    case 'circle':
      created = { ...common, kind: 'circle', center: input.center ?? v3(0, 0, 0), normal: v3(0, 0, 1), radius: 2 };
      break;
    case 'polygon':
      created = { ...common, kind: 'polygon', vertices: [], area: 0, perimeter: 0, normal: v3(0, 0, 1) };
      break;
    case 'solid':
      created = {
        ...common,
        kind: 'solid',
        constraint: 'free',
        solidType: input.solidType ?? 'cube',
        center: input.center ?? v3(0, 0, 0),
        rotation: input.rotation ?? v3(0, 0, 0),
        vertexLabels: input.vertexLabels ?? [],
        vertices: [],
        edges: [],
        faces: [],
        volume: 0,
        surfaceArea: 0,
        lateralArea: 0,
        baseArea: 0,
        height: 3,
        formulaSummary: '',
      };
      break;
    case 'cross_section':
      created = {
        ...common,
        kind: 'cross_section',
        vertices: [],
        vertexLabels: [],
        area: 0,
        perimeter: 0,
        planeNormal: v3(0, 0, 1),
        planeAnchor: v3(0, 0, 0),
        statusNote: '',
      };
      break;
    case 'measurement':
      created = {
        ...common,
        kind: 'measurement',
        metricKind: input.metricKind ?? 'length',
        value: 0,
        formattedValue: '—',
        anchor: v3(0, 0, 0),
      };
      break;
    case 'formula':
      created = {
        ...common,
        kind: 'formula',
        constraint: 'free',
        latex: input.latex ?? 'V = S_{\\text{đáy}} \\cdot h',
        position: input.position ?? v3(0, 0, 4),
      };
      break;
  }

  const log = input.skipLog
    ? scene.log
    : [
        ...scene.log,
        {
          step: scene.log.length + 1,
          objectId: id,
          label,
          toolName: input.toolName ?? input.kind,
          description: input.logDescription ?? `Dựng ${label}`,
          timestamp: Date.now(),
        },
      ];

  const nextScene: Geo3DScene = {
    ...scene,
    objects: { ...scene.objects, [id]: created },
    order: [...scene.order, id],
    log,
    nextLabelIndex: nextIdx,
  };

  return { scene: recomputeScene3D(nextScene), id };
}

/** Update any object's editable properties and recompute dependent DAG */
export function updateGeo3DObject(
  scene: Geo3DScene,
  id: string,
  updater: (obj: Geo3DObject) => Geo3DObject
): Geo3DScene {
  const existing = scene.objects[id];
  if (!existing) return scene;
  const updated = updater(existing);
  return recomputeScene3D({
    ...scene,
    objects: { ...scene.objects, [id]: updated },
  });
}

/** Move a free or constrained point respecting its degrees of freedom (never breaks constraints!) */
export function movePoint3D(scene: Geo3DScene, id: string, targetPos: Vec3): Geo3DScene {
  const obj = scene.objects[id];
  if (!obj || obj.kind !== 'point') return scene;
  if (obj.constraint === 'dependent' || obj.constraint === 'fixed') return scene;

  if (obj.rule === 'free_point_3d' || obj.rule === 'point_coords') {
    return updateGeo3DObject(scene, id, (o) => ({ ...(o as Geo3DPoint), position: targetPos }));
  }

  if (obj.rule === 'point_on_line') {
    const l = getLineLike(scene.objects[obj.parents[0]]);
    if (!l) return scene;
    const { t } = projectPointToLine(targetPos, l.origin, l.direction);
    return updateGeo3DObject(scene, id, (o) => ({ ...(o as Geo3DPoint), t }));
  }

  if (obj.rule === 'point_on_segment') {
    const seg = scene.objects[obj.parents[0]];
    if (!seg || seg.kind !== 'segment' || !seg.valid) return scene;
    const dir = sub3(seg.p2, seg.p1);
    const lenSq = dot3(dir, dir);
    const t = lenSq > EPS3D ? Math.max(0, Math.min(1, dot3(sub3(targetPos, seg.p1), dir) / lenSq)) : 0.5;
    return updateGeo3DObject(scene, id, (o) => ({ ...(o as Geo3DPoint), t }));
  }

  if (obj.rule === 'point_on_plane') {
    const pl = getPlaneData(scene.objects[obj.parents[0]]);
    if (!pl) return scene;
    const { foot } = projectPointToPlane(targetPos, pl.normal, pl.d);
    const { u, v } = planeBasis(pl.normal);
    const rel = sub3(foot, pl.anchor);
    return updateGeo3DObject(scene, id, (o) => ({
      ...(o as Geo3DPoint),
      uv: { u: dot3(rel, u), v: dot3(rel, v) },
    }));
  }

  return scene;
}

/** Delete an object and all objects depending on it in the DAG */
export function deleteGeo3DObjectWithDependents(scene: Geo3DScene, targetId: string): Geo3DScene {
  const toDelete = new Set<string>([targetId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of scene.order) {
      if (toDelete.has(id)) continue;
      const obj = scene.objects[id];
      if (obj && obj.parents.some((p) => toDelete.has(p))) {
        toDelete.add(id);
        changed = true;
      }
    }
  }

  const nextObjects: Record<string, Geo3DObject> = {};
  const nextOrder: string[] = [];
  for (const id of scene.order) {
    if (!toDelete.has(id) && scene.objects[id]) {
      nextObjects[id] = scene.objects[id];
      nextOrder.push(id);
    }
  }

  return recomputeScene3D({
    ...scene,
    objects: nextObjects,
    order: nextOrder,
    log: scene.log.filter((l) => !toDelete.has(l.objectId)),
  });
}

/** Extract working plane equation (n·X + d = 0) from scene.workingPlane */
export function getWorkingPlaneEquation(scene: Geo3DScene): { normal: Vec3; d: number; anchor: Vec3; label: string } {
  const wp = scene.workingPlane;
  if (wp.kind === 'custom' && wp.customPlaneId) {
    const pl = getPlaneData(scene.objects[wp.customPlaneId]);
    if (pl) {
      return { ...pl, label: scene.objects[wp.customPlaneId].label };
    }
  }
  if (wp.kind === 'Oxz') {
    return { normal: v3(0, 1, 0), d: -wp.offset, anchor: v3(0, wp.offset, 0), label: `Oxz (y = ${formatNum(wp.offset, 1)})` };
  }
  if (wp.kind === 'Oyz') {
    return { normal: v3(1, 0, 0), d: -wp.offset, anchor: v3(wp.offset, 0, 0), label: `Oyz (x = ${formatNum(wp.offset, 1)})` };
  }
  return { normal: v3(0, 0, 1), d: -wp.offset, anchor: v3(0, 0, wp.offset), label: `Oxy (z = ${formatNum(wp.offset, 1)})` };
}
