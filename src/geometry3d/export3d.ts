import { add3, cross3, dot3, midpoint3, norm3, normalize3, planeBasis, scale3, sub3 } from './math3d';
import {
  GeometryLabelManager,
  type EdgeObstacle2D,
  type LabelInput,
} from './labelManager';
import type { Geo3DScene, Geo3DSolid, Vec3 } from './types3d';

export interface Projected2D {
  x: number;
  y: number;
  depth: number;
}

export interface CameraBasis {
  forward: Vec3;
  right: Vec3;
  up: Vec3;
}

/**
 * Pure mathematical 3D -> 2D camera projection (orthographic or perspective)
 * used both for true Vector SVG export and lightweight live animated 3D previews.
 */
export function buildCameraBasis(camPos: Vec3, target: Vec3): CameraBasis {
  const forward = normalize3(sub3(target, camPos)) ?? { x: -0.6, y: -0.5, z: -0.6 };
  const worldUp = Math.abs(forward.z) > 0.98 ? { x: 0, y: 1, z: 0 } : { x: 0, y: 0, z: 1 };
  const right = normalize3(cross3(forward, worldUp)) ?? { x: 1, y: 0, z: 0 };
  const up = normalize3(cross3(right, forward)) ?? { x: 0, y: 0, z: 1 };
  return { forward, right, up };
}

export function projectWithBasis(
  p: Vec3,
  camPos: Vec3,
  camDist: number,
  basis: CameraBasis,
  width: number,
  height: number,
  projection: 'orthographic' | 'perspective',
  scalePx = 56
): Projected2D {
  const rx_w = p.x - camPos.x;
  const ry_w = p.y - camPos.y;
  const rz_w = p.z - camPos.z;
  const depth = rx_w * basis.forward.x + ry_w * basis.forward.y + rz_w * basis.forward.z;
  const rx = rx_w * basis.right.x + ry_w * basis.right.y + rz_w * basis.right.z;
  const ry = rx_w * basis.up.x + ry_w * basis.up.y + rz_w * basis.up.z;

  if (projection === 'perspective') {
    const denom = Math.max(0.5, depth);
    const factor = (scalePx * camDist) / denom;
    return {
      x: width * 0.5 + rx * factor,
      y: height * 0.5 - ry * factor,
      depth,
    };
  }

  return {
    x: width * 0.5 + rx * scalePx,
    y: height * 0.5 - ry * scalePx,
    depth,
  };
}

export function projectPoint3D(
  p: Vec3,
  camPos: Vec3,
  target: Vec3,
  width: number,
  height: number,
  projection: 'orthographic' | 'perspective',
  scalePx = 56
): Projected2D {
  const basis = buildCameraBasis(camPos, target);
  const camDist = Math.max(2, norm3(sub3(target, camPos)));
  return projectWithBasis(p, camPos, camDist, basis, width, height, projection, scalePx);
}

/**
 * Determine whether an edge of a convex polyhedron is hidden (occluded) from camPos.
 * An edge of a convex solid is visible if at least one adjacent face is front-facing!
 * If both adjacent faces face away from the camera, it is a hidden (dashed) SGK edge.
 */
