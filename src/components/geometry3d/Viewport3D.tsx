import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { getWorkingPlaneEquation } from '../../geometry3d/engine3d';
import { isSolidEdgeHidden } from '../../geometry3d/export3d';
import {
  GeometryLabelManager,
  type EdgeObstacle2D,
  type LabelCategory,
  type LabelInput,
  type ResolvedLabel,
} from '../../geometry3d/labelManager';
import {
  add3,
  cross3,
  lerp3,
  norm3,
  normalize3,
  planeBasis,
  scale3,
  sub3,
  v3,
} from '../../geometry3d/math3d';
import type {
  CameraState3D,
  Geo3DPlane,
  Geo3DScene,
  Geo3DSolid,
  Tool3DId,
  TransformPreview3D,
  Vec3,
} from '../../geometry3d/types3d';
import { MathText } from '../math/MathText';
import { detectWebGLSupport } from './WebGLErrorBoundary';

export type CameraViewPreset = 'front' | 'back' | 'left' | 'right' | 'top' | 'iso';

export interface Viewport3DHandle {
  setViewPreset: (preset: CameraViewPreset) => void;
  centerView: () => void;
  focusSelected: (objectId: string | null) => void;
  resetView: () => void;
  capturePng: (transparentBg: boolean) => string | null;
  getCameraState: () => CameraState3D;
}

interface Viewport3DProps {
  scene: Geo3DScene;
  activeTool: Tool3DId;
  selectedId: string | null;
  highlightIds?: string[];
  autoRotate: boolean;
  autoRotateSpeed: number;
  reducedMotion?: boolean;
  presentationMode?: boolean;
  labelFontSize?: number;
  hideAuxLabels?: boolean;
  transformPreview?: TransformPreview3D | null;
  onSelectObject: (id: string | null) => void;
  onObjectClick: (id: string, hitPoint: Vec3) => void;
  onWorkingPlaneClick: (pos: Vec3) => void;
  onPointDrag: (id: string, pos: Vec3) => void;
  onLabelOffsetChange?: (id: string, offset: { dx: number; dy: number }) => void;
  onFallback2D?: () => void;
}

interface LabelDef {
  id: string;
  objectId: string;
  text: string;
  category: LabelCategory;
  color: string;
  isMath?: boolean;
  isAuxiliary?: boolean;
}

// Pre-allocated scratch vectors for zero-GC per-frame projection & auto-rotation
const _projVec = new THREE.Vector3();
const _rotOffset = new THREE.Vector3();

function toThree(v: Vec3): THREE.Vector3 {
  return new THREE.Vector3(v.x, v.y, v.z);
}

function fromThree(v: THREE.Vector3): Vec3 {
  return { x: v.x, y: v.y, z: v.z };
}

function disposeObject3D(root: THREE.Object3D): void {
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    const mat = (mesh as { material?: THREE.Material | THREE.Material[] }).material;
    if (Array.isArray(mat)) {
      mat.forEach((m) => m.dispose());
    } else if (mat) {
      mat.dispose();
    }
  });
}

function computeSceneBounds(scene: Geo3DScene): { center: Vec3; radius: number } {
  const pts: Vec3[] = [];
  for (const id of scene.order) {
    const obj = scene.objects[id];
    if (!obj || !obj.valid || !obj.style.visible) continue;
    if (obj.kind === 'point') pts.push(obj.position);
    else if (obj.kind === 'segment') pts.push(obj.p1, obj.p2);
    else if (obj.kind === 'vector') pts.push(obj.origin, add3(obj.origin, obj.components));
    else if (obj.kind === 'solid') pts.push(...obj.vertices);
    else if (obj.kind === 'polygon' || obj.kind === 'cross_section') pts.push(...obj.vertices);
    else if (obj.kind === 'circle') pts.push(obj.center);
  }
  if (pts.length === 0) return { center: v3(0, 0, 1), radius: 5 };
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (const p of pts) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.z < minZ) minZ = p.z;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
    if (p.z > maxZ) maxZ = p.z;
  }
  const center = v3((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2);
  let maxR = 2.5;
  for (const p of pts) {
    const d = norm3(sub3(p, center));
    if (d > maxR) maxR = d;
  }
  return { center, radius: Math.min(20, Math.max(2.8, maxR)) };
}

function createPolygonBufferGeometry(vertices: Vec3[]): THREE.BufferGeometry | null {
  if (vertices.length < 3) return null;
  const positions: number[] = [];
  for (let i = 1; i < vertices.length - 1; i++) {
    const a = vertices[0];
    const b = vertices[i];
    const c = vertices[i + 1];
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.computeVertexNormals();
  return geo;
}

function createDashedSegment(
  p1: Vec3,
  p2: Vec3,
  color: string,
  dashSize = 0.22,
  gapSize = 0.14
): THREE.Line {
  const geo = new THREE.BufferGeometry().setFromPoints([toThree(p1), toThree(p2)]);
  const mat = new THREE.LineDashedMaterial({
    color,
    dashSize,
    gapSize,
    transparent: true,
    opacity: 0.85,
  });
  const line = new THREE.Line(geo, mat);
  line.computeLineDistances();
  return line;
}

function createSolidSegment(
  p1: Vec3,
  p2: Vec3,
  color: string,
  opacity = 1
): THREE.Line {
  const geo = new THREE.BufferGeometry().setFromPoints([toThree(p1), toThree(p2)]);
  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: opacity < 1,
    opacity,
  });
  return new THREE.Line(geo, mat);
}

const LABEL_HALO_SHADOW =
  '0 0 5px #FFFFFF, 0 0 3px #FFFFFF, 1px 0 0 #FFFFFF, -1px 0 0 #FFFFFF, 0 1px 0 #FFFFFF, 0 -1px 0 #FFFFFF';

