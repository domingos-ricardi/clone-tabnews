import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("GET to /api/v1/migrations", () => {
  const url = process.env.BASE_API_V1 + "/migrations";

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
