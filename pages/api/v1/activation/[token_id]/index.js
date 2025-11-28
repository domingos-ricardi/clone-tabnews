import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import activation from "models/activation.js";

const router = createRouter();
router.patch(pacthHandler);

export default router.handler(controller.errorHandlers);

async function pacthHandler(request, response) {
  const activationTokenId = request.query.token_id;
  const usedActivationToken = await activation.markAsUsed(activationTokenId);
  await activation.activateUser(usedActivationToken.user_id);

  return response.status(200).json(usedActivationToken);
}
