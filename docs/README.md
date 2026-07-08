# Documentación — Charlie Store

Monorepo de ecommerce DTC: **Medusa v2** (backend + admin) y **Next.js** (storefront).

## Índice

| Documento | Audiencia | Descripción |
|-----------|-----------|-------------|
| [development.md](./development.md) | Desarrolladores | Instalación, entorno, scripts |
| [architecture.md](./architecture.md) | Desarrolladores / IA | Arquitectura y patrones Medusa |
| [backend.md](./backend.md) | Desarrolladores / IA | Estructura de `apps/backend` |
| [storefront.md](./storefront.md) | Desarrolladores / IA | Estructura de `apps/storefront` |
| [custom-features/brands.md](./custom-features/brands.md) | Todos | Módulo Brands (feature custom) |
| [custom-features/reviews.md](./custom-features/reviews.md) | Todos | Módulo Reviews (feature custom) |

Estos documentos son **referencia viva**: deben reflejar el estado actual del código. Si algo aquí contradice lo que ves en `apps/`, confía en el código y actualiza el doc.

## Para agentes de IA

Lee primero [AGENTS.md](../AGENTS.md) en la raíz del repositorio. Contiene reglas de arquitectura, skills en `.agents/skills/` y mapa de rutas de código. `CLAUDE.md` en la raíz importa `AGENTS.md` — no dupliques reglas ahí.

Memoria de trabajo (bugs activos, planes de fase, historial de decisiones por feature) vive en [`.context/`](../.context/), no en `docs/`:

| Carpeta | Contenido |
|---------|-----------|
| `.context/index.md` | Punto de entrada: fase actual, último feature shippeado |
| `.context/backlog.md` | Bugs y deuda técnica activos |
| `.context/plans/<fecha>/FASE-N-*.md` | Planes de fase, históricos |
| `.context/features/<feature>.md` | Changelog/decisiones de cambios posteriores a la fase inicial de una feature |
| `.context/reports/` | Auditorías puntuales archivadas (ya no reflejan el estado actual) |

## Stack

| Componente | Versión / notas |
|------------|-----------------|
| Node.js | ≥ 20 |
| pnpm | 10.33+ (`packageManager` en root) |
| Medusa | 2.15.2 |
| Next.js | 15.5 (storefront, Turbopack en dev) |
| PostgreSQL | 15+ (requerido para backend) |
| Turbo | 2.x (tareas `build`, `dev`, `lint`, `test`, `seed`) |

## Estructura del monorepo

```
charlie-store/
├── AGENTS.md              # Entrada para agentes IA (canónico)
├── CLAUDE.md              # Importa AGENTS.md + notas específicas de Claude Code
├── apps/
│   ├── backend/           # @dtc/backend — Medusa + Admin embebido
│   └── storefront/        # @dtc/storefront — Next.js
├── docs/                  # Esta documentación (referencia viva)
├── .context/              # Memoria de trabajo del agente (backlog, planes, changelog por feature)
├── .agents/skills/        # Skills Medusa para agentes
├── dtc-starter/           # Copia de referencia (no modificar en tareas normales)
├── package.json           # Scripts raíz
├── pnpm-workspace.yaml
└── turbo.json
```

## Inicio rápido

```bash
pnpm install
cp apps/backend/.env.template apps/backend/.env
# Editar DATABASE_URL en apps/backend/.env
cd apps/backend && pnpm medusa db:migrate && pnpm medusa user -e admin@test.com -p <password>
cd ../..
# Configurar apps/storefront/.env.local (ver development.md)
pnpm dev
```

- Admin: http://localhost:9000/app  
- API: http://localhost:9000  
- Storefront: http://localhost:8000  
