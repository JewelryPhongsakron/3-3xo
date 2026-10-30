# XO OX: Tic-Tac-Toe vs AI

เกม XO 3x3 ที่เล่นกับ AI แบบ **Minimax** ซึ่งไม่มีทางแพ้ ทั้งระบบเขียนด้วย **Next.js + TypeScript** และแยกเป็น 3 service

🎮 **เล่นได้ที่:** https://three-3xo-1.onrender.com/

| Service | URL (Render) | หน้าที่ |
|---|---|---|
| frontend | https://three-3xo-1.onrender.com/ | หน้าเกม (Static Site) |
| backend | https://three-3xo.onrender.com/api/health | API gateway ที่ browser เรียก |
| model-service | https://three-3xo-model.onrender.com/api/health | AI Minimax เลือกตาเดิน |

> ⚠️ Render free plan จะพัก service ที่ไม่มีคนใช้ เกมแรกหลังพักอาจรอประมาณ 1 นาที ระหว่างนั้นหน้าเกมจะขึ้นว่า *"Waking up the AI server..."*

---

## สถาปัตยกรรม

```
 Browser                     backend (Next.js API)              model-service (Next.js API)
┌──────────────┐  POST     ┌─────────────────────────┐  POST    ┌───────────────────────┐
│ frontend     │ /api/move │ • ตรวจรูปแบบกระดาน        │ /api/    │ • Minimax หาตาที่ดีที่สุด  │
│ (static UI)  │──────────▶│ • ตรวจว่าเป็นตา AI จริง    │ predict  │ • ไม่รู้จัก browser        │
│ localStorage │◀──────────│ • เกมจบแล้ว → move: -1   │─────────▶│                       │
│ = สถิติ       │ {move}    │ • ตรวจตาที่ AI ตอบกลับ     │◀─────────│                       │
└──────────────┘           └─────────────────────────┘  {move}  └───────────────────────┘
```

- **frontend** จัดการ UI, สุ่มคนเริ่ม (ไม่ให้ฝ่ายเดียวเริ่มเกิน 2 เกมติด) และเก็บสถิติ ชนะ/แพ้/เสมอ ใน `localStorage` build เป็นไฟล์ static (`output: 'export'`)
- **backend** เป็นจุดเดียวที่ browser เรียก มีหน้าที่ตรวจข้อมูล จัดการ CORS และป้องกันกรณี model ล่มหรือตอบตาที่ผิดกติกา (ตอบกลับเป็น 502)
- **model-service** มีแค่ logic ของ AI เท่านั้น ถ้าจะเปลี่ยนเป็น model อื่นในอนาคต (เช่น ML) ก็เปลี่ยนแค่ service นี้

## โครงสร้างโปรเจค

```
3-3xo/
├── frontend/                 # Next.js UI (static export → out/)
│   └── src/
│       ├── app/              # layout, page, globals.css, icon
│       ├── components/       # Game, Board, Square, RandomizerModal, ResultModal
│       └── lib/              # game.ts (กติกา), api.ts (เรียก backend), storage.ts (localStorage)
├── backend/                  # Next.js API-only
│   └── src/
│       ├── app/api/move/     # POST /api/move
│       ├── app/api/health/   # GET  /api/health
│       └── lib/              # move.ts (logic), board.ts, modelClient.ts, cors.ts, config.ts
├── model-service/            # Next.js API-only
│   └── src/
│       ├── app/api/predict/  # POST /api/predict
│       ├── app/api/health/   # GET  /api/health
│       └── lib/              # minimax.ts, board.ts
├── render.yaml               # Render Blueprint ของทั้ง 3 service
└── package.json              # script สำหรับรันทั้งระบบพร้อมกัน
```

แต่ละ service มี `package.json` และ lockfile ของตัวเอง จึง deploy แยกกันได้ (ตั้ง Root Directory บน Render เป็นโฟลเดอร์นั้น)

## รันบนเครื่อง

