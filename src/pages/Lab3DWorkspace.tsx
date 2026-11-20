import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  Download,
  Eye,
  EyeOff,
  FileJson,
  FolderPlus,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  ListOrdered,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Presentation,
  Redo2,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import {
  addGeo3DObject,
  cloneScene3D,
  createEmptyScene3D,
  deleteGeo3DObjectWithDependents,
  movePoint3D,
  recomputeScene3D,
  updateGeo3DObject,
} from '../geometry3d/engine3d';
import {
  exportScene3DToVectorSvg,
  parseScene3DFromJson,
  serializeScene3DToJson,
} from '../geometry3d/export3d';
import {
  add3,
  analyzeLineLineRelation,
  analyzeLinePlaneRelation,
  analyzePlanePlaneRelation,
  cross3,
  dot3,
  fmtNum,
  normalize3,
  reflectPointAcrossPlane,
  reflectPointAcrossPoint,
  rotatePointAroundAxis,
  scale3,
  sub3,
  v3,
} from '../geometry3d/math3d';
import { SOLID_CATALOG, getTool3DDef } from '../geometry3d/tools3d';
import type {
  DisplayMode3D,
  Geo3DCrossSection,
  Geo3DObject,
  Geo3DRule,
  Geo3DScene,
  Geo3DSolid,
  Solid3DType,
  Tool3DId,
  TransformPreview3D,
  Vec3,
} from '../geometry3d/types3d';
import { MathFormulaEditor } from '../components/math/MathFormulaEditor';
import { MathText } from '../components/math/MathText';
import {
  type CameraViewPreset,
  Viewport3D,
  type Viewport3DHandle,
} from '../components/geometry3d/Viewport3D';
import { VerticalToolSidebar3D } from '../components/geometry3d/VerticalToolSidebar3D';
import { WebGLErrorBoundary } from '../components/geometry3d/WebGLErrorBoundary';
import { SmartInstructionBar } from '../components/geometry/SmartInstructionBar';
import { useApp } from '../store/AppContext';

interface Lab3DWorkspaceProps {
  initialScene?: Geo3DScene | null;
  initialTitle?: string | null;
  onFallback2D?: () => void;
  onOpenTemplates?: () => void;
  onOpenGuide?: () => void;
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function getNextLabel(scene: Geo3DScene, prefix: 'point' | 'line' | 'plane' | 'vec' | 'solid'): string {
  const used = new Set(Object.values(scene.objects).map((o) => o.label));
  if (prefix === 'point') {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (const ch of letters) {
      if (!used.has(ch)) return ch;
    }
    for (let i = 1; i < 99; i++) {
      if (!used.has(`M_${i}`)) return `M_${i}`;
    }
  }
  if (prefix === 'line') {
    for (const name of ['d', 'd1', 'd2', 'a', 'b', 'c', 'm', 'n']) {
      if (!used.has(name)) return name;
    }
    return `d_${scene.order.length + 1}`;
  }
  if (prefix === 'plane') {
    for (const name of ['(P)', '(Q)', '(R)', '(α)', '(β)', '(γ)']) {
      if (!used.has(name)) return name;
    }
    return `(P_${scene.order.length + 1})`;
  }
  if (prefix === 'vec') {
    for (const name of ['u', 'v', 'n', 'a', 'b']) {
      if (!used.has(name)) return name;
    }
    return `v_${scene.order.length + 1}`;
  }
  return `Khối ${scene.order.length + 1}`;
}

export const Lab3DWorkspace: React.FC<Lab3DWorkspaceProps> = ({
  initialScene,
  initialTitle,
  onFallback2D,
  onOpenTemplates,
  onOpenGuide,
}) => {
  const { settings, saveDrawing3D, logStudyEvent } = useApp();
  const viewportRef = useRef<Viewport3DHandle | null>(null);
  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const rightResizeRef = useRef<{ x: number; w: number } | null>(null);

  const [scene, setScene] = useState<Geo3DScene>(() =>
    initialScene ? cloneScene3D(initialScene) : createEmptyScene3D()
  );
  const [title, setTitle] = useState<string>(initialTitle || 'Bản vẽ 3D mới');
  const [drawingId, setDrawingId] = useState<string>(() => `d3d_${Date.now()}`);
  const [isDirty, setIsDirty] = useState(false);
  const [confirmNewOpen, setConfirmNewOpen] = useState(false);
  const [undoStack, setUndoStack] = useState<Geo3DScene[]>([]);
  const [redoStack, setRedoStack] = useState<Geo3DScene[]>([]);

  const [activeTool, setActiveTool] = useState<Tool3DId>('select');
  const [pendingRefs, setPendingRefs] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  // Layout panels (4-zone studio)
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightOpen, setRightOpen] = useState(true);
  const [rightWidth, setRightWidth] = useState(308);
  const [rightTab, setRightTab] = useState<'inspector' | 'log' | 'relations'>('inspector');

  // Viewport controls
  const [autoRotate, setAutoRotate] = useState(false);
  const [autoRotateSpeed, setAutoRotateSpeed] = useState<number>(1);
  const [labelFontSize, setLabelFontSize] = useState<number>(15);
  const [hideAuxLabels, setHideAuxLabels] = useState(false);
  const [presentationMode, setPresentationMode] = useState(false);
  const [presentationStepIdx, setPresentationStepIdx] = useState<number | null>(null);
  const [presentationNotes, setPresentationNotes] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Parameter modals
  const [solidPickerOpen, setSolidPickerOpen] = useState(false);
  const [solidTypeToAdd, setSolidTypeToAdd] = useState<Solid3DType>('regular_pyramid');
  const [solidParams, setSolidParams] = useState({ a: 3, b: 2.5, c: 2, h: 3.4, r: 1.8, r2: 0.9 });

  const [oxyzModal, setOxyzModal] = useState<
    null | 'point_coords' | 'vector_coords' | 'line_dir_vector' | 'plane_normal' | 'plane_equation' | 'sphere_equation'
  >(null);
  const [oxyzForm, setOxyzForm] = useState({
    label: '',
    x: '1',
    y: '2',
    z: '3',
    a: '1',
    b: '1',
    c: '1',
    d: '-3',
    r: '2',
  });

  const [formulaModalOpen, setFormulaModalOpen] = useState(false);

  // 3D Transformation interactive panel (Kiến thức mở rộng)
  const [transformModal, setTransformModal] = useState<
    null | 'translation' | 'rotation' | 'point_symmetry' | 'plane_symmetry' | 'homothety' | 'similarity'
  >(null);
  const [transformT, setTransformT] = useState<number>(1);
  const [transformParams, setTransformParams] = useState({
    dx: '2.5',
    dy: '1',
    dz: '0.5',
    angleDeg: '60',
    axis: 'Oz' as 'Ox' | 'Oy' | 'Oz',
    plane: 'Oxy' as 'Oxy' | 'Oxz' | 'Oyz',
    k: '1.5',
  });

  // Relation analyzer pair
  const [relObjA, setRelObjA] = useState<string>('');
  const [relObjB, setRelObjB] = useState<string>('');

  // Sync external initialScene changes
  useEffect(() => {
    if (initialScene) {
      setScene(cloneScene3D(initialScene));
      setUndoStack([]);
      setRedoStack([]);
      setSelectedId(null);
      setPendingRefs([]);
    }
    if (initialTitle) {
      setTitle(initialTitle);
    }
  }, [initialScene, initialTitle]);

  // Listen for fullscreen changes
  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const flashBanner = useCallback((msg: string) => {
    setStatusBanner(msg);
    window.setTimeout(() => {
      setStatusBanner((cur) => (cur === msg ? null : cur));
    }, 3600);
  }, []);

  const commitScene = useCallback((next: Geo3DScene) => {
    setScene((prev) => {
      setUndoStack((u) => [...u.slice(-39), prev]);
      setRedoStack([]);
      return next;
    });
    setIsDirty(true);
  }, []);

  const handleUndo = useCallback(() => {
    setUndoStack((u) => {
      if (u.length === 0) return u;
      const last = u[u.length - 1];
      setScene((cur) => {
        setRedoStack((r) => [...r, cur]);
        return last;
      });
      return u.slice(0, -1);
    });
  }, []);

