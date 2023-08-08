import { App, Command } from "./app";
import { ENV } from "../config";
import { db } from "../data";
import { getLatestKnexMigration } from "../helpers/db";
import { check, checkGroup } from "../helpers/doctor";

// Diagnose for possible system problems such as misconfigurations
export class DoctorApp extends App {
  create(program: Command) {
    program
      .command("doctor")
      .description("Diagnose for any possible configuration problems")
      .action(() => {
        this.execute().finally(() => this.shutdown());
      });
  }

  async execute() {
    await checkGroup("Logs", async () => {
      await check(!!ENV.LOG_DIRECTORY, "Please initialize LOG_DIRECTORY");
    });
    await checkGroup("Database", async () => {
      await check(!!ENV.DB_HOST, "Please initialize DB_HOST");
      await check(!!ENV.DB_PORT, "Please initialize DB_PORT");
      await check(!!ENV.DB_DATABASE, "Please initialize DB_DATABASE");
      await check(!!ENV.DB_USER, "Please initialize DB_USER");
      await check(!!ENV.DB_PASSWORD, "Please initialize DB_PASSWORD");
      await check(
        (await db
          .config()
          .select("id")
          .first()
          .catch(() => null)) !== null,
        "Failed to connect. Please ensure migrations are applied."
      );

      // Ensure updated to latest knex migrations
      const latestKnexMigration = await getLatestKnexMigration();
      if (latestKnexMigration) {
        await check(
          (
            await db
              .knexMigrations()
              .select("name")
              .orderBy("id", "desc")
              .first()
          )?.name === latestKnexMigration,
          "Please update to latest knex migration"
        );
      } else {
        await check(false, "No knex migration files");
      }
    });
    await checkGroup("Server", async () => {
      await check(!!ENV.SERVER_HOSTNAME, "Please initialize SERVER_HOSTNAME");
      await check(!!ENV.SERVER_PORT, "Please initialize SERVER_PORT");
    });
    await checkGroup("JWT", async () => {
      await check(!!ENV.JWT_SECRET, "Please initialize JWT_SECRET");
    });
    await checkGroup("Auth", async () => {
      await check(!!ENV.AUTH_URL, "Please initialize AUTH_URL");
      await check(
        !!ENV.AUTH_ROOT_API_KEY,
        "Please initialize AUTH_ROOT_API_KEY"
      );
    });
  }

  async shutdown() {
    db.shutdown();
  }
}

export default new DoctorApp();
