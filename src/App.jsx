import { useState, useCallback, useRef, useEffect, forwardRef } from 'react';
import DrawingCanvas from './DrawingCanvas.jsx';
import './styles.css';

// ─── Attack Card Definitions ────────────────────────────────────────────────
const ATTACK_CARDS = [
  {
    id: 'blur',
    name: '模糊',
    icon: '🌫️',
    type: 'visual',
    description: '使目標視線模糊',
    duration: 8000,
    effectClass: 'canvas-effect--blur',
  },
  {
    id: 'opacity',
    name: '透視',
    icon: '👻',
    type: 'visual',
    description: '畫面透明度提高',
    duration: 8000,
    effectClass: 'canvas-effect--opacity',
  },
  {
    id: 'lag',
    name: '卡頓',
    icon: '🐢',
    type: 'delay',
    description: '畫面幀率下降',
    duration: 8000,
    effectClass: 'canvas-effect--lag',
  },
  {
    id: 'water-break',
    name: '斷水',
    icon: '💧',
    type: 'tool',
    description: '畫筆突然沒水',
    duration: 8000,
    effectClass: 'canvas-effect--water-break',
  },
  {
    id: 'brush-size',
    name: '失控',
    icon: '🖌️',
    type: 'tool',
    description: '筆刷大小突變',
    duration: 8000,
    effectClass: 'canvas-effect--brush-mutation',
  },
  {
    id: 'flip-h',
    name: '反轉',
    icon: '↔️',
    type: 'control',
    description: '畫面左右反轉',
    duration: 8000,
    effectClass: '',
    flipHorizontal: true,
  },
  {
    id: 'flip-v',
    name: '顛倒',
    icon: '↕️',
    type: 'control',
    description: '畫面上下反轉',
    duration: 8000,
    effectClass: '',
    flipVertical: true,
  },
  {
    id: 'mask',
    name: '遮罩',
    icon: '🖼️',
    type: 'visual',
    description: '隨機圖片遮罩',
    duration: 8000,
    effectClass: 'canvas-effect--mask',
  },
  {
    id: 'color',
    name: '變色',
    icon: '🎨',
    type: 'tool',
    description: '筆刷色彩突變',
    duration: 8000,
    effectClass: 'canvas-effect--color-invert',
  },
  {
    id: 'change-word',
    name: '換題',
    icon: '❓',
    type: 'special',
    description: '突然更換題目',
    duration: 0,
    effectClass: '',
    changesWord: true,
  },
];

// ─── Theme Toggle ────────────────────────────────────────────────────────────
function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="btn btn--ghost btn--icon"
      onClick={onToggle}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

// ─── Ping Indicator ─────────────────────────────────────────────────────────
function PingIndicator({ ping }) {
  let level = 'good';
  if (ping >= 150) level = 'bad';
  else if (ping >= 80) level = 'medium';

  return (
    <div className="ping-indicator" title={`延遲: ${ping}ms`}>
      <span className={`ping-dot ping-dot--${level}`} />
      <span className="text-muted">{ping}ms</span>
    </div>
  );
}

// ─── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ name, size = '' }) {
  const initials = name ? name.slice(0, 1).toUpperCase() : '?';
  return (
    <div className={`avatar ${size ? `avatar--${size}` : ''}`}>
      {initials}
    </div>
  );
}

// ─── Player Item ────────────────────────────────────────────────────────────
function PlayerItem({ name, score, isDrawing, isFirst, isMe, isAttacked, isAttacker }) {
  return (
    <div
      className={`player-item ${isAttacked ? 'player-item--attacked' : ''} ${isFirst ? 'player-item--first' : ''} ${isAttacked ? 'attack-warning' : ''}`}
    >
      <Avatar name={name} size="sm" />
      <div className="player-info">
        <div className="player-name">
          {name} {isMe && <span className="text-muted">(你)</span>}
        </div>
        <div className="player-score">{score} 分</div>
      </div>
      {isDrawing && <span className="badge badge--warning">✏️</span>}
      {isFirst && !isDrawing && <span className="badge badge--gold">👑</span>}
    </div>
  );
}

// ─── Player List ────────────────────────────────────────────────────────────
function PlayerList({ players, myId, attackedPlayerId }) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <aside className="sidebar-left card">
      <div className="p-md" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2>玩家</h2>
      </div>
      <div className="player-list">
        {sorted.map((player, index) => (
          <PlayerItem
            key={player.id}
            name={player.name}
            score={player.score}
            isDrawing={player.isDrawing}
            isFirst={index === 0}
            isMe={player.id === myId}
            isAttacked={player.id === attackedPlayerId}
          />
        ))}
      </div>
    </aside>
  );
}

