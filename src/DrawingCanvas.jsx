import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * DrawingCanvas
 *
 * Features:
 * - Mouse and touch support
 * - Coordinate normalization (percentage-based for cross-device consistency)
 * - Undo stack (stores canvas ImageData snapshots)
 * - Tool switching (brush / eraser)
 * - Color and size control
 */
export default function DrawingCanvas({
  brushColor = '#000000',
  brushSize = 8,
  tool = 'brush',
  onCanvasChange,
}) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef(null);
  const undoStackRef = useRef([]);

  const [isReady, setIsReady] = useState(false);

  // ── Initialize Canvas ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      const { clientWidth, clientHeight } = parent;

      // Preserve existing drawing when resizing
      const imageData = canvas.width > 0 ? canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height) : null;

      canvas.width = clientWidth;
      canvas.height = clientHeight;

      if (imageData) {
        canvas.getContext('2d').putImageData(imageData, 0, 0);
      } else {
        // Fill with white background
        canvas.getContext('2d').fillStyle = '#FFFFFF';
        canvas.getContext('2d').fillRect(0, 0, canvas.width, canvas.height);
      }

      setIsReady(true);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // ── Get pointer position (normalize to percentage) ──────────────────────
  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
      // Actual pixel position for drawing
      px: clientX - rect.left,
      py: clientY - rect.top,
    };
  }, []);

  // ── Draw a line between two points ──────────────────────────────────────
  const drawLine = useCallback((from, to) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = brushColor;
    }

    ctx.lineWidth = brushSize;

    ctx.beginPath();
    ctx.moveTo(from.px, from.py);
    ctx.lineTo(to.px, to.py);
    ctx.stroke();
  }, [brushColor, brushSize, tool]);

  // ── Save snapshot for undo ───────────────────────────────────────────────
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(imageData);
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift(); // Limit stack size
    }
    onCanvasChange?.();
  }, [onCanvasChange]);

  // ── Pointer Down ─────────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;

    saveSnapshot();
    isDrawingRef.current = true;
    lastPosRef.current = pos;

    // Draw a single dot for click without drag
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = brushColor;
    }

    ctx.beginPath();
    ctx.arc(pos.px, pos.py, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }, [getPos, saveSnapshot, tool, brushColor, brushSize]);

  // ── Pointer Move ─────────────────────────────────────────────────────────
  const handlePointerMove = useCallback((e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();

    const pos = getPos(e);
    if (!pos || !lastPosRef.current) return;

    drawLine(lastPosRef.current, pos);
    lastPosRef.current = pos;
  }, [getPos, drawLine]);

  // ── Pointer Up / Leave ───────────────────────────────────────────────────
  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  // ── Undo ─────────────────────────────────────────────────────────────────
  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || undoStackRef.current.length === 0) return null;

    const imageData = undoStackRef.current.pop();
    canvas.getContext('2d').putImageData(imageData, 0, 0);
    onCanvasChange?.();
    return true;
  }, [onCanvasChange]);

  // Expose undo via a custom event
  useEffect(() => {
    const handleUndoEvent = () => undo();
    window.addEventListener('canvas:undo', handleUndoEvent);
    return () => window.removeEventListener('canvas:undo', handleUndoEvent);
  }, [undo]);

  // ── Clear Canvas ─────────────────────────────────────────────────────────
  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    saveSnapshot();
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onCanvasChange?.();
  }, [saveSnapshot, onCanvasChange]);

  useEffect(() => {
    window.addEventListener('canvas:clear', clear);
    return () => window.removeEventListener('canvas:clear', clear);
  }, [clear]);

  // ── Get canvas data URL ──────────────────────────────────────────────────
  const getDataURL = useCallback(() => {
    return canvasRef.current?.toDataURL('image/png');
  }, []);

  // Expose getDataURL globally for parent components
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.getDataURL = getDataURL;
    }
  }, [getDataURL]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        cursor: tool === 'eraser' ? 'crosshair' : 'crosshair',
        touchAction: 'none', // Prevent scroll while drawing on mobile
      }}
      aria-label="繪圖畫布"
      title="在畫布上繪圖"
    />
  );
}
