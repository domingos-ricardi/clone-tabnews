import authorization from "models/authorization.js";
import { InternalServerError } from "infra/errors/api-errors.js";

describe("models/authorization", () => {
  describe(".can()", () => {
    test("Without `user`", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });

    test("Without `features`", () => {
      const crestedUser = {
        username: "UserWithoutFeatures",
      };

      expect(() => {
        authorization.can(crestedUser);
      }).toThrow(InternalServerError);
    });

    test("Without unknown `features`", () => {
      const crestedUser = {
        features: [],
      };

      expect(() => {
        authorization.can(crestedUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    test("With valide `user` and known `features`", () => {
      const crestedUser = {
        features: ["create:user"],
      };

      expect(authorization.can(crestedUser, "create:user")).toBe(true);
    });
  });

  describe(".filterOutput()", () => {
    test("Without `user`", () => {
      expect(() => {
        authorization.can();
      }).toThrow(InternalServerError);
    });

    test("Without `features`", () => {
      const crestedUser = {
        username: "UserWithoutFeatures",
      };

      expect(() => {
        authorization.can(crestedUser);
      }).toThrow(InternalServerError);
    });

    test("Without unknown `features`", () => {
      const crestedUser = {
        features: [],
      };

      expect(() => {
        authorization.can(crestedUser, "unknown:feature");
      }).toThrow(InternalServerError);
    });

    test("Without valide `user`, known `features` but no `resource`", () => {
      const crestedUser = {
        features: ["read:user"],
      };

      expect(() => {
        authorization.filterOutput(crestedUser, "read:user");
      }).toThrow(InternalServerError);
    });

    test("With valide `user`, known `features` and `resource`", () => {
      const crestedUser = {
        features: ["read:user"],
      };

      const resource = {
        id: 1,
        username: "resourceUser",
        features: ["read:user"],
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        email: "resource@resource.com",
        password: "hashed_password",
      };

      const result = authorization.filterOutput(
        crestedUser,
        "read:user",
        resource,
      );

      expect(result).toEqual({
        id: resource.id,
        username: resource.username,
        features: resource.features,
        created_at: resource.created_at,
        updated_at: resource.updated_at,
      });
    });
  });
});
