import chalk from "chalk";

import { zEnv } from "../config";
import { generateRandomKey } from "../helpers/utils";

// Initialize application defaults
const execute = async () => {
  await createDefaultEnvVariables();
  console.log();
  console.log(chalk.greenBright("✓ Initialized successfully"));
};

// Create default env variables
const createDefaultEnvVariables = async () => {
  console.log("✓ Generating env variables");
  console.log("...");
  let section = "";
  const env = zEnv.omit({ isNodeEnv: true }).parse({});
  for (const key in env) {
    const currSection = key.split("_")[0];
    if (section && section !== currSection) {
      console.log();
    }
    section = currSection;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value = (env as any)[key];
    if (key === "JWT_SECRET") {
      value = generateRandomKey(32, "base64url");
    }
    console.log(`${key}=${value}`);
  }
  console.log("...");
};

export default execute;
