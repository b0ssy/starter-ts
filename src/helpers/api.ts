import { Knex } from "knex";
import { Response } from "express";
import {
  z,
  AnyZodObject,
  ZodObject,
  ZodNumber,
  ZodArray,
  ZodTypeAny,
} from "zod";

import { BadRequestError, NotFoundError, InternalServerError } from "../errors";

export const MAX_LIMIT = 1000;

export const zWhereQuery = z.object({
  eq: z.union([z.string(), z.number(), z.date()]).optional(),
  notEq: z.union([z.string(), z.number(), z.date()]).optional(),
  like: z.string().optional(),
  lt: z.union([z.string(), z.number(), z.date()]).optional(),
  lte: z.union([z.string(), z.number(), z.date()]).optional(),
  gt: z.union([z.string(), z.number(), z.date()]).optional(),
  gte: z.union([z.string(), z.number(), z.date()]).optional(),
  between: z.union([z.string(), z.number(), z.date()]).array().optional(),
  isNull: z.boolean().optional(),
  isNotNull: z.boolean().optional(),
});
export type WhereQuery = z.infer<typeof zWhereQuery>;

export const zCount = z
  .object({ count: z.coerce.number() })
  .array()
  .length(1)
  .transform((v) => v[0].count);

export const zGetManyOptions = z.object({
  ids: z.string().array().optional(),
  start: z.date().optional(),
  end: z.date().optional(),
  offset: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
  sortColumn: z.string().optional(),
  sortBy: z.enum(["asc", "desc"]).optional(),
  countOnly: z.coerce.boolean().optional(),
});
export type GetManyOptions = z.infer<typeof zGetManyOptions>;

export const zApiResponse = z.object({
  code: z.string(),
  message: z.string().nullable(),
  data: z.any().nullable(),
});
export type ApiResponse = z.infer<typeof zApiResponse>;

export class InvalidIdError extends NotFoundError {
  constructor() {
    super("Please provide a valid id", "invalid_id");
  }
}

export class EmptyUpdateError extends BadRequestError {
  constructor() {
    super("Empty update", "empty_update");
  }
}

export const makeApi = <
  TCreateOneBodyRequest extends AnyZodObject,
  TCreateOneQueryRequest extends AnyZodObject,
  TCreateOneParamsRequest extends AnyZodObject,
  TCreateOneHeadersRequest extends AnyZodObject,
  TCreateOneResponse extends AnyZodObject,
  TGetOneQueryRequest extends AnyZodObject,
  TGetOneParamsRequest extends AnyZodObject,
  TGetOneHeadersRequest extends AnyZodObject,
  TGetOneResponse extends AnyZodObject,
  TGetManyQueryRequest extends AnyZodObject,
  TGetManyParamsRequest extends AnyZodObject,
  TGetManyHeadersRequest extends AnyZodObject,
  TGetManyResponse extends AnyZodObject,
  TUpdateOneBodyRequest extends AnyZodObject,
  TUpdateOneQueryRequest extends AnyZodObject,
  TUpdateOneParamsRequest extends AnyZodObject,
  TUpdateOneHeadersRequest extends AnyZodObject,
  TUpdateOneResponse extends AnyZodObject,
  TDeleteOneBodyRequest extends AnyZodObject,
  TDeleteOneQueryRequest extends AnyZodObject,
  TDeleteOneParamsRequest extends AnyZodObject,
  TDeleteOneHeadersRequest extends AnyZodObject,
  TDeleteOneResponse extends AnyZodObject,
  TDeleteManyBodyRequest extends AnyZodObject,
  TDeleteManyQueryRequest extends AnyZodObject,
  TDeleteManyParamsRequest extends AnyZodObject,
  TDeleteManyHeadersRequest extends AnyZodObject,
  TDeleteManyResponse extends AnyZodObject
