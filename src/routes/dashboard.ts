import express from "express";
import Router from "express-promise-router";

import { ENV } from "../config";

const router = Router();

// Serve dashboard
router.use("/", express.static(ENV.DASHBOARD_BUILD_DIR));

export default router;
