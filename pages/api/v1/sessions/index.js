import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";

const router = createRouter();
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInput = request.body;
  const authUser = await authentication.validateAndReturn(
    userInput.email,
    userInput.password,
  );

  return response.status(201).json({});
}
