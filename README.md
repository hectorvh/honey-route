# honey-route

HoneyRoute serves smallholder beekeepers and cooperative administrators. It provides photo-based pest/disease detection (e.g., Varroa risk), alerting, recommendations, action logging, and basic mapping. Future phases include floral resource maps and predictive risk zones. The system will be branded as “HoneyRoute — Powered by EcoVentus.”

Monorepo with frontend (Next.js) and backend (NestJS) for the HoneyRoute MVP. Uses PNPM workspaces, Turborepo, Husky, and Commitlint for organized collaboration.
Monorepo with frontend (Next.js) and backend (NestJS) for the HoneyRoute MVP. Uses PNPM workspaces, Turborepo, Husky, and Commitlint for organized collaboration.

TL;DR (5 steps)
TL;DR (5 steps)

# 0) Requirements: Node 20, pnpm 9, Git. (Docker optional)

corepack disable && npm i -g pnpm@9.7.0

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

3)  Repository structure
    honey-route/
    ├─ frontend/ # Next.js (App Router)
    ├─ backend/ # NestJS
    ├─ docs/ # Architecture, API contract, ADRs
    ├─ frontend/ # Next.js (App Router)
    ├─ backend/ # NestJS
    ├─ docs/ # Architecture, API contract, ADRs
    ├─ .github/
    │ ├─ workflows/ # ci-frontend.yml, ci-backend.yml
    │ └─ ISSUE_TEMPLATE/ # bug/feature templates
    ├─ scripts/bootstrap.sh # generates front and back scaffolds
    ├─ docker-compose.yml # Postgres + Redis (optional)
    │ ├─ workflows/ # ci-frontend.yml, ci-backend.yml
    │ └─ ISSUE_TEMPLATE/ # bug/feature templates
    ├─ scripts/bootstrap.sh # generates front and back scaffolds
    ├─ docker-compose.yml # Postgres + Redis (optional)
    ├─ pnpm-workspace.yaml
    ├─ turbo.json # Turborepo tasks
    ├─ .husky/ # pre-commit, commit-msg
    ├─ turbo.json # Turborepo tasks
    ├─ .husky/ # pre-commit, commit-msg
    ├─ .prettierrc, .editorconfig, .gitignore, commitlint.config.cjs
    └─ README.md
4)  Installation & startup
    1. Install dependencies
       pnpm install
    2. Generate projects (if not yet created)
    3. Generate projects (if not yet created)
       pnpm bootstrap
    4. Environment variables
    5. Environment variables
       cp frontend/.env.example frontend/.env.local
       cp backend/.env.example backend/.env
    6. (Optional) Start local services
    7. (Optional) Start local services
       docker compose up -d
    8. Development
    9. Development

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

8.  Code style & VS Code
    • Prettier + ESLint (Husky runs lint-staged on pre-commit).
    • Recommended to install extensions:
    • Tailwind CSS IntelliSense
    • ESLint
    • Prettier
    • .vscode/settings.json (optional) can ignore @tailwind/@apply warnings:
    • .vscode/settings.json (optional) can ignore @tailwind/@apply warnings:
    { "css.lint.unknownAtRules": "ignore", "files.associations": {"\*.css":"tailwindcss"} }

9.  Feature development (example)

Frontend
• Base pages:: /hives, /capture, /analysis/[jobId], /alerts, /settings, /history/[hiveId], /map.
• Mobile shell: layout (app) con NavTab fija.
• Minimal UI: Button, Card, EmptyState.
• Base pages:: /hives, /capture, /analysis/[jobId], /alerts, /settings, /history/[hiveId], /map.
• Mobile shell: layout (app) con NavTab fija.
• Minimal UI: Button, Card, EmptyState.

Backend
• Mock ready for /analysis.
• AAdd more modules with:
• Mock ready for /analysis.
• AAdd more modules with:

⸻

## Authentication with Supabase

This app uses [Supabase Auth](https://supabase.com/) for email/password and OAuth login.
We kept a **mobile-first** and the **unified shell heigh\*.
This app uses [Supabase Auth](https://supabase.com/) for email/password and OAuth login.
We kept a **mobile-first** and the **unified shell heigh\*.

### 1) Environment variable (Frontend)

1. Create `frontend/.env.local` with your project values:
1. Create `frontend/.env.local` with your project values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
```

Make sure .env\* files are ignored in .gitignore (already configured).

2. Dependencies
   Make sure .env\* files are ignored in .gitignore (already configured).

3. Dependencies
   pnpm --filter frontend add @supabase/supabase-js @supabase/ssr

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

12) License & conduct
    • MIT(see LICENSE)
    • Code of Conduct in CODE_OF_CONDUCT.md
    • Contribution guidelines in CONTRIBUTING.md

13. Contact
    • Initial maintainer: @azulrk
    • Issues and PRs in this repo.
