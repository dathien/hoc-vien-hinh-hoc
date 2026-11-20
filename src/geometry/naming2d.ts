import type {
  ConstructionLogEntry,
  GeoObject,
  GeoPoint,
  GeoScene,
} from './types';

export type ObjectGroupKey2D =
  | 'point'
  | 'line_segment'
  | 'circle_arc'
  | 'polygon'
  | 'measure';

export interface ObjectGroup2D {
  key: ObjectGroupKey2D;
  title: string;
  objects: GeoObject[];
}

const TECHNICAL_ID_RE =
  /^(?:po|li|se|ra|ci|ar|pg|an|le|g|g3|log|draw|tpl|obj)_[a-z0-9_]{3,}$/i;
const LEGACY_CODE_RE = /^(?:[SLCRPAFM]|Obj_?|pt_?|seg_?|line_?)\d+$/i;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Detect raw technical IDs, legacy short codes (S3, L1, C1, P1), UUIDs, or invalid strings */
export function isTechnicalCode(raw?: string | null): boolean {
  if (raw == null) return true;
  const s = String(raw).trim();
  if (!s) return true;
  const low = s.toLowerCase();
  if (low === 'undefined' || low === 'null' || low === 'nan' || low === 'point_id' || low === 'object_id') {
    return true;
  }
  if (TECHNICAL_ID_RE.test(s) || LEGACY_CODE_RE.test(s) || UUID_RE.test(s)) {
    return true;
  }
  return false;
}

/** Strip accidental technical tokens from any UI text */
export function sanitizeUiText(text?: string | null): string {
  if (!text) return '';
  const trimmed = String(text).trim();
  if (isTechnicalCode(trimmed)) return '';
  return trimmed;
}

/** Normalize a point's geometric symbol (e.g. "Điểm A" -> "A", "A" -> "A") */
export function normalizePointSymbol(raw: string): string {
  const cleaned = raw.trim();
  const stripped = cleaned.replace(/^(?:điểm|trung điểm|trọng tâm|trực tâm|giao điểm|hình chiếu|tâm ngoại tiếp|tâm nội tiếp)\s+/i, '').trim();
  return stripped || cleaned;
}

/** Get clean geometric symbol for a point object (never returns raw ID) */
export function getPointSymbol2D(scene: GeoScene, idOrObj: string | GeoObject | undefined | null): string {
  const obj = typeof idOrObj === 'string' ? scene.objects[idOrObj] : idOrObj;
  if (!obj) return '';
  if (obj.kind === 'point') {
    const raw = (obj.label ?? '').trim();
    if (!raw || TECHNICAL_ID_RE.test(raw) || UUID_RE.test(raw) || raw === 'undefined' || raw === 'null') {
      return '';
    }
    return normalizePointSymbol(raw);
  }
  return '';
}

function formatNumVi(val: number, decimals = 2): string {
  if (!Number.isFinite(val)) return '0';
  const fixed = Number(val.toFixed(decimals));
  return String(fixed).replace('.', ',');
}

function getSegmentPairLetters(scene: GeoScene, obj: GeoObject): [string, string] | null {
  if (obj.parents.length >= 2) {
    const a = getPointSymbol2D(scene, obj.parents[0]);
    const b = getPointSymbol2D(scene, obj.parents[1]);
    if (a && b) return [a, b];
  }
  if (obj.parents.length === 1) {
    const host = scene.objects[obj.parents[0]];
    if (host && (host.kind === 'segment' || host.kind === 'line' || host.kind === 'ray')) {
      return getSegmentPairLetters(scene, host);
    }
  }
  return null;
}

function getPolygonVertexLetters(scene: GeoScene, obj: GeoObject): string[] {
  return obj.parents
    .map((pid) => getPointSymbol2D(scene, pid))
    .filter((s) => s.length > 0);
}

