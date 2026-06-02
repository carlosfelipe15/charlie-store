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

## Para agentes de IA

Lee primero [AGENTS.md](../AGENTS.md) en la raíz del repositorio. Contiene reglas de arquitectura, skills en `.agents/skills/` y mapa de rutas de código.

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
├── AGENTS.md              # Entrada para agentes IA
├── apps/
│   ├── backend/           # @dtc/backend — Medusa + Admin embebido
│   └── storefront/        # @dtc/storefront — Next.js
├── docs/                  # Esta documentación
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
