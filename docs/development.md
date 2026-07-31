# Desarrollo local

## Requisitos

- [Node.js](https://nodejs.org/) v20+
- [PostgreSQL](https://www.postgresql.org/) v15+ (base de datos creada y accesible)
- [pnpm](https://pnpm.io/) v10+
- Opcional: [Redis](https://redis.io/) (según configuración futura; el template incluye `REDIS_URL`)

## Instalación

```bash
git clone <repo-url> charlie-store
cd charlie-store
pnpm install
```

## Backend (`apps/backend`)

### Variables de entorno

Copia la plantilla y completa al menos `DATABASE_URL`:

```bash
cp apps/backend/.env.template apps/backend/.env
```

| Variable | Descripción |
|----------|-------------|
| `DATABASE_URL` | URL PostgreSQL (`postgres://user:pass@host:5432/dbname`) |
| `STORE_CORS` | Orígenes permitidos para API store (incluir storefront) |
| `ADMIN_CORS` | Orígenes del admin |
| `AUTH_CORS` | Orígenes de autenticación |
| `JWT_SECRET` | Secreto JWT |
| `COOKIE_SECRET` | Secreto de cookies |
| `REDIS_URL` | Redis (opcional según módulos usados) |
| `MEDUSA_FF_INDEX_ENGINE` | Activa el Index Module (`@medusajs/index`), necesario para `query.index()`. Ver advertencias sobre un bug de core asociado en [architecture.md](./architecture.md) y AGENTS.md |

Valores por defecto del template apuntan a storefront en `http://localhost:8000` y admin en `http://localhost:9000`.

### Base de datos y usuario admin

```bash
cd apps/backend
pnpm medusa db:migrate
pnpm medusa user -e admin@test.com -p <tu-password>
```

Alternativa: `initial-data-seed.ts` (ver [Seed de datos iniciales](#seed-de-datos-iniciales) más abajo) ya crea un admin de prueba con credenciales fijas — si vas a correr los seeds igual, no hace falta el comando `medusa user` de arriba.

### Arranque

```bash
# Desde apps/backend
pnpm dev

# O desde la raíz
pnpm backend:dev
```

- API: http://localhost:9000  
- Admin dashboard: http://localhost:9000/app  

### Publishable API Key

Tras el primer arranque, en el admin: **Settings → Publishable API Keys**. Copia la clave para el storefront.

### Migraciones (módulos custom)

Tras cambiar modelos en `src/modules/<nombre>/models/`:

```bash
cd apps/backend
pnpm medusa db:generate
pnpm medusa db:migrate
```

### Seed de datos iniciales

No hay un único comando de seed — son varios scripts ejecutados con `medusa exec` desde `apps/backend`, cada uno con su propósito:

```bash
cd apps/backend
pnpm medusa exec ./src/migration-scripts/initial-data-seed.ts  # regiones, productos de demo, geo-zone país "cu", admin de prueba
pnpm medusa exec ./src/scripts/seed-mercado-catalog.ts          # catálogo "Rodi Mercado"
pnpm medusa exec ./src/scripts/seed-zones.ts                    # 16 provincias / 168 municipios (idempotente)
pnpm medusa exec ./src/scripts/seed-product-attributes.ts       # atributos/tags de PLP (Fase 11)
pnpm medusa exec ./src/scripts/seed-promotions.ts                # price list de oferta + cupones de demo
```

`pnpm backend:seed` (raíz, `turbo seed --filter=@dtc/backend`) **no funciona hoy** — `apps/backend/package.json` no define ningún script `seed`; usar los comandos `medusa exec` de arriba.

#### Admin de prueba

`initial-data-seed.ts` crea, además de regiones/productos/geo-zona, un usuario admin fijo para poder probar cualquier flujo del admin (`http://localhost:9000/app`) sin correr `medusa user` a mano:

| Campo | Valor |
|-------|-------|
| Email | `admin@charliestore.test` |
| Password | `CharlieAdmin123!` |

Solo para desarrollo local — no correr este seed contra una base de datos de producción. Si el seed se re-corre sobre una base que ya tiene ese email registrado, `authModuleService.register` devuelve error (logueado como warning) y el resto del seed continúa sin romperse; no es idempotente en el sentido de "actualiza el usuario existente", así que si necesitás resetear la password de este usuario es más rápido hacerlo desde el Admin o con `pnpm medusa user` apuntando al mismo email.

**Importante tras cualquiera de estos scripts**: `query.index()` puede quedar desincronizado con datos creados vía `medusa exec` (el proceso corto termina antes de que el Index Engine procese los eventos). Correr `pnpm medusa exec ./src/scripts/reindex-search.ts` después — ver sección "Índice de búsqueda cross-módulo" en [AGENTS.md](../AGENTS.md) para el detalle completo.

### Datos de prueba: promociones y ofertas de demostración

`seed-promotions.ts` (idempotente, seguro de re-correr) crea:

- Una **Price List** de tipo `sale` ("Ofertas relámpago", 25% off) sobre un subconjunto fijo de 6 productos — es lo que necesitan `rodi-flash-sale`/`rodi-curated-row` (home) y el filtro `on_sale` de la PLP (Fase 11) para dejar de renderizar vacío. Sin esto, esas secciones se ocultan por completo — comportamiento esperado, no un bug (ver `.context/backlog.md`, sección "Resueltos Recientemente").
- Dos **Promotions** con código (`BIENVENIDA10` 10% off ítems, `ENVIOGRATIS` envío gratis) para probar el input de cupón del carrito (`rodi-cart-discount` → `applyPromotions`).

Si necesitás otra combinación (otros productos, otro %, otro cupón) para una demo puntual, es más rápido armarla a mano desde el Admin (`http://localhost:9000/app` → **Settings → Price Lists** / **Promotions**) que editar el script — usalo solo como base reproducible, no como fuente única.

## Storefront (`apps/storefront`)

Crea `apps/storefront/.env.local` con al menos:

```env
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_DEFAULT_REGION=dk
NEXT_PUBLIC_BASE_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_KEY=
```

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Clave publicable del backend |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | URL del backend Medusa |
| `NEXT_PUBLIC_DEFAULT_REGION` | Código de país por defecto (ej. `dk`) |
| `NEXT_PUBLIC_BASE_URL` | URL pública del storefront |
| `NEXT_PUBLIC_STRIPE_KEY` | Clave publicable Stripe (opcional) |

```bash
cd apps/storefront
pnpm dev

# O desde la raíz
pnpm storefront:dev
```

Storefront: http://localhost:8000  

## Scripts del monorepo (raíz)

| Script | Acción |
|--------|--------|
| `pnpm dev` | `dev` en todos los paquetes del workspace |
| `pnpm build` | Build de backend y storefront |
| `pnpm lint` | Lint vía Turbo |
| `pnpm test` | Tests vía Turbo |
| `pnpm backend:dev` | Solo backend |
| `pnpm storefront:dev` | Solo storefront |

## Tests (backend)

Desde `apps/backend`:

```bash
pnpm test:unit
pnpm test:integration:http
pnpm test:integration:modules
```

## Solución de problemas

| Problema | Qué revisar |
|----------|-------------|
| CORS en storefront | `STORE_CORS` incluye `http://localhost:8000` |
| Admin no carga | `ADMIN_CORS` incluye `http://localhost:9000` |
| Storefront sin productos | Publishable key y región por defecto |
| Error tras cambiar modelo Brand | Migraciones generadas y aplicadas |
| Skills / patrones Medusa | `.agents/skills/` y [AGENTS.md](../AGENTS.md) |

Más errores frecuentes en tutoriales: `.agents/skills/learning-medusa/troubleshooting/`.
