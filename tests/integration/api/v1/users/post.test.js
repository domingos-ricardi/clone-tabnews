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
  });
});
