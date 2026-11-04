# 🐝 HoneyRoute
## Apiary Intelligence Platform (Powered by EcoVentus)

> 2nd Place — Huawei Developer Competition LATAM (Brasil) 2025  
> Mobile-first PWA that empowers beekeepers with AI-driven hive health detection, alerts, and actionable recommendations.

---

## 🚀 Overview
HoneyRoute helps smallholder beekeepers and cooperative administrators detect hive issues (e.g., Varroa risk), receive AI-based recommendations, and log actions even offline.  
It’s designed for **low-connectivity rural areas**, providing **multilingual (EN/ES-MX)** support and **offline-first synchronization**.

---

## 🧩 Key Features
- 📸 **Photo-based AI analysis** — capture and detect health risks (e.g., pests, diseases).  
- ⚠️ **Alert system** — severity-filtered inbox and resolution tracking.  
- 🧭 **Hive management** — create, view, and track hives with history and KPIs.  
- 🌍 **Map view** — visualize apiaries and risk zones.  
- 🌐 **Bilingual + offline mode** — full i18n (EN/ES-MX) and background sync.  
- 🔐 **Privacy-first** — local data storage, consent-based camera & GPS.

---

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-------------|
| Frontend | **React + TypeScript + Tailwind + Next.js SSR** |
| Backend | **Node.js  + REST/GraphQL API** |
| Architecture | **pnpm monorepo + TurboRepo + Husky + Commitlint + CI/CD** |
| AI Integration | **Custom API for hive image risk analysis** |
| Offline | **Service Workers + IndexedDB queue system** |
| i18n | **EN base + ES-MX localization** |

---

## 🧭 System Flow
1. **Capture/Upload** hive image  
2. **AI evaluates** risk level (low/medium/high)  
3. **Recommendations** generated dynamically  
4. **User logs actions** → synced once online  

---

## 🧠 UX & Design
- Designed 22 responsive interfaces in Figma (mobile-first).
- UI based on 8pt grid, AA contrast, and inclusive copywriting.  
- Components: Buttons, Cards, Tabs, Toasts, Modals, Badges.  
- Accessibility: WCAG 2.2 AA (focus rings, 44×44 touch targets).

---

## 🧩 Folder Structure
  frontend/   → React + Tailwind + i18n + offline logic
  backend/    → API handlers
  docs/       → SRS + Design Spec + Brand Sheet
  scripts/    → CI/CD + automation

# 1) Install

pnpm install

# 2) Generate scaffolds (if first time)

pnpm bootstrap

# 3) Environment variables

cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# 4) (Optional) Local services

# brew install --cask docker && open -a Docker

docker compose up -d

# 5) Parallel development

pnpm dev