/** Check if a stored non-point label is a meaningful user/template custom name vs bare auto-shorthand */
function isPreservedNonPointCustomLabel(scene: GeoScene, obj: GeoObject): boolean {
  if (obj.customLabel === true) {
    return Boolean(obj.label && !isTechnicalCode(obj.label));
  }
  if (obj.customLabel === false) return false;
  // Backward compatibility for existing templates/saved drawings without customLabel flag:
  const raw = (obj.label ?? '').trim();
  if (!raw || isTechnicalCode(raw)) return false;
  // Bare vertex-letter shorthands like "AB", "ABC", "(O)", "h_a", "d" should be upgraded to full SGK names
  const pair = getSegmentPairLetters(scene, obj);
  if (pair && (raw === `${pair[0]}${pair[1]}` || raw === `${pair[1]}${pair[0]}`)) {
    return false;
  }
  const verts = getPolygonVertexLetters(scene, obj);
  if (verts.length >= 3 && raw === verts.join('')) {
    return false;
  }
  if (obj.kind === 'circle' && (/^\([A-Za-z0-9'_]+\)$/.test(raw) || raw.startsWith('Ngoại tiếp ') || raw.startsWith('Nội tiếp '))) {
    return false;
  }
  if (/^[a-z](?:_[a-z0-9]+)?$/i.test(raw) && raw.length <= 3) {
    return false;
  }
  // Keep rich semantic names like "Đường thẳng Euler"
  return raw.includes(' ');
}

/** Compute the full Vietnamese textbook geometric display name for any 2D object */
export function getObjectDisplayName2D(scene: GeoScene, obj: GeoObject | undefined | null): string {
  if (!obj) return '';

  if (obj.kind === 'point') {
    const sym = getPointSymbol2D(scene, obj);
    if (!sym) return 'Điểm';
    // If user explicitly entered a multi-word custom name that already starts with a geometric role, keep it
    const rawTrim = (obj.label ?? '').trim();
    if (obj.customLabel && rawTrim.includes(' ') && !isTechnicalCode(rawTrim)) {
      return rawTrim;
    }
    switch (obj.rule) {
      case 'midpoint':
        return `Trung điểm ${sym}`;
      case 'centroid':
        return `Trọng tâm ${sym}`;
      case 'orthocenter':
        return `Trực tâm ${sym}`;
      case 'circumcenter':
        return `Tâm ngoại tiếp ${sym}`;
      case 'incenter':
        return `Tâm nội tiếp ${sym}`;
      case 'intersection':
      case 'intersection_line_line':
      case 'intersection_line_circle':
      case 'intersection_circle_circle':
        return `Giao điểm ${sym}`;
      case 'projection_point':
        return `Hình chiếu ${sym}`;
      default:
        return `Điểm ${sym}`;
    }
  }

  if (isPreservedNonPointCustomLabel(scene, obj)) {
    return obj.label.trim();
  }

  if (obj.kind === 'segment') {
    const pair = getSegmentPairLetters(scene, obj);
    const namePair = pair ? `${pair[0]}${pair[1]}` : '';
    if (obj.createdByTool === 'median') {
      return namePair ? `Đường trung tuyến ${namePair}` : 'Đường trung tuyến';
    }
    return namePair ? `Đoạn thẳng ${namePair}` : 'Đoạn thẳng';
  }

  if (obj.kind === 'ray') {
    const pair = getSegmentPairLetters(scene, obj);
    return pair ? `Tia ${pair[0]}${pair[1]}` : 'Tia';
  }

  if (obj.kind === 'line') {
    if (obj.rule === 'line_two_points') {
      const pair = getSegmentPairLetters(scene, obj);
      return pair ? `Đường thẳng ${pair[0]}${pair[1]}` : 'Đường thẳng';
    }
    if (obj.rule === 'perpendicular_bisector') {
      const pair = getSegmentPairLetters(scene, obj);
      return pair ? `Đường trung trực của ${pair[0]}${pair[1]}` : 'Đường trung trực';
    }
    if (obj.rule === 'perpendicular_line') {
      const pt = getPointSymbol2D(scene, obj.parents[1]);
      if (obj.createdByTool === 'altitude') {
        return pt ? `Đường cao qua ${pt}` : 'Đường cao';
      }
      return pt ? `Đường vuông góc qua ${pt}` : 'Đường thẳng vuông góc';
    }
    if (obj.rule === 'parallel_line') {
      const pt = getPointSymbol2D(scene, obj.parents[1]);
      return pt ? `Đường song song qua ${pt}` : 'Đường thẳng song song';
    }
    if (obj.rule === 'angle_bisector') {
      const a = getPointSymbol2D(scene, obj.parents[0]);
      const v = getPointSymbol2D(scene, obj.parents[1]);
      const b = getPointSymbol2D(scene, obj.parents[2]);
      return a && v && b ? `Đường phân giác góc ${a}${v}${b}` : 'Đường phân giác';
    }
    if (obj.rule === 'tangent_line') {
      const pt = getPointSymbol2D(scene, obj.parents[1]);
      return pt ? `Tiếp tuyến qua ${pt}` : 'Tiếp tuyến đường tròn';
    }
    return 'Đường thẳng';
  }

  if (obj.kind === 'circle') {
    if (obj.rule === 'circle_center_point' || obj.rule === 'circle_center_radius') {
      const center = getPointSymbol2D(scene, obj.parents[0]);
      return center ? `Đường tròn (${center})` : 'Đường tròn';
    }
    if (obj.rule === 'circle_compass' || obj.rule === 'compass_transfer') {
      const center = getPointSymbol2D(scene, obj.parents[2]);
      return center ? `Đường tròn (${center})` : 'Đường tròn';
    }
    if (obj.rule === 'circumcircle') {
      const verts = getPolygonVertexLetters(scene, obj);
      return verts.length === 3
        ? `Đường tròn ngoại tiếp tam giác ${verts.join('')}`
        : 'Đường tròn ngoại tiếp';
    }
    if (obj.rule === 'incircle') {
      const verts = getPolygonVertexLetters(scene, obj);
      return verts.length === 3
        ? `Đường tròn nội tiếp tam giác ${verts.join('')}`
        : 'Đường tròn nội tiếp';
    }
    return 'Đường tròn';
  }

  if (obj.kind === 'arc') {
    const center = getPointSymbol2D(scene, obj.parents[0]);
    const p1 = getPointSymbol2D(scene, obj.parents[1]);
    const p2 = getPointSymbol2D(scene, obj.parents[2]);
    if (p1 && p2 && center) return `Cung tròn ${p1}${p2} (tâm ${center})`;
    if (center) return `Cung tròn tâm ${center}`;
    return 'Cung tròn';
  }

  if (obj.kind === 'polygon') {
    if (obj.rule === 'regular_polygon') {
      const sides = Number(obj.params?.sides ?? obj.vertices.length ?? 5);
      const center = getPointSymbol2D(scene, obj.parents[0]);
      return center ? `Đa giác đều ${sides} cạnh (tâm ${center})` : `Đa giác đều ${sides} cạnh`;
    }
    const verts = getPolygonVertexLetters(scene, obj);
    const count = verts.length || obj.vertices.length;
    const suffix = verts.length >= 3 ? ` ${verts.join('')}` : '';
    if (count === 3) return `Tam giác${suffix}`;
    if (count === 4) return `Tứ giác${suffix}`;
    if (count === 5) return `Ngũ giác${suffix}`;
    if (count === 6) return `Lục giác${suffix}`;
    return suffix ? `Đa giác${suffix}` : `Đa giác ${count} đỉnh`;
  }

  if (obj.kind === 'angle_measure') {
    const a = getPointSymbol2D(scene, obj.parents[0]);
    const v = getPointSymbol2D(scene, obj.parents[1]);
    const b = getPointSymbol2D(scene, obj.parents[2]);
    return a && v && b ? `Góc ∠${a}${v}${b}` : 'Góc';
  }

  if (obj.kind === 'length_measure') {
    const pair = getSegmentPairLetters(scene, obj);
    return pair ? `Độ dài đoạn thẳng ${pair[0]}${pair[1]}` : 'Đo độ dài';
  }

  return 'Đối tượng hình học';
}

/** Friendly non-technical Vietnamese subtitle explaining how this 2D object is defined */
export function getObjectDescription2D(scene: GeoScene, obj: GeoObject): string {
  if (obj.kind === 'point') {
    switch (obj.rule) {
      case 'free_point':
        return 'Điểm di chuyển được';
      case 'point_on_object': {
        const host = scene.objects[obj.parents[0]];
        const hostName = host ? getObjectDisplayName2D(scene, host).toLowerCase() : 'đối tượng';
        return `Nằm trên ${hostName}`;
      }
      case 'midpoint': {
        const pair = getSegmentPairLetters(scene, obj);
        return pair ? `Trung điểm của đoạn thẳng ${pair[0]}${pair[1]}` : 'Trung điểm đoạn thẳng';
      }
      case 'centroid': {
        const verts = getPolygonVertexLetters(scene, obj);
        return verts.length === 3 ? `Trọng tâm của tam giác ${verts.join('')}` : 'Trọng tâm tam giác';
      }
      case 'orthocenter': {
        const verts = getPolygonVertexLetters(scene, obj);
        return verts.length === 3 ? `Trực tâm của tam giác ${verts.join('')}` : 'Trực tâm tam giác';
      }
      case 'circumcenter': {
        const verts = getPolygonVertexLetters(scene, obj);
        return verts.length === 3
          ? `Tâm đường tròn ngoại tiếp tam giác ${verts.join('')}`
          : 'Tâm đường tròn ngoại tiếp';
      }
      case 'incenter': {
        const verts = getPolygonVertexLetters(scene, obj);
        return verts.length === 3
          ? `Tâm đường tròn nội tiếp tam giác ${verts.join('')}`
          : 'Tâm đường tròn nội tiếp';
      }
      case 'intersection':
      case 'intersection_line_line':
      case 'intersection_line_circle':
      case 'intersection_circle_circle': {
        const o1 = scene.objects[obj.parents[0]];
        const o2 = scene.objects[obj.parents[1]];
        if (o1 && o2) {
          return `Giao của ${getObjectDisplayName2D(scene, o1).toLowerCase()} và ${getObjectDisplayName2D(scene, o2).toLowerCase()}`;
        }
        return 'Giao điểm hai đối tượng';
      }
      case 'projection_point': {
        const ref = scene.objects[obj.parents[0]];
        const pt = getPointSymbol2D(scene, obj.parents[1]);
        const refName = ref ? getObjectDisplayName2D(scene, ref).toLowerCase() : 'đường thẳng';
        return pt ? `Hình chiếu vuông góc của ${pt} lên ${refName}` : `Hình chiếu vuông góc lên ${refName}`;
      }
      case 'reflection_line':
      case 'reflect_line': {
        const pt = getPointSymbol2D(scene, obj.parents[0]);
        const axis = scene.objects[obj.parents[1]];
        const axisName = axis ? getObjectDisplayName2D(scene, axis).toLowerCase() : 'trục đối xứng';
        return pt ? `Đối xứng của điểm ${pt} qua ${axisName}` : `Đối xứng qua ${axisName}`;
      }
      case 'reflection_point':
      case 'reflect_point': {
        const pt = getPointSymbol2D(scene, obj.parents[0]);
        const center = getPointSymbol2D(scene, obj.parents[1]);
        return pt && center ? `Đối xứng của điểm ${pt} qua điểm ${center}` : 'Đối xứng qua tâm';
      }
      case 'translation': {
        const v1 = getPointSymbol2D(scene, obj.parents[0]);
        const v2 = getPointSymbol2D(scene, obj.parents[1]);
        const pt = getPointSymbol2D(scene, obj.parents[2]);
        return pt && v1 && v2
          ? `Tịnh tiến điểm ${pt} theo vectơ ${v1}${v2}`
          : 'Ảnh qua phép tịnh tiến';
      }
      case 'rotation': {
        const center = getPointSymbol2D(scene, obj.parents[0]);
        const pt = getPointSymbol2D(scene, obj.parents[1]);
        const deg = Number(obj.params?.angleDeg ?? 60);
        return pt && center
          ? `Quay điểm ${pt} quanh tâm ${center} góc ${formatNumVi(deg, 1)}°`
          : 'Ảnh qua phép quay';
      }
      case 'homothety': {
        const center = getPointSymbol2D(scene, obj.parents[0]);
        const pt = getPointSymbol2D(scene, obj.parents[1]);
        const k = Number(obj.params?.k ?? 2);
        return pt && center
          ? `Vị tự điểm ${pt} tâm ${center}, tỉ số ${formatNumVi(k, 2)}`
          : 'Ảnh qua phép vị tự';
      }
      default:
        return 'Điểm dựng theo quan hệ hình học';
    }
  }

  if (obj.kind === 'segment') {
    const pair = getSegmentPairLetters(scene, obj);
    if (obj.createdByTool === 'median' && pair) {
      return `Nối đỉnh ${pair[0]} và trung điểm ${pair[1]}`;
    }
    return pair ? `Nối hai điểm ${pair[0]} và ${pair[1]}` : 'Nối hai đầu mút';
  }

  if (obj.kind === 'ray') {
    const pair = getSegmentPairLetters(scene, obj);
    return pair ? `Gốc tại điểm ${pair[0]}, đi qua điểm ${pair[1]}` : 'Tia từ điểm gốc';
  }

  if (obj.kind === 'line') {
    if (obj.rule === 'line_two_points') {
      const pair = getSegmentPairLetters(scene, obj);
      return pair ? `Đi qua hai điểm ${pair[0]} và ${pair[1]}` : 'Đi qua hai điểm';
    }
    if (obj.rule === 'perpendicular_bisector') {
      const pair = getSegmentPairLetters(scene, obj);
      return pair ? `Vuông góc tại trung điểm đoạn thẳng ${pair[0]}${pair[1]}` : 'Đường trung trực đoạn thẳng';
    }
    if (obj.rule === 'perpendicular_line') {
      const ref = scene.objects[obj.parents[0]];
      const pt = getPointSymbol2D(scene, obj.parents[1]);
      const refName = ref ? getObjectDisplayName2D(scene, ref).toLowerCase() : 'đường thẳng chuẩn';
      return pt ? `Đi qua điểm ${pt}, vuông góc với ${refName}` : `Vuông góc với ${refName}`;
    }
    if (obj.rule === 'parallel_line') {
      const ref = scene.objects[obj.parents[0]];
      const pt = getPointSymbol2D(scene, obj.parents[1]);
      const refName = ref ? getObjectDisplayName2D(scene, ref).toLowerCase() : 'đường thẳng chuẩn';
      return pt ? `Đi qua điểm ${pt}, song song với ${refName}` : `Song song với ${refName}`;
    }
    if (obj.rule === 'angle_bisector') {
      const a = getPointSymbol2D(scene, obj.parents[0]);
      const v = getPointSymbol2D(scene, obj.parents[1]);
      const b = getPointSymbol2D(scene, obj.parents[2]);
      return a && v && b ? `Chia đôi góc ∠${a}${v}${b}` : 'Đường phân giác của góc';
    }
    if (obj.rule === 'tangent_line') {
      const c = scene.objects[obj.parents[0]];
      const pt = getPointSymbol2D(scene, obj.parents[1]);
      const cName = c ? getObjectDisplayName2D(scene, c).toLowerCase() : 'đường tròn';
      return pt ? `Tiếp tuyến với ${cName} qua điểm ${pt}` : `Tiếp tuyến với ${cName}`;
    }
    return 'Đường thẳng trên mặt phẳng';
  }

  if (obj.kind === 'circle') {
    if (obj.rule === 'circle_center_point') {
      const c = getPointSymbol2D(scene, obj.parents[0]);
      const p = getPointSymbol2D(scene, obj.parents[1]);
      return c && p ? `Tâm ${c}, đi qua điểm ${p}` : 'Xác định bởi tâm và một điểm';
    }
    if (obj.rule === 'circle_center_radius') {
      const c = getPointSymbol2D(scene, obj.parents[0]);
      return c
        ? `Tâm ${c}, bán kính R = ${formatNumVi(obj.radius / 10, 2)}`
        : `Bán kính R = ${formatNumVi(obj.radius / 10, 2)}`;
    }
    if (obj.rule === 'circle_compass' || obj.rule === 'compass_transfer') {
      const r1 = getPointSymbol2D(scene, obj.parents[0]);
      const r2 = getPointSymbol2D(scene, obj.parents[1]);
      const c = getPointSymbol2D(scene, obj.parents[2]);
      return c && r1 && r2
        ? `Tâm ${c}, bán kính bằng đoạn thẳng ${r1}${r2}`
        : 'Đường tròn sao chép bán kính';
    }
    if (obj.rule === 'circumcircle') {
      const verts = getPolygonVertexLetters(scene, obj);
      return verts.length === 3 ? `Đi qua ba đỉnh ${verts.join(', ')}` : 'Đường tròn ngoại tiếp tam giác';
    }
    if (obj.rule === 'incircle') {
      const verts = getPolygonVertexLetters(scene, obj);
      return verts.length === 3 ? `Tiếp xúc ba cạnh tam giác ${verts.join('')}` : 'Đường tròn nội tiếp tam giác';
    }
    return `Bán kính R ≈ ${formatNumVi(obj.radius / 10, 2)}`;
  }

  if (obj.kind === 'arc') {
    const c = getPointSymbol2D(scene, obj.parents[0]);
    const p1 = getPointSymbol2D(scene, obj.parents[1]);
    const p2 = getPointSymbol2D(scene, obj.parents[2]);
    if (c && p1 && p2) return `Tâm ${c}, điểm đầu ${p1}, hướng kết thúc ${p2}`;
    return 'Cung tròn xác định bởi tâm và hai điểm';
  }

  if (obj.kind === 'polygon') {
    if (obj.rule === 'regular_polygon') {
      const c = getPointSymbol2D(scene, obj.parents[0]);
      const p = getPointSymbol2D(scene, obj.parents[1]);
      const sides = Number(obj.params?.sides ?? obj.vertices.length ?? 5);
      return c && p
        ? `${sides} cạnh đều, tâm ${c}, đỉnh ${p}`
        : `Đa giác đều ${sides} cạnh`;
    }
    const verts = getPolygonVertexLetters(scene, obj);
    const areaText = obj.valid ? `S ≈ ${formatNumVi(obj.area / 100, 2)}` : '';
    if (verts.length >= 3) {
      return `Các đỉnh ${verts.join(', ')}${areaText ? ` · ${areaText}` : ''}`;
    }
    return `Đa giác ${obj.vertices.length} đỉnh`;
  }

  if (obj.kind === 'angle_measure') {
    return obj.valid ? `Số đo: ${formatNumVi(obj.degrees, 1)}°` : 'Đo số đo góc';
  }

  if (obj.kind === 'length_measure') {
    return obj.valid ? `Độ dài: ${formatNumVi(obj.value / 10, 2)} đv` : 'Đo độ dài đoạn thẳng';
  }

  return '';
}

/** Auto-generated clean label stored on newly created 2D objects (never S3/L1/C1/P1) */
export function buildAutoLabel2D(scene: GeoScene, obj: GeoObject): string {
  if (obj.kind === 'point') {
    return getPointSymbol2D(scene, obj) || obj.label;
  }
  return getObjectDisplayName2D(scene, { ...obj, customLabel: false });
}

const GROUP_ORDER_2D: Array<{ key: ObjectGroupKey2D; title: string }> = [
  { key: 'point', title: 'Điểm' },
  { key: 'line_segment', title: 'Đường thẳng và đoạn thẳng' },
  { key: 'circle_arc', title: 'Đường tròn và cung tròn' },
  { key: 'polygon', title: 'Đa giác' },
  { key: 'measure', title: 'Đối tượng đo lường' },
];

export function getObjectGroupKey2D(obj: GeoObject): ObjectGroupKey2D {
  if (obj.kind === 'point') return 'point';
  if (obj.kind === 'line' || obj.kind === 'segment' || obj.kind === 'ray') return 'line_segment';
  if (obj.kind === 'circle' || obj.kind === 'arc') return 'circle_arc';
  if (obj.kind === 'polygon') return 'polygon';
  return 'measure';
}

/** Group visible/scene 2D objects by geometric category, returning ONLY non-empty groups */
export function groupObjects2D(scene: GeoScene): ObjectGroup2D[] {
  const buckets: Record<ObjectGroupKey2D, GeoObject[]> = {
    point: [],
    line_segment: [],
    circle_arc: [],
    polygon: [],
    measure: [],
  };

  for (const id of scene.order) {
    const obj = scene.objects[id];
    if (!obj) continue;
    // Skip hidden internal helper lines created by altitude tool
    if (obj.style.isAuxiliary && !obj.style.visible && obj.costL === 0 && obj.costE === 0 && obj.kind === 'line') {
      continue;
    }
    buckets[getObjectGroupKey2D(obj)].push(obj);
  }

  return GROUP_ORDER_2D.filter((g) => buckets[g.key].length > 0).map((g) => ({
    key: g.key,
    title: g.title,
    objects: buckets[g.key],
  }));
}

/** Resolve pending selection IDs to clean Vietnamese display names (never leaks raw IDs) */
export function getPendingDisplayNames2D(scene: GeoScene, pendingIds: string[]): string[] {
  const out: string[] = [];
  for (const id of pendingIds) {
    const obj = scene.objects[id];
    if (!obj) continue;
    const name = getObjectDisplayName2D(scene, obj);
    if (name && !isTechnicalCode(name)) {
      out.push(name);
    }
  }
  return out;
}

/** Live log description using current geometric display names (reflects point renames) */
export function getLogDescription2D(scene: GeoScene, entry: ConstructionLogEntry): string {
  const primary = entry.createdObjectIds[0] ? scene.objects[entry.createdObjectIds[0]] : undefined;
  if (primary) {
    const name = getObjectDisplayName2D(scene, primary);
    if (name) return `Dựng ${name}`;
  }
  // Clean legacy log entries that had "(S3)" / "(L1)" / "(C1)"
  const cleaned = entry.description.replace(/\s*\((?:[SLCRPAFM]\d+|po_[a-z0-9_]+|Obj_\d+)\)/gi, '').trim();
  return cleaned || entry.toolLabel;
}

/** Helper to check if point A is a free movable point */
export function isFreePoint2D(obj: GeoObject): obj is GeoPoint {
  return obj.kind === 'point' && obj.rule === 'free_point';
}
