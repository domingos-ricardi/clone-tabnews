describe("PUT to /api/v1/migrations", () => {
  const url = "http://localhost:3000/api/v1/migrations";
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
