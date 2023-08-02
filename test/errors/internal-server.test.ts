import { describe, expect, test } from "@jest/globals";

import { InternalServerError } from "../../src/errors/internal-server";

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
