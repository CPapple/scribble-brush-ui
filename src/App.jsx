import { useState } from 'react';
import './styles.css';

// ─── Theme Toggle ────────────────────────────────────────────────────────────
function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="btn btn--ghost btn--icon"
      onClick={onToggle}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? '深色模式' : '淺色模式'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

// ─── Ping Indicator ─────────────────────────────────────────────────────────
function PingIndicator({ ping }) {
  let level = 'good';
  let label = `${ping}ms`;
  if (ping >= 150) level = 'bad';
  else if (ping >= 80) level = 'medium';

  return (
    <div className="ping-indicator" title={`延遲: ${ping}ms`}>
      <span className={`ping-dot ping-dot--${level}`}></span>
      <span className="text-muted">{label}</span>
    </div>
  );
}

// ─── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ name, size = '', src }) {
  const initials = name ? name.slice(0, 1).toUpperCase() : '?';
  return (
    <div className={`avatar ${size ? `avatar--${size}` : ''}`}>
      {src ? <img src={src} alt={name} /> : initials}
    </div>
  );
}

// ─── Player Item ────────────────────────────────────────────────────────────
function PlayerItem({ name, score, isDrawing, isWinner, isFirst, isMe }) {
  return (
    <div
      className={`player-item ${isWinner ? 'player-item--winner' : ''} ${isFirst ? 'player-item--first' : ''}`}
    >
      <Avatar name={name} size="sm" />
      <div className="player-info">
        <div className="player-name">
          {name} {isMe && <span className="text-muted">(你)</span>}
        </div>
        <div className="player-score">{score} 分</div>
      </div>
      {isDrawing && (
        <span className="badge badge--warning">✏️ 繪圖中</span>
      )}
      {isFirst && !isDrawing && (
        <span className="badge badge--gold">👑</span>
      )}
    </div>
  );
}

// ─── Player List (Left Sidebar) ─────────────────────────────────────────────
function PlayerList({ players, myId }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <aside className="sidebar-left card" style={{ width: 'var(--sidebar-left-width)', display: 'flex', flexDirection: 'column' }}>
      <div className="p-md" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2>玩家列表</h2>
      </div>
      <div className="player-list" style={{ flex: 1, overflowY: 'auto' }}>
        {sorted.map((player, index) => (
          <PlayerItem
            key={player.id}
            name={player.name}
            score={player.score}
            isDrawing={player.isDrawing}
            isWinner={player.isWinner}
            isFirst={index === 0}
            isMe={player.id === myId}
          />
        ))}
      </div>
    </aside>
  );
}

// ─── Chat Message ────────────────────────────────────────────────────────────
function ChatMessage({ sender, text, type }) {
  // type: 'normal' | 'system' | 'correct' | 'wrong'
  return (
    <div className={`chat-message chat-message--${type}`}>
      {sender && <strong>{sender}: </strong>}
      {text}
    </div>
  );
}

// ─── Chat Panel (Right Sidebar) ─────────────────────────────────────────────
function ChatPanel({ messages, onSendMessage }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <aside className="sidebar-right card" style={{ width: 'var(--sidebar-right-width)', display: 'flex', flexDirection: 'column' }}>
      <div className="p-md" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2>聊天 / 猜題</h2>
      </div>

      {/* Messages area */}
      <div
        className="p-sm"
        style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}
      >
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}
      </div>

      {/* Input */}
      <form className="chat-input-wrapper" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input"
          placeholder="輸入答案或聊天..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="聊天輸入框"
        />
        <button type="submit" className="btn btn--primary">
          送出
        </button>
      </form>
    </aside>
  );
}

// ─── Game Header (Timer + Hint) ────────────────────────────────────────────
function GameHeader({ timeLeft, wordHint, totalTime = 60 }) {
  const isWarning = timeLeft <= 10;

  return (
    <header className="game-header">
      <div className="word-hint">{wordHint}</div>
      <div className={`timer ${isWarning ? 'timer--warning' : ''}`}>
        {timeLeft}s
      </div>
    </header>
  );
}

// ─── Drawing Canvas ─────────────────────────────────────────────────────────
function DrawingCanvas({ canvasRef, isDrawing, onDrawStart, onDrawMove, onDrawEnd }) {
  return (
    <div className="canvas-wrapper">
      <canvas
        ref={canvasRef}
        onMouseDown={onDrawStart}
        onMouseMove={onDrawMove}
        onMouseUp={onDrawEnd}
        onMouseLeave={onDrawEnd}
        onTouchStart={onDrawStart}
        onTouchMove={onDrawMove}
        onTouchEnd={onDrawEnd}
        aria-label="繪圖畫布"
        title="繪圖區域"
      />
    </div>
  );
}

