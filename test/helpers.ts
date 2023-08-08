import { afterAll } from "@jest/globals";
import axios from "axios";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { AdminApi } from "./generated";
import { ENV } from "../src/config";
import { db, s3Public } from "../src/data";
import { JWTPayload, Session, decodeJWTPayload } from "../src/data/session";

// Do not throw error for non 2xx statuses
axios.defaults.validateStatus = () => true;

export const SERVER_URL = `http://127.0.0.1:${ENV.SERVER_PORT}`;

export const defaultApiConfig = {
  basePath: SERVER_URL,
  isJsonMime: (mime: string) => {
    const jsonMime = new RegExp(
      "^(application/json|[^;/ \t]+/[^;/ \t]+[+]json)[ \t]*(;.*)?$",
      "i",
    );
    return (
      mime !== null &&
      (jsonMime.test(mime) ||
        mime.toLowerCase() === "application/json-patch+json")
    );
  },
};
export const apis = {
  admin: new AdminApi(defaultApiConfig),
};

export const TEST_UPLOAD_IMAGE_FILE = process.env.TEST_UPLOAD_IMAGE_FILE || "";

// Cleanup operations after every test suite
afterAll(async () => {
  // Close db connection
  await db.knex.destroy();
});

export const clearDb = async () => {
  await db.eventLog().del();
  await db.config().del();
};

export const clearS3 = async () => {
  const objects = await s3Public.list();
  if (objects?.Contents) {
    for (const obj of objects.Contents) {
      if (obj.Key) {
        await s3Public.remove(obj.Key);
      }
    }
  }
};

export const createAccessToken = (
  userId: string,
  type: "admin",
  options?: {
    roleNames?: string[];
    attributes?: { [k: string]: string };
  },
) => {
  const payload: JWTPayload = {
    userId,
    type,
    roleNames: options?.roleNames,
    attributes: options?.attributes,
  };
  const signOptions: jwt.SignOptions = {
    issuer: "test-spa-backend",
    expiresIn: 86400,
  };
  return jwt.sign(payload, ENV.JWT_SECRET, signOptions);
};

export const mockAdmin = () => {
  const adminAccessToken = createAccessToken(uuidv4(), "admin", {
    roleNames: ["admin"],
  });

  const jwtPayload = decodeJWTPayload(adminAccessToken);
  return {
    userId: jwtPayload.userId,
    axiosConfig: {
      headers: {
        Authorization: `Bearer ${adminAccessToken}`,
      },
    },
    session: new Session({
      accessToken: adminAccessToken,
      jwtPayload,
    }),
  };
};
