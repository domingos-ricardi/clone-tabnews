import orchestrator from "tests/orchestrator";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET to /api/v1/migrations", () => {
  const url = `${webserver.origin}/api/v1/migrations`;

  describe("Anonymous user", () => {
    test("Retrieving pending migrations", async () => {
      const response = await fetch(url);
      const responseBody = await response.json();

      expect(response.status).toBe(403);

      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para realizar esta ação.",
        action: "Verifique se seu usuário possui a feature necessária.",
        statusCode: 403,
      });
    });
  });

  describe("Default user", () => {
    test("Retrieving pending migrations", async () => {
      const defaultUser = await orchestrator.createUser({});
      await orchestrator.activateUser(defaultUser);
      const sessionObject = await orchestrator.createSession(defaultUser);

      const response = await fetch(url, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(403);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "ForbiddenError",
        message: "Você não possui permissão para realizar esta ação.",
        action: "Verifique se seu usuário possui a feature necessária.",
        statusCode: 403,
      });
    });
  });

  describe("Privileged user", () => {
    test("Retrieving pending migrations", async () => {
      const privilegedUser = await orchestrator.createUser({});
      await orchestrator.activateUser(privilegedUser);
      await orchestrator.addFeaturesToUser(privilegedUser, [
        "read:migrations",
      ]);
      const sessionObject = await orchestrator.createSession(privilegedUser);

      const response = await fetch(url, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      const responseBody = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(responseBody)).toBe(true);
    });
  });
});