>(options: {
  createOneRequest?: ZodObject<{
    body?: TCreateOneBodyRequest;
    query?: TCreateOneQueryRequest;
    params?: TCreateOneParamsRequest;
    headers?: TCreateOneHeadersRequest;
  }>;
  createOneResponse?: TCreateOneResponse;

  getOneRequest?: ZodObject<{
    query?: TGetOneQueryRequest;
    params?: TGetOneParamsRequest;
    headers?: TGetOneHeadersRequest;
  }>;
  getOneResponse?: ZodObject<{
    data: TGetOneResponse;
  }>;

  getManyRequest?: ZodObject<{
    query?: TGetManyQueryRequest;
    params?: TGetManyParamsRequest;
    headers?: TGetManyHeadersRequest;
  }>;
  getManyResponse?: ZodObject<{
    data: ZodArray<TGetManyResponse>;
    count: ZodNumber;
  }>;

  updateOneRequest?: ZodObject<{
    body?: TUpdateOneBodyRequest;
    query?: TUpdateOneQueryRequest;
    params?: TUpdateOneParamsRequest;
    headers?: TUpdateOneHeadersRequest;
  }>;
  updateOneResponse?: TUpdateOneResponse;

  deleteOneRequest?: ZodObject<{
    body?: TDeleteOneBodyRequest;
    query?: TDeleteOneQueryRequest;
    params?: TDeleteOneParamsRequest;
    headers?: TDeleteOneHeadersRequest;
  }>;
  deleteOneResponse?: TDeleteOneResponse;

  deleteManyRequest?: ZodObject<{
    body?: TDeleteManyBodyRequest;
    query?: TDeleteManyQueryRequest;
    params?: TDeleteManyParamsRequest;
    headers?: TDeleteManyHeadersRequest;
  }>;
  deleteManyResponse?: TDeleteManyResponse;
}) => {
  const zCreateOneRequest = options.createOneRequest;
  const zCreateOneResponse = options.createOneResponse;

  const zGetOneRequest = options.getOneRequest;
  const zGetOneResponse = options.getOneResponse;

  const zGetManyRequest = options.getManyRequest;
  const zGetManyResponse = options.getManyResponse;

  const zUpdateOneRequest = options.updateOneRequest;
  const zUpdateOneResponse = options.updateOneResponse;

  const zDeleteOneRequest = options.deleteOneRequest;
  const zDeleteOneResponse = options.deleteOneResponse;

  const zDeleteManyRequest = options.deleteManyRequest;
  const zDeleteManyResponse = options.deleteManyResponse;

  return {
    zCreateOneRequest,
    zCreateOneResponse,
    createOneSuccess: zCreateOneResponse
      ? sendSuccess<z.infer<typeof zCreateOneResponse>>
      : () => null,

    zGetOneRequest,
    zGetOneResponse,
    getOneSuccess: zGetOneResponse
      ? sendSuccess<z.infer<typeof zGetOneResponse>>
      : () => null,

    zGetManyRequest,
    zGetManyResponse,
    getManySuccess: zGetManyResponse
      ? sendSuccess<z.infer<typeof zGetManyResponse>>
      : () => null,

    zUpdateOneRequest,
    zUpdateOneResponse,
    updateOneSuccess: zUpdateOneResponse
      ? sendSuccess<z.infer<typeof zUpdateOneResponse>>
      : () => null,

    zDeleteOneRequest,
    zDeleteOneResponse,
    deleteOneSuccess: zDeleteOneResponse
      ? sendSuccess<z.infer<typeof zDeleteOneResponse>>
      : () => null,

    zDeleteManyRequest,
    zDeleteManyResponse,
    deleteManySuccess: zDeleteManyResponse
      ? sendSuccess<z.infer<typeof zDeleteManyResponse>>
      : () => null,
  };
};

// Build where query
export const buildWhereQuery = <TRecord extends object, TResult>(
  query: Knex.QueryBuilder<TRecord, TResult>,
  column: string,
  whereQuery: WhereQuery
) => {
  query.where((builder) => {
    if (whereQuery.eq) {
      builder.where(column, whereQuery.eq);
    }
    if (whereQuery.notEq) {
      builder.whereNot(column, whereQuery.notEq);
    }
    if (whereQuery.like) {
      builder.whereLike(column, whereQuery.like);
    }
    if (whereQuery.lt) {
      builder.where(column, "<", whereQuery.lt);
    }
    if (whereQuery.lte) {
      builder.where(column, "<=", whereQuery.lte);
    }
    if (whereQuery.gt) {
      builder.where(column, ">", whereQuery.gt);
    }
    if (whereQuery.gte) {
      builder.where(column, ">=", whereQuery.gte);
    }
    if (whereQuery.between?.length === 2) {
      builder.whereBetween(column, [
        whereQuery.between[0],
        whereQuery.between[1],
      ]);
    }
    if (whereQuery.isNull) {
      builder.whereNull(column);
    }
    if (whereQuery.isNotNull) {
      builder.whereNotNull(column);
    }
  });
};

// Get many rows
export const getMany = async <
  TRecord extends object,
  TResult,
  TOptions extends GetManyOptions
>(
  query: Knex.QueryBuilder<TRecord, TResult>,
  options?: TOptions,
  whereQueries?: { [k in keyof TRecord]?: WhereQuery | undefined }
) => {
  query.select();
  if (whereQueries) {
    for (const column in whereQueries) {
      const whereQuery = whereQueries[column];
      if (whereQuery) {
        buildWhereQuery(query, column, whereQuery);
      }
    }
  }
  if (options?.ids) {
    query.whereIn("id", options.ids);
  }
  if (options?.start) {
    query.where("createdAt", ">=", options.start);
  }
  if (options?.end) {
    query.where("createdAt", "<=", options.end);
  }
  // No need to order by if counting only
  if (!options?.countOnly) {
    query.orderBy(
      options?.sortColumn ?? "createdAt",
      options?.sortBy ?? "desc"
    );
  }
  if (options?.offset !== undefined) {
    if (options.offset < 0) {
      throw new BadRequestError(
        "Please specify a valid offset (must be >=0)",
        "invalid_offset"
      );
    }
    query.offset(options.offset);
  }
  if (options?.limit !== undefined) {
    if (options.limit < 0) {
      throw new BadRequestError(
        "Please specify a valid limit (must be >=0)",
        "invalid_limit"
      );
    } else if (options.limit > MAX_LIMIT) {
      throw new BadRequestError(
        `Please specify a valid limit (must be <=${MAX_LIMIT})`,
        "invalid_limit"
      );
    }
    query.limit(options.limit);
  } else {
    query.limit(MAX_LIMIT);
  }

  if (options?.countOnly) {
    const count = zCount.parse(await query.count());
    return { data: [], count };
  } else {
    const data = (await query) as TRecord[];
    return { data, count: data.length };
  }
};

