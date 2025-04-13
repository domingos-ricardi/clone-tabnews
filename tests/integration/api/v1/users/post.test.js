import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST to /api/v1/users", () => {
  const url = "http://localhost:3000/api/v1/users";
  const method = "POST";

  describe("Anonymous user", () => {
    test("With unique and valid data", async () => {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "doma",
          email: "doma@ludo.com.br",
          password: "senha@123",
        }),
      });
      expect(response.status).toBe(201);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "doma",
        email: "doma@ludo.com.br",
        password: "senha@123",
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("Duplicated email", async () => {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado",
          email: "Doma@LUDO.com.br",
          password: "senha@123",
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

    test("Duplicated username", async () => {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "doma",
          email: "mail@test.com.br",
          password: "senha@123",
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

    test("With unique and invalid data", async () => {
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "",
          email: "mail@test.com.br",
          password: "senha@123",
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
  });
});
