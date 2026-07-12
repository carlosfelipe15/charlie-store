import { MedusaContainer } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

// Forces a full rebuild of the @medusajs/index (Index Engine) tables
// (index_metadata, index_data, index_relation, index_sync).
//
// Why this is needed: the Index Engine only re-syncs an entity when
// `index_metadata.fields_hash` for it doesn't match the currently configured
// schema (see node_modules .../@medusajs/index/dist/utils/sync/configuration.js
// `checkChanges()`) — row-level staleness from missed events does NOT change
// that hash, so `status: "done"` gives false confidence that indexed rows are
// current. In practice the Index Engine falls behind whenever entities are
// created outside a long-running `medusa develop` process — e.g. by a
// `medusa exec` script (migration-scripts/initial-data-seed.ts,
// scripts/seed-mercado-catalog.ts, etc.) — because that process exits as soon
// as the script's default export resolves, and the Index Engine's event
// handlers (subscribed on the Local Event Bus, itself "not recommended for
// production" per medusa develop's own boot warning) may not have finished,
// or even started, processing by then.
//
// Symptom: `/store/products-list?brand_id=...` returns 0 results for a brand
// that indisputably has products (query.graph confirms the link exists), or
// admin's `/admin/products` returns far fewer rows than actually exist as
// soon as ANY filter (status, search, etc.) is applied — both routes resolve
// ids via query.index() once a filter is present, and query.index() only
// ever reads from these tables. A plain unfiltered admin list, or a
// storefront category page (query.graph-only), look fine — that's what makes
// this bug easy to miss.
//
// Fix: wipe the index tables directly (bypassing the schema-hash gate, which
// has no "force everything regardless of hash" option) so every tracked
// entity is missing its metadata row, then call the module's sync() — in a
// single-process dev setup (`workerMode: "shared"`, the default), that runs
// the actual backfill in-process and this script awaits it to completion
// before exiting.
//
// Run after any `medusa exec` script that creates/links products, brands,
// categories, or other indexed entities:
//   pnpm medusa exec ./src/scripts/reindex-search.ts
export default async function reindexSearch({
  container,
}: {
  container: MedusaContainer;
}) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const pg: any = container.resolve(ContainerRegistrationKeys.PG_CONNECTION);
  const indexModuleService = container.resolve(Modules.INDEX) as any;

  const before = await pg.raw(`SELECT name, count(*) FROM index_data GROUP BY name ORDER BY name`);
  logger.info(`Antes: ${JSON.stringify(before.rows)}`);

  logger.info("Vaciando tablas del Index Engine (index_metadata, index_data, index_relation, index_sync)...");
  await pg.raw(`TRUNCATE TABLE index_data, index_relation, index_metadata, index_sync CASCADE`);

  logger.info("Disparando resync completo...");
  await indexModuleService.sync({ strategy: "full" });

  const after = await pg.raw(`SELECT name, count(*) FROM index_data GROUP BY name ORDER BY name`);
  logger.info(`Después: ${JSON.stringify(after.rows)}`);
  logger.info("Reindex completo.");
}
