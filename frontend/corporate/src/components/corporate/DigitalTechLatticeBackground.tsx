import React, { useEffect, useRef } from 'react';

export default function DigitalTechLatticeBackground() {
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

    // Grid nodes representing digital circuits, LMS data packets, and neural nodes
    const cols = Math.floor(width / 60) + 2;
    const rows = Math.floor(height / 60) + 2;
    
    // Floating data packets
    const packets = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.3),
      vy: (Math.random() > 0.5 ? 1 : -1) * (0.2 + Math.random() * 0.3),
      radius: 2 + Math.random() * 2,
      gold: Math.random() > 0.35,
      pulse: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      time += 0.0012;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle digital tech grid lines with wave distortion
      ctx.lineWidth = 0.6;
      for (let r = 0; r < rows; r++) {
        const y = r * 60;
        const wave = Math.sin(time + r * 0.2) * 4;
        ctx.beginPath();
        ctx.moveTo(0, y + wave);
        ctx.lineTo(width, y + wave);
        ctx.strokeStyle = `rgba(39, 32, 23, 0.035)`;
        ctx.stroke();
      }

      for (let c = 0; c < cols; c++) {
        const x = c * 60;
        const wave = Math.cos(time + c * 0.2) * 4;
        ctx.beginPath();
        ctx.moveTo(x + wave, 0);
        ctx.lineTo(x + wave, height);
        ctx.strokeStyle = `rgba(39, 32, 23, 0.035)`;
        ctx.stroke();
      }

      // Draw 3 slow harmonic data stream curves across the screen
      for (let s = 0; s < 3; s++) {
        const yBase = height * (0.25 + s * 0.25);
        const freq = 0.0016 + s * 0.0004;
        const amp = 28 + s * 10;
        const phase = time * (0.7 + s * 0.3) + s * 1.5;

        ctx.beginPath();
        for (let x = 0; x <= width; x += 10) {
          const y = yBase + Math.sin(x * freq + phase) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const grad = ctx.createLinearGradient(0, 0, width, 0);
        const alpha = (0.09 + Math.sin(time + s) * 0.04).toFixed(3);
        grad.addColorStop(0, `rgba(189, 123, 32, 0.01)`);
        grad.addColorStop(0.3, s % 2 === 0 ? `rgba(189, 123, 32, ${alpha})` : `rgba(37, 99, 235, ${alpha})`);
        grad.addColorStop(0.7, s % 2 === 0 ? `rgba(37, 99, 235, ${alpha})` : `rgba(189, 123, 32, ${alpha})`);
        grad.addColorStop(1, `rgba(189, 123, 32, 0.01)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = s === 1 ? 1.8 : 1.1;
        ctx.stroke();
      }

      // Render data packets
      packets.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        p.pulse += 0.012;
        const currentOpacity = 0.3 + Math.sin(p.pulse) * 0.25;

        // Packet node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(189, 123, 32, ${currentOpacity.toFixed(3)})`
          : `rgba(37, 99, 235, ${currentOpacity.toFixed(3)})`;
        ctx.fill();

        // Digital glow aura
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = p.gold
          ? `rgba(217, 164, 70, ${(currentOpacity * 0.2).toFixed(3)})`
          : `rgba(96, 165, 250, ${(currentOpacity * 0.2).toFixed(3)})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="dl-tech-bg-container" aria-hidden="true">
      <canvas ref={canvasRef} className="dl-tech-canvas" />
      <div className="dl-tech-glow-1" />
      <div className="dl-tech-glow-2" />
      <div className="dl-tech-circuit-overlay" />
    </div>
  );
}
