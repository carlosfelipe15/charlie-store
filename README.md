# Charlie Store

Monorepo de ecommerce DTC: **Medusa v2** (backend + admin) y **Next.js** (storefront).

Basado en el [Medusa DTC Starter](https://github.com/medusajs/dtc-starter), extendido con el módulo custom **Brands** y skills de agente en `.agents/skills/`.

## Documentación

| Enlace | Descripción |
|--------|-------------|
| [docs/README.md](docs/README.md) | Índice de documentación para desarrolladores |
| [AGENTS.md](AGENTS.md) | Guía para agentes de IA (Cursor, etc.) |
| [docs/development.md](docs/development.md) | Setup local y variables de entorno |
| [docs/architecture.md](docs/architecture.md) | Arquitectura y patrones Medusa |
| [docs/custom-features/brands.md](docs/custom-features/brands.md) | Módulo Brands |

## Características

- Catálogo, carrito, checkout, cuentas de cliente y pedidos (storefront Next.js)
- Multi-región con detección por código de país en URL
- Admin Medusa embebido en el backend
- **Custom:** gestión de marcas (Brands) enlazadas a productos

## Requisitos

- Node.js v20+
- PostgreSQL v15+
- pnpm v10+

## Inicio rápido

```bash
pnpm install
cp apps/backend/.env.template apps/backend/.env
# Configurar DATABASE_URL en apps/backend/.env

cd apps/backend
pnpm medusa db:migrate
pnpm medusa user -e admin@test.com -p <password>
cd ../..

# Crear apps/storefront/.env.local (ver docs/development.md)

pnpm dev
```

| Servicio | URL |
|----------|-----|
| Admin | http://localhost:9000/app |
| API | http://localhost:9000 |
| Storefront | http://localhost:8000 |

## Scripts

```bash
pnpm dev              # Backend + storefront
pnpm backend:dev      # Solo Medusa
pnpm storefront:dev   # Solo Next.js
pnpm build            # Build completo
```

## Estructura

```
apps/
├── backend/     # @dtc/backend — API, workflows, admin
└── storefront/  # @dtc/storefront — Next.js
docs/            # Documentación del proyecto
.agents/skills/  # Skills Medusa para desarrollo asistido por IA
```

## Recursos

- [Medusa Documentation](https://docs.medusajs.com)
- [Medusa JS SDK](https://docs.medusajs.com/resources/js-sdk)
