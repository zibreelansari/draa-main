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

      let mouseX = width / 2;
      let mouseY = height / 2;
      let targetMouseX = width / 2;
      let targetMouseY = height / 2;

      const handleResize = () => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      };

      const handleMouseMove = (e: MouseEvent) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
      };

      window.addEventListener('resize', handleResize, { passive: true });
      window.addEventListener('mousemove', handleMouseMove, { passive: true });

      // Breathing Volumetric Aurora Nebulae (Imperial Gold, Warm Sienna, Cypress Teal, Amber)
      const nebulae = [
        {
          baseX: 0.25,
          baseY: 0.18,
          radius: 540,
          color: 'rgba(221, 168, 75, 0.11)',
          speedX: 0.0005,
          speedY: 0.0006,
          phase: 0,
        },
        {
          baseX: 0.85,
          baseY: 0.35,
          radius: 600,
          color: 'rgba(189, 123, 32, 0.09)',
          speedX: 0.0004,
          speedY: 0.0005,
          phase: 2.1,
        },
        {
          baseX: 0.15,
          baseY: 0.72,
          radius: 560,
          color: 'rgba(13, 148, 136, 0.065)',
          speedX: 0.0006,
          speedY: 0.0004,
          phase: 4.2,
        },
        {
          baseX: 0.8,
          baseY: 0.82,
          radius: 580,
          color: 'rgba(245, 158, 11, 0.085)',
          speedX: 0.0004,
          speedY: 0.0005,
          phase: 1.5,
        },
      ];

      // Ethereal Floating Celestial Knowledge Motes
      const moteCount = 38;
      const motes = Array.from({ length: moteCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 1.3 + Math.random() * 2.5,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -0.12 - Math.random() * 0.18,
        alpha: 0.25 + Math.random() * 0.45,
        pulseSpeed: 0.009 + Math.random() * 0.014,
        phase: Math.random() * Math.PI * 2,
        isGold: Math.random() > 0.3,
      }));

      let time = 0;

      const render = () => {
        try {
          time += 0.0012;

          // Smooth spring damping for mouse spotlight
          mouseX += (targetMouseX - mouseX) * 0.045;
          mouseY += (targetMouseY - mouseY) * 0.045;

          const offsetX = (mouseX - width / 2) * 0.025;
          const offsetY = (mouseY - height / 2) * 0.025;

          ctx.clearRect(0, 0, width, height);

          // 1. Interactive Mouse Spotlight (Subtle ambient volumetric torch)
          const mouseGrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 450);
          mouseGrad.addColorStop(0, 'rgba(221, 168, 75, 0.085)');
          mouseGrad.addColorStop(0.5, 'rgba(217, 164, 70, 0.025)');
          mouseGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = mouseGrad;
          ctx.beginPath();
          ctx.arc(mouseX, mouseY, 450, 0, Math.PI * 2);
          ctx.fill();

          // 2. Volumetric Breathing Aurora Clouds
          nebulae.forEach((blob) => {
            const curX =
              width * blob.baseX +
              Math.sin(time * blob.speedX * 1000 + blob.phase) * 110 +
              offsetX * 1.5;
            const curY =
              height * blob.baseY +
              Math.cos(time * blob.speedY * 1000 + blob.phase) * 90 +
              offsetY * 1.5;

            const grad = ctx.createRadialGradient(curX, curY, 0, curX, curY, blob.radius);
            grad.addColorStop(0, blob.color);
            grad.addColorStop(0.55, blob.color.replace(/[\d.]+\)$/, '0.02)'));
            grad.addColorStop(1, 'transparent');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(curX, curY, blob.radius, 0, Math.PI * 2);
            ctx.fill();
          });

          // 3. Flowing Topographic Contour Filament Waves
          const waveCount = 3;
          for (let w = 0; w < waveCount; w++) {
            const yBase = height * (0.2 + w * 0.32) + offsetY * (w + 1) * 0.35;
            const freq = 0.0009 + w * 0.00025;
            const amp = 30 + w * 14;
            const phase = time * (0.6 + w * 0.15) + w * 1.8;

            ctx.beginPath();
            for (let x = 0; x <= width; x += 14) {
              const y = yBase + Math.sin(x * freq + phase) * amp;
              if (x === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }

            const alpha = (0.08 + Math.sin(time + w) * 0.035).toFixed(3);
            const grad = ctx.createLinearGradient(0, 0, width, 0);
            grad.addColorStop(0, 'rgba(221, 168, 75, 0.005)');
            grad.addColorStop(0.3, `rgba(221, 168, 75, ${alpha})`);
            grad.addColorStop(0.7, `rgba(245, 158, 11, ${(Number(alpha) * 1.3).toFixed(3)})`);
            grad.addColorStop(1, 'rgba(221, 168, 75, 0.005)');

            ctx.strokeStyle = grad;
            ctx.lineWidth = w === 1 ? 1.5 : 0.9;
            ctx.stroke();
          }

          // 4. Subtle Inter-Particle Neural Threading
          for (let i = 0; i < moteCount; i++) {
            for (let j = i + 1; j < moteCount; j++) {
              const dx = motes[i].x - motes[j].x;
              const dy = motes[i].y - motes[j].y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 135) {
                const alpha = ((1 - dist / 135) * 0.1).toFixed(3);
                ctx.beginPath();
                ctx.moveTo(motes[i].x, motes[i].y);
                ctx.lineTo(motes[j].x, motes[j].y);
                ctx.strokeStyle = `rgba(221, 168, 75, ${alpha})`;
                ctx.lineWidth = 0.65;
                ctx.stroke();
              }
            }
          }

          // 5. Floating Celestial Knowledge Motes
          motes.forEach((m) => {
            m.x += m.vx;
            m.y += m.vy;

            if (m.y < -20) {
              m.y = height + 20;
              m.x = Math.random() * width;
            }
            if (m.x < -20) m.x = width + 20;
            if (m.x > width + 20) m.x = -20;

            m.phase += m.pulseSpeed;
            const currentAlpha = m.alpha * (0.65 + Math.sin(m.phase) * 0.35);

            const renderX = m.x + offsetX * 0.5;
            const renderY = m.y + offsetY * 0.5;

            // Core mote
            ctx.beginPath();
            ctx.arc(renderX, renderY, m.radius, 0, Math.PI * 2);
            ctx.fillStyle = m.isGold
              ? `rgba(221, 168, 75, ${currentAlpha.toFixed(3)})`
              : `rgba(245, 158, 11, ${currentAlpha.toFixed(3)})`;
            ctx.fill();

            // Soft glowing aura
            ctx.beginPath();
            ctx.arc(renderX, renderY, m.radius * 3.2, 0, Math.PI * 2);
            ctx.fillStyle = m.isGold
              ? `rgba(221, 168, 75, ${(currentAlpha * 0.28).toFixed(3)})`
              : `rgba(217, 119, 6, ${(currentAlpha * 0.25).toFixed(3)})`;
            ctx.fill();
          });

          animId = requestAnimationFrame(render);
        } catch {
          // safe handle
        }
      };

      render();

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        if (animId) cancelAnimationFrame(animId);
      };
    } catch {
      // safe fallback
    }
  }, []);

  return (
    <div className="draa-global-bg-wrapper" aria-hidden="true">
      <div className="draa-global-dot-grid" />
      <canvas ref={canvasRef} className="draa-global-bg-canvas" />
      <div className="draa-global-glow draa-global-glow-top" />
      <div className="draa-global-glow draa-global-glow-middle" />
      <div className="draa-global-glow draa-global-glow-bottom" />
      <div className="draa-global-vignette" />
    </div>
  );
}
