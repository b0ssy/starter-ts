import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import fs from "fs";
import p from "path";
import { z } from "zod";

extendZodWithOpenApi(z);

export const SERVICE_NAME = "backend";

export const zEnv = z.object({
  // Node environment
  NODE_ENV: z.enum(["local", "test", "dev", "stage", "prod"]).default("local"),
  isNodeEnv: z.function().args(z.string().array()).returns(z.boolean()),

  // Log directory
  LOG_DIRECTORY: z.string().default(`./.${SERVICE_NAME}/logs`),

  // JWT
  JWT_ISSUER: z.string().default(SERVICE_NAME),
  JWT_SECRET: z.string().default(""),
  JWT_EXPIRY_SECONDS: z.coerce.number().default(60 * 60 * 24), // 1 day
  JWT_CACHE_USER_ROLES_SECONDS: z.coerce.number().default(0), // <=0: disabled

  // Database
  DB_HOST: z.string().default("127.0.0.1"),
  DB_PORT: z.coerce.number().default(20000),
  DB_DATABASE: z.string().default(""),
  DB_USER: z.string().default(""),
  DB_PASSWORD: z.string().default(""),

  // Server
  SERVER_HOSTNAME: z.string().default("0.0.0.0"),
  SERVER_PORT: z.coerce.number().default(8080),

  // S3 public bucket
  S3_PUBLIC_REGION: z.string().optional(),
  S3_PUBLIC_ENDPOINT: z.string().optional(),
  S3_PUBLIC_BUCKET_NAME: z.string().default(""),

  // Dashboard
  DASHBOARD_BUILD_DIR: z
    .string()
    .default(`../dashboard/dist`)
    .transform((v) => p.resolve(v)),

  // Auth service
  AUTH_URL: z.string().default(""),
  AUTH_ROOT_API_KEY: z.string().default(""),
});
export type Env = z.infer<typeof zEnv>;

export const ENV = zEnv.parse({
  ...process.env,
  isNodeEnv: (nodeEnvs: Env["NODE_ENV"][]) => nodeEnvs.includes(ENV.NODE_ENV),
});

// Create log directory
if (!fs.existsSync(ENV.LOG_DIRECTORY)) {
  fs.mkdirSync(ENV.LOG_DIRECTORY, { recursive: true });
}
