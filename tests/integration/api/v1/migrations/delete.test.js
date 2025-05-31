describe("DELETE to /api/v1/migrations", () => {
  const url = process.env.BASE_API_V1 +  "/migrations";
  const method = "DELETE";

  describe("Anonymous user", () => {
    test("Running pending migrations", async () => {
      const response = await fetch(url, {
        method: method,
      });
      expect(response.status).toBe(405);
    });
  });
});
