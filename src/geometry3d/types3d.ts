export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export type WorkingPlaneKind = 'Oxy' | 'Oxz' | 'Oyz' | 'custom';

export type DisplayMode3D = 'sgk' | 'solid' | 'wireframe' | 'oxyz';

export type LengthUnit3D = 'unit' | 'cm' | 'm';

export type ConstraintKind3D = 'free' | 'constrained' | 'dependent' | 'fixed';

export type Geo3DObjectKind =
  | 'point'
  | 'segment'
  | 'line'
  | 'ray'
  | 'vector'
  | 'plane'
  | 'circle'
  | 'polygon'
  | 'solid'
  | 'cross_section'
  | 'measurement'
  | 'formula';

export type Geo3DRule =
  // Points (12)
  | 'free_point_3d'
  | 'point_coords'
  | 'point_on_line'
  | 'point_on_segment'
  | 'point_on_plane'
  | 'midpoint_3d'
  | 'intersect_line_line'
  | 'intersect_line_plane'
  | 'foot_point_line'
  | 'foot_point_plane'
  | 'reflect_point_point'
  | 'reflect_point_plane'
  | 'solid_vertex'
  | 'transform_point'
  // Lines & Curves (10)
  | 'segment_3d'
  | 'line_two_points'
  | 'ray_3d'
  | 'vector_two_points'
  | 'vector_coords'
  | 'line_parallel_point'
  | 'line_perp_plane'
  | 'line_point_direction'
  | 'intersect_plane_plane'
  | 'common_perpendicular'
  | 'circle_in_plane'
  // Planes (8)
  | 'plane_three_points'
  | 'plane_line_point'
  | 'plane_two_lines'
  | 'plane_parallel_point'
  | 'plane_perp_line'
  | 'plane_point_normal'
  | 'plane_equation'
  // Polygons
  | 'polygon_3d'
  // Solids (Polyhedra & Revolution)
  | 'solid_cube'
  | 'solid_box'
  | 'solid_parallelepiped'
  | 'solid_tetrahedron'
  | 'solid_regular_tetrahedron'
  | 'solid_pyramid'
  | 'solid_regular_pyramid'
  | 'solid_pyramid_frustum'
  | 'solid_prism'
  | 'solid_right_prism'
  | 'solid_octahedron'
  | 'solid_dodecahedron'
  | 'solid_icosahedron'
  | 'solid_cylinder'
  | 'solid_cone'
  | 'solid_cone_frustum'
  | 'solid_sphere'
  | 'solid_hemisphere'
  // Cross section
  | 'cross_section_solid_plane'
  // Measurements
  | 'measure_distance_pp'
  | 'measure_distance_pl'
  | 'measure_distance_pplane'
  | 'measure_distance_skew'
  | 'measure_distance_planes'
  | 'measure_angle_vectors'
  | 'measure_angle_lines'
  | 'measure_angle_line_plane'
  | 'measure_angle_planes'
  | 'measure_dihedral_angle'
  | 'measure_polygon_metrics'
  // Formulas / Notes
  | 'formula_note';

export interface Geo3DStyle {
  color: string;
  opacity?: number;
  size?: number;
  lineWidth?: number;
  dashed?: boolean;
  showLabel?: boolean;
  labelOffset?: { dx: number; dy: number };
  isAuxiliary?: boolean;
  isGiven?: boolean;
  showFaces?: boolean;
  showEdges?: boolean;
  showVertices?: boolean;
  showDiagonals?: boolean;
  showAltitude?: boolean;
  showAxis?: boolean;
  planeExtent?: number;
  visible?: boolean;
  locked?: boolean;
}

export interface Geo3DBase {
  id: string;
  kind: Geo3DObjectKind;
  rule: Geo3DRule;
  parents: string[];
  label: string;
  /** True when the user explicitly typed a custom name; false/undefined allows dynamic auto-naming */
  customLabel?: boolean;
  constraint: ConstraintKind3D;
  valid: boolean;
  errorMessage?: string;
  style: Geo3DStyle;
  params?: Record<string, number | string | boolean | number[]>;
}