1. Stack
   • Frontend: Next.js (App Router), TypeScript, Tailwind v3, PostCSS, autoprefixer.
   • Backend: NestJS (TypeScript), (mock /analysis included).
   • Tooling: PNPM workspaces, Turborepo, Husky + lint-staged, Commitlint, Prettier.
   • CI: GitHub Actions separated per package (frontend/** and backend/**).
   • Backend: NestJS (TypeScript), (mock /analysis included).
   • Tooling: PNPM workspaces, Turborepo, Husky + lint-staged, Commitlint, Prettier.
   • CI: GitHub Actions separated per package (frontend/** and backend/**).

Note: We pinned Tailwind v3 for stability. (If someone installs v4 you’ll get an error with the PostCSS plugin; see “Troubleshooting.”)

2. Requirements
   • Node.js 20 (ideally with nvm)
3. Requirements
   • Node.js 20 (ideally with nvm)
   echo "20" > .nvmrc && nvm use
   • pnpm 9.x
   corepack disable && npm i -g pnpm@9.7.0
   • Git y VS Code (recomendado).
   • Docker Desktop (only if you’ll use local Postgres/Redis):
   brew install --cask docker
   • Docker Desktop (only if you’ll use local Postgres/Redis):
   brew install --cask docker

# Front + Back with Turbo

         pnpm dev
         # Or per package:
         # Or per package:
         pnpm --filter frontend dev
         pnpm --filter backend dev

# 6) Scripts

Root
• pnpm dev → runs frontend + backend in parallel (Turbo).
• pnpm build / pnpm lint / pnpm test → run per package.
• pnpm bootstrap → creates Next/Nest scaffolds.
• pnpm prepare → installs Husky (git hooks).
Root
• pnpm dev → runs frontend + backend in parallel (Turbo).
• pnpm build / pnpm lint / pnpm test → run per package.
• pnpm bootstrap → creates Next/Nest scaffolds.
• pnpm prepare → installs Husky (git hooks).

Frontend
• pnpm --filter frontend dev → Next dev on http://localhost:3000.
• pnpm --filter frontend build → production build.
• pnpm --filter frontend dev → Next dev on http://localhost:3000.
• pnpm --filter frontend build → production build.

Backend
• pnpm --filter backend dev → Nest dev on http://localhost:3001 (with CORS).
• Mock endpoints:
• pnpm --filter backend dev → Nest dev on http://localhost:3001 (with CORS).
• Mock endpoints:
• POST /analysis → { jobId }
• GET /analysis/:jobId → { status: "done", riskLevel: "medium" }

6. Environment variables
   frontend/.env.local
   NEXT_PUBLIC_API_URL=http://localhost:3001
   NEXT_PUBLIC_APP_NAME=HoneyRoute
   NEXT_PUBLIC_DEFAULT_LOCALE=en
   backend/.env
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/honeyroute
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=change-me
   S3_ENDPOINT=
   S3_BUCKET=
   S3_ACCESS_KEY_ID=
   S3_SECRET_ACCESS_KEY=
   For CI/Prod, configure Secrets in GitHub (Settings → Secrets and variables → Actions).

7. Branch flow & collaboration
   • main: protected, stable (only approved PRs).
   • develop: feature integration.
   • features: feat/<área>-<slug> (p. ej. feat/ui-tabbar), fixes: fix/<área>-<slug>.

Conventions:
• Commits: Conventional Commits (feat:, fix:, chore:, docs:, refactor:, test:).
• PRs: use template; add screenshots; ensure CI passes.
• Merge: Squash & Merge into develop. From develop → main under release/tag (when applicable).
• PRs: use template; add screenshots; ensure CI passes.
• Merge: Squash & Merge into develop. From develop → main under release/tag (when applicable).

Checklist before to open PR:
• pnpm lint and pnpm build OK.
• Visible focus / basic accessibility (Tab keys).
• Update docs if applicable.
• CI Frontend runs on changes under frontend/**.
• CI Backend runs on changes under backend/**.
• See .github/workflows/_.yml. Jobs run: install → lint/test (best-effort) → build.
Checklist before to open PR:
• pnpm lint and pnpm build OK.
• Visible focus / basic accessibility (Tab keys).
• Update docs if applicable.
• CI Frontend runs on changes under frontend/**.
• CI Backend runs on changes under backend/**.
• See .github/workflows/_.yml. Jobs run: install → lint/test (best-effort) → build.

⸻

PWA (installable app)
• next-pwa configurado en frontend/next.config.mjs.
• SW se registra solo en producción (NODE_ENV=production).
• Fallback offline en /offline.
• Manifest
• src/app/manifest.ts (App Router).
• (Opcional) public/manifest.webmanifest si lo quieres servir estático.
• Íconos
• public/icons/favicon.png
• public/icons/apple-touch-icon.png
• public/icons/maskable.png (192x192 y 512x512)
• public/icons/logo-honeyroute-amber-1024.png (opcional para UI)
Build & run prod (necesario para SW)
pnpm --filter frontend build
pnpm --filter frontend start -H 0.0.0.0 -p 3002
Probar en el teléfono (misma red)

1.  Asegúrate de correr production server (no dev).
2.  Expón tu app con Cloudflare Tunnel:
    cloudflared tunnel --url http://localhost:3002
3.  Abre la URL https://<algo>.trycloudflare.com en el móvil.
4.  “Add to Home Screen” / “Instalar app”.

---

## 👩‍💻 Contributors
| Role | Name |
|------|------|
| Product & Front-End Lead | **Azul Grisel Ramírez Kuri** |
| Backend & Data | **Héctor Valdés** |

---

---

## 📸 Screenshots / Demo
https://honeyroute.netlify.app/onboarding

---

## 📄 License
© 2025 HoneyRoute — Powered by EcoVentus. All rights reserved.
