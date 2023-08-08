import { z } from "zod";

import { zEventLog } from "../../data/db";
import { GeneratedEventLogAdminController } from "../../generated/controllers/admin/event-log";

export class EventLogAdminController extends GeneratedEventLogAdminController {
  static options = {
    ...GeneratedEventLogAdminController.options,
    getStats: z.object({
      from: z.date().optional(),
      to: z.date().optional(),
      interval: z.enum(["day"]).optional(),
      offset: z.number().optional(), // timezone offset in mins
    }),
    getStatsData: zEventLog
      .pick({
        createdAt: true,
        type: true,
      })
      .extend({
        count: z.number(),
      }),
  };

  getStats = async (
    options: z.infer<typeof EventLogAdminController.options.getStats>,
  ) => {
    const interval = options.interval ?? "day";
    const offset = Math.floor(options.offset ?? 0);

    // Create sub query to adjust date to timezone offset and truncate to interval
    const subQuery = this.db
      .eventLog()
      .select(
        this.db.knex.raw(
          '*, date_trunc(?, "createdAt" + interval \'1 minute\' * ?) AS "createdAtAdjusted"',
          [interval, offset],
        ),
      )
      .as("event_log");
    if (options.from) {
      subQuery.where("createdAt", ">=", options.from);
    }
    if (options.to) {
      subQuery.where("createdAt", "<=", options.to);
    }

    // Get count for each date interval group
    return (
      await this.db.knex
        .select<
          (Exclude<
            z.infer<typeof EventLogAdminController.options.getStatsData>,
            "count"
          > & {
            count: string;
          })[]
        >(
          this.db.knex.raw(
            '"createdAtAdjusted" + interval \'1 minute\' * ? AS "createdAt", type, COUNT(id) as count',
            [-offset],
          ),
        )
        .from(subQuery)
        .groupBy("createdAtAdjusted", "type")
        .orderBy("createdAtAdjusted", "asc")
    ).map((stats) => ({
      ...stats,
      count: parseInt(stats.count, 10),
    }));
  };
}
