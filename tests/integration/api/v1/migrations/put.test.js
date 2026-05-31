import webserver from "infra/webserver";

describe("PUT to /api/v1/migrations", () => {
  const url = `${webserver.origin}/api/v1/migrations`;
  const method = "PUT";

  describe("Anonymous user", () => {
    test("Running pending migrations", async () => {
      const response = await fetch(url, {
        method: method,
      });
      expect(response.status).toBe(405);
    });
  });
});
