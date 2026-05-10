import { useMemo } from "react";

export default function Petals({ count = 14 }: { count?: number }) {
  const petals = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 8,
    size: 6 + Math.random() * 12,
    rotate: Math.random() * 360,
  })), [count]);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {petals.map(p => (
        <div key={p.id}
          className="absolute"
          style={{
            left: `${p.left}%`,
            top: `-10vh`,
            width: p.size, height: p.size,
            animation: `float-petal ${p.duration}s linear ${p.delay}s infinite`,
            transform: `rotate(${p.rotate}deg)`,
          }}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="size-full text-accent/40">
            <path d="M12 2C9 6 7 9 7 13a5 5 0 0010 0c0-4-2-7-5-11z" />
          </svg>
        </div>
      ))}
    </div>
  );
}
