import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

const ALLOWED_METHODS = ["GET", "POST"];
let dbClient;

function getMigrationsOptions(dbClient, liveRun) {
  return {
    dbClient: dbClient,
    dryRun: !liveRun, //Define o modo de execução: TRUE -> modo de teste - FALSE: modo de produção
    dir: join("infra", "migrations"),
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

export default async function migrations(request, response) {
  let status = 200;
  let jsonResult;

  if (!ALLOWED_METHODS.includes(request.method)) {
    return response
      .status(405)
      .json({ error: `Method "${request.method}" not allowed` });
  }

  try {
    const pendingMigrations = await getPendingMigrations(request.method);

    if (request.method === "POST") {
      if (pendingMigrations.length > 0) status = 201;
    }

    jsonResult = pendingMigrations;
  } catch (error) {
    status = 500;
    jsonResult = error;
  } finally {
    if (dbClient !== undefined) await dbClient.end();

    return response.status(status).json(jsonResult);
  }
}
