import orchestrator from "tests/orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
});

describe("POST to /api/v1/migrations", () => {
  const url = process.env.BASE_API_V1 + "/migrations";
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

  describe("Authenticated user without permissions", () => {
    test("For the first time", async () => {
      const privilegedUser = await orchestrator.createUser({});
      await orchestrator.activateUser(privilegedUser.id);
      await orchestrator.addFeaturesToUser(privilegedUser.id, ["create:migrations"]);
      const sessionObject = await orchestrator.createSession(privilegedUser.id);

      const response = await fetch(url, {
        method: method,
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      const responseBody = await response.json();

      expect(response.status).toBe(201);
      expect(Array.isArray(responseBody)).toBe(true);
      expect(responseBody.length).toBeGreaterThan(0);
    });
    
    // test("For the second time", async () => {
    //   const response1 = await fetch(url, {
    //     method: method,
    //   });
    //   const responseBody1 = await response1.json();

    //   expect(response1.status).toBe(200);
    //   expect(Array.isArray(responseBody1)).toBe(true);
    //   expect(responseBody1.length).toBe(0);
    // });
  });
});
