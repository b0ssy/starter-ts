import p from "path";
import fs from "fs-extra";
import chalk from "chalk";

import { ENV, zEnv } from "../config";
import { generateRandomKey, generateRSAKeys } from "../helpers/utils";

// Initialize application defaults
const execute = async (options: {
  create?: boolean;
  keyDir?: string;
  test?: boolean;
}) => {
  await createDefaultEnvVariables(options);
  console.log();
  console.log(chalk.greenBright("✓ Initialized successfully"));
};

// Create default env variables
const createDefaultEnvVariables = async (options: {
  create?: boolean;
  test?: boolean;
}) => {
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
      }
    }
    lines.push(`${key}=${value}`);
  }
  // Test-specific env configs
  if (options.test) {
    lines.push("");
    lines.push("TEST_LOCALSTACK_SES_DIRECTORY=");
  }

  // If creating .env file, ensure file do not exists
  if (options.create) {
    const path = `.env${options.test ? ".test" : ""}`;
    if (await fs.exists(path)) {
      throw new Error(`Environment file already exists: ${path}`);
    }
    lines.push("");
    await fs.writeFile(path, lines.join("\n"));
  }
  // Otherwise, print out
  else {
    console.log("...");
    console.log(lines.join("\n"));
    console.log("...");
  }
};

export default execute;
