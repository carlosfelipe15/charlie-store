import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260723000000 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "province" add column if not exists "iso_code" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "province" drop column if exists "iso_code";`);
  }

}
