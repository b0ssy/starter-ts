import { describe, expect, test } from "@jest/globals";

import { TooManyRequestsError } from "../../src/errors/too-many-requests";

describe("errors.bad-request", () => {
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
