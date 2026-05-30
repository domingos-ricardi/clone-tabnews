import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import migrator from "models/migrator.js";
import authorization from "models/authorization";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:migrations"), postHandler);
router.get(controller.canRequest("read:migrations"), getHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const userTryingToGet = request.context.user;
  const pendingMigrations = await migrator.listPendingMigrations();

  const secureOutputValues = authorization.filterOutput(
    userTryingToGet,
    "read:migrations",
    pendingMigrations,
  );

  return response.status(200).json(secureOutputValues);
}

async function postHandler(request, response) {
  let statusCode = 200;
  const userTryingToPost = request.context.user;
  const pendingMigrations = await migrator.runPendingMigrations();
  if (pendingMigrations.length > 0) statusCode = 201;

  const secureOutputValues = authorization.filterOutput(
    userTryingToPost,
    "read:migrations",
    pendingMigrations,
  );
  return response.status(statusCode).json(secureOutputValues);
}
