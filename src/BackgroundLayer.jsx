import { useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   Each icon is a simple draw function: (ctx, cx, cy, size, color) => void
   Uses basic Canvas 2D primitives only — no SVG path parsing.
   ───────────────────────────────────────────────────────────────────────────── */

function drawSun(ctx, cx, cy, size, color) {
  const r = size * 0.35;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.stroke();

  // 8 rays
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const inner = r + size * 0.08;
    const outer = r + size * 0.22;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    ctx.stroke();
  }
}

function drawMoon(ctx, cx, cy, size, color) {
  ctx.beginPath();
  ctx.arc(cx - size * 0.12, cy, size * 0.3, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx + size * 0.08, cy, size * 0.22, 0, Math.PI * 2);
  ctx.stroke();
}

function drawStar(ctx, cx, cy, size, color) {
  const points = 5;
  const outer = size * 0.4;
  const inner = size * 0.18;
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function drawCloud(ctx, cx, cy, size, color) {
  ctx.beginPath();
  ctx.arc(cx - size * 0.22, cy + size * 0.05, size * 0.2, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy - size * 0.1, size * 0.25, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx + size * 0.22, cy + size * 0.05, size * 0.2, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - size * 0.38, cy + size * 0.1);
  ctx.lineTo(cx + size * 0.38, cy + size * 0.1);
  ctx.stroke();
}

function drawHeart(ctx, cx, cy, size, color) {
  const top = cy - size * 0.05;
  const height = size * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, top + height * 0.3);
  ctx.bezierCurveTo(cx - height * 0.5, top, cx - height * 0.5, top + height * 0.5, cx, top + height * 0.8);
  ctx.bezierCurveTo(cx + height * 0.5, top + height * 0.5, cx + height * 0.5, top, cx, top + height * 0.3);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.stroke();
}

function drawBolt(ctx, cx, cy, size, color) {
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.1, cy - size * 0.4);
  ctx.lineTo(cx - size * 0.1, cy);
  ctx.lineTo(cx + size * 0.05, cy);
  ctx.lineTo(cx - size * 0.1, cy + size * 0.4);
  ctx.lineTo(cx + size * 0.15, cy);
  ctx.lineTo(cx - size * 0.05, cy);
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function drawDrop(ctx, cx, cy, size, color) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.4);
  ctx.bezierCurveTo(cx + size * 0.4, cy, cx + size * 0.3, cy + size * 0.35, cx, cy + size * 0.4);
  ctx.bezierCurveTo(cx - size * 0.3, cy + size * 0.35, cx - size * 0.4, cy, cx, cy - size * 0.4);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.stroke();
}

function drawLeaf(ctx, cx, cy, size, color) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.4);
  ctx.bezierCurveTo(cx + size * 0.45, cy - size * 0.2, cx + size * 0.35, cy + size * 0.35, cx, cy + size * 0.4);
  ctx.bezierCurveTo(cx - size * 0.35, cy + size * 0.35, cx - size * 0.45, cy - size * 0.2, cx, cy - size * 0.4);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.4);
  ctx.bezierCurveTo(cx + size * 0.1, cy, cx - size * 0.1, cy + size * 0.1, cx, cy + size * 0.4);
  ctx.stroke();
}

function drawFlame(ctx, cx, cy, size, color) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.42);
  ctx.bezierCurveTo(cx + size * 0.2, cy - size * 0.2, cx + size * 0.18, cy + size * 0.1, cx, cy + size * 0.42);
  ctx.bezierCurveTo(cx - size * 0.18, cy + size * 0.1, cx - size * 0.2, cy - size * 0.2, cx, cy - size * 0.42);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.15);
  ctx.bezierCurveTo(cx + size * 0.1, cy, cx + size * 0.08, cy + size * 0.15, cx, cy + size * 0.25);
  ctx.bezierCurveTo(cx - size * 0.08, cy + size * 0.15, cx - size * 0.1, cy, cx, cy - size * 0.15);
  ctx.stroke();
}

function drawCompass(ctx, cx, cy, size, color) {
  const r = size * 0.38;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.05;
  ctx.stroke();

  // N/S/E/W ticks
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * r * 0.7, cy + Math.sin(angle) * r * 0.7);
    ctx.lineTo(cx + Math.cos(angle) * r * 0.9, cy + Math.sin(angle) * r * 0.9);
    ctx.strokeStyle = color;
    ctx.lineWidth = size * 0.06;
    ctx.stroke();
  }

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.05, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawCross(ctx, cx, cy, size, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.08;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.38);
  ctx.lineTo(cx, cy + size * 0.38);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.38, cy);
  ctx.lineTo(cx + size * 0.38, cy);
  ctx.stroke();
}

