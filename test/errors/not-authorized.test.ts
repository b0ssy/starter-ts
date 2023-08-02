import { describe, expect, test } from "@jest/globals";

import { NotAuthorizedError } from "../../src/errors/not-authorized";

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
