import Router from "express-promise-router";
import rateLimit, { Options } from "express-rate-limit";

import { ENV } from "../config";

const router = Router();

/**
 * Provide rate limiting capabilities limited to current server instance only
 * @param paths List of route paths
 * @param options Options
 */
export const useRateLimit = (paths: string[], options: Partial<Options>) => {
  const limiter = rateLimit(options);
  for (const path of paths) {
    router.use(path, limiter);
  }
};

// Apply rate limits only for non-local/test environments
const applyRateLimits = !ENV.isNodeEnv(["local", "test"]);
if (applyRateLimits) {
  // Example
  // useRateLimit(["/v1/signup/*"], {
  //   windowMs: 1000 * 60 * 60, // 1 hour
  //   max: 10, // Limit each IP to 10 requests per 1 hour
  //   standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  //   legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // });
}

export default router;
