import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";
import controller from "infra/controller.js";

let dbClient;

const router = createRouter();
router.get(getHandler);
router.post(postHandler);

export default router.handler(controller.errorHandlers);

function getMigrationsOptions(dbClient, liveRun) {
  return {
    dbClient: dbClient,
    dryRun: !liveRun, //Define o modo de execução: TRUE -> modo de teste - FALSE: modo de produção
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
}

async function getPendingMigrations(method) {
  dbClient = await database.getNewClient();
  const defaultMigrationsOptions = getMigrationsOptions(
    dbClient,
    method === "POST",
  );

  return await migrationRunner(defaultMigrationsOptions);
}

async function getHandler(request, response) {
  return migrations("GET", response);
}

async function postHandler(request, response) {
  return migrations("POST", response);
}

async function migrations(method, response) {
  let statusCode = 200;

  try {
    const pendingMigrations = await getPendingMigrations(method);

    if (method === "POST") {
      if (pendingMigrations.length > 0) statusCode = 201;
    }

    return response.status(statusCode).json(pendingMigrations);
  } finally {
    if (dbClient !== undefined) await dbClient.end();
  }
}
