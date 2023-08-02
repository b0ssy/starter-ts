import { describe, expect, test } from "@jest/globals";

import { NotFoundError } from "../../src/errors/not-found";

describe("errors.bad-request", () => {
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
