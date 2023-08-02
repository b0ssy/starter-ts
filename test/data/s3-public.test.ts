import { describe, expect, test, beforeEach } from "@jest/globals";

import { clearS3 } from "../helpers";
import s3 from "../../src/data/s3-public";

beforeEach(async () => {
  await clearS3();
});

describe("data.s3", () => {
  test("put, get, getAsString, list, remove", async () => {
    expect(await s3.get("a")).toBeNull();
    expect(await s3.put("a", "1")).not.toBeNull();
    expect(await (await s3.get("a"))?.Body?.transformToString()).toBe("1");
    expect(await s3.getAsString("a")).toBe("1");
    {
      const contents = (await s3.list("a"))?.Contents;
      expect(contents?.length).toBe(1);
      expect(contents![0].Key).toBe("a");
    }
    expect(await s3.put("aa", "2")).not.toBeNull();
    {
      const contents = (await s3.list("a"))?.Contents;
      expect(contents?.length).toBe(2);
      expect(contents![0].Key).toBe("a");
      expect(contents![1].Key).toBe("aa");
    }
    expect(await s3.remove("a")).not.toBeNull();
    expect(await s3.get("a")).toBeNull();
  });
});
