import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe("GET to /api/v1/status", () => {
  const url = "http://localhost:3000/api/v1/status";

  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch(url);

      const responseBody = await response.json();
      const parseAt = new Date(responseBody.update_at).toISOString();

      expect(response.status).toBe(200);
      expect(responseBody.update_at).toEqual(parseAt);

      expect(responseBody.dependencies.database).toBeDefined();
      expect(responseBody.dependencies.database.version).toEqual("16.0");
      expect(responseBody.dependencies.database.max_connections).toEqual(100);
      expect(responseBody.dependencies.database.opened_connections).toEqual(1);
    });
  });
});

describe("POST to /api/v1/status", () => {
  const url = "http://localhost:3000/api/v1/status";
  const method = "POST";

  describe("Anonymous user", () => {
    test("Retrieving current system status", async () => {
      const response = await fetch(url, {
        method: method,
      });

      expect(response.status).toEqual(405);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para este endpoint",
        action: "Verifique se o método HTTP enviado é válido para este endpoit",
        statusCode: 405,
      });
    });
  });
});

// eslint-disable-next-line jest/no-commented-out-tests
// test.only("SQL Injectio test", async () => {
//   await fetch(
//     "http://localhost:3000/api/v1/status?dbname='; SELECT pg_sleep(4);; --",
//   );
// });
