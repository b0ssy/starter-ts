import run from "../src/apps/run";

// Add your global teardown here
module.exports = async () => {
  // Stop the global server
  run.shutdown();
};
