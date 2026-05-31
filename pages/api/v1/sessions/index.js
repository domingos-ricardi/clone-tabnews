import { createRouter } from "next-connect";
import controller from "infra/controller.js";
import authentication from "models/authentication.js";
import session from "models/session.js";
import authorization from "models/authorization";
import { ForbiddenError } from "infra/errors/api-errors";

const router = createRouter();
router.use(controller.injectAnonymousOrUser);
router.post(controller.canRequest("create:session"), postHandler);
router.delete(deleteHandler);

export default router.handler(controller.errorHandlers);

async function postHandler(request, response) {
  const userInput = request.body;
  const authUser = await authentication.getUser(
    userInput.email,
    userInput.password,
  );

  if (!authorization.can(authUser, "create:session")) {
    throw new ForbiddenError({
      message: "Você não possui permissão para realizar login.",
      action: "Contate o suporte para verificar este problema.",
    });
  }

  const newSession = await session.create(authUser.id);
  controller.setSessionCookie(response, newSession.token);

  const secureOutputValues = authorization.filterOutput(
    authUser,
    "read:session",
    newSession,
  );

  console.log("Sessão criada com sucesso:", secureOutputValues);

  return response.status(201).json(secureOutputValues);
}

async function deleteHandler(request, response) {
  const userTryingToDelete = request.context.user;
  const sessionToken = request.cookies.session_id;
  const sessionObject = await session.findOneValidByToken(sessionToken);
  const expireSession = await session.expireById(sessionObject.id);

  controller.clearSessionCookie(response);

  const secureOutputValues = authorization.filterOutput(
    userTryingToDelete,
    "read:session",
    expireSession,
  );

  return response.status(200).json(secureOutputValues);
}
