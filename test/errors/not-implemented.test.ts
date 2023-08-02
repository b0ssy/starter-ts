import { describe, expect, test } from "@jest/globals";

import { NotImplementedError } from "../../src/errors/not-implemented";

describe("errors.not-implemented", () => {
  test("check error", async () => {
    const err = new NotImplementedError("message");
    expect(err.status).toBe(500);
    expect(err.code).toBe("not_implemented");
    expect(err.codeMessage).toBe("message");
  });
});
