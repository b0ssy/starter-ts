import knex, { Knex } from "knex";
import { z } from "zod";

import { ENV } from "../config";
import * as knexConfig from "../../knexfile";

// config
export const zConfig = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  key: z.enum([""]),
  value: z.string().nullish(),
});
export type Config = z.infer<typeof zConfig>;

// event_log
export const zEventLog = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  type: z.enum([""]),
  dataId: z.string().nullish(),
  sessionUserId: z.string().nullish(),
  data: z.string().nullish(),
});
export type EventLog = z.infer<typeof zEventLog>;

// knex_migrations
export const zKnexMigrations = z.object({
  id: z.number(),
  name: z.string(),
  batch: z.number(),
  migration_time: z.date(),
});
export type KnexMigrations = z.infer<typeof zKnexMigrations>;

// Manage database tables
export class Database {
  knex: Knex;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.knex = knex((knexConfig as any)[ENV.NODE_ENV]);
  }

  config = () => this.knex<Config>("config");
  eventLog = () => this.knex<EventLog>("event_log");
  knexMigrations = () => this.knex<KnexMigrations>("knex_migrations");

  shutdown = () => {
    this.knex.destroy();
  };
}

export default new Database();
