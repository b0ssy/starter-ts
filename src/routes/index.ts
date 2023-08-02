import { Express } from "express";

import rateLimiter from "./rate-limiter";
import v1admin from "./v1/admin";
import dashboard from "./dashboard";
import health from "./health";
import { pageNotFound } from "./page-not-found";
import { errorHandler } from "./error-handler";
import { decodeSession } from "../data/session";

export const mountRoutes = async (app: Express) => {
  // Apply rate limits
  app.use(rateLimiter);

  // Decode session
  // Please ensure this is called at the top
  app.use(decodeSession);

  // Administration
  app.use(v1admin);

  // Serve Dashboard UI
  app.use(dashboard);

  // Health check
  app.use(health);

  // Handle invalid pages
  app.use(pageNotFound);

  // Global error handler
  app.use(errorHandler);
};
