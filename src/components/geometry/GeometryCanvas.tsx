import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Compass,
  Download,
  Eye,
  EyeOff,
  Grid3X3,
  Image as ImageIcon,
  Maximize2,
  Minimize2,
  Moon,
  Plus,
  Minus,
  Scan,
  Sun,
  Tag,
  Axis3d,
} from 'lucide-react';
import {
  addGeoObject,
  cloneScene,
  findSnapTarget,
  getSceneBounds,
  hitTestObject,
  moveFreePoint,
  recomputeScene,
  type SnapResult,
} from '../../geometry/engine';
import { dist } from '../../geometry/math';
import { TOOL_CATALOG } from '../../geometry/tools';
import type {
  GeoCircle,
  GeoLineLike,
  GeoObject,
  GeoPoint,
  GeoScene,
  ToolId,
  Vec2,
} from '../../geometry/types';
import { audioService } from '../../services/audioService';

export interface GeometryCanvasProps {
  scene: GeoScene;
  onSceneChange?: (next: GeoScene, recordHistory?: boolean) => void;
  activeTool?: ToolId;
  inputMode?: 'quick' | 'virtual_tools';
  selectedObjectId?: string | null;
  onSelectObject?: (id: string | null) => void;
  readOnly?: boolean;
  interactiveDragOnly?: boolean;
  heightClass?: string;
  defaultShowGrid?: boolean;
  defaultShowAxes?: boolean;
  defaultShowLabels?: boolean;
  darkTheme?: boolean;
  compactToolbar?: boolean;
  fixedRadius?: number;
  rotateAngleDeg?: number;
  homothetyFactor?: number;
  regularPolygonSides?: number;
  statusBanner?: string | null;
  hideBottomGuidance?: boolean;
  onPendingChange?: (pendingIds: string[]) => void;
}

interface ViewTransform {
  cx: number; // world x at center of viewport
  cy: number; // world y at center of viewport
  scale: number; // px per world unit
}

function getStrokeDashArray(dash: 'solid' | 'dashed' | 'dotted'): string | undefined {
  if (dash === 'dashed') return '7 5';
  if (dash === 'dotted') return '2.5 4.5';
  return undefined;
}

function getLineEndpointsInView(
  line: GeoLineLike,
  minX: number,
  maxX: number,
  minY: number,
  maxY: number
): { x1: number; y1: number; x2: number; y2: number } | null {
  if (line.kind === 'segment') {
    return { x1: line.p1.x, y1: line.p1.y, x2: line.p2.x, y2: line.p2.y };
  }
  const dx = line.p2.x - line.p1.x;
  const dy = line.p2.y - line.p1.y;
  const len = Math.hypot(dx, dy);
  if (len < 1e-9) return null;
  const ux = dx / len;
  const uy = dy / len;
  const diag = Math.hypot(maxX - minX, maxY - minY) * 1.6 + 600;
  if (line.kind === 'ray') {
    return {
      x1: line.p1.x,
      y1: line.p1.y,
      x2: line.p1.x + ux * diag,
      y2: line.p1.y + uy * diag,
    };
  }
  return {
    x1: line.p1.x - ux * diag,
    y1: line.p1.y - uy * diag,
    x2: line.p1.x + ux * diag,
    y2: line.p1.y + uy * diag,
  };
}

export function exportSvgElementToSvgFile(svgEl: SVGSVGElement, filename: string): void {
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(clone);
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportSvgElementToPngFile(
  svgEl: SVGSVGElement,
  filename: string,
  background = '#F8FAFC'
): void {
  const rect = svgEl.getBoundingClientRect();
  const width = Math.max(800, Math.round(rect.width * 2));
  const height = Math.max(520, Math.round(rect.height * 2));
  const clone = svgEl.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));

  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(clone);
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
      a.click();
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

