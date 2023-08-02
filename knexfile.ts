import dotenv from "dotenv";
dotenv.config(); // Remember to call this at the top to load .env file!

import type { Knex } from "knex";

import { Env, ENV } from "./src/config";

// Currently only supports PostgreSQL
const DB_CLIENT = "postgresql";

const defaultConfig: Knex.Config = {
  client: DB_CLIENT,
  connection: {
    host: ENV.DB_HOST,
    port: ENV.DB_PORT,
    database: ENV.DB_DATABASE,
    user: ENV.DB_USER,
    password: ENV.DB_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
  },
};

const knexConfig: { [key in Env["NODE_ENV"]]: Knex.Config } = {
  local: {
    ...defaultConfig,
  },
  dev: {
    ...defaultConfig,
  },
  stage: {
    ...defaultConfig,
  },
  prod: {
    ...defaultConfig,
  },
  test: {
    ...defaultConfig,
  },
};

module.exports = knexConfig;
