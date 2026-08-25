import React, { useEffect, useRef } from 'react';

export default function GlobalMinimalMotionBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d', { alpha: true });
      if (!ctx) return;

      let animId: number;
      let width = (canvas.width = window.innerWidth);
      let height = (canvas.height = window.innerHeight);

      const handleResize = () => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      };

      window.addEventListener('resize', handleResize, { passive: true });

      const particleCount = 24;
      const particles = Array.from({ length: particleCount }, () => ({
        x: Math.random() * Math.max(width, 300),
        y: Math.random() * Math.max(height, 300),
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        radius: 1.2 + Math.random() * 1.8,
        pulse: Math.random() * Math.PI * 2,
        isGold: Math.random() > 0.35,
      }));

      let time = 0;

      const render = () => {
        try {
          time += 0.001;
          ctx.clearRect(0, 0, width, height);

          const waveCount = 3;
          for (let w = 0; w < waveCount; w++) {
            const yBase = height * (0.2 + w * 0.3);
            const freq = 0.0012 + w * 0.0003;
            const amp = 22 + w * 12;
            const phase = time * (0.7 + w * 0.2) + w * 1.4;

            ctx.beginPath();
            for (let x = 0; x <= width; x += 16) {
              const y = yBase + Math.sin(x * freq + phase) * amp;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }

            const alpha = (0.05 + Math.sin(time + w) * 0.025).toFixed(3);
            const grad = ctx.createLinearGradient(0, 0, width, 0);
            grad.addColorStop(0, 'rgba(189, 123, 32, 0.01)');
            grad.addColorStop(0.3, `rgba(189, 123, 32, ${alpha})`);
            grad.addColorStop(0.7, `rgba(217, 164, 70, ${alpha})`);
            grad.addColorStop(1, 'rgba(189, 123, 32, 0.01)');

            ctx.strokeStyle = grad;
            ctx.lineWidth = w === 1 ? 1.4 : 0.8;
            ctx.stroke();
          }

          for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
              const dx = particles[i].x - particles[j].x;
              const dy = particles[i].y - particles[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 130) {
                const alpha = ((1 - dist / 130) * 0.09).toFixed(3);
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.strokeStyle = `rgba(189, 123, 32, ${alpha})`;
                ctx.lineWidth = 0.6;
                ctx.stroke();
              }
            }
          }

          particles.forEach((p) => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < -10) p.x = width + 10;
            if (p.x > width + 10) p.x = -10;
            if (p.y < -10) p.y = height + 10;
            if (p.y > height + 10) p.y = -10;

            p.pulse += 0.008;
            const opacity = 0.2 + Math.sin(p.pulse) * 0.15;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.isGold
              ? `rgba(189, 123, 32, ${opacity.toFixed(3)})`
              : `rgba(217, 164, 70, ${opacity.toFixed(3)})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(245, 158, 11, ${(opacity * 0.2).toFixed(3)})`;
            ctx.fill();
          });

          animId = requestAnimationFrame(render);
        } catch {
          // silently ignore any animation frame render hiccups
        }
      };

      render();

      return () => {
        window.removeEventListener('resize', handleResize);
        if (animId) cancelAnimationFrame(animId);
      };
    } catch {
      // safely fallback
    }
  }, []);

  return (
    <div className="draa-global-bg-wrapper" aria-hidden="true">
      <canvas ref={canvasRef} className="draa-global-bg-canvas" />
      <div className="draa-global-glow draa-global-glow-top" />
      <div className="draa-global-glow draa-global-glow-middle" />
      <div className="draa-global-glow draa-global-glow-bottom" />
    </div>
  );
}
