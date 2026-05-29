import { useEffect, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
   Icon drawing functions — each: (ctx, cx, cy, size, color) => void
   Style: thick strokes with rounded caps (white on coral background)
   ───────────────────────────────────────────────────────────────────────────── */

function drawCreativity(ctx, cx, cy, size, color) {
  // Top-left: small wave/tilde
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.35, cy - size * 0.18);
  ctx.quadraticCurveTo(cx - size * 0.2, cy - size * 0.3, cx - size * 0.05, cy - size * 0.18);
  ctx.stroke();

  // Central: S-curve from bottom-left to upper-right
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.2, cy + size * 0.4);
  ctx.quadraticCurveTo(cx - size * 0.3, cy + size * 0.05, cx, cy);
  ctx.quadraticCurveTo(cx + size * 0.3, cy - size * 0.05, cx + size * 0.25, cy - size * 0.35);
  ctx.stroke();

  // Bottom-right: diamond lozenge shape
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.25, cy - size * 0.35);
  ctx.lineTo(cx + size * 0.42, cy - size * 0.1);
  ctx.lineTo(cx + size * 0.25, cy + size * 0.18);
  ctx.lineTo(cx + size * 0.08, cy - size * 0.1);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

function drawSun(ctx, cx, cy, size, color) {
  // Circle ring
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.09;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.22, 0, Math.PI * 2);
  ctx.stroke();

  // 8 rays (pill-shaped)
  ctx.lineWidth = size * 0.085;
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const inner = size * 0.3;
    const outer = size * 0.42;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner);
    ctx.lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer);
    ctx.stroke();
  }
  ctx.restore();
}

function drawPaperAirplane(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.1;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Left wing
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.35, cy + size * 0.15);
  ctx.quadraticCurveTo(cx - size * 0.15, cy + size * 0.1, cx + size * 0.2, cy - size * 0.25);
  ctx.stroke();

  // Bottom wing
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.35, cy + size * 0.15);
  ctx.lineTo(cx + size * 0.05, cy + size * 0.35);
  ctx.stroke();

  // Right body
  ctx.beginPath();
  ctx.moveTo(cx + size * 0.05, cy + size * 0.35);
  ctx.quadraticCurveTo(cx + size * 0.2, cy + size * 0.1, cx + size * 0.2, cy - size * 0.25);
  ctx.stroke();

  // Inner fold line
  ctx.lineWidth = size * 0.07;
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.18, cy + size * 0.08);
  ctx.lineTo(cx + size * 0.1, cy - size * 0.1);
  ctx.stroke();

  ctx.restore();
}

function drawYoutube(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.09;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Rounded rectangle (screen)
  const w = size * 0.7;
  const h = size * 0.45;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, size * 0.12);
  ctx.stroke();

  // Play button triangle (rounded corners)
  ctx.beginPath();
  const px = cx - size * 0.07;
  const py = cy - size * 0.12;
  const ps = size * 0.22;
  ctx.moveTo(px - ps * 0.4, py - ps * 0.35);
  ctx.lineTo(px - ps * 0.4, py + ps * 0.35);
  ctx.lineTo(px + ps * 0.55, py);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

function drawMail(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.09;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Envelope body
  const w = size * 0.7;
  const h = size * 0.48;
  ctx.beginPath();
  ctx.roundRect(cx - w / 2, cy - h / 2, w, h, size * 0.1);
  ctx.stroke();

  // Flap V shape
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.42, cy - h * 0.15);
  ctx.lineTo(cx, cy + h * 0.25);
  ctx.lineTo(cx + w * 0.42, cy - h * 0.15);
  ctx.stroke();

  ctx.restore();
}

function drawInstagram(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.09;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Rounded square outer
  ctx.beginPath();
  ctx.roundRect(cx - size * 0.38, cx - size * 0.38, size * 0.76, size * 0.76, size * 0.16);
  ctx.stroke();

  // Actually: use proper centering
  const s = size * 0.76;
  ctx.beginPath();
  ctx.roundRect(cx - s / 2, cy - s / 2, s, s, size * 0.16);
  ctx.stroke();

  // Center ring
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.22, 0, Math.PI * 2);
  ctx.stroke();

  // Small dot upper-right
  ctx.beginPath();
  ctx.arc(cx + size * 0.22, cy - size * 0.22, size * 0.06, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

function drawCompass(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.07;
  ctx.lineCap = 'round';

  // Outer circle
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.38, 0, Math.PI * 2);
  ctx.stroke();

  // N/S/E/W tick marks
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2 - Math.PI / 2;
    ctx.lineWidth = size * 0.1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * size * 0.28, cy + Math.sin(angle) * size * 0.28);
    ctx.lineTo(cx + Math.cos(angle) * size * 0.38, cy + Math.sin(angle) * size * 0.38);
    ctx.stroke();
    ctx.lineWidth = size * 0.07;
  }

  // Inner circle
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.15, 0, Math.PI * 2);
  ctx.stroke();

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.05, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

