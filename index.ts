import { Command } from "commander";
import dotenv from "dotenv";
dotenv.config(); // Remember to call this at the top to load .env file!

import { version } from "./package.json";
import init from "./src/apps/init";
import run from "./src/apps/run";
import listConfig from "./src/apps/list-config";
import openapi from "./src/apps/openapi";
import doctor from "./src/apps/doctor";

const program = new Command();

program.name("backend");
program.description("Backend service");
program.version(version);

for (const app of [init, run, listConfig, openapi, doctor]) {
  app.create(program);
}

program.parse();

// Close app on SIGINT signal
process.on("SIGINT", () => {
  console.log("SIGINT");
  process.exit(0);
});
