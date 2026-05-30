import { version as uuidVersion } from "uuid";
import activation from "models/activation";
import orchestrator from "tests/orchestrator";
import user from "models/user";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/activations/[token_id]", () => {
  const url = `${webserver.origin}/api/v1/activations`;

  describe("Anonymous user", () => {
    test("With non-existent token", async () => {
      const response = await fetch(
        url + "/254e4a46-5ee4-4fd7-881a-803df9839d52",
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Token de ativação não encontrado ou expirado.",
        action: "Faça um novo cadastro.",
        statusCode: 404,
      });
    });

    test("With expired token", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - activation.EXPIRATION_IN_MILISECONDS),
      });

      const createdUser = await orchestrator.createUser({});
      const expiredActivationToken = await activation.create(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(url + `/${expiredActivationToken.id}`, {
        method: "PATCH",
      });

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Token de ativação não encontrado ou expirado.",
        action: "Faça um novo cadastro.",
        statusCode: 404,
      });
    });

    test("With already used token", async () => {
      const createdUser = await orchestrator.createUser({});
      const activationToken = await activation.create(createdUser.id);

      const response = await fetch(url + `/${activationToken.id}`, {
        method: "PATCH",
      });
      expect(response.status).toBe(200);

      const secondResponse = await fetch(url + `/${activationToken.id}`, {
        method: "PATCH",
      });
      expect(secondResponse.status).toBe(404);

      const responseBody = await secondResponse.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Token de ativação não encontrado ou expirado.",
        action: "Faça um novo cadastro.",
        statusCode: 404,
      });
    });

    test("With valid token", async () => {
      const createdUser = await orchestrator.createUser({});
      const activationToken = await activation.create(createdUser.id);

      const response = await fetch(url + `/${activationToken.id}`, {
        method: "PATCH",
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: activationToken.id,
        used_at: responseBody.used_at,
        user_id: activationToken.user_id,
        expires_at: activationToken.expires_at.toISOString(),
        created_at: activationToken.created_at.toISOString(),
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(uuidVersion(responseBody.user_id)).toBe(4);

      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const expiresAt = new Date(responseBody.expires_at);
      const createdAt = new Date(responseBody.created_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(expiresAt - createdAt).toBe(activation.EXPIRATION_IN_MILISECONDS);

      const activatedUser = await user.findOneValidById(responseBody.user_id);
      expect(activatedUser.features).toEqual([
        "create:session",
        "read:session",
        "update:user",
      ]);
    });

    test("With valid token but already activated user", async () => {
      const createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser.id);
      const activationToken = await activation.create(createdUser.id);

      const response = await fetch(url + `/${activationToken.id}`, {
        method: "PATCH",
      });
      expect(response.status).toBe(403);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não pode utilizar este token de ativação.",
        action: "Entre em contato com o suporte.",
        statusCode: 403,
      });
    });
  });

  describe("Default user", () => {
    test("With valid token, but already logged in user", async () => {
      const user1 = await orchestrator.createUser({});
      await orchestrator.activateUser(user1.id);

      const user1SessionObject = await orchestrator.createSession(user1.id);

      const user2 = await orchestrator.createUser({});
      const user2ActivationToken = await activation.create(user2.id);

      const response = await fetch(url + `/${user2ActivationToken.id}`, {
        method: "PATCH",
        headers: {
          Cookie: `session_id=${user1SessionObject.token}`,
        },
      });
      expect(response.status).toBe(403);
      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para realizar esta ação.",
        action: "Verifique se seu usuário possui a feature necessária.",
        statusCode: 403,
      });
    });
  });
});
