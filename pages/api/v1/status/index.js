import database from "infra/database.js";

async function status(request, reponse) {
  let notUsedVar;
  const updateAt = new Date().toISOString();

  const dbVersionResult = await database.query("SHOW server_version;");
  const dbVersionValue = dbVersionResult.rows[0].server_version;

  const dbMaxConnectionResult = await database.query("SHOW max_connections;");
  const dbMaxConnectionsValue = dbMaxConnectionResult.rows[0].max_connections;

  const dbOpenedConnectionsResult = await database.query({
    text: "SELECT count(1)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [process.env.POSTGRES_DB],
  });
  const dbOpenedConnectionsValue = dbOpenedConnectionsResult.rows[0].count;

  reponse.status(200).json({
    update_at: updateAt,
    dependencies: {
      database: {
        version: dbVersionValue,
        max_connections: parseInt(dbMaxConnectionsValue),
        opened_connections: dbOpenedConnectionsValue,
      },
    },
  });
}

export default status;
