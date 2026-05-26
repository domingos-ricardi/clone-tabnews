import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import activation from "models/activation.js";
import authorization from "models/authorization";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.patch(controller.canRequest("read:activation_token"), patchHandler);

export default router.handler(controller.errorHandlers);

async function patchHandler(request, response) {
  const activationTokenId = request.query.token_id;
  const userTryingToActivate = request.context.user;

  const validActivationToken = await activation.findOneByValidId(activationTokenId);
  await activation.activateUser(validActivationToken.user_id);
  const usedActivationToken = await activation.markAsUsed(activationTokenId);

  const secureOutputValues = authorization.filterOutput(userTryingToActivate, "read:activation_token", usedActivationToken);

  return response.status(200).json(secureOutputValues);
}