export interface Geo3DPoint extends Geo3DBase {
  kind: 'point';
  position: Vec3;
  t?: number;
  uv?: { u: number; v: number };
}

export interface Geo3DSegment extends Geo3DBase {
  kind: 'segment';
  p1: Vec3;
  p2: Vec3;
  length: number;
}

export interface Geo3DLine extends Geo3DBase {
  kind: 'line';
  origin: Vec3;
  direction: Vec3; // unit vector
}

export interface Geo3DRay extends Geo3DBase {
  kind: 'ray';
  origin: Vec3;
  direction: Vec3; // unit vector
}

export interface Geo3DVector extends Geo3DBase {
  kind: 'vector';
  origin: Vec3;
  components: Vec3;
  magnitude: number;
}

export interface Geo3DPlane extends Geo3DBase {
  kind: 'plane';
  normal: Vec3; // unit vector (a, b, c)
  d: number; // a*x + b*y + c*z + d = 0
  anchor: Vec3; // visual center of finite display patch
  rawCoeffs: { a: number; b: number; c: number; d: number };
}

export interface Geo3DCircle extends Geo3DBase {
  kind: 'circle';
  center: Vec3;
  normal: Vec3;
  radius: number;
}

export interface Geo3DPolygon extends Geo3DBase {
  kind: 'polygon';
  vertices: Vec3[];
  area: number;
  perimeter: number;
  normal: Vec3;
}

export interface SolidEdgeDef {
  a: number;
  b: number;
  isDiagonal?: boolean;
  isAltitude?: boolean;
  isAxis?: boolean;
}

export interface SolidFaceDef {
  indices: number[];
  name?: string;
}

export type Solid3DType =
  | 'cube'
  | 'box'
  | 'parallelepiped'
  | 'tetrahedron'
  | 'regular_tetrahedron'
  | 'pyramid'
  | 'regular_pyramid'
  | 'pyramid_frustum'
  | 'prism'
  | 'right_prism'
  | 'octahedron'
  | 'dodecahedron'
  | 'icosahedron'
  | 'cylinder'
  | 'cone'
  | 'cone_frustum'
  | 'sphere'
  | 'hemisphere';

export interface Geo3DSolid extends Geo3DBase {
  kind: 'solid';
  solidType: Solid3DType;
  center: Vec3;
  rotation: Vec3; // Euler XYZ in degrees
  vertexLabels: string[];
  vertices: Vec3[];
  edges: SolidEdgeDef[];
  faces: SolidFaceDef[];
  /** Computed geometric measures */
  volume: number;
  surfaceArea: number;
  lateralArea: number;
  baseArea: number;
  height: number;
  radius?: number;
  radiusTop?: number;
  isExtendedCurriculum?: boolean;
  formulaSummary: string;
}

export interface Geo3DCrossSection extends Geo3DBase {
  kind: 'cross_section';
  vertices: Vec3[];
  vertexLabels: string[];
  /** For curved solids (cylinder/cone/sphere), exact sampled curve loop(s) */
  curveLoops?: Vec3[][];
  curveType?: 'polygon' | 'circle' | 'ellipse' | 'parabola' | 'hyperbola' | 'segment' | 'point' | 'empty';
  area: number;
  perimeter: number;
  planeNormal: Vec3;
  planeAnchor: Vec3;
  statusNote: string;
}

export interface Geo3DMeasurement extends Geo3DBase {
  kind: 'measurement';
  metricKind:
    | 'length'
    | 'distance'
    | 'angle'
    | 'dihedral'
    | 'area'
    | 'perimeter'
    | 'volume';
  value: number;
  formattedValue: string;
  anchor: Vec3;
  formulaHint?: string;
}

export interface Geo3DFormulaNote extends Geo3DBase {
  kind: 'formula';
  latex: string;
  position: Vec3;
}

export type Geo3DObject =
  | Geo3DPoint
  | Geo3DSegment
  | Geo3DLine
  | Geo3DRay
  | Geo3DVector
  | Geo3DPlane
  | Geo3DCircle
  | Geo3DPolygon
  | Geo3DSolid
  | Geo3DCrossSection
  | Geo3DMeasurement
  | Geo3DFormulaNote;