function drawHaze(ctx, cx, cy, size, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = size * 0.09;
  ctx.lineCap = 'round';

  // Wavy horizontal lines (like fog/haze)
  for (let i = 0; i < 3; i++) {
    const y = cy - size * 0.22 + i * size * 0.22;
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.38, y);
    ctx.quadraticCurveTo(cx - size * 0.2, y - size * 0.08, cx, y);
    ctx.quadraticCurveTo(cx + size * 0.2, y + size * 0.08, cx + size * 0.38, y);
    ctx.stroke();
  }

  ctx.restore();
}

/* ─────────────────────────────────────────────────────────────────────────────
   Polka Dot Pattern (diagonal, fading towards center)
   ───────────────────────────────────────────────────────────────────────────── */
function drawPolkaDots(ctx, width, height) {
  const spacing = 40;  // Distance between dots
  const dotRadius = 2;  // Size of dots
  
  // Create pattern that fades towards center
  for (let x = 0; x < width; x += spacing) {
    for (let y = 0; y < height; y += spacing) {
      // Calculate distance from center
      const centerX = width / 2;
      const centerY = height / 2;
      const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
      
      // Calculate opacity (1 at corners, 0 at center)
      const opacity = Math.max(0, 1 - (distanceFromCenter / maxDistance));
      
      // Only draw dots with some opacity
      if (opacity > 0.05) {
        ctx.save();
        ctx.globalAlpha = opacity * 0.3;  // Max 30% opacity
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Icon registry (in the order you uploaded them)
   ───────────────────────────────────────────────────────────────────────────── */
const DRAW_FNS = [
  drawCreativity,   // 創意/塗鴉筆觸
  drawCompass,      // 羅盤
  drawHaze,          // 霧/朦朧
  drawSun,           // 夏天/太陽
  drawPaperAirplane, // 發送/飛機
  drawYoutube,       // 影片
  drawMail,          // 郵件
  drawInstagram,     // IG
];

/* ─────────────────────────────────────────────────────────────────────────────
   Non-overlapping layout generation
   ───────────────────────────────────────────────────────────────────────────── */
function hasOverlap(ax, ay, ar, bx, by, br, minGap = 12) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy) < ar + br + minGap;
}

function generateLayout(canvasW, canvasH, iconSize) {
  const icons = [];
  const targetCount = Math.floor((canvasW * canvasH) / (iconSize * iconSize) * 0.2);
  const maxAttempts = 100;

  for (let i = 0; i < targetCount; i++) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const x = iconSize * 0.5 + Math.random() * (canvasW - iconSize);
      const y = iconSize * 0.5 + Math.random() * (canvasH - iconSize);
      const size = iconSize * (0.6 + Math.random() * 0.5);
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
  isEffectIncoming = false,  // 新增參數：攻擊前警告效果
  effectIntensity = 0,       // 新增參數：效果強度 (0-1)
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

    // Coral background with attack warning effect
    if (isEffectIncoming || effectIntensity > 0) {
      // 呼吸燈效果：顏色在珊瑚紅和更深的紅色之間變化
      const pulse = Math.sin(timestamp / 200) * 0.5 + 0.5; // 0 to 1
      const intensity = Math.max(effectIntensity, isEffectIncoming ? 1 : 0);
      const r = Math.floor(255 - pulse * 30 * intensity);  // 255 to 225
      const g = Math.floor(111 - pulse * 50 * intensity);  // 111 to 61
      const b = Math.floor(97 - pulse * 30 * intensity);   // 97 to 67
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    } else {
      // Normal coral background
      ctx.fillStyle = '#FF6F61';
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw polka dot pattern
    drawPolkaDots(ctx, canvas.width, canvas.height);

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
  }, [speed, iconColor, iconSize, isEffectIncoming, effectIntensity]);

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