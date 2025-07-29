import { useEffect, useState } from 'react';

interface TrailPoint {
  x: number;
  y: number;
  timestamp: number;
}

export function MouseTrail() {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let animationFrame: number;
    const trailLength = 20;
    const trailDecay = 3000; // 3 seconds

    const updateTrail = () => {
      const now = Date.now();
      setTrail(currentTrail => 
        currentTrail.filter(point => now - point.timestamp < trailDecay)
      );
      animationFrame = requestAnimationFrame(updateTrail);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const newPoint: TrailPoint = {
        x: e.clientX,
        y: e.clientY,
        timestamp: Date.now()
      };

      setTrail(currentTrail => {
        const newTrail = [newPoint, ...currentTrail].slice(0, trailLength);
        return newTrail;
      });

      if (!isVisible) {
        setIsVisible(true);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
      setTimeout(() => setTrail([]), 300);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    animationFrame = requestAnimationFrame(updateTrail);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrame);
    };
  }, [isVisible]);

  if (!isVisible || trail.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {trail.map((point, index) => {
        const age = Date.now() - point.timestamp;
        const opacity = Math.max(0, 1 - (age / 3000)) * (1 - index / trail.length);
        const scale = 1 - (index / trail.length) * 0.8;
        
        return (
          <div
            key={`${point.timestamp}-${index}`}
            className="absolute rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 blur-sm"
            style={{
              left: point.x - 8,
              top: point.y - 8,
              width: 16 * scale,
              height: 16 * scale,
              opacity,
              transform: `translate(-50%, -50%) scale(${scale})`,
              transition: 'opacity 0.1s ease-out',
            }}
          />
        );
      })}
    </div>
  );
}

export function ParticleBackground() {
  const [particles, setParticles] = useState<Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
  }>>([]);

  useEffect(() => {
    const particleCount = 50;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 3 + 1,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    setParticles(newParticles);

    const animate = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: (particle.x + particle.vx + window.innerWidth) % window.innerWidth,
        y: (particle.y + particle.vy + window.innerHeight) % window.innerHeight,
      })));
    };

    const interval = setInterval(animate, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none opacity-30 dark:opacity-10">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-primary animate-pulse"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            opacity: particle.opacity,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );
}