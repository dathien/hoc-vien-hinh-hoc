import React, { useCallback, useEffect, useId, useMemo, useRef } from 'react';
import { exportScene3DToVectorSvg } from '../../geometry3d/export3d';
import { GeometryLabelManager } from '../../geometry3d/labelManager';
import {
  buildShowcaseModel,
  projectShowcaseFrame,
  type ProjectedShowcaseFrame,
  type ShowcaseVariant,
} from '../../geometry3d/showcasePreview3d';
import { v3 } from '../../geometry3d/math3d';
import type { CameraState3D, Geo3DScene } from '../../geometry3d/types3d';

interface LiveGeo3DPreviewProps {
  /** Optional real Geo3DScene to render as an accurate live SVG projection */
  scene?: Geo3DScene;
  /** Showcase variant when no custom scene is supplied */
  variant?: ShowcaseVariant;
  width?: number;
  height?: number;
  animate?: boolean;
  reducedMotion?: boolean;
  className?: string;
}

const INITIAL_ANGLE = 0.58;
const ROTATION_SPEED_RAD_PER_SEC = 0.34;

/**
 * Lightweight code-driven 3D projection preview (zero Three.js import).
 *
 * Architecture:
 * - Static 3D solid built ONCE per variant (zero per-frame geometry rebuilds).
 * - Single requestAnimationFrame loop mutates SVG DOM attributes directly
 *   (zero per-frame React re-renders, zero label DOM recreation, zero key changes).
 * - Uses shared GeometryLabelManager with hysteresis + edge avoidance so labels
 *   (including S and z) never flicker, jump, disappear, or overlap across 360°.
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
  const gradId = useId();
  const angleRef = useRef<number>(INITIAL_ANGLE);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const pausedByUserRef = useRef<boolean>(false);
  const labelManagerRef = useRef<GeometryLabelManager>(new GeometryLabelManager());

  // DOM refs for direct rAF updates (zero React churn during animation)
  const axisXRef = useRef<SVGLineElement | null>(null);
  const axisYRef = useRef<SVGLineElement | null>(null);
  const axisZRef = useRef<SVGLineElement | null>(null);
  const hiddenEdgeRefs = useRef<Array<SVGLineElement | null>>([]);
  const visibleEdgeRefs = useRef<Array<SVGLineElement | null>>([]);
  const altitudeRef = useRef<SVGLineElement | null>(null);
  const sectionPolyRef = useRef<SVGPolygonElement | null>(null);
  const dotRefs = useRef<Map<string, SVGCircleElement>>(new Map());
  const labelRefs = useRef<Map<string, SVGTextElement>>(new Map());

  // Static showcase model built ONCE per variant
  const model = useMemo(() => (scene ? null : buildShowcaseModel(variant)), [scene, variant]);

  // Initial deterministic frame (dt = 0) for instant SSR/first-paint layout
  const initialFrame = useMemo<ProjectedShowcaseFrame | null>(() => {
    if (!model) return null;
    const mgr = new GeometryLabelManager();
    return projectShowcaseFrame(model, INITIAL_ANGLE, width, height, mgr, 0);
  }, [model, width, height]);

  // Reset hysteresis state cleanly whenever variant or viewport dimensions change
  useEffect(() => {
    labelManagerRef.current.reset();
    angleRef.current = INITIAL_ANGLE;
  }, [variant, width, height]);

  // Apply a computed frame directly to the stable SVG DOM nodes in a single tick
  const applyFrameToDom = useCallback((frame: ProjectedShowcaseFrame) => {
    const setLine = (
      el: SVGLineElement | null,
      x1: number,
      y1: number,
      x2: number,
      y2: number
    ) => {
      if (!el) return;
      el.setAttribute('x1', x1.toFixed(2));
      el.setAttribute('y1', y1.toFixed(2));
      el.setAttribute('x2', x2.toFixed(2));
      el.setAttribute('y2', y2.toFixed(2));
    };

    setLine(axisXRef.current, frame.axes.o.x, frame.axes.o.y, frame.axes.x.x, frame.axes.x.y);
    setLine(axisYRef.current, frame.axes.o.x, frame.axes.o.y, frame.axes.y.x, frame.axes.y.y);
    setLine(axisZRef.current, frame.axes.o.x, frame.axes.o.y, frame.axes.z.x, frame.axes.z.y);

    for (let i = 0; i < frame.edges.length; i++) {
      const e = frame.edges[i];
      const hidEl = hiddenEdgeRefs.current[i];
      const visEl = visibleEdgeRefs.current[i];
      if (hidEl) {
        if (e.hidden) {
          setLine(hidEl, e.x1, e.y1, e.x2, e.y2);
          hidEl.setAttribute('visibility', 'visible');
        } else {
          hidEl.setAttribute('visibility', 'hidden');
        }
      }
      if (visEl) {
        if (!e.hidden) {
          setLine(visEl, e.x1, e.y1, e.x2, e.y2);
          visEl.setAttribute('visibility', 'visible');
        } else {
          visEl.setAttribute('visibility', 'hidden');
        }
      }
    }

    if (frame.altitude && altitudeRef.current) {
      setLine(
        altitudeRef.current,
        frame.altitude.x1,
        frame.altitude.y1,
        frame.altitude.x2,
        frame.altitude.y2
      );
    }

    if (sectionPolyRef.current) {
      sectionPolyRef.current.setAttribute(
        'points',
        frame.sectionPoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
      );
    }

    for (const d of frame.dots) {
      const dotEl = dotRefs.current.get(d.id);
      if (dotEl) {
        dotEl.setAttribute('cx', d.x.toFixed(2));
        dotEl.setAttribute('cy', d.y.toFixed(2));
      }
    }

    for (const lbl of frame.labels) {
      const textEl = labelRefs.current.get(lbl.id);
      if (textEl) {
        textEl.setAttribute('x', lbl.x.toFixed(2));
        textEl.setAttribute('y', lbl.y.toFixed(2));
      }
    }
  }, []);

  // Single continuous delta-time rAF loop for showcase mode (zero React re-renders!)
  useEffect(() => {
    if (scene || !model) return;

    // Seed label manager immediately at initial angle
    const first = projectShowcaseFrame(
      model,
      angleRef.current,
      width,
      height,
      labelManagerRef.current,
      0
    );
    applyFrameToDom(first);

    if (!animate || reducedMotion) return;

    let mounted = true;
    lastTimeRef.current = 0;

    const tick = (now: number) => {
      if (!mounted) return;
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = now;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const rawDt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;
      const dt = Math.min(0.05, Math.max(0, rawDt));

      if (!pausedByUserRef.current && !document.hidden && dt > 0) {
        // Continuous angle progression; wrap smoothly modulo 2*PI with zero visual jump
        angleRef.current = (angleRef.current + dt * ROTATION_SPEED_RAD_PER_SEC) % (Math.PI * 2);
        const frame = projectShowcaseFrame(
          model,
          angleRef.current,
          width,
          height,
          labelManagerRef.current,
          dt
        );
        applyFrameToDom(frame);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mounted = false;
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = 0;
    };
  }, [scene, model, width, height, animate, reducedMotion, applyFrameToDom]);

  // Custom Geo3DScene thumbnail mode (Templates, Guide, My Drawings)
  const sceneSvgData = useMemo(() => {
    if (!scene) return null;
    const radius = 10.5;
    const cam: CameraState3D = {
      position: v3(Math.cos(INITIAL_ANGLE) * radius, Math.sin(INITIAL_ANGLE) * radius, 6.2),
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
  }, [scene, width, height]);

  if (sceneSvgData) {
    return (
      <div
        className={`w-full h-full flex items-center justify-center overflow-hidden ${className}`}
        dangerouslySetInnerHTML={{ __html: sceneSvgData }}
      />
    );
  }

  if (!model || !initialFrame) return null;

  const isCompact = Math.min(width, height) < 300;
  const labelFontSize = isCompact ? 12 : 13;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`w-full h-full select-none ${className}`}
      role="img"
      aria-label={model.title}
      data-preview-variant={variant}
      onPointerEnter={() => {
        pausedByUserRef.current = true;
      }}
      onPointerLeave={() => {
        pausedByUserRef.current = false;
      }}
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#0F766E" stopOpacity="0.22" />
        </linearGradient>
      </defs>

      {/* Layer 1: Subtle Oxyz coordinate axes */}
      <g opacity="0.72" data-layer="axes-3d">
        <line
          ref={axisXRef}
          x1={initialFrame.axes.o.x}
          y1={initialFrame.axes.o.y}
          x2={initialFrame.axes.x.x}
          y2={initialFrame.axes.x.y}
          stroke="#DC2626"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <line
          ref={axisYRef}
          x1={initialFrame.axes.o.x}
          y1={initialFrame.axes.o.y}
          x2={initialFrame.axes.y.x}
          y2={initialFrame.axes.y.y}
          stroke="#059669"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
        <line
          ref={axisZRef}
          x1={initialFrame.axes.o.x}
          y1={initialFrame.axes.o.y}
          x2={initialFrame.axes.z.x}
          y2={initialFrame.axes.z.y}
          stroke="#0284C7"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </g>

      {/* Layer 2: Hidden dashed edges (behind cross-section, zero DOM recreation) */}
      <g data-layer="hidden-edges-3d">
        {initialFrame.edges.map((e, i) => (
          <line
            key={`hid-${i}`}
            ref={(el) => {
              hiddenEdgeRefs.current[i] = el;
            }}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            visibility={e.hidden ? 'visible' : 'hidden'}
            stroke="#64748B"
            strokeWidth="1.4"
            strokeDasharray="5 4"
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* Layer 3: Altitude SO */}
      {initialFrame.altitude && (
        <line
          ref={altitudeRef}
          x1={initialFrame.altitude.x1}
          y1={initialFrame.altitude.y1}
          x2={initialFrame.altitude.x2}
          y2={initialFrame.altitude.y2}
          stroke="#D97706"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          strokeLinecap="round"
        />
      )}

      {/* Layer 4: Shaded cross-section polygon */}
      <polygon
        ref={sectionPolyRef}
        points={initialFrame.sectionPoints.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')}
        fill={`url(#${gradId})`}
        stroke="#0284C7"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Layer 5: Visible solid edges (in front of cross-section, zero DOM recreation) */}
      <g data-layer="visible-edges-3d">
        {initialFrame.edges.map((e, i) => (
          <line
            key={`vis-${i}`}
            ref={(el) => {
              visibleEdgeRefs.current[i] = el;
            }}
            x1={e.x1}
            y1={e.y1}
            x2={e.x2}
            y2={e.y2}
            visibility={e.hidden ? 'hidden' : 'visible'}
            stroke="#0F172A"
            strokeWidth="2"
            strokeLinecap="round"
          />
        ))}
      </g>

      {/* Layer 6: Vertex & special point markers */}
      <g data-layer="points-3d">
        {initialFrame.dots.map((d) => (
          <circle
            key={d.id}
            ref={(el) => {
              if (el) dotRefs.current.set(d.id, el);
              else dotRefs.current.delete(d.id);
            }}
            cx={d.x}
            cy={d.y}
            r={d.isSpecial ? 2.8 : 3.4}
            fill={d.isSpecial ? '#0284C7' : '#0F766E'}
            stroke="#FFFFFF"
            strokeWidth="1.2"
          />
        ))}
      </g>

      {/* Layer 7: Dedicated top-level screen-space label overlay (never occluded, zero flicker) */}
      <g data-layer="labels-3d">
        {initialFrame.labels.map((lbl) => (
          <text
            key={lbl.id}
            ref={(el) => {
              if (el) labelRefs.current.set(lbl.id, el);
              else labelRefs.current.delete(lbl.id);
            }}
            data-label-id={lbl.id}
            data-label-text={lbl.text}
            x={lbl.x}
            y={lbl.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={lbl.color}
            fontFamily="Be Vietnam Pro, system-ui, sans-serif"
            fontSize={lbl.category === 'axis' ? labelFontSize - 0.5 : labelFontSize}
            fontWeight="700"
            fontStyle={lbl.category === 'axis' ? 'italic' : 'normal'}
            stroke="#FFFFFF"
            strokeWidth="3.6"
            strokeLinejoin="round"
            paintOrder="stroke"
          >
            {lbl.text}
          </text>
        ))}
      </g>
    </svg>
  );
};
