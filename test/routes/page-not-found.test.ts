import { describe, expect, test } from "@jest/globals";
import axios from "axios";

import { SERVER_URL } from "../helpers";

describe("routes.page-not-found", () => {
  test("GET /xxx", async () => {
    const res = await axios.get(`${SERVER_URL}/hahaha`);
    expect(res.status).toBe(404);
    expect(res.data.code).toBe("page_not_found");
  });
});
