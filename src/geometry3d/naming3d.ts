import { fmtNum } from './math3d';
import type {
  ConstructionLog3DItem,
  Geo3DObject,
  Geo3DObjectKind,
  Geo3DScene,
  Solid3DType,
} from './types3d';

export type ObjectGroupKey3D =
  | 'point'
  | 'line_segment'
  | 'circle_arc'
  | 'polygon'
  | 'vector'
  | 'plane'
  | 'solid'
  | 'measure';

export interface ObjectGroup3D {
  key: ObjectGroupKey3D;
  title: string;
  objects: Geo3DObject[];
}

export const SOLID_TYPE_VI_NAME: Record<Solid3DType, string> = {
  cube: 'Hình lập phương',
  box: 'Hình hộp chữ nhật',
  parallelepiped: 'Hình hộp',
  tetrahedron: 'Tứ diện',
  regular_tetrahedron: 'Tứ diện đều',
  pyramid: 'Hình chóp',
  regular_pyramid: 'Hình chóp đều',
  pyramid_frustum: 'Hình chóp cụt',
  prism: 'Hình lăng trụ',
  right_prism: 'Hình lăng trụ đứng',
  octahedron: 'Bát diện đều',
  dodecahedron: 'Mười hai mặt đều',
  icosahedron: 'Hai mươi mặt đều',
  cylinder: 'Hình trụ',
  cone: 'Hình nón',
  cone_frustum: 'Hình nón cụt',
  sphere: 'Mặt cầu',
  hemisphere: 'Bán cầu',
};

export const KIND_VI_LABEL_3D: Record<Geo3DObjectKind, string> = {
  point: 'Điểm',
  segment: 'Đoạn thẳng',
  line: 'Đường thẳng',
  ray: 'Tia',
  vector: 'Vectơ',
  plane: 'Mặt phẳng',
  circle: 'Đường tròn',
  polygon: 'Đa giác',
  solid: 'Hình khối',
  cross_section: 'Thiết diện',
  measurement: 'Đo lường',
  formula: 'Công thức',
};

const TECHNICAL_ID_3D_RE =
  /^(?:g3|po|li|se|ra|pl|so|cs|ve|ms|fm|obj|draw|tpl)_[a-z0-9_]{3,}$/i;
const LEGACY_CODE_3D_RE = /^(?:Obj_?\d+|[SLCRPAFM]\d+|d_\d+|u_\d+|\(P_\d+\))$/i;
const UUID_3D_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isTechnicalCode3D(raw?: string | null): boolean {
  if (raw == null) return true;
  const s = String(raw).trim();
  if (!s) return true;
  const low = s.toLowerCase();
  if (low === 'undefined' || low === 'null' || low === 'nan' || low === 'point_id' || low === 'object_id') {
    return true;
  }
  return TECHNICAL_ID_3D_RE.test(s) || LEGACY_CODE_3D_RE.test(s) || UUID_3D_RE.test(s);
}

export function normalizePointSymbol3D(raw: string): string {
  const cleaned = raw.trim();
  const stripped = cleaned
    .replace(/^(?:điểm|trung điểm|giao điểm|hình chiếu|trọng tâm)\s+/i, '')
    .trim();
  return stripped || cleaned;
}

export function getPointSymbol3D(scene: Geo3DScene, idOrObj: string | Geo3DObject | undefined | null): string {
  const obj = typeof idOrObj === 'string' ? scene.objects[idOrObj] : idOrObj;
  if (!obj || obj.kind !== 'point') return '';
  const raw = (obj.label ?? '').trim();
  if (!raw || TECHNICAL_ID_3D_RE.test(raw) || UUID_3D_RE.test(raw) || raw === 'undefined' || raw === 'null') {
    return '';
  }
  return normalizePointSymbol3D(raw);
}

