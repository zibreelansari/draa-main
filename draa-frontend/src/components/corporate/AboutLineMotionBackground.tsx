import React, { useEffect, useRef } from 'react';

interface AboutLineMotionBackgroundProps {
  accentColor?: string;
  secondaryColor?: string;
}

export default function AboutLineMotionBackground({
  accentColor = '#F59E0B',
  secondaryColor = '#38BDF8',
}: AboutLineMotionBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Glowing particle nodes travelling along the waves
    const particleCount = 42;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      lineIndex: Math.floor(Math.random() * 8),
      speed: 0.07 + Math.random() * 0.09,
      size: 1.5 + Math.random() * 2.5,
      opacity: 0.25 + Math.random() * 0.65,
      pulse: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      time += 0.0013;
      ctx.clearRect(0, 0, width, height);

      // 8 Harmonically Blended Sine/Cosine Wave Filaments
      const waveCount = 8;
      const step = 5;

      for (let i = 0; i < waveCount; i++) {
        const progress = i / (waveCount - 1);
        // Vertical distribution with natural curvature
        const yBase = height * 0.22 + progress * (height * 0.58);
        const freq1 = 0.0016 + i * 0.00035;
        const freq2 = 0.0032 - i * 0.00025;
        const amp1 = 35 + i * 12;
        const amp2 = 18 + i * 7;
        const phase = time * (0.75 + i * 0.2) + i * 0.95;

        ctx.beginPath();
        for (let x = 0; x <= width; x += step) {
          const y =
            yBase +
            Math.sin(x * freq1 + phase) * amp1 +
            Math.cos(x * freq2 - phase * 0.65) * amp2;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Luxurious dynamic gradient along the wave filament
        const grad = ctx.createLinearGradient(0, 0, width, 0);
        const alphaMid = (0.18 + Math.sin(time + i) * 0.08 + (1 - progress * 0.4) * 0.3).toFixed(3);
        const alphaEdge = (0.02).toFixed(3);

        grad.addColorStop(0, `rgba(217, 119, 6, ${alphaEdge})`);
        grad.addColorStop(0.2, `rgba(245, 158, 11, ${alphaMid})`);
        grad.addColorStop(0.5, `rgba(253, 230, 138, ${Math.min(1, parseFloat(alphaMid) * 1.35)})`);
        grad.addColorStop(0.75, `rgba(56, 189, 248, ${alphaMid})`);
        grad.addColorStop(1, `rgba(59, 130, 246, ${alphaEdge})`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = i === 1 || i === 4 ? 2.2 : i % 2 === 0 ? 1.4 : 1.0;
        ctx.stroke();

        // Soft ambient aura for prominent lines
        if (i === 1 || i === 5) {
          ctx.save();
          ctx.strokeStyle = `rgba(245, 158, 11, 0.09)`;
          ctx.lineWidth = 8;
          ctx.stroke();
          ctx.restore();
        }
      }

      // Draw floating glowing cosmic energy particles
      particles.forEach((p) => {
        p.x += p.speed;
        p.pulse += 0.03;
        if (p.x > width + 25) {
          p.x = -25;
          p.lineIndex = Math.floor(Math.random() * waveCount);
        }

        const i = p.lineIndex;
        const progress = i / (waveCount - 1);
        const yBase = height * 0.22 + progress * (height * 0.58);
        const freq1 = 0.0016 + i * 0.00035;
        const freq2 = 0.0032 - i * 0.00025;
        const amp1 = 35 + i * 12;
        const amp2 = 18 + i * 7;
        const phase = time * (0.75 + i * 0.2) + i * 0.95;

        const y =
          yBase +
          Math.sin(p.x * freq1 + phase) * amp1 +
          Math.cos(p.x * freq2 - phase * 0.65) * amp2;

        const currentOpacity = Math.max(0.15, p.opacity + Math.sin(p.pulse) * 0.25);

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 243, 199, ${currentOpacity})`;
        ctx.shadowColor = i % 2 === 0 ? accentColor : secondaryColor;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
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
    <div className="about-line-motion-container" aria-hidden="true">
      <canvas ref={canvasRef} className="about-line-motion-canvas" />
      <div className="about-line-motion-glow-1" />
      <div className="about-line-motion-glow-2" />
      <div className="about-line-motion-glow-3" />
      <div className="about-line-motion-grid-overlay" />
    </div>
  );
}
