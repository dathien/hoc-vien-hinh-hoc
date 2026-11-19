import React, { useEffect, useState } from 'react';
import { useApp } from '../../store/AppContext';

interface ConfettiBurstProps {
  trigger: number;
}

const COLORS = ['#0F766E', '#0284C7', '#7C3AED', '#F59E0B', '#10B981', '#EA580C'];

interface Piece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
}

export const ConfettiBurst: React.FC<ConfettiBurstProps> = ({ trigger }) => {
  const { settings } = useApp();
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (trigger <= 0 || settings.reducedMotion) return;
    const generated: Piece[] = Array.from({ length: 34 }, (_, i) => ({
      id: i,
      left: 8 + Math.random() * 84,
      delay: Math.random() * 0.25,
      duration: 1.4 + Math.random() * 1.1,
      color: COLORS[i % COLORS.length],
      size: 7 + Math.round(Math.random() * 6),
      rotate: Math.round(Math.random() * 360),
    }));
    setPieces(generated);
    const t = window.setTimeout(() => setPieces([]), 2600);
    return () => window.clearTimeout(t);
  }, [trigger, settings.reducedMotion]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            top: '-16px',
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${Math.round(p.size * 0.6)}px`,
            backgroundColor: p.color,
            borderRadius: '2px',
            transform: `rotate(${p.rotate}deg)`,
            animation: `hhs-confetti ${p.duration}s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes hhs-confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(96vh) rotate(540deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};
