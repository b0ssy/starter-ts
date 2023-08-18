import p from "path";
import fs from "fs-extra";

import { zEnv } from "../config";
import { App, Command } from "../helpers/app";
import { consoleError, consoleSuccess } from "../helpers/console";
import { generateRandomKey } from "../helpers/utils";

// Initialize application defaults
export class InitApp extends App {
  create(program: Command) {
    program
      .command("init")
      .description("Initialize server configurations")
      .option(
        "-t, --test",
        "Flag to indicate generation of unit test environment file"
      )
      .action((options) => {
        this.execute({ test: !!options.test });
      });
  }

  async execute(options: { test?: boolean }) {
    await this.createDefaultEnvVariables(options);
    console.log();
    consoleSuccess("✓ Initialized successfully");
  }

  async createDefaultEnvVariables(options: { test?: boolean }) {
    console.log("✓ Generating env variables");
    const lines: string[] = [];
    let section = "";
    const env = zEnv.omit({ isNodeEnv: true }).parse({});
    for (const key in env) {
      const currSection = key.split("_")[0];
      if (section && section !== currSection) {
        lines.push("");
      }
      section = currSection;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let value = (env as any)[key];
      if (key === "JWT_SECRET") {
        value = generateRandomKey(32, "base64url");
      }
      if (options.test) {
        if (key === "NODE_ENV") {
          value = "test";
        } else if (key === "LOG_DIRECTORY") {
          value = p.join(p.dirname(value), "test", "logs");
        } else if (key === "DB_DATABASE") {
          value = value.replace("local", "test");
        } else if (key === "SERVER_PORT") {
          value = "8181";
        }
      }
      lines.push(`${key}=${value}`);
    }

    // Create env file by default
    // But if already exists, then print out to console
    const envPath = `.env${options.test ? ".test" : ""}`;
    const canWrite = !(await fs.exists(envPath));
    if (canWrite) {
      lines.push("");
      await fs.writeFile(envPath, lines.join("\n"));
    }
    // Otherwise, print out
    else {
      consoleError(
        `Environment file "${envPath}" already exists, printing to console instead.`
      );
      console.log("...");
      console.log(lines.join("\n"));
      console.log("...");
    }
  }
}

export default new InitApp();
