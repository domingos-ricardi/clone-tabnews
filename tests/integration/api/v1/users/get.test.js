import { version as uuidVersion } from "uuid";
import session from "models/session.js";
import setCookieParser from "set-cookie-parser";
import webserver from "infra/webserver";
const { default: orchestrator } = require("tests/orchestrator");

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("GET /api/v1/users", () => {
  const url = `${webserver.origin}/api/v1/users`;

  describe("Default user", () => {
    test("With valid session", async () => {
      const createdUser = await orchestrator.createUser({
        username: "UserWithValidSession",
        features: ["read:activation_token"],
      });
      const activatedUser = await orchestrator.activateUser(createdUser);

      const sessionObject = await orchestrator.createSession(createdUser);
      const response = await fetch(url, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const cacheControl = response.headers.get("Cache-Control");
      expect(cacheControl).toBe(
        "no-store, no-cache, max-age=0, must-revalidate",
      );

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithValidSession",
        email: createdUser.email,
        features: ["create:session", "read:session", "update:user"],
        created_at: createdUser.created_at.toISOString(),
        updated_at: activatedUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      //Session renew assertions
      const renewSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );
      expect(renewSessionObject.expires_at > sessionObject.expires_at).toBe(
        true,
      );
      expect(renewSessionObject.updated_at > sessionObject.updated_at).toBe(
        true,
      );

      //Set-cookie header assertions
      const parsedCookies = setCookieParser(response, {
        map: true,
      });

      expect(parsedCookies.session_id).toEqual({
        name: "session_id",
        value: renewSessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      });
    });

    test("With nonexsitent session", async () => {
      const nonexsitentToken =
        "025daf71ba34be31746d83d2b022dcf91e309114044ebd35420d97a6833e32aa71ffb7427b43644d3995b7734e554ffd";

      const response = await fetch(url, {
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

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });
    });

    test("With exipired session", async () => {
      jest.useFakeTimers({
        now: new Date(Date.now() - session.EXPIRATION_IN_MILLISECONDS),
      });
      const createdUser = await orchestrator.createUser({
        username: "UserWithExpiredSession",
      });
      const sessionObject = await orchestrator.createSession(createdUser);

      jest.useRealTimers();

      const response = await fetch(url, {
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

      // Set-Cookie assertions
      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: "invalid",
        maxAge: -1,
        path: "/",
        httpOnly: true,
      });
    });

    test("With almost expires session", async () => {
      jest.useFakeTimers({
        now: new Date(
          Date.now() - (session.EXPIRATION_IN_MILLISECONDS - 10000),
        ), // 10 seconds before expiration
      });

      const createdUser = await orchestrator.createUser({
        username: "UserWithAlmostExpiredSession",
        features: ["read:activation_token"],
      });

      const activatedUser = await orchestrator.activateUser(createdUser);

      const sessionObject = await orchestrator.createSession(createdUser);
      jest.useRealTimers();

      const response = await fetch(url, {
        headers: {
          Cookie: `session_id=${sessionObject.token}`,
        },
      });
      expect(response.status).toBe(200);

      const responseBody = await response.json();
      expect(responseBody).toEqual({
        id: createdUser.id,
        username: "UserWithAlmostExpiredSession",
        email: createdUser.email,
        features: ["create:session", "read:session", "update:user"],
        created_at: createdUser.created_at.toISOString(),
        updated_at: activatedUser.updated_at.toISOString(),
      });

      expect(uuidVersion(responseBody.id)).toBe(4);
      expect(Date.parse(responseBody.created_at)).not.toBeNaN();
      expect(Date.parse(responseBody.updated_at)).not.toBeNaN();

      //Session renew assertions
      const renewSessionObject = await session.findOneValidByToken(
        sessionObject.token,
      );
      expect(renewSessionObject.expires_at > sessionObject.expires_at).toBe(
        true,
      );
      expect(renewSessionObject.updated_at > sessionObject.updated_at).toBe(
        true,
      );

      //Set-cookie header assertions
      const parsedCookies = setCookieParser(response, {
        map: true,
      });

      expect(parsedCookies.session_id).toEqual({
        name: "session_id",
        value: renewSessionObject.token,
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
      });
    });
  });
});
