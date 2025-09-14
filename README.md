# honey-route

HoneyRoute serves smallholder beekeepers and cooperative administrators. It provides photo-based pest/disease detection (e.g., Varroa risk), alerting, recommendations, action logging, and basic mapping. Future phases include floral resource maps and predictive risk zones. The system will be branded as “HoneyRoute — Powered by EcoVentus.”

Monorepo con frontend (Next.js) y backend (NestJS) para el MVP de HoneyRoute. Usa PNPM workspaces, Turborepo, Husky y Commitlint para una colaboración ordenada.

TL;DR (5 pasos)

# 0) Requisitos: Node 20, pnpm 9, Git. (Docker opcional)

corepack disable && npm i -g pnpm@9.7.0

# 1) Instalar

pnpm install

# 2) Generar scaffolds (si es la primera vez)

pnpm bootstrap

# 3) Variables de entorno

cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

# 4) (Opcional) Servicios locales

# brew install --cask docker && open -a Docker

docker compose up -d

# 5) Desarrollo en paralelo

pnpm dev

1. Stack
   • Frontend: Next.js (App Router), TypeScript, Tailwind v3, PostCSS, autoprefixer.
   • Backend: NestJS (TypeScript), (mock /analysis incluido).
   • Herramientas: PNPM workspaces, Turborepo, Husky + lint-staged, Commitlint, Prettier.
   • CI: GitHub Actions separadas por paquete (frontend/** y backend/**).

Nota: fijamos Tailwind v3 por estabilidad. (Si alguien instala v4 saldrá un error con el plugin PostCSS; ver “Solución de problemas”.)

2. Requisitos
   • Node.js 20 (ideal con nvm)
   echo "20" > .nvmrc && nvm use
   • pnpm 9.x
   corepack disable && npm i -g pnpm@9.7.0
   • Git y VS Code (recomendado).
   • Docker Desktop (solo si usarás Postgres/Redis locales): brew install --cask docker.

3)  Estructura del repositorio
    honey-route/
    ├─ frontend/ # Next.js (App Router)
    ├─ backend/ # NestJS
    ├─ docs/ # Arquitectura, contrato de API, ADRs
    ├─ .github/
    │ ├─ workflows/ # ci-frontend.yml, ci-backend.yml
    │ └─ ISSUE_TEMPLATE/ # bug/feature templates
    ├─ scripts/bootstrap.sh # genera front y back (scaffolds)
    ├─ docker-compose.yml # Postgres + Redis (opcional)
    ├─ pnpm-workspace.yaml
    ├─ turbo.json # Turborepo tasks
    ├─ .husky/ # pre-commit, commit-msg
    ├─ .prettierrc, .editorconfig, .gitignore, commitlint.config.cjs
    └─ README.md
4)  Instalación y arranque
    1. Instala dependencias
       pnpm install
    2. Genera proyectos (si aún no existen)
       pnpm bootstrap
    3. Variables de entorno
       cp frontend/.env.example frontend/.env.local
       cp backend/.env.example backend/.env
    4. (Opcional) Levanta servicios locales
       docker compose up -d
    5. Desarrollo

    # Front + Back con Turbo

         pnpm dev
         # O por paquete
         pnpm --filter frontend dev
         pnpm --filter backend dev

5)  Scripts

Raíz
• pnpm dev → corre frontend y backend en paralelo (Turbo).
• pnpm build / pnpm lint / pnpm test → ejecutan por paquete.
• pnpm bootstrap → crea scaffolds de Next/Nest.
• pnpm prepare → instala Husky (hooks git).

Frontend
• pnpm --filter frontend dev → Next dev en http://localhost:3000.
• pnpm --filter frontend build → build de producción.

Backend
• pnpm --filter backend dev → Nest dev en http://localhost:3001 (con CORS).
• Endpoints mock:
• POST /analysis → { jobId }
• GET /analysis/:jobId → { status: "done", riskLevel: "medium" }

6. Variables de entorno
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
   Para CI/Prod, configura Secrets en GitHub (Settings → Secrets and variables → Actions).

7) Flujo de ramas y colaboración
   • main: protegida, estable (solo PRs aprobados).
   • develop: integración de features.
   • features: feat/<área>-<slug> (p. ej. feat/ui-tabbar), fixes: fix/<área>-<slug>.

Convenciones:
• Commits: Conventional Commits (feat:, fix:, chore:, docs:, refactor:, test:).
• PRs: usa el template; agrega screenshots; asegúrate de que CI pase.
• Merge: Squash & Merge a develop. De develop a main bajo release/tag (cuando corresponda).

Checklist antes de abrir PR:
• pnpm lint y pnpm build OK.
• Focus visible/accesibilidad básica (teclas Tab).
• Actualiza docs si aplica. 8) CI
• CI Frontend: se ejecuta en cambios bajo frontend/**.
• CI Backend: se ejecuta en cambios bajo backend/**.
• Revisa .github/workflows/\*.yml. Los jobs hacen: install → lint/test (best-effort) → build.

⸻

9. Estilo de código y VS Code
   • Prettier + ESLint (Husky ejecuta lint-staged en pre-commit).
   • Recomendado instalar extensiones:
   • Tailwind CSS IntelliSense
   • ESLint
   • Prettier
   • .vscode/settings.json (opcional) puede ignorar avisos de @tailwind/@apply:
   { "css.lint.unknownAtRules": "ignore", "files.associations": {"\*.css":"tailwindcss"} }
10. Desarrollo de features (ejemplo)

Frontend
• Páginas base: /hives, /capture, /analysis/[jobId], /alerts, /settings, /history/[hiveId], /map.
• Shell móvil: layout (app) con NavTab fija.
• UI mínima: Button, Card, EmptyState.

Backend
• Mock listo para /analysis.
• Agrega más módulos con pnpm nest g module <name>.

⸻

11. Solución de problemas
    • zsh: no matches found al crear rutas con (app) o [jobId]:
    → Pon comillas en la ruta:
    cat > 'frontend/src/app/(app)/layout.tsx' <<'TSX'
    • Next: “Missing <html>/<body> in root layout”
    → Asegúrate que frontend/src/app/layout.tsx envuelva con:
    export default function RootLayout({ children }:{children:React.ReactNode}) {
    return (<html lang="en"><body>{children}</body></html>);
    }
    • Tailwind “Unknown at rule @tailwind / @apply” en VS Code
    → Son avisos del editor. Añade en .vscode/settings.json:
    { "css.lint.unknownAtRules": "ignore" }.
    • Error Tailwind v4 (“@tailwindcss/postcss”)
    → Estamos en Tailwind v3. Reinstala:
    pnpm --filter frontend add -D tailwindcss@3 postcss autoprefixer
    y en postcss.config.js:
    module.exports = { plugins: { tailwindcss: {}, autoprefixer: {} } };
    • Turbo 2.x “pipeline → tasks”
    → turbo.json ya usa "tasks". Si ves el error, reinstala desde repo.
    • pnpm: “workspaces no soportado”
    → Asegúrate de tener pnpm-workspace.yaml en la raíz.
    • No tengo Docker
    → No es obligatorio para el mock. Solo levanta el backend con pnpm --filter backend dev.

⸻ 12) Licencia y conducta
• MIT (ver LICENSE)
• Código de Conducta en CODE_OF_CONDUCT.md
• Contribución: ver CONTRIBUTING.md

⸻

13. Contacto
    • Maintainer inicial: @azulrk
    • Issues y PRs en este repo.
