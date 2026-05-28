import { useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   ICON PATHS (white single-stroke style)
   Each icon is defined as an SVG path string, normalized to a ~100x100 viewBox.
   You can add more icons by following the same pattern.
   ───────────────────────────────────────────────────────────────────────────── */
const ICON_DEFS = [
  // Sun with rays
  {
    id: 'sun',
    path: `
      M50 20 A30 30 0 1 1 49.9 20
      M50 10 L50 20 M50 80 L50 90
      M10 50 L20 50 M80 50 L90 50
      M22 22 L30 30 M70 70 L78 78
      M22 78 L30 70 M70 30 L78 22
    `,
    size: 100,
  },
  // Moon crescent
  {
    id: 'moon',
    path: `
      M60 15 A35 35 0 1 0 60 85 A28 28 0 1 1 60 15
    `,
    size: 100,
  },
  // Star (5-point)
  {
    id: 'star',
    path: `
      M50 10 L58 38 L88 38 L64 56 L74 85 L50 68 L26 85 L36 56 L12 38 L42 38 Z
    `,
    size: 100,
  },
  // Cloud
  {
    id: 'cloud',
    path: `
      M25 70
      A20 20 0 0 1 45 50
      A25 25 0 0 1 85 55
      A20 20 0 0 1 85 75
      A15 15 0 0 1 55 75
      L25 75
      A15 15 0 0 1 25 70
    `,
    size: 100,
  },
  // Heart
  {
    id: 'heart',
    path: `
      M50 85 L20 55 A18 18 0 0 1 50 35 A18 18 0 0 1 80 55 Z
    `,
    size: 100,
  },
  // Lightning bolt
  {
    id: 'bolt',
    path: `
      M55 10 L30 50 L50 50 L40 90 L70 45 L50 45 Z
    `,
    size: 100,
  },
  // Compass / direction
  {
    id: 'compass',
    path: `
      M50 10 L56 44 L50 50 L44 44 Z
      M50 90 L44 56 L50 50 L56 56 Z
      M10 50 L44 44 L50 50 L44 56 Z
      M90 50 L56 56 L50 50 L56 44 Z
      M50 50 m-6 0 a6 6 0 1 0 12 0 a6 6 0 1 0 -12 0
    `,
    size: 100,
  },
  // Droplet / water
  {
    id: 'droplet',
    path: `
      M50 10
      Q80 50 50 85
      Q20 50 50 10
    `,
    size: 100,
  },
  // Flame / fire
  {
    id: 'flame',
    path: `
      M50 10
      Q65 35 60 50
      Q70 40 65 55
      Q75 50 70 70
      Q80 60 65 85
      Q50 70 50 90
      Q50 70 35 85
      Q20 60 30 70
      Q25 50 35 55
      Q30 40 40 50
      Q35 35 50 10
    `,
    size: 100,
  },
  // Leaf / nature
  {
    id: 'leaf',
    path: `
      M50 10
      Q80 30 80 60
      Q60 90 30 90
      Q20 70 25 50
      Q30 20 50 10
      M50 10 Q50 50 30 90
    `,
    size: 100,
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Draw a single icon at (x, y) with given iconSize
   ───────────────────────────────────────────────────────────────────────────── */
function drawIcon(ctx, icon, x, y, iconSize, color) {
  const pad = iconSize * 0.1; // 10% padding
  const origin = pad;
  const viewSize = icon.size - pad * 2;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = iconSize * 0.06;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Build SVG path and draw
  const d = icon.path.trim();
  const commands = d.match(/[MLQCZAaSsHhVvMm][^MLQCZAaSsHhVv]*/g) || [];

  let cx = 0, cy = 0; // current point
  let sx = 0, sy = 0; // subpath start

  for (const cmd of commands) {
    const type = cmd[0];
    const raw = cmd.slice(1).trim();
    const parts = raw.length > 0
      ? raw.match(/-?\d+(\.\d+)?/g)?.map(Number) || []
      : [];
    const nums = parts.map((v, i) => {
      // Normalize to iconSize viewBox
      return v;
    });

    ctx.beginPath();

    switch (type) {
      case 'M':
        cx = origin + (nums[0] / icon.size) * viewSize;
        cy = origin + (nums[1] / icon.size) * viewSize;
        ctx.moveTo(cx + x, cy + y);
        sx = cx; sy = cy;
        break;

      case 'm':
        cx += (nums[0] / icon.size) * viewSize;
        cy += (nums[1] / icon.size) * viewSize;
        ctx.moveTo(cx + x, cy + y);
        sx = cx; sy = cy;
        break;

      case 'L':
        cx = origin + (nums[0] / icon.size) * viewSize;
        cy = origin + (nums[1] / icon.size) * viewSize;
        ctx.lineTo(cx + x, cy + y);
        break;

      case 'l':
        cx += (nums[0] / icon.size) * viewSize;
        cy += (nums[1] / icon.size) * viewSize;
        ctx.lineTo(cx + x, cy + y);
        break;

      case 'Q':
        {
          const c1x = origin + (nums[0] / icon.size) * viewSize;
          const c1y = origin + (nums[1] / icon.size) * viewSize;
          cx = origin + (nums[2] / icon.size) * viewSize;
          cy = origin + (nums[3] / icon.size) * viewSize;
          ctx.quadraticCurveTo(c1x + x, c1y + y, cx + x, cy + y);
        }
        break;

      case 'q':
        {
          const c1x = (nums[0] / icon.size) * viewSize;
          const c1y = (nums[1] / icon.size) * viewSize;
          cx += (nums[2] / icon.size) * viewSize;
          cy += (nums[3] / icon.size) * viewSize;
          ctx.quadraticCurveTo(c1x + x, c1y + y, cx + x, cy + y);
        }
        break;

      case 'A':
      case 'a':
        {
          // Arc: rx ry x-axis-rotation large-arc-flag sweep-flag x y
          const rx = (nums[0] / icon.size) * viewSize;
          const ry = (nums[1] / icon.size) * viewSize;
          const xAxisRot = nums[2];
          const largeArc = nums[3];
          const sweep = nums[4];
          cx = origin + (nums[5] / icon.size) * viewSize;
          cy = origin + (nums[6] / icon.size) * viewSize;
          ctx.arcTo(cx + x, cy + y, rx, ry, xAxisRot, largeArc, sweep);
          // Simplified arc approximation using bezier
          const cos = Math.cos;
          const sin = Math.sin;
          const startAngle = Math.atan2((sy - (cy - (sy - (cy - ry)))), (sx - (cx - (sx - rx))));
          ctx.arcTo(cx + x, cy + y, rx, ry, largeArc ? Math.PI : 0, sweep ? true : false);
        }
        break;

      case 'Z':
      case 'z':
        ctx.closePath();
        cx = sx; cy = sy;
        break;

      default:
        // Try to handle H/V
        if (type === 'H') {
          cx = origin + (nums[0] / icon.size) * viewSize;
          ctx.lineTo(cx + x, cy + y);
        } else if (type === 'h') {
          cx += (nums[0] / icon.size) * viewSize;
          ctx.lineTo(cx + x, cy + y);
        } else if (type === 'V') {
          cy = origin + (nums[0] / icon.size) * viewSize;
          ctx.lineTo(cx + x, cy + y);
        } else if (type === 'v') {
          cy += (nums[0] / icon.size) * viewSize;
          ctx.lineTo(cx + x, cy + y);
        }
    }

    ctx.stroke();
  }

  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────────────────────
   Check if a new icon overlaps any existing icon
   ───────────────────────────────────────────────────────────────────────────── */
function hasOverlap(newX, newY, newSize, existingIcons, minGap = 10) {
  for (const icon of existingIcons) {
    const dx = newX - icon.x;
    const dy = newY - icon.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const minDist = (newSize + icon.size) / 2 + minGap;
    if (dist < minDist) return true;
  }
  return false;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Generate random non-overlapping icon layout
   ───────────────────────────────────────────────────────────────────────────── */
function generateIconLayout(canvasW, canvasH, iconSize, density = 0.5) {
  const icons = [];
  const maxAttempts = 50;
  // density 0.5 = ~50% of area covered by icons, adjust as needed
  const targetCount = Math.floor((canvasW * canvasH) / (iconSize * iconSize) * density * 0.3);

  for (let i = 0; i < targetCount; i++) {
    let placed = false;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = Math.random() * (canvasW + iconSize) - iconSize / 2;
      const y = Math.random() * (canvasH + iconSize) - iconSize / 2;
      const size = iconSize * (0.6 + Math.random() * 0.6); // 60%~120% variation
      const rotation = Math.random() * 360;

      if (!hasOverlap(x, y, size, icons)) {
        const iconDef = ICON_DEFS[Math.floor(Math.random() * ICON_DEFS.length)];
        icons.push({ x, y, size, rotation, def: iconDef });
        placed = true;
        break;
      }
    }
  }
  return icons;
}

/* ─────────────────────────────────────────────────────────────────────────────
   Main BackgroundLayer Component
   ───────────────────────────────────────────────────────────────────────────── */
export default function BackgroundLayer({ speed = 1, iconColor = 'rgba(255,255,255,0.12)', iconSize = 80 }) {
  const canvasRef = useRef(null);
  const iconsRef = useRef([]);
  const offsetRef = useRef({ x: 0, y: 0 });
  const animRef = useRef(null);
  const lastTimeRef = useRef(0);

  /* Generate icons on mount / resize */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      iconsRef.current = generateIconLayout(canvas.width, canvas.height, iconSize);
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [iconSize]);

  /* Animation loop */
  const animate = useCallback((timestamp) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dt = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    // Move icons diagonally (down-right)
    const speed = 0.03 * speed; // px per ms
    offsetRef.current.x += speed * dt;
    offsetRef.current.y += speed * dt;

    // Wrap around when icons go off screen
    const wrapX = canvas.width + iconSize;
    const wrapY = canvas.height + iconSize;

    // Clear canvas with coral background
    ctx.fillStyle = '#FF6F61';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each icon
    ctx.save();
    for (const icon of iconsRef.current) {
      // Compute wrapped position
      let drawX = icon.x + offsetRef.current.x;
      let drawY = icon.y + offsetRef.current.y;

      drawX = ((drawX % wrapX) + wrapX) % wrapX - iconSize / 2;
      drawY = ((drawY % wrapY) + wrapY) % wrapY - iconSize / 2;

      ctx.save();
      ctx.translate(drawX + icon.size / 2, drawY + icon.size / 2);
      ctx.rotate((icon.rotation + offsetRef.current.x * 0.01) * Math.PI / 180);
      ctx.translate(-(drawX + icon.size / 2), -(drawY + icon.size / 2));

      drawIcon(ctx, icon.def, drawX, drawY, icon.size, iconColor);
      ctx.restore();
    }
    ctx.restore();

    animRef.current = requestAnimationFrame(animate);
  }, [speed, iconColor, iconSize]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
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
