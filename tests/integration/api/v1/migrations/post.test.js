import orchestrator from "tests/orchestrator";
import webserver from "infra/webserver";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST to /api/v1/migrations", () => {
  const url = `${webserver.origin}/api/v1/migrations`;
  const method = "POST";

  describe("Anonymous user", () => {
    test("Running pending migrations", async () => {
      const response = await fetch(url, {
        method: method,
      });
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
    test("Running pending migrations", async () => {
      const defaultUser = await orchestrator.createUser({});
      await orchestrator.activateUser(defaultUser.id);
      const sessionObject = await orchestrator.createSession(defaultUser.id);

      const response = await fetch(url, {
        method: method,
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
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

  // eslint-disable-next-line jest/no-commented-out-tests
  // describe("Privileged user", () => {
  //   test("For the first time", async () => {
  //     const privilegedUser = await orchestrator.createUser({});
  //     await orchestrator.activateUser(privilegedUser.id);
  //     await orchestrator.addFeaturesToUser(privilegedUser.id, [
  //       "create:migrations",
  //     ]);
  //     const sessionObject = await orchestrator.createSession(privilegedUser.id);

  //     const response = await fetch(url, {
  //       method: method,
  //       headers: {
  //         Cookie: `session_id=${sessionObject.token}`,
  //       },
  //     });
  //     const responseBody = await response.json();

  //     expect(response.status).toBe(200);
  //     expect(Array.isArray(responseBody)).toBe(true);
  //   });
  // });
});
