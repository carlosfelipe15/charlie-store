import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260731192217 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "product_sales_count" ("id" text not null, "product_id" text not null, "units_sold" integer not null default 0, "last_calculated_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "product_sales_count_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_product_sales_count_product_id" ON "product_sales_count" ("product_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_product_sales_count_deleted_at" ON "product_sales_count" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "product_sales_count" cascade;`);
  }

}
