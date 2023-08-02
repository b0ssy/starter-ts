import * as auth from "./mock/auth";
import { ENV } from "../src/config";
import { execute } from "../src/apps/run";

if (ENV.NODE_ENV !== "test") {
  throw new Error("STOP! Why are you running tests in non-test environment?");
}

// Add your global setup here
module.exports = async () => {
  // Start a global mock auth server
  await auth.execute();

  // Start a global server to be used by all tests
  await execute();
};
