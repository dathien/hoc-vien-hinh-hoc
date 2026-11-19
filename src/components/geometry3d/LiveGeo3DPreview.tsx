import React, { useEffect, useMemo, useRef, useState } from 'react';
import { exportScene3DToVectorSvg, isSolidEdgeHidden, projectPoint3D } from '../../geometry3d/export3d';
import { add3, cross3, dot3, normalize3, scale3, sub3, v3 } from '../../geometry3d/math3d';
import { buildSolidGeometryData } from '../../geometry3d/engine3d';
import type { CameraState3D, Geo3DScene, Geo3DSolid, Vec3 } from '../../geometry3d/types3d';

interface LiveGeo3DPreviewProps {
  /** Optional real Geo3DScene to render as an accurate live SVG projection */
  scene?: Geo3DScene;
  /** Showcase variant when no custom scene is supplied */
  variant?: 'hero_pyramid' | 'lab_cube_section' | 'oxyz_axes';
  width?: number;
  height?: number;
  animate?: boolean;
  reducedMotion?: boolean;
  className?: string;
}

/**
 * Lightweight code-driven 3D projection preview (zero Three.js import).
 * Renders real solid visible edges, camera-dependent dashed hidden edges,
 * shaded cross-sections, altitude and Oxyz axes using our pure 3D projection math.
 */
