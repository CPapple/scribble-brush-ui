# Scribble Brush - 多人塗鴉猜謎遊戲前端

## 快速開始

```bash
# 安裝依賴
npm install

# 開發模式
npm run dev

# 建構生產版本
npm run build
```

## 專案架構

```
frontend/
├── index.html              # 入口 HTML
├── vite.config.js          # Vite 設定
├── package.json
└── src/
    ├── main.jsx             # React 入口
    ├── App.jsx              # 主應用元件（佈局、狀態）
    ├── DrawingCanvas.jsx    # 畫布邏輯
    └── styles.css           # 全域樣式（Design System V2）
```

## 設計系統（Design System V2）

### CSS 變數

所有樣式以 CSS Custom Properties 實作，位於 `src/styles.css` 的 `:root` 區塊：

| 類別 | 變數前綴 | 說明 |
|------|----------|------|
| 間距 | `--space-*` | 8px 网格系统 |
| 字體 | `--font-*` | 階層式字體設定 |
| 顏色 | `--color-*` | 品牌色 + Light/Dark Mode |
| 動畫 | `--transition-*` | 微互動參數 |
| 陰影 | `--shadow-*` | 卡片陰影層級 |

### 主題切換

```jsx
// 使用 data-theme="dark" 屬性切換
document.documentElement.setAttribute('data-theme', 'dark');
```

### 動畫時長

- **微互動**：`150ms ease-out`
- **狀態切換**：`250ms cubic-bezier(0.4, 0, 0.2, 1)`
- **勝利動畫**：`400-500ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`

## 響應式斷點

| 斷點 | 佈局 |
|------|------|
| `> 768px` | 三欄式（玩家列表 / 畫布 / 聊天） |
| `≤ 768px` | 單欄 + 側邊抽屜 |

## 與後端整合

### API 端點（待實作）

```
POST /api/room/create        # 創建房間
POST /api/room/join          # 加入房間
GET  /api/room/:id           # 取得房間狀態
POST /api/draw               # 上傳繪圖資料
GET  /api/messages/:roomId   # 取得聊天歷史
```

### WebSocket 事件（待實作）

```js
// 接收
socket.on('player:joined', ({ name, score }) => {})
socket.on('player:left', ({ id }) => {})
socket.on('draw:update', ({ strokes }) => {})
socket.on('guess:correct', ({ playerId, score }) => {})
socket.on('timer:sync', ({ timeLeft }) => {})

// 發送
socket.emit('draw:stroke', { x, y, color, size })
socket.emit('guess:submit', { text })
```

## 命名規則

- 分支：`feature/功能名稱`、`bugfix/問題名稱`
- Commit：`feat:`, `fix:`, `refactor:`, `docs:`, `style:`

## 環境變數

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```
