import { describe, expect, test } from "@jest/globals";

import { UnsupportedOperationError } from "../../src/errors/unsupported-operation";

describe("errors.unsupported-operation", () => {
  test("check error", async () => {
    const err = new UnsupportedOperationError("message");
    expect(err.status).toBe(400);
    expect(err.code).toBe("unsupported_operation");
    expect(err.codeMessage).toBe("message");
  });
});
