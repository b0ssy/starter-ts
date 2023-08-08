import p from "path";
import fs from "fs-extra";
import { camelCase, snakeCase, sentenceCase } from "change-case";
import * as prettier from "prettier";

export type GenerateOptions<TObject extends object> = {
  outputPath: string;
  controllerName?: string;
  objectTypeName: string;
  tableNameQuery?: string;
  expands?: {
    name: string;
    objectSchemaName: string;
    direct?: {
      tableNameQuery: string;
      joinColumn?: string;
    };
    indirect?: {
      tableName: string;
      joinTableName: string;
      joinTableNameQuery?: string;
      joinPrimaryColumn?: string;
      joinSecondaryColumn?: string;
    };
  }[];
  expandEventLogs?: boolean;
  srcDir?: string;
  createOne?: boolean;
  createOnePick?: { [k in keyof TObject]?: true };
  getOne?: boolean;
  getMany?: boolean;
  getManyOmit?: { [k in keyof TObject]?: true };
  getManyWhereQueriesPick?: { [k in keyof TObject]?: "string" | "number" };
  updateOne?: boolean;
  updateOnePick?: { [k in keyof TObject]?: true };
  softDeleteOne?: boolean;
  hardDeleteOne?: boolean;
  events?: {
    prefix: string;
    idName?: string;
    created?: boolean;
    createdMore?: {
      prefix: string;
      idName?: string;
    }[];
    updated?: boolean;
    updatedMore?: {
      prefix: string;
      idName?: string;
    }[];
    deleted?: boolean;
    deletedMore?: {
      prefix: string;
      idName?: string;
    }[];
  };
  routes?: {
    routePrefix?: string;
    routeNoun?: string;
    tags?: string[];
    singularNoun?: string;
    pluralNoun?: string;
  };
};

