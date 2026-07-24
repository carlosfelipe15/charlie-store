import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260721024635 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "province" ("id" text not null, "name" text not null, "code" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "province_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_province_deleted_at" ON "province" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "municipality" ("id" text not null, "name" text not null, "code" text not null, "is_active" boolean not null default true, "province_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "municipality_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_municipality_province_id" ON "municipality" ("province_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_municipality_deleted_at" ON "municipality" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "municipality" add constraint "municipality_province_id_foreign" foreign key ("province_id") references "province" ("id") on update cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "municipality" drop constraint if exists "municipality_province_id_foreign";`);

    this.addSql(`drop table if exists "province" cascade;`);

    this.addSql(`drop table if exists "municipality" cascade;`);
  }

}