export interface ConstructionLog3DItem {
  step: number;
  objectId: string;
  label: string;
  toolName: string;
  description: string;
  timestamp: number;
}

export interface CameraState3D {
  position: Vec3;
  target: Vec3;
  projection: 'orthographic' | 'perspective';
  zoom: number;
}

export interface TransformPreview3D {
  active?: boolean;
  kind:
    | 'translate'
    | 'translation'
    | 'rotate'
    | 'rotation'
    | 'reflect_point'
    | 'point_symmetry'
    | 'reflect_plane'
    | 'plane_symmetry'
    | 'homothety'
    | 'similarity';
  sourceIds?: string[];
  sourceId?: string;
  t: number; // 0..1 interpolation slider
  originalVertices?: Vec3[];
  targetVertices?: Vec3[];
  edges?: SolidEdgeDef[];
  faces?: SolidFaceDef[];
  label?: string;
  vector?: Vec3;
  axisOrigin?: Vec3;
  axisDir?: Vec3;
  angleDeg?: number;
  center?: Vec3;
  planeNormal?: Vec3;
  planeD?: number;
  factor?: number;
}

export interface Geo3DScene {
  schemaVersion: 1;
  objects: Record<string, Geo3DObject>;
  order: string[];
  log: ConstructionLog3DItem[];
  nextLabelIndex: number;
  workingPlane: {
    kind: WorkingPlaneKind;
    offset: number;
    customPlaneId?: string;
  };
  displayMode: DisplayMode3D;
  showGrid: boolean;
  showAxes: boolean;
  showCoordPlanes: boolean;
  showHiddenLines: boolean;
  showLabels: boolean;
  showAuxiliary: boolean;
  unit: LengthUnit3D;
  camera: CameraState3D;
}

export type Tool3DId =
  | 'select'
  | 'pan_orbit'
  // Points (12)
  | 'point_free'
  | 'point_coords'
  | 'point_on_line'
  | 'point_on_segment'
  | 'point_on_plane'
  | 'midpoint'
  | 'intersect_ll'
  | 'intersect_lp'
  | 'foot_line'
  | 'foot_plane'
  | 'reflect_point'
  | 'reflect_plane'
  // Lines (10)
  | 'segment'
  | 'line'
  | 'ray'
  | 'vector'
  | 'parallel_line'
  | 'perp_line_plane'
  | 'line_dir_vector'
  | 'intersect_pp'
  | 'common_perp'
  | 'circle_plane'
  // Planes (8)
  | 'plane_3pts'
  | 'plane_line_pt'
  | 'plane_2lines_inter'
  | 'plane_2lines_para'
  | 'plane_parallel'
  | 'plane_perp_line'
  | 'plane_normal'
  | 'plane_equation'
  // Polygons
  | 'polygon'
  // Solids
  | 'solid_library'
  // Relations
  | 'analyze_relation'
  // Transforms (Extended)
  | 'transform_3d'
  // Cross section
  | 'cross_section'
  // Measurements
  | 'measure_length'
  | 'measure_angle_vec'
  | 'measure_angle_ll'
  | 'measure_angle_lp'
  | 'measure_angle_pp'
  | 'measure_dihedral'
  | 'measure_dist_pl'
  | 'measure_dist_pplane'
  | 'measure_dist_skew'
  | 'measure_dist_planes'
  // Text & Formula
  | 'formula_note';

export interface SavedDrawing3D {
  id: string;
  schemaVersion: 1;
  title: string;
  topic: string;
  description?: string;
  scene: Geo3DScene;
  createdAt: string;
  updatedAt: string;
}

export interface Challenge3DProgressRecord {
  challengeId: string;
  stars: 0 | 1 | 2 | 3;
  completed: boolean;
  attempts: number;
  bestSteps: number | null;
  bestTimeSec: number | null;
  completedAt: string;
  viewedSolution: boolean;
}
