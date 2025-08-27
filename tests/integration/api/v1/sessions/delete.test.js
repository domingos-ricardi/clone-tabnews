import { version as uuidVersion } from "uuid";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";
const { default: orchestrator } = require("tests/orchestrator");

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("DELETE /api/v1/sessions", () => {
  const url = process.env.BASE_API_V1 + "/sessions";

  describe("Default user", () => {
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({});

      const sessionObject = await orchestrator.createSession(createdUser.id);
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: responseBody.id,
        token: responseBody.token,
        user_id: createdUser.id,
        expires_at: responseBody.expires_at,
        created_at: responseBody.created_at,
        updated_at: responseBody.updated_at,
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();
      expect(Date.parse(responseBody.expires_at)).not.toBeNaN();


      expect(responseBody.expires_at < sessionObject.expires_at.toISOString()).toBe(
        true,
      );
      expect(responseBody.updated_at > sessionObject.updated_at.toISOString()).toBe(
        true,
      );

      //Set-cookie header assertions
      const parsedCookies = setCookieParser(response, {
        map: true,
      });

      expect(parsedCookies.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });

      const doubleCheckResponse = await fetch(process.env.BASE_API_V1 + "/users", {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });

      expect(doubleCheckResponse.status).toBe(401);

      const doubleCheckResponseBody = await doubleCheckResponse.json();
      expect(doubleCheckResponseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        statusCode: 401,
      });
    });

    test("With nonexsitent session", async () => {
      const nonexsitentToken =
        "025daf71ba34be31746d83d2b022dcf91e309114044ebd35420d97a6833e32aa71ffb7427b43644d3995b7734e554ffd";

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${nonexsitentToken}`,
        },
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        statusCode: 401,
      });
    });

    test("With exipired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILISECONDS),
      });
      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });
      const sessionObject = await orchestrator.createSession(createdUser.id);

      jest.useRealTimers();

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(401);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se os dados enviados estão corretos.",
        statusCode: 401,
      });
    });
  });
});