export const joinWithExternal = async <
  TJoinRecord extends object,
  TResultSchema extends AnyZodObject
>(options: {
  whereInPrimaryIds: string[];
  secondaryTableName: string;
  compositeTableName: string;
  compositeTablePrimaryJoinColumn: string;
  compositeTableSecondaryJoinColumn: string;
  compositeTableQuery: Knex.QueryBuilder<TJoinRecord>;
  resultSchema: TResultSchema;
}) => {
  const ret = await options.compositeTableQuery
    .select(
      `${options.secondaryTableName}.*`,
      `${options.compositeTableName}.${options.compositeTablePrimaryJoinColumn}`
    )
    .whereIn(options.compositeTablePrimaryJoinColumn, options.whereInPrimaryIds)
    .whereNull(`${options.secondaryTableName}.deletedAt`)
    .join(
      options.secondaryTableName,
      `${options.compositeTableName}.${options.compositeTableSecondaryJoinColumn}`,
      "=",
      `${options.secondaryTableName}.id`
    );
  return options.resultSchema.array().parse(ret);
};

// Create one row
export const createOne = async <TRecord extends { id: string }>(
  query: Knex.QueryBuilder<TRecord>,
  data: TRecord extends Knex.CompositeTableType<unknown>
    ?
        | Knex.ResolveTableType<TRecord, "insert">
        | ReadonlyArray<Knex.ResolveTableType<TRecord, "insert">>
    : Knex.DbRecordArr<TRecord> | ReadonlyArray<Knex.DbRecordArr<TRecord>>
) => {
  const ret = await query.insert(data).returning("*");
  if (!ret.length) {
    throw new InternalServerError();
  }
  return ret[0];
};

// Update one row
export const updateOne = async <
  TRecord extends { id: string; deletedAt?: Date | null }
>(
  query: Knex.QueryBuilder<TRecord>,
  id: string,
  data: TRecord extends Knex.CompositeTableType<unknown>
    ? Knex.ResolveTableType<TRecord, "update">
    : Knex.DbRecordArr<TRecord>
) => {
  if (!Object.keys(data).length) {
    throw new EmptyUpdateError();
  }
  const ret = await query
    .where("id", id)
    .whereNull("deletedAt")
    .update(data)
    .returning("*");
  if (!ret.length) {
    throw new InvalidIdError();
  }
  return ret[0];
};

// Soft delete one row by setting "deletedAt" date column
export const softDeleteOne = async <
  TRecord extends { id: string; deletedAt?: Date | null }
>(
  query: Knex.QueryBuilder<TRecord>,
  id: string
) => {
  const ret = await query
    .where("id", id)
    .whereNull("deletedAt")
    .update("deletedAt", new Date())
    .returning("*");
  if (!ret.length) {
    throw new InvalidIdError();
  }
  return ret[0];
};

// Hard delete one row, deleting from table permanently
export const hardDeleteOne = async <TRecord extends { id: string }>(
  query: Knex.QueryBuilder<TRecord>,
  id: string
) => {
  const ret = await query.where("id", id).delete().returning("*");
  if (!ret.length) {
    throw new InvalidIdError();
  }
  return ret[0];
};

// Make api response
export const makeApiResponse = <T extends ZodTypeAny>(schema?: T) => {
  return z.object({
    code: z.string(),
    message: z.string().nullable(),
    data: schema ?? z.object({}),
  });
};

// Send 2xx successful response
export const sendSuccess = <T>(
  res: Response,
  data: T | null,
  options?: {
    code?: string;
    message?: string;
    status?: number;
  }
) => {
  // Ensure 2xx status code
  if (options?.status && (options.status < 200 || options.status > 299)) {
    throw new InternalServerError("Error response status code must be 2xx");
  }
  const apiRes: ApiResponse = {
    code: options?.code ?? "success",
    message: options?.message ?? "Successful operation",
    data: data || {},
  };
  res.status(options?.status ?? 200).send(apiRes);
};

// Send error responses
export const sendError = (
  res: Response,
  status: number,
  code: string,
  message?: string
) => {
  // Ensure not 2xx status code
  if (status >= 200 && status <= 299) {
    throw new InternalServerError("Error response status code must not be 2xx");
  }
  const apiRes: ApiResponse = {
    code,
    message: message ?? "Error has occurred",
    data: null,
  };
  res.status(status).send(apiRes);
};
