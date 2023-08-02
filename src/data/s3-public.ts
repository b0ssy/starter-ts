import {
  S3Client,
  ListObjectsCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";

import { ENV } from "../config";
import { Logger } from "../helpers/logger";

const LOG = new Logger("data/s3-public");

export type S3PublicOptions = {
  region?: string;
  endpoint?: string;
  bucketName: string;
};

export type PutOptions = {
  contentType?: string;
  contentLength?: number;
  expiryDate?: Date;
};

/**
 * Handle S3 communications to store raw data
 *
 * NOTE: Disabled and not used because it is expensive to use s3 to store raw data
 */
export class S3Public {
  options: S3PublicOptions;
  client: S3Client;

  constructor(options: S3PublicOptions) {
    this.options = options || {};
    this.client = new S3Client({
      region: this.options.region,
      endpoint: this.options.endpoint,
      forcePathStyle: this.options.endpoint?.includes("localhost"),
    });
  }

  /**
   * Put object
   * @param key Object key
   * @param object Object data
   * @param options Options
   * @returns S3 command response on success, null otherwise
   */
  async put(
    key: string,
    object: string | Uint8Array | Buffer | undefined,
    options?: PutOptions
  ) {
    const cmd = new PutObjectCommand({
      Bucket: this.options.bucketName,
      Key: key,
      Body: object,
      ContentType: options?.contentType,
      ContentLength: options?.contentLength,
      Expires: options?.expiryDate,
    });
    return this.client.send(cmd).catch((err) => {
      LOG.error("Failed to put object", err);
      return null;
    });
  }

  /**
   * Get object by key
   * @param key Object key
   * @returns S3 command response on success, null otherwise
   */
  async get(key: string) {
    const cmd = new GetObjectCommand({
      Bucket: this.options.bucketName,
      Key: key,
    });
    return this.client.send(cmd).catch((err) => {
      if (err?.name !== "NoSuchKey") {
        LOG.error("Failed to get object", err);
      }
      return null;
    });
  }

  /**
   * Get object by key as string
   * @param key Object key
   * @returns S3 object string on success, null otherwise
   */
  async getAsString(key: string) {
    const obj = await this.get(key);
    return obj?.Body?.transformToString() || null;
  }

  /**
   * List objects by key prefix
   * @param keyPrefix Key prefix
   * @returns S3 command response on success, null otherwise
   */
  async list(keyPrefix?: string) {
    const cmd = new ListObjectsCommand({
      Bucket: this.options.bucketName,
      Prefix: keyPrefix,
    });
    return this.client.send(cmd).catch((err) => {
      LOG.error("Failed to list objects", err);
      return null;
    });
  }

  /**
   * Remove object by key
   * @param key Object key
   * @returns S3 command response on success, null otherwise
   */
  async remove(key: string) {
    const cmd = new DeleteObjectCommand({
      Bucket: this.options.bucketName,
      Key: key,
    });
    return this.client.send(cmd).catch((err) => {
      LOG.error("Failed to delete object", err);
      return null;
    });
  }
}

export default new S3Public({
  region: ENV.S3_PUBLIC_REGION || undefined,
  endpoint: ENV.S3_PUBLIC_ENDPOINT || undefined,
  bucketName: ENV.S3_PUBLIC_BUCKET_NAME,
});