export const LiveGeo3DPreview: React.FC<LiveGeo3DPreviewProps> = ({
  scene,
  variant = 'hero_pyramid',
  width = 360,
  height = 240,
  animate = true,
  reducedMotion = false,
  className = '',
}) => {
  const [angle, setAngle] = useState(0.58);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  useEffect(() => {
    if (!animate || reducedMotion) return;
    let mounted = true;
    const tick = (now: number) => {
      if (!mounted) return;
      if (lastRef.current === 0) lastRef.current = now;
      const dt = Math.min(0.05, (now - lastRef.current) / 1000);
      lastRef.current = now;
      setAngle((prev) => (prev + dt * 0.34) % (Math.PI * 2));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      mounted = false;
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastRef.current = 0;
    };
  }, [animate, reducedMotion]);

  // If a real Geo3DScene is passed, render its crisp vector projection directly
  const sceneSvgData = useMemo(() => {
    if (!scene) return null;
    const radius = 10.5;
    const cam: CameraState3D = {
      position: v3(Math.cos(angle) * radius, Math.sin(angle) * radius, 6.2),
      target: v3(0, 0, 1.0),
      projection: 'orthographic',
      zoom: 1,
    };
    const projectedScene: Geo3DScene = {
      ...scene,
      camera: cam,
      showLabels: scene.order.length <= 16,
    };
    return exportScene3DToVectorSvg(projectedScene, width, height);
  }, [scene, angle, width, height]);

  // Built-in showcase geometries (pure mathematical projection)
  const showcase = useMemo(() => {
    if (scene) return null;
    const radius = 9.5;
    const camPos = v3(Math.cos(angle) * radius, Math.sin(angle) * radius, 5.2);
    const camTarget = v3(0, 0, 1.05);
    const scalePx = Math.min(width, height) / 5.4;

    const proj = (p: Vec3) =>
      projectPoint3D(p, camPos, camTarget, width, height, 'orthographic', scalePx);

    if (variant === 'lab_cube_section') {
      const solid = buildSolidGeometryData('cube', v3(0, 0, 0), v3(0, 0, 0), { a: 2.5 });
      const verts = solid.vertices;
      const structuralEdges = solid.edges.filter((e) => !e.isDiagonal && !e.isAltitude && !e.isAxis);
      const pseudoSolid = { vertices: verts, faces: solid.faces } as Geo3DSolid;
      const hiddenFlags = structuralEdges.map((e) =>
        isSolidEdgeHidden(pseudoSolid, e.a, e.b, camPos)
      );
      // Dynamic plane slicing cube across 6 midpoints -> regular hexagon cross-section
      const m1 = scale3(add3(verts[0], verts[1]), 0.5);
      const m2 = scale3(add3(verts[1], verts[2]), 0.5);
      const m3 = scale3(add3(verts[2], verts[6]), 0.5);
      const m4 = scale3(add3(verts[6], verts[7]), 0.5);
      const m5 = scale3(add3(verts[7], verts[4]), 0.5);
      const m6 = scale3(add3(verts[4], verts[0]), 0.5);
      const sectionPts = [m1, m2, m3, m4, m5, m6].map(proj);

      return {
        title: 'Thiết diện hình lập phương',
        verts: verts.map((v, i) => ({ ...proj(v), label: solid.defaultLabels[i] ?? `V${i + 1}` })),
        edges: structuralEdges.map((e, i) => ({
          p1: proj(verts[e.a]),
          p2: proj(verts[e.b]),
          hidden: hiddenFlags[i],
        })),
        sectionPts,
        altitude: null as null | { p1: { x: number; y: number }; p2: { x: number; y: number } },
        axes: {
          o: proj(v3(0, 0, 0)),
          x: proj(v3(2.4, 0, 0)),
          y: proj(v3(0, 2.4, 0)),
          z: proj(v3(0, 0, 3.1)),
        },
        specialLabels: [
          { ...proj(m1), text: 'M' },
          { ...proj(m3), text: 'N' },
          { ...proj(m5), text: 'P' },
        ],
      };
    }

    // Default hero_pyramid: Regular square pyramid S.ABCD with altitude SO + cross-section MNPQ
    const solid = buildSolidGeometryData('regular_pyramid', v3(0, 0, 0), v3(0, 0, 0), {
      sides: 4,
      a: 2.8,
      h: 2.9,
    });
    const verts = solid.vertices; // 0..3 base ABCD, 4 apex S
    const structuralEdges = solid.edges.filter((e) => !e.isDiagonal && !e.isAltitude && !e.isAxis);
    const pseudoSolid = { vertices: verts, faces: solid.faces } as Geo3DSolid;
    const hiddenFlags = structuralEdges.map((e) =>
      isSolidEdgeHidden(pseudoSolid, e.a, e.b, camPos)
    );
    const O = v3(0, 0, 0);
    const S = verts[4];
    const M = scale3(add3(S, verts[0]), 0.5);
    const N = scale3(add3(S, verts[1]), 0.5);
    const P = scale3(add3(S, verts[2]), 0.5);
    const Q = scale3(add3(S, verts[3]), 0.5);

    const faceNormal = normalize3(cross3(sub3(verts[1], verts[0]), sub3(verts[2], verts[0])));
    const viewDir = normalize3(sub3(camPos, O));
    const _baseVisible = faceNormal && viewDir ? dot3(faceNormal, viewDir) > 0 : false;
    void _baseVisible;

    return {
      title: 'Hình chóp S.ABCD & thiết diện',
      verts: verts.map((v, i) => ({ ...proj(v), label: solid.defaultLabels[i] ?? `V${i + 1}` })),
      edges: structuralEdges.map((e, i) => ({
        p1: proj(verts[e.a]),
        p2: proj(verts[e.b]),
        hidden: hiddenFlags[i],
      })),
      sectionPts: [M, N, P, Q].map(proj),
      altitude: { p1: proj(S), p2: proj(O) },
      axes: {
        o: proj(v3(0, 0, 0)),
        x: proj(v3(2.3, 0, 0)),
        y: proj(v3(0, 2.3, 0)),
        z: proj(v3(0, 0, 3.4)),
      },
      specialLabels: [
        { ...proj(O), text: 'O' },
        { ...proj(M), text: 'M' },
        { ...proj(P), text: 'P' },
      ],
    };
  }, [scene, variant, angle, width, height]);

  if (sceneSvgData) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center overflow-hidden ${className}`}
        dangerouslySetInnerHTML={{ __html: sceneSvgData }}
      />
    );
  }

  if (!showcase) return null;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-full select-none ${className}`}
      role="img"
      aria-label={showcase.title}
    >
      <defs>
        <linearGradient id="secFill3d" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0F766E" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      {/* Subtle Oxyz axes */}
      <g opacity="0.65">
        <line x1={showcase.axes.o.x} y1={showcase.axes.o.y} x2={showcase.axes.x.x} y2={showcase.axes.x.y} stroke="#DC2626" strokeWidth="1.2" />
        <line x1={showcase.axes.o.x} y1={showcase.axes.o.y} x2={showcase.axes.y.x} y2={showcase.axes.y.y} stroke="#059669" strokeWidth="1.2" />
        <line x1={showcase.axes.o.x} y1={showcase.axes.o.y} x2={showcase.axes.z.x} y2={showcase.axes.z.y} stroke="#0284C7" strokeWidth="1.2" />
        <text x={showcase.axes.x.x + 5} y={showcase.axes.x.y + 4} fill="#DC2626" fontSize="11" fontWeight="600">x</text>
        <text x={showcase.axes.y.x + 5} y={showcase.axes.y.y + 4} fill="#059669" fontSize="11" fontWeight="600">y</text>
        <text x={showcase.axes.z.x + 5} y={showcase.axes.z.y + 2} fill="#0284C7" fontSize="11" fontWeight="600">z</text>
      </g>

      {/* Hidden dashed edges */}
      {showcase.edges
        .filter((e) => e.hidden)
        .map((e, i) => (
          <line
            key={`hid-${i}`}
            x1={e.p1.x}
            y1={e.p1.y}
            x2={e.p2.x}
            y2={e.p2.y}
            stroke="#64748B"
            strokeWidth="1.4"
            strokeDasharray="5 4"
          />
        ))}

      {/* Altitude SO */}
      {showcase.altitude && (
        <line
          x1={showcase.altitude.p1.x}
          y1={showcase.altitude.p1.y}
          x2={showcase.altitude.p2.x}
          y2={showcase.altitude.p2.y}
          stroke="#D97706"
          strokeWidth="1.5"
          strokeDasharray="4 3"
        />
      )}

      {/* Cross-section polygon */}
      <polygon
        points={showcase.sectionPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
        fill="url(#secFill3d)"
        stroke="#0284C7"
        strokeWidth="1.8"
      />

      {/* Visible solid edges */}
      {showcase.edges
        .filter((e) => !e.hidden)
        .map((e, i) => (
          <line
            key={`vis-${i}`}
            x1={e.p1.x}
            y1={e.p1.y}
            x2={e.p2.x}
            y2={e.p2.y}
            stroke="#0F172A"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}

      {/* Vertices + crisp labels */}
      {showcase.verts.map((v, i) => (
        <g key={`v-${i}`}>
          <circle cx={v.x} cy={v.y} r="3.4" fill="#0F766E" stroke="#FFFFFF" strokeWidth="1.2" />
          <text
            x={v.x + (v.x < width * 0.5 ? -13 : 7)}
            y={v.y + (v.y < height * 0.45 ? -7 : 13)}
            fill="#0F172A"
            fontSize="12"
            fontWeight="700"
          >
            {v.label}
          </text>
        </g>
      ))}

      {/* Special cross-section / foot labels */}
      {showcase.specialLabels.map((pt, i) => (
        <g key={`sp-${i}`}>
          <circle cx={pt.x} cy={pt.y} r="2.8" fill="#0284C7" />
          <text x={pt.x + 6} y={pt.y - 5} fill="#0369A1" fontSize="11" fontWeight="600">
            {pt.text}
          </text>
        </g>
      ))}
    </svg>
  );
};
