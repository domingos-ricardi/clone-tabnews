import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import user from "models/user.js";
import session from "models/session";

const router = createRouter();
router.post(postHandler);
router.get(getHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInput = request.body;
  const newUser = await user.create(userInput);

  return response.status(201).json(newUser);
}

async function getHandler(request, response) {
  const sessionToken = request.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(sessionToken);
  const renewedSession = await session.renew(sessionObject.id);
  controller.setSessionCookie(response, renewedSession.token);
  const userObject = await user.findOneValidById(sessionObject.user_id);

  return response.status(200).json(userObject);
}
