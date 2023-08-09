import { describe, expect, test } from "@jest/globals";

import {
  AppError,
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  TooManyRequestsError,
  InternalServerError,
  NotImplementedError,
  UnsupportedOperationError,
} from "../src/errors";

describe("errors.app", () => {
  test("check error", async () => {
    const err = new AppError(400, "Code", "message");
    expect(err.status).toBe(400);
    expect(err.code).toBe("code"); // Note: forced to lowercase!
    expect(err.codeMessage).toBe("message");
  });
});
describe("errors.bad-request", () => {
  test("check error", async () => {
    const err = new BadRequestError("message");
    expect(err.status).toBe(400);
    expect(err.code).toBe("bad_request");
    expect(err.codeMessage).toBe("message");
  });
  test("override code", async () => {
    const err = new BadRequestError("message", "code");
    expect(err.status).toBe(400);
    expect(err.code).toBe("code");
    expect(err.codeMessage).toBe("message");
  });
});
describe("errors.not-authorized", () => {
  test("check error", async () => {
    const err = new NotAuthorizedError("message");
    expect(err.status).toBe(401);
    expect(err.code).toBe("not_authorized");
    expect(err.codeMessage).toBe("message");
  });
  test("override code", async () => {
    const err = new NotAuthorizedError("message", "code");
    expect(err.status).toBe(401);
    expect(err.code).toBe("code");
    expect(err.codeMessage).toBe("message");
  });
});
describe("errors.not-found", () => {
  test("check error", async () => {
    const err = new NotFoundError("message");
    expect(err.status).toBe(404);
    expect(err.code).toBe("not_found");
    expect(err.codeMessage).toBe("message");
  });
  test("override code", async () => {
    const err = new NotFoundError("message", "code");
    expect(err.status).toBe(404);
    expect(err.code).toBe("code");
    expect(err.codeMessage).toBe("message");
  });
});
describe("errors.too-many-requests", () => {
  test("check error", async () => {
    const err = new TooManyRequestsError("message");
    expect(err.status).toBe(429);
    expect(err.code).toBe("too_many_requests");
    expect(err.codeMessage).toBe("message");
  });
  test("override code", async () => {
    const err = new TooManyRequestsError("message", "code");
    expect(err.status).toBe(429);
    expect(err.code).toBe("code");
    expect(err.codeMessage).toBe("message");
  });
});
describe("errors.internal-server", () => {
  test("check error", async () => {
    const err = new InternalServerError("message");
    expect(err.status).toBe(500);
    expect(err.code).toBe("internal_server_error");
    expect(err.codeMessage).toBe("message");
  });
  test("override code", async () => {
    const err = new InternalServerError("message", "code");
    expect(err.status).toBe(500);
    expect(err.code).toBe("code");
    expect(err.codeMessage).toBe("message");
  });
});
describe("errors.not-implemented", () => {
  test("check error", async () => {
    const err = new NotImplementedError("message");
    expect(err.status).toBe(500);
    expect(err.code).toBe("not_implemented");
    expect(err.codeMessage).toBe("message");
  });
});
describe("errors.unsupported-operation", () => {
  test("check error", async () => {
    const err = new UnsupportedOperationError("message");
    expect(err.status).toBe(400);
    expect(err.code).toBe("unsupported_operation");
    expect(err.codeMessage).toBe("message");
  });
});
