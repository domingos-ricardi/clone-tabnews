import { version as uuidVersion } from "uuid";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/users/[username]", () => {
  const url = process.env.BASE_API_V1 + "/users";

  describe("Anonymous user", () => {
    test("With exact case match", async () => {
      const userCreated = await orchestrator.createUser({
        username: "SameCase",
      });

      const response = await fetch(url + "/SameCase");
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "SameCase",
        email: userCreated.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With case mismatch", async () => {
      const userCreated = await orchestrator.createUser({
        username: "DiffCase",
      });

      const response = await fetch(url + "/diffcase");
      expect(response.status).toBe(200);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        id: responseBody.id,
        username: "DiffCase",
        email: userCreated.email,
        password: responseBody.password,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
    });

    test("With nonexist username", async () => {
      const response = await fetch(url + "/inexistinguser");
      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "Não foi possível encontrar o usuário.",
        action: "Verifique os dados informados e tente novamente.",
        statusCode: 404,
      });
    });
  });
});
