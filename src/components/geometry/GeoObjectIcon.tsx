import React from 'react';
import type { GeoObject } from '../../geometry/types';
import type { Geo3DObject } from '../../geometry3d/types3d';

export type GeoVisualIconKind =
  | 'point'
  | 'special_point'
  | 'segment'
  | 'line'
  | 'ray'
  | 'vector'
  | 'circle'
  | 'arc'
  | 'triangle'
  | 'polygon'
  | 'plane'
  | 'cross_section'
  | 'solid'
  | 'angle_measure'
  | 'length_measure'
  | 'formula';

export function resolveIconKind2D(obj: GeoObject): GeoVisualIconKind {
  if (obj.kind === 'point') {
    if (
      obj.rule === 'midpoint' ||
      obj.rule === 'centroid' ||
      obj.rule === 'orthocenter' ||
      obj.rule === 'circumcenter' ||
      obj.rule === 'incenter' ||
      obj.rule === 'intersection' ||
      obj.rule === 'intersection_line_line' ||
      obj.rule === 'intersection_line_circle' ||
      obj.rule === 'intersection_circle_circle'
    ) {
      return 'special_point';
    }
    return 'point';
  }
  if (obj.kind === 'segment') return 'segment';
  if (obj.kind === 'line') return 'line';
  if (obj.kind === 'ray') return 'ray';
  if (obj.kind === 'circle') return 'circle';
  if (obj.kind === 'arc') return 'arc';
  if (obj.kind === 'polygon') {
    return obj.vertices.length === 3 || obj.parents.length === 3 ? 'triangle' : 'polygon';
  }
  if (obj.kind === 'angle_measure') return 'angle_measure';
  return 'length_measure';
}

export function resolveIconKind3D(obj: Geo3DObject): GeoVisualIconKind {
  switch (obj.kind) {
    case 'point':
      return obj.rule === 'midpoint_3d' ||
        obj.rule === 'intersect_line_line' ||
        obj.rule === 'intersect_line_plane'
        ? 'special_point'
        : 'point';
    case 'segment':
      return 'segment';
    case 'line':
      return 'line';
    case 'ray':
      return 'ray';
    case 'vector':
      return 'vector';
    case 'circle':
      return 'circle';
    case 'polygon':
      return obj.vertices.length === 3 || obj.parents.length === 3 ? 'triangle' : 'polygon';
    case 'plane':
      return 'plane';
    case 'cross_section':
      return 'cross_section';
    case 'solid':
      return 'solid';
    case 'measurement':
      return obj.metricKind === 'angle' || obj.metricKind === 'dihedral'
        ? 'angle_measure'
        : 'length_measure';
    case 'formula':
    default:
      return 'formula';
  }
}

interface GeoObjectIconProps {
  kind: GeoVisualIconKind;
  color?: string;
  className?: string;
}

/** Distinct geometric SVG glyph for each mathematical object type */
export const GeoObjectIcon: React.FC<GeoObjectIconProps> = ({
  kind,
  color = '#0F766E',
  className = 'w-5 h-5 shrink-0',
}) => {
  switch (kind) {
    case 'point':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <circle cx="10" cy="10" r="6" fill={color} fillOpacity="0.16" />
          <circle cx="10" cy="10" r="3.4" fill={color} />
        </svg>
      );
    case 'special_point':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <polygon
            points="10,3 17,10 10,17 3,10"
            fill={color}
            fillOpacity="0.18"
            stroke={color}
            strokeWidth="1.6"
          />
          <circle cx="10" cy="10" r="2.2" fill={color} />
        </svg>
      );
    case 'segment':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <line x1="4" y1="15" x2="16" y2="5" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="4" cy="15" r="2.3" fill={color} />
          <circle cx="16" cy="5" r="2.3" fill={color} />
        </svg>
      );
    case 'line':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <line x1="2.5" y1="16.5" x2="17.5" y2="3.5" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
          <polyline points="2.5,12.5 2.5,16.5 6.5,16.5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="13.5,3.5 17.5,3.5 17.5,7.5" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'ray':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <line x1="4" y1="15" x2="17" y2="4" stroke={color} strokeWidth="1.9" strokeLinecap="round" />
          <circle cx="4" cy="15" r="2.4" fill={color} />
          <polyline points="12.5,4 17,4 17,8.5" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'vector':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <line x1="3.5" y1="15.5" x2="15" y2="5.5" stroke={color} strokeWidth="2.1" strokeLinecap="round" />
          <polygon points="17.5,3.5 11.5,4.8 15.2,9" fill={color} />
        </svg>
      );
    case 'circle':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <circle cx="10" cy="10" r="7" fill="none" stroke={color} strokeWidth="1.8" />
          <circle cx="10" cy="10" r="1.8" fill={color} />
        </svg>
      );
    case 'arc':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <path d="M 4 14 A 7 7 0 0 1 16 7" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
          <circle cx="4" cy="14" r="2" fill={color} />
          <circle cx="16" cy="7" r="2" fill={color} />
        </svg>
      );
    case 'triangle':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <polygon
            points="10,3.2 17,16 3,16"
            fill={color}
            fillOpacity="0.16"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'polygon':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <polygon
            points="10,2.5 17,7.6 14.5,16.2 5.5,16.2 3,7.6"
            fill={color}
            fillOpacity="0.16"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'plane':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <polygon
            points="5.5,4.5 17.5,4.5 14.5,15.5 2.5,15.5"
            fill={color}
            fillOpacity="0.2"
            stroke={color}
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
      );
    case 'cross_section':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <polygon
            points="6,3.5 15.5,5.5 17,13.5 9,16.5 3.5,11"
            fill={color}
            fillOpacity="0.24"
            stroke={color}
            strokeWidth="1.7"
            strokeDasharray="2.5 1.5"
            strokeLinejoin="round"
          />
          <line x1="6" y1="12" x2="13.5" y2="7" stroke={color} strokeWidth="1.2" />
        </svg>
      );
    case 'solid':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <polygon
            points="10,2.5 17,6.2 17,13.8 10,17.5 3,13.8 3,6.2"
            fill={color}
            fillOpacity="0.14"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <polyline points="3,6.2 10,9.8 17,6.2" fill="none" stroke={color} strokeWidth="1.4" />
          <line x1="10" y1="9.8" x2="10" y2="17.5" stroke={color} strokeWidth="1.4" />
        </svg>
      );
    case 'angle_measure':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <polyline points="16.5,5 4.5,15.5 17,15.5" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 10.5 15.5 A 6 6 0 0 0 8.8 11.7" fill="none" stroke={color} strokeWidth="1.5" />
        </svg>
      );
    case 'length_measure':
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <line x1="3.5" y1="10" x2="16.5" y2="10" stroke={color} strokeWidth="1.8" />
          <line x1="3.5" y1="6.5" x2="3.5" y2="13.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="16.5" y1="6.5" x2="16.5" y2="13.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="10" y1="8" x2="10" y2="12" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'formula':
    default:
      return (
        <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
          <rect x="3" y="3.5" width="14" height="13" rx="2.5" fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5" />
          <text x="10" y="13.2" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={color}>Σ</text>
        </svg>
      );
  }
};
