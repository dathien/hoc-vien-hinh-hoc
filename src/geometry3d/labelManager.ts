/**
 * Unified 3D Geometry Label Manager (GeometryLabelManager)
 *
 * Shared across Viewport3D (WebGL Lab & 3D Challenges), LiveGeo3DPreview
 * (HomePage 3D card, Lab templates, Guide, My Drawings), and export3d.ts (Vector SVG).
 *
 * Guarantees:
 * - Zero discontinuous threshold flips (no `x < width * 0.5` axis flicker).
 * - Rigid attachment to projected 3D anchors (smooths relative offset, not world position).
 * - Multi-candidate 8-direction + extended-ring collision avoidance with hysteresis.
 * - Avoids label-label, label-axis (e.g. S vs z), label-edge, label-point, and viewport clipping.
 * - Deterministic priority ordering so labels never swap or flicker across 360° rotation.
 */

export type LabelCategory =
  | 'point'
  | 'origin'
  | 'axis'
  | 'coord'
  | 'vector'
  | 'line'
  | 'plane'
  | 'measure'
  | 'formula';

export interface EdgeObstacle2D {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface LabelInput {
  id: string;
  objectId: string;
  text: string;
  category: LabelCategory;
  color: string;
  anchorX: number;
  anchorY: number;
  isMath?: boolean;
  isAuxiliary?: boolean;
  /** Optional unit preferred outward direction (e.g. along an axis ray) */
  preferredDir?: { x: number; y: number };
  /** Explicit user-dragged offset relative to anchor (disables auto-slot override) */
  userOffset?: { dx: number; dy: number };
  /** Override base radial offset distance in px */
  anchorRadius?: number;
}

export interface ResolvedLabel {
  id: string;
  objectId: string;
  text: string;
  category: LabelCategory;
  color: string;
  anchorX: number;
  anchorY: number;
  /** Center X of label box in viewport px */
  x: number;
  /** Center Y of label box in viewport px */
  y: number;
  width: number;
  height: number;
  displaced: boolean;
  isMath?: boolean;
  isAuxiliary?: boolean;
  slotIndex: number;
}

export interface LabelLayoutOptions {
  width: number;
  height: number;
  fontSize: number;
  /** Seconds elapsed since previous frame; 0 = instant deterministic placement (first frame / static export) */
  dt?: number;
  /** Projected 2D segments (solid edges, axes, altitudes) for edge-avoidance scoring */
  edges?: EdgeObstacle2D[];
  /** Viewport inner padding in px */
  padding?: number;
  /** Compact mode for small preview cards */
  compact?: boolean;
}

interface PlacedBox {
  id: string;
  x: number;
  y: number;
  halfW: number;
  halfH: number;
}

interface TrackedLabelState {
  slotIndex: number;
  dx: number;
  dy: number;
}

const CATEGORY_PRIORITY: Record<LabelCategory, number> = {
  point: 100,
  origin: 95,
  axis: 90,
  coord: 80,
  vector: 70,
  line: 65,
  plane: 60,
  measure: 50,
  formula: 45,
};

/**
 * 8 primary directional slots around an anchor point (unit vectors).
 * Order starts with NW, NE, W, E, N, SW, SE, S for textbook clarity.
 */
const DIR_SLOTS: ReadonlyArray<{ x: number; y: number }> = [
  { x: -0.78, y: -0.62 }, // 0: NW
  { x: 0.78, y: -0.62 },  // 1: NE
  { x: -1.0, y: 0.0 },    // 2: W
  { x: 1.0, y: 0.0 },     // 3: E
  { x: 0.0, y: -1.0 },    // 4: N
  { x: -0.78, y: 0.62 },  // 5: SW
  { x: 0.78, y: 0.62 },   // 6: SE
  { x: 0.0, y: 1.0 },     // 7: S
];

const HYSTERESIS_BONUS = 72;
const LABEL_GAP_PX = 4;

/**
 * Estimate rendered label box dimensions (in px) without causing DOM layout reflows.
 */
export function measureLabelBox(
  text: string,
  fontSize: number,
  isMath = false,
  compact = false
): { width: number; height: number } {
  const clean = isMath ? text.replace(/\$/g, '').replace(/\\[a-zA-Z]+/g, 'xx') : text;
  let charUnits = 0;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (ch === ' ' || ch === "'" || ch === '.' || ch === ';' || ch === ',') {
      charUnits += 0.38;
    } else if (ch === '(' || ch === ')' || ch === 'i' || ch === 'l' || ch === '1') {
      charUnits += 0.45;
    } else if (ch >= 'A' && ch <= 'Z') {
      charUnits += 0.74;
    } else {
      charUnits += 0.62;
    }
  }
  const padX = compact ? 6 : 12;
  const padY = compact ? 4 : 8;
  const minW = compact ? Math.max(14, fontSize * 1.15) : Math.max(22, fontSize * 1.5);
  const width = Math.max(minW, Math.ceil(charUnits * fontSize) + padX);
  const height = Math.ceil(fontSize * 1.24) + padY;
  return { width, height };
}

