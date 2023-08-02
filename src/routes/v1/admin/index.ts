import Router from "express-promise-router";

import configs from "./configs";
import eventLogs from "./event-logs";
import { authorize } from "../../../data/session";

const router = Router();

// Must have "admin" role to access /v1/admin routes
router.use("/v1/admin/*", authorize({ roleNames: ["admin"] }));

router.use(configs);
router.use(eventLogs);

export default router;
