import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import user from "models/user.js";
import criptography from "models/criptography.js";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH to /api/v1/users/[username]", () => {
  const url = `${webserver.origin}/api/v1/users`;

  describe("Anonymous user", () => {
    test("With unique `username`", async () => {
      const userCreated = await orchestrator.createUser({});

      const response = await fetch(url + `/${userCreated.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueUser2",
        }),
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Verifique se seu usuário possui a feature necessária.",
        message: "Você não possui permissão para realizar esta ação.",
        name: "ForbiddenError",
        statusCode: 403,
      });
    });
  });

  describe("Default user", () => {
    test("With nonexistent `username`", async () => {
      const createdUser = await orchestrator.createUser({});
      await orchestrator.activateUser(createdUser);
      const sessionObject = await orchestrator.createSession(createdUser);

      const response = await fetch(url + "/inexistinguser", {
        method: "PATCH",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Não foi possível encontrar o usuário.",
        action: "Verifique os dados informados e tente novamente.",
        statusCode: 404,
      });
    });

    test("Duplicated `username`", async () => {
      const user1 = await orchestrator.createUser({});
      const user2 = await orchestrator.createUser({});

      await orchestrator.activateUser(user1);
      await orchestrator.activateUser(user2);
      const sessionObject = await orchestrator.createSession(user2);

      const response = await fetch(url + `/${user2.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          username: user1.username,
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Não foi possível registrar dados do usuário.",
        action: "Verifique os dados informados e tente novamente.",
        statusCode: 400,
      });
    });

    test("Duplicated `email`", async () => {
      const user1 = await orchestrator.createUser({});
      const user2 = await orchestrator.createUser({});

      await orchestrator.activateUser(user1);
      await orchestrator.activateUser(user2);
      const sessionObject = await orchestrator.createSession(user2);

      const response = await fetch(url + `/${user2.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          email: user1.email,
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Não foi possível registrar dados do usuário.",
        action: "Verifique os dados informados e tente novamente.",
        statusCode: 400,
      });
    });

    test("With unique `username`", async () => {
      const userCreated = await orchestrator.createUser({});
      await orchestrator.activateUser(userCreated);
      const sessionObject = await orchestrator.createSession(userCreated);

      const response = await fetch(url + `/${userCreated.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          username: "uniqueUser2",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique `email`", async () => {
      const userCreated = await orchestrator.createUser({});
      await orchestrator.activateUser(userCreated);
      const sessionObject = await orchestrator.createSession(userCreated);

      const response = await fetch(url + `/${userCreated.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          email: "uniqueEmail2@test.com.br",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: userCreated.username,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(userCreated.username);
      expect(userInDatabase.email).toBe("uniqueEmail2@test.com.br");
    });

    test("With new `password`", async () => {
      const userCreated = await orchestrator.createUser({
        password: "senha@123",
      });
      await orchestrator.activateUser(userCreated);
      const sessionObject = await orchestrator.createSession(userCreated);

      const response = await fetch(url + `/${userCreated.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          password: "newPass@123",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: userCreated.username,
        features: ["create:session", "read:session", "update:user"],
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDB = await user.findOneByUsername(userCreated.username);
      const passwordMatch = await criptography.compare(
        "newPass@123",
        userInDB.password,
      );
      expect(passwordMatch).toBe(true);

      const passwordNotMatch = await criptography.compare(
        "senha@123",
        userInDB.password,
      );
      expect(passwordNotMatch).toBe(false);
    });

    test("With `user2` targeting `user1`", async () => {
      const user1 = await orchestrator.createUser({});
      const user2 = await orchestrator.createUser({});

      await orchestrator.activateUser(user1);
      await orchestrator.activateUser(user2);
      const sessionObject = await orchestrator.createSession(user2);

      const response = await fetch(url + `/${user1.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          username: "User1NewUsername",
        }),
      });

      expect(response.status).toBe(403);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        action: "Verifique se seu usuário possui a feature necessária.",
        message: "Você não possui permissão para realizar esta ação.",
        name: "ForbiddenError",
        statusCode: 403,
      });
    });
  });

  describe("Privileged user", () => {
    test("With `update:user:others` targeting `defaultUser`", async () => {
      const defaultUser = await orchestrator.createUser({});
      const privilegedUser = await orchestrator.createUser({});

      const defaultUserActivated = await orchestrator.activateUser(defaultUser);
      await orchestrator.activateUser(privilegedUser);

      await orchestrator.addFeaturesToUser(privilegedUser, [
        "update:user:others",
      ]);
      const sessionObject = await orchestrator.createSession(privilegedUser);

      const response = await fetch(url + `/${defaultUser.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Cookie: `session_id=${sessionObject.token}`,
        },
        body: JSON.stringify({
          username: "User1NewUsername",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: defaultUserActivated.id,
        username: "User1NewUsername",
        features: defaultUserActivated.features,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(defaultUserActivated.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });
  });
});
