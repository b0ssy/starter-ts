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
  type: z.enum([
    "file.created",
    "file.updated",
    "file.deleted",
    "product.created",
    "product.updated",
    "product.deleted",
    "product.attribute.created",
    "product.attribute.updated",
    "product.attribute.deleted",
    "product.discount.created",
    "product.discount.deleted",
    "product.review.created",
    "product.review.updated",
    "product.review.deleted",
    "product.store.created",
    "product.store.deleted",
    "product.order.created",
    "product.file.created",
    "product.file.deleted",
    "store.created",
    "store.updated",
    "store.deleted",
    "store.product.created",
    "store.product.deleted",
    "store.review.created",
    "store.review.updated",
    "store.review.deleted",
    "store.file.created",
    "store.file.deleted",
    "order.created",
    "order.product.created",
    "order.history.created",
    "invoice.created",
    "invoice.updated",
    "invoice.deleted",
    "invoice.line_item.created",
    "invoice.line_item.updated",
    "invoice.line_item.deleted",
  ]),
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
