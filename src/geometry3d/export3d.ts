import { add3, cross3, dot3, midpoint3, norm3, normalize3, planeBasis, scale3, sub3 } from './math3d';
import type { Geo3DScene, Geo3DSolid, Vec3 } from './types3d';

export interface Projected2D {
  x: number;
  y: number;
  depth: number;
}

/**
 * Pure mathematical 3D -> 2D camera projection (orthographic or perspective)
 * used both for true Vector SVG export and lightweight live animated 3D previews.
 */
export function buildCameraBasis(camPos: Vec3, target: Vec3) {
  const forward = normalize3(sub3(target, camPos)) ?? { x: -0.6, y: -0.5, z: -0.6 };
  const worldUp = Math.abs(forward.z) > 0.98 ? { x: 0, y: 1, z: 0 } : { x: 0, y: 0, z: 1 };
  const right = normalize3(cross3(forward, worldUp)) ?? { x: 1, y: 0, z: 0 };
  const up = normalize3(cross3(right, forward)) ?? { x: 0, y: 0, z: 1 };
  return { forward, right, up };
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
  const { forward, right, up } = buildCameraBasis(camPos, target);
  const rel = sub3(p, camPos);
  const depth = dot3(rel, forward);
  const rx = dot3(rel, right);
  const ry = dot3(rel, up);

  if (projection === 'perspective') {
    const camDist = Math.max(2, norm3(sub3(target, camPos)));
    const denom = Math.max(0.5, depth);
    const factor = (scalePx * camDist) / denom;
    return {
      x: width / 2 + rx * factor,
      y: height / 2 - ry * factor,
      depth,
    };
  }

  return {
    x: width / 2 + rx * scalePx,
    y: height / 2 - ry * scalePx,
    depth,
  };
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

  const P = (v: Vec3) => projectPoint3D(v, camPos, target, width, height, proj, scalePx);

  const elements: string[] = [];
  const labelItems: Array<{ x: number; y: number; text: string; color: string }> = [];

  // 1. Axes if enabled
  if (scene.showAxes) {
    const o = P({ x: 0, y: 0, z: 0 });
    const axes: Array<[Vec3, string, string]> = [
      [{ x: 5.5, y: 0, z: 0 }, '#DC2626', 'x'],
      [{ x: 0, y: 5.5, z: 0 }, '#059669', 'y'],
      [{ x: 0, y: 0, z: 5.5 }, '#2563EB', 'z'],
    ];
    for (const [end, color, lbl] of axes) {
      const e = P(end);
      elements.push(
        `<line x1="${o.x.toFixed(1)}" y1="${o.y.toFixed(1)}" x2="${e.x.toFixed(1)}" y2="${e.y.toFixed(1)}" stroke="${color}" stroke-width="1.5" stroke-opacity="0.85" />`
      );
      labelItems.push({ x: e.x + 8, y: e.y - 4, text: lbl, color });
    }
  }

  // 2. Planes (soft translucent patches)
  for (const id of scene.order) {
    const o = scene.objects[id];
    if (!o || !o.valid || o.kind !== 'plane') continue;
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
      labelItems.push({ x: corners[2].x - 10, y: corners[2].y + 14, text: o.label, color: o.style.color });
    }
  }

  // 3. Solids (faces + camera-computed hidden dashed & visible solid edges)
  for (const id of scene.order) {
    const o = scene.objects[id];
    if (!o || !o.valid || o.kind !== 'solid') continue;
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
      }
    }
    if (o.style.showVertices !== false) {
      o.vertices.forEach((v, idx) => {
        const pv = P(v);
        elements.push(
          `<circle cx="${pv.x.toFixed(1)}" cy="${pv.y.toFixed(1)}" r="3.6" fill="#0F766E" stroke="#FFFFFF" stroke-width="1.4" />`
        );
        if (scene.showLabels && o.vertexLabels[idx]) {
          labelItems.push({ x: pv.x + 8, y: pv.y - 6, text: o.vertexLabels[idx], color: '#0F172A' });
        }
      });
    }
  }

  // 4. Polygons & Cross Sections
  for (const id of scene.order) {
    const o = scene.objects[id];
    if (!o || !o.valid) continue;
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
          labelItems.push({ x: pv.x + 8, y: pv.y - 6, text: o.vertexLabels[idx], color: '#92400E' });
        }
      });
    }
  }

  // 5. Segments, Lines, Rays, Vectors, Circles
  for (const id of scene.order) {
    const o = scene.objects[id];
    if (!o || !o.valid) continue;
    if (o.style.isAuxiliary && !scene.showAuxiliary) continue;

    if (o.kind === 'segment') {
      const a = P(o.p1);
      const b = P(o.p2);
      elements.push(
        `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${o.style.color}" stroke-width="${o.style.lineWidth ?? 2}" ${o.style.dashed ? 'stroke-dasharray="7 5"' : ''} stroke-linecap="round" />`
      );
    } else if (o.kind === 'line') {
      const a = P(add3(o.origin, scale3(o.direction, -7)));
      const b = P(add3(o.origin, scale3(o.direction, 7)));
      elements.push(
        `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${o.style.color}" stroke-width="${o.style.lineWidth ?? 1.8}" ${o.style.dashed ? 'stroke-dasharray="6 4"' : ''} />`
      );
      if (scene.showLabels && o.style.showLabel !== false) {
        labelItems.push({ x: b.x - 16, y: b.y - 8, text: o.label, color: o.style.color });
      }
    } else if (o.kind === 'ray') {
      const a = P(o.origin);
      const b = P(add3(o.origin, scale3(o.direction, 7)));
      elements.push(
        `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${o.style.color}" stroke-width="${o.style.lineWidth ?? 2}" />`
      );
    } else if (o.kind === 'vector') {
      const a = P(o.origin);
      const b = P(add3(o.origin, o.components));
      elements.push(
        `<line x1="${a.x.toFixed(1)}" y1="${a.y.toFixed(1)}" x2="${b.x.toFixed(1)}" y2="${b.y.toFixed(1)}" stroke="${o.style.color}" stroke-width="2.5" marker-end="url(#vecArrow)" />`
      );
      if (scene.showLabels && o.style.showLabel !== false) {
        const mid = midpoint3(o.origin, add3(o.origin, o.components));
        const pm = P(mid);
        labelItems.push({ x: pm.x + 8, y: pm.y - 8, text: o.label, color: o.style.color });
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
    if (!o || !o.valid) continue;
    if (o.kind === 'point') {
      const pt = P(o.position);
      elements.push(
        `<circle cx="${pt.x.toFixed(1)}" cy="${pt.y.toFixed(1)}" r="4.5" fill="${o.style.color}" stroke="#FFFFFF" stroke-width="1.6" />`
      );
      if (scene.showLabels && o.style.showLabel !== false) {
        labelItems.push({
          x: pt.x + 9 + (o.style.labelOffset?.dx ?? 0),
          y: pt.y - 8 + (o.style.labelOffset?.dy ?? 0),
          text: o.label,
          color: '#0F172A',
        });
      }
    } else if (o.kind === 'measurement') {
      const pt = P(o.anchor);
      labelItems.push({ x: pt.x + 6, y: pt.y - 6, text: `${o.label}: ${o.formattedValue}`, color: '#0F766E' });
    } else if (o.kind === 'formula') {
      const pt = P(o.position);
      labelItems.push({ x: pt.x, y: pt.y, text: o.label || o.latex.replace(/\$/g, ''), color: '#1E293B' });
    }
  }

  // 7. Collision avoidance pass for labels so labels never overlap or clip
  for (let pass = 0; pass < 6; pass++) {
    for (let i = 0; i < labelItems.length; i++) {
      for (let j = i + 1; j < labelItems.length; j++) {
        const dx = labelItems[j].x - labelItems[i].x;
        const dy = labelItems[j].y - labelItems[i].y;
        if (Math.abs(dx) < 34 && Math.abs(dy) < 20) {
          const pushY = dy >= 0 ? 10 : -10;
          labelItems[i].y -= pushY * 0.5;
          labelItems[j].y += pushY * 0.5;
        }
      }
      labelItems[i].x = Math.max(18, Math.min(width - 90, labelItems[i].x));
      labelItems[i].y = Math.max(24, Math.min(height - 16, labelItems[i].y));
    }
  }

  for (const lbl of labelItems) {
    elements.push(
      `<text x="${lbl.x.toFixed(1)}" y="${lbl.y.toFixed(1)}" font-family="Be Vietnam Pro, sans-serif" font-size="16" font-weight="700" fill="${lbl.color}" stroke="#FFFFFF" stroke-width="3.5" paint-order="stroke">${escapeXml(lbl.text)}</text>`
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