export const GeometryCanvas: React.FC<GeometryCanvasProps> = ({
  scene,
  onSceneChange,
  activeTool = 'select',
  inputMode = 'quick',
  selectedObjectId = null,
  onSelectObject,
  readOnly = false,
  interactiveDragOnly = false,
  heightClass = 'h-[520px]',
  defaultShowGrid = true,
  defaultShowAxes = false,
  defaultShowLabels = true,
  darkTheme = false,
  compactToolbar = false,
  fixedRadius = 80,
  rotateAngleDeg = 60,
  homothetyFactor = 2,
  regularPolygonSides = 5,
  statusBanner = null,
  hideBottomGuidance = false,
  onPendingChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 840, height: 520 });
  const [view, setView] = useState<ViewTransform>({ cx: 0, cy: 0, scale: 1.35 });
  const [showGrid, setShowGrid] = useState(defaultShowGrid);
  const [showAxes, setShowAxes] = useState(defaultShowAxes);
  const [showLabels, setShowLabels] = useState(defaultShowLabels);
  const [showAux, setShowAux] = useState(true);
  const [canvasDark, setCanvasDark] = useState(darkTheme);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Interactive construction state
  const [pendingIds, setPendingIds] = useState<string[]>([]);
  const [hoverWorld, setHoverWorld] = useState<Vec2 | null>(null);
  const [snapPreview, setSnapPreview] = useState<SnapResult | null>(null);

  // Drag state
  const dragRef = useRef<
    | { mode: 'none' }
    | { mode: 'pan'; startClient: Vec2; startView: ViewTransform }
    | { mode: 'point'; pointId: string; moved: boolean }
    | { mode: 'label'; objectId: string; startClient: Vec2; startOffset: Vec2 }
  >({ mode: 'none' });

  useEffect(() => {
    setCanvasDark(darkTheme);
  }, [darkTheme]);

  // Reset pending selections when tool changes
  useEffect(() => {
    setPendingIds([]);
  }, [activeTool]);

  // Prune stale pending IDs if scene changes (e.g. Undo / Reset / Delete)
  useEffect(() => {
    setPendingIds((prev) => {
      if (prev.length === 0) return prev;
      const valid = prev.filter((id) => Boolean(scene.objects[id]));
      return valid.length === prev.length ? prev : valid;
    });
  }, [scene]);

  useEffect(() => {
    onPendingChange?.(pendingIds);
  }, [pendingIds, onPendingChange]);

  // Escape cancels current multi-step tool
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPendingIds([]);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Observe container resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const fitToScene = useCallback(
    (targetScene?: GeoScene) => {
      const sc = targetScene ?? scene;
      const bounds = getSceneBounds(sc);
      const bw = Math.max(120, bounds.maxX - bounds.minX);
      const bh = Math.max(100, bounds.maxY - bounds.minY);
      const scaleX = (canvasSize.width * 0.86) / bw;
      const scaleY = (canvasSize.height * 0.84) / bh;
      const nextScale = Math.max(0.35, Math.min(3.5, Math.min(scaleX, scaleY)));
      setView({
        cx: (bounds.minX + bounds.maxX) / 2,
        cy: (bounds.minY + bounds.maxY) / 2,
        scale: nextScale,
      });
    },
    [scene, canvasSize.width, canvasSize.height]
  );

  // Auto-fit once on initial mount or scene reset (when order count resets to givens)
  const initializedFitRef = useRef(false);
  useEffect(() => {
    if (!initializedFitRef.current && canvasSize.width > 100 && scene.order.length > 0) {
      initializedFitRef.current = true;
      fitToScene(scene);
    }
  }, [canvasSize.width, scene, fitToScene]);

  const worldToScreen = useCallback(
    (p: Vec2): Vec2 => ({
      x: (p.x - view.cx) * view.scale + canvasSize.width / 2,
      y: (p.y - view.cy) * view.scale + canvasSize.height / 2,
    }),
    [view, canvasSize]
  );

  const screenToWorld = useCallback(
    (clientX: number, clientY: number): Vec2 => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      return {
        x: (sx - canvasSize.width / 2) / view.scale + view.cx,
        y: (sy - canvasSize.height / 2) / view.scale + view.cy,
      };
    },
    [view, canvasSize]
  );

  const worldTolerance = 14 / view.scale;

  /** Materialize a point from a snap target (either reuse existing point or create intersection/on_object/free point) */
  const resolveOrCreatePoint = (
    curScene: GeoScene,
    worldPos: Vec2,
    allowCreateFree = true
  ): { scene: GeoScene; pointId: string; created: boolean } | null => {
    const snap = findSnapTarget(curScene, worldPos, worldTolerance, false);
    if (snap.type === 'point' && snap.pointId) {
      return { scene: curScene, pointId: snap.pointId, created: false };
    }
    if (snap.type === 'intersection' && snap.objectIds && snap.objectIds.length === 2) {
      const added = addGeoObject(curScene, {
        kind: 'point',
        rule: 'intersection',
        parents: snap.objectIds,
        params: { branch: snap.branch ?? 0 },
        tool: 'intersect',
        costL: 0,
        costE: 0,
        style: { color: '#D97706' },
        logDescription: 'Xác định giao điểm',
      });
      audioService.play('intersect');
      return { scene: added.scene, pointId: added.id, created: true };
    }
    if (snap.type === 'on_object' && snap.objectIds && snap.objectIds.length === 1) {
      const added = addGeoObject(curScene, {
        kind: 'point',
        rule: 'point_on_object',
        parents: snap.objectIds,
        params: { t: snap.paramT ?? 0.5 },
        tool: 'point_on_object',
        costL: 0,
        costE: 0,
        style: { color: '#0284C7' },
        logDescription: 'Đặt điểm trên đối tượng',
      });
      return { scene: added.scene, pointId: added.id, created: true };
    }
    if (!allowCreateFree) return null;
    const added = addGeoObject(curScene, {
      kind: 'point',
      rule: 'free_point',
      parents: [],
      x: worldPos.x,
      y: worldPos.y,
      tool: 'point',
      costL: 0,
      costE: 0,
      style: { color: '#0F766E' },
      logDescription: 'Đặt điểm tự do',
    });
    return { scene: added.scene, pointId: added.id, created: true };
  };

  const commitScene = (next: GeoScene, recordHistory = true) => {
    onSceneChange?.(next, recordHistory);
  };

  const handleCanvasClick = (worldPos: Vec2) => {
    if (readOnly || interactiveDragOnly) return;

    const tool = activeTool;
    if (tool === 'pan') return;

    if (tool === 'select') {
      const hit = hitTestObject(scene, worldPos, worldTolerance);
      onSelectObject?.(hit?.id ?? null);
      if (hit) audioService.play('select');
      return;
    }

    if (tool === 'point') {
      const res = resolveOrCreatePoint(scene, worldPos, true);
      if (res && res.created) {
        audioService.play('select');
        commitScene(res.scene, true);
      }
      return;
    }

    if (tool === 'point_on_object') {
      const snap = findSnapTarget(scene, worldPos, worldTolerance * 1.3, false);
      if (snap.type === 'on_object' && snap.objectIds?.[0]) {
        const added = addGeoObject(scene, {
          kind: 'point',
          rule: 'point_on_object',
          parents: [snap.objectIds[0]],
          params: { t: snap.paramT ?? 0.5 },
          tool: 'point_on_object',
          style: { color: '#0284C7' },
        });
        audioService.play('select');
        commitScene(added.scene, true);
      }
      return;
    }

    if (tool === 'intersect') {
      const snap = findSnapTarget(scene, worldPos, worldTolerance * 1.4, false);
      if (snap.type === 'intersection' && snap.objectIds?.length === 2) {
        const added = addGeoObject(scene, {
          kind: 'point',
          rule: 'intersection',
          parents: snap.objectIds,
          params: { branch: snap.branch ?? 0 },
          tool: 'intersect',
          style: { color: '#D97706' },
          logDescription: 'Giao điểm 2 đối tượng',
        });
        audioService.play('intersect');
        commitScene(added.scene, true);
        setPendingIds([]);
        return;
      }
      const hitCurve = hitTestObject(scene, worldPos, worldTolerance * 1.4, [
        'line',
        'segment',
        'ray',
        'circle',
      ]);
      if (hitCurve) {
        if (pendingIds.length === 0) {
          setPendingIds([hitCurve.id]);
          audioService.play('select');
        } else if (pendingIds[0] !== hitCurve.id) {
          let next = scene;
          const a0 = addGeoObject(next, {
            kind: 'point',
            rule: 'intersection',
            parents: [pendingIds[0], hitCurve.id],
            params: { branch: 0 },
            tool: 'intersect',
            style: { color: '#D97706' },
            logDescription: 'Giao điểm 1',
          });
          next = a0.scene;
          const a1 = addGeoObject(next, {
            kind: 'point',
            rule: 'intersection',
            parents: [pendingIds[0], hitCurve.id],
            params: { branch: 1 },
            tool: 'intersect',
            style: { color: '#D97706' },
            logDescription: 'Giao điểm 2',
          });
          // Only keep branch 1 if valid & distinct
          const p0 = a1.scene.objects[a0.id] as GeoPoint | undefined;
          const p1 = a1.scene.objects[a1.id] as GeoPoint | undefined;
          if (p0?.valid && p1?.valid && dist(p0, p1) > 1e-3) {
            next = a1.scene;
          }
          if (p0?.valid) {
            audioService.play('intersect');
            commitScene(next, true);
          } else {
            audioService.play('error');
          }
          setPendingIds([]);
        }
      }
      return;
    }

    // Two-point tools: line, segment, ray, circle_cp, midpoint, perp_bisector, reflect_point, rotate, homothety, regular_polygon, measure_length
    if (
      tool === 'line' ||
      tool === 'segment' ||
      tool === 'ray' ||
      tool === 'circle_cp' ||
      tool === 'midpoint' ||
      tool === 'perp_bisector' ||
      tool === 'reflect_point' ||
      tool === 'rotate' ||
      tool === 'homothety' ||
      tool === 'regular_polygon' ||
      tool === 'measure_length'
    ) {
      // Allow clicking directly on a segment for midpoint / perp_bisector / measure_length
      if (
        pendingIds.length === 0 &&
        (tool === 'midpoint' || tool === 'perp_bisector' || tool === 'measure_length')
      ) {
        const hitSeg = hitTestObject(scene, worldPos, worldTolerance, ['segment']);
        if (hitSeg && hitSeg.parents.length === 2) {
          const ruleMap = {
            midpoint: { kind: 'point' as const, rule: 'midpoint' as const, color: '#D97706' },
            perp_bisector: { kind: 'line' as const, rule: 'perpendicular_bisector' as const, color: '#0284C7' },
            measure_length: { kind: 'length_measure' as const, rule: 'length_measure' as const, color: '#7C3AED' },
          }[tool];
          const added = addGeoObject(scene, {
            kind: ruleMap.kind,
            rule: ruleMap.rule,
            parents: hitSeg.parents,
            tool,
            style: { color: ruleMap.color },
          });
          audioService.play('draw');
          commitScene(added.scene, true);
          return;
        }
      }

      const res = resolveOrCreatePoint(scene, worldPos, true);
      if (!res) return;

      if (pendingIds.length === 0) {
        if (res.created) commitScene(res.scene, true);
        setPendingIds([res.pointId]);
        audioService.play('select');
        return;
      }

      const firstId = pendingIds[0];
      if (firstId === res.pointId) return;

      let next = res.scene;
      if (tool === 'line') {
        next = addGeoObject(next, {
          kind: 'line',
          rule: 'line_two_points',
          parents: [firstId, res.pointId],
          tool,
          style: { color: '#0F766E' },
        }).scene;
      } else if (tool === 'segment') {
        next = addGeoObject(next, {
          kind: 'segment',
          rule: 'segment_two_points',
          parents: [firstId, res.pointId],
          tool,
          style: { color: '#0F766E' },
        }).scene;
      } else if (tool === 'ray') {
        next = addGeoObject(next, {
          kind: 'ray',
          rule: 'ray_two_points',
          parents: [firstId, res.pointId],
          tool,
          style: { color: '#0F766E' },
        }).scene;
      } else if (tool === 'circle_cp') {
        next = addGeoObject(next, {
          kind: 'circle',
          rule: 'circle_center_point',
          parents: [firstId, res.pointId],
          tool,
          style: { color: '#0284C7' },
        }).scene;
      } else if (tool === 'midpoint') {
        next = addGeoObject(next, {
          kind: 'point',
          rule: 'midpoint',
          parents: [firstId, res.pointId],
          tool,
          style: { color: '#D97706' },
        }).scene;
      } else if (tool === 'perp_bisector') {
        next = addGeoObject(next, {
          kind: 'line',
          rule: 'perpendicular_bisector',
          parents: [firstId, res.pointId],
          tool,
          style: { color: '#0284C7' },
        }).scene;
      } else if (tool === 'reflect_point') {
        next = addGeoObject(next, {
          kind: 'point',
          rule: 'reflection_point',
          parents: [firstId, res.pointId],
          tool,
          style: { color: '#7C3AED' },
        }).scene;
      } else if (tool === 'rotate') {
        next = addGeoObject(next, {
          kind: 'point',
          rule: 'rotation',
          parents: [firstId, res.pointId],
          params: { angleDeg: rotateAngleDeg },
          tool,
          style: { color: '#7C3AED' },
        }).scene;
      } else if (tool === 'homothety') {
        next = addGeoObject(next, {
          kind: 'point',
          rule: 'homothety',
          parents: [firstId, res.pointId],
          params: { k: homothetyFactor },
          tool,
          style: { color: '#7C3AED' },
        }).scene;
      } else if (tool === 'regular_polygon') {
        next = addGeoObject(next, {
          kind: 'polygon',
          rule: 'regular_polygon',
          parents: [firstId, res.pointId],
          params: { sides: regularPolygonSides },
          tool,
          style: { color: '#0F766E', fillColor: '#0F766E', fillOpacity: 0.12 },
        }).scene;
      } else if (tool === 'measure_length') {
        next = addGeoObject(next, {
          kind: 'length_measure',
          rule: 'length_measure',
          parents: [firstId, res.pointId],
          tool,
          style: { color: '#7C3AED' },
        }).scene;
      }

      audioService.play('draw');
      commitScene(next, true);
      setPendingIds([]);
      return;
    }

    // Circle center + fixed radius
    if (tool === 'circle_cr') {
      const res = resolveOrCreatePoint(scene, worldPos, true);
      if (!res) return;
      const next = addGeoObject(res.scene, {
        kind: 'circle',
        rule: 'circle_center_radius',
        parents: [res.pointId],
        params: { radius: fixedRadius },
        tool,
        style: { color: '#0284C7' },
      }).scene;
      audioService.play('draw');
      commitScene(next, true);
      return;
    }

    // Line + Point tools: perpendicular, parallel, projection, reflect_line
    if (
      tool === 'perpendicular' ||
      tool === 'parallel' ||
      tool === 'projection' ||
      tool === 'reflect_line'
    ) {
      if (pendingIds.length === 0) {
        if (tool === 'reflect_line') {
          const hitPt = resolveOrCreatePoint(scene, worldPos, false);
          if (hitPt) {
            setPendingIds([hitPt.pointId]);
            audioService.play('select');
          }
          return;
        }
        const hitLine = hitTestObject(scene, worldPos, worldTolerance * 1.4, [
          'line',
          'segment',
          'ray',
        ]);
        if (hitLine) {
          setPendingIds([hitLine.id]);
          audioService.play('select');
        }
        return;
      }

      if (tool === 'reflect_line') {
        const hitLine = hitTestObject(scene, worldPos, worldTolerance * 1.4, [
          'line',
          'segment',
          'ray',
        ]);
        if (hitLine) {
          const next = addGeoObject(scene, {
            kind: 'point',
            rule: 'reflection_line',
            parents: [pendingIds[0], hitLine.id],
            tool,
            style: { color: '#7C3AED' },
          }).scene;
          audioService.play('draw');
          commitScene(next, true);
          setPendingIds([]);
        }
        return;
      }

      const res = resolveOrCreatePoint(scene, worldPos, true);
      if (!res) return;
      const spec =
        tool === 'perpendicular'
          ? { kind: 'line' as const, rule: 'perpendicular_line' as const, color: '#0284C7' }
          : tool === 'parallel'
          ? { kind: 'line' as const, rule: 'parallel_line' as const, color: '#0284C7' }
          : { kind: 'point' as const, rule: 'projection_point' as const, color: '#D97706' };

      const next = addGeoObject(res.scene, {
        kind: spec.kind,
        rule: spec.rule,
        parents: [pendingIds[0], res.pointId],
        tool,
        style: { color: spec.color },
      }).scene;
      audioService.play('draw');
      commitScene(next, true);
      setPendingIds([]);
      return;
    }

    // Tangent: Circle + Point
    if (tool === 'tangent') {
      if (pendingIds.length === 0) {
        const hitCircle = hitTestObject(scene, worldPos, worldTolerance * 1.5, ['circle']);
        if (hitCircle) {
          setPendingIds([hitCircle.id]);
          audioService.play('select');
        }
        return;
      }
      const res = resolveOrCreatePoint(scene, worldPos, true);
      if (!res) return;
      let next = addGeoObject(res.scene, {
        kind: 'line',
        rule: 'tangent_line',
        parents: [pendingIds[0], res.pointId],
        params: { branch: 0 },
        tool,
        style: { color: '#0F766E' },
      }).scene;
      const t2 = addGeoObject(next, {
        kind: 'line',
        rule: 'tangent_line',
        parents: [pendingIds[0], res.pointId],
        params: { branch: 1 },
        tool,
        costL: 0,
        costE: 0,
        style: { color: '#0F766E' },
        skipLog: true,
      });
      if (t2.scene.objects[t2.id]?.valid) {
        next = t2.scene;
      }
      audioService.play('draw');
      commitScene(next, true);
      setPendingIds([]);
      return;
    }

    // 3-point tools: compass, arc, angle_bisector, median, altitude, translate, triangle, incircle, circumcircle, measure_angle
    if (
      tool === 'compass' ||
      tool === 'arc' ||
      tool === 'angle_bisector' ||
      tool === 'median' ||
      tool === 'altitude' ||
      tool === 'translate' ||
      tool === 'triangle' ||
      tool === 'incircle' ||
      tool === 'circumcircle' ||
      tool === 'measure_angle'
    ) {
      const res = resolveOrCreatePoint(scene, worldPos, true);
      if (!res) return;
      if (pendingIds.length < 2) {
        if (res.created) commitScene(res.scene, true);
        setPendingIds([...pendingIds, res.pointId]);
        audioService.play('select');
        return;
      }
      const [p1, p2] = pendingIds;
      const p3 = res.pointId;
      let next = res.scene;

      if (tool === 'compass') {
        next = addGeoObject(next, {
          kind: 'circle',
          rule: 'circle_compass',
          parents: [p1, p2, p3],
          tool,
          style: { color: '#0284C7' },
        }).scene;
      } else if (tool === 'arc') {
        next = addGeoObject(next, {
          kind: 'arc',
          rule: 'arc_three_points',
          parents: [p1, p2, p3],
          tool,
          style: { color: '#0284C7' },
        }).scene;
      } else if (tool === 'angle_bisector') {
        next = addGeoObject(next, {
          kind: 'line',
          rule: 'angle_bisector',
          parents: [p1, p2, p3],
          tool,
          style: { color: '#7C3AED' },
        }).scene;
      } else if (tool === 'median') {
        const mid = addGeoObject(next, {
          kind: 'point',
          rule: 'midpoint',
          parents: [p2, p3],
          tool: 'midpoint',
          costL: 1,
          costE: 3,
          style: { color: '#D97706' },
        });
        next = addGeoObject(mid.scene, {
          kind: 'segment',
          rule: 'segment_two_points',
          parents: [p1, mid.id],
          tool: 'median',
          costL: 1,
          costE: 1,
          style: { color: '#0F766E' },
        }).scene;
      } else if (tool === 'altitude') {
        const base = addGeoObject(next, {
          kind: 'line',
          rule: 'line_two_points',
          parents: [p2, p3],
          costL: 0,
          costE: 0,
          style: { isAuxiliary: true, visible: false },
          skipLog: true,
        });
        next = addGeoObject(base.scene, {
          kind: 'line',
          rule: 'perpendicular_line',
          parents: [base.id, p1],
          tool,
          style: { color: '#0284C7' },
        }).scene;
      } else if (tool === 'translate') {
        next = addGeoObject(next, {
          kind: 'point',
          rule: 'translation',
          parents: [p1, p2, p3],
          tool,
          style: { color: '#7C3AED' },
        }).scene;
      } else if (tool === 'triangle') {
        next = addGeoObject(next, {
          kind: 'polygon',
          rule: 'polygon_vertices',
          parents: [p1, p2, p3],
          tool,
          style: { color: '#0F766E', fillColor: '#0F766E', fillOpacity: 0.12 },
        }).scene;
      } else if (tool === 'incircle') {
        next = addGeoObject(next, {
          kind: 'circle',
          rule: 'incircle',
          parents: [p1, p2, p3],
          tool,
          style: { color: '#D97706' },
        }).scene;
      } else if (tool === 'circumcircle') {
        next = addGeoObject(next, {
          kind: 'circle',
          rule: 'circumcircle',
          parents: [p1, p2, p3],
          tool,
          style: { color: '#0284C7' },
        }).scene;
      } else if (tool === 'measure_angle') {
        next = addGeoObject(next, {
          kind: 'angle_measure',
          rule: 'angle_measure',
          parents: [p1, p2, p3],
          tool,
          style: { color: '#7C3AED' },
        }).scene;
      }

      audioService.play('draw');
      commitScene(next, true);
      setPendingIds([]);
      return;
    }

    // Quadrilateral (4 points)
    if (tool === 'quadrilateral') {
      const res = resolveOrCreatePoint(scene, worldPos, true);
      if (!res) return;
      if (pendingIds.length < 3) {
        if (res.created) commitScene(res.scene, true);
        setPendingIds([...pendingIds, res.pointId]);
        audioService.play('select');
        return;
      }
      const next = addGeoObject(res.scene, {
        kind: 'polygon',
        rule: 'polygon_vertices',
        parents: [...pendingIds, res.pointId],
        tool,
        style: { color: '#0F766E', fillColor: '#0F766E', fillOpacity: 0.12 },
      }).scene;
      audioService.play('draw');
      commitScene(next, true);
      setPendingIds([]);
      return;
    }

    // Polyline & Polygon
    if (tool === 'polyline' || tool === 'polygon') {
      const res = resolveOrCreatePoint(scene, worldPos, true);
      if (!res) return;
      if (tool === 'polygon' && pendingIds.length >= 3 && res.pointId === pendingIds[0]) {
        const next = addGeoObject(res.scene, {
          kind: 'polygon',
          rule: 'polygon_vertices',
          parents: pendingIds,
          tool,
          style: { color: '#0F766E', fillColor: '#0F766E', fillOpacity: 0.12 },
        }).scene;
        audioService.play('draw');
        commitScene(next, true);
        setPendingIds([]);
        return;
      }
      if (tool === 'polyline' && pendingIds.length >= 1) {
        if (res.pointId === pendingIds[pendingIds.length - 1]) {
          setPendingIds([]);
          return;
        }
        const prevId = pendingIds[pendingIds.length - 1];
        const next = addGeoObject(res.scene, {
          kind: 'segment',
          rule: 'segment_two_points',
          parents: [prevId, res.pointId],
          tool: 'polyline',
          style: { color: '#0F766E' },
        }).scene;
        audioService.play('draw');
        commitScene(next, true);
        setPendingIds([...pendingIds, res.pointId]);
        return;
      }
      if (res.created) commitScene(res.scene, true);
      setPendingIds([...pendingIds, res.pointId]);
      audioService.play('select');
      return;
    }

    // Measure area: click polygon to highlight its measurements
    if (tool === 'measure_area') {
      const hitPoly = hitTestObject(scene, worldPos, worldTolerance * 1.5, ['polygon']);
      if (hitPoly) {
        onSelectObject?.(hitPoly.id);
        audioService.play('select');
      }
    }
  };

  // Pointer handlers
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (e.button === 1 || activeTool === 'pan') {
      dragRef.current = {
        mode: 'pan',
        startClient: { x: e.clientX, y: e.clientY },
        startView: { ...view },
      };
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
      return;
    }

    const worldPos = screenToWorld(e.clientX, e.clientY);

    // Check if dragging a free or point_on_object point in select mode or interactiveDragOnly mode
    if (activeTool === 'select' || interactiveDragOnly) {
      const hitPt = hitTestObject(scene, worldPos, worldTolerance * 1.2, ['point']);
      if (
        hitPt &&
        hitPt.kind === 'point' &&
        (hitPt.rule === 'free_point' || hitPt.rule === 'point_on_object')
      ) {
        dragRef.current = { mode: 'point', pointId: hitPt.id, moved: false };
        onSelectObject?.(hitPt.id);
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
        return;
      }

      // If empty canvas in select/drag-only mode, allow smooth panning
      const hitAny = hitTestObject(scene, worldPos, worldTolerance);
      if (!hitAny) {
        dragRef.current = {
          mode: 'pan',
          startClient: { x: e.clientX, y: e.clientY },
          startView: { ...view },
        };
        (e.currentTarget as Element).setPointerCapture(e.pointerId);
        onSelectObject?.(null);
        return;
      }
    }

    handleCanvasClick(worldPos);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (drag.mode === 'pan') {
      const dx = (e.clientX - drag.startClient.x) / drag.startView.scale;
      const dy = (e.clientY - drag.startClient.y) / drag.startView.scale;
      setView({
        ...drag.startView,
        cx: drag.startView.cx - dx,
        cy: drag.startView.cy - dy,
      });
      return;
    }

    if (drag.mode === 'point') {
      const worldPos = screenToWorld(e.clientX, e.clientY);
      drag.moved = true;
      const movedScene = moveFreePoint(scene, drag.pointId, worldPos);
      commitScene(movedScene, false);
      return;
    }

    if (drag.mode === 'label') {
      const dx = e.clientX - drag.startClient.x;
      const dy = e.clientY - drag.startClient.y;
      const next = cloneScene(scene);
      const obj = next.objects[drag.objectId];
      if (obj) {
        obj.style.labelOffset = {
          x: drag.startOffset.x + dx,
          y: drag.startOffset.y + dy,
        };
        commitScene(next, false);
      }
      return;
    }

    const worldPos = screenToWorld(e.clientX, e.clientY);
    setHoverWorld(worldPos);
    if (!readOnly && !interactiveDragOnly && activeTool !== 'pan') {
      setSnapPreview(findSnapTarget(scene, worldPos, worldTolerance, false));
    } else {
      setSnapPreview(null);
    }
  };

  const handlePointerUp = () => {
    dragRef.current = { mode: 'none' };
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const nextScale = Math.max(0.28, Math.min(5, view.scale * factor));
    const worldBefore = screenToWorld(e.clientX, e.clientY);
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    const nextCx = worldBefore.x - (sx - canvasSize.width / 2) / nextScale;
    const nextCy = worldBefore.y - (sy - canvasSize.height / 2) / nextScale;
    setView({ cx: nextCx, cy: nextCy, scale: nextScale });
  };

  const toggleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      void el.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      void document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  // World bounds of current viewport
  const viewBounds = useMemo(() => {
    const halfW = canvasSize.width / 2 / view.scale;
    const halfH = canvasSize.height / 2 / view.scale;
    return {
      minX: view.cx - halfW,
      maxX: view.cx + halfW,
      minY: view.cy - halfH,
      maxY: view.cy + halfH,
    };
  }, [view, canvasSize]);

  // Grid lines
  const gridStep = useMemo(() => {
    const raw = 50 / view.scale;
    const pow = Math.pow(10, Math.floor(Math.log10(Math.max(1, raw))));
    const candidates = [pow, pow * 2, pow * 5, pow * 10];
    return candidates.find((c) => c * view.scale >= 34) ?? 40;
  }, [view.scale]);

  const gridLines = useMemo(() => {
    if (!showGrid) return { xs: [] as number[], ys: [] as number[] };
    const xs: number[] = [];
    const ys: number[] = [];
    const startX = Math.floor(viewBounds.minX / gridStep) * gridStep;
    for (let x = startX; x <= viewBounds.maxX; x += gridStep) xs.push(x);
    const startY = Math.floor(viewBounds.minY / gridStep) * gridStep;
    for (let y = startY; y <= viewBounds.maxY; y += gridStep) ys.push(y);
    return { xs, ys };
  }, [showGrid, viewBounds, gridStep]);

  const orderedObjects = useMemo(
    () =>
      scene.order
        .map((id) => scene.objects[id])
        .filter((o): o is GeoObject => Boolean(o && o.valid && o.style.visible)),
    [scene]
  );

  // Layer ordering: polygons -> circles/arcs -> lines/segments/rays -> measures -> points
  const polygons = orderedObjects.filter((o) => o.kind === 'polygon');
  const curves = orderedObjects.filter((o) => o.kind === 'circle' || o.kind === 'arc');
  const lines = orderedObjects.filter(
    (o) => o.kind === 'line' || o.kind === 'segment' || o.kind === 'ray'
  );
  const measures = orderedObjects.filter(
    (o) => o.kind === 'angle_measure' || o.kind === 'length_measure'
  );
  const points = orderedObjects.filter((o) => o.kind === 'point') as GeoPoint[];

  // Compute virtual ruler & compass ghost visuals
  const previewPos = snapPreview?.pos ?? hoverWorld;
  const firstPendingObj = pendingIds[0] ? scene.objects[pendingIds[0]] : null;
  const secondPendingObj = pendingIds[1] ? scene.objects[pendingIds[1]] : null;

  const toolInfo = TOOL_CATALOG[activeTool];
  const stepPrompt =
    toolInfo.promptSteps[Math.min(pendingIds.length, toolInfo.promptSteps.length - 1)] ?? '';

  const bgClass = canvasDark ? 'bg-[#0F172A]' : 'bg-[#FAFCFF]';
  const gridStroke = canvasDark ? 'rgba(148,163,184,0.12)' : 'rgba(15,118,110,0.09)';
  const axisStroke = canvasDark ? 'rgba(148,163,184,0.42)' : 'rgba(23,32,51,0.28)';
  const labelFill = canvasDark ? '#F1F5F9' : '#0F172A';
  const labelHalo = canvasDark ? '#0F172A' : '#FFFFFF';

  const renderVirtualToolsOverlay = () => {
    if (inputMode !== 'virtual_tools' || readOnly || interactiveDragOnly || !previewPos) return null;

    // Virtual Straightedge when using ruler tools with 1 point picked
    if (
      (activeTool === 'line' || activeTool === 'segment' || activeTool === 'ray') &&
      firstPendingObj?.kind === 'point'
    ) {
      const a = worldToScreen(firstPendingObj);
      const b = worldToScreen(previewPos);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
      const len = Math.max(220, Math.hypot(dx, dy) + 120);
      const midX = (a.x + b.x) / 2;
      const midY = (a.y + b.y) / 2;

      return (
        <g transform={`translate(${midX}, ${midY}) rotate(${angleDeg})`} pointerEvents="none" opacity="0.88">
          <rect
            x={-len / 2}
            y={2}
            width={len}
            height={28}
            rx={4}
            fill={canvasDark ? '#1E293B' : '#FEF3C7'}
            stroke="#D97706"
            strokeWidth={1.6}
            fillOpacity={0.82}
          />
          <line x1={-len / 2 + 6} y1={2} x2={len / 2 - 6} y2={2} stroke="#B45309" strokeWidth={2} />
          <text
            x={0}
            y={20}
            textAnchor="middle"
            fontSize="10"
            fontWeight="600"
            fill={canvasDark ? '#FDE68A' : '#92400E'}
          >
            THƯỚC THẲNG KHÔNG CHIA ĐỘ
          </text>
        </g>
      );
    }

    // Virtual Drafting Compass when using circle_cp or compass
    if (
      (activeTool === 'circle_cp' && firstPendingObj?.kind === 'point') ||
      (activeTool === 'compass' &&
        firstPendingObj?.kind === 'point' &&
        secondPendingObj?.kind === 'point')
    ) {
      const centerWorld: Vec2 =
        activeTool === 'circle_cp' ? firstPendingObj : previewPos;
      const tipWorld: Vec2 =
        activeTool === 'circle_cp'
          ? previewPos
          : {
              x:
                previewPos.x +
                (secondPendingObj?.kind === 'point'
                  ? dist(firstPendingObj, secondPendingObj)
                  : 40),
              y: previewPos.y,
            };
      const c = worldToScreen(centerWorld);
      const p = worldToScreen(tipWorld);
      const span = Math.max(24, Math.hypot(p.x - c.x, p.y - c.y));
      const midX = (c.x + p.x) / 2;
      const midY = (c.y + p.y) / 2;
      const ux = (p.x - c.x) / span;
      const uy = (p.y - c.y) / span;
      // Hinge elevated perpendicular to radius
      const hingeHeight = Math.max(68, span * 0.85);
      const hingeX = midX - uy * hingeHeight;
      const hingeY = midY + ux * hingeHeight;

      return (
        <g pointerEvents="none" opacity="0.92">
          {/* Needle leg */}
          <line x1={hingeX} y1={hingeY} x2={c.x} y2={c.y} stroke="#475569" strokeWidth={4.5} strokeLinecap="round" />
          <line x1={hingeX} y1={hingeY} x2={c.x} y2={c.y} stroke="#CBD5E1" strokeWidth={1.6} strokeLinecap="round" />
          {/* Pencil leg */}
          <line x1={hingeX} y1={hingeY} x2={p.x} y2={p.y} stroke="#0F766E" strokeWidth={4.5} strokeLinecap="round" />
          <circle cx={p.x} cy={p.y} r={3.5} fill="#0284C7" />
          {/* Hinge crown */}
          <circle cx={hingeX} cy={hingeY} r={8} fill="#D97706" stroke="#FFFFFF" strokeWidth={2} />
          <circle cx={c.x} cy={c.y} r={3} fill="#DC2626" />
        </g>
      );
    }

    return null;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${isFullscreen ? 'h-screen' : heightClass} rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden select-none shadow-sm ${bgClass}`}
    >
      {/* Top-right compact studio view controls */}
      <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-1.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-sm no-print">
        <button
          type="button"
          onClick={() => setView((v) => ({ ...v, scale: Math.min(5, v.scale * 1.2) }))}
          className="p-1.5 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Phóng to"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setView((v) => ({ ...v, scale: Math.max(0.28, v.scale / 1.2) }))}
          className="p-1.5 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Thu nhỏ"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => fitToScene()}
          className="p-1.5 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Vừa màn hình"
        >
          <Scan className="w-4 h-4" />
        </button>
        {!compactToolbar && (
          <>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
            <button
              type="button"
              onClick={() => setShowGrid((v) => !v)}
              className={`p-1.5 rounded-md ${
                showGrid
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Bật/tắt lưới tọa độ"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowAxes((v) => !v)}
              className={`p-1.5 rounded-md ${
                showAxes
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Bật/tắt trục tọa độ Oxy"
            >
              <Axis3d className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowLabels((v) => !v)}
              className={`p-1.5 rounded-md ${
                showLabels
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Hiện/ẩn nhãn điểm"
            >
              <Tag className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowAux((v) => !v)}
              className={`p-1.5 rounded-md ${
                showAux
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Hiện/ẩn nét dựng phụ"
            >
              {showAux ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={() => setCanvasDark((v) => !v)}
              className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Đổi nền bảng vẽ sáng/tối"
            >
              {canvasDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />
            <button
              type="button"
              onClick={() => svgRef.current && exportSvgElementToPngFile(svgRef.current, 'hinh-hoc-smart.png', canvasDark ? '#0F172A' : '#FAFCFF')}
              className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Xuất ảnh PNG"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => svgRef.current && exportSvgElementToSvgFile(svgRef.current, 'hinh-hoc-smart.svg')}
              className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Xuất ảnh vector SVG"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toàn màn hình"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </>
        )}
      </div>

      {/* Status banner (e.g., Fire test running) */}
      {statusBanner && (
        <div className="absolute top-2.5 left-2.5 z-20 rounded-lg bg-amber-500 text-white px-3 py-1.5 text-xs font-semibold shadow-md flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" />
          {statusBanner}
        </div>
      )}

      {/* Main SVG Viewport */}
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        className={`block touch-none ${
          activeTool === 'pan'
            ? 'cursor-grab active:cursor-grabbing'
            : activeTool === 'select' || interactiveDragOnly
            ? 'cursor-default'
            : 'cursor-crosshair'
        }`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => {
          setHoverWorld(null);
          setSnapPreview(null);
        }}
        onWheel={handleWheel}
      >
        {/* Grid */}
        {showGrid && (
          <g pointerEvents="none">
            {gridLines.xs.map((x) => {
              const s = worldToScreen({ x, y: 0 });
              return (
                <line
                  key={`gx_${x}`}
                  x1={s.x}
                  y1={0}
                  x2={s.x}
                  y2={canvasSize.height}
                  stroke={gridStroke}
                  strokeWidth={1}
                />
              );
            })}
            {gridLines.ys.map((y) => {
              const s = worldToScreen({ x: 0, y });
              return (
                <line
                  key={`gy_${y}`}
                  x1={0}
                  y1={s.y}
                  x2={canvasSize.width}
                  y2={s.y}
                  stroke={gridStroke}
                  strokeWidth={1}
                />
              );
            })}
          </g>
        )}

        {/* Coordinate axes */}
        {showAxes && (
          <g pointerEvents="none">
            {(() => {
              const origin = worldToScreen({ x: 0, y: 0 });
              return (
                <>
                  <line
                    x1={0}
                    y1={origin.y}
                    x2={canvasSize.width}
                    y2={origin.y}
                    stroke={axisStroke}
                    strokeWidth={1.5}
                  />
                  <line
                    x1={origin.x}
                    y1={0}
                    x2={origin.x}
                    y2={canvasSize.height}
                    stroke={axisStroke}
                    strokeWidth={1.5}
                  />
                  <text x={canvasSize.width - 18} y={origin.y - 6} fontSize="12" fill={labelFill} opacity={0.65}>
                    x
                  </text>
                  <text x={origin.x + 8} y={16} fontSize="12" fill={labelFill} opacity={0.65}>
                    y
                  </text>
                </>
              );
            })()}
          </g>
        )}

        {/* Polygons */}
        {polygons.map((poly) => {
          if (poly.kind !== 'polygon' || poly.vertices.length < 3) return null;
          if (poly.style.isAuxiliary && !showAux) return null;
          const ptsStr = poly.vertices
            .map((v) => {
              const s = worldToScreen(v);
              return `${s.x},${s.y}`;
            })
            .join(' ');
          const isSel = poly.id === selectedObjectId;
          const center = poly.vertices.reduce(
            (acc, v) => ({ x: acc.x + v.x / poly.vertices.length, y: acc.y + v.y / poly.vertices.length }),
            { x: 0, y: 0 }
          );
          const sc = worldToScreen(center);
          return (
            <g key={poly.id}>
              <polygon
                points={ptsStr}
                fill={poly.style.fillColor ?? poly.style.color}
                fillOpacity={poly.style.fillOpacity ?? 0.12}
                stroke={isSel ? '#F59E0B' : poly.style.color}
                strokeWidth={isSel ? poly.style.strokeWidth + 1.2 : poly.style.strokeWidth}
                strokeDasharray={getStrokeDashArray(poly.style.dash)}
              />
              {isSel && (
                <text
                  x={sc.x}
                  y={sc.y}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill={labelFill}
                  stroke={labelHalo}
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  S ≈ {(poly.area / 100).toFixed(2)} · P ≈ {(poly.perimeter / 10).toFixed(2)}
                </text>
              )}
            </g>
          );
        })}

        {/* Circles & Arcs */}
        {curves.map((obj) => {
          if (obj.style.isAuxiliary && !showAux) return null;
          const isSel = obj.id === selectedObjectId || pendingIds.includes(obj.id);
          if (obj.kind === 'circle') {
            const c = worldToScreen(obj.center);
            const r = obj.radius * view.scale;
            if (!Number.isFinite(r) || r <= 0 || r > 25000) return null;
            return (
              <circle
                key={obj.id}
                cx={c.x}
                cy={c.y}
                r={r}
                fill="none"
                stroke={isSel ? '#F59E0B' : obj.style.color}
                strokeWidth={isSel ? obj.style.strokeWidth + 1.1 : obj.style.strokeWidth}
                strokeDasharray={getStrokeDashArray(obj.style.dash)}
                opacity={obj.style.isAuxiliary ? 0.68 : 0.95}
              />
            );
          }
          if (obj.kind === 'arc') {
            const c = worldToScreen(obj.center);
            const r = obj.radius * view.scale;
            const x1 = c.x + r * Math.cos(obj.startAngle);
            const y1 = c.y + r * Math.sin(obj.startAngle);
            const x2 = c.x + r * Math.cos(obj.endAngle);
            const y2 = c.y + r * Math.sin(obj.endAngle);
            const d = `M ${x1} ${y1} A ${r} ${r} 0 ${obj.largeArc ? 1 : 0} ${obj.sweep ? 1 : 0} ${x2} ${y2}`;
            return (
              <path
                key={obj.id}
                d={d}
                fill="none"
                stroke={isSel ? '#F59E0B' : obj.style.color}
                strokeWidth={isSel ? obj.style.strokeWidth + 1.1 : obj.style.strokeWidth}
                strokeDasharray={getStrokeDashArray(obj.style.dash)}
              />
            );
          }
          return null;
        })}

        {/* Lines, Segments, Rays */}
        {lines.map((obj) => {
          if (obj.kind !== 'line' && obj.kind !== 'segment' && obj.kind !== 'ray') return null;
          if (obj.style.isAuxiliary && !showAux) return null;
          const seg = getLineEndpointsInView(
            obj,
            viewBounds.minX,
            viewBounds.maxX,
            viewBounds.minY,
            viewBounds.maxY
          );
          if (!seg) return null;
          const s1 = worldToScreen({ x: seg.x1, y: seg.y1 });
          const s2 = worldToScreen({ x: seg.x2, y: seg.y2 });
          const isSel = obj.id === selectedObjectId || pendingIds.includes(obj.id);
          return (
            <line
              key={obj.id}
              x1={s1.x}
              y1={s1.y}
              x2={s2.x}
              y2={s2.y}
              stroke={isSel ? '#F59E0B' : obj.style.isGiven && canvasDark ? '#E2E8F0' : obj.style.color}
              strokeWidth={isSel ? obj.style.strokeWidth + 1.2 : obj.style.strokeWidth}
              strokeDasharray={getStrokeDashArray(obj.style.dash)}
              strokeLinecap="round"
              opacity={obj.style.isAuxiliary ? 0.65 : 1}
            />
          );
        })}

        {/* Measures (Angles & Lengths) */}
        {measures.map((m) => {
          if (m.kind === 'length_measure') {
            const p1 = worldToScreen(m.p1);
            const p2 = worldToScreen(m.p2);
            const mx = (p1.x + p2.x) / 2;
            const my = (p1.y + p2.y) / 2 - 10;
            return (
              <g key={m.id} pointerEvents="none">
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#7C3AED"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                <text
                  x={mx}
                  y={my}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill="#7C3AED"
                  stroke={labelHalo}
                  strokeWidth={3.5}
                  paintOrder="stroke"
                >
                  {(m.value / 10).toFixed(2)} đv
                </text>
              </g>
            );
          }
          if (m.kind === 'angle_measure') {
            const v = worldToScreen(m.vertex);
            const a = worldToScreen(m.rayA);
            const b = worldToScreen(m.rayB);
            const a1 = Math.atan2(a.y - v.y, a.x - v.x);
            const a2 = Math.atan2(b.y - v.y, b.x - v.x);
            let diff = a2 - a1;
            while (diff <= -Math.PI) diff += 2 * Math.PI;
            while (diff > Math.PI) diff -= 2 * Math.PI;
            const r = 24;
            const sweep = diff >= 0 ? 1 : 0;
            const sx = v.x + r * Math.cos(a1);
            const sy = v.y + r * Math.sin(a1);
            const ex = v.x + r * Math.cos(a1 + diff);
            const ey = v.y + r * Math.sin(a1 + diff);
            const midA = a1 + diff / 2;
            const lx = v.x + (r + 18) * Math.cos(midA);
            const ly = v.y + (r + 18) * Math.sin(midA);
            return (
              <g key={m.id} pointerEvents="none">
                {m.isRight ? (
                  <path
                    d={`M ${v.x + 14 * Math.cos(a1)} ${v.y + 14 * Math.sin(a1)} L ${
                      v.x + 14 * Math.cos(a1) + 14 * Math.cos(a2)
                    } ${v.y + 14 * Math.sin(a1) + 14 * Math.sin(a2)} L ${v.x + 14 * Math.cos(a2)} ${
                      v.y + 14 * Math.sin(a2)
                    }`}
                    fill="none"
                    stroke="#D97706"
                    strokeWidth={2}
                  />
                ) : (
                  <path
                    d={`M ${sx} ${sy} A ${r} ${r} 0 0 ${sweep} ${ex} ${ey}`}
                    fill="#7C3AED"
                    fillOpacity={0.14}
                    stroke="#7C3AED"
                    strokeWidth={1.8}
                  />
                )}
                <text
                  x={lx}
                  y={ly + 4}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="700"
                  fill="#7C3AED"
                  stroke={labelHalo}
                  strokeWidth={3.5}
                  paintOrder="stroke"
                >
                  {m.degrees.toFixed(1)}°
                </text>
              </g>
            );
          }
          return null;
        })}

        {/* Ghost Preview while constructing */}
        {!readOnly && !interactiveDragOnly && previewPos && pendingIds.length > 0 && (
          <g pointerEvents="none" opacity={0.75}>
            {(activeTool === 'line' || activeTool === 'segment' || activeTool === 'ray' || activeTool === 'polyline') &&
              firstPendingObj?.kind === 'point' && (() => {
                const anchorObj =
                  activeTool === 'polyline'
                    ? (scene.objects[pendingIds[pendingIds.length - 1]] as GeoPoint | undefined)
                    : firstPendingObj;
                if (!anchorObj) return null;
                const s1 = worldToScreen(anchorObj);
                const s2 = worldToScreen(previewPos);
                return (
                  <line
                    x1={s1.x}
                    y1={s1.y}
                    x2={s2.x}
                    y2={s2.y}
                    stroke="#0284C7"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                  />
                );
              })()}
            {activeTool === 'circle_cp' && firstPendingObj?.kind === 'point' && (() => {
              const c = worldToScreen(firstPendingObj);
              const p = worldToScreen(previewPos);
              const r = Math.hypot(p.x - c.x, p.y - c.y);
              return (
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={r}
                  fill="none"
                  stroke="#0284C7"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
              );
            })()}
            {activeTool === 'compass' &&
              firstPendingObj?.kind === 'point' &&
              secondPendingObj?.kind === 'point' && (() => {
                const c = worldToScreen(previewPos);
                const r = dist(firstPendingObj, secondPendingObj) * view.scale;
                return (
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={r}
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                  />
                );
              })()}
          </g>
        )}

        {/* Snap indicator ring */}
        {snapPreview && snapPreview.type !== 'free' && !readOnly && !interactiveDragOnly && (
          <g pointerEvents="none">
            {(() => {
              const s = worldToScreen(snapPreview.pos);
              const color =
                snapPreview.type === 'intersection'
                  ? '#F59E0B'
                  : snapPreview.type === 'point'
                  ? '#0F766E'
                  : '#0284C7';
              return (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={10}
                  fill={color}
                  fillOpacity={0.18}
                  stroke={color}
                  strokeWidth={2}
                />
              );
            })()}
          </g>
        )}

        {/* Virtual Straightedge & Compass overlay */}
        {renderVirtualToolsOverlay()}

        {/* Points & Draggable Labels */}
        {points.map((pt) => {
          if (pt.style.isAuxiliary && !showAux) return null;
          const s = worldToScreen(pt);
          const isSel = pt.id === selectedObjectId || pendingIds.includes(pt.id);
          const isDraggable = pt.rule === 'free_point' || pt.rule === 'point_on_object';
          const fill = isSel
            ? '#F59E0B'
            : pt.style.isGiven
            ? '#0F766E'
            : pt.rule === 'intersection'
            ? '#D97706'
            : pt.style.color;

          const offset = pt.style.labelOffset ?? { x: 10, y: -10 };

          const basePtRadius = pt.style.pointSize ?? (isDraggable ? 5.2 : 4.4);
          return (
            <g key={pt.id}>
              {isDraggable && (
                <circle
                  cx={s.x}
                  cy={s.y}
                  r={isSel ? basePtRadius + 5 : basePtRadius + 3.2}
                  fill={fill}
                  fillOpacity={0.16}
                />
              )}
              <circle
                cx={s.x}
                cy={s.y}
                r={isSel ? basePtRadius + 1.2 : basePtRadius}
                fill={fill}
                stroke={canvasDark ? '#0F172A' : '#FFFFFF'}
                strokeWidth={2}
              />
              {showLabels && pt.style.showLabel !== false && pt.label && (
                <text
                  x={s.x + offset.x}
                  y={s.y + offset.y}
                  fontSize="14"
                  fontWeight="700"
                  fill={labelFill}
                  stroke={labelHalo}
                  strokeWidth={3.8}
                  paintOrder="stroke"
                  className="cursor-move select-none"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    dragRef.current = {
                      mode: 'label',
                      objectId: pt.id,
                      startClient: { x: e.clientX, y: e.clientY },
                      startOffset: { ...offset },
                    };
                    (e.currentTarget as Element).setPointerCapture(e.pointerId);
                  }}
                >
                  {pt.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Bottom unobtrusive guidance strip */}
      {!readOnly && !hideBottomGuidance && (
        <div className="absolute bottom-2 left-2.5 right-2.5 z-10 pointer-events-none flex items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 rounded-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200/80 dark:border-slate-700/80 px-3 py-1 text-xs text-slate-700 dark:text-slate-200 shadow-sm max-w-[85%] truncate">
            <span className="font-semibold text-teal-700 dark:text-teal-400">
              {interactiveDragOnly ? 'Hình học động' : toolInfo.name}:
            </span>
            <span className="truncate">
              {interactiveDragOnly
                ? 'Kéo thả các điểm tô viền để quan sát tính bất biến của định lý'
                : stepPrompt}
            </span>
          </div>
          {pendingIds.length > 0 && (
            <button
              type="button"
              onClick={() => setPendingIds([])}
              className="pointer-events-auto rounded-lg bg-slate-800/85 text-white px-2.5 py-1 text-xs font-medium hover:bg-slate-900"
            >
              Hủy bước (Esc)
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Re-export recomputeScene helper for external animated fire-test consumers
export { recomputeScene };
