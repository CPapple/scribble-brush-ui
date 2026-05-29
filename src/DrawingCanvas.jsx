import { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

/**
 * DrawingCanvas
 *
 * Features:
 * - Mouse and touch support
 * - Percentage-based coordinate normalization for cross-device consistency
 * - Undo stack (stores canvas ImageData snapshots, max 50 steps)
 * - Tool switching (brush / eraser)
 * - Color and size control
 * - Supports external effects via CSS transforms
 */
const DrawingCanvas = forwardRef(function DrawingCanvas({
  tool = 'brush',
  brushColor = '#000000',
  brushSize = 8,
  flipH = false,
  flipV = false,
  canvasEffect = '',
  onDrawStart,
  onDrawMove,
  onDrawEnd,
}, ref) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef(null);
  const undoStackRef = useRef([]);

  // ── Expose canvas methods to parent ─────────────────────────────────────
  useImperativeHandle(ref, () => ({
    undo: () => {
      const canvas = canvasRef.current;
      if (!canvas || undoStackRef.current.length === 0) return false;
      const imageData = undoStackRef.current.pop();
      canvas.getContext('2d').putImageData(imageData, 0, 0);
      return true;
    },
    clear: () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      saveSnapshot();
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    },
    getDataURL: () => canvasRef.current?.toDataURL('image/png'),
  }), []);

  // ── Save snapshot for undo ───────────────────────────────────────────────
  const saveSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    undoStackRef.current.push(imageData);
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift();
    }
  }, []);

  // ── Get pixel position from event ───────────────────────────────────────
  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
      px: clientX - rect.left,
      py: clientY - rect.top,
    };
  }, []);

  // ── Draw a dot ───────────────────────────────────────────────────────────
  const drawDot = useCallback((pos) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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
    ctx.globalCompositeOperation = 'source-over';
  }, [brushColor, brushSize, tool]);

  // ── Draw a line ───────────────────────────────────────────────────────────
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
    ctx.globalCompositeOperation = 'source-over';
  }, [brushColor, brushSize, tool]);

  // ── Pointer Events ───────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e) => {
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    saveSnapshot();
    isDrawingRef.current = true;
    lastPosRef.current = pos;
    drawDot(pos);
    onDrawStart?.(pos);
  }, [getPos, saveSnapshot, drawDot, onDrawStart]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    const pos = getPos(e);
    if (!pos || !lastPosRef.current) return;
    drawLine(lastPosRef.current, pos);
    lastPosRef.current = pos;
    onDrawMove?.(pos);
  }, [getPos, drawLine, onDrawMove]);

  const handlePointerUp = useCallback((e) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();
    isDrawingRef.current = false;
    lastPosRef.current = null;
    onDrawEnd?.();
  }, [onDrawEnd]);

  const handlePointerLeave = useCallback((e) => {
    if (!isDrawingRef.current) return;
    handlePointerUp(e);
  }, [handlePointerUp]);

  // ── Canvas Resize ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const { clientWidth: w, clientHeight: h } = parent;

      // Preserve existing drawing
      const imageData = canvas.width > 0
        ? canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
        : null;

      canvas.width = Math.max(w, 100);
      canvas.height = Math.max(h, 100);

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (imageData) {
        // Scale old drawing to new size (optional - keeps drawing on resize)
        ctx.putImageData(imageData, 0, 0);
      }
    };

    resizeCanvas();
    const ro = new ResizeObserver(resizeCanvas);
    ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerLeave}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        cursor: tool === 'eraser' ? 'crosshair' : 'crosshair',
        touchAction: 'none',
      }}
      aria-label="繪圖畫布"
      title="在畫布上繪圖"
    />
  );
});

export default DrawingCanvas;
