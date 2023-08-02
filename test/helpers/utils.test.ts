import { describe, expect, test } from "@jest/globals";

import {
  wait,
  runForAtLeast,
  isValidEmail,
  sha256,
  generateRSAKeys,
  rsaPublicEncrypt,
  rsaPrivateDecrypt,
} from "../../src/helpers/utils";

describe("helpers.utils", () => {
  test("wait", async () => {
    // add a 100ms delay buffer just in case
    const s = Date.now();
    await wait(1100);
    expect(Date.now() - s).toBeGreaterThan(1000);
    expect(Date.now() - s).toBeLessThanOrEqual(1200);
  });
  test("runForAtLeast", async () => {
    // add a 100ms delay buffer just in case
    const s = Date.now();
    let a = "a";
    await runForAtLeast(1100, async () => {
      a = "done";
    });
    expect(a).toBe("done");
    expect(Date.now() - s).toBeGreaterThan(1000);
    expect(Date.now() - s).toBeLessThanOrEqual(1200);

    const err = new Error("oops");
    expect(async () => {
      await runForAtLeast(100, async () => {
        throw err;
      });
    }).rejects.toThrowError(err);
  });
  test("validateEmail", async () => {
    expect(isValidEmail("test@morrowcare.co")).toBeTruthy();
    expect(isValidEmail("a@b.c")).toBeTruthy();
    expect(isValidEmail("@morrowcare")).toBeFalsy();
    expect(isValidEmail("test@morrowcare")).toBeFalsy();
    expect(isValidEmail("test@.co")).toBeFalsy();
    expect(isValidEmail("test")).toBeFalsy();
  });
  test("sha256", async () => {
    expect(sha256("1234")).toBe("A6xnQhbz4Vx2HuGl4lXwZ5U2I8iziLRFnhP5eNfIRvQ=");
  });
  test("encryption / decryption", async () => {
    const { privateKey, publicKey } = await generateRSAKeys();
    expect(privateKey).toContain("BEGIN RSA PRIVATE KEY");
    expect(privateKey).toContain("END RSA PRIVATE KEY");
    expect(publicKey).toContain("BEGIN RSA PUBLIC KEY");
    expect(publicKey).toContain("END RSA PUBLIC KEY");

    const original = "testing 1 2 3";
    const cipher = rsaPublicEncrypt(privateKey, Buffer.from(original, "utf-8"));
    expect(cipher.toString("utf-8")).not.toBe(original);
    const plain = rsaPrivateDecrypt(privateKey, cipher);
    expect(plain.toString("utf-8")).toBe(original);
  });
});
