#!/usr/bin/env bash
set -euo pipefail

if [ ! -d "frontend" ] || [ -z "$(ls -A frontend 2>/dev/null)" ]; then
  pnpm dlx create-next-app@latest frontend --ts --app --eslint --src-dir --import-alias "@/*" --tailwind --yes
fi

if [ ! -d "backend" ] || [ -z "$(ls -A backend 2>/dev/null)" ]; then
  pnpm dlx @nestjs/cli new backend -p pnpm -g --skip-git
fi

echo "Bootstrap listo ✔"
