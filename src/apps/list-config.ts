import { db } from "../data";

// List database configurations
const execute = async () => {
  const configs = await db.config().select();
  for (const config of configs) {
    console.log(`[${config.key}]`);
    console.log(config.value);
    console.log();
  }

  db.shutdown();
};

export default execute;