function drawCircle(ctx, cx, cy, size, color) {
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.38, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.stroke();
}

function drawTriangle(ctx, cx, cy, size, color) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.38);
  ctx.lineTo(cx + size * 0.33, cy + size * 0.3);
  ctx.lineTo(cx - size * 0.33, cy + size * 0.3);
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

function drawSquare(ctx, cx, cy, size, color) {
  const half = size * 0.32;
  ctx.strokeRect(cx - half, cy - half, half * 2, half * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.stroke();
}

function drawDiamond(ctx, cx, cy, size, color) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - size * 0.38);
  ctx.lineTo(cx + size * 0.38, cy);
  ctx.lineTo(cx, cy + size * 0.38);
  ctx.lineTo(cx - size * 0.38, cy);
  ctx.closePath();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.06;
  ctx.lineJoin = 'round';
  ctx.stroke();
}

/* ─────────────────────────────────────────────────────────────────────────────
   Icon registry
   ───────────────────────────────────────────────────────────────────────────── */
const DRAW_FNS = [
  drawSun, drawMoon, drawStar, drawCloud, drawHeart,
  drawBolt, drawDrop, drawLeaf, drawFlame, drawCompass,
  drawCross, drawCircle, drawTriangle, drawSquare, drawDiamond,
];

const ICON_NAMES = [
  'sun', 'moon', 'star', 'cloud', 'heart',
  'bolt', 'drop', 'leaf', 'flame', 'compass',
  'cross', 'circle', 'triangle', 'square', 'diamond',
];

/* ─────────────────────────────────────────────────────────────────────────────
   Non-overlapping layout generation
   ───────────────────────────────────────────────────────────────────────────── */
function hasOverlap(ax, ay, ar, bx, by, br, minGap = 8) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy) < ar + br + minGap;
}

function generateLayout(canvasW, canvasH, iconSize) {
  const icons = [];
  const targetCount = Math.floor((canvasW * canvasH) / (iconSize * iconSize) * 0.25);
  const maxAttempts = 100;

  for (let i = 0; i < targetCount; i++) {
    let placed = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = iconSize * 0.5 + Math.random() * (canvasW - iconSize);
      const y = iconSize * 0.5 + Math.random() * (canvasH - iconSize);
      const size = iconSize * (0.55 + Math.random() * 0.5);
      const rotation = Math.random() * 360;
      const drawFn = DRAW_FNS[Math.floor(Math.random() * DRAW_FNS.length)];

      let overlaps = false;
      for (const icon of icons) {
        if (hasOverlap(x, y, size * 0.5, icon.x, icon.y, icon.size * 0.5)) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        icons.push({ x, y, size, rotation, drawFn });
        placed = true;
        break;
      }
    }
  }
  return icons;
}

/* ─────────────────────────────────────────────────────────────────────────────
   BackgroundLayer Component
   ───────────────────────────────────────────────────────────────────────────── */
export default function BackgroundLayer({
  speed = 1,
  iconColor = 'rgba(255,255,255,0.12)',
  iconSize = 90,
}) {
  const canvasRef = useRef(null);
  const iconsRef = useRef([]);
  const offsetRef = useRef({ x: 0, y: 0 });
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      iconsRef.current = generateLayout(canvas.width, canvas.height, iconSize);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [iconSize]);

  const animate = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dt = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    offsetRef.current.x += 0.025 * speed * dt;
    offsetRef.current.y += 0.025 * speed * dt;

    const wrapX = canvas.width + iconSize;
    const wrapY = canvas.height + iconSize;

    // Coral background
    ctx.fillStyle = '#FF6F61';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw icons
    for (const icon of iconsRef.current) {
      let wx = ((icon.x + offsetRef.current.x) % wrapX + wrapX) % wrapX;
      let wy = ((icon.y + offsetRef.current.y) % wrapY + wrapY) % wrapY;

      ctx.save();
      ctx.translate(wx, wy);
      ctx.rotate((icon.rotation + offsetRef.current.x * 0.008) * Math.PI / 180);
      icon.drawFn(ctx, 0, 0, icon.size, iconColor);
      ctx.restore();
    }

    requestAnimationFrame(animate);
  }, [speed, iconColor, iconSize]);

  useEffect(() => {
    const raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
      aria-hidden="true"
    />
  );
}