function getPlaneSymbol3D(scene: Geo3DScene, idOrObj: string | Geo3DObject | undefined | null): string {
  const obj = typeof idOrObj === 'string' ? scene.objects[idOrObj] : idOrObj;
  if (!obj || obj.kind !== 'plane') return '';
  if (obj.rule === 'plane_three_points' && obj.parents.length >= 3) {
    const a = getPointSymbol3D(scene, obj.parents[0]);
    const b = getPointSymbol3D(scene, obj.parents[1]);
    const c = getPointSymbol3D(scene, obj.parents[2]);
    if (a && b && c) return `(${a}${b}${c})`;
  }
  const raw = (obj.label ?? '').trim();
  if (!raw || isTechnicalCode3D(raw)) return '(P)';
  if (raw.startsWith('Mặt phẳng ')) return raw.replace(/^Mặt phẳng\s+/i, '');
  return raw.startsWith('(') ? raw : `(${raw})`;
}

function getPairPoints3D(scene: Geo3DScene, obj: Geo3DObject): [string, string] | null {
  if (obj.parents.length >= 2) {
    const a = getPointSymbol3D(scene, obj.parents[0]);
    const b = getPointSymbol3D(scene, obj.parents[1]);
    if (a && b) return [a, b];
  }
  if (obj.parents.length === 1) {
    const host = scene.objects[obj.parents[0]];
    if (host && (host.kind === 'segment' || host.kind === 'line' || host.kind === 'ray')) {
      return getPairPoints3D(scene, host);
    }
  }
  return null;
}

