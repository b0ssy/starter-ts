import { Knex } from "knex";

import {
  ON_UPDATE_TIMESTAMP_FUNCTION,
  DROP_ON_UPDATE_TIMESTAMP_FUNCTION,
  useUuidAsPrimaryKey,
  useTimestamps,
  onUpdateTrigger,
} from "../src/helpers/db";

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("file", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.timestamp("deletedAt");
      t.text("type");
      t.text("name");
      t.text("path");

      t.unique(["path"]);
      t.index(["deletedAt"]);
      t.index(["type"]);
      t.index(["name"]);
    })
    .createTable("product", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.timestamp("deletedAt");
      t.timestamp("expiresAt");
      t.text("type");
      t.text("category");
      t.text("name");
      t.text("summary");
      t.text("description");
      t.text("currency");
      t.double("price");
      t.integer("buyMinimumQuantity");
      t.integer("buyMaximumQuantity");
      t.integer("buyGroupOfQuantity");
      t.text("sku");
      t.integer("stockQuantity");
      t.text("visibility");

      t.index(["deletedAt"]);
      t.index(["type"]);
      t.index(["category"]);
      t.index(["name"]);
      t.index(["currency"]);
      t.index(["price"]);
      t.index(["sku"]);
      t.index(["stockQuantity"]);
      t.index(["visibility"]);
    })
    .createTable("product_discount", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.timestamp("startsAt");
      t.timestamp("endsAt");
      t.uuid("productId").notNullable();
      t.foreign("productId").references("id").inTable("product");
      t.text("currency");
      t.double("price");

      t.index(["currency"]);
      t.index(["price"]);
    })
    .createTable("product_review", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.uuid("productId").notNullable();
      t.foreign("productId").references("id").inTable("product");
      t.text("customerId").notNullable();
      t.text("status");
      t.double("ratings");
      t.text("comments");

      t.index(["customerId"]);
      t.index(["status"]);
      t.index(["ratings"]);
    })
    .createTable("product_group", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.uuid("parentProductId").notNullable();
      t.foreign("parentProductId").references("id").inTable("product");
      t.uuid("childProductId").notNullable();
      t.foreign("childProductId").references("id").inTable("product");
    })
    .createTable("product_attribute", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.uuid("productId").notNullable();
      t.foreign("productId").references("id").inTable("product");
      t.text("key").notNullable();
      t.text("value");
      t.text("description");

      t.index(["key"]);
    })
    .createTable("product_file", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.uuid("productId").notNullable();
      t.foreign("productId").references("id").inTable("product");
      t.uuid("fileId").notNullable();
      t.foreign("fileId").references("id").inTable("file");

      t.unique(["productId", "fileId"]);
    })
    .createTable("store", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.timestamp("deletedAt");
      t.text("name");
      t.text("description");
      t.text("addressCity");
      t.text("addressCountry");
      t.text("addressState");
      t.text("addressLine1");
      t.text("addressLine2");
      t.text("addressPostalCode");

      // TODO
      // t.text("openingHours");
      // t.text("contactNumbers");

      t.index(["deletedAt"]);
      t.index(["name"]);
    })
    .createTable("store_product", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.uuid("storeId").notNullable();
      t.foreign("storeId").references("id").inTable("store");
      t.uuid("productId").notNullable();
      t.foreign("productId").references("id").inTable("product");

      t.unique(["storeId", "productId"]);
    })
    .createTable("store_review", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.uuid("storeId").notNullable();
      t.foreign("storeId").references("id").inTable("store");
      t.text("customerId").notNullable();
      t.text("status");
      t.double("ratings");
      t.text("comments");

      t.index(["customerId"]);
      t.index(["status"]);
      t.index(["ratings"]);
    })
    .createTable("store_file", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.uuid("storeId").notNullable();
      t.foreign("storeId").references("id").inTable("store");
      t.uuid("fileId").notNullable();
      t.foreign("fileId").references("id").inTable("file");

      t.unique(["storeId", "fileId"]);
    })
    .createTable("order", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.text("customerId").notNullable();
      t.text("currency");
      t.double("totalPrice");
      t.double("totalDiscount");

      t.index(["customerId"]);
      t.index(["currency"]);
      t.index(["totalPrice"]);
      t.index(["totalDiscount"]);
    })
    .createTable("order_product", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.timestamp("redeemedAt");
      t.uuid("orderId").notNullable();
      t.foreign("orderId").references("id").inTable("order");
      t.uuid("productId").notNullable();
      t.foreign("productId").references("id").inTable("product");
      t.uuid("storeId");
      t.foreign("storeId").references("id").inTable("store");
      t.text("currency");
      t.double("price");

      t.unique(["orderId", "productId"]);
      t.index(["redeemedAt"]);
      t.index(["currency"]);
      t.index(["price"]);
    })
    .createTable("order_history", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.uuid("orderId").notNullable();
      t.foreign("orderId").references("id").inTable("order");
      t.text("status");

      t.index(["status"]);
    })
    .createTable("invoice", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.timestamp("deletedAt");
      t.text("title");
      t.text("billingName");
      t.text("billingAddress");
      t.text("billingEmail");
      t.text("billingMobileNumber");
      t.text("currency");

      t.index(["deletedAt"]);
      t.index(["title"]);
    })
    .createTable("invoice_line_item", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.uuid("invoiceId").notNullable();
      t.foreign("invoiceId").references("id").inTable("invoice");
      t.double("quantity");
      t.text("currency");
      t.double("unitPrice");
      t.text("description");
    })
    .createTable("invoice_order", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.uuid("invoiceId").notNullable();
      t.foreign("invoiceId").references("id").inTable("invoice");
      t.uuid("orderId").notNullable();
      t.foreign("orderId").references("id").inTable("order");
    })
    .createTable("config", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.text("key").notNullable();
      t.text("value");

      t.index(["key"]);
    })
    .createTable("event_log", (t) => {
      useUuidAsPrimaryKey(knex, t);
      useTimestamps(t);
      t.text("type").notNullable();
      t.text("dataId");
      t.text("sessionUserId");
      t.text("data");

      t.index(["type"]);
      t.index(["dataId"]);
      t.index(["sessionUserId"]);
      t.index(["type", "dataId"]);
    })
    .then(() => {
      knex.raw(ON_UPDATE_TIMESTAMP_FUNCTION);
      knex.raw(onUpdateTrigger("file"));
      knex.raw(onUpdateTrigger("product"));
      knex.raw(onUpdateTrigger("product_discount"));
      knex.raw(onUpdateTrigger("product_review"));
      knex.raw(onUpdateTrigger("product_group"));
      knex.raw(onUpdateTrigger("product_attribute"));
      knex.raw(onUpdateTrigger("product_file"));
      knex.raw(onUpdateTrigger("store"));
      knex.raw(onUpdateTrigger("store_product"));
      knex.raw(onUpdateTrigger("store_review"));
      knex.raw(onUpdateTrigger("store_file"));
      knex.raw(onUpdateTrigger("order"));
      knex.raw(onUpdateTrigger("order_product"));
      knex.raw(onUpdateTrigger("order_history"));
      knex.raw(onUpdateTrigger("invoice"));
      knex.raw(onUpdateTrigger("invoice_line_item"));
      knex.raw(onUpdateTrigger("invoice_order"));
      knex.raw(onUpdateTrigger("config"));
      knex.raw(onUpdateTrigger("event_log"));
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema
    .dropTableIfExists("event_log")
    .dropTableIfExists("config")
    .dropTableIfExists("invoice_order")
    .dropTableIfExists("invoice_line_item")
    .dropTableIfExists("invoice")
    .dropTableIfExists("order_history")
    .dropTableIfExists("order_product")
    .dropTableIfExists("order")
    .dropTableIfExists("store_file")
    .dropTableIfExists("store_review")
    .dropTableIfExists("store_product")
    .dropTableIfExists("store")
    .dropTableIfExists("product_file")
    .dropTableIfExists("product_attribute")
    .dropTableIfExists("product_group")
    .dropTableIfExists("product_review")
    .dropTableIfExists("product_discount")
    .dropTableIfExists("product")
    .dropTableIfExists("file")
    .then(() => {
      knex.raw(DROP_ON_UPDATE_TIMESTAMP_FUNCTION);
    });
}
