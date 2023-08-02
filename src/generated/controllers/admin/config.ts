import { z } from "zod";

import { Controller, Routes } from "../../../data/api";
import { zConfig, Config } from "../../../data/db";
import {
  zGetManyOptions,
  getMany,
  createOne,
  updateOne,
  InvalidIdError,
} from "../../../helpers/api";

export class GeneratedConfigAdminController extends Controller {
  static expanded = zConfig.extend({});

  static options = {
    createOne: zConfig.pick({
      key: true,
      value: true,
    }),
    getMany: zGetManyOptions.extend({
      sortColumn: zConfig.keyof().optional(),
      expand: z.enum([""]).array().optional(),
    }),

    updateOne: zConfig
      .pick({
        value: true,
      })
      .partial(),
  };

  createOne = async (
    options: z.infer<typeof GeneratedConfigAdminController.options.createOne>,
  ) => {
    const { ...data } = options;
    const ret = await createOne<Config>(this.db.config(), data);

    return ret;
  };

  getOne = async (id: string) => {
    const { data } = await this.getMany({
      ids: [id],
      expand: [],
    });
    if (!data.length) {
      throw new InvalidIdError();
    }
    return data[0];
  };

  getMany = async (
    options?: z.infer<typeof GeneratedConfigAdminController.options.getMany>,
  ) => {
    const results = await getMany(this.db.config(), options, {});
    const data = GeneratedConfigAdminController.expanded
      .array()
      .parse(results.data);

    return { data, count: results.count };
  };

  updateOne = async (
    id: string,
    options: z.infer<typeof GeneratedConfigAdminController.options.updateOne>,
  ) => {
    const { ...data } = options;
    const ret = await updateOne<Config>(this.db.config(), id, data);

    return ret;
  };

  static useRoutes = (
    routes: Routes<GeneratedConfigAdminController>,
  ): Routes<GeneratedConfigAdminController> => {
    routes.post("/v1/admin/configs", "Create config", {
      tags: ["Admin"],
      req: z.object({
        body: GeneratedConfigAdminController.options.createOne,
      }),
      resSuccessBody: z.object({
        id: z.string(),
      }),
      handler: async ({ ctl, body }) => {
        const { id } = await ctl.createOne(body);
        return { id };
      },
    });
    routes.get("/v1/admin/configs/{id}", "Get config", {
      tags: ["Admin"],
      req: z.object({
        params: z.object({
          id: z.string(),
        }),
      }),
      resSuccessBody: z.object({
        data: GeneratedConfigAdminController.expanded,
      }),
      handler: async ({ ctl, params }) => {
        const data = await ctl.getOne(params.id);
        return { data };
      },
    });
    routes.get("/v1/admin/configs", "Get configs", {
      tags: ["Admin"],
      req: z.object({
        query: GeneratedConfigAdminController.options.getMany,
      }),
      resSuccessBody: z.object({
        data: zConfig.array(),
        count: z.number(),
      }),
      handler: async ({ ctl, query }) => {
        const { data, count } = await ctl.getMany(query);
        return { data, count };
      },
    });
    routes.patch("/v1/admin/configs/{id}", "Update config", {
      tags: ["Admin"],
      req: z.object({
        body: GeneratedConfigAdminController.options.updateOne,
        params: z.object({
          id: z.string(),
        }),
      }),
      resSuccessBody: z.object({}),
      handler: async ({ ctl, params, body }) => {
        await ctl.updateOne(params.id, body);
      },
    });

    return routes;
  };
}
