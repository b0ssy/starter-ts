import { describe, expect, test } from "@jest/globals";
import axios from "axios";

import { SERVER_URL } from "../helpers";

describe("routes.health", () => {
  test("GET /health", async () => {
    const res = await axios.get(`${SERVER_URL}/health`);
    expect(res.status).toBe(204);
  });
});
