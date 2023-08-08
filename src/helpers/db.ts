import fs from "fs-extra";
import { Knex } from "knex";

export const ON_UPDATE_TIMESTAMP_FUNCTION = `
  CREATE OR REPLACE FUNCTION onUpdateTimestamp()
    RETURNS trigger AS $$
    BEGIN
      NEW.updatedAt = now();
      RETURN NEW;
    END;
  $$ language 'plpgsql';
`;
export const DROP_ON_UPDATE_TIMESTAMP_FUNCTION = `DROP FUNCTION onUpdateTimestamp`;

// Use UUID column type for primary key
export const useUuidAsPrimaryKey = (
  knex: Knex,
  table: Knex.CreateTableBuilder,
  columnName = "id",
) => table.uuid(columnName).primary().defaultTo(knex.raw("gen_random_uuid()"));

// Add "createdAt" and "updatedAt" timestamp columns
export const useTimestamps = (table: Knex.CreateTableBuilder) => {
  table.timestamps(true, true, true);
};

// Trigger to auto-update "updatedAt" timestamp column on update operation
export const onUpdateTrigger = (table: string) => `
  CREATE TRIGGER ${table}_updated_at
  BEFORE UPDATE ON ${table}
  FOR EACH ROW
  EXECUTE PROCEDURE on_update_timestamp();
`;

/**
 * Get filename of the latest knex migration
 * @param dir Knex migrations directory
 * @returns Filename of the latest knex migration if exists, null otherwise
 */
export const getLatestKnexMigration = async (dir?: string) => {
  dir = dir ?? "migrations";
  const filenames = await fs.readdir(dir);
  filenames.sort().reverse();
  return filenames.length ? filenames[0] : null;
};
