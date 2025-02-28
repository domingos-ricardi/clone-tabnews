import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import migrator from "models/migrator.js";

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const pendingMigrations = await migrator.listPendingMigrations();
  return response.status(200).json(pendingMigrations);
}

async function postHandler(request, response) {
  let statusCode = 200;
  const pendingMigrations = await migrator.runPendingMigrations();
  if (pendingMigrations.length > 0) statusCode = 201;

  return response.status(statusCode).json(pendingMigrations);
}
