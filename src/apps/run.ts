import fs from "fs-extra";
import { Server } from "http";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import bodyParser from "body-parser";

import { ENV } from "../config";
import { db } from "../data";
import { mountRoutes } from "../routes";
import { App, Command } from "../helpers/app";
import { getLatestKnexMigration } from "../helpers/db";
import { Logger } from "../helpers/logger";

const LOG = new Logger("apps/run");
const LOG_ACCESS = new Logger("apps/run.access", {
  logToFileOnly: true,
});

// Log down system-wide exceptions and do not crash the app
process.on("uncaughtException", (err) => {
  LOG.error("Uncaught exception", {
    message: err?.message ?? "",
    stack: err?.stack ?? "",
  });
});
process.on("unhandledRejection", (err) => {
  console.error(err);
  LOG.error("Unhandled rejection", { err });
});

// Run server
export class RunApp extends App {
  server: Server | null = null;

  create(program: Command) {
    program
      .command("run")
      .description("Run server")
      .action(() => {
        this.execute().finally(() => this.shutdown());
      });
  }

  async execute() {
    // Create log directory
    await fs.mkdir(ENV.LOG_DIRECTORY, { recursive: true });

    // Check if latest knex migration is applied
    // If not, show a warning but do not prevent server from running
    const latestKnexMigration = await getLatestKnexMigration();
    if (latestKnexMigration) {
      const result = await db
        .knexMigrations()
        .select("name")
        .orderBy("id", "desc")
        .first();
      if (result?.name !== latestKnexMigration) {
        LOG.error("Latest knex migration not applied", {
          db: result?.name,
          latest: latestKnexMigration,
        });
      }
    } else {
      // Should have knex migration files
      LOG.warn("No knex migration files");
    }

    // Create server
    const app = express();

    // Log accesses
    app.use((req, res, next) => {
      LOG_ACCESS.info(`${req.ip}, ${req.method}, ${req.path}`);
      next();
    });

    // Middlewares
    app.use(helmet()); // Must call helmet() first before the rest
    app.use(cors());
    app.use(express.json({ limit: "1mb" }));
    app.use(bodyParser.urlencoded({ extended: true }));

    // Mount routes
    mountRoutes(app);

    // Start server
    this.server = app.listen(ENV.SERVER_PORT, ENV.SERVER_HOSTNAME, () => {
      LOG.info(
        `Started server: http://${ENV.SERVER_HOSTNAME}:${ENV.SERVER_PORT}`,
      );
    });
  }

  async shutdown() {
    db.shutdown();
    this.server?.close();
    this.server = null;
  }
}

export default new RunApp();
