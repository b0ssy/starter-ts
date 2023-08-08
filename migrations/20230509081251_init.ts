import { Knex } from "knex";

import {
  ON_UPDATE_TIMESTAMP_FUNCTION,
  DROP_ON_UPDATE_TIMESTAMP_FUNCTION,
  useUuidAsPrimaryKey,
  useTimestamps,
  onUpdateTrigger,
} from "../src/helpers/db";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("config", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.text("key").notNullable();
      t.text("value");

      t.index(["key"]);
    })
    .createTable("event_log", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.text("type").notNullable();
      t.text("dataId");
      t.text("sessionUserId");
      t.text("data");

      t.index(["type"]);
      t.index(["dataId"]);
      t.index(["sessionUserId"]);
      t.index(["type", "dataId"]);
    })
    .then(() => {
      knex.raw(ON_UPDATE_TIMESTAMP_FUNCTION);
      knex.raw(onUpdateTrigger("config"));
      knex.raw(onUpdateTrigger("event_log"));
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists("event_log")
    .dropTableIfExists("config")
    .then(() => {
      knex.raw(DROP_ON_UPDATE_TIMESTAMP_FUNCTION);
    });
}
