import dotenv from "dotenv";
dotenv.config(); // Remember to call this at the top to load .env file!

import { Command } from "commander";

import init from "./src/apps/init";
import run from "./src/apps/run";
import listConfig from "./src/apps/list-config";
import openapi from "./src/apps/openapi";
import doctor from "./src/apps/doctor";
import { Logger } from "./src/helpers/logger";

const LOG = new Logger("index");

const program = new Command();

program.name("backend").description("Backend service").version("0.1.0");

program
  .command("init")
  .description("Initialize server configurations")
  .action(() => {
    init();
  });
program
  .command("run")
  .description("Run server")
  .action(() => {
    run();
  });
program
  .command("list-config")
  .description("List database configurations")
  .action(() => {
    listConfig();
  });
program
  .command("openapi")
  .description("Generate OpenAPI documents and clients")
  .option(
    "-d, --dir <directory>",
    "Directory to generate OpenAPI documents and clients",
    "./openapi"
  )
  .action((options) => {
    openapi({ dir: options.dir });
  });
program
  .command("doctor")
  .description("Diagnose for any possible configuration problems")
  .action(() => {
    doctor();
  });

program.parse();

// Close app on SIGINT signal
process.on("SIGINT", () => {
  console.log("SIGINT");
  process.exit(0);
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
