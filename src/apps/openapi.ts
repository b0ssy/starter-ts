import { OpenAPIGenerator } from "@asteasolutions/zod-to-openapi";
import { promises as fs } from "fs";
import p from "path";

import { openApiRegistryV1, openApiRegistryV1Internal } from "../data";
import { App, Command } from "../helpers/app";
import { Logger } from "../helpers/logger";

const LOG = new Logger("apps/openapi");

// Generate OpenAPI JSON document file
export class OpenAPIApp extends App {
  create(program: Command) {
    program
      .command("openapi")
      .description("Generate OpenAPI documents and clients")
      .option(
        "-d, --dir <directory>",
        "Directory to generate OpenAPI documents and clients",
        "./openapi",
      )
      .action((options) => {
        this.execute({ dir: options.dir });
      });
  }

  async execute(options: { dir: string }) {
    LOG.info(`Generating OpenAPI documents`, options);

    const path = p.join(options.dir, "v1", "openapi.json");

    // Create directory
    await fs.mkdir(p.dirname(path), { recursive: true });

    // Write document
    LOG.info(`Writing file: ${path}`);
    const generator = new OpenAPIGenerator(
      openApiRegistryV1.definitions,
      "3.0.0",
    );
    const components = generator.generateDocument({
      info: {
        title: "OpenAPI Definitions",
        version: "0.1.0",
      },
    });
    const json = JSON.stringify(components, undefined, "  ");
    await fs.writeFile(path, json).catch((err) => {
      console.error(`Failed to write file: ${err}`);
    });

    // Write internal document
    {
      const path = p.join(options.dir, "v1", "openapi-internal.json");
      LOG.info(`Writing file: ${path}`);

      const generator = new OpenAPIGenerator(
        openApiRegistryV1Internal.definitions,
        "3.0.0",
      );
      const components = generator.generateDocument({
        info: {
          title: "OpenAPI Definitions",
          version: "0.1.0",
        },
      });
      const json = JSON.stringify(components, undefined, "  ");
      await fs.writeFile(path, json).catch((err) => {
        console.error(`Failed to write file: ${err}`);
      });
    }
  }
}

export default new OpenAPIApp();
