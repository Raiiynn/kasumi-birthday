import { useEffect, useRef } from "react";

/**
 * Adaptasi Confetti Background (diriktv / 21st.dev)
 * https://21st.dev/community/components/diriktv/confetti-background/default
 */
const P5_CONFETTI_COLORS = [
  "rgba(255, 255, 255, 0.85)",
  "rgba(253, 164, 175, 0.75)",
  "rgba(244, 114, 182, 0.7)",
  "rgba(230, 27, 65, 0.65)",
  "rgba(245, 215, 142, 0.8)",
  "rgba(196, 181, 253, 0.6)",
];

function randomShape() {
  const shapes = ["rectangle", "circle", "star", "diamond"];
  return shapes[Math.floor(Math.random() * shapes.length)];
}

function createPiece(canvas) {
  return {
    x: -canvas.width * 0.2 + Math.random() * canvas.width * 1.4,
    y: -Math.random() * canvas.height * 0.3,
    z: Math.random() * 1500 + 800,
    velocityX: (Math.random() - 0.5) * 0.6,
    velocityY: Math.random() * 0.3 + 0.1,
    velocityZ: -(Math.random() * 0.6 + 0.3),
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.04,
    baseSize: Math.random() * 12 + 6,
    opacity: 1,
    shape: randomShape(),
    color: P5_CONFETTI_COLORS[Math.floor(Math.random() * P5_CONFETTI_COLORS.length)],
    floatPhase: Math.random() * Math.PI * 2,
    swayAmplitude: Math.random() * 0.5 + 0.2,
    bobAmplitude: Math.random() * 0.3 + 0.1,
    fadeStart: 0,
    isFading: false,
  };
}

function drawPiece(ctx, canvas, piece) {
  const perspective = 800;
  const scale = perspective / (perspective + piece.z);
  const projectedX = piece.x + (piece.x - canvas.width / 2) * (1 - scale);
  const projectedY = piece.y + (piece.y - canvas.height / 2) * (1 - scale);

  if (scale <= 0.01 || scale > 2) return;

  const size = piece.baseSize * scale;
  const opacity = Math.min(piece.opacity * scale * 1.5, 1);

  ctx.save();
  ctx.translate(projectedX, projectedY);
  ctx.rotate(piece.rotation);
  ctx.globalAlpha = opacity;
  ctx.shadowColor = `rgba(0, 0, 0, ${Math.min(scale * 0.3, 0.2)})`;
  ctx.shadowBlur = scale * 4;
  ctx.fillStyle = piece.color;

  switch (piece.shape) {
    case "rectangle":
      ctx.fillRect(-size * 0.75, -size * 0.4, size * 1.5, size * 0.8);
      break;
    case "circle":
      ctx.beginPath();
      ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "star": {
      ctx.beginPath();
      const starSize = size * 0.7;
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = Math.cos(angle) * starSize;
        const y = Math.sin(angle) * starSize;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        const innerAngle = ((i + 0.5) * Math.PI) / 3;
        ctx.lineTo(Math.cos(innerAngle) * starSize * 0.5, Math.sin(innerAngle) * starSize * 0.5);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "diamond":
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.8);
      ctx.lineTo(size * 0.48, 0);
      ctx.lineTo(0, size * 0.8);
      ctx.lineTo(-size * 0.48, 0);
      ctx.closePath();
      ctx.fill();
      break;
    default:
      break;
  }
  ctx.restore();
}

function updatePiece(canvas, piece) {
  piece.floatPhase += 0.02;
  const swayX = Math.sin(piece.floatPhase) * piece.swayAmplitude * 0.3;
  const bobY = Math.cos(piece.floatPhase * 0.7) * piece.bobAmplitude * 0.2;

  piece.x += piece.velocityX + swayX;
  piece.y += piece.velocityY + bobY;
  piece.z += piece.velocityZ;
  piece.rotation += piece.rotationSpeed;

  const turbulence = Math.max(0, 1 - piece.z / 1500) * 0.08;
  piece.velocityX += (Math.random() - 0.5) * turbulence * 0.5;
  piece.velocityY += (Math.random() - 0.5) * turbulence * 0.5;
  piece.velocityX += (Math.random() - 0.5) * 0.005;
  piece.velocityY += (Math.random() - 0.5) * 0.005;
  piece.velocityX *= 0.999;
  piece.velocityY *= 0.999;
  piece.velocityY += 0.0005;
  piece.velocityZ *= 1.0005;

  if (
    !piece.isFading &&
    (piece.z <= 200 ||
      piece.x < -150 ||
      piece.x > canvas.width + 150 ||
      piece.y > canvas.height + 150)
  ) {
    piece.isFading = true;
    piece.fadeStart = piece.opacity;
  }

  if (piece.isFading) piece.opacity -= 0.02;

  if (piece.opacity <= 0) {
    Object.assign(piece, createPiece(canvas));
  }
}

export default function ConfettiBackground({ particleCount = 140 }) {
  const canvasRef = useRef(null);
  const piecesRef = useRef([]);
  const frameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    piecesRef.current = Array.from({ length: particleCount }, () => createPiece(canvas));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      piecesRef.current.forEach((p) => {
        updatePiece(canvas, p);
        drawPiece(ctx, canvas, p);
      });
      frameRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [particleCount]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full"
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-[#0a0b14]/92 via-[#120818]/88 to-[#1a0810]/90"
        aria-hidden
      />
    </>
  );
}
