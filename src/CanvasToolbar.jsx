import React from 'react';

function CanvasToolbar({ tool, brushSize, onToolChange, onSizeChange }) {
  // 四個筆刷大小選項
  const sizes = [4, 8, 12, 20];
  
  return (
    <div style={{
      position: 'absolute',
      bottom: '10px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '8px',
      padding: '6px 12px',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderRadius: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
      zIndex: 10,
      backdropFilter: 'blur(4px)'
    }}>
      {/* 畫筆按鈕 */}
      <button
        onClick={() => onToolChange('brush')}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '50%',
          backgroundColor: tool === 'brush' ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
          transition: 'background-color 0.2s'
        }}
        title="畫筆"
      >
        🖌️
      </button>
      
      {/* 橡皮擦按鈕 */}
      <button
        onClick={() => onToolChange('eraser')}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '50%',
          backgroundColor: tool === 'eraser' ? 'rgba(0, 123, 255, 0.1)' : 'transparent',
          transition: 'background-color 0.2s'
        }}
        title="橡皮擦"
      >
        🧹
      </button>
      
      {/* 筆刷大小選擇 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => onSizeChange(size)}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid #333',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
            title={`筆刷大小: ${size}px`}
          >
            {/* 顯示實際大小的圓形 */}
            <div style={{
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: '50%',
              backgroundColor: brushSize === size ? '#333' : '#ccc'
            }} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default CanvasToolbar;