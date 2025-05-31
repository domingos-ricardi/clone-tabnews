import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";
import user from "models/user.js";
import criptography from "models/criptography.js";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH to /api/v1/users/[username]", () => {
  const url = process.env.BASE_API_V1 + "/users";

  describe("Anonymous user", () => {
    test("With nonexist 'username'", async () => {
      const response = await fetch(url + "/inexistinguser", {
        method: "PATCH",
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

    test("Duplicated 'username'", async () => {
      const user1 = await orchestrator.createUser({});
      const user2 = await orchestrator.createUser({});

      const response = await fetch(url + `/${user2.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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

    test("Duplicated 'email'", async () => {
      const user1 = await orchestrator.createUser({});
      const user2 = await orchestrator.createUser({});

      const response = await fetch(url + `/${user2.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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

    test("With unique 'username'", async () => {
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

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        email: userCreated.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With unique 'email'", async () => {
      const user = await orchestrator.createUser({});

      const response = await fetch(url + `/${user.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "uniqueEmail2@test.com.br",
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: user.username,
        email: "uniqueEmail2@test.com.br",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);
    });

    test("With new 'password'", async () => {
      const userCreated = await orchestrator.createUser({
        password: "senha@123",
      });

      const response = await fetch(url + `/${userCreated.username}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
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
        email: userCreated.email,
        password: responseBody.password,
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
  });
});
