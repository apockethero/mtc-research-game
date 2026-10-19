import React, { useEffect, useRef } from 'react';

interface BeamCanvasProps {
  selectedCardIds: string[];
  nodeRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  stageRef: React.RefObject<HTMLDivElement>;
}

export const BeamCanvas: React.FC<BeamCanvasProps> = ({
  selectedCardIds,
  nodeRefs,
  stageRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let pulsePhase = 0;

    const render = () => {
      const stage = stageRef.current;
      if (stage && canvas) {
        if (canvas.width !== stage.clientWidth || canvas.height !== stage.clientHeight) {
          canvas.width = stage.clientWidth;
          canvas.height = stage.clientHeight;
        }
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (selectedCardIds.length >= 2 && stage) {
        pulsePhase += 0.08;

        const points: { x: number; y: number }[] = [];
        selectedCardIds.forEach(id => {
          const el = nodeRefs.current.get(id);
          if (el) {
            points.push({
              x: el.offsetLeft + el.offsetWidth / 2,
              y: el.offsetTop + el.offsetHeight / 2
            });
          }
        });

        if (points.length >= 2) {
          for (let i = 0; i < points.length; i++) {
            for (let j = i + 1; j < points.length; j++) {
              const p1 = points[i];
              const p2 = points[j];

              // Haz exterior difuso (Glow Melocotón Cálido #FD995C)
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = `rgba(253, 153, 92, ${0.45 + 0.3 * Math.sin(pulsePhase)})`;
              ctx.lineWidth = 8 + 3 * Math.sin(pulsePhase);
              ctx.shadowBlur = 18;
              ctx.shadowColor = '#FD995C';
              ctx.stroke();

              // Haz secundario terracota #D4783D
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = 'rgba(212, 120, 61, 0.7)';
              ctx.lineWidth = 4;
              ctx.stroke();

              // Núcleo blanco brillante del rayo láser
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2.5;
              ctx.shadowBlur = 8;
              ctx.shadowColor = '#ffffff';
              ctx.stroke();

              // Partícula viajera en el haz digital
              const t = (Math.sin(pulsePhase * 0.7 + i) + 1) / 2;
              const px = p1.x + (p2.x - p1.x) * t;
              const py = p1.y + (p2.y - p1.y) * t;

              ctx.beginPath();
              ctx.arc(px, py, 5, 0, Math.PI * 2);
              ctx.fillStyle = '#FD995C';
              ctx.shadowBlur = 14;
              ctx.shadowColor = '#FD995C';
              ctx.fill();

              // Núcleo de la partícula
              ctx.beginPath();
              ctx.arc(px, py, 2.5, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.fill();
            }
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [selectedCardIds, nodeRefs, stageRef]);

  return <canvas ref={canvasRef} id="beamCanvas" />;
};
