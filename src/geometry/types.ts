export type GeoObjectKind =
  | 'point'
  | 'line'
  | 'segment'
  | 'ray'
  | 'circle'
  | 'arc'
  | 'polygon'
  | 'angle_measure'
  | 'length_measure';

export type ConstructionRuleType =
  | 'free_point'
  | 'point_on_object'
  | 'intersection'
  | 'intersection_line_line'
  | 'intersection_line_circle'
  | 'intersection_circle_circle'
  | 'midpoint'
  | 'line_two_points'
  | 'segment_two_points'
  | 'ray_two_points'
  | 'circle_center_point'
  | 'circle_center_radius'
  | 'circle_compass'
  | 'compass_transfer'
  | 'arc_three_points'
  | 'perpendicular_line'
  | 'parallel_line'
  | 'perpendicular_bisector'
  | 'angle_bisector'
  | 'tangent_line'
  | 'projection_point'
  | 'reflection_line'
  | 'reflect_line'
  | 'reflection_point'
  | 'reflect_point'
  | 'translation'
  | 'rotation'
  | 'homothety'
  | 'polygon_vertices'
  | 'regular_polygon'
  | 'circumcircle'
  | 'incircle'
  | 'centroid'
  | 'orthocenter'
  | 'circumcenter'
  | 'incenter'
  | 'angle_measure'
  | 'length_measure';

export type ToolId =
  | 'select'
  | 'pan'
  | 'point'
  | 'point_on_object'
  | 'intersect'
  | 'line'
  | 'segment'
  | 'ray'
  | 'polyline'
  | 'circle_cp'
  | 'circle_cr'
  | 'compass'
  | 'arc'
  | 'midpoint'
  | 'perp_bisector'
  | 'perpendicular'
  | 'parallel'
  | 'angle_bisector'
  | 'median'
  | 'altitude'
  | 'tangent'
  | 'projection'
  | 'reflect_line'
  | 'reflect_point'
  | 'translate'
  | 'rotate'
  | 'homothety'
  | 'triangle'
  | 'quadrilateral'
  | 'polygon'
  | 'regular_polygon'
  | 'incircle'
  | 'circumcircle'
  | 'measure_length'
  | 'measure_angle'
  | 'measure_area';

export interface Vec2 {
  x: number;
  y: number;
}

export interface GeoStyle {
  color: string;
  strokeWidth: number;
  dash: 'solid' | 'dashed' | 'dotted';
  visible: boolean;
  isAuxiliary?: boolean;
  isGiven?: boolean;
  labelOffset?: Vec2;
  showLabel?: boolean;
  fillColor?: string;
  fillOpacity?: number;
  tickMarks?: 0 | 1 | 2 | 3;
}

export interface GeoObjectBase {
  id: string;
  kind: GeoObjectKind;
  label: string;
  parents: string[];
  rule: ConstructionRuleType;
  params?: Record<string, number | string | boolean>;
  valid: boolean;
  style: GeoStyle;
  createdByTool?: ToolId;
  costL: number;
  costE: number;
  timestamp: number;
}

export interface GeoPoint extends GeoObjectBase {
  kind: 'point';
  x: number;
  y: number;
}

export interface GeoLineLike extends GeoObjectBase {
  kind: 'line' | 'segment' | 'ray';
  p1: Vec2;
  p2: Vec2;
  /** Normalized line equation ax + by + c = 0 */
  a: number;
  b: number;
  c: number;
}

export interface GeoCircle extends GeoObjectBase {
  kind: 'circle';
  center: Vec2;
  radius: number;
}

export interface GeoArc extends GeoObjectBase {
  kind: 'arc';
  center: Vec2;
  radius: number;
  startAngle: number;
  endAngle: number;
  largeArc: boolean;
  sweep: boolean;
}

export interface GeoPolygon extends GeoObjectBase {
  kind: 'polygon';
  vertices: Vec2[];
  area: number;
  perimeter: number;
}

export interface GeoAngleMeasure extends GeoObjectBase {
  kind: 'angle_measure';
  vertex: Vec2;
  rayA: Vec2;
  rayB: Vec2;
  degrees: number;
  isRight: boolean;
}

export interface GeoLengthMeasure extends GeoObjectBase {
  kind: 'length_measure';
  p1: Vec2;
  p2: Vec2;
  value: number;
}

export type GeoObject =
  | GeoPoint
  | GeoLineLike
  | GeoCircle
  | GeoArc
  | GeoPolygon
  | GeoAngleMeasure
  | GeoLengthMeasure;

export interface ConstructionLogEntry {
  id: string;
  stepNumber: number;
  tool: ToolId;
  toolLabel: string;
  description: string;
  usedObjectIds: string[];
  createdObjectIds: string[];
  costL: number;
  costE: number;
  timestamp: number;
  undone?: boolean;
}

export interface GeoScene {
  objects: Record<string, GeoObject>;
  order: string[];
  log: ConstructionLogEntry[];
  fullAuditLog: ConstructionLogEntry[];
  nextLabelIndex: number;
}

export interface ToolCostInfo {
  id: ToolId;
  name: string;
  group:
    | 'interact'
    | 'ruler'
    | 'compass'
    | 'construct'
    | 'transform'
    | 'shapes'
    | 'measure';
  costL: number;
  costE: number;
  elementaryBasis: string;
  promptSteps: string[];
  isEuclideanBasic: boolean;
}
