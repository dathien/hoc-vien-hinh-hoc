import type { ConstructionRuleType, GeoObjectKind, GeoStyle, ToolId } from '../geometry/types';

export type Difficulty = 'Cơ bản' | 'Trung bình' | 'Khá' | 'Nâng cao' | 'Olympic';

export type CurriculumCategory = 'Chính khóa' | 'Mở rộng' | 'Học sinh giỏi' | 'Olympic';

export type ProgramLabel =
  | 'Kiến thức nền tảng'
  | 'Toán 10'
  | 'Toán 11'
  | 'Toán 12'
  | 'Kiến thức mở rộng'
  | 'Hình học Olympic';

export type CognitiveLevel =
  | 'Kiến thức nền tảng'
  | 'Nhận biết'
  | 'Thông hiểu'
  | 'Vận dụng'
  | 'Nâng cao';

export type GradeTag =
  | 'Lớp 6'
  | 'Lớp 7'
  | 'Lớp 8'
  | 'Lớp 9'
  | 'Lớp 10'
  | 'Lớp 11'
  | 'Lớp 12'
  | 'Học sinh giỏi'
  | 'Olympic';

export interface InitialGeoSpec {
  id: string;
  kind: GeoObjectKind;
  rule: ConstructionRuleType;
  parents: string[];
  label: string;
  x?: number;
  y?: number;
  params?: Record<string, number | string | boolean>;
  style?: Partial<GeoStyle>;
}

export type ValidationRuleType =
  | 'equilateral_on_segment'
  | 'isosceles_on_segment'
  | 'circle_center_through_point'
  | 'two_equal_circles'
  | 'intersection_of_circles'
  | 'perpendicular_bisector_of'
  | 'midpoint_of'
  | 'copy_segment_on_ray'
  | 'circle_through_two_points_center_on_bisector'
  | 'copy_triangle_sss'
  | 'perpendicular_at_point'
  | 'perpendicular_from_point'
  | 'projection_of_point'
  | 'altitude_of_triangle'
  | 'point_equidistant_from_two'
  | 'median_of_triangle'
  | 'right_triangle_legs'
  | 'diameter_perp_chord'
  | 'rectangle_from_two_sides'
  | 'parallel_through_point'
  | 'angle_bisector_of'
  | 'external_angle_bisector_of'
  | 'angle_measure_target'
  | 'copy_angle'
  | 'parallelogram_from_three'
  | 'square_on_segment'
  | 'rhombus_on_segment'
  | 'inscribed_square'
  | 'circumcenter_of_triangle'
  | 'circumcircle_of_triangle'
  | 'incenter_of_triangle'
  | 'incircle_of_triangle'
  | 'centroid_of_triangle'
  | 'orthocenter_of_triangle'
  | 'euler_line_of_triangle'
  | 'reflection_over_line'
  | 'reflection_over_point'
  | 'translation_point'
  | 'rotation_point'
  | 'homothety_point'
  | 'divide_segment_ratio'
  | 'golden_ratio_point'
  | 'tangent_at_point'
  | 'tangent_from_external'
  | 'circle_center_finder'
  | 'radical_axis'
  | 'regular_polygon_in_circle'
  | 'point_at_target_formula'
  | 'line_through_target_formula'
  | 'circle_at_target_formula'
  | 'segment_between_target_formula';

export interface ValidationRule {
  type: ValidationRuleType;
  /** References to initial geometry IDs */
  refs: string[];
  /** Optional numerical parameters (angleDeg, ratioNum, ratioDen, sides, etc.) */
  params?: Record<string, number | string>;
  description: string;
}

export interface PerturbationRule {
  freePointIds: string[];
  jitterRadius: number;
  minSeparation?: number;
  enforceAcuteTriangle?: boolean;
  enforceNonCollinear?: boolean;
  enforceMaxAngleBelow120?: boolean;
}

export interface SolutionAction {
  kind: GeoObjectKind;
  rule: ConstructionRuleType;
  parents: string[];
  params?: Record<string, number | string | boolean>;
  label?: string;
  id: string;
  tool: ToolId;
  isAuxiliary?: boolean;
  purpose: string;
  actionText: string;
  resultText: string;
  mathExplanation: string;
}

export interface ChallengeDefinition {
  id: string;
  levelId: number;
  order: number;
  title: string;
  description: string;
  difficulty: Difficulty;
  gradeTags: GradeTag[];
  curriculumCategory: CurriculumCategory;
  cognitiveLevel: CognitiveLevel;
  prerequisites: string[];
  initialGeometry: InitialGeoSpec[];
  allowedTools: ToolId[];
  forbiddenTools: ToolId[];
  constraints: string[];
  validationRules: ValidationRule[];
  perturbationRules: PerturbationRule;
  targetL: number;
  targetE: number;
  hints: [string, string, string];
  solutionSteps: SolutionAction[];
  proof: string;
  thumbnailKind: string;
  educationalNotes: string;
  referenceSource?: string;
  isTeacherCustom?: boolean;
}

export interface LevelMeta {
  id: number;
  roman: string;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  curriculumCategory: CurriculumCategory;
  gradeTags: GradeTag[];
  thumbnailKind: string;
}

export interface ValidationDiagnostic {
  passed: boolean;
  ruleDescription: string;
  detail: string;
  failedPerturbationIndex?: number;
}

export interface ValidationReport {
  valid: boolean;
  stars: 0 | 1 | 2 | 3;
  star1Correct: boolean;
  star2OptimalL: boolean;
  star3OptimalE: boolean;
  usedL: number;
  usedE: number;
  targetL: number;
  targetE: number;
  perturbationsTested: number;
  perturbationsPassed: number;
  forbiddenToolUsed: ToolId | null;
  diagnostics: ValidationDiagnostic[];
  summary: string;
}
