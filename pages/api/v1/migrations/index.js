import migrationRunner from "node-pg-migrate";
import { join } from "node:path";
import database from "infra/database.js";

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

export default async function migrations(request, response) {
  const allowedMethods = ["GET", "POST"];
  if (!allowedMethods.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed`,
    });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();
    const defaultMigrationsOptions = getMigrationsOptions(
      dbClient,
      request.method === "POST",
    );

    const pendingMigrations = await migrationRunner(defaultMigrationsOptions);
    let status = 200;

    if (request.method === "POST") {
      if (pendingMigrations.length > 0) status = 201;
    }

    return response.status(status).json(pendingMigrations);
  } catch (err) {
    return response.status(500).json({
      error: err,
    });
  } finally {
    if (dbClient !== undefined) await dbClient.end();
  }
}