export function isSolidEdgeHidden(
  solid: Geo3DSolid,
  edgeIdxA: number,
  edgeIdxB: number,
  camPos: Vec3
): boolean {
  if (solid.faces.length === 0) return false;

  // Compute centroid to ensure consistent outward face normals
  let cx = 0;
  let cy = 0;
  let cz = 0;
  for (const v of solid.vertices) {
    cx += v.x;
    cy += v.y;
    cz += v.z;
  }
  const centroid = {
    x: cx / Math.max(1, solid.vertices.length),
    y: cy / Math.max(1, solid.vertices.length),
    z: cz / Math.max(1, solid.vertices.length),
  };

  let adjacentCount = 0;
  let anyFrontFacing = false;

  for (const f of solid.faces) {
    const idx = f.indices;
    let containsEdge = false;
    for (let i = 0; i < idx.length; i++) {
      const u = idx[i];
      const w = idx[(i + 1) % idx.length];
      if ((u === edgeIdxA && w === edgeIdxB) || (u === edgeIdxB && w === edgeIdxA)) {
        containsEdge = true;
        break;
      }
    }
    if (!containsEdge || idx.length < 3) continue;
    adjacentCount += 1;
    const p0 = solid.vertices[idx[0]];
    const p1 = solid.vertices[idx[1]];
    const p2 = solid.vertices[idx[2]];
    let n = cross3(sub3(p1, p0), sub3(p2, p0));
    const faceCenter = scale3(
      idx.reduce((acc, vi) => add3(acc, solid.vertices[vi]), { x: 0, y: 0, z: 0 }),
      1 / idx.length
    );
    // Orient outward
    if (dot3(n, sub3(faceCenter, centroid)) < 0) {
      n = scale3(n, -1);
    }
    const viewDir = sub3(camPos, faceCenter);
    if (dot3(n, viewDir) > 1e-4) {
      anyFrontFacing = true;
    }
  }

  return adjacentCount >= 2 && !anyFrontFacing;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Export a true Vector SVG projection of the 3D scene:
 * - True SVG paths, polygons, solid & camera-computed dashed hidden lines
 * - Crisp labels with collision avoidance
 * - Zero embedded raster images, zero watermark, zero UI chrome
 */
export function exportScene3DToVectorSvg(
  scene: Geo3DScene,
  width = 1100,
  height = 760
): string {
  const camPos = scene.camera.position;
  const target = scene.camera.target;
  const proj = scene.camera.projection;

  // Auto-fit scale so nothing gets clipped
  const samplePts: Vec3[] = [];
  for (const id of scene.order) {
    const o = scene.objects[id];
    if (!o || !o.valid) continue;
    if (o.kind === 'point') samplePts.push(o.position);
    if (o.kind === 'solid') samplePts.push(...o.vertices);
    if (o.kind === 'polygon') samplePts.push(...o.vertices);
    if (o.kind === 'cross_section') samplePts.push(...o.vertices);
  }
  if (scene.showAxes) {
    samplePts.push({ x: 5, y: 0, z: 0 }, { x: 0, y: 5, z: 0 }, { x: 0, y: 0, z: 5 });
  }
  const unitProj = samplePts.map((p) => projectPoint3D(p, camPos, target, width, height, proj, 1));
  let maxHalfX = 1;
  let maxHalfY = 1;
  for (const u of unitProj) {
    maxHalfX = Math.max(maxHalfX, Math.abs(u.x - width / 2));
    maxHalfY = Math.max(maxHalfY, Math.abs(u.y - height / 2));
  }
  const scalePx = Math.max(24, Math.min(82, (width * 0.36) / maxHalfX, (height * 0.36) / maxHalfY));

  const basis = buildCameraBasis(camPos, target);
  const camDist = Math.max(2, norm3(sub3(target, camPos)));
  const P = (v: Vec3) => projectWithBasis(v, camPos, camDist, basis, width, height, proj, scalePx);

  const elements: string[] = [];
  const labelInputs: LabelInput[] = [];
  const edgeObstacles: EdgeObstacle2D[] = [];
  const isCompact = Math.min(width, height) < 360;
  const labelFontSize = isCompact ? 12 : 16;

  // 1. Axes if enabled
  if (scene.showAxes) {
    const o = P({ x: 0, y: 0, z: 0 });
    const axes: Array<[string, Vec3, string, string]> = [
      ['_axis_x', { x: 5.5, y: 0, z: 0 }, '#DC2626', 'x'],
      ['_axis_y', { x: 0, y: 5.5, z: 0 }, '#059669', 'y'],
      ['_axis_z', { x: 0, y: 0, z: 5.5 }, '#0284C7', 'z'],
    ];
    for (const [axisId, end, color, lbl] of axes) {
      const e = P(end);
      elements.push(
        `<line x1="${o.x.toFixed(1)}" y1="${o.y.toFixed(1)}" x2="${e.x.toFixed(1)}" y2="${e.y.toFixed(1)}" stroke="${color}" stroke-width="1.5" stroke-opacity="0.85" />`
      );
      edgeObstacles.push({ x1: o.x, y1: o.y, x2: e.x, y2: e.y });
      labelInputs.push({
        id: axisId,
        objectId: axisId,
        text: lbl,
        category: 'axis',
        color,
        anchorX: e.x,
        anchorY: e.y,
        preferredDir: { x: e.x - o.x, y: e.y - o.y },
        anchorRadius: isCompact ? 5 : 8,
      });
    }
  }

  // 2. Planes (soft translucent patches)
  for (const id of scene.order) {
    const o = scene.objects[id];
    if (!o || !o.valid || o.style.visible === false || o.kind !== 'plane') continue;
    const ext = o.style.planeExtent ?? 4.5;
    const { u, v } = planeBasis(o.normal);
    const corners = [
      add3(o.anchor, add3(scale3(u, -ext), scale3(v, -ext))),
      add3(o.anchor, add3(scale3(u, ext), scale3(v, -ext))),
      add3(o.anchor, add3(scale3(u, ext), scale3(v, ext))),
      add3(o.anchor, add3(scale3(u, -ext), scale3(v, ext))),
    ].map(P);
    const ptsAttr = corners.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    elements.push(
      `<polygon points="${ptsAttr}" fill="${o.style.color}" fill-opacity="${(o.style.opacity ?? 0.16).toFixed(2)}" stroke="${o.style.color}" stroke-width="1.2" stroke-opacity="0.65" />`
    );
    if (scene.showLabels && o.style.showLabel !== false) {
      labelInputs.push({
        id: o.id,
        objectId: o.id,
        text: o.label,
        category: 'plane',
        color: o.style.color,
        anchorX: corners[2].x,
        anchorY: corners[2].y,
        userOffset: o.style.labelOffset,
      });
    }
  }

  // 3. Solids (faces + camera-computed hidden dashed & visible solid edges)
  for (const id of scene.order) {
    const o = scene.objects[id];
    if (!o || !o.valid || o.style.visible === false || o.kind !== 'solid') continue;
    if (scene.displayMode !== 'wireframe' && o.style.showFaces !== false) {
      for (const f of o.faces) {
        const pts = f.indices.map((vi) => P(o.vertices[vi]));
        const ptsAttr = pts.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
        const fillOp = scene.displayMode === 'sgk' ? 0.04 : (o.style.opacity ?? 0.18);
        elements.push(`<polygon points="${ptsAttr}" fill="${o.style.color}" fill-opacity="${fillOp}" />`);
      }
    }
    if (o.style.showEdges !== false) {
      for (const e of o.edges) {
        if (e.isDiagonal && !o.style.showDiagonals) continue;
        if (e.isAltitude && !o.style.showAltitude) continue;
        if (e.isAxis && !o.style.showAxis) continue;
        const a = P(o.vertices[e.a]);
        const b = P(o.vertices[e.b]);
        const hidden = scene.showHiddenLines && isSolidEdgeHidden(o, e.a, e.b, camPos);
        const dashed = hidden || e.isDiagonal || e.isAltitude || e.isAxis;
        const stroke = e.isAltitude ? '#D97706' : e.isDiagonal ? '#0284C7' : '#0F172A';
        elements.push(
          `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${stroke}" stroke-width="${dashed ? 1.5 : 2.2}" ${dashed ? 'stroke-dasharray="7 5"' : ''} stroke-linecap="round" />`
        );
        edgeObstacles.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      }
    }
    if (o.style.showVertices !== false) {
      o.vertices.forEach((v, idx) => {
        const pv = P(v);
        elements.push(
          `<circle cx="${pv.x.toFixed(1)}" cy="${pv.y.toFixed(1)}" r="3.6" fill="#0F766E" stroke="#FFFFFF" stroke-width="1.4" />`
        );
        if (scene.showLabels && o.vertexLabels[idx]) {
          labelInputs.push({
            id: `${o.id}_v_${idx}`,
            objectId: o.id,
            text: o.vertexLabels[idx],
            category: 'point',
            color: '#0F172A',
            anchorX: pv.x,
            anchorY: pv.y,
          });
        }
      });
    }
  }

  // 4. Polygons & Cross Sections
  for (const id of scene.order) {
    const o = scene.objects[id];
    if (!o || !o.valid || o.style.visible === false) continue;
    if (o.kind === 'polygon' && o.vertices.length >= 3) {
      const pts = o.vertices.map(P);
      const ptsAttr = pts.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
      elements.push(
        `<polygon points="${ptsAttr}" fill="${o.style.color}" fill-opacity="${(o.style.opacity ?? 0.2).toFixed(2)}" stroke="${o.style.color}" stroke-width="2" />`
      );
    }
    if (o.kind === 'cross_section' && o.vertices.length >= 2) {
      const pts = o.vertices.map(P);
      const ptsAttr = pts.map((pt) => `${pt.x.toFixed(1)},${pt.y.toFixed(1)}`).join(' ');
      if (pts.length >= 3) {
        elements.push(
          `<polygon points="${ptsAttr}" fill="${o.style.color}" fill-opacity="0.35" stroke="${o.style.color}" stroke-width="2.6" />`
        );
      } else {
        elements.push(
          `<line x1="${pts[0].x.toFixed(1)}" y1="${pts[0].y.toFixed(1)}" x2="${pts[1].x.toFixed(1)}" y2="${pts[1].y.toFixed(1)}" stroke="${o.style.color}" stroke-width="2.6" />`
        );
      }
      o.vertices.forEach((v, idx) => {
        if (o.vertexLabels[idx]) {
          const pv = P(v);
          elements.push(`<circle cx="${pv.x.toFixed(1)}" cy="${pv.y.toFixed(1)}" r="4" fill="${o.style.color}" stroke="#FFFFFF" stroke-width="1.4" />`);
          labelInputs.push({
            id: `${o.id}_cs_${idx}`,
            objectId: o.id,
            text: o.vertexLabels[idx],
            category: 'point',
            color: '#92400E',
            anchorX: pv.x,
            anchorY: pv.y,
          });
        }
      });
    }
  }

  // 5. Segments, Lines, Rays, Vectors, Circles
  for (const id of scene.order) {
    const o = scene.objects[id];
    if (!o || !o.valid || o.style.visible === false) continue;
    if (o.style.isAuxiliary && !scene.showAuxiliary) continue;

    if (o.kind === 'segment') {
      const a = P(o.p1);
      const b = P(o.p2);
      elements.push(
        `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${o.style.color}" stroke-width="${o.style.lineWidth ?? 2}" ${o.style.dashed ? 'stroke-dasharray="7 5"' : ''} stroke-linecap="round" />`
      );
      edgeObstacles.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    } else if (o.kind === 'line') {
      const a = P(add3(o.origin, scale3(o.direction, -7)));
      const b = P(add3(o.origin, scale3(o.direction, 7)));
      elements.push(
        `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${o.style.color}" stroke-width="${o.style.lineWidth ?? 1.8}" ${o.style.dashed ? 'stroke-dasharray="6 4"' : ''} />`
      );
      edgeObstacles.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      if (scene.showLabels && o.style.showLabel !== false) {
        labelInputs.push({
          id: o.id,
          objectId: o.id,
          text: o.label,
          category: 'line',
          color: o.style.color,
          anchorX: b.x,
          anchorY: b.y,
          userOffset: o.style.labelOffset,
        });
      }
    } else if (o.kind === 'ray') {
      const a = P(o.origin);
      const b = P(add3(o.origin, scale3(o.direction, 7)));
      elements.push(
        `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${o.style.color}" stroke-width="${o.style.lineWidth ?? 2}" />`
      );
      edgeObstacles.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    } else if (o.kind === 'vector') {
      const a = P(o.origin);
      const b = P(add3(o.origin, o.components));
      elements.push(
        `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${o.style.color}" stroke-width="2.5" marker-end="url(#vecArrow)" />`
      );
      edgeObstacles.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      if (scene.showLabels && o.style.showLabel !== false) {
        const mid = midpoint3(o.origin, add3(o.origin, o.components));
        const pm = P(mid);
        labelInputs.push({
          id: o.id,
          objectId: o.id,
          text: o.label,
          category: 'vector',
          color: o.style.color,
          anchorX: pm.x,
          anchorY: pm.y,
          userOffset: o.style.labelOffset,
        });
      }
    } else if (o.kind === 'circle') {
      const { u, v } = planeBasis(o.normal);
      const pts: string[] = [];
      for (let i = 0; i <= 48; i++) {
        const ang = (i / 48) * Math.PI * 2;
        const p3 = add3(o.center, add3(scale3(u, o.radius * Math.cos(ang)), scale3(v, o.radius * Math.sin(ang))));
        const p2 = P(p3);
        pts.push(`${p2.x.toFixed(1)},${p2.y.toFixed(1)}`);
      }
      elements.push(`<polyline points="${pts.join(' ')}" fill="none" stroke="${o.style.color}" stroke-width="2" />`);
    }
  }

  // 6. Points & Measurements & Formulas
  for (const id of scene.order) {
    const o = scene.objects[id];
    if (!o || !o.valid || o.style.visible === false) continue;
    if (o.kind === 'point') {
      const pt = P(o.position);
      elements.push(
        `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4.5" fill="${o.style.color}" stroke="#FFFFFF" stroke-width="1.6" />`
      );
      if (scene.showLabels && o.style.showLabel !== false) {
        labelInputs.push({
          id: o.id,
          objectId: o.id,
          text: o.label,
          category: o.label === 'O' ? 'origin' : 'point',
          color: '#0F172A',
          anchorX: pt.x,
          anchorY: pt.y,
          userOffset: o.style.labelOffset,
        });
      }
    } else if (o.kind === 'measurement') {
      const pt = P(o.anchor);
      labelInputs.push({
        id: o.id,
        objectId: o.id,
        text: `${o.label}: ${o.formattedValue}`,
        category: 'measure',
        color: '#0F766E',
        anchorX: pt.x,
        anchorY: pt.y,
        userOffset: o.style.labelOffset,
      });
    } else if (o.kind === 'formula') {
      const pt = P(o.position);
      labelInputs.push({
        id: o.id,
        objectId: o.id,
        text: o.label || o.latex.replace(/\$/g, ''),
        category: 'formula',
        color: '#1E293B',
        anchorX: pt.x,
        anchorY: pt.y,
        userOffset: o.style.labelOffset,
      });
    }
  }

  // 7. Unified GeometryLabelManager collision-free layout
  const labelManager = new GeometryLabelManager();
  const resolvedLabels = labelManager.update(labelInputs, {
    width,
    height,
    fontSize: labelFontSize,
    dt: 0,
    edges: edgeObstacles,
    compact: isCompact,
  });

  for (const lbl of resolvedLabels) {
    elements.push(
      `<text x="${lbl.x.toFixed(1)}" y="${lbl.y.toFixed(1)}" text-anchor="middle" dominant-baseline="central" font-family="Be Vietnam Pro, system-ui, sans-serif" font-size="${labelFontSize}" font-weight="700" fill="${lbl.color}" stroke="#FFFFFF" stroke-width="3.6" stroke-linejoin="round" paint-order="stroke">${escapeXml(lbl.text)}</text>`
    );
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <marker id="vecArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 10 5 L 0 9 z" fill="#7C3AED" />
    </marker>
  </defs>
  <rect width="${width}" height="${height}" fill="#FFFFFF" />
  ${elements.join('\n  ')}
</svg>`;
}

export function downloadTextFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function serializeScene3DToJson(scene: Geo3DScene, title: string): string {
  return JSON.stringify(
    {
      format: 'HINH_HOC_SMART_3D_SCENE',
      schemaVersion: 1,
      title,
      exportedAt: new Date().toISOString(),
      scene,
    },
    null,
    2
  );
}

export function parseScene3DFromJson(raw: string): {
  valid: boolean;
  scene?: Geo3DScene;
  title?: string;
  error?: string;
} {
  try {
    const parsed = JSON.parse(raw) as {
      format?: string;
      schemaVersion?: number;
      title?: string;
      scene?: Geo3DScene;
    };
    if (
      parsed?.format === 'HINH_HOC_SMART_3D_SCENE' &&
      parsed.schemaVersion === 1 &&
      parsed.scene &&
      typeof parsed.scene.objects === 'object' &&
      Array.isArray(parsed.scene.order)
    ) {
      return { valid: true, scene: parsed.scene, title: parsed.title };
    }
    return { valid: false, error: 'Tệp không đúng định dạng bản dựng 3D của Học Viện Hình Học Smart.' };
  } catch {
    return { valid: false, error: 'Không thể đọc tệp bản dựng. Vui lòng kiểm tra lại định dạng JSON.' };
  }
}
