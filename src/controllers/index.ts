import { ConfigAdminController } from "./admin/config";
import { EventLogAdminController } from "./admin/event-log";
import { Controller } from "../data/api";

export class Controllers extends Controller {
  admin = {
    config: () => new ConfigAdminController({ ctl: this }),
    eventLog: () => new EventLogAdminController({ ctl: this }),
  };
}

export const ctl = new Controllers();
