import { ConfigAdminController } from "../../../controllers/admin/config";
import { Routes } from "../../../data";

const routes = new Routes({
  createController: () => new ConfigAdminController(),
});
ConfigAdminController.useRoutes(routes);

export default routes.router;