export const generate = async <TObject extends object = object>(
  options: GenerateOptions<TObject>,
) => {
  const {
    outputPath,
    objectTypeName,
    expands,
    expandEventLogs,
    createOne,
    createOnePick,
    getOne,
    getMany,
    getManyOmit,
    getManyWhereQueriesPick,
    updateOne,
    updateOnePick,
    softDeleteOne,
    hardDeleteOne,
    events,
  } = options;
  const tableNameQuery = `${
    options.tableNameQuery ?? camelCase(options.objectTypeName)
  }()`;
  const controllerName =
    options.controllerName ?? `Generated${objectTypeName}AdminController`;
  const objectSchemaName = `z${objectTypeName}`;
  const srcDir = options.srcDir ?? "../..";
  expands?.forEach((expand) => {
    if (expand.direct) {
      if (!expand.direct.joinColumn) {
        expand.direct.joinColumn = `${camelCase(objectTypeName)}Id`;
      }
    }
    if (expand.indirect) {
      if (!expand.indirect.joinTableNameQuery) {
        expand.indirect.joinTableNameQuery = `${camelCase(
          expand.indirect.joinTableName,
        )}()`;
      }
      if (!expand.indirect.joinPrimaryColumn) {
        expand.indirect.joinPrimaryColumn = `${camelCase(objectTypeName)}Id`;
      }
      if (!expand.indirect.joinSecondaryColumn) {
        expand.indirect.joinSecondaryColumn = `${camelCase(
          expand.indirect.tableName,
        )}Id`;
      }
    }
  });
  const routes = options.routes || {};
  routes.routePrefix = routes.routePrefix ?? "/v1/admin";
  routes.routeNoun = routes.routeNoun ?? `${snakeCase(objectTypeName)}s`;
  routes.singularNoun =
    routes.singularNoun ?? `${sentenceCase(objectTypeName).toLowerCase()}`;
  routes.pluralNoun = routes.pluralNoun ?? `${routes.singularNoun}s`;
  routes.tags = routes.tags ?? ["Admin"];

  let script = `import { z } from "zod";

import { Controller, Routes } from "${srcDir}/data/api";
import {
  ${objectSchemaName},
  ${objectTypeName},
  ${(expands || []).map((expand) => `${expand.objectSchemaName},`).join("\n")}
  ${expandEventLogs ? "zEventLog," : ""}
} from "${srcDir}/data/db";
import {
  ${getMany ? "zGetManyOptions," : ""}
  ${getMany ? "getMany," : ""}
  ${createOne ? "createOne," : ""}
  ${updateOne ? "updateOne," : ""}
  ${softDeleteOne ? "softDeleteOne," : ""}
  ${hardDeleteOne ? "hardDeleteOne," : ""}
  ${getOne ? "InvalidIdError," : ""}
} from "${srcDir}/helpers/api";

export class ${controllerName} extends Controller {
  static expanded = ${objectSchemaName}.omit({
    ${softDeleteOne ? "deletedAt: true," : ""}
    ${getManyOmit ? Object.keys(getManyOmit).map((key) => `${key}: true,`) : ""}
  }).extend({
    ${(expands || [])
      .map(
        (expand) =>
          `${expand.name}: ${expand.objectSchemaName}.array().optional(),`,
      )
      .join("\n")}
    ${expandEventLogs ? "eventLogs: zEventLog.array().optional()," : ""}
  });

  static options = {
    ${
      createOne
        ? `createOne: ${objectSchemaName}.pick({
          ${Object.keys(createOnePick ?? {})
            .map((pick) => `${pick}: true,`)
            .join("\n")}
    }),`
        : ""
    }
    ${
      getMany
        ? `getMany: zGetManyOptions.extend({
      sortColumn: ${objectSchemaName}.keyof().optional(),
      expand: z
        .enum([
          ${(expands || []).map((expand) => `"${expand.name}",`).join("\n")} 
          ${!expands?.length && !expandEventLogs ? '"",' : ""}
          ${expandEventLogs ? '"eventLogs",' : ""}
        ])
        .array()
        .optional(),
      ${Object.keys(getManyWhereQueriesPick || {})
        .map((key) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const type = ((getManyWhereQueriesPick || {}) as any)[key];
          return [
            `["${key}.eq"]: z.${type}().optional(),`,
            `["${key}.notEq"]: z.${type}().optional(),`,
            type !== "number" ? `["${key}.like"]: z.${type}().optional(),` : "",
            `["${key}.lt"]: z.${type}().optional(),`,
            `["${key}.lte"]: z.${type}().optional(),`,
            `["${key}.gt"]: z.${type}().optional(),`,
            `["${key}.gte"]: z.${type}().optional(),`,
            `["${key}.isNull"]: z.boolean().optional(),`,
            `["${key}.isNotNull"]: z.boolean().optional(),`,
          ].join("\n");
        })
        .join("\n")}
    }),`
        : ""
    }
    ${
      updateOne
        ? `
    updateOne: ${objectSchemaName}
    .pick({
      ${Object.keys(updateOnePick ?? {})
        .map((pick) => `${pick}: true,`)
        .join("\n")}
    })
    .partial(),
    `
        : ""
    }
  };

  ${
    createOne
      ? `
  createOne = async (
    options: z.infer<typeof ${controllerName}.options.createOne>
  ) => {
    const { ...data } = options;
    const ret = await createOne<${objectTypeName}>(this.db.${tableNameQuery}, data);
    ${
      events?.created
        ? `await this.logEvent("${events.prefix}.created", ret.${
            events?.idName ?? "id"
          }, ret);`
        : ""
    }
    ${(events?.createdMore || []).map(
      (created) =>
        `await this.logEvent("${created.prefix}.created", ret.${
          created.idName ?? "id"
        }, ret);`,
    )}
    return ret;
  };
  `
      : ""
  }

  ${
    getOne
      ? `
  getOne = async (id: string) => {
    const { data } = await this.getMany({
      ids: [id],
      expand: [
        ${(expands || []).map((expand) => `"${expand.name}",`).join("\n")}
        ${expandEventLogs ? '"eventLogs",' : ""}
      ],
    });
    if (!data.length) {
      throw new InvalidIdError();
    }
    return data[0];
  };
  `
      : ""
  }

  ${
    getMany
      ? `
  getMany = async (
    options?: z.infer<typeof ${controllerName}.options.getMany>
  ) => {
    const results = await getMany(this.db.${tableNameQuery}, options, {
      ${Object.keys(getManyWhereQueriesPick ?? {})
        .map((key) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const type = ((getManyWhereQueriesPick || {}) as any)[key];
          return `${key}: {
              eq: options?.["${key}.eq"],
              notEq: options?.["${key}.notEq"],
              ${type !== "number" ? `like: options?.["${key}.like"],` : ""}
              lt: options?.["${key}.lt"],
              lte: options?.["${key}.lte"],
              gt: options?.["${key}.gt"],
              gte: options?.["${key}.gte"],
              isNull: options?.["${key}.isNull"],
              isNotNull: options?.["${key}.isNotNull"],
            },`;
        })
        .join("\n")}
    });
    const data = ${controllerName}.expanded.array().parse(results.data);

    ${
      !!expands?.length || expandEventLogs
        ? `
    // Expand
    if (!options?.countOnly) {
      // Cache data by id
      const dataById: {
        [k: string]: z.infer<typeof ${controllerName}.expanded>;
      } = {};
      data.forEach((d) => (dataById[d.id] = d));

      ${(expands || [])
        .map((expand) =>
          expand.direct
            ? `
  if (options?.expand?.includes("${expand.name}")) {
     const rows = await this.db
       .${expand.direct.tableNameQuery}
       .select()
       .whereIn(
         "${expand.direct.joinColumn}",
         data.map(({ id }) => id)
       );
     rows.forEach((row) => {
       const list = dataById[row.${expand.direct.joinColumn}].${expand.name} || [];
       dataById[row.${expand.direct.joinColumn}].${expand.name} = [...list, row];
     });
   }
  `
            : expand.indirect
            ? `
    if (options?.expand?.includes("${expand.name}")) {
      const rows = await this.db
        .${expand.indirect.joinTableNameQuery}
        .select("${expand.indirect.tableName}.*", "${expand.indirect.joinTableName}.${expand.indirect.joinPrimaryColumn}")
        .whereIn(
          "${expand.indirect.joinPrimaryColumn}",
          data.map(({ id }) => id)
        )
        .whereNull("${expand.indirect.tableName}.deletedAt")
        .join("${expand.indirect.tableName}", "${expand.indirect.joinTableName}.${expand.indirect.joinSecondaryColumn}", "=", "${expand.indirect.tableName}.id");
      rows.forEach((row) => {
        const { ${expand.indirect.joinPrimaryColumn}, ...data } = row;
        const list = dataById[${expand.indirect.joinPrimaryColumn}].${expand.name} || [];
        dataById[${expand.indirect.joinPrimaryColumn}].${expand.name} = [...list, data];
      });
    }
            `
            : "",
        )
        .join("\n")}

      ${
        events?.prefix && expandEventLogs
          ? `
      if (options?.expand?.includes("eventLogs")) {
        const rows = await this.db
          .eventLog()
          .select()
          .whereIn(
            "dataId",
            data.map(({ id }) => id)
          )
          .whereLike("type", "${events.prefix}.%");
        rows.forEach((row) => {
          if (row.dataId) {
            const list = dataById[row.dataId].eventLogs || [];
            dataById[row.dataId].eventLogs = [...list, row];
          }
        });
      }
      `
          : ""
      }
    }
    `
        : ""
    }

    return { data, count: results.count };
  };`
      : ""
  }

  ${
    updateOne
      ? `
  updateOne = async (
    id: string,
    options: z.infer<typeof ${controllerName}.options.updateOne>
  ) => {
    const { ...data } = options;
    const ret = await updateOne<${objectTypeName}>(this.db.${tableNameQuery}, id, data);
    ${
      events?.updated
        ? `await this.logEvent("${events.prefix}.updated", ret.${
            events?.idName ?? "id"
          }, ret);`
        : ""
    }
    ${(events?.updatedMore || []).map(
      (updated) =>
        `await this.logEvent("${updated.prefix}.updated", ret.${
          updated.idName ?? "id"
        }, ret);`,
    )}
    return ret;
  };
  `
      : ""
  }

  ${
    softDeleteOne
      ? `
  softDeleteOne = async (id: string) => {
    const ret = await softDeleteOne(this.db.${tableNameQuery}, id);
    ${
      events?.deleted
        ? `await this.logEvent("${events.prefix}.deleted", ret.${
            events?.idName ?? "id"
          }, ret);`
        : ""
    }
    ${(events?.deletedMore || []).map(
      (deleted) =>
        `await this.logEvent("${deleted.prefix}.deleted", ret.${
          deleted.idName ?? "id"
        }, ret);`,
    )}
    return ret;
  };
  `
      : ""
  }

  ${
    hardDeleteOne
      ? `
  hardDeleteOne = async (id: string) => {
    const ret = await hardDeleteOne(this.db.${tableNameQuery}, id);
    ${
      events?.deleted
        ? `await this.logEvent("${events.prefix}.deleted", ret.${
            events.idName ?? "id"
          }, ret);`
        : ""
    }
    ${(events?.deletedMore || []).map(
      (deleted) =>
        `await this.logEvent("${deleted.prefix}.deleted", ret.${
          deleted.idName ?? "id"
        }, ret);`,
    )}
    return ret;
  };
  `
      : ""
  }
  ${
    routes
      ? `
  static useRoutes = (
    routes: Routes<${controllerName}>,
    select?: {
      ${createOne ? "createOne?: boolean," : ""}
      ${getOne ? "getOne?: boolean," : ""}
      ${getMany ? "getMany?: boolean," : ""}
      ${updateOne ? "updateOne?: boolean," : ""}
      ${softDeleteOne || hardDeleteOne ? "deleteOne?: boolean," : ""}
    },
  ): Routes<${controllerName}> => {
    ${
      createOne
        ? `
        if (!select || select?.createOne) {
          routes.post("${routes.routePrefix}/${routes.routeNoun}", "Create ${
            routes.singularNoun
          }", {
            tags: [${(routes.tags || []).map((tag) => `"${tag}"`).join(", ")}],
            req: z.object({
              body: ${controllerName}.options.createOne,
            }),
            resSuccessBody: z.object({
              id: z.string(),
            }),
            handler: async ({ ctl, body }) => {
              const { id } = await ctl.createOne(body);
              return { id };
            },
          });
        }`
        : ""
    }
      ${
        getOne
          ? `
          if (!select || select?.getOne) {
            routes.get("${routes.routePrefix}/${routes.routeNoun}/{id}", "Get ${
              routes.singularNoun
            }", {
              tags: [${(routes.tags || [])
                .map((tag) => `"${tag}"`)
                .join(", ")}],
              req: z.object({
                params: z.object({
                  id: z.string(),
                }),
              }),
              resSuccessBody: z.object({
                data: ${controllerName}.expanded,
              }),
              handler: async ({ ctl, params }) => {
                const data = await ctl.getOne(params.id);
                return { data };
              },
            });
          }`
          : ""
      }
      ${
        getMany
          ? `
          if (!select || select?.getMany) {
              routes.get("${routes.routePrefix}/${routes.routeNoun}", "Get ${
                routes.pluralNoun
              }", {
              tags: [${(routes.tags || [])
                .map((tag) => `"${tag}"`)
                .join(", ")}],
              req: z.object({
                query: ${controllerName}.options.getMany,
              }),
              resSuccessBody: z.object({
                data: ${objectSchemaName}.array(),
                count: z.number(),
              }),
              handler: async ({ ctl, query }) => {
                const { data, count } = await ctl.getMany(query);
                return { data, count };
              },
            });
          }`
          : ""
      }
    ${
      updateOne
        ? `
        if (!select || select?.updateOne) {
            routes.patch("${routes.routePrefix}/${
              routes.routeNoun
            }/{id}", "Update ${routes.singularNoun}", {
            tags: [${(routes.tags || []).map((tag) => `"${tag}"`).join(", ")}],
            req: z.object({
              body: ${controllerName}.options.updateOne,
              params: z.object({
                id: z.string(),
              }),
            }),
            resSuccessBody: z.object({}),
            handler: async ({ ctl, params, body }) => {
              await ctl.updateOne(params.id, body);
            },
          });
        }`
        : ""
    }
    ${
      softDeleteOne || hardDeleteOne
        ? `
        if (!select || select?.deleteOne) {
            routes.delete("${routes.routePrefix}/${
              routes.routeNoun
            }/{id}", "Delete ${routes.singularNoun}", {
            tags: [${(routes.tags || []).map((tag) => `"${tag}"`).join(", ")}],
            req: z.object({
              params: z.object({
                id: z.string(),
              }),
            }),
            resSuccessBody: z.object({}),
            handler: async ({ ctl, params }) => {
              await ctl.${
                softDeleteOne ? "softDeleteOne" : "hardDeleteOne"
              }(params.id);
            },
          });
        }`
        : ""
    }
    return routes;
  };
  `
      : ""
  }}`;

  await fs.ensureDir(p.dirname(outputPath));
  script = await prettier.format(script, { parser: "typescript" });
  await fs.writeFile(outputPath, script);
};
