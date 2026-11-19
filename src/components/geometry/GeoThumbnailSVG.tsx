import React from 'react';

interface GeoThumbnailSVGProps {
  kind: string;
  accentColor?: string;
  className?: string;
}

export const GeoThumbnailSVG: React.FC<GeoThumbnailSVGProps> = ({
  kind,
  accentColor = '#0F766E',
  className = 'w-full h-28',
}) => {
  const strokeMain = accentColor;
  const strokeSub = '#0284C7';
  const strokeGold = '#D97706';
  const strokeViolet = '#7C3AED';

  const renderDiagram = () => {
    switch (kind) {
      case 'equilateral':
        return (
          <>
            <circle cx="62" cy="70" r="36" fill="none" stroke={strokeSub} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
            <circle cx="98" cy="70" r="36" fill="none" stroke={strokeSub} strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
            <polygon points="62,70 98,70 80,38.8" fill={strokeMain} fillOpacity="0.14" stroke={strokeMain} strokeWidth="2.2" />
            <circle cx="62" cy="70" r="3.2" fill="#172033" />
            <circle cx="98" cy="70" r="3.2" fill="#172033" />
            <circle cx="80" cy="38.8" r="3.4" fill={strokeGold} />
          </>
        );
      case 'perpendicular':
        return (
          <>
            <line x1="25" y1="68" x2="135" y2="68" stroke="#172033" strokeWidth="2" />
            <circle cx="52" cy="68" r="36" fill="none" stroke={strokeSub} strokeWidth="1.1" strokeDasharray="3 3" opacity="0.55" />
            <circle cx="108" cy="68" r="36" fill="none" stroke={strokeSub} strokeWidth="1.1" strokeDasharray="3 3" opacity="0.55" />
            <line x1="80" y1="14" x2="80" y2="88" stroke={strokeMain} strokeWidth="2.2" />
            <rect x="80" y="59" width="9" height="9" fill="none" stroke={strokeGold} strokeWidth="1.6" />
            <circle cx="80" cy="68" r="3.2" fill={strokeGold} />
          </>
        );
      case 'angle_bisector':
        return (
          <>
            <line x1="34" y1="74" x2="134" y2="74" stroke="#172033" strokeWidth="2" />
            <line x1="34" y1="74" x2="112" y2="18" stroke="#172033" strokeWidth="2" />
            <path d="M 68 74 A 34 34 0 0 0 61.5 54.2" fill="none" stroke={strokeSub} strokeWidth="1.5" />
            <line x1="34" y1="74" x2="132" y2="42" stroke={strokeViolet} strokeWidth="2.2" />
            <circle cx="34" cy="74" r="3.2" fill={strokeGold} />
          </>
        );
      case 'parallel':
        return (
          <>
            <line x1="22" y1="72" x2="138" y2="62" stroke="#172033" strokeWidth="2" />
            <line x1="22" y1="38" x2="138" y2="28" stroke={strokeMain} strokeWidth="2.2" />
            <line x1="48" y1="70" x2="72" y2="34" stroke={strokeSub} strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="94" y1="66" x2="118" y2="30" stroke={strokeSub} strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="72" cy="34" r="3.4" fill={strokeGold} />
          </>
        );
      case 'square':
        return (
          <>
            <rect x="52" y="22" width="56" height="56" fill={strokeGold} fillOpacity="0.14" stroke={strokeGold} strokeWidth="2.2" />
            <line x1="52" y1="22" x2="108" y2="78" stroke={strokeSub} strokeWidth="1.2" strokeDasharray="3 3" />
            <line x1="108" y1="22" x2="52" y2="78" stroke={strokeSub} strokeWidth="1.2" strokeDasharray="3 3" />
            <circle cx="52" cy="78" r="3" fill="#172033" />
            <circle cx="108" cy="78" r="3" fill="#172033" />
          </>
        );
      case 'right_triangle':
        return (
          <>
            <circle cx="80" cy="64" r="38" fill="none" stroke={strokeSub} strokeWidth="1.3" strokeDasharray="3 3" />
            <polygon points="42,64 118,64 62,30.5" fill={strokeSub} fillOpacity="0.14" stroke={strokeMain} strokeWidth="2.2" />
            <circle cx="42" cy="64" r="3" fill="#172033" />
            <circle cx="118" cy="64" r="3" fill="#172033" />
            <circle cx="62" cy="30.5" r="3.4" fill={strokeGold} />
          </>
        );
      case 'euler_line':
        return (
          <>
            <polygon points="62,18 32,78 128,74" fill={strokeViolet} fillOpacity="0.09" stroke="#172033" strokeWidth="1.8" />
            <line x1="40" y1="30" x2="114" y2="66" stroke={strokeGold} strokeWidth="2.2" />
            <circle cx="62" cy="40.8" r="3.2" fill={strokeViolet} />
            <circle cx="74" cy="46.6" r="3.2" fill={strokeMain} />
            <circle cx="86" cy="52.4" r="3.2" fill={strokeSub} />
          </>
        );
      case 'symmetry':
        return (
          <>
            <line x1="80" y1="12" x2="80" y2="88" stroke={strokeSub} strokeWidth="2" strokeDasharray="4 3" />
            <polygon points="34,70 64,66 48,30" fill={strokeMain} fillOpacity="0.15" stroke={strokeMain} strokeWidth="2" />
            <polygon points="126,70 96,66 112,30" fill={strokeGold} fillOpacity="0.16" stroke={strokeGold} strokeWidth="2" />
            <line x1="48" y1="30" x2="112" y2="30" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="2 2" />
          </>
        );
      case 'thales':
        return (
          <>
            <line x1="30" y1="76" x2="134" y2="76" stroke="#172033" strokeWidth="2" />
            <line x1="30" y1="76" x2="118" y2="20" stroke={strokeSub} strokeWidth="1.6" />
            <line x1="59" y1="57" x2="64" y2="76" stroke={strokeMain} strokeWidth="1.6" strokeDasharray="3 2" />
            <line x1="88" y1="39" x2="99" y2="76" stroke={strokeMain} strokeWidth="1.6" strokeDasharray="3 2" />
            <line x1="118" y1="20" x2="134" y2="76" stroke={strokeMain} strokeWidth="2" />
            <circle cx="64" cy="76" r="3" fill={strokeGold} />
            <circle cx="99" cy="76" r="3" fill={strokeGold} />
          </>
        );
      case 'golden':
        return (
          <>
            <circle cx="80" cy="50" r="34" fill="none" stroke={strokeSub} strokeWidth="1.1" strokeDasharray="3 3" opacity="0.6" />
            <polygon
              points="80,16 112.3,39.5 100,77.5 60,77.5 47.7,39.5"
              fill={strokeGold}
              fillOpacity="0.14"
              stroke={strokeGold}
              strokeWidth="2"
            />
            <polygon
              points="80,16 100,77.5 47.7,39.5 112.3,39.5 60,77.5"
              fill="none"
              stroke={strokeMain}
              strokeWidth="1.3"
            />
          </>
        );
      case 'tangent':
        return (
          <>
            <circle cx="62" cy="50" r="28" fill={strokeSub} fillOpacity="0.08" stroke={strokeSub} strokeWidth="2" />
            <line x1="132" y1="50" x2="48" y2="18" stroke={strokeMain} strokeWidth="2" />
            <line x1="132" y1="50" x2="48" y2="82" stroke={strokeMain} strokeWidth="2" />
            <circle cx="62" cy="50" r="2.8" fill="#172033" />
            <circle cx="132" cy="50" r="3.4" fill={strokeGold} />
          </>
        );
      case 'radical_axis':
        return (
          <>
            <circle cx="62" cy="50" r="28" fill="none" stroke={strokeMain} strokeWidth="2" />
            <circle cx="98" cy="50" r="24" fill="none" stroke={strokeSub} strokeWidth="2" />
            <line x1="82.5" y1="12" x2="82.5" y2="88" stroke={strokeViolet} strokeWidth="2.2" />
            <circle cx="82.5" cy="30.8" r="3" fill={strokeGold} />
            <circle cx="82.5" cy="69.2" r="3" fill={strokeGold} />
          </>
        );
      case 'polygon':
        return (
          <>
            <circle cx="80" cy="50" r="34" fill="none" stroke="#94A3B8" strokeWidth="1.2" strokeDasharray="3 3" />
            <polygon
              points="114,50 97,79.4 63,79.4 46,50 63,20.6 97,20.6"
              fill={strokeSub}
              fillOpacity="0.14"
              stroke={strokeSub}
              strokeWidth="2.2"
            />
            <circle cx="80" cy="50" r="2.8" fill={strokeGold} />
          </>
        );
      case 'sangaku':
        return (
          <>
            <rect x="44" y="16" width="72" height="68" fill={strokeGold} fillOpacity="0.07" stroke="#172033" strokeWidth="1.8" />
            <circle cx="80" cy="50" r="32" fill="none" stroke={strokeGold} strokeWidth="2" />
            <circle cx="64" cy="50" r="16" fill={strokeMain} fillOpacity="0.16" stroke={strokeMain} strokeWidth="1.8" />
            <circle cx="96" cy="50" r="16" fill={strokeSub} fillOpacity="0.16" stroke={strokeSub} strokeWidth="1.8" />
          </>
        );
      case 'compass_only':
        return (
          <>
            <circle cx="62" cy="50" r="28" fill="none" stroke={strokeViolet} strokeWidth="1.9" />
            <circle cx="90" cy="50" r="28" fill="none" stroke={strokeSub} strokeWidth="1.9" />
            <circle cx="76" cy="25.8" r="28" fill="none" stroke={strokeGold} strokeWidth="1.4" strokeDasharray="3 3" />
            <circle cx="62" cy="50" r="3" fill="#172033" />
            <circle cx="90" cy="50" r="3" fill="#172033" />
            <circle cx="118" cy="50" r="3.4" fill={strokeGold} />
          </>
        );
      case 'straightedge_only':
        return (
          <>
            <line x1="20" y1="78" x2="140" y2="78" stroke="#172033" strokeWidth="2" />
            <line x1="34" y1="30" x2="126" y2="30" stroke="#172033" strokeWidth="2" />
            <line x1="34" y1="78" x2="110" y2="30" stroke={strokeSub} strokeWidth="1.6" />
            <line x1="126" y1="78" x2="50" y2="30" stroke={strokeSub} strokeWidth="1.6" />
            <line x1="80" y1="12" x2="80" y2="88" stroke={strokeMain} strokeWidth="2.2" />
            <circle cx="80" cy="78" r="3.4" fill={strokeGold} />
          </>
        );
      case 'nine_point':
        return (
          <>
            <polygon points="72,16 32,78 128,74" fill="none" stroke="#172033" strokeWidth="1.8" />
            <circle cx="78" cy="54" r="24" fill={strokeViolet} fillOpacity="0.1" stroke={strokeViolet} strokeWidth="2" />
            <circle cx="80" cy="76" r="2.8" fill={strokeGold} />
            <circle cx="52" cy="47" r="2.8" fill={strokeGold} />
            <circle cx="100" cy="45" r="2.8" fill={strokeGold} />
          </>
        );
      case 'olympic':
      default:
        return (
          <>
            <polygon points="80,26 48,72 112,72" fill={strokeGold} fillOpacity="0.12" stroke="#172033" strokeWidth="1.8" />
            <circle cx="80" cy="54" r="32" fill="none" stroke={strokeSub} strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="80" y1="26" x2="80" y2="57" stroke={strokeMain} strokeWidth="1.8" />
            <line x1="48" y1="72" x2="80" y2="57" stroke={strokeMain} strokeWidth="1.8" />
            <line x1="112" y1="72" x2="80" y2="57" stroke={strokeMain} strokeWidth="1.8" />
            <circle cx="80" cy="57" r="3.8" fill={strokeGold} />
          </>
        );
    }
  };

  return (
    <svg
      viewBox="0 0 160 100"
      className={className}
      role="img"
      aria-label={`Minh họa hình học ${kind}`}
    >
      <defs>
        <pattern id={`g_${kind}`} width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeOpacity="0.06" strokeWidth="0.8" />
        </pattern>
      </defs>
      <rect width="160" height="100" fill={`url(#g_${kind})`} rx="8" />
      {renderDiagram()}
    </svg>
  );
};
