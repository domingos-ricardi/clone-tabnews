import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";

const router = createRouter();
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInput = request.body;
  const authUser = await authentication.validateAndReturn(
    userInput.email,
    userInput.password,
  );

  const newSession = await session.create(authUser.id);
  return response.status(201).json(newSession);
}
