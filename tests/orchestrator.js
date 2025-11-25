import database from "infra/database.js";
import retry from "async-retry";
import { faker } from "@faker-js/faker";
import migrator from "models/migrator.js";
import user from "models/user.js";
import session from "models/session.js";

const urlMailHttp = `http://${process.env.EMAIL_HTTP_HOST}:${process.env.EMAIL_HTTP_PORT}`;

async function waitForAllServices() {
  await waitForWebServer();
  await waitForEmailServer();

  async function waitForWebServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch(process.env.BASE_API_V1 + "/status");

      if (response.status !== 200)
        throw new Error("HTTP Error: ${response.status }");
    }
  }

  async function waitForEmailServer() {
    return retry(fetchStatusPage, {
      retries: 100,
      maxTimeout: 1000,
    });

    async function fetchStatusPage() {
      const response = await fetch(urlMailHttp);

      if (response.status !== 200)
        throw new Error("HTTP Error: ${response.status }");
    }
  }
}

async function clearDatabase() {
  await database.query("drop schema public cascade; create schema public;");
}

async function runPendingMigrations() {
  await migrator.runPendingMigrations();
}

async function createUser(userObject) {
  return await user.create({
    username:
      userObject.username || faker.internet.username().replace(/[_.-]/g, ""),
    email: userObject.email || faker.internet.email(),
    password: userObject.password || faker.internet.password(),
  });
}

async function createSession(userId) {
  return await session.create(userId);
}

async function deleteAllEmails() {
  await fetch(`${urlMailHttp}/messages`, {
    method: "DELETE",
  });
}

async function getLastEmail() {
  const response = await fetch(`${urlMailHttp}/messages`);
  const body = await response.json();
  const lastEmail = body.pop();

  if (!lastEmail) return null;

  const lastMailBodyResponse = await fetch(
    `${urlMailHttp}/messages/${lastEmail.id}.plain`,
  );
  const lastMailBody = await lastMailBodyResponse.text();

  lastEmail.text = lastMailBody;

  return lastEmail;
}

function extractUUID(text) {
  const match = text.match(/[0-9a-fA-F-]{36}/);
  return match ? match[0] : null;
}

const orchestrator = {
  waitForAllServices,
  clearDatabase,
  runPendingMigrations,
  createUser,
  createSession,
  deleteAllEmails,
  getLastEmail,
  extractUUID,
};

export default orchestrator;
