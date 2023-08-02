import dotenv from "dotenv";
dotenv.config();

import { generate } from "./src/helpers/generator";
import { Config, EventLog } from "./src/data/db";

const GENERATED_DIR = "./src/generated";

(async () => {
  await generate<Config>({
    outputPath: `${GENERATED_DIR}/controllers/admin/config.ts`,
    objectTypeName: "Config",
    srcDir: "../../..",
    createOne: true,
    createOnePick: {
      key: true,
      value: true,
    },
    getOne: true,
    getMany: true,
    updateOne: true,
    updateOnePick: {
      value: true,
    },
  });
  await generate<EventLog>({
    outputPath: `${GENERATED_DIR}/controllers/admin/event-log.ts`,
    objectTypeName: "EventLog",
    srcDir: "../../..",
    createOne: true,
    createOnePick: {
      type: true,
      dataId: true,
      sessionUserId: true,
      data: true,
    },
    getMany: true,
  });
})();
