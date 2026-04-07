import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import authorization from "models/authorization";
import { ForbiddenError } from "infra/errors/api-errors";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.get(getHandler);
router.patch(controller.canRequest("update:user"), patchHandler);

export default router.handler(controller.errorHandlers);

async function getHandler(request, response) {
  const username = request.query.username;
  const founded = await user.findOneByUsername(username);
  return response.status(200).json(founded);
}

async function patchHandler(request, response) {
  const username = request.query.username;
  const userInputValues = request.body;

  const userToUpdate = await user.findOneByUsername(username);
  const userRequesting = request.context.user;

  if (!authorization.can(userRequesting, "update:user", userToUpdate)) {
    throw new ForbiddenError({
      message: "Você não possui permissão para realizar esta ação.",
      action: "Verifique se seu usuário possui a feature necessária.",
    })
  }

  const updated = await user.update(username, userInputValues);
  return response.status(200).json(updated);
}
