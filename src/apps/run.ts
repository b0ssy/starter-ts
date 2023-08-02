import fs from "fs-extra";
import { Server } from "http";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import bodyParser from "body-parser";

import { ENV } from "../config";
import { db } from "../data";
import { mountRoutes } from "../routes";
import { getLatestKnexMigration } from "../helpers/db";
import { Logger } from "../helpers/logger";

const LOG = new Logger("apps/run");
const LOG_ACCESS = new Logger("apps/run.access", {
  logToFileOnly: true,
});

// Global server instance
let server: Server | null = null;

// Run server
export const execute = async () => {
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
  server = app.listen(ENV.SERVER_PORT, ENV.SERVER_HOSTNAME, () => {
    LOG.info(
      `Started server: http://${ENV.SERVER_HOSTNAME}:${ENV.SERVER_PORT}`
    );
  });
};

// Shutdown server and database connections
// Please note that after this command, you will not be able to run server again
export const shutdown = () => {
  db.shutdown();
  server?.close();
  server = null;
};

export default execute;