  const handleRedo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const next = r[r.length - 1];
      setScene((cur) => {
        setUndoStack((u) => [...u, cur]);
        return next;
      });
      return r.slice(0, -1);
    });
  }, []);

  const handleToolSelect = useCallback((toolId: Tool3DId) => {
    setActiveTool(toolId);
    setPendingRefs([]);

    if (toolId === 'solid_library') {
      setSolidPickerOpen(true);
      return;
    }
    if (
      toolId === 'point_coords' ||
      toolId === 'line_dir_vector' ||
      toolId === 'plane_normal' ||
      toolId === 'plane_equation'
    ) {
      setOxyzForm((prev) => ({
        ...prev,
        label:
          toolId === 'point_coords'
            ? getNextLabel(scene, 'point')
            : toolId === 'line_dir_vector'
            ? getNextLabel(scene, 'line')
            : getNextLabel(scene, 'plane'),
      }));
      setOxyzModal(toolId);
      return;
    }
    if (toolId === 'formula_note') {
      setFormulaModalOpen(true);
      return;
    }
    if (toolId === 'transform_3d') {
      setTransformModal('translation');
      setTransformT(1);
      return;
    }
    if (toolId === 'analyze_relation') {
      setRightOpen(true);
      setRightTab('relations');
      return;
    }
  }, [scene]);

  // Placing a free point on the active working plane
  const handleWorkingPlaneClick = useCallback(
    (pos: Vec3) => {
      if (activeTool !== 'point_free') return;
      const lbl = getNextLabel(scene, 'point');
      const res = addGeo3DObject(scene, {
        kind: 'point',
        rule: 'free_point_3d',
        position: pos,
        label: lbl,
      });
      commitScene(res.scene);
      setSelectedId(res.id);
    },
    [activeTool, scene, commitScene]
  );

  // Dragging an existing point
  const handlePointDrag = useCallback((id: string, pos: Vec3) => {
    setScene((prev) => movePoint3D(prev, id, pos));
  }, []);

  // Multi-click geometric construction handler for all interactive 3D tools
  const handleObjectClick = useCallback(
    (clickedId: string, hitPoint: Vec3) => {
      const clicked = scene.objects[clickedId];
      if (!clicked || !clicked.valid) return;
      const refs = [...pendingRefs, clickedId];

      const finish = (res: { scene: Geo3DScene; id: string }, msg?: string) => {
        commitScene(res.scene);
        setSelectedId(res.id);
        setPendingRefs([]);
        const created = res.scene.objects[res.id];
        if (created && !created.valid && created.errorMessage) {
          flashBanner(created.errorMessage);
        } else if (msg) {
          flashBanner(msg);
        }
      };

      const needMore = () => setPendingRefs(refs);

      switch (activeTool) {
        case 'point_on_line':
          if (clicked.kind === 'line' || clicked.kind === 'ray' || clicked.kind === 'segment') {
            finish(
              addGeo3DObject(scene, {
                kind: 'point',
                rule: 'point_on_line',
                parents: [clickedId],
                position: hitPoint,
                label: getNextLabel(scene, 'point'),
              })
            );
          } else flashBanner('Hãy chọn một đường thẳng, tia hoặc đoạn thẳng.');
          break;

        case 'point_on_segment':
          if (clicked.kind === 'segment') {
            finish(
              addGeo3DObject(scene, {
                kind: 'point',
                rule: 'point_on_segment',
                parents: [clickedId],
                position: hitPoint,
                label: getNextLabel(scene, 'point'),
              })
            );
          } else flashBanner('Hãy chọn một đoạn thẳng.');
          break;

        case 'point_on_plane':
          if (clicked.kind === 'plane' || clicked.kind === 'polygon') {
            finish(
              addGeo3DObject(scene, {
                kind: 'point',
                rule: 'point_on_plane',
                parents: [clickedId],
                position: hitPoint,
                label: getNextLabel(scene, 'point'),
              })
            );
          } else flashBanner('Hãy chọn một mặt phẳng hoặc đa giác.');
          break;

        case 'midpoint':
          if (refs.length < 2) {
            if (clicked.kind === 'point') needMore();
            else flashBanner('Chọn lần lượt 2 điểm để dựng trung điểm.');
          } else {
            const p1 = scene.objects[refs[0]];
            const p2 = scene.objects[refs[1]];
            if (p1?.kind === 'point' && p2?.kind === 'point') {
              finish(
                addGeo3DObject(scene, {
                  kind: 'point',
                  rule: 'midpoint_3d',
                  parents: [refs[0], refs[1]],
                  label: getNextLabel(scene, 'point'),
                })
              );
            } else {
              setPendingRefs([]);
              flashBanner('Vui lòng chọn đúng 2 điểm.');
            }
          }
          break;

        case 'segment':
        case 'line':
        case 'ray':
        case 'vector':
          if (refs.length < 2) {
            if (clicked.kind === 'point') needMore();
            else flashBanner('Chọn điểm thứ nhất rồi điểm thứ hai.');
          } else {
            const a = scene.objects[refs[0]];
            const b = scene.objects[refs[1]];
            if (a?.kind === 'point' && b?.kind === 'point') {
              if (activeTool === 'segment') {
                finish(
                  addGeo3DObject(scene, {
                    kind: 'segment',
                    rule: 'segment_3d',
                    parents: [refs[0], refs[1]],
                    label: `${a.label}${b.label}`,
                  })
                );
              } else if (activeTool === 'line') {
                finish(
                  addGeo3DObject(scene, {
                    kind: 'line',
                    rule: 'line_two_points',
                    parents: [refs[0], refs[1]],
                    label: `${a.label}${b.label}`,
                  })
                );
              } else if (activeTool === 'ray') {
                finish(
                  addGeo3DObject(scene, {
                    kind: 'ray',
                    rule: 'ray_3d',
                    parents: [refs[0], refs[1]],
                    label: `${a.label}${b.label}`,
                  })
                );
              } else {
                finish(
                  addGeo3DObject(scene, {
                    kind: 'vector',
                    rule: 'vector_two_points',
                    parents: [refs[0], refs[1]],
                    label: `vt(${a.label}${b.label})`,
                  })
                );
              }
            } else {
              setPendingRefs([]);
              flashBanner('Hãy chọn 2 điểm hợp lệ.');
            }
          }
          break;

        case 'plane_3pts':
          if (clicked.kind !== 'point') {
            flashBanner('Hãy chọn 3 điểm không thẳng hàng.');
            break;
          }
          if (refs.length < 3) needMore();
          else {
            const pts = refs.map((rid) => scene.objects[rid]?.label ?? '').join('');
            finish(
              addGeo3DObject(scene, {
                kind: 'plane',
                rule: 'plane_three_points',
                parents: refs,
                label: `(${pts})`,
              })
            );
          }
          break;

        case 'polygon':
          if (clicked.kind !== 'point') {
            flashBanner('Chọn các điểm đỉnh của đa giác; nhấp lại điểm đầu tiên để khép kín.');
            break;
          }
          if (pendingRefs.length >= 3 && clickedId === pendingRefs[0]) {
            const lbl = pendingRefs.map((rid) => scene.objects[rid]?.label ?? '').join('');
            finish(
              addGeo3DObject(scene, {
                kind: 'polygon',
                rule: 'polygon_3d',
                parents: pendingRefs,
                label: lbl,
              })
            );
          } else if (!pendingRefs.includes(clickedId)) {
            needMore();
          }
          break;

        case 'plane_line_pt':
          if (refs.length < 2) needMore();
          else {
            const o1 = scene.objects[refs[0]];
            const o2 = scene.objects[refs[1]];
            const lineId = o1?.kind === 'line' || o1?.kind === 'segment' ? refs[0] : o2?.kind === 'line' || o2?.kind === 'segment' ? refs[1] : null;
            const ptId = o1?.kind === 'point' ? refs[0] : o2?.kind === 'point' ? refs[1] : null;
            if (lineId && ptId) {
              finish(
                addGeo3DObject(scene, {
                  kind: 'plane',
                  rule: 'plane_line_point',
                  parents: [lineId, ptId],
                  label: getNextLabel(scene, 'plane'),
                })
              );
            } else {
              setPendingRefs([]);
              flashBanner('Hãy chọn 1 đường thẳng (hoặc đoạn thẳng) và 1 điểm ngoài đường thẳng.');
            }
          }
          break;

        case 'plane_2lines_inter':
        case 'plane_2lines_para':
          if (refs.length < 2) needMore();
          else {
            finish(
              addGeo3DObject(scene, {
                kind: 'plane',
                rule: 'plane_two_lines',
                parents: [refs[0], refs[1]],
                label: getNextLabel(scene, 'plane'),
              })
            );
          }
          break;

        case 'intersect_ll':
          if (refs.length < 2) needMore();
          else {
            finish(
              addGeo3DObject(scene, {
                kind: 'point',
                rule: 'intersect_line_line',
                parents: [refs[0], refs[1]],
                label: getNextLabel(scene, 'point'),
              })
            );
          }
          break;

        case 'intersect_lp':
          if (refs.length < 2) needMore();
          else {
            const o1 = scene.objects[refs[0]];
            const o2 = scene.objects[refs[1]];
            const lId = o1?.kind === 'line' || o1?.kind === 'segment' || o1?.kind === 'ray' ? refs[0] : refs[1];
            const pId = o1?.kind === 'plane' || o1?.kind === 'polygon' ? refs[0] : refs[1];
            finish(
              addGeo3DObject(scene, {
                kind: 'point',
                rule: 'intersect_line_plane',
                parents: [lId, pId],
                label: getNextLabel(scene, 'point'),
              })
            );
          }
          break;

        case 'intersect_pp':
          if (refs.length < 2) needMore();
          else {
            finish(
              addGeo3DObject(scene, {
                kind: 'line',
                rule: 'intersect_plane_plane',
                parents: [refs[0], refs[1]],
                label: getNextLabel(scene, 'line'),
              })
            );
          }
          break;

        case 'parallel_line':
          if (refs.length < 2) needMore();
          else {
            const o1 = scene.objects[refs[0]];
            const ptId = o1?.kind === 'point' ? refs[0] : refs[1];
            const lId = o1?.kind === 'point' ? refs[1] : refs[0];
            finish(
              addGeo3DObject(scene, {
                kind: 'line',
                rule: 'line_parallel_point',
                parents: [ptId, lId],
                label: getNextLabel(scene, 'line'),
              })
            );
          }
          break;

        case 'perp_line_plane':
          if (refs.length < 2) needMore();
          else {
            const o1 = scene.objects[refs[0]];
            const ptId = o1?.kind === 'point' ? refs[0] : refs[1];
            const pId = o1?.kind === 'point' ? refs[1] : refs[0];
            finish(
              addGeo3DObject(scene, {
                kind: 'line',
                rule: 'line_perp_plane',
                parents: [ptId, pId],
                label: getNextLabel(scene, 'line'),
              })
            );
          }
          break;

        case 'plane_parallel':
          if (refs.length < 2) needMore();
          else {
            const o1 = scene.objects[refs[0]];
            const ptId = o1?.kind === 'point' ? refs[0] : refs[1];
            const pId = o1?.kind === 'point' ? refs[1] : refs[0];
            finish(
              addGeo3DObject(scene, {
                kind: 'plane',
                rule: 'plane_parallel_point',
                parents: [ptId, pId],
                label: getNextLabel(scene, 'plane'),
              })
            );
          }
          break;

        case 'plane_perp_line':
          if (refs.length < 2) needMore();
          else {
            const o1 = scene.objects[refs[0]];
            const ptId = o1?.kind === 'point' ? refs[0] : refs[1];
            const lId = o1?.kind === 'point' ? refs[1] : refs[0];
            finish(
              addGeo3DObject(scene, {
                kind: 'plane',
                rule: 'plane_perp_line',
                parents: [ptId, lId],
                label: getNextLabel(scene, 'plane'),
              })
            );
          }
          break;

        case 'foot_line':
          if (refs.length < 2) needMore();
          else {
            const o1 = scene.objects[refs[0]];
            const ptId = o1?.kind === 'point' ? refs[0] : refs[1];
            const lId = o1?.kind === 'point' ? refs[1] : refs[0];
            finish(
              addGeo3DObject(scene, {
                kind: 'point',
                rule: 'foot_point_line',
                parents: [ptId, lId],
                label: getNextLabel(scene, 'point'),
              })
            );
          }
          break;

        case 'foot_plane':
          if (refs.length < 2) needMore();
          else {
            const o1 = scene.objects[refs[0]];
            const ptId = o1?.kind === 'point' ? refs[0] : refs[1];
            const pId = o1?.kind === 'point' ? refs[1] : refs[0];
            finish(
              addGeo3DObject(scene, {
                kind: 'point',
                rule: 'foot_point_plane',
                parents: [ptId, pId],
                label: getNextLabel(scene, 'point'),
              })
            );
          }
          break;

        case 'reflect_point':
          if (refs.length < 2) needMore();
          else {
            finish(
              addGeo3DObject(scene, {
                kind: 'point',
                rule: 'reflect_point_point',
                parents: [refs[0], refs[1]],
                label: getNextLabel(scene, 'point'),
              })
            );
          }
          break;

        case 'reflect_plane':
          if (refs.length < 2) needMore();
          else {
            const o1 = scene.objects[refs[0]];
            const ptId = o1?.kind === 'point' ? refs[0] : refs[1];
            const pId = o1?.kind === 'point' ? refs[1] : refs[0];
            finish(
              addGeo3DObject(scene, {
                kind: 'point',
                rule: 'reflect_point_plane',
                parents: [ptId, pId],
                label: getNextLabel(scene, 'point'),
              })
            );
          }
          break;

        case 'common_perp':
          if (refs.length < 2) needMore();
          else {
            finish(
              addGeo3DObject(scene, {
                kind: 'line',
                rule: 'common_perpendicular',
                parents: [refs[0], refs[1]],
                label: getNextLabel(scene, 'line'),
              })
            );
          }
          break;

        case 'cross_section':
          if (refs.length < 2) needMore();
          else {
            const o1 = scene.objects[refs[0]];
            const o2 = scene.objects[refs[1]];
            const solidId = o1?.kind === 'solid' ? refs[0] : o2?.kind === 'solid' ? refs[1] : null;
            const planeId = o1?.kind === 'plane' || o1?.kind === 'polygon' ? refs[0] : o2?.kind === 'plane' || o2?.kind === 'polygon' ? refs[1] : null;
            if (solidId && planeId) {
              finish(
                addGeo3DObject(scene, {
                  kind: 'cross_section',
                  rule: 'cross_section_solid_plane',
                  parents: [solidId, planeId],
                  label: 'Thiết diện',
                }),
                'Đã dựng thiết diện động giữa mặt phẳng và hình khối.'
              );
            } else {
              setPendingRefs([]);
              flashBanner('Hãy chọn 1 hình khối và 1 mặt phẳng cắt.');
            }
          }
          break;

        case 'measure_length':
          if (clicked.kind === 'segment') {
            finish(
              addGeo3DObject(scene, {
                kind: 'measurement',
                rule: 'measure_distance_pp',
                parents: clicked.parents.slice(0, 2),
                label: `|${clicked.label}|`,
                metricKind: 'length',
              })
            );
          } else if (refs.length < 2) needMore();
          else {
            finish(
              addGeo3DObject(scene, {
                kind: 'measurement',
                rule: 'measure_distance_pp',
                parents: [refs[0], refs[1]],
                label: 'Khoảng cách',
                metricKind: 'distance',
              })
            );
          }
          break;

        case 'measure_dihedral':
          if (refs.length < 4) needMore();
          else {
            finish(
              addGeo3DObject(scene, {
                kind: 'measurement',
                rule: 'measure_dihedral_angle',
                parents: [refs[0], refs[1], refs[2], refs[3]],
                label: 'Góc nhị diện',
              })
            );
          }
          break;

        case 'measure_angle_vec':
        case 'measure_angle_ll':
        case 'measure_angle_lp':
        case 'measure_angle_pp':
        case 'measure_dist_pl':
        case 'measure_dist_pplane':
        case 'measure_dist_skew':
        case 'measure_dist_planes': {
          const ruleMap: Record<string, Geo3DRule> = {
            measure_angle_vec: 'measure_angle_vectors',
            measure_angle_ll: 'measure_angle_lines',
            measure_angle_lp: 'measure_angle_line_plane',
            measure_angle_pp: 'measure_angle_planes',
            measure_dist_pl: 'measure_distance_pl',
            measure_dist_pplane: 'measure_distance_pplane',
            measure_dist_skew: 'measure_distance_skew',
            measure_dist_planes: 'measure_distance_planes',
          };
          if (refs.length < 2) needMore();
          else {
            let pA = refs[0];
            let pB = refs[1];
            const o1 = scene.objects[pA];
            if (
              (activeTool === 'measure_dist_pl' || activeTool === 'measure_dist_pplane') &&
              o1?.kind !== 'point'
            ) {
              [pA, pB] = [pB, pA];
            }
            if (activeTool === 'measure_angle_lp' && o1?.kind === 'plane') {
              [pA, pB] = [pB, pA];
            }
            finish(
              addGeo3DObject(scene, {
                kind: 'measurement',
                rule: ruleMap[activeTool],
                parents: [pA, pB],
                label: getTool3DDef(activeTool).name,
              })
            );
          }
          break;
        }

        default:
          setSelectedId(clickedId);
          break;
      }
    },
    [activeTool, pendingRefs, scene, commitScene, flashBanner]
  );

  // Add solid from Solid Library picker
  const handleAddSolid = () => {
    const info = SOLID_CATALOG.find((s) => s.solidType === solidTypeToAdd);
    const res = addGeo3DObject(scene, {
      kind: 'solid',
      rule: (`solid_${solidTypeToAdd}` as Geo3DRule),
      solidType: solidTypeToAdd,
      params: { ...solidParams, rTop: solidParams.r2 },
      center: v3(0, 0, 0),
      label: info?.name ?? getNextLabel(scene, 'solid'),
    });
    commitScene(res.scene);
    setSelectedId(res.id);
    setSolidPickerOpen(false);
    setActiveTool('select');
    flashBanner(`Đã tạo ${info?.name ?? 'hình khối 3D'}.`);
  };

  // Submit Oxyz parameter modal
  const handleOxyzSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const x = Number(oxyzForm.x) || 0;
    const y = Number(oxyzForm.y) || 0;
    const z = Number(oxyzForm.z) || 0;
    const a = Number(oxyzForm.a) || 0;
    const b = Number(oxyzForm.b) || 0;
    const c = Number(oxyzForm.c) || 0;
    const d = Number(oxyzForm.d) || 0;
    const r = Math.max(0.2, Number(oxyzForm.r) || 2);

    if (oxyzModal === 'point_coords') {
      const res = addGeo3DObject(scene, {
        kind: 'point',
        rule: 'point_coords',
        position: v3(x, y, z),
        label: oxyzForm.label.trim() || getNextLabel(scene, 'point'),
      });
      commitScene(res.scene);
      setSelectedId(res.id);
    } else if (oxyzModal === 'vector_coords') {
      const res = addGeo3DObject(scene, {
        kind: 'vector',
        rule: 'vector_coords',
        params: { ox: x, oy: y, oz: z, vx: a, vy: b, vz: c },
        label: oxyzForm.label.trim() || getNextLabel(scene, 'vec'),
      });
      commitScene(res.scene);
      setSelectedId(res.id);
    } else if (oxyzModal === 'line_dir_vector') {
      const res = addGeo3DObject(scene, {
        kind: 'line',
        rule: 'line_point_direction',
        params: { ox: x, oy: y, oz: z, dx: a, dy: b, dz: c },
        label: oxyzForm.label.trim() || getNextLabel(scene, 'line'),
      });
      commitScene(res.scene);
      setSelectedId(res.id);
    } else if (oxyzModal === 'plane_normal') {
      const res = addGeo3DObject(scene, {
        kind: 'plane',
        rule: 'plane_point_normal',
        params: { px: x, py: y, pz: z, nx: a, ny: b, nz: c },
        label: oxyzForm.label.trim() || getNextLabel(scene, 'plane'),
      });
      commitScene(res.scene);
      setSelectedId(res.id);
    } else if (oxyzModal === 'plane_equation') {
      const res = addGeo3DObject(scene, {
        kind: 'plane',
        rule: 'plane_equation',
        params: { a, b, c, d },
        label: oxyzForm.label.trim() || getNextLabel(scene, 'plane'),
      });
      commitScene(res.scene);
      setSelectedId(res.id);
    } else if (oxyzModal === 'sphere_equation') {
      const res = addGeo3DObject(scene, {
        kind: 'solid',
        rule: 'solid_sphere',
        solidType: 'sphere',
        center: v3(x, y, z),
        params: { r },
        label: oxyzForm.label.trim() || 'Mặt cầu (S)',
      });
      commitScene(res.scene);
      setSelectedId(res.id);
    }

    setOxyzModal(null);
    setActiveTool('select');
  };

  // Compute live 3D transformation preview for selected solid (or first solid in scene)
  const targetTransformSolid: Geo3DSolid | null = useMemo(() => {
    if (selectedId && scene.objects[selectedId]?.kind === 'solid') {
      return scene.objects[selectedId] as Geo3DSolid;
    }
    for (const id of scene.order) {
      const obj = scene.objects[id];
      if (obj?.kind === 'solid' && obj.valid) return obj;
    }
    return null;
  }, [scene, selectedId]);

  const transformPreview: TransformPreview3D | null = useMemo(() => {
    if (!transformModal || !targetTransformSolid) return null;
    const orig = targetTransformSolid.vertices;
    const dx = Number(transformParams.dx) || 0;
    const dy = Number(transformParams.dy) || 0;
    const dz = Number(transformParams.dz) || 0;
    const angleDeg = Number(transformParams.angleDeg) || 0;
    const k = Number(transformParams.k) || 1;
    const axisDir =
      transformParams.axis === 'Ox'
        ? v3(1, 0, 0)
        : transformParams.axis === 'Oy'
        ? v3(0, 1, 0)
        : v3(0, 0, 1);
    const planeN =
      transformParams.plane === 'Oxy'
        ? v3(0, 0, 1)
        : transformParams.plane === 'Oxz'
        ? v3(0, 1, 0)
        : v3(1, 0, 0);

    const targetVertices = orig.map((p) => {
      if (transformModal === 'translation') return add3(p, v3(dx, dy, dz));
      if (transformModal === 'rotation') return rotatePointAroundAxis(p, v3(0, 0, 0), axisDir, angleDeg);
      if (transformModal === 'point_symmetry') return reflectPointAcrossPoint(p, v3(0, 0, 0));
      if (transformModal === 'plane_symmetry') return reflectPointAcrossPlane(p, planeN, 0);
      if (transformModal === 'homothety') return scale3(p, k);
      // similarity: scale k then rotate & translate
      return add3(rotatePointAroundAxis(scale3(p, k), v3(0, 0, 0), axisDir, angleDeg), v3(dx, dy, dz));
    });

    return {
      active: true,
      kind: transformModal,
      sourceId: targetTransformSolid.id,
      sourceIds: [targetTransformSolid.id],
      t: transformT,
      originalVertices: orig,
      targetVertices,
      edges: targetTransformSolid.edges,
      faces: targetTransformSolid.faces,
      label: targetTransformSolid.label,
    };
  }, [transformModal, targetTransformSolid, transformParams, transformT]);

  const applyTransformToScene = () => {
    if (!transformPreview || !targetTransformSolid) return;
    let cur = scene;
    const createdPtIds: string[] = [];
    (transformPreview.targetVertices ?? []).forEach((v, idx) => {
      const baseLbl = targetTransformSolid.vertexLabels[idx] || `V${idx + 1}`;
      const res = addGeo3DObject(cur, {
        kind: 'point',
        rule: 'point_coords',
        position: v,
        label: `${baseLbl}'`,
        style: { color: '#7C3AED' },
      });
      cur = res.scene;
      createdPtIds.push(res.id);
    });
    (transformPreview.edges ?? []).forEach((e) => {
      if (e.isDiagonal || e.isAltitude || e.isAxis) return;
      if (createdPtIds[e.a] && createdPtIds[e.b]) {
        cur = addGeo3DObject(cur, {
          kind: 'segment',
          rule: 'segment_3d',
          parents: [createdPtIds[e.a], createdPtIds[e.b]],
          label: `cạnh'`,
          style: { color: '#7C3AED' },
          skipLog: true,
        }).scene;
      }
    });
    commitScene(cur);
    setTransformModal(null);
    setActiveTool('select');
    flashBanner('Đã dựng ảnh biến hình không gian vào bản vẽ.');
  };

  // Save drawing to IndexedDB
  const handleSaveDrawing = useCallback(async () => {
    const now = new Date().toISOString();
    const camState = viewportRef.current?.getCameraState() ?? scene.camera;
    const toSave: Geo3DScene = { ...scene, camera: camState };
    await saveDrawing3D({
      id: drawingId,
      schemaVersion: 1,
      title: title.trim() || 'Bản vẽ 3D mới',
      topic: 'Hình học không gian 3D',
      scene: toSave,
      createdAt: now,
      updatedAt: now,
    });
    setIsDirty(false);
    await logStudyEvent({
      type: 'lab',
      refId: drawingId,
      title: `[3D] ${title.trim() || 'Bản vẽ 3D mới'}`,
      detail: `Lưu bản vẽ 3D (${scene.order.length} đối tượng)`,
    });
    flashBanner('Đã lưu bản vẽ 3D vào thiết bị.');
  }, [drawingId, title, scene, saveDrawing3D, logStudyEvent, flashBanner]);

  const createBlank3DDrawing = () => {
    setScene(createEmptyScene3D());
    setUndoStack([]);
    setRedoStack([]);
    setTitle('Bản vẽ 3D mới');
    setDrawingId(`d3d_${Date.now()}`);
    setSelectedId(null);
    setPendingRefs([]);
    setActiveTool('select');
    setIsDirty(false);
    setConfirmNewOpen(false);
    flashBanner('Đã tạo bản vẽ không gian 3D mới.');
  };

  // Safe keyboard shortcuts in 3D studio (never interfere with text inputs)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key === 'Escape') {
        setActiveTool('select');
        setPendingRefs([]);
        setConfirmNewOpen(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z')
      ) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        void handleSaveDrawing();
      } else if (e.key === 'Delete' && selectedId) {
        e.preventDefault();
        commitScene(deleteGeo3DObjectWithDependents(scene, selectedId));
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo, handleSaveDrawing, selectedId, commitScene, scene]);

  const startRightResize = (e: React.MouseEvent) => {
    e.preventDefault();
    rightResizeRef.current = { x: e.clientX, w: rightWidth };
    const onMove = (ev: MouseEvent) => {
      if (!rightResizeRef.current) return;
      const delta = rightResizeRef.current.x - ev.clientX;
      setRightWidth(Math.max(240, Math.min(380, rightResizeRef.current.w + delta)));
    };
    const onUp = () => {
      rightResizeRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  // Export handlers
  const handleExportPng = (transparent: boolean) => {
    const dataUrl = viewportRef.current?.capturePng(transparent);
    if (!dataUrl) {
      flashBanner('Không thể xuất ảnh PNG từ khung 3D hiện tại.');
      return;
    }
    const safeName = (title || 'hinh-hoc-3d').replace(/[^\p{L}\p{N}_-]+/gu, '_');
    downloadDataUrl(dataUrl, `${safeName}${transparent ? '_trong_suot' : ''}.png`);
    setExportMenuOpen(false);
    flashBanner(transparent ? 'Đã xuất ảnh PNG nền trong suốt.' : 'Đã xuất ảnh PNG nền trắng.');
  };

  const handleExportSvg = () => {
    const camState = viewportRef.current?.getCameraState() ?? scene.camera;
    const svg = exportScene3DToVectorSvg({ ...scene, camera: camState }, 1080, 720);
    const safeName = (title || 'hinh-hoc-3d').replace(/[^\p{L}\p{N}_-]+/gu, '_');
    downloadBlob(svg, `${safeName}.svg`, 'image/svg+xml;charset=utf-8');
    setExportMenuOpen(false);
    flashBanner('Đã xuất tệp SVG vector chuẩn (không nhúng ảnh bitmap).');
  };

  const handleExportJson = () => {
    const camState = viewportRef.current?.getCameraState() ?? scene.camera;
    const json = serializeScene3DToJson({ ...scene, camera: camState }, title);
    const safeName = (title || 'hinh-hoc-3d').replace(/[^\p{L}\p{N}_-]+/gu, '_');
    downloadBlob(json, `${safeName}.json`, 'application/json;charset=utf-8');
    setExportMenuOpen(false);
    flashBanner('Đã xuất dữ liệu bản dựng 3D dạng JSON.');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseScene3DFromJson(String(reader.result || ''));
      if (!parsed.valid || !parsed.scene) {
        flashBanner(parsed.error || 'Tệp JSON không hợp lệ.');
        return;
      }
      commitScene(parsed.scene);
      if (parsed.title) setTitle(parsed.title);
      flashBanner('Đã nhập thành công bản dựng 3D từ JSON.');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement && workspaceRef.current) {
        await workspaceRef.current.requestFullscreen();
      } else if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      flashBanner('Trình duyệt hạn chế chế độ toàn màn hình trong khung xem trước.');
    }
  };

  const selectedObj: Geo3DObject | null = selectedId ? scene.objects[selectedId] ?? null : null;
  const activeToolDef = getTool3DDef(activeTool);

  // Compute relation analyzer result
  const relationAnalysis = useMemo(() => {
    const oA = relObjA ? scene.objects[relObjA] : null;
    const oB = relObjB ? scene.objects[relObjB] : null;
    if (!oA || !oB || !oA.valid || !oB.valid || oA.id === oB.id) return null;

    const getL = (o: Geo3DObject) => {
      if (o.kind === 'line' || o.kind === 'ray') return { origin: o.origin, direction: o.direction };
      if (o.kind === 'segment') {
        const dir = normalize3(sub3(o.p2, o.p1));
        return dir ? { origin: o.p1, direction: dir } : null;
      }
      return null;
    };
    const getPl = (o: Geo3DObject) => {
      if (o.kind === 'plane') return { normal: o.normal, d: o.d };
      if (o.kind === 'polygon' && o.vertices.length >= 3) {
        const n = normalize3(o.normal);
        return n ? { normal: n, d: -dot3(n, o.vertices[0]) } : null;
      }
      return null;
    };

    const lA = getL(oA), lB = getL(oB);
    const pA = getPl(oA), pB = getPl(oB);

    if (lA && lB) {
      const r = analyzeLineLineRelation(lA.origin, lA.direction, lB.origin, lB.direction);
      const map: Record<string, string> = {
        coincident: 'Hai đường thẳng trùng nhau',
        parallel: 'Hai đường thẳng song song',
        intersecting: 'Hai đường thẳng cắt nhau',
        skew: 'Hai đường thẳng chéo nhau',
      };
      return {
        summary: map[r.relation] + (r.isPerpendicular ? ' (Vuông góc)' : ''),
        angle: `${fmtNum(r.angleDeg, 1)}°`,
        distance: `${fmtNum(r.distance, 3)}`,
      };
    }
    if ((lA && pB) || (pA && lB)) {
      const l = lA ?? lB!;
      const p = pB ?? pA!;
      const r = analyzeLinePlaneRelation(l.origin, l.direction, p.normal, p.d);
      const map: Record<string, string> = {
        contained: 'Đường thẳng nằm trong mặt phẳng',
        parallel: 'Đường thẳng song song với mặt phẳng',
        intersecting: 'Đường thẳng cắt mặt phẳng',
      };
      return {
        summary: map[r.relation] + (r.isPerpendicular ? ' (Vuông góc)' : ''),
        angle: `${fmtNum(r.angleDeg, 1)}°`,
        distance: `${fmtNum(r.distance, 3)}`,
      };
    }
    if (pA && pB) {
      const r = analyzePlanePlaneRelation(pA.normal, pA.d, pB.normal, pB.d);
      const map: Record<string, string> = {
        coincident: 'Hai mặt phẳng trùng nhau',
        parallel: 'Hai mặt phẳng song song',
        intersecting: 'Hai mặt phẳng cắt nhau theo giao tuyến',
      };
      return {
        summary: map[r.relation] + (r.isPerpendicular ? ' (Vuông góc)' : ''),
        angle: `${fmtNum(r.angleDeg, 1)}°`,
        distance: `${fmtNum(r.distance, 3)}`,
      };
    }
    return {
      summary: 'Hãy chọn hai đối tượng thuộc loại đường thẳng / đoạn thẳng / mặt phẳng.',
      angle: '—',
      distance: '—',
    };
  }, [relObjA, relObjB, scene.objects]);

  const highlightIds = useMemo(() => {
    if (presentationMode && presentationStepIdx != null && scene.log[presentationStepIdx]) {
      return [scene.log[presentationStepIdx].objectId];
    }
    return [];
  }, [presentationMode, presentationStepIdx, scene.log]);

  // 2D planar projection of a selected cross-section for Inspector
  const renderCrossSection2DPreview = (cs: Geo3DCrossSection) => {
    if (cs.vertices.length < 3) return null;
    const origin = cs.vertices[0];
    const u = normalize3(sub3(cs.vertices[1], origin));
    if (!u) return null;
    const n = normalize3(cs.planeNormal);
    if (!n) return null;
    const v = cross3(n, u);
    const pts2d = cs.vertices.map((p) => {
      const d = sub3(p, origin);
      return { x: dot3(d, u), y: dot3(d, v) };
    });
    const xs = pts2d.map((p) => p.x);
    const ys = pts2d.map((p) => p.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const span = Math.max(0.5, maxX - minX, maxY - minY);
    const mapPt = (p: { x: number; y: number }) => ({
      x: 20 + ((p.x - minX) / span) * 160,
      y: 110 - ((p.y - minY) / span) * 90,
    });
    const mapped = pts2d.map(mapPt);
    return (
      <div className="rounded-lg border border-sky-200 bg-sky-50/50 p-2.5 space-y-1.5">
        <div className="text-xs font-semibold text-sky-900">Mặt phẳng thiết diện (2D phẳng)</div>
        <svg viewBox="0 0 200 130" className="w-full h-28 bg-white rounded border border-sky-100">
          <polygon
            points={mapped.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
            fill="rgba(14,165,233,0.22)"
            stroke="#0284C7"
            strokeWidth="2"
          />
          {mapped.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#0F766E" />
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div
      ref={workspaceRef}
      className={`flex flex-col bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm ${
        presentationMode || isFullscreen ? 'h-[calc(100vh-20px)]' : 'min-h-[760px] h-[calc(100vh-148px)]'
      }`}
    >
      {/* ZONE 1: TOP TOOLBAR */}
      {!presentationMode ? (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setIsDirty(true);
              }}
              className="w-48 sm:w-56 rounded-lg border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-teal-600 bg-transparent focus:bg-slate-50 dark:focus:bg-slate-800 px-2.5 py-1.5 text-[16px] font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
              aria-label="Tên bản vẽ 3D"
            />
            {onOpenTemplates && (
              <button
                type="button"
                onClick={onOpenTemplates}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Mở thư viện hình mẫu 3D"
              >
                <Layers className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                Mở mẫu
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (isDirty && scene.order.length > 0) setConfirmNewOpen(true);
                else createBlank3DDrawing();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Tạo bản vẽ 3D trống mới"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden xl:inline">Bản vẽ mới</span>
            </button>
            <button
              type="button"
              onClick={() => void handleSaveDrawing()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 min-h-[40px] rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
              title="Lưu bản vẽ vào thiết bị (Ctrl+S)"
            >
              <Save className="w-4 h-4" />
              Lưu bản vẽ
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Nhập tệp JSON bản dựng 3D"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden xl:inline">Nhập</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportJson}
            />

            {/* Export dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setExportMenuOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Download className="w-4 h-4" />
                Xuất
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              {exportMenuOpen && (
                <div className="absolute left-0 top-full mt-1 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg py-1.5 z-30">
                  <button
                    type="button"
                    onClick={() => handleExportPng(false)}
                    className="w-full px-3.5 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4 text-teal-600" />
                    Xuất PNG (nền trắng)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportPng(true)}
                    className="w-full px-3.5 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4 text-sky-600" />
                    Xuất PNG (nền trong suốt)
                  </button>
                  <button
                    type="button"
                    onClick={handleExportSvg}
                    className="w-full px-3.5 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Xuất SVG vector chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={handleExportJson}
                    className="w-full px-3.5 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                  >
                    <FileJson className="w-4 h-4 text-amber-600" />
                    Xuất tệp JSON 3D
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 disabled:opacity-40"
              title="Hoàn tác"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 disabled:opacity-40"
              title="Làm lại"
            >
              <Redo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={!selectedId}
              onClick={() => {
                if (!selectedId) return;
                commitScene(deleteGeo3DObjectWithDependents(scene, selectedId));
                setSelectedId(null);
              }}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-rose-600 hover:bg-rose-50 disabled:opacity-40"
              title="Xóa đối tượng đang chọn"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => viewportRef.current?.centerView()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100"
              title="Căn giữa toàn bộ hình"
            >
              <Crosshair className="w-4 h-4" />
              <span className="hidden lg:inline">Căn giữa</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setRightOpen(true);
                setRightTab('relations');
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-800 text-sm font-medium hover:bg-sky-100"
              title="Kiểm chứng quan hệ hình học"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span className="hidden xl:inline">Kiểm chứng</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPresentationMode(true);
                setPresentationStepIdx(scene.log.length > 0 ? 0 : null);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-teal-200 bg-teal-50 text-teal-800 text-sm font-semibold hover:bg-teal-100"
              title="Chế độ trình chiếu lớp học"
            >
              <Presentation className="w-4 h-4" />
              <span className="hidden lg:inline">Trình chiếu</span>
            </button>
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
              title="Toàn màn hình"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            {onOpenGuide && (
              <button
                type="button"
                onClick={onOpenGuide}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                title="Hướng dẫn thao tác 3D"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Presentation Mode Header */
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <Presentation className="w-5 h-5 text-teal-400" />
            <span className="text-lg font-bold">{title}</span>
            <span className="text-sm text-slate-300 hidden sm:inline">· Chế độ trình chiếu lớp học</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {scene.log.length > 0 && (
              <div className="flex items-center gap-1.5 bg-slate-800 rounded-lg px-2 py-1">
                <button
                  type="button"
                  onClick={() =>
                    setPresentationStepIdx((idx) =>
                      idx == null || idx <= 0 ? 0 : idx - 1
                    )
                  }
                  className="px-2 py-1 rounded hover:bg-slate-700 text-sm"
                >
                  Bước trước
                </button>
                <span className="text-sm font-semibold px-2 text-teal-300">
                  {presentationStepIdx != null ? `Bước ${presentationStepIdx + 1}/${scene.log.length}` : 'Tổng quan'}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPresentationStepIdx((idx) =>
                      idx == null ? 0 : Math.min(scene.log.length - 1, idx + 1)
                    )
                  }
                  className="px-2 py-1 rounded hover:bg-slate-700 text-sm"
                >
                  Bước tiếp
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => setPresentationNotes((v) => !v)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium"
            >
              {presentationNotes ? 'Ẩn chú thích' : 'Hiện chú thích'}
            </button>
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm font-medium"
            >
              {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPresentationMode(false);
                setPresentationStepIdx(null);
              }}
              className="px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-sm font-semibold"
            >
              Thoát trình chiếu
            </button>
          </div>
        </div>
      )}

      {/* Unsaved Changes Inline Confirmation Bar */}
      {confirmNewOpen && !presentationMode && (
        <div className="px-4 py-2.5 bg-amber-50 dark:bg-amber-950/50 border-b border-amber-200 dark:border-amber-800 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="font-medium text-amber-950 dark:text-amber-100">
            Bản vẽ 3D hiện tại có thay đổi chưa lưu. Bạn muốn lưu trước khi tạo bản vẽ trống mới không?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setConfirmNewOpen(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={createBlank3DDrawing}
              className="px-3 py-1.5 rounded-lg border border-rose-300 bg-rose-50 text-rose-700 font-semibold hover:bg-rose-100"
            >
              Không lưu, tạo mới
            </button>
            <button
              type="button"
              onClick={async () => {
                await handleSaveDrawing();
                createBlank3DDrawing();
              }}
              className="px-3 py-1.5 rounded-lg bg-teal-700 text-white font-semibold hover:bg-teal-800"
            >
              Lưu &amp; Tạo mới
            </button>
          </div>
        </div>
      )}

      {/* MAIN 3-COLUMN WORKSPACE BODY */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        {/* ZONE 2: LEFT COLLAPSIBLE 8-GROUP 3D TOOL SIDEBAR */}
        {!presentationMode && (
          <VerticalToolSidebar3D
            activeTool={activeTool}
            onSelectTool={handleToolSelect}
            collapsed={leftCollapsed}
            onToggleCollapse={() => setLeftCollapsed((v) => !v)}
            workingPlaneKind={scene.workingPlane.kind}
            workingPlaneOffset={scene.workingPlane.offset}
            onChangeWorkingPlane={(wp) =>
              setScene((prev) => ({
                ...prev,
                workingPlane: { ...prev.workingPlane, kind: wp },
              }))
            }
            onChangeWorkingPlaneOffset={(offset) =>
              setScene((prev) => ({
                ...prev,
                workingPlane: { ...prev.workingPlane, offset },
              }))
            }
          />
        )}

        {/* ZONE 3: CENTER 3D VIEWPORT */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-100/70 dark:bg-slate-950">
          {/* Smart Single-Line Contextual Guidance Bar */}
          {!presentationMode && (
            <SmartInstructionBar
              toolName={activeToolDef.name}
              instruction={activeToolDef.actionPrompt}
              selectedLabels={pendingRefs.map((rid) => scene.objects[rid]?.label ?? rid)}
              bannerMessage={statusBanner}
              canCancel={activeTool !== 'select' || pendingRefs.length > 0}
              onCancel={() => {
                setActiveTool('select');
                setPendingRefs([]);
              }}
            />
          )}

          <div className="flex-1 flex flex-col min-h-0 p-2.5 gap-2">

          {/* Presentation note banner */}
          {presentationMode && presentationNotes && presentationStepIdx != null && scene.log[presentationStepIdx] && (
            <div className="px-4 py-2.5 rounded-xl bg-white border border-teal-200 text-base text-slate-900 shadow-xs">
              <span className="font-bold text-teal-700 mr-2">Bước {presentationStepIdx + 1}:</span>
              {scene.log[presentationStepIdx].description}
            </div>
          )}

          {/* 3D Viewport Area */}
          <div className="flex-1 min-h-[380px] relative">
            <WebGLErrorBoundary onFallback2D={onFallback2D}>
              <Viewport3D
                ref={viewportRef}
                scene={scene}
                activeTool={activeTool}
                selectedId={selectedId}
                highlightIds={highlightIds}
                autoRotate={autoRotate}
                autoRotateSpeed={autoRotateSpeed}
                reducedMotion={settings.reducedMotion}
                presentationMode={presentationMode}
                labelFontSize={labelFontSize}
                hideAuxLabels={hideAuxLabels}
                transformPreview={transformPreview}
                onSelectObject={setSelectedId}
                onObjectClick={handleObjectClick}
                onWorkingPlaneClick={handleWorkingPlaneClick}
                onPointDrag={handlePointDrag}
                onLabelOffsetChange={(objId, offset) => {
                  setScene((prev) => {
                    const o = prev.objects[objId];
                    if (!o) return prev;
                    return {
                      ...prev,
                      objects: {
                        ...prev.objects,
                        [objId]: {
                          ...o,
                          style: { ...o.style, labelOffset: offset },
                        },
                      },
                    };
                  });
                }}
                onFallback2D={onFallback2D}
              />
            </WebGLErrorBoundary>
          </div>

          {/* Bottom View, Display Mode & Camera Control Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
            {/* 4 Display Modes */}
            <div className="flex flex-wrap items-center gap-1">
              {(
                [
                  { id: 'sgk', label: 'Hình học SGK' },
                  { id: 'solid', label: 'Hình khối 3D' },
                  { id: 'wireframe', label: 'Khung dây' },
                  { id: 'oxyz', label: 'Hệ tọa độ' },
                ] as Array<{ id: DisplayMode3D; label: string }>
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    setScene((prev) => ({
                      ...prev,
                      displayMode: m.id,
                      showAxes: m.id === 'oxyz' ? true : prev.showAxes,
                      showCoordPlanes: m.id === 'oxyz',
                      camera: {
                        ...prev.camera,
                        projection: m.id === 'sgk' ? 'orthographic' : prev.camera.projection,
                      },
                    }))
                  }
                  className={`px-2.5 py-1.5 rounded-lg font-semibold transition-colors ${
                    scene.displayMode === m.id
                      ? 'bg-teal-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* 6 Camera Presets + Projection + Auto-rotate */}
            <div className="flex flex-wrap items-center gap-1">
              {(
                [
                  { id: 'front', label: 'Trước' },
                  { id: 'back', label: 'Sau' },
                  { id: 'left', label: 'Trái' },
                  { id: 'right', label: 'Phải' },
                  { id: 'top', label: 'Trên' },
                  { id: 'iso', label: 'Phối cảnh' },
                ] as Array<{ id: CameraViewPreset; label: string }>
              ).map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => viewportRef.current?.setViewPreset(v.id)}
                  className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                >
                  {v.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => viewportRef.current?.resetView()}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                title="Đặt lại góc nhìn mặc định"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setScene((prev) => ({
                    ...prev,
                    camera: {
                      ...prev.camera,
                      projection:
                        prev.camera.projection === 'orthographic' ? 'perspective' : 'orthographic',
                    },
                  }))
                }
                className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                title="Chuyển phép chiếu song song / phối cảnh"
              >
                {scene.camera.projection === 'orthographic' ? 'Song song' : 'Phối cảnh'}
              </button>
              <button
                type="button"
                onClick={() => setAutoRotate((v) => !v)}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold ${
                  autoRotate
                    ? 'bg-sky-600 text-white'
                    : 'border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                Tự xoay
              </button>
              {autoRotate && (
                <select
                  value={autoRotateSpeed}
                  onChange={(e) => setAutoRotateSpeed(Number(e.target.value))}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-1 text-xs"
                  aria-label="Tốc độ xoay"
                >
                  <option value={0.5}>0.5×</option>
                  <option value={1}>1×</option>
                  <option value={1.6}>1.6×</option>
                </select>
              )}
            </div>

            {/* Display Layer Toggles */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { key: 'showGrid', label: 'Lưới' },
                { key: 'showAxes', label: 'Oxyz' },
                { key: 'showHiddenLines', label: 'Nét khuất' },
                { key: 'showLabels', label: 'Nhãn' },
              ].map((t) => {
                const active = Boolean(scene[t.key as keyof Geo3DScene]);
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() =>
                      setScene((prev) => ({
                        ...prev,
                        [t.key]: !prev[t.key as keyof Geo3DScene],
                      }))
                    }
                    className={`px-2 py-1 rounded-md font-medium ${
                      active
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'bg-slate-100 text-slate-500 border border-transparent'
                    }`}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>
          </div>
        </div>

        {/* ZONE 4: RIGHT COLLAPSIBLE, HIDEABLE, DRAG-RESIZABLE INSPECTOR, LOG & RELATION ANALYZER */}
        {!presentationMode && (
          <div className="relative flex shrink-0">
            {rightOpen && (
              <div
                onMouseDown={startRightResize}
                className="w-1.5 cursor-col-resize hover:bg-teal-500/40 active:bg-teal-600/60 transition-colors shrink-0 border-l border-slate-200 dark:border-slate-800"
                title="Kéo để thay đổi độ rộng bảng"
              />
            )}
            <aside
              style={{ width: rightOpen ? `${rightWidth}px` : '46px' }}
              className={`bg-white dark:bg-slate-900 flex flex-col shrink-0 ${
                rightOpen ? '' : 'border-l border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between px-2.5 py-2 border-b border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setRightOpen((v) => !v)}
                  className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title={rightOpen ? 'Thu gọn bảng thuộc tính' : 'Mở bảng thuộc tính'}
                >
                  {rightOpen ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>
                {rightOpen && (
                  <div className="flex items-center gap-1">
                    {[
                      { id: 'inspector', label: 'Thuộc tính', icon: SlidersHorizontal },
                      { id: 'log', label: 'Nhật ký', icon: ListOrdered },
                      { id: 'relations', label: 'Quan hệ', icon: Layers },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setRightTab(tab.id as typeof rightTab)}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${
                            rightTab === tab.id
                              ? 'bg-teal-700 text-white'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {rightOpen && (
                <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-[14px]">
                  {/* TAB 1: CONTEXT-SENSITIVE INSPECTOR */}
                  {rightTab === 'inspector' && (
                    <>
                      {!selectedObj ? (
                        <div className="space-y-4">
                          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 p-3.5 text-slate-600 dark:text-slate-300">
                            <p className="text-sm leading-relaxed">
                              Chọn một đối tượng trên bảng vẽ để chỉnh sửa thuộc tính.
                            </p>
                          </div>

                        {/* Smart Label settings */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">
                            Quản lý nhãn thông minh
                          </div>
                          <label className="block space-y-1">
                            <span className="text-xs text-slate-500">
                              Cỡ chữ nhãn: <strong>{labelFontSize}px</strong>
                            </span>
                            <input
                              type="range"
                              min={15}
                              max={20}
                              step={1}
                              value={labelFontSize}
                              onChange={(e) => setLabelFontSize(Number(e.target.value))}
                              className="w-full accent-teal-700"
                            />
                          </label>
                          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={hideAuxLabels}
                              onChange={(e) => setHideAuxLabels(e.target.checked)}
                              className="accent-teal-700"
                            />
                            Ẩn nhãn đối tượng phụ trợ
                          </label>
                          <p className="text-xs text-slate-500">
                            Mẹo: Bạn có thể kéo trực tiếp từng nhãn trên khung 3D để dời vị trí hiển thị mà không làm đổi tọa độ 3D.
                          </p>
                        </div>

                        {/* Scene object quick list */}
                        <div className="space-y-1.5">
                          <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Đối tượng hiện có ({scene.order.length})
                          </div>
                          <div className="max-h-56 overflow-y-auto space-y-1">
                            {scene.order.map((oid) => {
                              const o = scene.objects[oid];
                              if (!o) return null;
                              return (
                                <div
                                  key={oid}
                                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                                >
                                  <button
                                    type="button"
                                    onClick={() => setSelectedId(oid)}
                                    className="text-left text-sm font-medium text-slate-800 dark:text-slate-200 truncate flex-1"
                                  >
                                    {o.label}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      commitScene(
                                        updateGeo3DObject(scene, oid, (cur) => ({
                                          ...cur,
                                          style: { ...cur.style, visible: cur.style.visible === false ? true : false },
                                        }))
                                      )
                                    }
                                    className="p-1 text-slate-500 hover:text-teal-700"
                                    title={o.style.visible !== false ? 'Ẩn đối tượng' : 'Hiện đối tượng'}
                                  >
                                    {o.style.visible !== false ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={selectedObj.label}
                            onChange={(e) =>
                              setScene((prev) =>
                                updateGeo3DObject(prev, selectedObj.id, (o) => ({
                                  ...o,
                                  label: e.target.value,
                                }))
                              )
                            }
                            className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-[15px] font-bold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => viewportRef.current?.focusSelected(selectedObj.id)}
                            className="p-2 rounded-lg border border-slate-200 text-teal-700 hover:bg-teal-50"
                            title="Tập trung góc nhìn vào đối tượng này"
                          >
                            <Crosshair className="w-4 h-4" />
                          </button>
                        </div>

                        {!selectedObj.valid && selectedObj.errorMessage && (
                          <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-sm text-rose-700">
                            {selectedObj.errorMessage}
                          </div>
                        )}

                        {/* POINT INSPECTOR */}
                        {selectedObj.kind === 'point' && (
                          <div className="space-y-2.5">
                            <div className="text-xs font-bold uppercase text-slate-500">Tọa độ điểm (Oxyz)</div>
                            <div className="grid grid-cols-3 gap-2">
                              {(['x', 'y', 'z'] as const).map((axis) => (
                                <label key={axis} className="space-y-1">
                                  <span className="text-xs font-semibold text-slate-600">{axis}</span>
                                  <input
                                    type="number"
                                    step={0.5}
                                    disabled={selectedObj.rule !== 'free_point_3d' && selectedObj.rule !== 'point_coords'}
                                    value={Number(selectedObj.position[axis].toFixed(2))}
                                    onChange={(e) => {
                                      const val = Number(e.target.value) || 0;
                                      const nextPos = { ...selectedObj.position, [axis]: val };
                                      setScene((prev) => movePoint3D(prev, selectedObj.id, nextPos));
                                    }}
                                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 text-sm font-mono bg-white dark:bg-slate-800 disabled:opacity-60"
                                  />
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* SEGMENT / VECTOR / LINE INSPECTOR */}
                        {selectedObj.kind === 'segment' && (
                          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 space-y-1">
                            <div className="text-xs text-slate-500">Độ dài đoạn thẳng</div>
                            <div className="text-lg font-bold text-teal-700 font-mono">
                              {fmtNum(selectedObj.length, 3)}
                            </div>
                          </div>
                        )}
                        {selectedObj.kind === 'vector' && (
                          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 space-y-1 text-sm">
                            <div>
                              Tọa độ: <span className="font-mono font-bold text-sky-700">({fmtNum(selectedObj.components.x)}; {fmtNum(selectedObj.components.y)}; {fmtNum(selectedObj.components.z)})</span>
                            </div>
                            <div>
                              Độ dài: <span className="font-mono font-bold text-teal-700">{fmtNum(selectedObj.magnitude, 3)}</span>
                            </div>
                          </div>
                        )}
                        {selectedObj.kind === 'line' && (
                          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 space-y-1 text-sm">
                            <div>
                              Vectơ chỉ phương:{' '}
                              <span className="font-mono font-semibold">
                                ({fmtNum(selectedObj.direction.x)}; {fmtNum(selectedObj.direction.y)}; {fmtNum(selectedObj.direction.z)})
                              </span>
                            </div>
                          </div>
                        )}

                        {/* PLANE INSPECTOR */}
                        {selectedObj.kind === 'plane' && (
                          <div className="space-y-2.5">
                            <div className="rounded-xl bg-sky-50/70 border border-sky-200 p-3 space-y-1 text-sm">
                              <div className="text-xs font-semibold text-sky-900">Phương trình tổng quát</div>
                              <div className="font-mono text-slate-900 font-semibold">
                                {fmtNum(selectedObj.normal.x)}x {selectedObj.normal.y >= 0 ? '+' : ''} {fmtNum(selectedObj.normal.y)}y {selectedObj.normal.z >= 0 ? '+' : ''} {fmtNum(selectedObj.normal.z)}z {selectedObj.d >= 0 ? '+' : ''} {fmtNum(selectedObj.d)} = 0
                              </div>
                            </div>
                            <label className="block space-y-1">
                              <span className="text-xs text-slate-600">
                                Kích thước khung mặt phẳng: {fmtNum(selectedObj.style.planeExtent ?? 4.2, 1)}
                              </span>
                              <input
                                type="range"
                                min={2}
                                max={8}
                                step={0.5}
                                value={selectedObj.style.planeExtent ?? 4.2}
                                onChange={(e) =>
                                  setScene((prev) =>
                                    updateGeo3DObject(prev, selectedObj.id, (o) =>
                                      o.kind === 'plane'
                                        ? { ...o, style: { ...o.style, planeExtent: Number(e.target.value) } }
                                        : o
                                    )
                                  )
                                }
                                className="w-full accent-teal-700"
                              />
                            </label>
                            {(selectedObj.rule === 'plane_equation' || selectedObj.rule === 'plane_point_normal') && (
                              <label className="block space-y-1">
                                <span className="text-xs text-slate-600">
                                  Tịnh tiến mặt phẳng (D = {fmtNum(selectedObj.d, 2)})
                                </span>
                                <input
                                  type="range"
                                  min={-6}
                                  max={6}
                                  step={0.2}
                                  value={Number(selectedObj.params?.d ?? selectedObj.d)}
                                  onChange={(e) => {
                                    const newD = Number(e.target.value);
                                    setScene((prev) =>
                                      recomputeScene3D(
                                        updateGeo3DObject(prev, selectedObj.id, (o) => {
                                          if (o.kind !== 'plane') return o;
                                          if (o.rule === 'plane_equation') {
                                            return { ...o, params: { ...(o.params ?? {}), d: newD } };
                                          }
                                          const n = o.normal;
                                          const pt = scale3(n, -newD);
                                          return {
                                            ...o,
                                            params: { ...(o.params ?? {}), px: pt.x, py: pt.y, pz: pt.z },
                                          };
                                        })
                                      )
                                    );
                                  }}
                                  className="w-full accent-sky-600"
                                />
                              </label>
                            )}
                          </div>
                        )}

                        {/* SOLID INSPECTOR */}
                        {selectedObj.kind === 'solid' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="rounded-lg bg-teal-50 border border-teal-100 p-2">
                                <div className="text-slate-500">Thể tích V</div>
                                <div className="text-base font-bold text-teal-800 font-mono">
                                  {fmtNum(selectedObj.volume, 3)}
                                </div>
                              </div>
                              <div className="rounded-lg bg-sky-50 border border-sky-100 p-2">
                                <div className="text-slate-500">Diện tích TP</div>
                                <div className="text-base font-bold text-sky-800 font-mono">
                                  {fmtNum(selectedObj.surfaceArea, 3)}
                                </div>
                              </div>
                            </div>

                            {/* Dynamic Dimension Sliders */}
                            <div className="space-y-2 rounded-xl border border-slate-200 dark:border-slate-700 p-2.5">
                              <div className="text-xs font-bold uppercase text-slate-500">Kích thước hình khối</div>
                              {Object.entries(selectedObj.params ?? {}).map(([key, val]) => {
                                if (typeof val !== 'number') return null;
                                const labelMap: Record<string, string> = {
                                  a: 'Cạnh a',
                                  b: 'Cạnh b',
                                  c: 'Cạnh c',
                                  h: 'Chiều cao h',
                                  r: 'Bán kính r',
                                  rTop: 'Bán kính trên r₂',
                                  r2: 'Bán kính trên r₂',
                                };
                                return (
                                  <label key={key} className="block space-y-0.5">
                                    <div className="flex justify-between text-xs text-slate-600">
                                      <span>{labelMap[key] ?? key}</span>
                                      <span className="font-mono font-semibold">{fmtNum(val, 2)}</span>
                                    </div>
                                    <input
                                      type="range"
                                      min={0.5}
                                      max={7}
                                      step={0.1}
                                      value={val}
                                      onChange={(e) => {
                                        const nv = Number(e.target.value);
                                        setScene((prev) =>
                                          recomputeScene3D(
                                            updateGeo3DObject(prev, selectedObj.id, (o) =>
                                              o.kind === 'solid'
                                                ? { ...o, params: { ...(o.params ?? {}), [key]: nv } }
                                                : o
                                            )
                                          )
                                        );
                                      }}
                                      className="w-full accent-teal-700"
                                    />
                                  </label>
                                );
                              })}
                            </div>

                            {/* Solid Visibility Toggles */}
                            <div className="grid grid-cols-2 gap-1.5 text-xs">
                              {(
                                [
                                  { k: 'showFaces', l: 'Hiện mặt', def: true },
                                  { k: 'showEdges', l: 'Hiện cạnh', def: true },
                                  { k: 'showVertices', l: 'Hiện đỉnh', def: true },
                                  { k: 'showAltitude', l: 'Đường cao', def: false },
                                  { k: 'showDiagonals', l: 'Đường chéo', def: false },
                                  { k: 'showAxis', l: 'Trục đối xứng', def: false },
                                ] as const
                              ).map((item) => (
                                <label key={item.k} className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                                  <input
                                    type="checkbox"
                                    checked={selectedObj.style[item.k] ?? item.def}
                                    onChange={(e) =>
                                      setScene((prev) =>
                                        updateGeo3DObject(prev, selectedObj.id, (o) =>
                                          o.kind === 'solid'
                                            ? { ...o, style: { ...o.style, [item.k]: e.target.checked } }
                                            : o
                                        )
                                      )
                                    }
                                    className="accent-teal-700"
                                  />
                                  {item.l}
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CROSS SECTION INSPECTOR */}
                        {selectedObj.kind === 'cross_section' && (
                          <div className="space-y-3">
                            <div className="rounded-xl bg-sky-50 border border-sky-200 p-3 space-y-1.5 text-sm">
                              <div className="font-bold text-sky-900">
                                {selectedObj.statusNote || `Thiết diện (${selectedObj.vertices.length} đỉnh)`}
                              </div>
                              <div>
                                Chu vi: <strong className="font-mono">{fmtNum(selectedObj.perimeter, 3)}</strong>
                              </div>
                              <div>
                                Diện tích: <strong className="font-mono">{fmtNum(selectedObj.area, 3)}</strong>
                              </div>
                            </div>
                            {renderCrossSection2DPreview(selectedObj)}
                            {selectedObj.parents[0] && scene.objects[selectedObj.parents[0]] && (
                              <button
                                type="button"
                                onClick={() => {
                                  const sid = selectedObj.parents[0];
                                  setScene((prev) =>
                                    updateGeo3DObject(prev, sid, (o) => ({
                                      ...o,
                                      style: { ...o.style, visible: o.style.visible === false ? true : false },
                                    }))
                                  );
                                }}
                                className="w-full py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
                              >
                                {scene.objects[selectedObj.parents[0]]?.style.visible !== false
                                  ? 'Ẩn hình khối để xem riêng thiết diện'
                                  : 'Hiện lại hình khối'}
                              </button>
                            )}
                          </div>
                        )}

                        {/* Common Style Controls */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600">Màu sắc</span>
                            <div className="flex items-center gap-1.5">
                              {['#0F766E', '#0284C7', '#DC2626', '#D97706', '#7C3AED', '#0F172A'].map((col) => (
                                <button
                                  key={col}
                                  type="button"
                                  onClick={() =>
                                    setScene((prev) =>
                                      updateGeo3DObject(prev, selectedObj.id, (o) => ({
                                        ...o,
                                        style: { ...o.style, color: col },
                                      }))
                                    )
                                  }
                                  style={{ backgroundColor: col }}
                                  className={`w-5 h-5 rounded-full border-2 ${
                                    selectedObj.style.color === col ? 'border-slate-900 scale-110' : 'border-white'
                                  }`}
                                  aria-label={`Chọn màu ${col}`}
                                />
                              ))}
                            </div>
                          </div>
                          {(selectedObj.kind === 'segment' || selectedObj.kind === 'line') && (
                            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(selectedObj.style.dashed)}
                                onChange={(e) =>
                                  setScene((prev) =>
                                    updateGeo3DObject(prev, selectedObj.id, (o) => ({
                                      ...o,
                                      style: { ...o.style, dashed: e.target.checked },
                                    }))
                                  )
                                }
                                className="accent-teal-700"
                              />
                              Hiển thị nét đứt
                            </label>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              commitScene(deleteGeo3DObjectWithDependents(scene, selectedObj.id));
                              setSelectedId(null);
                            }}
                            className="w-full py-2 rounded-lg bg-rose-50 text-rose-700 font-semibold text-sm hover:bg-rose-100 flex items-center justify-center gap-1.5"
                          >
                            <Trash2 className="w-4 h-4" />
                            Xóa đối tượng này
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* TAB 2: CONSTRUCTION LOG */}
                {rightTab === 'log' && (
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase text-slate-500">
                      Nhật ký dựng hình ({scene.log.length} bước)
                    </div>
                    {scene.log.length === 0 ? (
                      <p className="text-sm text-slate-500 italic">
                        Chưa có bước dựng nào. Hãy chọn công cụ bên trái để bắt đầu dựng hình 3D.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {scene.log.map((step, i) => {
                          const exists = Boolean(scene.objects[step.objectId]);
                          return (
                            <button
                              key={`${step.objectId}_${step.step}_${i}`}
                              type="button"
                              disabled={!exists}
                              onClick={() => {
                                setSelectedId(step.objectId);
                                viewportRef.current?.focusSelected(step.objectId);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                                selectedId === step.objectId
                                  ? 'border-teal-500 bg-teal-50/70 text-teal-900'
                                  : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                            >
                              <span className="font-bold text-teal-700 mr-1.5">{i + 1}.</span>
                              {step.description}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: GEOMETRIC RELATION ANALYZER */}
                {rightTab === 'relations' && (
                  <div className="space-y-3">
                    <div className="text-xs font-bold uppercase text-slate-500">
                      Phân tích quan hệ hình học 3D
                    </div>
                    <p className="text-xs text-slate-500">
                      Chọn 2 đường thẳng, đoạn thẳng hoặc mặt phẳng để kiểm tra vị trí tương đối, góc và khoảng cách.
                    </p>
                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-slate-600">Đối tượng 1</span>
                      <select
                        value={relObjA}
                        onChange={(e) => setRelObjA(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm"
                      >
                        <option value="">— Chọn đối tượng —</option>
                        {scene.order
                          .map((id) => scene.objects[id])
                          .filter(
                            (o): o is Geo3DObject =>
                              Boolean(o && o.valid && (o.kind === 'line' || o.kind === 'segment' || o.kind === 'plane' || o.kind === 'polygon'))
                          )
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label} ({o.kind})
                            </option>
                          ))}
                      </select>
                    </label>
                    <label className="block space-y-1">
                      <span className="text-xs font-semibold text-slate-600">Đối tượng 2</span>
                      <select
                        value={relObjB}
                        onChange={(e) => setRelObjB(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-2 text-sm"
                      >
                        <option value="">— Chọn đối tượng —</option>
                        {scene.order
                          .map((id) => scene.objects[id])
                          .filter(
                            (o): o is Geo3DObject =>
                              Boolean(o && o.valid && (o.kind === 'line' || o.kind === 'segment' || o.kind === 'plane' || o.kind === 'polygon'))
                          )
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label} ({o.kind})
                            </option>
                          ))}
                      </select>
                    </label>

                    {relationAnalysis && (
                      <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 space-y-2 text-sm">
                        <div className="font-bold text-teal-900">{relationAnalysis.summary}</div>
                        <div className="flex justify-between text-slate-700">
                          <span>Góc giữa hai đối tượng:</span>
                          <strong className="font-mono">{relationAnalysis.angle}</strong>
                        </div>
                        <div className="flex justify-between text-slate-700">
                          <span>Khoảng cách:</span>
                          <strong className="font-mono">{relationAnalysis.distance}</strong>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </aside>
          </div>
        )}
      </div>

      {/* MODAL: SOLID LIBRARY (18 SOLIDS) */}
      {solidPickerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-teal-700" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Thư viện 18 hình khối 3D
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSolidPickerOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {SOLID_CATALOG.map((s) => (
                  <button
                    key={s.solidType}
                    type="button"
                    onClick={() => setSolidTypeToAdd(s.solidType)}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      solidTypeToAdd === s.solidType
                        ? 'border-teal-600 bg-teal-50/70 dark:bg-teal-950/40'
                        : 'border-slate-200 dark:border-slate-700 hover:border-teal-400'
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{s.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{s.curriculumTag}</div>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                {[
                  { k: 'a', l: 'Cạnh đáy / cạnh a' },
                  { k: 'b', l: 'Chiều rộng b' },
                  { k: 'h', l: 'Chiều cao h' },
                  { k: 'r', l: 'Bán kính r' },
                  { k: 'r2', l: 'Bán kính trên r₂' },
                ].map((f) => (
                  <label key={f.k} className="space-y-1">
                    <span className="text-xs font-medium text-slate-600">{f.l}</span>
                    <input
                      type="number"
                      step={0.5}
                      min={0.5}
                      max={10}
                      value={solidParams[f.k as keyof typeof solidParams]}
                      onChange={(e) =>
                        setSolidParams((prev) => ({ ...prev, [f.k]: Number(e.target.value) || 1 }))
                      }
                      className="w-full rounded-lg border border-slate-300 dark:border-slate-700 px-2.5 py-1.5 text-sm font-mono bg-white dark:bg-slate-800"
                    />
                  </label>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2 px-5 py-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSolidPickerOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddSolid}
                className="px-5 py-2 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
              >
                Tạo hình khối vào không gian 3D
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: OXYZ COORDINATES & EQUATIONS */}
      {oxyzModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 flex items-center justify-center p-4">
          <form
            onSubmit={handleOxyzSubmit}
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {oxyzModal === 'point_coords'
                  ? 'Điểm theo tọa độ (x; y; z)'
                  : oxyzModal === 'vector_coords'
                  ? 'Vectơ theo tọa độ Oxyz'
                  : oxyzModal === 'line_dir_vector'
                  ? 'Đường thẳng qua điểm & vectơ chỉ phương'
                  : oxyzModal === 'plane_normal'
                  ? 'Mặt phẳng qua điểm & vectơ pháp tuyến'
                  : oxyzModal === 'plane_equation'
                  ? 'Mặt phẳng theo phương trình tổng quát'
                  : 'Mặt cầu theo tâm & bán kính'}
              </h3>
              <button type="button" onClick={() => setOxyzModal(null)} className="p-1 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <label className="block space-y-1">
              <span className="text-xs font-semibold text-slate-600">Tên ký hiệu</span>
              <input
                type="text"
                value={oxyzForm.label}
                onChange={(e) => setOxyzForm((p) => ({ ...p, label: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </label>

            {oxyzModal !== 'plane_equation' && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-600">
                  {oxyzModal === 'sphere_equation'
                    ? 'Tâm mặt cầu I(x; y; z)'
                    : oxyzModal === 'vector_coords'
                    ? 'Điểm đặt (mặc định gốc O)'
                    : 'Tọa độ điểm đi qua (x; y; z)'}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['x', 'y', 'z'] as const).map((k) => (
                    <input
                      key={k}
                      type="number"
                      step={0.5}
                      value={oxyzForm[k]}
                      onChange={(e) => setOxyzForm((p) => ({ ...p, [k]: e.target.value }))}
                      placeholder={k}
                      className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm font-mono"
                    />
                  ))}
                </div>
              </div>
            )}

            {(oxyzModal === 'vector_coords' ||
              oxyzModal === 'line_dir_vector' ||
              oxyzModal === 'plane_normal' ||
              oxyzModal === 'plane_equation') && (
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-600">
                  {oxyzModal === 'plane_equation'
                    ? 'Hệ số phương trình Ax + By + Cz + D = 0'
                    : oxyzModal === 'plane_normal'
                    ? 'Vectơ pháp tuyến n(A; B; C)'
                    : 'Tọa độ vectơ (a; b; c)'}
                </div>
                <div className={`grid ${oxyzModal === 'plane_equation' ? 'grid-cols-4' : 'grid-cols-3'} gap-2`}>
                  {(['a', 'b', 'c'] as const).map((k) => (
                    <input
                      key={k}
                      type="number"
                      step={0.5}
                      value={oxyzForm[k]}
                      onChange={(e) => setOxyzForm((p) => ({ ...p, [k]: e.target.value }))}
                      placeholder={k.toUpperCase()}
                      className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm font-mono"
                    />
                  ))}
                  {oxyzModal === 'plane_equation' && (
                    <input
                      type="number"
                      step={0.5}
                      value={oxyzForm.d}
                      onChange={(e) => setOxyzForm((p) => ({ ...p, d: e.target.value }))}
                      placeholder="D"
                      className="rounded-lg border border-slate-300 px-2.5 py-2 text-sm font-mono"
                    />
                  )}
                </div>
              </div>
            )}

            {oxyzModal === 'sphere_equation' && (
              <label className="block space-y-1">
                <span className="text-xs font-semibold text-slate-600">Bán kính R</span>
                <input
                  type="number"
                  step={0.5}
                  min={0.2}
                  value={oxyzForm.r}
                  onChange={(e) => setOxyzForm((p) => ({ ...p, r: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </label>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOxyzModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-sm font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800"
              >
                Áp dụng
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: MATH FORMULA 3D */}
      {formulaModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <MathFormulaEditor
              onCancel={() => {
                setFormulaModalOpen(false);
                setActiveTool('select');
              }}
              onApply={(wrapped) => {
                const res = addGeo3DObject(scene, {
                  kind: 'formula',
                  rule: 'formula_note',
                  latex: wrapped,
                  position: v3(0, 0, 3.6),
                  label: 'Công thức',
                });
                commitScene(res.scene);
                setSelectedId(res.id);
                setFormulaModalOpen(false);
                setActiveTool('select');
              }}
            />
          </div>
        </div>
      )}

      {/* FLOATING PANEL: 3D TRANSFORMATION INTERPOLATION (Kiến thức mở rộng) */}
      {transformModal && (
        <div className="fixed bottom-6 right-6 z-40 w-88 rounded-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 shadow-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wide text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                Kiến thức mở rộng
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                Phép biến hình không gian 3D
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                setTransformModal(null);
                setActiveTool('select');
              }}
              className="p-1 text-slate-500 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!targetTransformSolid ? (
            <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-2.5">
              Hãy tạo ít nhất một hình khối 3D trước (trong mục Thư viện hình khối) để xem minh họa phép biến hình trực quan.
            </p>
          ) : (
            <>
              <div className="text-xs text-slate-600">
                Đối tượng biến hình: <strong>{targetTransformSolid.label}</strong>
              </div>

              {(transformModal === 'translation' || transformModal === 'similarity') && (
                <div className="grid grid-cols-3 gap-1.5">
                  {(['dx', 'dy', 'dz'] as const).map((k) => (
                    <label key={k} className="space-y-0.5">
                      <span className="text-[11px] text-slate-500">{k}</span>
                      <input
                        type="number"
                        step={0.5}
                        value={transformParams[k]}
                        onChange={(e) => setTransformParams((p) => ({ ...p, [k]: e.target.value }))}
                        className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
                      />
                    </label>
                  ))}
                </div>
              )}

              {(transformModal === 'rotation' || transformModal === 'similarity') && (
                <div className="grid grid-cols-2 gap-2">
                  <label className="space-y-0.5">
                    <span className="text-[11px] text-slate-500">Trục quay</span>
                    <select
                      value={transformParams.axis}
                      onChange={(e) =>
                        setTransformParams((p) => ({ ...p, axis: e.target.value as 'Ox' | 'Oy' | 'Oz' }))
                      }
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                    >
                      <option value="Oz">Trục Oz</option>
                      <option value="Ox">Trục Ox</option>
                      <option value="Oy">Trục Oy</option>
                    </select>
                  </label>
                  <label className="space-y-0.5">
                    <span className="text-[11px] text-slate-500">Góc quay (°)</span>
                    <input
                      type="number"
                      step={15}
                      value={transformParams.angleDeg}
                      onChange={(e) => setTransformParams((p) => ({ ...p, angleDeg: e.target.value }))}
                      className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
                    />
                  </label>
                </div>
              )}

              {transformModal === 'plane_symmetry' && (
                <label className="block space-y-0.5">
                  <span className="text-[11px] text-slate-500">Mặt phẳng đối xứng</span>
                  <select
                    value={transformParams.plane}
                    onChange={(e) =>
                      setTransformParams((p) => ({ ...p, plane: e.target.value as 'Oxy' | 'Oxz' | 'Oyz' }))
                    }
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    <option value="Oxy">(Oxy): z = 0</option>
                    <option value="Oxz">(Oxz): y = 0</option>
                    <option value="Oyz">(Oyz): x = 0</option>
                  </select>
                </label>
              )}

              {(transformModal === 'homothety' || transformModal === 'similarity') && (
                <label className="block space-y-0.5">
                  <span className="text-[11px] text-slate-500">Tỉ số vị tự / đồng dạng k</span>
                  <input
                    type="number"
                    step={0.25}
                    value={transformParams.k}
                    onChange={(e) => setTransformParams((p) => ({ ...p, k: e.target.value }))}
                    className="w-full rounded border border-slate-300 px-2 py-1 text-xs font-mono"
                  />
                </label>
              )}

              {/* Smooth interpolation slider t in [0, 1] */}
              <label className="block space-y-1">
                <div className="flex justify-between text-xs font-semibold text-purple-800">
                  <span>Tiến trình biến hình (trước → sau)</span>
                  <span className="font-mono">{Math.round(transformT * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={transformT}
                  onChange={(e) => setTransformT(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </label>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setTransformModal(null);
                    setActiveTool('select');
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium"
                >
                  Đóng
                </button>
                <button
                  type="button"
                  onClick={applyTransformToScene}
                  className="px-3.5 py-1.5 rounded-lg bg-purple-700 text-white text-xs font-semibold hover:bg-purple-800"
                >
                  Dựng ảnh vào bản vẽ
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Lab3DWorkspace;