ต้องใช้ **Node.js 20.9 ขึ้นไป**

```bash
npm run install:all
```

```bash
npm run dev
```

| Service | URL |
|---|---|
| frontend | http://localhost:5173 |
| backend | http://localhost:3000 |
| model-service | http://localhost:5001 |

ค่าเริ่มต้นของ env ใช้กับเครื่อง local ได้ทันที ถ้าต้องการเปลี่ยน ให้ copy `.env.example` เป็น `.env.local` ในแต่ละโฟลเดอร์

### คำสั่งอื่น ๆ (รันจาก root)

| คำสั่ง | ทำอะไร |
|---|---|
| `npm test` | รัน unit test ทั้ง 3 service (Vitest) |
| `npm run lint` | ESLint (eslint-config-next) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run build` | build ทั้ง 3 service |

## Environment variables

| Service | ตัวแปร | ค่าเริ่มต้น | ค่าบน Render |
|---|---|---|---|
| frontend | `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | `https://three-3xo.onrender.com` |
| backend | `MODEL_SERVICE_URL` | `http://localhost:5001` | `https://three-3xo-model.onrender.com` |
| backend | `CORS_ORIGIN` | `*` | `https://three-3xo-1.onrender.com` |
| backend | `MODEL_TIMEOUT_MS` | `60000` | `60000` |

> `NEXT_PUBLIC_API_URL` ถูกฝังลงในไฟล์ตอน build ถ้าแก้ค่านี้ต้อง deploy frontend ใหม่

## API

### `POST /api/move` (backend)
```json
// request
{ "squares": ["X", null, null, null, null, null, null, null, null] }
// response 200
{ "move": 4 }
```
- `squares` ต้องเป็น array 9 ช่อง ค่าเป็น `"X"`, `"O"` หรือ `null` และต้องเป็นตาของ O
- ถ้าเกมจบแล้วจะได้ `{ "move": -1 }`
- `400` = กระดานไม่ถูกต้องหรือยังไม่ใช่ตา AI, `502` = model-service ล่มหรือตอบตาผิดกติกา

### `POST /api/predict` (model-service)
```json
{ "squares": [...9 ช่อง], "player": "O" }   →   { "move": 4 }
```

### `GET /api/health` (backend และ model-service)
```json
{ "status": "ok", "service": "backend" }
```

## Deploy บน Render

### ย้าย service เดิมมาใช้โครงสร้างใหม่
ตอนนี้บน Render มี service อยู่แล้ว 2 ตัว ต้องแก้ค่าตามนี้ (Dashboard → service → Settings)

**three-3xo-1 (frontend, Static Site)**
- Root Directory: `my-app` → `frontend`
- Build Command: `npm ci && npm run build`
- Publish Directory: `dist` → `out`
- Environment: `NEXT_PUBLIC_API_URL=https://three-3xo.onrender.com`

**three-3xo (backend, Web Service)**
- Root Directory: `backend`
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Health Check Path: `/api/health`
- Environment: `MODEL_SERVICE_URL`, `CORS_ORIGIN` ตามตารางด้านบน

**three-3xo-model (model-service, Web Service ตัวใหม่)**
- New → Web Service → repo นี้
- Root Directory: `model-service`
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Health Check Path: `/api/health`

ถ้า Render ตั้งชื่อ URL ของ model-service ต่างจาก `three-3xo-model.onrender.com` ให้ไปแก้ `MODEL_SERVICE_URL` ของ backend ให้ตรงกัน

### หรือใช้ Blueprint
`render.yaml` ระบุทั้ง 3 service ไว้แล้ว ไปที่ New → Blueprint → เลือก repo นี้ (ถ้า service ชื่อเดิมมีอยู่แล้ว Render จะถามให้ผูกหรือสร้างใหม่)

ลำดับการ deploy ที่แนะนำ: **model-service → backend → frontend**

## Tech stack
Next.js 16 · React 19 · TypeScript · Tailwind CSS 3 · lucide-react · Vitest · ESLint
