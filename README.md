
# Track the Thesis

> **We keep receipts.**
> A public thesis journal where every position is stated plainly, every receipt is logged, and time is left to grade the work.

---

## 🚀 Deploying to Vercel — Which preset?

**Use the `Vite` framework preset. Do NOT use Create React App (CRA).**

This project is built with **Vite + React + TypeScript**. When you import the repo into Vercel, it will auto-detect the preset from `vercel.json` — but if Vercel ever prompts you to pick one manually, here's the cheat sheet:

| Setting | Value |
|---|---|
| **Framework Preset** | **Vite** ✅ |
| **Build Command** | `npm run build` (auto-filled) |
| **Output Directory** | `dist` (auto-filled) |
| **Install Command** | `npm install` (auto-filled) |
| **Root Directory** | `./` (leave as default) |
| **Node.js Version** | 18.x or 20.x |

### ❌ Why not Create React App?

- This project does **not** use CRA's `react-scripts` — it uses Vite.
- CRA outputs to `build/`; Vite outputs to `dist/`. Picking the wrong preset will cause a failed deploy with "No Output Directory named 'build' found."
- CRA has been deprecated by the React team. Vite is the modern, faster alternative (and what's actually configured here).

### ❌ Also not these

- **Next.js** — no, this is a client-side SPA, not a Next app.
- **Other** — no, let Vercel pick Vite.

---

## One-click deploy (recommended flow)

1. Push this repo to GitHub (see below).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. On the **Configure Project** screen:
   - **Framework Preset** → `Vite` (should auto-detect; if not, pick it manually).
   - Leave build/output/install commands as defaults.
   - No environment variables required.
4. Click **Deploy**. Your site goes live at `your-project.vercel.app`.

### Or via Vercel CLI

```bash
npm i -g vercel
vercel            # first-time: links the project
vercel --prod     # production deploy
```

### Pushing to GitHub first

```bash
git init
git add .
git commit -m "Initial commit: Track the Thesis"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

---

## What this is

**Track the Thesis** is a single-author publishing platform for long-horizon investors, builders, and thinkers. It's not a blog, not a social feed, not a newsletter — it's a **receipt-keeping discipline** expressed as a product.

Every post is structured around two headers:

1. **The Thesis** — the argument. Why this, why now, why you.
2. **The Receipt** — the commitment. Entry price, position size, horizon, and a conviction score on a 0–100 scale.

The archive is chronologically honest. Misses are not deleted. The record stands.

---

## 🧑‍💻 Local development

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build to ./dist
npm run preview    # preview the production build locally
```

**Requirements:** Node.js 18+ and npm.

---

## 📁 Deployment files

| File             | Purpose                                                           |
|------------------|-------------------------------------------------------------------|
| `package.json`   | Dependencies and npm scripts (`dev`, `build`, `preview`).         |
| `vite.config.ts` | Vite + React plugin config. Outputs to `dist/`.                   |
| `tsconfig.json`  | TypeScript config (strict, ES2020, JSX react-jsx).                |
| `vercel.json`    | Framework preset (`vite`), SPA rewrites, asset caching headers.   |
| `index.html`     | Entry HTML. Loads `/src/index.tsx` as an ES module.               |
| `public/favicon.svg` | Site favicon (the reticle + receipt dot).                     |
| `.gitignore`     | Excludes `node_modules`, `dist`, `.vercel`, env files, etc.       |
| `.vercelignore`  | Keeps deploy uploads lean.                                        |

### SPA routing note

The app uses **hash-based routes** (`#read`, `#about`, `#studio`, `#login`), but `vercel.json` also includes a catch-all rewrite (`/(.*) → /`) so any deep path serves `index.html`. This makes future migration to `react-router` frictionless.

---

## Core principles

| # | Principle | What it means in the product |
|---|-----------|------------------------------|
| 01 | **State the thesis.** | Every post opens with a plain-language argument. No hedges buried in footnotes. |
| 02 | **Log the receipt.** | Price, size, horizon, and a conviction meter are first-class citizens of the data model. |
| 03 | **Let time grade it.** | The archive is append-only in spirit. Posts can be edited, but nothing is deleted under pressure. |

---

## Feature overview

### 📖 The Feed (public)
- Chronological or popularity-sorted stream of published theses.
- **Two-header post format**: each post renders `The Thesis` and `The Receipt` as distinct, titled sections.
- **Conviction badge** — a color-banded meter (Weak → Cautious → Constructive → High → Iron-clad) rendered at the bottom of every post.
- **Color-coded tags** — every tag value gets a deterministic palette, so *Bitcoin* always looks the same wherever it appears. Well-known assets (BTC, ETH, TSLA, SOL, Gold) get signature brand colors.
- **Tag & folder filtering** with click-tracking → drives a "Trending" sidebar ranked by real reader attention.
- **Search** across titles, bodies, tags (`#champion`), folders, and dates (`2024-05`).
- **Recent** jump list and per-tag/per-folder chip filters.
- **Reply threading** — follow-ups link back to their parent post with a one-click scroll-to anchor.
- **Hearts** with persistent per-reader state and pop animation.
- **Share menu** — X, Threads, Messenger, Instagram, and copy-link.

### ✍️ The Studio (owner-only)
- Protected by email + password login.
- **Two-section composer** — dedicated editors for H1 (The Thesis) and H2 (The Receipt), each with independent AI refinement.
- **Conviction input** — slider + numeric + preset chips (25 / 50 / 73 / 85 / 95), with live band labeling.
- **Tag editor** — label+value pairing with preset quick-picks (Champion, Proxy, Price, Theme, Horizon, Risk, Sector), smart paste (`Champion: Elon Musk` auto-splits), and live preview.
- **AI Assistant** — choose from GPT-4o, Claude 3.5, Gemini 1.5, Llama 3.1, etc. Refine each section independently with optional voice guidance.
- **Library** — searchable, folder-filtered list of all posts (drafts included) with inline edit / reply / delete.
- **Drafts** supported — save without publishing; resume later.

### 📜 The About page
- A manifesto. The house style. The pitch.

### 🔐 Auth
- Single-owner model.
- Session + all content persisted via `localStorage` (with a sandbox fallback).
- Non-owners attempting `#studio` are redirected to `#login`.

---

## Tech stack

- **React 18** + **TypeScript**
- **Vite 5** — dev server + production bundler *(not Create React App)*
- **Vanilla CSS** (per-component, co-located)
- **Fraunces** (serif display) + **Inter** (UI) via Google Fonts `@import`
- **No third-party runtime libraries** beyond React/ReactDOM

---

## Project structure

```
.
├── index.html                    # Vite entry HTML
├── vite.config.ts                # Vite config
├── vercel.json                   # Vercel deploy config (framework: vite)
├── tsconfig.json                 # TypeScript config
├── package.json
├── public/
│   └── favicon.svg
└── src/
    ├── index.tsx                 # React root
    ├── App.tsx                   # Shell, routing (hash-based), nav
    ├── App.css                   # Design tokens, nav, footer
    │
    ├── components/               # Generic, shared UI
    │   ├── Icon.tsx
    │   ├── SearchBar.tsx/.css
    │   ├── TagPill.tsx/.css
    │   └── BrandLogo.tsx/.css
    │
    ├── features/
    │   ├── posts/                # Domain core
    │   ├── ai/                   # Model registry + refinement stub
    │   ├── auth/                 # Owner login / session
    │   ├── owner/                # Studio (authoring)
    │   ├── public/               # Reader experience
    │   └── about/
    │
    └── utils/
        └── persistence.ts        # Async storage wrapper (localStorage + fallback)
```

---

## Troubleshooting deploy

**"No Output Directory named 'build' found"**
→ You picked the wrong preset. Change **Framework Preset** to **Vite** in your Vercel project settings (Settings → General → Build & Development Settings).

**"Command 'react-scripts build' not found"**
→ Same cause. This is not a CRA project. Switch the preset to **Vite**.

**Blank page after deploy, 404 on refresh**
→ Make sure `vercel.json` is in the repo root with the SPA rewrite (`/(.*) → /`). It's already included here — don't delete it.

**Build succeeds locally but fails on Vercel**
→ Check the Vercel build log for the Node version. Set it to 18.x or 20.x under Settings → General → Node.js Version.

---

## Owner credentials (demo)

```
Email:    dbsuelan@revlv.com
Password: Enterpassword!@#
```

> ⚠️ **Before going live**, change these in `src/features/auth/AuthContext.tsx` — or, better, swap `AuthContext` for a real auth provider (Supabase, Auth.js, Clerk) and move the credential check server-side.

---

## Design language

- **Type** — Fraunces (serif, editorial) for titles and headings; Inter for UI and body.
- **Palette** — warm off-white (`#fafaf7`) canvas, near-black (`#1a1a1a`) ink, Bitcoin-orange (`#f7931a`) as the single accent / "receipt" signal.
- **Rhythm** — generous line-height (1.7), dashed separators between thesis and receipt, signal-orange rule before every section heading.
- **Conviction bands** — a five-band diverging scale from red (weak) → orange → olive → green → steel blue (iron-clad).

---

## Philosophy

> *"A civilization that lowers its time preference builds cathedrals, libraries, and long-dated infrastructure. We write as if someone will read this in ten years — because someone will, and that someone is usually us."*

Markets reward preparation, not prediction. The position, patiently held, compounds. Capital follows clarity.

**@TracktheThesis — We keep receipts.**
