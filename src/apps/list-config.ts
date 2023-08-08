import { App, Command } from "./app";
import { db } from "../data";

// List database configurations
export class ListConfigApp extends App {
  create(program: Command) {
    program
      .command("list-config")
      .description("List database configurations")
      .action(() => {
        this.execute().finally(() => this.shutdown());
      });
  }

  async execute() {
    const configs = await db.config().select();
    for (const config of configs) {
      console.log(`[${config.key}]`);
      console.log(config.value);
      console.log();
    }
  }

  async shutdown() {
    db.shutdown();
  }
}

export default new ListConfigApp();
