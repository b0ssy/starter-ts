import { Server } from "net";
import express from "express";

import { ENV } from "../../src/config";

let server: Server | null = null;

export const execute = async () => {
  // Create server
  const app = express();

  // Routes
  app.post("/v1/token/verify", (req, res) => {
    res.status(200).send({
      code: "success",
      message: null,
      data: {
        userId: "683cd14f-ac8d-44bf-af4f-1e2ae06d4a3b",
        roleNames: ["admin"],
      },
    });
  });

  // Start server
  server = await new Promise<Server>((resolve) => {
    const url = new URL(ENV.AUTH_URL);
    const server = app.listen(parseInt(url.port), url.hostname, () => {
      resolve(server);
    });
  });

  return { app, server };
};

export const shutdown = () => {
  server?.close();
  server = null;
};