function isPreservedNonPointCustomLabel3D(scene: Geo3DScene, obj: Geo3DObject): boolean {
  if (obj.customLabel === true) {
    return Boolean(obj.label && !isTechnicalCode3D(obj.label));
  }
  if (obj.customLabel === false) return false;
  const raw = (obj.label ?? '').trim();
  if (!raw || isTechnicalCode3D(raw)) return false;

  // Bare shorthands for segments, lines, planes, polygons should upgrade to full textbook names
  const pair = getPairPoints3D(scene, obj);
  if (pair && (raw === `${pair[0]}${pair[1]}` || raw === `${pair[1]}${pair[0]}`)) {
    return false;
  }
  if (obj.kind === 'plane' && /^\([A-Za-z0-9'_]+\)$/.test(raw)) {
    return false;
  }
  if (obj.kind === 'polygon') {
    const pts = obj.parents.map((p) => getPointSymbol3D(scene, p)).filter(Boolean);
    if (pts.length >= 3 && raw === pts.join('')) return false;
  }
  if (obj.kind === 'solid') {
    // Solid labels are enriched with solid type name unless already starting with solid type
    return false;
  }
  if (obj.kind === 'vector' && (/^[a-z](?:_[0-9]+)?$/i.test(raw) || raw.startsWith('→'))) {
    return false;
  }
  if (obj.kind === 'line' && /^[a-z](?:_[0-9]+)?$/i.test(raw) && raw.length <= 3) {
    return false;
  }
  return raw.includes(' ');
}

/** Compute the full Vietnamese textbook geometric display name for any 3D object */
export function getObjectDisplayName3D(scene: Geo3DScene, obj: Geo3DObject | undefined | null): string {
  if (!obj) return '';

  if (obj.kind === 'point') {
    const sym = getPointSymbol3D(scene, obj);
    if (!sym) return 'Điểm';
    const rawTrim = (obj.label ?? '').trim();
    if (obj.customLabel && rawTrim.includes(' ') && !isTechnicalCode3D(rawTrim)) {
      return rawTrim;
    }
    switch (obj.rule) {
      case 'midpoint_3d':
        return `Trung điểm ${sym}`;
      case 'intersect_line_line':
      case 'intersect_line_plane':
        return `Giao điểm ${sym}`;
      case 'foot_point_line':
      case 'foot_point_plane':
        return `Hình chiếu ${sym}`;
      default:
        return `Điểm ${sym}`;
    }
  }

  if (isPreservedNonPointCustomLabel3D(scene, obj)) {
    return obj.label.trim();
  }

  if (obj.kind === 'segment') {
    const pair = getPairPoints3D(scene, obj);
    return pair ? `Đoạn thẳng ${pair[0]}${pair[1]}` : 'Đoạn thẳng';
  }

  if (obj.kind === 'ray') {
    const pair = getPairPoints3D(scene, obj);
    return pair ? `Tia ${pair[0]}${pair[1]}` : 'Tia';
  }

  if (obj.kind === 'line') {
    if (obj.rule === 'line_two_points') {
      const pair = getPairPoints3D(scene, obj);
      return pair ? `Đường thẳng ${pair[0]}${pair[1]}` : 'Đường thẳng';
    }
    if (obj.rule === 'intersect_plane_plane') {
      const p1 = getPlaneSymbol3D(scene, obj.parents[0]);
      const p2 = getPlaneSymbol3D(scene, obj.parents[1]);
      return p1 && p2 ? `Giao tuyến của ${p1} và ${p2}` : 'Giao tuyến';
    }
    if (obj.rule === 'line_parallel_point') {
      const pt = getPointSymbol3D(scene, obj.parents[0]);
      return pt ? `Đường thẳng song song qua ${pt}` : 'Đường thẳng song song';
    }
    if (obj.rule === 'line_perp_plane') {
      const pt = getPointSymbol3D(scene, obj.parents[0]);
      const pl = getPlaneSymbol3D(scene, obj.parents[1]);
      if (pt && pl) return `Đường vuông góc với ${pl} qua ${pt}`;
      return pt ? `Đường vuông góc qua ${pt}` : 'Đường thẳng vuông góc';
    }
    if (obj.rule === 'common_perpendicular') {
      return 'Đường vuông góc chung';
    }
    if (obj.rule === 'line_point_direction') {
      const pt = getPointSymbol3D(scene, obj.parents[0]);
      return pt ? `Đường thẳng qua ${pt}` : 'Đường thẳng theo VTCP';
    }
    const clean = (obj.label ?? '').trim();
    return clean && !isTechnicalCode3D(clean) ? `Đường thẳng ${clean}` : 'Đường thẳng';
  }

  if (obj.kind === 'vector') {
    const pair = getPairPoints3D(scene, obj);
    if (pair) return `Vectơ ${pair[0]}${pair[1]}`;
    const clean = (obj.label ?? '').replace(/^→/, '').trim();
    return clean && !isTechnicalCode3D(clean) ? `Vectơ ${clean}` : 'Vectơ';
  }

  if (obj.kind === 'plane') {
    if (obj.rule === 'plane_three_points') {
      const a = getPointSymbol3D(scene, obj.parents[0]);
      const b = getPointSymbol3D(scene, obj.parents[1]);
      const c = getPointSymbol3D(scene, obj.parents[2]);
      if (a && b && c) return `Mặt phẳng (${a}${b}${c})`;
    }
    if (obj.rule === 'plane_parallel_point') {
      const pt = getPointSymbol3D(scene, obj.parents[0]);
      const pl = getPlaneSymbol3D(scene, obj.parents[1]);
      if (pt && pl) return `Mặt phẳng qua ${pt} song song ${pl}`;
    }
    if (obj.rule === 'plane_perp_line') {
      const pt = getPointSymbol3D(scene, obj.parents[0]);
      if (pt) return `Mặt phẳng vuông góc qua ${pt}`;
    }
    const sym = getPlaneSymbol3D(scene, obj);
    return `Mặt phẳng ${sym}`;
  }

  if (obj.kind === 'circle') {
    const c = getPointSymbol3D(scene, obj.parents[0]);
    return c ? `Đường tròn (${c})` : 'Đường tròn trong không gian';
  }

  if (obj.kind === 'polygon') {
    const pts = obj.parents.map((p) => getPointSymbol3D(scene, p)).filter(Boolean);
    const count = pts.length || obj.vertices.length;
    const suffix = pts.length >= 3 ? ` ${pts.join('')}` : '';
    if (count === 3) return `Tam giác${suffix}`;
    if (count === 4) return `Tứ giác${suffix}`;
    if (count === 5) return `Ngũ giác${suffix}`;
    if (count === 6) return `Lục giác${suffix}`;
    return suffix ? `Đa giác${suffix}` : `Đa giác ${count} đỉnh`;
  }

  if (obj.kind === 'solid') {
    const baseType = SOLID_TYPE_VI_NAME[obj.solidType] ?? 'Hình khối';
    const raw = (obj.label ?? '').trim();
    if (obj.customLabel && raw && !isTechnicalCode3D(raw)) {
      return raw;
    }
    if (raw && !isTechnicalCode3D(raw)) {
      if (raw.toLowerCase().startsWith(baseType.toLowerCase())) return raw;
      if (/^(?:hình|tứ diện|mặt cầu|bán cầu|bát diện|khối)/i.test(raw)) return raw;
      return `${baseType} ${raw}`;
    }
    return baseType;
  }

  if (obj.kind === 'cross_section') {
    const solidObj = obj.parents[0] ? scene.objects[obj.parents[0]] : undefined;
    const solidName = solidObj ? getObjectDisplayName3D(scene, solidObj) : '';
    const vCount = obj.vertices.length;
    if (obj.curveType === 'circle') return 'Thiết diện hình tròn';
    if (obj.curveType === 'ellipse') return 'Thiết diện hình elip';
    if (vCount === 3) return 'Thiết diện tam giác';
    if (vCount === 4) return 'Thiết diện tứ giác';
    if (vCount === 5) return 'Thiết diện ngũ giác';
    if (vCount === 6) return 'Thiết diện lục giác';
    return solidName ? `Thiết diện của ${solidName.toLowerCase()}` : 'Thiết diện';
  }

  if (obj.kind === 'measurement') {
    const clean = (obj.label ?? '').trim();
    const prefixMap: Record<typeof obj.metricKind, string> = {
      length: 'Độ dài',
      distance: 'Khoảng cách',
      angle: 'Góc',
      dihedral: 'Góc nhị diện',
      area: 'Diện tích',
      perimeter: 'Chu vi',
      volume: 'Thể tích',
    };
    const prefix = prefixMap[obj.metricKind] ?? 'Đo lường';
    if (clean && !isTechnicalCode3D(clean)) {
      if (clean.toLowerCase().startsWith(prefix.toLowerCase())) return clean;
      return `${prefix} ${clean}`;
    }
    return prefix;
  }

  if (obj.kind === 'formula') {
    return 'Ghi chú công thức';
  }

  return 'Đối tượng không gian';
}

/** Friendly non-technical Vietnamese subtitle for any 3D object */
export function getObjectDescription3D(scene: Geo3DScene, obj: Geo3DObject): string {
  if (obj.kind === 'point') {
    const coords = `(${fmtNum(obj.position.x, 1)}; ${fmtNum(obj.position.y, 1)}; ${fmtNum(obj.position.z, 1)})`;
    switch (obj.rule) {
      case 'free_point_3d':
        return `Điểm di chuyển được · ${coords}`;
      case 'point_coords':
        return `Điểm theo tọa độ ${coords}`;
      case 'point_on_line':
      case 'point_on_segment':
      case 'point_on_plane': {
        const host = scene.objects[obj.parents[0]];
        const hName = host ? getObjectDisplayName3D(scene, host).toLowerCase() : 'đối tượng';
        return `Nằm trên ${hName}`;
      }
      case 'midpoint_3d': {
        const pair = getPairPoints3D(scene, obj);
        return pair ? `Trung điểm của đoạn thẳng ${pair[0]}${pair[1]}` : 'Trung điểm đoạn thẳng';
      }
      case 'intersect_line_line':
      case 'intersect_line_plane': {
        const o1 = scene.objects[obj.parents[0]];
        const o2 = scene.objects[obj.parents[1]];
        if (o1 && o2) {
          return `Giao của ${getObjectDisplayName3D(scene, o1).toLowerCase()} và ${getObjectDisplayName3D(scene, o2).toLowerCase()}`;
        }
        return 'Giao điểm trong không gian';
      }
      case 'foot_point_line':
      case 'foot_point_plane': {
        const pt = getPointSymbol3D(scene, obj.parents[0]);
        const target = scene.objects[obj.parents[1]];
        const tName = target ? getObjectDisplayName3D(scene, target).toLowerCase() : 'đối tượng';
        return pt ? `Hình chiếu vuông góc của ${pt} lên ${tName}` : `Hình chiếu vuông góc lên ${tName}`;
      }
      case 'reflect_point_point': {
        const pt = getPointSymbol3D(scene, obj.parents[0]);
        const c = getPointSymbol3D(scene, obj.parents[1]);
        return pt && c ? `Đối xứng của ${pt} qua điểm ${c}` : 'Đối xứng qua tâm';
      }
      case 'reflect_point_plane': {
        const pt = getPointSymbol3D(scene, obj.parents[0]);
        const pl = getPlaneSymbol3D(scene, obj.parents[1]);
        return pt && pl ? `Đối xứng của ${pt} qua mặt phẳng ${pl}` : 'Đối xứng qua mặt phẳng';
      }
      default:
        return `Tọa độ ${coords}`;
    }
  }

  if (obj.kind === 'segment') {
    const pair = getPairPoints3D(scene, obj);
    const lenText = obj.valid ? ` · dài ${fmtNum(obj.length, 2)}` : '';
    return pair ? `Nối hai điểm ${pair[0]} và ${pair[1]}${lenText}` : `Đoạn thẳng${lenText}`;
  }

  if (obj.kind === 'ray') {
    const pair = getPairPoints3D(scene, obj);
    return pair ? `Gốc tại điểm ${pair[0]}, đi qua điểm ${pair[1]}` : 'Tia trong không gian';
  }

  if (obj.kind === 'line') {
    if (obj.rule === 'line_two_points') {
      const pair = getPairPoints3D(scene, obj);
      return pair ? `Đi qua hai điểm ${pair[0]} và ${pair[1]}` : 'Đi qua hai điểm';
    }
    if (obj.rule === 'intersect_plane_plane') {
      return 'Giao tuyến của hai mặt phẳng';
    }
    if (obj.rule === 'line_parallel_point') {
      const ref = scene.objects[obj.parents[1]];
      const rName = ref ? getObjectDisplayName3D(scene, ref).toLowerCase() : 'đường thẳng chuẩn';
      return `Song song với ${rName}`;
    }
    if (obj.rule === 'line_perp_plane') {
      const pl = getPlaneSymbol3D(scene, obj.parents[1]);
      return `Vuông góc với mặt phẳng ${pl}`;
    }
    if (obj.rule === 'common_perpendicular') {
      return 'Đoạn vuông góc chung hai đường thẳng chéo nhau';
    }
    return `VTCP (${fmtNum(obj.direction.x, 2)}; ${fmtNum(obj.direction.y, 2)}; ${fmtNum(obj.direction.z, 2)})`;
  }

  if (obj.kind === 'vector') {
    return `Tọa độ (${fmtNum(obj.components.x, 1)}; ${fmtNum(obj.components.y, 1)}; ${fmtNum(obj.components.z, 1)}) · độ dài ${fmtNum(obj.magnitude, 2)}`;
  }

  if (obj.kind === 'plane') {
    if (obj.rule === 'plane_three_points') {
      const a = getPointSymbol3D(scene, obj.parents[0]);
      const b = getPointSymbol3D(scene, obj.parents[1]);
      const c = getPointSymbol3D(scene, obj.parents[2]);
      if (a && b && c) return `Đi qua ba điểm ${a}, ${b}, ${c}`;
    }
    if (obj.rule === 'plane_parallel_point') {
      const pl = getPlaneSymbol3D(scene, obj.parents[1]);
      return `Song song với mặt phẳng ${pl}`;
    }
    if (obj.rule === 'plane_perp_line') {
      const line = scene.objects[obj.parents[1]];
      const lName = line ? getObjectDisplayName3D(scene, line).toLowerCase() : 'đường thẳng';
      return `Vuông góc với ${lName}`;
    }
    return `VTPT (${fmtNum(obj.normal.x, 2)}; ${fmtNum(obj.normal.y, 2)}; ${fmtNum(obj.normal.z, 2)})`;
  }

  if (obj.kind === 'circle') {
    return `Bán kính r = ${fmtNum(obj.radius, 2)}`;
  }

  if (obj.kind === 'polygon') {
    return `Diện tích S ≈ ${fmtNum(obj.area, 2)} · Chu vi ${fmtNum(obj.perimeter, 2)}`;
  }

  if (obj.kind === 'solid') {
    return `Thể tích V ≈ ${fmtNum(obj.volume, 2)} · S_tp ≈ ${fmtNum(obj.surfaceArea, 2)}`;
  }

  if (obj.kind === 'cross_section') {
    if (obj.vertices.length === 0 && (!obj.curveLoops || obj.curveLoops.length === 0)) {
      return obj.statusNote || 'Mặt phẳng chưa cắt hình khối';
    }
    return `Diện tích S ≈ ${fmtNum(obj.area, 2)} · Chu vi ${fmtNum(obj.perimeter, 2)}`;
  }

  if (obj.kind === 'measurement') {
    return `Giá trị đo: ${obj.formattedValue}`;
  }

  if (obj.kind === 'formula') {
    return 'Công thức toán học trên không gian 3D';
  }

  return '';
}

const GROUP_ORDER_3D: Array<{ key: ObjectGroupKey3D; title: string }> = [
  { key: 'point', title: 'Điểm' },
  { key: 'line_segment', title: 'Đường thẳng và đoạn thẳng' },
  { key: 'circle_arc', title: 'Đường tròn và cung tròn' },
  { key: 'polygon', title: 'Đa giác' },
  { key: 'vector', title: 'Vectơ' },
  { key: 'plane', title: 'Mặt phẳng' },
  { key: 'solid', title: 'Hình khối' },
  { key: 'measure', title: 'Đối tượng đo lường' },
];

export function getObjectGroupKey3D(obj: Geo3DObject): ObjectGroupKey3D {
  switch (obj.kind) {
    case 'point':
      return 'point';
    case 'segment':
    case 'line':
    case 'ray':
      return 'line_segment';
    case 'circle':
      return 'circle_arc';
    case 'polygon':
    case 'cross_section':
      return 'polygon';
    case 'vector':
      return 'vector';
    case 'plane':
      return 'plane';
    case 'solid':
      return 'solid';
    case 'measurement':
    case 'formula':
    default:
      return 'measure';
  }
}

/** Group 3D scene objects by category, returning ONLY non-empty groups */
export function groupObjects3D(scene: Geo3DScene): ObjectGroup3D[] {
  const buckets: Record<ObjectGroupKey3D, Geo3DObject[]> = {
    point: [],
    line_segment: [],
    circle_arc: [],
    polygon: [],
    vector: [],
    plane: [],
    solid: [],
    measure: [],
  };

  for (const id of scene.order) {
    const obj = scene.objects[id];
    if (!obj) continue;
    buckets[getObjectGroupKey3D(obj)].push(obj);
  }

  return GROUP_ORDER_3D.filter((g) => buckets[g.key].length > 0).map((g) => ({
    key: g.key,
    title: g.title,
    objects: buckets[g.key],
  }));
}

/** Resolve pending 3D ref IDs to full textbook names (never leaks raw IDs) */
export function getPendingDisplayNames3D(scene: Geo3DScene, pendingIds: string[]): string[] {
  const out: string[] = [];
  for (const id of pendingIds) {
    const obj = scene.objects[id];
    if (!obj) continue;
    const name = getObjectDisplayName3D(scene, obj);
    if (name && !isTechnicalCode3D(name)) {
      out.push(name);
    }
  }
  return out;
}

/** Live 3D construction log description reflecting current object names */
export function getLogDescription3D(scene: Geo3DScene, step: ConstructionLog3DItem): string {
  const obj = scene.objects[step.objectId];
  if (obj) {
    return `Dựng ${getObjectDisplayName3D(scene, obj)}`;
  }
  const cleaned = step.description.replace(/\b(?:Obj_\d+|g3_[a-z0-9_]+)\b/gi, 'đối tượng').trim();
  return cleaned || 'Bước dựng hình';
}
