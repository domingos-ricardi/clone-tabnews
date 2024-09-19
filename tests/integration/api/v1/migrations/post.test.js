import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("POST to /api/v1/migrations", () => {
  const url = "http://localhost:3000/api/v1/migrations";
  const method = "POST";

  describe("Anonymous user", () => {
    describe("Running pending migrations", () => {
      test("For the first time", async () => {
        const response = await fetch(url, {
          method: method,
        });
        const responseBody = await response.json();

        expect(response.status).toBe(201);
        expect(Array.isArray(responseBody)).toBe(true);
        expect(responseBody.length).toBeGreaterThan(0);
      });
      test("For the second time", async () => {
        const response1 = await fetch(url, {
          method: method,
        });
        const responseBody1 = await response1.json();

        expect(response1.status).toBe(200);
        expect(Array.isArray(responseBody1)).toBe(true);
        expect(responseBody1.length).toBe(0);
      });
    });
  });
});
