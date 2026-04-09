import { useEffect, useState, useMemo } from 'react';

const generateKeyframes = (count) => {
  return [...Array(count)].map((_, i) => {
    const midX1 = Math.random() * 100;
    const midY1 = Math.random() * 100;
    const midX2 = Math.random() * 100;
    const midY2 = Math.random() * 100;
    return `
      @keyframes moveRandom${i} {
        0% { transform: translate(0, 0); opacity: 0.6; }
        25% { transform: translate(${midX1 - 50}vw, ${midY1 - 50}vh); opacity: 1; }
        50% { transform: translate(${midX2 - 50}vw, ${midY2 - 50}vh); opacity: 0.8; }
        75% { transform: translate(${(midX1 + midX2) / 2 - 50}vw, ${(midY1 + midY2) / 2 - 50}vh); opacity: 1; }
        100% { transform: translate(0, 0); opacity: 0.6; }
      }
    `;
  }).join('');
};

const staticStars = [...Array(35)].map(() => ({
  width: Math.random() * 3 + 1,
  height: Math.random() * 3 + 1,
  top: Math.random() * 100,
  left: Math.random() * 100,
  animationDelay: Math.random() * 3,
  animationDuration: Math.random() * 2 + 2,
}));

const movingStars = [...Array(20)].map((_, i) => ({
  duration: 30 + Math.random() * 30,
  delay: Math.random() * 5,
  startX: Math.random() * 100,
  startY: Math.random() * 100,
  size: Math.random() * 4 + 2,
  index: i,
}));

const shootingStars = [...Array(3)].map(() => ({
  top: Math.random() * 50,
  duration: 3 + Math.random() * 2,
}));

export const CosmicBackground = () => {
  const [mounted, setMounted] = useState(false);
  const keyframes = useMemo(() => generateKeyframes(20), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {/* Static stars */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {staticStars.map((s, i) => (
          <div
            key={i}
            className="animate-pulse"
            style={{
              position: 'absolute',
              background: 'white',
              borderRadius: '50%',
              width: s.width + 'px',
              height: s.height + 'px',
              top: s.top + '%',
              left: s.left + '%',
              animationDelay: s.animationDelay + 's',
              animationDuration: s.animationDuration + 's',
            }}
          />
        ))}
      </div>

      {/* Moving stars */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {movingStars.map((s) => (
          <div
            key={`moving-${s.index}`}
            style={{
              position: 'absolute',
              background: 'white',
              borderRadius: '50%',
              width: s.size + 'px',
              height: s.size + 'px',
              left: s.startX + '%',
              top: s.startY + '%',
              animation: `moveRandom${s.index} ${s.duration}s ease-in-out ${s.delay}s infinite`,
              boxShadow: '0 0 20px 4px rgba(255,255,255,0.8), 0 0 30px 6px rgba(255,255,255,0.4)',
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div style={{
        position: 'absolute', top: 80, left: 40,
        width: 384, height: 384,
        background: 'rgba(147,51,234,0.4)',
        borderRadius: '50%', filter: 'blur(60px)',
        pointerEvents: 'none',
      }} className="animate-pulse" />
      <div style={{
        position: 'absolute', bottom: 80, right: 40,
        width: 500, height: 500,
        background: 'rgba(6,182,212,0.4)',
        borderRadius: '50%', filter: 'blur(60px)',
        pointerEvents: 'none', animationDelay: '1s',
      }} className="animate-pulse" />

      {/* Shooting stars */}
      {mounted && shootingStars.map((s, i) => (
        <div
          key={`shooting-${i}`}
          style={{
            position: 'absolute',
            width: 4, height: 4,
            background: 'white',
            borderRadius: '50%',
            pointerEvents: 'none',
            top: s.top + '%',
            left: '-10px',
            animation: `shoot ${s.duration}s linear ${i * 4}s infinite`,
            boxShadow: '0 0 10px 2px rgba(255,255,255,0.8)',
          }}
        />
      ))}

      <style>{`
        @keyframes shoot {
          0% { transform: translateX(0) translateY(0); opacity: 1; }
          100% { transform: translateX(100vw) translateY(50vh); opacity: 0; }
        }
        ${keyframes}
      `}</style>
    </>
  );
};
