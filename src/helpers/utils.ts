import crypto, { KeyLike, BinaryLike, BinaryToTextEncoding } from "crypto";

export type NullablePartial<T> = { [P in keyof T]?: T[P] | null };

// Sleep and wait
export const wait = async (milliseconds: number) => {
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve(null);
    }, milliseconds);
  });
};

// Run function for a minimum duration
export const runForAtLeast = async <T>(
  milliseconds: number,
  fn: () => Promise<T>
) => {
  const start = Date.now();
  let caughtErr: Error | null = null;
  await fn().catch((err) => {
    caughtErr = err;
  });
  const diff = milliseconds - (Date.now() - start);
  if (diff > 0) {
    await wait(diff);
  }
  if (caughtErr) {
    throw caughtErr;
  }
};

// Check if email address format is valid
// RFC2822
// https://regexr.com/2rhq7
export const isValidEmail = (email: string) => {
  return !!email.match(
    // eslint-disable-next-line
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g
  );
};

// Hash plaintext using md5
export const md5 = (
  plaintext: BinaryLike,
  encoding: BinaryToTextEncoding = "base64"
) => {
  return crypto.createHash("md5").update(plaintext).digest(encoding);
};

// Hash plaintext using SHA-256
export const sha256 = (
  plaintext: BinaryLike,
  encoding: BinaryToTextEncoding = "base64"
) => {
  return crypto.createHash("sha256").update(plaintext).digest(encoding);
};

// Generate random key
export const generateRandomKey = (
  size = 32,
  encoding: BufferEncoding = "base64"
) => {
  return crypto.randomBytes(size).toString(encoding);
};

// Generate random RSA keys
export const generateRSAKeys = async (): Promise<{
  privateKey: string;
  publicKey: string;
}> => {
  return new Promise((resolve, reject) => {
    crypto.generateKeyPair(
      "rsa",
      {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
      },
      (err, publicKey, privateKey) => {
        if (err) {
          reject(err);
        }
        resolve({ privateKey, publicKey });
      }
    );
  });
};

// Encrypt plaintext using public key
export const rsaPublicEncrypt = (publicKey: KeyLike, plain: Buffer): Buffer => {
  return crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    plain
  );
};

// Decrypt ciphertext using private key
export const rsaPrivateDecrypt = (
  privateKey: KeyLike,
  cipher: Buffer
): Buffer => {
  return crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    cipher
  );
};

// Helper function for axios config
export const isJsonMime = (mime: string) => {
  const jsonMime = new RegExp(
    // eslint-disable-next-line
    "^(application/json|[^;/ \t]+/[^;/ \t]+[+]json)[ \t]*(;.*)?$",
    "i"
  );
  return (
    mime !== null &&
    (jsonMime.test(mime) ||
      mime.toLowerCase() === "application/json-patch+json")
  );
};
