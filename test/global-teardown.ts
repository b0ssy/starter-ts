import * as auth from "./mock/auth";
import { shutdown } from "../src/apps/run";

// Add your global teardown here
module.exports = async () => {
  // Stop the global server
  shutdown();

  // Stop the global mock auth server
  auth.shutdown();
};