/**
 * Shortest Euclidean distance from point (px, py) to 2D line segment (x1,y1)-(x2,y2).
 */
function pointToSegmentDist(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const vx = x2 - x1;
  const vy = y2 - y1;
  const lenSq = vx * vx + vy * vy;
  if (lenSq < 1e-6) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * vx + (py - y1) * vy) / lenSq;
  if (t < 0) t = 0;
  else if (t > 1) t = 1;
  const projX = x1 + t * vx;
  const projY = y1 + t * vy;
  return Math.hypot(px - projX, py - projY);
}

/**
 * Overlap area between two axis-aligned boxes with extra safety gap.
 */
function boxOverlapArea(
  ax: number,
  ay: number,
  aHalfW: number,
  aHalfH: number,
  bx: number,
  by: number,
  bHalfW: number,
  bHalfH: number,
  gap: number
): number {
  const ox = aHalfW + bHalfW + gap - Math.abs(ax - bx);
  if (ox <= 0) return 0;
  const oy = aHalfH + bHalfH + gap - Math.abs(ay - by);
  if (oy <= 0) return 0;
  return ox * oy;
}

export function boxesIntersect(a: ResolvedLabel, b: ResolvedLabel, gap = 0): boolean {
  const ox = (a.width + b.width) * 0.5 + gap - Math.abs(a.x - b.x);
  const oy = (a.height + b.height) * 0.5 + gap - Math.abs(a.y - b.y);
  return ox > 0 && oy > 0;
}

export class GeometryLabelManager {
  private tracked = new Map<string, TrackedLabelState>();

  /** Clear all hysteresis/smoothing history (call when switching scenes/variants). */
  public reset(): void {
    this.tracked.clear();
  }