// ─── Color Swatch Button ────────────────────────────────────────────────────
function ColorSwatch({ color, isActive, onClick, label }) {
  return (
    <button
      className={`tool-btn ${isActive ? 'tool-btn--active' : ''}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span
        className="color-swatch"
        style={{ backgroundColor: color }}
      />
    </button>
  );
}

// ─── Brush Size Button ───────────────────────────────────────────────────────
function BrushSizeButton({ size, isActive, onClick }) {
  return (
    <button
      className={`tool-btn ${isActive ? 'tool-btn--active' : ''}`}
      onClick={onClick}
      aria-label={`畫筆大小 ${size}`}
      title={`畫筆大小 ${size}`}
    >
      <div className="brush-size-preview">
        <span
          className="brush-dot"
          style={{ width: size, height: size }}
        />
      </div>
    </button>
  );
}

// ─── Tool Button (Icon-only) ────────────────────────────────────────────────
function ToolButton({ icon, isActive, onClick, label, danger }) {
  return (
    <button
      className={`tool-btn ${isActive ? 'tool-btn--active' : ''} ${danger ? 'btn--danger' : ''}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
    </button>
  );
}

// ─── Toolbar (Bottom) ───────────────────────────────────────────────────────
function Toolbar({ tool, brushColor, brushSize, onToolChange, onColorChange, onSizeChange, onClear, onUndo, canUndo }) {
  const colors = ['#000000', '#FF6F61', '#20B2AA', '#90EE90', '#FFD700', '#FF4500', '#8B5CF6', '#3E403F'];
  const sizes = [4, 8, 12, 20];
  const tools = [
    { id: 'brush', icon: '🖌️', label: '畫筆' },
    { id: 'eraser', icon: '🧹', label: '橡皮擦' },
  ];

  return (
    <div className="toolbar">
      {/* Drawing Tools */}
      <div className="toolbar-group">
        {tools.map((t) => (
          <ToolButton
            key={t.id}
            icon={t.icon}
            isActive={tool === t.id}
            onClick={() => onToolChange(t.id)}
            label={t.label}
          />
        ))}
      </div>

      <div className="toolbar-divider" />

      {/* Colors */}
      <div className="toolbar-group">
        {colors.map((c) => (
          <ColorSwatch
            key={c}
            color={c}
            isActive={brushColor === c}
            onClick={() => onColorChange(c)}
            label={`顏色 ${c}`}
          />
        ))}
      </div>

      <div className="toolbar-divider" />

      {/* Brush Sizes */}
      <div className="toolbar-group">
        {sizes.map((s) => (
          <BrushSizeButton
            key={s}
            size={s}
            isActive={brushSize === s}
            onClick={() => onSizeChange(s)}
          />
        ))}
      </div>

      <div className="toolbar-divider" />

      {/* Actions */}
      <div className="toolbar-group">
        <ToolButton
          icon="↩️"
          onClick={onUndo}
          disabled={!canUndo}
          label="復原"
        />
        <ToolButton
          icon="🗑️"
          onClick={onClear}
          danger
          label="清空畫布"
        />
      </div>
    </div>
  );
}

// ─── Loading Skeleton ───────────────────────────────────────────────────────
function Skeleton({ variant = 'text' }) {
  return <div className={`skeleton skeleton--${variant}`} />;
}

function PlayerListSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', padding: 'var(--space-md)' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
          <Skeleton variant="circle" />
          <div style={{ flex: 1 }}>
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', padding: 'var(--space-sm)' }}>
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} variant="text" />
      ))}
    </div>
  );
}

// ─── Main App Layout ────────────────────────────────────────────────────────
function App() {
  // ── Theme ──
  const [theme, setTheme] = useState('light');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // ── Dummy Data (Replace with real state from backend) ──
  const [players] = useState([
    { id: '1', name: '宇辰', score: 850, isDrawing: true, isWinner: false },
    { id: '2', name: '小美', score: 720, isDrawing: false, isWinner: false },
    { id: '3', name: '我', score: 690, isDrawing: false, isWinner: false },
    { id: '4', name: '阿偉', score: 500, isDrawing: false, isWinner: false },
  ]);
  const myId = '3';

  const [messages, setMessages] = useState([
    { type: 'system', text: '🎨 宇辰 開始繪圖了！' },
    { type: 'normal', sender: '小美', text: '這看起來像一隻狗？' },
    { type: 'wrong', sender: '阿偉', text: '是貓嗎' },
  ]);

  const [timeLeft, setTimeLeft] = useState(45);
  const wordHint = '_ _ _ _';

  // ── Toolbar State ──
  const [tool, setTool] = useState('brush');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(8);
  const [canUndo, setCanUndo] = useState(true);

  // ── Canvas Ref ──
  const canvasRef = useState(null)[0];

  // ── Handlers ──
  const handleSendMessage = (text) => {
    setMessages((prev) => [...prev, { type: 'normal', sender: '我', text }]);
  };

  const handleClear = () => {
    if (window.confirm('確定要清空畫布嗎？')) {
      // TODO: Clear canvas logic
    }
  };

  return (
    <div
      className="app-layout"
      data-theme={theme}
      style={{
        display: 'flex',
        height: '100vh',
        gap: 'var(--space-lg)',
        padding: 'var(--space-md)',
        backgroundColor: 'var(--color-bg-app)',
      }}
    >
      {/* Left Sidebar — Player List */}
      <PlayerList players={players} myId={myId} />

      {/* Center — Game Area */}
      <main
        className="game-area"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', minWidth: 0 }}
      >
        {/* Top Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-sm)',
          }}
        >
          <h1 style={{ fontSize: 'var(--font-size-h1)', fontWeight: 'var(--font-weight-bold)' }}>
            Scribble Brush
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <PingIndicator ping={42} />
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </div>

        {/* Canvas Card */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <GameHeader timeLeft={timeLeft} wordHint={wordHint} />
          <div style={{ flex: 1, padding: 'var(--space-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* TODO: Replace with real DrawingCanvas */}
            <div
              style={{
                width: '100%',
                aspectRatio: '4/3',
                maxHeight: 'calc(100vh - 280px)',
                backgroundColor: 'var(--color-bg-canvas)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-secondary)',
              }}
            >
              繪圖區域（待接入 DrawingCanvas 元件）
            </div>
          </div>
          <Toolbar
            tool={tool}
            brushColor={brushColor}
            brushSize={brushSize}
            onToolChange={setTool}
            onColorChange={setBrushColor}
            onSizeChange={setBrushSize}
            onClear={handleClear}
            onUndo={() => setCanUndo(false)}
            canUndo={canUndo}
          />
        </div>
      </main>

      {/* Right Sidebar — Chat */}
      <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
    </div>
  );
}

export default App;
