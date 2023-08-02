import { describe, expect, test } from "@jest/globals";

import { BadRequestError } from "../../src/errors/bad-request";

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
