import migrationRunner from "node-pg-migrate";
import database from "infra/database.js";
import { resolve } from "node:path";

let dbClient;

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

async function listPendingMigrations() {
  try {
    return await getPendingMigrations("GET");
  } finally {
    await dbClient?.end();
  }
}

async function runPendingMigrations() {
  try {
    return await getPendingMigrations("POST");
  } finally {
    await dbClient?.end();
  }
}

const migrator = {
  listPendingMigrations,
  runPendingMigrations,
};

export default migrator;
