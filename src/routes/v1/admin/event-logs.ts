import moment from "moment";
import { z } from "zod";

import { Routes } from "../../../data";
import { EventLogAdminController } from "../../../controllers/admin/event-log";

const routes = new Routes({
  createController: () => new EventLogAdminController(),
});
EventLogAdminController.useRoutes(routes);
routes.get("/v1/admin/event_logs/stats", "Get event logs statistics", {
  tags: ["Admin"],
  req: z.object({
    query: EventLogAdminController.options.getStats
      .pick({ interval: true })
      .extend({
        from: z.string().optional().openapi({ format: "date-time" }),
        to: z.string().optional().openapi({ format: "date-time" }),
        offset: z.coerce.number().optional(),
      }),
  }),
  resSuccessBody: z.object({
    data: EventLogAdminController.options.getStatsData.array(),
    count: z.number(),
  }),
  handler: async ({ ctl, query }) => {
    const data = await ctl.getStats({
      from: query.from ? moment(query.from).toDate() : undefined,
      to: query.to ? moment(query.to).toDate() : undefined,
      interval: query.interval,
      offset: query.offset,
    });
    return { data, count: data.length };
  },
});

export default routes.router;
