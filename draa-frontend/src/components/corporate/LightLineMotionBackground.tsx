import React, { useEffect, useRef } from 'react';

interface LightLineMotionBackgroundProps {
  accentColor?: string;
  secondaryColor?: string;
}

export default function LightLineMotionBackground({
  accentColor = '#BD7B20',
  secondaryColor = '#3B82F6',
}: LightLineMotionBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 550);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Glowing particle nodes travelling along the waves
    const particleCount = 35;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      lineIndex: Math.floor(Math.random() * 6),
      speed: 0.35 + Math.random() * 0.65,
      size: 1.5 + Math.random() * 2,
      opacity: 0.2 + Math.random() * 0.5,
      pulse: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      time += 0.006;
      ctx.clearRect(0, 0, width, height);

      // 6 Harmonically Blended Sine/Cosine Wave Filaments for Light Theme
      const waveCount = 6;
      const step = 6;

      for (let i = 0; i < waveCount; i++) {
        const progress = i / (waveCount - 1);
        const yBase = height * 0.25 + progress * (height * 0.52);
        const freq1 = 0.0018 + i * 0.0003;
        const freq2 = 0.003 - i * 0.0002;
        const amp1 = 30 + i * 10;
        const amp2 = 15 + i * 6;
        const phase = time * (0.7 + i * 0.18) + i * 0.9;

        ctx.beginPath();
        for (let x = 0; x <= width; x += step) {
          const y =
            yBase +
            Math.sin(x * freq1 + phase) * amp1 +
            Math.cos(x * freq2 - phase * 0.6) * amp2;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Soft pastel gradient for light theme
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        const alphaMid = (0.16 + Math.sin(time + i) * 0.06 + (1 - progress * 0.3) * 0.18).toFixed(3);
        const alphaEdge = (0.02).toFixed(3);

        grad.addColorStop(0, `rgba(189, 123, 32, ${alphaEdge})`);
        grad.addColorStop(0.25, `rgba(189, 123, 32, ${alphaMid})`);
        grad.addColorStop(0.55, `rgba(217, 164, 70, ${Math.min(0.55, parseFloat(alphaMid) * 1.3)})`);
        grad.addColorStop(0.8, `rgba(59, 130, 246, ${alphaMid})`);
        grad.addColorStop(1, `rgba(59, 130, 246, ${alphaEdge})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = i === 1 || i === 3 ? 1.8 : 1.1;
        ctx.stroke();
      }

      // Render floating particle nodes
      particles.forEach((p) => {
        p.x += p.speed;
        if (p.x > width + 20) p.x = -20;

        p.pulse += 0.03;
        const currentOpacity = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4);

        const yBase = height * 0.25 + (p.lineIndex / (waveCount - 1)) * (height * 0.52);
        const freq1 = 0.0018 + p.lineIndex * 0.0003;
        const amp1 = 30 + p.lineIndex * 10;
        const phase = time * (0.7 + p.lineIndex * 0.18) + p.lineIndex * 0.9;
        const y = yBase + Math.sin(p.x * freq1 + phase) * amp1;

        ctx.beginPath();
        ctx.arc(p.x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(189, 123, 32, ${currentOpacity.toFixed(3)})`;
        ctx.fill();

        // Soft aura
        ctx.beginPath();
        ctx.arc(p.x, y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217, 164, 70, ${(currentOpacity * 0.25).toFixed(3)})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [accentColor, secondaryColor]);

  return (
    <div className="sd-light-motion-container" aria-hidden="true">
      <canvas ref={canvasRef} className="sd-light-motion-canvas" />
      <div className="sd-light-motion-glow-1" />
      <div className="sd-light-motion-glow-2" />
      <div className="sd-light-motion-grid-overlay" />
    </div>
  );
}
