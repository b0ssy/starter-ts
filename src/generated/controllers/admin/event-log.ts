import { z } from "zod";

import { Controller, Routes } from "../../../data/api";
import { zEventLog, EventLog } from "../../../data/db";
import { zGetManyOptions, getMany, createOne } from "../../../helpers/api";

export class GeneratedEventLogAdminController extends Controller {
  static expanded = zEventLog.extend({});

  static options = {
    createOne: zEventLog.pick({
      type: true,
      dataId: true,
      sessionUserId: true,
      data: true,
    }),
    getMany: zGetManyOptions.extend({
      sortColumn: zEventLog.keyof().optional(),
      expand: z.enum([""]).array().optional(),
    }),
  };

  createOne = async (
    options: z.infer<typeof GeneratedEventLogAdminController.options.createOne>,
  ) => {
    const { ...data } = options;
    const ret = await createOne<EventLog>(this.db.eventLog(), data);

    return ret;
  };

  getMany = async (
    options?: z.infer<typeof GeneratedEventLogAdminController.options.getMany>,
  ) => {
    const results = await getMany(this.db.eventLog(), options, {});
    const data = GeneratedEventLogAdminController.expanded
      .array()
      .parse(results.data);

    return { data, count: results.count };
  };

  static useRoutes = (
    routes: Routes<GeneratedEventLogAdminController>,
  ): Routes<GeneratedEventLogAdminController> => {
    routes.post("/v1/admin/event_logs", "Create event log", {
      tags: ["Admin"],
      req: z.object({
        body: GeneratedEventLogAdminController.options.createOne,
      }),
      resSuccessBody: z.object({
        id: z.string(),
      }),
      handler: async ({ ctl, body }) => {
        const { id } = await ctl.createOne(body);
        return { id };
      },
    });

    routes.get("/v1/admin/event_logs", "Get event logs", {
      tags: ["Admin"],
      req: z.object({
        query: GeneratedEventLogAdminController.options.getMany,
      }),
      resSuccessBody: z.object({
        data: zEventLog.array(),
        count: z.number(),
      }),
      handler: async ({ ctl, query }) => {
        const { data, count } = await ctl.getMany(query);
        return { data, count };
      },
    });

    return routes;
  };
}