  /**
   * Compute collision-free, flicker-free screen positions for all 3D labels.
   */
  public update(inputs: LabelInput[], options: LabelLayoutOptions): ResolvedLabel[] {
    const {
      width,
      height,
      fontSize,
      dt = 0,
      edges = [],
      padding = options.compact ? 6 : 10,
      compact = false,
    } = options;

    if (inputs.length === 0 || width < 16 || height < 16) {
      this.tracked.clear();
      return [];
    }

    // 1. Prune removed label IDs so stale state never leaks
    const activeIds = new Set<string>();
    for (const item of inputs) activeIds.add(item.id);
    for (const key of this.tracked.keys()) {
      if (!activeIds.has(key)) this.tracked.delete(key);
    }

    // 2. Compute projected centroid of point/solid anchors for smooth outward preference
    let sumX = 0;
    let sumY = 0;
    let ptCount = 0;
    for (const item of inputs) {
      if (item.category === 'point' || item.category === 'coord') {
        sumX += item.anchorX;
        sumY += item.anchorY;
        ptCount += 1;
      }
    }
    const centroidX = ptCount > 0 ? sumX / ptCount : width * 0.5;
    const centroidY = ptCount > 0 ? sumY / ptCount : height * 0.5;

    // 3. Sort deterministically by category priority descending, primary before auxiliary, then ID ascending
    //    (order NEVER changes during rotation, eliminating mutual oscillation)
    const sorted = [...inputs].sort((a, b) => {
      const pa = CATEGORY_PRIORITY[a.category] ?? 50;
      const pb = CATEGORY_PRIORITY[b.category] ?? 50;
      if (pb !== pa) return pb - pa;
      const auxA = a.isAuxiliary ? 1 : 0;
      const auxB = b.isAuxiliary ? 1 : 0;
      if (auxA !== auxB) return auxA - auxB;
      return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });

    const placed: PlacedBox[] = [];
    const results: ResolvedLabel[] = [];
    const smoothAlpha = dt > 0 ? 1 - Math.exp(-12 * Math.min(dt, 0.06)) : 1;

    // Pre-collect anchor dots to discourage labels covering other points
    const allAnchors = inputs.map((i) => ({ id: i.id, x: i.anchorX, y: i.anchorY }));

    for (const item of sorted) {
      const { width: boxW, height: boxH } = measureLabelBox(
        item.text,
        fontSize,
        Boolean(item.isMath),
        compact
      );
      const halfW = boxW * 0.5;
      const halfH = boxH * 0.5;

      // Clamp bounds so the ENTIRE label box remains cleanly inside the viewport
      const minX = Math.min(width * 0.5, padding + halfW);
      const maxX = Math.max(width * 0.5, width - padding - halfW);
      const minY = Math.min(height * 0.5, padding + halfH);
      const maxY = Math.max(height * 0.5, height - padding - halfH);

      // Handle explicit user-dragged label offset directly
      if (item.userOffset) {
        const x = Math.max(minX, Math.min(maxX, item.anchorX + item.userOffset.dx));
        const y = Math.max(minY, Math.min(maxY, item.anchorY + item.userOffset.dy));
        placed.push({ id: item.id, x, y, halfW, halfH });
        this.tracked.set(item.id, {
          slotIndex: -1,
          dx: x - item.anchorX,
          dy: y - item.anchorY,
        });
        results.push({
          id: item.id,
          objectId: item.objectId,
          text: item.text,
          category: item.category,
          color: item.color,
          anchorX: item.anchorX,
          anchorY: item.anchorY,
          x,
          y,
          width: boxW,
          height: boxH,
          displaced: Math.hypot(x - item.anchorX, y - item.anchorY) > 22,
          isMath: item.isMath,
          isAuxiliary: item.isAuxiliary,
          slotIndex: -1,
        });
        continue;
      }

      // Compute continuous preferred outward unit vector (ZERO discontinuous sign flips!)
      let prefX = 0;
      let prefY = 0;
      if (item.preferredDir) {
        const len = Math.hypot(item.preferredDir.x, item.preferredDir.y);
        if (len > 1e-4) {
          prefX = item.preferredDir.x / len;
          prefY = item.preferredDir.y / len;
        }
      } else if (item.category === 'origin') {
        // Textbook convention: origin O sits slightly down-left
        prefX = -0.72;
        prefY = 0.69;
      } else {
        const rawDx = item.anchorX - centroidX;
        const rawDy = item.anchorY - centroidY;
        // Continuous symmetry breaker around vertical axis (e.g. apex S at x === centroidX):
        // Prevents IEEE-754 ±1e-15 sign flips from jumping S left/right!
        const absDx = Math.abs(rawDx);
        const symBreakX = absDx < 20 ? -16 * (1 - absDx / 20) : 0;
        const effDx = rawDx + symBreakX;
        const effDy = Math.abs(rawDy) < 4 ? -10 : rawDy;
        const len = Math.hypot(effDx, effDy) || 1;
        prefX = effDx / len;
        prefY = effDy / len;
      }

      // Radial distance from anchor to label box center so label clears the point dot comfortably
      const baseGap = item.anchorRadius ?? (compact ? 7 : 10);
      const prev = this.tracked.get(item.id);

      let bestSlot = 0;
      let bestCost = Infinity;
      let bestDx = 0;
      let bestDy = 0;

      // Evaluate 8 inner-ring slots + 8 extended-ring slots
      for (let ring = 0; ring < 2; ring++) {
        const ringScale = ring === 0 ? 1.0 : 1.72;
        const ringPenalty = ring === 0 ? 0 : 115;

        for (let s = 0; s < DIR_SLOTS.length; s++) {
          const slotIndex = ring * DIR_SLOTS.length + s;
          const dir = DIR_SLOTS[s];

          // Elliptical offset accounts for wide labels (e.g. coordinates A(1; 2; 3))
          const rx = (halfW + baseGap) * ringScale;
          const ry = (halfH + baseGap * 0.85) * ringScale;
          const candDx = dir.x * rx;
          const candDy = dir.y * ry;
          const cx = item.anchorX + candDx;
          const cy = item.anchorY + candDy;

          let cost = ringPenalty;

          // A. Viewport boundary overflow penalty
          const overLeft = Math.max(0, minX - cx);
          const overRight = Math.max(0, cx - maxX);
          const overTop = Math.max(0, minY - cy);
          const overBottom = Math.max(0, cy - maxY);
          const boundaryOver = overLeft + overRight + overTop + overBottom;
          if (boundaryOver > 0) {
            cost += 3200 + boundaryOver * 90;
          }

          // Clamp candidate for collision checks if outside viewport
          const effX = Math.max(minX, Math.min(maxX, cx));
          const effY = Math.max(minY, Math.min(maxY, cy));

          // B. Label-to-label collision penalty (strictly prevents S↔z, point↔point, point↔measure overlaps)
          for (let p = 0; p < placed.length; p++) {
            const other = placed[p];
            const area = boxOverlapArea(
              effX,
              effY,
              halfW,
              halfH,
              other.x,
              other.y,
              other.halfW,
              other.halfH,
              LABEL_GAP_PX
            );
            if (area > 0) {
              cost += 5500 + area * 45;
            }
          }

          // C. Avoid sitting directly on top of another point's anchor dot
          for (let a = 0; a < allAnchors.length; a++) {
            const anc = allAnchors[a];
            if (anc.id === item.id) continue;
            const ox = halfW + 5 - Math.abs(effX - anc.x);
            const oy = halfH + 5 - Math.abs(effY - anc.y);
            if (ox > 0 && oy > 0) {
              cost += 460 + ox * oy * 4;
            }
          }

          // D. Projected geometric edge avoidance (steer clear of solid edges & axes)
          if (edges.length > 0) {
            const edgeThreshold = Math.min(halfW, halfH) * 0.85 + 3.5;
            for (let e = 0; e < edges.length; e++) {
              const seg = edges[e];
              const d = pointToSegmentDist(effX, effY, seg.x1, seg.y1, seg.x2, seg.y2);
              if (d < edgeThreshold) {
                const ratio = (edgeThreshold - d) / edgeThreshold;
                cost += ratio * ratio * 150;
              }
            }
          }

          // E. Preferred outward direction alignment (smooth, low weight)
          const align = dir.x * prefX + dir.y * prefY; // [-1, 1]
          cost += (1 - align) * 28;

          // F. Hysteresis bonus: strongly prefer keeping the previous frame's slot
          //    unless a collision or clipping forces a transition
          if (prev && prev.slotIndex === slotIndex) {
            cost -= HYSTERESIS_BONUS;
          }

          if (cost < bestCost) {
            bestCost = cost;
            bestSlot = slotIndex;
            bestDx = effX - item.anchorX;
            bestDy = effY - item.anchorY;
          }
        }
      }

      // Smooth relative offset (dx, dy) so vertex attachment has ZERO lag while slot changes glide gently
      let finalDx = bestDx;
      let finalDy = bestDy;
      if (prev && dt > 0 && smoothAlpha < 1) {
        finalDx = prev.dx + (bestDx - prev.dx) * smoothAlpha;
        finalDy = prev.dy + (bestDy - prev.dy) * smoothAlpha;
      }

      // Clamp maximum tether distance so label always stays visually linked to its point
      const maxTether = Math.max(halfW, halfH) + (compact ? 28 : 44);
      const tetherDist = Math.hypot(finalDx, finalDy);
      if (tetherDist > maxTether) {
        const s = maxTether / tetherDist;
        finalDx *= s;
        finalDy *= s;
      }

      let x = Math.max(minX, Math.min(maxX, item.anchorX + finalDx));
      let y = Math.max(minY, Math.min(maxY, item.anchorY + finalDy));

      const hasOverlapWithPlaced = (cx: number, cy: number, gap: number): boolean => {
        for (let p = 0; p < placed.length; p++) {
          const other = placed[p];
          if (boxOverlapArea(cx, cy, halfW, halfH, other.x, other.y, other.halfW, other.halfH, gap) > 0) {
            return true;
          }
        }
        return false;
      };

      // Wall-aware guaranteed non-overlap safeguard:
      // 1. First try stepping cleanly to the chosen target slot if smoothing momentarily grazed a neighbor
      if (hasOverlapWithPlaced(x, y, 1)) {
        const tx = Math.max(minX, Math.min(maxX, item.anchorX + bestDx));
        const ty = Math.max(minY, Math.min(maxY, item.anchorY + bestDy));
        if (!hasOverlapWithPlaced(tx, ty, 1)) {
          x = tx;
          y = ty;
        }
      }

      // 2. Wall-aware 4-direction separation passes (never pushes into a clamped viewport wall!)
      for (let pass = 0; pass < 8; pass++) {
        let adjusted = false;
        for (let p = 0; p < placed.length; p++) {
          const other = placed[p];
          const needX = halfW + other.halfW + LABEL_GAP_PX;
          const needY = halfH + other.halfH + LABEL_GAP_PX;
          const ox = needX - Math.abs(x - other.x);
          const oy = needY - Math.abs(y - other.y);
          if (ox > 0 && oy > 0) {
            adjusted = true;
            const candidates: Array<{ nx: number; ny: number; dist: number }> = [];
            const pushRight = other.x + needX + 0.5;
            const pushLeft = other.x - needX - 0.5;
            const pushDown = other.y + needY + 0.5;
            const pushUp = other.y - needY - 0.5;

            if (pushRight <= maxX) {
              candidates.push({ nx: pushRight, ny: y, dist: Math.abs(pushRight - x) });
            }
            if (pushLeft >= minX) {
              candidates.push({ nx: pushLeft, ny: y, dist: Math.abs(pushLeft - x) });
            }
            if (pushDown <= maxY) {
              candidates.push({ nx: x, ny: pushDown, dist: Math.abs(pushDown - y) });
            }
            if (pushUp >= minY) {
              candidates.push({ nx: x, ny: pushUp, dist: Math.abs(pushUp - y) });
            }

            if (candidates.length > 0) {
              candidates.sort((a, b) => a.dist - b.dist);
              const bestFree =
                candidates.find((c) => !hasOverlapWithPlaced(c.nx, c.ny, 0.5)) ?? candidates[0];
              x = bestFree.nx;
              y = bestFree.ny;
            }
          }
        }
        if (!adjusted) break;
      }

      // 3. Final concentric search fallback for ultra-dense compact viewports
      if (hasOverlapWithPlaced(x, y, 0.5)) {
        let found = false;
        for (let r = 1; r <= 5 && !found; r++) {
          const rad = (Math.max(halfW, halfH) + 6) * (0.9 + r * 0.55);
          for (let k = 0; k < 12; k++) {
            const ang = (k / 12) * Math.PI * 2;
            const cx = Math.max(minX, Math.min(maxX, item.anchorX + Math.cos(ang) * rad));
            const cy = Math.max(minY, Math.min(maxY, item.anchorY + Math.sin(ang) * rad));
            if (!hasOverlapWithPlaced(cx, cy, 0.5)) {
              x = cx;
              y = cy;
              found = true;
              break;
            }
          }
        }
      }

      const settledDx = x - item.anchorX;
      const settledDy = y - item.anchorY;
      this.tracked.set(item.id, {
        slotIndex: bestSlot,
        dx: settledDx,
        dy: settledDy,
      });

      placed.push({ id: item.id, x, y, halfW, halfH });

      const distFromAnchor = Math.hypot(settledDx, settledDy);
      const displacedThreshold = Math.hypot(halfW + baseGap, halfH + baseGap) * 1.18;

      results.push({
        id: item.id,
        objectId: item.objectId,
        text: item.text,
        category: item.category,
        color: item.color,
        anchorX: item.anchorX,
        anchorY: item.anchorY,
        x,
        y,
        width: boxW,
        height: boxH,
        displaced: distFromAnchor > displacedThreshold,
        isMath: item.isMath,
        isAuxiliary: item.isAuxiliary,
        slotIndex: bestSlot,
      });
    }

    return results;
  }
}
