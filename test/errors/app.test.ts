import { describe, expect, test } from "@jest/globals";

import { AppError } from "../../src/errors/app";

describe("errors.app", () => {
  test("check error", async () => {
    const err = new AppError(400, "Code", "message");
    expect(err.status).toBe(400);
    expect(err.code).toBe("code"); // Note: forced to lowercase!
    expect(err.codeMessage).toBe("message");
  });
});
