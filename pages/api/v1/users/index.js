import { createRouter } from "next-connect";
//import database from "infra/database.js";
import controller from "infra/controller.js";
import user from "models/user.js";

const router = createRouter();
router.post(postHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInput = request.body;
  const newUser = await user.create(userInput);

  return response.status(201).json(newUser);
}
