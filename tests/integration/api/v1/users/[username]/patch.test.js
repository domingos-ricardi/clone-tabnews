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
      const response = await fetch(url + "/inexistinguser",
        {
          method: "PATCH"
        }
      );
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
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
          email: "mail_user1@test.com.br",
          password: "senha@123",
        }),
      });

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user2",
          email: "mail_user2@test.com.br",
          password: "senha@321",
        }),
      });

      const response = await fetch(url + "/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1"
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
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email1",
          email: "email1@test.com.br",
          password: "senha@123",
        }),
      });

      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "email2",
          email: "email2@test.com.br",
          password: "senha@321",
        }),
      });

      const response = await fetch(url + "/email2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "email1@test.com.br"
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
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueUser1",
          email: "uniqueuser1@test.com.br",
          password: "senha@123",
        }),
      });

      const response = await fetch(url + "/uniqueUser1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueUser2"
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueUser2",
        email: "uniqueuser1@test.com.br",
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
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "uniqueEmail1",
          email: "uniqueEmail1@test.com.br",
          password: "senha@123",
        }),
      });

      const response = await fetch(url + "/uniqueEmail1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "uniqueEmail2@test.com.br"
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "uniqueEmail1",
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
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "newPass1",
          email: "newPass1@test.com.br",
          password: "newPass1",
        }),
      });

      const response = await fetch(url + "/newPass1", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: "newPass2"
        }),
      });

      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "newPass1",
        email: "newPass1@test.com.br",
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(responseBody.updated_at > responseBody.created_at).toBe(true);

      const userInDB = await user.findOneByUsername("newPass1");
      const passwordMatch = await criptography.compare(
        "newPass2",
        userInDB.password,
      );
      expect(passwordMatch).toBe(true);

      const passwordNotMatch = await criptography.compare(
        "newPass1",
        userInDB.password,
      );
      expect(passwordNotMatch).toBe(false);

    });
  });
});
