# StoryNest 📚

A cozy, dark-mode digital library platform for publishing novels and short stories — with a fully protected in-browser reader.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + CSS Custom Properties + Framer Motion |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (Mongoose) |
| File Storage | Cloudinary (covers + PDFs) |
| Auth | JWT (admin) + session tokens (reader) |

## Project Structure

```
/mystory
  /client     ← Vite React frontend
  /server     ← Express + MongoDB backend
```

## Setup

### 1. Clone & install

```bash
# Install server deps
cd server
npm install

# Install client deps
cd ../client
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` in `/server`:

```bash
cd server
copy .env.example .env
```

Fill in:
- `MONGODB_URI` — Your MongoDB Atlas connection string
- `JWT_SECRET` — A long random string
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — From your Cloudinary dashboard
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — Your admin credentials

### 3. Seed the admin user

```bash
cd server
node scripts/seedAdmin.js
```

### 4. Run locally

```bash
# Terminal 1 — backend
cd server
npm run dev

# Terminal 2 — frontend
cd client
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## Admin Access

Navigate to `/admin/login` (not linked in public nav). Use the credentials from your `.env`.

## Deployment

### Frontend → Vercel
1. Push `/client` to GitHub
2. Import project in Vercel
3. Set build command: `npm run build`, output: `dist`
4. Add env var: `VITE_API_URL` (your Render backend URL) — update `client/src/lib/api.js` baseURL

### Backend → Render
1. Push `/server` to GitHub
2. Create a new Web Service on Render
3. Build command: `npm install`, start command: `node server.js`
4. Add all env vars from `.env.example`

---

## Content Protection Notice

> **Honest limit statement (for your records):**
>
> StoryNest uses multiple layers of content protection in the reader:
> - Pages served as Cloudinary-signed short-lived URLs (60-second expiry)
> - Pages rendered on HTML5 `<canvas>` (not raw `<img>` tags)
> - Watermark burned into canvas pixels: `"StoryNest • [sessionId] • [date/time]"` — diagonal, tiled, semi-transparent, with per-page random positional offset
> - Right-click context menu disabled
> - Text selection disabled (`user-select: none`)
> - Common keyboard shortcuts blocked (Ctrl+P, Ctrl+S, Ctrl+C, Ctrl+Shift+I, F12)
> - Tab/window blur detection — canvas blanks and shows overlay
> - DevTools detection heuristic (window size delta)
> - Single-page-at-a-time display (limits screenshot capture)
> - Rate limiting on page image endpoint (120 req/min per IP)
>
> **These measures deter casual copying, automated scraping, and screen-recording bots. They cannot block a phone camera pointed at the screen or an OS-level screenshot tool. Watermarking is the real safety net — it makes any leaked content traceable to a specific session ID and timestamp.**

---

## Genre Themes

Each genre has its own visual identity applied via CSS variables:

| Genre | Background | Accent | Fonts |
|---|---|---|---|
| Love Story | Warm blush `#2a1418` | Rose gold `#e0b0a8` | Playfair Display + Lora |
| Thriller | Cold near-black `#0d0f12` | Blood red `#b3232f` | Oswald + Inter |
| Mystery | Deep green-black `#0e1410` | Amber `#8a7a3c` | Lora + Merriweather |
| Horror | Black `#0a0a0a` | Dark red `#8a2424` | Lora + Inter |
| Drama | Charcoal-plum `#1c1620` | Dusty gold `#c9a876` | Lora + Lora |
| Fantasy | Deep indigo `#181233` | Violet `#9b72cf` | Cinzel + Lora |
| Poetry | Cream `#f7f3ec` | Dusty rose `#a87e8a` | Playfair Display + Lora |