export const Viewport3D = forwardRef<Viewport3DHandle, Viewport3DProps>(
  (
    {
      scene,
      activeTool,
      selectedId,
      highlightIds = [],
      autoRotate,
      autoRotateSpeed,
      reducedMotion = false,
      presentationMode = false,
      labelFontSize = 15,
      hideAuxLabels = false,
      transformPreview = null,
      onSelectObject,
      onObjectClick,
      onWorkingPlaneClick,
      onPointDrag,
      onLabelOffsetChange,
      onFallback2D,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [contextLost, setContextLost] = useState(false);
    const [webglSupported] = useState(() => detectWebGLSupport());
    // Structural label metadata ONLY — never updated per-frame during rotation/orbit!
    const [labelDefs, setLabelDefs] = useState<LabelDef[]>([]);
    const [hoverCoord, setHoverCoord] = useState<Vec3 | null>(null);
    const hoverCoordRef = useRef<Vec3 | null>(null);

    // Unified GeometryLabelManager + direct DOM refs for zero-flicker, zero-re-render label transforms
    const labelManagerRef = useRef<GeometryLabelManager>(new GeometryLabelManager());
    const lastLabelSigRef = useRef<string>('');
    const latestResolvedRef = useRef<Map<string, ResolvedLabel>>(new Map());
    const labelElRefs = useRef<Map<string, HTMLDivElement>>(new Map());
    const leaderElRefs = useRef<Map<string, SVGLineElement>>(new Map());

    // Three.js mutable refs
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const threeSceneRef = useRef<THREE.Scene | null>(null);
    const perspCamRef = useRef<THREE.PerspectiveCamera | null>(null);
    const orthoCamRef = useRef<THREE.OrthographicCamera | null>(null);
    const activeCamRef = useRef<THREE.PerspectiveCamera | THREE.OrthographicCamera | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const envTargetRef = useRef<THREE.WebGLRenderTarget | null>(null);

    const helpersGroupRef = useRef<THREE.Group | null>(null);
    const objectsGroupRef = useRef<THREE.Group | null>(null);
    const solidEdgesGroupRef = useRef<THREE.Group | null>(null);
    const previewGroupRef = useRef<THREE.Group | null>(null);

    const isSoftwareGlRef = useRef(false);
    const renderQueuedRef = useRef(false);
    const renderRafRef = useRef<number | null>(null);
    const rafLoopRef = useRef<number | null>(null);
    const softTimerRef = useRef<number | null>(null);
    const suppressControlChangeRef = useRef(false);
    const userInteractingRef = useRef(false);
    const draggingPointIdRef = useRef<string | null>(null);
    const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
    const draggingLabelRef = useRef<{
      objectId: string;
      startX: number;
      startY: number;
      origDx: number;
      origDy: number;
    } | null>(null);

    // Latest props refs for event listeners
    const scenePropRef = useRef(scene);
    scenePropRef.current = scene;
    const activeToolRef = useRef(activeTool);
    activeToolRef.current = activeTool;
    const selectedIdRef = useRef(selectedId);
    selectedIdRef.current = selectedId;
    const highlightIdsRef = useRef(highlightIds);
    highlightIdsRef.current = highlightIds;
    const autoRotateRef = useRef(autoRotate);
    autoRotateRef.current = autoRotate;
    const autoRotateSpeedRef = useRef(autoRotateSpeed);
    autoRotateSpeedRef.current = autoRotateSpeed;
    const reducedMotionRef = useRef(reducedMotion);
    reducedMotionRef.current = reducedMotion;
    const labelFontSizeRef = useRef(labelFontSize);
    labelFontSizeRef.current = labelFontSize;
    const hideAuxLabelsRef = useRef(hideAuxLabels);
    hideAuxLabelsRef.current = hideAuxLabels;

    const getCurrentCameraState = useCallback((): CameraState3D => {
      const cam = activeCamRef.current;
      const ctrl = controlsRef.current;
      if (!cam || !ctrl) return scenePropRef.current.camera;
      const isOrtho = cam instanceof THREE.OrthographicCamera;
      return {
        position: fromThree(cam.position),
        target: fromThree(ctrl.target),
        projection: isOrtho ? 'orthographic' : 'perspective',
        zoom: cam instanceof THREE.OrthographicCamera ? cam.zoom : 1,
      };
    }, []);

    // Rebuild camera-dependent visible/hidden solid edges cleanly
    const rebuildCameraDependentEdges = useCallback(() => {
      const edgeGroup = solidEdgesGroupRef.current;
      if (!edgeGroup) return;
      disposeObject3D(edgeGroup);
      edgeGroup.clear();

      const curScene = scenePropRef.current;
      const camState = getCurrentCameraState();
      const selId = selectedIdRef.current;
      const hiSet = new Set(highlightIdsRef.current);

      for (const id of curScene.order) {
        const obj = curScene.objects[id];
        if (!obj || !obj.valid || obj.style.visible === false || obj.kind !== 'solid') continue;
        const solid = obj as Geo3DSolid;
        if (solid.style.showEdges === false) continue;
        const isSelected = id === selId || hiSet.has(id);
        const visColor = isSelected
          ? '#0284C7'
          : curScene.displayMode === 'sgk'
          ? '#0F172A'
          : solid.style.color || '#0F172A';
        const hidColor = isSelected ? '#38BDF8' : '#64748B';

        for (const edge of solid.edges) {
          if (edge.isDiagonal && !solid.style.showDiagonals) continue;
          if (edge.isAltitude && !solid.style.showAltitude) continue;
          if (edge.isAxis && !solid.style.showAxis) continue;
          const p1 = solid.vertices[edge.a];
          const p2 = solid.vertices[edge.b];
          if (!p1 || !p2) continue;
          const isSpecial = Boolean(edge.isDiagonal || edge.isAltitude || edge.isAxis);
          const hidden =
            !isSpecial &&
            curScene.showHiddenLines &&
            isSolidEdgeHidden(solid, edge.a, edge.b, camState.position);
          const lineColor = edge.isAltitude
            ? '#D97706'
            : edge.isAxis
            ? '#7C3AED'
            : edge.isDiagonal
            ? '#0284C7'
            : hidden
            ? hidColor
            : visColor;
          const line =
            hidden || isSpecial
              ? createDashedSegment(p1, p2, lineColor, 0.22, 0.14)
              : createSolidSegment(p1, p2, lineColor, 1);
          line.renderOrder = hidden || isSpecial ? 1 : 2;
          line.userData = { geoId: id, kind: 'solid' };
          edgeGroup.add(line);
        }
      }
    }, [getCurrentCameraState]);

    // Apply latest resolved label coordinates directly to DOM nodes (zero React re-render)
    const applyResolvedLabelsToDom = useCallback((resolvedMap: Map<string, ResolvedLabel>) => {
      labelElRefs.current.forEach((el, id) => {
        const lbl = resolvedMap.get(id);
        if (!lbl) {
          el.style.visibility = 'hidden';
          return;
        }
        el.style.transform = `translate3d(${lbl.x.toFixed(1)}px, ${lbl.y.toFixed(1)}px, 0) translate(-50%, -50%)`;
        el.style.visibility = 'visible';
      });

      leaderElRefs.current.forEach((lineEl, id) => {
        const lbl = resolvedMap.get(id);
        if (!lbl || !lbl.displaced) {
          lineEl.setAttribute('visibility', 'hidden');
          return;
        }
        lineEl.setAttribute('x1', lbl.anchorX.toFixed(1));
        lineEl.setAttribute('y1', lbl.anchorY.toFixed(1));
        lineEl.setAttribute('x2', lbl.x.toFixed(1));
        lineEl.setAttribute('y2', lbl.y.toFixed(1));
        lineEl.setAttribute('visibility', 'visible');
      });
    }, []);

    // Ensure newly mounted label DOM nodes immediately receive their exact coordinates
    useLayoutEffect(() => {
      applyResolvedLabelsToDom(latestResolvedRef.current);
    }, [labelDefs, applyResolvedLabelsToDom]);

    // Project labels & edges through shared GeometryLabelManager and sync DOM in the same frame
    const updateProjectedLabels = useCallback(
      (dt = 0) => {
        const container = containerRef.current;
        const cam = activeCamRef.current;
        if (!container || !cam) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        if (width < 10 || height < 10) return;

        const curScene = scenePropRef.current;
        if (!curScene.showLabels) {
          latestResolvedRef.current.clear();
          if (lastLabelSigRef.current !== '') {
            lastLabelSigRef.current = '';
            setLabelDefs([]);
          }
          return;
        }

        const projVec = (p: Vec3): { x: number; y: number; visible: boolean } => {
          _projVec.set(p.x, p.y, p.z).project(cam);
          const visible = _projVec.z >= -1.05 && _projVec.z <= 1.05;
          return {
            x: (_projVec.x * 0.5 + 0.5) * width,
            y: (-_projVec.y * 0.5 + 0.5) * height,
            visible,
          };
        };

        const inputs: LabelInput[] = [];
        const edgeObstacles: EdgeObstacle2D[] = [];

        // Axis labels & axis line obstacles when axes are shown
        if (curScene.showAxes || curScene.displayMode === 'oxyz') {
          const spOrigin = projVec(v3(0, 0, 0));
          const axesDefs: Array<{ id: string; text: string; pos: Vec3; color: string }> = [
            { id: '_axis_x', text: 'x', pos: v3(6.4, 0, 0), color: '#DC2626' },
            { id: '_axis_y', text: 'y', pos: v3(0, 6.4, 0), color: '#059669' },
            { id: '_axis_z', text: 'z', pos: v3(0, 0, 6.4), color: '#0284C7' },
          ];
          for (const a of axesDefs) {
            const sp = projVec(a.pos);
            if (sp.visible && spOrigin.visible) {
              edgeObstacles.push({ x1: spOrigin.x, y1: spOrigin.y, x2: sp.x, y2: sp.y });
            }
            if (sp.visible) {
              const dx = sp.x - spOrigin.x;
              const dy = sp.y - spOrigin.y;
              inputs.push({
                id: a.id,
                objectId: a.id,
                text: a.text,
                category: 'axis',
                color: a.color,
                anchorX: sp.x,
                anchorY: sp.y,
                preferredDir: a.id === '_axis_z' ? { x: dx + 14, y: dy - 8 } : { x: dx, y: dy },
                anchorRadius: 8,
              });
            }
          }
          const hasSceneOriginPoint = curScene.order.some((oid) => {
            const o = curScene.objects[oid];
            return (
              o &&
              o.valid &&
              o.style.visible !== false &&
              o.kind === 'point' &&
              o.label === 'O' &&
              norm3(o.position) < 0.25
            );
          });
          if (spOrigin.visible && !hasSceneOriginPoint) {
            inputs.push({
              id: '_axis_o',
              objectId: '_axis_o',
              text: 'O',
              category: 'origin',
              color: '#334155',
              anchorX: spOrigin.x,
              anchorY: spOrigin.y,
              anchorRadius: 9,
            });
          }
        }

        for (const id of curScene.order) {
          const obj = curScene.objects[id];
          if (!obj || !obj.valid || obj.style.visible === false) continue;

          // Collect projected geometric edge obstacles for collision avoidance
          if (obj.kind === 'solid' && obj.style.showEdges !== false) {
            for (const edge of obj.edges) {
              if (edge.isDiagonal && !obj.style.showDiagonals) continue;
              if (edge.isAltitude && !obj.style.showAltitude) continue;
              if (edge.isAxis && !obj.style.showAxis) continue;
              const p1 = obj.vertices[edge.a];
              const p2 = obj.vertices[edge.b];
              if (!p1 || !p2) continue;
              const s1 = projVec(p1);
              const s2 = projVec(p2);
              if (s1.visible && s2.visible) {
                edgeObstacles.push({ x1: s1.x, y1: s1.y, x2: s2.x, y2: s2.y });
              }
            }
          } else if (obj.kind === 'segment') {
            const s1 = projVec(obj.p1);
            const s2 = projVec(obj.p2);
            if (s1.visible && s2.visible) {
              edgeObstacles.push({ x1: s1.x, y1: s1.y, x2: s2.x, y2: s2.y });
            }
          }

          if (hideAuxLabelsRef.current && obj.style.isAuxiliary) continue;

          if (obj.kind === 'point') {
            const sp = projVec(obj.position);
            if (!sp.visible) continue;
            const isOxyz = curScene.displayMode === 'oxyz';
            const coordText = isOxyz
              ? `${obj.label}(${Number(obj.position.x.toFixed(1))}; ${Number(obj.position.y.toFixed(1))}; ${Number(obj.position.z.toFixed(1))})`
              : obj.label;
            inputs.push({
              id: obj.id,
              objectId: obj.id,
              text: coordText,
              category: isOxyz ? 'coord' : obj.label === 'O' ? 'origin' : 'point',
              color: obj.id === selectedIdRef.current ? '#0284C7' : '#0F172A',
              anchorX: sp.x,
              anchorY: sp.y,
              isAuxiliary: obj.style.isAuxiliary,
              userOffset: obj.style.labelOffset,
            });
          } else if (obj.kind === 'solid' && obj.style.showVertices !== false) {
            obj.vertices.forEach((vert, idx) => {
              const lbl = obj.vertexLabels[idx];
              if (!lbl) return;
              const sp = projVec(vert);
              if (!sp.visible) return;
              inputs.push({
                id: `${obj.id}_v_${idx}`,
                objectId: obj.id,
                text: lbl,
                category: 'point',
                color: '#0F172A',
                anchorX: sp.x,
                anchorY: sp.y,
                anchorRadius: 9,
              });
            });
          } else if (obj.kind === 'vector') {
            const mid = add3(obj.origin, scale3(obj.components, 0.55));
            const sp = projVec(mid);
            if (!sp.visible) continue;
            inputs.push({
              id: obj.id,
              objectId: obj.id,
              text: obj.label,
              category: 'vector',
              color: obj.style.color || '#0284C7',
              anchorX: sp.x,
              anchorY: sp.y,
              userOffset: obj.style.labelOffset,
            });
          } else if (obj.kind === 'plane') {
            const { u, v } = planeBasis(obj.normal);
            const hs = obj.style.planeExtent ?? 4.2;
            const corner = add3(obj.anchor, add3(scale3(u, hs * 0.72), scale3(v, hs * 0.72)));
            const sp = projVec(corner);
            if (!sp.visible) continue;
            inputs.push({
              id: obj.id,
              objectId: obj.id,
              text: obj.label,
              category: 'plane',
              color: '#0369A1',
              anchorX: sp.x,
              anchorY: sp.y,
              userOffset: obj.style.labelOffset,
            });
          } else if (obj.kind === 'measurement') {
            const sp = projVec(obj.anchor);
            if (!sp.visible) continue;
            inputs.push({
              id: obj.id,
              objectId: obj.id,
              text: obj.formattedValue,
              category: 'measure',
              color: '#0F766E',
              anchorX: sp.x,
              anchorY: sp.y,
              userOffset: obj.style.labelOffset,
            });
          } else if (obj.kind === 'formula') {
            const sp = projVec(obj.position);
            if (!sp.visible) continue;
            inputs.push({
              id: obj.id,
              objectId: obj.id,
              text: obj.latex,
              category: 'formula',
              isMath: true,
              color: '#0F172A',
              anchorX: sp.x,
              anchorY: sp.y,
              userOffset: obj.style.labelOffset,
            });
          } else if (obj.kind === 'line' && !obj.style.isAuxiliary) {
            const tip = add3(obj.origin, scale3(obj.direction, 3.6));
            const sp = projVec(tip);
            if (!sp.visible) continue;
            inputs.push({
              id: obj.id,
              objectId: obj.id,
              text: obj.label,
              category: 'line',
              color: obj.style.color || '#1E293B',
              anchorX: sp.x,
              anchorY: sp.y,
              userOffset: obj.style.labelOffset,
            });
          }
        }

        const effectiveFont = presentationMode
          ? Math.max(18, labelFontSizeRef.current + 3)
          : Math.max(15, labelFontSizeRef.current);

        const resolved = labelManagerRef.current.update(inputs, {
          width,
          height,
          fontSize: effectiveFont,
          dt,
          edges: edgeObstacles,
          padding: 12,
          compact: false,
        });

        const nextMap = new Map<string, ResolvedLabel>();
        let sig = '';
        for (const item of resolved) {
          nextMap.set(item.id, item);
          sig += `${item.id}|${item.text}|${item.color}|${item.category}|${item.isMath ? 1 : 0};`;
        }
        latestResolvedRef.current = nextMap;

        // Only trigger React reconciliation when structural label metadata changes!
        if (sig !== lastLabelSigRef.current) {
          lastLabelSigRef.current = sig;
          setLabelDefs(
            resolved.map((r) => ({
              id: r.id,
              objectId: r.objectId,
              text: r.text,
              category: r.category,
              color: r.color,
              isMath: r.isMath,
              isAuxiliary: r.isAuxiliary,
            }))
          );
        }

        // Update screen positions directly in the same animation tick
        applyResolvedLabelsToDom(nextMap);
      },
      [presentationMode, applyResolvedLabelsToDom]
    );

    // Synchronous render + synchronized label projection in a single frame
    const renderFrameNow = useCallback(
      (dt = 0) => {
        const renderer = rendererRef.current;
        const tScene = threeSceneRef.current;
        const cam = activeCamRef.current;
        if (!renderer || !tScene || !cam) return;
        rebuildCameraDependentEdges();
        renderer.render(tScene, cam);
        updateProjectedLabels(dt);
      },
      [rebuildCameraDependentEdges, updateProjectedLabels]
    );

    // Coalesced on-demand render
    const requestRender = useCallback(() => {
      if (renderQueuedRef.current) return;
      renderQueuedRef.current = true;
      renderRafRef.current = requestAnimationFrame(() => {
        renderQueuedRef.current = false;
        renderRafRef.current = null;
        renderFrameNow(0.016);
      });
    }, [renderFrameNow]);

    // Rebuild static scene helpers (grid, axes, coordinate planes, working plane)
    const rebuildHelpers = useCallback(() => {
      const grp = helpersGroupRef.current;
      const tScene = threeSceneRef.current;
      if (!grp || !tScene) return;
      disposeObject3D(grp);
      grp.clear();

      const curScene = scenePropRef.current;
      const isSGK = curScene.displayMode === 'sgk';
      const isOxyz = curScene.displayMode === 'oxyz';

      tScene.background = new THREE.Color(isSGK ? '#FFFFFF' : '#F8FAFC');

      // Subtle XY Grid (Z=0)
      if (curScene.showGrid) {
        const grid = new THREE.GridHelper(12, 12, '#CBD5E1', '#E2E8F0');
        grid.rotation.x = Math.PI / 2; // Align grid to Oxy (Z=0)
        const mats = Array.isArray(grid.material) ? grid.material : [grid.material];
        mats.forEach((m) => {
          m.transparent = true;
          m.opacity = isSGK ? 0.35 : 0.6;
        });
        grp.add(grid);
      }

      // Oxyz Coordinate Axes with directional arrowheads
      if (curScene.showAxes || isOxyz) {
        const axisLen = 6;
        const addAxis = (dir: Vec3, color: string) => {
          const neg = scale3(dir, -axisLen * 0.55);
          const pos = scale3(dir, axisLen);
          grp.add(createSolidSegment(neg, pos, color, 0.85));
          const coneGeo = new THREE.ConeGeometry(0.11, 0.36, 12);
          const coneMat = new THREE.MeshBasicMaterial({ color });
          const cone = new THREE.Mesh(coneGeo, coneMat);
          cone.position.copy(toThree(pos));
          const q = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            toThree(dir).normalize()
          );
          cone.quaternion.copy(q);
          grp.add(cone);
        };
        addAxis(v3(1, 0, 0), '#DC2626');
        addAxis(v3(0, 1, 0), '#059669');
        addAxis(v3(0, 0, 1), '#0284C7');
      }

      // Coordinate planes (Oxy, Oxz, Oyz)
      if (curScene.showCoordPlanes || isOxyz) {
        const addCoordPlane = (rotX: number, rotY: number, color: string) => {
          const geo = new THREE.PlaneGeometry(10, 10);
          const mat = new THREE.MeshBasicMaterial({
            color,
            transparent: true,
            opacity: 0.06,
            side: THREE.DoubleSide,
            depthWrite: false,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.rotation.set(rotX, rotY, 0);
          grp.add(mesh);
        };
        addCoordPlane(0, 0, '#0EA5E9'); // Oxy
        addCoordPlane(Math.PI / 2, 0, '#10B981'); // Oxz
        addCoordPlane(0, Math.PI / 2, '#F59E0B'); // Oyz
      }

      // Highlight active working plane gently when a placement tool is active
      if (activeToolRef.current === 'point_free' || curScene.workingPlane.kind !== 'Oxy' || Math.abs(curScene.workingPlane.offset) > 1e-4) {
        const eq = getWorkingPlaneEquation(curScene);
        const geo = new THREE.PlaneGeometry(10, 10);
        const mat = new THREE.MeshBasicMaterial({
          color: '#0D9488',
          transparent: true,
          opacity: 0.08,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        const wpMesh = new THREE.Mesh(geo, mat);
        wpMesh.position.copy(toThree(eq.anchor));
        const q = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          toThree(eq.normal).normalize()
        );
        wpMesh.quaternion.copy(q);
        grp.add(wpMesh);
      }
    }, []);

    // Rebuild all geometric objects in the 3D scene
    const rebuildGeometryObjects = useCallback(() => {
      const grp = objectsGroupRef.current;
      if (!grp) return;
      disposeObject3D(grp);
      grp.clear();

      const curScene = scenePropRef.current;
      const isSGK = curScene.displayMode === 'sgk';
      const isWire = curScene.displayMode === 'wireframe';
      const selId = selectedIdRef.current;
      const hiSet = new Set(highlightIdsRef.current);

      for (const id of curScene.order) {
        const obj = curScene.objects[id];
        if (!obj || !obj.valid || obj.style.visible === false) continue;
        const isSelected = id === selId || hiSet.has(id);
        const baseColor = isSelected ? '#0284C7' : obj.style.color || '#0F766E';

        if (obj.kind === 'point') {
          const radius = isSelected ? 0.145 : obj.style.isGiven ? 0.115 : 0.105;
          const geo = new THREE.SphereGeometry(radius, 18, 16);
          const mat = isSGK
            ? new THREE.MeshBasicMaterial({ color: baseColor })
            : new THREE.MeshStandardMaterial({
                color: baseColor,
                roughness: 0.35,
                metalness: 0.1,
              });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.copy(toThree(obj.position));
          mesh.userData = { geoId: id, kind: 'point' };
          grp.add(mesh);

          // Invisible larger hit sphere for effortless clicking
          const hitGeo = new THREE.SphereGeometry(0.26, 10, 10);
          const hitMat = new THREE.MeshBasicMaterial({ visible: false });
          const hitMesh = new THREE.Mesh(hitGeo, hitMat);
          hitMesh.position.copy(toThree(obj.position));
          hitMesh.userData = { geoId: id, kind: 'point' };
          grp.add(hitMesh);
        } else if (obj.kind === 'segment') {
          const line =
            obj.style.dashed
              ? createDashedSegment(obj.p1, obj.p2, baseColor)
              : createSolidSegment(obj.p1, obj.p2, baseColor);
          line.userData = { geoId: id, kind: 'segment' };
          grp.add(line);

          // Cylinder hitbox for reliable clicking on segments
          const delta = sub3(obj.p2, obj.p1);
          const len = norm3(delta);
          if (len > 1e-4) {
            const hitGeo = new THREE.CylinderGeometry(0.08, 0.08, len, 6);
            const hitMat = new THREE.MeshBasicMaterial({ visible: false });
            const hitMesh = new THREE.Mesh(hitGeo, hitMat);
            const mid = scale3(add3(obj.p1, obj.p2), 0.5);
            hitMesh.position.copy(toThree(mid));
            hitMesh.quaternion.setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              toThree(delta).normalize()
            );
            hitMesh.userData = { geoId: id, kind: 'segment' };
            grp.add(hitMesh);
          }
        } else if (obj.kind === 'line' || obj.kind === 'ray') {
          const tMin = obj.kind === 'ray' ? 0 : -11;
          const tMax = 11;
          const p1 = add3(obj.origin, scale3(obj.direction, tMin));
          const p2 = add3(obj.origin, scale3(obj.direction, tMax));
          const line = obj.style.dashed
            ? createDashedSegment(p1, p2, baseColor)
            : createSolidSegment(p1, p2, baseColor);
          line.userData = { geoId: id, kind: obj.kind };
          grp.add(line);

          const hitGeo = new THREE.CylinderGeometry(0.085, 0.085, tMax - tMin, 6);
          const hitMat = new THREE.MeshBasicMaterial({ visible: false });
          const hitMesh = new THREE.Mesh(hitGeo, hitMat);
          const mid = add3(obj.origin, scale3(obj.direction, (tMin + tMax) * 0.5));
          hitMesh.position.copy(toThree(mid));
          hitMesh.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            toThree(obj.direction).normalize()
          );
          hitMesh.userData = { geoId: id, kind: obj.kind };
          grp.add(hitMesh);
        } else if (obj.kind === 'vector') {
          const len = norm3(obj.components);
          if (len > 1e-4) {
            const end = add3(obj.origin, obj.components);
            const shaftEnd = add3(obj.origin, scale3(obj.components, Math.max(0.1, (len - 0.34) / len)));
            const shaft = createSolidSegment(obj.origin, shaftEnd, baseColor);
            shaft.userData = { geoId: id, kind: 'vector' };
            grp.add(shaft);

            const coneGeo = new THREE.ConeGeometry(0.13, 0.36, 12);
            const coneMat = new THREE.MeshBasicMaterial({ color: baseColor });
            const cone = new THREE.Mesh(coneGeo, coneMat);
            cone.position.copy(toThree(end));
            cone.quaternion.setFromUnitVectors(
              new THREE.Vector3(0, 1, 0),
              toThree(obj.components).normalize()
            );
            cone.userData = { geoId: id, kind: 'vector' };
            grp.add(cone);
          }
        } else if (obj.kind === 'plane') {
          const pl = obj as Geo3DPlane;
          const hs = pl.style.planeExtent ?? 4.2;
          const { u: uAxis, v: vAxis } = planeBasis(pl.normal);
          const c0 = add3(pl.anchor, add3(scale3(uAxis, -hs), scale3(vAxis, -hs)));
          const c1 = add3(pl.anchor, add3(scale3(uAxis, hs), scale3(vAxis, -hs)));
          const c2 = add3(pl.anchor, add3(scale3(uAxis, hs), scale3(vAxis, hs)));
          const c3 = add3(pl.anchor, add3(scale3(uAxis, -hs), scale3(vAxis, hs)));

          const planeGeo = createPolygonBufferGeometry([c0, c1, c2, c3]);
          if (planeGeo) {
            const mat = new THREE.MeshBasicMaterial({
              color: baseColor,
              transparent: true,
              opacity: isSelected ? 0.28 : Math.min(0.24, pl.style.opacity ?? 0.16),
              side: THREE.DoubleSide,
              depthWrite: false,
              polygonOffset: true,
              polygonOffsetFactor: 2,
              polygonOffsetUnits: 2,
            });
            const mesh = new THREE.Mesh(planeGeo, mat);
            mesh.renderOrder = 0;
            mesh.userData = { geoId: id, kind: 'plane' };
            grp.add(mesh);
          }
          // Plane border outline
          const borderPts = [c0, c1, c2, c3, c0].map(toThree);
          const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPts);
          const borderMat = new THREE.LineBasicMaterial({
            color: baseColor,
            transparent: true,
            opacity: isSelected ? 0.95 : 0.6,
          });
          const borderLine = new THREE.Line(borderGeo, borderMat);
          borderLine.renderOrder = 1;
          borderLine.userData = { geoId: id, kind: 'plane' };
          grp.add(borderLine);
        } else if (obj.kind === 'polygon' || obj.kind === 'cross_section') {
          if (obj.vertices.length >= 3) {
            const polyGeo = createPolygonBufferGeometry(obj.vertices);
            if (polyGeo) {
              const mat = new THREE.MeshBasicMaterial({
                color: obj.kind === 'cross_section' ? '#0EA5E9' : baseColor,
                transparent: true,
                opacity: obj.kind === 'cross_section' ? (isSelected ? 0.45 : 0.34) : (obj.style.opacity ?? 0.26),
                side: THREE.DoubleSide,
                depthWrite: false,
                polygonOffset: true,
                polygonOffsetFactor: 1,
                polygonOffsetUnits: 1,
              });
              const mesh = new THREE.Mesh(polyGeo, mat);
              mesh.renderOrder = 0;
              mesh.userData = { geoId: id, kind: obj.kind };
              grp.add(mesh);
            }
            const loop = [...obj.vertices, obj.vertices[0]].map(toThree);
            const edgeGeo = new THREE.BufferGeometry().setFromPoints(loop);
            const edgeMat = new THREE.LineBasicMaterial({
              color: obj.kind === 'cross_section' ? '#0284C7' : baseColor,
            });
            const edgeLine = new THREE.Line(edgeGeo, edgeMat);
            edgeLine.renderOrder = 2;
            edgeLine.userData = { geoId: id, kind: obj.kind };
            grp.add(edgeLine);
          }
        } else if (obj.kind === 'circle') {
          const segs = 64;
          const pts: THREE.Vector3[] = [];
          const n = normalize3(obj.normal) ?? v3(0, 0, 1);
          const refV = Math.abs(n.z) < 0.9 ? v3(0, 0, 1) : v3(1, 0, 0);
          const u = normalize3(cross3(refV, n)) ?? v3(1, 0, 0);
          const v = cross3(n, u);
          for (let i = 0; i <= segs; i++) {
            const a = (i / segs) * Math.PI * 2;
            const p = add3(obj.center, add3(scale3(u, Math.cos(a) * obj.radius), scale3(v, Math.sin(a) * obj.radius)));
            pts.push(toThree(p));
          }
          const cGeo = new THREE.BufferGeometry().setFromPoints(pts);
          const cMat = new THREE.LineBasicMaterial({ color: baseColor });
          const cLine = new THREE.Line(cGeo, cMat);
          cLine.renderOrder = 2;
          cLine.userData = { geoId: id, kind: 'circle' };
          grp.add(cLine);
        } else if (obj.kind === 'solid') {
          const solid = obj as Geo3DSolid;

          // Faces (polygonOffset prevents Z-fighting with edges while keeping full depthTest)
          if (solid.style.showFaces !== false && !isWire) {
            const faceOpacity = isSGK ? Math.min(0.14, solid.style.opacity ?? 0.12) : (solid.style.opacity ?? 0.24);
            const mat = isSGK
              ? new THREE.MeshBasicMaterial({
                  color: baseColor,
                  transparent: true,
                  opacity: faceOpacity,
                  side: THREE.DoubleSide,
                  depthWrite: false,
                  polygonOffset: true,
                  polygonOffsetFactor: 1,
                  polygonOffsetUnits: 1,
                })
              : new THREE.MeshStandardMaterial({
                  color: baseColor,
                  transparent: true,
                  opacity: faceOpacity,
                  roughness: 0.45,
                  metalness: 0.05,
                  side: THREE.DoubleSide,
                  depthWrite: false,
                  polygonOffset: true,
                  polygonOffsetFactor: 1,
                  polygonOffsetUnits: 1,
                });

            const numParam = (k: string, fallback: number) => {
              const val = solid.params?.[k];
              return typeof val === 'number' && Number.isFinite(val) ? val : fallback;
            };

            if (solid.solidType === 'sphere') {
              const r = solid.radius ?? numParam('r', 2);
              const sGeo = new THREE.SphereGeometry(r, 32, 24);
              const mesh = new THREE.Mesh(sGeo, mat);
              mesh.position.copy(toThree(solid.center));
              mesh.userData = { geoId: id, kind: 'solid' };
              grp.add(mesh);
            } else if (solid.solidType === 'hemisphere') {
              const r = solid.radius ?? numParam('r', 2);
              const hGeo = new THREE.SphereGeometry(r, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
              hGeo.rotateX(Math.PI / 2); // Align dome to +Z
              const mesh = new THREE.Mesh(hGeo, mat);
              mesh.position.copy(toThree(solid.center));
              mesh.userData = { geoId: id, kind: 'solid' };
              grp.add(mesh);
            } else if (solid.solidType === 'cylinder' || solid.solidType === 'cone' || solid.solidType === 'cone_frustum') {
              const h = solid.height || numParam('h', 3.5);
              const rBot = solid.radius ?? numParam('r', 1.6);
              const rTop =
                solid.solidType === 'cylinder'
                  ? rBot
                  : solid.solidType === 'cone'
                  ? 0
                  : (solid.radiusTop ?? numParam('rTop', numParam('r2', rBot * 0.5)));
              const cGeo = new THREE.CylinderGeometry(rTop, rBot, h, 36, 1, false);
              cGeo.rotateX(Math.PI / 2);
              const mesh = new THREE.Mesh(cGeo, mat);
              mesh.position.copy(toThree(add3(solid.center, v3(0, 0, h * 0.5))));
              mesh.userData = { geoId: id, kind: 'solid' };
              grp.add(mesh);
            } else {
              for (const face of solid.faces) {
                const faceVerts = face.indices.map((idx) => solid.vertices[idx]).filter(Boolean);
                const fGeo = createPolygonBufferGeometry(faceVerts);
                if (!fGeo) continue;
                const mesh = new THREE.Mesh(fGeo, mat.clone());
                mesh.userData = { geoId: id, kind: 'solid' };
                grp.add(mesh);
              }
            }
          }

          // Vertices of solid
          if (solid.style.showVertices !== false) {
            const vGeo = new THREE.SphereGeometry(0.085, 12, 10);
            const vMat = new THREE.MeshBasicMaterial({ color: isSelected ? '#0284C7' : '#0F766E' });
            solid.vertices.forEach((v) => {
              const m = new THREE.Mesh(vGeo, vMat);
              m.position.copy(toThree(v));
              m.userData = { geoId: id, kind: 'solid' };
              grp.add(m);
            });
          }
        }
      }
    }, []);

    // Rebuild 3D Transformation Interpolation Preview (before -> after with t in [0,1])
    const rebuildTransformPreview = useCallback(() => {
      const grp = previewGroupRef.current;
      if (!grp) return;
      disposeObject3D(grp);
      grp.clear();

      if (!transformPreview) return;
      const t = Math.max(0, Math.min(1, transformPreview.t));
      const originalVertices = transformPreview.originalVertices ?? [];
      const targetVertices = transformPreview.targetVertices ?? [];
      const edges = transformPreview.edges ?? [];
      const faces = transformPreview.faces ?? [];
      if (originalVertices.length === 0 || originalVertices.length !== targetVertices.length) return;

      const currentVerts = originalVertices.map((orig, i) => lerp3(orig, targetVertices[i], t));

      // Ghost target outline
      for (const e of edges) {
        if (targetVertices[e.a] && targetVertices[e.b]) {
          grp.add(createDashedSegment(targetVertices[e.a], targetVertices[e.b], '#A855F7', 0.18, 0.12));
        }
      }

      // Interpolated solid faces & edges
      for (const face of faces) {
        const fv = face.indices.map((idx) => currentVerts[idx]).filter(Boolean);
        const fGeo = createPolygonBufferGeometry(fv);
        if (!fGeo) continue;
        const mat = new THREE.MeshBasicMaterial({
          color: '#7C3AED',
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
          depthWrite: false,
        });
        grp.add(new THREE.Mesh(fGeo, mat));
      }
      for (const e of edges) {
        if (currentVerts[e.a] && currentVerts[e.b]) {
          grp.add(createSolidSegment(currentVerts[e.a], currentVerts[e.b], '#7C3AED', 1));
        }
      }

      // Trajectory lines from original to current
      for (let i = 0; i < Math.min(8, originalVertices.length); i++) {
        grp.add(createDashedSegment(originalVertices[i], currentVerts[i], '#EC4899', 0.12, 0.1));
      }
    }, [transformPreview]);

    // Sync active camera projection (Orthographic in SGK mode or when user toggles Ortho)
    const syncProjectionMode = useCallback(() => {
      const persp = perspCamRef.current;
      const ortho = orthoCamRef.current;
      const ctrl = controlsRef.current;
      const container = containerRef.current;
      if (!persp || !ortho || !ctrl || !container) return;

      const wantOrtho =
        scenePropRef.current.displayMode === 'sgk' ||
        scenePropRef.current.camera.projection === 'orthographic';

      const prevCam = activeCamRef.current;
      const nextCam = wantOrtho ? ortho : persp;

      if (prevCam && prevCam !== nextCam) {
        nextCam.position.copy(prevCam.position);
        nextCam.up.set(0, 0, 1);
        nextCam.lookAt(ctrl.target);
        if (nextCam instanceof THREE.OrthographicCamera) {
          const dist = prevCam.position.distanceTo(ctrl.target);
          const halfH = Math.max(3, dist * 0.42);
          const aspect = container.clientWidth / Math.max(1, container.clientHeight);
          nextCam.left = -halfH * aspect;
          nextCam.right = halfH * aspect;
          nextCam.top = halfH;
          nextCam.bottom = -halfH;
          nextCam.zoom = 1;
          nextCam.updateProjectionMatrix();
        }
        ctrl.object = nextCam;
        ctrl.update();
      }
      activeCamRef.current = nextCam;
    }, []);

    // Initialize WebGLRenderer, Scene, Cameras, Lights, OrbitControls once
    useEffect(() => {
      if (!webglSupported) return;
      const container = containerRef.current;
      if (!container) return;

      const width = Math.max(300, container.clientWidth);
      const height = Math.max(240, container.clientHeight);

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true, // Needed for instant PNG export
        powerPreference: 'high-performance',
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.05;
      rendererRef.current = renderer;

      // Detect software WebGL per Three.js best practices
      try {
        const gl = renderer.getContext();
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        const rendererStr = dbg
          ? String(gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL))
          : String(gl.getParameter(gl.RENDERER));
        isSoftwareGlRef.current = /SwiftShader|llvmpipe|Software|Mesa/i.test(rendererStr);
      } catch {
        isSoftwareGlRef.current = false;
      }

      container.innerHTML = '';
      container.appendChild(renderer.domElement);
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      const tScene = new THREE.Scene();
      tScene.background = new THREE.Color('#FFFFFF');
      threeSceneRef.current = tScene;

      // Studio environment reflections for non-SGK 3D modes
      const pmrem = new THREE.PMREMGenerator(renderer);
      const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
      tScene.environment = envRT.texture;
      envTargetRef.current = envRT;
      pmrem.dispose();

      // Lighting (Z-up)
      const hemi = new THREE.HemisphereLight('#FFFFFF', '#CBD5E1', 1.15);
      hemi.position.set(0, 0, 12);
      tScene.add(hemi);

      const dirLight = new THREE.DirectionalLight('#FFFFFF', 0.95);
      dirLight.position.set(9, 7, 14);
      tScene.add(dirLight);

      const rimLight = new THREE.DirectionalLight('#BAE6FD', 0.45);
      rimLight.position.set(-8, -9, 6);
      tScene.add(rimLight);

      // Groups
      const helpersGroup = new THREE.Group();
      const objectsGroup = new THREE.Group();
      const solidEdgesGroup = new THREE.Group();
      const previewGroup = new THREE.Group();
      tScene.add(helpersGroup, objectsGroup, solidEdgesGroup, previewGroup);
      helpersGroupRef.current = helpersGroup;
      objectsGroupRef.current = objectsGroup;
      solidEdgesGroupRef.current = solidEdgesGroup;
      previewGroupRef.current = previewGroup;

      // Cameras (Z-up to match Vietnamese Oxyz SGK)
      const aspect = width / height;
      const persp = new THREE.PerspectiveCamera(42, aspect, 0.1, 200);
      persp.up.set(0, 0, 1);
      persp.position.copy(toThree(scenePropRef.current.camera.position));

      const halfH = 5.4;
      const ortho = new THREE.OrthographicCamera(-halfH * aspect, halfH * aspect, halfH, -halfH, -100, 200);
      ortho.up.set(0, 0, 1);
      ortho.position.copy(toThree(scenePropRef.current.camera.position));

      perspCamRef.current = persp;
      orthoCamRef.current = ortho;
      const initialOrtho =
        scenePropRef.current.displayMode === 'sgk' ||
        scenePropRef.current.camera.projection === 'orthographic';
      activeCamRef.current = initialOrtho ? ortho : persp;

      const controls = new OrbitControls(activeCamRef.current, renderer.domElement);
      controls.enableDamping = false; // Sharp on-demand response
      controls.target.copy(toThree(scenePropRef.current.camera.target));
      controls.minDistance = 2.2;
      controls.maxDistance = 42;
      controls.update();
      controlsRef.current = controls;

      const onControlChange = () => {
        if (suppressControlChangeRef.current) return;
        requestRender();
      };
      const onControlStart = () => {
        userInteractingRef.current = true;
      };
      const onControlEnd = () => {
        userInteractingRef.current = false;
      };
      controls.addEventListener('change', onControlChange);
      controls.addEventListener('start', onControlStart);
      controls.addEventListener('end', onControlEnd);

      // WebGL context lost / restored handlers
      const handleContextLost = (ev: Event) => {
        ev.preventDefault();
        setContextLost(true);
      };
      const handleContextRestored = () => {
        setContextLost(false);
        rebuildHelpers();
        rebuildGeometryObjects();
        requestRender();
      };
      renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
      renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

      // ResizeObserver for crisp layout transitions (e.g. collapsible sidebars & fullscreen)
      const resizeObserver = new ResizeObserver(() => {
        if (!container || !rendererRef.current) return;
        const w = Math.max(100, container.clientWidth);
        const h = Math.max(100, container.clientHeight);
        const asp = w / h;
        rendererRef.current.setSize(w, h);
        if (perspCamRef.current) {
          perspCamRef.current.aspect = asp;
          perspCamRef.current.updateProjectionMatrix();
        }
        if (orthoCamRef.current) {
          const curHalfH = (orthoCamRef.current.top - orthoCamRef.current.bottom) / 2 || 5.4;
          orthoCamRef.current.left = -curHalfH * asp;
          orthoCamRef.current.right = curHalfH * asp;
          orthoCamRef.current.updateProjectionMatrix();
        }
        requestRender();
      });
      resizeObserver.observe(container);

      // Pointer raycasting for clicking, placing points on working plane, & dragging points
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const getNdc = (ev: PointerEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
      };

      const intersectWorkingPlane = (ev: PointerEvent): Vec3 | null => {
        const cam = activeCamRef.current;
        if (!cam) return null;
        getNdc(ev);
        raycaster.setFromCamera(pointer, cam);
        const eq = getWorkingPlaneEquation(scenePropRef.current);
        const threePlane = new THREE.Plane(toThree(eq.normal), eq.d);
        const target = new THREE.Vector3();
        const hit = raycaster.ray.intersectPlane(threePlane, target);
        if (!hit) return null;
        // Snap lightly to 0.25 grid if close
        const snap = (val: number) => {
          const nearest = Math.round(val * 2) / 2;
          return Math.abs(val - nearest) < 0.14 ? nearest : Number(val.toFixed(2));
        };
        return {
          x: Math.max(-12, Math.min(12, snap(target.x))),
          y: Math.max(-12, Math.min(12, snap(target.y))),
          z: Math.max(-12, Math.min(12, snap(target.z))),
        };
      };

      const pickSceneObject = (ev: PointerEvent): { id: string; hitPoint: Vec3 } | null => {
        const cam = activeCamRef.current;
        const objGrp = objectsGroupRef.current;
        if (!cam || !objGrp) return null;
        getNdc(ev);
        raycaster.setFromCamera(pointer, cam);
        raycaster.params.Line.threshold = 0.18;
        const hits = raycaster.intersectObjects(objGrp.children, true);
        if (hits.length === 0) return null;
        // Prioritize points > segments/lines > polygons/planes/solids
        const priority = (k: string) =>
          k === 'point' ? 0 : k === 'segment' || k === 'line' || k === 'ray' || k === 'vector' ? 1 : k === 'cross_section' ? 2 : 3;
        const validHits = hits
          .filter((h) => h.object.userData?.geoId)
          .sort((a, b) => priority(a.object.userData.kind) - priority(b.object.userData.kind) || a.distance - b.distance);
        if (validHits.length === 0) return null;
        return {
          id: String(validHits[0].object.userData.geoId),
          hitPoint: fromThree(validHits[0].point),
        };
      };

      const onPointerDown = (ev: PointerEvent) => {
        if (ev.button !== 0) return;
        pointerDownPosRef.current = { x: ev.clientX, y: ev.clientY };

        if (activeToolRef.current === 'select') {
          const hit = pickSceneObject(ev);
          if (hit) {
            const obj = scenePropRef.current.objects[hit.id];
            if (
              obj &&
              obj.kind === 'point' &&
              !obj.style.locked &&
              (obj.rule === 'free_point_3d' ||
                obj.rule === 'point_coords' ||
                obj.rule === 'point_on_line' ||
                obj.rule === 'point_on_segment' ||
                obj.rule === 'point_on_plane')
            ) {
              draggingPointIdRef.current = obj.id;
              controls.enabled = false;
            }
          }
        }
      };

      const onPointerMove = (ev: PointerEvent) => {
        if (draggingPointIdRef.current) {
          const pos = intersectWorkingPlane(ev);
          if (pos) {
            onPointDrag(draggingPointIdRef.current, pos);
          }
          return;
        }
        if (activeToolRef.current === 'point_free') {
          const pos = intersectWorkingPlane(ev);
          hoverCoordRef.current = pos;
          setHoverCoord(pos);
        } else if (hoverCoordRef.current !== null) {
          hoverCoordRef.current = null;
          setHoverCoord(null);
        }
      };

      const onPointerUp = (ev: PointerEvent) => {
        if (draggingPointIdRef.current) {
          draggingPointIdRef.current = null;
          controls.enabled = true;
          pointerDownPosRef.current = null;
          return;
        }

        const down = pointerDownPosRef.current;
        pointerDownPosRef.current = null;
        if (!down) return;
        const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y);
        if (moved > 6) return; // Was an orbit drag, not a click

        if (activeToolRef.current === 'pan_orbit') return;

        if (activeToolRef.current === 'point_free') {
          const pos = intersectWorkingPlane(ev);
          if (pos) onWorkingPlaneClick(pos);
          return;
        }

        const hit = pickSceneObject(ev);
        if (hit) {
          if (activeToolRef.current === 'select') {
            onSelectObject(hit.id);
          } else {
            onObjectClick(hit.id, hit.hitPoint);
          }
        } else if (activeToolRef.current === 'select') {
          onSelectObject(null);
        }
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);

      // Initial build & render
      rebuildHelpers();
      rebuildGeometryObjects();
      requestRender();

      return () => {
        resizeObserver.disconnect();
        controls.removeEventListener('change', onControlChange);
        controls.removeEventListener('start', onControlStart);
        controls.removeEventListener('end', onControlEnd);
        controls.dispose();
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
        renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
        if (renderRafRef.current != null) cancelAnimationFrame(renderRafRef.current);
        if (rafLoopRef.current != null) cancelAnimationFrame(rafLoopRef.current);
        if (softTimerRef.current != null) window.clearTimeout(softTimerRef.current);
        disposeObject3D(tScene);
        if (envTargetRef.current) envTargetRef.current.dispose();
        renderer.dispose();
      };
    }, [webglSupported]); // Mount once

    // Re-sync whenever scene, tool, selection, or transform preview changes
    useEffect(() => {
      syncProjectionMode();
      rebuildHelpers();
      rebuildGeometryObjects();
      rebuildTransformPreview();
      requestRender();
    }, [
      scene,
      activeTool,
      selectedId,
      highlightIds,
      transformPreview,
      labelFontSize,
      hideAuxLabels,
      presentationMode,
      syncProjectionMode,
      rebuildHelpers,
      rebuildGeometryObjects,
      rebuildTransformPreview,
      requestRender,
    ]);

    // Single synchronized auto-rotate loop (pauses during user orbit, point drag, label drag, or reducedMotion)
    useEffect(() => {
      if (!autoRotate || reducedMotion) return;
      if (activeTool !== 'select' && activeTool !== 'pan_orbit') return;
      let alive = true;
      let lastTime = 0;

      const scheduleNext = () => {
        if (!alive) return;
        if (isSoftwareGlRef.current) {
          softTimerRef.current = window.setTimeout(() => {
            softTimerRef.current = null;
            if (alive) rafLoopRef.current = requestAnimationFrame(step);
          }, 42);
        } else {
          rafLoopRef.current = requestAnimationFrame(step);
        }
      };

      const step = (now: number) => {
        if (!alive) return;
        if (lastTime === 0) {
          lastTime = now;
          scheduleNext();
          return;
        }
        const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
        lastTime = now;

        const cam = activeCamRef.current;
        const ctrl = controlsRef.current;
        const paused =
          document.hidden ||
          userInteractingRef.current ||
          Boolean(draggingPointIdRef.current) ||
          Boolean(draggingLabelRef.current);

        if (cam && ctrl && !paused && dt > 0) {
          _rotOffset.copy(cam.position).sub(ctrl.target);
          const deltaAngle = dt * 0.45 * autoRotateSpeedRef.current;
          const cosA = Math.cos(deltaAngle);
          const sinA = Math.sin(deltaAngle);
          const nx = _rotOffset.x * cosA - _rotOffset.y * sinA;
          const ny = _rotOffset.x * sinA + _rotOffset.y * cosA;
          _rotOffset.x = nx;
          _rotOffset.y = ny;
          cam.position.copy(ctrl.target).add(_rotOffset);

          suppressControlChangeRef.current = true;
          ctrl.update();
          suppressControlChangeRef.current = false;

          // Render WebGL + project labels in the EXACT same frame (zero double rAF hop!)
          renderFrameNow(dt);
        }

        scheduleNext();
      };

      rafLoopRef.current = requestAnimationFrame(step);
      return () => {
        alive = false;
        if (rafLoopRef.current != null) {
          cancelAnimationFrame(rafLoopRef.current);
          rafLoopRef.current = null;
        }
        if (softTimerRef.current != null) {
          window.clearTimeout(softTimerRef.current);
          softTimerRef.current = null;
        }
      };
    }, [autoRotate, autoRotateSpeed, reducedMotion, activeTool, renderFrameNow]);

    // Imperative handle for toolbar actions
    useImperativeHandle(
      ref,
      () => ({
        setViewPreset: (preset: CameraViewPreset) => {
          const cam = activeCamRef.current;
          const ctrl = controlsRef.current;
          if (!cam || !ctrl) return;
          const { center, radius } = computeSceneBounds(scenePropRef.current);
          const dist = radius * 2.4;
          const offsets: Record<CameraViewPreset, Vec3> = {
            front: v3(0, -dist, 0.2),
            back: v3(0, dist, 0.2),
            left: v3(-dist, 0, 0.2),
            right: v3(dist, 0, 0.2),
            top: v3(0.01, -0.01, dist * 1.15),
            iso: v3(dist * 0.78, dist * 0.68, dist * 0.58),
          };
          ctrl.target.copy(toThree(center));
          cam.position.copy(toThree(add3(center, offsets[preset])));
          cam.up.set(0, 0, 1);
          ctrl.update();
          requestRender();
        },
        centerView: () => {
          const cam = activeCamRef.current;
          const ctrl = controlsRef.current;
          if (!cam || !ctrl) return;
          const { center, radius } = computeSceneBounds(scenePropRef.current);
          const dir = cam.position.clone().sub(ctrl.target);
          if (dir.lengthSq() < 0.01) dir.set(1, 0.85, 0.72);
          dir.normalize().multiplyScalar(radius * 2.45);
          ctrl.target.copy(toThree(center));
          cam.position.copy(toThree(center)).add(dir);
          ctrl.update();
          requestRender();
        },
        focusSelected: (objectId: string | null) => {
          if (!objectId) return;
          const obj = scenePropRef.current.objects[objectId];
          const cam = activeCamRef.current;
          const ctrl = controlsRef.current;
          if (!obj || !obj.valid || !cam || !ctrl) return;
          let targetPt = v3(0, 0, 0);
          if (obj.kind === 'point') targetPt = obj.position;
          else if (obj.kind === 'segment') targetPt = scale3(add3(obj.p1, obj.p2), 0.5);
          else if (obj.kind === 'solid') targetPt = obj.center;
          else if (obj.kind === 'plane') targetPt = obj.anchor;
          else if (obj.kind === 'circle') targetPt = obj.center;
          else if (obj.kind === 'polygon' || obj.kind === 'cross_section') {
            targetPt = obj.vertices[0] ?? v3(0, 0, 0);
          }
          const dir = cam.position.clone().sub(ctrl.target);
          dir.normalize().multiplyScalar(7.5);
          ctrl.target.copy(toThree(targetPt));
          cam.position.copy(toThree(targetPt)).add(dir);
          ctrl.update();
          requestRender();
        },
        resetView: () => {
          const cam = activeCamRef.current;
          const ctrl = controlsRef.current;
          if (!cam || !ctrl) return;
          ctrl.target.set(0, 0, 1);
          cam.position.set(8.5, 7.2, 6.2);
          cam.up.set(0, 0, 1);
          if (cam instanceof THREE.OrthographicCamera) {
            cam.zoom = 1;
            cam.updateProjectionMatrix();
          }
          ctrl.update();
          requestRender();
        },
        capturePng: (transparentBg: boolean) => {
          const renderer = rendererRef.current;
          const tScene = threeSceneRef.current;
          const cam = activeCamRef.current;
          if (!renderer || !tScene || !cam) return null;
          const prevBg = tScene.background;
          if (transparentBg) {
            tScene.background = null;
            renderer.setClearAlpha(0);
          } else {
            tScene.background = new THREE.Color('#FFFFFF');
            renderer.setClearAlpha(1);
          }
          renderer.render(tScene, cam);
          const dataUrl = renderer.domElement.toDataURL('image/png');
          tScene.background = prevBg;
          renderer.setClearAlpha(1);
          renderer.render(tScene, cam);
          return dataUrl;
        },
        getCameraState: () => getCurrentCameraState(),
      }),
      [getCurrentCameraState, requestRender]
    );

    // Label drag handler (moves only label offset, never modifies 3D coordinates)
    useEffect(() => {
      const handleMove = (ev: PointerEvent) => {
        const drag = draggingLabelRef.current;
        if (!drag || !onLabelOffsetChange) return;
        onLabelOffsetChange(drag.objectId, {
          dx: drag.origDx + (ev.clientX - drag.startX),
          dy: drag.origDy + (ev.clientY - drag.startY),
        });
      };
      const handleUp = () => {
        draggingLabelRef.current = null;
      };
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
      return () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };
    }, [onLabelOffsetChange]);

    if (!webglSupported) {
      return (
        <div className="w-full h-full min-h-[380px] rounded-2xl border border-amber-200 bg-amber-50/70 p-6 flex flex-col items-center justify-center text-center gap-3">
          <h3 className="text-lg font-bold text-slate-900">Trình duyệt chưa hỗ trợ WebGL 3D</h3>
          <p className="text-[15px] text-slate-600 max-w-md">
            Bạn vẫn có thể sử dụng đầy đủ không gian Dựng hình phẳng 2D và hệ thống thử thách hình học phẳng.
          </p>
          {onFallback2D && (
            <button
              type="button"
              onClick={onFallback2D}
              className="px-4 py-2.5 rounded-xl bg-teal-700 text-white text-[15px] font-semibold hover:bg-teal-800"
            >
              Chuyển về không gian 2D
            </button>
          )}
        </div>
      );
    }

    const effectiveFont = presentationMode ? Math.max(18, labelFontSize + 3) : Math.max(15, labelFontSize);

    return (
      <div className="relative w-full h-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white select-none">
        {/* WebGL Canvas Container */}
        <div
          ref={containerRef}
          className={`w-full h-full ${
            activeTool === 'point_free'
              ? 'cursor-crosshair'
              : activeTool === 'pan_orbit'
              ? 'cursor-grab'
              : 'cursor-default'
          }`}
        />

        {/* Dedicated Screen-Space Leader Line Layer (updated directly via DOM refs in rAF) */}
        <svg
          className="pointer-events-none absolute inset-0 w-full h-full overflow-hidden z-10"
          data-layer="label-leaders-3d"
        >
          {labelDefs.map((l) => (
            <line
              key={`ldr_${l.id}`}
              ref={(el) => {
                if (el) leaderElRefs.current.set(l.id, el);
                else leaderElRefs.current.delete(l.id);
              }}
              visibility="hidden"
              stroke="#94A3B8"
              strokeWidth="1.15"
              strokeDasharray="3 2"
            />
          ))}
        </svg>

        {/* Dedicated Screen-Space Label Overlay (zero backdrop-filter, zero per-frame React re-render) */}
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden z-10"
          data-layer="labels-3d"
        >
          {labelDefs.map((l) => {
            const isAxisOrVertex =
              l.category === 'axis' ||
              l.category === 'origin' ||
              l.id.includes('_v_');
            const isDraggable =
              !l.objectId.startsWith('_axis_') &&
              !l.id.includes('_v_') &&
              Boolean(onLabelOffsetChange);
            const isPlate =
              l.category === 'coord' ||
              l.category === 'measure' ||
              l.category === 'formula' ||
              l.category === 'plane';
            return (
              <div
                key={l.id}
                ref={(el) => {
                  if (el) labelElRefs.current.set(l.id, el);
                  else labelElRefs.current.delete(l.id);
                }}
                data-label-id={l.id}
                data-label-text={l.text}
                onPointerDown={(ev) => {
                  if (!isDraggable) return;
                  ev.stopPropagation();
                  const obj = scene.objects[l.objectId];
                  const cur = latestResolvedRef.current.get(l.id);
                  const orig = obj?.style.labelOffset ?? {
                    dx: cur ? cur.x - cur.anchorX : 12,
                    dy: cur ? cur.y - cur.anchorY : -12,
                  };
                  draggingLabelRef.current = {
                    objectId: l.objectId,
                    startX: ev.clientX,
                    startY: ev.clientY,
                    origDx: orig.dx,
                    origDy: orig.dy,
                  };
                }}
                style={{
                  left: 0,
                  top: 0,
                  visibility: 'hidden',
                  fontSize: `${effectiveFont}px`,
                  color: l.color,
                  fontStyle: l.category === 'axis' ? 'italic' : 'normal',
                  textShadow: isPlate ? undefined : LABEL_HALO_SHADOW,
                  willChange: 'transform',
                }}
                className={`absolute leading-none font-bold whitespace-nowrap ${
                  isPlate
                    ? 'px-1.5 py-0.5 rounded bg-white/95 border border-slate-200/85 shadow-xs font-semibold'
                    : isAxisOrVertex
                    ? 'px-0.5'
                    : 'px-1 py-0.5 rounded bg-white/85'
                } ${
                  isDraggable ? 'pointer-events-auto cursor-move hover:ring-1 hover:ring-teal-500' : ''
                }`}
                title={isDraggable ? 'Kéo để di chuyển vị trí nhãn mà không làm đổi tọa độ 3D' : undefined}
              >
                {l.isMath ? <MathText text={l.text} /> : l.text}
              </div>
            );
          })}
        </div>

        {/* Live coordinate readout when placing free point */}
        {hoverCoord && activeTool === 'point_free' && (
          <div className="pointer-events-none absolute bottom-3 left-3 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-sm font-medium text-slate-700">
            Mặt phẳng {scene.workingPlane.kind}
            {scene.workingPlane.offset !== 0 ? ` (${scene.workingPlane.offset > 0 ? '+' : ''}${scene.workingPlane.offset})` : ''}:{' '}
            <span className="font-mono font-semibold text-teal-700">
              ({hoverCoord.x}; {hoverCoord.y}; {hoverCoord.z})
            </span>
          </div>
        )}

        {/* WebGL context lost recovery banner */}
        {contextLost && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center gap-3 z-20">
            <h4 className="text-lg font-bold text-slate-900">Ngữ cảnh đồ họa 3D tạm gián đoạn</h4>
            <p className="text-[15px] text-slate-600 max-w-md">
              Hệ thống đang chờ khôi phục WebGL. Bạn có thể chuyển tạm sang chế độ 2D hoặc tải lại trang nếu khung 3D không tự phục hồi.
            </p>
            {onFallback2D && (
              <button
                type="button"
                onClick={onFallback2D}
                className="px-4 py-2 rounded-xl bg-teal-700 text-white text-[15px] font-semibold"
              >
                Chuyển về 2D
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

Viewport3D.displayName = 'Viewport3D';
