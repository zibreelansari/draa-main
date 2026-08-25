import React, { useEffect, useRef } from 'react';

export default function CareerKineticBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Subtle interconnected network nodes representing talent & multidisciplinary connections
    const nodeCount = 32;
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: 1.5 + Math.random() * 2,
      gold: Math.random() > 0.4,
      pulse: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      time += 0.0015;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connective filaments between nearby nodes
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.15;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = nodes[i].gold
              ? `rgba(189, 123, 32, ${alpha.toFixed(3)})`
              : `rgba(59, 130, 246, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.9;
            ctx.stroke();
          }
        }
      }

      // Draw 4 smooth, slow harmonic curve ribbons across the background
      for (let r = 0; r < 4; r++) {
        const yBase = height * 0.28 + r * (height * 0.18);
        const freq = 0.0014 + r * 0.0003;
        const amp = 24 + r * 8;
        const phase = time * (0.8 + r * 0.2) + r * 1.2;

        ctx.beginPath();
        for (let x = 0; x <= width; x += 8) {
          const y = yBase + Math.sin(x * freq + phase) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        const grad = ctx.createLinearGradient(0, 0, width, 0);
        const alpha = (0.08 + Math.sin(time + r) * 0.03).toFixed(3);
        grad.addColorStop(0, `rgba(189, 123, 32, 0.01)`);
        grad.addColorStop(0.3, `rgba(189, 123, 32, ${alpha})`);
        grad.addColorStop(0.7, `rgba(59, 130, 246, ${alpha})`);
        grad.addColorStop(1, `rgba(59, 130, 246, 0.01)`);

        ctx.strokeStyle = grad;
        ctx.lineWidth = r === 1 ? 1.5 : 1.0;
        ctx.stroke();
      }

      // Render & update individual nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < -10) node.x = width + 10;
        if (node.x > width + 10) node.x = -10;
        if (node.y < -10) node.y = height + 10;
        if (node.y > height + 10) node.y = -10;

        node.pulse += 0.01;
        const currentOpacity = 0.25 + Math.sin(node.pulse) * 0.2;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.gold
          ? `rgba(189, 123, 32, ${currentOpacity.toFixed(3)})`
          : `rgba(59, 130, 246, ${currentOpacity.toFixed(3)})`;
        ctx.fill();

        // Delicate glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = node.gold
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
    <div className="cp-kinetic-bg-container" aria-hidden="true">
      <canvas ref={canvasRef} className="cp-kinetic-canvas" />
      <div className="cp-kinetic-glow-1" />
      <div className="cp-kinetic-glow-2" />
      <div className="cp-kinetic-grid-layer" />
    </div>
  );
}
