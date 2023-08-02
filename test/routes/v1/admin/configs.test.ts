import { describe, expect, test, beforeEach } from "@jest/globals";

import { apis, clearDb, mockAdmin } from "../../../helpers";
import { ctl } from "../../../../src/controllers";

beforeEach(async () => {
  await clearDb();
});

describe("GET /v1/admin/configs", () => {
  test("GET /v1/admin/configs - ok", async () => {
    await ctl.admin.config().createOne({ key: "" });

    const res = await apis.admin.v1AdminConfigsGet({}, mockAdmin().axiosConfig);
    expect(res.status).toBe(200);
    expect(res.data.data.data.length).toBe(1);
    expect(res.data.data.count).toBe(1);
  });
  test("GET /v1/admin/configs - not_authorized", async () => {
    const res = await apis.admin.v1AdminConfigsGet();
    expect(res.status).toBe(401);
    expect(res.data.code).toBe("not_authorized");
  });
});