// ─── Chat Message ────────────────────────────────────────────────────────────
function ChatMessage({ sender, text, type }) {
  return (
    <div className={`chat-message chat-message--${type}`}>
      {sender && <strong>{sender}: </strong>}
      {text}
    </div>
  );
}

// ─── Chat Panel ──────────────────────────────────────────────────────────────
function ChatPanel({ messages, onSendMessage }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <aside className="sidebar-right card">
      <div className="p-md" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2>聊天 / 猜題</h2>
      </div>
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-wrapper" onSubmit={handleSubmit}>
        <input
          type="text"
          className="input"
          placeholder="輸入答案或聊天..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="聊天輸入框"
        />
        <button type="submit" className="btn btn--primary">送出</button>
      </form>
    </aside>
  );
}

// ─── Game Header ────────────────────────────────────────────────────────────
function GameHeader({ timeLeft, wordHint }) {
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

// ─── Tool Button ────────────────────────────────────────────────────────────
function ToolButton({ icon, isActive, onClick, label }) {
  return (
    <button
      className={`tool-btn ${isActive ? 'tool-btn--active' : ''}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
    </button>
  );
}

// ─── Color Swatch ───────────────────────────────────────────────────────────
function ColorSwatch({ color, isActive, onClick, label }) {
  return (
    <button
      className={`tool-btn ${isActive ? 'tool-btn--active' : ''}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span className="color-swatch" style={{ backgroundColor: color }} />
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
        <span className="brush-dot" style={{ width: size, height: size }} />
      </div>
    </button>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────
function Toolbar({ tool, brushColor, brushSize, onToolChange, onColorChange, onSizeChange }) {
  const colors = ['#000000', '#FF6F61', '#20B2AA', '#90EE90', '#FFD700', '#FF4500', '#8B5CF6', '#3E403F'];
  const sizes = [4, 8, 12, 20];

  return (
    <div className="toolbar">
      <div className="toolbar-group">
        <ToolButton icon="🖌️" isActive={tool === 'brush'} onClick={() => onToolChange('brush')} label="畫筆" />
        <ToolButton icon="🧹" isActive={tool === 'eraser'} onClick={() => onToolChange('eraser')} label="橡皮擦" />
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        {colors.map((c) => (
          <ColorSwatch key={c} color={c} isActive={brushColor === c} onClick={() => onColorChange(c)} label={`顏色 ${c}`} />
        ))}
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        {sizes.map((s) => (
          <BrushSizeButton key={s} size={s} isActive={brushSize === s} onClick={() => onSizeChange(s)} />
        ))}
      </div>
      <div className="toolbar-divider" />
      <div className="toolbar-group">
        <ToolButton icon="↩️" onClick={() => {}} label="復原" />
        <ToolButton icon="🗑️" onClick={() => {}} label="清空" danger />
      </div>
    </div>
  );
}

// ─── Drawing Canvas ─────────────────────────────────────────────────────────
function DrawingCanvas({ canvasRef, tool, brushColor, brushSize, flipH, flipV, canvasEffect }) {
  return (
    <div
      className={`canvas-wrapper ${flipH ? 'canvas-wrapper--flipped' : ''} ${flipV ? 'canvas-wrapper--flipped-v' : ''} ${canvasEffect ? 'canvas-effect--active' : ''}`}
    >
      {canvasEffect && <div className="canvas-effect-overlay" />}
      <canvas
        ref={canvasRef}
        aria-label="繪圖畫布"
        title="在畫布上繪圖"
        style={{ cursor: tool === 'eraser' ? 'crosshair' : 'crosshair' }}
      />
    </div>
  );
}

// ─── Attack Card ─────────────────────────────────────────────────────────────
function AttackCard({ card, isSelected, isDisabled, onClick }) {
  return (
    <button
      className={`attack-card attack-card--${card.type} ${isSelected ? 'attack-card--selected' : ''} ${isDisabled ? 'attack-card--disabled' : ''}`}
      onClick={onClick}
      disabled={isDisabled}
      title={card.description}
    >
      <span className="attack-card__icon">{card.icon}</span>
      <span className="attack-card__name">{card.name}</span>
    </button>
  );
}

// ─── Hand Cards ─────────────────────────────────────────────────────────────
function HandCards({ cards, selectedCard, onSelectCard, disabled }) {
  if (cards.length === 0) return null;

  return (
    <div className="hand-cards-container">
      <div className="hand-cards-label">🎴 手牌</div>
      <div className="hand-cards">
        {cards.map((card) => (
          <AttackCard
            key={card.id}
            card={card}
            isSelected={selectedCard?.id === card.id}
            isDisabled={disabled}
            onClick={() => onSelectCard(card)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Attack Target Modal ─────────────────────────────────────────────────────
function AttackTargetModal({ card, players, myId, onSelectTarget, onCancel }) {
  const availablePlayers = players.filter((p) => p.id !== myId && !p.isDrawing);

  return (
    <div className="attack-target-modal" onClick={onCancel}>
      <div className="attack-target-modal__content" onClick={(e) => e.stopPropagation()}>
        <div className="attack-target-modal__title">
          {card.icon} 選擇攻擊目標
        </div>
        <div className="attack-target-modal__players">
          {availablePlayers.map((player) => (
            <div
              key={player.id}
              className="attack-target-modal__player"
              onClick={() => onSelectTarget(player.id)}
            >
              <Avatar name={player.name} />
              <div className="attack-target-modal__player-info">
                <div className="attack-target-modal__player-name">{player.name}</div>
                <div className="attack-target-modal__player-role">
                  {player.score} 分
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="btn btn--ghost attack-target-modal__cancel" onClick={onCancel}>
          取消
        </button>
      </div>
    </div>
  );
}

// ─── Main App ───────────────────────────────────────────────────────────────
function App() {
  // ── Theme ──
  const [theme, setTheme] = useState('light');

  // ── Game State ──
  const [players, setPlayers] = useState([
    { id: '1', name: '宇辰', score: 850, isDrawing: true },
    { id: '2', name: '小美', score: 720, isDrawing: false },
    { id: '3', name: '我', score: 690, isDrawing: false },
    { id: '4', name: '阿偉', score: 500, isDrawing: false },
  ]);
  const myId = '3';

  const [messages, setMessages] = useState([
    { type: 'system', text: '🎨 宇辰 開始繪圖了！' },
    { type: 'normal', sender: '小美', text: '這看起來像一隻狗？' },
    { type: 'wrong', sender: '阿偉', text: '是貓嗎' },
  ]);

  const [timeLeft, setTimeLeft] = useState(45);
  const wordHint = '_ _ _ _ _';

  // ── Drawing State ──
  const [tool, setTool] = useState('brush');
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(8);
  const canvasRef = useRef(null);

  // ── Attack System ──
  const [handCards, setHandCards] = useState([
    ATTACK_CARDS[0],
    ATTACK_CARDS[4],
  ]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showTargetModal, setShowTargetModal] = useState(false);
  const [attackedPlayerId, setAttackedPlayerId] = useState(null);
  const [activeEffect, setActiveEffect] = useState(null);
  const [isEffectIncoming, setIsEffectIncoming] = useState(false);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [canvasEffect, setCanvasEffect] = useState(null);
  const [newWord, setNewWord] = useState(null);

  // ── Canvas Drawing Logic ──
  const getCanvasPos = useCallback((e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    if (e.touches) {
      clientX = e.touches[0]?.clientX ?? e.clientX;
      clientY = e.touches[0]?.clientY ?? e.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const draw = useCallback((from, to) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#FFFFFF' : brushColor;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  }, [brushColor, brushSize, tool]);

  const handlePointerDown = useCallback((e) => {
    const pos = getCanvasPos(e);
    if (!pos) return;
    isDrawingRef.current = true;
    lastPosRef.current = pos;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = brushSize;
      ctx.fillStyle = tool === 'eraser' ? '#FFFFFF' : brushColor;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [getCanvasPos, brushColor, brushSize, tool]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawingRef.current) return;
    const pos = getCanvasPos(e);
    if (!pos || !lastPosRef.current) return;
    draw(lastPosRef.current, pos);
    lastPosRef.current = pos;
  }, [getCanvasPos, draw]);

  const handlePointerUp = useCallback(() => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  }, []);

  // ── Canvas Resize ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ── Timer ──
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Chat ──
  const handleSendMessage = (text) => {
    setMessages((prev) => [...prev, { type: 'normal', sender: '我', text }]);
  };

  // ── Card Selection ──
  const handleSelectCard = (card) => {
    setSelectedCard(card);
    setShowTargetModal(true);
  };

  // ── Attack Execution ──
  const handleSelectTarget = useCallback((targetId) => {
    if (!selectedCard) return;
    setShowTargetModal(false);
    setAttackedPlayerId(targetId);

    // Add system message
    const targetPlayer = players.find((p) => p.id === targetId);
    setMessages((prev) => [
      ...prev,
      { type: 'attack-announce', text: `⚠️ ${targetPlayer?.name} 即将受到「${selectedCard.name}」攻擊！` },
    ]);

    // 1.5s warning flash
    setIsEffectIncoming(true);
    setTimeout(() => {
      setIsEffectIncoming(false);
      setAttackedPlayerId(null);

      // Apply effect for 8s
      setActiveEffect(selectedCard);

      if (selectedCard.flipHorizontal) setFlipH(true);
      if (selectedCard.flipVertical) setFlipV(true);
      if (selectedCard.effectClass) setCanvasEffect(selectedCard.effectClass);

      // Word change effect
      if (selectedCard.changesWord) {
        const randomCard = ATTACK_CARDS[Math.floor(Math.random() * ATTACK_CARDS.length)];
        setNewWord(`[${selectedCard.icon} 已換題]`);
        setTimeout(() => setNewWord(null), 3000);
      }

      setMessages((prev) => [
        ...prev,
        { type: 'system', text: `💥 ${selectedCard.name} 攻擊生效！` },
      ]);

      // After 8s, start 2s fade
      setTimeout(() => {
        setCanvasEffect(null);
        setFlipH(false);
        setFlipV(false);
        setActiveEffect(null);
        setMessages((prev) => [
          ...prev,
          { type: 'system', text: `✨ 效果結束` },
        ]);
      }, 8000);
    }, 1500);

    // Remove card from hand
    setHandCards((prev) => prev.filter((c) => c.id !== selectedCard.id));
    setSelectedCard(null);
  }, [selectedCard, players]);

  // ── Word Hint Display ──
  const displayWordHint = newWord || wordHint;

  // ── Theme Toggle ──
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <>
      {/* Background Layer */}
      <div
        className={`bg-layer ${isEffectIncoming ? 'bg-layer--warning' : ''}`}
        data-theme={theme}
      />

      {/* Main App */}
      <div className="app-wrapper">
        <div className="app-layout">
          {/* Left - Player List */}
          <PlayerList
            players={players}
            myId={myId}
            attackedPlayerId={isEffectIncoming ? attackedPlayerId : null}
          />

          {/* Center - Game Area */}
          <main className="game-area">
            {/* Top Bar */}
            <div className="game-top-bar">
              <div className="game-title">Scribble Brush</div>
              <div className="game-status-icons">
                <PingIndicator ping={42} />
                <ThemeToggle theme={theme} onToggle={toggleTheme} />
              </div>
            </div>

            {/* Canvas Card */}
            <div className={`canvas-card card ${canvasEffect || isEffectIncoming ? 'attack-effect--active' : ''}`}>
              <GameHeader timeLeft={timeLeft} wordHint={displayWordHint} />
              <DrawingCanvas
                ref={canvasRef}
                tool={tool}
                brushColor={brushColor}
                brushSize={brushSize}
                flipH={flipH}
                flipV={flipV}
                canvasEffect={canvasEffect}
                onDrawStart={handlePointerDown}
                onDrawMove={handlePointerMove}
                onDrawEnd={handlePointerUp}
              />
              <Toolbar
                tool={tool}
                brushColor={brushColor}
                brushSize={brushSize}
                onToolChange={setTool}
                onColorChange={setBrushColor}
                onSizeChange={setBrushSize}
              />
            </div>
          </main>

          {/* Right - Chat */}
          <ChatPanel messages={messages} onSendMessage={handleSendMessage} />
        </div>
      </div>

      {/* Hand Cards */}
      <HandCards
        cards={handCards}
        selectedCard={selectedCard}
        onSelectCard={handleSelectCard}
        disabled={showTargetModal}
      />

      {/* Attack Target Modal */}
      {showTargetModal && selectedCard && (
        <AttackTargetModal
          card={selectedCard}
          players={players}
          myId={myId}
          onSelectTarget={handleSelectTarget}
          onCancel={() => {
            setShowTargetModal(false);
            setSelectedCard(null);
          }}
        />
      )}
    </>
  );
}

export default App;
