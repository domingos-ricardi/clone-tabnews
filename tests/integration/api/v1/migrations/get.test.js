import database from "infra/database.js";
import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await database.query("drop schema public cascade; create schema public;");
});

describe("GET to /api/v1/migrations", () => {
  const url = "http://localhost:3000/api/v1/migrations";

  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch(url);
      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBeGreaterThan(0);
    });
  });
});
